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
 * Why this card cannot be played right now, or `null`, **ignoring the target**.
 *
 * The question `ui/` asks to decide whether a card in a hand is clickable, and the question both
 * handlers below ask first. Exported so the view and the rules cannot disagree about it: a card the view
 * offers and the dispatcher refuses is the worst kind of bug in a card game, because the player is told
 * they may do something and then told they may not.
 *
 * **The target is deliberately left out.** A player picks the card and *then* points at something, so a
 * card that needs a pawn has to be clickable before a pawn has been chosen. `checkTarget` is the second
 * half and runs when the play is actually dispatched.
 */
export function cardRefusal(state, seat, cardId) {
  const window = state.reactionWindow;

  // Whether this seat may act at all comes first, exactly as the module header sets out. "That card is
  // not in your hand" is a true and useless thing to tell somebody who was not being asked.
  if (window === null) {
    if (state.phase !== TURN_PHASE.ACTION) return REJECTED.WRONG_PHASE;
    if (seat !== state.activePlayer) return REJECTED.NOT_YOUR_TURN;
  } else if (!window.eligible.includes(seat)) {
    return REJECTED.NOT_ELIGIBLE;
  }

  const held = checkHeld(state, seat, cardId);
  if (held !== null) return held;

  const card = cardById(cardId);
  const wanted = window === null ? TYPE.ACTION : TYPE.REACTION;

  if (card.type !== wanted) return REJECTED.CARD_NOT_PLAYABLE_NOW;
  if (window !== null && !card.triggers.includes(window.trigger)) {
    return REJECTED.CARD_NOT_PLAYABLE_NOW;
  }

  const playable = checkPlayable(state, cardId);
  if (playable !== null) return playable;

  return canPlayCard(state, seat) ? null : REJECTED.CARD_BUDGET_SPENT;
}

/** Every card in one seat's hand that could be played right now. What the skill hand marks clickable. */
export function playableCards(state, seat) {
  return (state.skillHands[seat] ?? []).filter(
    (cardId) => cardRefusal(state, seat, cardId) === null
  );
}

/**
 * Whose skill hand is on screen, and therefore whose card a click plays.
 *
 * In a hot-seat game there is one screen and one skill hand region, so it shows exactly one hand. Normally
 * the active player's, because they need to see what they are holding while they choose a dice card, not
 * only in the moment they can play one. During a reaction window it is the first seat still eligible,
 * because they are the one being asked.
 *
 * **Never `null`.** A hand is always on screen, and whether any card in it is *playable* is a separate
 * question that `playableCards` answers. Conflating the two would blank the hand in every phase but one,
 * which is exactly the bug the end-to-end spec caught.
 *
 * **The window is still one shared thirty-second window** and this does not change that. What it settles
 * is the *input order*: eligible seats are asked in seat order, because two people cannot both be holding
 * the mouse, and four hands on one screen would show every hand to everybody. The countdown covers the
 * whole window rather than restarting per seat.
 */
export function seatOnShow(state) {
  if (state.reactionWindow !== null) {
    return state.reactionWindow.eligible[0] ?? state.activePlayer;
  }

  return state.activePlayer;
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

  const refusal = cardRefusal(state, seat, intent.cardId);
  if (refusal !== null) return reject(state, refusal);

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

  const result = resolveCard(spent, entry, deps);

  // A nullified card is spent and its effect never ran, so the board afterwards looks exactly as it
  // would if the player had done nothing. The field is how the view can say what happened.
  return accept(
    nextState(spent, {
      ...result.changes,
      nullifiedCard: result.nullified ? entry.cardId : null,
    })
  );
}

/**
 * A Reaction card, played into the open window by a seat that is still eligible (FR-24).
 *
 * The card leaves the hand now and its **rule does not run yet**: it runs when the window shuts, in the
 * order the cards were played. `reaction-window.js` carries the reason, and the short version is that
 * cancellation with nothing to undo is only possible if nothing has happened yet.
 */
function playReactionCard(state, intent) {
  const seat = intent.seat;

  const refusal = cardRefusal(state, seat, intent.cardId);
  if (refusal !== null) return reject(state, refusal);

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
