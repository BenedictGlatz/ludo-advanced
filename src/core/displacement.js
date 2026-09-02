/**
 * Moving a pawn without a move. Issue #38, requirements FR-26 and FR-28.
 *
 * Pure `core/`: no DOM, no state object, no randomness.
 *
 * ## Why `applyMove` was not enough
 *
 * Everything a pawn did before issue #38 was a **move**: a legal-move object produced by
 * `evaluateTurn`, checked against every rule, then written by `applyMove`. Eleven of the 29 cards move
 * a pawn in a way that is not a move at all. Yeet pushes an opponent backwards, Big Ah Rock shoves
 * whoever is in the way, Hyperbeam sends a whole run of pawns home, and none of those is something the
 * pawn's owner chose or could refuse.
 *
 * So there is a second, blunter way to change a pawn's position, and it is deliberately blunt: it
 * checks nothing about legality, because the card is the authority. What it does enforce is the two
 * things that are properties of the **board** rather than of any rule:
 *
 * - a pawn never lands outside `0` to `HOME_R`
 * - a pawn pushed backwards stops at `r = 1` and never re-enters its start area
 *
 * ## The backwards floor is a game decision, not arithmetic
 *
 * Three cards push a pawn back. If that could reach `r = 0` they would all be cheap substitutes for a
 * capture, and capture is the mechanic the whole game is built around: a captured pawn loses most of a
 * lap. Stopping at `r = 1` keeps a pushback a setback and leaves capture as the only way to send a pawn
 * home. Recorded as a decision in the project journal.
 *
 * A card that is *meant* to send a pawn home says so and calls `sendHome`, which is a different
 * function for exactly that reason.
 */

import { HOME_R, REGION, START_R, absoluteSquare, region } from "./board.js";
import { withPawnAt } from "./pawns.js";

/** The furthest back a card can push a pawn. Not the start area: see the module note. */
export const PUSHBACK_FLOOR = START_R + 1;

/**
 * A new pawn list with one pawn moved `delta` squares, clamped.
 *
 * Forwards is capped at `HOME_R`, so a card cannot overshoot a pawn out of the board. That is a
 * **cap and not a refusal**, unlike FR-13's exact-count rule for an ordinary move: FR-13 exists so a
 * player cannot walk a pawn home carelessly, and a card that shoves a pawn is not the player walking.
 *
 * Backwards stops at `PUSHBACK_FLOOR`. A pawn still in its start area does not move at all: there is
 * nowhere behind it, and pushing it forwards out of the yard would be a free pass past FR-09.
 */
export function displace(pawns, ref, delta) {
  const pawn = pawns.find((entry) => entry.player === ref.player && entry.pawn === ref.pawn);
  if (pawn === undefined || pawn.r === START_R) return pawns;

  const target = Math.min(HOME_R, Math.max(PUSHBACK_FLOOR, pawn.r + delta));

  return withPawnAt(pawns, ref, target);
}

/** A new pawn list with one pawn back in its start area. What a capture does, and what Hyperbeam does. */
export function sendHome(pawns, ref) {
  return withPawnAt(pawns, ref, START_R);
}

/**
 * Every pawn standing on one absolute track square.
 *
 * A list and not a single pawn, because nothing guarantees there is only one: two pawns of *different*
 * players share a square for exactly as long as it takes a capture to resolve, and a card that sweeps a
 * run of squares has to hit both.
 *
 * Pawns in a start area or a house are never on a shared square, so they are filtered out before
 * `absoluteSquare` is asked about them. That function throws for those regions rather than returning a
 * number, and a caught exception used as a branch hides the day the throw means something else.
 */
export function pawnsOnSquare(pawns, square) {
  return pawns.filter(
    (pawn) => region(pawn.r) === REGION.TRACK && absoluteSquare(pawn.player, pawn.r) === square
  );
}

/** Every pawn standing on any of `squares`, in the order the squares were given. */
export function pawnsOnSquares(pawns, squares) {
  return squares.flatMap((square) => pawnsOnSquare(pawns, square));
}

/**
 * The absolute square a pawn is on, or `null` when it is in a start area or a house.
 *
 * The nullable wrapper around `absoluteSquare`, so a card that needs "where is this pawn on the shared
 * board" gets an answer it can branch on rather than an exception it has to catch.
 */
export function squareOf(pawn) {
  return region(pawn.r) === REGION.TRACK ? absoluteSquare(pawn.player, pawn.r) : null;
}
