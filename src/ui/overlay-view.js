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
 * **The buttons, the cards and the seat rows are the exception and are rebuilt**, because how many
 * there are is a property of the screen: the menu has one door and the line-up has up to four rows.
 * Nothing in the stylesheet animates their arrival, so there is no transition to restart, and a
 * language switch that rebuilds a whole screen restarts nothing either.
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
 *
 * `.overlay__cards` and `.overlay__seats` are the same deal, and both are hidden while empty by the
 * stylesheet of the one screen that fills them. Without that, the panel's flex gap would leave a hole
 * on every screen that has neither.
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

/**
 * The shared shell: everything a plain button, a door and a seat position have in common.
 *
 * Every field is optional and is written only when it is there, so a screen that does not use one is
 * not left carrying an empty attribute. `count` is the setup screen's; `seat`, `value` and `pressed`
 * belong to the line-up's two positions.
 *
 * **`aria-pressed` is the line-up's only record of which position is chosen**, so what the stylesheet
 * draws and what a screen reader announces cannot drift apart: they read one attribute.
 *
 * `.prop` and not `.attr` for `disabled`, because it is the element's own boolean property and that is
 * what stops the click and takes the tab stop away. D77.2 chose it for the two dead menu doors, and
 * D93.1 chooses it again for the `bot` position of the last remaining person.
 */
function buttonShell(button) {
  const $button = $("<button>", { type: "button", class: "overlay__button" }).attr(
    "data-action",
    button.action
  );

  if (button.variant !== undefined) $button.attr("data-variant", button.variant);
  if (button.count !== undefined) $button.attr("data-count", String(button.count));
  if (button.seat !== undefined) $button.attr("data-seat", String(button.seat));
  if (button.value !== undefined) $button.attr("data-value", button.value);
  if (button.pressed !== undefined) $button.attr("aria-pressed", String(button.pressed));
  if (button.disabled === true) $button.prop("disabled", true);

  return $button;
}

/**
 * A main menu door: a drawing, a name and a second line, from design handoff 12.
 *
 * Three children rather than the button's own text, because a button with two lines of text needs both
 * of them to be elements. `.overlay__art` is `aria-hidden`, so the drawing is decoration and the door's
 * name is carried by `.overlay__label` (NFR-08), which is the same split `card.css` makes for
 * `.card__art`. `.overlay__hint` is **text in the DOM and never a `content:` property** (NFR-03): it is
 * the reason a disabled door needs no `aria-disabled`, and a pseudo-element could not be read out.
 *
 * `.html()` for the art for the same reason `card-view.js` uses it: the drawing arrives as an inline SVG
 * string. There is no re-parse guard here and there does not need to be one. `updateOverlay` rebuilds
 * the buttons on every screen change anyway, it is three drawings on one screen, and `menu.css` animates
 * no button's arrival, so a language switch on the menu restarts nothing.
 *
 * `disabled` moved into `buttonShell` when the line-up screen needed the same treatment for the one
 * position FR-01 refuses (D93.1). It is the same argument in both places, so it is written once.
 */
function overlayDoor(button) {
  return buttonShell(button).append(
    $("<span>", { class: "overlay__art" })
      .attr("aria-hidden", "true")
      .html(button.art ?? ""),
    $("<span>", { class: "overlay__label", text: button.label }),
    $("<span>", { class: "overlay__hint", text: button.hint })
  );
}

/**
 * One button, from `{ action, label, variant, count }`, or a door when it also carries a `hint`.
 *
 * The hint is what tells the two apart, because only the menu's items have one. Branching on a field
 * rather than on `description.screen` keeps this file's promise that it renders a description and knows
 * nothing about screens.
 */
function overlayButton(button) {
  if (button.hint !== undefined) return overlayDoor(button);

  return buttonShell(button).text(button.label);
}

/**
 * One seat row on the line-up screen: the seat, its name, and the two positions of its control.
 *
 * `data-player` is what `board.css` maps `--player` and `--player-soft` from, so the seat's colour
 * arrives without this file or `lineup.css` restating it (D2). The badge is a dot: the four seat shapes
 * were withdrawn on 2026-09-05 with design handoff 16 (D97). `data-controller` is `hud-view.js`'s word
 * for the same fact and is reused unchanged.
 *
 * The plate is a `::before` in the stylesheet rather than an element here, because it is a shape and
 * not a thing to read: the seat's identity is in the name beside it, in words.
 */
function overlaySeat(seat) {
  return $("<div>", { class: "overlay__seat" })
    .attr("data-player", String(seat.player))
    .attr("data-controller", seat.controller)
    .append(
      $("<span>", { class: "overlay__seat-name", text: seat.label }),
      $("<div>", { class: "overlay__seat-choice" }).append(
        seat.choices.map((choice) => buttonShell(choice).text(choice.label)[0])
      )
    );
}

/**
 * Fill or empty the seat region, the same way `setCards` does its own.
 *
 * **Rebuilt rather than rewritten**, and here that is load-bearing rather than merely consistent: the
 * overlay's controls are rebuilt on every screen change **and on every language switch**, so a whole
 * row has to come back from the description and never from what is already in the DOM. Switching
 * language halfway through setting up a line-up is the case that finds a row rebuilt from itself.
 */
function setSeats($overlay, seats) {
  $overlay
    .find(".overlay__seats")
    .empty()
    .append(seats.map((seat) => overlaySeat(seat)[0]));
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
 *   seats: [],       // seat rows, only the line-up screen has any
 *   buttons: [{ action, label, variant, count, seat, value, pressed, art, hint, disabled }] }
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
  $overlay.find(".overlay__text").text(description.text ?? "");

  setCards($overlay, description.cards ?? []);
  setSeats($overlay, description.seats ?? []);

  $overlay
    .find(".overlay__actions")
    .empty()
    .append((description.buttons ?? []).map((button) => overlayButton(button)[0]));

  return $overlay;
}

/**
 * Move the keyboard onto the overlay's first button, or onto its Start button when it has one.
 *
 * Called by the flow after opening a screen. It is here rather than in `updateOverlay` because focus is
 * a thing that happens **once**, when a screen opens, and `updateOverlay` also runs on a language
 * change, where stealing focus back would be wrong.
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
  const $begin = $overlay.find(`.overlay__button[data-action="${OVERLAY_ACTION.BEGIN}"]`);

  if ($begin.length > 0) {
    $begin.first().trigger("focus");
    return;
  }

  $overlay.find(".overlay__button").first().trigger("focus");
}
