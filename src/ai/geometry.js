/**
 * Who is standing where, relative to whom. Issue #82, split out of `threat.js` by the bot tactics plan.
 *
 * Pure `ai/`: arithmetic over the pawn list, no probabilities, no card knowledge, no state
 * transitions. `threat.js` answers "how dangerous is this square"; this file answers the questions
 * that come **before** that one, and the two were one file until the danger model grew.
 *
 * ## Behind is one subtraction for all four seats
 *
 * `absoluteSquare` grows with `r` for every seat, so every pawn walks the ring the same way round.
 * "Behind me" is therefore simply the lower square number, modulo forty, and that one fact is what
 * keeps every function here to a few lines instead of four cases each.
 */

import { TRACK_LENGTH } from "../core/board.js";
import { squareOf } from "../core/displacement.js";

/**
 * Every pawn standing on one of the `range` squares behind `square`, nearest first.
 *
 * Each entry is the pawn plus the `distance` it would have to roll to land on `square`.
 *
 * **One pass over the pawns and not one pass per distance.** The obvious version loops the forty
 * distances and asks who is on each, which is forty times the work and was fine while only the card
 * values asked. The move scorer asks twice per candidate move and the move scorer runs inside
 * `expectedMoveScore`, which runs inside every card value, so the same answer had to get cheaper.
 * Equal distances keep pawn-list order, because `Array.sort` is stable and repeatability is a contract
 * here: see `bestMove`.
 */
export function pawnsBehind(pawns, square, range) {
  const reach = Math.min(range, TRACK_LENGTH - 1);
  const found = [];

  for (const pawn of pawns) {
    const at = squareOf(pawn);
    if (at === null) continue;

    const distance = (square - at + TRACK_LENGTH) % TRACK_LENGTH;
    if (distance >= 1 && distance <= reach) found.push({ ...pawn, distance });
  }

  return found.sort((a, b) => a.distance - b.distance);
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
 * Every pawn standing on one of the `range` squares in **front** of `square`, nearest first.
 *
 * The mirror of `pawnsBehind` and the term the move scorer's opportunity bonus is made of: a pawn
 * four squares in front of where I am about to land is a pawn I capture next turn if I roll a four.
 */
export function pawnsAhead(pawns, square, range) {
  const reach = Math.min(range, TRACK_LENGTH - 1);
  const found = [];

  for (const pawn of pawns) {
    const at = squareOf(pawn);
    if (at === null) continue;

    const distance = (at - square + TRACK_LENGTH) % TRACK_LENGTH;
    if (distance >= 1 && distance <= reach) found.push({ ...pawn, distance });
  }

  return found.sort((a, b) => a.distance - b.distance);
}

/**
 * The absolute square `steps` in front of a pawn, or `null` when it is not on the track.
 *
 * Where the three trap cards are aimed, and `absoluteSquare` growing with `r` for every seat is again
 * what makes "in front" one line rather than four.
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
