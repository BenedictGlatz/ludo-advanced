/**
 * The distributions FR-16 and FR-20 actually ask for.
 *
 * ## Why this file exists next to dice-source.test.js and dice-pool.test.js
 *
 * Both of those already had a test per requirement, and both tested the wrong thing.
 *
 * FR-20's acceptance criterion is "over a large sample each face occurs with frequency consistent with
 * 1/n". What was tested was `seen.size === faces`: every face turns up at least once in four thousand
 * rolls. A die that returned the 1 in ninety per cent of rolls and each other face in the remaining ten
 * would pass that. Reachability and uniformity are different claims and only one of them was checked.
 *
 * FR-16's criterion has the same shape, "each defined denomination is reachable" over a long run, and
 * the pool test checked the composition table rather than what `draw` actually deals.
 *
 * ## Why a fixed seed rather than a real statistical test
 *
 * A test that draws a fresh seed every run is a test that fails one time in some thousands for no
 * reason, and a suite with a known flaky test in it stops being read. Every generator here is
 * `createSeededRng` with a seed written into the file, so the sample is the same sample on every machine
 * and every run: the assertion either holds forever or it never held.
 *
 * The tolerance is still derived rather than guessed. For `n` trials of a Bernoulli event with
 * probability `p`, the count has standard deviation `sqrt(n * p * (1 - p))`. `tolerance()` returns four
 * of those, so a genuinely uniform source sits inside the band with overwhelming probability while a
 * source biased by a few per cent falls outside it. Four sigma rather than three, because three sigma
 * over sixty-seven separate faces would be expected to fail somewhere by chance.
 */

import { describe, expect, it } from "vitest";

import {
  HAND_SIZE,
  POOL_COMPOSITION,
  POOL_SIZE,
  createDicePool,
} from "../../../src/core/dice-pool.js";
import { createSeededRng, rollDie } from "../../../src/core/dice-source.js";

/** Four standard deviations of a binomial count, which is the band an unbiased source stays inside. */
function tolerance(trials, probability) {
  return 4 * Math.sqrt(trials * probability * (1 - probability));
}

/** How often each value occurs, as a plain object keyed by the value. */
function tally(values) {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

describe("rollDie is uniform, which is what FR-20 asks and reachability did not prove", () => {
  const ROLLS = 60_000;

  for (const faces of POOL_COMPOSITION.map((entry) => entry.faces)) {
    it(`spreads ${ROLLS} rolls of a D${faces} evenly over its ${faces} faces`, () => {
      const rng = createSeededRng(faces * 1_000 + 7);
      const counts = tally(Array.from({ length: ROLLS }, () => rollDie(faces, rng)));

      const expected = ROLLS / faces;
      const band = tolerance(ROLLS, 1 / faces);

      for (let face = 1; face <= faces; face += 1) {
        expect(counts[face], `face ${face} of a D${faces}`).toBeGreaterThan(expected - band);
        expect(counts[face], `face ${face} of a D${faces}`).toBeLessThan(expected + band);
      }
    });
  }

  it("would fail a die that is reachable but not uniform, which is the point of the band", () => {
    // A source biased toward low values: it never returns the top fifth of [0, 1), so a D10 reaches
    // every face except the 10. The old reachability test would have caught this one; the next case is
    // the one it would not.
    let step = 0;
    const skewed = () => {
      step += 1;
      return (step % 8) / 10;
    };

    const counts = tally(Array.from({ length: 8_000 }, () => rollDie(10, skewed)));
    const band = tolerance(8_000, 1 / 10);

    expect(Object.keys(counts).length).toBeLessThan(10);
    expect(counts[9] ?? 0).toBeLessThan(800 - band);
  });
});

describe("the pool deals every denomination at its own weight (FR-16, FR-17)", () => {
  const HANDS = 30_000;

  /**
   * Draw and return a hand `HANDS` times and count the faces dealt.
   *
   * Returning every hand is what makes this a test of the pool rather than of one shuffle: the pool is
   * stationary (FR-21), so all 90,000 cards come out of the same twenty.
   */
  function deal(seed) {
    const rng = createSeededRng(seed);
    const pool = createDicePool();
    const dealt = [];

    for (let hand = 0; hand < HANDS; hand += 1) {
      const drawn = pool.draw(rng);
      dealt.push(...drawn);
      pool.returnHand(drawn);
    }

    return dealt;
  }

  it("deals each denomination at copies/20, not merely at least once", () => {
    const dealt = deal(31);
    const counts = tally(dealt);
    const cards = HANDS * HAND_SIZE;

    expect(dealt).toHaveLength(cards);

    for (const { faces, copies } of POOL_COMPOSITION) {
      const share = copies / POOL_SIZE;
      const band = tolerance(cards, share);

      expect(counts[faces], `D${faces}`).toBeGreaterThan(cards * share - band);
      expect(counts[faces], `D${faces}`).toBeLessThan(cards * share + band);
    }
  });

  it("puts a D6 or a D8 in a hand four times as often as a D2, because that is the weighting", () => {
    const counts = tally(deal(31));

    // The rule the composition encodes: 4 copies against 2, so twice as many D6 as D2. Stated as a
    // ratio rather than as two absolute counts, because a ratio survives a change to HANDS.
    expect(counts[6] / counts[2]).toBeCloseTo(2, 1);
    expect(counts[8] / counts[2]).toBeCloseTo(2, 1);
    expect(counts[4] / counts[20]).toBeCloseTo(1.5, 1);
  });

  it("draws three different cards inside one hand, so no card is dealt twice (FR-18)", () => {
    // Without replacement means the *card* cannot repeat, not that the denomination cannot: two D6
    // cards in one hand is legal and common. What must never happen is a twenty-first card appearing,
    // and `returnHand` refuses to overfill, so a duplicated card would throw rather than pass.
    const rng = createSeededRng(31);
    const pool = createDicePool();

    for (let hand = 0; hand < 1_000; hand += 1) {
      const drawn = pool.draw(rng);

      expect(drawn).toHaveLength(HAND_SIZE);
      expect(pool.remaining()).toBe(POOL_SIZE - HAND_SIZE);
      expect(() => pool.returnHand(drawn)).not.toThrow();
      expect(pool.remaining()).toBe(POOL_SIZE);
    }
  });
});
