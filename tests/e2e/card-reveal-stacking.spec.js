/**
 * What may cover a card that is being read, and what may not.
 *
 * ## Why this is its own file and not two more cases in `card-reveal.spec.js`
 *
 * That file is about the reveal itself: the paragraph appears, at a readable size, from the pointer and
 * from the keyboard, and the hand stays face up. Every case in it passes with the revealed card painted
 * underneath something else. These two are about the layer the revealed card lands in, they fail for a
 * different reason, and both were reported from screenshots of real matches rather than found by a test.
 * `card-reveal.spec.js` was also at NFR-02's 300 lines, so the split had to happen somewhere, and this
 * is the seam it happened on.
 *
 * ## The one thing both cases have in common
 *
 * **`elementFromPoint` is the assertion and a computed `z-index` is not.** A z-index number only means
 * something together with the stacking contexts around it, and it was the contexts that were wrong both
 * times: `card.css` gives every card `position: relative` and a z-index, so a card is a stacking context
 * of its own, while the plates around it were not, so numbers from two different scales were compared
 * straight across. Asking the browser what is actually painted where the two boxes meet is the only
 * assertion that a number which merely looks right cannot satisfy.
 */

import { expect, test } from "@playwright/test";

import {
  SEEDS,
  boardState,
  carryOn,
  chooseDiceCard,
  diceHand,
  openMatch,
  playTurn,
} from "./helpers.js";

/** The skill hand, in the rail beside the board. */
function skillHand(board) {
  return board.page().locator(".hand--skill");
}

/**
 * How large the rules paragraph is actually painted, in CSS pixels, or `null` while it is hidden.
 *
 * The reveal has to have finished before the boxes can meet, so every case here polls this first. The
 * arithmetic behind the number is in `card-reveal.spec.js`, which is the file that asserts it.
 */
function paintedParagraphSize(card) {
  return card.evaluate((element) => {
    const text = element.querySelector(".card__text");
    const style = window.getComputedStyle(text);

    if (style.display === "none") {
      return null;
    }

    const scale = window.getComputedStyle(element).scale;
    const factor = scale === "none" ? 1 : Number.parseFloat(scale);

    return Number.parseFloat(style.fontSize) * factor;
  });
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
 * What the player actually sees where the revealed card and `other` overlap, as a word.
 *
 * Returns "no overlap" when the two boxes do not meet at all, which would make the case vacuous. A
 * green test that proves nothing is worse here than a red one, because being invisible to the suite is
 * exactly how both of these defects reached a player.
 */
function topmostWhereTheyOverlap(page, index, other) {
  return page.evaluate(
    ({ fanIndex, selector }) => {
      const read = document.querySelectorAll(".hand--skill .card[data-card-id]")[fanIndex];
      const rival = document.querySelector(selector);
      const a = read.getBoundingClientRect();
      const b = rival.getBoundingClientRect();

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

      return rival === hit || rival.contains(hit) ? "the other thing" : "something else";
    },
    { fanIndex: index, selector: other }
  );
}

test.describe("a card being read is the top thing in the rail", () => {
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

    const dice = '.hand--dice .card[data-selected="true"]';
    await expect.poll(() => topmostWhereTheyOverlap(page, index, dice)).toBe("the card being read");
  });

  /**
   * Reported on 2026-09-06, from a screenshot of a real match, and it is the same defect one level up.
   *
   * D98 moved the message strip off the board and onto the skill plate, where it hangs in the band just
   * above the cards. It stood at `--layer-refusal`, 5, on the page's scale, and a card being read stands
   * at `--layer-card-reading`, 4, on the card scale. Neither `.app__skill` nor `.hand` was a stacking
   * context, so the two scales were compared straight across and the strip won: the bar cut through the
   * title and the rules paragraph of the card the player had just asked to read, which is the one thing
   * the reveal exists to show. `app.css` gives the plate the layer now and the strip keeps none itself.
   *
   * **An Angel Die is what puts a message on screen and leaves it there.** The roll breakdown (D73) is
   * the only one of the strip's three voices that stays up through the whole `act` phase, because the
   * player reads it while deciding which pawn to move. A refusal passes the turn a few seconds later and
   * a trap announcement holds the turn, so both would race the 280 ms the reveal takes. Two copies of
   * the same card for the reason `roll-animation.spec.js` gives: `?stack=` replaces the pool and the
   * draw is random, so one id twice is the only certain hand.
   */
  test("paints the card being read above the message strip", async ({ page }) => {
    const board = await openMatch(page, SEEDS.advancesEarly, {
      stack: Array.from({ length: 8 }, () => "action-angel-die"),
    });
    const strip = page.locator(".message-strip");

    // Two turns played without a card, so the seat that comes back on turn 3 holds two of them: one to
    // play and one left in the fan to read. A seat draws one card per turn (FR-23), so a hand that still
    // has a card in it after playing one cannot be reached on turn 1 at all.
    await playTurn(board);
    await playTurn(board);

    await chooseDiceCard(board);
    await skillHand(board).locator('.card[data-card-id="action-angel-die"]').first().click();
    await carryOn(board);

    expect((await boardState(board)).phase).toBe("act");
    await expect(strip).toHaveAttribute("data-message-kind", "roll");
    await expect(strip).toBeVisible();

    // Any card in the fan meets the strip: it spans the full width of the plate and a revealed card
    // grows straight up out of it. The one the seat did not play is the one left to point at.
    const card = skillHand(board).locator(".card[data-card-id]").first();

    await card.hover();
    await expect.poll(() => paintedParagraphSize(card)).toBeGreaterThan(12);

    await expect
      .poll(() => topmostWhereTheyOverlap(page, 0, ".message-strip"))
      .toBe("the card being read");
  });
});
