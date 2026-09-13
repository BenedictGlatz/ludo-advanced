/**
 * Deep freezing, pulled out of `game-state.js`. Issue #38.
 *
 * This module may import nothing at all. It knows about plain objects and arrays, and nothing about
 * the game.
 *
 * ## Why this exists as its own module now
 *
 * `game-state.js` froze the state field by field: freeze every pawn, freeze the pawn array, freeze
 * the seat array, walk `legalMoves` and freeze each move plus its `captures`, and so on. That was the
 * right call while the state had seven fields of known shape, and the comment on it said so.
 *
 * The skill cards add `skillPool`, `skillDiscard`, `skillHands` (an object keyed by seat, holding an
 * array per seat), `skillSquares`, `statuses`, `traps`, `cardsPlayedThisTurn`, `turnModifiers` and
 * `reactionWindow`. Two of those are nested two levels deep. Hand-written freezing of that shape is
 * not merely longer, it is a list that has to be **edited every time a field is added**, and the
 * failure mode of forgetting a line is invisible: the state looks frozen, one array inside it is not,
 * and a view can write to it. The whole point of freezing was to turn a convention into an error, and
 * a freeze list with a hole in it quietly gives that up.
 *
 * ## The objection the old comment raised, and the answer
 *
 * The old comment rejected a general recursive freeze because it "would have to guard against cycles
 * it cannot have". That is true and the guard is four lines: a `WeakSet` of objects already visited in
 * this call. Four lines of guard against an unbounded list of fields to maintain is a trade worth
 * making, and the guard also stops a shared subtree being walked twice.
 *
 * ## What it does not freeze
 *
 * Only plain objects and arrays are recursed into and frozen. Anything else, a function, a `Map`, a
 * class instance, a `Date`, is left exactly as it is. Freezing those is either meaningless or actively
 * misleading: `Object.freeze` on a `Map` does not stop `map.set`, so it would look protected and not
 * be. Nothing of that kind belongs in the game state anyway, and if one appears, leaving it alone
 * keeps the lie out of the code.
 */

/** Whether a value is a plain object or an array, which is all the state is made of. */
function isPlainContainer(value) {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return true;

  // `Object.create(null)` has no prototype and is still a plain bag of fields.
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Freeze `value`, everything inside it, and everything inside that.
 *
 * Returns the same object, frozen, so it reads as an expression: `return deepFreeze({ ... })`.
 *
 * Children are frozen **before** their parent. The order does not matter for correctness, since
 * freezing one object never touches another, but it means that at no point does a frozen object hold
 * an unfrozen child, which is the state a reader of a heap dump would find confusing.
 *
 * **Rejected: skipping any subtree whose root is already frozen.** It would be the obvious speed-up,
 * because an unchanged array carries the same frozen reference from one state to the next, so every
 * transition re-walks arrays it has already walked. It is only sound while *every* frozen object in
 * the project is also deeply frozen, and a single shallow `Object.freeze` somewhere in `core/` on an
 * object with a mutable child would make the shortcut skip that child forever, silently. The cost it
 * saves is a walk over a few dozen numbers and strings a handful of times per turn in a turn-based
 * game, which is not a cost worth buying an invariant that fragile.
 */
export function deepFreeze(value, seen = new WeakSet()) {
  if (!isPlainContainer(value) || seen.has(value)) return value;

  seen.add(value);

  for (const child of Object.values(value)) deepFreeze(child, seen);

  return Object.freeze(value);
}

/**
 * Whether `value` and everything inside it is frozen.
 *
 * Used by tests, so that a test asserting "this state is immutable" is one call rather than a walk
 * written out again in every test file.
 *
 * **It shares `isPlainContainer` with `deepFreeze`, and that is a real limitation**: a bug in what
 * counts as a container would make both agree and both be wrong. So the tests do not rely on this
 * function alone. They also assert `Object.isFrozen` by hand on named paths of a known fixture, which
 * is the part that would still fail if `isPlainContainer` decided an array was not a container.
 */
export function isDeeplyFrozen(value, seen = new WeakSet()) {
  if (!isPlainContainer(value) || seen.has(value)) return true;

  seen.add(value);

  if (!Object.isFrozen(value)) return false;

  for (const child of Object.values(value)) {
    if (!isDeeplyFrozen(child, seen)) return false;
  }

  return true;
}
