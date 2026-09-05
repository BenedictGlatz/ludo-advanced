/**
 * Menu to match to pause to match to win to menu, with no page reload. Screens S1, S2, S8 and S9.
 * Issue #41, requirements FR-01, FR-05, FR-06, FR-07 and FR-38.
 *
 * **The handover moved to `handover.spec.js`** on 2026-09-01, when this file passed the 300-line limit.
 * The seam is the one design spec 04 used for the stylesheets: the four screens here ask the player
 * something and wait, and the handover is the one with a secrecy rule behind it.
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
import { SEEDS, boardState, openMatch, playUntil } from "./helpers.js";

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

/**
 * Menu to a running match of `players` players, every seat a person.
 *
 * **Three clicks since issue #76**, not two: the count opens the line-up screen and Start begins the
 * match. The line-up opens with every seat a person, so clicking straight through produces exactly the
 * match this helper used to produce, unchanged.
 */
async function startMatch(page, players) {
  await action(page, "hotseat").click();
  await expect(overlay(page)).toHaveAttribute("data-screen", "setup");

  await page.locator(`.overlay__button[data-count="${players}"]`).click();
  await expect(overlay(page)).toHaveAttribute("data-screen", "lineup");

  await action(page, "begin").click();
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

    await action(page, "hotseat").click();
    await expect(page.locator(".overlay__button[data-action='players']")).toHaveCount(3);

    // The count sizes the match and the line-up starts it, since issue #76. FR-01's criterion is still
    // about the three counts on S2, which is why that screen was left exactly as it was.
    await page.locator('.overlay__button[data-count="3"]').click();
    await action(page, "begin").click();
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

    // Since design handoff 12 a menu item holds three elements rather than its own text, so the label
    // is asserted on `.overlay__label` and not on the button. The hint is asserted with it, because
    // FR-34's criterion is that **no** string is left in the previous language, and the second line on
    // a door is the one string on this screen that a `textContent` check would have hidden behind the
    // label it is concatenated with.
    const hotseat = action(page, "hotseat");

    await expect(hotseat.locator(".overlay__label")).toHaveText(en.menu.hotseat.label);
    await expect(hotseat.locator(".overlay__hint")).toHaveText(en.menu.hotseat.hint);
  });

  test("hides the pause button while a screen is already up", async ({ page }) => {
    // Pausing a paused game, or a handover, has no meaning, and a button that does nothing is worse
    // than one that is not there.
    await openMenu(page);
    await expect(page.locator('.chrome__button[data-action="pause"]')).toBeHidden();

    await startMatch(page, 2);
    await expect(page.locator('.chrome__button[data-action="pause"]')).toBeVisible();
  });

  /**
   * The two attributes design spec 04 asked the markup for, and the reason each one is not a CSS
   * problem. `data-paused` stops the reaction countdown, which is a CSS animation and cannot pause
   * itself. `data-player` puts the seat's colour and its D16 shape on the turn sentence, and the row has
   * no seat to name before a match starts.
   */
  test("marks the shell as paused, and names the seat on turn in the chrome", async ({ page }) => {
    await openMenu(page);

    const app = page.locator(".app");
    const chrome = page.locator(".app__chrome");

    // No match, so no seat and nothing to pause: both attributes are absent rather than empty, because
    // the stylesheet matches on `[data-player]` existing at all.
    await expect(chrome).not.toHaveAttribute("data-player", /.*/);
    await expect(app).toHaveAttribute("data-paused", "false");

    await startMatch(page, 2);
    await expect(chrome).toHaveAttribute("data-player", "0");
    await expect(app).toHaveAttribute("data-paused", "false");

    await page.locator('.chrome__button[data-action="pause"]').click();
    await expect(app).toHaveAttribute("data-paused", "true");

    await action(page, "resume").click();
    await expect(app).toHaveAttribute("data-paused", "false");
  });

  /**
   * `data-outcome` is written by the win screen and by nothing else, so every other screen has to clear
   * it. A leftover would be invisible on the screen that leaked it and would then quietly restyle the
   * next win, which is the kind of defect an attribute-driven stylesheet makes easy to write.
   *
   * **The abandoned half of D40 is not tested here, and cannot be from the interface.** `abandonMatch` in
   * `state/match.js` sets `MATCH_STATUS.ABANDONED`, and nothing in `ui/` calls it: the Quit button goes
   * straight back to the menu instead. So `data-outcome="abandoned"` is styled and translated and
   * currently unreachable. `tests/unit/ui/overlay-screens.test.js` covers the description; reaching it on
   * screen needs a rule decision about what quitting a match is, which is not this commit's.
   */
  test("leaves no outcome attribute behind on a screen that has none (D40)", async ({ page }) => {
    await openMenu(page);
    await expect(overlay(page)).not.toHaveAttribute("data-outcome", /.*/);

    await startMatch(page, 2);
    await page.locator('.chrome__button[data-action="pause"]').click();

    await expect(overlay(page)).toHaveAttribute("data-screen", "pause");
    await expect(overlay(page)).not.toHaveAttribute("data-outcome", /.*/);
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

    await action(page, "hotseat").click();
    await page.locator(`.overlay__button[data-count="${SEEDS.winsQuickest.players}"]`).click();
    await action(page, "begin").click();

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
