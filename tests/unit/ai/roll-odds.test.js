/**
 * The roll as a probability distribution. Issue #82.
 *
 * ## Why this file is mostly arithmetic
 *
 * `rollOdds` is a second implementation of the chain in `core/roll.js`, over probabilities instead of
 * dice, and `roll-odds.js`'s header says why that duplication is the cheaper of two evils. The cost of
 * a duplicate is that it can drift, and the only thing that catches drift is a test that knows the
 * right answers independently. So the numbers below are worked out by hand:
 *
 * | Case | The answer, and where it comes from |
 * | --- | --- |
 * | A plain D6 | Six outcomes, `1/6` each |
 * | Advantage on a D6 | `P(max = k) = (2k - 1) / 36`, mean `161/36 ≈ 4.472` |
 * | Disadvantage on a D6 | The mirror image, mean `91/36 ≈ 2.528` |
 * | 67 on a D6 | Five faces in six collapse to 0, the sixth doubles to 12 |
 *
 * The last one is the ordering that matters most: the threshold is applied **before** the multiplier,
 * so a 3 doubled to 6 must not pass a test it failed.
 */

import { describe, expect, it } from "vitest";

import { createModifiers, withModifier } from "../../../src/core/roll.js";
import { expectedMoveScore, rollOdds } from "../../../src/ai/roll-odds.js";
import { SCORE } from "../../../src/ai/move-scoring.js";
import { pawnsAt, stateFor } from "../../helpers/fixtures.js";

/** The mean of a distribution, which is what every card value is ultimately a difference of. */
function mean(odds) {
  return odds.reduce((total, { roll, p }) => total + roll * p, 0);
}

/** How much probability the distribution carries. Has to be 1, always. */
function mass(odds) {
  return odds.reduce((total, { p }) => total + p, 0);
}

const plain = createModifiers();

describe("rollOdds: the shape of the answer", () => {
  it("gives a plain die one outcome per face, all equally likely", () => {
    const odds = rollOdds(6, plain);

    expect(odds.map((entry) => entry.roll)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(odds.every((entry) => Math.abs(entry.p - 1 / 6) < 1e-12)).toBe(true);
  });

  /**
   * The one property worth asserting about every case at once. A step that lost or invented
   * probability would tilt every card value in the same direction, which looks like a bot with an
   * opinion rather than like a bug.
   */
  it("always carries exactly one unit of probability", () => {
    const cases = [
      plain,
      withModifier(plain, { advantage: true }),
      withModifier(plain, { disadvantage: true }),
      withModifier(plain, { addDice: [8] }),
      withModifier(plain, { subDice: [8] }),
      withModifier(plain, { addDice: [8, 8], subDice: [6] }),
      withModifier(plain, { atLeast: 6, multiplier: 2 }),
      withModifier(plain, { fixed: 3 }),
    ];

    for (const modifiers of cases) {
      expect(Math.abs(mass(rollOdds(20, modifiers)) - 1)).toBeLessThan(1e-12);
    }
  });

  it("sorts the outcomes and merges the ones that end up equal", () => {
    // A D6 minus a D8 floors at zero, so every negative total collapses onto one entry.
    const odds = rollOdds(6, withModifier(plain, { subDice: [8] }));

    expect(odds.map((entry) => entry.roll)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(odds.some((entry) => entry.roll < 0)).toBe(false);
  });
});

describe("rollOdds: the six steps of the chain", () => {
  it("replaces the roll with a named number, held to the die", () => {
    expect(rollOdds(6, withModifier(plain, { fixed: 4 }))).toEqual([{ roll: 4, p: 1 }]);
    expect(rollOdds(4, withModifier(plain, { fixed: 19 }))).toEqual([{ roll: 4, p: 1 }]);
  });

  it("keeps the higher of two rolls for advantage and the lower for disadvantage", () => {
    expect(mean(rollOdds(6, withModifier(plain, { advantage: true })))).toBeCloseTo(161 / 36, 10);
    expect(mean(rollOdds(6, withModifier(plain, { disadvantage: true })))).toBeCloseTo(91 / 36, 10);
  });

  it("cancels advantage against disadvantage, as one plain roll", () => {
    const both = withModifier(plain, { advantage: true, disadvantage: true });

    expect(rollOdds(6, both)).toEqual(rollOdds(6, plain));
  });

  it("adds and subtracts whole dice", () => {
    const added = rollOdds(6, withModifier(plain, { addDice: [8] }));

    expect(added[0].roll).toBe(2);
    expect(added.at(-1).roll).toBe(14);
    expect(mean(added)).toBeCloseTo(3.5 + 4.5, 10);
  });

  /**
   * 67, and the ordering the whole card depends on. Five of the six faces miss the threshold and
   * collapse to nothing; the sixth clears it and is then doubled to 12. A multiplier applied first
   * would let a 3 pass as a 6, which is the bug `core/roll.js` documents at length.
   */
  it("applies 67's threshold before the multiplier", () => {
    const odds = rollOdds(6, withModifier(plain, { atLeast: 6, multiplier: 2 }));

    expect(odds.map((entry) => entry.roll)).toEqual([0, 12]);
    expect(odds[0].p).toBeCloseTo(5 / 6, 10);
    expect(odds[1].p).toBeCloseTo(1 / 6, 10);
  });

  it("floors a roll that a subtracted die pushed below zero", () => {
    const odds = rollOdds(2, withModifier(plain, { subDice: [8] }));

    // Of the sixteen outcomes only "2 on the D2, 1 on the D8" is above zero. The other fifteen are
    // zero or negative and all land on one entry.
    expect(odds.map((entry) => entry.roll)).toEqual([0, 1]);
    expect(odds[0].p).toBeCloseTo(15 / 16, 10);
  });
});

describe("expectedMoveScore: the currency every card value is written in", () => {
  /**
   * The simplest board there is, and the number `dice-choice.js`'s own comment quotes: with every pawn
   * in the yard a pawn leaves on the die's maximum, so a D2 is worth `25 / 2`.
   */
  it("prices a turn in the units of SCORE", () => {
    const state = stateFor({ pawns: pawnsAt(4) });

    expect(expectedMoveScore(state, 0, 2, plain)).toBeCloseTo(SCORE.LEAVE_START / 2, 10);
    expect(expectedMoveScore(state, 0, 20, plain)).toBeCloseTo(SCORE.LEAVE_START / 20, 10);
  });

  /**
   * One pawn one step from home and three in the yard. Exactly two of the six faces do anything: a 1
   * finishes the leading pawn, a 6 is the die's maximum and gets one out of the yard, and the other
   * four score nothing at all. So the mean is `(100 + 25) / 6` and the four dead faces are in it.
   */
  it("counts a roll with no legal move as a zero in the mean", () => {
    const state = stateFor({ pawns: pawnsAt(4, { "0.0": 43 }) });

    const expected = (SCORE.FINISH + SCORE.LEAVE_START) / 6;
    expect(expectedMoveScore(state, 0, 6, plain)).toBeCloseTo(expected, 10);
  });

  /**
   * The board argument is what prices Hold Pawn, so it has to be able to take the finish away. With
   * the leading pawn held, the only face that still does anything is the 6 that empties the yard.
   */
  it("reads the board it is given, so a held pawn is priced as held", () => {
    const state = stateFor({ pawns: pawnsAt(4, { "0.0": 43 }) });
    const held = [{ kind: "held", player: 0, pawn: 0, until: 99, source: "reaction-hold-pawn" }];

    const board = { statuses: held, traps: [] };
    expect(expectedMoveScore(state, 0, 6, plain, board)).toBeCloseTo(SCORE.LEAVE_START / 6, 10);
  });
});
