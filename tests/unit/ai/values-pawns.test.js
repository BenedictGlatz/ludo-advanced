/**
 * What the cards aimed at a pawn are worth, and which pawn they pick. Issue #82.
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

import { SCORE } from "../../../src/ai/move-scoring.js";
import {
  builtDifferent,
  headOut,
  letHimCook,
  lockIn,
  ragebait,
  rock,
  yeet,
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
    expect(scored.value).toBe(6);
  });

  /**
   * The subtraction that is the whole card: a Rock blocks its owner exactly as hard as everybody
   * else, so one of my own pawns behind it cancels one opponent out.
   */
  it("counts my own pawns behind it against me", () => {
    // Seat 0's r = 7 is square 6, four behind square 10, so it is stuck behind its own wall.
    const state = acting({ "0.0": 11, "0.1": 7, "1.0": 39 });

    expect(rock(state, 0).value).toBe(0);
  });
});

describe("Built Different and Lock In: insurance on one pawn", () => {
  /**
   * The chance of losing the pawn times what losing it costs. One opponent two squares behind is a
   * one-in-six chance, and the pawn has walked eleven steps, so `(11 + 25) / 6 = 6`.
   */
  it("insures the pawn most likely to be captured", () => {
    const state = acting({ "0.0": 11, "0.1": 30, "1.0": 39 });
    const scored = builtDifferent(state, 0);

    expect(scored.target).toEqual({ pawn: { player: 0, pawn: 0 } });
    expect(scored.value).toBeCloseTo((11 + SCORE.LEAVE_START) / 6, 10);
  });

  it("is worth nothing when nobody can reach any of my pawns", () => {
    expect(builtDifferent(acting({ "0.0": 11, "0.1": 30 }), 0).value).toBe(0);
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

describe("Ragebait: forcing the wrong pawn to move", () => {
  /**
   * Aimed at the opponent's rearmost pawn, which is the pawn whose forced move wastes their turn. In
   * a four-player match it is worth a third of what it costs them.
   */
  it("taunts the opponent's rearmost pawn", () => {
    const state = acting({ "0.0": 11, "1.0": 30, "1.1": 5 });
    const scored = ragebait(state, 0);

    expect(scored.target).toEqual({ pawn: { player: 1, pawn: 1 } });
    expect(scored.value).toBeCloseTo(3 / 3, 10);
  });

  it("is not worth playing against a player with only one pawn out", () => {
    expect(ragebait(acting({ "0.0": 11, "1.0": 30 }), 0)).toBeNull();
  });
});

describe("Yeet: pushing an opponent back", () => {
  /** With nothing of mine nearby it is worth a share of the four steps the victim loses. */
  it("is worth a share of the steps the victim loses", () => {
    const state = acting({ "0.0": 11, "1.0": 20 });

    expect(yeet(state, 0).target).toEqual({ pawn: { player: 1, pawn: 0 } });
    expect(yeet(state, 0).value).toBeCloseTo(4 / 3, 10);
  });

  /**
   * The term a careless bot would miss. A push resolves a capture on the square it lands on, so one
   * of my own pawns sitting behind the victim can be sent home by my own card. Seat 1's `r = 20` is
   * square 29 and seat 0's `r = 28` is square 27, two behind it, so one face of the D6 captures my
   * own pawn and the value goes negative.
   */
  it("refuses to push a pawn back onto one of mine", () => {
    const state = acting({ "0.0": 28, "1.0": 20 });

    expect(yeet(state, 0).value).toBeLessThan(0);
  });

  /** The other side of it: pushing a pawn out of range of my own leader is worth extra. */
  it("is worth more when it pushes an attacker away from my pawn", () => {
    // Seat 0's r = 34 is square 33, four in front of seat 1's r = 20 on square 29.
    const relieved = acting({ "0.0": 34, "1.0": 20 });
    const plain = acting({ "0.0": 11, "1.0": 20 });

    expect(yeet(relieved, 0).value).toBeGreaterThan(yeet(plain, 0).value);
  });

  it("cannot push a pawn that is already on its entry square", () => {
    expect(yeet(acting({ "0.0": 11, "1.0": 1 }), 0)).toBeNull();
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

    expect(scored.target).toEqual({ pawn: { player: 0, pawn: 0 }, choice: "retreat" });
    expect(scored.value).toBeCloseTo(0.5 * (5 + SCORE.LEAVE_START) - 4, 10);
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
