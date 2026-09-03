/**
 * How long the roll stays on screen before the turn carries on. Design spec 11, D70.
 *
 * ## Why this is a third file and not more cases in the other two
 *
 * The seam is `timers.js`'s own: `holdAfterTurn` is asked when the turn has **ended**, `holdMidTurn` in
 * the middle of a turn a card interrupted, and this when a roll has just produced a number. Three events,
 * three tokens, three numbers.
 *
 * The reason for testing a function this short is the one `mid-turn-hold.test.js` gives and it applies
 * here in the same way: **a wrong answer does not throw and does not look broken.** If this returned zero
 * when it should return 900 ms, the game would behave exactly as it did before D70 was answered, which is
 * the defect the Product Owner reported in the first place. The end-to-end suite cannot catch it, because
 * the suite runs with the hold collapsed to nothing on purpose (D74.2).
 *
 * `readToken` is what makes it testable with no stylesheet. In the browser it reads `tokens.css` off the
 * board, so this file asserts the **choice** of token and never a duration.
 */

import { describe, expect, it } from "vitest";

import { ROLL_HOLD_MS, holdRoll } from "../../../src/ui/timers.js";

/** Returns the token name instead of a duration, so a test can see which one was asked for. */
const nameToken = (token) => token;

/** Returns the fallback, so a test can see what happens with no stylesheet loaded. */
const noStylesheet = (_token, fallback) => fallback;

describe("which number the roll waits for", () => {
  /**
   * The token, and the one thing that could be wrong without anything failing: reusing
   * `--motion-roll` would hold for the length of the throw and cut the number's own moment off at the
   * instant it landed, which is the whole point of D70 being a hold and not a movement.
   */
  it("asks for the roll's hold and not for the throw", () => {
    expect(holdRoll({}, nameToken)).toBe("--motion-roll-hold");
  });

  /**
   * **There is no condition, and that is the assertion.** Its two siblings both return 0 for a state with
   * nothing to report, because a turn can end quietly and a card can announce nothing. A roll that
   * happened is never nothing, so `game-loop.js` decides whether to ask at all and this always answers.
   */
  it("holds unconditionally, since a roll that happened is never nothing", () => {
    expect(holdRoll({}, nameToken)).not.toBe(0);
  });

  it("falls back to nine hundred milliseconds when no stylesheet has loaded", () => {
    expect(holdRoll({}, noStylesheet)).toBe(ROLL_HOLD_MS);
  });
});

describe("what a test harness gets", () => {
  /**
   * `?fast=1` sets exactly zero, and `delays.roll ?? ...` is what makes that work where `||` would treat
   * it as absent and fall through to the token. One line, and getting it wrong would put a silent 900 ms
   * into every roll of every end-to-end run, which is minutes of wall clock across the suite.
   */
  it("honours an override of zero rather than treating it as absent", () => {
    expect(holdRoll({ roll: 0 }, nameToken)).toBe(0);
  });

  it("takes an override in place of the token", () => {
    expect(holdRoll({ roll: 40 }, nameToken)).toBe(40);
  });

  /**
   * The five waits are separately collapsible, which is the argument for `roll` being a fifth key rather
   * than a reuse of one of the others. None of the four that belong to a different event may reach this
   * branch, or a spec that collapses the trap hold would silently collapse the roll with it.
   */
  it("ignores the four keys that belong to the other waits", () => {
    expect(holdRoll({ afterMove: 9 }, nameToken)).toBe("--motion-roll-hold");
    expect(holdRoll({ afterRefusal: 9 }, nameToken)).toBe("--motion-roll-hold");
    expect(holdRoll({ afterTrap: 9 }, nameToken)).toBe("--motion-roll-hold");
    expect(holdRoll({ afterTrapCard: 9 }, nameToken)).toBe("--motion-roll-hold");
  });
});
