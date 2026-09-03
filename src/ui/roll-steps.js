/**
 * How a roll that cards changed explains itself. Design spec 11, D73. NFR-08.
 *
 * `ui/` only, and vocabulary rather than logic, like `dice-card.js` and `overlay-vocabulary.js`: it maps
 * the nine values of `core/roll.js`'s `ROLL_STEP` to the nine locale keys under `roll.step` and holds no
 * rule about any of them.
 *
 * ## What this closes, and why it was open for two sprints
 *
 * `state.rollSteps` has recorded the whole chain since the trap epic, nine kinds of step, and the
 * sentences for it were written in both languages at the same time. **No file under `src/ui/` read
 * either of them.** `turn-manager.js` says the trace exists "so the screen can explain a number that
 * three cards had a hand in (NFR-08)", and until this file the screen did not. A turn with Critical
 * Success, an Angel Die and a Speedrun Any% in it ended with a 44 on a D20 card and no account of where
 * 44 came from, which is half of a `must have` requirement met.
 *
 * ## Two or more, never one
 *
 * `rollBreakdown` returns `null` for a chain of one, and that is D73.3 rather than an optimisation. One
 * step is `base`, which is almost every roll, and "D8: 5" printed beside a badge that reads 5 teaches the
 * player to stop reading the strip. **The strip speaking is therefore itself the signal** that cards
 * changed the roll, and its silence is information too.
 *
 * ## The value in each sentence is the step's own, not a running total
 *
 * `roll.js` stores what each step contributed and not the total after it, except for `multiplier` and
 * `missed`, where the step *is* the whole result. So "Plus a D8: 5" means an extra D8 rolled a 5, not
 * that the roll now stands at 5. The existing sentences were written that way and are consistent; it is
 * worth stating because the spec's illustration shows running totals and a reader could take that for
 * the contract.
 */

import { ROLL_STEP } from "../core/roll.js";
import { t } from "../i18n/index.js";

/**
 * The interpolation each kind of step needs, keyed by the step name.
 *
 * A table rather than a `switch`, because the answer for every one of the nine is the same shape: take
 * the fields the rules recorded and hand them to i18next. The step objects are not uniform (`base` has
 * `faces`, `multiplier` has `factor`, `missed` has `needed` and `rolled`), so the whole object is spread
 * and i18next uses what its sentence names and ignores the rest.
 */
function sentence(step) {
  return t(`roll.step.${step.step}`, { ...step });
}

/**
 * The chain as a list of `{ kind, text }`, or `null` when there is nothing to explain.
 *
 * `kind` is the raw step name. It goes into the DOM as `data-roll-step` and **no stylesheet reads it**,
 * which is D51's precedent applied again: the kind is already in the sentence, so putting it in the DOM
 * as well costs nothing and means a later decision has a hook to hang off. All nine kinds look identical
 * today, including `missed` and `floor`, the two that take a roll away. D73.6 rejects colouring those
 * two: every hue in the game already means something, and a ninth meaning is worse than nine sentences
 * that look alike.
 */
export function rollBreakdown(state) {
  const steps = state.rollSteps;
  if (steps.length < 2) return null;

  return steps.map((step) => ({ kind: step.step, text: sentence(step) }));
}

/**
 * Every step name, so a test can assert that all nine have a sentence in every language.
 *
 * Exported for that one reason. `ROLL_STEP.MISSED` shipped for two sprints with **no key in either
 * language**, and it was found by reading the file rather than by anything failing, because a missing
 * key makes i18next print the key itself and nothing throws. A list plus a test is what turns the next
 * one into a red test.
 */
export const ROLL_STEP_NAMES = Object.freeze(Object.values(ROLL_STEP));
