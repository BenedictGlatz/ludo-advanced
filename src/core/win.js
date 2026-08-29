/**
 * The win condition. Requirement FR-05, section 8 of the game design document.
 *
 * Pure functions over a pawn list, no DOM, no state object (NFR-01).
 *
 * **The rule:** a player with all four pawns at `r = 58` has won, and the match ends immediately.
 * Remaining players are not ranked. There is no second place in the MVP, because ranking needs a
 * rule for what happens after the win and nothing in the sources asks for one.
 */

import { HOME_R, PAWNS_PER_PLAYER } from "./board.js";
import { pawnsOf } from "./pawns.js";

/**
 * Has `player` got all four pawns home?
 *
 * The pawn count is checked as well as the positions. Without it, a player with no pawns in the list
 * at all would win: `[].every(...)` is `true`, which is correct for arrays and wrong for Ludo.
 */
export function hasWon(pawns, player) {
  const own = pawnsOf(pawns, player);
  return own.length === PAWNS_PER_PLAYER && own.every((entry) => entry.r === HOME_R);
}

/**
 * The winning player, or `null` while the match is still running.
 *
 * Only one player can ever satisfy this at a time, because the match ends the moment the condition
 * is met and no further move is applied. The loop therefore returns the first hit rather than
 * collecting a set.
 */
export function findWinner(pawns, playerCount) {
  for (let player = 0; player < playerCount; player += 1) {
    if (hasWon(pawns, player)) {
      return player;
    }
  }
  return null;
}
