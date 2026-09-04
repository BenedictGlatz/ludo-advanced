/**
 * How much danger a pawn is in, and who is standing where. Issue #82, requirement FR-43.
 *
 * Pure `ai/`: geometry over the pawn list, no state transitions, no randomness.
 *
 * ## The term `move-scoring.js` said was missing
 *
 * That file's header names danger as "deliberately missing" and says why: it needs absolute-square
 * arithmetic across seats plus a model of what an opponent could roll, and a wrong model plays worse
 * than no model. Card values need exactly that term. Built Different is worth nothing on a pawn
 * nobody can reach and worth a whole pawn on one with two opponents sitting six squares behind it.
 *
 * So the model is here, it is deliberately crude, and the crudeness is the decision:
 *
 * **A pawn `d` squares behind yours hits you if it rolls exactly `d`, on whichever die its owner
 * happens to pick.** The chance of that is `1/6` for `d` up to 6, `1/12` up to 12 and `1/20` up to 20,
 * which is the odds of naming one face of the smallest die that can reach that far. Beyond 20 the
 * chance is zero, because no card in the pool has more faces.
 *
 * What it ignores, on purpose, is which cards the opponent actually holds (a bot may not look: see
 * `card-choice.js`), that they might prefer a different move, and that the dice pool draws three cards
 * rather than offering all ten. Each of those makes the number more accurate and none of them changes
 * the **ranking** of two of my own pawns, which is the only thing the number is ever used for.
 */

import { TRACK_LENGTH } from "../core/board.js";
import { squareOf } from "../core/displacement.js";
import { SCORE } from "./move-scoring.js";

/** The faces a die can have, smallest first. `1/6` and not `1/2`, because a D2 cannot roll a 4. */
const REACH = Object.freeze([6, 12, 20]);

/** The chance that a pawn `distance` squares behind rolls exactly that number. */
export function oddsOfHit(distance) {
  if (!Number.isInteger(distance) || distance < 1) return 0;

  const faces = REACH.find((max) => distance <= max);

  return faces === undefined ? 0 : 1 / faces;
}

/**
 * What a pawn is worth to its owner, as the loss if it were sent home.
 *
 * `r` steps walked plus `LEAVE_START`, because a captured pawn loses the walk **and** has to be got
 * out of the yard again. Same currency as every other value in `ai/`, which is the point.
 */
export function pawnWorth(pawn) {
  return pawn.r + SCORE.LEAVE_START;
}

/**
 * Every pawn standing on one of the `range` squares behind `square`, nearest first.
 *
 * Each entry is the pawn plus the `distance` it would have to roll. "Behind" needs no per-seat
 * reasoning: `absoluteSquare` grows with `r` for all four seats, so every pawn walks the ring the same
 * way round and behind is simply the lower square number, modulo forty.
 */
export function pawnsBehind(pawns, square, range) {
  const found = [];

  for (let distance = 1; distance <= Math.min(range, TRACK_LENGTH - 1); distance += 1) {
    const at = (square - distance + TRACK_LENGTH) % TRACK_LENGTH;

    for (const pawn of pawns) {
      if (squareOf(pawn) === at) found.push({ ...pawn, distance });
    }
  }

  return found;
}

/** The same list with the pawns of `seat` taken out. What "somebody could hit this" is asked of. */
export function enemiesBehind(pawns, square, range, seat) {
  return pawnsBehind(pawns, square, range).filter((pawn) => pawn.player !== seat);
}

/** The pawns of `seat` among them. What "my own pawns are in the way" is asked of. */
export function friendsBehind(pawns, square, range, seat) {
  return pawnsBehind(pawns, square, range).filter((pawn) => pawn.player === seat);
}

/**
 * The chance that this pawn is captured before its owner moves it again, as a number 0 to 1.
 *
 * The sum of `oddsOfHit` over every opponent pawn within twenty squares behind it. A sum and not a
 * proper "at least one of them" probability, which would be `1 - prod(1 - p)`: with four opponents
 * six squares back the sum reads 0.67 and the true chance is 0.52. It is never compared against
 * anything but another threat, and the sum keeps "twice as many attackers is twice as bad" true, which
 * is the property the card values actually lean on.
 *
 * A pawn in a start area or a home column answers 0, through `squareOf`: neither is a shared square,
 * so nothing can reach it there.
 */
export function threatOn(pawns, pawn) {
  const square = squareOf(pawn);
  if (square === null) return 0;

  return enemiesBehind(pawns, square, TRACK_LENGTH - 1, pawn.player).reduce(
    (total, enemy) => total + oddsOfHit(enemy.distance),
    0
  );
}

/**
 * The absolute square `steps` in front of a pawn, or `null` when it is not on the track.
 *
 * Where the four trap cards are aimed: one square in front of an opponent is the square that opponent
 * is most likely to enter next, and `absoluteSquare` growing with `r` for every seat is again what
 * makes "in front" one line rather than four.
 */
export function squareAhead(pawn, steps) {
  const square = squareOf(pawn);
  if (square === null) return null;

  // A pawn about to turn into its own house will never reach the square ahead of it on the ring.
  if (pawn.r + steps > TRACK_LENGTH) return null;

  return (square + steps) % TRACK_LENGTH;
}

/**
 * Is this pawn out on the shared track, where cards and captures can reach it?
 *
 * The question nine of the pawn-targeting cards ask first, and `squareOf` already answers it: a pawn
 * in a start area or a home column has no shared square at all.
 */
export function onTrack(pawn) {
  return squareOf(pawn) !== null;
}
