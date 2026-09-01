/**
 * What the dice card pool overview says. Issue #30.
 *
 * `pool-screen.js` is one of the few files in `ui/` worth a unit test: it is pure, it returns a
 * description rather than touching the DOM, and what it claims about the pool has to stay true when the
 * composition changes. `vitest.config.js` runs with `environment: "node"` and this file needs no DOM,
 * only i18next, which `initI18n` boots from the JSON files without a browser.
 *
 * The rest of the screen, that it opens, pauses the match and closes again, is covered by
 * `tests/e2e/dice-pool.spec.js`, the same way the rest of `ui/` is.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { POOL_COMPOSITION, POOL_SIZE } from "../../../src/core/dice-pool.js";
import { changeLanguage, initI18n } from "../../../src/i18n/index.js";
import { OVERLAY_ACTION, OVERLAY_SCREEN } from "../../../src/ui/overlay-vocabulary.js";
import { poolScreen } from "../../../src/ui/pool-screen.js";
import { screenDescription } from "../../../src/ui/overlay-screens.js";

/** The count the overview shows for almost the whole of a turn: three cards are out on the hand. */
const MID_TURN = { remaining: 17, total: POOL_SIZE };

describe("the pool overview", () => {
  beforeAll(async () => {
    await initI18n("de");
  });

  it("shows one card per denomination, in composition order", () => {
    const { cards } = poolScreen(MID_TURN);

    expect(cards).toHaveLength(POOL_COMPOSITION.length);
    expect(cards.map((card) => card.faces)).toEqual(POOL_COMPOSITION.map((entry) => entry.faces));
  });

  /**
   * The requirement behind this test is FR-17: the composition is one data definition that the rules
   * read. A screen with seven cards typed into it would be a second definition, and it would go stale
   * silently the first time the pool was reweighted.
   */
  it("follows the composition table rather than a list of its own", () => {
    const { cards } = poolScreen(MID_TURN);

    for (const [index, entry] of POOL_COMPOSITION.entries()) {
      expect(cards[index].id).toBe(`dice-d${entry.faces}`);
      expect(cards[index].tags.at(-1)).toContain(String(entry.copies));
    }
  });

  it("carries the two tags a dice card always has, plus the copy count", () => {
    const six = poolScreen(MID_TURN).cards.find((card) => card.faces === 6);

    expect(six.tags).toHaveLength(3);
    expect(six.tags[0]).toContain("6"); // range
    expect(six.tags[2]).toContain("4"); // four copies of a D6 in the pool
    expect(six.art).toContain("<svg");
  });

  it("names no card playable or selected, because the overview offers no choice", () => {
    for (const card of poolScreen(MID_TURN).cards) {
      expect(card.playable).toBeUndefined();
      expect(card.selected).toBeUndefined();
      expect(card.result).toBeUndefined();
    }
  });

  it("says how many cards are face down, in both numbers", () => {
    const { text } = poolScreen(MID_TURN);

    expect(text).toContain("17");
    expect(text).toContain("20");
  });

  it("offers exactly one way out, and it is the action that resumes the match", () => {
    const { buttons } = poolScreen(MID_TURN);

    expect(buttons).toHaveLength(1);
    expect(buttons[0].action).toBe(OVERLAY_ACTION.RESUME);
    expect(buttons[0].label).not.toBe("");
  });

  it("translates every string it returns", async () => {
    const german = poolScreen(MID_TURN);

    await changeLanguage("en");
    const english = poolScreen(MID_TURN);
    await changeLanguage("de");

    expect(english.title).not.toBe(german.title);
    expect(english.text).not.toBe(german.text);
    expect(english.buttons[0].label).not.toBe(german.buttons[0].label);
    expect(english.cards[0].title).not.toBe(german.cards[0].title); // W2 against D2
  });
});

describe("the overview as the overlay's sixth screen", () => {
  beforeAll(async () => {
    await initI18n("de");
  });

  it("is reached through screenDescription like every other screen", () => {
    const description = screenDescription(OVERLAY_SCREEN.POOL, { pool: MID_TURN });

    expect(description.screen).toBe(OVERLAY_SCREEN.POOL);
    expect(description.cards).toHaveLength(POOL_COMPOSITION.length);
  });

  /**
   * The pool goes away with the match, so a POOL screen with no pool behind it must not render. Without
   * this the overview could outlive the match it describes and show an abandoned pool's count.
   */
  it("falls back to nothing when there is no match, rather than to a screen with no cards", () => {
    const description = screenDescription(OVERLAY_SCREEN.POOL, { pool: null });

    expect(description.screen).toBe(OVERLAY_SCREEN.NONE);
    expect(description.cards).toEqual([]);
  });

  it("leaves the other five screens without cards", () => {
    for (const screen of [
      OVERLAY_SCREEN.MENU,
      OVERLAY_SCREEN.SETUP,
      OVERLAY_SCREEN.PAUSE,
      OVERLAY_SCREEN.NONE,
    ]) {
      expect(screenDescription(screen, {}).cards ?? []).toEqual([]);
    }
  });
});
