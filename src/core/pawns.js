/**
 * The pawn record and the queries over a list of pawns. Issue #28.
 *
 * Pure data handling. No DOM, no state object, no imports outside `core/` (NFR-01).
 *
 * ## What a pawn is
 *
 * ```js
 * { player: 0, pawn: 2, r: 17 }
 * ```
 *
 * - `player` is the seat, 0 to 3.
 * - `pawn` is which of that player's four pawns it is, 0 to 3. It never changes.
 * - `r` is the relative position from `board.js`, 0 to 44.
 *
 * `player` and `pawn` together are the pawn's **identity**, and the pair is what every function here
 * matches on. `r` is the only thing that ever changes, which is why a move can be described as a
 * before and an after without copying anything else.
 *
 * ## Why every function returns a new array
 *
 * Nothing in this file writes to the list it is given. A move produces a new array with one entry
 * replaced. That costs one array copy per move, which for 16 pawns is nothing, and it buys two
 * things: a test can compare the state before and after without having saved a deep copy first, and
 * a bug in `ui/` cannot corrupt the board by holding on to an old reference.
 */

import { MIN_PLAYERS, PAWNS_PER_PLAYER, REGION, START_R, region, seatsFor } from "./board.js";

export { MIN_PLAYERS };

/**
 * All pawns for a fresh match: four pawns per seated player, every one in its start area.
 *
 * **`player` is the seat number, not the position in the turn order.** A two-player match therefore
 * produces pawns for players 0 and **2**, because `seatsFor` seats two players opposite each other.
 * Everything downstream keys on the seat, so entry squares, capture and rendering all agree without
 * a second numbering to translate between.
 *
 * The order is stable, the first seat's four pawns first, so a failing test prints a readable array.
 */
export function createPawns(playerCount) {
  const pawns = [];
  for (const player of seatsFor(playerCount)) {
    for (let pawn = 0; pawn < PAWNS_PER_PLAYER; pawn += 1) {
      pawns.push({ player, pawn, r: START_R });
    }
  }
  return pawns;
}

/** Every pawn belonging to `player`, in pawn order. */
export function pawnsOf(pawns, player) {
  return pawns.filter((entry) => entry.player === player);
}

/**
 * The one pawn matching an identity `{ player, pawn }`.
 *
 * Throws when it is not there. A missing pawn means the caller built an identity out of thin air,
 * and returning `undefined` would push that mistake several steps further before it surfaced.
 */
export function findPawn(pawns, ref) {
  const found = pawns.find((entry) => entry.player === ref.player && entry.pawn === ref.pawn);
  if (found === undefined) {
    throw new Error(`no pawn ${ref.pawn} for player ${ref.player} in this list`);
  }
  return found;
}

/**
 * A new pawn list with the pawn matching `ref` standing at `r`. The input list is untouched.
 */
export function withPawnAt(pawns, ref, r) {
  const index = pawns.findIndex((entry) => entry.player === ref.player && entry.pawn === ref.pawn);
  if (index === -1) {
    throw new Error(`no pawn ${ref.pawn} for player ${ref.player} in this list`);
  }

  const next = pawns.slice();
  next[index] = { ...next[index], r };
  return next;
}

/**
 * The seats that appear in a pawn list, in the order they first appear, which is seat order.
 *
 * This is the answer to "who is playing" that cannot be wrong, because it is read off the board
 * rather than passed in. A two-player match returns `[0, 2]`.
 */
export function seatsIn(pawns) {
  return [...new Set(pawns.map((entry) => entry.player))];
}

/** How many distinct players appear in a pawn list. Used to check a state object against itself. */
export function playerCountOf(pawns) {
  return seatsIn(pawns).length;
}

/**
 * How far one player has got: how many of their four pawns are still in the start area, out on the
 * track, and home. This is FR-36, the HUD's whole content.
 *
 * ```js
 * { start: 2, track: 1, home: 1 }   // always sums to PAWNS_PER_PLAYER
 * ```
 *
 * **The three buckets are the three regions of `board.js` and not a scale invented here**, which is
 * what makes "home" mean exactly what winning means: `hasWon` is all four pawns in the home column, so
 * a player whose HUD row reads `home: 4` has won and the two facts cannot drift apart.
 *
 * It lives in `core/` because it is arithmetic over pawn positions, the same kind of question
 * `seatsIn` answers. The HUD needs one more number that is not on the board, how many skill cards the
 * seat holds, and that is added by `seatProgress` in `state/game-state.js`.
 */
export function pawnProgress(pawns, player) {
  const own = pawnsOf(pawns, player);

  return {
    start: own.filter((entry) => region(entry.r) === REGION.START).length,
    track: own.filter((entry) => region(entry.r) === REGION.TRACK).length,
    home: own.filter((entry) => region(entry.r) === REGION.HOME_COLUMN).length,
  };
}
