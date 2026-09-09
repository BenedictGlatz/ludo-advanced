/**
 * Which value function is which card, checked at load. Issue #82, requirement FR-43.
 *
 * Pure `ai/`: a lookup table and one question about it. The `ai/` counterpart of
 * `core/cards/effects/index.js`, deliberately built the same way and grouped the same way, so a
 * reader who knows that file knows this one.
 *
 * ## Why it validates itself at import time
 *
 * `core/cards/effects/index.js` may hold **no** entry for a card, and says so: a card with no effect
 * is unplayable and that is a fact rather than an error. This table is the opposite. Every card in the
 * catalogue can be drawn into a bot's hand, so a card with no value here would be a card the bot is
 * asked about and cannot answer, in the middle of a match, once somebody happened to draw it.
 *
 * So a missing entry stops the game at **boot**, naming the card. The pattern is `assertCatalogue`'s
 * and `core/trap-fire.js`'s, and it is here for the same reason both of those are: the 30th card is
 * added by somebody editing the catalogue, and the useful moment to be told about the gap is then.
 *
 * **A value of `null` is a real answer.** Oil Spill and The Purge return it, meaning "never play this",
 * and each says why at its own function. That is not the same thing as a missing entry, which is why
 * the check is on the table's keys and not on what the functions return.
 */

import { cardIds } from "../core/cards/catalogue.js";
import { DEFAULT_PROFILE } from "./profile.js";
import {
  angelDie,
  criticalSuccess,
  doubleDip,
  frFr,
  noTakeBacksies,
  potOfGreed,
  sixtySeven,
  speedrun,
  taxFraud,
} from "./values-roll.js";
import { bigAhRock, builtDifferent, headOut, letHimCook, lockIn, rock } from "./values-pawns.js";
import { ragebait, yeet } from "./values-attacks.js";
import { bananaPeel, hyperbeam, jankyRpg, notThatDeep, oilSpill } from "./values-squares.js";
import {
  criticalFailure,
  devilDie,
  ghostMode,
  holdPawn,
  thePurge,
  unoReverse,
} from "./values-window.js";
import { nuehue } from "./values-nuehue.js";

/** Every card, and what the bot thinks it is worth. Grouped by mechanic, as the effects are. */
export const VALUE_OF = Object.freeze({
  // The roll chain and the card economy.
  "action-critical-success": criticalSuccess,
  "action-angel-die": angelDie,
  "action-speedrun": speedrun,
  "action-sixty-seven": sixtySeven,
  "action-fr-fr": frFr,
  "action-pot-of-greed": potOfGreed,
  "action-double-dip": doubleDip,
  "action-no-take-backsies": noTakeBacksies,
  "action-tax-fraud": taxFraud,

  // Cards aimed at a pawn: your own in `values-pawns.js`, somebody else's in `values-attacks.js`.
  "action-rock": rock,
  "action-lock-in": lockIn,
  "action-built-different": builtDifferent,
  "action-ragebait": ragebait,
  "action-yeet": yeet,
  "action-head-out": headOut,
  "action-let-him-cook": letHimCook,

  // Cards aimed at a square.
  "action-banana-peel": bananaPeel,
  "action-oil-spill": oilSpill,
  "action-not-that-deep": notThatDeep,
  "action-big-ah-rock": bigAhRock,
  "action-hyperbeam": hyperbeam,
  "action-janky-rpg": jankyRpg,

  // Cards played into somebody else's turn.
  "reaction-critical-failure": criticalFailure,
  "reaction-devil-die": devilDie,
  "reaction-hold-pawn": holdPawn,
  "reaction-ghost-mode": ghostMode,
  "reaction-uno-reverse": unoReverse,
  "reaction-nuehue": nuehue,
  "reaction-the-purge": thePurge,
});

/**
 * Runs at import. A 30th card that nobody priced stops the game at boot, naming itself.
 *
 * See the module header for why this is stricter than the effects table's `hasEffect`.
 */
for (const cardId of cardIds()) {
  if (!Object.hasOwn(VALUE_OF, cardId)) {
    throw new Error(
      `card "${cardId}" has no value in src/ai/card-values.js, so no bot can judge it`
    );
  }
}

/**
 * What `seat` thinks playing `cardId` is worth right now, as `{ value, target }`, or `null`.
 *
 * `null` means "do not play this at all", either because the card is one of the two the bot never
 * plays or because there is nothing on the board for it to act on. The caller treats that exactly as
 * it treats a value below the threshold, which is why no card has to return a large negative number
 * to mean "no".
 *
 * Every value takes the same three arguments, `(state, seat, profile)`, whether it reads the profile
 * or not. A table of functions with two different signatures in it is a table that needs a comment at
 * every call site, and the uniform shape is what lets the check above be a check on the **keys**.
 */
export function valueOf(state, seat, cardId, profile = DEFAULT_PROFILE) {
  const value = VALUE_OF[cardId];
  if (value === undefined) {
    throw new Error(`card "${cardId}" has no value in src/ai/card-values.js`);
  }

  return value(state, seat, profile) ?? null;
}
