/**
 * What the view does between the player's clicks. Issue #62, extended by issues #33 and #34.
 *
 * This is the only stateful thing in `ui/`: it holds the current state object, hands intents to
 * `state/`, and replaces its own reference with whatever comes back. It never writes into a state
 * object, which `game-state.js` also makes impossible by freezing.
 *
 * ## The four controls, and what still happens by itself
 *
 * **What a click *means* moved out of this file in issue #39.** `turn-controls.js` owns the dice card and
 * the pawn, `card-controls.js` owns the cards and the prompt, and the always-present chrome belongs to
 * `match-flow.js`, which owns the pause screen the button opens. What is left here is the question this
 * file is named for: what the game does when nobody is clicking.
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
 * - **The turn hands over on its own** only when nobody is watching for it. Since issue #39 the pause
 *   after a move ends in the handover overlay rather than in the next turn: `onHandover` is called and a
 *   person presses Ready. The timer is still there and still uses the design's durations, because a move
 *   has to finish animating and a refusal has to be readable **before** anything covers the board. When
 *   no `onHandover` is given the loop passes the turn itself, which is what keeps a match driven straight
 *   out of `createGameLoop` playable and is how `?fast=1` keeps the end-to-end suite short.
 *
 * And one thing happens by itself only when there is nothing to decide: **the action phase is skipped
 * when the active player holds no playable card.** Waiting there would stall the game, which is not a
 * design choice but the difference between a working game and a hung one.
 *
 * ## The pauses and the countdown are the design's numbers, not this file's
 *
 * The pause after a move is read out of `--motion-capture` in `tokens.css`, so the turn changes when the
 * pawn has actually arrived. The pause after a refused turn is D9's four seconds, and since design spec
 * 04 answered D20 that is `--motion-refusal-hold` and is read the same way. The reaction window is the
 * Product Owner's thirty. All three are overridable, which is what lets a Playwright run take seconds
 * instead of minutes; the shape of the turn is identical either way and only the waiting is shorter.
 */

import { MATCH_STATUS, TURN_PHASE } from "../state/game-state.js";
import { INTENT, dispatch } from "../state/intents.js";
import { playableCards } from "../state/intents-cards.js";
import { nextSeat } from "../state/turn-manager.js";
import { motionMs } from "./board-view.js";
import { createCardControls } from "./card-controls.js";
import {
  bindBoardEvents,
  bindDiceHandEvents,
  bindPickEvents,
  bindPromptEvents,
  bindSkillHandEvents,
} from "./events.js";
import { createRenderer } from "./render.js";
import { REFUSAL_MIN_MS, createTimers } from "./timers.js";
import { createTurnControls } from "./turn-controls.js";

/**
 * Drive a match. `deps` is the injected `{ rng, diceSource }` pair (NFR-09).
 *
 * `parts` is every region of the page, and it is passed through to `render.js` whole rather than
 * destructured here. Only four of the seven are named below, and that is the point: the board, the two
 * hands and the prompt are the ones the loop **binds events to**. The HUD, the chrome and the message
 * strip are drawn and never clicked, so this file has no business knowing they exist.
 */
export function createGameLoop({
  initialState,
  deps,
  parts,
  delays = {},
  onHandover = null,
  onMatchOver = null,
}) {
  const { $board, $diceHand, $skillHand, $prompt } = parts;

  let state = initialState;
  let finished = false;
  const timers = createTimers();
  const draw = createRenderer(parts);

  /** Redraw, with the three pieces of presentation state `card-controls.js` owns. */
  function render() {
    draw(state, {
      selectedSlot: cards.selectedSlot(),
      secondsLeft: cards.secondsLeft(),
      pick: cards.pick(),
    });
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

  const board = createTurnControls({
    getState: () => state,
    apply,
    render,
    advance: () => advance(),
    isPicking: () => cards.isPicking(),
  });

  /**
   * How long to leave the finished turn on screen before passing it on.
   *
   * Both durations are read out of `tokens.css` since design spec 04 answered D20 and gave the refusal
   * hold a token of its own. `REFUSAL_MIN_MS` is the fallback for a harness with no stylesheet loaded.
   */
  function pauseAfterTurn() {
    if (state.refusalReason !== null) {
      return delays.afterRefusal ?? motionMs($board, "--motion-refusal-hold", REFUSAL_MIN_MS);
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
   * Hand the turn on and carry straight into the next one.
   *
   * Split out of `advance` because there are now two callers: the timer, when nothing is watching for the
   * handover, and the Ready button on the handover overlay.
   */
  function passTurn() {
    if (!apply({ type: INTENT.END_TURN })) return;
    advance();
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
      cards.stop();

      // Guarded, because `advance()` is re-entered after every accepted intent and the match-over
      // screen must open once rather than on every pass.
      if (!finished) {
        finished = true;
        onMatchOver?.(state);
      }
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
      // The wait comes first either way. A move has to finish animating and a refusal has to be on
      // screen long enough to read (D9) **before** the overlay covers the board, so the handover
      // screen opens on the same timer that used to pass the turn.
      const next = onHandover === null ? passTurn : () => onHandover(nextSeat(state));

      timers.set("handover", next, pauseAfterTurn());
    }

    // `choose`, `action` with a card in hand, and `act` are the phases that wait for a person.
  }

  return {
    /** Put the board on screen and start the first turn. */
    start() {
      bindBoardEvents($board, { onPawnActivated: board.onPawnActivated });
      bindPickEvents($board, cards.handlers);
      bindDiceHandEvents($diceHand, { onDiceCardActivated: board.onDiceCardActivated });
      bindSkillHandEvents($skillHand, cards.handlers);
      bindPromptEvents($prompt, cards.handlers);
      advance();
    },

    /**
     * Redraw without advancing the turn.
     *
     * The flow calls this after a language change. Every view rewrites its own text from `t()` on every
     * update, so a plain redraw is the whole of FR-34's "every visible string changes".
     */
    refresh: render,

    /** Stop every pending timer. Nothing else in here waits. */
    stop() {
      timers.clearAll();
      cards.stop();
    },

    /**
     * Pass the turn on, which is what the handover overlay's Ready button does.
     *
     * Exposed rather than done inside the loop, because who decides that the screen has changed hands is
     * a question about the person in front of it and not about the turn.
     */
    passTurn,

    /**
     * Freeze the match (FR-07). Every pending timer and the reaction clock stop.
     *
     * The state object is untouched, because a pause is not a game event: nothing in the rulebook knows
     * about it, and putting it in the frozen state would make the rules layer hold a fact about a button.
     */
    pause() {
      timers.clearAll();
      cards.stop();
    },

    /**
     * Carry on from where the pause left off.
     *
     * `advance()` re-enters whatever phase the turn was in, which is why pausing needs to save nothing.
     * A reaction window that was open reopens its clock at the full thirty seconds, and that is the
     * intended reading: the players stopped, so the window did too.
     */
    resume() {
      advance();
    },

    /** The current state, for tests and for the browser console. Frozen, so it cannot be written. */
    getState() {
      return state;
    },
  };
}
