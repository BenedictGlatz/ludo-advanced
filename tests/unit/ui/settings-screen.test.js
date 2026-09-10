/**
 * What the settings screen says. Screen S11, reopened by issue #77.
 *
 * `settings-screen.js` is pure and imports no jQuery, so it is testable under `environment: "node"`
 * for the same reason `menu-screen.js` is. What it can be asked is the part of the screen that is not
 * a look: that there is one position per shipped language, that exactly the current one is pressed,
 * and that every position is named in its own language, which is the one thing a player who cannot
 * read the current language needs.
 *
 * That the door opens the screen and that a click there actually changes the page is
 * `tests/e2e/menu.spec.js`.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { LOCALES, changeLanguage, initI18n } from "../../../src/i18n/index.js";
import { OVERLAY_SCREEN } from "../../../src/ui/overlay-vocabulary.js";
import { settingsScreen } from "../../../src/ui/settings-screen.js";

const languages = (description) =>
  description.buttons.filter((button) => button.action === "language");

describe("the settings screen", () => {
  beforeAll(async () => {
    await initI18n("de");
  });

  it("is the settings screen, titled, with a sentence and no seat", () => {
    const description = settingsScreen();

    expect(description.screen).toBe(OVERLAY_SCREEN.SETTINGS);
    expect(description.title).toBe("Einstellungen");
    expect(description.text).not.toBe("");
    expect(description.player).toBeNull();
  });

  it("offers one position per shipped language, then Back", () => {
    const description = settingsScreen();

    expect(languages(description).map((button) => button.value)).toEqual(Object.keys(LOCALES));
    expect(description.buttons.at(-1).action).toBe("back");
  });

  /**
   * `pressed` becomes `aria-pressed`, which is the one attribute both the stylesheet and a screen
   * reader read. Exactly one position is pressed, and it is the language the page is in right now.
   */
  it("presses exactly the current language, and follows a switch", async () => {
    const pressed = () =>
      languages(settingsScreen())
        .filter((button) => button.pressed)
        .map((button) => button.value);

    expect(pressed()).toEqual(["de"]);

    await changeLanguage("en");
    expect(pressed()).toEqual(["en"]);

    await changeLanguage("de");
  });

  /**
   * "Deutsch" and "English" in both languages, never "German" or "Englisch": a player who has landed in
   * a language they cannot read has to be able to find their own. Same reason the chrome button names
   * the target language rather than the current one.
   */
  it("names every language in its own tongue, whatever the page is in", async () => {
    const names = () => languages(settingsScreen()).map((button) => button.label);

    expect(names()).toEqual(["Deutsch", "English"]);

    await changeLanguage("en");
    expect(names()).toEqual(["Deutsch", "English"]);

    await changeLanguage("de");
  });
});
