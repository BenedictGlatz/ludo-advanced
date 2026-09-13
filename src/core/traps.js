/**
 * Things that sit on a square rather than on a pawn. Issue #38, requirements FR-28 and FR-30.
 *
 * Pure `core/`: no DOM, no state object, no randomness.
 *
 * ## One list, one behaviour, since issue #90
 *
 * Three cards put an object on one of the forty shared track squares: Banana Peel, Oil Spill and It's
 * Not That Deep. A pawn crosses or lands on it, the effect fires, the object is gone. That is a trap,
 * and it is the only kind of thing in this list.
 *
 * **Until issue #90 the list held a second behaviour.** Big Ah Rock was dropped on a square as a
 * *blocker*, an entry with a deadline that nothing could cross, and `BLOCKERS` and `isBlocker` told the
 * two apart. A playtest asked for the card to petrify one of the caster's own pawns instead, the way
 * Rock already did, and the Product Owner agreed. So both rock cards are now a **status on a pawn**
 * (`STATUS.ROCK`, written by `cards/effects/status-effects.js`), and the square they block is wherever
 * that pawn stands. Storing the square would be storing a copy of a pawn position that goes stale the
 * moment the pawn walks, which is why Rock was never stored here in the first place.
 *
 * `blockedSquares` is still here, because it answers "what is on which square", which is this module's
 * subject, and because `core/slide.js` needs it. It is the one function here that reads pawns, and it is
 * why this module imports `board.js` and `statuses.js` at all.
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
 * - `until` is a turn number, or `null` for "until something steps on it". Every trap today is `null`;
 *   the field and `expireTraps` stay, because the deadline was the one thing about the old blocker that
 *   a future object might want again and it costs one filter.
 */

import { START_R, TRACK_LENGTH, absoluteSquare } from "./board.js";
import { STATUS, statusesOfKind } from "./statuses.js";

/** What a square can be holding. One per square, never two. */
export const TRAP_KIND = Object.freeze({
  /** Banana Peel: the pawn that touches it goes back to its start area. */
  BANANA_PEEL: "banana-peel",
  /** Oil Spill: the pawn slides 3 to 5 squares further and skips the skill square it lands on. */
  OIL_SPILL: "oil-spill",
  /** It's Not That Deep: the pawn is pushed back one square. */
  NOT_THAT_DEEP: "not-that-deep",
});

/**
 * Every absolute track square nothing may cross right now.
 *
 * One source since issue #90: the pawns carrying `STATUS.ROCK`, from Rock or from Big Ah Rock. The
 * square is wherever that pawn happens to be standing this instant, and a petrified pawn cannot move
 * (`evaluatePawn` and `slideStop` both refuse it), so in practice the wall stands still for as long as
 * the status lasts. It is still derived rather than stored, because storing it would be a copy of a
 * pawn position that goes stale the day some rule moves a petrified pawn after all.
 *
 * Lived in `move-rules.js` until issue #45 and is re-exported from there, so no caller changed. It
 * belongs here because it answers "what is on which square", which is this module's subject, and
 * because `core/slide.js` needs it: a displacement module depending on the move rules would have been
 * the wrong way round. `board.traps` is no longer read, and the parameter is kept so the callers and
 * the signature `slide.js` relies on stay as they were.
 */
export function blockedSquares(pawns, board) {
  const fromRocks = statusesOfKind(board.statuses, STATUS.ROCK)
    .map((status) => pawns.find((p) => p.player === status.player && p.pawn === status.pawn))
    .filter((pawn) => pawn !== undefined && pawn.r > START_R && pawn.r <= TRACK_LENGTH)
    .map((pawn) => absoluteSquare(pawn.player, pawn.r));

  return [...new Set(fromRocks)];
}

/**
 * A new list with one object placed, replacing whatever was on that square.
 *
 * Replacing rather than refusing, because the refusal belongs one layer up. Two objects on one square is
 * the situation this makes impossible, whatever the layers above do.
 *
 * **This comment used to claim the refusal already existed, and it did not.** Until issue #45 it said
 * that "`state/` will not let a player target a square that is already taken", while `checkTarget`'s
 * entire test for a track square was that the number was between 0 and 39. So a player could lay a trap
 * on top of an existing one and this function would silently delete it.
 *
 * It is true now: `core/trap-rules.js` holds the three placement rules and `state/card-legality.js`
 * enforces them through the `FREE_SQUARE` target kind. Worth leaving the history in, because the bug was
 * not the missing check. It was a comment describing a guarantee that another layer was supposed to
 * provide and that nothing checked either layer for.
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
 * A trap never fires under a pawn belonging to the player who placed it.
 */
export function firstTrapOnPath(traps, crossed, mover) {
  for (const square of crossed) {
    const trap = trapAt(traps, square);
    if (trap === null || trap.owner === mover.player) continue;
    return trap;
  }

  return null;
}

/**
 * Every object with a deadline that has run out is dropped. Called once per turn, at its start.
 *
 * No card writes a deadline since issue #90 moved Big Ah Rock onto a pawn, so today this filters
 * nothing. Kept because it is one line, it is called from the same place `expireStatuses` is, and the
 * next timed object would otherwise have to rediscover where expiry belongs.
 */
export function expireTraps(traps, turnNumber) {
  return traps.filter((entry) => entry.until === null || entry.until > turnNumber);
}
