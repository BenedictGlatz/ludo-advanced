/**
 * Starting, restarting and abandoning a match. Issue #27, requirements FR-01, FR-06 and FR-07.
 *
 * Imports `core/` and `state/`, never `ui/` (NFR-01).
 *
 * ## What belongs here and what does not
 *
 * This module owns the **life cycle** of a match: it exists, it is replaced by a fresh one, it is
 * given up. The screens that trigger those things (the main menu, the pause dialogue, the win
 * screen) are issue #41 and are not in this branch. Writing the transitions now costs four small
 * functions and means the menus have something to call instead of reaching into the state object.
 */

import { createDicePool } from "../core/dice-pool.js";
import { MATCH_STATUS, TURN_PHASE, createGameState, nextState } from "./game-state.js";
import { seedSkillCards } from "./skill-turn.js";
import { drawHand } from "./turn-manager.js";

/**
 * Check that a dice source implements the interface the turn manager uses, before a match starts
 * rather than three phases into the first turn.
 */
function assertDeps(deps) {
  if (typeof deps?.rng !== "function") {
    throw new TypeError("deps.rng must be a function returning a float in [0, 1)");
  }
  if (typeof deps?.diceSource?.draw !== "function") {
    throw new TypeError("deps.diceSource must have a draw(rng) method");
  }
  if (typeof deps.diceSource.returnHand !== "function") {
    throw new TypeError("deps.diceSource must have a returnHand(hand) method");
  }
}

/**
 * A new match for 2 to 4 players, with the first hand already drawn (FR-01).
 *
 * The hand is drawn here rather than left to the first intent so that the state handed to `ui/` is
 * always one a player can act on. There is no moment where the board is on screen and the only
 * legal thing to do is a step the player cannot see.
 *
 * `skillSquares` is forwarded to `createGameState`, which carries the reason it exists. No production
 * caller passes it.
 *
 * **The skill card pool is shuffled here and not in `createGameState`**, because a shuffle needs the
 * injected RNG and keeping `createGameState` free of randomness is what lets about half the unit tests
 * build a starting board with no `deps` at all. The seats start with **empty** hands: a card is drawn
 * at the start of every turn (FR-23), so the first turn's draw is the first card anybody holds.
 *
 * **`skillPool` exists for the same reason `skillSquares` does, and it is the stronger case of the
 * two.** Shuffling 58 cards spends 57 draws from `deps.rng`, and drawing one at the start of every turn
 * spends another. A test that scripts a sequence of rolls has no chance against that: it would be
 * exhausted before the first die was thrown. Passing `[]` starts a match with no skill cards in it, and
 * a draw from an empty pool spends no randomness at all, so a scripted roll sequence stays exact.
 *
 * Both defaults are the real thing, so no production caller passes either and there is no way to start
 * a real match with an accidentally empty pool.
 */
export function startMatch(playerCount, deps, skillSquares, skillPool) {
  assertDeps(deps);

  const fresh = createGameState(playerCount, skillSquares);
  const seeded = nextState(fresh, seedSkillCards(fresh, deps, skillPool));

  return drawHand(seeded, deps);
}

/**
 * A fresh match with the same players, without reloading the page (FR-06).
 *
 * Everything is rebuilt from `createGameState`, so no field can survive by being forgotten. That is
 * the whole acceptance criterion: "a fresh match with all state reset".
 *
 * **The skill squares go back to their starting layout, they are not carried over.** A restart is a
 * fresh match, and a board that kept the arrangement the last match had wandered into would make the
 * second match start from a position nobody chose.
 */
export function restartMatch(state, deps) {
  return startMatch(state.playerCount, deps);
}

/**
 * Give up a match in progress (FR-07). The pawns are left where they stand, because the record of
 * how far the match got is the only thing an abandoned match still has to say.
 */
export function abandonMatch(state) {
  return nextState(state, {
    status: MATCH_STATUS.ABANDONED,
    phase: TURN_PHASE.MATCH_OVER,
  });
}

/**
 * The dependency pair for a match: the randomness and the Dice Card Pool.
 *
 * This was the seam issue #37 replaced. The single-card stand-in that used to be the default is now
 * the real twenty-card pool, and the change was this one default argument, because every rule was
 * already written against the die's maximum rather than against a six.
 *
 * `rng` has no default on purpose: a default would be `Math.random`, and NFR-09 exists to keep that
 * out of the rules. `diceSource` does have one, because a match with no pool is not a thing anybody
 * wants; a test that needs a predictable die passes `fixedDieSource()` instead.
 */
export function matchDeps(rng, diceSource = createDicePool()) {
  return { rng, diceSource };
}
