/**
 * One overlay, five screens. Screens S1, S2, S8, S9 and the handover. Issues #39 and #41.
 *
 * `ui/` only: jQuery, no `t()` and no rule. Like `card-view.js`, this file **renders a description and
 * looks nothing up**. `overlay-screens.js` builds the description; the split is what keeps one component
 * behind five screens that have nothing in common except their shape.
 *
 * ## Why five screens and not five components
 *
 * The main menu, the match setup, the pause screen, the win screen and the handover are all the same
 * thing from the player's side: **the game has stopped and is asking you something, and here are your
 * buttons.** They differ in the words and in how many buttons there are. Five components would be five
 * copies of one focus trap and one show-and-hide.
 *
 * Whether that is the right seam is D38 in design handoff 04, which is why `data-screen` is on the
 * element: a stylesheet that wants to make the menu look nothing like the pause screen can.
 *
 * ## Built once, then rewritten
 *
 * The element lives in the document from boot to shutdown and is toggled with `data-open`, per D10 of
 * design spec 01. An overlay that were added and removed could not animate its own arrival, and the
 * handover overlay is the most-repeated screen in the game.
 *
 * **The buttons are the exception and are rebuilt**, because the number of them is a property of the
 * screen: the menu has one and the pause screen has two. Nothing in the stylesheet animates a button's
 * arrival, so there is no transition to restart.
 *
 * ## The design landed on 2026-09-01, and D38 confirmed this seam
 *
 * One component behind five screens is the answer, and the sheet has two modes rather than one: a **veil**
 * you can read the board through for pause and win, and an opaque **curtain** for the menu, the setup
 * screen and the handover. The handover's half moved to `handover.css`, which is a split of the same
 * component and not a second one.
 *
 * **`data-outcome` is new and is the one thing this file had to grow.** D40 draws a win and an abandoned
 * match as two different screens, and both arrive at `data-screen="win"` because both reach the same
 * `match-over` phase. Nothing in the markup told them apart: the CSS would have had to guess from
 * `data-player` being absent, which is exactly the guess the design brief asks us not to make.
 */

import $ from "jquery";

import { createCard, updateCard } from "./card-view.js";
import { OVERLAY_ACTION, OVERLAY_SCREEN } from "./overlay-vocabulary.js";

/**
 * Re-exported so that every file which already imported the two tables from here keeps working.
 *
 * They live in `overlay-vocabulary.js` since issue #30, because this file imports jQuery and jQuery
 * throws without a `document`, which made the pure screen-description files impossible to unit test.
 * That module's header carries the reasoning.
 */
export { OVERLAY_ACTION, OVERLAY_SCREEN };

/**
 * The overlay, closed and empty.
 *
 * `.overlay__text` is present while empty rather than added when it gets content, for the same reason
 * `.card__result` is: `overlay.css` hides an empty one with `:empty`, and an element that has to exist
 * before it has content cannot be created at the moment it gets some.
 */
export function renderOverlay() {
  return $("<div>", { class: "overlay" })
    .attr("data-screen", OVERLAY_SCREEN.NONE)
    .attr("data-open", "false")
    .attr("hidden", "hidden")
    .append(
      $("<div>", { class: "overlay__panel" }).append(
        $("<h2>", { class: "overlay__title" }),
        $("<p>", { class: "overlay__text" }),
        $("<div>", { class: "overlay__cards" }),
        $("<div>", { class: "overlay__actions" })
      )
    );
}

/**
 * Fill or empty the card region.
 *
 * Rebuilt rather than rewritten, which is the opposite of what the hands do and is right here for two
 * reasons. Only one screen has cards at all, so there is nothing to keep in step between screens, and
 * nothing on this region animates on arrival: the hands rewrite in place because a dealt card has to
 * animate from its old identity, and a screen that was not on the page a moment ago has no old identity.
 *
 * `data-count` is written even when it is zero, so the CSS can lay out by how many cards there are the
 * way `.hand` already does, and a composition change from seven denominations to eight needs no new rule.
 */
function setCards($overlay, cards) {
  const $cards = $overlay.find(".overlay__cards").attr("data-count", String(cards.length)).empty();

  for (const card of cards) {
    $cards.append(updateCard(createCard(), card));
  }
}

/** One button, from `{ action, label, variant, count }`. */
function overlayButton(button) {
  const $button = $("<button>", {
    type: "button",
    class: "overlay__button",
    text: button.label,
  }).attr("data-action", button.action);

  if (button.variant !== undefined) $button.attr("data-variant", button.variant);
  if (button.count !== undefined) $button.attr("data-count", String(button.count));

  return $button;
}

/**
 * Put a screen on the overlay, or take it off.
 *
 * The description is:
 *
 * ```js
 * { screen,          // one of OVERLAY_SCREEN
 *   title, text,     // already translated: this file calls no t()
 *   player,          // the seat the panel is about, or null
 *   outcome,         // "won" or "abandoned" on the win screen, null everywhere else
 *   cards: [],       // dice or skill card descriptions, only the pool overview has any
 *   buttons: [{ action, label, variant, count }] }
 * ```
 *
 * `hidden` is set as well as `data-open`, so the overlay is out of the accessibility tree and out of the
 * tab order while it is closed. `data-open` alone would leave a keyboard user tabbing through the
 * buttons of a menu nobody can see, which NFR-08 is about.
 */
export function updateOverlay($overlay, description) {
  const open = description.screen !== OVERLAY_SCREEN.NONE;

  $overlay.attr("data-screen", description.screen);
  $overlay.attr("data-open", String(open));
  $overlay.attr("hidden", open ? null : "hidden");

  // Absent rather than empty when there is no player, so the CSS can match on the attribute existing.
  if (description.player === null || description.player === undefined) {
    $overlay.removeAttr("data-player");
  } else {
    $overlay.attr("data-player", String(description.player));
  }

  // Same rule for the outcome, which only the win screen has one of (D40).
  if (description.outcome === null || description.outcome === undefined) {
    $overlay.removeAttr("data-outcome");
  } else {
    $overlay.attr("data-outcome", String(description.outcome));
  }

  $overlay.find(".overlay__title").text(description.title ?? "");
  $overlay.find(".overlay__text").text(description.text ?? "");

  setCards($overlay, description.cards ?? []);

  $overlay
    .find(".overlay__actions")
    .empty()
    .append((description.buttons ?? []).map((button) => overlayButton(button)[0]));

  return $overlay;
}

/**
 * Move the keyboard onto the overlay's first button.
 *
 * Called by the flow after opening a screen. It is here rather than in `updateOverlay` because focus is
 * a thing that happens **once**, when a screen opens, and `updateOverlay` also runs on a language
 * change, where stealing focus back would be wrong.
 */
export function focusOverlay($overlay) {
  $overlay.find(".overlay__button").first().trigger("focus");
}
