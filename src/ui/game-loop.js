/**
 * What the view does between the player's clicks. Issue #62.
 *
 * This is the only stateful thing in `ui/`: it holds the current state object, hands intents to
 * `state/`, and replaces its own reference with whatever comes back. It never writes into a state
 * object, which `game-state.js` also makes impossible by freezing.
 *
 * ## Why the turn advances by itself
 *
 * Design handoff 01 covers the board (S3) and the refusal region (S6). It does not cover a dice hand,
 * a turn bar or a win screen, and `CLAUDE.md` forbids Claude Code from inventing what a component
 * looks like. So the slice was built with **the pawn click as its only control**, decided on
 * 2026-08-30, and everything else happens on its own:
 *
 * - **Choosing a die is automatic**, because the stand-in pool holds one card. There is no choice to
 *   hide. Issue #37 brings the real three-card hand and the screen that picks from it, and this is
 *   the line that changes.
 * - **The turn hands over on its own**, after the move has finished animating, or after the refusal
 *   has been on screen long enough to read.
 *
 * ## The two pauses are the design's numbers, not this file's
 *
 * The pause after a move is read back out of `--motion-capture` in `tokens.css`, so the turn changes
 * when the pawn has actually arrived. The pause after a refused turn is D9's four seconds. Both are
 * overridable, which is what lets a Playwright run take seconds instead of minutes; the shape of the
 * turn is identical either way, only the waiting is shorter.
 */

import { MATCH_STATUS, TURN_PHASE } from "../state/game-state.js";
import { INTENT, dispatch } from "../state/intents.js";
import { motionMs, updateBoard } from "./board-view.js";
import { bindBoardEvents } from "./events.js";
import { applyMoveHints, showMessage } from "./move-hints.js";

/**
 * How long a refusal stays on screen before the turn passes.
 *
 * D9 of the design spec: the strip "stays until the player's next action, and at minimum for 4
 * seconds". With the pawn click as the only control there is no next action to wait for, so the
 * minimum is the whole rule. It is a number in a JavaScript file because `tokens.css` has no token
 * for it, which is worth raising in handoff 02: it is a design decision living outside the design.
 */
export const REFUSAL_MIN_MS = 4000;

/**
 * Drive a match.
 *
 * `deps` is the `{ rng, diceSource }` pair, injected here and never constructed, which is NFR-09.
 * `delays` overrides the two pauses, in milliseconds, and is what a test passes.
 */
export function createGameLoop({ initialState, deps, $board, $message, delays = {} }) {
  let state = initialState;
  let timer = null;

  function render() {
    updateBoard($board, state);
    applyMoveHints($board, state);
    showMessage($message, state);
  }

  /**
   * Hand one intent to `state/` and keep the answer.
   *
   * A refused intent leaves `state` exactly as it was, and the caller is told so. Every caller here
   * stops on a refusal rather than trying again, which is what keeps a rejected `choose-die` from
   * turning into a loop that dispatches the same impossible intent forever.
   */
  function apply(intent) {
    const result = dispatch(state, intent, deps);
    if (result.accepted) state = result.state;
    return result.accepted;
  }

  /** How long to leave the finished turn on screen before passing it on. */
  function pauseAfterTurn() {
    if (state.refusalReason !== null) {
      return delays.afterRefusal ?? REFUSAL_MIN_MS;
    }
    return delays.afterMove ?? motionMs($board, "--motion-capture", 320);
  }

  function later(action, ms) {
    window.clearTimeout(timer);
    timer = window.setTimeout(action, ms);
  }

  /**
   * Render, then take whatever step the turn takes without the player.
   *
   * The `choose` branch recurses, and its depth is bounded: choosing a die always lands the turn in
   * `act` or in `turn-end`, neither of which recurses. The `turn-end` branch does come back round to
   * `choose` for the next player, but through a timer, so it is a loop and not a growing stack.
   */
  function advance() {
    render();

    if (state.status !== MATCH_STATUS.RUNNING) return;

    if (state.phase === TURN_PHASE.CHOOSE) {
      if (!apply({ type: INTENT.CHOOSE_DIE, faces: state.hand[0] })) return;
      advance();
      return;
    }

    if (state.phase === TURN_PHASE.TURN_END) {
      later(() => {
        if (!apply({ type: INTENT.END_TURN })) return;
        advance();
      }, pauseAfterTurn());
    }

    // TURN_PHASE.ACT is the one phase that waits for a person.
  }

  /**
   * A click or a keypress on a pawn that can move.
   *
   * **The first activation selects and the second commits.** One click would be fewer clicks, and it
   * would also mean that a misclick captures an opponent with no way back, in a game where a capture
   * costs the other player most of a lap. Selecting first is also what makes FR-32 literal: the
   * target of the move about to be played is lit before it is played, not merely somewhere among the
   * other legal targets.
   */
  function onPawnActivated(pawn) {
    if (state.status !== MATCH_STATUS.RUNNING || state.phase !== TURN_PHASE.ACT) return;

    if (state.selectedPawn !== pawn) {
      if (apply({ type: INTENT.SELECT_PAWN, pawn })) render();
      return;
    }

    if (!apply({ type: INTENT.COMMIT_MOVE, pawn })) return;
    advance();
  }

  return {
    /** Put the board on screen and start the first turn. */
    start() {
      bindBoardEvents($board, { onPawnActivated });
      advance();
    },

    /** Stop the pending handover. Nothing else in here keeps a timer. */
    stop() {
      window.clearTimeout(timer);
      timer = null;
    },

    /** The current state, for tests and for the browser console. Frozen, so it cannot be written. */
    getState() {
      return state;
    },
  };
}
