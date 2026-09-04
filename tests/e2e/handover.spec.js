/**
 * The moment between two turns at one shared screen. Design spec 04, D39, and decision D33.
 *
 * Split out of `match-flow.spec.js` on 2026-09-01, when that file passed the 300-line limit (NFR-02),
 * and along the same seam design spec 04 used to split `handover.css` out of `overlay.css`: the handover
 * is the one screen in the game with **a rule behind it rather than a preference**. The other four ask
 * the player something and wait. This one exists to keep an opponent's five skill cards secret while the
 * device changes hands, so what it has to get right is not how it looks but what it covers and when.
 *
 * Both specs here run **without** `?fast=1`, because the whole point of this screen is that it waits, and
 * `?fast=1` passes it without the button. Every other spec in the suite runs with the gate skipped, which
 * is the affordance that kept them unchanged when the screen landed.
 */

import { expect, test } from "@playwright/test";

import { boardState, chooseAndCarryOn, moveFirstMovablePawn } from "./helpers.js";

const overlay = (page) => page.locator(".overlay");
const action = (page, name) => page.locator(`.overlay__button[data-action="${name}"]`);

test.describe("the handover", () => {
  test("stops between two turns and names the player it is passing to", async ({ page }) => {
    // Deliberately **without** `fast=1`, because the whole point of this screen is that it waits. Every
    // other spec runs with the gate skipped, which is the affordance that kept them unchanged.
    await page.goto("/?seed=1");
    await action(page, "hotseat").click();
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

  /**
   * The one ordering requirement in design spec 04, and the only way this screen can leak.
   *
   * The curtain hides the rail while the device changes hands, which is what makes decision D33's
   * "an opponent's skill cards are secret" true at one shared screen. It only works if the rail is
   * rewritten for the arriving seat **while the curtain is still up**. Taking the curtain down first
   * leaves one painted frame of the leaving player's five cards in front of the person picking the device
   * up, and no CSS can cover a frame that is already on screen.
   *
   * A single frame is not something a Playwright assertion can look at, so this records the order the
   * writes happen in instead. Two MutationObservers push to one array, and the array is the evidence:
   * `data-seat` on the rail has to move to the arriving seat before `data-open` on the overlay goes
   * false. Both writes happen in one synchronous handler, so the order in the log is the order in the
   * code and nothing here depends on timing.
   */
  test("rewrites the rail for the arriving seat before the curtain lifts", async ({ page }) => {
    await page.goto("/?seed=1");
    await action(page, "hotseat").click();
    await page.locator('.overlay__button[data-count="2"]').click();

    const board = page.locator(".board");

    await chooseAndCarryOn(board);
    if ((await boardState(board)).phase === "act") await moveFirstMovablePawn(board);

    await expect(overlay(page)).toHaveAttribute("data-screen", "handover", { timeout: 15000 });
    await expect(page.locator(".hand--skill")).toHaveAttribute("data-seat", "0");

    await page.evaluate(() => {
      window.__order = [];

      const watch = (selector, attribute, label) => {
        const element = document.querySelector(selector);

        new MutationObserver(() => {
          window.__order.push(`${label}:${element.getAttribute(attribute)}`);
        }).observe(element, { attributes: true, attributeFilter: [attribute] });
      };

      watch(".hand--skill", "data-seat", "rail");
      watch(".overlay", "data-open", "curtain");
    });

    await action(page, "ready").click();
    await expect(overlay(page)).toHaveAttribute("data-screen", "none");

    const order = await page.evaluate(() => window.__order);

    expect(order, "the rail never moved to the arriving seat").toContain("rail:2");
    expect(order, "the curtain never came down").toContain("curtain:false");
    expect(
      order.indexOf("rail:2"),
      `the curtain lifted before the rail was rewritten: ${order.join(", ")}`
    ).toBeLessThan(order.indexOf("curtain:false"));
  });
});
