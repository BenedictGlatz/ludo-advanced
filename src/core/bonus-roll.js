/**
 * When a roll earns another roll. Issue #89, a playtest request.
 *
 * Pure `core/`: numbers in, a boolean out.
 *
 * ## The rule
 *
 * A player whose **natural** roll is the maximum of the chosen die rolls that same die again, **if the
 * die has at least six faces**, and at most `BONUS_ROLL_LIMIT` rolls happen in one turn. No new dice card
 * is drawn or chosen; no second Action card is played.
 *
 * ## Why a floor of six, and why a cap of three
 *
 * Section 3 of the game design document rejected "another turn on the die's maximum" outright, because a
 * D2 rolls its maximum half the time and a player would roll and roll. A playtest asked for the classic
 * Ludo bonus anyway, and the Product Owner took it with a floor: the D2 and the D4 give no bonus, the D6
 * and everything above it does. The D6 is where the classic rule lives, and at 1 in 6 the chance is the
 * one the rule was designed around. The dice cards say which side of the line they are on.
 *
 * The cap is the classic three-sixes rule in a new coat. It exists for a duller reason too: the bot loop
 * and the seeded tests need a turn to end in bounded steps whatever the RNG says, and a fixed RNG that
 * always answers the maximum would otherwise never hand the turn on.
 *
 * ## Why "natural"
 *
 * Cards change the number: Angel Die adds a D8, Speedrun doubles, FR FR names a value outright. A bonus
 * on the modified total would let a card buy a second roll, and FR FR would buy one every time. So the
 * rule reads the die's own face out of `rollSteps`: the `base` step, or the kept value of an
 * `advantage` / `disadvantage` pair, which is still a face the die showed. A `fixed` step is not a roll
 * and earns nothing.
 */

import { ROLL_STEP } from "./roll.js";

/** The smallest die that rolls again on its maximum. Below this, never. */
export const BONUS_ROLL_MIN_FACES = 6;

/** How many rolls one turn may hold, the first one included. */
export const BONUS_ROLL_LIMIT = 3;

/** The step kinds whose value is a face the chosen die actually showed. */
const NATURAL = Object.freeze([ROLL_STEP.BASE, ROLL_STEP.ADVANTAGE, ROLL_STEP.DISADVANTAGE]);

/**
 * The face the chosen die showed, before any card touched the number, or `null` when the number was not
 * rolled at all (FR FR) or nothing has been rolled yet.
 */
export function naturalRoll(rollSteps) {
  const first = rollSteps[0];
  if (first === undefined || !NATURAL.includes(first.step)) return null;

  return first.value;
}

/**
 * Does the roll just made earn another one?
 *
 * `rollsThisTurn` counts the roll just made, so a turn's first roll is asked with `1`.
 */
export function grantsBonusRoll({ dieMax, rollSteps, rollsThisTurn }) {
  if (dieMax === null || dieMax < BONUS_ROLL_MIN_FACES) return false;
  if (rollsThisTurn >= BONUS_ROLL_LIMIT) return false;

  return naturalRoll(rollSteps) === dieMax;
}
