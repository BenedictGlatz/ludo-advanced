/**
 * A card play the aura cancels. Issue #45, requirement FR-30.
 *
 * `tests/unit/core/trap-aura.test.js` covers the rule; this file covers that it is consulted, on **both**
 * paths a card can resolve through. That split matters more than usual here, because the reason the
 * check lives in `resolveCard` rather than in the `negate` instruction is precisely that `negate` only
 * reaches one of the two paths.
 *
 * A file of its own because `intents-cards.test.js` is close enough to the 300-line NFR-02 limit that it
 * cannot take a case.
 */

import { describe, expect, it } from "vitest";

import { fixedDieSource } from "../../../src/core/dice-source.js";
import { findPawn } from "../../../src/core/pawns.js";
import { TRAP_KIND } from "../../../src/core/traps.js";
import { TURN_PHASE, createGameState, nextState } from "../../../src/state/game-state.js";
import { INTENT_CARD } from "../../../src/state/intents-cards.js";
import { dispatch } from "../../../src/state/intents.js";
import { closeWindow } from "../../../src/state/reaction-window.js";
import { resolveCard } from "../../../src/state/skill-play.js";
import { pawnsAt, rngForDice } from "../../helpers/fixtures.js";

const trap = (kind, square, owner = 2) => ({ kind, square, owner, until: null });

const deps = (dice = []) => ({ rng: rngForDice(dice), diceSource: fixedDieSource(6) });

/**
 * A four-seat state in the action phase.
 *
 * Seat 2's `r = 33` is absolute 12, and seat 0's `r = 13` is also absolute 12, so a trap laid near 12 is
 * near both. Seat 2's pawn is the one the offensive cards below are aimed at.
 */
function board({ traps = [], pawns = pawnsAt(4, { "0.0": 13, "2.0": 33 }) } = {}) {
  return nextState(createGameState(4), {
    phase: TURN_PHASE.ACTION,
    turnNumber: 7,
    chosenDie: 6,
    pawns,
    traps,
  });
}

const YEET_AT_SEAT_2 = { seat: 0, cardId: "action-yeet", target: { pawn: { player: 2, pawn: 0 } } };

describe("an offensive card inside the aura does nothing", () => {
  /**
   * Yeet aimed at a pawn standing on absolute 12, with an It's Not That Deep on 14: two squares away, so
   * inside the radius of three. The card resolves to an empty change set and says it was nullified.
   */
  it("returns no changes and reports itself nullified", () => {
    const state = board({ traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 14)] });
    const result = resolveCard(state, YEET_AT_SEAT_2, deps([[3, 6]]));

    expect(result.nullified).toBe(true);
    expect(result.changes).toEqual({});
  });

  /** The same play just outside the radius resolves normally, which is what makes the case above mean anything. */
  it("resolves normally four squares away", () => {
    const state = board({ traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 16)] });
    const result = resolveCard(state, YEET_AT_SEAT_2, deps([[3, 6]]));

    expect(result.nullified).toBe(false);
    expect(findPawn(result.changes.pawns, { player: 2, pawn: 0 }).r).toBe(30);
  });

  /**
   * The trap survives. It is only consumed by a pawn stepping on it, which is what makes the card area
   * denial rather than a one-shot shield, and it is also why the chain in `core/enter.js` needs a cap.
   */
  it("leaves the trap standing", () => {
    const laid = trap(TRAP_KIND.NOT_THAT_DEEP, 14);
    const state = board({ traps: [laid] });
    const result = resolveCard(state, YEET_AT_SEAT_2, deps([[3, 6]]));

    expect(result.nullified).toBe(true);
    expect(state.traps).toEqual([laid]);
  });

  /** A card that is not offensive is unaffected, which is the card's own wording. */
  it("does not touch a card of another category", () => {
    const state = board({ traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 14)] });
    const entry = { seat: 0, cardId: "action-rock", target: { pawn: { player: 0, pawn: 0 } } };
    const result = resolveCard(state, entry, deps());

    expect(result.nullified).toBe(false);
    expect(result.changes.statuses).toHaveLength(1);
  });

  /** 67 is offensive and names nothing on the board, so no aura can reach it. */
  it("never touches a card that names no square", () => {
    const state = board({ traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 14)] });
    const entry = { seat: 0, cardId: "action-sixty-seven", target: {} };
    const result = resolveCard(state, entry, deps());

    expect(result.nullified).toBe(false);
    expect(result.changes.modifiers).toBeDefined();
  });

  it("does not touch the trap owner's own offensive card", () => {
    const state = board({ traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 14, 0)] });
    const result = resolveCard(state, YEET_AT_SEAT_2, deps([[3, 6]]));

    expect(result.nullified).toBe(false);
  });
});

describe("the player is told, on both paths a card can resolve through", () => {
  /**
   * Why both paths matter, and why the check is not in the `negate` instruction: `negate` only reaches
   * anything while a reaction window is open. An offensive card played when nobody can react resolves
   * immediately in `playActionCard`, with no window in existence, so half the plays would have slipped
   * past the aura entirely.
   *
   * Here nobody holds a Reaction, so no window opens and the card resolves on the spot.
   */
  it("names the nullified card after an immediate resolve", () => {
    const state = nextState(board({ traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 14)] }), {
      skillHands: { 0: ["action-yeet"], 1: [], 2: [], 3: [] },
    });
    const result = dispatch(
      state,
      {
        type: INTENT_CARD.PLAY_CARD,
        seat: 0,
        cardId: "action-yeet",
        target: YEET_AT_SEAT_2.target,
      },
      deps([[3, 6]])
    );

    expect(result.accepted).toBe(true);
    expect(result.state.nullifiedCard).toBe("action-yeet");
    expect(findPawn(result.state.pawns, { player: 2, pawn: 0 }).r).toBe(33);
  });

  /**
   * The other path. Seat 1 holds a Reaction that can answer a card, so playing Yeet opens a window
   * instead of resolving, and the aura is not consulted until that window shuts.
   *
   * The card is **spent either way**, which is the decision `discardChanges` already carries: a card
   * that was played stays in the discard pile. The player could not see the trap, and losing the card
   * is the punishment the trap exists for.
   */
  it("names the nullified card after a reaction window closes", () => {
    const state = nextState(board({ traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 14)] }), {
      skillHands: { 0: ["action-yeet"], 1: ["reaction-nuehue"], 2: [], 3: [] },
    });
    const played = dispatch(
      state,
      {
        type: INTENT_CARD.PLAY_CARD,
        seat: 0,
        cardId: "action-yeet",
        target: YEET_AT_SEAT_2.target,
      },
      deps([[3, 6]])
    );

    expect(played.state.reactionWindow).not.toBeNull();
    expect(played.state.skillDiscard).toContain("action-yeet");

    const closed = closeWindow(played.state, deps([[3, 6]]));

    expect(closed.state.nullifiedCard).toBe("action-yeet");
    expect(findPawn(closed.state.pawns, { player: 2, pawn: 0 }).r).toBe(33);
  });

  it("leaves the field null when nothing was nullified", () => {
    const state = nextState(board(), {
      skillHands: { 0: ["action-yeet"], 1: [], 2: [], 3: [] },
    });
    const result = dispatch(
      state,
      {
        type: INTENT_CARD.PLAY_CARD,
        seat: 0,
        cardId: "action-yeet",
        target: YEET_AT_SEAT_2.target,
      },
      deps([[3, 6]])
    );

    expect(result.state.nullifiedCard).toBeNull();
    expect(findPawn(result.state.pawns, { player: 2, pawn: 0 }).r).toBe(30);
  });
});

describe("a card aimed at a square rather than a pawn", () => {
  /** Janky RPG names a square directly, so the aura is measured against that square. */
  it("is nullified when the square it aimed at is inside the aura", () => {
    const state = board({ traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 14)] });
    const entry = { seat: 0, cardId: "action-janky-rpg", target: { square: 12 } };

    expect(resolveCard(state, entry, deps([[5, 6]])).nullified).toBe(true);
  });

  it("resolves when it aimed outside the aura", () => {
    const state = board({ traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 30)] });
    const entry = { seat: 0, cardId: "action-janky-rpg", target: { square: 12 } };

    expect(resolveCard(state, entry, deps([[5, 6]])).nullified).toBe(false);
  });
});
