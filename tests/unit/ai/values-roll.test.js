/**
 * What the roll cards and the economy cards are worth. Issue #82.
 *
 * ## Every case here is a board where the answer is obvious to a person
 *
 * That is the only way to test a heuristic. "Angel Die is worth 15.3" pins an implementation detail;
 * "Angel Die is worth playing when the pawn cannot otherwise reach home, and worth keeping when the
 * extra die would only overshoot" is the decision, and the sign of the number is what says it.
 *
 * So the assertions are mostly about **signs and orderings**, with an exact number wherever it can be
 * worked out by hand in one line.
 */

import { describe, expect, it } from "vitest";

import { SCORE } from "../../../src/ai/move-scoring.js";
import {
  angelDie,
  criticalSuccess,
  doubleDip,
  frFr,
  noTakeBacksies,
  potOfGreed,
  sixtySeven,
  taxFraud,
} from "../../../src/ai/values-roll.js";
import { CARD_WORTH } from "../../../src/ai/values-shared.js";
import { pawnsAt, stateFor } from "../../helpers/fixtures.js";

/** The action phase of seat 0's turn, with a die already chosen. */
function acting(fields = {}) {
  return stateFor({ phase: "action", chosenDie: 6, ...fields });
}

describe("the five cards that change the roll", () => {
  /**
   * A pawn eight from home on a D6 can never arrive: FR-13 wants an exact count and six is not
   * eight. Angel Die makes eight the most likely total of the two dice, so the card turns an
   * impossible finish into a likely one and is worth a lot.
   */
  it("plays Angel Die when the extra die reaches a finish the die alone cannot", () => {
    const state = acting({ pawns: pawnsAt(4, { "0.0": 36, "0.1": 5, "0.2": 10, "0.3": 15 }) });

    expect(angelDie(state, 0).value).toBeGreaterThan(10);
  });

  /**
   * The same card on the same die, one square from home: every total of two dice overshoots, so the
   * card takes a finish away rather than adding one. The value is negative and the bot keeps it,
   * which is the behaviour the threshold exists to produce.
   */
  it("keeps Angel Die when the extra die would only overshoot", () => {
    const state = acting({ chosenDie: 2, pawns: pawnsAt(4, { "0.0": 43 }) });

    expect(angelDie(state, 0).value).toBeLessThan(0);
  });

  it("prices Critical Success by how much a higher roll is worth", () => {
    // Four pawns out on the track and nothing near home: a bigger number is simply a longer walk.
    const walking = acting({ pawns: pawnsAt(4, { "0.0": 5, "0.1": 9, "0.2": 13, "0.3": 17 }) });

    expect(criticalSuccess(walking, 0).value).toBeGreaterThan(0);
  });

  /**
   * 67 is a gamble: five faces in six collapse to nothing and the sixth is doubled. On a board where
   * the doubled 12 finishes a pawn it is worth ten points; on a board where the walk is all there is,
   * throwing away five faces out of six is a bad trade and the value says so.
   */
  it("plays 67 only when the doubled roll lands on something", () => {
    const reachable = acting({ pawns: pawnsAt(4, { "0.0": 32 }) });
    const walking = acting({ pawns: pawnsAt(4, { "0.0": 5, "0.1": 9, "0.2": 13, "0.3": 17 }) });

    expect(sixtySeven(reachable, 0).value).toBeGreaterThan(5);
    expect(sixtySeven(walking, 0).value).toBeLessThan(0);
  });

  /**
   * FR FR is the one roll card with a target, so it has to search. A pawn one step from home makes
   * the answer unambiguous: name a 1, finish the pawn, and the value is the difference between a
   * certain 100 and the average of a die that mostly does nothing.
   */
  it("names the number that finishes a pawn", () => {
    const state = acting({ pawns: pawnsAt(4, { "0.0": 43 }) });
    const scored = frFr(state, 0);

    expect(scored.target).toEqual({ number: 1 });
    expect(scored.value).toBeCloseTo(SCORE.FINISH - (SCORE.FINISH + SCORE.LEAVE_START) / 6, 6);
  });

  it("says nothing at all before a die has been chosen", () => {
    const drawing = stateFor({ phase: "action", chosenDie: null });

    expect(angelDie(drawing, 0)).toBeNull();
    expect(frFr(drawing, 0)).toBeNull();
  });
});

describe("the four cards that trade in cards", () => {
  it("prices Pot of Greed by how much room the hand has left", () => {
    const room = acting({ skillHands: { 0: ["action-pot-of-greed"], 1: [], 2: [], 3: [] } });
    const full = acting({
      skillHands: {
        0: ["action-pot-of-greed", "action-rock", "action-yeet", "action-lock-in", "action-fr-fr"],
        1: [],
        2: [],
        3: [],
      },
    });

    expect(potOfGreed(room, 0).value).toBe(2 * CARD_WORTH);
    expect(potOfGreed(full, 0).value).toBe(CARD_WORTH);
  });

  /**
   * Double Dip is worth a hand slot and nothing more, which is the Double Dip finding: `spendCard`
   * counts the card itself, so the budget of two leaves exactly one further play. With nothing else
   * in hand to use that play on, even the slot is worth nothing.
   */
  it("prices Double Dip as a slot, and as nothing with an empty hand", () => {
    const alone = acting({ skillHands: { 0: ["action-double-dip"], 1: [], 2: [], 3: [] } });
    const withCard = acting({
      skillHands: { 0: ["action-double-dip", "action-angel-die"], 1: [], 2: [], 3: [] },
    });

    expect(doubleDip(alone, 0).value).toBe(0);
    expect(doubleDip(withCard, 0).value).toBe(1);
  });

  /**
   * No Take-Backsies buys the turn being unanswerable, so it is worth nothing at all when nobody is
   * holding a card to answer with. The count is public (D33), which is what makes reading it fair.
   */
  it("prices No Take-Backsies at nothing when no opponent holds a card", () => {
    const quiet = acting({ pawns: pawnsAt(4, { "0.0": 5 }) });
    const armed = acting({
      pawns: pawnsAt(4, { "0.0": 5 }),
      skillHands: { 0: [], 1: ["action-rock"], 2: [], 3: [] },
    });

    expect(noTakeBacksies(quiet, 0).value).toBe(0);
    expect(noTakeBacksies(armed, 0).value).toBeGreaterThan(0);
  });

  it("robs the opponent holding the most cards, and nobody when they hold none", () => {
    const state = acting({
      skillHands: {
        0: ["action-tax-fraud"],
        1: ["action-rock"],
        2: ["action-rock", "action-yeet"],
        3: [],
      },
    });

    expect(taxFraud(state, 0).target).toEqual({ player: 2 });
    // A card to me plus a third of a card off them, at a four-player table.
    expect(taxFraud(state, 0).value).toBeCloseTo(CARD_WORTH * (1 + 1 / 3), 10);
    expect(taxFraud(acting(), 0)).toBeNull();
  });
});
