/**
 * Pull the 36 card illustrations out of the Claude Design artboard. Issue #39, epic step 1.
 *
 * ```bash
 * npm run assets:card-art
 * ```
 *
 * ## Why a script and not a one-time copy and paste
 *
 * `src/ui/card-view.js` rendered `.card__art` as an empty framed window for two sprints, and its
 * header said why: the drawings live as inline SVG inside
 * `01-Design/Handoff/Card artwork design planning/Card Art.dc.html`, and getting them out is its own
 * piece of work. This is that piece of work.
 *
 * Doing it by hand once would produce the same files. It would also mean that the next time Claude
 * Design touches the artboard, somebody has to find 36 drawings in a 126 KB file again and hope they
 * catch all of them. A script re-runs in a second and **fails loudly** instead of quietly importing 34
 * of 36, which is the failure mode that matters: a missing card would look exactly like the empty
 * window we are replacing.
 *
 * It is deliberately **not** a build step. The artboard is a design source, not a runtime input, and a
 * build that parsed HTML out of `01-Design/` would make every `npm run build` depend on a file the
 * production bundle has no business reading.
 *
 * ## How a drawing is matched to a card
 *
 * By its **title**, not by its position in the file. The artboard draws each card as a panel with the
 * art window first and the card name below it, so the name that follows a drawing is that drawing's
 * card. Titles are matched against `src/i18n/locales/en/cards.json`, which is the same list
 * `core/cards/catalogue.js` is checked against by `tests/unit/core/cards/catalogue.test.js`.
 *
 * Position would have worked today: the artboard happens to run in exactly catalogue order. It would
 * also break silently the first time a card is reordered on the canvas, and produce a Yeet illustration
 * on a Tax Fraud card, which no test would catch because both are valid SVG.
 *
 * ## What is changed on the way out
 *
 * Two things, and nothing else:
 *
 * 1. **The inline `style` on the root `<svg>` is dropped.** The artboard sets `display`, `width` and
 *    `height` there, and `src/ui/styles/card.css` sets the same three on `.card__art > svg`. An inline
 *    style wins over a stylesheet, so leaving it in would put three sizing decisions beyond Claude
 *    Design's reach, which is exactly what `CLAUDE.md` separates. The `viewBox` stays, because that is
 *    the drawing's own coordinate system and not a presentation choice.
 * 2. **`aria-hidden="true"` and `focusable="false"` are added.** The artwork is decoration: the card
 *    already carries its name as text in `.card__title`. Without this a screen reader reads out the
 *    path soup and the card's actual name gets lost in it (NFR-08).
 */

import { readFileSync, mkdirSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { SKILL_CARDS } from "../src/core/cards/catalogue.js";
import { POOL_COMPOSITION } from "../src/core/dice-pool.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

const ARTBOARD = join(
  ROOT,
  "01-Design",
  "Handoff",
  "Card artwork design planning",
  "Card Art.dc.html"
);
const LOCALE = join(ROOT, "src", "i18n", "locales", "en", "cards.json");
const OUT_DIR = join(ROOT, "src", "ui", "art");

/**
 * The art windows are 232 wide. Everything else on the artboard that happens to be an `<svg>` is not
 * a card illustration: there are two 120 by 120 decorations in the header rows.
 *
 * Matching on the width rather than on the full `viewBox` is deliberate. Two of the 36 are 232 by 96
 * because their drawing needed less height, and a script that hard-coded `0 0 232 128` would drop
 * exactly those two and report 34 of 36 as a mapping failure rather than as what it is.
 */
const ART_VIEWBOX = /<svg viewBox="0 0 232 \d+"/g;

/**
 * Fold a title down to something two spellings of the same name agree on.
 *
 * The artboard and the locale file are both hand-written, months apart, and they disagree on
 * punctuation in three places: a straight against a curly apostrophe in "It's Not That Deep", the `%`
 * in "Speedrun Any%", and the umlauts in "Nuehue". Stripping accents and everything that is not a
 * letter or a digit makes all three agree without a table of special cases.
 */
function foldTitle(title) {
  return title
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Read one complete `<svg>…</svg>` starting at `from`, counting nesting.
 *
 * A drawing may hold a nested `<svg>`, so stopping at the first `</svg>` is not safe. Counting is four
 * lines and removes the question.
 */
function readSvg(html, from) {
  let depth = 0;
  let cursor = from;

  while (cursor < html.length) {
    const open = html.indexOf("<svg", cursor);
    const close = html.indexOf("</svg>", cursor);

    if (close === -1) break;

    if (open !== -1 && open < close) {
      depth += 1;
      cursor = open + 4;
      continue;
    }

    depth -= 1;
    cursor = close + 6;
    if (depth === 0) return html.slice(from, cursor);
  }

  throw new Error(`unterminated <svg> at offset ${from}`);
}

/**
 * The first piece of text after a drawing, which the artboard's panel layout makes its card name.
 *
 * The window is 400 characters, which is comfortably past the closing tag and the wrapper divs and
 * comfortably short of the next card's banner labels.
 */
function titleAfter(html, end) {
  const window = html.slice(end, end + 400).replace(/\s+/g, " ");
  const match = /<[^<>]*>([^<>]{2,40})</.exec(window);

  if (match === null) throw new Error(`no title found after a drawing at offset ${end}`);
  return match[1].trim();
}

/** Strip the artboard's inline sizing and mark the drawing as decoration. See the header. */
function cleanSvg(svg) {
  const opening = /^<svg([^>]*)>/.exec(svg);
  const attributes = opening[1].replace(/\s*style="[^"]*"/, "");

  return `<svg${attributes} aria-hidden="true" focusable="false">${svg.slice(opening[0].length)}`;
}

/** Every drawing on the artboard, as `{ title, svg }`, in the order it appears. */
function readArtboard(html) {
  const found = [];

  for (const match of html.matchAll(ART_VIEWBOX)) {
    const svg = readSvg(html, match.index);
    found.push({ title: titleAfter(html, match.index + svg.length), svg: cleanSvg(svg) });
  }

  return found;
}

/**
 * Folded title to output file name, for every card that exists.
 *
 * Skill cards are keyed by their catalogue id so the file name and the `data-card-id` attribute are
 * the same string. Dice cards have no id, so they are `d6.svg` after the `D6` the artboard draws.
 */
function buildTargets() {
  const titles = JSON.parse(readFileSync(LOCALE, "utf8")).card.skill;
  const targets = new Map();

  for (const card of SKILL_CARDS) {
    const title = titles[card.id]?.title;
    if (title === undefined) throw new Error(`card ${card.id} has no English title in the locale`);
    targets.set(foldTitle(title), card.id);
  }

  for (const { faces } of POOL_COMPOSITION) {
    targets.set(foldTitle(`D${faces}`), `d${faces}`);
  }

  return targets;
}

/**
 * Empty the output directory before writing.
 *
 * A card removed from the artboard has to disappear from `src/ui/art/` too, and a re-run that only
 * adds files would leave it behind for `art/index.js` to keep importing.
 */
function resetOutDir() {
  mkdirSync(OUT_DIR, { recursive: true });

  for (const entry of readdirSync(OUT_DIR)) {
    if (entry.endsWith(".svg")) rmSync(join(OUT_DIR, entry));
  }
}

function main() {
  const drawings = readArtboard(readFileSync(ARTBOARD, "utf8"));
  const targets = buildTargets();

  // Resolve and check everything before a single file is touched, so a failure leaves the previous
  // extraction intact rather than half-replaced.
  const unmatched = [];
  const plan = new Map();

  for (const { title, svg } of drawings) {
    const name = targets.get(foldTitle(title));

    if (name === undefined) {
      unmatched.push(title);
      continue;
    }
    if (plan.has(name)) {
      throw new Error(`two drawings both map to ${name}, one of them "${title}"`);
    }

    plan.set(name, svg);
  }

  const missing = [...targets.values()].filter((name) => !plan.has(name));

  // Both of these are hard failures rather than warnings. A half-import looks exactly like the empty
  // art window this script exists to replace, so it must not be possible to get one by accident.
  if (unmatched.length > 0) {
    throw new Error(`${unmatched.length} drawing(s) match no card: ${unmatched.join(", ")}`);
  }
  if (missing.length > 0) {
    throw new Error(`${missing.length} card(s) have no drawing: ${missing.join(", ")}`);
  }

  resetOutDir();

  for (const [name, svg] of plan) {
    writeFileSync(join(OUT_DIR, `${name}.svg`), `${svg}\n`, "utf8");
  }

  console.log(`${plan.size} drawings written to src/ui/art/`);
  console.log(`  ${SKILL_CARDS.length} skill cards, ${POOL_COMPOSITION.length} dice cards`);
}

main();
