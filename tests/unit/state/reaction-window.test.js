/**
 * The reaction window. Issue #38, requirements FR-24 and FR-25.
 *
 * Nothing here measures time, because nothing in `state/` does. A timeout is the same thing as every
 * eligible seat declining, and the view is what turns thirty seconds into that dispatch. So the cases
 * below cover **who may act, in what order effects run, and what shuts the window** and never a clock.
 */

import { describe, expect, it } from "vitest";

import { TRIGGER } from "../../../src/core/cards/vocabulary.js";
import { STATUS } from "../../../src/core/statuses.js";
import { createGameState, nextState } from "../../../src/state/game-state.js";
import {
  canReact,
  closeWindow,
  eligibleSeats,
  isWindowFinished,
  openWindow,
  recordDecline,
  recordPlay,
} from "../../../src/state/reaction-window.js";

const deps = { rng: () => 0 };

function stateWith(changes) {
  return nextState(createGameState(4), changes);
}

/** A four-player state where the given seats hold the given cards. */
function withHands(hands, extra = {}) {
  return stateWith({ skillHands: { 0: [], 1: [], 2: [], 3: [], ...hands }, ...extra });
}

describe("who may react", () => {
  it("needs a card whose triggers include this exact moment", () => {
    const state = withHands({ 1: ["reaction-devil-die"], 2: ["reaction-nuehue"] });

    // Devil Die answers the roll, Nühü answers a card. Neither answers the other's moment.
    expect(canReact(state, 1, TRIGGER.ON_ROLL)).toBe(true);
    expect(canReact(state, 1, TRIGGER.ON_CARD)).toBe(false);
    expect(canReact(state, 2, TRIGGER.ON_CARD)).toBe(true);
    expect(canReact(state, 2, TRIGGER.ON_ROLL)).toBe(false);
  });

  it("does not count an Action card, however well it would fit", () => {
    const state = withHands({ 1: ["action-angel-die"] });

    expect(canReact(state, 1, TRIGGER.ON_ROLL)).toBe(false);
  });

  /**
   * Two guards that were load-bearing while the catalogue was ahead of the effects, and are kept now
   * that all 29 cards have rules: a card the catalogue does not know, and a card with no rule. Neither
   * is reachable through the shipped game, and a 30th card lands on both.
   */
  it("does not count a card id that is not a real card", () => {
    const state = withHands({ 1: ["reaction-not-a-card"] });

    expect(canReact(state, 1, TRIGGER.ON_CAPTURE)).toBe(false);
  });

  it("does count Ghost Mode against a capture, now that it has a rule", () => {
    const state = withHands({ 1: ["reaction-ghost-mode"] });

    expect(canReact(state, 1, TRIGGER.ON_CAPTURE)).toBe(true);
    expect(canReact(state, 1, TRIGGER.ON_ROLL)).toBe(false);
  });

  it("does not count a seat that has already played its card this turn (FR-23)", () => {
    const state = withHands({ 1: ["reaction-devil-die"] }, { cardsPlayed: { 1: 1 } });

    expect(canReact(state, 1, TRIGGER.ON_ROLL)).toBe(false);
  });

  it("never lets the actor react to their own action (FR-24)", () => {
    const state = withHands({ 0: ["reaction-devil-die"], 2: ["reaction-devil-die"] });

    expect(eligibleSeats(state, TRIGGER.ON_ROLL, 0)).toEqual([2]);
  });
});

describe("opening a window", () => {
  /**
   * The rule that keeps the game playable. A window that opened every time would put a thirty-second
   * countdown in front of every roll of a game whose ordinary turn is two clicks.
   */
  it("does not open at all when nobody could use it", () => {
    expect(openWindow(withHands({}), TRIGGER.ON_ROLL, 0)).toBeNull();
  });

  it("opens with the eligible seats, nothing played and nothing declined", () => {
    const state = withHands({ 1: ["reaction-devil-die"], 3: ["reaction-hold-pawn"] });

    expect(openWindow(state, TRIGGER.ON_ROLL, 0)).toEqual({
      trigger: TRIGGER.ON_ROLL,
      actor: 0,
      eligible: [1, 3],
      declined: [],
      played: [],
    });
  });

  it("stays shut for the rest of the turn once No Take-Backsies has been played", () => {
    const state = withHands({ 1: ["reaction-devil-die"] }, { reactionsLocked: true });

    expect(openWindow(state, TRIGGER.ON_ROLL, 0)).toBeNull();
  });
});

describe("what shuts a window", () => {
  const open = { trigger: TRIGGER.ON_ROLL, actor: 0, eligible: [1, 3], declined: [], played: [] };

  /**
   * FR-25's "if everybody declines, play continues at once" needs no timer. Every play and every decline
   * shortens `eligible` by one and a seat cannot rejoin, so the list empties and the view stops waiting.
   */
  it("empties the eligible list one seat at a time, whatever each seat did", () => {
    let state = stateWith({ reactionWindow: open });
    expect(isWindowFinished(state)).toBe(false);

    state = nextState(state, recordDecline(state, 1));
    expect(state.reactionWindow.declined).toEqual([1]);
    expect(isWindowFinished(state)).toBe(false);

    state = nextState(
      state,
      recordPlay(state, { seat: 3, cardId: "reaction-devil-die", target: {} })
    );
    expect(state.reactionWindow.eligible).toEqual([]);
    expect(isWindowFinished(state)).toBe(true);
  });

  it("counts a window that never opened as finished, so no caller has to special-case null", () => {
    expect(isWindowFinished(createGameState(4))).toBe(true);
  });
});

describe("closing a window runs what it was holding", () => {
  it("applies the played cards in the order they were played", () => {
    const state = stateWith({
      reactionWindow: {
        trigger: TRIGGER.ON_ROLL,
        actor: 0,
        eligible: [],
        declined: [],
        played: [
          { seat: 1, cardId: "reaction-devil-die", target: {} },
          { seat: 3, cardId: "reaction-critical-failure", target: {} },
        ],
      },
    });
    const closed = closeWindow(state, deps);

    expect(closed.state.modifiers.subDice).toEqual([8]);
    expect(closed.state.modifiers.disadvantage).toBe(true);
    expect(closed.state.reactionWindow).toBeNull();
    expect(closed.trigger).toBe(TRIGGER.ON_ROLL);
  });

  /**
   * Two of the same card must both land, which is why `withModifier` appends to the array-valued fields
   * and overwrites the scalar ones. A merged single patch could not express this.
   */
  it("lets two copies of one card both take effect", () => {
    const state = stateWith({
      reactionWindow: {
        trigger: TRIGGER.ON_ROLL,
        actor: 0,
        eligible: [],
        declined: [],
        played: [
          { seat: 1, cardId: "reaction-devil-die", target: {} },
          { seat: 3, cardId: "reaction-devil-die", target: {} },
        ],
      },
    });

    expect(closeWindow(state, deps).state.modifiers.subDice).toEqual([8, 8]);
  });

  it("runs the card that opened the window last, after the reactions to it", () => {
    const state = stateWith({
      pendingCard: { seat: 0, cardId: "action-angel-die", target: {} },
      reactionWindow: {
        trigger: TRIGGER.ON_CARD,
        actor: 0,
        eligible: [],
        declined: [],
        played: [{ seat: 2, cardId: "reaction-the-purge", target: {} }],
      },
    });
    const closed = closeWindow(state, deps);

    expect(closed.state.modifiers.addDice).toEqual([8]);
    expect(closed.state.statuses[0].kind).toBe(STATUS.PURGE);
    expect(closed.state.pendingCard).toBeNull();
  });

  /**
   * Nühü, and the whole reason nothing resolves until the window shuts.
   *
   * Cancelling a card whose effect had already run would mean **undoing** it, and nothing in this design
   * can: `pawns`, `statuses` and `traps` are all replaced wholesale by a patch. Because the opening card
   * has not run yet, cancelling it is simply not running it.
   */
  it("does not run the opening card when a reaction cancelled it", () => {
    const state = stateWith({
      pendingCard: { seat: 0, cardId: "action-angel-die", target: {} },
      reactionWindow: {
        trigger: TRIGGER.ON_CARD,
        actor: 0,
        eligible: [],
        declined: [],
        played: [{ seat: 2, cardId: "reaction-nuehue", target: {} }],
      },
    });
    const closed = closeWindow(state, deps);

    expect(closed.negated).toBe(true);
    expect(closed.state.modifiers.addDice).toEqual([]);
  });

  it("runs nothing at all when everybody declined", () => {
    const state = stateWith({
      reactionWindow: {
        trigger: TRIGGER.ON_ROLL,
        actor: 0,
        eligible: [],
        declined: [1, 2, 3],
        played: [],
      },
    });
    const closed = closeWindow(state, deps);

    expect(closed.state.modifiers).toEqual(createGameState(4).modifiers);
    expect(closed.cancelMove).toBe(false);
    expect(closed.negated).toBe(false);
  });
});
