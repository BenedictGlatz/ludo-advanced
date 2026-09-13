/**
 * Objects that sit on a square. Issue #38, requirements FR-28 and FR-30.
 *
 * The interesting case is the one exclusion: a trap does not fire under its owner's own pawn. The
 * second exclusion, a blocker in the same list, left with issue #90 when Big Ah Rock became a status on
 * a pawn.
 */

import { describe, expect, it } from "vitest";

import {
  TRAP_KIND,
  expireTraps,
  firstTrapOnPath,
  placeTrap,
  removeTrap,
  trapAt,
} from "../../../src/core/traps.js";

const peel = (square, owner = 0) => ({
  kind: TRAP_KIND.BANANA_PEEL,
  square,
  owner,
  until: null,
});

const spill = (square, owner = 0, until = null) => ({
  kind: TRAP_KIND.OIL_SPILL,
  square,
  owner,
  until,
});

describe("the list holds one kind of thing (issue #90)", () => {
  it("names three trap kinds and no blocker", () => {
    expect(Object.values(TRAP_KIND).sort()).toEqual(["banana-peel", "not-that-deep", "oil-spill"]);
  });
});

describe("placeTrap, trapAt and removeTrap", () => {
  it("puts one object on a square and finds it again", () => {
    const traps = placeTrap([], peel(17));

    expect(trapAt(traps, 17)).toMatchObject({ kind: TRAP_KIND.BANANA_PEEL, square: 17 });
    expect(trapAt(traps, 18)).toBeNull();
  });

  /**
   * One object per square, enforced here so nothing downstream has to ask "which of the two".
   *
   * Replacing rather than refusing is deliberate: the refusal belongs one layer up, where `state/`
   * will not let a player target an occupied square in the first place.
   */
  it("replaces whatever was on that square rather than stacking", () => {
    const traps = placeTrap(placeTrap([], peel(17)), spill(17));

    expect(traps).toHaveLength(1);
    expect(trapAt(traps, 17).kind).toBe(TRAP_KIND.OIL_SPILL);
  });

  it("removes the object on one square and leaves the others", () => {
    const traps = placeTrap(placeTrap([], peel(17)), peel(20));

    expect(removeTrap(traps, 17)).toHaveLength(1);
    expect(trapAt(removeTrap(traps, 17), 20)).not.toBeNull();
  });
});

describe("firstTrapOnPath", () => {
  const mover = { player: 1, pawn: 0 };

  it("fires the nearest trap on the walk, not the furthest", () => {
    const traps = [peel(20), peel(17)];

    expect(firstTrapOnPath(traps, [16, 17, 18, 19, 20], mover).square).toBe(17);
  });

  it("returns null when nothing on the walk is a trap", () => {
    expect(firstTrapOnPath([peel(30)], [16, 17, 18], mover)).toBeNull();
  });

  /**
   * A card that punishes the player who played it is a card nobody plays. This is the one rule in the
   * module that is a game decision rather than bookkeeping.
   */
  it("does not fire a trap under a pawn of the player who placed it", () => {
    const traps = [peel(17, 1)];

    expect(firstTrapOnPath(traps, [16, 17, 18], mover)).toBeNull();
    expect(firstTrapOnPath(traps, [16, 17, 18], { player: 2, pawn: 0 })).not.toBeNull();
  });
});

describe("expireTraps", () => {
  /** No card writes a deadline since issue #90; the filter stays for the next timed object. */
  it("drops an object whose deadline has passed", () => {
    expect(expireTraps([spill(17, 0, 10)], 10)).toHaveLength(0);
    expect(expireTraps([spill(17, 0, 10)], 9)).toHaveLength(1);
  });

  it("keeps a trap with no deadline for as long as it takes", () => {
    expect(expireTraps([peel(17)], 9999)).toHaveLength(1);
  });
});
