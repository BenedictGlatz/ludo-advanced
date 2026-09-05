/**
 * The line-up screen. Screen S3, issue #76, design handoff 15, requirements FR-43 and FR-01.
 *
 * **A file of its own rather than more cases in `match-flow.spec.js`**, which was at 247 of the
 * 300-line limit. The seam is the one that already split the handover and the menu off it: that file
 * asserts the flow from menu to match to win and back, and these cases assert the shape and the
 * behaviour of one screen.
 *
 * ## What is actually at risk here
 *
 * Three things, and none of them can be seen by a unit test.
 *
 * - **The `disabled` position.** FR-01 is enforced in front of the player by the DOM's own boolean
 *   property (D93.1), so if the attribute ever came off, a click would fall through to
 *   `toggleController`, which refuses silently. The player would meet a button that does nothing.
 * - **The rebuild.** The overlay's controls are rebuilt on every screen change **and on every language
 *   switch**, so `aria-pressed`, `data-controller` and the disabled position all have to come back from
 *   the flow's line-up rather than from the DOM. Switching language halfway through is the case that
 *   finds a row rebuilt from itself.
 * - **That the match actually gets the seats the screen showed.** The screen produces a list of seats
 *   and `?bots=` produces a count, and the two meet at the same argument of `startMatch`.
 *
 * These specs open the page **without** `?players=`, which is what puts the menu in front of the match.
 */

import { expect, test } from "@playwright/test";

import de from "../../src/i18n/locales/de/ui.json" with { type: "json" };
import en from "../../src/i18n/locales/en/ui.json" with { type: "json" };

const overlay = (page) => page.locator(".overlay");
const action = (page, name) => page.locator(`.overlay__button[data-action="${name}"]`);
const row = (page, seat) => page.locator(`.overlay__seat[data-player="${seat}"]`);

/** One position of one row: `.overlay__button[data-action="controller"]`, by seat and by value. */
const position = (page, seat, value) =>
  page.locator(
    `.overlay__button[data-action="controller"][data-seat="${seat}"][data-value="${value}"]`
  );

/** Menu to the line-up screen of a `players`-seat match. */
async function openLineup(page, players) {
  await page.goto("/?seed=1&fast=1");
  await action(page, "hotseat").click();
  await page.locator(`.overlay__button[data-count="${players}"]`).click();
  await expect(overlay(page)).toHaveAttribute("data-screen", "lineup");

  return overlay(page);
}

/** The seats the running match believes are bots, read off the state rather than off the pixels. */
async function botsOf(page) {
  return page.evaluate(() => window.ludo.getLoop().getState().bots);
}

test.describe("the line-up screen", () => {
  test("opens after the player count, and does not start a match (D90)", async ({ page }) => {
    const panel = await openLineup(page, 4);

    await expect(panel.locator(".overlay__title")).toHaveText(de.lineup.title);
    // The count used to start the match in the same gesture. Nothing is mounted yet.
    await expect(page.locator(".board .pawn")).toHaveCount(0);
    expect(await page.evaluate(() => window.ludo.getLoop())).toBeNull();
  });

  test("has one row per seat, and a two-player match uses seats 0 and 2 (FR-01)", async ({
    page,
  }) => {
    // The case a four-row screen hides. Two players sit opposite each other, so there is no seat 1 and
    // the second row is green rather than yellow.
    await openLineup(page, 2);

    await expect(page.locator(".overlay__seat")).toHaveCount(2);
    await expect(row(page, 0)).toBeVisible();
    await expect(row(page, 1)).toHaveCount(0);
    await expect(row(page, 2)).toBeVisible();
  });

  test("opens with every seat a person (D92)", async ({ page }) => {
    await openLineup(page, 4);

    for (const seat of [0, 1, 2, 3]) {
      await expect(row(page, seat)).toHaveAttribute("data-controller", "human");
      await expect(position(page, seat, "human")).toHaveAttribute("aria-pressed", "true");
      await expect(position(page, seat, "bot")).toHaveAttribute("aria-pressed", "false");
    }
  });

  test("switches a seat to the computer and back, and renames the row with it", async ({
    page,
  }) => {
    await openLineup(page, 4);

    await position(page, 3, "bot").click();
    await expect(row(page, 3)).toHaveAttribute("data-controller", "bot");
    await expect(row(page, 3).locator(".overlay__seat-name")).toContainText("Bot");

    await position(page, 3, "human").click();
    await expect(row(page, 3)).toHaveAttribute("data-controller", "human");
    await expect(row(page, 3).locator(".overlay__seat-name")).toContainText("Spieler");
  });

  test("does nothing when the position that is already chosen is clicked", async ({ page }) => {
    // Both positions are live at all times, so this is a real click on a real button that must not
    // flip the row. A control that toggled would turn seat 1 into a bot here.
    await openLineup(page, 4);

    await position(page, 1, "human").click();
    await expect(row(page, 1)).toHaveAttribute("data-controller", "human");
  });

  test("refuses to turn the last person into a bot, with a disabled control (FR-01, D93)", async ({
    page,
  }) => {
    await openLineup(page, 3);

    await position(page, 1, "bot").click();
    await position(page, 2, "bot").click();

    // Only the `bot` position of the one remaining person. Its own `human` position stays live, and
    // the two bot rows keep a live control, because switching one back is what unlocks seat 0 again.
    await expect(position(page, 0, "bot")).toBeDisabled();
    await expect(position(page, 0, "human")).toBeEnabled();
    await expect(position(page, 1, "bot")).toBeEnabled();

    await position(page, 1, "human").click();
    await expect(position(page, 0, "bot")).toBeEnabled();
  });

  test("puts the keyboard on Start when it opens (D94.3)", async ({ page }) => {
    // The first `.overlay__button` in the DOM is seat 0's `human` position, which is already chosen,
    // so `Enter` on arrival would do nothing at all. Start is where it does what the player came for.
    await openLineup(page, 4);

    await expect(action(page, "begin")).toBeFocused();
  });

  test("starts a match with exactly the seats the screen said were bots (FR-43)", async ({
    page,
  }) => {
    await openLineup(page, 4);

    await position(page, 1, "bot").click();
    await position(page, 3, "bot").click();
    await action(page, "begin").click();

    await expect(overlay(page)).toHaveAttribute("data-screen", "none");
    await expect(page.locator(".board")).toHaveAttribute("data-players", "4");
    expect(await botsOf(page)).toEqual([1, 3]);
  });

  test("lets the computer have seat 0, so the person plays second (D95)", async ({ page }) => {
    // `botSeatsFor` puts bots on the *last* seats, and that default cannot express this. The screen
    // hands `startMatch` the list directly, which is the one place this feature reaches past a menu.
    await openLineup(page, 2);

    await position(page, 0, "bot").click();
    await action(page, "begin").click();

    expect(await botsOf(page)).toEqual([0]);
    await expect(page.locator('.hud__seat[data-player="0"]')).toHaveAttribute(
      "data-controller",
      "bot"
    );
    await expect(page.locator('.hud__seat[data-player="2"]')).toHaveAttribute(
      "data-controller",
      "human"
    );
  });

  test("goes back to the count, and a smaller count carries no bots with it", async ({ page }) => {
    await openLineup(page, 4);

    await position(page, 1, "bot").click();
    await position(page, 3, "bot").click();

    await action(page, "back").click();
    await expect(overlay(page)).toHaveAttribute("data-screen", "setup");

    // Seats 1 and 3 do not exist in a two-player match, so a line-up that remembered them would seat
    // bots on seats nobody is sitting on.
    await page.locator('.overlay__button[data-count="2"]').click();
    await expect(page.locator(".overlay__seat")).toHaveCount(2);
    await expect(row(page, 0)).toHaveAttribute("data-controller", "human");
    await expect(row(page, 2)).toHaveAttribute("data-controller", "human");
  });

  /**
   * FR-34's acceptance criterion, on the one screen where a rebuild has state to lose. The controls
   * are rebuilt from the flow's line-up on a language switch, so a row that had been switched has to
   * come back switched, in the other language.
   */
  test("rewrites every string on a language switch and keeps the line-up (FR-34)", async ({
    page,
  }) => {
    await openLineup(page, 3);

    await position(page, 2, "bot").click();
    await position(page, 1, "bot").click();

    await page.locator('.chrome__button[data-action="language"]').click();

    await expect(overlay(page).locator(".overlay__title")).toHaveText(en.lineup.title);
    await expect(action(page, "begin")).toHaveText(en.lineup.begin);
    await expect(position(page, 0, "human")).toHaveText(en.lineup.human);

    // The line-up survived the rebuild, including the position FR-01 disabled.
    await expect(row(page, 1)).toHaveAttribute("data-controller", "bot");
    await expect(row(page, 2)).toHaveAttribute("data-controller", "bot");
    await expect(position(page, 1, "bot")).toHaveAttribute("aria-pressed", "true");
    await expect(position(page, 0, "bot")).toBeDisabled();
    await expect(row(page, 0).locator(".overlay__seat-name")).toContainText("Player 1");
  });
});
