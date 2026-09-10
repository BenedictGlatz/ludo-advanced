/**
 * The overlay regions that are rebuilt on every screen change: the cards, the seat rows and, since
 * issue #42, the text fields of the online lobby. Split out of `overlay-view.js`.
 *
 * `ui/` only: jQuery, no `t()` and no rule. Like the file it came from, it **renders a description and
 * looks nothing up**. The seam is the one the overlay's own header drew: the shell is built once and
 * rewritten, and these three regions are the exception that is torn down and rebuilt, because how many
 * of each there are is a property of the screen.
 *
 * ## Why rebuilt rather than rewritten
 *
 * The hands rewrite in place because a dealt card has to animate from its old identity, and a screen that
 * was not on the page a moment ago has no old identity. Nothing in the stylesheet animates the arrival of
 * a card, a row or a field on the overlay, so there is no transition to restart.
 *
 * **The one exception is a field the player is typing into.** The overlay is redrawn on every stage
 * change of the lobby and on every language switch, and a pasted invite code that vanished because the
 * host's status line changed would be the whole screen broken. So a writable field keeps whatever the DOM
 * already holds when the description carries no value for it.
 */

import $ from "jquery";

import { createCard, updateCard } from "./card-view.js";
import { buttonShell } from "./overlay-buttons.js";

/**
 * Fill or empty the card region.
 *
 * `data-count` is written even when it is zero, so the CSS can lay out by how many cards there are the
 * way `.hand` already does, and a composition change from seven denominations to eight needs no new rule.
 */
export function setCards($overlay, cards) {
  const $cards = $overlay.find(".overlay__cards").attr("data-count", String(cards.length)).empty();

  for (const card of cards) {
    $cards.append(updateCard(createCard(), card));
  }
}

/**
 * One seat row: the seat, its name, and either the two positions of its control (the line-up) or a
 * status word (the online lobby, issue #42).
 *
 * `data-player` is what `board.css` maps `--player` and `--player-soft` from, so the seat's colour
 * arrives without this file or `lineup.css` restating it (D2). `data-controller` is `hud-view.js`'s word
 * for the same fact and is reused unchanged. `data-status` is the lobby's: `host`, `connected`, `bot`,
 * `waiting`, and on the one seat being connected `gathering` or `connecting` (design spec 19, D118.1);
 * `lobby.css` reads it.
 */
function overlaySeat(seat) {
  const $seat = $("<div>", { class: "overlay__seat" })
    .attr("data-player", String(seat.player))
    .attr("data-controller", seat.controller)
    .append($("<span>", { class: "overlay__seat-name", text: seat.label }));

  if (seat.status !== undefined) {
    $seat
      .attr("data-status", seat.status)
      .append($("<span>", { class: "overlay__seat-status", text: seat.statusLabel }));
  }

  return $seat.append(
    $("<div>", { class: "overlay__seat-choice" }).append(
      (seat.choices ?? []).map((choice) => buttonShell(choice).text(choice.label)[0])
    )
  );
}

/**
 * Fill or empty the seat region.
 *
 * **Rebuilt rather than rewritten**, and here that is load-bearing: the overlay's controls are rebuilt on
 * every screen change **and on every language switch**, so a whole row has to come back from the
 * description and never from what is already in the DOM.
 */
export function setSeats($overlay, seats) {
  $overlay
    .find(".overlay__seats")
    .empty()
    .append(seats.map((seat) => overlaySeat(seat)[0]));
}

/**
 * One text field of the lobby: a label, a textarea and, when the field has one, the button that acts on
 * it, from `{ name, label, value, readonly, button }`.
 *
 * A `<textarea>` and not an `<input>`, because an invite code is a few hundred characters and the player
 * has to see that something long was pasted whole. `data-field` is how a button says which field it acts
 * on: `events.js` reads the button's `data-field` and hands the matching textarea's text along.
 *
 * **Copy and Connect sit beside their field since design spec 19 (D119.2)**, in `.overlay__field-action`
 * after the textarea, rather than in the actions row at the foot: two verbs with no object under two
 * fields was `data-field` doing in the DOM what position does on screen. The button keeps its
 * `data-action` and `data-field`, so `events.js` and the end-to-end specs read nothing new.
 *
 * The field is a `<div>` with a `<label for>` and not a `<label>` around everything, because a label may
 * not contain a second labelable element, and a button is one. The id is the field's name, which is
 * unique on a screen and stable across redraws.
 */
function overlayField(field, current) {
  const id = `overlay-field-${field.name}`;
  const $textarea = $("<textarea>", { class: "overlay__textarea", rows: 2, id })
    .attr("data-field", field.name)
    .attr("spellcheck", "false")
    .prop("readOnly", field.readonly === true);

  if (field.value !== null && field.value !== undefined) $textarea.val(field.value);
  else if (field.readonly !== true && current !== undefined) $textarea.val(current);

  const $field = $("<div>", { class: "overlay__field" })
    .attr("data-field-name", field.name)
    .append($("<label>", { class: "overlay__field-label", text: field.label, for: id }), $textarea);

  if (field.button !== undefined) {
    $field.append(
      $("<div>", { class: "overlay__field-action" }).append(
        buttonShell(field.button).text(field.button.label)
      )
    );
  }

  return $field;
}

/** Fill or empty the field region, keeping what the player has typed into a writable field. */
export function setFields($overlay, fields) {
  const $fields = $overlay.find(".overlay__fields");
  const typed = new Map();

  $fields.find("textarea[data-field]").each(function remember() {
    typed.set($(this).attr("data-field"), $(this).val());
  });

  $fields.empty().append(fields.map((field) => overlayField(field, typed.get(field.name))[0]));
}
