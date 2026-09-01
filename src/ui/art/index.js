/**
 * The 36 card illustrations, as inline SVG strings. Issue #39.
 *
 * The `.svg` files next to this one are **generated** and not hand-edited. They come out of the Claude
 * Design artboard by way of `scripts/extract-card-art.js`:
 *
 * ```bash
 * npm run assets:card-art
 * ```
 *
 * ## Why the files are read with a glob and not 36 import lines
 *
 * `import.meta.glob` is Vite's own, so it costs no dependency, and it means this file does not have to
 * be edited when the artboard gains or loses a card. Thirty-six import lines would be a second list of
 * the card set, kept in step with `core/cards/catalogue.js` by hand, and this project already has one
 * of those going stale in the locale files.
 *
 * The cost of a glob is that a missing drawing is a runtime `undefined` rather than a build error. That
 * is what `tests/unit/ui/card-art.test.js` is for: it walks the real catalogue and the real pool
 * composition and asserts that every one of the 36 resolves. A missing card fails the test suite
 * instead of quietly rendering the empty window this whole exercise removed.
 *
 * ## Why strings and not `<img>` or a sprite sheet
 *
 * Design brief 03 § 2 fixed it: *"The card art is inline SVG and stays that way … no external image
 * assets, because the build ships one bundle."* Inline also keeps `card.css`'s `.card__art > svg` rule
 * meaningful, since the stylesheet can reach into the drawing.
 *
 * A single sprite sheet with `<symbol>` and `<use>` was the alternative and it was rejected on the
 * 300-line limit: one sheet holding 36 drawings is a few thousand lines in one file, where 36 separate
 * files are at most 50 lines each.
 */

/**
 * Every generated drawing, keyed by its path, eagerly inlined at build time.
 *
 * `eager` matters: a card is dealt and re-rendered many times a turn, and an async import would make
 * the art window appear a frame late every time.
 */
const DRAWINGS = import.meta.glob("./*.svg", { query: "?raw", import: "default", eager: true });

/** Look a drawing up by file stem, or `null` when there is none. */
function drawing(stem) {
  return DRAWINGS[`./${stem}.svg`] ?? null;
}

/**
 * The illustration for a skill card, by the same id that goes into `data-card-id`.
 *
 * Returning `null` rather than throwing is deliberate: a card with no drawing should render as the
 * framed empty window it rendered as before this existed, not take the whole hand down with it. The
 * unit test is what makes sure `null` never actually happens in a shipped build.
 */
export function skillArt(cardId) {
  return drawing(cardId);
}

/** The illustration for a dice card, by its number of faces (2, 4, 6, 8, 10, 12, 20). */
export function diceArt(faces) {
  return drawing(`d${faces}`);
}
