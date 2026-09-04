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
 * **What a card says moved out of this file with issue #30's pool overview.** `dice-card.js` owns the
 * description now, because the overview shows the same seven cards for a reason that has nothing to do
 * with a hand, and this file should not be the place a second screen has to import from.
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
 *
 * ## The throw, and the one line of it that looks like a mistake
 *
 * `data-rolling` is the second attribute of that shape, from design spec 11's D71. It goes on when a roll
 * first appears and `turn-waits.js` takes it off when the hold expires.
 *
 * **The number is written into the badge at the start of the throw and not at the end**, which reads
 * backwards and is the whole of D72. The badge is hidden by `card-state.css`'s `:empty { display: none }`,
 * and an element with `display: none` has no start state to animate from, so every route that waited for
 * the end of the roll to fill it needed that rule changed. Filling it at the start needs nothing changed:
 * the badge is in the layout for the whole throw holding the result, and `roll.css`'s keyframe uses a
 * `backwards` fill to keep it at zero opacity until the card comes to rest.
 *
 * That is why nothing below writes the number specially. `updateCard` already gets `state.roll` the
 * moment the rules produce it, and this file only had to set the attribute in the same pass. Both follow
 * from one fact, so they cannot get out of step.
 *
 * It costs one thing, named rather than hidden: the result is readable in the DOM about 520 ms before it
 * is readable on screen. D72.1 argues that is right rather than merely acceptable, because a player who
 * cannot see the card shake should not be made to wait out a shake they cannot see.
 */

import $ from "jquery";

import { TURN_PHASE } from "../state/game-state.js";
import { createCard, updateCard } from "./card-view.js";
import { diceCardDescription } from "./dice-card.js";

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
 * Restart the throw. `data-rolling` is `data-dealing`'s twin, so the same trick works unchanged.
 *
 * Design spec 11 asked for the attribute on the **row** and not on the one card, and D71.6 gives the
 * reason: the restart above already exists for a row attribute, and the stylesheet can scope down to
 * `.card[data-selected="true"]` by itself. An attribute on the card would have needed a second copy of
 * this function against an element that is rewritten rather than kept.
 */
function replayRoll($hand) {
  $hand.removeAttr("data-rolling");
  void $hand[0].offsetWidth;
  $hand.attr("data-rolling", "true");
}

/**
 * The throw is over and the turn may carry on. Called by `turn-waits.js` when the hold expires.
 *
 * It has to happen **before the next turn deals**, or `data-rolling` would still be set when
 * `data-dealing` goes on and the throw would restart on a card that is arriving. `hand.css` and
 * `roll.css` would both be animating the same element for different reasons.
 */
export function endRoll($hand) {
  $hand.removeAttr("data-rolling");
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

  // The throw, gated on the turn exactly like the deal above it, so the pass that first sees a roll
  // starts it and the twenty passes after that leave it alone. See the note at the top of the file.
  if ($hand.data("rolledTurn") !== state.turnNumber && state.roll !== null) {
    $hand.data("rolledTurn", state.turnNumber);
    replayRoll($hand);
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
      ...diceCardDescription(faces),
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
