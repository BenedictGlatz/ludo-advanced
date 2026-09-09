/**
 * The player picks one of the three drawn dice cards. Issue #31, requirements FR-18 and FR-19.
 *
 * This is the flow that was missing: the pool has dealt three cards since issue #30, but the view
 * took the first one, so FR-19's "the player chooses" was not true. Every test here is about the
 * choice being real, not about how the card looks.
 *
 * The card's own look is design spec 03 and is checked the way the board is: through the attributes
 * the CSS targets. Whether the ink outline is 3 px is not something a test should have an opinion on.
 */

import { expect, test } from "@playwright/test";

import { POOL_COMPOSITION } from "../../src/core/dice-pool.js";
import {
  SEEDS,
  boardState,
  carryOn,
  chooseDiceCard,
  diceHand,
  openMatch,
  playTurn,
} from "./helpers.js";

/** The seven denominations the pool can deal, as strings, because attributes are strings. */
const DENOMINATIONS = POOL_COMPOSITION.map((entry) => String(entry.faces));

test.describe("the dice hand", () => {
  test("deals three face-up cards and waits for the player", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const hand = diceHand(board);

    // FR-18: three cards, and the turn does not move on by itself any more.
    await expect(hand).toHaveAttribute("data-count", "3");
    await expect(hand.locator(".card")).toHaveCount(3);
    await expect(board).toHaveAttribute("data-phase", "choose");

    // All three are face up and offered. A card the player cannot pick would be a rule this screen
    // does not have: any of the three is a legal choice.
    await expect(hand.locator('.card[data-playable="true"]')).toHaveCount(3);
    await expect(hand.locator('.card[data-selected="true"]')).toHaveCount(0);
  });

  test("labels every card with a real denomination out of the pool", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    const faces = await diceHand(board)
      .locator(".card")
      .evaluateAll((cards) => cards.map((card) => card.getAttribute("data-faces")));

    expect(faces).toHaveLength(3);
    for (const value of faces) {
      expect(DENOMINATIONS, `${value} is not a denomination the pool holds`).toContain(value);
    }

    // The title is the localised name, W for Würfel in German, and it is not the raw number.
    const titles = await diceHand(board)
      .locator(".card__title")
      .evaluateAll((nodes) => nodes.map((node) => node.textContent));

    expect(titles).toEqual(faces.map((value) => `W${value}`));
  });

  test("rolls the card the player picked, and no other", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const hand = diceHand(board);

    // The middle card, deliberately not slot 0: picking the first one would pass even if the click
    // were ignored and the old automatic choice were still in place.
    const middle = hand.locator('.card[data-slot="1"]');
    const faces = Number(await middle.getAttribute("data-faces"));

    await middle.click();
    await expect.poll(async () => (await boardState(board)).die).toBe(faces);

    // Choosing no longer rolls: issue #38 put the action phase in between, so the roll is one step
    // further on. That the die is already set and the roll is not is exactly the split working.
    expect((await boardState(board)).roll).toBe(0);
    await carryOn(board);

    // FR-20: the roll is between 1 and that card's face count, and it belongs to the card that
    // produced it, which is what the badge on the card says (D32).
    const { roll } = await boardState(board);
    expect(roll).toBeGreaterThanOrEqual(1);
    expect(roll).toBeLessThanOrEqual(faces);
    await expect(middle.locator(".card__result")).toHaveText(String(roll));
  });

  test("marks the kept card and takes the choice away once it is made", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const hand = diceHand(board);

    await chooseDiceCard(board);
    await carryOn(board);

    // Exactly one card is the chosen one, and none of the three is offered any more: a second pick
    // in the same turn would be a second roll, and FR-19 gives the player one.
    await expect(hand.locator('.card[data-selected="true"]')).toHaveCount(1);
    await expect(hand.locator('.card[data-slot="0"]')).toHaveAttribute("data-selected", "true");
    await expect(hand.locator('.card[data-playable="true"]')).toHaveCount(0);
    await expect(hand).toHaveAttribute("data-resolved", "true");
  });

  test("deals a fresh hand to the next player and clears the last one's roll", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const hand = diceHand(board);

    await playTurn(board);

    // FR-21 put all three cards back and the next turn drew again, so nothing is left marked and no
    // result badge is carrying a number from a turn that is over.
    await expect(board).toHaveAttribute("data-phase", "choose");
    await expect(hand.locator('.card[data-playable="true"]')).toHaveCount(3);
    await expect(hand.locator('.card[data-selected="true"]')).toHaveCount(0);
    await expect(hand.locator(".card__result")).toHaveText(["", "", ""]);
  });

  test("shows a drawing on every card it deals", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    // Issue #39. `.card__art` was an empty framed window for two sprints, which is what the Product
    // Owner saw and asked about. The unit test proves the 36 drawings resolve; this proves one of them
    // actually reaches the page, which is the half a module boundary can hide.
    const art = diceHand(board).locator(".card__art");

    await expect(art).toHaveCount(3);
    await expect(art.locator("svg")).toHaveCount(3);

    // Decoration, not content: the card's name is already in `.card__title` (NFR-08).
    await expect(art.locator("svg").first()).toHaveAttribute("aria-hidden", "true");
  });

  test("can be played with the keyboard alone (NFR-08)", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const hand = diceHand(board);
    const first = hand.locator('.card[data-slot="0"]');

    await first.focus();
    await expect(first).toBeFocused();

    await page.keyboard.press("Enter");

    await expect.poll(async () => (await boardState(board)).phase).not.toBe("choose");
    await expect(first).toHaveAttribute("data-selected", "true");
  });
});
