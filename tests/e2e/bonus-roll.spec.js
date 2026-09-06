/**
 * A natural maximum on a D6 or larger rolls the same die again. Issue #89.
 *
 * `SEEDS.leavesStartAtOnce` rolls the chosen die's maximum on turn 1, which is what FR-09 needs to leave
 * the yard and, since issue #89, what earns a second roll when the die has six faces or more. Which die
 * slot 0 holds is a fact about the seed, so the spec reads `data-die` and asserts the rule either way:
 * a D6 or larger rolls again inside turn 1, a D2 or a D4 hands the turn on.
 *
 * The board carries `data-rolls`, the count of rolls in the current turn, precisely so this spec does
 * not have to infer a second roll from timing.
 */

import { expect, test } from "@playwright/test";

import { SEEDS, boardState, chooseAndCarryOn, firstMovablePawn, openMatch } from "./helpers.js";

test("the maximum on a D6 or larger rolls again in the same turn", async ({ page }) => {
  const board = await openMatch(page, SEEDS.leavesStartAtOnce);
  await chooseAndCarryOn(board);

  const { roll, die, turnNumber } = await boardState(board);
  expect(roll).toBe(die);
  await expect(board).toHaveAttribute("data-rolls", "1");

  const pawn = firstMovablePawn(board);
  await pawn.click();
  await pawn.click();

  if (die >= 6) {
    // Still turn 1, and the die has been thrown a second time.
    await expect(board).toHaveAttribute("data-rolls", "2");
    expect((await boardState(board)).turnNumber).toBe(turnNumber);
  } else {
    // A D2 or a D4 earns nothing: the turn passes and the next one starts its count over.
    await expect.poll(async () => (await boardState(board)).turnNumber).toBe(turnNumber + 1);
    await expect(board).toHaveAttribute("data-rolls", "0");
  }
});
