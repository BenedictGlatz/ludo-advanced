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

import { MAX_PLAYERS, PAWNS_PER_PLAYER, START_R } from "./board.js";

/** Fewest players a match can have (FR-01). */
export const MIN_PLAYERS = 2;

/**
 * All pawns for a fresh match: `playerCount` players, four pawns each, every one in its start area.
 * The order is stable, player 0's four pawns first, so a failing test prints a readable array.
 */
export function createPawns(playerCount) {
  if (!Number.isInteger(playerCount) || playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) {
    throw new RangeError(
      `playerCount must be an integer ${MIN_PLAYERS}..${MAX_PLAYERS}, got ${playerCount}`
    );
  }

  const pawns = [];
  for (let player = 0; player < playerCount; player += 1) {
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

/** How many distinct players appear in a pawn list. Used to check a state object against itself. */
export function playerCountOf(pawns) {
  return new Set(pawns.map((entry) => entry.player)).size;
}
