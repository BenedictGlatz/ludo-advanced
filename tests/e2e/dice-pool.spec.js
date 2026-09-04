/**
 * The dice card pool overview. Issue #30, requirements FR-16 and FR-17.
 *
 * The screen answers the question the dice hand asks: three cards are dealt and one is kept (FR-18,
 * FR-19), and whether a hand is a good hand depends on the twenty cards behind it. So the assertions are
 * about the pool being described **truthfully and completely**, and not about the overlay opening.
 *
 * `POOL_COMPOSITION` is imported rather than typed out, exactly as `dice-hand.spec.js` does it. A spec
 * that hard-codes seven denominations is a second definition of FR-17's single data definition, and it
 * would keep passing after the pool was reweighted.
 */

import { expect, test } from "@playwright/test";

import { POOL_COMPOSITION, POOL_SIZE } from "../../src/core/dice-pool.js";
import cardsDe from "../../src/i18n/locales/de/cards.json" with { type: "json" };
import de from "../../src/i18n/locales/de/ui.json" with { type: "json" };
import en from "../../src/i18n/locales/en/ui.json" with { type: "json" };
import { SEEDS, boardState, openMatch, playTurn } from "./helpers.js";

const overlay = (page) => page.locator(".overlay");
const poolButton = (page) => page.locator('.chrome__button[data-action="pool"]');
const poolCards = (page) => page.locator(".overlay__cards .card");

/** Open the overview and wait until it is actually up. */
async function openPool(page) {
  await poolButton(page).click();
  await expect(overlay(page)).toHaveAttribute("data-screen", "pool");
  return overlay(page);
}

test.describe("the dice card pool overview", () => {
  test("shows every denomination in the pool, with how many copies of each", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    await openPool(page);

    await expect(poolCards(page)).toHaveCount(POOL_COMPOSITION.length);
    await expect(page.locator(".overlay__cards")).toHaveAttribute(
      "data-count",
      String(POOL_COMPOSITION.length)
    );

    // Every denomination present exactly once, in composition order, D2 first.
    const faces = await poolCards(page).evaluateAll((cards) =>
      cards.map((card) => Number(card.getAttribute("data-faces")))
    );
    expect(faces).toEqual(POOL_COMPOSITION.map((entry) => entry.faces));

    // And each one says how many copies the pool holds. The tag is the last of the three.
    for (const { faces: side, copies } of POOL_COMPOSITION) {
      const tag = cardsDe.card.dice.copies.replace("{{copies}}", String(copies));
      await expect(
        page.locator(`.overlay__cards .card[data-faces="${side}"] .card__tag`).last()
      ).toHaveText(tag);
    }

    // The board is still there behind the overlay, so nothing was torn down to show this.
    await expect(board).toHaveAttribute("data-players", "4");
  });

  test("draws every card, so a denomination cannot be present but invisible", async ({ page }) => {
    await openMatch(page, SEEDS.leavesStartAtOnce);
    await openPool(page);

    const art = page.locator(".overlay__cards .card__art");

    await expect(art).toHaveCount(POOL_COMPOSITION.length);
    await expect(art.locator("svg")).toHaveCount(POOL_COMPOSITION.length);
    await expect(art.locator("svg").first()).toHaveAttribute("aria-hidden", "true");
  });

  test("says how many cards are face down, and it is seventeen mid-turn", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    // Three of the twenty are out on the hand for the whole of a turn (FR-18), and they go back at the
    // end of it (FR-21). So seventeen is the number the player should see, and a screen that said twenty
    // would be describing a pool nobody is playing with.
    await expect(board).toHaveAttribute("data-phase", "choose");
    await openPool(page);

    const expected = de.pool.text
      .replace("{{remaining}}", String(POOL_SIZE - 3))
      .replace("{{total}}", String(POOL_SIZE));

    await expect(overlay(page).locator(".overlay__text")).toHaveText(expected);
    await expect(overlay(page).locator(".overlay__title")).toHaveText(de.pool.title);
  });

  test("stops the match while it is open, and carries on where it left off", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const before = await boardState(board);

    await openPool(page);

    // Same check the pause screen gets in match-flow.spec.js, and it is here for the same reason: the
    // loop advances the roll, reaction and turn-end phases on timers of its own, so a player who opened
    // this screen to think about three cards must not come back to a turn that moved without them.
    await page.waitForTimeout(600);
    expect(await boardState(board)).toEqual(before);

    await page.locator('.overlay__button[data-action="resume"]').click();
    await expect(overlay(page)).toHaveAttribute("data-screen", "none");

    // And the match is genuinely playable again rather than merely uncovered.
    await playTurn(board);
    expect((await boardState(board)).turnNumber).toBeGreaterThan(before.turnNumber);
  });

  test("keeps saying seventeen of twenty after a turn has returned its cards (FR-21)", async ({
    page,
  }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const expected = de.pool.text
      .replace("{{remaining}}", String(POOL_SIZE - 3))
      .replace("{{total}}", String(POOL_SIZE));

    await playTurn(board);
    await playTurn(board);
    await expect(board).toHaveAttribute("data-phase", "choose");

    await openPool(page);

    // The pool is stationary: two turns have drawn six cards and returned six, so the count is the same
    // as on turn one. A pool that leaked would read fourteen or eleven here.
    await expect(overlay(page).locator(".overlay__text")).toHaveText(expected);
  });

  test("translates the whole screen, cards included (FR-34)", async ({ page }) => {
    await openMatch(page, SEEDS.leavesStartAtOnce);
    await openPool(page);

    const firstTitle = poolCards(page).first().locator(".card__title");
    await expect(firstTitle).toHaveText("W2");

    await page.locator('.chrome__button[data-action="language"]').click();

    await expect(overlay(page).locator(".overlay__title")).toHaveText(en.pool.title);
    await expect(page.locator('.overlay__button[data-action="resume"]')).toHaveText(en.pool.close);
    await expect(poolButton(page)).toHaveText(en.pool.open);
    // The cards are rebuilt by the same render, so a card left in German would mean the region is not
    // part of the redraw. "W2" against "D2" is the visible half of that.
    await expect(firstTitle).toHaveText("D2");
  });

  test("is not offered when there is no pool to look at", async ({ page }) => {
    await page.goto("/?seed=1&fast=1");
    await expect(overlay(page)).toHaveAttribute("data-screen", "menu");

    // No match, no pool. A button that opens an empty screen is worse than one that is not there.
    await expect(poolButton(page)).toBeHidden();

    await page.locator('.overlay__button[data-action="hotseat"]').click();
    await page.locator('.overlay__button[data-count="2"]').click();
    await expect(poolButton(page)).toBeVisible();
  });

  test("offers no choice: nothing on it is playable or selectable", async ({ page }) => {
    await openMatch(page, SEEDS.leavesStartAtOnce);
    await openPool(page);

    // The overview answers a question, and a card that looks clickable here would invite a click that
    // does nothing. The dice hand behind it is where cards are chosen.
    await expect(page.locator('.overlay__cards .card[data-playable="true"]')).toHaveCount(0);
    await expect(page.locator('.overlay__cards .card[data-selected="true"]')).toHaveCount(0);
    await expect(page.locator(".overlay__cards .card__result")).toHaveText(
      Array(POOL_COMPOSITION.length).fill("")
    );

    // Design spec 05, section 5: a card nothing can be done with is not a tab stop. Before this, seven
    // stops sat between a keyboard user and the one button that closes the panel.
    await expect(page.locator('.overlay__cards .card[tabindex="0"]')).toHaveCount(0);
  });

  test("carries the copy count as an attribute, so the card can be drawn as a pile (D44)", async ({
    page,
  }) => {
    await openMatch(page, SEEDS.leavesStartAtOnce);
    await openPool(page);

    // The tag states the number in words and `data-copies` states it as an integer; `pool.css` reads the
    // attribute to stack the card. The two must agree, and both come from `POOL_COMPOSITION`.
    for (const { faces: side, copies } of POOL_COMPOSITION) {
      await expect(page.locator(`.overlay__cards .card[data-faces="${side}"]`)).toHaveAttribute(
        "data-copies",
        String(copies)
      );
    }

    // A card in a hand never carries it: the count is a fact about the pool, not about the card.
    await expect(page.locator(".hand .card[data-copies]")).toHaveCount(0);
  });
});
