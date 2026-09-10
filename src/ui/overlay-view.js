/**
 * One overlay, seven screens: S1, S2, S3, S8, S9, the handover and the pool overview. Issues #39, #41,
 * #30 and #76.
 *
 * `ui/` only: jQuery, no `t()` and no rule. Like `card-view.js`, this file **renders a description and
 * looks nothing up**. `overlay-screens.js` builds the description; the split is what keeps one component
 * behind seven screens that have nothing in common except their shape.
 *
 * ## Why seven screens and not seven components
 *
 * The main menu, the match setup, the line-up, the pause screen, the win screen, the handover and the
 * pool overview are all the same thing from the player's side: **the game has stopped and is asking you
 * something, and here are your buttons.** They differ in the words and in how many controls there are.
 * Seven components would be seven copies of one focus trap and one show-and-hide.
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
 * **The buttons, the cards, the seat rows and the lobby's text fields are the exception and are
 * rebuilt**, because how many there are is a property of the screen: the menu has three doors and the
 * line-up has up to four rows. Since issue #42 the buttons are built in `overlay-buttons.js` and the
 * three regions in `overlay-regions.js`; what stays here is the shell and the one function that fills it.
 *
 * ## The design landed on 2026-09-01, and D38 confirmed this seam
 *
 * One component behind the screens is the answer, and the sheet has two modes rather than one: a **veil**
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

import { overlayButton } from "./overlay-buttons.js";
import { setCards, setFields, setSeats } from "./overlay-regions.js";
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
 *
 * `.overlay__cards`, `.overlay__seats` and `.overlay__fields` are the same deal, and all three are hidden
 * while empty by the stylesheet of the one screen that fills them. Without that, the panel's flex gap
 * would leave a hole on every screen that has none.
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
        $("<div>", { class: "overlay__seats" }),
        $("<div>", { class: "overlay__fields" }),
        $("<div>", { class: "overlay__actions" })
      )
    );
}

/**
 * Put a screen on the overlay, or take it off.
 *
 * The description is:
 *
 * ```js
 * { screen,          // one of OVERLAY_SCREEN
 *   title, text,     // already translated: this file calls no t()
 *   tone,            // "warn" when the text is a failure (design spec 19, D118.2), null otherwise
 *   player,          // the seat the panel is about, or null
 *   outcome,         // "won" or "abandoned" on the win screen, null everywhere else
 *   cards: [],       // dice or skill card descriptions, only the pool overview has any
 *   seats: [],       // seat rows, the line-up screen and the online lobby have them
 *   fields: [],      // text fields, only the two online lobbies have any (issue #42); a field may
 *                    // carry its own `button`, drawn beside it (spec 19, D119.2)
 *   buttons: [{ action, label, variant, count, seat, value, field, pressed, art, hint, disabled,
 *               autofocus }] }
 * ```
 *
 * The last three fields on a button are the main menu's, from design handoff 12. **A button carrying a
 * `hint` is built as a door**, with the drawing, the name and the second line as three elements instead
 * of one string of text; every other screen's buttons keep their plain text and are unaffected.
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
  const $text = $overlay.find(".overlay__text").text(description.text ?? "");

  // Absent rather than empty, like the two attributes above: `lobby.css` matches on it existing.
  if (description.tone === null || description.tone === undefined) $text.removeAttr("data-tone");
  else $text.attr("data-tone", String(description.tone));

  setCards($overlay, description.cards ?? []);
  setSeats($overlay, description.seats ?? []);
  setFields($overlay, description.fields ?? []);

  $overlay
    .find(".overlay__actions")
    .empty()
    .append((description.buttons ?? []).map((button) => overlayButton(button)[0]));

  return $overlay;
}

/**
 * Move the keyboard onto the overlay's first button, or onto its Start button when it has one, or onto
 * the one button a screen marked `autofocus`.
 *
 * Called by the flow after opening a screen, and again after a redraw that took the focused element
 * away. It is here rather than in `updateOverlay` because focus is a thing that happens **once**, when a
 * screen opens, and `updateOverlay` also runs on a language change, where stealing focus back would be
 * wrong.
 *
 * **`data-autofocus` wins over both rules** (design spec 19, D119.2). The lobby's Copy sits inside its
 * field, after the seat rows, so "the first button" would be a free seat's Bot switch while the one
 * thing the host is about to do is copy the code. The screen says which button that is; this file only
 * reads the attribute.
 *
 * **The one exception is the line-up screen, and D94.3 asks for it by name.** The first button there is
 * seat 0's `human` position, which is already the chosen one, so `Enter` on arrival would do nothing at
 * all. Start is the one control on that screen where `Enter` does what the player came for, and the
 * line-up arrives valid, so the express route through both screens is 4 then Enter.
 *
 * The cost, stated rather than hidden: a keyboard user who wants the rows reaches them with
 * `Shift+Tab`, because the rows come before the actions in the DOM and should. That is one keystroke,
 * against `Enter` doing nothing on every arrival.
 *
 * The rule is scoped by the button and not by the screen, so this file keeps its promise that it
 * renders a description and knows nothing about screens.
 */
export function focusOverlay($overlay) {
  const $marked = $overlay.find(".overlay__button[data-autofocus]");

  if ($marked.length > 0) {
    $marked.first().trigger("focus");
    return;
  }

  const $begin = $overlay.find(`.overlay__button[data-action="${OVERLAY_ACTION.BEGIN}"]`);

  if ($begin.length > 0) {
    $begin.first().trigger("focus");
    return;
  }

  $overlay.find(".overlay__button").first().trigger("focus");
}
