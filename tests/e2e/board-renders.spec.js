/**
 * The board is on screen and it is the board the rulebook describes. Requirements FR-02, FR-08.
 *
 * This is the test that would have caught the 2026-08-30 topology change on its own: it counts 40
 * track fields and four four-square houses, which is what section 2 of the game design document says
 * and what `board.css` draws. A board built to one number and styled to the other fails here.
 */

import { expect, test } from "@playwright/test";

import { SEEDS, openMatch } from "./helpers.js";

test.describe("the board renders out of state", () => {
  test("draws 40 track fields, four yards, four houses and 16 pawns for four players", async ({
    page,
  }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    await expect(board.locator(".square--track")).toHaveCount(40);
    await expect(board.locator(".start-area")).toHaveCount(4);
    await expect(board.locator(".home-column")).toHaveCount(4);
    await expect(board.locator(".home-column .square--home-column")).toHaveCount(16);
    await expect(board.locator(".start-area .slot")).toHaveCount(16);
    await expect(board.locator(".pawn")).toHaveCount(16);
  });

  test("marks the four entry fields and the four turn-off fields where the rules put them", async ({
    page,
  }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    for (const [seat, entry, turnOff] of [
      [0, 0, 39],
      [1, 10, 9],
      [2, 20, 19],
      [3, 30, 29],
    ]) {
      await expect(board.locator(`.square[data-square="${entry}"]`)).toHaveAttribute(
        "data-entry-of",
        String(seat)
      );
      await expect(board.locator(`.square[data-square="${turnOff}"]`)).toHaveAttribute(
        "data-turnoff-of",
        String(seat)
      );
    }
  });

  test("marks the eight skill fields, symmetrically and never on an entry field (FR-22)", async ({
    page,
  }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    // Nothing is visible here yet: decision D27 of design handoff 03 is open, because skill fields are
    // meant to be purple and purple already marks a legal target field. So this checks the attribute
    // and the layout, which is the part that is a rule rather than a look.
    await expect(board.locator("[data-skill-square]")).toHaveCount(8);

    for (const square of [4, 7, 14, 17, 24, 27, 34, 37]) {
      await expect(board.locator(`.square[data-square="${square}"]`)).toHaveAttribute(
        "data-skill-square",
        "true"
      );
    }

    for (const entry of [0, 10, 20, 30]) {
      await expect(board.locator(`.square[data-square="${entry}"]`)).not.toHaveAttribute(
        "data-skill-square",
        "true"
      );
    }
  });

  test("gives every pawn an empty mark element for the seat shape (NFR-12)", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    // The element is the DOM half of D16. Whether it is visible is design handoff 06 and is asserted
    // in greyscale.spec.js once the stylesheet lands; this only checks the contract the brief promises:
    // one mark per pawn, no text in it.
    await expect(board.locator(".pawn > .pawn__mark")).toHaveCount(16);
    await expect(board.locator(".pawn__mark").first()).toHaveText("");
  });

  test("starts every pawn in its own yard", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    await expect(board.locator('.pawn[data-r="0"]')).toHaveCount(16);
  });

  test("keeps all four yards and houses in a two-player match, and seats the players opposite", async ({
    page,
  }) => {
    const board = await openMatch(page, SEEDS.advancesEarly);

    // The geometry does not depend on the player count: the empty seats are drained by board.css
    // rather than removed by the view, so every selector keeps working across 2, 3 and 4 players.
    await expect(board.locator(".start-area")).toHaveCount(4);
    await expect(board.locator(".home-column")).toHaveCount(4);

    // Eight pawns, on seats 0 and 2. Seat 1 and seat 3 are empty.
    await expect(board.locator(".pawn")).toHaveCount(8);
    await expect(board.locator('.pawn[data-player="0"]')).toHaveCount(4);
    await expect(board.locator('.pawn[data-player="2"]')).toHaveCount(4);
    await expect(board.locator('.pawn[data-player="1"]')).toHaveCount(0);
    await expect(board.locator('.pawn[data-player="3"]')).toHaveCount(0);
  });

  test("puts every pawn where the grid says, not next to it", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    // A pawn is positioned by two custom properties rather than by being put inside a square (D10),
    // so "is it in the right place" has to be measured rather than read off the DOM tree. Each
    // waiting pawn must sit inside its own slot.
    const misplaced = await board.evaluate((element) => {
      const wrong = [];

      for (const pawn of element.querySelectorAll(".pawn")) {
        const seat = pawn.getAttribute("data-player");
        const index = pawn.getAttribute("data-pawn");
        const slot = element.querySelector(
          `.start-area[data-player="${seat}"] .slot[data-slot="${index}"]`
        );

        const pawnBox = pawn.getBoundingClientRect();
        const slotBox = slot.getBoundingClientRect();
        const dx = Math.abs(
          (pawnBox.left + pawnBox.right) / 2 - (slotBox.left + slotBox.right) / 2
        );
        const dy = Math.abs(
          (pawnBox.top + pawnBox.bottom) / 2 - (slotBox.top + slotBox.bottom) / 2
        );

        if (dx > 2 || dy > 2)
          wrong.push(`${seat}.${index} off by ${dx.toFixed(1)}, ${dy.toFixed(1)}`);
      }

      return wrong;
    });

    expect(misplaced).toEqual([]);
  });
});
