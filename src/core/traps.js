/**
 * Things that sit on a square rather than on a pawn. Issue #38, requirements FR-28 and FR-30.
 *
 * Pure `core/`: no DOM, no state object, no randomness.
 *
 * ## One list, two behaviours
 *
 * Five cards put an object on one of the forty shared track squares, and they split cleanly in two:
 *
 * | Behaves like | Cards | What happens |
 * | --- | --- | --- |
 * | A trap | Banana Peel, Oil Spill, It's Not That Deep | A pawn crosses or lands on it, the effect fires, the object is gone |
 * | A blocker | Rock, Big Ah Rock | Nothing may cross or land on it while it stands |
 *
 * They are one list and not two, because a square can only hold one of them and "what is on square
 * 17" should have one answer. The `kind` field says which behaviour applies, and `BLOCKERS` is the set
 * of kinds that stop a pawn instead of firing.
 *
 * ## Why a trap is stored and a blocker is mostly not
 *
 * Big Ah Rock is stored here: it is dropped on a square and stays there on its own. **Rock is not.**
 * Rock turns one of your own pawns into a blocker, so the blocked square moves when the pawn moves,
 * and storing a square would be storing a copy of the pawn's position that goes stale the moment it
 * walks. `blockedSquares`, below, therefore takes both: the entries in this list, and the squares that
 * pawns carrying the Rock status are standing on right now. It is the one function here that reads
 * pawns, and it is why this module imports `board.js` and `statuses.js` at all.
 *
 * ## The shape of an entry
 *
 * ```js
 * { kind: "banana-peel", square: 17, owner: 0, until: null }
 * ```
 *
 * - `square` is absolute, 0 to 39, because it is a place on the shared board.
 * - `owner` is the seat that played the card. Kept so the view can say whose trap it is, and because
 *   a trap does not fire under its own owner's pawn: a card that punishes the player who played it is
 *   a card nobody plays.
 * - `until` is a turn number, or `null` for "until something steps on it". Big Ah Rock is the one
 *   entry with a deadline; the three traps wait as long as it takes.
 */

import { START_R, TRACK_LENGTH, absoluteSquare } from "./board.js";
import { STATUS, statusesOfKind } from "./statuses.js";

/** What a square can be holding. One per square, never two. */
export const TRAP_KIND = Object.freeze({
  /** Banana Peel: the pawn that touches it goes back to its start area. */
  BANANA_PEEL: "banana-peel",
  /** Oil Spill: the pawn slides 3 to 5 squares further and skips the skill square it lands on. */
  OIL_SPILL: "oil-spill",
  /** It's Not That Deep: the pawn is pushed back a D6. */
  NOT_THAT_DEEP: "not-that-deep",
  /** Big Ah Rock: a blocker on a square of its own, with a deadline. */
  BIG_AH_ROCK: "big-ah-rock",
});

/** The kinds that stop a pawn rather than firing at it. */
export const BLOCKERS = Object.freeze([TRAP_KIND.BIG_AH_ROCK]);

/** Is this kind a blocker rather than a trap? */
export function isBlocker(kind) {
  return BLOCKERS.includes(kind);
}

/**
 * Every absolute track square nothing may cross right now.
 *
 * Two sources, and they are stored differently on purpose. A Big Ah Rock is an entry in this list with
 * a square of its own. A Rock is a **status on a pawn**, so its square is wherever that pawn happens to
 * be standing this instant. Storing the Rock's square would be storing a copy of a pawn position that
 * goes stale the moment the pawn walks, which is exactly the kind of quiet duplication the state layer
 * is built to avoid.
 *
 * Lived in `move-rules.js` until issue #45 and is re-exported from there, so no caller changed. It
 * belongs here because it answers "what is on which square", which is this module's subject, and
 * because `core/slide.js` needs it: a displacement module depending on the move rules would have been
 * the wrong way round.
 */
export function blockedSquares(pawns, board) {
  const fromTraps = board.traps.filter((trap) => isBlocker(trap.kind)).map((trap) => trap.square);

  const fromRocks = statusesOfKind(board.statuses, STATUS.ROCK)
    .map((status) => pawns.find((p) => p.player === status.player && p.pawn === status.pawn))
    .filter((pawn) => pawn !== undefined && pawn.r > START_R && pawn.r <= TRACK_LENGTH)
    .map((pawn) => absoluteSquare(pawn.player, pawn.r));

  return [...new Set([...fromTraps, ...fromRocks])];
}

/**
 * A new list with one object placed, replacing whatever was on that square.
 *
 * Replacing rather than refusing, because the refusal belongs one layer up: `state/` will not let a
 * player target a square that is already taken, and by the time a rule gets here the question is
 * settled. Two objects on one square is the situation this makes impossible.
 */
export function placeTrap(traps, trap) {
  return [...traps.filter((entry) => entry.square !== trap.square), trap];
}

/** Whatever is on `square`, or `null`. */
export function trapAt(traps, square) {
  return traps.find((entry) => entry.square === square) ?? null;
}

/** A new list with the object on `square` removed. What a trap firing does. */
export function removeTrap(traps, square) {
  return traps.filter((entry) => entry.square !== square);
}

/**
 * The first trap a move would set off, or `null`.
 *
 * `crossed` is the output of `squaresCrossed`, so it is in the order the pawn walks and the **first**
 * match is the one that fires. A move that crosses two Banana Peels sets off the near one and stops
 * there, which is what a player expects and what keeps one move from having two outcomes.
 *
 * A trap never fires under a pawn belonging to the player who placed it. Blockers are skipped here
 * entirely: they are not traps, and `blockedSquares` is what stops a pawn reaching one.
 */
export function firstTrapOnPath(traps, crossed, mover) {
  for (const square of crossed) {
    const trap = trapAt(traps, square);
    if (trap === null || isBlocker(trap.kind) || trap.owner === mover.player) continue;
    return trap;
  }

  return null;
}

/** Every object with a deadline that has run out is dropped. Called once per turn, at its start. */
export function expireTraps(traps, turnNumber) {
  return traps.filter((entry) => entry.until === null || entry.until > turnNumber);
}
