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

import { KNOCKBACK } from "../../../src/core/cards/effects/trap-effects.js";
import {
  bananaPeel,
  bigAhRock,
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

describe("the four cards that leave something on a square", () => {
  /**
   * Aimed one square in front of the leading opponent pawn, which is the square that pawn is most
   * likely to enter next. Seat 1's leader is on square 29, so the obvious answer is square 30, which
   * is seat 3's entry square and illegal. The card falls through to the next pawn back, on square 14,
   * and lays the peel on 15.
   */
  it("lays a Banana Peel in front of an opponent, skipping an illegal square", () => {
    const state = acting({ "1.0": 20, "1.1": 5 });
    const scored = bananaPeel(state, 0);

    expect(scored.target).toEqual({ square: 15 });
    expect(scored.value).toBeCloseTo(7 / 3, 10);
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
   * It's Not That Deep is worth its aura rather than its pushback, so it is worth more where my own
   * pawns are standing. Seat 0's `r = 15` is square 14, inside the three-square radius of square 15.
   */
  it("prefers an It's Not That Deep next to my own pawns", () => {
    const near = acting({ "0.0": 15, "1.1": 5 });
    const far = acting({ "0.0": 35, "1.1": 5 });

    expect(notThatDeep(near, 0).value).toBeGreaterThan(notThatDeep(far, 0).value);
    expect(notThatDeep(far, 0).value).toBe(2);
  });

  /** A boulder is worth the knockback plus the blocking, less what my own pawns lose behind it. */
  it("prices a Big Ah Rock at the knockback plus the block", () => {
    const state = acting({ "1.1": 5 });

    expect(bigAhRock(state, 0).target).toEqual({ square: 15 });
    expect(bigAhRock(state, 0).value).toBeCloseTo((KNOCKBACK + 4) / 3, 10);
  });

  it("counts my own pawns stuck behind a Big Ah Rock against it", () => {
    // Seat 0's r = 12 is square 11, four squares behind square 15.
    const state = acting({ "1.1": 5, "0.0": 12 });

    expect(bigAhRock(state, 0).value).toBeCloseTo((KNOCKBACK + 4) / 3 - 2, 10);
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
    expect(scored.value).toBeCloseTo(((5 + 25) / 3) * (1 / 4), 10);
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
    expect(scored.value).toBeCloseTo(((5 + 25) / 3) * (2 / 4), 10);
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
