/**
 * What stopping somebody else's card is worth. Issue #82, rebuilt by the bot tactics plan's phase 2c.
 *
 * Split out of `values-window.test.js` with the module. The interesting half is the four cards that
 * can be aimed at me, because those used to be one flat 8 and are now four separate pieces of
 * arithmetic. The cases below are the four, plus the three fall-throughs that did not change.
 *
 * Seat 0 is the active player throughout and seat 2 is the bot being asked, which is the shape of
 * every real window.
 */

import { describe, expect, it } from "vitest";

import { DEFAULT_PROFILE } from "../../../src/ai/profile.js";
import { oddsOfHit } from "../../../src/ai/hit-odds.js";
import { SCORE } from "../../../src/ai/score.js";
import { nuehue } from "../../../src/ai/values-nuehue.js";
import { holdPawn } from "../../../src/ai/values-window.js";
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

const onCard = (entry, placements) =>
  window("on-card", { pawns: pawnsAt(4, placements), pendingCard: entry });

describe("Nühü: the four cards an opponent can aim at me", () => {
  /**
   * A Yeet with nothing else on the board costs exactly the steps it takes away. `YEET_PUSH` is the
   * rounded mean of a D6, four, and seat 2's pawn on `r = 16` is on square 35, which is nobody's entry
   * square and has nobody behind it, so the danger half is zero and the whole value is the walk.
   */
  it("prices a Yeet at the steps it takes off my pawn", () => {
    const state = onCard(
      { seat: 0, cardId: "action-yeet", target: { pawn: { player: 2, pawn: 0 } } },
      { "2.0": 16 }
    );

    expect(nuehue(state, 2).value).toBeCloseTo(4, 10);
  });

  /**
   * The half a flat 8 could never say. The same Yeet with an enemy pawn on square 29: seat 2's `r = 16`
   * is square 35, six in front of it, and the pushback lands the pawn on `r = 12`, square 31, which is
   * only **two** in front of it. So the card does not only cost four steps, it hands the pawn to the
   * attacker, and the danger term is the difference between the two expected losses.
   */
  it("adds the danger the pushback drops my pawn into", () => {
    const state = onCard(
      { seat: 0, cardId: "action-yeet", target: { pawn: { player: 2, pawn: 0 } } },
      { "2.0": 16, "0.0": 30 }
    );

    const after = oddsOfHit(2) * (12 + SCORE.LEAVE_START);
    const before = oddsOfHit(6) * (16 + SCORE.LEAVE_START);

    expect(nuehue(state, 2).value).toBeCloseTo(4 + after - before, 10);
    expect(nuehue(state, 2).value).toBeGreaterThan(4);
  });

  /** Ragebait costs a taunt, which is what `values-attacks.js` prices it at from the other side. */
  it("prices a Ragebait at what a taunt is worth", () => {
    const state = onCard(
      { seat: 0, cardId: "action-ragebait", target: { pawn: { player: 2, pawn: 0 } } },
      { "2.0": 15, "2.1": 20 }
    );

    expect(nuehue(state, 2).value).toBe(DEFAULT_PROFILE.tauntWorth);
  });

  /** Tax Fraud takes exactly one card out of my hand, so it is worth exactly one card. */
  it("prices a Tax Fraud at one card", () => {
    const state = onCard({ seat: 0, cardId: "action-tax-fraud", target: { player: 2 } }, {});

    expect(nuehue(state, 2).value).toBe(DEFAULT_PROFILE.cardWorth);
  });

  /**
   * A Hold Pawn on my pawn is `holdPawn`'s own arithmetic with the `share` left off, because my own
   * turn being spoiled is my whole loss and not a share of somebody else's. So the two are the same
   * number up to that factor, and asserting the ratio is what proves the two sides of the card cannot
   * drift apart.
   *
   * Seat 2 is the active player here, since Hold Pawn only ever names the active player's pawn, and
   * seat 0 is the one who played it.
   */
  it("prices a Hold Pawn at the whole of what the turn loses", () => {
    const state = window("on-card", {
      activePlayer: 2,
      pawns: pawnsAt(4, { "2.0": 43 }),
      pendingCard: {
        seat: 0,
        cardId: "reaction-hold-pawn",
        target: { pawn: { player: 2, pawn: 0 } },
      },
    });

    const shared = holdPawn(state, 0).value;

    expect(nuehue(state, 2).value).toBeCloseTo(SCORE.FINISH / 6, 6);
    expect(nuehue(state, 2).value).toBeGreaterThan(shared);
  });
});

describe("Nühü: the three cases that are not aimed at me", () => {
  /** A buff on the active player's roll is worth a share of the gain it would have given them. */
  it("cancels a roll buff for a share of what it would have been worth", () => {
    const state = onCard(
      { seat: 0, cardId: "action-angel-die", target: {} },
      { "0.0": 36, "0.1": 5, "0.2": 10, "0.3": 15 }
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
