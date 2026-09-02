/**
 * Where an object may be put down. Issue #45, requirement FR-30.
 *
 * The rules, tested against the list; `tests/unit/state/trap-placement.test.js` tests that a card play
 * is actually refused. Split that way for the reason `notes/05` records for the status cards: one file
 * asserts the rule, the other asserts that the rule is consulted, and a failure says which.
 */

import { describe, expect, it } from "vitest";

import { TRACK_LENGTH } from "../../../src/core/board.js";
import { EXCLUDED_SQUARES } from "../../../src/core/skill-squares.js";
import { PLACEMENT, placeableSquares, trapPlacementRefusal } from "../../../src/core/trap-rules.js";
import { TRAP_KIND } from "../../../src/core/traps.js";
import { pawnsAt } from "../../helpers/fixtures.js";

const trap = (kind, square) => ({ kind, square, owner: 2, until: null });

/** A square no rule objects to, for the cases that need a clean one. Absolute 5 is seat 0's `r = 6`. */
const FREE = 5;

describe("the three reasons a square cannot take an object", () => {
  it("accepts an ordinary empty square", () => {
    expect(trapPlacementRefusal(pawnsAt(4), [], FREE)).toBeNull();
  });

  /**
   * A square holds one object or none, which is what makes "what is on square 17" answerable. Refusing
   * here is also what stops a player spending a card to delete an opponent's trap, which no card in the
   * set is supposed to be able to do.
   */
  it("refuses a square that already holds a trap", () => {
    const traps = [trap(TRAP_KIND.BANANA_PEEL, FREE)];

    expect(trapPlacementRefusal(pawnsAt(4), traps, FREE)).toBe(PLACEMENT.OCCUPIED);
  });

  it("refuses a square that holds a blocker, which is in the same list", () => {
    const traps = [trap(TRAP_KIND.BIG_AH_ROCK, FREE)];

    expect(trapPlacementRefusal(pawnsAt(4), traps, FREE)).toBe(PLACEMENT.OCCUPIED);
  });

  /**
   * A trap only fires when something **enters** its square, so one laid under a pawn already standing
   * there does nothing until that pawn leaves and comes all the way back round the ring. It looks like a
   * play and is almost always a wasted card.
   *
   * Seat 0's `r = 6` is absolute 5.
   */
  it("refuses a square a pawn is standing on", () => {
    const pawns = pawnsAt(4, { "0.0": 6 });

    expect(trapPlacementRefusal(pawns, [], FREE)).toBe(PLACEMENT.PAWN);
  });

  /** Any pawn, not just an opponent's: a trap under your own pawn is just as inert. */
  it("refuses a square any player's pawn is standing on", () => {
    const pawns = pawnsAt(4, { "2.0": 26 });

    expect(trapPlacementRefusal(pawns, [], 5)).toBe(PLACEMENT.PAWN);
  });

  /**
   * Reused from the skill squares, whose comment already carries the reason: the entry square is the
   * busiest square a player has, because every pawn of theirs passes over it and starts on it.
   */
  it("refuses all four entry squares", () => {
    for (const square of EXCLUDED_SQUARES) {
      expect(trapPlacementRefusal(pawnsAt(4), [], square)).toBe(PLACEMENT.ENTRY);
    }
  });

  /**
   * The order of the three checks is fixed rather than incidental, and this pins it: a square that is
   * both occupied and under a pawn reports the object, because that is the fact the player can see.
   */
  it("reports the object first when a square breaks two rules at once", () => {
    const pawns = pawnsAt(4, { "0.0": 6 });
    const traps = [trap(TRAP_KIND.BANANA_PEEL, FREE)];

    expect(trapPlacementRefusal(pawns, traps, FREE)).toBe(PLACEMENT.OCCUPIED);
  });
});

describe("the list the target picker is given", () => {
  /** An empty board offers everything except the four entry squares. */
  it("offers 36 of the 40 squares on an empty board", () => {
    const squares = placeableSquares(pawnsAt(4), []);

    expect(squares).toHaveLength(TRACK_LENGTH - EXCLUDED_SQUARES.length);
    for (const excluded of EXCLUDED_SQUARES) {
      expect(squares).not.toContain(excluded);
    }
  });

  /**
   * The list and the verdict must never disagree, because the picker offers the first and `checkTarget`
   * applies the second. Derived from the same function so they cannot, and checked across all forty
   * squares so that a future short cut in either one fails here.
   */
  it("agrees with the refusal on every one of the forty squares", () => {
    const pawns = pawnsAt(4, { "0.0": 6, "2.0": 15 });
    const traps = [trap(TRAP_KIND.BANANA_PEEL, 17), trap(TRAP_KIND.BIG_AH_ROCK, 23)];
    const offered = placeableSquares(pawns, traps);

    for (let square = 0; square < TRACK_LENGTH; square += 1) {
      const allowed = trapPlacementRefusal(pawns, traps, square) === null;

      expect(offered.includes(square)).toBe(allowed);
    }
  });

  it("shrinks as the board fills up", () => {
    const traps = [trap(TRAP_KIND.BANANA_PEEL, 17), trap(TRAP_KIND.OIL_SPILL, 18)];
    const pawns = pawnsAt(4, { "0.0": 6 });
    const squares = placeableSquares(pawns, traps);

    expect(squares).not.toContain(17);
    expect(squares).not.toContain(18);
    expect(squares).not.toContain(5);
    expect(squares).toContain(6);
  });
});
