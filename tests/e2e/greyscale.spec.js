/**
 * NFR-12, measured. "A greyscale screenshot still identifies whose pawns are whose."
 *
 * ## Why this file exists in the shape it does
 *
 * NFR-12 asks for a second, non-colour identifier per player. Design handoff 01 first answered it
 * with a per-seat pawn silhouette and then, on request, removed it: D2 tells players apart by colour
 * alone. What is left is the acceptance criterion above, and the spec is explicit that it might not
 * be met, that the margin is thin, and that this test is the thing that settles it.
 *
 * It does not settle it in the design's favour. The first test below **is expected to fail** and is
 * marked as such, so the suite reports it as a known failure rather than going green over a
 * requirement that is not met. If somebody widens the palette, Playwright reports an unexpected pass,
 * which is exactly the signal wanted.
 *
 * ## Where the 1.30 threshold comes from, since a made-up number would prove nothing
 *
 * Four colours have six pairs, and what matters is the **worst** pair. The best a four-value palette
 * can do is to spread the four evenly, in contrast-ratio terms, across whatever luminance range it
 * spans. These four span from blue at 0.2543 to yellow at 0.6336 relative luminance, a ratio of
 * `(0.6336 + 0.05) / (0.2543 + 0.05) = 2.246`. Spread evenly that is three equal steps, so each step
 * is the cube root, **1.31**.
 *
 * So 1.30 is not a target picked to be reachable or to be strict. It is very nearly the best these
 * four hues can achieve without changing which colours they are, which is what makes falling short of
 * it a fact about the palette rather than about the threshold.
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
  test("separates all four seats by at least 1.30 in greyscale", async ({ page }) => {
    // Measured on 2026-08-30: the worst pair is red against blue at **1.146**, which is greys 147
    // and 137 out of 255, ten levels apart. Red against green is second worst at 1.263. The other
    // four pairs are fine. D2 of the design spec names the two ways out, in order of cost: darken
    // blue and lighten green a step, or reinstate a non-colour identifier. Both are Product Owner
    // decisions, which is why row 8 of the sign-off table records a question and not a rule.
    test.fail(
      true,
      "D2 answers NFR-12 by colour alone; the red and blue greys are 10 levels apart"
    );

    await openMatch(page, SEEDS.leavesStartAtOnce);
    const worst = pairs(await seatLuminance(page)).sort((a, b) => a.ratio - b.ratio)[0];

    expect(worst.ratio, `worst pair: ${worst.pair}`).toBeGreaterThanOrEqual(1.3);
  });

  test("does at least give the four seats four different greys", async ({ page }) => {
    await openMatch(page, SEEDS.leavesStartAtOnce);
    const seats = await seatLuminance(page);

    // The floor below which the board would be unreadable rather than merely hard: two seats that
    // reduce to the same grey are not telling anybody anything. This one passes.
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

    // The picture is evidence for handoff 02, not an assertion. What can be asserted about it is
    // that there was a board to photograph.
    await expect(board.locator(".pawn")).toHaveCount(16);
  });
});
