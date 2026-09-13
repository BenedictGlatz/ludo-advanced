/**
 * The squares a move actually steps on. Issue #38.
 *
 * Pure `core/`: no DOM, no state object, no randomness.
 *
 * ## Why this did not exist before
 *
 * `movement.js` deliberately looks at the target square and nothing else, and its comment says so:
 * "pawns pass over occupied squares freely, so only the target is checked". That is classic Ludo and
 * it is still true for an ordinary move.
 *
 * Three of the skill cards break it. A Rock stops a pawn **passing through** a square, a Banana Peel
 * triggers when a pawn **crosses** it, and Hyperbeam sweeps a run of squares that are nobody's target.
 * All three need the list of squares between where a pawn was and where it is going, which nothing in
 * the project could produce.
 *
 * **Ordinary moves still do not consult it.** Only blockers and traps do. That is not an optimisation,
 * it is the rule: a pawn jumping over three opponents is Ludo working correctly.
 *
 * ## Relative in, absolute out
 *
 * A pawn's own position is relative (`r`, 0 for the start area, 1 to 40 the track, 41 to 44 the
 * house). A blocker or a trap sits on a **shared** square, so it is absolute, 0 to 39. This module is
 * the seam: it takes an `r` range and hands back absolute square numbers.
 *
 * House squares drop out entirely. They are private to one player, so no shared object can sit on one,
 * and `absoluteSquare` throws rather than returning a number for them. Filtering them here means no
 * caller has to remember that.
 */

import { REGION, TRACK_LENGTH, absoluteSquare, region } from "./board.js";

/**
 * Every shared square a move steps on, in order, **excluding** the one it started from.
 *
 * The destination is included, because a blocker stops a pawn arriving as well as passing, and a trap
 * on the square you land on is the ordinary case.
 *
 * ```js
 * squaresCrossed(0, 38, 42)  // player 0 walks off the track into its house
 * // [38, 39, 0]  -- r 39 and 40 are absolute 38 and 39, r 41 and 42 are house squares and drop out
 * ```
 *
 * Backwards moves work too, and this is where they are handled once rather than in three cards: when
 * `toR` is below `fromR` the range simply counts down. Leaving the start area is a forward move from
 * `r = 0`, and since `r = 0` is excluded, the answer is just the entry square.
 */
export function squaresCrossed(player, fromR, toR) {
  const step = toR >= fromR ? 1 : -1;
  const squares = [];

  for (let r = fromR + step; r !== toR + step; r += step) {
    if (region(r) === REGION.TRACK) {
      squares.push(absoluteSquare(player, r));
    }
  }

  return squares;
}

/**
 * The two squares either side of an absolute track square, wrapping round the ring.
 *
 * Janky RPG's "both neighbours" is unambiguous on a ring of forty and meaningless in a house column,
 * which is why that card is playable on a track square only. The wrap is the whole content of this
 * function: square 0's neighbours are 39 and 1, not -1 and 1.
 */
export function neighbourSquares(square) {
  return [(square + TRACK_LENGTH - 1) % TRACK_LENGTH, (square + 1) % TRACK_LENGTH];
}

/**
 * A run of `count` absolute squares starting one step from `square`, in one direction.
 *
 * Hyperbeam's sweep. `direction` is `1` forwards or `-1` backwards, and the run never includes the
 * square it was fired from: a card that hits its own origin as well as everything in front of it would
 * make "friendly fire" mean something different from what the artwork says.
 */
export function squareRun(square, direction, count) {
  return Array.from(
    { length: Math.max(0, count) },
    (_, index) => (square + direction * (index + 1) + TRACK_LENGTH * (count + 1)) % TRACK_LENGTH
  );
}

/**
 * The shortest way round the ring between two absolute squares, 0 to 20.
 *
 * It's Not That Deep nullifies offensive cards aimed "within 3 squares of it", and on a ring that has to
 * mean the shorter of the two ways round: square 39 and square 2 are three apart, not thirty-seven.
 * Subtracting the numbers would make the aura the wrong shape at exactly one place on the board, which
 * is the sort of bug that shows up once in fifty matches and is never reproduced.
 *
 * The maximum is 20, half the ring, because past that the other way round is shorter.
 */
export function ringDistance(a, b) {
  const gap = Math.abs(a - b) % TRACK_LENGTH;

  return Math.min(gap, TRACK_LENGTH - gap);
}
