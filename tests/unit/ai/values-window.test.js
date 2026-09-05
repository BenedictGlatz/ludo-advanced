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
 * Seat 0 is the active player throughout and seat 2 is the bot being asked, which is the shape of
 * every real window: `eligible` never contains the actor.
 */

import { describe, expect, it } from "vitest";

import { SCORE } from "../../../src/ai/move-scoring.js";
import {
  criticalFailure,
  devilDie,
  ghostMode,
  holdPawn,
  nuehue,
  thePurge,
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

    // Disadvantage on a D6 takes the mean from 3.5 to about 2.53, a third of which is 0.32.
    expect(criticalFailure(state, 2).value).toBeCloseTo((3.5 - 91 / 36) / 3, 6);
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
   * third of the difference is what the card is worth, and the pawn it names is the leader.
   */
  it("holds the pawn the turn depends on", () => {
    const state = window("on-roll", { pawns: pawnsAt(4, { "0.0": 43 }) });
    const scored = holdPawn(state, 2);

    expect(scored.target).toEqual({ pawn: { player: 0, pawn: 0 } });
    expect(scored.value).toBeCloseTo(SCORE.FINISH / 6 / 3, 6);
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

describe("Nühü: cancelling the card that opened the window", () => {
  const onCard = (entry, placements) =>
    window("on-card", { pawns: pawnsAt(4, placements), pendingCard: entry });

  it("cancels a card aimed straight at one of my pawns", () => {
    const state = onCard(
      { seat: 0, cardId: "action-yeet", target: { pawn: { player: 2, pawn: 0 } } },
      { "0.0": 5, "2.0": 15 }
    );

    expect(nuehue(state, 2).value).toBe(8);
  });

  it("cancels a card aimed at me as a player", () => {
    const state = onCard({ seat: 0, cardId: "action-tax-fraud", target: { player: 2 } }, {});

    expect(nuehue(state, 2).value).toBe(8);
  });

  /** A buff on the active player's roll is worth a share of the gain it would have given them. */
  it("cancels a roll buff for a share of what it would have been worth", () => {
    const state = onCard(
      { seat: 0, cardId: "action-angel-die", target: {} },
      {
        "0.0": 36,
        "0.1": 5,
        "0.2": 10,
        "0.3": 15,
      }
    );

    expect(nuehue(state, 2).value).toBeGreaterThan(4);
  });

  /**
   * An area card is priced by what my own pawns standing in it would cost me. Seat 2's `r = 15` is
   * square 34, and Janky RPG hits what it aimed at on three faces of six.
   */
  it("cancels an area card by what it would cost my own pawns", () => {
    const state = onCard(
      { seat: 0, cardId: "action-janky-rpg", target: { square: 34 } },
      {
        "2.0": 15,
      }
    );

    expect(nuehue(state, 2).value).toBeCloseTo(0.5 * (15 + SCORE.LEAVE_START), 10);
  });

  /** A trap laid one to six squares in front of one of my pawns is a trap I am about to walk into. */
  it("cancels a trap laid in front of one of my own pawns", () => {
    const state = onCard(
      { seat: 0, cardId: "action-banana-peel", target: { square: 35 } },
      {
        "2.0": 15,
      }
    );

    expect(nuehue(state, 2).value).toBe(5);
  });

  it("is worth nothing against a card that does not touch me", () => {
    const state = onCard({ seat: 0, cardId: "action-pot-of-greed", target: {} }, { "2.0": 15 });

    expect(nuehue(state, 2).value).toBe(0);
  });

  it("has nothing to cancel when no card opened the window", () => {
    expect(nuehue(window("on-roll"), 2)).toBeNull();
  });
});

describe("The Purge: the one Reaction the bot never plays", () => {
  /**
   * A recorded decision rather than a gap. The card suspends the rule that an own pawn blocks,
   * board-wide and for everybody, and whether that is good depends on four seats' positions at once.
   */
  it("is never played", () => {
    expect(thePurge(window("on-roll", { pawns: pawnsAt(4, walking) }), 2)).toBeNull();
  });
});
