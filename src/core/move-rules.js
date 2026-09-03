/**
 * What one pawn may do, and why it may not. Issue #38, split out of `movement.js`.
 *
 * Pure `core/`: no DOM, no state object, no randomness.
 *
 * ## Why this is its own file
 *
 * `movement.js` was at 207 of its 300 lines and it had two jobs in it: deciding what a single pawn can
 * do, and collecting four of those decisions into an answer for the turn. The skill cards all land on
 * the first job, so that is the half that moves out. `movement.js` keeps the public API and the
 * turn-level collection, which is what every existing caller and test uses.
 *
 * The seam is real and not a line count: everything here takes **one** pawn, everything left there
 * takes a player's four.
 *
 * ## The board argument
 *
 * Every function takes a `board`, defaulting to `EMPTY_BOARD`. That is the whole of the skill cards'
 * influence on movement, in one parameter:
 *
 * ```js
 * { statuses: [], traps: [] }
 * ```
 *
 * With the default, every rule below behaves exactly as it did before issue #38, which is why the
 * movement tests written for issue #28 still pass unchanged. That was the point of the default.
 *
 * ## Two rule changes the cards forced, both recorded in the project journal
 *
 * 1. **Leaving the start area is `roll >= dieMax`, not `roll === dieMax`** (FR-09). Angel Die adds a
 *    D8 to the roll, and under the old wording a buff would have made leaving the yard *impossible*.
 *    Without card modifiers a roll can never exceed the maximum, so every match played before this
 *    change would play identically.
 * 2. **A roll of zero moves nothing.** Devil Die can subtract more than was rolled. Zero used to be
 *    rejected as an invalid input; it is now an ordinary outcome with its own refusal reason.
 */

import { HOME_R, START_R, isFinished, isSameSquare } from "./board.js";
import { captureTarget } from "./capture.js";
import { squaresCrossed } from "./path.js";
import { STATUS, hasStatus } from "./statuses.js";
import { TRAP_KIND, blockedSquares } from "./traps.js";

/** The board with no card effects on it. Every match before issue #38 played on exactly this. */
export const EMPTY_BOARD = Object.freeze({ statuses: [], traps: [] });

/** The two ways a pawn can move under its own steam. Card effects displace pawns separately. */
export const MOVE_KIND = {
  /** Out of the start area onto the entry square, on the die's maximum or better (FR-09). */
  LEAVE_START: "leave-start",
  /** Along the track or into the home column, by exactly the number rolled (FR-10). */
  ADVANCE: "advance",
};

/**
 * Why a pawn cannot move, as i18next keys.
 *
 * Keys and not sentences: NFR-03 forbids a user-facing string anywhere in `src/` outside the locale
 * files, and `core/` is the layer that must not know a language at all.
 *
 * The first four and the four card ones are per-pawn. `NONE_AVAILABLE` and `NO_STEPS` are only ever
 * turn-level answers.
 */
export const REFUSAL = {
  /** In the start area, and the roll did not reach the die's maximum (FR-09). */
  NEEDS_MAXIMUM: "move.refused.needs-maximum",
  /** The target square holds one of the mover's own pawns (FR-12). */
  OWN_PAWN: "move.refused.own-pawn",
  /** The target would take the pawn past the deepest house square, `r = 44` (FR-13). */
  OVERSHOOT: "move.refused.overshoot",
  /** Standing on the deepest house square. Not blocked, finished. */
  ALREADY_HOME: "move.refused.already-home",
  /** Hold Pawn: this pawn is out of the running for one turn. */
  HELD: "move.refused.held",
  /** Banana Peel: this pawn walked into a trap and loses this turn. */
  STUNNED: "move.refused.stunned",
  /** Lock In: this pawn's own player may not move it. */
  LOCKED: "move.refused.locked",
  /** A Rock or a Big Ah Rock stands somewhere on the way. */
  BLOCKED: "move.refused.blocked",
  /** Built Different: the pawn on the target square cannot be captured. */
  PROTECTED: "move.refused.protected",
  /** The roll came out at zero, so nothing can move anywhere (Devil Die). */
  NO_STEPS: "move.refused.no-steps",
  /** The pawns are blocked for different reasons, so no single one describes the turn (FR-14). */
  NONE_AVAILABLE: "move.refused.none-available",
};

/**
 * Another pawn of the same player standing where this one wants to land, or `null`.
 *
 * `isSameSquare` does the real work, and it is what makes the house behave correctly with no rule of
 * its own. Two pawns of one player collide on a house square, so FR-12 refuses the second arrival, and
 * the four pawns are forced onto the four separate house squares that FR-05 asks for.
 */
export function ownPawnBlocking(pawns, mover, targetR) {
  const arriving = { player: mover.player, r: targetR };

  return (
    pawns.find(
      (entry) =>
        entry.player === mover.player && entry.pawn !== mover.pawn && isSameSquare(arriving, entry)
    ) ?? null
  );
}

/**
 * The rules that apply to any target square, whichever way the pawn got there.
 *
 * An own pawn refuses the move (FR-12), an opponent's pawn makes it a capture (FR-11), and two cards
 * bend both of those:
 *
 * - **The Purge** turns the first rule off. For one round an own pawn no longer blocks, it is captured
 *   like anyone else's, which is the whole content of the card.
 * - **Built Different** turns the second one into a refusal. A pawn that cannot be captured cannot be
 *   landed on either, because the alternative is two pawns sharing a square.
 */
export function moveOnto(pawns, mover, targetR, kind, board = EMPTY_BOARD) {
  const purge = hasStatus(board.statuses, STATUS.PURGE);
  const own = ownPawnBlocking(pawns, mover, targetR);

  if (own !== null && !purge) {
    return { pawn: mover.pawn, move: null, reason: REFUSAL.OWN_PAWN };
  }

  const captured = own ?? captureTarget(pawns, mover.player, targetR);

  if (captured !== null && hasStatus(board.statuses, STATUS.ARMOURED, captured)) {
    return { pawn: mover.pawn, move: null, reason: REFUSAL.PROTECTED };
  }

  return {
    pawn: mover.pawn,
    move: {
      player: mover.player,
      pawn: mover.pawn,
      kind,
      from: mover.r,
      to: targetR,
      captures: captured === null ? null : { player: captured.player, pawn: captured.pawn },
    },
    reason: null,
  };
}

/** Does the walk from `fromR` to `targetR` run into a Rock? */
function pathBlocked(pawns, mover, targetR, board) {
  const blocked = blockedSquares(pawns, board);
  if (blocked.length === 0) return false;

  return squaresCrossed(mover.player, mover.r, targetR).some((square) => blocked.includes(square));
}

/** What one pawn can do with this roll: at most one move, or exactly one reason it cannot. */
export function evaluatePawn(pawns, mover, roll, dieMax, board = EMPTY_BOARD) {
  if (isFinished(mover.r)) {
    return { pawn: mover.pawn, move: null, reason: REFUSAL.ALREADY_HOME };
  }
  if (hasStatus(board.statuses, STATUS.HELD, mover)) {
    return { pawn: mover.pawn, move: null, reason: REFUSAL.HELD };
  }
  // Banana Peel. Same shape as Hold Pawn on purpose: one pawn drops out and the other three are
  // untouched. A separate reason rather than reusing HELD, because the player needs to know a trap did
  // it: Hold Pawn is something an opponent played at them, a stun is something they walked into.
  if (hasStatus(board.statuses, STATUS.STUNNED, mover)) {
    return { pawn: mover.pawn, move: null, reason: REFUSAL.STUNNED };
  }
  if (hasStatus(board.statuses, STATUS.LOCKED, mover)) {
    return { pawn: mover.pawn, move: null, reason: REFUSAL.LOCKED };
  }

  // FR-09. Leaving spends the whole roll: the pawn stops on the entry square and does not advance.
  if (mover.r === START_R) {
    if (roll < dieMax) {
      return { pawn: mover.pawn, move: null, reason: REFUSAL.NEEDS_MAXIMUM };
    }
    return blockedOr(pawns, mover, START_R + 1, MOVE_KIND.LEAVE_START, board);
  }

  // FR-10 and FR-13. Pawns pass over occupied squares freely, so only the target and the Rocks count.
  const targetR = mover.r + roll;
  if (targetR > HOME_R) {
    return { pawn: mover.pawn, move: null, reason: REFUSAL.OVERSHOOT };
  }
  return blockedOr(pawns, mover, targetR, MOVE_KIND.ADVANCE, board);
}

function blockedOr(pawns, mover, targetR, kind, board) {
  if (pathBlocked(pawns, mover, targetR, board)) {
    return { pawn: mover.pawn, move: null, reason: REFUSAL.BLOCKED };
  }
  return moveOnto(pawns, mover, targetR, kind, board);
}

/**
 * The one reason the turn passes when nothing can move (FR-14).
 *
 * Pawns that are already home are left out of the vote. They are not blocked by anything, and counting
 * them would turn "every move overshoots home" into the vaguer `NONE_AVAILABLE` as soon as a single
 * pawn had finished.
 */
export function turnLevelReason(refusals) {
  const blocked = refusals.filter((entry) => entry.reason !== REFUSAL.ALREADY_HOME);
  if (blocked.length === 0) {
    return REFUSAL.NONE_AVAILABLE;
  }

  const first = blocked[0].reason;
  return blocked.every((entry) => entry.reason === first) ? first : REFUSAL.NONE_AVAILABLE;
}

/**
 * Ragebait: if a taunted pawn can move, its owner has to move it.
 *
 * A filter over the finished move list rather than a rule inside `evaluatePawn`, because it is the one
 * card whose effect is about the **relationship** between a player's moves rather than about any single
 * pawn. Asking one pawn "may I move" cannot answer "is a different pawn obliged to".
 *
 * When no taunted pawn can move, the list comes back untouched. That matters: a card that could strand
 * a player with no legal move at all would end their turn for them, which is not what a taunt is.
 */
export function applyRagebait(moves, board) {
  const taunted = moves.filter((move) =>
    hasStatus(board.statuses, STATUS.RAGEBAIT, { player: move.player, pawn: move.pawn })
  );

  return taunted.length > 0 ? taunted : moves;
}

/**
 * Re-exported so callers reading traps and movement together have one import.
 *
 * `blockedSquares` joined this line in issue #45, when it moved into `traps.js`. It answers "what is on
 * which square", which is that module's whole subject, and its own comment was already entirely about
 * how the two sources are stored. Moving it also let `core/slide.js` ask about blockers without a
 * displacement module having to depend on the move rules.
 *
 * The re-export is not politeness: `tests/unit/core/move-rules.test.js` imports it from here, and a
 * pure move is one that leaves its callers and its tests untouched.
 */
export { TRAP_KIND, blockedSquares };
