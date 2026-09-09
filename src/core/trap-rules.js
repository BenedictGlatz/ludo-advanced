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
import { pawnsOnSquare, squareOf } from "./displacement.js";
import { ringDistance } from "./path.js";
import { EXCLUDED_SQUARES } from "./skill-squares.js";
import { TRAP_KIND, trapAt } from "./traps.js";

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

/**
 * How far It's Not That Deep reaches, in track squares, in either direction round the ring.
 *
 * The card's own text: "offensive cards played within 3 squares of it are nullified". Three either way
 * plus the trap's own square is seven squares of protection, which is a sixth of the board, and that is
 * what the card is worth: it went from a D6 pushback to a single square, and this is what it got instead.
 */
export const NULLIFY_RADIUS = 3;

/**
 * The absolute square a card acts on, or `null` when it acts on no square at all.
 *
 * The aura has to be measured against something, and different cards name their target differently. One
 * rule covers all of them: **a card names a square, or it names a pawn and the pawn is standing on a
 * square.** So Janky RPG measures the square it aimed at, Yeet measures where its victim is standing,
 * and Hyperbeam measures where the shooter is.
 *
 * `null` is a real answer and not a failure. 67 is an offensive card that names nothing on the board at
 * all: it is a gamble on your own roll. It can therefore never be nullified, which is right, because
 * there is no "where" for the aura to compare itself to.
 *
 * A pawn in a start area or a house also answers `null`, through `squareOf`. Neither is a shared square,
 * so no trap can be near it.
 */
export function squareActedOn(pawns, target) {
  if (Number.isInteger(target.square)) return target.square;
  if (target.pawn === undefined || target.pawn === null) return null;

  const pawn = pawns.find(
    (entry) => entry.player === target.pawn.player && entry.pawn === target.pawn.pawn
  );

  return pawn === undefined ? null : squareOf(pawn);
}

/**
 * The It's Not That Deep whose aura covers `square`, or `null`.
 *
 * Three things about it, and each is a decision rather than an implementation detail:
 *
 * - **Only this one trap kind projects an aura.** A Banana Peel does nothing until stepped on. The kind
 *   is checked here rather than kept as a separate list, because one entry is not a list.
 * - **The distance is measured round the ring**, so square 39 and square 2 are three apart. See
 *   `ringDistance`.
 * - **A trap never nullifies its own owner's cards.** This mirrors `firstTrapOnPath`'s existing
 *   exemption, whose comment already carries the reason: a card that punishes the player who played it
 *   is a card nobody plays. Without it, laying an It's Not That Deep would make three of your own cards
 *   unusable in the region you had just claimed.
 *
 * **The trap is not consumed by nullifying.** It stays until a pawn steps on it, which is the Product
 * Owner's decision and is what makes the card area denial rather than a one-shot shield.
 */
export function nullifyingTrap(traps, square, actor) {
  return (
    traps.find(
      (entry) =>
        entry.kind === TRAP_KIND.NOT_THAT_DEEP &&
        entry.owner !== actor &&
        ringDistance(entry.square, square) <= NULLIFY_RADIUS
    ) ?? null
  );
}
