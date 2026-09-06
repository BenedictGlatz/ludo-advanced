/**
 * How long a played card holds the turn. Design spec 18, D108 and D111.
 *
 * The fourth file in the set `after-turn-hold.test.js`, `mid-turn-hold.test.js` and
 * `roll-hold.test.js` started, and it is a fourth file for the reason the third one gave: the seam is
 * `holds.js`'s own, one file per event. This one is asked when a skill card has just been played.
 *
 * The reason for testing a function this short is also theirs, and it is sharper here. **A wrong
 * answer does not throw and does not look broken.** A hold of zero would put the game back exactly
 * where it was before the cast existed, which is the defect the whole feature was raised against, and
 * the end-to-end suite cannot catch it because that suite runs with every hold collapsed to nothing on
 * purpose.
 *
 * `readToken` is what makes this testable with no stylesheet. In the browser it reads `motion.css` off
 * the board, so the cases below assert the **choice** of token and the arithmetic, never a duration.
 */

import { describe, expect, it } from "vitest";

import { CAST_BOARD_MS, CAST_HOLD_MS, holdCast } from "../../../src/ui/holds.js";

/** Returns the token name instead of a duration, so a test can see which one was asked for. */
const nameToken = (token) => token;

/** Returns the fallback, so a test can see what happens with no stylesheet loaded. */
const noStylesheet = (_token, fallback) => fallback;

/** A stylesheet, faked: the two numbers `motion.css` actually carries. */
const stylesheet = (token) => ({ "--motion-cast-hold": 1500, "--motion-cast-board": 560 })[token];

describe("which number a cast waits for", () => {
  /**
   * The token, and the one thing that could be wrong without anything failing: reusing
   * `--motion-cast` would hold for the card stage alone and cut the board stage off half way through,
   * which is exactly the "mentioned rather than shown" failure D70 named for the roll.
   */
  it("asks for the cast's hold and not for either stage", () => {
    expect(holdCast({}, nameToken, { hasBoardStage: true })).toBe("--motion-cast-hold");
  });

  it("falls back to 1.5 seconds when no stylesheet has loaded", () => {
    expect(holdCast({}, noStylesheet, { hasBoardStage: true })).toBe(CAST_HOLD_MS);
  });

  /**
   * D108's subtraction, and the reason it is a subtraction and not a fourth token: a card that lands
   * nothing on the board does not wait for a stage that never plays. 1500 minus 560 is 940 ms, which
   * is the roll's own moment within 40 ms.
   */
  it("takes the board stage off for a card that has no board stage", () => {
    expect(holdCast({}, stylesheet, { hasBoardStage: false })).toBe(1500 - 560);
    expect(holdCast({}, noStylesheet, { hasBoardStage: false })).toBe(CAST_HOLD_MS - CAST_BOARD_MS);
  });

  it("waits the whole hold for a card that does land something", () => {
    expect(holdCast({}, stylesheet, { hasBoardStage: true })).toBe(1500);
  });
});

describe("the override every hold has", () => {
  /** `?fast=1`. The sequence is unchanged and only the waiting is gone, which is D111's property. */
  it("is zero under fast, with or without a board stage", () => {
    expect(holdCast({ cast: 0 }, stylesheet, { hasBoardStage: true })).toBe(0);
    expect(holdCast({ cast: 0, castBoard: 0 }, stylesheet, { hasBoardStage: false })).toBe(0);
  });

  /**
   * The case that would otherwise go negative and take the turn with it: a zero hold with a board
   * stage still to subtract. A negative delay is not an error in `setTimeout`, so the symptom would
   * have been a cast that resumed the loop before it had drawn anything.
   */
  it("never goes below zero when the override is smaller than the board stage", () => {
    expect(holdCast({ cast: 100 }, stylesheet, { hasBoardStage: false })).toBe(0);
  });

  it("lets a test set its own hold without a stylesheet", () => {
    expect(holdCast({ cast: 40, castBoard: 10 }, noStylesheet, { hasBoardStage: false })).toBe(30);
  });
});
