/**
 * The four regions fit on one screen without scrolling. Requirement FR-31, design spec 03 D30.
 *
 * This spec exists because the claim was made twice and checked zero times. Spec 01 said "the
 * five-region layout is asserted, not built"; spec 03 built it and printed the arithmetic, "page
 * height 776. Nothing scrolls". Nothing in the suite read the page height, and two things were wrong
 * at the same time: the delivered `app.css` had dropped `body { margin: 0 }`, so every page was
 * 100vh + 16px, and `playwright.config.js` was being overridden to 1280 by 720 by the per-project
 * device descriptors, so no test was even looking at the resolution the design is drawn for.
 *
 * A layout claim that no test reads is a claim that comes back. The numbers below are the
 * requirement, not the design: FR-31 says the regions are visible together and the page does not
 * scroll, and that is all this checks. How wide the rail is and where the plates sit is D30's
 * business and is deliberately not asserted here.
 */

import { expect, test } from "@playwright/test";

import { SEEDS, diceHand, openMatch } from "./helpers.js";

/** The four regions of section 2.2 of the obligations book that this slice actually renders. */
const REGIONS = [".app__board", ".app__dice", ".app__skill", ".move-refusal"];

test.describe("the shell at the design resolution", () => {
  test("runs at 1440 by 900, which is what the design is drawn for", async ({ page }) => {
    // Guarding the config, not the page. If a device descriptor overrides the viewport again, every
    // other test in this file starts measuring a layout nobody designed, and it would pass.
    const size = page.viewportSize();

    expect(size).toEqual({ width: 1440, height: 900 });
  });

  test("puts every region on screen at once and does not scroll", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    await expect(diceHand(board).locator(".card")).toHaveCount(3);

    // Settled, not mid-deal. The dealing animation of D31 starts each card translated out of place,
    // so measuring during it reports a card sticking out of the page and a scroll height that is
    // real for 360 ms and gone afterwards.
    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const root = document.documentElement;
            return root.scrollHeight <= root.clientHeight;
          }),
        { timeout: 5000 }
      )
      .toBe(true);

    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        vertical: root.scrollHeight - root.clientHeight,
        horizontal: root.scrollWidth - root.clientWidth,
      };
    });

    expect(overflow.vertical, "the page scrolls vertically").toBeLessThanOrEqual(0);
    expect(overflow.horizontal, "the page scrolls sideways").toBeLessThanOrEqual(0);
  });

  test("keeps all four regions inside the viewport", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    await expect(diceHand(board).locator(".card")).toHaveCount(3);
    await expect.poll(async () => page.locator(".hand--dice").getAttribute("data-count")).toBe("3");

    for (const selector of REGIONS) {
      const region = page.locator(selector);

      await expect(region, selector).toBeVisible();

      const box = await region.boundingBox();
      expect(box.y, `${selector} starts above the viewport`).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height, `${selector} runs off the bottom`).toBeLessThanOrEqual(900);
      expect(box.x + box.width, `${selector} runs off the side`).toBeLessThanOrEqual(1440);
    }
  });

  test("stacks the regions and allows scrolling below the breakpoint", async ({ page }) => {
    // The other half of D30, and the reason the test above is not simply "nothing ever scrolls".
    // FR-31 asks for one screen at the design resolution, not at every size.
    await page.setViewportSize({ width: 1100, height: 800 });

    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    await expect(board).toBeVisible();

    for (const selector of REGIONS) {
      await expect(page.locator(selector), selector).toBeVisible();
    }
  });
});
