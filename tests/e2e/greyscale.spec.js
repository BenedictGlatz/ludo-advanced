/**
 * NFR-12, measured. "A greyscale screenshot still identifies whose pawns are whose."
 *
 * ## What this file asserts, and what it used to
 *
 * NFR-12 asks for a second, non-colour identifier per player. Design handoff 01 first answered it with a
 * per-seat pawn silhouette and then, on request, removed it: D2 told players apart by colour alone. From
 * 2026-08-30 to 2026-09-02 the first test in this file therefore measured the greyscale contrast of the
 * four seat colours against a 1.30 floor, measured 1.146 at the worst pair, and carried `test.fail()` so
 * the suite reported a known failure instead of going green over an unmet requirement.
 *
 * Design handoff 06 (D48 to D50) put a shape per seat on the piece: `.pawn__mark`, an ink shape clipped
 * to `--seat-shape-0` to `--seat-shape-3`, a circle, a triangle, a square and a diamond. The requirement
 * is now met another way, so the first test asserts the acceptance criterion as it is written: every pawn
 * carries a mark, the mark has a shape, the shape is the same within a seat and different across seats,
 * and none of that changes under a greyscale filter.
 *
 * The 1.30 luminance case is retired, as D50 decided. The 1.146 figure and the derivation of the 1.30
 * threshold live in `00-Meta/Documentation/notes/01-requirements-and-goals.md` next to NFR-12 and in
 * `notes/08-quality.md`, where the next person who proposes moving a seat colour will find them. What is
 * kept is the second case below, the floor of four different greys: two seats reducing to the same grey is
 * the regression worth catching, and it passes today.
 */

import { expect, test } from "@playwright/test";

import { SEEDS, openMatch } from "./helpers.js";

const SEAT_TOKENS = ["--color-p0", "--color-p1", "--color-p2", "--color-p3"];
const SEATS = [0, 1, 2, 3];

/** Read the four seat colours off `:root` and reduce each to its relative luminance. */
async function seatLuminance(page) {
  return page.evaluate((tokens) => {
    const channel = (value) => {
      const c = value / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };

    const style = window.getComputedStyle(document.documentElement);

    return tokens.map((token) => {
      const hex = style.getPropertyValue(token).trim().replace("#", "");
      const red = Number.parseInt(hex.slice(0, 2), 16);
      const green = Number.parseInt(hex.slice(2, 4), 16);
      const blue = Number.parseInt(hex.slice(4, 6), 16);

      return {
        token,
        luminance: 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue),
      };
    });
  }, SEAT_TOKENS);
}

/** Every pair of seats, with the contrast ratio their greys would have. */
function pairs(seats) {
  const result = [];

  for (let a = 0; a < seats.length; a += 1) {
    for (let b = a + 1; b < seats.length; b += 1) {
      const high = Math.max(seats[a].luminance, seats[b].luminance);
      const low = Math.min(seats[a].luminance, seats[b].luminance);

      result.push({
        pair: `${seats[a].token} vs ${seats[b].token}`,
        ratio: (high + 0.05) / (low + 0.05),
      });
    }
  }

  return result;
}

/**
 * For every pawn on the board: its seat, the rendered box of its mark and the computed `clip-path`.
 *
 * `getComputedStyle` resolves the `var()` chain, so what comes back is the literal shape and not the
 * token name. That is what lets the test compare shapes across seats without knowing the four values,
 * which stay the design's to change.
 */
async function pawnMarks(board) {
  return board.locator(".pawn").evaluateAll((pawns) =>
    pawns.map((pawn) => {
      const mark = pawn.querySelector(".pawn__mark");
      const box = mark.getBoundingClientRect();

      return {
        seat: Number(pawn.getAttribute("data-player")),
        width: box.width,
        height: box.height,
        clipPath: window.getComputedStyle(mark).clipPath,
      };
    })
  );
}

/** The asserting half of NFR-12, run once in colour and once under the greyscale filter. */
function expectSeatsIdentifiable(marks) {
  expect(marks).toHaveLength(16);

  for (const mark of marks) {
    expect(mark.width, `seat ${mark.seat} mark width`).toBeGreaterThan(0);
    expect(mark.height, `seat ${mark.seat} mark height`).toBeGreaterThan(0);
    expect(mark.clipPath, `seat ${mark.seat} has a shape`).not.toBe("none");
  }

  const shapeOf = SEATS.map((seat) => {
    const shapes = new Set(marks.filter((mark) => mark.seat === seat).map((mark) => mark.clipPath));
    expect(shapes.size, `seat ${seat} uses one shape for all four pawns`).toBe(1);
    return [...shapes][0];
  });

  expect(new Set(shapeOf).size, "the four seats have four different shapes").toBe(4);
}

test.describe("NFR-12: the board in greyscale", () => {
  test("gives every seat its own shape on the piece, in colour and in greyscale", async ({
    page,
  }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    expectSeatsIdentifiable(await pawnMarks(board));

    // The filter changes what a pixel looks like and not what a box measures, so the same assertions hold
    // and the run under the filter is the acceptance criterion's own wording: a greyscale screenshot.
    await page.addStyleTag({ content: "html { filter: grayscale(1); }" });
    expectSeatsIdentifiable(await pawnMarks(board));
  });

  test("does at least give the four seats four different greys", async ({ page }) => {
    await openMatch(page, SEEDS.leavesStartAtOnce);
    const seats = await seatLuminance(page);

    // The floor below which the board would be unreadable rather than merely hard: two seats that
    // reduce to the same grey are not telling anybody anything. This one passes. D50 keeps it as the
    // palette's floor after the 1.30 case was retired.
    for (const { pair, ratio } of pairs(seats)) {
      expect(ratio, pair).toBeGreaterThan(1.0);
    }
  });

  test("uses the same seat colours in both skins, so one greyscale run covers both", async ({
    page,
  }) => {
    await openMatch(page, SEEDS.leavesStartAtOnce);
    const light = await seatLuminance(page);

    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
    const dark = await seatLuminance(page);

    // D13: the four seat colours are single values rather than `light-dark()` pairs, because they
    // are saturated enough to sit on cream and on plum unaltered. That is what makes the measurement
    // above a statement about the game and not about one theme.
    expect(dark).toEqual(light);
  });

  test("produces the greyscale screenshot the review round reads", async ({ page }, testInfo) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    await page.addStyleTag({ content: "html { filter: grayscale(1); }" });
    await testInfo.attach("board-in-greyscale", {
      body: await board.screenshot(),
      contentType: "image/png",
    });

    // The picture is evidence for handoffs 02 and 06, not an assertion. What can be asserted about it is
    // that there was a board to photograph.
    await expect(board.locator(".pawn")).toHaveCount(16);
  });
});
