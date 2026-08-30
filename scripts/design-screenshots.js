/**
 * Take the screenshots a design handoff brief needs, from the real production build.
 *
 * Run it by hand, not from a test:
 *
 * ```bash
 * npm run build
 * npm run preview          # in another terminal, leave it running
 * node scripts/design-screenshots.js
 * ```
 *
 * The images land in `01-Design/assets/` and are committed, because the handoff brief in
 * `01-Design/Handoff/` refers to them and a brief whose pictures are missing is not a brief.
 *
 * **Why this is a script and not a Playwright spec.** A screenshot is evidence, not an assertion. A
 * spec that writes files into the repository makes `npm run test:e2e` change the working tree, which
 * is a surprise nobody wants from a test run. `greyscale.spec.js` does attach its own screenshot to
 * the Playwright report, which is the right place for evidence a test produced.
 *
 * The seed is fixed for the same reason the tests fix it (NFR-09): the pictures in two handoff briefs
 * should differ because the design changed, not because the dice did.
 */

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const BASE_URL = process.env.LUDO_PREVIEW_URL ?? "http://localhost:4173";
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "01-Design", "assets");

/** The board is a single fluid object (D6), so the viewport is what decides how big it comes out. */
const VIEWPORT = { width: 1440, height: 900 };

/** Long enough for the entry animation to settle. The board itself does not animate on load. */
const SETTLE_MS = 400;

const SHOTS = [
  { name: "board-4-players", query: "?seed=4&players=4&fast=1" },
  { name: "board-3-players", query: "?seed=4&players=3&fast=1" },
  { name: "board-2-players", query: "?seed=4&players=2&fast=1" },
];

async function open(page, query) {
  await page.goto(`${BASE_URL}/${query}`);
  await page.locator(".board").waitFor();
  await page.waitForTimeout(SETTLE_MS);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });

  for (const shot of SHOTS) {
    await open(page, shot.query);
    await page.screenshot({ path: join(OUT_DIR, `${shot.name}.png`), fullPage: true });
  }

  // Night In, the dark skin of D13. It follows the operating system unless `data-theme` says
  // otherwise, so the attribute is what makes this reproducible on any machine.
  await open(page, SHOTS[0].query);
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  await page.waitForTimeout(SETTLE_MS);
  await page.screenshot({ path: join(OUT_DIR, "board-night-in.png"), fullPage: true });

  // The NFR-12 picture. `greyscale.spec.js` measures the same thing in numbers; this is the version
  // a person can look at, and the two belong together in the review round.
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
  await page.addStyleTag({ content: "html { filter: grayscale(1); }" });
  await page.waitForTimeout(SETTLE_MS);
  await page.screenshot({ path: join(OUT_DIR, "board-greyscale.png"), fullPage: true });

  await browser.close();
  console.log(`wrote ${SHOTS.length + 2} screenshots to ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
