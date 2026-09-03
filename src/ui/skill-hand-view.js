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
 * `focusable: true` regardless of `playable`, which is D67. A card in your own hand can be read by
 * pointing at it or by tabbing to it, so every real card needs a tab stop; `card-view.js` explains why
 * that is a field on the card rather than a rule inside the shared component.
 */
function skillCard(cardId, { playable, selected }) {
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
    focusable: true,
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
export function updateSkillHand($hand, state, selectedSlot = -1) {
  const seat = seatOnShow(state);
  const cards = state.skillHands[seat] ?? [];
  const playable = playableCards(state, seat);

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
  // In hot seat play the hand on show is always the viewer's, so this is always "up". Hot-seat secrecy
  // is not what this attribute buys and never was: `session-actions.js` passes the turn before the
  // curtain lifts, so a hand belonging to somebody else is never on screen with the board visible.
  // "down" stays in the contract for the first hand that is genuinely not the viewer's, which is a
  // spectator view, a replay, or the online mode.
  $hand.attr("data-face", "up");
  $hand.attr("data-seat", seat);

  $hand.children(".card").each(function updateSlot() {
    const $card = $(this);
    const slot = Number($card.attr("data-slot"));
    const cardId = cards[slot];

    if (cardId === undefined) {
      updateCard($card, emptySlot());
      return;
    }

    updateCard(
      $card,
      skillCard(cardId, {
        playable: playable.includes(cardId),
        selected: slot === selectedSlot,
      })
    );
  });

  return $hand;
}
