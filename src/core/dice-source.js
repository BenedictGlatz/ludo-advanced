/**
 * Rolling a die, and the temporary stand-in for the Dice Card Pool. Requirements FR-20 and NFR-09.
 *
 * Pure functions, no DOM, no state object (NFR-01).
 *
 * ## Why there is a stub here at all
 *
 * The real Dice Card Pool is issue #37: twenty cards over seven denominations, three drawn per turn,
 * shuffled back at the end (section 5 of the game design document). None of it exists yet, and the
 * turn manager cannot be written without *something* to draw from.
 *
 * So the turn manager takes a **dice source** as an argument and never constructs one. Swapping the
 * stub for the real pool in #37 changes the argument passed at the composition root and nothing
 * else. Two things make that safe rather than wishful:
 *
 * 1. The rule for leaving the start area is written as `roll === dieMax` (FR-09), never as
 *    `roll === 6`. It already works for a D2 and a D20, so no rule gets written twice.
 * 2. The randomness enters from outside (NFR-09), so a test hands in a fixed sequence and asserts an
 *    exact board state.
 *
 * ## The interface a dice source must implement
 *
 * ```js
 * {
 *   handSize: 3,                 // how many cards a turn draws (FR-18)
 *   draw(rng) -> number[],       // the faces of each card in the hand
 *   returnHand(hand) -> void,    // give them back at end of turn (FR-21)
 * }
 * ```
 *
 * The plan sketched a third method, `chosen()`, holding the card the player picked. It is not here
 * on purpose: which card was chosen is part of the turn, and the turn is the turn manager's to own.
 * A source that remembered it would be a second place where turn state lives.
 */

/**
 * A small deterministic pseudo-random generator, returning a float in `[0, 1)` like `Math.random`.
 *
 * This is the mulberry32 algorithm. It is thirty-two bits of state and four lines, which is exactly
 * what is wanted here: a board game needs a reproducible sequence, not cryptographic quality.
 *
 * **Why it lives in `core/` and not in `ui/`:** `Math.random` is a global, and a global is precisely
 * what NFR-09 forbids the rules from reaching for. Reading `?seed=42` out of the address bar is the
 * composition root's job; producing numbers from that seed is arithmetic and belongs here.
 */
export function createSeededRng(seed) {
  if (!Number.isInteger(seed)) {
    throw new RangeError(`seed must be an integer, got ${seed}`);
  }

  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One roll of a die with `faces` faces: a uniformly distributed integer in `1..faces` (FR-20).
 *
 * `rng` is any function returning a float in `[0, 1)`. Tests pass a scripted one, the browser passes
 * a seeded one, and neither this function nor anything under it ever calls `Math.random` itself.
 */
export function rollDie(faces, rng) {
  if (!Number.isInteger(faces) || faces < 2) {
    throw new RangeError(`faces must be an integer of at least 2, got ${faces}`);
  }

  const value = rng();
  if (typeof value !== "number" || value < 0 || value >= 1) {
    throw new RangeError(`rng must return a number in [0, 1), got ${value}`);
  }

  return Math.floor(value * faces) + 1;
}

/**
 * The stand-in pool: one card, always the same die, never running out.
 *
 * A hand of one is honest about what this is. Faking a hand of three identical cards would let a
 * "pick one of three" screen be built against something that never had a choice in it, and the
 * missing choice would only surface in #37.
 */
export function fixedDieSource(faces = 6) {
  if (!Number.isInteger(faces) || faces < 2) {
    throw new RangeError(`faces must be an integer of at least 2, got ${faces}`);
  }

  return {
    handSize: 1,
    draw: () => [faces],
    returnHand: () => {},
  };
}
