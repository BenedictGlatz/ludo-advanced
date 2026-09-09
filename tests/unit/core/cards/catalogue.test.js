/**
 * The 29-card catalogue. Issue #38, requirements FR-26 and FR-28.
 *
 * The catalogue is a hand transcription of a generated artboard, so most of these tests are checking
 * the transcription rather than a rule. The counts come from section 4.3 of design handoff 03, which
 * read them off the artwork independently, so a disagreement means one of the two is wrong and both
 * get looked at.
 */

import { describe, expect, it } from "vitest";

import {
  CARD_COUNT,
  POOL_SIZE,
  SKILL_CARDS,
  assertCatalogue,
  cardById,
  cardIds,
  cardsForTrigger,
  cardsOfType,
} from "../../../../src/core/cards/catalogue.js";
import { CORE_CARDS } from "../../../../src/core/cards/catalogue-core.js";
import { EXTRA_CARDS } from "../../../../src/core/cards/catalogue-extra.js";
import {
  CATEGORY,
  COPIES_PER_CARD,
  KIND,
  TARGET,
  TRIGGER,
  TYPE,
} from "../../../../src/core/cards/vocabulary.js";

describe("the card set the Product Owner chose (FR-28)", () => {
  it("holds 29 cards, ten from artboard 6a and nineteen from 4a", () => {
    expect(CORE_CARDS).toHaveLength(10);
    expect(EXTRA_CARDS).toHaveLength(19);
    expect(CARD_COUNT).toBe(29);
  });

  it("splits 22 Action and 7 Reaction, which is what handoff 03 counted off the artwork", () => {
    expect(cardsOfType(TYPE.ACTION)).toHaveLength(22);
    expect(cardsOfType(TYPE.REACTION)).toHaveLength(7);
  });

  it("puts five cards in Movement, five in Blocking, five in Troll and four in Offensive", () => {
    const counts = { movement: 5, blocking: 5, troll: 5, offensive: 4 };

    for (const [category, expected] of Object.entries(counts)) {
      const cards = SKILL_CARDS.filter((card) => card.category === category);
      expect(cards, category).toHaveLength(expected);
    }
  });

  it("leaves the ten cards of artboard 6a without a category, rather than inventing one", () => {
    // That artboard labels a card by type and sub-kind. Reconciling the two labelling schemes is open
    // decision D28 of design handoff 03, and it is a design question.
    for (const card of CORE_CARDS) {
      expect(card.category, card.id).toBe(null);
    }
    for (const card of EXTRA_CARDS) {
      expect(Object.values(CATEGORY), card.id).toContain(card.category);
    }
  });

  it("gives every card a sub-kind, because the artwork does", () => {
    for (const card of SKILL_CARDS) {
      expect(typeof card.kind, card.id).toBe("string");
    }
  });

  it("makes a pool of 58: two copies of each card", () => {
    expect(COPIES_PER_CARD).toBe(2);
    expect(POOL_SIZE).toBe(58);
  });
});

describe("the ids, which are the contract between core/ and ui/ (FR-26)", () => {
  it("are unique", () => {
    expect(new Set(cardIds()).size).toBe(CARD_COUNT);
  });

  it("are lower-case ASCII and hyphens, with no umlaut, digit start or per cent sign", () => {
    // Nühü, 67 and Speedrun Any% are the three names that could not be transcribed literally.
    for (const id of cardIds()) {
      expect(id, id).toMatch(/^[a-z]+(-[a-z0-9]+)+$/);
    }

    expect(cardIds()).toContain("reaction-nuehue");
    expect(cardIds()).toContain("action-sixty-seven");
    expect(cardIds()).toContain("action-speedrun");
  });

  it("start with the card's own type, so a reader can tell when a card is playable from its id", () => {
    for (const card of SKILL_CARDS) {
      expect(card.id.startsWith(`${card.type}-`), card.id).toBe(true);
    }
  });

  it("look a card up in one step", () => {
    expect(cardById("action-angel-die").kind).toBe("buff");
    expect(cardById("nothing-here")).toBeUndefined();
  });
});

describe("when a card may be played (FR-23, FR-24)", () => {
  it("gives every Action card the action phase and nothing else", () => {
    for (const card of cardsOfType(TYPE.ACTION)) {
      expect(card.triggers, card.id).toEqual([TRIGGER.ACTION_PHASE]);
    }
  });

  it("never lets a Reaction card trigger in the action phase", () => {
    for (const card of cardsOfType(TYPE.REACTION)) {
      expect(card.triggers, card.id).not.toContain(TRIGGER.ACTION_PHASE);
      expect(card.triggers.length, card.id).toBeGreaterThan(0);
    }
  });

  it("has at least one Reaction for each of the three windows", () => {
    // A window that nothing can be played into would open for no reason, which the reaction prompt
    // would then have to hide again.
    for (const trigger of [TRIGGER.ON_CARD, TRIGGER.ON_ROLL, TRIGGER.ON_CAPTURE]) {
      expect(cardsForTrigger(trigger).length, trigger).toBeGreaterThan(0);
    }
  });

  it("puts the roll modifiers in the roll window and the capture answers in the capture window", () => {
    const ids = (trigger) => cardsForTrigger(trigger).map((card) => card.id);

    expect(ids(TRIGGER.ON_ROLL)).toContain("reaction-critical-failure");
    expect(ids(TRIGGER.ON_ROLL)).toContain("reaction-devil-die");
    expect(ids(TRIGGER.ON_CAPTURE)).toContain("reaction-uno-reverse");
    expect(ids(TRIGGER.ON_CAPTURE)).toContain("reaction-ghost-mode");
    expect(ids(TRIGGER.ON_CARD)).toContain("reaction-nuehue");
  });

  it("makes The Purge playable into every window, because it answers no single event", () => {
    expect(cardById("reaction-the-purge").triggers).toEqual([
      TRIGGER.ON_CARD,
      TRIGGER.ON_ROLL,
      TRIGGER.ON_CAPTURE,
    ]);
  });
});

describe("what a card asks the player to point at", () => {
  it("never combines TARGET.NONE with a real target", () => {
    for (const card of SKILL_CARDS) {
      if (card.targets.includes(TARGET.NONE)) {
        expect(card.targets, card.id).toEqual([TARGET.NONE]);
      }
    }
  });

  it("needs a target on 16 of the 29 cards", () => {
    // Worth pinning as a number: it is what the target picker of issue #34 has to cover, and the plan
    // estimated 14 before the cards were transcribed one by one.
    const needing = SKILL_CARDS.filter((card) => !card.targets.includes(TARGET.NONE));

    expect(needing).toHaveLength(16);
  });

  it("asks Hyperbeam for a pawn and a direction, which is the only two-target card", () => {
    expect(cardById("action-hyperbeam").targets).toEqual([TARGET.OWN_PAWN, TARGET.DIRECTION]);
  });

  it("asks FR FR for a number and Tax Fraud for a player, not for a pawn", () => {
    expect(cardById("action-fr-fr").targets).toEqual([TARGET.NUMBER]);
    expect(cardById("action-tax-fraud").targets).toEqual([TARGET.PLAYER]);
  });
});

describe("the load-time check, fed the mistakes a transcription actually makes", () => {
  /** A valid entry, so each test below can break exactly one thing. */
  function validCard(changes) {
    return {
      id: "action-test-card",
      type: TYPE.ACTION,
      category: null,
      kind: KIND.BUFF,
      targets: [TARGET.NONE],
      triggers: [TRIGGER.ACTION_PHASE],
      ...changes,
    };
  }

  it("accepts a valid entry, so the tests below fail for the reason they name", () => {
    expect(() => assertCatalogue([validCard()])).not.toThrow();
  });

  it("refuses the same id twice", () => {
    expect(() => assertCatalogue([validCard(), validCard()])).toThrow(/in the catalogue twice/);
  });

  it("refuses an unknown type, category or kind", () => {
    expect(() => assertCatalogue([validCard({ type: "spell" })])).toThrow(/unknown type/);
    expect(() => assertCatalogue([validCard({ category: "chaos" })])).toThrow(/unknown category/);
    expect(() => assertCatalogue([validCard({ kind: "vibes" })])).toThrow(/unknown kind/);
  });

  it("refuses an id that does not start with the card's own type", () => {
    expect(() => assertCatalogue([validCard({ id: "reaction-test-card" })])).toThrow(
      /must start with the card's own type, "action-"/
    );
  });

  it("refuses an id with an umlaut, a capital letter or a per cent sign", () => {
    for (const id of ["action-nühü", "action-Test", "action-any%", "action"]) {
      expect(() => assertCatalogue([validCard({ id })]), id).toThrow();
    }
  });

  it("refuses an empty target or trigger list, and an unknown value in either", () => {
    expect(() => assertCatalogue([validCard({ targets: [] })])).toThrow(/at least TARGET.NONE/);
    expect(() => assertCatalogue([validCard({ triggers: [] })])).toThrow(/at least one moment/);
    expect(() => assertCatalogue([validCard({ targets: ["the-moon"] })])).toThrow(/unknown target/);
    expect(() => assertCatalogue([validCard({ triggers: ["tuesday"] })])).toThrow(
      /unknown trigger/
    );
  });

  it("refuses TARGET.NONE next to a real target", () => {
    expect(() => assertCatalogue([validCard({ targets: [TARGET.NONE, TARGET.OWN_PAWN] })])).toThrow(
      /cannot be combined/
    );
  });

  it("refuses an Action card that triggers off-turn and a Reaction that triggers on-turn", () => {
    // The one cross-field check that is a rule rather than spelling: FR-23 and FR-24.
    expect(() => assertCatalogue([validCard({ triggers: [TRIGGER.ON_ROLL] })])).toThrow(
      /type "action" cannot trigger on "on-roll"/
    );
    expect(() =>
      assertCatalogue([
        validCard({
          id: "reaction-test-card",
          type: TYPE.REACTION,
          triggers: [TRIGGER.ACTION_PHASE],
        }),
      ])
    ).toThrow(/type "reaction" cannot trigger on "action-phase"/);
  });
});

describe("the catalogue is read and never edited", () => {
  it("is frozen, cards and their lists included", () => {
    expect(Object.isFrozen(SKILL_CARDS)).toBe(true);
    expect(Object.isFrozen(SKILL_CARDS[0])).toBe(true);
    expect(Object.isFrozen(SKILL_CARDS[0].targets)).toBe(true);
    expect(Object.isFrozen(SKILL_CARDS[0].triggers)).toBe(true);
  });

  it("hands out a fresh array of ids each time, so a caller cannot shorten the catalogue", () => {
    const first = cardIds();
    first.pop();

    expect(cardIds()).toHaveLength(CARD_COUNT);
  });
});
