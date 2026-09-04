/**
 * What the win screen says, and how it tells a win from an abandoned match. Design spec 04, D40.
 *
 * `overlay-screens.js` is pure and testable for the same reason `pool-screen.js` is: it takes a state
 * object and returns a description, and it imports the two vocabulary tables out of
 * `overlay-vocabulary.js` rather than out of `overlay-view.js`, which would have pulled jQuery in and
 * failed under `environment: "node"`.
 *
 * **This file exists because a field was added that nothing checked.** `outcome` is the attribute design
 * spec 04 asked the DOM contract for, so that `overlay.css` can draw a win in the winner's colour at
 * `--text-2xl` and an abandoned match in muted grey. Both statuses arrive at the same `data-screen="win"`,
 * so the field is the only thing keeping them apart, and a screen that silently returned the wrong one
 * would look like a styling bug rather than a logic one.
 *
 * The rest of the flow, that the screen actually opens and that the buttons do what they say, is covered
 * by `tests/e2e/match-flow.spec.js` and `tests/e2e/win.spec.js`.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { MATCH_STATUS } from "../../../src/state/game-state.js";
import { initI18n } from "../../../src/i18n/index.js";
import { OVERLAY_SCREEN } from "../../../src/ui/overlay-vocabulary.js";
import { screenDescription } from "../../../src/ui/overlay-screens.js";

/**
 * The smallest state the win screen reads: the two things it looks at plus the seats it names them from.
 *
 * Hand-built rather than played out with `startMatch`, because a match that has actually been won takes a
 * few hundred intents to reach and this screen reads three fields. `seats` is `seatsFor(2)`'s real answer,
 * so the numbering the label depends on is the numbering the game uses.
 */
function finishedMatch(status, winner, bots = []) {
  return { status, winner, seats: [0, 2], bots };
}

describe("the win screen", () => {
  beforeAll(async () => {
    await initI18n("de");
  });

  it("marks a won match as won, and names the seat that won it", () => {
    const description = screenDescription(OVERLAY_SCREEN.WIN, {
      state: finishedMatch(MATCH_STATUS.WON, 2),
    });

    expect(description.outcome).toBe("won");
    expect(description.player).toBe(2);
    expect(description.title).toContain("Spieler 2");
  });

  it("names a bot that won as a bot (FR-43)", () => {
    // The seat number is unchanged, and that is the rule from `player-labels.js`: the number says the
    // turn order, so seat 2 of two is "Bot 2" and never "Bot 1".
    const description = screenDescription(OVERLAY_SCREEN.WIN, {
      state: finishedMatch(MATCH_STATUS.WON, 2, [2]),
    });

    expect(description.title).toContain("Bot 2");
    expect(description.title).not.toContain("Spieler");
    expect(description.player).toBe(2);
  });

  /**
   * An abandoned match names nobody, and that is the point of the second value. It reaches the same
   * `match-over` phase by a different route, so without `outcome` the stylesheet would have to guess
   * from `player` being absent, which is the guess design brief 04 asks not to be made.
   */
  it("marks an abandoned match as abandoned, and names nobody", () => {
    const description = screenDescription(OVERLAY_SCREEN.WIN, {
      state: finishedMatch(MATCH_STATUS.ABANDONED, null),
    });

    expect(description.outcome).toBe("abandoned");
    expect(description.player).toBeNull();
    expect(description.title).not.toContain("Spieler");
  });

  it("offers a restart and a way back to the menu, either way", () => {
    for (const status of [MATCH_STATUS.WON, MATCH_STATUS.ABANDONED]) {
      const { buttons } = screenDescription(OVERLAY_SCREEN.WIN, {
        state: finishedMatch(status, 0),
      });

      expect(buttons.map((button) => button.action)).toEqual(["restart", "quit"]);
    }
  });
});

describe("every other screen", () => {
  beforeAll(async () => {
    await initI18n("de");
  });

  /**
   * The win screen is the only one with an outcome, and the others say so explicitly rather than leaving
   * the field off. `updateOverlay` removes the attribute for `null` and for `undefined` alike, so this is
   * about the description being honest rather than about the DOM: a screen that omitted the field would
   * read as "not decided yet" instead of "there is no outcome here".
   */
  it("has no outcome, so the attribute is never left over from a previous screen", () => {
    const screens = [
      OVERLAY_SCREEN.NONE,
      OVERLAY_SCREEN.MENU,
      OVERLAY_SCREEN.SETUP,
      OVERLAY_SCREEN.PAUSE,
    ];

    for (const screen of screens) {
      expect(screenDescription(screen).outcome ?? null, screen).toBeNull();
    }
  });

  it("names the arriving seat on the handover, because the curtain is that seat's colour", () => {
    const description = screenDescription(OVERLAY_SCREEN.HANDOVER, {
      state: finishedMatch(MATCH_STATUS.RUNNING, null),
      seat: 2,
    });

    expect(description.screen).toBe(OVERLAY_SCREEN.HANDOVER);
    expect(description.player).toBe(2);
    expect(description.buttons.map((button) => button.action)).toEqual(["ready"]);
  });
});
