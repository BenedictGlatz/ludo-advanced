/**
 * What the view does between the player's clicks. Issue #62, extended by issues #33 and #34.
 *
 * This is the only stateful thing in `ui/`: it holds the current state object, hands intents to
 * `state/`, and replaces its own reference with whatever comes back. It never writes into a state
 * object, which `game-state.js` also makes impossible by freezing.
 *
 * ## The four controls, and what still happens by itself
 *
 * The loop was built on 2026-08-30 with **the pawn click as its only control**. It now has four:
 *
 * | Control | Phase it answers | Landed in |
 * | --- | --- | --- |
 * | Pick one of three dice cards | `choose` | Issue #31 |
 * | Play a skill card, or carry on | `action` | Issue #34 |
 * | Pick a pawn, then commit it | `act` | Issue #62 |
 * | Play a Reaction, or decline | any, while a window is open | Issue #33 |
 *
 * Two things still happen without the player, and both for a stated reason:
 *
 * - **`roll` rolls itself.** There is nothing to decide there. The phase exists so that the on-roll
 *   reaction window has a moment to open in, and so a roll animation has something to hang off.
 * - **The turn hands over on its own**, after the move has finished animating or the refusal has been on
 *   screen long enough to read.
 *
 * And one thing happens by itself only when there is nothing to decide: **the action phase is skipped
 * when the active player holds no playable card.** Waiting there would stall the game, which is not a
 * design choice but the difference between a working game and a hung one.
 *
 * ## The pauses and the countdown are the design's numbers, not this file's
 *
 * The pause after a move is read out of `--motion-capture` in `tokens.css`, so the turn changes when the
 * pawn has actually arrived. The pause after a refused turn is D9's four seconds. The reaction window is
 * the Product Owner's thirty. All three are overridable, which is what lets a Playwright run take seconds
 * instead of minutes; the shape of the turn is identical either way and only the waiting is shorter.
 */

import { MATCH_STATUS, TURN_PHASE } from "../state/game-state.js";
import { INTENT, dispatch } from "../state/intents.js";
import { playableCards } from "../state/intents-cards.js";
import { changeLanguage, currentLanguage } from "../i18n/index.js";
import { motionMs, updateBoard } from "./board-view.js";
import { createCardControls } from "./card-controls.js";
import { CHROME_ACTION, updateChrome } from "./chrome-view.js";
import { updateDiceHand } from "./dice-hand-view.js";
import {
  bindBoardEvents,
  bindChromeEvents,
  bindDiceHandEvents,
  bindPickEvents,
  bindPromptEvents,
  bindSkillHandEvents,
} from "./events.js";
import { turnLine, updateHud } from "./hud-view.js";
import { applyMoveHints, showMessage } from "./move-hints.js";
import { updatePrompt } from "./prompt-view.js";
import { updateSkillHand } from "./skill-hand-view.js";
import { createTimers } from "./timers.js";

/**
 * How long a refusal stays on screen before the turn passes.
 *
 * D9 of the design spec: the strip "stays until the player's next action, and at minimum for 4 seconds".
 * With the pawn click as the only control there was no next action to wait for, so the minimum was the
 * whole rule. It is a number in a JavaScript file because `tokens.css` has no token for it, which is
 * worth raising in the next handoff: it is a design decision living outside the design.
 */
export const REFUSAL_MIN_MS = 4000;

/** Drive a match. `deps` is the injected `{ rng, diceSource }` pair (NFR-09). */
export function createGameLoop({
  initialState,
  deps,
  $board,
  $hud,
  $chrome,
  $diceHand,
  $skillHand,
  $prompt,
  $message,
  delays = {},
}) {
  let state = initialState;
  const timers = createTimers();

  function render() {
    updateBoard($board, state);
    applyMoveHints($board, state);
    updateHud($hud, state);
    updateChrome($chrome, { turn: turnLine(state) });
    updateDiceHand($diceHand, state);
    updateSkillHand($skillHand, state, cards.selectedSlot());
    updatePrompt($prompt, state, { secondsLeft: cards.secondsLeft(), pick: cards.pick() });
    showMessage($message, state);
  }

  /**
   * Hand one intent to `state/` and keep the answer.
   *
   * A refused intent leaves `state` exactly as it was, and the caller is told so. Every caller here stops
   * on a refusal rather than trying again, which is what keeps a rejected intent from turning into a loop
   * that dispatches the same impossible thing forever.
   */
  function apply(intent) {
    const result = dispatch(state, intent, deps);
    if (result.accepted) state = result.state;

    return result.accepted;
  }

  const cards = createCardControls({
    $board,
    timers,
    delays,
    getState: () => state,
    apply,
    refresh: render,
    resume: () => advance(),
  });

  /** How long to leave the finished turn on screen before passing it on. */
  function pauseAfterTurn() {
    if (state.refusalReason !== null) {
      return delays.afterRefusal ?? REFUSAL_MIN_MS;
    }

    return delays.afterMove ?? motionMs($board, "--motion-capture", 320);
  }

  /**
   * A reaction window, handled before the phase, because one can be open in three different phases and
   * the phase does not change while it is.
   *
   * Two ways out, and the loop only takes the first: **`eligible` is empty**, so there is nobody left to
   * wait for and the window shuts at once (FR-25). The other way is the clock, and `card-controls.js`
   * owns it. Returning `true` here means "stop, a person is being asked something".
   */
  function handleWindow() {
    if (state.reactionWindow.eligible.length > 0) {
      cards.syncClock();
      render();
      return true;
    }

    if (!apply({ type: INTENT.CLOSE_WINDOW })) return true;
    cards.syncClock();

    return false;
  }

  /**
   * Render, then take whatever step the turn takes without the player.
   *
   * The recursion is bounded rather than a growing stack: every branch either advances the phase or
   * returns, and the handover comes back round through a timer.
   */
  function advance() {
    render();

    if (state.status !== MATCH_STATUS.RUNNING) {
      timers.clearAll();
      return;
    }

    if (state.reactionWindow !== null) {
      if (handleWindow()) return;
      advance();
      return;
    }

    // Nobody can play anything, so there is nothing to wait for. A game that waited here would hang.
    if (
      state.phase === TURN_PHASE.ACTION &&
      playableCards(state, state.activePlayer).length === 0
    ) {
      if (!apply({ type: INTENT.SKIP_ACTION })) return;
      advance();
      return;
    }

    if (state.phase === TURN_PHASE.ROLL) {
      if (!apply({ type: INTENT.ROLL_DIE })) return;
      advance();
      return;
    }

    if (state.phase === TURN_PHASE.REACTION) {
      if (!apply({ type: INTENT.CLOSE_WINDOW })) return;
      advance();
      return;
    }

    if (state.phase === TURN_PHASE.TURN_END) {
      timers.set(
        "handover",
        () => {
          if (!apply({ type: INTENT.END_TURN })) return;
          advance();
        },
        pauseAfterTurn()
      );
    }

    // `choose`, `action` with a card in hand, and `act` are the phases that wait for a person.
  }

  /**
   * A click or a keypress on one of the three drawn dice cards (FR-19).
   *
   * One activation, not two. Selecting a pawn first exists because a misclick there costs another player
   * most of a lap; picking a card costs nobody anything and is undone by the next turn, so a confirmation
   * step would be a click charged for no risk.
   */
  function onDiceCardActivated(faces) {
    if (state.status !== MATCH_STATUS.RUNNING || state.phase !== TURN_PHASE.CHOOSE) return;

    if (!apply({ type: INTENT.CHOOSE_DIE, faces })) return;
    advance();
  }

  /**
   * A click or a keypress on a pawn that can move.
   *
   * **The first activation selects and the second commits.** One click would be fewer clicks, and it would
   * also mean that a misclick captures an opponent with no way back, in a game where a capture costs the
   * other player most of a lap. Selecting first is also what makes FR-32 literal: the target of the move
   * about to be played is lit before it is played.
   *
   * **A pawn click means something else entirely while a card is being aimed**, and that case is caught
   * here rather than by the two handlers racing: `bindPickEvents` filters on `[data-pickable]` and this one
   * on `[data-movable]`, and a pawn can carry both.
   */
  function onPawnActivated(pawn) {
    if (state.status !== MATCH_STATUS.RUNNING || state.phase !== TURN_PHASE.ACT) return;
    if (cards.isPicking()) return;

    if (state.selectedPawn !== pawn) {
      if (apply({ type: INTENT.SELECT_PAWN, pawn })) render();
      return;
    }

    if (!apply({ type: INTENT.COMMIT_MOVE, pawn })) return;
    advance();
  }

  /**
   * The other language, of the two the game ships (FR-34).
   *
   * A toggle rather than a list, because there are exactly two locales and `supportedLngs` in
   * `i18n/index.js` is the one place that would have to grow first if a third arrived.
   */
  function otherLanguage() {
    return currentLanguage() === "de" ? "en" : "de";
  }

  /**
   * A click on one of the always-present controls.
   *
   * Switching language needs nothing but a re-render, because no view caches a translated string: every
   * one of them rewrites its own text from `t()` on every update. That is what makes FR-34's acceptance
   * criterion, "no string remains in the previous language", true by construction rather than by a list
   * of things to remember to refresh.
   */
  function onChromeAction(action) {
    if (action === CHROME_ACTION.LANGUAGE) {
      changeLanguage(otherLanguage()).then(render);
    }
  }

  return {
    /** Put the board on screen and start the first turn. */
    start() {
      bindBoardEvents($board, { onPawnActivated });
      bindPickEvents($board, cards.handlers);
      bindChromeEvents($chrome, { onChromeAction });
      bindDiceHandEvents($diceHand, { onDiceCardActivated });
      bindSkillHandEvents($skillHand, cards.handlers);
      bindPromptEvents($prompt, cards.handlers);
      advance();
    },

    /** Stop every pending timer. Nothing else in here waits. */
    stop() {
      timers.clearAll();
      cards.stop();
    },

    /** The current state, for tests and for the browser console. Frozen, so it cannot be written. */
    getState() {
      return state;
    },
  };
}
