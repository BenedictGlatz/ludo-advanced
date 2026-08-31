/**
 * The skill card pool, hands and discard pile. Issue #38, requirements FR-22 and FR-27.
 *
 * The test that justifies this file is the last one: hundreds of draws and discards across four hands,
 * checking after every single step that the 58 cards are still all accounted for. A card that quietly
 * disappears is the most likely silent bug here. It throws nothing, breaks nothing at the time, and
 * shows up as a pool that is mysteriously thin an hour into a playtest.
 */

import { describe, expect, it } from "vitest";

import { POOL_SIZE, cardById, cardIds } from "../../../src/core/cards/catalogue.js";
import { COPIES_PER_CARD } from "../../../src/core/cards/vocabulary.js";
import { createSeededRng } from "../../../src/core/dice-source.js";
import {
  SKILL_HAND_LIMIT,
  createSkillPool,
  discardCard,
  drawSkillCard,
  totalCards,
} from "../../../src/core/skill-pool.js";

/** Four empty hands, keyed by seat, which is the shape the state holds. */
function emptyHands() {
  return { 0: [], 1: [], 2: [], 3: [] };
}

describe("createSkillPool", () => {
  it("holds all 58 cards: two copies of each of the 29", () => {
    const pool = createSkillPool(createSeededRng(1));

    expect(pool).toHaveLength(POOL_SIZE);

    for (const id of cardIds()) {
      expect(
        pool.filter((card) => card === id),
        id
      ).toHaveLength(COPIES_PER_CARD);
    }
  });

  it("holds ids and not card objects", () => {
    // Two copies of Angel Die are indistinguishable to every rule, so a reference to the same frozen
    // object twice would be a string stored twice with extra steps.
    const pool = createSkillPool(createSeededRng(1));

    for (const entry of pool) {
      expect(typeof entry).toBe("string");
      expect(cardById(entry)).toBeDefined();
    }
  });

  it("shuffles, rather than handing back catalogue order", () => {
    const ordered = cardIds().flatMap((id) => [id, id]);

    expect(createSkillPool(createSeededRng(1))).not.toEqual(ordered);
  });

  it("gives the same pool for the same seed and a different one otherwise (NFR-09)", () => {
    expect(createSkillPool(createSeededRng(7))).toEqual(createSkillPool(createSeededRng(7)));
    expect(createSkillPool(createSeededRng(7))).not.toEqual(createSkillPool(createSeededRng(8)));
  });
});

describe("drawSkillCard", () => {
  const rng = createSeededRng(3);

  it("moves one card from the pool into the hand and nowhere else", () => {
    const pool = createSkillPool(createSeededRng(3));
    const result = drawSkillCard(pool, [], [], rng);

    expect(result.hand).toEqual([result.drawn]);
    expect(result.pool).toHaveLength(POOL_SIZE - 1);
    expect(result.discard).toEqual([]);
  });

  it("mutates nothing it was given", () => {
    const pool = createSkillPool(createSeededRng(3));
    const before = [...pool];
    const hand = [];

    drawSkillCard(pool, [], hand, rng);

    expect(pool).toEqual(before);
    expect(hand).toEqual([]);
  });

  it("refuses once the hand is at the limit, and leaves the card in the pool", () => {
    // Rejected alternative: draw it and put it straight in the discard pile. That burns a card for
    // nothing and thins the pool over a match, for no gain a player would notice.
    const pool = createSkillPool(createSeededRng(3));
    const full = pool.slice(0, SKILL_HAND_LIMIT);
    const result = drawSkillCard(pool, [], full, rng);

    expect(result.drawn).toBe(null);
    expect(result.pool).toBe(pool);
    expect(result.hand).toBe(full);
  });

  it("reshuffles the discard pile into the pool when the pool runs out", () => {
    const discard = cardIds().slice(0, 5);
    const result = drawSkillCard([], discard, [], rng);

    expect(result.drawn).not.toBe(null);
    expect(discard).toContain(result.drawn);
    expect(result.discard).toEqual([]);
    expect(result.pool).toHaveLength(4);
  });

  it("refuses when pool and discard pile are both empty, rather than returning undefined", () => {
    // Only reachable if all 58 cards are in hands, which four hands of five cannot hold. Handled
    // anyway: "cannot happen" is how closed accounting stops being closed.
    const result = drawSkillCard([], [], [], rng);

    expect(result.drawn).toBe(null);
    expect(result.hand).toEqual([]);
  });

  it("can eventually draw every one of the 29 cards", () => {
    const random = createSeededRng(21);
    let pool = createSkillPool(random);
    const seen = new Set();

    while (pool.length > 0) {
      const result = drawSkillCard(pool, [], [], random);
      seen.add(result.drawn);
      pool = result.pool;
    }

    expect(seen.size).toBe(cardIds().length);
  });
});

describe("discardCard", () => {
  it("moves one copy out of the hand and onto the discard pile", () => {
    const result = discardCard(["action-yeet", "action-rock"], [], "action-yeet");

    expect(result.hand).toEqual(["action-rock"]);
    expect(result.discard).toEqual(["action-yeet"]);
  });

  it("removes one copy and not both, when a hand holds two of the same card", () => {
    const result = discardCard(["action-yeet", "action-yeet"], [], "action-yeet");

    expect(result.hand).toEqual(["action-yeet"]);
    expect(result.discard).toEqual(["action-yeet"]);
  });

  it("mutates nothing it was given", () => {
    const hand = ["action-yeet"];
    const discard = ["action-rock"];

    discardCard(hand, discard, "action-yeet");

    expect(hand).toEqual(["action-yeet"]);
    expect(discard).toEqual(["action-rock"]);
  });

  it("throws for a card the hand does not hold", () => {
    // Not a player situation: `state/` refuses the intent first. Reaching it means the rules layer
    // played a card nobody was holding.
    expect(() => discardCard([], [], "action-yeet")).toThrow(/not in that hand/);
  });
});

describe("closed accounting: every card is in exactly one place (FR-27)", () => {
  it("keeps the total at 58 over 400 random draws and discards across four hands", () => {
    const random = createSeededRng(99);
    let pool = createSkillPool(random);
    let discard = [];
    const hands = emptyHands();

    expect(totalCards({ pool, discard, hands })).toBe(POOL_SIZE);

    for (let step = 0; step < 400; step += 1) {
      const seat = step % 4;

      if (step % 3 === 2 && hands[seat].length > 0) {
        const played = discardCard(hands[seat], discard, hands[seat][0]);
        hands[seat] = played.hand;
        discard = played.discard;
      } else {
        const drawn = drawSkillCard(pool, discard, hands[seat], random);
        pool = drawn.pool;
        discard = drawn.discard;
        hands[seat] = drawn.hand;
      }

      expect(totalCards({ pool, discard, hands }), `step ${step}`).toBe(POOL_SIZE);
    }
  });

  it("never lets a hand exceed the limit, however often it draws", () => {
    const random = createSeededRng(4);
    let pool = createSkillPool(random);
    let hand = [];

    for (let step = 0; step < 50; step += 1) {
      const result = drawSkillCard(pool, [], hand, random);
      pool = result.pool;
      hand = result.hand;

      expect(hand.length).toBeLessThanOrEqual(SKILL_HAND_LIMIT);
    }

    expect(hand).toHaveLength(SKILL_HAND_LIMIT);
  });

  it("never holds more copies of one card than the catalogue defines", () => {
    // The check that would catch a reshuffle that copied instead of moving.
    const random = createSeededRng(55);
    let pool = createSkillPool(random);
    let discard = [];
    const hands = emptyHands();

    for (let step = 0; step < 300; step += 1) {
      const seat = step % 4;

      if (hands[seat].length >= SKILL_HAND_LIMIT) {
        const played = discardCard(hands[seat], discard, hands[seat][0]);
        hands[seat] = played.hand;
        discard = played.discard;
      } else {
        const drawn = drawSkillCard(pool, discard, hands[seat], random);
        pool = drawn.pool;
        discard = drawn.discard;
        hands[seat] = drawn.hand;
      }
    }

    const everywhere = [...pool, ...discard, ...Object.values(hands).flat()];

    for (const id of cardIds()) {
      expect(
        everywhere.filter((card) => card === id),
        id
      ).toHaveLength(COPIES_PER_CARD);
    }
  });
});
