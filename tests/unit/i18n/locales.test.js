/**
 * NFR-03's acceptance criterion as a test: "the two locale files have identical key sets, and no
 * literal user-facing string exists in `src/`."
 *
 * The first half is checkable here and is. The second half is a grep over `src/ui/`, which no test
 * performs, so it is recorded as outstanding in Chapter 08.
 *
 * Since the locale text was split into `ui.json` and `cards.json` per language, this file also
 * guards the merge: the two files must own disjoint top-level keys, because merging them is shallow.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { cardIds } from "../../../src/core/cards/catalogue.js";
import { CATEGORY, KIND } from "../../../src/core/cards/vocabulary.js";
import { REFUSAL } from "../../../src/core/movement.js";
import { ROLL_STEP } from "../../../src/core/roll.js";
import { REJECTED } from "../../../src/state/intents.js";
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  LOCALES,
  changeLanguage,
  currentLanguage,
  initI18n,
  mergeNamespaces,
  t,
} from "../../../src/i18n/index.js";
import deCards from "../../../src/i18n/locales/de/cards.json";
import deUi from "../../../src/i18n/locales/de/ui.json";
import enCards from "../../../src/i18n/locales/en/cards.json";
import enUi from "../../../src/i18n/locales/en/ui.json";

/** Every leaf key of a nested locale object, as the dotted keys i18next resolves. */
function flatKeys(object, prefix = "") {
  return Object.entries(object).flatMap(([key, value]) => {
    const path = prefix === "" ? key : `${prefix}.${key}`;
    return typeof value === "object" && value !== null ? flatKeys(value, path) : [path];
  });
}

/** The `{{name}}` placeholders in a string, sorted, so two locales can be compared. */
function placeholders(text) {
  return [...text.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort();
}

function leafAt(object, key) {
  return key.split(".").reduce((node, part) => node[part], object);
}

describe("the two locale files (NFR-03)", () => {
  const german = flatKeys(LOCALES.de).sort();
  const english = flatKeys(LOCALES.en).sort();

  it("have identical key sets", () => {
    expect(german).toEqual(english);
  });

  it("have no empty translation anywhere", () => {
    for (const [code, locale] of Object.entries(LOCALES)) {
      for (const key of flatKeys(locale)) {
        expect(leafAt(locale, key), `${code}:${key}`).not.toBe("");
      }
    }
  });

  it("use the same interpolation placeholders in both languages", () => {
    // A German string saying {{number}} and an English one saying {{player}} would resolve to an
    // empty gap in one of the two, and nothing else would catch it.
    for (const key of german) {
      expect(placeholders(leafAt(LOCALES.de, key)), key).toEqual(
        placeholders(leafAt(LOCALES.en, key))
      );
    }
  });
});

describe("the split into ui.json and cards.json", () => {
  // The merge is shallow, so a top-level key in both files would drop one of them without a word.
  // These two tests are the reason the merge refuses a collision instead of spreading over it.
  it("gives every top-level key to exactly one file, in both languages", () => {
    for (const [ui, cards, code] of [
      [deUi, deCards, "de"],
      [enUi, enCards, "en"],
    ]) {
      const shared = Object.keys(ui).filter((key) => Object.hasOwn(cards, key));

      expect(shared, `${code}: keys in both files`).toEqual([]);
    }
  });

  it("refuses a collision rather than dropping one side", () => {
    expect(() =>
      mergeNamespaces("de", { "a.json": { card: { x: "1" } }, "b.json": { card: { y: "2" } } })
    ).toThrow(/top-level key "card" is defined in more than one file/);
  });

  it("puts both files into the merged locale", () => {
    // Reading through LOCALES rather than through t(), so this fails on a broken merge even when
    // i18next has not been booted yet.
    expect(LOCALES.de.turn.end).toBe("Zug beenden");
    expect(LOCALES.de.card.type.action).toBe("Aktion");
  });
});

describe("every key the code can emit has text in both languages", () => {
  const german = new Set(flatKeys(LOCALES.de));
  const english = new Set(flatKeys(LOCALES.en));

  it("covers every movement refusal reason (FR-14, FR-32, NFR-08)", () => {
    for (const key of Object.values(REFUSAL)) {
      expect(german.has(key), `de is missing ${key}`).toBe(true);
      expect(english.has(key), `en is missing ${key}`).toBe(true);
    }
  });

  /**
   * **This case exists because the key-set comparison above could not see the gap it closes.**
   * `roll.step.missed` was absent from **both** files for two sprints, so the two key sets were
   * identical and agreed with each other about a step that had no sentence anywhere. Nothing failed,
   * because a missing key makes i18next print the key itself and the breakdown was not on screen yet.
   *
   * Comparing the locales against `ROLL_STEP` instead of against each other is what makes the next one
   * a red test. Same shape and same argument as the refusal case above it.
   */
  it("covers every one of the nine roll steps (NFR-08, D73)", () => {
    for (const step of Object.values(ROLL_STEP)) {
      expect(german.has(`roll.step.${step}`), `de is missing roll.step.${step}`).toBe(true);
      expect(english.has(`roll.step.${step}`), `en is missing roll.step.${step}`).toBe(true);
    }
  });

  it("names every one of the 29 skill cards, in both languages (FR-28, NFR-03)", () => {
    // This is the test that stops a card existing with no name. A card whose title key is missing
    // renders as the raw id on the table, which is the worst possible place to find out.
    for (const id of cardIds()) {
      expect(german.has(`card.skill.${id}.title`), `de is missing a title for ${id}`).toBe(true);
      expect(english.has(`card.skill.${id}.title`), `en is missing a title for ${id}`).toBe(true);
    }
  });

  /**
   * A name alone does not make a card playable. Until issue #38 gave every card a rule, the locales held
   * titles and nothing else, and a player looking at "Janky RPG" had no way to find out what it did.
   *
   * The text describes the rule that was **implemented**, which is not always the artwork's wording:
   * three cards deviate and each deviation is recorded in Chapter 05. It is provisional copy and the
   * Product Owner owns the final wording.
   */
  it("gives every one of the 29 skill cards a rules sentence, in both languages", () => {
    for (const id of cardIds()) {
      expect(german.has(`card.skill.${id}.text`), `de is missing the text for ${id}`).toBe(true);
      expect(english.has(`card.skill.${id}.text`), `en is missing the text for ${id}`).toBe(true);
    }
  });

  /**
   * The sub-kind the artwork prints under the banner. `vocabulary.js` transcribed all nineteen from the
   * artboards including the odd ones, and a kind with no label would render as a raw slug like `d4` on
   * the card.
   */
  it("names every sub-kind the catalogue can hold", () => {
    for (const kind of Object.values(KIND)) {
      expect(german.has(`card.kind.${kind}`), `de: ${kind}`).toBe(true);
      expect(english.has(`card.kind.${kind}`), `en: ${kind}`).toBe(true);
    }
  });

  it("names every card category the catalogue can hold", () => {
    for (const category of Object.values(CATEGORY)) {
      expect(german.has(`card.category.${category}`), `de: ${category}`).toBe(true);
      expect(english.has(`card.category.${category}`), `en: ${category}`).toBe(true);
    }
  });

  it("has a title for exactly the 29 cards and no orphan left behind", () => {
    // The other direction: a card removed from the catalogue but left in the locales would be text
    // nothing can reach, and it would sit there until somebody counted.
    const titled = [...german]
      .filter((key) => key.startsWith("card.skill.") && key.endsWith(".title"))
      .map((key) => key.slice("card.skill.".length, -".title".length));

    expect(titled.sort()).toEqual([...cardIds()].sort());
  });

  it("covers every intent rejection reason", () => {
    for (const key of Object.values(REJECTED)) {
      expect(german.has(key), `de is missing ${key}`).toBe(true);
      expect(english.has(key), `en is missing ${key}`).toBe(true);
    }
  });
});

describe("i18next once it is booted", () => {
  beforeAll(async () => {
    await initI18n();
  });

  it("starts in German, with English as the fallback", () => {
    expect(DEFAULT_LOCALE).toBe("de");
    expect(FALLBACK_LOCALE).toBe("en");
    expect(currentLanguage()).toBe("de");
    expect(t("turn.end")).toBe("Zug beenden");
  });

  it("resolves every refusal key to a real sentence, which is what the screen shows", () => {
    // Asserted as "not the key, and it ends in a full stop" rather than by quoting the wording, so
    // that rewriting a message does not break a test that is about the wiring.
    for (const key of Object.values(REFUSAL)) {
      const text = t(key);

      expect(text, key).not.toBe(key);
      expect(text, key).toMatch(/\.$/);
    }
  });

  it("fills interpolation values", () => {
    expect(t("player.name", { number: 2 })).toBe("Spieler 2");
  });

  it("switches language at runtime and leaves no string behind (FR-34)", async () => {
    await changeLanguage("en");

    expect(currentLanguage()).toBe("en");
    expect(t("turn.end")).toBe("End turn");
    expect(t("player.name", { number: 2 })).toBe("Player 2");

    await changeLanguage("de");
    expect(t("turn.end")).toBe("Zug beenden");
  });

  it("names a dice card the way each language names dice", async () => {
    // W for Würfel, D for die. This one string is the clearest case for card text being localised
    // rather than being a number the view can format itself.
    expect(t("card.dice.name", { faces: 8 })).toBe("W8");

    await changeLanguage("en");
    expect(t("card.dice.name", { faces: 8 })).toBe("D8");

    await changeLanguage("de");
  });

  it("refuses a locale it does not ship", async () => {
    expect(() => changeLanguage("fr")).toThrow(RangeError);
  });

  it("returns the key itself for a key that does not exist, rather than empty text", () => {
    // Useful to know while building views: a missing key is visible on screen, not invisible.
    expect(t("nothing.here")).toBe("nothing.here");
  });
});
