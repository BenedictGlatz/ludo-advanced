/**
 * i18next setup and the two locales. Issue #64, requirements FR-34 and NFR-03.
 *
 * ## Why this is done before the first view and not after it
 *
 * NFR-03 forbids a hardcoded user-facing string anywhere in `src/`. Adding localisation after the
 * views exist means going back through every one of them; adding it first means there is never a
 * literal to find. It is also why `core/` and `state/` already speak in keys: `move.refused.overshoot`
 * is produced by the rules and translated here, so the layer that knows the rule never knows the
 * language.
 *
 * ## What lives where
 *
 * The **keys** are produced by `core/movement.js` (`REFUSAL`) and `state/intents.js` (`REJECTED`).
 * The **text** is in `locales/de.json` and `locales/en.json`. A unit test checks that the two files
 * have identical key sets and that every key the code can emit has an entry in both, which is
 * NFR-03's acceptance criterion turned into a failing test.
 *
 * ## German is the default and English is the fallback
 *
 * The team, the module and the report are German, so German is the language the game is read in
 * during development and at the presentation. English is the fallback so that a key missing from
 * `de.json` shows English text rather than the raw key. That is a safety net and not a plan: the
 * test requires both files to be complete.
 */

import i18next from "i18next";

import de from "./locales/de.json";
import en from "./locales/en.json";

/** The language the game starts in. */
export const DEFAULT_LOCALE = "de";

/** The language a missing key falls back to. */
export const FALLBACK_LOCALE = "en";

/** Every locale the game ships, by code. FR-34 switches between exactly these. */
export const LOCALES = Object.freeze({ de, en });

/**
 * Boot i18next. Called once, by the composition root in `main.js`, and by nothing else.
 *
 * `escapeValue: false` because every string reaches the page through jQuery's `.text()`, which sets
 * text content and never interprets markup. Escaping on top of that would show `&amp;` to the player
 * instead of `&`.
 */
export async function initI18n(locale = DEFAULT_LOCALE) {
  await i18next.init({
    lng: locale,
    fallbackLng: FALLBACK_LOCALE,
    supportedLngs: Object.keys(LOCALES),
    resources: Object.fromEntries(
      Object.entries(LOCALES).map(([code, translation]) => [code, { translation }])
    ),
    interpolation: { escapeValue: false },
  });

  return i18next;
}

/** Translate one key. `options` carries interpolation values, for example `{ number: 2 }`. */
export function t(key, options) {
  return i18next.t(key, options);
}

/** Switch language at runtime, which is the whole of FR-34's acceptance criterion. */
export function changeLanguage(locale) {
  if (!Object.hasOwn(LOCALES, locale)) {
    throw new RangeError(`unknown locale "${locale}", expected one of ${Object.keys(LOCALES)}`);
  }

  return i18next.changeLanguage(locale);
}

/** The language currently in use. */
export function currentLanguage() {
  return i18next.language;
}
