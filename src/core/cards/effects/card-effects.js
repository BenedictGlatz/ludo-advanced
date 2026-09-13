/**
 * The cards that act on cards rather than on the board. Issue #38, requirement FR-26.
 *
 * Pure `core/`: every function takes a snapshot and returns a patch. See
 * [../context.js](../context.js) for both shapes.
 *
 * ## Why these are together
 *
 * Nothing here moves a pawn or touches a square. They act on the three things the card economy is made
 * of: how many cards you hold, how many you may play, and whether a window opens at all.
 *
 * | Card | What it does |
 * | --- | --- |
 * | Pot of Greed | Draw two more Action cards |
 * | Double Dip | Raise your own card budget for this turn to two |
 * | No Take-Backsies | Shut every remaining reaction window of this turn |
 * | Nühü | The card that opened this window does not happen |
 * | Tax Fraud | Take a card at random out of one opponent's hand |
 *
 * Tax Fraud is an artboard `4a` card, grouped by its mechanic rather than by its artboard.
 *
 * ## Nühü returns an instruction, not a patch
 *
 * `{ negate: true }` is the one thing an effect cannot do to the board, because "the card that opened
 * this window does not happen" is a fact about the **window** and an effect never sees one. So it says
 * so, and `state/reaction-window.js` acts on it. Every card in the reaction window has its effect
 * applied when the window **closes**, in the order the cards were played, which is what makes
 * cancellation possible without anything ever having to be undone.
 */

import { TYPE } from "../vocabulary.js";
import { cardById } from "../catalogue.js";
import { SKILL_HAND_LIMIT, drawSkillCard } from "../../skill-pool.js";
import { handOf } from "../context.js";

/** How many cards Pot of Greed draws. The artwork's number. */
export const POT_OF_GREED_DRAWS = 2;

/** How many cards Double Dip lets its player play in the turn it is played. */
export const DOUBLE_DIP_BUDGET = 2;

/** Is this card id an Action card? Pot of Greed's filter, and the only place the catalogue is read here. */
function isAction(cardId) {
  return cardById(cardId)?.type === TYPE.ACTION;
}

/**
 * Draw two Action cards (Pot of Greed).
 *
 * Drawing twice in a loop rather than once with a count, because `drawSkillCard` is the only place that
 * knows about the hand limit and the reshuffle. A card that drew two by taking two entries off the pool
 * would be a second implementation of both rules.
 *
 * **It is allowed to come back with fewer than two, or none.** A hand at its limit of five, or a pool
 * with no Action card left in it, both give nothing. That is the closed accounting rule doing its job
 * (FR-27): the card is not created out of nowhere just because a card said "draw".
 */
export function potOfGreed(context) {
  let pool = context.pool;
  let discard = context.discard;
  let hand = handOf(context, context.actor);

  for (let drawn = 0; drawn < POT_OF_GREED_DRAWS; drawn += 1) {
    const result = drawSkillCard(pool, discard, hand, context.rng, isAction);
    pool = result.pool;
    discard = result.discard;
    hand = result.hand;
  }

  return { pool, discard, hands: { ...context.hands, [context.actor]: hand } };
}

/**
 * Play a second card this turn (Double Dip).
 *
 * **It has to be net positive to be worth anything**, and it is: playing Double Dip spends one of a
 * budget of one, the budget becomes two, so one is left. Setting the budget to two rather than adding
 * one is the same thing here and stays the same thing if two Double Dips are ever played in one turn,
 * which is the case where "add one" would quietly become "play three cards".
 */
export function doubleDip(context) {
  return { cardBudget: { ...context.cardBudget, [context.actor]: DOUBLE_DIP_BUDGET } };
}

/**
 * No reaction window opens for the rest of this turn (No Take-Backsies).
 *
 * The strongest Action card of the ten, and the one that makes the action phase a real decision: it is
 * the only way to declare a capture that nobody can answer. `reactionsLocked` is a turn-level field, so
 * it is cleared at the handover along with everything else.
 *
 * **It does not close a window that is already open.** A card played into an open window has already
 * been played, and taking it back is what the card's own name says it does not do.
 */
export function noTakeBacksies() {
  return { reactionsLocked: true };
}

/**
 * The card that opened this window does not happen (Nühü).
 *
 * An instruction rather than a patch: see the module note. The card it cancels is chosen by
 * `state/reaction-window.js`, and it is the most recently played card that has not already been
 * cancelled. That rule is there rather than here because only the window knows the order.
 */
export function nuehue() {
  return { negate: true };
}

/**
 * Take one card at random out of an opponent's hand (Tax Fraud).
 *
 * At random rather than chosen, which is the artwork's own wording and also the only version that does
 * not require showing the victim's hand to the thief. In a hot-seat game on one screen, "pick a card
 * from their hand" would mean revealing it, and the whole point of a hand is that it is hidden.
 *
 * Refuses quietly when the victim holds nothing or the thief is full. Both are ordinary: nothing is
 * created and nothing is lost, so the books stay closed (FR-27).
 */
export function taxFraud(context) {
  const victim = context.target.player;
  const theirs = handOf(context, victim);
  const mine = handOf(context, context.actor);

  if (theirs.length === 0 || mine.length >= SKILL_HAND_LIMIT) return {};

  const index = Math.floor(context.rng() * theirs.length);

  return {
    hands: {
      ...context.hands,
      [victim]: theirs.filter((_, at) => at !== index),
      [context.actor]: [...mine, theirs[index]],
    },
  };
}
