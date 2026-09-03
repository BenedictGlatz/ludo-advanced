/**
 * Objects that sit on a square. Issue #38, requirements FR-28 and FR-30.
 *
 * The interesting cases are the two exclusions: a trap does not fire under its owner's own pawn, and a
 * blocker is not a trap even though it is in the same list.
 */

import { describe, expect, it } from "vitest";

import {
  BLOCKERS,
  TRAP_KIND,
  expireTraps,
  firstTrapOnPath,
  isBlocker,
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

const rock = (square, owner = 0, until = 20) => ({
  kind: TRAP_KIND.BIG_AH_ROCK,
  square,
  owner,
  until,
});

describe("the two behaviours in one list", () => {
  it("marks the blockers and nothing else", () => {
    expect(isBlocker(TRAP_KIND.BIG_AH_ROCK)).toBe(true);
    expect(isBlocker(TRAP_KIND.BANANA_PEEL)).toBe(false);
    expect(isBlocker(TRAP_KIND.OIL_SPILL)).toBe(false);
    expect(BLOCKERS).toEqual([TRAP_KIND.BIG_AH_ROCK]);
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
    const traps = placeTrap(placeTrap([], peel(17)), rock(17));

    expect(traps).toHaveLength(1);
    expect(trapAt(traps, 17).kind).toBe(TRAP_KIND.BIG_AH_ROCK);
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

  /**
   * A blocker is in the same list and must not be treated as a trap. Nothing should ever walk over one
   * anyway, because `blockedSquares` refuses the move first, but a rule that relies on another rule
   * having run is a rule that breaks when the order changes.
   */
  it("skips a blocker, which stops a pawn rather than firing at it", () => {
    expect(firstTrapOnPath([rock(17, 2)], [16, 17, 18], mover)).toBeNull();
  });
});

describe("expireTraps", () => {
  it("drops a blocker whose deadline has passed", () => {
    expect(expireTraps([rock(17, 0, 10)], 10)).toHaveLength(0);
    expect(expireTraps([rock(17, 0, 10)], 9)).toHaveLength(1);
  });

  it("keeps a trap with no deadline for as long as it takes", () => {
    expect(expireTraps([peel(17)], 9999)).toHaveLength(1);
  });
});
