/**
 * A pawn on the track advances exactly the number rolled. Requirement FR-10.
 *
 * The roll is read off `data-roll` rather than copied into the test from the seed, so this asserts
 * the relationship, `after = before + roll`, and not a pair of numbers that happen to match today.
 */

import { expect, test } from "@playwright/test";

import {
  SEEDS,
  boardState,
  firstMovablePawn,
  openMatch,
  pawnPositions,
  playTurn,
  playUntil,
} from "./helpers.js";

/** Play on until the pawn that is about to move is already on the track rather than in a yard. */
async function reachAnAdvance(board) {
  await playUntil(board, async () => {
    const { phase, activePlayer } = await boardState(board);
    if (phase !== "act") return false;

    const pawn = firstMovablePawn(board);
    if ((await pawn.count()) === 0) return false;

    const seat = await pawn.getAttribute("data-player");
    if (seat !== String(activePlayer)) return false;

    return Number(await pawn.getAttribute("data-r")) > 0;
  });
}

test.describe("a pawn advances along the track", () => {
  test("moves exactly the number rolled", async ({ page }) => {
    const board = await openMatch(page, SEEDS.advancesEarly);

    await reachAnAdvance(board);

    const { roll, activePlayer } = await boardState(board);
    const pawn = firstMovablePawn(board);
    const index = await pawn.getAttribute("data-pawn");
    const before = Number(await pawn.getAttribute("data-r"));

    await pawn.click();
    await pawn.click();

    await expect
      .poll(async () => (await pawnPositions(board))[`${activePlayer}.${index}`])
      .toBe(before + roll);
  });

  test("leaves every other pawn exactly where it stood", async ({ page }) => {
    const board = await openMatch(page, SEEDS.advancesEarly);

    await reachAnAdvance(board);

    const { activePlayer } = await boardState(board);
    const index = await firstMovablePawn(board).getAttribute("data-pawn");
    const before = await pawnPositions(board);

    // `playTurn` clicks twice and then waits for the turn number to move on, which is the only
    // signal that cannot be missed when the pauses are collapsed to zero.
    await playTurn(board);

    const after = await pawnPositions(board);
    const moved = Object.keys(after).filter((id) => after[id] !== before[id]);

    expect(moved).toEqual([`${activePlayer}.${index}`]);
  });

  test("lights only the selected pawn's target once a pawn is picked", async ({ page }) => {
    const board = await openMatch(page, SEEDS.advancesEarly);

    await reachAnAdvance(board);
    await firstMovablePawn(board).click();

    // FR-32 shows the whole choice before a pawn is picked and narrows to one square after, so the
    // second click can only ever have one consequence.
    await expect(board.locator('.square[data-legal-target="true"]')).toHaveCount(1);
    await expect(board.locator('.pawn[data-selected="true"]')).toHaveCount(1);
  });
});
