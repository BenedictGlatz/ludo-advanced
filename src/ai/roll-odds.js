/**
 * What a roll is likely to be, and what a turn is therefore worth. Issue #82, requirement FR-43.
 *
 * Pure `ai/`: no DOM, no jQuery, no `rng`, no clock. Numbers in, numbers out.
 *
 * ## Why a bot needs a probability distribution at all
 *
 * Seven of the 29 skill cards do nothing but change the roll: they add a die, subtract one, roll
 * twice and keep the better, double the result, name it outright, or set a threshold under which it
 * collapses to zero. To decide whether Angel Die is worth playing on a D6, the bot has to compare
 * "how good is my turn with a D6" against "how good is my turn with a D6 plus a D8", and both of
 * those are averages over every number the chain can produce.
 *
 * So this module answers two questions:
 *
 * | Function | Question |
 * | --- | --- |
 * | `rollOdds` | Which totals can this roll produce, and how likely is each? |
 * | `expectedMoveScore` | What is the average best move, over all of them? |
 *
 * ## It is the same chain as `core/roll.js`, in the same order
 *
 * `resolveRoll` rolls dice; this walks the identical six steps over probabilities instead. The order
 * is the one that file documents and it is not negotiable: the threshold sits **before** the
 * multiplier, so a 3 doubled to 6 cannot pass a test it failed, and advantage plus disadvantage
 * cancel out to one plain roll.
 *
 * **The duplication is real and it is the cheaper of two evils.** The alternative is to roll the
 * actual chain a few hundred times with a throwaway RNG and average the results, which drags
 * randomness into a layer whose whole property is that it has none: `ai/` must be deterministic, or
 * `?seed=42` stops replaying a match (NFR-09). A test in `roll-odds.test.js` pins the two together
 * by checking the mean of this distribution against the mean of many real rolls.
 */

import { createModifiers } from "../core/roll.js";
import { evaluateTurn } from "../core/movement.js";
import { boardOf } from "../state/game-state.js";
import { bestMove } from "./move-scoring.js";

/** One value's probability added to a distribution. A `Map` from total to probability. */
function add(dist, value, p) {
  dist.set(value, (dist.get(value) ?? 0) + p);
}

/** Every value moved by `fn`, with values that end up equal merged back together. */
function mapOdds(dist, fn) {
  const next = new Map();
  for (const [value, p] of dist) add(next, fn(value), p);

  return next;
}

/**
 * Steps 1 and 2: where the number comes from before anything is added to it.
 *
 * The double loop for advantage is deliberate. `P(max = k) = (2k - 1) / n²` is the closed form and it
 * is one sign away from being wrong for disadvantage, whereas two nested loops over at most twenty
 * faces are 400 additions and obviously correct.
 */
function baseOdds(dieMax, modifiers) {
  if (modifiers.fixed !== null && modifiers.fixed !== undefined) {
    const value = Math.max(0, Math.min(Math.trunc(modifiers.fixed), dieMax));
    return new Map([[value, 1]]);
  }

  const p = 1 / dieMax;

  // Exclusive or, exactly as `baseValue` does it: both cards played means one ordinary roll.
  if (modifiers.advantage === modifiers.disadvantage) {
    return new Map(Array.from({ length: dieMax }, (_, index) => [index + 1, p]));
  }

  const keep = modifiers.advantage ? Math.max : Math.min;
  const dist = new Map();
  for (let first = 1; first <= dieMax; first += 1) {
    for (let second = 1; second <= dieMax; second += 1) {
      add(dist, keep(first, second), p * p);
    }
  }

  return dist;
}

/** Step 3: one die of `faces` faces added (`sign` 1) or subtracted (`sign` -1). */
function withDie(dist, faces, sign) {
  const next = new Map();

  for (const [value, p] of dist) {
    for (let face = 1; face <= faces; face += 1) {
      add(next, value + sign * face, p / faces);
    }
  }

  return next;
}

/**
 * The distribution of the finished roll, as `[{ roll, p }]` sorted by `roll`.
 *
 * The probabilities sum to 1, always, which is the one property worth asserting about it: a step that
 * lost or invented probability mass would tilt every card value in the same direction and look like a
 * bot with an opinion rather than like a bug.
 */
export function rollOdds(dieMax, modifiers = createModifiers()) {
  let dist = baseOdds(dieMax, modifiers);

  for (const faces of modifiers.addDice ?? []) dist = withDie(dist, faces, 1);
  for (const faces of modifiers.subDice ?? []) dist = withDie(dist, faces, -1);

  // Step 4: 67's threshold. Anything under it goes to zero rather than through the multiplier.
  const atLeast = modifiers.atLeast ?? 0;
  if (atLeast > 0) dist = mapOdds(dist, (value) => (value < atLeast ? 0 : value));

  // Step 5, and zero is skipped for the same reason `resolveRoll` skips it: nothing times two is
  // still nothing, and the multiplier is not what stopped the pawn.
  const multiplier = modifiers.multiplier ?? 1;
  if (multiplier !== 1) dist = mapOdds(dist, (value) => (value === 0 ? 0 : value * multiplier));

  // Step 6: never below zero. Devil Die can take a small die well past it.
  return [...mapOdds(dist, (value) => Math.max(0, Math.trunc(value)))]
    .map(([roll, p]) => ({ roll, p }))
    .sort((a, b) => a.roll - b.roll);
}

/**
 * What a turn is worth to `seat` on a die of `dieMax` faces with `modifiers` in force: the mean best
 * move over every total the roll can produce.
 *
 * In the units of `SCORE` in [move-scoring.js](move-scoring.js), which is what makes every card value
 * in `ai/` comparable to every other. A roll that produces no legal move at all scores 0 and is
 * counted in the mean, so "this die usually does nothing" is expressed rather than ignored.
 *
 * `board` is `{ statuses, traps }` and defaults to the one the state is in. Passing a different board
 * is how the bot prices a card that changes the board rather than the roll: Hold Pawn is priced by
 * asking this same question with a `held` status added to the list.
 */
export function expectedMoveScore(state, seat, dieMax, modifiers, board = boardOf(state)) {
  let total = 0;

  for (const { roll, p } of rollOdds(dieMax, modifiers)) {
    const { moves } = evaluateTurn(state.pawns, seat, roll, dieMax, board);
    total += p * (bestMove(moves, state.pawns)?.score ?? 0);
  }

  return total;
}
