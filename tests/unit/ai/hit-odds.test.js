/**
 * The table that says how likely an opponent is to roll exactly what they need. Bot tactics plan,
 * phase 1a.
 *
 * ## What can be tested about a table of 20 numbers
 *
 * Not the numbers themselves. Copying them into this file would prove only that they were copied, and
 * the day somebody reweights `POOL_COMPOSITION` the copy would be wrong and the test would still pass
 * against itself. What is worth pinning is the **shape**, because every one of these properties would
 * be broken by a plausible bug in the enumeration:
 *
 * - every entry is a probability
 * - the table never rises as the distance grows: a further square is never easier to reach
 * - the D2 range and the entry chance agree, because they are the same question
 * - the worked example in the plan comes out
 */

import { describe, expect, it } from "vitest";

import { HAND_SIZE, POOL_SIZE } from "../../../src/core/dice-pool.js";
import { ENTRY_ODDS, HIT_ODDS, MAX_REACH, oddsOfHit } from "../../../src/ai/hit-odds.js";

describe("the hit table's shape", () => {
  it("is a probability at every distance", () => {
    for (let distance = 1; distance <= MAX_REACH; distance += 1) {
      expect(oddsOfHit(distance)).toBeGreaterThan(0);
      expect(oddsOfHit(distance)).toBeLessThan(1);
    }
  });

  /**
   * The table steps down in pairs, because the pool holds only even-sided dice: a D4 reaches 3 and 4
   * equally well. What must never happen is a **rise**, which is what a mistake in "the smallest die
   * that reaches" would look like.
   */
  it("never gets easier as the distance grows", () => {
    for (let distance = 2; distance <= MAX_REACH; distance += 1) {
      expect(oddsOfHit(distance)).toBeLessThanOrEqual(oddsOfHit(distance - 1));
    }
  });

  it("is nothing past the biggest die, and nothing for a non-distance", () => {
    expect(oddsOfHit(MAX_REACH + 1)).toBe(0);
    expect(oddsOfHit(0)).toBe(0);
    expect(oddsOfHit(-3)).toBe(0);
    expect(oddsOfHit(2.5)).toBe(0);
    expect(HIT_ODDS[0]).toBe(0);
  });

  /**
   * The worked example the bot tactics plan opens with. A hand holds a D2 in `1 - C(18,3)/C(20,3)` of
   * deals, and a D2 names the square one ahead half the time, so a pawn one square behind hits at
   * least that often. It hits a little more often than that, because a hand with no D2 in it may still
   * hold a D4 or a D6.
   *
   * This is the one number in the file written out by hand, and it is written as the arithmetic rather
   * than as a decimal so that it is checkable rather than merely recorded.
   */
  it("is at least the chance of holding a D2, times a coin flip", () => {
    const choose = (n, k) =>
      k === 0 ? 1 : Array.from({ length: k }, (_, i) => (n - i) / (k - i)).reduce((a, b) => a * b);

    const withoutD2 = choose(POOL_SIZE - 2, HAND_SIZE) / choose(POOL_SIZE, HAND_SIZE);
    const floor = (1 - withoutD2) * 0.5;

    expect(oddsOfHit(1)).toBeGreaterThan(floor);
    expect(oddsOfHit(1)).toBeLessThan(2 * floor);
  });

  /**
   * Leaving the yard needs the maximum of the die you picked, and the player picks the smallest die in
   * the hand to get it. "The smallest die that reaches 1" is that same die, so the two numbers are the
   * same by construction. Pinning it here is what stops a later change to one of them drifting away
   * from the other silently.
   */
  it("agrees with the chance of getting a pawn out of the yard", () => {
    expect(ENTRY_ODDS).toBeCloseTo(oddsOfHit(1), 12);
  });

  /** The old guess was a flat 1/6 at short range. The point of the table is that it is not. */
  it("is a good deal more dangerous at short range than the old flat guess", () => {
    expect(oddsOfHit(1)).toBeGreaterThan(1 / 6);
    expect(oddsOfHit(6)).toBeLessThan(1 / 6);
  });
});
