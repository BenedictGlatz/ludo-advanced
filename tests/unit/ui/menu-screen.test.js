/**
 * What the main menu says. Design handoff 12, artboard 12c, decisions D75 to D80.
 *
 * `menu-screen.js` is pure and imports no jQuery, so it is testable under `environment: "node"` for the
 * same reason `pool-screen.js` is. What it can be asked is exactly the part of the menu that is not a
 * look: how many doors there are, which of them work, and whether each one carries its second line.
 *
 * **The hint assertions are the load-bearing ones.** D77 draws the two dead doors with the DOM's own
 * `disabled` attribute rather than with `aria-disabled` and a click filter, and the reason that is
 * acceptable is D78: why a door cannot be opened is permanent text inside it, so nothing is lost by a
 * keyboard never reaching it. An empty hint would take a keyboard user's only explanation away and no
 * other test in the project would notice, because `locales.test.js` checks that a key is not empty and
 * cannot check that the screen asks for it.
 *
 * That the doors are actually on screen and that Hotseat opens the count screen is `tests/e2e/menu.spec.js`.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { changeLanguage, initI18n } from "../../../src/i18n/index.js";
import { menuScreen } from "../../../src/ui/menu-screen.js";
import { OVERLAY_SCREEN } from "../../../src/ui/overlay-vocabulary.js";

describe("the main menu", () => {
  beforeAll(async () => {
    await initI18n("de");
  });

  it("is the menu screen and names the game", () => {
    const description = menuScreen();

    expect(description.screen).toBe(OVERLAY_SCREEN.MENU);
    expect(description.title).toBe("Ludo Advanced");
    expect(description.player).toBeNull();
  });

  /**
   * DOM order is tab order, and Hotseat being first is what makes `focusOverlay` correct without a
   * change: it moves the keyboard onto the overlay's first `.overlay__button`, and Hotseat is the only
   * one of the three that can take it (D76.4). A reordering here would silently focus a dead door.
   */
  it("offers three doors, with Hotseat first", () => {
    expect(menuScreen().buttons.map((button) => button.action)).toEqual([
      "hotseat",
      "online",
      "settings",
    ]);
  });

  it("gives Hotseat the one primary fill and leaves it usable", () => {
    const [hotseat] = menuScreen().buttons;

    expect(hotseat.variant).toBe("primary");
    expect(hotseat.disabled).toBeUndefined();
  });

  /**
   * Online Multiplayer is FR-42 with no technology chosen and Settings is S11, which was deleted. Three
   * doors dealt as equals would say the game has three modes, which is false, and it would say it on the
   * screen where a player has the least ability to tell.
   */
  it("marks the two doors that do not work as disabled, and gives them no fill", () => {
    for (const button of menuScreen().buttons.slice(1)) {
      expect(button.disabled, button.action).toBe(true);
      expect(button.variant, button.action).toBeUndefined();
    }
  });

  /**
   * On all three, and not only on the two that are dead. On Hotseat the line says what the mode is, so
   * the second line never means "something is wrong" and a door does not change size between its two
   * states. See the file header for why an empty one would be a real regression.
   */
  it("carries a non-empty second line on every door", () => {
    for (const button of menuScreen().buttons) {
      expect(button.hint, button.action).toBeTypeOf("string");
      expect(button.hint, button.action).not.toBe("");
    }
  });

  it("gives every door its own label and its own drawing", () => {
    const buttons = menuScreen().buttons;

    for (const button of buttons) {
      expect(button.label, button.action).not.toBe("");
      expect(button.art, `no drawing for ${button.action}`).toMatch(/^<svg /);
    }

    // Three distinct labels, so a copy-paste in the locale files cannot leave two doors with one name.
    expect(new Set(buttons.map((button) => button.label)).size).toBe(3);
  });

  /**
   * Nothing here caches a translated string: every field is read from `t()` on the call, which is what
   * makes FR-34's criterion true by construction rather than by a list of things to refresh. The hint is
   * the field worth checking, because it is the one this screen gained.
   */
  it("switches language with the rest of the screen (FR-34)", async () => {
    const german = menuScreen();

    await changeLanguage("en");
    const english = menuScreen();

    expect(english.text).not.toBe(german.text);
    expect(english.buttons[1].hint).not.toBe(german.buttons[1].hint);
    expect(english.buttons[2].hint).not.toBe(german.buttons[2].hint);

    await changeLanguage("de");
  });
});
