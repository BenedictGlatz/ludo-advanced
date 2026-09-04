/**
 * What the cards that change the roll and the card economy are worth. Issue #82, FR-43.
 *
 * Pure `ai/`. Every function here has the signature every value in this project has:
 *
 * ```js
 * (state, seat) => { value, target } | null
 * ```
 *
 * `null` means "never play this", `value` is in the units of `SCORE` (see
 * [values-shared.js](values-shared.js)), and `target` is whatever `checkTarget` in
 * `state/card-legality.js` will be asked to approve. **Each value picks its own best target**, because
 * only the value knows what makes one good, and `card-choice.js` then checks the answer against the
 * real rule rather than trusting it.
 *
 * ## The five roll cards price themselves by asking the card
 *
 * Critical Success, Angel Die, Speedrun Any%, 67 and FR FR all do exactly one thing: write an entry
 * into `state.modifiers`. So each is priced as `E[turn with it] - E[turn without it]`, where both
 * halves come from `expectedMoveScore` and the "with" half is produced by running the card's **real**
 * effect. There is no copy of a card's arithmetic in this file, which matters most for the two whose
 * arithmetic is not obvious: 67's threshold sits before Speedrun's multiplier, and FR FR's named
 * number is clamped to the die.
 *
 * That difference is already the whole decision. On a D2 with every pawn in the yard, Angel Die takes
 * the chance of getting one out from 1 in 2 to about 1 in 5, so it is **negative** and the bot keeps
 * it; on a D20 with a pawn eight from home it is worth several steps and gets played.
 *
 * ## The four economy cards are priced in cards, not in steps
 *
 * A card in hand is `CARD_WORTH` (3). Pot of Greed draws two, Tax Fraud moves one across the table,
 * Double Dip buys a slot in the turn rather than a card, and No Take-Backsies buys the turn itself
 * being unanswerable. The last two are the only values in the project that are not a difference of two
 * board evaluations, and both are argued at their own function.
 */

import { POT_OF_GREED_DRAWS } from "../core/cards/effects/card-effects.js";
import { TYPE } from "../core/cards/vocabulary.js";
import { cardById } from "../core/cards/catalogue.js";
import { hasEffect } from "../core/cards/effects/index.js";
import { SKILL_HAND_LIMIT } from "../core/skill-pool.js";
import {
  CARD_WORTH,
  handSize,
  hasDie,
  modifiersAfter,
  opponents,
  rollChange,
  share,
  turnValue,
} from "./values-shared.js";

/** No target, and the value is what the card does to this turn's roll. Four of the five are this. */
function rollBuff(cardId) {
  return (state) => (hasDie(state) ? { value: rollChange(state, cardId), target: {} } : null);
}

export const criticalSuccess = rollBuff("action-critical-success");
export const angelDie = rollBuff("action-angel-die");
export const speedrun = rollBuff("action-speedrun");
export const sixtySeven = rollBuff("action-sixty-seven");

/**
 * Name the roll instead of rolling it (FR FR).
 *
 * The one roll card with a target, so it is the one that has to search: every number the die can
 * produce is tried, the best is kept, and the value is how much better that certainty is than the
 * average roll it replaces. A named number is a distribution with one entry in it, so "the best
 * single roll" and "the expected value of naming it" are the same number.
 *
 * Ties go to the **smaller** number, because the loop keeps the first strict improvement. That matches
 * `chooseDie`'s tie-break and its reason: a smaller number overshoots the house less often (FR-13).
 */
export function frFr(state) {
  if (!hasDie(state)) return null;

  const before = turnValue(state);
  let best = null;

  for (let number = 1; number <= state.chosenDie; number += 1) {
    const value = turnValue(state, modifiersAfter(state, "action-fr-fr", { number }));
    if (best === null || value > best.value) best = { value, number };
  }

  return best === null ? null : { value: best.value - before, target: { number: best.number } };
}

/**
 * Draw two Action cards (Pot of Greed).
 *
 * Priced by how many of the two draws the hand still has room for. The card itself has left the hand
 * by the time its rule runs, so a full hand of five has room for exactly one, and a hand of three has
 * room for both.
 *
 * It does not check whether the pool still holds an Action card. `drawSkillCard` reshuffles the
 * discard pile when the pool runs low, so the case where this comes back with nothing needs 58 cards
 * to be in hands and traps at once, and pricing it would cost a walk of the pool on every turn.
 */
export function potOfGreed(state, seat) {
  const room = Math.min(POT_OF_GREED_DRAWS, SKILL_HAND_LIMIT - handSize(state, seat) + 1);

  return { value: CARD_WORTH * Math.max(0, room), target: {} };
}

/**
 * Play a second card this turn (Double Dip).
 *
 * **Worth 1, which is a hand slot and not a second card**, and that number is a finding rather than a
 * choice. `spendCard` counts Double Dip itself against the budget of one and the card then sets the
 * budget to two, so the net effect is one further card: exactly what the seat could have played
 * anyway. `card-effects.js` claims it is "net positive"; it is net zero, and it is recorded in
 * `notes/01` as an open rule question for the Product Owner rather than fixed here.
 *
 * So the bot treats it as "make room in a full hand" and plays it only when `PLAY_AT_FULL_HAND` is in
 * force, and only if there is something to play with the slot it buys.
 *
 * **It asks whether another Action card is held, not what that card is worth.** The plan said worth;
 * that needs the whole value table, which is this file's own importer, and an import cycle for one
 * card's tie-break is a bad trade. `card-choice.js` never plays a card that scores below the
 * threshold, so the worthless case is already covered one layer up.
 */
export function doubleDip(state, seat) {
  const others = (state.skillHands[seat] ?? []).filter(
    (cardId) =>
      cardId !== "action-double-dip" && cardById(cardId)?.type === TYPE.ACTION && hasEffect(cardId)
  );

  return { value: others.length > 0 ? 1 : 0, target: {} };
}

/** How much of a turn's worth No Take-Backsies protects. A guess: see the function below. */
const LOCKOUT_SHARE = 0.15;

/**
 * Shut every remaining reaction window of this turn (No Take-Backsies).
 *
 * The hardest card in the set to price, because what it buys is the **absence** of something: nobody
 * can answer this turn's roll or its capture. The bot cannot know what they hold (see
 * `card-choice.js`), so it prices the risk instead: a fixed fraction of what the turn is worth,
 * charged only when at least one opponent is holding any card at all.
 *
 * `LOCKOUT_SHARE` is 0.15, which is a guess with an argument: of the 29 cards, four can be played into
 * an `on-roll` or `on-capture` window, so a hand of a few cards answers a turn perhaps one time in
 * six, and not every answer costs the whole turn. On a big roll with a capture in it, 15 % of 60-odd
 * points clears `PLAY_AT` comfortably; on a wasted turn it does not, which is the behaviour wanted.
 *
 * The count is public information (D33), so reading it is not cheating.
 */
export function noTakeBacksies(state, seat) {
  const armed = opponents(state, seat).some((other) => handSize(state, other) > 0);

  return { value: armed ? LOCKOUT_SHARE * turnValue(state) : 0, target: {} };
}

/**
 * Take one card at random out of an opponent's hand (Tax Fraud).
 *
 * Worth a card to me plus a share of a card off them, so `CARD_WORTH * (1 + share)`: in a duel that is
 * 6 and in a four-player match 4, which is the `share` rule doing exactly what it is for.
 *
 * The victim is whoever holds the most cards, ties to the lowest seat, so the choice is repeatable.
 * An opponent holding nothing is not a target at all: the effect refuses quietly, and a card spent for
 * a quiet refusal is the worst play on the board.
 */
export function taxFraud(state, seat) {
  let victim = null;

  for (const other of opponents(state, seat)) {
    const cards = handSize(state, other);
    if (cards > 0 && (victim === null || cards > victim.cards)) victim = { player: other, cards };
  }

  if (victim === null) return null;

  return { value: CARD_WORTH * (1 + share(state)), target: { player: victim.player } };
}
