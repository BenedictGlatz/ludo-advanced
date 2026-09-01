/**
 * One test per card effect: a snapshot in, a patch out. Issue #38, requirement FR-26.
 *
 * This file is the reason effects take a flat context rather than the game state. Every case below is
 * three or four literals and one assertion. Against the state object each would need a started match, a
 * chosen die and a scripted RNG, and the tests would be about the builder rather than about the card.
 *
 * What is deliberately **not** tested here: whether a status actually stops a pawn. That is
 * `move-rules.test.js`'s question, and the split is the point. A card writes a fact and movement reads
 * it; testing both in one place would hide which of the two is wrong when it breaks.
 */

import { describe, expect, it } from "vitest";

import { createContext } from "../../../../src/core/cards/context.js";
import { EFFECTS, effectFor, hasEffect } from "../../../../src/core/cards/effects/index.js";
import { CARD_COUNT, cardIds } from "../../../../src/core/cards/catalogue.js";
import { SKILL_HAND_LIMIT } from "../../../../src/core/skill-pool.js";
import { STATUS } from "../../../../src/core/statuses.js";

/** Run one card against a context, and hand back its patch. */
function play(cardId, fields = {}) {
  return effectFor(cardId)(createContext(fields));
}

describe("the effect table is the FR-26 contract", () => {
  it("names only cards that are really in the catalogue", () => {
    for (const cardId of Object.keys(EFFECTS)) {
      expect(cardIds()).toContain(cardId);
    }
  });

  /**
   * All 29, which is the assertion that closes issue #38's card work.
   *
   * The count is asserted rather than the list, so this one test tracked the implementation from 17 to
   * 29 without being edited for each card, and it now says the set is complete rather than implying it.
   */
  it("covers all 29 cards", () => {
    expect(Object.keys(EFFECTS)).toHaveLength(CARD_COUNT);

    for (const cardId of cardIds()) {
      expect(hasEffect(cardId), `${cardId} has no rule`).toBe(true);
    }
  });

  /**
   * The missing-effect branch is unreachable through the shipped catalogue now that all 29 are written,
   * and it is kept and tested anyway: `hasEffect` is what let the catalogue ship two commits before the
   * effects, and it is what a 30th card will land on.
   */
  it("refuses to hand out an effect for a card that has none", () => {
    expect(hasEffect("action-not-a-card")).toBe(false);
    expect(() => effectFor("action-not-a-card")).toThrow(/has no effect/);
  });
});

describe("the five cards that change the roll", () => {
  it("Critical Success asks for the higher of two rolls", () => {
    expect(play("action-critical-success").modifiers.advantage).toBe(true);
  });

  it("Critical Failure asks for the lower of two rolls", () => {
    expect(play("reaction-critical-failure").modifiers.disadvantage).toBe(true);
  });

  it("Angel Die adds a D8 and Devil Die subtracts one", () => {
    expect(play("action-angel-die").modifiers.addDice).toEqual([8]);
    expect(play("reaction-devil-die").modifiers.subDice).toEqual([8]);
  });

  it("Speedrun doubles the finished roll", () => {
    expect(play("action-speedrun").modifiers.multiplier).toBe(2);
  });

  it("FR FR names the roll from the number the player gave", () => {
    expect(play("action-fr-fr", { target: { number: 4 } }).modifiers.fixed).toBe(4);
  });

  /**
   * The debuffs are played by an opponent and change the **active player's** roll, and the effects do not
   * mention either seat. `modifiers` belongs to the turn, and a turn has one roll in it, which is why the
   * two debuffs are written identically to the two buffs.
   */
  it("changes the turn's roll, not the roll of whoever played the card", () => {
    const patch = play("reaction-devil-die", { actor: 3, activePlayer: 0 });

    expect(patch).toEqual({ modifiers: expect.objectContaining({ subDice: [8] }) });
  });
});

describe("the cards that act on cards", () => {
  it("Pot of Greed draws two Action cards and leaves the Reactions alone", () => {
    const patch = play("action-pot-of-greed", {
      actor: 1,
      pool: ["reaction-nuehue", "action-angel-die", "action-double-dip", "reaction-devil-die"],
      hands: { 1: [] },
      rng: () => 0,
    });

    expect(patch.hands[1]).toHaveLength(2);
    expect(patch.hands[1].every((id) => id.startsWith("action-"))).toBe(true);
    expect(patch.pool).toHaveLength(2);
  });

  /**
   * The closed accounting rule doing its job (FR-27). A card is not created out of nowhere just because a
   * card said "draw", and a pool with no Action card left in it is an ordinary situation.
   */
  it("Pot of Greed draws nothing when the pool holds no Action card", () => {
    const patch = play("action-pot-of-greed", {
      actor: 1,
      pool: ["reaction-nuehue"],
      hands: { 1: [] },
    });

    expect(patch.hands[1]).toEqual([]);
    expect(patch.pool).toEqual(["reaction-nuehue"]);
  });

  it("Pot of Greed stops at the hand limit", () => {
    const full = Array.from({ length: SKILL_HAND_LIMIT }, () => "action-rock");
    const patch = play("action-pot-of-greed", {
      actor: 1,
      pool: ["action-angel-die"],
      hands: { 1: full },
    });

    expect(patch.hands[1]).toHaveLength(SKILL_HAND_LIMIT);
  });

  it("Double Dip raises only its own player's budget", () => {
    const patch = play("action-double-dip", { actor: 2, cardBudget: { 0: 1 } });

    expect(patch.cardBudget).toEqual({ 0: 1, 2: 2 });
  });

  it("No Take-Backsies shuts the rest of the turn's windows and touches nothing else", () => {
    expect(play("action-no-take-backsies")).toEqual({ reactionsLocked: true });
  });

  /**
   * Nühü is the one effect whose answer is not board state. It cannot cancel anything itself, because an
   * effect never sees the window it was played into.
   */
  it("Nühü returns an instruction and changes no field", () => {
    expect(play("reaction-nuehue")).toEqual({ negate: true });
  });

  it("Tax Fraud moves one card from the victim's hand to the thief's", () => {
    const patch = play("action-tax-fraud", {
      actor: 0,
      target: { player: 2 },
      hands: { 0: [], 2: ["action-rock", "action-angel-die"] },
      rng: () => 0,
    });

    expect(patch.hands[2]).toEqual(["action-angel-die"]);
    expect(patch.hands[0]).toEqual(["action-rock"]);
  });

  it("Tax Fraud does nothing to an empty hand, so no card is invented", () => {
    const patch = play("action-tax-fraud", {
      actor: 0,
      target: { player: 2 },
      hands: { 0: [], 2: [] },
    });

    expect(patch).toEqual({});
  });
});

describe("the cards that leave a status behind", () => {
  const pawn = { player: 1, pawn: 2 };

  it("Hold Pawn holds the named pawn for exactly this turn", () => {
    const patch = play("reaction-hold-pawn", { turnNumber: 9, target: { pawn } });

    expect(patch.statuses).toEqual([
      { kind: STATUS.HELD, player: 1, pawn: 2, until: 10, source: "reaction-hold-pawn" },
    ]);
  });

  /**
   * One entry for the whole board rather than one per pawn, which is what `hasStatus` matching loosely
   * upwards is for. Sixteen entries would say the same thing and would have to be kept in step.
   */
  it("The Purge is board-wide and lasts one round, however many players there are", () => {
    for (const playerCount of [2, 3, 4]) {
      const patch = play("reaction-the-purge", { turnNumber: 5, playerCount });

      expect(patch.statuses[0]).toMatchObject({
        kind: STATUS.PURGE,
        player: null,
        pawn: null,
        until: 5 + playerCount,
      });
    }
  });

  it("Rock goes on the player's own pawn, for two rounds", () => {
    const patch = play("action-rock", {
      actor: 3,
      turnNumber: 4,
      playerCount: 4,
      target: { pawn: { player: 3, pawn: 1 } },
    });

    expect(patch.statuses[0]).toMatchObject({
      kind: STATUS.ROCK,
      player: 3,
      pawn: 1,
      until: 4 + 8,
    });
  });

  /**
   * Lock In is the one card that writes two statuses. The artwork labels it defensive, and a card that
   * only stopped you moving your own pawn would be a card that does nothing but hurt its owner.
   */
  it("Lock In both locks the pawn and protects it", () => {
    const patch = play("action-lock-in", { actor: 0, target: { pawn: { player: 0, pawn: 1 } } });
    const kinds = patch.statuses.map((entry) => entry.kind);

    expect(kinds).toContain(STATUS.LOCKED);
    expect(kinds).toContain(STATUS.ARMOURED);
    expect(patch.statuses).toHaveLength(2);
  });

  it("Built Different protects the player's own pawn for two rounds", () => {
    const patch = play("action-built-different", {
      actor: 0,
      turnNumber: 1,
      playerCount: 2,
      target: { pawn: { player: 0, pawn: 0 } },
    });

    expect(patch.statuses[0]).toMatchObject({ kind: STATUS.ARMOURED, until: 5 });
  });

  it("Ragebait taunts an opponent's pawn for one round", () => {
    const patch = play("action-ragebait", { turnNumber: 7, playerCount: 4, target: { pawn } });

    expect(patch.statuses[0]).toMatchObject({
      kind: STATUS.RAGEBAIT,
      player: 1,
      pawn: 2,
      until: 11,
    });
  });
});

describe("every effect leaves the snapshot alone", () => {
  /**
   * A patch is a new object and the snapshot it came from is untouched. That is what makes the reaction
   * window's "apply in order" loop safe, and it is easy to break by accident: `statuses.push(...)` looks
   * exactly like `addStatus` at a glance and would corrupt the state of a match mid-window.
   */
  it("never mutates what it was given", () => {
    const cards = {
      "action-critical-success": {},
      "action-angel-die": {},
      "action-rock": { target: { pawn: { player: 0, pawn: 0 } } },
      "action-double-dip": {},
      "action-tax-fraud": { target: { player: 2 }, hands: { 0: [], 2: ["action-rock"] } },
    };

    for (const [cardId, fields] of Object.entries(cards)) {
      const context = createContext(fields);
      const before = JSON.stringify({
        statuses: context.statuses,
        modifiers: context.modifiers,
        hands: context.hands,
        cardBudget: context.cardBudget,
      });

      effectFor(cardId)(context);

      expect(
        JSON.stringify({
          statuses: context.statuses,
          modifiers: context.modifiers,
          hands: context.hands,
          cardBudget: context.cardBudget,
        }),
        `${cardId} mutated its context`
      ).toBe(before);
    }
  });
});
