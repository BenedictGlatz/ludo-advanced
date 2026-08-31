/**
 * One card, as DOM. Issue #31, design spec 03.
 *
 * Reads state, never writes it, and holds no rule (`CLAUDE.md`). It does not know what a dice card is
 * either: it takes a **description** and renders it. `dice-hand-view.js` builds the description for a
 * dice card, and the skill hand of issue #34 will build one for a skill card against the same shape.
 * That is what keeps one card component behind all three families, which is decision D28.
 *
 * ## Built once, then rewritten
 *
 * `createCard()` returns the whole element tree with every part of the contract present and empty.
 * `updateCard()` only rewrites attributes and text. Nothing is destroyed and rebuilt, which spec 01
 * fixed as D10 for the pawns and spec 03 relies on for the dealing animation: an element that is
 * replaced restarts every transition on it, so a card that is re-created cannot animate.
 *
 * `.card__result` and `.card__text` are present even when they are empty, because
 * `card-state.css` hides an empty result with `:empty` and the hand size hides the paragraph. An
 * element that has to exist before it has content cannot be added at the moment it gets some.
 *
 * ## The art window is empty, and that is outstanding work
 *
 * The 29 illustrations exist as inline SVG inside a generated artboard. Extracting them into
 * something the view can insert is its own piece of work and it is not in this commit, so
 * `.card__art` renders as the framed, category-washed window with nothing in it. The card is
 * readable without it: the band says the type, the title says the name, the tags say the numbers.
 */

import $ from "jquery";

/**
 * The attributes that say what the card *is*, as opposed to what is happening to it.
 *
 * Listed rather than derived, because the CSS may only target what the contract in design brief 03
 * section 3.1 names. A description carrying a key that is not in this list is ignored on purpose:
 * a typo should not quietly invent an attribute no stylesheet reads.
 */
const IDENTITY = {
  id: "data-card-id",
  family: "data-card-family",
  type: "data-card-type",
  category: "data-card-category",
  faces: "data-faces",
};

/**
 * Write an attribute, or remove it when there is nothing to say.
 *
 * The difference matters: `data-card-category` absent is what tells `card.css` to draw the plain kind
 * label instead of the category pill, and `data-card-category=""` would not, because the CSS matches
 * on the attribute existing.
 */
function setAttribute($element, name, value) {
  if (value === null || value === undefined || value === "") {
    $element.removeAttr(name);
    return;
  }

  $element.attr(name, String(value));
}

/**
 * An empty card, ready to be filled in.
 *
 * `tabindex` is here for the same reason it is on a pawn: `card-state.css` styles `:focus-visible`,
 * and a focus state on an element the keyboard cannot reach is a state that never happens (NFR-08).
 */
export function createCard() {
  const $banner = $("<div>", { class: "card__banner" }).append(
    $("<span>", { class: "card__type" }),
    $("<span>", { class: "card__kind" })
  );

  return $("<div>", { class: "card", tabindex: 0 }).append(
    $banner,
    $("<span>", { class: "card__result" }),
    $("<div>", { class: "card__art" }),
    $("<h3>", { class: "card__title" }),
    $("<p>", { class: "card__text" }),
    $("<ul>", { class: "card__tags" })
  );
}

/**
 * The tag row.
 *
 * This is the one part that is rebuilt rather than rewritten, because the number of tags is a
 * property of the card and changes when the card does. Nothing in `card.css` animates a tag, so
 * there is no transition to restart, and matching a varying list of `<li>` elements by index would be
 * more code than it saves.
 */
function fillTags($card, tags) {
  $card
    .find(".card__tags")
    .empty()
    .append(tags.map((tag) => $("<li>", { class: "card__tag", text: tag })[0]));
}

/**
 * Put a description on screen.
 *
 * The description is:
 *
 * ```js
 * { id, family, type, category, faces,   // identity, any of them optional
 *   typeLabel, kindLabel, title, text,   // already translated: this file calls no t()
 *   tags: [],                            // already translated
 *   playable, selected,                  // booleans
 *   result }                             // the roll, or null
 * ```
 *
 * **Every string arrives translated.** The card does not call i18next, because the key layout differs
 * per family (`card.dice.kind.8` against `card.skill.<id>.title`) and a component that knows all of
 * them is a component that has to change every time a family is added.
 */
export function updateCard($card, card) {
  for (const [key, attribute] of Object.entries(IDENTITY)) {
    setAttribute($card, attribute, card[key]);
  }

  $card.attr("data-playable", String(card.playable === true));
  $card.attr("data-selected", String(card.selected === true));

  $card.find(".card__type").text(card.typeLabel ?? "");
  $card.find(".card__kind").text(card.kindLabel ?? "");
  $card.find(".card__title").text(card.title ?? "");
  $card.find(".card__text").text(card.text ?? "");

  // Not `?? ""`: a roll of 0 is a real result once a card can subtract from a die (issue #38), and
  // `0 ?? ""` keeps the zero while `0 || ""` would throw it away.
  $card
    .find(".card__result")
    .text(card.result === null || card.result === undefined ? "" : String(card.result));

  fillTags($card, card.tags ?? []);

  return $card;
}
