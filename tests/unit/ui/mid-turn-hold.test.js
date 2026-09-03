/**
 * How long a trap fired by a card stays on screen before the turn carries on. Issue #45, D60.
 *
 * ## Why this is a sibling of `after-turn-hold.test.js` rather than more cases in it
 *
 * The seam is the same one `timers.js` draws between its two functions: `holdAfterTurn` is asked when
 * the turn has **ended** and the handover screen is about to cover the board, `holdMidTurn` is asked in
 * the middle of a turn that is carrying on. Two different events, two different tokens, two different
 * numbers, and one shared reason for existing.
 *
 * That reason is in `after-turn-hold.test.js`'s header and it applies here more strongly, so it is not
 * repeated in full: a wrong answer does not throw and does not look broken. **The whole of D60 is a wait
 * that nothing on screen reports.** If this returns zero when it should return two seconds, the game
 * behaves exactly as it did before the decision was taken, and the only symptom is that a fast player
 * sometimes loses a message they were owed. No end-to-end test can catch that, because the end-to-end
 * suite runs with the hold collapsed to nothing on purpose.
 *
 * `readToken` is what makes it testable with no stylesheet. In the browser it reads `tokens.css` off the
 * board, so this file asserts the **choice** of token and never a duration.
 */

import { describe, expect, it } from "vitest";

import { TRAP_HOLD_MS, announcement, holdMidTurn } from "../../../src/ui/timers.js";

/** Returns the token name instead of a duration, so a test can see which one was asked for. */
const nameToken = (token) => token;

/** Returns the fallback, so a test can see what happens with no stylesheet loaded. */
const noStylesheet = (_token, fallback) => fallback;

const quiet = { refusalReason: null, trapFired: null, nullifiedCard: null };

const trapFired = { kind: "banana-peel", square: 11, owner: 2, player: 0, pawn: 0, squares: 0 };

describe("whether the turn is held at all", () => {
  /**
   * The case that keeps every existing end-to-end spec's timing unchanged, and therefore the most
   * important one in the file. Almost every card announces nothing, so almost every card play has to
   * carry straight on exactly as it did before D60 was answered.
   */
  it("carries straight on when a card announced nothing", () => {
    expect(holdMidTurn(quiet, {}, nameToken)).toBe(0);
  });

  it("holds for the trap token when a trap went off", () => {
    expect(holdMidTurn({ ...quiet, trapFired }, {}, nameToken)).toBe("--motion-trap-hold");
  });

  /**
   * The aura case, and it is the one where the board shows literally nothing. A nullified card is spent
   * and does nothing, so the strip is the only evidence it was played at all.
   */
  it("holds for the trap token when an aura cancelled a card", () => {
    const state = { ...quiet, nullifiedCard: "action-yeet" };

    expect(holdMidTurn(state, {}, nameToken)).toBe("--motion-trap-hold");
  });

  /**
   * **The asymmetry, pinned.** `holdAfterTurn` holds for a refusal and this deliberately does not, which
   * is the one place the two functions differ in kind rather than in duration. A refusal mid-turn is not
   * an announcement: the player asked for something and was told no, and they still hold the controls.
   *
   * This is the case most likely to be broken by somebody making the two functions symmetrical, and it
   * would be broken silently: the game would pause two seconds after every refused click.
   */
  it("does not hold for a refusal, which is not an announcement", () => {
    const state = { ...quiet, refusalReason: "move.refused.stunned" };

    expect(holdMidTurn(state, {}, nameToken)).toBe(0);
  });
});

describe("what a test harness and a missing stylesheet get", () => {
  /**
   * `?fast=1` sets exactly zero, and `delays.afterTrapCard ?? ...` is what makes that work where `||`
   * would treat it as absent and fall through to the token. One line, and getting it wrong would put a
   * silent two-second wait into every end-to-end run that fires a trap from a card.
   */
  it("honours an override of zero rather than treating it as absent", () => {
    expect(holdMidTurn({ ...quiet, trapFired }, { afterTrapCard: 0 }, nameToken)).toBe(0);
  });

  it("takes an override in place of the token", () => {
    expect(holdMidTurn({ ...quiet, trapFired }, { afterTrapCard: 75 }, nameToken)).toBe(75);
  });

  /**
   * The two waits are separately collapsible, which is the whole argument for `afterTrapCard` being a
   * fourth key rather than a reuse of `afterTrap`. `afterTrap` belongs to the end of the turn and reads
   * a different token, so neither of the other two keys may reach this branch.
   */
  it("ignores the keys that belong to the other hold", () => {
    const state = { ...quiet, trapFired };

    expect(holdMidTurn(state, { afterTrap: 9 }, nameToken)).toBe("--motion-trap-hold");
    expect(holdMidTurn(state, { afterRefusal: 9 }, nameToken)).toBe("--motion-trap-hold");
    expect(holdMidTurn(state, { afterMove: 9 }, nameToken)).toBe("--motion-trap-hold");
  });

  it("falls back to two seconds when no stylesheet has loaded", () => {
    expect(holdMidTurn({ ...quiet, trapFired }, {}, noStylesheet)).toBe(TRAP_HOLD_MS);
  });
});

describe("what the strip is announcing", () => {
  it("is nothing on a quiet turn", () => {
    expect(announcement(quiet)).toBeNull();
  });

  /**
   * **It returns the value and not a boolean, and `card-controls.js` depends on that.** The hold is only
   * given once per announcement, and the marker that arranges it compares two calls by identity. A copy
   * would compare unequal every time and hold the same message again on every pass.
   */
  it("returns the trap itself, so two calls can be compared by identity", () => {
    const state = { ...quiet, trapFired };

    expect(announcement(state)).toBe(trapFired);
    expect(announcement(state)).toBe(announcement(state));
  });

  it("returns the cancelled card when that is what happened", () => {
    expect(announcement({ ...quiet, nullifiedCard: "action-yeet" })).toBe("action-yeet");
  });

  /**
   * A trap outranks a cancelled card, matching the order `move-hints.js` prints them in. The two cannot
   * both be true of one event, so this pins the tie-break rather than describing a real turn.
   */
  it("prefers the trap when somehow both are set", () => {
    const state = { ...quiet, trapFired, nullifiedCard: "action-yeet" };

    expect(announcement(state)).toBe(trapFired);
  });
});
