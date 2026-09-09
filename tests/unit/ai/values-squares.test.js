/**
 * What the cards aimed at a square are worth, and which square they pick. Issue #82.
 *
 * ## Two things are being tested at once, and only one of them is arithmetic
 *
 * The other is that the square the value picks is a square the **rules** allow. A trap may not go on
 * an occupied square, under a pawn, or on one of the four entry squares (0, 10, 20 and 30), and the
 * value asks `pickableSquares` rather than working that out for itself. The Banana Peel case below is
 * built so that the obvious answer is an entry square and the card has to fall through to its second
 * choice, which is the kind of board a match reaches often and a test reaches only on purpose.
 *
 * Seat 1's entry square is 10, so its `r = 20` stands on square 29 and its `r = 5` on square 14.
 */

import { describe, expect, it } from "vitest";

import { oddsOfHit } from "../../../src/ai/hit-odds.js";
import { DEFAULT_PROFILE } from "../../../src/ai/profile.js";
import {
  bananaPeel,
  hyperbeam,
  jankyRpg,
  notThatDeep,
  oilSpill,
} from "../../../src/ai/values-squares.js";
import { pawnsAt, stateFor } from "../../helpers/fixtures.js";

/** The action phase of seat 0's turn, with a die already chosen. */
function acting(placements, fields = {}) {
  return stateFor({ phase: "action", chosenDie: 6, pawns: pawnsAt(4, placements), ...fields });
}

describe("the three cards that leave something on a square", () => {
  /**
   * The peel goes on the square somebody is most likely to walk onto, and the search covers every
   * legal square rather than only the one immediately in front of a pawn.
   *
   * Seat 1's leader is on square 29, so squares 30 and 31 are the two most likely landings. Square 30
   * is seat 3's entry square and illegal, so the answer is 31, which the trailing pawn on square 14
   * can also reach with a 17. Seat 1 has walked all 25 steps on the board against a table average of
   * 6.25, so `share` clamps its lead weighting to double the plain third.
   */
  it("lays a Banana Peel where somebody will walk, skipping an illegal square", () => {
    const state = acting({ "1.0": 20, "1.1": 5 });
    const scored = bananaPeel(state, 0);
    const caught = ((oddsOfHit(2) + oddsOfHit(17)) * 2) / 3;

    expect(scored.target).toEqual({ square: 31 });
    expect(scored.value).toBeCloseTo(caught * DEFAULT_PROFILE.stunWorth, 10);
  });

  /**
   * The improvement itself: the trap no longer goes one square in front of the leader, which is the
   * single distance the victim is least likely to roll and which on this board is an illegal entry
   * square anyway. What replaces it is a search over every legal square by how likely somebody is to
   * walk onto it.
   */
  it("no longer aims at the one square the rules forbid", () => {
    const state = acting({ "1.0": 20, "1.1": 5, "3.0": 6 });

    expect(bananaPeel(state, 0).target.square).not.toBe(30);
    expect(bananaPeel(state, 0).value).toBeGreaterThan(0);
  });

  it("has nowhere to lay a Banana Peel with no opponent on the track", () => {
    expect(bananaPeel(acting({ "0.0": 11 }), 0)).toBeNull();
  });

  /**
   * The bot never plays Oil Spill, which is a recorded decision and not a gap: the card slides
   * whoever steps on it **forwards**, so it is a gift to the victim on almost every board.
   */
  it("never plays Oil Spill", () => {
    expect(oilSpill(acting({ "1.0": 20 }), 0)).toBeNull();
  });

  /**
   * It's Not That Deep is worth its aura rather than its pushback, so where my own pawns are standing
   * matters more than where an opponent is walking. Seat 0's `r = 15` and `r = 17` are squares 14 and
   * 16, and one square can sit inside the three-square radius of both.
   *
   * The bare board is the pushback on its own, which is well under one point: that is the joke on the
   * card, and the value now says so rather than papering over it with a flat base of 2.
   */
  it("lays an It's Not That Deep where it shields my own pawns", () => {
    const shielding = acting({ "0.0": 15, "0.1": 17, "1.0": 25 });
    const bare = acting({ "1.0": 25 });

    expect(notThatDeep(shielding, 0).value).toBeGreaterThan(2);
    expect(notThatDeep(bare, 0).value).toBeLessThan(1);
  });
});

describe("the two cards that hit several squares at once", () => {
  /**
   * Hyperbeam fires from one of my own pawns, so both the shooter and the direction are the decision.
   * Seat 0's `r = 11` is square 10; seat 1's `r = 5` and `r = 6` are squares 14 and 15, which are four
   * and five squares forward. Only the first of those is inside a D4's reach, so forwards is worth
   * something and backwards is worth nothing.
   */
  it("fires towards the opponents and not away from them", () => {
    const state = acting({ "0.0": 11, "1.0": 5 });
    const scored = hyperbeam(state, 0);

    expect(scored.target.pawn).toEqual({ player: 0, pawn: 0 });
    expect(scored.target.direction).toBe(1);
    // Square 14 is the fourth square of the run, so it is hit on one face of the D4 out of four.
    // Seat 1 has walked 5 of the 16 steps on the board against an average of 4, so its loss counts
    // 5 / 4 as much as an average seat's: the lead weighting, on a board where the lead is small.
    expect(scored.value).toBeCloseTo((((5 + 25) * (5 / 4)) / 3) * (1 / 4), 10);
  });

  /**
   * Friendly fire, priced, and the answer is not the one this case was first written to expect. One
   * of my own pawns in the lane is worth its whole value against me while an opponent's is worth a
   * third, so firing from the pawn on square 10 through my own pawn on square 11 prices out at about
   * -34. The bot does not play a bad shot: it fires the **other** pawn instead, from square 11
   * forwards, which reaches the opponent on square 14 and hits nothing of mine on the way.
   *
   * Worth keeping as the friendly-fire case even though nothing is negative, because what it pins is
   * that both the shooter and the direction are part of the search.
   */
  it("picks a shooter whose lane is clear of its own side", () => {
    // Seat 0's r = 12 is square 11 and seat 1's r = 5 is square 14, two squares further on.
    const state = acting({ "0.0": 11, "0.1": 12, "1.0": 5 });
    const scored = hyperbeam(state, 0);

    expect(scored.target).toEqual({ pawn: { player: 0, pawn: 1 }, direction: 1 });
    // Seat 1 is 5 of the 28 steps on the board against an average of 7, so it is behind the table and
    // its loss counts 5 / 7 as much. The lead weighting cuts both ways, which is the point of it.
    expect(scored.value).toBeCloseTo((((5 + 25) * (5 / 7)) / 3) * (2 / 4), 10);
  });

  it("has nothing to fire with every pawn in the yard", () => {
    expect(hyperbeam(acting({ "1.0": 5 }), 0)).toBeNull();
  });

  /**
   * Janky RPG hits what it aimed at half the time and both neighbours the other half, so the best
   * square is the one whose neighbourhood is all opponents. Three of seat 1's pawns on squares 14, 15
   * and 16 make square 15 the obvious answer.
   */
  it("aims Janky RPG into a cluster of opponents", () => {
    const state = acting({ "1.0": 5, "1.1": 6, "1.2": 7 });

    expect(jankyRpg(state, 0).target).toEqual({ square: 15 });
    expect(jankyRpg(state, 0).value).toBeGreaterThan(0);
  });

  it("aims Janky RPG at nothing worth firing at when the board is empty", () => {
    expect(jankyRpg(acting({}), 0).value).toBe(0);
  });
});
