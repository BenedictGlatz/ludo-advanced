/**
 * The skill card pool, the hands and the discard pile. Issue #38, requirements FR-22 and FR-27.
 *
 * Pure `core/`: no DOM, no state object, injected randomness (NFR-09).
 *
 * ## Why this is written completely differently from the dice pool
 *
 * `core/dice-pool.js` is an object holding its own remaining cards in a closure. This module is a set
 * of pure functions over arrays that live in the game state. The two are deliberately not the same
 * shape, and the reason is the lifetime of what they hold.
 *
 * A dice hand exists for one turn. All three cards go back at the end of it (FR-21), there is no
 * discard pile, and nothing about it survives into the next turn, so nobody outside that turn ever
 * needs to look at it. Hiding it in a closure is free.
 *
 * A skill card, once drawn, sits in a player's hand for as long as they keep it. The pool, four hands
 * and the discard pile are all things the view has to show, all things a saved match would have to
 * write down, and all things a replay has to reproduce exactly. That makes them state, and state in
 * this project lives in one frozen object in `state/`, not in a closure only one module can see.
 *
 * ## The closed accounting rule (FR-27)
 *
 * Every one of the 58 cards is in exactly one of pool, a hand, or the discard pile, at every moment.
 * That is the invariant the whole module exists to keep, and `totalCards` is the function a test uses
 * to check it. A card that quietly disappears is the most likely silent bug in a system like this: it
 * throws nothing, breaks nothing immediately, and makes the pool slowly emptier over a long match.
 *
 * ## What is in the pool: ids, not cards
 *
 * The pool holds card **ids**, not card objects. Two copies of Angel Die are indistinguishable to the
 * rules, so storing two references to the same frozen object would be storing the same string twice
 * with extra steps. It also keeps the state small and JSON-shaped, which matters the day the match has
 * to be written down.
 */

import { COPIES_PER_CARD } from "./cards/vocabulary.js";
import { cardIds } from "./cards/catalogue.js";

/**
 * The most cards one player may hold.
 *
 * **This is an assumption, not a decision that has been playtested.** The game design document says 3.
 * It was written for a game that drew cards far more rarely: with a draw at the start of every turn
 * plus the skill squares, a limit of 3 means a player is at the limit almost always and the extra draws
 * do nothing. 5 is a guess at "enough room that a draw is usually worth something".
 *
 * It is one constant, and changing it after the first playtest is a one-line change. Recorded as open
 * in the plan and in section 4.2 of design handoff 03.
 */
export const SKILL_HAND_LIMIT = 5;

/**
 * A shuffled pool of all 58 cards.
 *
 * Fisher-Yates with the injected `rng`, in place on a fresh array. No `Math.random` anywhere: NFR-09
 * requires that `?seed=42` replays a match card for card, and a shuffle is exactly where that breaks
 * if the randomness is not injected.
 */
export function createSkillPool(rng) {
  const pool = cardIds().flatMap((id) => Array.from({ length: COPIES_PER_CARD }, () => id));

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    [pool[index], pool[swap]] = [pool[swap], pool[index]];
  }

  return pool;
}

/**
 * Draw one card for one hand.
 *
 * Returns a new pool, discard and hand, plus the id drawn, or `null` for `drawn` when nothing was.
 * Nothing is mutated: the caller writes the result into the next state.
 *
 * Two refusals, and they are refusals rather than errors because both are ordinary game situations:
 *
 * - **The hand is full.** The card stays in the pool. Rejected alternative: draw it and put it
 *   straight into the discard pile, which is what some card games do. It burns a card for nothing and
 *   makes the pool measurably thinner over a match, for no gain a player would notice.
 * - **The pool and the discard pile are both empty.** Only reachable if every card is in a hand, which
 *   needs 58 cards across four hands of 5. It cannot happen, and it is handled rather than assumed,
 *   because "cannot happen" arguments are how closed accounting quietly stops being closed.
 *
 * **`isWanted` narrows what may be drawn**, and exactly one card needs it: Pot of Greed draws two
 * **Action** cards. Written as a predicate over the card id rather than as a card type, so this module
 * never has to import the catalogue and stays a set of functions over arrays of strings. When nothing
 * in the pool is wanted the draw comes back empty, the same as a full hand, which is right: a card that
 * asks for something the pool has run out of gets nothing rather than getting a substitute.
 */
export function drawSkillCard(pool, discard, hand, rng, isWanted = () => true) {
  if (hand.length >= SKILL_HAND_LIMIT) {
    return { pool, discard, hand, drawn: null };
  }

  const [source, spent] = pool.length > 0 ? [pool, discard] : [reshuffle(discard, rng), []];

  // The eligible positions, not the eligible cards: the index is what the removal below needs.
  const wanted = source.map((id, at) => ({ id, at })).filter((entry) => isWanted(entry.id));
  if (wanted.length === 0) {
    return { pool: source, discard: spent, hand, drawn: null };
  }

  const { id: drawn, at } = wanted[Math.floor(rng() * wanted.length)];

  return {
    pool: source.filter((_, index) => index !== at),
    discard: spent,
    hand: [...hand, drawn],
    drawn,
  };
}

/**
 * The discard pile becomes the new pool.
 *
 * A copy rather than the same array, so that the caller's discard pile is untouched and the state
 * before the reshuffle stays valid. The shuffle itself is not needed for correctness, because
 * `drawSkillCard` picks a random index rather than taking the top card, but it is done anyway: a pool
 * that is a known order is a pool somebody can count, and a played card should not come back in a
 * predictable position.
 */
function reshuffle(discard, rng) {
  const pool = [...discard];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    [pool[index], pool[swap]] = [pool[swap], pool[index]];
  }

  return pool;
}

/**
 * A card leaves a hand and goes to the discard pile.
 *
 * Removes **one** copy, by the first match. A hand holding two Angel Die entries loses one of them,
 * which is right: the two copies are the same card as far as every rule is concerned.
 *
 * Throws when the card is not in the hand. That is not a game situation a player can reach, because
 * `state/` refuses the intent first with `card-not-in-hand`; reaching it means something inside the
 * rules layer played a card nobody was holding.
 */
export function discardCard(hand, discard, cardId) {
  const index = hand.indexOf(cardId);

  if (index === -1) {
    throw new Error(`card "${cardId}" is not in that hand, so it cannot be played`);
  }

  return {
    hand: hand.filter((_, at) => at !== index),
    discard: [...discard, cardId],
  };
}

/**
 * How many cards exist across pool, every hand and the discard pile.
 *
 * The one function here that no rule calls. It exists for FR-27's acceptance criterion, which is a
 * property of the whole system rather than of any single step, and a property is only worth stating if
 * something checks it. The test plays hundreds of draws and discards and asserts this stays at 58.
 */
export function totalCards({ pool, discard, hands }) {
  const inHands = Object.values(hands).reduce((sum, hand) => sum + hand.length, 0);

  return pool.length + discard.length + inHands;
}
