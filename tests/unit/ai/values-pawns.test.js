/**
 * What the cards played on your own pawns are worth, and which pawn they pick. Issue #82.
 *
 * The two offensive pawn cards moved to `values-attacks.test.js` with the module they price.
 *
 * ## The target is half of every one of these values
 *
 * A card that is worth six points on the right pawn and nothing on the wrong one is only as good as
 * its search, so every case below places two pawns and asserts **which** one comes back as well as
 * what it is worth. The boards are built out of absolute squares worked out in the comments, because
 * "three squares behind" is a fact about `absoluteSquare` and not about `r`.
 *
 * Seat 0's entry square is 0, seat 1's is 10 and seat 3's is 30, so seat 1's `r = 39` stands on square
 * 8 and seat 3's `r = 17` stands on square 6. Those two are two and four squares behind seat 0's
 * `r = 11`, which is square 10, and most of the boards here are variations on that.
 */

import { describe, expect, it } from "vitest";

import { SCORE } from "../../../src/ai/score.js";
import { KNOCKBACK } from "../../../src/core/cards/effects/status-effects.js";
import { ENTRY_ODDS, oddsOfHit } from "../../../src/ai/hit-odds.js";
import {
  builtDifferent,
  headOut,
  letHimCook,
  bigAhRock,
  lockIn,
  rock,
} from "../../../src/ai/values-pawns.js";
import { pawnsAt, stateFor } from "../../helpers/fixtures.js";

/** The action phase of seat 0's turn, with a die already chosen. */
function acting(placements) {
  return stateFor({ phase: "action", chosenDie: 6, pawns: pawnsAt(4, placements) });
}

describe("Rock: a wall is worth what walks into it", () => {
  /**
   * Two of my pawns, one with two opponents close behind it and one with a clear track. The wall goes
   * on the one somebody is about to walk into.
   */
  it("walls the pawn with opponents behind it", () => {
    const state = acting({ "0.0": 11, "0.1": 21, "1.0": 39, "3.0": 17 });
    const scored = rock(state, 0);

    expect(scored.target).toEqual({ pawn: { player: 0, pawn: 0 } });
    // Two enemies at 3 each, less the 5 the pawn gives up by standing still (issue #90).
    expect(scored.value).toBe(1);
  });

  /**
   * The subtraction that is the whole card: a Rock blocks its owner exactly as hard as everybody
   * else, so one of my own pawns behind it cancels one opponent out.
   */
  it("counts my own pawns behind it against me", () => {
    // Seat 0's r = 7 is square 6, four behind square 10, so it is stuck behind its own wall.
    const state = acting({ "0.0": 11, "0.1": 7, "1.0": 39 });

    expect(rock(state, 0).value).toBe(-5);
  });

  /**
   * Issue #90 made the stone immovable, and the price of that is the same `LOCK_COST` Lock In pays.
   * A wall with nobody to stop is now a card played against myself, so the bot keeps it.
   */
  it("prices a wall nobody walks into below zero, because the pawn stands still for it", () => {
    expect(rock(acting({ "0.0": 11 }), 0).value).toBeLessThan(0);
  });
});

describe("Big Ah Rock: the same wall, plus the knockback (issue #90)", () => {
  /**
   * Rock's value on the same board, plus the knockback as a share of the nearest enemy's loss.
   *
   * The nearest enemy behind square 10 is seat 1, two squares back, and seat 1 has walked 39 of the 88
   * steps on the board while the table average is 22. So its loss counts `39 / 22` as much as an
   * average seat's, which is the bot tactics plan's lead weighting: hurting whoever is winning is
   * worth more than hurting whoever is not.
   */
  it("is worth Rock plus a lead-weighted share of the knockback", () => {
    const state = acting({ "0.0": 11, "0.1": 21, "1.0": 39, "3.0": 17 });
    const knock = (KNOCKBACK * (39 / 22)) / 3;

    expect(bigAhRock(state, 0).target).toEqual(rock(state, 0).target);
    expect(bigAhRock(state, 0).value).toBeCloseTo(rock(state, 0).value + knock, 10);
  });

  it("is worth exactly Rock when nobody is behind the pawn to knock", () => {
    const state = acting({ "0.0": 11 });

    expect(bigAhRock(state, 0).value).toBe(rock(state, 0).value);
  });

  it("is null with no pawn on the track, like every own-pawn card", () => {
    expect(bigAhRock(acting({}), 0)).toBeNull();
  });
});

describe("Built Different and Lock In: insurance on one pawn", () => {
  /**
   * The chance of losing the pawn times what losing it costs.
   *
   * Seat 0's `r = 11` is square 10, which is two in front of seat 1's pawn **and** is seat 1's entry
   * square, and seat 1 still has three pawns in its yard. So there are two ways to lose that pawn and
   * `threatOn` combines them the way "at least one of them" is combined. The pawn on `r = 30` has
   * nobody within twenty squares behind it and is worth nothing to insure.
   */
  it("insures the pawn most likely to be captured", () => {
    const state = acting({ "0.0": 11, "0.1": 30, "1.0": 39 });
    const scored = builtDifferent(state, 0);
    const threat = 1 - (1 - oddsOfHit(2)) * (1 - ENTRY_ODDS);

    expect(scored.target).toEqual({ pawn: { player: 0, pawn: 0 } });
    expect(scored.value).toBeCloseTo(threat * (11 + SCORE.LEAVE_START), 10);
  });

  /** `r = 12` is square 11, which belongs to nobody's entry, unlike the `r = 11` above it. */
  it("is worth nothing when nobody can reach any of my pawns", () => {
    expect(builtDifferent(acting({ "0.1": 12, "0.2": 30 }), 0).value).toBe(0);
  });

  /**
   * Parking on somebody's entry square is the classic Ludo mistake, and until the bot tactics plan the
   * bot could not see it at all: the track behind square 10 is empty here, and the danger is entirely
   * seat 1's four waiting pawns.
   */
  it("insures a pawn standing on an opponent's entry square with an empty track behind it", () => {
    const scored = builtDifferent(acting({ "0.0": 11 }), 0);

    expect(scored.value).toBeCloseTo(ENTRY_ODDS * (11 + SCORE.LEAVE_START), 10);
  });

  /** Lock In protects the same pawn and costs it a round of walking, so it is always worth less. */
  it("prices Lock In below Built Different by the round the pawn loses", () => {
    const state = acting({ "0.0": 11, "1.0": 39 });

    expect(lockIn(state, 0).target).toEqual(builtDifferent(state, 0).target);
    expect(lockIn(state, 0).value).toBe(builtDifferent(state, 0).value - 5);
  });

  it("has nothing to insure with every pawn still in the yard", () => {
    expect(builtDifferent(acting({}), 0)).toBeNull();
    expect(lockIn(acting({}), 0)).toBeNull();
  });
});

describe("Aight Imma Head Out: four forward, or back to the entry square", () => {
  /** On a clear track the advance is worth its four steps and nothing else. */
  it("walks four when there is nothing to run from", () => {
    const state = acting({ "0.0": 11 });
    const scored = headOut(state, 0);

    expect(scored.target).toEqual({ pawn: { player: 0, pawn: 0 }, choice: "advance" });
    expect(scored.value).toBe(4);
  });

  /** Four steps forward onto an opponent is a capture, priced exactly as `scoreMove` prices one. */
  it("takes the capture when the four steps land on somebody", () => {
    // Seat 0's r = 11 is square 10, so four ahead is square 14, which is seat 1's r = 5.
    const state = acting({ "0.0": 11, "1.0": 5 });

    expect(headOut(state, 0).value).toBe(4 + SCORE.CAPTURE + 5);
  });

  /**
   * The retreat, which `displacement-effects.js` says exists for a pawn about to be captured a long
   * way round. Three opponents within a D6 behind a pawn five steps in: the escape is worth more than
   * the four steps the advance would gain.
   */
  it("runs home to the entry square when the pawn is surrounded", () => {
    // Seat 1's r = 30, 31 and 32 are squares 39, 0 and 1, which are 5, 4 and 3 behind square 4.
    const state = acting({ "0.0": 5, "1.0": 30, "1.1": 31, "1.2": 32 });
    const scored = headOut(state, 0);
    const threat = 1 - (1 - oddsOfHit(3)) * (1 - oddsOfHit(4)) * (1 - oddsOfHit(5));

    expect(scored.target).toEqual({ pawn: { player: 0, pawn: 0 }, choice: "retreat" });
    expect(scored.value).toBeCloseTo(threat * (5 + SCORE.LEAVE_START) - 4, 10);
  });
});

describe("Let Him Cook: roll a D12 and run", () => {
  /**
   * The gamble priced as a mean over the twelve faces. In the middle of the track every face is a
   * walk, so it is worth the mean of 1 to 12; four steps from the deepest house square, eight of the
   * twelve faces send the pawn back to the yard and the mean is deeply negative.
   */
  it("prefers a pawn with room to run and refuses one near home", () => {
    const state = acting({ "0.0": 10, "0.1": 40 });
    const scored = letHimCook(state, 0);

    expect(scored.target).toEqual({ pawn: { player: 0, pawn: 0 } });
    expect(scored.value).toBeCloseTo(6.5, 10);

    const risky = letHimCook(acting({ "0.1": 40 }), 0);
    expect(risky.value).toBeLessThan(0);
  });
});
