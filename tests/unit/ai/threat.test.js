/**
 * How much danger a pawn is in. Issue #82.
 *
 * `move-scoring.js` called danger "deliberately missing" and said the reason: a wrong model of it
 * plays worse than none. `threat.js` builds the crude version the card values need, and this file
 * pins the two things about it that are easy to get wrong and impossible to see from a match:
 *
 * - **The ring wraps.** A pawn on square 1 with an attacker on square 39 is two squares from being
 *   captured, not thirty-eight. Every one of the four trap cards and both rock cards aim relative to
 *   an opponent, so a wrong wrap would send them all to the wrong end of the board.
 * - **Behind is the same direction for all four seats.** `absoluteSquare` grows with `r` for every
 *   seat, which is what makes "behind" one subtraction rather than four cases. A test with two seats
 *   in it is what proves that rather than assuming it.
 */

import { describe, expect, it } from "vitest";

import { SCORE } from "../../../src/ai/move-scoring.js";
import {
  enemiesBehind,
  friendsBehind,
  oddsOfHit,
  onTrack,
  pawnWorth,
  pawnsBehind,
  squareAhead,
  threatOn,
} from "../../../src/ai/threat.js";
import { pawnsAt } from "../../helpers/fixtures.js";

/** The pawn of `seat` that a case placed on the track. */
function pawnOf(pawns, player, pawn) {
  return pawns.find((entry) => entry.player === player && entry.pawn === pawn);
}

describe("oddsOfHit: the smallest die that reaches", () => {
  it("is one in six up to six squares", () => {
    for (const distance of [1, 2, 3, 4, 5, 6]) {
      expect(oddsOfHit(distance)).toBeCloseTo(1 / 6, 12);
    }
  });

  it("steps down at each die size rather than tailing off smoothly", () => {
    expect(oddsOfHit(7)).toBeCloseTo(1 / 12, 12);
    expect(oddsOfHit(12)).toBeCloseTo(1 / 12, 12);
    expect(oddsOfHit(13)).toBeCloseTo(1 / 20, 12);
    expect(oddsOfHit(20)).toBeCloseTo(1 / 20, 12);
  });

  /** Past 20 nothing in the pool can reach, and 0 or less is not a distance at all. */
  it("is nothing past the biggest die, and nothing for a non-distance", () => {
    expect(oddsOfHit(21)).toBe(0);
    expect(oddsOfHit(0)).toBe(0);
    expect(oddsOfHit(-3)).toBe(0);
    expect(oddsOfHit(2.5)).toBe(0);
  });
});

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
});

describe("threatOn: the chance of losing this pawn", () => {
  /**
   * Two attackers at three and eight squares back. Three is inside a D6 and eight needs a D12, so the
   * two are worth different amounts, which is the whole reason the odds step down by die size.
   */
  it("adds up every attacker that could reach", () => {
    // Seat 0's r = 11 is square 10. Seat 1's r = 38 is square 7, three behind it; seat 3's r = 13 is
    // square 2, eight behind it. So one attacker needs a 3 on any die and the other an 8 on a D12.
    const pawns = pawnsAt(4, { "0.0": 11, "1.0": 38, "3.0": 13 });

    expect(threatOn(pawns, pawnOf(pawns, 0, 0))).toBeCloseTo(1 / 6 + 1 / 12, 12);
  });

  it("is nothing for a pawn nobody is behind", () => {
    const pawns = pawnsAt(4, { "0.0": 11 });

    expect(threatOn(pawns, pawnOf(pawns, 0, 0))).toBe(0);
  });

  it("is nothing for a pawn in the yard or safe in its house", () => {
    const pawns = pawnsAt(4, { "0.0": 44, "1.0": 30 });

    expect(threatOn(pawns, pawnOf(pawns, 0, 0))).toBe(0);
    expect(threatOn(pawns, pawnOf(pawns, 0, 1))).toBe(0);
  });

  /** Twice the attackers is twice the threat, which is the property the card values lean on. */
  it("grows with the number of attackers", () => {
    const one = pawnsAt(4, { "0.0": 11, "1.0": 40 });
    const two = pawnsAt(4, { "0.0": 11, "1.0": 40, "3.0": 20 });

    expect(threatOn(two, pawnOf(two, 0, 0))).toBeGreaterThan(threatOn(one, pawnOf(one, 0, 0)));
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

describe("pawnWorth: what losing a pawn costs", () => {
  /** The walk **and** the way out of the yard, in the same currency as every other value. */
  it("is the steps walked plus the cost of leaving the yard again", () => {
    expect(pawnWorth({ player: 0, pawn: 0, r: 17 })).toBe(17 + SCORE.LEAVE_START);
    expect(pawnWorth({ player: 0, pawn: 0, r: 0 })).toBe(SCORE.LEAVE_START);
  });
});
