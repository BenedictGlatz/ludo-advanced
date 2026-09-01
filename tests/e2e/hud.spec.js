/**
 * The HUD and the language switch. Screen S7, requirements FR-36 and FR-34, issue #39.
 *
 * These two are together in one spec because they are two halves of the same complaint: the game did
 * not say anything in words. The board had three visual cues for whose turn it was and no text, and
 * the runtime language switch that FR-34 makes a `must have` had never been rendered at all.
 *
 * **What this spec deliberately does not check** is what any of it looks like. Whether the active seat
 * is marked by a ring or a fill is design handoff 04's D36, and the stylesheet is interim. What is
 * checked is that the words are on screen, that the numbers agree with the board, and that both
 * survive a turn passing and a language change.
 */

import { expect, test } from "@playwright/test";

import { PAWNS_PER_PLAYER } from "../../src/core/board.js";
import de from "../../src/i18n/locales/de/ui.json" with { type: "json" };
import en from "../../src/i18n/locales/en/ui.json" with { type: "json" };
import { SEEDS, boardState, openMatch, playTurn } from "./helpers.js";

/** Every seat row's counts, as `{ "0": { start, track, home, cards }, ... }`. */
async function hudCounts(page) {
  return page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll(".hud__seat")].map((seat) => [
        seat.dataset.player,
        Object.fromEntries(
          [...seat.querySelectorAll(".hud__count")].map((count) => [
            count.dataset.kind,
            Number(count.querySelector(".hud__value").textContent),
          ])
        ),
      ])
    )
  );
}

test.describe("the HUD", () => {
  test("says in words whose turn it is (FR-36)", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const { activePlayer } = await boardState(board);

    // The question that started issue #39. Before it there was no text anywhere on the page naming a
    // player, and the locale key that says this sentence had never been called.
    const line = page.locator(".chrome__turn");
    await expect(line).toContainText("ist am Zug");
    await expect(line).toContainText(de.player.colour[activePlayer]);

    // Exactly one seat is marked, and it is the one the board says is active.
    const marked = page.locator('.hud__seat[data-on-turn="true"]');
    await expect(marked).toHaveCount(1);
    await expect(marked).toHaveAttribute("data-player", String(activePlayer));
  });

  test("renders one row per seat actually in the match, numbered from 1", async ({ page }) => {
    // The regression from issue #39: a two-player match sits on seats 0 and 2, and every label used to
    // be built as the seat plus one, so this used to read "Spieler 1" and "Spieler 3".
    await openMatch(page, SEEDS.advancesEarly);

    const seats = page.locator(".hud__seat");
    await expect(seats).toHaveCount(2);
    await expect(seats.nth(0)).toHaveAttribute("data-player", "0");
    await expect(seats.nth(1)).toHaveAttribute("data-player", "2");
    await expect(seats.locator(".hud__name")).toHaveText(["Spieler 1", "Spieler 2"]);
  });

  test("shows four seats in a four-player match", async ({ page }) => {
    await openMatch(page, SEEDS.leavesStartAtOnce);

    await expect(page.locator(".hud__seat")).toHaveCount(4);
    await expect(page.locator(".hud__seat .hud__name")).toHaveText([
      "Spieler 1",
      "Spieler 2",
      "Spieler 3",
      "Spieler 4",
    ]);
  });

  test("keeps every seat's pawn counts summing to four, before and after a turn", async ({
    page,
  }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    // FR-36's acceptance criterion is that the counts match the game state after every turn. The
    // invariant is the readable half of that: a player reads three numbers as a breakdown of four
    // pawns, so a total of three would be wrong even if each number were individually plausible.
    for (const phase of ["before", "after"]) {
      const counts = await hudCounts(page);

      expect(Object.keys(counts), phase).toHaveLength(4);
      for (const [seat, { start, track, home }] of Object.entries(counts)) {
        expect({ phase, seat, total: start + track + home }).toEqual({
          phase,
          seat,
          total: PAWNS_PER_PLAYER,
        });
      }

      if (phase === "before") await playTurn(board);
    }
  });

  test("moves a pawn out of the start column when one leaves the yard", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const before = await hudCounts(page);

    await playTurn(board);
    const after = await hudCounts(page);

    // Seed `leavesStartAtOnce` gets a pawn out on turn 1, so exactly one seat's start count drops.
    const moved = Object.keys(before).filter((seat) => after[seat].start < before[seat].start);

    expect(moved).toHaveLength(1);
    expect(after[moved[0]].start).toBe(before[moved[0]].start - 1);
    expect(after[moved[0]].track).toBe(before[moved[0]].track + 1);
  });

  test("counts the skill cards each seat holds (D33)", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    // A card is drawn at the start of every turn (FR-23), so the active seat holds at least one and
    // the count is public for everybody. That the number is on screen at all is decision D33.
    const { activePlayer } = await boardState(board);
    const counts = await hudCounts(page);

    expect(counts[activePlayer].cards).toBeGreaterThanOrEqual(1);
    for (const { cards } of Object.values(counts)) {
      expect(cards).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe("the language switch (FR-34)", () => {
  test("changes every visible string, with none left in the previous language", async ({
    page,
  }) => {
    await openMatch(page, SEEDS.leavesStartAtOnce);

    const button = page.locator('.chrome__button[data-action="language"]');

    // The button names the language you would switch to, so one key covers both directions.
    await expect(button).toHaveAttribute("data-lang", "de");
    await expect(button).toHaveText(de.language.switch);
    await expect(page.locator(".hud__seat").first().locator(".hud__name")).toHaveText("Spieler 1");

    await button.click();

    await expect(button).toHaveAttribute("data-lang", "en");
    await expect(button).toHaveText(en.language.switch);
    await expect(page.locator(".chrome__turn")).toContainText("to move");
    await expect(page.locator(".hud__seat").first().locator(".hud__name")).toHaveText("Player 1");
    await expect(page.locator(".hud__count[data-kind='start'] .hud__label").first()).toHaveText(
      en.hud.start
    );

    // The acceptance criterion is "no string remains in the previous language". The German words are
    // distinctive enough to search the whole page for.
    const text = await page.locator(".app").innerText();
    for (const word of ["ist am Zug", de.hud.track, de.hud.home, de.hud.cards]) {
      expect(text, `"${word}" survived the switch`).not.toContain(word);
    }

    // And back, because a switch that only works one way is half a switch.
    await button.click();
    await expect(page.locator(".chrome__turn")).toContainText("ist am Zug");
  });
});
