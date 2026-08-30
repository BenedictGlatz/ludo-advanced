/**
 * The win condition. Requirement FR-05, section 8 of the game design document.
 *
 * Pure functions over a pawn list, no DOM, no state object (NFR-01).
 *
 * **The rule:** a player whose four pawns fill their four house squares has won, and the match ends
 * immediately. Remaining players are not ranked. There is no second place in the MVP, because
 * ranking needs a rule for what happens after the win and nothing in the sources asks for one.
 *
 * **Why "in the house" and not "at `r = 44`".** The house has exactly as many squares as the player
 * has pawns, and `board.js` makes two pawns of one player collide on a house square, so a full house
 * is the only way four pawns can all be inside it. Testing the region rather than one number means
 * this file states the rule once and does not repeat the arithmetic that produced 44.
 */

import { PAWNS_PER_PLAYER, REGION, region } from "./board.js";
import { pawnsOf } from "./pawns.js";

/**
 * Has `player` got all four pawns into the house?
 *
 * The pawn count is checked as well as the positions. Without it, a player with no pawns in the list
 * at all would win: `[].every(...)` is `true`, which is correct for arrays and wrong for Ludo.
 */
export function hasWon(pawns, player) {
  const own = pawnsOf(pawns, player);
  return (
    own.length === PAWNS_PER_PLAYER && own.every((entry) => region(entry.r) === REGION.HOME_COLUMN)
  );
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
