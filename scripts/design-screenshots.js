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

/**
 * Play turns until at least `wanted` squares carry the legal-move highlight at the same time.
 *
 * **The policy here is not the one the end-to-end suite uses, and it cannot be.** The tests always
 * activate the lowest-numbered pawn, which walks one pawn all the way round before starting the
 * next. That is what makes a match hand-checkable, and it is also why it almost never lights more
 * than one square: with a single die every pawn has at most one move, so the number of highlighted
 * squares is the number of *distinct* targets, and pawns still in the yard all target the same entry
 * field.
 *
 * So this plays the **least advanced** movable pawn instead, which spreads the four pawns out across
 * the track and produces the situation the design spec asked to see. It is still fully determined by
 * the seed, so the picture is reproducible.
 *
 * It stops **before** committing the move that produces the situation, because the situation is what
 * is being photographed.
 */
async function playUntilManyTargets(page, wanted, maxTurns = 200) {
  const board = page.locator(".board");

  for (let turn = 0; turn < maxTurns; turn += 1) {
    const lit = await board.locator('.square[data-legal-target="true"]').count();
    if (lit >= wanted) return lit;

    if ((await board.getAttribute("data-status")) !== "running") break;

    if ((await board.getAttribute("data-phase")) === "act") {
      const leastAdvanced = await board
        .locator('.pawn[data-movable="true"]')
        .evaluateAll((pawns) =>
          pawns
            .map((pawn) => Number(pawn.getAttribute("data-r")))
            .reduce((lowest, r) => Math.min(lowest, r), Number.POSITIVE_INFINITY)
        );

      const pawn = board.locator(`.pawn[data-movable="true"][data-r="${leastAdvanced}"]`).first();
      const before = await board.getAttribute("data-turn");

      await pawn.click();
      await pawn.waitFor({ state: "attached" });
      await page.waitForFunction(
        () => document.querySelector('.pawn[data-selected="true"]') !== null,
        undefined,
        { timeout: 10_000 }
      );
      await pawn.click();

      // The turn number, or the match ending. A winning move never reaches `endTurn`, so on that
      // one turn the counter does not move and waiting only on it would hang.
      await page.waitForFunction(
        (previous) => {
          const element = document.querySelector(".board");
          return (
            element.getAttribute("data-status") !== "running" ||
            element.getAttribute("data-turn") !== previous
          );
        },
        before,
        { timeout: 10_000 }
      );
    } else {
      await page.waitForTimeout(30);
    }
  }

  throw new Error(`never saw ${wanted} legal targets lit at once`);
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

  // Section 5 of the design spec names this as the first question of the review round: the
  // legal-target highlight has never been seen with several squares lit at once on a real board.
  // The mockup showed it and the mockup chose its own six. This plays until the game produces the
  // situation by itself.
  await page.goto(`${BASE_URL}/?seed=7&players=4&fast=1`);
  await page.locator(".board").waitFor();
  await playUntilManyTargets(page, 3);
  await page.waitForTimeout(SETTLE_MS);
  await page.screenshot({ path: join(OUT_DIR, "board-many-legal-targets.png"), fullPage: true });

  await browser.close();
  console.log(`wrote ${SHOTS.length + 3} screenshots to ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
