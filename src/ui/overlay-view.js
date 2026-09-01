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
 * ## Design note
 *
 * **No design specification covers any of this.** Handoff 01 excluded the menus, handoff 03 listed them
 * under what is deliberately not being asked, and `overlay.css` therefore composes only tokens that
 * already exist. It is D38 to D40 in handoff 04. Fourth file in this state, after `prompt.css`,
 * `hud.css` and `chrome.css`, and recorded rather than hidden.
 */

import $ from "jquery";

/** Which screen the overlay is showing. `none` means the match is on screen and nothing is asked. */
export const OVERLAY_SCREEN = {
  NONE: "none",
  MENU: "menu",
  SETUP: "setup",
  PAUSE: "pause",
  WIN: "win",
  HANDOVER: "handover",
};

/** What an overlay button can ask for, as the `data-action` the event handler reads. */
export const OVERLAY_ACTION = {
  /** Leave the main menu for the match setup. */
  START: "start",
  /** A player count, 2, 3 or 4. Carries `data-count` as well. */
  PLAYERS: "players",
  /** Close the pause screen and carry on. */
  RESUME: "resume",
  /** A fresh match with the same players (FR-06). */
  RESTART: "restart",
  /** Give up and go back to the main menu (FR-07). */
  QUIT: "quit",
  /** The handover is acknowledged and the next player's turn may begin. */
  READY: "ready",
};

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
        $("<div>", { class: "overlay__actions" })
      )
    );
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

  $overlay.find(".overlay__title").text(description.title ?? "");
  $overlay.find(".overlay__text").text(description.text ?? "");

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
