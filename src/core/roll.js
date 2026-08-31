/**
 * The roll as a chain rather than a single number. Issue #38, requirement FR-20.
 *
 * Pure `core/`: no DOM, no state object, injected randomness (NFR-09).
 *
 * ## Why the roll stopped being one line
 *
 * Until now a roll was `rollDie(state.chosenDie, deps.rng)`, one call, one number. Four of the ten
 * cards of artboard `6a` change that number, and they change it in ways that do not commute:
 *
 * - **Critical Success** rolls twice and keeps the higher, **Critical Failure** the lower.
 * - **Angel Die** adds a D8, **Devil Die** subtracts one.
 * - **Speedrun Any%** doubles the result.
 * - **FR FR** replaces the roll with a number the player names.
 *
 * Doubling and then adding a D8 is not the same as adding and then doubling, so the order has to be
 * written down once and obeyed everywhere. It is written down here:
 *
 * | Order | Step | Cards |
 * | --- | --- | --- |
 * | 1 | A named number replaces the roll entirely | FR FR |
 * | 2 | Roll once, or twice and keep the higher or lower | Critical Success, Critical Failure |
 * | 3 | Add every extra die, then subtract every penalty die | Angel Die, Devil Die |
 * | 4 | Multiply | Speedrun Any% |
 * | 5 | Never below zero | all of them |
 *
 * **Advantage and disadvantage cancel.** Both played means one plain roll, not two rolls with an
 * arbitrary winner. That is the only resolution that does not need a rule about which card was played
 * first, and "the two effects undo each other" is what a player would guess.
 *
 * ## Two consequences for the rest of the rules
 *
 * A modified roll can be **larger than the die's maximum** and it can be **zero**. Both were
 * impossible before, and both had to be allowed for in `movement.js`:
 *
 * - Leaving the start area changed from `roll === dieMax` to `roll >= dieMax` (FR-09). With the old
 *   wording, a buff would have made leaving the yard *impossible*, which is the opposite of a buff.
 * - A roll of zero moves nothing, and says so with its own refusal reason.
 *
 * ## Why `steps` is returned as well as `roll`
 *
 * NFR-08 wants the screen able to explain itself. "You rolled 11" after three cards were played is
 * not an explanation; "6, plus a D8 for 5" is. The trace is data, so `ui/` can render it and `core/`
 * never learns a language.
 */

import { rollDie } from "./dice-source.js";

/** The names a step of the chain can carry. `ui/` matches these to locale keys. */
export const ROLL_STEP = Object.freeze({
  /** One ordinary roll of the chosen dice card. */
  BASE: "base",
  /** The roll was named rather than rolled (FR FR). */
  FIXED: "fixed",
  /** Two rolls, the higher kept (Critical Success). */
  ADVANTAGE: "advantage",
  /** Two rolls, the lower kept (Critical Failure). */
  DISADVANTAGE: "disadvantage",
  /** An extra die added (Angel Die). */
  ADD_DIE: "add-die",
  /** A die subtracted (Devil Die). */
  SUB_DIE: "sub-die",
  /** The whole result multiplied (Speedrun Any%). */
  MULTIPLIER: "multiplier",
  /** The result would have gone below zero and was held there. */
  FLOOR: "floor",
});

/**
 * The modifiers a turn starts with: none of them.
 *
 * A function and not a constant, for the same reason `clearedTurnFields` is one: two turns must never
 * share the same `addDice` array. Harmless while both stay empty, and a very confusing bug otherwise.
 */
export function createModifiers() {
  return {
    fixed: null,
    advantage: false,
    disadvantage: false,
    addDice: [],
    subDice: [],
    multiplier: 1,
  };
}

/**
 * One modifier added to a set, returning a new set.
 *
 * The array-valued fields **append** and the scalar fields **overwrite**, which is the difference
 * between "two Angel Dice add two D8s" and "two Speedruns do not square the roll". Both are the
 * behaviour the cards describe.
 */
export function withModifier(modifiers, change) {
  return {
    ...modifiers,
    ...change,
    addDice: [...modifiers.addDice, ...(change.addDice ?? [])],
    subDice: [...modifiers.subDice, ...(change.subDice ?? [])],
  };
}

/** Step 1 and step 2 of the chain: where the number comes from before anything is added to it. */
function baseValue(dieMax, modifiers, rng, steps) {
  if (modifiers.fixed !== null) {
    const value = Math.max(0, Math.min(Math.trunc(modifiers.fixed), dieMax));
    steps.push({ step: ROLL_STEP.FIXED, value });
    return value;
  }

  const first = rollDie(dieMax, rng);

  // Exclusive or: both played cancel out, so only one extra roll is ever spent.
  if (modifiers.advantage === modifiers.disadvantage) {
    steps.push({ step: ROLL_STEP.BASE, value: first, faces: dieMax });
    return first;
  }

  const second = rollDie(dieMax, rng);
  const value = modifiers.advantage ? Math.max(first, second) : Math.min(first, second);
  const step = modifiers.advantage ? ROLL_STEP.ADVANTAGE : ROLL_STEP.DISADVANTAGE;

  steps.push({ step, value, faces: dieMax, rolled: [first, second] });
  return value;
}

/**
 * Roll the chosen dice card with every modifier of the turn applied.
 *
 * `rng` is injected and spent once per die the chain rolls, so a test that scripts an exact sequence
 * has to script the extra dice too. That is the point: a card that adds a D8 spends a draw, and a
 * replay that did not account for it would diverge.
 */
export function resolveRoll({ dieMax, modifiers = createModifiers() }, rng) {
  if (!Number.isInteger(dieMax) || dieMax < 2) {
    throw new RangeError(`dieMax must be an integer of at least 2, got ${dieMax}`);
  }

  const steps = [];
  let total = baseValue(dieMax, modifiers, rng, steps);

  for (const faces of modifiers.addDice) {
    const value = rollDie(faces, rng);
    total += value;
    steps.push({ step: ROLL_STEP.ADD_DIE, value, faces });
  }

  for (const faces of modifiers.subDice) {
    const value = rollDie(faces, rng);
    total -= value;
    steps.push({ step: ROLL_STEP.SUB_DIE, value: -value, faces });
  }

  if (modifiers.multiplier !== 1) {
    total *= modifiers.multiplier;
    steps.push({ step: ROLL_STEP.MULTIPLIER, value: total, factor: modifiers.multiplier });
  }

  if (total < 0) {
    total = 0;
    steps.push({ step: ROLL_STEP.FLOOR, value: 0 });
  }

  return { roll: Math.trunc(total), dieMax, steps };
}
