/**
 * The countdown in the reaction strip, and the regression test for the playtest bug behind it.
 *
 * The ring is a 3 rem circle and design spec 04 says what belongs inside it: "It was a bare number. It
 * is now that number inside a ring that empties." What `prompt-view.js` actually wrote into it was the
 * whole sentence `reaction.prompt`, "Reaktion? 27 s". A sentence in a circle sized for two digits
 * wraps, spills out on every side and paints itself across the ring, which is what the bug report shows.
 *
 * ## Why this is an end-to-end test and not a unit test
 *
 * `ui/` is not unit tested anywhere in this project, and the reason applies exactly here: the defect is
 * not what the string says, it is that the element it was put in is too small for it. Only a real
 * browser with real fonts and the real stylesheet can measure that, which is what the overflow
 * assertion below does. A jsdom test would have passed while the ring stayed unreadable.
 *
 * ## How a window is opened on purpose
 *
 * No `?fast=1`: the fast run collapses the window to nothing, and the window is the subject here. Two
 * seats with the second one a bot, and a pool stacked with Devil Die, which is a Reaction to a roll.
 * `?stack=` deals one card per seat in turn order, so a single copy reaches only seat 0, the person.
 * The bot rolls on turn 2, and that roll opens a window that the person is being asked about.
 */

import { expect, test } from "@playwright/test";

import { playPersonTurn } from "./bot-helpers.js";

const STACK = "reaction-devil-die";

test.describe("the reaction countdown", () => {
  test("shows a bare number that stays inside its ring", async ({ page }) => {
    test.slow();

    await page.goto(`/?seed=1&players=2&bots=1&stack=${STACK}`);
    const board = page.locator(".board");
    await expect(board).toHaveAttribute("data-players", "2");

    // The person's turn 1, so that the bot's turn 2 is the next thing that happens.
    await playPersonTurn(page, board);

    const prompt = page.locator(".prompt");
    await expect(prompt).toHaveAttribute("data-mode", "reaction", { timeout: 20_000 });

    const clock = prompt.locator(".prompt__clock");
    await expect(clock).toBeVisible();

    // The bug in one line: with the sentence in the ring this read "Reaktion? 27 s".
    await expect(clock).toHaveText(/^\d+$/);

    // And the consequence of it, measured rather than read. A wrapped sentence is taller and wider than
    // the circle, so both scroll sizes ran past the box. One pixel of slack for sub-pixel rounding.
    const overflow = await clock.evaluate((element) => ({
      wider: element.scrollWidth - element.clientWidth,
      taller: element.scrollHeight - element.clientHeight,
    }));

    expect(overflow.wider).toBeLessThanOrEqual(1);
    expect(overflow.taller).toBeLessThanOrEqual(1);

    // The sentence is not gone, it is where a screen reader can still hear the question and the unit.
    await expect(clock).toHaveAttribute("aria-label", /\d+/);
  });
});
