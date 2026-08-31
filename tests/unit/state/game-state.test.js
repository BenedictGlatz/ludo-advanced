import { describe, expect, it } from "vitest";

import { PAWNS_PER_PLAYER, START_R } from "../../../src/core/board.js";
import { createModifiers } from "../../../src/core/roll.js";
import {
  MATCH_STATUS,
  TURN_PHASE,
  clearedTurnFields,
  createGameState,
  nextState,
} from "../../../src/state/game-state.js";
import { isDeeplyFrozen } from "../../../src/state/freeze.js";

describe("createGameState (FR-01)", () => {
  it("starts every player with four pawns in their start area", () => {
    for (const playerCount of [2, 3, 4]) {
      const state = createGameState(playerCount);

      expect(state.playerCount).toBe(playerCount);
      expect(state.pawns).toHaveLength(playerCount * PAWNS_PER_PLAYER);
      expect(state.pawns.every((pawn) => pawn.r === START_R)).toBe(true);
    }
  });

  it("starts with player 0 to move, on turn 1, waiting to draw", () => {
    const state = createGameState(4);

    expect(state.activePlayer).toBe(0);
    expect(state.turnNumber).toBe(1);
    expect(state.phase).toBe(TURN_PHASE.DRAW);
    expect(state.status).toBe(MATCH_STATUS.RUNNING);
    expect(state.winner).toBeNull();
  });

  it("starts with nothing drawn, chosen, rolled, selected or refused", () => {
    const state = createGameState(2);

    expect(state.hand).toEqual([]);
    expect(state.legalMoves).toEqual([]);
    expect(state.chosenDie).toBeNull();
    expect(state.roll).toBeNull();
    expect(state.selectedPawn).toBeNull();
    expect(state.pendingMove).toBeNull();
    expect(state.refusalReason).toBeNull();
  });

  it("refuses a player count outside 2 to 4", () => {
    for (const bad of [0, 1, 5, 2.5, "3", null]) {
      expect(() => createGameState(bad)).toThrow(RangeError);
    }
  });
});

describe("the state is frozen, so `ui/` cannot write to it (NFR-01)", () => {
  // ES modules run in strict mode, so an assignment to a frozen object throws rather than being
  // silently dropped. This is the layering rule holding even when somebody forgets it.
  it("throws when a field is assigned", () => {
    const state = createGameState(2);

    expect(() => {
      state.activePlayer = 3;
    }).toThrow(TypeError);
  });

  it("throws when the pawn list is written to", () => {
    const state = createGameState(2);

    expect(() => state.pawns.push({ player: 0, pawn: 9, r: 0 })).toThrow(TypeError);
  });

  it("throws when a single pawn is moved by hand", () => {
    const state = createGameState(2);

    expect(() => {
      state.pawns[0].r = 30;
    }).toThrow(TypeError);
  });

  it("has no writable corner anywhere in it, whatever fields it grows", () => {
    // The three tests above name the fields they check, so a field added tomorrow is not covered by
    // any of them. This one covers the whole shape, which is what the switch to a generic deep freeze
    // bought. It is the test that fails when a new nested field arrives unfrozen.
    expect(isDeeplyFrozen(createGameState(4))).toBe(true);
    expect(isDeeplyFrozen(nextState(createGameState(4), { hand: [2, 4, 6] }))).toBe(true);
  });
});

describe("nextState", () => {
  it("returns a new object and leaves the old one exactly as it was", () => {
    const before = createGameState(2);
    const after = nextState(before, { activePlayer: 1 });

    expect(after).not.toBe(before);
    expect(after.activePlayer).toBe(1);
    expect(before.activePlayer).toBe(0);
  });

  it("carries every unchanged field over", () => {
    const before = createGameState(3);
    const after = nextState(before, { turnNumber: 7 });

    expect(after.playerCount).toBe(3);
    expect(after.pawns).toBe(before.pawns);
    expect(after.phase).toBe(before.phase);
  });

  it("freezes what it produces, so the next writer fails too", () => {
    const after = nextState(createGameState(2), { turnNumber: 2 });

    expect(() => {
      after.turnNumber = 3;
    }).toThrow(TypeError);
  });
});

describe("clearedTurnFields", () => {
  it("hands out a fresh empty array every time, never a shared one", () => {
    expect(clearedTurnFields().hand).not.toBe(clearedTurnFields().hand);
    expect(clearedTurnFields().legalMoves).not.toBe(clearedTurnFields().legalMoves);
  });

  it("clears everything that belongs to a single turn", () => {
    expect(clearedTurnFields()).toEqual({
      hand: [],
      chosenDie: null,
      roll: null,
      rollSteps: [],
      legalMoves: [],
      selectedPawn: null,
      pendingMove: null,
      refusalReason: null,
      modifiers: createModifiers(),
      cardsPlayed: {},
      cardBudget: {},
      reactionsLocked: false,
      reactionWindow: null,
      pendingCard: null,
    });
  });

  /**
   * The list above is exhaustive by assertion rather than by review.
   *
   * Issue #38 added six turn-level fields at once, and the failure mode is not a wrong value: it is a
   * field that a card writes and nothing clears, which leaks a roll modifier or a spent budget into
   * the next player's turn. That is invisible in every other test, because every other test looks at
   * one turn. Comparing against a fresh match is what catches it.
   */
  it("leaves nothing behind that a fresh match does not have", () => {
    const fresh = createGameState(4);

    for (const [field, value] of Object.entries(clearedTurnFields())) {
      expect({ field, value }).toEqual({ field, value: fresh[field] });
    }
  });
});
