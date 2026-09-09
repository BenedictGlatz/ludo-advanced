/**
 * How much danger a pawn is in. Issue #82, rebuilt by the bot tactics plan's phase 1.
 *
 * The geometry underneath moved to `geometry.test.js` and the probabilities to `hit-odds.test.js`.
 * What is left here is the combination, and the three things phase 1 changed are exactly the three
 * things worth pinning:
 *
 * - **It is a probability, not a sum.** Two attackers are worse than one and never more than certain.
 * - **A yard is an attacker.** A pawn parked on somebody's entry square is in real danger and the old
 *   model saw none at all.
 * - **Armour is worth what it says.** Built Different takes the number to zero, or the bot would buy
 *   the same insurance twice.
 */

import { describe, expect, it } from "vitest";

import { entrySquare } from "../../../src/core/board.js";
import { EMPTY_BOARD } from "../../../src/core/move-rules.js";
import { STATUS } from "../../../src/core/statuses.js";
import { ENTRY_ODDS, oddsOfHit } from "../../../src/ai/hit-odds.js";
import { threatOn } from "../../../src/ai/threat.js";
import { pawnsAt } from "../../helpers/fixtures.js";

/** The pawn of `seat` that a case placed on the track. */
function pawnOf(pawns, player, pawn) {
  return pawns.find((entry) => entry.player === player && entry.pawn === pawn);
}

/** A board carrying one Built Different. */
function armoured(player, pawn) {
  return { statuses: [{ kind: STATUS.ARMOURED, player, pawn, until: null }], traps: [] };
}

describe("threatOn: the chance of losing this pawn", () => {
  /**
   * Two attackers at three and eight squares back, combined the way "at least one of them" is combined
   * and **not** by adding. Seat 0's `r = 12` is square 11, seat 1's `r = 39` is square 8 and seat 3's
   * `r = 14` is square 3.
   *
   * Square 11 belongs to nobody's entry, which matters: the case is about the two attackers and a yard
   * would quietly add a third danger to it.
   */
  it("combines every attacker into one probability", () => {
    const pawns = pawnsAt(4, { "0.0": 12, "1.0": 39, "3.0": 14 });
    const expected = 1 - (1 - oddsOfHit(3)) * (1 - oddsOfHit(8));

    expect(threatOn(pawns, pawnOf(pawns, 0, 0))).toBeCloseTo(expected, 12);
  });

  /** The property the old sum could not keep: a crowd behind you is dangerous, never impossible. */
  it("stays under 1 however many attackers there are", () => {
    const pawns = pawnsAt(4, { "0.0": 12, "1.0": 39, "1.1": 38, "1.2": 37, "3.0": 14 });
    const threat = threatOn(pawns, pawnOf(pawns, 0, 0));

    expect(threat).toBeGreaterThan(oddsOfHit(3));
    expect(threat).toBeLessThan(1);
  });

  it("is nothing for a pawn nobody is behind", () => {
    const pawns = pawnsAt(4, { "0.0": 12 });

    expect(threatOn(pawns, pawnOf(pawns, 0, 0))).toBe(0);
  });

  it("is nothing for a pawn in the yard or safe in its house", () => {
    const pawns = pawnsAt(4, { "0.0": 44, "1.0": 30 });

    expect(threatOn(pawns, pawnOf(pawns, 0, 0))).toBe(0);
    expect(threatOn(pawns, pawnOf(pawns, 0, 1))).toBe(0);
  });

  /**
   * Standing on somebody's entry square is the classic Ludo mistake, and the old model saw a clear
   * track and answered zero. Seat 0's `r = 11` is square 10, which is seat 1's entry square, and seat
   * 1 has four pawns waiting in its yard.
   */
  it("counts the yard of whoever's entry square the pawn is standing on", () => {
    const pawns = pawnsAt(4, { "0.0": 11 });

    expect(entrySquare(1)).toBe(10);
    expect(threatOn(pawns, pawnOf(pawns, 0, 0))).toBeCloseTo(ENTRY_ODDS, 12);
  });

  /** The same square, with that seat's four pawns all safely in its house: nobody left to come out. */
  it("is nothing on an entry square whose owner has no pawn left to enter", () => {
    const pawns = pawnsAt(4, { "0.0": 11, "1.0": 41, "1.1": 42, "1.2": 43, "1.3": 44 });

    expect(threatOn(pawns, pawnOf(pawns, 0, 0))).toBe(0);
  });

  /**
   * Built Different refuses the next capture outright, so the danger really is zero. Without this the
   * bot would price a second Built Different on a pawn that already has one, and `builtDifferent`
   * would keep naming the same pawn.
   */
  it("is nothing for an armoured pawn, however many attackers there are", () => {
    const pawns = pawnsAt(4, { "0.0": 12, "1.0": 39, "3.0": 14 });

    expect(threatOn(pawns, pawnOf(pawns, 0, 0), EMPTY_BOARD)).toBeGreaterThan(0);
    expect(threatOn(pawns, pawnOf(pawns, 0, 0), armoured(0, 0))).toBe(0);
  });
});
