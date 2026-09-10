/**
 * Which legal move a square on the board stands for. Issue #91.
 *
 * `ui/` only, and jQuery-free on purpose, like `player-labels.js` and `status-labels.js`: it reads the
 * state and a DOM element's `dataset`, decides no rule, and is unit tested without a browser.
 *
 * ## Why a square needs translating at all
 *
 * A move in `state.legalMoves` is `{ player, pawn, to }` with `to` relative to the player. A square on
 * the board is either a shared track field with an absolute `data-square`, or a house field with
 * `data-player` and `data-home-step`. `move-hints.js` already does this translation in one direction to
 * light the targets; this does it in the other, from the square the player clicked or dropped on back to
 * the move it was lit for. The two use the same three `core/board.js` functions, so they cannot disagree.
 */

import { REGION, absoluteSquare, homeColumnStep, region } from "../core/board.js";

/**
 * A target description read off a square element: `{ square }` for a track field, `{ player, homeStep }`
 * for a house field. Takes anything with a `dataset`, which is what lets a test hand in a plain object.
 */
export function targetOfElement(element) {
  const { square, player, homeStep } = element.dataset;

  if (square !== undefined) return { square: Number(square) };

  return { player: Number(player), homeStep: Number(homeStep) };
}

/** Does this legal move end on the described target? */
function reaches(move, target) {
  if (region(move.to) === REGION.TRACK) {
    return target.square !== undefined && absoluteSquare(move.player, move.to) === target.square;
  }

  return (
    target.square === undefined &&
    move.player === target.player &&
    homeColumnStep(move.to) === target.homeStep
  );
}

/**
 * The first legal move that ends on `target`, or `null`.
 *
 * **First, not only.** Four pawns leaving the yard all reach the same entry square, and the rules do
 * not care which one goes; the lowest-numbered one is what `firstMovablePawn` in the end-to-end helpers
 * picks too, so a click on the entry square and a click on the first pawn agree.
 */
export function moveReaching(state, target) {
  return state.legalMoves.find((move) => reaches(move, target)) ?? null;
}

/**
 * The legal move of *this* pawn that ends on `target`, or `null`. Issue #77 follow-up.
 *
 * `moveReaching` answers "which pawn goes there" and is the right question for a click on a square.
 * A drag already knows the pawn, and asking `moveReaching` instead made only the first yard pawn
 * draggable: all four share the entry square, so the answer was pawn 0 whichever pawn was carried,
 * and the drop was refused for the other three. This asks the question the drop actually has: "does
 * the pawn in hand reach this square".
 */
export function moveOfPawnReaching(state, pawn, target) {
  return state.legalMoves.find((move) => move.pawn === pawn && reaches(move, target)) ?? null;
}
