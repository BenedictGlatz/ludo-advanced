/**
 * Every card has a drawing, and the drawings keep their two contracts. Issue #39.
 *
 * `src/ui/art/index.js` reads its files with `import.meta.glob`, which means a missing drawing is a
 * runtime `undefined` rather than a build error. This file is what turns that back into a failure: it
 * walks the **real** catalogue and the **real** pool composition, so a card added to the game without a
 * drawing added to the artboard fails here rather than rendering the empty framed window that issue #39
 * existed to remove.
 */

import { describe, expect, it } from "vitest";

import { SKILL_CARDS } from "../../../src/core/cards/catalogue.js";
import { POOL_COMPOSITION } from "../../../src/core/dice-pool.js";
import { diceArt, skillArt } from "../../../src/ui/art/index.js";

/** Every drawing in the game, as `[label, svg]`, so one loop can check all 36. */
function allDrawings() {
  return [
    ...SKILL_CARDS.map((card) => [card.id, skillArt(card.id)]),
    ...POOL_COMPOSITION.map((entry) => [`D${entry.faces}`, diceArt(entry.faces)]),
  ];
}

describe("card artwork", () => {
  it("has a drawing for every one of the 29 skill cards", () => {
    for (const card of SKILL_CARDS) {
      expect(skillArt(card.id), `no drawing for ${card.id}`).toMatch(/^<svg /);
    }
  });

  it("has a drawing for every dice denomination in the pool", () => {
    for (const { faces } of POOL_COMPOSITION) {
      expect(diceArt(faces), `no drawing for D${faces}`).toMatch(/^<svg /);
    }
  });

  it("covers all 36 cards and no more", () => {
    expect(allDrawings()).toHaveLength(36);
  });

  it("returns null for a card that does not exist, rather than throwing", () => {
    // A card with no drawing has to fall back to the empty window. A hand that threw would take the
    // whole turn down over a missing decoration.
    expect(skillArt("action-does-not-exist")).toBeNull();
    expect(diceArt(7)).toBeNull();
  });

  it("marks every drawing as decoration", () => {
    // The card already carries its name in `.card__title`. Without this a screen reader reads out the
    // path data instead (NFR-08).
    for (const [label, svg] of allDrawings()) {
      expect(svg, `${label} is not aria-hidden`).toContain('aria-hidden="true"');
      expect(svg, `${label} is focusable`).toContain('focusable="false"');
    }
  });

  it("leaves sizing to the stylesheet, with no inline style on the root element", () => {
    // The artboard sets display, width and height inline, and `card.css` sets the same three on
    // `.card__art > svg`. An inline style wins, which would put three sizing decisions out of Claude
    // Design's reach. `scripts/extract-card-art.js` strips it; this is the check that it did.
    for (const [label, svg] of allDrawings()) {
      const root = /^<svg[^>]*>/.exec(svg)[0];
      expect(root, `${label} still carries an inline style`).not.toContain("style=");
    }
  });

  it("keeps the viewBox, which is the drawing's own coordinate system", () => {
    for (const [label, svg] of allDrawings()) {
      expect(svg, `${label} has no viewBox`).toMatch(/^<svg viewBox="0 0 232 \d+"/);
    }
  });
});
