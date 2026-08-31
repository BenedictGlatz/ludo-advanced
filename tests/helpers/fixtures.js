/**
 * Small builders shared by the unit tests. Not a test file itself: Vitest only collects
 * `*.test.js`, so nothing here runs on its own.
 *
 * The point of these is readability. A movement test is about one rule, and a rule is hard to see
 * behind twelve lines of literal pawn objects.
 */

import { createPawns } from "../../src/core/pawns.js";

/**
 * A pawn list for `playerCount` players with some pawns moved off their start squares.
 *
 * ```js
 * pawnsAt(4, { "0.0": 40, "1.1": 13 })
 * // player 0's pawn 0 sits on its turn-off square, player 1's pawn 1 is 13 steps in,
 * // and the other fourteen pawns are still in their start areas.
 * ```
 *
 * **`playerCount` picks the seats, it does not number them.** A two-player fixture holds seats 0
 * and **2**, and has no seat 1 at all, because `seatsFor` seats two players opposite each other. A
 * rules test that just needs a second player is therefore easier to read as a four-player fixture:
 * the idle seats stay in their start areas, where nothing can collide with them.
 *
 * The `"player.pawn"` key is a string because it reads as a coordinate at the call site, which is
 * the only place it has to be readable.
 */
export function pawnsAt(playerCount, placements = {}) {
  let pawns = createPawns(playerCount);

  for (const [key, r] of Object.entries(placements)) {
    const [player, pawn] = key.split(".").map(Number);
    const index = pawns.findIndex((entry) => entry.player === player && entry.pawn === pawn);
    if (index === -1) {
      throw new Error(
        `fixture asks for pawn ${key}, which does not exist in a ${playerCount}-player match`
      );
    }
    pawns = pawns.slice();
    pawns[index] = { ...pawns[index], r };
  }

  return pawns;
}

/**
 * An injectable RNG (NFR-09) that makes `rollDie(faces, rng)` produce exactly `rolls`, in order.
 *
 * Written in terms of the rolls the test wants rather than in raw floats, because a test that reads
 * `rngForRolls([6, 3, 6], 6)` says what it is doing and `[0.833, 0.333, 0.833]` does not.
 *
 * It throws when it runs out. A test that rolls more often than it scripted has stopped testing what
 * it says it tests, and silently wrapping around would hide that.
 */
export function rngForRolls(rolls, faces) {
  let index = 0;
  return () => {
    if (index >= rolls.length) {
      throw new Error(`scripted RNG exhausted after ${rolls.length} rolls`);
    }
    const roll = rolls[index];
    index += 1;
    return (roll - 1) / faces;
  };
}

/**
 * The same thing for a chain that rolls dice of **different sizes**, which is issue #38's roll.
 *
 * `rngForRolls` takes one face count for every roll, and that stopped being enough the moment Angel
 * Die added a D8 on top of whichever dice card was chosen. Written as pairs so the intent survives:
 *
 * ```js
 * rngForDice([[6, 20], [5, 8]])  // a 6 on the D20, then a 5 on the added D8
 * ```
 *
 * Kept as a second helper rather than replacing the first, because most tests roll one die and
 * `rngForRolls([6, 3], 6)` reads better than the pair form for those.
 */
export function rngForDice(pairs) {
  let index = 0;
  return () => {
    if (index >= pairs.length) {
      throw new Error(`scripted RNG exhausted after ${pairs.length} rolls`);
    }
    const [roll, faces] = pairs[index];
    index += 1;
    return (roll - 1) / faces;
  };
}
