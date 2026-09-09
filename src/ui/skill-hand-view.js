/**
 * The skill card hand, and it is clickable. Issue #34.
 *
 * `ui/` only: jQuery, i18next, and no rule of its own. Which cards are playable is a question it **asks**
 * `state/`, and that is the whole design of this file.
 *
 * ## Why it does not decide what is playable
 *
 * `playableCards(state, seat)` comes from `state/intents-cards.js`, and it is the same function the
 * dispatcher's own refusal check is built on. A view that worked out playability for itself would be a
 * second copy of five rules, and the failure it produces is the worst kind in a card game: the player is
 * told they may play something and then told they may not.
 *
 * So the answer here is one call, and a card the view offers is a card the dispatcher will accept.
 *
 * ## One hand at a time, and which one
 *
 * There is one screen and one skill hand region, so it shows exactly one hand: `seatOnShow(state)`. The
 * active player normally, because they need to see what they hold while they pick a dice card and not only
 * in the moment they can play one, and during a reaction window the first seat still eligible.
 *
 * **That is an input-order decision, not a change to the shared window.** Two people cannot both be
 * holding the mouse, and four hands on one screen would show every hand to everybody. The thirty seconds
 * still cover the whole window.
 *
 * ## And whether the hand on screen may be looked at
 *
 * `viewerSeat` comes from `handover.js` and is the seat whose person is holding the device. The hand is
 * face up when it is theirs and face down when it is not, which is the whole of it. Everything a face
 * down hand looks like is already in `card-state.css` and `hand.css`.
 *
 * ## The card component is shared and takes translated strings
 *
 * `card-view.js` renders dice cards and skill cards from the same DOM tree, and it calls no `t()`,
 * because the locale key layout differs per family: a dice card is `card.dice.kind.8` and a skill card is
 * `card.skill.<id>.title`. Resolving the text is this file's job for skill cards and
 * `dice-hand-view.js`'s for dice cards.
 */

import $ from "jquery";

import { cardById } from "../core/cards/catalogue.js";
import { SKILL_HAND_LIMIT } from "../core/skill-pool.js";
import { playableCards, seatOnShow } from "../state/intents-cards.js";
import { t } from "../i18n/index.js";
import { skillArt } from "./art/index.js";
import { createCard, updateCard } from "./card-view.js";

/**
 * One card's description, with every string already translated.
 *
 * `focusable` defaults to `true` regardless of `playable`, which is D67. A card in your own hand can be
 * read by pointing at it or by tabbing to it, so every real card needs a tab stop; `card-view.js`
 * explains why that is a field on the card rather than a rule inside the shared component.
 *
 * **Exported since issue #93**, because `last-card-view.js` shows the last card played at the same
 * reference size and out of the same catalogue. Resolving `card.skill.<id>.title` and the drawing in two
 * files would be two places to change when a card gains a field, and the plate would be the one that
 * silently fell behind. The plate is the caller that overrides `focusable`: the card in it is a record,
 * the section around it is the tab stop, and a stop on the card would be a second one.
 */
export function skillCard(cardId, { playable, selected, focusable = true }) {
  const card = cardById(cardId);

  return {
    id: cardId,
    family: "skill",
    type: card.type,
    category: card.category,
    typeLabel: t(`card.type.${card.type}`),
    kindLabel: t(`card.kind.${card.kind}`),
    title: t(`card.skill.${cardId}.title`),
    text: t(`card.skill.${cardId}.text`),
    tags: card.category === null ? [] : [t(`card.category.${card.category}`)],
    art: skillArt(cardId),
    playable,
    focusable,
    selected,
  };
}

/**
 * The hand region, empty.
 *
 * Built once with the maximum number of slots and then filled, the same way the dice hand is. A hand that
 * added and removed DOM nodes as cards come and go would restart every transition in `card.css` on every
 * render, and the fan-out on hover would flicker.
 */
export function renderSkillHand() {
  const $hand = $("<div>", { class: "hand hand--skill" })
    .attr("data-count", 0)
    .attr("data-active", "false")
    .attr("data-face", "up");

  for (let slot = 0; slot < SKILL_HAND_LIMIT; slot += 1) {
    $hand.append(createCard().attr("data-slot", slot));
  }

  return $hand;
}

/** A slot with no card in it: emptied of every string, not playable, and not a tab stop. */
function emptySlot() {
  return {
    id: null,
    family: null,
    type: null,
    category: null,
    typeLabel: "",
    kindLabel: "",
    title: "",
    text: "",
    tags: [],
    art: null,
    playable: false,
    focusable: false,
    selected: false,
  };
}

/**
 * Redraw the hand from the state.
 *
 * `selectedSlot` is the slot the target picker is currently collecting targets for, or `-1`. It is passed
 * in rather than read from the state, because a half-finished card play is **presentation state**:
 * nothing has been dispatched, the rules know nothing about it, and it disappears if the player cancels.
 * Putting it in the frozen state object would make the rules layer hold a fact about a click.
 *
 * **A slot and not a card id**, because a hand can hold both copies of one card. Marking by id would
 * light up two cards when the player picked one, and the player would have no way to tell which of the
 * two the game thought they meant.
 */
export function updateSkillHand($hand, state, selectedSlot = -1, viewerSeat = null) {
  const seat = seatOnShow(state);
  const cards = state.skillHands[seat] ?? [];
  const secret = seat !== viewerSeat;
  const playable = secret ? [] : playableCards(state, seat);

  $hand.attr("data-count", cards.length);
  $hand.attr("data-active", String(playable.length > 0));

  // Two attributes, two questions, and D65 is the decision that they must not be one attribute.
  //
  // `data-active` answers "can something here be played this instant". That is a question about the
  // rules, it is derived from `playableCards` on the line above, and D36 gave it its meaning: the plate
  // it sits on lifts when it is true and dims when it is false.
  //
  // `data-face` answers "may the person in front of the screen see these cards". That is a question
  // about who is holding the device. `card-state.css` used to read `data-active` for it and draw a card
  // back, so the player looked at the back of their own hand through the dice card choice, through the
  // move, and again once their card budget was spent. `intents-cards.js` had already refused the same
  // conflation one layer up, in a comment that describes this bug in advance.
  //
  // "down" waited in the contract for "the first hand that is genuinely not the viewer's", and on
  // 2026-09-06 it turned out there had been two of them all along. A bot's hand is on show for the
  // whole of the bot's turn and no curtain ever covers it, because `handoverNeeded` correctly says
  // that nobody is being handed anything. And during a reaction window `seatOnShow` moves to the seat
  // being asked, so the answering player's hand came up in front of the player whose turn it was.
  //
  // So the question is not "is this seat a computer" and never was. It is "is this hand the viewer's",
  // and `handover.js` is the file that finally knows who the viewer is.
  $hand.attr("data-face", secret ? "down" : "up");
  $hand.attr("data-seat", seat);

  $hand.children(".card").each(function updateSlot() {
    const $card = $(this);
    const slot = Number($card.attr("data-slot"));
    const cardId = cards[slot];

    if (cardId === undefined) {
      updateCard($card, emptySlot());
      return;
    }

    // A card nobody may look at is also a card nobody may click or tab to. The back in
    // `card-state.css` hides the face, and these two take away the pointer cursor and the tab stop
    // that would otherwise still be on it: `card-controls.js` refuses the click anyway, and offering
    // a gesture that is then refused is the worst kind of bug in a card game.
    updateCard(
      $card,
      skillCard(cardId, {
        playable: playable.includes(cardId),
        selected: !secret && slot === selectedSlot,
        focusable: !secret,
      })
    );
  });

  return $hand;
}
