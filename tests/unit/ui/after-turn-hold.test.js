/**
 * How long the finished turn stays on screen. Issue #45.
 *
 * ## Why a `ui/` module is unit tested at all
 *
 * `vitest.config.js` says `ui/` is covered by Playwright in a real browser, because a coverage figure
 * for a rendering layer measures how much jQuery ran. `board-geometry.test.js` is the standing
 * exception and states the test for one: a module that touches no DOM, is arithmetic rather than
 * rendering, and whose mistakes are **silent**.
 *
 * `holdAfterTurn` meets all three. It takes a state, a delays object and a function, returns a number,
 * and never sees an element. And a wrong answer here does not throw or look broken: the handover screen
 * simply covers the board before anybody has read the message, which is the exact failure the
 * announcement exists to prevent. An end-to-end test can prove the message appears; proving it is given
 * four seconds rather than 320 milliseconds is a question about a number.
 *
 * The `readToken` argument is what makes it testable without a stylesheet. In the browser it reads
 * `tokens.css` off the board, so the design owns the durations and this file asserts the **choice**
 * between them rather than the values.
 */

import { describe, expect, it } from "vitest";

import { REFUSAL_MIN_MS, holdAfterTurn } from "../../../src/ui/timers.js";

/** Returns the token name instead of a duration, so a test can see which one was asked for. */
const nameToken = (token) => token;

/** Returns the fallback, so a test can see what happens with no stylesheet loaded. */
const noStylesheet = (_token, fallback) => fallback;

const quiet = { refusalReason: null, trapFired: null, nullifiedCard: null };

const trapFired = { kind: "banana-peel", square: 11, owner: 2, player: 0, pawn: 0, squares: 0 };

describe("which duration is chosen", () => {
  it("an ordinary turn waits for the piece to finish moving", () => {
    expect(holdAfterTurn(quiet, {}, nameToken)).toBe("--motion-capture");
  });

  it("a refusal gets the long hold D20 asked for", () => {
    expect(holdAfterTurn({ ...quiet, refusalReason: "move.refused.blocked" }, {}, nameToken)).toBe(
      "--motion-refusal-hold"
    );
  });

  /**
   * The case the whole change is for. A Banana Peel does not move the pawn: it applies a status. So on
   * the ordinary move timer the handover screen covers the board while the only evidence that a turn
   * was taken away is still on screen, and the player never finds out why their pawn cannot move next
   * turn. Same argument D9 made for a refusal, applied to something that happened rather than something
   * that was refused.
   */
  it("a trap that went off gets the long hold too", () => {
    expect(holdAfterTurn({ ...quiet, trapFired }, {}, nameToken)).toBe("--motion-refusal-hold");
  });

  /** A card an aura cancelled is the same situation: the board shows nothing, so the words have to. */
  it("a card an aura cancelled gets the long hold", () => {
    expect(holdAfterTurn({ ...quiet, nullifiedCard: "action-yeet" }, {}, nameToken)).toBe(
      "--motion-refusal-hold"
    );
  });

  /**
   * A refusal outranks a report, and the order is deliberate rather than incidental: a refusal is about
   * what the player may do next, a report is about what already happened. In practice the two are
   * mutually exclusive, because a refusal means no move happened and a trap only fires on a move that
   * did, so this pins the intent rather than a situation the game reaches.
   */
  it("a refusal wins when somehow both are set", () => {
    const both = { refusalReason: "move.refused.blocked", trapFired, nullifiedCard: null };

    expect(holdAfterTurn(both, { afterRefusal: 1234, afterTrap: 99 }, nameToken)).toBe(1234);
  });
});

describe("what a test harness and a missing stylesheet get", () => {
  /** Every branch is overridable, so an end-to-end run does not spend four seconds per refusal. */
  it("an explicit delay overrides each branch", () => {
    const delays = { afterMove: 10, afterRefusal: 20, afterTrap: 30 };

    expect(holdAfterTurn(quiet, delays, nameToken)).toBe(10);
    expect(holdAfterTurn({ ...quiet, refusalReason: "x" }, delays, nameToken)).toBe(20);
    expect(holdAfterTurn({ ...quiet, trapFired }, delays, nameToken)).toBe(30);
  });

  /**
   * `afterTrap` is a separate key from `afterRefusal` even though both resolve to the same token, so a
   * spec can collapse the move wait and still leave the announcement up, or the other way round.
   */
  it("a trap hold can be set without touching the refusal hold", () => {
    expect(holdAfterTurn({ ...quiet, trapFired }, { afterRefusal: 20 }, nameToken)).toBe(
      "--motion-refusal-hold"
    );
  });

  it("falls back to the four second minimum with no stylesheet", () => {
    expect(holdAfterTurn({ ...quiet, trapFired }, {}, noStylesheet)).toBe(REFUSAL_MIN_MS);
    expect(holdAfterTurn({ ...quiet, refusalReason: "x" }, {}, noStylesheet)).toBe(REFUSAL_MIN_MS);
  });

  it("falls back to the capture duration for an ordinary turn", () => {
    expect(holdAfterTurn(quiet, {}, noStylesheet)).toBe(320);
  });
});
