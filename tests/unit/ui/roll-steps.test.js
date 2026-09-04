/**
 * How a roll that cards changed reads. Design spec 11, D73. NFR-08.
 *
 * `roll-steps.js` is pure and testable for the same reason `overlay-screens.js` is: it takes a state
 * object and returns a description, with no jQuery in it, so it runs under `environment: "node"`.
 *
 * **The rule worth pinning is the one that decides whether the strip speaks at all.** D73.3 says a chain
 * of one step says nothing, because one step is `base`, which is almost every roll, and "D8: 5" beside a
 * badge reading 5 teaches the player to stop reading the strip. That makes the strip's silence
 * information, and getting the boundary wrong in either direction is invisible from the code: too eager
 * and the strip talks on every turn, too shy and the one case NFR-08 is about says nothing.
 *
 * That all nine kinds have a sentence at all is asserted in `tests/unit/i18n/locales.test.js`, next to
 * the same check for refusal reasons and card titles, because it is a question about the locale files
 * and not about this module.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { MATCH_STATUS, TURN_PHASE } from "../../../src/state/game-state.js";
import { ROLL_STEP } from "../../../src/core/roll.js";
import { initI18n } from "../../../src/i18n/index.js";
import { rollBreakdown } from "../../../src/ui/roll-steps.js";

/** An ordinary roll: one step, which is what the pool produces when no card interfered. */
const plain = [{ step: ROLL_STEP.BASE, value: 5, faces: 8 }];

/** A D20 that Critical Success, an Angel Die and a Speedrun Any% all had a hand in. */
const chained = [
  { step: ROLL_STEP.ADVANTAGE, value: 17, faces: 20, rolled: [4, 17] },
  { step: ROLL_STEP.ADD_DIE, value: 5, faces: 8 },
  { step: ROLL_STEP.MULTIPLIER, value: 44, factor: 2 },
];

describe("whether the strip speaks", () => {
  beforeAll(async () => {
    await initI18n("de");
  });

  /**
   * The common case, and the one that keeps the strip worth reading. Almost every roll is one `base`
   * step, so if this returned a list the strip would carry a message on nearly every turn of the match.
   */
  it("says nothing about an ordinary roll of one step", () => {
    expect(rollBreakdown({ rollSteps: plain })).toBeNull();
  });

  /**
   * The empty chain cannot happen in a real turn, because `resolveRoll` always records at least the base
   * step. It is pinned anyway: this function is called on every render, including renders before the
   * roll, where `rollSteps` is the empty array `clearedTurnFields` puts there.
   */
  it("says nothing when no roll has happened yet", () => {
    expect(rollBreakdown({ rollSteps: [] })).toBeNull();
  });

  it("explains a roll that two or more steps produced", () => {
    const steps = rollBreakdown({ rollSteps: chained });

    expect(steps).toHaveLength(3);
  });
});

describe("what each step says", () => {
  beforeAll(async () => {
    await initI18n("de");
  });

  /**
   * **In chain order, which is the order the rules applied them in.** The sentences are only an
   * explanation if they read in the sequence that produced the number: a multiplier printed before the
   * die it multiplied is a different claim about the same turn.
   */
  it("keeps the chain in the order the rules built it", () => {
    const steps = rollBreakdown({ rollSteps: chained });

    expect(steps.map((step) => step.kind)).toEqual(["advantage", "add-die", "multiplier"]);
  });

  /**
   * The kind travels next to the text so the view can put it in `data-roll-step`. No stylesheet reads
   * that attribute today, which is D51's precedent: the kind is already in the sentence, and having it
   * in the DOM as well costs nothing and gives a later decision a hook.
   */
  it("carries the kind beside the sentence", () => {
    const [first] = rollBreakdown({ rollSteps: chained });

    expect(first.kind).toBe(ROLL_STEP.ADVANTAGE);
    expect(first.text).toBe("Zweimal gewürfelt, höher: 17");
  });

  /**
   * Interpolation actually reached the sentence. A step object is spread whole and i18next uses the
   * placeholders its own sentence names, so a step that carries fields the sentence does not want is
   * fine and a sentence that wants a field the step does not carry is not. This is the case that would
   * catch the second kind.
   */
  it("fills the placeholders each sentence names", () => {
    const steps = rollBreakdown({
      rollSteps: [
        { step: ROLL_STEP.BASE, value: 3, faces: 8 },
        { step: ROLL_STEP.MISSED, value: 0, needed: 10, rolled: 3 },
      ],
    });

    expect(steps[0].text).toBe("W8: 3");
    expect(steps[1].text).toBe("Mindestens 10 gebraucht, 3 gewürfelt: 0");
  });

  /**
   * Nothing renders a step name raw. i18next answers a missing key with the key itself, so this is the
   * shape the failure takes on screen: a player would read `roll.step.missed` in the strip.
   */
  it("never leaves a key where a sentence should be", () => {
    const steps = rollBreakdown({
      rollSteps: Object.values(ROLL_STEP).map((step) => ({ step, value: 1, faces: 8, factor: 2 })),
    });

    for (const step of steps) {
      expect(step.text, step.kind).not.toContain("roll.step.");
    }
  });
});

/**
 * The two conditions the view puts on top of the chain length live in `move-hints.js` and not here, so
 * they are named rather than tested twice: the breakdown is only shown in the `act` phase (D73.4) and
 * only while the match is running, the second because `win.spec.js` requires the strip to carry no kind
 * at all once somebody has won. Both are asserted end to end.
 */
describe("what this module deliberately does not decide", () => {
  it("has no opinion about the phase or the match status", () => {
    const running = { rollSteps: chained, phase: TURN_PHASE.ACT, status: MATCH_STATUS.RUNNING };
    const won = { rollSteps: chained, phase: TURN_PHASE.TURN_END, status: MATCH_STATUS.WON };

    expect(rollBreakdown(won)).toEqual(rollBreakdown(running));
  });
});
