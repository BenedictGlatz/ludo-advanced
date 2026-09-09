/**
 * What the Reaction cards are worth to the seat being asked. Issue #82.
 *
 * ## The `share` rule is what these cases are really about
 *
 * A Reaction card does not help me, it hurts the player whose turn it is, and at a four-player table
 * two other people get that benefit for free. So every value except Ghost Mode and Uno Reverse is
 * multiplied by `1 / (seats - 1)`, which is a third here. That is why a bot answers a lot in a duel
 * and rarely in a crowd, and it is asserted rather than described: the two-player case below is the
 * same board with three times the value.
 *
 * **The lead weighting doubles that third in every case below**, and not by accident: seat 0 is the
 * only player who has moved a pawn at all, so it is four times the table average and the clamp in
 * `share` pulls that back to two. A board where the victim is the runaway leader is the normal board
 * for a Reaction card, and pinning the factor here is what stops the clamp being changed silently.
 *
 * Seat 0 is the active player throughout and seat 2 is the bot being asked, which is the shape of
 * every real window: `eligible` never contains the actor.
 */

import { describe, expect, it } from "vitest";

import { PLAIN_PROFILE } from "../../../src/ai/profile.js";
import { SCORE } from "../../../src/ai/score.js";
import {
  criticalFailure,
  devilDie,
  ghostMode,
  holdPawn,
  unoReverse,
} from "../../../src/ai/values-window.js";
import { pawnsAt, stateFor } from "../../helpers/fixtures.js";

/** A window open in seat 0's turn, with seat 2 being asked. */
function window(trigger, fields = {}) {
  return stateFor({
    phase: trigger === "on-capture" ? "reaction" : "roll",
    chosenDie: 6,
    reactionWindow: { trigger, actor: 0, eligible: [2], declined: [], played: [] },
    ...fields,
  });
}

/** Seat 0 with four pawns walking, which is the board a debuff on the roll is worth most on. */
const walking = { "0.0": 5, "0.1": 9, "0.2": 13, "0.3": 17 };

describe("the two cards that spoil a roll", () => {
  it("prices Critical Failure as a share of what the roll loses", () => {
    const state = window("on-roll", { pawns: pawnsAt(4, walking) });

    // Disadvantage on a D6 takes the mean from 3.5 to about 2.53. A third of that, doubled by the
    // lead weighting, is two thirds.
    expect(criticalFailure(state, 2, PLAIN_PROFILE).value).toBeCloseTo(
      ((3.5 - 91 / 36) * 2) / 3,
      6
    );
  });

  it("prices Devil Die the same way, and higher in a duel than in a crowd", () => {
    const crowd = window("on-roll", { pawns: pawnsAt(4, walking) });
    const duel = window("on-roll", { pawns: pawnsAt(4, walking), seats: [0, 2] });

    expect(devilDie(crowd, 2).value).toBeGreaterThan(0);
    expect(devilDie(duel, 2).value).toBeCloseTo(3 * devilDie(crowd, 2).value, 10);
  });
});

describe("Hold Pawn: taking one pawn out of the choice", () => {
  /**
   * Seat 0 has one pawn one step from home and three in the yard on a D6, so the turn is worth
   * `(100 + 25) / 6`. Holding the leading pawn leaves only the 6 that empties the yard, `25 / 6`. A
   * third of the difference, doubled by the lead weighting, is what the card is worth, and the pawn it
   * names is the leader.
   */
  it("holds the pawn the turn depends on", () => {
    const state = window("on-roll", { pawns: pawnsAt(4, { "0.0": 43 }) });
    const scored = holdPawn(state, 2);

    expect(scored.target).toEqual({ pawn: { player: 0, pawn: 0 } });
    expect(scored.value).toBeCloseTo((SCORE.FINISH / 6 / 3) * 2, 6);
  });

  /**
   * Four pawns seven squares apart, so no roll of the D6 is blocked by one of their own and every
   * face can be used by any of them. Holding one changes the best move by nothing at all, and the
   * card is kept.
   *
   * The spacing is deliberate and was found by getting it wrong: with the pawns four apart, a roll of
   * 4 could only be used by the leading pawn, because FR-12 stops the other three landing on each
   * other. Holding that one pawn then cost two thirds of a step, and the "interchangeable pawns" this
   * case is about turned out not to be interchangeable.
   */
  it("is worth nothing when the seat has four pawns that can all do the same thing", () => {
    const spread = { "0.0": 5, "0.1": 12, "0.2": 19, "0.3": 26 };
    const state = window("on-roll", { pawns: pawnsAt(4, spread) });

    expect(holdPawn(state, 2).value).toBe(0);
  });
});

describe("the two cards that answer a declared capture", () => {
  const capture = (victim) => ({
    player: 0,
    pawn: 0,
    from: 5,
    to: 15,
    captures: victim,
  });

  /** My own pawn, so the whole of it and not a share: a saved pawn is my gain outright. */
  it("dodges a capture aimed at my own pawn, for the whole value of the pawn", () => {
    const state = window("on-capture", {
      pawns: pawnsAt(4, { "0.0": 5, "2.0": 15 }),
      pendingMove: capture({ player: 2, pawn: 0 }),
    });

    expect(ghostMode(state, 2).value).toBe(15 + SCORE.LEAVE_START);
  });

  it("does not spend Ghost Mode on somebody else's pawn", () => {
    const state = window("on-capture", {
      pawns: pawnsAt(4, { "0.0": 5, "1.0": 15 }),
      pendingMove: capture({ player: 1, pawn: 0 }),
    });

    expect(ghostMode(state, 2)).toBeNull();
  });

  /** Uno Reverse is Ghost Mode plus a share of the attacker going home, so it is always preferred. */
  it("prices Uno Reverse above Ghost Mode by the attacker's own pawn", () => {
    const state = window("on-capture", {
      pawns: pawnsAt(4, { "0.0": 5, "2.0": 15 }),
      pendingMove: capture({ player: 2, pawn: 0 }),
    });

    const attacker = (5 + SCORE.LEAVE_START) / 3;
    expect(unoReverse(state, 2).value).toBeCloseTo(ghostMode(state, 2).value + attacker, 10);
  });

  /** Unlike Ghost Mode it is worth something even when the pawn about to be taken is not mine. */
  it("still punishes an attacker who is capturing somebody else", () => {
    const state = window("on-capture", {
      pawns: pawnsAt(4, { "0.0": 5, "1.0": 15 }),
      pendingMove: capture({ player: 1, pawn: 0 }),
    });

    expect(unoReverse(state, 2).value).toBeCloseTo((5 + SCORE.LEAVE_START) / 3, 10);
  });
});
