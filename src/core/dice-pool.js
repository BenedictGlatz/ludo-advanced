/**
 * The Dice Card Pool. Issue #30, requirements FR-16 to FR-21, section 5 of the game design document.
 *
 * Pure functions and one small closure, no DOM, no state object (NFR-01). This replaces the
 * single-card stand-in in `dice-source.js` behind the interface that file documents, so the swap is
 * one argument at the composition root.
 *
 * ## What the pool is
 *
 * Twenty cards over seven denominations (FR-17). The counts are weighted toward the middle: D6 and
 * D8 are the cards a player sees most often, D2, D12 and D20 the ones they see least.
 *
 * The point of the pool is a decision, and the decision is this: **a small die is the card that gets
 * a pawn out of the start area, a large die is the card that moves it.** Leaving the start needs the
 * die's maximum (FR-09), which a D2 rolls half the time and a D20 one time in twenty. So a hand
 * holding a D2 and a D20 is a real choice between getting a pawn onto the board and moving one that
 * is already there.
 *
 * Seven denominations rather than all nineteen integers from 2 to 20, because a D11 next to a D12
 * is a distinction with no decision in it.
 *
 * ## Drawing, and why there is no shuffle step
 *
 * Three cards are drawn per turn without replacement (FR-18), the player keeps one (FR-19), and all
 * three go back at the end of the turn and are reshuffled (FR-21). There is no discard pile: the
 * pool is stationary and always holds the same twenty cards.
 *
 * A shuffle function would be a second source of randomness to test. Instead `draw` picks a uniformly
 * random index out of what is left and swaps the last card into the gap. Twenty of those picks in a
 * row *is* a Fisher-Yates shuffle, so the distribution is the same and there is one code path.
 *
 * ## Where the randomness comes from
 *
 * `draw(rng)` takes the generator as an argument and this module never reaches for `Math.random`
 * (NFR-09). The browser passes a seeded generator built from `?seed=`, a test passes a scripted one,
 * and both get the same code.
 */

/**
 * The twenty cards, as the single data definition FR-17 asks for.
 *
 * Adding or reweighting a denomination is a change to this table and to nothing else. Frozen so that
 * a caller cannot reweight the pool for everyone by editing the array it was handed.
 */
export const POOL_COMPOSITION = Object.freeze([
  Object.freeze({ faces: 2, copies: 2 }),
  Object.freeze({ faces: 4, copies: 3 }),
  Object.freeze({ faces: 6, copies: 4 }),
  Object.freeze({ faces: 8, copies: 4 }),
  Object.freeze({ faces: 10, copies: 3 }),
  Object.freeze({ faces: 12, copies: 2 }),
  Object.freeze({ faces: 20, copies: 2 }),
]);

/** How many cards a turn draws (FR-18). */
export const HAND_SIZE = 3;

/** How many cards the pool holds in total. Derived, never written down twice. */
export const POOL_SIZE = POOL_COMPOSITION.reduce((total, entry) => total + entry.copies, 0);

/**
 * The twenty cards as a flat list of face counts, in composition order.
 *
 * A card is just its number of faces. Two D6 cards are indistinguishable to every rule in the game,
 * so giving them identities would be inventing a difference the rulebook does not have.
 */
export function poolCards() {
  return POOL_COMPOSITION.flatMap((entry) =>
    Array.from({ length: entry.copies }, () => entry.faces)
  );
}

/**
 * One uniformly random index into a list of `length` entries.
 *
 * The `rng` contract is checked on every call rather than once at construction. A generator that
 * runs out mid-match, which is exactly what a scripted test generator does, should fail on the call
 * that exhausted it and not silently return `undefined` as a card.
 */
function randomIndex(rng, length) {
  if (typeof rng !== "function") {
    throw new TypeError("draw(rng) needs a function returning a float in [0, 1)");
  }

  const value = rng();
  if (typeof value !== "number" || value < 0 || value >= 1) {
    throw new RangeError(`rng must return a number in [0, 1), got ${value}`);
  }

  return Math.floor(value * length);
}

/**
 * Take one card out of `remaining` at random and return its face count.
 *
 * The chosen card is replaced by the last one and the list is shortened, which is O(1) and does not
 * care about order. Order is meaningless here: the pool is face down.
 */
function takeOne(remaining, rng) {
  const index = randomIndex(rng, remaining.length);
  const card = remaining[index];

  remaining[index] = remaining[remaining.length - 1];
  remaining.pop();

  return card;
}

/**
 * The pool as the turn manager sees it: `{ handSize, draw(rng), returnHand(hand) }`.
 *
 * ## Why this one holds mutable state when nothing else in `core/` does
 *
 * Which cards are currently on the table is not a rule, it is the pool's own bookkeeping, and the
 * turn manager already stores the part that matters to the turn (`state.hand`). Keeping the twenty
 * cards inside the closure means no other layer can reach in and take one.
 *
 * The closure is created once per match by the composition root, so two matches never share a pool.
 */
export function createDicePool() {
  const remaining = poolCards();
  let onLoan = 0;

  return {
    handSize: HAND_SIZE,

    /** Three cards off the top, without replacement (FR-18). */
    draw(rng) {
      if (remaining.length < HAND_SIZE) {
        throw new Error(
          `the pool has ${remaining.length} cards left and cannot draw ${HAND_SIZE}: ` +
            `${onLoan} are still out on a hand that was never returned`
        );
      }

      const hand = Array.from({ length: HAND_SIZE }, () => takeOne(remaining, rng));
      onLoan += hand.length;
      return hand;
    },

    /**
     * All three cards go back and are reshuffled (FR-21).
     *
     * The count is checked rather than trusted. A hand that comes back with a card missing, or with
     * one that was never in the pool, would leave the pool quietly wrong for the rest of the match,
     * and that is the kind of bug that only shows up as "the D20 stopped appearing".
     */
    returnHand(hand) {
      if (!Array.isArray(hand)) {
        throw new TypeError("returnHand(hand) needs the array draw() handed out");
      }
      if (remaining.length + hand.length > POOL_SIZE) {
        throw new Error(
          `returning ${hand.length} cards would put ${remaining.length + hand.length} in a ` +
            `${POOL_SIZE} card pool`
        );
      }

      remaining.push(...hand);
      onLoan -= hand.length;
    },

    /**
     * How many cards are face down in the pool right now.
     *
     * Part of the dice-source interface since issue #30's pool overview, which is what reads it. It is
     * **not** read by the HUD: pool and discard counters were considered for that row on 2026-09-01 and
     * dropped, so that sixteen numbers on screen do not become twenty-four. See the header of
     * `ui/hud-view.js`. A screen the player asks for is a different question to a number that is always
     * there, and this is the answer to the first one.
     */
    remaining() {
      return remaining.length;
    },
  };
}
