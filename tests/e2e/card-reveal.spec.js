/**
 * Reading a card you are holding. Design handoff 10, D65 to D69.
 *
 * Two defects put this file here, and neither of them was a missing hover rule.
 *
 * The first is D65. `skill-hand-view.js` writes `data-active` from `playableCards(state, seat).length`,
 * so the attribute means "some card here can be played this instant". `card-state.css` read the same
 * attribute as "this hand is not yours" and drew every card in it as a card back, so a player looked at
 * the back of their own five cards through the dice card choice, through the move, and again once their
 * card budget was spent. The second is D66: even face up, the rules paragraph computes to 8.57 px at hand
 * size, so `card.css` hid it.
 *
 * ## Why this is its own spec file and not three more cases in `skill-hand.spec.js`
 *
 * That file is about **playing** a card: FR-23 to FR-26, the click, the target, the prompt. This one is
 * about **reading** one, it asserts computed style rather than game state, and the two fail for different
 * reasons. It is the same seam `trap-marks.spec.js` was split off `traps.spec.js` on.
 *
 * ## Why the assertions are on computed style and not on a screenshot
 *
 * The reveal is pure CSS. There is no attribute the app writes when a card is revealed, on purpose: the
 * spec's § 8 asks for `:hover` and `:focus-visible` and for `src/ui/events.js` to stay at `click` and
 * `keydown`. So there is nothing in the DOM to assert against, and what the player gets, a paragraph they
 * can read, is a computed `display` and a painted font size.
 *
 * **The negative finding that made this file necessary.** There was no test on hover behaviour anywhere
 * in the suite before 2026-09-03, which is why the face-down hand survived two sprints: a CSS-only
 * interaction with no test is invisible to everything except somebody playing a round.
 */

import { expect, test } from "@playwright/test";

import { SEEDS, boardState, chooseDiceCard, diceHand, openMatch } from "./helpers.js";

/** The skill hand, in the rail beside the board. */
function skillHand(board) {
  return board.page().locator(".hand--skill");
}

/**
 * How large the rules paragraph is actually painted, in CSS pixels.
 *
 * Two numbers multiplied, because D66 magnifies the card rather than re-sizing it: the card's layout box
 * stays 159.1 px wide and `scale` paints it at 234. So the paragraph's computed `font-size` is still the
 * hand-size one, 8.57 px at the design resolution, and the size the player reads is that times the scale.
 * Returns `null` while the paragraph is hidden, so a poll can wait for it to appear.
 */
function paintedParagraphSize(card) {
  return card.evaluate((element) => {
    const text = element.querySelector(".card__text");
    const style = window.getComputedStyle(text);

    if (style.display === "none") {
      return null;
    }

    // `scale` computes to "none" at rest and to "1.47059" or "1.47059 1.47059" once it is set.
    const scale = window.getComputedStyle(element).scale;
    const factor = scale === "none" ? 1 : Number.parseFloat(scale);

    return Number.parseFloat(style.fontSize) * factor;
  });
}

/**
 * Focus a card the way a keyboard user does, which `.focus()` alone does not do.
 *
 * `:focus-visible` is the reveal's second trigger and it is deliberately not the same as `:focus`: a
 * browser only matches it when the focus came from the keyboard. Calling `.focus()` from a script moves
 * focus without that, so the ring and the reveal would both be missing and the test would be asserting
 * the wrong thing. Shift+Tab and then Tab lands on the same element through a real key press.
 */
async function tabTo(page, card) {
  await card.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(card).toBeFocused();
}

/**
 * Which card in the fan stands closest to the chosen dice card, as an index into the fan.
 *
 * A revealed card grows straight up out of its own plate, so it can only meet the dice card that is
 * in the same column. Asking the page rather than pinning a slot keeps the case correct if the fan's
 * overlap or the plate's width ever changes.
 */
function nearestSkillIndex(page) {
  return page.evaluate(() => {
    const middle = (element) => {
      const box = element.getBoundingClientRect();
      return box.left + box.width / 2;
    };

    const dice = middle(document.querySelector('.hand--dice .card[data-selected="true"]'));
    const cards = [...document.querySelectorAll(".hand--skill .card[data-card-id]")];

    return cards.reduce(
      (best, card, index) =>
        Math.abs(middle(card) - dice) < Math.abs(middle(cards[best]) - dice) ? index : best,
      0
    );
  });
}

/**
 * What the player actually sees where the two cards overlap, as a word.
 *
 * `elementFromPoint` is the assertion and a computed `z-index` is not, because the number only means
 * something together with the stacking contexts around it, and it was the contexts that were wrong
 * here: a card is one, a plate is not, so both hands paint into the same space and the dice card won.
 * Returns "no overlap" when the boxes do not meet at all, which would make the case vacuous.
 */
function topmostWhereTheyOverlap(page, index) {
  return page.evaluate((fanIndex) => {
    const read = document.querySelectorAll(".hand--skill .card[data-card-id]")[fanIndex];
    const dice = document.querySelector('.hand--dice .card[data-selected="true"]');
    const a = read.getBoundingClientRect();
    const b = dice.getBoundingClientRect();

    const left = Math.max(a.left, b.left);
    const right = Math.min(a.right, b.right);
    const top = Math.max(a.top, b.top);
    const bottom = Math.min(a.bottom, b.bottom);

    if (right <= left || bottom <= top) {
      return "no overlap";
    }

    const hit = document.elementFromPoint((left + right) / 2, (top + bottom) / 2);

    if (read.contains(hit)) {
      return "the card being read";
    }

    return dice.contains(hit) ? "the chosen dice card" : "something else";
  }, index);
}

test.describe("reading a card in your own hand", () => {
  /**
   * D66. The card under the pointer is magnified to exactly the reference size, so the rules paragraph
   * is painted at the size it was written for instead of at 8.57 px.
   *
   * Polled rather than awaited once, because the growth waits `--motion-reveal-delay` and then takes
   * `--motion-reveal`, which is 280 ms in total and is the whole point of D68.
   */
  test("shows the rules paragraph at a readable size when the pointer rests on a card", async ({
    page,
  }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const card = skillHand(board).locator(".card[data-card-id]").first();

    // Hidden before the pointer arrives. This is the state the request was made about.
    expect(await paintedParagraphSize(card)).toBeNull();

    await card.hover();

    // 12 px is the floor, not the target. The arithmetic in 10-spec § 5 puts it at 12.6 px at the design
    // resolution, and asserting the floor rather than the number keeps this green if the root moves.
    await expect.poll(() => paintedParagraphSize(card)).toBeGreaterThan(12);
  });

  /**
   * D67. A card that cannot be played reveals identically, on the keyboard as well as under the pointer,
   * and it gives up its desaturation while it is being read.
   *
   * A Reaction card is the case: it is never playable during its owner's own turn, and it is exactly the
   * card a player most wants to read, because they have to decide in someone else's turn whether they
   * still hold it. Before this delivery, pointing at it did nothing at all.
   */
  test("reveals a card that cannot be played, reached from the keyboard (NFR-08)", async ({
    page,
  }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce, {
      stack: ["reaction-nuehue"],
    });
    const card = skillHand(board).locator('.card[data-card-id="reaction-nuehue"]');

    await expect(card).toHaveAttribute("data-playable", "false");

    // It is a tab stop at all, which is the half of D67 that needed code. `card-view.js` gave an
    // unplayable card `tabindex="-1"` until the reveal gave focus something to do.
    await expect(card).toHaveAttribute("tabindex", "0");

    await tabTo(page, card);
    await expect.poll(() => paintedParagraphSize(card)).toBeGreaterThan(12);

    // And it is read at full contrast: `card-state.css` desaturates an unplayable card in the fan, and a
    // card being read is out of the fan.
    await expect(card).toHaveCSS("filter", "none");
  });

  /**
   * D65, and this is the regression that would have caught the original defect.
   *
   * During the dice card phase no skill card is playable, so `data-active` on the hand is `"false"`. That
   * used to be enough to draw five card backs. The hand is face up now and stays readable, and the plate
   * dim in `app.css` is what says the region is dormant.
   */
  test("keeps the player's own hand face up during the dice card phase", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const hand = skillHand(board);

    expect((await boardState(board)).phase).toBe("choose");

    await expect(hand).toHaveAttribute("data-face", "up");

    // Not just the attribute: the card is genuinely readable. The back hid every real child of the card
    // with `visibility: hidden`, so the title is the thing that was gone.
    const title = hand.locator(".card[data-card-id] .card__title").first();
    await expect(title).toBeVisible();
    await expect(title).not.toBeEmpty();

    // The region still says it is not asking anything, in the two ways D65.3 kept.
    await expect(hand).toHaveAttribute("data-active", "false");
    await expect(hand.locator(".card[data-card-id]").first()).toHaveAttribute(
      "data-playable",
      "false"
    );
  });

  /**
   * `.card--reading` is the third trigger next to `:hover` and `:focus-visible`, and nothing in `src/`
   * may ever write it: 10-spec § 6 says so. It exists so the state has a name that a mockup can pin.
   *
   * Without this case it would be dead CSS in the repository, which is the kind of thing this project
   * writes down rather than ships quietly. So it is asserted here instead, against the hover state it
   * has to match, and the same case is what proves nothing in the app writes it.
   */
  test("pins the same state with .card--reading, which the app never writes", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    await chooseDiceCard(board);

    const card = skillHand(board).locator(".card[data-card-id]").first();

    // Nothing in the app has written the class, in any phase reached so far.
    await expect(card).not.toHaveClass(/card--reading/);

    await card.evaluate((element) => element.classList.add("card--reading"));

    await expect.poll(() => paintedParagraphSize(card)).toBeGreaterThan(12);
    await expect
      .poll(() => card.evaluate((element) => window.getComputedStyle(element).scale))
      .not.toBe("none");
  });

  /**
   * Reported on 2026-09-04, from a screenshot of a real match: the card under the pointer was covered
   * by the dice card the player had just chosen.
   *
   * 10-spec § 3 had ruled the overlap correct and said DOM order settles it, since `.app__skill` comes
   * after `.app__dice`. That is true of the two plates and false of the cards in them. `.card` sets
   * `position: relative` and a `z-index`, so every card is a stacking context of its own, while neither
   * plate sets either, so both hands compete in one z-index space. `--layer-card-selected` is 3 and the
   * revealed card was at `--layer-card-raised`, 2.
   */
  test("paints the card being read above the dice card the player chose", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    await chooseDiceCard(board);

    await expect(diceHand(board).locator('.card[data-selected="true"]')).toHaveCount(1);

    const index = await nearestSkillIndex(page);
    const card = skillHand(board).locator(".card[data-card-id]").nth(index);

    await card.hover();

    // The card has to be at full size before the boxes can meet, so the reveal is awaited first.
    await expect.poll(() => paintedParagraphSize(card)).toBeGreaterThan(12);

    await expect.poll(() => topmostWhereTheyOverlap(page, index)).toBe("the card being read");
  });
});
