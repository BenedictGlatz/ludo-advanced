/**
 * Why an intent was refused, and the two shapes a dispatch answers with. Issue #38.
 *
 * Imports nothing at all, which is the point. Both `intents.js` and `intents-cards.js` need this list
 * and both need `accept` and `reject`; putting them in either file would make the other import it, and
 * `intents.js` already falls through *into* `intents-cards.js`. That would be a circle.
 *
 * Every value is an i18next key. NFR-03 forbids a user-facing string anywhere in `src/` outside the
 * locale files, and `state/` is a layer that must not know a language: it says *why*, and `ui/` says it
 * in German or English.
 */

/** The reason a dispatch refused, as i18next keys. */
export const REJECTED = {
  MATCH_OVER: "intent.rejected.match-over",
  WRONG_PHASE: "intent.rejected.wrong-phase",
  UNKNOWN_INTENT: "intent.rejected.unknown-intent",
  CARD_NOT_IN_HAND: "intent.rejected.card-not-in-hand",
  NO_MOVE_FOR_PAWN: "intent.rejected.no-move-for-pawn",

  // The card refusals. Every one of them is an ordinary game situation and not an error: a player
  // clicking a card they may not play right now has to be told why, not ignored.
  /** An Action card, played on somebody else's turn (FR-23). */
  NOT_YOUR_TURN: "intent.rejected.not-your-turn",
  /** One card per player per turn, and this player has had theirs (FR-23). */
  CARD_BUDGET_SPENT: "intent.rejected.card-budget-spent",
  /** No Take-Backsies has shut the remaining windows of this turn. */
  REACTIONS_LOCKED: "intent.rejected.reactions-locked",
  /** The card's triggers do not include the moment it was played into. */
  CARD_NOT_PLAYABLE_NOW: "intent.rejected.card-not-playable-now",
  /** The card is not in that player's skill hand. */
  CARD_NOT_IN_SKILL_HAND: "intent.rejected.card-not-in-skill-hand",
  /** The card needs a target and none was named. */
  NEEDS_TARGET: "intent.rejected.needs-target",
  /** A target was named and it is not one the card can act on. */
  BAD_TARGET: "intent.rejected.bad-target",
  /** A reaction was played or declined with no window open. */
  NO_WINDOW: "intent.rejected.no-window",
  /** A seat that is not in the open window's `eligible` list tried to act in it. */
  NOT_ELIGIBLE: "intent.rejected.not-eligible",
};

/** A refusal: the state object it was given, unchanged and identical, plus the reason. */
export function reject(state, reason) {
  return { state, accepted: false, reason };
}

/** An acceptance: the new state. */
export function accept(state) {
  return { state, accepted: true, reason: null };
}
