/**
 * Playing a skill card. Issues #33 and #34, requirements FR-23 to FR-26.
 *
 * The flows a unit test cannot reach: a card being clicked, a target being pointed at on the board, and
 * the prompt strip asking the questions in between.
 *
 * ## Why these specs do not pin a seed to get a particular card
 *
 * Every other end-to-end spec plays a pinned seed and asserts an exact situation. That does not work
 * here. A hand is drawn one card per turn out of 58, so "seed 83 has Hyperbeam in hand on turn 4" would
 * be a fact about the shuffle that breaks every time anything else spends a draw from the RNG, and the
 * seeds have already had to be repinned three times for exactly that reason.
 *
 * So these specs assert the **mechanism** instead, whatever card comes up: a card is offered or it is
 * not, clicking one either plays it or asks for a target, and the card leaves the hand. That is what
 * FR-23 to FR-26 actually require, and it does not go stale.
 */

import { expect, test } from "@playwright/test";

import {
  SEEDS,
  boardState,
  carryOn,
  chooseDiceCard,
  diceHand,
  openMatch,
  prompt,
} from "./helpers.js";

/** The skill hand, in the rail beside the board. */
function skillHand(board) {
  return board.page().locator(".hand--skill");
}

/** Open a match and get as far as the action phase, with the dice card chosen. */
async function openAtActionPhase(page) {
  const board = await openMatch(page, SEEDS.leavesStartAtOnce);
  await chooseDiceCard(board);

  return board;
}

test.describe("the skill hand", () => {
  /**
   * FR-23's draw. One card at the start of every turn, so the very first hand on screen holds exactly
   * one, and that is the cheapest possible check that the pool is wired into the turn at all.
   */
  test("holds the card the turn drew", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const hand = skillHand(board);

    await expect(hand).toHaveAttribute("data-count", "1");
    await expect(hand.locator(".card[data-card-id]")).toHaveCount(1);
  });

  /**
   * An empty slot is an outline, not a card back, and until 2026-09-03 it was both at once.
   *
   * `card-state.css` gives every card in a hand with `data-active="false"` the back's dashed inner
   * frame as `::before` and its violet diamond as `::after`. `hand.css` draws an empty slot as a
   * dashed silhouette and hides `> *`, which is the real children and not the pseudo-elements, so
   * the four empty slots wore a card back's furniture inside an empty slot's outline. At 82 per cent
   * overlap that is a row of clipped diamonds, which is what the Product Owner saw and reported.
   */
  test("draws an empty slot as an outline and not as a card back", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const hand = skillHand(board);

    await expect(hand.locator(".card:not([data-card-id])")).toHaveCount(4);

    const furniture = await hand
      .locator(".card:not([data-card-id])")
      .evaluateAll((slots) =>
        slots.flatMap((slot) =>
          ["::before", "::after"].map((part) => window.getComputedStyle(slot, part).content)
        )
      );

    expect(furniture).not.toHaveLength(0);
    for (const content of furniture) {
      expect(content).toBe("none");
    }

    // And it stays under the cards. A slot is a later sibling than the cards to its left, so DOM
    // order used to paint its dashed border across the face of the last real card in the hand.
    const layers = await hand.locator(".card").evaluateAll((cards) =>
      cards.map((card) => ({
        empty: !card.hasAttribute("data-card-id"),
        layer: Number(window.getComputedStyle(card).zIndex),
      }))
    );
    const lowestCard = Math.min(...layers.filter((c) => !c.empty).map((c) => c.layer));

    for (const slot of layers.filter((c) => c.empty)) {
      expect(slot.layer).toBeLessThan(lowestCard);
    }
  });

  /**
   * The fan's shadow falls to the left, and the dice row's still falls to the right.
   *
   * The cards in the fan overlap, the card on the right lies on top, and the shadow was cast down
   * and to the right, so every shadow but the last one was hidden under the next card. The row lost
   * its edges and the overlap read as a rendering fault. The three dice cards have a real gap and
   * keep the shadow on the right, which is what makes this two assertions instead of one.
   */
  test("casts the fan's shadow to the left and the dice row's to the right", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    // The first offset in a computed box-shadow is the horizontal one. Read off a card that is
    // neither selected nor hovered, because both of those declare a shadow list of their own.
    const offsetX = (locator) =>
      locator.evaluate((card) => {
        const shadow = window.getComputedStyle(card).boxShadow;
        return Number(shadow.match(/-?\d+(?:\.\d+)?px/)[0].replace("px", ""));
      });

    expect(await offsetX(skillHand(board).locator(".card[data-card-id]").first())).toBeLessThan(0);
    expect(await offsetX(diceHand(board).locator(".card").first())).toBeGreaterThan(0);
  });

  /**
   * Every card carries a name and a rules sentence. Written as "not empty" rather than as an exact
   * string, because which card is drawn depends on the shuffle: what matters is that no card can reach
   * the table as a bare id or with a blank body.
   */
  test("names the card and says what it does", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const card = skillHand(board).locator(".card[data-card-id]").first();

    await expect(card.locator(".card__title")).not.toBeEmpty();
    await expect(card.locator(".card__text")).not.toBeEmpty();
    await expect(card).toHaveAttribute("data-card-type", /^(action|reaction)$/);
  });

  /**
   * The action phase, and the reason the loop skips it when there is nothing to do there.
   *
   * A hand of one card is an Action card about half the time. When it is, the turn waits and the prompt
   * offers a way past; when it is not, the loop has already carried the player through. Both are correct,
   * so the assertion is that **one of the two happened** and neither leaves the game stuck.
   */
  test("waits in the action phase only when there is a card to play", async ({ page }) => {
    const board = await openAtActionPhase(page);
    const { phase } = await boardState(board);

    if (phase === "action") {
      await expect(prompt(board)).toHaveAttribute("data-mode", "action");
      await expect(prompt(board).locator('[data-prompt-action="skip"]')).toBeVisible();
      await expect(skillHand(board).locator('.card[data-playable="true"]')).toHaveCount(1);
    } else {
      // Carried through, so the turn is already waiting for a pawn or is over.
      expect(["act", "turn-end", "choose"]).toContain(phase);
      await expect(skillHand(board).locator('.card[data-playable="true"]')).toHaveCount(0);
    }
  });

  test("carries on past the action phase when the player asks it to", async ({ page }) => {
    const board = await openAtActionPhase(page);

    await carryOn(board);

    expect((await boardState(board)).phase).not.toBe("action");
    await expect(prompt(board)).not.toHaveAttribute("data-mode", "action");
  });

  /**
   * The whole of FR-26 from the player's side: click a card, and either it resolves or the game asks
   * what to point it at. Thirteen of the 29 cards need no target and sixteen do, so both branches are
   * ordinary and the spec covers whichever one the shuffle produced.
   *
   * **The card leaves the hand either way**, which is the assertion that matters: a card that resolved
   * and a card that is waiting for a target look different on screen, and neither may still be sitting
   * in the hand as though it had not been played.
   */
  test("plays a card, or asks what to aim it at", async ({ page }) => {
    const board = await openAtActionPhase(page);
    test.skip((await boardState(board)).phase !== "action", "this hand held no playable card");

    const card = skillHand(board).locator('.card[data-playable="true"]').first();
    const cardId = await card.getAttribute("data-card-id");

    await card.click();

    const asking = (await prompt(board).getAttribute("data-mode")) === "target";

    if (asking) {
      // A target is being collected. Nothing has been dispatched yet, so the card is still the
      // player's to take back.
      await expect(prompt(board).locator('[data-prompt-action="cancel"]')).toBeVisible();
      await expect(prompt(board).locator(".prompt__line")).not.toBeEmpty();
    } else {
      // It resolved at once, so it is in the discard pile and out of the hand.
      await expect(skillHand(board).locator(`.card[data-card-id="${cardId}"]`)).toHaveCount(0);
      await expect(skillHand(board)).toHaveAttribute("data-count", "0");
    }
  });

  /**
   * Cancelling is free, and that is the point of collecting targets in `ui/` rather than dispatching a
   * half-finished card play. Nothing was sent, so the card is still in hand and the budget is unspent.
   */
  test("gives the card back when the player cancels a target", async ({ page }) => {
    const board = await openAtActionPhase(page);
    test.skip((await boardState(board)).phase !== "action", "this hand held no playable card");

    const card = skillHand(board).locator('.card[data-playable="true"]').first();
    const cardId = await card.getAttribute("data-card-id");

    await card.click();
    test.skip(
      (await prompt(board).getAttribute("data-mode")) !== "target",
      "this card needed no target"
    );

    await prompt(board).locator('[data-prompt-action="cancel"]').click();

    await expect(prompt(board)).not.toHaveAttribute("data-mode", "target");
    await expect(skillHand(board).locator(`.card[data-card-id="${cardId}"]`)).toHaveCount(1);
    await expect(board).not.toHaveAttribute("data-picking", /.*/);
  });

  /**
   * NFR-08, and the same argument as the dice hand's keyboard case: `card-state.css` styles
   * `:focus-visible` on a card, and a focus state on an element the keyboard cannot reach is a state
   * that never happens.
   */
  test("can be played from the keyboard alone (NFR-08)", async ({ page }) => {
    const board = await openAtActionPhase(page);
    test.skip((await boardState(board)).phase !== "action", "this hand held no playable card");

    const card = skillHand(board).locator('.card[data-playable="true"]').first();

    await card.focus();
    await expect(card).toBeFocused();
    await page.keyboard.press("Enter");

    // Something happened: either the card resolved or a target is being asked for.
    await expect
      .poll(async () => {
        const mode = await prompt(board).getAttribute("data-mode");
        const count = await skillHand(board).getAttribute("data-count");

        return mode === "target" || count === "0";
      })
      .toBe(true);
  });
});

/**
 * FR-31 again, for the region that was added after the layout was measured.
 *
 * The prompt strip is a fourth grid row and it appears and disappears during play, which is exactly the
 * shape of change that breaks a one-screen layout. `shell.spec.js` measures the page at the start of a
 * match, when the strip is hidden and costs nothing; this measures it while the strip is up.
 */
test.describe("the prompt strip and the one-screen layout", () => {
  test("does not make the page scroll while it is asking something", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    await chooseDiceCard(board);

    const mode = await prompt(board).getAttribute("data-mode");
    test.skip(mode !== "action", "this hand held no playable card, so nothing was asked");

    await expect(prompt(board)).toBeVisible();

    const overflow = await page.evaluate(() => ({
      vertical: document.documentElement.scrollHeight - window.innerHeight,
      horizontal: document.documentElement.scrollWidth - window.innerWidth,
    }));

    expect(overflow.vertical).toBeLessThanOrEqual(0);
    expect(overflow.horizontal).toBeLessThanOrEqual(0);
  });
});
