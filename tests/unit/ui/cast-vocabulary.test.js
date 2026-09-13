/**
 * Every card casts as one of six families, and 17 of the 29 reach the board. Design spec 18, D105.
 *
 * ## What this file exists to stop
 *
 * `cast-vocabulary.js` is a written-out table of 29 card ids, and the failure it is at risk of is the
 * one a table always is: an id that is spelled differently from the catalogue's, or a card added to
 * the game and not to the table. Neither throws. The card would simply cast with no
 * `data-cast-family`, no base movement would match it, and the cast would look like a card that
 * arrives and then stands still, which reads as an animation somebody forgot to finish rather than as
 * a bug.
 *
 * So this walks the **real** catalogue, exactly as `card-art.test.js` does for the drawings and for the
 * same reason: the check has to be against the game and not against a copy of the list.
 */

import { describe, expect, it } from "vitest";

import { CARD_COUNT, SKILL_CARDS, cardIds } from "../../../src/core/cards/catalogue.js";
import {
  castCardIds,
  castFamily,
  castOutcome,
  castsOnBoard,
  hasBoardStage,
} from "../../../src/ui/cast-vocabulary.js";

/** The six values `data-cast-family` may take, and no seventh. D105. */
const FAMILIES = ["roll", "hand", "status", "shove", "trap", "area"];

describe("every card in the game has a family", () => {
  it("resolves all 29 catalogue ids", () => {
    for (const cardId of cardIds()) {
      expect(castFamily(cardId), `${cardId} has no cast family`).not.toBeNull();
    }
  });

  /** The other direction, which is what catches a spelling the catalogue does not use. */
  it("names no card the catalogue does not have", () => {
    for (const cardId of castCardIds()) {
      expect(cardIds(), `${cardId} is not a real card`).toContain(cardId);
    }
  });

  it("covers exactly the 29 and no more", () => {
    expect(castCardIds()).toHaveLength(CARD_COUNT);
  });

  it("uses only the six values the spec names", () => {
    for (const cardId of cardIds()) {
      expect(FAMILIES).toContain(castFamily(cardId));
    }
  });

  /** An id nothing knows is `null` and not a default family, which is what makes the gap visible. */
  it("answers null for a card it does not know", () => {
    expect(castFamily("action-not-a-card")).toBeNull();
    expect(hasBoardStage("action-not-a-card")).toBe(false);
  });
});

describe("the six families, by the sizes D105 gives them", () => {
  it("splits the 29 the way the spec's table does", () => {
    const sizes = {};
    for (const cardId of cardIds()) {
      const family = castFamily(cardId);
      sizes[family] = (sizes[family] ?? 0) + 1;
    }

    expect(sizes).toEqual({ roll: 7, hand: 5, status: 7, shove: 4, trap: 3, area: 3 });
  });

  /**
   * The two placements D105 calls judgement calls, pinned so that a later reading of the table cannot
   * quietly move them. Big Ah Rock is `status` because the stone is the card and the knockback is its
   * accent; Ghost Mode is `status` because a dodge is a protection the pawn had, not a pawn moved.
   */
  it("keeps Big Ah Rock and Ghost Mode in status", () => {
    expect(castFamily("action-big-ah-rock")).toBe("status");
    expect(castFamily("reaction-ghost-mode")).toBe("status");
  });
});

describe("which cards reach the board at all", () => {
  /**
   * The split the hold depends on: a card with a board stage costs the full 1.5 seconds and one
   * without costs 940 ms. Getting the count wrong here would make a third of the game's card plays
   * wait half a second for a stage that never plays.
   */
  it("gives 17 of the 29 a board stage", () => {
    const withBoard = cardIds().filter((cardId) => hasBoardStage(cardId));

    expect(withBoard).toHaveLength(17);
  });

  /**
   * The 12 without one, by what they changed. Seven change the roll, two change a hand, one shuts the
   * remaining windows, one negates a card, one takes a card from a hand nobody on this screen sees.
   * None of those happened on the board, so none of them draws anything there.
   */
  it("gives none to the twelve whose effect is not on the board", () => {
    const noBoard = [
      "action-critical-success",
      "action-angel-die",
      "action-speedrun",
      "action-fr-fr",
      "action-sixty-seven",
      "reaction-critical-failure",
      "reaction-devil-die",
      "action-pot-of-greed",
      "action-double-dip",
      "action-no-take-backsies",
      "action-tax-fraud",
      "reaction-nuehue",
    ];

    for (const cardId of noBoard) {
      expect(hasBoardStage(cardId), `${cardId} should not reach the board`).toBe(false);
    }
  });

  /** Every card that targets a pawn or a square lands somewhere, so every one of them has a stage. */
  it("gives one to every card that points at something on the board", () => {
    const pointed = SKILL_CARDS.filter((card) =>
      card.targets.some((kind) => kind.includes("pawn") || kind.includes("square"))
    );

    expect(pointed.length).toBeGreaterThan(0);
    for (const card of pointed) {
      expect(hasBoardStage(card.id), `${card.id} points at the board`).toBe(true);
    }
  });
});

describe("what became of the play narrows the stage it gets, D113", () => {
  const played = { seat: 1, cardId: "action-banana-peel", target: { square: 7 } };
  const record = (outcome) => ({
    lastCard: { seat: 1, cardId: "action-banana-peel", turnNumber: 3, outcome },
  });

  it("reads the outcome off the record when it names the same play", () => {
    expect(castOutcome(record("nullified"), played)).toBe("nullified");
  });

  /**
   * The record can name a **different** play: a Reaction settled after this card in the same window,
   * and the plate shows one card. The answer is then the outcome with no treatment on it, because a
   * cast never guesses that something went wrong.
   */
  it("answers resolved when the record names some other card", () => {
    const other = {
      lastCard: { seat: 2, cardId: "reaction-nuehue", turnNumber: 3, outcome: "negated" },
    };

    expect(castOutcome(other, played)).toBe("resolved");
    expect(castOutcome({ lastCard: null }, played)).toBe("resolved");
    expect(castOutcome({}, played)).toBe("resolved");
  });

  /**
   * A pending card is waiting in a window and its rule has not run, so there is nothing to land. The
   * board stage comes back for the **second** moment, when the window shuts and the card resolves.
   */
  it("gives a pending card no board stage, and gives it one once it resolves", () => {
    expect(castsOnBoard("action-banana-peel", "pending")).toBe(false);
    expect(castsOnBoard("action-banana-peel", "resolved")).toBe(true);
  });

  /** A Nuehue stopped it, so nothing ever happened on the board and nothing is drawn there. */
  it("gives a negated card no board stage at all", () => {
    expect(castsOnBoard("action-banana-peel", "negated")).toBe(false);
  });

  /**
   * A nullified card **does** get one, and this is the branch that is easiest to get backwards. An
   * aura refused the card, and the board stage lights the aura's fields instead of the card's own
   * target: the player sees the card go to the board, the hatched region answer, and the card grey.
   * Not drawing it would make the cancellation look like a bug in the hand.
   */
  it("keeps the board stage for a nullified card, which lights the aura instead", () => {
    expect(castsOnBoard("action-banana-peel", "nullified")).toBe(true);
  });

  /** A card that never had a board stage does not gain one from an outcome. */
  it("does not give a roll card a board stage whatever became of it", () => {
    for (const outcome of ["resolved", "pending", "negated", "nullified"]) {
      expect(castsOnBoard("action-angel-die", outcome)).toBe(false);
    }
  });
});
