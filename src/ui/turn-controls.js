/**
 * What a click on a dice card or on a pawn means. Issues #31 and #62, moved here by #39.
 *
 * `ui/` only: it turns an activation into an intent and holds no rule. `events.js` still owns the jQuery
 * binding; this owns the decision about what the activation means.
 *
 * ## Why this is its own file
 *
 * `game-loop.js` passed the 300-line limit (NFR-02) when the handover gate and the pause landed, and this
 * is the seam that was already half cut: **`card-controls.js` has done exactly this job for card clicks
 * since issue #34.** Splitting the other two out makes the pair symmetric, and it separates two questions
 * that had been sharing a file: what a click means, and what the game does when nobody is clicking.
 *
 * The dependencies are injected the same way `card-controls.js` injects them, so this file never holds
 * the state object and cannot get out of step with the loop's copy of it.
 */

import { MATCH_STATUS, TURN_PHASE } from "../state/game-state.js";
import { INTENT } from "../state/intents.js";

/**
 * The two direct board controls.
 *
 * - `getState()` hands back the loop's current state.
 * - `apply(intent)` dispatches and returns whether it was accepted.
 * - `render()` redraws without advancing the turn.
 * - `advance()` lets the loop take whatever automatic steps follow.
 * - `isPicking()` is `card-controls.js` saying a card is mid-aim.
 */
export function createTurnControls({ getState, apply, render, advance, isPicking }) {
  /**
   * A click or a keypress on one of the three drawn dice cards (FR-19).
   *
   * One activation, not two. Selecting a pawn first exists because a misclick there costs another player
   * most of a lap; picking a card costs nobody anything and is undone by the next turn, so a confirmation
   * step would be a click charged for no risk.
   */
  function onDiceCardActivated(faces) {
    const state = getState();
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
    const state = getState();
    if (state.status !== MATCH_STATUS.RUNNING || state.phase !== TURN_PHASE.ACT) return;
    if (isPicking()) return;

    if (state.selectedPawn !== pawn) {
      if (apply({ type: INTENT.SELECT_PAWN, pawn })) render();
      return;
    }

    if (!apply({ type: INTENT.COMMIT_MOVE, pawn })) return;
    advance();
  }

  return { onDiceCardActivated, onPawnActivated };
}
