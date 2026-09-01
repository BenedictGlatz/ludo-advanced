/**
 * The translator between the game state and a card's context, and the target check. Issue #38, FR-26.
 *
 * Two things worth testing here that nothing else can reach:
 *
 * 1. **The context is built from the right fields.** A field mapped to the wrong name is a card that
 *    silently sees `undefined`, and `effects.test.js` cannot catch it because it builds its own contexts.
 * 2. **Every target kind is validated.** Seven kinds, and only three of them are exercised by playing an
 *    actual card in the other tests. A kind whose check is wrong is a card the player can aim at nonsense.
 */

import { describe, expect, it } from "vitest";

import { CONTEXT_FIELDS } from "../../../src/core/cards/context.js";
import { TARGET } from "../../../src/core/cards/vocabulary.js";
import { SKILL_CARDS } from "../../../src/core/cards/catalogue.js";
import { createGameState, nextState } from "../../../src/state/game-state.js";
import { REJECTED } from "../../../src/state/rejections.js";
import {
  MINIMUM_DIE,
  checkPlayable,
  checkTarget,
  contextFor,
} from "../../../src/state/skill-play.js";
import { pawnsAt } from "../../helpers/fixtures.js";

const deps = { rng: () => 0.5 };

function state(changes = {}) {
  return nextState(createGameState(4), { chosenDie: 6, ...changes });
}

describe("contextFor", () => {
  it("fills in every field an effect is allowed to read", () => {
    const context = contextFor(state(), { seat: 2, target: { square: 7 } }, deps);

    for (const field of CONTEXT_FIELDS) {
      expect(Object.hasOwn(context, field), `missing ${field}`).toBe(true);
    }
  });

  /**
   * The state calls it the seat that played the card and an effect calls it the actor, because an effect
   * does not know what a seat is. The rename is one line and it went wrong once: three effect tests failed
   * with `{ undefined: 2 }` because `contextFor` destructured `actor` from an entry that carries `seat`.
   */
  it("renames the playing seat to the actor, which is what an effect reads", () => {
    const context = contextFor(state(), { seat: 3, target: {} }, deps);

    expect(context.actor).toBe(3);
    expect(context.activePlayer).toBe(0);
  });

  it("maps the three skill card fields onto the names an effect uses", () => {
    const built = state({
      skillPool: ["action-rock"],
      skillDiscard: ["action-yeet"],
      skillHands: { 0: ["action-angel-die"], 1: [], 2: [], 3: [] },
    });
    const context = contextFor(built, { seat: 0 }, deps);

    expect(context.pool).toEqual(["action-rock"]);
    expect(context.discard).toEqual(["action-yeet"]);
    expect(context.hands[0]).toEqual(["action-angel-die"]);
  });

  it("hands the injected RNG straight through, never a global one (NFR-09)", () => {
    expect(contextFor(state(), { seat: 0 }, deps).rng).toBe(deps.rng);
  });
});

describe("checkTarget", () => {
  const board = state({ pawns: pawnsAt(4, { "0.0": 12, "1.0": 5 }) });

  /** A card that asks for exactly this target kind, taken from the real catalogue. */
  function cardNeeding(kind) {
    const card = SKILL_CARDS.find(
      (entry) => entry.targets.includes(kind) && entry.targets.length === 1
    );

    expect(card, `no single-target card needs ${kind}`).toBeDefined();
    return card.id;
  }

  it("accepts a card that needs nothing, with nothing given", () => {
    expect(checkTarget(board, "action-angel-die", {}, 0)).toBeNull();
  });

  it("accepts each kind of target when it is the right shape", () => {
    const good = {
      [TARGET.OWN_PAWN]: { pawn: { player: 0, pawn: 0 } },
      [TARGET.ENEMY_PAWN]: { pawn: { player: 1, pawn: 0 } },
      [TARGET.TRACK_SQUARE]: { square: 39 },
      [TARGET.PLAYER]: { player: 2 },
      [TARGET.NUMBER]: { number: 3 },
    };

    for (const [kind, target] of Object.entries(good)) {
      expect(checkTarget(board, cardNeeding(kind), target, 0), kind).toBeNull();
    }
  });

  /**
   * The two rejections are different situations for the player, so they are different reasons: "you have
   * not picked a pawn yet" is a prompt and "that is not yours" is a mistake. The rule is whether anything
   * was named at all.
   */
  it("asks for a missing target and refuses a wrong one", () => {
    const card = cardNeeding(TARGET.OWN_PAWN);

    expect(checkTarget(board, card, {}, 0)).toBe(REJECTED.NEEDS_TARGET);
    expect(checkTarget(board, card, { pawn: { player: 1, pawn: 0 } }, 0)).toBe(REJECTED.BAD_TARGET);
  });

  it("refuses a square that is not one of the forty", () => {
    const card = cardNeeding(TARGET.TRACK_SQUARE);

    for (const square of [-1, 40, 1.5, "7"]) {
      expect(checkTarget(board, card, { square }, 0), String(square)).toBe(REJECTED.BAD_TARGET);
    }
  });

  it("refuses a pawn number no player has, and a seat nobody is sitting in", () => {
    const card = cardNeeding(TARGET.OWN_PAWN);

    expect(checkTarget(board, card, { pawn: { player: 0, pawn: 4 } }, 0)).toBe(REJECTED.BAD_TARGET);
    expect(checkTarget(board, card, { pawn: { player: 9, pawn: 0 } }, 0)).toBe(REJECTED.BAD_TARGET);
  });

  /**
   * A key that is present but holds nonsense counts as **named**, so the answer is "that target is wrong"
   * and not "you have not picked one yet". The distinction is whether the player pointed at something,
   * and `{ pawn: null }` is pointing at something that does not exist.
   */
  it("refuses a pawn reference that is not a pawn", () => {
    const card = cardNeeding(TARGET.OWN_PAWN);

    for (const pawn of [null, 3, "0.0", {}]) {
      expect(checkTarget(board, card, { pawn }, 0), JSON.stringify(pawn)).toBe(REJECTED.BAD_TARGET);
    }
  });

  it("refuses naming yourself as the opponent Tax Fraud steals from", () => {
    expect(checkTarget(board, "action-tax-fraud", { player: 0 }, 0)).toBe(REJECTED.BAD_TARGET);
  });

  /**
   * Two cards need two targets each, and a card play is only complete when **both** are in. That is why
   * the picker asks one question at a time.
   */
  it("still asks when one of two targets is in and the other is not", () => {
    const half = { pawn: { player: 0, pawn: 0 } };

    expect(checkTarget(board, "action-hyperbeam", half, 0)).toBe(REJECTED.BAD_TARGET);
    expect(checkTarget(board, "action-hyperbeam", { ...half, direction: -1 }, 0)).toBeNull();
  });

  it("refuses a direction that is not forwards or backwards", () => {
    const target = { pawn: { player: 0, pawn: 0 }, direction: 2 };

    expect(checkTarget(board, "action-hyperbeam", target, 0)).toBe(REJECTED.BAD_TARGET);
  });

  it("accepts either of the two options Aight Imma Head Out offers", () => {
    for (const choice of ["advance", "retreat"]) {
      const target = { pawn: { player: 0, pawn: 0 }, choice };

      expect(checkTarget(board, "action-head-out", target, 0), choice).toBeNull();
    }
  });
});

describe("checkPlayable", () => {
  /**
   * 67's floor, and the only playability rule in the game that is not a target. On a D2 or a D4 "roll a
   * 6" is impossible rather than unlikely, so the card is not offered at all.
   */
  it("refuses 67 on a die too small to roll a six, and allows it on one that can", () => {
    expect(checkPlayable(state({ chosenDie: 4 }), "action-sixty-seven")).toBe(
      REJECTED.CARD_NOT_PLAYABLE_NOW
    );
    expect(checkPlayable(state({ chosenDie: 6 }), "action-sixty-seven")).toBeNull();
    expect(checkPlayable(state({ chosenDie: 20 }), "action-sixty-seven")).toBeNull();
  });

  it("refuses it before a die has been chosen at all", () => {
    expect(checkPlayable(state({ chosenDie: null }), "action-sixty-seven")).toBe(
      REJECTED.CARD_NOT_PLAYABLE_NOW
    );
  });

  it("has nothing to say about the other 28 cards", () => {
    for (const card of SKILL_CARDS) {
      if (Object.hasOwn(MINIMUM_DIE, card.id)) continue;

      expect(checkPlayable(state({ chosenDie: 2 }), card.id), card.id).toBeNull();
    }
  });
});
