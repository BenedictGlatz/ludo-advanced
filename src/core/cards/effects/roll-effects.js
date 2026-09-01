/**
 * The five cards that change the number on the die. Issue #38, requirement FR-26.
 *
 * Pure `core/`: every function takes a snapshot and returns a patch. See
 * [../context.js](../context.js) for both shapes.
 *
 * ## Why these five are together
 *
 * They are the cards whose whole effect is one entry in `state.modifiers`, which `core/roll.js` then
 * applies in its documented order. Not one of them touches a pawn, a square or a hand. That makes them
 * the cheapest five effects in the project and the ones that most needed the roll to stop being a
 * single number first.
 *
 * | Card | Type | Played into | What it writes |
 * | --- | --- | --- | --- |
 * | Critical Success | Action | The action phase | `advantage` |
 * | Angel Die | Action | The action phase | `addDice: [8]` |
 * | Speedrun Any% | Action | The action phase | `multiplier: 2` |
 * | Critical Failure | Reaction | The roll | `disadvantage` |
 * | Devil Die | Reaction | The roll | `subDice: [8]` |
 *
 * Speedrun is an artboard `4a` card and it is here rather than with the other eighteen, because
 * grouping by mechanic is what makes these files readable and its mechanic is this one. The artboard a
 * card was drawn on is a delivery fact, not a taxonomy.
 *
 * ## The one thing worth arguing about: whose roll a Reaction changes
 *
 * Critical Failure and Devil Die are played by an **opponent**, into the window the roll opens, and they
 * change the **active player's** roll. `context.actor` is the opponent and `context.activePlayer` is the
 * victim, and the effect touches neither: `modifiers` belongs to the turn, and a turn has one roll in
 * it. That is why the two debuffs are written identically to the two buffs.
 */

import { withModifier } from "../../roll.js";

/** The extra die Angel Die and Devil Die roll. The artwork's number, transcribed rather than tuned. */
export const BONUS_DIE_FACES = 8;

/** How much Speedrun Any% multiplies the finished roll by. */
export const SPEEDRUN_FACTOR = 2;

/** Roll twice, keep the higher (Critical Success). */
export function criticalSuccess(context) {
  return { modifiers: withModifier(context.modifiers, { advantage: true }) };
}

/** Roll twice, keep the lower (Critical Failure). */
export function criticalFailure(context) {
  return { modifiers: withModifier(context.modifiers, { disadvantage: true }) };
}

/** Add a D8 to the roll (Angel Die). */
export function angelDie(context) {
  return { modifiers: withModifier(context.modifiers, { addDice: [BONUS_DIE_FACES] }) };
}

/** Subtract a D8 from the roll (Devil Die). Can take it to zero, and `core/roll.js` floors it there. */
export function devilDie(context) {
  return { modifiers: withModifier(context.modifiers, { subDice: [BONUS_DIE_FACES] }) };
}

/**
 * Double the finished roll (Speedrun Any%).
 *
 * The artwork calls this `RISKY`, and the risk is FR-13: a doubled roll overshoots the house far more
 * often, and an overshoot is not a shorter move but no move at all. Nothing has to implement that. It
 * falls out of the rule that was already there, which is the best kind of card.
 */
export function speedrun(context) {
  return { modifiers: withModifier(context.modifiers, { multiplier: SPEEDRUN_FACTOR }) };
}

/**
 * Name the roll instead of rolling it (FR FR).
 *
 * `core/roll.js` holds the named number to the chosen card's range, so a D4 cannot be told to produce a
 * 19. That clamp lives there rather than here because it is a property of the die, and a card that
 * repeated it would be a second place to change when the pool composition does.
 */
export function frFr(context) {
  return { modifiers: withModifier(context.modifiers, { fixed: context.target.number }) };
}
