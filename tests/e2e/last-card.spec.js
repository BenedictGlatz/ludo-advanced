/**
 * The last card played, as the fifth plate in the HUD row. Issue #93, design spec 17, D100.
 *
 * The playtest behind it: a card was played, the message strip said one sentence, the sentence went
 * away, and nothing on screen could still be asked what had happened. The plate is the record.
 *
 * Lock In is the card driven here for the same reason `pawn-status.spec.js` uses it: `?stack=` can put
 * it on top of the skill pool, it targets one of the caster's own pawns, and its rule runs in the moment
 * it is played, so the outcome the plate reports is settled by the time the click returns.
 *
 * **What this spec does not check** is the plate's geometry. That the reveal hangs below the plate at
 * 15.5rem and that the `pending` edge breathes is design spec 17's, and a case pinning either would
 * report the next design adjustment as a defect. What is checked is that the words are right, that the
 * card is in the DOM, and that pointing at the plate brings it up.
 */

import { expect, test } from "@playwright/test";

import cardsDe from "../../src/i18n/locales/de/cards.json" with { type: "json" };
import de from "../../src/i18n/locales/de/ui.json" with { type: "json" };
import { SEEDS, openMatch, playTurn } from "./helpers.js";
import { awaitCardInHand, reachOwnPawnOnTrack, skillHand } from "./trap-helpers.js";

/** The plate. Beside the board rather than inside it: it is a child of the HUD row. */
function plate(board) {
  return board.page().locator(".last-card");
}

/** Play Lock In on one of seat 0's own pawns, and answer whether it happened. */
async function playLockIn(board) {
  if (!(await awaitCardInHand(board, "action-lock-in", playTurn))) return false;
  if (!(await reachOwnPawnOnTrack(board, playTurn))) return false;

  await skillHand(board).locator('.card[data-card-id="action-lock-in"]').first().click();
  await expect(board).toHaveAttribute("data-picking", "own-pawn");
  await board.locator('.pawn[data-pickable="true"]').first().click();

  return true;
}

test.describe("the last card played", () => {
  test("holds its place in the HUD row before anybody has played anything", async ({ page }) => {
    const board = await openMatch(page, SEEDS.advancesEarly);

    await expect(plate(board)).toHaveAttribute("data-empty", "true");
    await expect(plate(board).locator(".last-card__heading")).toHaveText(de.lastCard.heading);
    await expect(plate(board).locator(".last-card__by")).toHaveText(de.lastCard.empty);
    await expect(plate(board).locator(".last-card__line")).toHaveText("");

    // The last child of the row, which is where D100 puts it: the row spans both grid columns and
    // centres its plates, so a plate outside it cannot sit at its end.
    const last = await page.evaluate(
      () => document.querySelector(".hud").lastElementChild.className
    );
    expect(last).toContain("last-card");
  });

  test("names the card, the seat and the turn once one has been played", async ({ page }) => {
    const board = await openMatch(page, SEEDS.advancesEarly, {
      fast: true,
      stack: ["action-lock-in"],
    });
    test.skip(!(await playLockIn(board)), "Lock In never reached a hand with an own pawn on track");

    await expect(plate(board)).toHaveAttribute("data-empty", "false");
    await expect(plate(board)).toHaveAttribute("data-player", "0");
    await expect(plate(board)).toHaveAttribute("data-outcome", /resolved|pending/);
    await expect(plate(board).locator(".last-card__line")).toHaveText(
      cardsDe.card.skill["action-lock-in"].title
    );

    // The turn on the plate is the turn the card was played on, not the turn the board is on now.
    const turn = await plate(board).getAttribute("data-turn");
    await expect(plate(board).locator(".last-card__by")).toContainText(`Zug ${turn}`);
  });

  test("keeps the record after the turn has passed", async ({ page }) => {
    const board = await openMatch(page, SEEDS.advancesEarly, {
      fast: true,
      stack: ["action-lock-in"],
    });
    test.skip(!(await playLockIn(board)), "Lock In never reached a hand with an own pawn on track");

    const turn = await plate(board).getAttribute("data-turn");
    await playTurn(board);

    await expect(plate(board)).toHaveAttribute("data-empty", "false");
    await expect(plate(board)).toHaveAttribute("data-turn", turn);
  });

  test("holds the card itself, and pointing at the plate brings it up", async ({ page }) => {
    const board = await openMatch(page, SEEDS.advancesEarly, {
      fast: true,
      stack: ["action-lock-in"],
    });
    test.skip(!(await playLockIn(board)), "Lock In never reached a hand with an own pawn on track");

    const card = plate(board).locator('.last-card__reveal .card[data-card-id="action-lock-in"]');
    await expect(card).toHaveClass(/card--full/);

    // Present in the DOM and invisible until asked for (D66's mechanism, reused).
    const opacity = () =>
      plate(board)
        .locator(".last-card__reveal")
        .evaluate((element) => window.getComputedStyle(element).opacity);

    expect(Number(await opacity())).toBeLessThan(1);
    await plate(board).hover();
    await expect.poll(async () => Number(await opacity())).toBe(1);

    // The card is a record and not an offer: it takes no click and it is no tab stop.
    await expect(card).toHaveAttribute("tabindex", "-1");
    const events = await plate(board)
      .locator(".last-card__reveal")
      .evaluate((element) => window.getComputedStyle(element).pointerEvents);
    expect(events).toBe("none");
  });
});
