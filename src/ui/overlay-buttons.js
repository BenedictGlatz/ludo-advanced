/**
 * One overlay button, from its description. Split out of `overlay-view.js` in issue #42, when the
 * lobby's text fields took that file past 300 lines and the seat row, which builds buttons too, moved to
 * `overlay-regions.js` with them.
 *
 * `ui/` only: jQuery, no `t()` and no rule. Three shapes, one shell.
 */

import $ from "jquery";

/**
 * The shared shell: everything a plain button, a door and a seat position have in common.
 *
 * Every field is optional and is written only when it is there, so a screen that does not use one is
 * not left carrying an empty attribute. `count` is the setup screen's; `seat`, `value` and `pressed`
 * belong to the line-up's two positions; `field` is the lobby's, naming the textarea a button acts on.
 * `autofocus` marks the button the keyboard should land on when the screen is drawn, where that is not
 * the first one: the lobby's Copy while an invite is out, its Connect on the guest's screen (spec 19,
 * D119.2). `focusOverlay` reads `data-autofocus`; the browser attribute of the same name is not used,
 * because it fires once per page load and the overlay is drawn many times.
 *
 * **`aria-pressed` is the line-up's only record of which position is chosen**, so what the stylesheet
 * draws and what a screen reader announces cannot drift apart: they read one attribute.
 *
 * `.prop` and not `.attr` for `disabled`, because it is the element's own boolean property and that is
 * what stops the click and takes the tab stop away. D77.2 chose it for the dead menu door, and D93.1
 * chooses it again for the `bot` position of the last remaining person.
 */
export function buttonShell(button) {
  const $button = $("<button>", { type: "button", class: "overlay__button" }).attr(
    "data-action",
    button.action
  );

  if (button.variant !== undefined) $button.attr("data-variant", button.variant);
  if (button.count !== undefined) $button.attr("data-count", String(button.count));
  if (button.seat !== undefined) $button.attr("data-seat", String(button.seat));
  if (button.value !== undefined) $button.attr("data-value", button.value);
  if (button.field !== undefined) $button.attr("data-field", button.field);
  if (button.pressed !== undefined) $button.attr("aria-pressed", String(button.pressed));
  if (button.autofocus === true) $button.attr("data-autofocus", "true");
  if (button.disabled === true) $button.prop("disabled", true);

  return $button;
}

/**
 * A main menu door: a drawing, a name and a second line, from design handoff 12.
 *
 * Three children rather than the button's own text, because a button with two lines of text needs both
 * of them to be elements. `.overlay__art` is `aria-hidden`, so the drawing is decoration and the door's
 * name is carried by `.overlay__label` (NFR-08). `.overlay__hint` is **text in the DOM and never a
 * `content:` property** (NFR-03): it is the reason a disabled door needs no `aria-disabled`.
 *
 * `.html()` for the art for the same reason `card-view.js` uses it: the drawing arrives as an inline SVG
 * string. `updateOverlay` rebuilds the buttons on every screen change anyway, and `menu.css` animates no
 * button's arrival, so a language switch on the menu restarts nothing.
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
 * One button, from `{ action, label, variant, count, ... }`, or a door when it also carries a `hint`.
 *
 * The hint is what tells the two apart, because only the menu's items have one. Branching on a field
 * rather than on `description.screen` keeps the overlay's promise that it renders a description and
 * knows nothing about screens.
 */
export function overlayButton(button) {
  if (button.hint !== undefined) return overlayDoor(button);

  return buttonShell(button).text(button.label);
}
