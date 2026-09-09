/**
 * States that last longer than the card that caused them. Issue #38, requirements FR-26 and FR-28.
 *
 * Pure `core/`: no DOM, no state object, no randomness of its own.
 *
 * ## Why a duration needs normalising before anything else
 *
 * The artwork measures time in two different units. Some cards say "for 2 rounds", some say "for 3
 * turns", and a few say "until the start of your next turn". Those are not comparable: in a four
 * player match one round is four turns, and in a two player match it is two.
 *
 * So everything here is stored in **turns**, and `turnsForRounds` is the one place that converts.
 * A card that says "2 rounds" gets `turnsForRounds(2, playerCount)`. Nothing downstream has to know
 * which unit the card was printed in, and a status cannot mean something different at a different
 * table size by accident.
 *
 * ## The shape of a status
 *
 * ```js
 * { kind: "rock", player: 1, pawn: 2, until: 17, source: "action-rock" }
 * ```
 *
 * - `player` and `pawn` say what it is attached to. `pawn: null` means the whole player, and both
 *   `null` means the whole board, which is what The Purge needs.
 * - `until` is a turn number, and the status applies while `turnNumber < until`. Exclusive rather
 *   than inclusive because "expires at the start of turn 17" is how the cards read, and an inclusive
 *   bound would make every duration one longer than the card says.
 * - `source` is the card id that caused it, kept so the view can say why a pawn is stuck (NFR-08)
 *   and so a card that removes its own effect can find it.
 *
 * ## Why expiry is a filter and not a countdown
 *
 * A status could store "3 turns left" and be decremented every turn. It stores an absolute deadline
 * instead, so nothing has to be visited to stay correct. A missed decrement would leave a pawn
 * frozen forever with no error, and a missed filter shows up immediately as a status that will not
 * go away.
 */

/**
 * Every state a card can leave behind.
 *
 * These are the words the effects and the movement rules agree on. A card is data and its effect is
 * a function, and this list is the third thing between them: what the effect wrote down and the
 * movement rules read back.
 */
export const STATUS = Object.freeze({
  /** Hold Pawn: this pawn drops out of the move choice for one turn. */
  HELD: "held",
  /** Rock and Big Ah Rock: nothing may pass through the square this pawn stands on. */
  ROCK: "rock",
  /** Ghost Mode: this pawn cannot be captured. */
  GHOST: "ghost",
  /** Lock In: this pawn's own player may not move it. */
  LOCKED: "locked",
  /** Built Different: the next capture of this pawn is refused instead, and the status is spent. */
  ARMOURED: "armoured",
  /** Ragebait: if this pawn can move, its owner must move it. */
  RAGEBAIT: "ragebait",
  /** The Purge: for one round every landing captures, and an own pawn no longer blocks. */
  PURGE: "purge",
  /** Oil Spill: this pawn skips the skill square it lands on. */
  SLIPPERY: "slippery",
  /**
   * Banana Peel: this pawn loses its next turn.
   *
   * Read by `evaluatePawn` exactly the way `HELD` is, so only the pawn sits out and its owner's other
   * three are unaffected. That is the Product Owner's reading of the card text, and the alternative
   * (skipping the seat's whole turn) is recorded as rejected in the project journal.
   */
  STUNNED: "stunned",
});

/**
 * How many turns one round is: one turn for every player at the table.
 *
 * Takes the count rather than reading it from anywhere, because `core/` is not allowed to know the
 * state object (NFR-01) and a rule that guessed four players would be wrong at every other table.
 */
export function turnsForRounds(rounds, playerCount) {
  if (!Number.isInteger(rounds) || rounds < 1) {
    throw new RangeError(`rounds must be a positive integer, got ${rounds}`);
  }
  return rounds * playerCount;
}

/**
 * A new list with one status added.
 *
 * **The same kind on the same target is replaced rather than stacked**, and the longer of the two
 * deadlines wins. Two Rocks on one pawn are one Rock, which is what a player would expect, and it
 * keeps the list from growing without bound over a long match. The exception is deliberate: nothing
 * in the 29 cards benefits from a status counting to two.
 */
export function addStatus(statuses, status) {
  const kept = statuses.filter((entry) => !isSameTarget(entry, status));
  const existing = statuses.find((entry) => isSameTarget(entry, status));

  return [...kept, { ...status, until: Math.max(status.until, existing?.until ?? 0) }];
}

function isSameTarget(a, b) {
  return a.kind === b.kind && a.player === b.player && a.pawn === b.pawn;
}

/**
 * Every status still in force at `turnNumber`.
 *
 * Called once per turn, at the start, before anything reads a status. Doing it at the start rather
 * than at the end means a status is always filtered by the turn that is about to look at it, so a
 * status added and expired in the same turn behaves the same whichever order it happened in.
 */
export function expireStatuses(statuses, turnNumber) {
  return statuses.filter((entry) => entry.until > turnNumber);
}

/**
 * Is `kind` in force for this pawn?
 *
 * A status attached to the whole player, or to the whole board, counts for every pawn under it. That
 * is what lets The Purge be one entry rather than sixteen, and it is why `ref` is matched loosely:
 * a broader status covers a narrower question, never the other way round.
 */
export function hasStatus(statuses, kind, ref = {}) {
  return statuses.some(
    (entry) =>
      entry.kind === kind &&
      (entry.player === null || entry.player === ref.player) &&
      (entry.pawn === null || entry.pawn === ref.pawn)
  );
}

/** Every status of one kind, whoever it belongs to. Used to find the squares Rocks are standing on. */
export function statusesOfKind(statuses, kind) {
  return statuses.filter((entry) => entry.kind === kind);
}

/**
 * A new list with one status taken off one target.
 *
 * Needed because two statuses are **spent** rather than expiring: Built Different is used up by the
 * capture it prevents, and Ghost Mode by the capture it dodges. A duration alone cannot express
 * "until it is needed once".
 */
export function removeStatus(statuses, kind, ref) {
  return statuses.filter(
    (entry) =>
      !(entry.kind === kind && entry.player === ref.player && entry.pawn === (ref.pawn ?? null))
  );
}
