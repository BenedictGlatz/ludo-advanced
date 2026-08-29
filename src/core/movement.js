/**
 * The legal-move set for a roll, and how a chosen move is applied. Issue #28.
 *
 * Requirements FR-09 (leaving the start area), FR-10 (advancing), FR-12 (own pawn blocks),
 * FR-13 (exact count into home) and FR-14 (an empty set passes the turn with a reason).
 * Pure functions, no DOM, no state object (NFR-01).
 *
 * ## The shape of the answer
 *
 * `evaluateTurn` is the one function that does the work. It looks at all four of a player's pawns
 * and returns three things at once:
 *
 * ```js
 * { moves: [...], refusals: [...], reason: null }
 * ```
 *
 * - `moves` is what the player may do. `ui/` highlights exactly these (FR-32).
 * - `refusals` says, per pawn, why it stayed put. This is what makes NFR-08 achievable: the screen
 *   can explain a refusal because the rules handed it a reason, instead of the view guessing.
 * - `reason` is filled only when `moves` is empty, and is the single reason the turn passes (FR-14).
 *
 * Computing refusals alongside moves rather than on demand is deliberate. A refusal reason worked
 * out later would have to re-derive the rule that produced it, and the second copy is the one that
 * drifts.
 *
 * ## What a move looks like
 *
 * ```js
 * { player: 0, pawn: 2, kind: "advance", from: 17, to: 23, captures: { player: 1, pawn: 0 } }
 * ```
 *
 * `captures` is `null` for most moves. It is computed here rather than at apply time so that the
 * view can warn before the player commits, and so that `applyMove` stays a mechanical write.
 */

import { HOME_R, REGION, START_R, isSameSquare, region } from "./board.js";
import { captureTarget, resolveCapture } from "./capture.js";
import { findPawn, pawnsOf, withPawnAt } from "./pawns.js";

/** The two ways a pawn can move. Nothing else exists in the MVP. */
export const MOVE_KIND = {
  /** Out of the start area onto the entry square, on the die's maximum (FR-09). */
  LEAVE_START: "leave-start",
  /** Along the track or into the home column, by exactly the number rolled (FR-10). */
  ADVANCE: "advance",
};

/**
 * Why a pawn cannot move, as i18next keys.
 *
 * They are keys and not sentences on purpose: NFR-03 forbids a user-facing string anywhere in `src/`
 * outside the locale files, and `core/` is the layer that must not know a language at all.
 *
 * The first four are per-pawn. `NONE_AVAILABLE` is only ever a turn-level answer, used when the
 * blocked pawns disagree about why and no single reason is honest.
 */
export const REFUSAL = {
  /** In the start area, and the roll was not the die's maximum (FR-09). */
  NEEDS_MAXIMUM: "move.refused.needs-maximum",
  /** The target square holds one of the mover's own pawns (FR-12). */
  OWN_PAWN: "move.refused.own-pawn",
  /** The target would take the pawn past `r = 58` (FR-13). */
  OVERSHOOT: "move.refused.overshoot",
  /** Already home. Not blocked, finished. */
  ALREADY_HOME: "move.refused.already-home",
  /** The pawns are blocked for different reasons, so no single one describes the turn (FR-14). */
  NONE_AVAILABLE: "move.refused.none-available",
};

function assertRoll(roll, dieMax) {
  if (!Number.isInteger(dieMax) || dieMax < 2) {
    throw new RangeError(`dieMax must be an integer of at least 2, got ${dieMax}`);
  }
  if (!Number.isInteger(roll) || roll < 1 || roll > dieMax) {
    throw new RangeError(`roll must be an integer 1..${dieMax}, got ${roll}`);
  }
}

/**
 * Another pawn of the same player standing where this one wants to land, or `null`.
 *
 * `isSameSquare` does the real work, which is why home (`r = 58`) needs no exception: it reports no
 * collision there, because home holds four separate slots.
 */
function ownPawnBlocking(pawns, mover, targetR) {
  const arriving = { player: mover.player, r: targetR };
  const blocker = pawns.find(
    (entry) =>
      entry.player === mover.player && entry.pawn !== mover.pawn && isSameSquare(arriving, entry)
  );
  return blocker ?? null;
}

/**
 * The two rules that apply to any target square, whichever way the pawn got there: an own pawn
 * refuses the move (FR-12), an opponent's pawn makes it a capture (FR-11).
 */
function moveOnto(pawns, mover, targetR, kind) {
  if (ownPawnBlocking(pawns, mover, targetR) !== null) {
    return { pawn: mover.pawn, move: null, reason: REFUSAL.OWN_PAWN };
  }

  const captured = captureTarget(pawns, mover.player, targetR);
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

/** What one pawn can do with this roll: at most one move, or exactly one reason it cannot. */
function evaluatePawn(pawns, mover, roll, dieMax) {
  if (region(mover.r) === REGION.HOME) {
    return { pawn: mover.pawn, move: null, reason: REFUSAL.ALREADY_HOME };
  }

  // FR-09. Leaving spends the whole roll: the pawn stops on the entry square and does not advance.
  if (mover.r === START_R) {
    if (roll !== dieMax) {
      return { pawn: mover.pawn, move: null, reason: REFUSAL.NEEDS_MAXIMUM };
    }
    return moveOnto(pawns, mover, START_R + 1, MOVE_KIND.LEAVE_START);
  }

  // FR-10 and FR-13. Pawns pass over occupied squares freely, so only the target is checked.
  const targetR = mover.r + roll;
  if (targetR > HOME_R) {
    return { pawn: mover.pawn, move: null, reason: REFUSAL.OVERSHOOT };
  }
  return moveOnto(pawns, mover, targetR, MOVE_KIND.ADVANCE);
}

/**
 * The one reason the turn passes when nothing can move (FR-14).
 *
 * Pawns that are already home are left out of the vote. They are not blocked by anything, and
 * counting them would turn "every move overshoots home" into the vaguer `NONE_AVAILABLE` as soon as
 * a single pawn had finished.
 */
function turnLevelReason(refusals) {
  const blocked = refusals.filter((entry) => entry.reason !== REFUSAL.ALREADY_HOME);
  if (blocked.length === 0) {
    return REFUSAL.NONE_AVAILABLE;
  }

  const first = blocked[0].reason;
  return blocked.every((entry) => entry.reason === first) ? first : REFUSAL.NONE_AVAILABLE;
}

/**
 * Everything `player` may do with `roll` on a die of `dieMax` faces, and why each pawn that cannot
 * move is stuck.
 *
 * `pawns` is a plain list, not the state object. `core/` is not allowed to know the state object's
 * shape (NFR-01), and taking the list keeps this function callable from a test with four literals.
 */
export function evaluateTurn(pawns, player, roll, dieMax) {
  assertRoll(roll, dieMax);

  const results = pawnsOf(pawns, player).map((mover) => evaluatePawn(pawns, mover, roll, dieMax));
  const moves = results.filter((entry) => entry.move !== null).map((entry) => entry.move);
  const refusals = results
    .filter((entry) => entry.move === null)
    .map((entry) => ({ player, pawn: entry.pawn, reason: entry.reason }));

  return {
    moves,
    refusals,
    reason: moves.length === 0 ? turnLevelReason(refusals) : null,
  };
}

/** Just the moves. The common case, and the one `ui/` highlights (FR-32). */
export function legalMoves(pawns, player, roll, dieMax) {
  return evaluateTurn(pawns, player, roll, dieMax).moves;
}

/**
 * A new pawn list with `move` played: the captured pawn sent home first, then the mover advanced.
 *
 * The order matters. Sending the captured pawn back first frees the square before the mover arrives,
 * so the intermediate list is never in a state where two pawns share it.
 *
 * This does **not** re-check that the move is legal. Validating an intent is the state layer's job,
 * and doing it twice would put the same rule in two places. What it does check is that the pawn is
 * actually standing where the move says it was, because a stale move applied to a moved-on board is
 * the one mistake that would otherwise corrupt the board silently.
 */
export function applyMove(pawns, move) {
  const mover = findPawn(pawns, move);
  if (mover.r !== move.from) {
    throw new Error(
      `stale move: pawn ${move.pawn} of player ${move.player} is at r=${mover.r}, not r=${move.from}`
    );
  }

  const afterCapture = move.captures === null ? pawns : resolveCapture(pawns, move.captures);
  return withPawnAt(afterCapture, move, move.to);
}
