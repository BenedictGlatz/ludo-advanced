/**
 * When a roll earns another roll. Issue #89.
 *
 * The rule has three parts and each gets a case: the die's size, the natural face, and the cap.
 */

import { describe, expect, it } from "vitest";

import {
  BONUS_ROLL_LIMIT,
  BONUS_ROLL_MIN_FACES,
  grantsBonusRoll,
  naturalRoll,
} from "../../../src/core/bonus-roll.js";
import { ROLL_STEP } from "../../../src/core/roll.js";

const base = (value, faces) => ({ step: ROLL_STEP.BASE, value, faces });

describe("naturalRoll", () => {
  it("reads the face the chosen die showed", () => {
    expect(naturalRoll([base(6, 6)])).toBe(6);
    expect(naturalRoll([base(6, 6), { step: ROLL_STEP.ADD_DIE, value: 3, faces: 8 }])).toBe(6);
  });

  it("reads the kept face of an advantage or disadvantage pair", () => {
    expect(naturalRoll([{ step: ROLL_STEP.ADVANTAGE, value: 6, faces: 6, rolled: [2, 6] }])).toBe(
      6
    );
    expect(
      naturalRoll([{ step: ROLL_STEP.DISADVANTAGE, value: 2, faces: 6, rolled: [2, 6] }])
    ).toBe(2);
  });

  /** FR FR names the number; nothing was rolled, so nothing can be a maximum. */
  it("is null for a named number and for no roll at all", () => {
    expect(naturalRoll([{ step: ROLL_STEP.FIXED, value: 6 }])).toBeNull();
    expect(naturalRoll([])).toBeNull();
  });
});

describe("grantsBonusRoll", () => {
  it("grants a bonus on the natural maximum of a D6 or larger", () => {
    for (const faces of [6, 8, 10, 12, 20]) {
      expect(
        grantsBonusRoll({ dieMax: faces, rollSteps: [base(faces, faces)], rollsThisTurn: 1 })
      ).toBe(true);
    }
  });

  /** The floor the Product Owner set, against the D2 that would roll again every other turn. */
  it("never grants one on a D2 or a D4, even on their maximum", () => {
    expect(BONUS_ROLL_MIN_FACES).toBe(6);
    expect(grantsBonusRoll({ dieMax: 2, rollSteps: [base(2, 2)], rollsThisTurn: 1 })).toBe(false);
    expect(grantsBonusRoll({ dieMax: 4, rollSteps: [base(4, 4)], rollsThisTurn: 1 })).toBe(false);
  });

  it("grants nothing below the maximum", () => {
    expect(grantsBonusRoll({ dieMax: 6, rollSteps: [base(5, 6)], rollsThisTurn: 1 })).toBe(false);
  });

  /** A buff that lifts the total to or past the maximum buys nothing: the face is what counts. */
  it("reads the natural face and not the modified total", () => {
    const steps = [base(3, 6), { step: ROLL_STEP.ADD_DIE, value: 3, faces: 8 }];
    expect(grantsBonusRoll({ dieMax: 6, rollSteps: steps, rollsThisTurn: 1 })).toBe(false);

    const named = [{ step: ROLL_STEP.FIXED, value: 6 }];
    expect(grantsBonusRoll({ dieMax: 6, rollSteps: named, rollsThisTurn: 1 })).toBe(false);
  });

  it("stops at the cap, so a turn ends whatever the dice say", () => {
    expect(BONUS_ROLL_LIMIT).toBe(3);
    expect(grantsBonusRoll({ dieMax: 6, rollSteps: [base(6, 6)], rollsThisTurn: 2 })).toBe(true);
    expect(grantsBonusRoll({ dieMax: 6, rollSteps: [base(6, 6)], rollsThisTurn: 3 })).toBe(false);
  });

  it("is false before any die was chosen", () => {
    expect(grantsBonusRoll({ dieMax: null, rollSteps: [], rollsThisTurn: 0 })).toBe(false);
  });
});
