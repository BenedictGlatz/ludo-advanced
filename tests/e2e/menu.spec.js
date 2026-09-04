/**
 * The main menu's three doors. Screen S1, design handoff 12, artboard 12c, decisions D75 to D80.
 *
 * **A file of its own rather than more cases in `match-flow.spec.js`**, which was already at 238 of the
 * 300-line limit. The seam is the same one that split the handover off it: that file asserts the flow
 * from menu to match to win and back, and these cases assert the shape of one screen, in particular the
 * two doors that go nowhere and are therefore in none of its transitions.
 *
 * ## What is actually at risk here
 *
 * Two of the three doors are `disabled` in the DOM. That is D77.2's decision, and it is what saves a
 * click filter in `session-actions.js` and saves a keyboard user two stops where `Enter` would do
 * nothing. It also means **nothing in `src/` handles `online` or `settings` at all**, so if the attribute
 * ever came off, a click would fall through the whole action table in silence and a player would find
 * two dead buttons rather than two doors that explain themselves. There is no unit test that can see
 * that, because it is a fact about the rendered element.
 *
 * The hints are the other half of the same decision: they are why not being able to focus a dead door
 * costs a keyboard user nothing, so an empty one would quietly break the reasoning D77 rests on.
 *
 * These specs open the page **without** `?players=`, which is what puts the menu in front of the match.
 */

import { expect, test } from "@playwright/test";

import de from "../../src/i18n/locales/de/ui.json" with { type: "json" };

const overlay = (page) => page.locator(".overlay");
const door = (page, name) => page.locator(`.overlay__button[data-action="${name}"]`);

/** Open on the main menu, with a fixed seed so nothing about this screen depends on the dice. */
async function openMenu(page) {
  await page.goto("/?seed=1&fast=1");
  await expect(overlay(page)).toHaveAttribute("data-screen", "menu");

  return overlay(page);
}

test.describe("the main menu", () => {
  test("deals three doors, Hotseat first (D76)", async ({ page }) => {
    const panel = await openMenu(page);

    await expect(panel.locator(".overlay__button")).toHaveCount(3);

    for (const name of ["hotseat", "online", "settings"]) {
      await expect(door(page, name)).toBeVisible();
    }

    // DOM order is tab order and reading order, and Hotseat being first is what makes `focusOverlay`
    // land on the only door that can take the keyboard.
    await expect(panel.locator(".overlay__button").first()).toHaveAttribute(
      "data-action",
      "hotseat"
    );
  });

  test("shows a door you cannot open as disabled, and starts nothing when it is clicked", async ({
    page,
  }) => {
    await openMenu(page);

    for (const name of ["online", "settings"]) {
      await expect(door(page, name)).toBeDisabled();

      // `force`, because Playwright refuses to click a disabled control on its own and the point of
      // the case is what happens when a player tries anyway. A browser fires no click on a disabled
      // button, so the screen has to be unmoved afterwards.
      await door(page, name).click({ force: true });
      await expect(overlay(page)).toHaveAttribute("data-screen", "menu");
    }

    await expect(page.locator(".board .pawn")).toHaveCount(0);
  });

  /**
   * Exactly one, which is the trade D77.3 makes: a stop where `Enter` does nothing tells a keyboard
   * user nothing, and spec 05 § 5 already took seven such stops out of the pool overview. The cost is
   * that the other two doors are read rather than tabbed to, which is why the next case exists.
   */
  test("gives the sheet exactly one tab stop (D77.3)", async ({ page }) => {
    const panel = await openMenu(page);

    await expect(panel.locator(".overlay__button:not([disabled])")).toHaveCount(1);
    await expect(panel.locator(".overlay__button:not([disabled])")).toHaveAttribute(
      "data-action",
      "hotseat"
    );
  });

  /**
   * On all three doors, and non-empty on all three. This is the assertion D77.2 depends on: the reason a
   * door cannot be opened is permanent text in the DOM rather than something a focus reveals, which is
   * the whole argument for `disabled` over `aria-disabled` with a click filter.
   */
  test("says on every door what it is, in text and not in a content property (D78)", async ({
    page,
  }) => {
    await openMenu(page);

    for (const name of ["hotseat", "online", "settings"]) {
      await expect(door(page, name).locator(".overlay__label")).toHaveText(de.menu[name].label);
      await expect(door(page, name).locator(".overlay__hint")).toHaveText(de.menu[name].hint);
    }
  });

  /**
   * The boundary § D76.1 draws, and the one a later change is most likely to cross. A door borrows the
   * card's face, its ink edge, its hard shadow and its radius, and it is deliberately **not** a `.card`:
   * the moment it carried `data-card-family` it would inherit the hover reveal of D66, the desaturation
   * of an unplayable card and the back of `.card--back`, and each would then need a menu exception.
   */
  test("borrows the card's chrome without becoming a card (D76.1)", async ({ page }) => {
    const panel = await openMenu(page);

    await expect(panel.locator("[data-card-family]")).toHaveCount(0);
    await expect(panel.locator(".card")).toHaveCount(0);

    // The drawing is decoration, so the door's name is carried by `.overlay__label` (NFR-08).
    await expect(panel.locator(".overlay__art")).toHaveCount(3);
    await expect(panel.locator('.overlay__art[aria-hidden="true"]')).toHaveCount(3);
  });

  test("opens the player count screen from Hotseat, unchanged (D80)", async ({ page }) => {
    await openMenu(page);

    await door(page, "hotseat").click();
    await expect(overlay(page)).toHaveAttribute("data-screen", "setup");
    await expect(page.locator('.overlay__button[data-action="players"]')).toHaveCount(3);
  });
});
