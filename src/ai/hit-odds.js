/**
 * How likely an opponent is to roll exactly the number they need. Bot tactics plan, phase 1a.
 *
 * Pure `ai/`: two tables computed once at import out of the pool's own composition, and two lookups
 * into them. No randomness, no sampling, no clock. The tables are the same on every machine and in
 * every run, which is what keeps `?seed=42` replaying a match exactly (NFR-09).
 *
 * ## What was here before, and why it was not good enough
 *
 * Until this file, `threat.js` said: a pawn `d` squares behind hits with `1/6` for `d` up to 6,
 * `1/12` up to 12 and `1/20` up to 20. That is the chance of naming one face of the smallest die that
 * reaches, and it quietly assumes the opponent is holding that die.
 *
 * They usually are not, and sometimes they are holding something better. A turn draws **three** cards
 * out of twenty (FR-18), so what a distance is really worth is an average over every hand the pool can
 * deal:
 *
 * - The pool is 2 x D2, 3 x D4, 4 x D6, 4 x D8, 3 x D10, 2 x D12, 2 x D20 (`POOL_COMPOSITION`).
 * - There are C(20, 3) = 1140 hands, all equally likely, because the draw is without replacement and
 *   the pool is stationary (FR-21: all three cards go back at the end of the turn).
 * - An opponent who wants to hit you picks the **smallest** die in the hand that still reaches you,
 *   because a small die names your square more often: a D2 hits a pawn one square ahead half the time,
 *   a D20 one time in twenty.
 *
 * So `P(hit at d)` is the mean over the 1140 hands of `1 / (the smallest reaching die)`, counting a
 * hand with nothing that reaches as zero. The old guess was roughly half the real number at short
 * range, which is why the bot used to walk into captures it should have seen.
 *
 * **Pessimistic on purpose.** It assumes the opponent goes for the capture and gives up whatever else
 * their turn could have done. A bot that is a little too careful loses tempo; a bot that is too brave
 * loses pawns, and a pawn is worth up to 65 points while a lost tempo is worth a handful. The plan
 * records this as a decision rather than an accident.
 *
 * ## Reading the pool is not cheating
 *
 * `card-choice.js` promises that a bot reads only what a person can see. The pool's composition is
 * printed on the pool overview screen (issue #30) and is the same twenty cards all match long, so it
 * is public in the strongest sense: it is in the rulebook. What stays secret is which three cards an
 * opponent is holding **right now**, and nothing here asks.
 */

import { HAND_SIZE, POOL_COMPOSITION, poolCards } from "../core/dice-pool.js";

/** The largest number any card in the pool can roll. Nothing reaches further than this. */
export const MAX_REACH = POOL_COMPOSITION.reduce((most, entry) => Math.max(most, entry.faces), 0);

/**
 * Every hand the pool can deal, as an array of `HAND_SIZE` face counts.
 *
 * All C(20, 3) = 1140 of them, including the ones that differ only by which of two identical D6 cards
 * was drawn. Those duplicates are the point: two D6 in the pool means a hand containing a D6 is twice
 * as likely as the card list alone suggests, and enumerating the cards rather than the denominations
 * gets that weighting for free instead of by a multinomial nobody would check.
 */
function everyHand() {
  const cards = poolCards();
  const hands = [];

  const build = (start, chosen) => {
    if (chosen.length === HAND_SIZE) {
      hands.push(chosen);
      return;
    }

    for (let index = start; index < cards.length; index += 1) {
      build(index + 1, [...chosen, cards[index]]);
    }
  };

  build(0, []);
  return hands;
}

/** The smallest die in `hand` that can roll `distance` at all, or `null`. */
function smallestReaching(hand, distance) {
  let smallest = null;

  for (const faces of hand) {
    if (faces >= distance && (smallest === null || faces < smallest)) smallest = faces;
  }

  return smallest;
}

/**
 * `HIT_ODDS[d]` is the chance that a player one draw away from you rolls exactly `d`.
 *
 * Index 0 is unused and holds 0, so the table is read with the distance itself and there is no
 * off-by-one to get wrong at four call sites.
 */
function buildHitOdds(hands) {
  const table = new Array(MAX_REACH + 1).fill(0);

  for (let distance = 1; distance <= MAX_REACH; distance += 1) {
    let total = 0;

    for (const hand of hands) {
      const faces = smallestReaching(hand, distance);
      if (faces !== null) total += 1 / faces;
    }

    table[distance] = total / hands.length;
  }

  return Object.freeze(table);
}

/**
 * The chance that a player rolls the maximum of the die they picked, which is what leaving the start
 * area takes (FR-09).
 *
 * The same averaging with a different question: a player with a pawn in the yard picks the
 * **smallest** die in the hand, because that is the one whose maximum comes up most often. That is
 * exactly what `chooseDie` does today, so the number is the bot's own behaviour turned into a
 * probability rather than a second opinion about how opponents play.
 */
function buildEntryOdds(hands) {
  const total = hands.reduce((sum, hand) => sum + 1 / Math.min(...hand), 0);

  return total / hands.length;
}

const HANDS = everyHand();

/** The table itself, exported so a test can check its shape rather than its author's arithmetic. */
export const HIT_ODDS = buildHitOdds(HANDS);

/** The chance an opponent with a pawn in the yard gets it out this turn. See `buildEntryOdds`. */
export const ENTRY_ODDS = buildEntryOdds(HANDS);

/**
 * The chance that a pawn `distance` squares behind lands exactly on your square, as a number 0 to 1.
 *
 * Zero for anything that is not a whole number of squares between 1 and `MAX_REACH`, so a caller can
 * hand it the output of a subtraction without checking it first.
 */
export function oddsOfHit(distance) {
  if (!Number.isInteger(distance) || distance < 1 || distance > MAX_REACH) return 0;

  return HIT_ODDS[distance];
}
