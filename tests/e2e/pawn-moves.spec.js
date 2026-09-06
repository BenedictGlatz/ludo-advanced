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

test.describe("a pawn moves by pointing at its target (issue #91)", () => {
  /** The centre of an element's box, for the mouse. */
  async function centre(locator) {
    const box = await locator.boundingBox();
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }

  test("a click on the pawn and a click on the lit square make the move", async ({ page }) => {
    const board = await openMatch(page, SEEDS.advancesEarly);
    await reachAnAdvance(board);

    const { roll, activePlayer } = await boardState(board);
    const pawn = firstMovablePawn(board);
    const index = await pawn.getAttribute("data-pawn");
    const before = Number(await pawn.getAttribute("data-r"));

    await pawn.click();
    await board.locator('.square[data-legal-target="true"]').click();

    await expect
      .poll(async () => (await pawnPositions(board))[`${activePlayer}.${index}`])
      .toBe(before + roll);
  });

  /** The two-step safety survives: a first click on a square picks, it does not move. */
  test("a click on a lit square with nothing selected picks the pawn that reaches it", async ({
    page,
  }) => {
    const board = await openMatch(page, SEEDS.advancesEarly);
    await reachAnAdvance(board);

    const before = await pawnPositions(board);
    await board.locator('.square[data-legal-target="true"]').first().click();

    await expect(board.locator('.pawn[data-selected="true"]')).toHaveCount(1);
    await expect(board.locator('.square[data-legal-target="true"]')).toHaveCount(1);
    expect(await pawnPositions(board)).toEqual(before);
  });

  test("dragging the pawn onto its lit square makes the move", async ({ page }) => {
    const board = await openMatch(page, SEEDS.advancesEarly);
    await reachAnAdvance(board);

    const { roll, activePlayer } = await boardState(board);
    const pawn = firstMovablePawn(board);
    const index = await pawn.getAttribute("data-pawn");
    const before = Number(await pawn.getAttribute("data-r"));

    const from = await centre(pawn);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    // Past the drag threshold: the pawn is picked up and its one target lights.
    await page.mouse.move(from.x + 12, from.y + 12, { steps: 3 });
    await expect(pawn).toHaveAttribute("data-dragging", "true");
    await expect(pawn).toHaveAttribute("data-selected", "true");
    await expect(board.locator('.square[data-legal-target="true"]')).toHaveCount(1);

    const to = await centre(board.locator('.square[data-legal-target="true"]'));
    await page.mouse.move(to.x, to.y, { steps: 8 });
    await page.mouse.up();

    await expect
      .poll(async () => (await pawnPositions(board))[`${activePlayer}.${index}`])
      .toBe(before + roll);
    await expect(board.locator('.pawn[data-dragging="true"]')).toHaveCount(0);
  });

  test("dropping the pawn anywhere else puts it back and moves nothing", async ({ page }) => {
    const board = await openMatch(page, SEEDS.advancesEarly);
    await reachAnAdvance(board);

    const { turnNumber } = await boardState(board);
    const pawn = firstMovablePawn(board);
    const before = await pawnPositions(board);

    const from = await centre(pawn);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(from.x + 40, from.y - 40, { steps: 5 });
    await expect(pawn).toHaveAttribute("data-dragging", "true");
    await page.mouse.up();

    await expect(board.locator('.pawn[data-dragging="true"]')).toHaveCount(0);
    expect(await pawnPositions(board)).toEqual(before);
    expect((await boardState(board)).turnNumber).toBe(turnNumber);
    // The pawn stays picked, so the player can still finish with a click.
    await expect(pawn).toHaveAttribute("data-selected", "true");
  });

  test("rings the field under the carried pawn, and only that one (D103)", async ({ page }) => {
    const board = await openMatch(page, SEEDS.advancesEarly);
    await reachAnAdvance(board);

    const pawn = firstMovablePawn(board);
    const from = await centre(pawn);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(from.x + 12, from.y + 12, { steps: 3 });
    await expect(pawn).toHaveAttribute("data-dragging", "true");

    // Nothing is marked while the pointer is between fields: a carried piece is not asking "where may
    // I go", the lit targets already answer that, it is asking "will it land here".
    const target = board.locator('.square[data-legal-target="true"]');
    const to = await centre(target);
    await page.mouse.move(to.x, to.y, { steps: 8 });

    await expect(target).toHaveAttribute("data-drop", "true");
    await expect(board.locator('[data-drop="true"]')).toHaveCount(1);

    await page.mouse.up();

    // The mark belongs to the gesture, so it goes with it.
    await expect(board.locator('[data-drop="true"]')).toHaveCount(0);
  });

  test("a lit square can be reached and activated from the keyboard (NFR-08)", async ({ page }) => {
    const board = await openMatch(page, SEEDS.advancesEarly);
    await reachAnAdvance(board);

    const { roll, activePlayer } = await boardState(board);
    const pawn = firstMovablePawn(board);
    const index = await pawn.getAttribute("data-pawn");
    const before = Number(await pawn.getAttribute("data-r"));

    await pawn.click();
    const target = board.locator('.square[data-legal-target="true"]');
    await expect(target).toHaveAttribute("tabindex", "0");
    await target.focus();
    await page.keyboard.press("Enter");

    await expect
      .poll(async () => (await pawnPositions(board))[`${activePlayer}.${index}`])
      .toBe(before + roll);
  });
});
