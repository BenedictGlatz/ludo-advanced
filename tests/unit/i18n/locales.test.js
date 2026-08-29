/**
 * NFR-03's acceptance criterion as a test: "the two locale files have identical key sets, and no
 * literal user-facing string exists in `src/`."
 *
 * The first half is checkable here and is. The second half is a grep over `src/ui/`, which does not
 * exist yet, so it is not checked anywhere and is recorded as outstanding in Chapter 08.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { REFUSAL } from "../../../src/core/movement.js";
import { REJECTED } from "../../../src/state/intents.js";
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  LOCALES,
  changeLanguage,
  currentLanguage,
  initI18n,
  t,
} from "../../../src/i18n/index.js";

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

describe("every key the code can emit has text in both languages", () => {
  const german = new Set(flatKeys(LOCALES.de));
  const english = new Set(flatKeys(LOCALES.en));

  it("covers every movement refusal reason (FR-14, FR-32, NFR-08)", () => {
    for (const key of Object.values(REFUSAL)) {
      expect(german.has(key), `de is missing ${key}`).toBe(true);
      expect(english.has(key), `en is missing ${key}`).toBe(true);
    }
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

  it("refuses a locale it does not ship", async () => {
    expect(() => changeLanguage("fr")).toThrow(RangeError);
  });

  it("returns the key itself for a key that does not exist, rather than empty text", () => {
    // Useful to know while building views: a missing key is visible on screen, not invisible.
    expect(t("nothing.here")).toBe("nothing.here");
  });
});
