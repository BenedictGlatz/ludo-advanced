/**
 * Which card a bot plays, and whether it plays one at all. Issue #82, requirement FR-43.
 *
 * Pure `ai/`: it returns an intent and dispatches nothing, exactly as `bot-policy.js` does.
 *
 * ## The bot does not cheat, and this is the file that has to promise it
 *
 * A bot reads only what a person sitting in front of the screen can see:
 *
 * | It may read | Why |
 * | --- | --- |
 * | The board, the statuses, the traps | Drawn on screen |
 * | Its **own** hand | It is the player holding it |
 * | How many cards everybody else holds | Public since decision D33: the HUD prints the count |
 * | The chosen dice card, the modifiers, `pendingCard`, `pendingMove`, the open window | All on screen |
 *
 * It never reads `state.skillHands[somebodyElse]`. Nothing enforces that at the language level, so
 * `card-choice.test.js` enforces it by experiment: it swaps the opponents' hands for completely
 * different cards and asserts the decision does not change. A test that runs the real decision twice
 * is worth more here than a comment, because the temptation to peek is one line of plausible-looking
 * code inside a value function.
 *
 * ## Three filters, in this order, and the middle one is the interesting one
 *
 * 1. **Legality**, which is `playableCards` in `state/intents-cards.js`. The same function the skill
 *    hand uses to decide what a person may click, so a bot cannot want something a person could not.
 * 2. **The aura.** An offensive card aimed inside somebody else's It's Not That Deep does nothing at
 *    all and is still spent. `nullifiedBy` is asked here, once, rather than in the six offensive
 *    values, because it is the same question for all of them and the target is what it depends on.
 * 3. **The threshold.** `PLAY_AT`, dropping to `PLAY_AT_FULL_HAND` when the hand is full. Below it the
 *    bot passes and keeps the card, which is the difference between a bot playing cards and a bot
 *    emptying its hand.
 *
 * ## Why the target is checked against the real rule before it is dispatched
 *
 * Each value picks its own target, and a value with a bug could build one the rules refuse. A refused
 * intent is much worse for a bot than for a person: `bot-driver.js` stops on a refusal, the loop
 * redraws, and the phase never changes, so a match with three bots in it would sit there for ever. So
 * `checkTarget` is asked here and a bad target makes the card **unplayable** rather than refused. The
 * property that matters is in `bot-match.test.js`: over whole matches with the full pool, no intent a
 * bot produces is ever refused.
 */

import { SKILL_HAND_LIMIT } from "../core/skill-pool.js";
import { INTENT } from "../state/intents.js";
import { INTENT_CARD, playableCards } from "../state/intents-cards.js";
import { checkTarget, nullifiedBy } from "../state/card-legality.js";
import { valueOf } from "./card-values.js";
import { PLAY_AT, PLAY_AT_FULL_HAND, handSize } from "./values-shared.js";

/** How much a card has to be worth for this seat, right now. See `values-shared.js` for both numbers. */
function threshold(state, seat) {
  return handSize(state, seat) >= SKILL_HAND_LIMIT ? PLAY_AT_FULL_HAND : PLAY_AT;
}

/**
 * The card this seat would most like to play, as `{ cardId, value, target }`, or `null`.
 *
 * **Ties go to the card that was drawn first**, because the comparison is a strict `>` and
 * `playableCards` answers in hand order. Nothing about play depends on it and everything about a
 * reproducible bot does: two runs of the same seed have to make the same choice.
 *
 * The `Set` removes duplicates. A hand can hold two copies of one card (the pool has two of each), and
 * pricing the same card twice would cost twice as much and answer the same thing.
 */
function bestPlay(state, seat) {
  const wanted = threshold(state, seat);
  let best = null;

  for (const cardId of new Set(playableCards(state, seat))) {
    const scored = valueOf(state, seat, cardId);
    if (scored === null || scored.value < wanted) continue;

    // The card would be swallowed by an aura and spent for nothing. Priced as "do not play", not as
    // zero, because zero is a real value that a full hand would still play.
    if (nullifiedBy(state, { seat, cardId, target: scored.target }) !== null) continue;

    // A value with a bug in it becomes a card the bot does not play. See the module header.
    if (checkTarget(state, cardId, scored.target, seat) !== null) continue;

    if (best === null || scored.value > best.value) best = { cardId, ...scored };
  }

  return best;
}

/** One card play, as the intent the game dispatches. */
function playIntent(seat, best) {
  return { type: INTENT_CARD.PLAY_CARD, seat, cardId: best.cardId, target: best.target };
}

/**
 * What the active bot does in the action phase: play one card, or carry on (FR-23).
 *
 * Always an intent and never `null`, because the action phase is a phase that has to be left. The loop
 * skips it by itself when the seat holds nothing playable, so by the time this is asked there is at
 * least one card to consider and `skip-action` is the answer that nothing was worth it.
 */
export function chooseAction(state) {
  const seat = state.activePlayer;
  const best = bestPlay(state, seat);

  return best === null ? { type: INTENT.SKIP_ACTION } : playIntent(seat, best);
}

/**
 * What a bot does with an open reaction window: play one card, or decline (FR-24, FR-25).
 *
 * The seat is passed in rather than read off the state, because a window asks somebody who is **not**
 * the active player, and which of several eligible bots is being asked is the driver's question.
 */
export function chooseReaction(state, seat) {
  const best = bestPlay(state, seat);

  return best === null ? { type: INTENT_CARD.DECLINE_REACTION, seat } : playIntent(seat, best);
}
