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
 * The **text** is in `locales/<code>/ui.json` and `locales/<code>/cards.json`. A unit test checks
 * that the two languages have identical key sets and that every key the code can emit has an entry
 * in both, which is NFR-03's acceptance criterion turned into a failing test.
 *
 * ## Why the text is in two files per language and not one
 *
 * The card set is 29 skill cards plus the dice denominations, and every one of them carries a title
 * and a rules sentence in both languages. In one file that is roughly four times as much card text
 * as interface text, and the interface strings become unfindable between them. Worse, the card text
 * is the part that changes during playtesting: a wording tweak to one card would sit in the same
 * diff as the whole interface, which makes a review pointless.
 *
 * The split is by **who owns the string**, not by size. `ui.json` is text the interface writes;
 * `cards.json` is text the card set writes. Rejected alternative: i18next namespaces
 * (`t("cards:card.type.action")`). They are the idiomatic i18next answer, but every existing call
 * site says `t("move.refused.overshoot")` with no prefix, so namespaces would mean touching every
 * call in `core/`, `state/` and `ui/` for no gain the merge does not already give. Merging the two
 * objects into one `translation` namespace keeps every current call valid.
 *
 * ## German is the default and English is the fallback
 *
 * The team, the module and the report are German, so German is the language the game is read in
 * during development and at the presentation. English is the fallback so that a key missing from
 * `de.json` shows English text rather than the raw key. That is a safety net and not a plan: the
 * test requires both files to be complete.
 */

import i18next from "i18next";

import deCards from "./locales/de/cards.json";
import deUi from "./locales/de/ui.json";
import enCards from "./locales/en/cards.json";
import enUi from "./locales/en/ui.json";

/** The language the game starts in. */
export const DEFAULT_LOCALE = "de";

/** The language a missing key falls back to. */
export const FALLBACK_LOCALE = "en";

/**
 * Merge the per-language files into the one object i18next gets.
 *
 * The merge is shallow on purpose, because the files are meant to own disjoint top-level keys:
 * `ui.json` owns `app`, `turn` and friends, `cards.json` owns `card`. A shallow spread would
 * **silently** drop one side of a collision, and a missing translation shows up as a raw key on
 * screen weeks later, so the collision is refused here instead of tolerated.
 */
export function mergeNamespaces(code, files) {
  const merged = {};

  for (const [fileName, file] of Object.entries(files)) {
    for (const [key, value] of Object.entries(file)) {
      if (Object.hasOwn(merged, key)) {
        throw new Error(
          `locale "${code}": top-level key "${key}" is defined in more than one file, ` +
            `last seen in ${fileName}. Give it to exactly one file.`
        );
      }

      merged[key] = value;
    }
  }

  return merged;
}

/** Every locale the game ships, by code. FR-34 switches between exactly these. */
export const LOCALES = Object.freeze({
  de: mergeNamespaces("de", { "de/ui.json": deUi, "de/cards.json": deCards }),
  en: mergeNamespaces("en", { "en/ui.json": enUi, "en/cards.json": enCards }),
});

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

/**
 * The language a switch would go to (FR-34).
 *
 * A toggle rather than a list, because the game ships exactly two locales. It lives here and not in the
 * view because "which languages are there" is this module's fact: `LOCALES` is the list, so a third
 * language makes this function wrong in the same file that gained it, rather than silently in `ui/`.
 */
export function nextLanguage(from = currentLanguage()) {
  const codes = Object.keys(LOCALES);
  return codes[(codes.indexOf(from) + 1) % codes.length];
}
