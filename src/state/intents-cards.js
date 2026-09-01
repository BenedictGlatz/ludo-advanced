/**
 * The two intents that are about cards rather than about the turn. Issue #38, FR-23 to FR-25.
 *
 * Imports `core/` and `state/`, never `ui/` (NFR-01). `intents.js` falls through to `dispatchCardIntent`
 * for anything its own switch does not recognise, so the view has one `dispatch` to call and does not
 * have to know which of the two files owns which intent.
 *
 * ## Why a second intents file
 *
 * The 300-line limit is the smaller reason. The seven intents in `intents.js` **are** the turn, and a
 * reader who wants to know what a turn does should be able to read that file without walking through the
 * card budget rules. These two are the cards.
 *
 * ## One intent, two very different situations
 *
 * `play-card` covers both an Action card in the action phase and a Reaction card in an open window, and
 * they are told apart by one question: **is a window open?** If one is, this is a reaction, whoever
 * dispatched it. That is not a shortcut. A window is only ever open when somebody is being asked to
 * answer, and an Action card cannot be played into one, so the situation is unambiguous.
 *
 * Keeping them one intent matters for the view: a click on a card in a hand is one gesture, and the
 * player is not choosing which kind of card play they are performing.
 *
 * ## What is checked, and in what order
 *
 * Every check runs before anything is written, so there is no half-played card to undo. The order is
 * chosen so the **most useful** message wins when more than one thing is wrong: whose turn it is, then
 * whether you hold the card, then whether the card fits the moment, then the budget, then the target.
 * Telling a player "that card needs a target" when it was not even their turn would be true and useless.
 */

import { TYPE } from "../core/cards/vocabulary.js";
import { cardById } from "../core/cards/catalogue.js";
import { hasEffect } from "../core/cards/effects/index.js";
import { TURN_PHASE, nextState } from "./game-state.js";
import { REJECTED, accept, reject } from "./rejections.js";
import { openWindow, recordDecline, recordPlay } from "./reaction-window.js";
import { checkPlayable, checkTarget, discardChanges, resolveCard } from "./skill-play.js";
import { canPlayCard, spendCard } from "./skill-turn.js";
import { TRIGGER } from "../core/cards/vocabulary.js";

/** The card intents. `intents.js` holds the seven that are the turn itself. */
export const INTENT_CARD = {
  /** `{ seat, cardId, target }`. Play an Action card, or a Reaction into the open window. */
  PLAY_CARD: "play-card",
  /** `{ seat }`. Pass on the open window (FR-25). */
  DECLINE_REACTION: "decline-reaction",
};

/** The checks both kinds of card play share: do you hold it, and does it have a rule yet? */
function checkHeld(state, seat, cardId) {
  if (!(state.skillHands[seat] ?? []).includes(cardId)) {
    return REJECTED.CARD_NOT_IN_SKILL_HAND;
  }
  if (cardById(cardId) === undefined || !hasEffect(cardId)) {
    return REJECTED.CARD_NOT_PLAYABLE_NOW;
  }

  return null;
}

/**
 * An Action card, played by the active player in the action phase (FR-23).
 *
 * The card leaves the hand and the budget is spent **immediately**, and then one of two things happens:
 *
 * - **Somebody can answer it**, so a window opens and the card waits in `pendingCard`. Its rule runs when
 *   the window shuts, and Nühü can stop it running at all.
 * - **Nobody can answer it**, so its rule runs now.
 *
 * The phase stays `action` either way. A player with a raised budget (Double Dip) may play again, and
 * everybody else presses on through `skip-action`.
 */
function playActionCard(state, intent, deps) {
  const seat = intent.seat ?? state.activePlayer;

  if (state.phase !== TURN_PHASE.ACTION) return reject(state, REJECTED.WRONG_PHASE);
  if (seat !== state.activePlayer) return reject(state, REJECTED.NOT_YOUR_TURN);

  const held = checkHeld(state, seat, intent.cardId);
  if (held !== null) return reject(state, held);

  const card = cardById(intent.cardId);
  if (card.type !== TYPE.ACTION) return reject(state, REJECTED.CARD_NOT_PLAYABLE_NOW);

  const playable = checkPlayable(state, intent.cardId);
  if (playable !== null) return reject(state, playable);
  if (!canPlayCard(state, seat)) return reject(state, REJECTED.CARD_BUDGET_SPENT);

  const badTarget = checkTarget(state, intent.cardId, intent.target, seat);
  if (badTarget !== null) return reject(state, badTarget);

  const entry = { seat, cardId: intent.cardId, target: intent.target ?? {} };
  const spent = nextState(state, {
    ...spendCard(state, seat),
    ...discardChanges(state, seat, intent.cardId),
  });

  const window = openWindow(spent, TRIGGER.ON_CARD, seat);
  if (window !== null) {
    return accept(nextState(spent, { reactionWindow: window, pendingCard: entry }));
  }

  return accept(nextState(spent, resolveCard(spent, entry, deps).changes));
}

/**
 * A Reaction card, played into the open window by a seat that is still eligible (FR-24).
 *
 * The card leaves the hand now and its **rule does not run yet**: it runs when the window shuts, in the
 * order the cards were played. `reaction-window.js` carries the reason, and the short version is that
 * cancellation with nothing to undo is only possible if nothing has happened yet.
 */
function playReactionCard(state, intent) {
  const window = state.reactionWindow;
  const seat = intent.seat;

  if (!window.eligible.includes(seat)) return reject(state, REJECTED.NOT_ELIGIBLE);

  const held = checkHeld(state, seat, intent.cardId);
  if (held !== null) return reject(state, held);

  const card = cardById(intent.cardId);
  if (card.type !== TYPE.REACTION || !card.triggers.includes(window.trigger)) {
    return reject(state, REJECTED.CARD_NOT_PLAYABLE_NOW);
  }

  const playable = checkPlayable(state, intent.cardId);
  if (playable !== null) return reject(state, playable);
  if (!canPlayCard(state, seat)) return reject(state, REJECTED.CARD_BUDGET_SPENT);

  const badTarget = checkTarget(state, intent.cardId, intent.target, seat);
  if (badTarget !== null) return reject(state, badTarget);

  const entry = { seat, cardId: intent.cardId, target: intent.target ?? {} };

  return accept(
    nextState(state, {
      ...spendCard(state, seat),
      ...discardChanges(state, seat, intent.cardId),
      ...recordPlay(state, entry),
    })
  );
}

/**
 * One seat passes on the open window.
 *
 * The seat drops out of `eligible`, which is what lets the window shut early: FR-25's "if everybody
 * declines, play continues at once" needs no timer at all, because the last decline empties the list and
 * the view stops waiting.
 */
function declineReaction(state, intent) {
  if (state.reactionWindow === null) return reject(state, REJECTED.NO_WINDOW);
  if (!state.reactionWindow.eligible.includes(intent.seat)) {
    return reject(state, REJECTED.NOT_ELIGIBLE);
  }

  return accept(nextState(state, recordDecline(state, intent.seat)));
}

/**
 * Apply one card intent, or refuse it and say why.
 *
 * Called by `intents.js` for anything its own switch did not recognise, so an intent that is neither a
 * turn intent nor a card intent lands on the `UNKNOWN_INTENT` here rather than in two places.
 */
export function dispatchCardIntent(state, intent, deps) {
  switch (intent.type) {
    case INTENT_CARD.PLAY_CARD:
      return state.reactionWindow === null
        ? playActionCard(state, intent, deps)
        : playReactionCard(state, intent);
    case INTENT_CARD.DECLINE_REACTION:
      return declineReaction(state, intent);
    default:
      return reject(state, REJECTED.UNKNOWN_INTENT);
  }
}
