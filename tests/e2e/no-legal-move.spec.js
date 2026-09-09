/**
 * A roll with no legal move passes the turn and says why. Requirements FR-14 and NFR-08.
 *
 * NFR-08's acceptance criterion is that a playtester can say why a move was refused **without being
 * told**. That is a question about attention, so it cannot be fully automated: what a test can check
 * is that the reason is on screen, in the player's own language, in the region D9 put it in, and for
 * long enough to read. Whether a person actually reads it is a playtest, and it is still outstanding.
 *
 * Seed 1 with four players has no legal move on turn 1, so the refusal is the first thing the board
 * ever shows. This spec runs with the real pauses rather than with `?fast=1`, because the four-second
 * minimum of D9 is part of what is being tested.
 *
 * **That also means the handover gate is on here**, unlike in most of the suite. Since issue #39 a turn
 * ends in a screen that names the next player and waits for a button, so the case that measures the four
 * seconds is also the case that has to press it.
 */

import { expect, test } from "@playwright/test";

import { SEEDS, boardState, chooseAndCarryOn, openMatch, playUntil } from "./helpers.js";

/**
 * Open the match and pick a dice card, which is what produces the refused turn.
 *
 * Since issue #31 the refusal is no longer the first thing on screen: the three drawn cards are, and
 * the turn is only refused once one of them has been rolled. Seed 2 refuses whichever of the three is
 * picked, and the helpers always pick slot 0.
 */
async function openAndChoose(page, options) {
  const board = await openMatch(page, SEEDS.passesOnTurnOne, options);
  await chooseAndCarryOn(board);
  return board;
}

test.describe("a turn with no legal move", () => {
  test("shows a reason in the strip beside the hands and then passes the turn", async ({
    page,
  }) => {
    const board = await openAndChoose(page, { fast: false });
    const message = page.locator(".message-strip");

    // The turn went straight from rolling to its end, with no `act` phase in between.
    await expect(board).toHaveAttribute("data-phase", "turn-end");

    await expect(message).toHaveAttribute("data-message-kind", "refusal");
    await expect(message).toBeVisible();
    await expect(message).not.toHaveText("");

    // FR-09 is the reason here: four pawns in the yard and a roll that was not the maximum.
    await expect(message).toHaveAttribute("data-reason-key", "move.refused.needs-maximum");

    // No pawn is offered, because there is nothing to offer.
    await expect(board.locator('.pawn[data-movable="true"]')).toHaveCount(0);
    await expect(board.locator('.square[data-legal-target="true"]')).toHaveCount(0);
  });

  test("says it in German, which is the default language", async ({ page }) => {
    const board = await openAndChoose(page, { fast: false });
    await expect(board).toHaveAttribute("data-phase", "turn-end");

    // NFR-03: the text comes from the locale file, never from the rules and never from a stylesheet.
    // The rules produced the key `move.refused.needs-maximum` and knew no language at all.
    await expect(page.locator(".message-strip")).toHaveText(
      "Zum Verlassen des Startfeldes brauchst du die höchste Zahl des Würfels."
    );
  });

  test("leaves the reason on screen long enough to read, then hands over", async ({ page }) => {
    const board = await openAndChoose(page, { fast: false });
    const message = page.locator(".message-strip");

    const { activePlayer } = await boardState(board);
    await expect(message).toBeVisible();

    // D9: the strip stays for at least four seconds. Still there after three.
    await page.waitForTimeout(3000);
    await expect(message).toBeVisible();
    await expect(board).toHaveAttribute("data-active-player", String(activePlayer));

    // Since issue #39 "hands over" means the handover screen rather than the turn changing by itself.
    // The requirement is unchanged and so is the order it puts things in: the reason is readable for
    // D9's four seconds **first**, and only then does anything cover the board. What changed is that a
    // person now says the screen has been passed on, which is what makes a secret hand secret at one
    // shared screen (decision D33).
    const overlay = page.locator(".overlay");
    await expect(overlay).toHaveAttribute("data-screen", "handover", { timeout: 15_000 });

    await overlay.locator('[data-action="ready"]').click();
    await expect(board).not.toHaveAttribute("data-active-player", String(activePlayer), {
      timeout: 15_000,
    });
  });

  test("clears the reason once the next player has something to do", async ({ page }) => {
    const board = await openMatch(page, SEEDS.passesOnTurnOne);
    const message = page.locator(".message-strip");

    // Sooner or later somebody can move, and at that moment the refusal must be gone: a reason
    // belonging to a turn that is over is worse than no reason. The turns have to be played rather
    // than waited for, because since issue #31 a turn does not pass itself until a card is picked.
    await playUntil(board, async () => (await boardState(board)).phase === "act");

    await expect(board).toHaveAttribute("data-phase", "act");
    await expect(message).not.toHaveAttribute("data-message-kind", "refusal");
    await expect(message).toHaveText("");
  });
});
