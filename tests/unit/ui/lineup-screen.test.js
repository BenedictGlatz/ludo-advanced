/**
 * What the line-up screen says. Screen S3, issue #76, design handoff 15.
 *
 * `lineup-screen.js` is pure and returns a description, so every case here is a question asked of a
 * function rather than of the DOM. That the screen opens, that a click switches a row and that the
 * match starts with the seats the screen showed is `tests/e2e/lineup.spec.js`.
 *
 * German throughout, because German is the default language and the longer of the two, and because the
 * two vocabularies this screen names seats with are German words in the locale files.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { initI18n } from "../../../src/i18n/index.js";
import { OVERLAY_SCREEN } from "../../../src/ui/overlay-vocabulary.js";
import { createLineup } from "../../../src/ui/lineup.js";
import { lineupScreen } from "../../../src/ui/lineup-screen.js";
import { screenDescription } from "../../../src/ui/overlay-screens.js";

/** A line-up of `count` seats with those seats handed to the computer. */
function lineupOf(count, bots = []) {
  const lineup = createLineup();
  lineup.begin(count);

  for (const seat of bots) lineup.setController(seat, "bot");

  return lineup.snapshot();
}

/** The `bot` position of one row, which is the one FR-01 can refuse. */
function botPosition(description, seat) {
  const row = description.seats.find((candidate) => candidate.player === seat);
  return row.choices.find((choice) => choice.value === "bot");
}

describe("the line-up screen", () => {
  beforeAll(async () => {
    await initI18n("de");
  });

  it("has one row per seat, for two, three and four players", () => {
    expect(lineupScreen(lineupOf(2)).seats).toHaveLength(2);
    expect(lineupScreen(lineupOf(3)).seats).toHaveLength(3);
    expect(lineupScreen(lineupOf(4)).seats).toHaveLength(4);
  });

  /**
   * The case a four-row drawing hides, and the reason design handoff 15 asked for the two-seat mockup
   * as well. Two players sit opposite each other, so the **seats** are 0 and 2 and there is no seat 1.
   *
   * **What the rows say is "Spieler 1 (Rot)" and "Spieler 2 (Grün)", and handoff 15 got this wrong.**
   * § D96.2 of the spec and mockup 15c both draw the second row as "Spieler 3 (Grün)", on the reading
   * that the label follows the seat number. It does not: `displayNumber` in `player-labels.js` counts
   * the seat's **position in `seats`**, which is that file's whole reason for existing. "Spieler 1 and
   * Spieler 3 with no Spieler 2" is the defect it was written to fix.
   *
   * The unusual pairing survives anyway, and it is the thing worth drawing: **Spieler 2 is green**, not
   * yellow, because the colour is keyed on the seat and the number on the position.
   */
  it("gives a two-player match rows for seats 0 and 2, and none for seat 1", () => {
    const { seats } = lineupScreen(lineupOf(2));

    expect(seats.map((row) => row.player)).toEqual([0, 2]);
    expect(seats[0].label).toBe("Spieler 1 (Rot)");
    expect(seats[1].label).toBe("Spieler 2 (Grün)");
  });

  it("renames a row when it is switched, and counts no bot separately", () => {
    // The second of the two greyscale-safe cues. The one bot in a four-seat match sits on seat 3 and
    // is "Bot 4", never "Bot 1": the number says the turn order, not how many bots there are.
    const row = lineupScreen(lineupOf(4, [3])).seats[3];

    expect(row.controller).toBe("bot");
    expect(row.label).toBe("Bot 4 (Blau)");
    expect(row.label).not.toContain("Spieler");
  });

  it("carries the seat's colour in the label, which is where NFR-12's second cue lives", () => {
    const { seats } = lineupScreen(lineupOf(4));

    expect(seats[0].label).toContain("Rot");
    expect(seats[3].label).toContain("Blau");
  });

  it("opens with every row a person and every human position pressed (D92)", () => {
    const { seats } = lineupScreen(lineupOf(4));

    for (const row of seats) {
      expect(row.controller).toBe("human");
      expect(row.choices.map((choice) => choice.value)).toEqual(["human", "bot"]);
      expect(row.choices[0].pressed).toBe(true);
      expect(row.choices[1].pressed).toBe(false);
    }
  });

  it("disables the bot position of the last remaining person, and nothing else (FR-01)", () => {
    const description = lineupScreen(lineupOf(4, [1, 2, 3]));

    expect(botPosition(description, 0).disabled).toBe(true);
    // The three seats that are already bots keep a live control: switching one back is what unlocks
    // seat 0 again, and there must be no state a player cannot get out of.
    for (const seat of [1, 2, 3]) {
      expect(botPosition(description, seat).disabled).toBe(false);
    }
  });

  it("disables nothing while a second person is still playing", () => {
    const description = lineupScreen(lineupOf(4, [2, 3]));

    for (const seat of [0, 1, 2, 3]) {
      expect(botPosition(description, seat).disabled).toBe(false);
    }
  });

  it("locks whichever seat is still a person, not seat 0 in particular (D95)", () => {
    // Seat 0 may be a bot like any other seat, so with three bots on 0, 1 and 3 the locked row is 2.
    const description = lineupScreen(lineupOf(4, [0, 1, 3]));

    expect(botPosition(description, 2).disabled).toBe(true);
    expect(botPosition(description, 0).disabled).toBe(false);
  });

  it("offers Back and then Start, with Start as the screen's one primary (D94)", () => {
    const { buttons } = lineupScreen(lineupOf(3));

    expect(buttons.map((button) => button.action)).toEqual(["back", "begin"]);
    expect(buttons.filter((button) => button.variant === "primary")).toHaveLength(1);
    expect(buttons[1].variant).toBe("primary");
  });

  /**
   * The check `menu-screen.test.js` already makes for the doors' hints, for the same reason: a missing
   * locale key comes back as the key itself or as an empty string, and either one is a screen the
   * player cannot read. Every word on this screen is new in both languages.
   */
  it("leaves no label empty, in either language", async () => {
    for (const language of ["de", "en"]) {
      await initI18n(language);
      const description = lineupScreen(lineupOf(4, [3]));

      expect(description.title.length).toBeGreaterThan(0);
      expect(description.text.length).toBeGreaterThan(0);

      for (const button of description.buttons) expect(button.label.length).toBeGreaterThan(0);

      for (const row of description.seats) {
        expect(row.label.length).toBeGreaterThan(0);
        for (const choice of row.choices) expect(choice.label.length).toBeGreaterThan(0);
      }
    }

    await initI18n("de");
  });

  it("is reached through screenDescription like every other screen", () => {
    const description = screenDescription(OVERLAY_SCREEN.LINEUP, { lineup: lineupOf(3, [2]) });

    expect(description.screen).toBe(OVERLAY_SCREEN.LINEUP);
    expect(description.seats).toHaveLength(3);
    expect(description.player).toBeNull();
  });

  /**
   * The same guard the pool overview has: a screen that describes something that is not there must not
   * render. Here it would be a line-up for a match nobody has chosen a size for.
   */
  it("falls back to nothing when no count has been chosen", () => {
    const description = screenDescription(OVERLAY_SCREEN.LINEUP, { lineup: null });

    expect(description.screen).toBe(OVERLAY_SCREEN.NONE);
  });

  it("leaves the other six screens without seat rows", () => {
    for (const screen of [
      OVERLAY_SCREEN.NONE,
      OVERLAY_SCREEN.MENU,
      OVERLAY_SCREEN.SETUP,
      OVERLAY_SCREEN.PAUSE,
    ]) {
      expect(screenDescription(screen, {}).seats ?? []).toEqual([]);
    }
  });
});
