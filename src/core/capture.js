/**
 * Capture resolution. Issue #29, requirement FR-11.
 *
 * Pure functions over a pawn list. No DOM, no state object (NFR-01).
 *
 * ## The whole rule, in two sentences
 *
 * Landing exactly on a shared-track square that holds an opponent's pawn sends that pawn back to its
 * owner's start area, and the arriving pawn holds the square. That is section 4.3 of the game design
 * document, and there is nothing else to it in the MVP: there are no safe squares (FR-15 is a
 * `could have` and is not built), so every one of the 40 track squares is capturable.
 *
 * ## Why this file is two pages of comment and twenty lines of code
 *
 * Three cases that usually need their own rule need none here, because `board.js` already made them
 * impossible to express:
 *
 * - **Capture in a house.** A house belongs to one player, so `isSameSquare` can only ever report a
 *   collision there between two pawns of the *same* player. An opponent is not reachable, so there
 *   is no case to write. This covers the deepest house square too, which is where a finished pawn
 *   stands: there is no separate home area that would need a rule of its own.
 * - **Capture in a start area.** It holds four separate slots, so `isSameSquare` reports no
 *   collision at all. A pawn sent back to `r = 0` therefore never captures anything on arrival.
 * - **Two opponents on one square.** It cannot happen, because whoever arrived second would have
 *   captured the first. `captureTarget` checks this rather than assuming it, and throws if the
 *   invariant is ever broken, since a silently ignored second pawn would be a bug that only shows up
 *   several turns later as a pawn that vanished.
 */

import { REGION, START_R, isSameSquare, region } from "./board.js";
import { withPawnAt } from "./pawns.js";

/**
 * The opponent pawn that `player` would capture by landing on relative position `targetR`, or
 * `null` when the move captures nothing.
 *
 * `targetR` is relative to `player`, so this function converts it through `isSameSquare` and never
 * compares raw numbers between two different players.
 */
export function captureTarget(pawns, player, targetR) {
  if (region(targetR) !== REGION.TRACK) {
    return null;
  }

  const arriving = { player, r: targetR };
  const opponents = pawns.filter(
    (entry) => entry.player !== player && isSameSquare(arriving, entry)
  );

  if (opponents.length > 1) {
    throw new Error(
      `two opponents share the square reached by player ${player} at r=${targetR}, which FR-11 makes impossible`
    );
  }

  return opponents[0] ?? null;
}

/**
 * A new pawn list with the captured pawn back in its start area, `r = 0` (FR-11).
 *
 * It must leave again the ordinary way, on the die's maximum under FR-09. That is not enforced here:
 * it follows from `movement.js` reading `r = 0` as "in the start area" and needing no memory of how
 * the pawn got there.
 */
export function resolveCapture(pawns, captured) {
  return withPawnAt(pawns, captured, START_R);
}
