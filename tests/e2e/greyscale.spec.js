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
 * Design handoff 06 (D48 to D50) then put a shape per seat on the piece: `.pawn__mark`, an ink shape
 * clipped to one of four `--seat-shape-*` tokens. Two tests here asserted it, one on the sixteen pieces
 * and one on the HUD plates.
 *
 * **Design handoff 16 (D97) withdrew the shapes again on 2026-09-05, and both tests were deleted with
 * them.** Every seat mark in the game is now a dot in the seat's colour, and the piece's mark is gone
 * outright rather than converted, because a shape sitting under two eyes reads as a mouth. The
 * assertions were not rewritten to check the dots: a dot is a dot on all four seats, and asserting that
 * four identical shapes are identical is not a test.
 *
 * **So NFR-12 is unmet again, and this file is where that is visible.** The cost is written out in
 * `16-spec-seat-dots-and-message-strip.md` § 4: reduced to greyscale, red and blue are 1.15:1 apart and
 * green and red 1.26:1, so a red pawn and a blue pawn on the shared track are the same grey. What still
 * works is words wherever a seat is named, and position on the board's own furniture, since each seat
 * owns a fixed start area, home column, entry square and turn-off bar. D99 books the follow-up that
 * would fix it without bringing a shape back: re-tune the four seat colours so they differ in lightness
 * as well as in hue. That is a Product Owner decision, not a stylesheet one.
 *
 * The 1.30 luminance case stays retired, as D50 decided. The 1.146 figure and the derivation of the 1.30
 * threshold live in `00-Meta/Documentation/notes/01-requirements-and-goals.md` next to NFR-12 and in
 * `notes/08-quality.md`, where the next person who proposes moving a seat colour will find them. What is
 * kept below is the floor of four different greys: two seats reducing to the same grey is the regression
 * worth catching, and it passes today.
 */

import { expect, test } from "@playwright/test";

import { SEEDS, openMatch } from "./helpers.js";

const SEAT_TOKENS = ["--color-p0", "--color-p1", "--color-p2", "--color-p3"];

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

test.describe("NFR-12: the board in greyscale", () => {
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
