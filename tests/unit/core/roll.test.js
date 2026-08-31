/**
 * The roll chain. Issue #38, requirement FR-20.
 *
 * Every case here scripts the RNG, so no test asserts a distribution. That is on purpose: whether
 * `rollDie` is uniform is `dice-source.test.js`'s question, and whether the chain applies its steps in
 * the documented order is this file's. Mixing the two produces a test that fails for two reasons.
 */

import { describe, expect, it } from "vitest";

import { ROLL_STEP, createModifiers, resolveRoll, withModifier } from "../../../src/core/roll.js";
import { rngForDice } from "../../../tests/helpers/fixtures.js";

const plain = () => ({ dieMax: 6, modifiers: createModifiers() });

describe("an unmodified roll", () => {
  it("is one roll of the chosen dice card and nothing else", () => {
    const result = resolveRoll(plain(), rngForDice([[4, 6]]));

    expect(result.roll).toBe(4);
    expect(result.dieMax).toBe(6);
    expect(result.steps).toEqual([{ step: ROLL_STEP.BASE, value: 4, faces: 6 }]);
  });

  it("refuses a die with fewer than two faces", () => {
    for (const dieMax of [1, 0, 6.5, "6"]) {
      expect(() => resolveRoll({ dieMax }, rngForDice([[1, 6]]))).toThrow(RangeError);
    }
  });
});

describe("advantage and disadvantage", () => {
  it("keeps the higher of two rolls with advantage (Critical Success)", () => {
    const modifiers = withModifier(createModifiers(), { advantage: true });
    const result = resolveRoll(
      { dieMax: 6, modifiers },
      rngForDice([
        [2, 6],
        [5, 6],
      ])
    );

    expect(result.roll).toBe(5);
    expect(result.steps[0]).toMatchObject({ step: ROLL_STEP.ADVANTAGE, rolled: [2, 5] });
  });

  it("keeps the lower of two rolls with disadvantage (Critical Failure)", () => {
    const modifiers = withModifier(createModifiers(), { disadvantage: true });
    const result = resolveRoll(
      { dieMax: 6, modifiers },
      rngForDice([
        [2, 6],
        [5, 6],
      ])
    );

    expect(result.roll).toBe(2);
    expect(result.steps[0]).toMatchObject({ step: ROLL_STEP.DISADVANTAGE, rolled: [2, 5] });
  });

  /**
   * The one case worth arguing about, and the reason the implementation is an exclusive or.
   *
   * The alternative resolutions are "advantage wins", "disadvantage wins" and "roll twice and pick by
   * some third rule". All three need a written rule about which card was played first. Cancelling
   * needs none, and the scripted RNG proves the second roll is never spent: a second entry in the
   * script would make this test throw "scripted RNG exhausted".
   */
  it("cancels out when both are played, spending only one roll", () => {
    const modifiers = withModifier(createModifiers(), { advantage: true, disadvantage: true });
    const result = resolveRoll({ dieMax: 6, modifiers }, rngForDice([[2, 6]]));

    expect(result.roll).toBe(2);
    expect(result.steps[0].step).toBe(ROLL_STEP.BASE);
  });
});

describe("extra dice", () => {
  it("adds a D8 on top of the chosen card (Angel Die)", () => {
    const modifiers = withModifier(createModifiers(), { addDice: [8] });
    const result = resolveRoll(
      { dieMax: 6, modifiers },
      rngForDice([
        [5, 6],
        [7, 8],
      ])
    );

    expect(result.roll).toBe(12);
    expect(result.steps.at(-1)).toEqual({ step: ROLL_STEP.ADD_DIE, value: 7, faces: 8 });
  });

  it("stacks two extra dice rather than replacing one with the other", () => {
    const modifiers = withModifier(withModifier(createModifiers(), { addDice: [8] }), {
      addDice: [8],
    });

    expect(modifiers.addDice).toEqual([8, 8]);
  });

  it("subtracts a D8 and can push the roll below the die's own range (Devil Die)", () => {
    const modifiers = withModifier(createModifiers(), { subDice: [8] });
    const result = resolveRoll(
      { dieMax: 6, modifiers },
      rngForDice([
        [6, 6],
        [2, 8],
      ])
    );

    expect(result.roll).toBe(4);
  });

  /**
   * The grenade case: a roll that would go negative.
   *
   * This is why `movement.js` had to accept a roll of zero. Before issue #38 it threw a RangeError for
   * anything outside 1 to dieMax, which would have turned one card into a crash.
   */
  it("never returns a negative roll, and says so in the trace", () => {
    const modifiers = withModifier(createModifiers(), { subDice: [8] });
    const result = resolveRoll(
      { dieMax: 6, modifiers },
      rngForDice([
        [1, 6],
        [8, 8],
      ])
    );

    expect(result.roll).toBe(0);
    expect(result.steps.at(-1)).toEqual({ step: ROLL_STEP.FLOOR, value: 0 });
  });
});

describe("the order of the chain", () => {
  /**
   * Multiplying and adding do not commute, so the order has to be asserted rather than assumed.
   *
   * A 3 on a D6, plus a 5 on an added D8, doubled, is 16. Doubling first would give 11. The difference
   * is a full lap of the board, which is why the order is written down in the module's own table.
   */
  it("adds the extra dice before it multiplies (Angel Die plus Speedrun)", () => {
    const modifiers = withModifier(createModifiers(), { addDice: [8], multiplier: 2 });
    const result = resolveRoll(
      { dieMax: 6, modifiers },
      rngForDice([
        [3, 6],
        [5, 8],
      ])
    );

    expect(result.roll).toBe(16);
  });

  it("lets a named number replace the roll without spending the RNG at all (FR FR)", () => {
    const modifiers = withModifier(createModifiers(), { fixed: 4 });
    const result = resolveRoll({ dieMax: 20, modifiers }, rngForDice([]));

    expect(result.roll).toBe(4);
    expect(result.steps).toEqual([{ step: ROLL_STEP.FIXED, value: 4 }]);
  });

  it("holds a named number to the chosen card's range", () => {
    const modifiers = withModifier(createModifiers(), { fixed: 19 });

    expect(resolveRoll({ dieMax: 6, modifiers }, rngForDice([])).roll).toBe(6);
  });

  it("truncates rather than rounding, so a multiplier can never invent half a square", () => {
    const modifiers = withModifier(createModifiers(), { multiplier: 1.5 });
    const result = resolveRoll({ dieMax: 6, modifiers }, rngForDice([[3, 6]]));

    expect(result.roll).toBe(4);
  });
});

describe("createModifiers", () => {
  it("hands out a fresh array every time, never a shared one", () => {
    expect(createModifiers().addDice).not.toBe(createModifiers().addDice);
  });
});
