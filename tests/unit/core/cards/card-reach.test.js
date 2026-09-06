/**
 * The four cards that roll a die inside their own rule, and what they report. Design spec 18, D109.
 *
 * ## Why this is a file of its own and not four cases in `board-effects.test.js`
 *
 * That file is about **what a card does to the board**: where a pawn ended up, which squares were
 * swept, what a pushback is floored at. `cardReach` does nothing to the board at all. It is a report,
 * the same kind of field as `trapFired`, and the thing it is at risk of is different: not a wrong
 * answer but a **missing** one, quietly, on one of the four cards, with no visible symptom until the
 * cast draws a run of zero squares.
 *
 * ## What the report is for
 *
 * A cast's board stage draws the effect landing (design spec 18, D109). For Hyperbeam, Janky RPG, Yeet
 * and Let Him Cook the distance is rolled inside the effect and then thrown away, so afterwards the
 * state says where a pawn ended up and nothing says how far it went. Those two are not the same number:
 * a pushback is floored at the entry square and a Let Him Cook that overshoots is sent home, so in both
 * cases the pawn travelled a distance the board no longer shows.
 *
 * ## The negative finding, stated rather than left out
 *
 * The other 25 cards report nothing, and the cast has to be right without a report. That is the last
 * case below: every effect in the table is run once and asserted to leave the field alone.
 */

import { describe, expect, it } from "vitest";

import { createContext } from "../../../../src/core/cards/context.js";
import { EFFECTS, effectFor } from "../../../../src/core/cards/effects/index.js";
import { JANKY_HIT } from "../../../../src/core/cards/effects/area-effects.js";
import { pawnsAt, rngForDice } from "../../../helpers/fixtures.js";

/** Run one card, with the RNG scripted as `[[roll, faces], ...]`. */
function play(cardId, fields = {}, dice = []) {
  return effectFor(cardId)(createContext({ rng: rngForDice(dice), ...fields }));
}

describe("the four cards that roll inside their own effect report how far they reached", () => {
  it("Yeet reports the D6 it pushed with", () => {
    const patch = play(
      "action-yeet",
      { pawns: pawnsAt(4, { "1.0": 20 }), target: { pawn: { player: 1, pawn: 0 } } },
      [[4, 6]]
    );

    expect(patch.cardReach).toBe(4);
  });

  /**
   * The case the board cannot answer for itself. The pushback is floored at the entry square, so the
   * pawn moved two squares and the die said six. The cast draws the six, because that is what happened.
   */
  it("Yeet reports the roll and not the distance the floor allowed", () => {
    const patch = play(
      "action-yeet",
      { pawns: pawnsAt(4, { "1.0": 3 }), target: { pawn: { player: 1, pawn: 0 } } },
      [[6, 6]]
    );

    expect(patch.cardReach).toBe(6);
  });

  it("Let Him Cook reports the D12 it ran", () => {
    const patch = play(
      "action-let-him-cook",
      { pawns: pawnsAt(4, { "0.0": 5 }), target: { pawn: { player: 0, pawn: 0 } } },
      [[7, 12]]
    );

    expect(patch.cardReach).toBe(7);
  });

  /** The gamble lost: the pawn is sent home, and it still ran the eleven squares before it crashed. */
  it("Let Him Cook reports the run even when the pawn overshot and went home", () => {
    const patch = play(
      "action-let-him-cook",
      { pawns: pawnsAt(4, { "0.0": 40 }), target: { pawn: { player: 0, pawn: 0 } } },
      [[11, 12]]
    );

    expect(patch.cardReach).toBe(11);
  });

  it("Hyperbeam reports the D4, which is how many squares the beam covered", () => {
    const patch = play(
      "action-hyperbeam",
      {
        pawns: pawnsAt(4, { "0.0": 10 }),
        target: { pawn: { player: 0, pawn: 0 }, direction: 1 },
      },
      [[3, 4]]
    );

    expect(patch.cardReach).toBe(3);
  });

  /**
   * Janky RPG reports the die and not the squares, so the view asks the same `JANKY_HIT` question the
   * effect asked. A shot that landed and one that went wide are two different marks on the board.
   */
  it("Janky RPG reports the D6 that decided whether it hit", () => {
    const target = { square: 12 };

    expect(play("action-janky-rpg", { target }, [[5, 6]]).cardReach).toBe(5);
    expect(play("action-janky-rpg", { target }, [[2, 6]]).cardReach).toBe(2);
    expect(JANKY_HIT).toBe(4);
  });
});

describe("every other card leaves the report alone", () => {
  /**
   * A card that reports a reach it does not have would make the cast draw a run for something that
   * never travelled. Run every effect in the table once, against a context with nothing scripted, and
   * assert the field is absent on all but the four above.
   */
  it("reports nothing for the other 25", () => {
    const rolls = new Set([
      "action-yeet",
      "action-let-him-cook",
      "action-hyperbeam",
      "action-janky-rpg",
    ]);

    for (const cardId of Object.keys(EFFECTS)) {
      if (rolls.has(cardId)) continue;

      const patch = effectFor(cardId)(
        createContext({
          pawns: pawnsAt(4, { "0.0": 5, "1.0": 12 }),
          target: { pawn: { player: 1, pawn: 0 }, square: 12, direction: 1, player: 1 },
          rng: () => 0,
        })
      );

      expect(patch.cardReach, `${cardId} reported a reach it does not have`).toBeUndefined();
    }
  });
});
