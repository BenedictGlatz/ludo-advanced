/**
 * The legal-move set for a roll, and how a chosen move is applied. Issue #28.
 *
 * Requirements FR-09 (leaving the start area), FR-10 (advancing), FR-12 (own pawn blocks),
 * FR-13 (exact count into home) and FR-14 (an empty set passes the turn with a reason).
 * Pure functions, no DOM, no state object (NFR-01).
 *
 * ## What is here and what is in `move-rules.js`
 *
 * This file collects **a player's four pawns** into one answer for the turn, and applies a chosen
 * move. The rules for a **single** pawn moved to [move-rules.js](move-rules.js) when the skill cards
 * landed, because that is where all of them apply. `MOVE_KIND` and `REFUSAL` are re-exported from
 * here, so every caller and test written before the split still imports them from the same place.
 *
 * ## The shape of the answer
 *
 * `evaluateTurn` is the one function that does the work. It looks at all four of a player's pawns and
 * returns three things at once:
 *
 * ```js
 * { moves: [...], refusals: [...], reason: null }
 * ```
 *
 * - `moves` is what the player may do. `ui/` highlights exactly these (FR-32).
 * - `refusals` says, per pawn, why it stayed put. This is what makes NFR-08 achievable: the screen can
 *   explain a refusal because the rules handed it a reason, instead of the view guessing.
 * - `reason` is filled only when `moves` is empty, and is the single reason the turn passes (FR-14).
 *
 * Computing refusals alongside moves rather than on demand is deliberate. A refusal reason worked out
 * later would have to re-derive the rule that produced it, and the second copy is the one that drifts.
 *
 * ## What a move looks like
 *
 * ```js
 * { player: 0, pawn: 2, kind: "advance", from: 17, to: 23, captures: { player: 1, pawn: 0 } }
 * ```
 *
 * `captures` is `null` for most moves. It is computed here rather than at apply time so that the view
 * can warn before the player commits, and so that `applyMove` stays a mechanical write.
 */

import { findPawn, pawnsOf, withPawnAt } from "./pawns.js";
import { resolveCapture } from "./capture.js";
import {
  EMPTY_BOARD,
  MOVE_KIND,
  REFUSAL,
  applyRagebait,
  evaluatePawn,
  turnLevelReason,
} from "./move-rules.js";

export { EMPTY_BOARD, MOVE_KIND, REFUSAL };

/**
 * The input check, loosened by the skill cards.
 *
 * It used to demand `1 <= roll <= dieMax`, which was right when a roll was one call to `rollDie`.
 * A card can now push the roll above the die's maximum (Angel Die) or down to zero (Devil Die), so
 * both of those are legal inputs and the check keeps only what is still a **programming** error: a
 * non-integer, a negative number, or a die with fewer than two faces.
 */
function assertRoll(roll, dieMax) {
  if (!Number.isInteger(dieMax) || dieMax < 2) {
    throw new RangeError(`dieMax must be an integer of at least 2, got ${dieMax}`);
  }
  if (!Number.isInteger(roll) || roll < 0) {
    throw new RangeError(`roll must be an integer of at least 0, got ${roll}`);
  }
}

/**
 * Everything `player` may do with `roll` on a die of `dieMax` faces, and why each pawn that cannot
 * move is stuck.
 *
 * `pawns` is a plain list, not the state object. `core/` is not allowed to know the state object's
 * shape (NFR-01), and taking the list keeps this function callable from a test with four literals.
 *
 * `board` is `{ statuses, traps }` and defaults to an empty one, so a caller that knows nothing about
 * skill cards gets the pre-issue-38 rules exactly.
 */
export function evaluateTurn(pawns, player, roll, dieMax, board = EMPTY_BOARD) {
  assertRoll(roll, dieMax);

  // A roll of zero is not a blocked pawn, it is a turn with no distance in it. Answering per pawn
  // would produce four copies of the same reason and hide the one that is true.
  if (roll === 0) {
    return { moves: [], refusals: [], reason: REFUSAL.NO_STEPS };
  }

  const results = pawnsOf(pawns, player).map((mover) =>
    evaluatePawn(pawns, mover, roll, dieMax, board)
  );

  const moves = applyRagebait(
    results.filter((entry) => entry.move !== null).map((entry) => entry.move),
    board
  );
  const refusals = results
    .filter((entry) => entry.move === null)
    .map((entry) => ({ player, pawn: entry.pawn, reason: entry.reason }));

  return {
    moves,
    refusals,
    reason: moves.length === 0 ? turnLevelReason(refusals) : null,
  };
}

/** Just the moves. The common case, and the one `ui/` highlights (FR-32). */
export function legalMoves(pawns, player, roll, dieMax, board = EMPTY_BOARD) {
  return evaluateTurn(pawns, player, roll, dieMax, board).moves;
}

/**
 * A new pawn list with `move` played: the captured pawn sent home first, then the mover advanced.
 *
 * The order matters. Sending the captured pawn back first frees the square before the mover arrives,
 * so the intermediate list is never in a state where two pawns share it.
 *
 * This does **not** re-check that the move is legal. Validating an intent is the state layer's job, and
 * doing it twice would put the same rule in two places. What it does check is that the pawn is actually
 * standing where the move says it was, because a stale move applied to a moved-on board is the one
 * mistake that would otherwise corrupt the board silently.
 */
export function applyMove(pawns, move) {
  const mover = findPawn(pawns, move);
  if (mover.r !== move.from) {
    throw new Error(
      `stale move: pawn ${move.pawn} of player ${move.player} is at r=${mover.r}, not r=${move.from}`
    );
  }

  const afterCapture = move.captures === null ? pawns : resolveCapture(pawns, move.captures);
  return withPawnAt(afterCapture, move, move.to);
}
