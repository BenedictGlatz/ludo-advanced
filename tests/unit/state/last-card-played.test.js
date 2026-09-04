/**
 * The one state field that exists for the screen. Issue #82.
 *
 * ## Why it is a file of its own
 *
 * These cases belong in `intents-cards.test.js`, which is the file that dispatches card intents for
 * real. That file is at exactly 299 lines, one under NFR-02's limit, so the cases would have cost it a
 * split anyway. Splitting at a seam that is already there beats compressing one that is not, and the
 * seam here is a real one: every case in that file is about a **rule**, and `lastCardPlayed` carries
 * no rule at all.
 *
 * ## What is actually at risk
 *
 * A bot plays cards now, and a card played by somebody who is not at the keyboard is invisible: the
 * card goes to the discard pile with every other card of the match, and several cards leave the board
 * looking exactly as it did before. So the field is the only evidence a play happened, and there are
 * three ways to get it wrong, one per case below: never write it, write it on only one of the two
 * paths a card play takes, or write it and never clear it.
 */

import { describe, expect, it } from "vitest";

import { fixedDieSource } from "../../../src/core/dice-source.js";
import { TURN_PHASE, createGameState, nextState } from "../../../src/state/game-state.js";
import { INTENT, dispatch } from "../../../src/state/intents.js";
import { INTENT_CARD } from "../../../src/state/intents-cards.js";

const deps = { rng: () => 0, diceSource: fixedDieSource(6) };

/** A four-player state in the action phase, with a chosen die and the given hands. */
function inActionPhase(hands) {
  return nextState(createGameState(4), {
    phase: TURN_PHASE.ACTION,
    chosenDie: 6,
    hand: [6],
    skillHands: { 0: [], 1: [], 2: [], 3: [], ...hands },
  });
}

const play = (state, seat, cardId, target) =>
  dispatch(state, { type: INTENT_CARD.PLAY_CARD, seat, cardId, target }, deps);

describe("lastCardPlayed", () => {
  it("is empty in a fresh match", () => {
    expect(createGameState(4).lastCardPlayed).toBeNull();
  });

  it("records an Action card and the seat that played it", () => {
    const state = inActionPhase({ 0: ["action-angel-die"] });

    expect(play(state, 0, "action-angel-die").state.lastCardPlayed).toEqual({
      seat: 0,
      cardId: "action-angel-die",
    });
  });

  /**
   * The path that is easy to miss. An Action card that somebody can answer does **not** resolve when
   * it is played: it waits in `pendingCard` while a window is open. The field is written when the card
   * leaves the hand, which is the moment the player did something, and not when its rule runs.
   */
  it("records an Action card that opened a window, before its rule has run", () => {
    const state = inActionPhase({ 0: ["action-angel-die"], 2: ["reaction-nuehue"] });
    const result = play(state, 0, "action-angel-die");

    expect(result.state.reactionWindow).not.toBeNull();
    expect(result.state.lastCardPlayed).toEqual({ seat: 0, cardId: "action-angel-die" });
  });

  /** The second path a card play takes: into an open window, by a seat that is not the active one. */
  it("records a Reaction card and names the seat that answered", () => {
    const state = inActionPhase({ 0: ["action-angel-die"], 2: ["reaction-nuehue"] });
    const open = play(state, 0, "action-angel-die").state;

    expect(play(open, 2, "reaction-nuehue").state.lastCardPlayed).toEqual({
      seat: 2,
      cardId: "reaction-nuehue",
    });
  });

  /**
   * The third way to get it wrong, and the only one with a visible symptom: a strip that keeps
   * announcing a card somebody played a turn ago. `clearedTurnFields` is what stops it, and
   * `game-state.test.js` asserts the field is in that list; this asserts it through a real turn.
   */
  it("is gone by the next turn", () => {
    const state = inActionPhase({ 0: ["action-angel-die"] });
    let current = play(state, 0, "action-angel-die").state;

    // The turn walked to its end through the steps the loop takes for itself. A D6 plus Angel Die's
    // D8 with an RNG of 0 is a 1 and a 1, so a pawn in the yard cannot leave and the turn passes with
    // no move in it, which is fine: what is under test is the handover.
    const steps = [INTENT.SKIP_ACTION, INTENT.ROLL_DIE, INTENT.CLOSE_WINDOW, INTENT.END_TURN];
    for (let pass = 0; pass < 4 && current.turnNumber === 1; pass += 1) {
      for (const type of steps) {
        const result = dispatch(current, { type }, deps);
        if (result.accepted) current = result.state;
      }
    }

    expect(current.turnNumber).toBe(2);
    expect(current.lastCardPlayed).toBeNull();
  });
});
