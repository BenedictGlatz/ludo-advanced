/**
 * The steps the loop takes by itself. Issue #42.
 *
 * Three callers read this one list now: the game loop, the bot match test and the host's guard against
 * a guest sending a loop-owned intent. A wrong answer here is a hung turn in the first, a red suite in
 * the second, and a double roll in the third.
 */

import { describe, expect, it } from "vitest";

import { TURN_PHASE } from "../../../src/state/game-state.js";
import { INTENT } from "../../../src/state/intents.js";
import { INTENT_CARD } from "../../../src/state/intents-cards.js";
import { LOOP_OWNED_INTENTS, autoIntent, isLoopOwned } from "../../../src/state/auto-steps.js";
import { stateFor } from "../../helpers/fixtures.js";

describe("autoIntent", () => {
  it("rolls in the roll phase and closes the window in the reaction phase", () => {
    expect(autoIntent(stateFor({ phase: TURN_PHASE.ROLL }))).toEqual({ type: INTENT.ROLL_DIE });
    expect(autoIntent(stateFor({ phase: TURN_PHASE.REACTION }))).toEqual({
      type: INTENT.CLOSE_WINDOW,
    });
  });

  it("skips the action phase only when the active player holds nothing playable", () => {
    const empty = stateFor({ phase: TURN_PHASE.ACTION, activePlayer: 0 });
    expect(autoIntent(empty)).toEqual({ type: INTENT.SKIP_ACTION });

    // A real Action card with a rule behind it, in the active player's hand, with the budget unspent.
    const holding = stateFor({
      phase: TURN_PHASE.ACTION,
      activePlayer: 0,
      skillHands: { 0: ["action-double-dip"], 1: [], 2: [], 3: [] },
    });
    expect(autoIntent(holding)).toBeNull();
  });

  it("waits while a window still has somebody in it, and shuts an empty one", () => {
    const window = { trigger: "on-roll", actor: 0, eligible: [2], declined: [], played: [] };

    expect(autoIntent(stateFor({ phase: TURN_PHASE.ROLL, reactionWindow: window }))).toBeNull();
    expect(
      autoIntent(stateFor({ phase: TURN_PHASE.ROLL, reactionWindow: { ...window, eligible: [] } }))
    ).toEqual({ type: INTENT.CLOSE_WINDOW });
  });

  it("leaves the phases that wait for a person alone", () => {
    for (const phase of [TURN_PHASE.CHOOSE, TURN_PHASE.ACT, TURN_PHASE.TURN_END]) {
      expect(autoIntent(stateFor({ phase })), phase).toBeNull();
    }
  });
});

describe("the loop-owned intents", () => {
  it("are roll, close-window and end-turn, and nothing a player sends", () => {
    expect([...LOOP_OWNED_INTENTS]).toEqual([
      INTENT.ROLL_DIE,
      INTENT.CLOSE_WINDOW,
      INTENT.END_TURN,
    ]);

    for (const type of [
      INTENT.CHOOSE_DIE,
      INTENT.SKIP_ACTION,
      INTENT.SELECT_PAWN,
      INTENT.COMMIT_MOVE,
      INTENT_CARD.PLAY_CARD,
      INTENT_CARD.DECLINE_REACTION,
    ]) {
      expect(isLoopOwned(type), type).toBe(false);
    }
    expect(isLoopOwned(INTENT.ROLL_DIE)).toBe(true);
  });
});
