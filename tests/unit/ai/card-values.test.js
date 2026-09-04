/**
 * The value table, checked against the catalogue and against the rules. Issue #82.
 *
 * ## Two properties, and both are about the table as a whole
 *
 * **Every card has a value.** A card with no entry is a card a bot can draw, be asked about, and
 * crash on, in the middle of a match, once somebody happens to draw it. `card-values.js` throws at
 * import for that reason, and this file asserts the same thing from the outside so that the failure
 * says which card rather than only that a module would not load.
 *
 * **No value ever builds a target the rules refuse.** This is the sweep, and it is the most valuable
 * test in the file: it walks all 29 cards on a busy board and asks `checkTarget`, the same function
 * the dispatcher will ask, about every target that comes back. A bot whose intent is refused is far
 * worse than a person whose click is refused, because `bot-driver.js` stops on a refusal and the
 * phase never changes, so a match with three bots in it would sit there for ever.
 *
 * `card-choice.js` also guards against exactly that at run time, and the guard turning a bug into a
 * skipped card is not a reason to ship the bug.
 */

import { describe, expect, it } from "vitest";

import { cardById, cardIds } from "../../../src/core/cards/catalogue.js";
import { TYPE } from "../../../src/core/cards/vocabulary.js";
import { checkTarget } from "../../../src/state/card-legality.js";
import { VALUE_OF, valueOf } from "../../../src/ai/card-values.js";
import { pawnsAt, stateFor } from "../../helpers/fixtures.js";

/**
 * A board with something for every card to do: my pawns and two opponents' pawns out on the track,
 * a die chosen, and a hand for every seat.
 *
 * Seat 2 is the bot being asked, so that the boards for the Action cards and for the Reaction cards
 * differ only in the window and not in who is thinking.
 */
const busy = {
  pawns: pawnsAt(4, {
    "0.0": 5,
    "0.1": 20,
    "1.0": 12,
    "1.1": 30,
    "2.0": 15,
    "2.1": 24,
    "3.0": 8,
  }),
  chosenDie: 6,
  skillHands: { 0: ["action-rock"], 1: ["action-yeet", "action-rock"], 2: [], 3: [] },
};

/** Seat 2's own turn, in the action phase. */
const acting = stateFor({ ...busy, phase: "action", activePlayer: 2 });

/**
 * A window in seat 0's turn with seat 2 being asked, carrying both a declared capture and a card
 * that opened it. No real turn has both at once; this is a fixture for the sweep, so that every
 * Reaction value has the thing it reads.
 */
const answering = stateFor({
  ...busy,
  phase: "reaction",
  activePlayer: 0,
  reactionWindow: { trigger: "on-capture", actor: 0, eligible: [2], declined: [], played: [] },
  pendingMove: { player: 0, pawn: 0, from: 5, to: 15, captures: { player: 2, pawn: 0 } },
  pendingCard: { seat: 0, cardId: "action-yeet", target: { pawn: { player: 2, pawn: 0 } } },
});

describe("the table covers the catalogue", () => {
  it("has a value for every card in the pool", () => {
    for (const cardId of cardIds()) {
      expect(Object.hasOwn(VALUE_OF, cardId), `card "${cardId}" has no value`).toBe(true);
    }
  });

  it("has no value for a card that does not exist", () => {
    expect(() => valueOf(acting, 2, "action-not-a-card")).toThrow(/no value/);
  });

  /**
   * The two cards the bot never plays, as a list rather than as a comment. Both are recorded
   * decisions with their reasons at their own functions: Oil Spill helps whoever steps on it, and The
   * Purge changes the rules for everybody at once.
   */
  it("names exactly two cards the bot never plays", () => {
    const never = cardIds().filter((cardId) => {
      const state = cardById(cardId).type === TYPE.ACTION ? acting : answering;
      return valueOf(state, 2, cardId) === null;
    });

    // Sorted, because catalogue order is artboard order and The Purge is on the first artboard.
    expect(never.slice().sort()).toEqual(["action-oil-spill", "reaction-the-purge"]);
  });
});

describe("no value ever builds a target the rules refuse", () => {
  it("holds for every card on a busy board", () => {
    for (const cardId of cardIds()) {
      const state = cardById(cardId).type === TYPE.ACTION ? acting : answering;
      const scored = valueOf(state, 2, cardId);
      if (scored === null) continue;

      const refusal = checkTarget(state, cardId, scored.target, 2);
      expect(refusal, `card "${cardId}" built a target the rules refuse: ${refusal}`).toBeNull();
    }
  });

  /**
   * And on an empty board, where most of the searches find nothing at all. A value that returned a
   * half-built target rather than `null` would show up here and nowhere else.
   */
  it("holds when there is nothing on the board to act on", () => {
    const empty = stateFor({ phase: "action", activePlayer: 2, chosenDie: 6 });

    for (const cardId of cardIds()) {
      const scored = valueOf(cardById(cardId).type === TYPE.ACTION ? empty : answering, 2, cardId);
      if (scored === null) continue;

      expect(checkTarget(empty, cardId, scored.target, 2), `card "${cardId}"`).toBeNull();
    }
  });

  /** Every value is a finite number. A `NaN` would compare false against everything and never play. */
  it("prices every card as a real number", () => {
    for (const cardId of cardIds()) {
      const state = cardById(cardId).type === TYPE.ACTION ? acting : answering;
      const scored = valueOf(state, 2, cardId);
      if (scored === null) continue;

      expect(Number.isFinite(scored.value), `card "${cardId}" is worth ${scored.value}`).toBe(true);
    }
  });
});
