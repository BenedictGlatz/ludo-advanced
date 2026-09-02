/**
 * Where an object may be put down. Issue #45, requirement FR-30.
 *
 * Pure `core/`: no DOM, no state object, no randomness.
 *
 * ## Why this is not in `traps.js`
 *
 * That module owns the **list**: what is on which square, which entries block, which one a walk hits
 * first. Every function in it takes the list and nothing else, which is what keeps it small and what
 * makes "what is on square 17" have exactly one answer.
 *
 * The question here is different in shape: it needs the **pawns** as well as the list, and it needs to
 * know about the entry squares, which are a fact about the board's topology. Answering it in `traps.js`
 * would mean that module reading three other modules to answer one question, and the one question is
 * not about the list at all. It is about the board.
 *
 * ## `placeTrap` used to claim this existed
 *
 * Its comment said, in so many words, that it replaces rather than refuses "because the refusal belongs
 * one layer up: `state/` will not let a player target a square that is already taken". **`state/` did
 * no such thing.** `checkTarget`'s whole test for a track square was that the number was between 0 and
 * 39, so a player could lay a trap on top of an existing one and it would be silently overwritten.
 *
 * That is worth naming as a class of bug rather than a slip: a comment that describes a guarantee
 * another layer is supposed to provide is a comment nothing checks. The guarantee now exists, and the
 * comment names the module that provides it.
 */

import { TRACK_LENGTH } from "./board.js";
import { pawnsOnSquare } from "./displacement.js";
import { EXCLUDED_SQUARES } from "./skill-squares.js";
import { trapAt } from "./traps.js";

/**
 * Why a square cannot take an object, as i18next keys.
 *
 * Keys and not sentences, like `REFUSAL`: NFR-03 forbids a user-facing string anywhere in `src/`
 * outside the locale files, and `core/` is the layer that must not know a language at all.
 *
 * Three reasons and not one, even though `state/` currently collapses them into a single rejection.
 * The player's next action is the same in all three cases, pick a different square, which is why the
 * rejection is shared; the reasons are still separate here because the **view** wants them: a square
 * that is greyed out for a different cause may one day want to look different, and reconstructing which
 * of three it was is work.
 */
export const PLACEMENT = Object.freeze({
  /** A trap or a blocker is already standing there. One object per square, never two. */
  OCCUPIED: "trap.placement.occupied",
  /** A pawn is standing there. */
  PAWN: "trap.placement.pawn",
  /** One of the four squares where a seat enters the ring. */
  ENTRY: "trap.placement.entry",
});

/**
 * Why `square` cannot take an object, or `null` when it can.
 *
 * The three rules, and the reason each one is a rule:
 *
 * - **Not on an occupied square.** A square holds one object or none, which is what makes "what is on
 *   square 17" answerable. `placeTrap` enforces it by replacing; refusing here is what stops a player
 *   spending a card to delete an opponent's trap, which no card in the set is supposed to be able to do.
 * - **Not under a pawn.** A trap only fires when something *enters* its square, so one laid under a pawn
 *   that is already standing there does nothing until that pawn leaves and comes back round the whole
 *   ring. It looks like a play and is almost always a wasted card.
 * - **Not on an entry square.** `EXCLUDED_SQUARES`, reused from the skill squares, and its comment
 *   already carries the reason: the entry square is the busiest square a player has, because every pawn
 *   of theirs passes over it and starts on it. A trap there would fire far more often than one anywhere
 *   else and would punish one quarter of the board for existing.
 */
export function trapPlacementRefusal(pawns, traps, square) {
  if (trapAt(traps, square) !== null) return PLACEMENT.OCCUPIED;
  if (pawnsOnSquare(pawns, square).length > 0) return PLACEMENT.PAWN;
  if (EXCLUDED_SQUARES.includes(square)) return PLACEMENT.ENTRY;

  return null;
}

/**
 * Every absolute square an object may be placed on right now.
 *
 * The same three rules as a list rather than as a verdict, because the view needs a list: the target
 * picker marks what can be clicked and must not offer a square the rules would then refuse. Derived
 * from the same function so the two cannot disagree, which is the whole reason it is not a second
 * implementation of the rules with `ui/` conveniences in it.
 */
export function placeableSquares(pawns, traps) {
  return Array.from({ length: TRACK_LENGTH }, (_, square) => square).filter(
    (square) => trapPlacementRefusal(pawns, traps, square) === null
  );
}
