import { describe, expect, it } from "vitest";

import { createSeededRng, fixedDieSource, rollDie } from "../../../src/core/dice-source.js";
import { rngForRolls } from "../../helpers/fixtures.js";

describe("rollDie (FR-20)", () => {
  it("turns a scripted RNG into exactly the rolls a test asked for", () => {
    const rng = rngForRolls([1, 4, 6], 6);

    expect(rollDie(6, rng)).toBe(1);
    expect(rollDie(6, rng)).toBe(4);
    expect(rollDie(6, rng)).toBe(6);
  });

  it("covers the whole range 1..n and nothing outside it", () => {
    for (const faces of [2, 4, 6, 8, 10, 12, 20]) {
      const seen = new Set();
      const rng = createSeededRng(faces * 7);

      for (let attempt = 0; attempt < 4000; attempt += 1) {
        const value = rollDie(faces, rng);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(faces);
        seen.add(value);
      }

      expect(seen.size).toBe(faces);
    }
  });

  it("refuses a die with fewer than two faces", () => {
    for (const faces of [1, 0, -6, 6.5, "6"]) {
      expect(() => rollDie(faces, () => 0.5)).toThrow(RangeError);
    }
  });

  it("refuses an RNG that does not return a number in [0, 1)", () => {
    for (const value of [1, 1.5, -0.1, "0.5", null]) {
      expect(() => rollDie(6, () => value)).toThrow(RangeError);
    }
  });
});

describe("createSeededRng (NFR-09)", () => {
  it("gives the same sequence for the same seed", () => {
    const first = createSeededRng(42);
    const second = createSeededRng(42);
    const take = (rng) => Array.from({ length: 20 }, () => rng());

    expect(take(first)).toEqual(take(second));
  });

  it("gives a different sequence for a different seed", () => {
    const take = (seed) => Array.from({ length: 20 }, createSeededRng(seed));

    expect(take(1)).not.toEqual(take(2));
  });

  it("stays inside [0, 1)", () => {
    const rng = createSeededRng(7);

    for (let attempt = 0; attempt < 5000; attempt += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("refuses a seed that is not an integer", () => {
    for (const seed of [1.5, "42", null, undefined]) {
      expect(() => createSeededRng(seed)).toThrow(RangeError);
    }
  });
});

describe("fixedDieSource, the stand-in for the Dice Card Pool (issue #37)", () => {
  it("always draws the same single card", () => {
    const source = fixedDieSource(6);

    expect(source.handSize).toBe(1);
    expect(source.draw()).toEqual([6]);
    expect(source.draw()).toEqual([6]);
  });

  it("takes the hand back without complaining, so the turn manager can be written once", () => {
    const source = fixedDieSource(20);

    expect(() => source.returnHand(source.draw())).not.toThrow();
    expect(source.draw()).toEqual([20]);
  });

  it("defaults to a D6", () => {
    expect(fixedDieSource().draw()).toEqual([6]);
  });

  it("refuses a die with fewer than two faces", () => {
    for (const faces of [1, 0, 6.5, "6"]) {
      expect(() => fixedDieSource(faces)).toThrow(RangeError);
    }
  });
});
