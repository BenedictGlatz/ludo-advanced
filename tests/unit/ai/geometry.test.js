/**
 * Who is standing where, relative to whom. Issue #82, split out of `threat.test.js` with the module.
 *
 * These are the two things about the geometry that are easy to get wrong and impossible to see from a
 * match:
 *
 * - **The ring wraps.** A pawn on square 1 with an attacker on square 39 is two squares from being
 *   captured, not thirty-eight. Every trap card and both rock cards aim relative to an opponent, so a
 *   wrong wrap would send them all to the wrong end of the board.
 * - **Behind is the same direction for all four seats.** `absoluteSquare` grows with `r` for every
 *   seat, which is what makes "behind" one subtraction rather than four cases. A test with two seats
 *   in it is what proves that rather than assuming it.
 */

import { describe, expect, it } from "vitest";

import {
  enemiesBehind,
  friendsBehind,
  onTrack,
  pawnsAhead,
  pawnsBehind,
  squareAhead,
} from "../../../src/ai/geometry.js";
import { pawnsAt } from "../../helpers/fixtures.js";

/** The pawn of `seat` that a case placed on the track. */
function pawnOf(pawns, player, pawn) {
  return pawns.find((entry) => entry.player === player && entry.pawn === pawn);
}

describe("who is standing behind a square", () => {
  /**
   * Seat 0's `r = 1` is absolute square 0, and seat 3's `r = 32` is `(30 + 31) mod 40 = 21`. Behind
   * square 0 by two is square 38, which is seat 3's `r = 9`. Nothing here works without the wrap.
   */
  it("counts backwards round the ring, not down the number line", () => {
    const pawns = pawnsAt(4, { "0.0": 1, "3.0": 9 });
    const found = pawnsBehind(pawns, 0, 6);

    expect(found).toHaveLength(1);
    expect(found[0].player).toBe(3);
    expect(found[0].distance).toBe(2);
  });

  it("tells my own pawns from everybody else's", () => {
    // Seat 0 on squares 4 and 6; seat 1's entry is square 10, so its r = 1 is square 10.
    const pawns = pawnsAt(4, { "0.0": 7, "0.1": 5, "1.0": 1 });

    expect(enemiesBehind(pawns, 10, 6, 1).map((pawn) => pawn.distance)).toEqual([4, 6]);
    expect(friendsBehind(pawns, 10, 6, 1)).toEqual([]);
    expect(friendsBehind(pawns, 10, 6, 0).map((pawn) => pawn.distance)).toEqual([4, 6]);
  });

  it("looks only as far back as it is asked to", () => {
    const pawns = pawnsAt(4, { "0.0": 7, "1.0": 1 });

    expect(pawnsBehind(pawns, 10, 2)).toEqual([]);
    expect(pawnsBehind(pawns, 10, 4)).toHaveLength(1);
  });

  it("ignores pawns in a yard or a house, which are on no shared square", () => {
    const pawns = pawnsAt(4, { "0.0": 44, "1.0": 1 });

    expect(pawnsBehind(pawns, 10, 20).every((pawn) => pawn.player === 1)).toBe(true);
  });

  /**
   * The order is a contract and not a convenience: `values-pawns.js` takes the first entry as "the
   * nearest enemy" when it prices Big Ah Rock's knockback, and the rewrite of this function in the bot
   * tactics plan swapped a loop over distances for a loop over pawns, which is exactly the change that
   * could have lost the ordering without any test noticing.
   */
  it("answers nearest first", () => {
    const pawns = pawnsAt(4, { "0.0": 7, "0.1": 3, "1.0": 1 });

    expect(pawnsBehind(pawns, 10, 8).map((pawn) => pawn.distance)).toEqual([4, 8]);
  });
});

describe("who is standing in front of a square", () => {
  /** The mirror of `pawnsBehind`, and the term the move scorer's opportunity bonus is made of. */
  it("counts forwards round the ring", () => {
    // Seat 1's r = 1 is square 10. Seat 0's r = 13 is square 12, two in front of it.
    const pawns = pawnsAt(4, { "1.0": 1, "0.0": 13 });
    const found = pawnsAhead(pawns, 10, 6);

    expect(found).toHaveLength(1);
    expect(found[0].player).toBe(0);
    expect(found[0].distance).toBe(2);
  });

  it("does not count the pawn standing on the square itself", () => {
    const pawns = pawnsAt(4, { "1.0": 1 });

    expect(pawnsAhead(pawns, 10, 20)).toEqual([]);
  });
});

describe("where a card is aimed", () => {
  it("finds the square in front of a pawn, round the ring", () => {
    // Seat 1's r = 30 is square 39, and it still has ten squares of ring to walk, so one in front of
    // it is square 0 rather than square 40. That wrap is the whole of this function.
    const pawns = pawnsAt(4, { "0.0": 5, "1.0": 30 });

    expect(squareAhead(pawnOf(pawns, 1, 0), 1)).toBe(0);
    expect(squareAhead(pawnOf(pawns, 1, 0), 2)).toBe(1);
    expect(squareAhead(pawnOf(pawns, 0, 0), 1)).toBe(5);
  });

  /**
   * `r = 40` is the turn-off square: that pawn's next step is into its own house, so there is no
   * square in front of it on the shared ring at all. A trap laid there would never be walked into by
   * this pawn, which is why the answer is `null` rather than square 0.
   */
  it("has nothing in front of a pawn about to turn into its house", () => {
    const pawns = pawnsAt(4, { "0.0": 40 });

    expect(squareAhead(pawnOf(pawns, 0, 0), 1)).toBe(null);
  });

  it("knows which pawns are on the shared track at all", () => {
    const pawns = pawnsAt(4, { "0.0": 20, "0.1": 41 });

    expect(onTrack(pawnOf(pawns, 0, 0))).toBe(true);
    expect(onTrack(pawnOf(pawns, 0, 1))).toBe(false);
    expect(onTrack(pawnOf(pawns, 0, 2))).toBe(false);
  });
});
