import { describe, expect, it } from "vitest";

import {
  HAND_SIZE,
  POOL_COMPOSITION,
  POOL_SIZE,
  createDicePool,
  poolCards,
} from "../../../src/core/dice-pool.js";
import { createSeededRng } from "../../../src/core/dice-source.js";

/** How many of each denomination a list of drawn cards holds, keyed by face count. */
function countByFaces(cards) {
  const counts = {};
  for (const faces of cards) counts[faces] = (counts[faces] ?? 0) + 1;
  return counts;
}

describe("the pool composition (FR-17, section 5.1 of the game design document)", () => {
  it("holds twenty cards over seven denominations", () => {
    expect(POOL_SIZE).toBe(20);
    expect(POOL_COMPOSITION).toHaveLength(7);
    expect(poolCards()).toHaveLength(20);
  });

  it("is weighted toward the middle, with D6 and D8 the most common cards", () => {
    expect(countByFaces(poolCards())).toEqual({ 2: 2, 4: 3, 6: 4, 8: 4, 10: 3, 12: 2, 20: 2 });
  });

  it("runs from D2 to D20 and holds no die with fewer than two faces", () => {
    const faces = POOL_COMPOSITION.map((entry) => entry.faces);

    expect(Math.min(...faces)).toBe(2);
    expect(Math.max(...faces)).toBe(20);
    expect(faces).toEqual([...faces].sort((a, b) => a - b));
  });

  it("cannot be reweighted by a caller, because the table is frozen", () => {
    expect(Object.isFrozen(POOL_COMPOSITION)).toBe(true);
    expect(Object.isFrozen(POOL_COMPOSITION[0])).toBe(true);
  });

  it("hands out a new list every time, so one caller cannot empty another caller's pool", () => {
    const first = poolCards();
    first.length = 0;

    expect(poolCards()).toHaveLength(20);
  });
});

describe("drawing a hand (FR-18, FR-19)", () => {
  it("draws exactly three cards", () => {
    const pool = createDicePool();

    expect(pool.handSize).toBe(HAND_SIZE);
    expect(pool.draw(createSeededRng(1))).toHaveLength(3);
  });

  it("draws without replacement, so the pool shrinks by three", () => {
    const pool = createDicePool();

    expect(pool.remaining()).toBe(20);
    pool.draw(createSeededRng(2));
    expect(pool.remaining()).toBe(17);
  });

  it("only ever deals cards the composition actually contains", () => {
    const rng = createSeededRng(3);
    const pool = createDicePool();
    const allowed = new Set(POOL_COMPOSITION.map((entry) => entry.faces));

    for (let turn = 0; turn < 200; turn += 1) {
      const hand = pool.draw(rng);
      for (const faces of hand) expect(allowed.has(faces)).toBe(true);
      pool.returnHand(hand);
    }
  });

  it("deals a hand of three different cards more often than not, which is why a choice exists", () => {
    const rng = createSeededRng(4);
    const pool = createDicePool();
    let allDifferent = 0;

    for (let turn = 0; turn < 1000; turn += 1) {
      const hand = pool.draw(rng);
      if (new Set(hand).size === 3) allDifferent += 1;
      pool.returnHand(hand);
    }

    expect(allDifferent).toBeGreaterThan(500);
  });

  it("refuses to draw when a hand was never returned and too few cards are left", () => {
    const rng = createSeededRng(5);
    const pool = createDicePool();

    for (let hand = 0; hand < 6; hand += 1) pool.draw(rng);
    expect(pool.remaining()).toBe(2);

    expect(() => pool.draw(rng)).toThrow(/cannot draw 3/);
  });

  it("refuses an RNG that does not return a number in [0, 1)", () => {
    for (const value of [1, 1.5, -0.1, "0.5", null]) {
      expect(() => createDicePool().draw(() => value)).toThrow(RangeError);
    }
  });

  it("refuses a missing RNG rather than dealing undefined cards", () => {
    expect(() => createDicePool().draw()).toThrow(TypeError);
  });
});

describe("returning the hand (FR-21)", () => {
  it("puts all three cards back, so the pool is stationary", () => {
    const rng = createSeededRng(6);
    const pool = createDicePool();

    for (let turn = 0; turn < 50; turn += 1) {
      const hand = pool.draw(rng);
      expect(pool.remaining()).toBe(17);
      pool.returnHand(hand);
      expect(pool.remaining()).toBe(20);
    }
  });

  it("keeps the composition intact over a long match: nothing is invented and nothing is lost", () => {
    const rng = createSeededRng(7);
    const pool = createDicePool();

    for (let turn = 0; turn < 300; turn += 1) pool.returnHand(pool.draw(rng));

    // Read the pool back out by draining it. Twenty is not a multiple of three, so two cards stay
    // behind and cannot be looked at. Counting what is missing is what closes the books on them.
    const drained = [];
    while (pool.remaining() >= HAND_SIZE) drained.push(...pool.draw(rng));

    expect(drained).toHaveLength(18);
    expect(pool.remaining()).toBe(2);

    const expected = countByFaces(poolCards());
    const seen = countByFaces(drained);
    let unseen = 0;

    for (const [faces, count] of Object.entries(expected)) {
      // No denomination may turn up more often than the composition says it exists.
      expect(seen[faces] ?? 0).toBeLessThanOrEqual(count);
      unseen += count - (seen[faces] ?? 0);
    }

    expect(unseen).toBe(2);
  });

  it("refuses cards that would overfill the pool, instead of quietly holding twenty-three", () => {
    const pool = createDicePool();

    expect(() => pool.returnHand([6])).toThrow(/20 card pool/);
  });

  it("refuses anything that is not the array draw handed out", () => {
    expect(() => createDicePool().returnHand(6)).toThrow(TypeError);
  });
});

describe("determinism (NFR-09)", () => {
  it("gives the same cards in the same order for the same seed", () => {
    const play = (seed) => {
      const rng = createSeededRng(seed);
      const pool = createDicePool();
      return Array.from({ length: 30 }, () => {
        const hand = pool.draw(rng);
        pool.returnHand(hand);
        return hand;
      });
    };

    expect(play(42)).toEqual(play(42));
    expect(play(42)).not.toEqual(play(43));
  });

  it("never reaches for Math.random, so two pools on one seed cannot drift apart", () => {
    const rng = createSeededRng(8);
    const first = createDicePool();
    const second = createDicePool();

    // Both pools are handed the same generator, so they must see the same numbers and deal the
    // same cards. A hidden Math.random anywhere inside would break exactly this.
    const handA = first.draw(createSeededRng(8));
    const handB = second.draw(rng);

    expect(handA).toEqual(handB);
  });
});
