/**
 * The three drawn dice cards, and the click that picks one. Issue #31, requirements FR-18 and FR-19.
 *
 * This closes the gap `game-loop.js` has been carrying since issue #30: the pool dealt three
 * different cards and the loop took the first one, so a choice the rulebook gives the player was
 * being made for them. From here the player makes it.
 *
 * Reads state and holds no rule. Which card is worth taking is the player's judgement, and this file
 * deliberately gives no hint about it: a "recommended" card would be a second player living in the
 * view. What it does say is what each card can do, through the two tags, because that is printed on
 * the card and is not advice.
 *
 * ## Three permanent slots
 *
 * The three cards are built once and rewritten, per D10 of spec 01 and D31 of spec 03. A dealt card
 * is a card whose `data-card-id` changed, not a new element, which is what lets the arrival animate.
 * The slot count comes from the dice source (`handSize`) rather than being the literal 3, so
 * reweighting the pool to deal four cards is a change in `core/dice-pool.js` and nowhere else.
 *
 * ## Why the deal has to be replayed by hand
 *
 * A CSS animation does not restart because an attribute inside the element changed, so rewriting
 * `data-card-id` deals a card silently. `data-dealing` is the trigger design spec 03 asked for as
 * D34, and restarting it needs the attribute removed, a reflow forced, and the attribute put back.
 * The forced read of `offsetWidth` is the whole trick and it is the reason that line looks pointless.
 */

import $ from "jquery";

import { t } from "../i18n/index.js";
import { TURN_PHASE } from "../state/game-state.js";
import { diceArt } from "./art/index.js";
import { createCard, updateCard } from "./card-view.js";

/**
 * What one dice card says, translated.
 *
 * The title is the denomination, `W8` in German and `D8` in English, which is why it is a locale
 * string and not something the view formats out of a number.
 *
 * The two tags are the reason the pool is a decision at all, restated on the card: how far this die
 * can move a pawn, and the number it needs to get one out of the start area (FR-09). A hand holding a
 * D2 and a D20 is a choice between those two things, and a player should not have to remember which.
 */
function diceCard(faces) {
  return {
    id: `dice-d${faces}`,
    family: "dice",
    faces,
    typeLabel: t("card.family.dice"),
    kindLabel: t(`card.dice.kind.${faces}`),
    title: t("card.dice.name", { faces }),
    tags: [t("card.dice.range", { faces }), t("card.dice.leave", { faces })],
    art: diceArt(faces),
  };
}

/** An empty slot, for a hand that has fewer cards than the source can deal. */
function emptySlot() {
  return { id: null, family: "dice", tags: [], art: null };
}

/**
 * The hand region, with its cards built and blank.
 *
 * `slotCount` is `deps.diceSource.handSize`. Detached, like `renderBoard`, so the composition root
 * decides where it goes on the page.
 */
export function renderDiceHand(slotCount) {
  const $hand = $("<div>", { class: "hand hand--dice" });

  for (let slot = 0; slot < slotCount; slot += 1) {
    $hand.append(createCard().attr("data-slot", slot));
  }

  return $hand;
}

/** Restart the dealing animation. See the note at the top about the `offsetWidth` read. */
function replayDeal($hand) {
  $hand.removeAttr("data-dealing");
  void $hand[0].offsetWidth;
  $hand.attr("data-dealing", "true");
}

/**
 * Which slot holds the card the player kept, or `-1`.
 *
 * By denomination, and the first match wins. A hand holding two D6 cards has two slots that are
 * equally correct, because the rules cannot tell those two cards apart: `chooseDie` in the turn
 * manager identifies a card the same way and for the same reason.
 */
function selectedSlot(state) {
  if (state.chosenDie === null) return -1;
  return state.hand.indexOf(state.chosenDie);
}

/**
 * Put the current hand on screen.
 *
 * `data-active` is `true` while the hand is the thing the game is waiting for, which is the `choose`
 * phase. The contract calls the attribute "whether this hand belongs to the player whose turn it
 * is", and in hot-seat there is one shared dice hand, so read literally it would always be true and
 * the plate ring in `app.css` would never mean anything. The reading here is the one that comment
 * describes: the plate that is asking for a decision is the one that stands out.
 */
export function updateDiceHand($hand, state) {
  const hand = state.hand;
  const choosing = state.phase === TURN_PHASE.CHOOSE;
  const selected = selectedSlot(state);

  if ($hand.data("dealtTurn") !== state.turnNumber && hand.length > 0) {
    $hand.data("dealtTurn", state.turnNumber);
    replayDeal($hand);
  }

  $hand.attr("data-count", hand.length);
  $hand.attr("data-active", String(choosing));
  setResolved($hand, state.chosenDie !== null);

  $hand.children(".card").each(function updateSlot() {
    const $card = $(this);
    const slot = Number($card.attr("data-slot"));
    const faces = hand[slot];

    if (faces === undefined) {
      updateCard($card, emptySlot());
      return;
    }

    updateCard($card, {
      ...diceCard(faces),
      playable: choosing,
      selected: slot === selected,
      result: slot === selected ? state.roll : null,
    });
  });

  return $hand;
}

/** The two cards nobody kept travel back to the pool, which is what `data-resolved` animates. */
function setResolved($hand, resolved) {
  if (resolved) $hand.attr("data-resolved", "true");
  else $hand.removeAttr("data-resolved");
}
