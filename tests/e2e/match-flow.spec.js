/**
 * Menu to match to pause to match to win to menu, with no page reload. Screens S1, S2, S8, S9 and the
 * handover. Issue #41, requirements FR-01, FR-05, FR-06, FR-07 and FR-38.
 *
 * FR-38's acceptance criterion is that exact sentence, so the flow is asserted as a flow rather than as
 * five separate screens: most of the value is in the transitions, and a pause screen that opens and
 * cannot be closed passes every per-screen check there is.
 *
 * **"Without a reload" is tested rather than assumed.** A probe is written onto `window` at the start
 * and checked at the end; a reload would wipe it. Every other assertion in this file would still pass if
 * the game secretly reloaded on every restart.
 *
 * These specs open the page **without** `?players=`, which is what puts the main menu in front of the
 * match. Every other spec in the suite passes a player count and therefore still starts straight in a
 * match, which is the one thing that kept those ten files working when the menu landed.
 */

import { expect, test } from "@playwright/test";

import de from "../../src/i18n/locales/de/ui.json" with { type: "json" };
import en from "../../src/i18n/locales/en/ui.json" with { type: "json" };
import {
  SEEDS,
  boardState,
  chooseAndCarryOn,
  moveFirstMovablePawn,
  openMatch,
  playUntil,
} from "./helpers.js";

const overlay = (page) => page.locator(".overlay");
const action = (page, name) => page.locator(`.overlay__button[data-action="${name}"]`);

/** Open on the main menu, and leave a probe that a page reload would destroy. */
async function openMenu(page, seed = 1) {
  await page.goto(`/?seed=${seed}&fast=1`);
  await expect(overlay(page)).toHaveAttribute("data-screen", "menu");
  await page.evaluate(() => {
    window.__noReload = "survived";
  });

  return overlay(page);
}

/** Menu to a running match of `players` players. */
async function startMatch(page, players) {
  await action(page, "start").click();
  await expect(overlay(page)).toHaveAttribute("data-screen", "setup");

  await page.locator(`.overlay__button[data-count="${players}"]`).click();
  await expect(overlay(page)).toHaveAttribute("data-screen", "none");

  return page.locator(".board");
}

test.describe("the match flow", () => {
  test("opens on the main menu when the address bar names no player count", async ({ page }) => {
    const panel = await openMenu(page);

    await expect(panel).toHaveAttribute("data-open", "true");
    await expect(panel.locator(".overlay__title")).toHaveText(de.menu.title);
    await expect(page.locator(".board .pawn")).toHaveCount(0);
  });

  test("starts straight in a match when it does, which is what the older specs rely on", async ({
    page,
  }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    await expect(overlay(page)).toHaveAttribute("data-screen", "none");
    await expect(board).toHaveAttribute("data-players", "4");
  });

  test("offers 2, 3 and 4 players and starts the one that was picked (FR-01)", async ({ page }) => {
    await openMenu(page);

    await action(page, "start").click();
    await expect(page.locator(".overlay__button[data-action='players']")).toHaveCount(3);

    await page.locator('.overlay__button[data-count="3"]').click();
    await expect(overlay(page)).toHaveAttribute("data-screen", "none");

    await expect(page.locator(".board")).toHaveAttribute("data-players", "3");
    await expect(page.locator(".hud__seat")).toHaveCount(3);
  });

  test("pauses at any point in a turn and carries on where it left off (FR-07)", async ({
    page,
  }) => {
    await openMenu(page);
    const board = await startMatch(page, 2);

    const before = await boardState(board);
    await page.locator('.chrome__button[data-action="pause"]').click();

    await expect(overlay(page)).toHaveAttribute("data-screen", "pause");
    await expect(overlay(page).locator(".overlay__title")).toHaveText(de.pause.title);

    // The game really is stopped: nothing moves on while the screen is up.
    await page.waitForTimeout(600);
    expect(await boardState(board)).toEqual(before);

    await action(page, "resume").click();
    await expect(overlay(page)).toHaveAttribute("data-screen", "none");
  });

  test("gives the match up and goes back to the menu (FR-07)", async ({ page }) => {
    await openMenu(page);
    await startMatch(page, 2);

    await page.locator('.chrome__button[data-action="pause"]').click();
    await action(page, "quit").click();

    await expect(overlay(page)).toHaveAttribute("data-screen", "menu");
    await expect(page.locator(".board .pawn")).toHaveCount(0);
  });

  test("switches language on the menu, not only during a match (FR-34)", async ({ page }) => {
    // The chrome sits above the overlay for exactly this. Without it the switch is reachable during a
    // match and buried under every screen that is not one, and the main menu is a screen a first-time
    // player spends time on.
    await openMenu(page);

    await expect(overlay(page).locator(".overlay__text")).toHaveText(de.menu.text);
    await page.locator('.chrome__button[data-action="language"]').click();

    await expect(overlay(page).locator(".overlay__text")).toHaveText(en.menu.text);
    await expect(action(page, "start")).toHaveText(en.menu.start);
  });

  test("hides the pause button while a screen is already up", async ({ page }) => {
    // Pausing a paused game, or a handover, has no meaning, and a button that does nothing is worse
    // than one that is not there.
    await openMenu(page);
    await expect(page.locator('.chrome__button[data-action="pause"]')).toBeHidden();

    await startMatch(page, 2);
    await expect(page.locator('.chrome__button[data-action="pause"]')).toBeVisible();
  });
});

test.describe("the handover", () => {
  test("stops between two turns and names the player it is passing to", async ({ page }) => {
    // Deliberately **without** `fast=1`, because the whole point of this screen is that it waits. Every
    // other spec runs with the gate skipped, which is the affordance that kept them unchanged.
    await page.goto("/?seed=1");
    await action(page, "start").click();
    await page.locator('.overlay__button[data-count="2"]').click();

    const board = page.locator(".board");

    // The turn has to be played, because without `fast=1` nothing happens on its own: the game waits for
    // a dice card, then for the action phase to be passed, then for a pawn. A turn with no legal move
    // skips the last step and reaches the handover through the four-second refusal instead.
    await chooseAndCarryOn(board);
    if ((await boardState(board)).phase === "act") await moveFirstMovablePawn(board);

    await expect(overlay(page)).toHaveAttribute("data-screen", "handover", { timeout: 15000 });

    // Seats 0 and 2 play a two-player match, so the second player is Spieler 2 and not Spieler 3.
    await expect(overlay(page).locator(".overlay__title")).toContainText("Spieler 2");
    await expect(overlay(page)).toHaveAttribute("data-player", "2");

    // It waits. The turn does not pass until somebody says the screen has changed hands, which is what
    // makes an opponent's secret hand actually secret at one shared screen (decision D33).
    const turn = (await boardState(board)).turnNumber;
    await page.waitForTimeout(1200);
    expect((await boardState(board)).turnNumber).toBe(turn);

    await action(page, "ready").click();
    await expect(overlay(page)).toHaveAttribute("data-screen", "none");
    await expect.poll(async () => (await boardState(board)).turnNumber).toBe(turn + 1);
  });
});

/**
 * A whole match, played click by click, is the most expensive kind of test in this suite.
 *
 * Measured on 2026-09-01: 1.1 to 1.3 minutes each when the three browser projects run with three
 * workers. `test.slow()` triples the default 30 seconds to 90, which was enough while the suite was
 * smaller and is not any more: at Playwright's default worker count, half of sixteen cores, eight
 * browsers each playing a 77-turn match pushed these two past 90 seconds and the run reported four
 * failures that were purely contention.
 *
 * Four minutes is deliberately generous. The alternative was pinning `workers` in
 * `playwright.config.js`, which would have slowed all 177 tests to fix two.
 */
const FULL_MATCH_TIMEOUT_MS = 240_000;

test.describe("winning and starting again", () => {
  test.setTimeout(FULL_MATCH_TIMEOUT_MS);

  test("names the winner and restarts with the same players, with no reload (FR-05, FR-06)", async ({
    page,
  }) => {
    await page.goto(`/?seed=${SEEDS.winsQuickest.seed}&fast=1`);
    await page.evaluate(() => {
      window.__noReload = "survived";
    });

    await action(page, "start").click();
    await page.locator(`.overlay__button[data-count="${SEEDS.winsQuickest.players}"]`).click();

    const board = page.locator(".board");
    await playUntil(board, async () => (await boardState(board)).status !== "running");

    await expect(overlay(page)).toHaveAttribute("data-screen", "win");
    await expect(overlay(page).locator(".overlay__title")).toContainText("gewonnen");

    await action(page, "restart").click();

    // A fresh match: same players, turn 1, every pawn back in its yard.
    await expect(overlay(page)).toHaveAttribute("data-screen", "none");
    await expect(board).toHaveAttribute("data-players", String(SEEDS.winsQuickest.players));
    await expect(board).toHaveAttribute("data-status", "running");
    await expect.poll(async () => (await boardState(board)).turnNumber).toBe(1);

    // FR-38's "without a reload", checked rather than assumed.
    expect(await page.evaluate(() => window.__noReload)).toBe("survived");

    // And the pool came back whole. A match that ends mid-turn never returns its three drawn cards, so
    // a restart that reused the old pool would deal from seventeen and eventually throw.
    await expect(page.locator(".hand--dice .card[data-card-id]")).toHaveCount(3);
  });
});
