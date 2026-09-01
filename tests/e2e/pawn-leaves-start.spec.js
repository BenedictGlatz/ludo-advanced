/**
 * Leaving the start area on the die's maximum. Requirement FR-09, and FR-32 for the highlight.
 *
 * Seed 1 with four players rolls the maximum on turn 1, so this is the first thing that happens.
 */

import { expect, test } from "@playwright/test";

import {
  SEEDS,
  boardState,
  chooseAndCarryOn,
  firstMovablePawn,
  openMatch,
  pawnPositions,
} from "./helpers.js";

/**
 * Open the match and take the step before the one this spec is about: pick a dice card.
 *
 * Since issue #31 a turn starts in `choose` and no pawn is offered until a card has been picked, so
 * every test here needs that step first. It is a local helper and not part of `openMatch`, because a
 * match really does open with a choice to make and hiding that in the opener would make the specs
 * describe a game that does not exist.
 */
async function openAndChoose(page) {
  const board = await openMatch(page, SEEDS.leavesStartAtOnce);
  await chooseAndCarryOn(board);
  return board;
}

test.describe("a pawn leaves the start area", () => {
  test("moves onto its own entry field when the maximum is rolled", async ({ page }) => {
    const board = await openAndChoose(page);

    await expect(board).toHaveAttribute("data-phase", "act");
    const { activePlayer, roll, die } = await boardState(board);

    // FR-09 is "the die's maximum", not "a six". Which die that is depends on the card the turn
    // drew, so the test asserts the rule and not the number a fixed D6 used to produce.
    expect(roll).toBe(die);

    const before = await pawnPositions(board);
    expect(before[`${activePlayer}.0`]).toBe(0);

    const pawn = firstMovablePawn(board);
    await pawn.click();
    await pawn.click();

    await expect.poll(async () => (await pawnPositions(board))[`${activePlayer}.0`]).toBe(1);
  });

  test("highlights the entry field before the player commits (FR-32)", async ({ page }) => {
    const board = await openAndChoose(page);
    const { activePlayer } = await boardState(board);

    // With nothing selected, every legal move is lit. All four pawns can leave on a maximum, and
    // all four would land on the same square, so exactly one field carries the highlight.
    await expect(board.locator('.square[data-legal-target="true"]')).toHaveCount(1);
    await expect(board.locator(`.square[data-entry-of="${activePlayer}"]`)).toHaveAttribute(
      "data-legal-target",
      "true"
    );

    await expect(board.locator('.pawn[data-movable="true"]')).toHaveCount(4);
  });

  test("marks the pawn selected on the first click and moves it on the second", async ({
    page,
  }) => {
    const board = await openAndChoose(page);
    const { activePlayer } = await boardState(board);
    const index = await firstMovablePawn(board).getAttribute("data-pawn");

    // Pinned to this one pawn rather than to "the first movable pawn". That locator is live: the
    // second click ends the turn, the next seat's pawns become the movable ones, and the assertion
    // below would then be reading a different pawn that happens to still be at r = 0.
    const pawn = board.locator(`.pawn[data-player="${activePlayer}"][data-pawn="${index}"]`);

    await pawn.click();
    await expect(pawn).toHaveAttribute("data-selected", "true");
    await expect(pawn).toHaveAttribute("data-r", "0");

    await pawn.click();
    await expect(pawn).toHaveAttribute("data-r", "1");
  });

  test("does not offer a pawn to a player whose turn it is not", async ({ page }) => {
    const board = await openAndChoose(page);
    const { activePlayer } = await boardState(board);

    const movable = board.locator('.pawn[data-movable="true"]');
    const seats = await movable.evaluateAll((pawns) =>
      pawns.map((pawn) => pawn.getAttribute("data-player"))
    );

    expect(new Set(seats)).toEqual(new Set([String(activePlayer)]));
  });
});
