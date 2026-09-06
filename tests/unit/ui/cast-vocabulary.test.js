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
import { castCardIds, castFamily, hasBoardStage } from "../../../src/ui/cast-vocabulary.js";

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
