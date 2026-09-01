/**
 * What a card effect is allowed to see, and what it is allowed to change. Issue #38, FR-26.
 *
 * Pure `core/`: no DOM, no state object, no randomness of its own.
 *
 * ## Why an effect does not take the game state
 *
 * NFR-01 says `core/` may not know the shape of the state object. That is not a formality here: it is
 * what lets 29 card effects be unit tested with three literals each instead of a built match. So an
 * effect takes a **flat snapshot** and returns a **flat patch**, and `state/skill-play.js` is the one
 * module in the project that knows how to translate between the two shapes.
 *
 * ```js
 * // an effect
 * (context) => ({ modifiers: withModifier(context.modifiers, { addDice: [8] }) })
 * ```
 *
 * A patch names only the fields it changes. Anything it leaves out is unchanged, so an effect that
 * only touches the roll cannot accidentally blank the trap list.
 *
 * ## The snapshot
 *
 * | Field | What it is |
 * | --- | --- |
 * | `pawns` | Every pawn on the board, as a plain list |
 * | `seats`, `playerCount`, `turnNumber` | Who is at the table and how far in the match is |
 * | `activePlayer` | Whose turn it is |
 * | `actor` | Who is playing **this** card. Not the same as `activePlayer` for a Reaction |
 * | `target` | What the player pointed at, or `{}`. See below |
 * | `chosenDie`, `roll`, `modifiers` | The turn's die, its result so far, and the roll chain |
 * | `statuses`, `traps`, `skillSquares` | The board effects in force |
 * | `hands`, `pool`, `discard` | The skill cards, by seat |
 * | `pendingMove` | The declared move a Reaction is answering, or `null` |
 * | `cardBudget`, `reactionsLocked` | The turn's card economy |
 * | `rng` | The injected randomness (NFR-09). Never `Math.random` |
 *
 * ## The target
 *
 * One object with one key per thing the player pointed at, matching the `TARGET` vocabulary:
 *
 * ```js
 * { pawn: { player: 1, pawn: 2 }, direction: 1, square: 17, number: 4, player: 2, choice: "a" }
 * ```
 *
 * `state/` checks that the keys a card's `targets` list asks for are present and sane **before** the
 * effect runs, so an effect may read `context.target.pawn` without guarding it. That check is one place
 * rather than 29.
 */

/** Every field an effect may read. Anything not in here is not available on purpose. */
export const CONTEXT_FIELDS = Object.freeze([
  "pawns",
  "seats",
  "playerCount",
  "turnNumber",
  "activePlayer",
  "actor",
  "target",
  "chosenDie",
  "roll",
  "modifiers",
  "statuses",
  "traps",
  "skillSquares",
  "hands",
  "pool",
  "discard",
  "pendingMove",
  "cardBudget",
  "reactionsLocked",
  "rng",
]);

/**
 * Every field an effect may write, plus the two that are instructions rather than data.
 *
 * `negate` and `cancelMove` are not board state. They are answers to a question only the caller can
 * act on: "the card that opened this window does not happen" and "the declared move does not happen".
 * An effect cannot do either itself, because neither is a field.
 */
export const PATCH_FIELDS = Object.freeze([
  "pawns",
  "modifiers",
  "statuses",
  "traps",
  "skillSquares",
  "hands",
  "pool",
  "discard",
  "cardBudget",
  "reactionsLocked",
  "negate",
  "cancelMove",
]);

/**
 * Build a snapshot, filling in every field an effect may read.
 *
 * The defaults matter more than they look. An effect written against the full snapshot has to work in a
 * unit test that supplies three fields, otherwise every one of the 29 effect tests would have to build
 * a whole context and the tests would be about the builder rather than about the card.
 */
export function createContext(fields = {}) {
  return Object.freeze({
    pawns: [],
    seats: [0, 1, 2, 3],
    playerCount: 4,
    turnNumber: 1,
    activePlayer: 0,
    actor: 0,
    target: {},
    chosenDie: 6,
    roll: null,
    modifiers: {
      fixed: null,
      advantage: false,
      disadvantage: false,
      addDice: [],
      subDice: [],
      multiplier: 1,
    },
    statuses: [],
    traps: [],
    skillSquares: [],
    hands: {},
    pool: [],
    discard: [],
    pendingMove: null,
    cardBudget: {},
    reactionsLocked: false,
    rng: () => 0,
    ...fields,
  });
}

/**
 * Check that a patch names only fields an effect is allowed to write, and hand it back.
 *
 * A typo in a patch key is the quietest possible bug in a system like this: `{ status: [...] }` instead
 * of `{ statuses: [...] }` is silently ignored, the card does nothing, and no test that checks the
 * board fails for a reason anyone can trace back. So it throws, naming the field and the card.
 */
export function assertPatch(patch, cardId) {
  for (const field of Object.keys(patch)) {
    if (!PATCH_FIELDS.includes(field)) {
      throw new Error(`card "${cardId}" returned an unknown patch field "${field}"`);
    }
  }

  return patch;
}

/** One pawn out of a snapshot, by reference. `undefined` when a card names a pawn that is not there. */
export function pawnIn(context, ref) {
  return context.pawns.find((entry) => entry.player === ref.player && entry.pawn === ref.pawn);
}

/** Every seat except one. What "each opponent" means, and it is not `seats.length - 1` arithmetic. */
export function opponentsOf(context, seat) {
  return context.seats.filter((entry) => entry !== seat);
}

/** One seat's hand, never `undefined`. A seat that has drawn nothing still has a hand: an empty one. */
export function handOf(context, seat) {
  return context.hands[seat] ?? [];
}
