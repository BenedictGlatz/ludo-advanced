/**
 * Reaching a field with the keyboard, and seeing which one you reached. NFR-08, issue #45.
 *
 * ## Why this is its own spec
 *
 * Split from `traps.spec.js` on 2026-09-03, when handoff 07's cases took that file to 301 lines. The
 * seam is not the line count: **that file is about laying an object and seeing it, and this one is about
 * the keyboard.** Four of the five cards that point at a field are trap cards, which is why the cases
 * were written there, but nothing here is about a trap. The card is a Banana Peel because a trap card is
 * the cheapest way to put the board into its picking state, and any of the five would do.
 *
 * ## The state of NFR-08 for a field, in two halves
 *
 * **The reach works.** No field on the board was focusable at all before issue #45: `bindPickEvents`
 * bound `click` and no `keydown`, and nothing gave a field a `tabindex`. Both landed with the trap cards.
 *
 * **The state does not.** D59 of design spec 07 gave a focused field two rings outside its edge, and the
 * rule is in `board.css` and never paints, because `prompt.css` answers the same question with the same
 * specificity and loads later. So a player can tab across 36 fields and see nothing move. The last case
 * in this file asserts that, deliberately, so it goes red the day D61 resolves the conflict.
 */

import { expect, test } from "@playwright/test";

import { SEEDS, chooseDiceCard, openMatch } from "./helpers.js";
import { playCardAndAwaitSquare, skillHand, square } from "./trap-helpers.js";

const withStack = (stack) => ({ fast: true, stack });

test.describe("a field can be picked from the keyboard (NFR-08)", () => {
  /**
   * A new capability rather than a regression check. **No field on the board was reachable from the
   * keyboard at all** before this issue: `bindPickEvents` bound `click` and no `keydown`, and nothing
   * gave a field a `tabindex`. That was survivable while one card in 29 pointed at a field, and four of
   * the five that do are the trap cards, so a keyboard player could not have played a trap.
   */
  test("lays a trap with Enter alone", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce, withStack(["action-banana-peel"]));

    await chooseDiceCard(board);

    // The card is reached with the keyboard too, so the whole gesture is keyboard-only.
    await skillHand(board).locator('.card[data-card-id="action-banana-peel"]').first().focus();
    await page.keyboard.press("Enter");
    await expect(board).toHaveAttribute("data-picking", "free-square");

    await square(board, 17).focus();
    await page.keyboard.press("Enter");

    await expect(square(board, 17)).toHaveAttribute("data-trap-kind", "banana-peel");
  });

  /**
   * A field is in the tab order only while it is an answer to a question. Forty permanent tab stops on
   * the board would sit between a keyboard player and every control on the page, which is the defect
   * design spec 05 found on the pool overview.
   */
  test("takes the fields back out of the tab order afterwards", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce, withStack(["action-banana-peel"]));

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-banana-peel");
    await expect(board.locator(".square--track[tabindex]")).toHaveCount(36);

    await square(board, 17).click();
    await expect(board.locator(".square--track[tabindex]")).toHaveCount(0);
  });

  /**
   * **A deliberate negative assertion, and it measures how far the D61 conflict actually reaches.**
   *
   * D59 gave a field a keyboard focus treatment: two rings outside the field with a surface-coloured gap
   * between them, told apart from "offered" by construction rather than by hue, since D11's focus ring
   * and the offer are both `--color-hint`. It is in `board.css` and **it does not paint.**
   *
   * `prompt.css` has answered the same question since handoff 04, in teal, and its selector
   * `.square--track[data-pickable="true"]` has the same specificity as `board.css`'s
   * `.square--track:focus-visible`, one class and one qualifier each. `prompt.css` loads later, so it
   * wins, and it wins on **`box-shadow`**, which is the property both the offer and the focus rings are
   * built from. So the conflict D61 is open about is not only about a fill: a focused field is drawn
   * exactly like an unfocused offered one, and a keyboard player has no way to see where they are.
   *
   * **This case asserts that, so it goes red the day D61 lands.** Same contract as the negative that
   * covered the unstyled trap chip: if it starts failing, the conflict has been resolved, and the thing
   * to do is check the focus treatment against D59 rather than delete the case.
   *
   * The keyboard reach itself is not affected and is covered by the two cases above. What is missing is
   * the paint, which is NFR-08's second half.
   *
   * **How this was found, because it is the reason the case is written this way.** An earlier version
   * asserted the opposite, that a focused field differs from an offered one, and it *passed* in single
   * runs and failed under load. Both readings were wrong: `box-shadow` transitions over
   * `--motion-feedback`, so a polled comparison succeeded while the value was still interpolating
   * between the two. Polling for a difference cannot tell "a new rule applied" from "the old value is
   * still on its way", and the settled value is the only honest measurement.
   */
  test("does not yet show a focused field, because prompt.css still wins", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce, withStack(["action-banana-peel"]));

    await chooseDiceCard(board);

    // Keyboard-only, because the rule under test is `:focus-visible` and a mouse click anywhere in the
    // run makes the browser answer that question the other way.
    await skillHand(board).locator('.card[data-card-id="action-banana-peel"]').first().focus();
    await page.keyboard.press("Enter");
    await expect(board).toHaveAttribute("data-picking", "free-square");

    const shadowOf = (index) =>
      square(board, index).evaluate((field) => window.getComputedStyle(field).boxShadow);

    // 16 and 17 are adjacent in the DOM and both offered, so one Tab moves between them and the browser
    // counts it as keyboard navigation.
    await square(board, 16).focus();
    await page.keyboard.press("Tab");
    await expect(square(board, 17)).toBeFocused();

    const keyboardFocus = await square(board, 17).evaluate((field) =>
      field.matches(":focus-visible")
    );
    test.skip(!keyboardFocus, "the browser did not treat this focus as a keyboard focus");

    // **Both fields are re-read on every attempt**, and that is the third measurement trap this handoff
    // produced. `box-shadow` transitions over `--motion-feedback` on the offer as well as on the focus,
    // so reading the offered field once and polling only the focused one compares a settled value
    // against a moving one and can fail on either side of the transition.
    await expect
      .poll(async () => {
        const [focused, offered] = await Promise.all([shadowOf(17), shadowOf(18)]);
        return focused === offered;
      })
      .toBe(true);
  });
});
