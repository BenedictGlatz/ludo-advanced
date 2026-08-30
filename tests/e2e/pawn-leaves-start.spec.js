/**
 * Leaving the start area on the die's maximum. Requirement FR-09, and FR-32 for the highlight.
 *
 * Seed 4 with four players rolls the maximum on turn 1, so this is the first thing that happens.
 */

import { expect, test } from "@playwright/test";

import { SEEDS, boardState, firstMovablePawn, openMatch, pawnPositions } from "./helpers.js";

test.describe("a pawn leaves the start area", () => {
  test("moves onto its own entry field when the maximum is rolled", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    await expect(board).toHaveAttribute("data-phase", "act");
    const { activePlayer, roll } = await boardState(board);
    expect(roll).toBe(6);

    const before = await pawnPositions(board);
    expect(before[`${activePlayer}.0`]).toBe(0);

    const pawn = firstMovablePawn(board);
    await pawn.click();
    await pawn.click();

    await expect.poll(async () => (await pawnPositions(board))[`${activePlayer}.0`]).toBe(1);
  });

  test("highlights the entry field before the player commits (FR-32)", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
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
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const pawn = firstMovablePawn(board);

    await pawn.click();
    await expect(pawn).toHaveAttribute("data-selected", "true");
    await expect(pawn).toHaveAttribute("data-r", "0");

    await pawn.click();
    await expect(pawn).toHaveAttribute("data-r", "1");
  });

  test("does not offer a pawn to a player whose turn it is not", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const { activePlayer } = await boardState(board);

    const movable = board.locator('.pawn[data-movable="true"]');
    const seats = await movable.evaluateAll((pawns) =>
      pawns.map((pawn) => pawn.getAttribute("data-player"))
    );

    expect(new Set(seats)).toEqual(new Set([String(activePlayer)]));
  });
});
