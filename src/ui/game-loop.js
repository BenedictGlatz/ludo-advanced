/**
 * What the view does between the player's clicks. Issue #62.
 *
 * This is the only stateful thing in `ui/`: it holds the current state object, hands intents to
 * `state/`, and replaces its own reference with whatever comes back. It never writes into a state
 * object, which `game-state.js` also makes impossible by freezing.
 *
 * ## Why the turn advances by itself
 *
 * Design handoff 01 covered the board (S3) and the refusal region (S6) and nothing else, so this loop
 * was built on 2026-08-30 with **the pawn click as its only control** and everything else happening
 * by itself. Design spec 03 has since delivered the dice hand, so there are now **two** controls:
 *
 * - **Choosing a dice card is the player's, as of issue #31.** The loop used to take `state.hand[0]`,
 *   which meant a choice the rulebook gives the player (FR-19) was made for them, and it showed: a
 *   hand whose first card was a D20 needed a twenty to get a pawn out of the yard, so the turn usually
 *   passed. The `choose` phase now waits for a click, exactly the way `act` waits for one.
 * - **The turn hands over on its own**, after the move has finished animating, or after the refusal
 *   has been on screen long enough to read.
 *
 * What is still automatic is the seam issue #38 fills: there is no action phase between choosing a
 * card and rolling it, because no skill card exists to play there yet.
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
import { updateDiceHand } from "./dice-hand-view.js";
import { bindBoardEvents, bindDiceHandEvents } from "./events.js";
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
export function createGameLoop({ initialState, deps, $board, $diceHand, $message, delays = {} }) {
  let state = initialState;
  let timer = null;

  function render() {
    updateBoard($board, state);
    applyMoveHints($board, state);
    updateDiceHand($diceHand, state);
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
   * There is no recursion left in here. Both phases that wait for a person, `choose` and `act`, do
   * exactly that, and `turn-end` comes back round through a timer, so this is a loop and not a
   * growing stack.
   */
  function advance() {
    render();

    if (state.status !== MATCH_STATUS.RUNNING) return;

    if (state.phase === TURN_PHASE.TURN_END) {
      later(() => {
        if (!apply({ type: INTENT.END_TURN })) return;
        advance();
      }, pauseAfterTurn());
    }

    // `choose` and `act` are the two phases that wait for a person.
  }

  /**
   * A click or a keypress on one of the three drawn dice cards (FR-19).
   *
   * One activation, not two. Selecting a pawn first exists because a misclick there costs another
   * player most of a lap; picking a card costs nobody anything and is undone by the next turn, so a
   * confirmation step would be a click charged for no risk.
   *
   * Choosing also rolls, because `intents.js` runs steps 3 to 5 as one intent: the rulebook has no
   * player input between picking a card and rolling it. Issue #38 puts the action phase in that gap.
   */
  function onDiceCardActivated(faces) {
    if (state.status !== MATCH_STATUS.RUNNING || state.phase !== TURN_PHASE.CHOOSE) return;

    if (!apply({ type: INTENT.CHOOSE_DIE, faces })) return;
    advance();
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
      bindDiceHandEvents($diceHand, { onDiceCardActivated });
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
