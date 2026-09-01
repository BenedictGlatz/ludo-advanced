/**
 * Which function is which card. Issue #38, requirement FR-26.
 *
 * Pure `core/`: a lookup table and two questions about it.
 *
 * ## This table is the FR-26 contract
 *
 * FR-26 says a card's rule and its artwork are matched **by card id**, with neither importing the
 * other. This file is the join. `catalogue-core.js` and `catalogue-extra.js` say what a card is;
 * `ui/card-view.js` says what it looks like; the functions below say what it does. None of the three
 * imports either of the others.
 *
 * The practical payoff is that a card can exist in one of those three places and not the others. The
 * catalogue held 29 entries with no effects at all for two commits, and the view rendered them.
 *
 * ## A card with no effect is unplayable, and that is deliberate
 *
 * `hasEffect` is the question `state/` asks before it lets a card be played, and `ui/` asks before it
 * marks one clickable. A card in the pool with no entry here can be drawn and held and looked at, and
 * refused when played. That is what let the 29-card catalogue ship before the effects did, and it is why
 * the table is a lookup rather than a `switch` with a default: a missing entry is a fact, not an error.
 */

import {
  angelDie,
  criticalFailure,
  criticalSuccess,
  devilDie,
  frFr,
  speedrun,
} from "./roll-effects.js";
import { doubleDip, noTakeBacksies, nuehue, potOfGreed, taxFraud } from "./card-effects.js";
import { builtDifferent, holdPawn, lockIn, ragebait, rock, thePurge } from "./status-effects.js";

/**
 * Every card that has a rule, grouped the way the files are: by mechanic, not by artboard.
 *
 * Grouping by mechanic is what keeps each effects file readable and each of them under 300 lines. It
 * also means Speedrun Any% and Tax Fraud sit with cards from the other artboard, which is right: the
 * artboard a card was drawn on is a delivery fact and not a taxonomy.
 */
export const EFFECTS = Object.freeze({
  // The roll chain (`core/roll.js`).
  "action-critical-success": criticalSuccess,
  "action-angel-die": angelDie,
  "action-speedrun": speedrun,
  "action-fr-fr": frFr,
  "reaction-critical-failure": criticalFailure,
  "reaction-devil-die": devilDie,

  // The card economy.
  "action-pot-of-greed": potOfGreed,
  "action-double-dip": doubleDip,
  "action-no-take-backsies": noTakeBacksies,
  "action-tax-fraud": taxFraud,
  "reaction-nuehue": nuehue,

  // Statuses on pawns (`core/statuses.js`).
  "action-rock": rock,
  "action-lock-in": lockIn,
  "action-built-different": builtDifferent,
  "action-ragebait": ragebait,
  "reaction-hold-pawn": holdPawn,
  "reaction-the-purge": thePurge,
});

/** Does this card have a rule yet? What `state/` and `ui/` both ask before offering it. */
export function hasEffect(cardId) {
  return Object.hasOwn(EFFECTS, cardId);
}

/**
 * The rule for one card.
 *
 * Throws rather than returning `undefined`, because every caller has already asked `hasEffect`. Reaching
 * this means something skipped that check, which is a bug in `state/` and not a card the player picked.
 */
export function effectFor(cardId) {
  if (!hasEffect(cardId)) {
    throw new Error(`card "${cardId}" has no effect, so it cannot be played`);
  }

  return EFFECTS[cardId];
}
