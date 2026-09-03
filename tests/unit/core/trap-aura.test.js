/**
 * It's Not That Deep's nullification aura. Issue #45, requirement FR-30.
 *
 * A file of its own because the aura is a **query over the trap list** rather than something a card
 * does, which makes it a different kind of thing from everything in `cards/`. It is also the first rule
 * in the project measured as a **radius**: every other rule is about one square, one pawn or one walk.
 *
 * `tests/unit/state/trap-aura-play.test.js` covers the other half, that a card play actually does
 * nothing when the aura covers it.
 */

import { describe, expect, it } from "vitest";

import { TRACK_LENGTH } from "../../../src/core/board.js";
import { ringDistance } from "../../../src/core/path.js";
import { NULLIFY_RADIUS, nullifyingTrap, squareActedOn } from "../../../src/core/trap-rules.js";
import { TRAP_KIND } from "../../../src/core/traps.js";
import { pawnsAt } from "../../helpers/fixtures.js";

const trap = (kind, square, owner = 2) => ({ kind, square, owner, until: null });

describe("ringDistance measures the shorter way round", () => {
  it("is the plain difference away from the seam", () => {
    expect(ringDistance(17, 20)).toBe(3);
    expect(ringDistance(20, 17)).toBe(3);
    expect(ringDistance(17, 17)).toBe(0);
  });

  /**
   * The case that makes the function worth having. Subtracting the numbers would call square 39 and
   * square 2 thirty-seven apart, so the aura would be the wrong shape at exactly one place on the
   * board: the sort of bug that appears once in fifty matches and is never reproduced.
   */
  it("wraps across square 0", () => {
    expect(ringDistance(39, 2)).toBe(3);
    expect(ringDistance(2, 39)).toBe(3);
    expect(ringDistance(0, 39)).toBe(1);
  });

  it("never exceeds half the ring, because past that the other way is shorter", () => {
    for (let a = 0; a < TRACK_LENGTH; a += 1) {
      for (let b = 0; b < TRACK_LENGTH; b += 1) {
        expect(ringDistance(a, b)).toBeLessThanOrEqual(TRACK_LENGTH / 2);
      }
    }
  });
});

describe("which square a card is measured against", () => {
  it("takes the square a card named", () => {
    expect(squareActedOn(pawnsAt(4), { square: 17 })).toBe(17);
  });

  /** Seat 2's `r = 33` is absolute 12. Yeet names a pawn, so the aura measures where that pawn stands. */
  it("takes the square a named pawn is standing on", () => {
    const pawns = pawnsAt(4, { "2.0": 33 });

    expect(squareActedOn(pawns, { pawn: { player: 2, pawn: 0 } })).toBe(12);
  });

  it("prefers a named square when a card names both", () => {
    const pawns = pawnsAt(4, { "2.0": 33 });

    expect(squareActedOn(pawns, { square: 17, pawn: { player: 2, pawn: 0 } })).toBe(17);
  });

  /**
   * `null` is a real answer and not a failure. 67 is an offensive card that names nothing on the board:
   * it is a gamble on your own roll, so there is no "where" for an aura to compare itself to, and it can
   * never be nullified.
   */
  it("answers null for a card that names nothing on the board", () => {
    expect(squareActedOn(pawnsAt(4), {})).toBeNull();
  });

  /** Neither a start area nor a house is a shared square, so no trap can be near one. */
  it("answers null for a pawn that is not on the shared track", () => {
    const pawns = pawnsAt(4, { "2.0": 42 });

    expect(squareActedOn(pawns, { pawn: { player: 2, pawn: 0 } })).toBeNull();
    expect(squareActedOn(pawnsAt(4), { pawn: { player: 2, pawn: 0 } })).toBeNull();
  });

  it("answers null for a pawn that does not exist", () => {
    expect(squareActedOn(pawnsAt(4), { pawn: { player: 0, pawn: 99 } })).toBeNull();
  });
});

describe("the seven squares an It's Not That Deep protects", () => {
  const laid = trap(TRAP_KIND.NOT_THAT_DEEP, 17);

  it("covers its own square and three either way", () => {
    for (let square = 14; square <= 20; square += 1) {
      expect(nullifyingTrap([laid], square, 0)).toBe(laid);
    }
  });

  it("stops at the fourth square in both directions", () => {
    expect(nullifyingTrap([laid], 13, 0)).toBeNull();
    expect(nullifyingTrap([laid], 21, 0)).toBeNull();
  });

  it("is exactly the radius the constant names", () => {
    expect(nullifyingTrap([laid], 17 + NULLIFY_RADIUS, 0)).toBe(laid);
    expect(nullifyingTrap([laid], 17 + NULLIFY_RADIUS + 1, 0)).toBeNull();
  });

  /** The wrap, through the aura rather than through `ringDistance` alone. */
  it("wraps across square 0", () => {
    const atSeam = trap(TRAP_KIND.NOT_THAT_DEEP, 39);

    expect(nullifyingTrap([atSeam], 2, 0)).toBe(atSeam);
    expect(nullifyingTrap([atSeam], 36, 0)).toBe(atSeam);
    expect(nullifyingTrap([atSeam], 3, 0)).toBeNull();
  });
});

describe("what does not project an aura", () => {
  /** One trap kind has this rule. A Banana Peel does nothing at all until it is stepped on. */
  it("no other trap kind, and no blocker", () => {
    for (const kind of [TRAP_KIND.BANANA_PEEL, TRAP_KIND.OIL_SPILL, TRAP_KIND.BIG_AH_ROCK]) {
      expect(nullifyingTrap([trap(kind, 17)], 17, 0)).toBeNull();
    }
  });

  /**
   * Mirrors `firstTrapOnPath`'s existing exemption, whose comment carries the reason: a card that
   * punishes the player who played it is a card nobody plays. Without this, laying one of these would
   * make three of your own cards unusable in the region you had just claimed.
   */
  it("not its own owner's cards", () => {
    const mine = trap(TRAP_KIND.NOT_THAT_DEEP, 17, 0);

    expect(nullifyingTrap([mine], 17, 0)).toBeNull();
    expect(nullifyingTrap([mine], 17, 1)).toBe(mine);
  });

  it("nothing at all on an empty board", () => {
    expect(nullifyingTrap([], 17, 0)).toBeNull();
  });
});

describe("two auras at once", () => {
  /**
   * Overlapping auras are the ordinary case once two of these are on the board, and the answer only has
   * to be *an* aura covering the square, not a particular one. Asserted as "one of the two" rather than
   * pinning the list order, which is not a rule.
   */
  it("answers one of them for a square both cover", () => {
    const near = trap(TRAP_KIND.NOT_THAT_DEEP, 17);
    const far = trap(TRAP_KIND.NOT_THAT_DEEP, 19);

    expect([near, far]).toContain(nullifyingTrap([near, far], 18, 0));
  });

  /** A square only one of them covers is still covered. */
  it("still answers when only the far one reaches", () => {
    const mine = trap(TRAP_KIND.NOT_THAT_DEEP, 17, 0);
    const theirs = trap(TRAP_KIND.NOT_THAT_DEEP, 19, 2);

    expect(nullifyingTrap([mine, theirs], 20, 0)).toBe(theirs);
  });
});
