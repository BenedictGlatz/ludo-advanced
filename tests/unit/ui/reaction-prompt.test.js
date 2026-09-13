/**
 * What the reaction strip says, and to whom it offers Decline. Issue #77.
 *
 * `reaction-prompt.js` is pure and imports no jQuery, so it runs under `environment: "node"` like
 * `menu-screen.js` does. What it can be asked is the one decision in the strip that was wrong: whether
 * the Decline button is drawn for a player who was never asked.
 *
 * The playtest report was "when I hold no reaction card I still get an Ablehnen prompt". The window
 * itself was right, it only opens when somebody at the table can use it; the strip was drawing its
 * button for whoever was looking. That the button is actually on screen for the seat being asked is
 * `tests/e2e/hand-secrecy.spec.js` and `reaction-prompt.spec.js`.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { TRIGGER } from "../../../src/core/cards/vocabulary.js";
import { createGameState, nextState } from "../../../src/state/game-state.js";
import { initI18n } from "../../../src/i18n/index.js";
import { reactionPrompt, windowLine } from "../../../src/ui/reaction-prompt.js";

/** A four-seat match where seat 0 rolls and seats 1 and 3 may answer; seat 1 is a bot. */
function withWindow(extra = {}) {
  return nextState(createGameState(4), {
    bots: [1],
    reactionWindow: {
      trigger: TRIGGER.ON_ROLL,
      actor: 0,
      eligible: [1, 3],
      declined: [],
      played: [],
      ...extra,
    },
  });
}

describe("the reaction strip", () => {
  beforeAll(async () => {
    await initI18n("de");
  });

  it("names who did what, and every card already played into the window", () => {
    const state = withWindow({
      played: [{ seat: 2, cardId: "reaction-devil-die", target: {} }],
    });

    const line = windowLine(state, state.reactionWindow);

    expect(line).toContain("Spieler 1 würfelt");
    expect(line).toContain("Spieler 3:");
  });

  it("offers Decline to the seat being asked, when that seat is a person here", () => {
    const { line, decline } = reactionPrompt(withWindow(), true);

    expect(decline).toBe(true);
    expect(line).not.toContain("Warte auf");
  });

  /**
   * The bug in one case. `eligible[0]` is a bot for the 900 ms its card play waits out, and the person
   * at the screen holds nothing that could answer. They are told what the game is waiting for, and
   * given no button, because a Decline pressed here would have answered the window for the bot.
   */
  it("offers no Decline, and says who it is waiting for, when nobody here is being asked", () => {
    const { line, decline } = reactionPrompt(withWindow(), false);

    expect(decline).toBe(false);
    expect(line).toContain("Spieler 1 würfelt");
    expect(line).toContain("Warte auf Bot 2");
  });

  it("names the next eligible seat once the first has answered", () => {
    const { line } = reactionPrompt(withWindow({ eligible: [3], declined: [1] }), false);

    expect(line).toContain("Warte auf Spieler 4");
  });
});
