/**
 * The intent boundary: the only vocabulary `ui/` may use to change anything. Issue #27.
 *
 * Imports `core/` and `state/`, never `ui/` (NFR-01).
 *
 * ## Why this file exists at all
 *
 * `CLAUDE.md` says `ui/` reads state and dispatches intents, and never mutates state directly.
 * `game-state.js` makes writing impossible by freezing; this file makes it *unnecessary*, by giving
 * the view four things it is allowed to ask for. A jQuery handler turns one DOM event into one
 * intent and hands it over. It never decides whether the move is legal, because that is a rule.
 *
 * ## What a dispatch returns
 *
 * ```js
 * { state, accepted: true,  reason: null }
 * { state, accepted: false, reason: "intent.rejected.illegal-move" }
 * ```
 *
 * **A rejected intent returns the state object it was given, unchanged and identical.** Not a copy:
 * the same object, so a test can assert `result.state === before`. Every check runs before anything
 * is written, so there is no half-applied intent to undo.
 *
 * The reason is an i18next key, for the same reason the movement refusals are: NFR-03 forbids a
 * user-facing string anywhere in `src/` outside the locale files.
 *
 * ## Where one intent covers more than one rulebook step
 *
 * Two of the four run a pair of turn-manager steps, because the rulebook has no player input
 * between them:
 *
 * - `choose-die` picks the card **and rolls it** (steps 3 to 5). The player chose; the roll follows.
 * - `commit-move` commits **and resolves** (steps 6 and 7). The reaction window in between is empty
 *   until issue #38 puts cards in it, and it is `turn-manager.js` that owns the seam.
 *
 * `commit-move` needs `deps` since issue #38, because resolving a move can use up a skill square and
 * a respawn draws from `deps.rng`.
 */

import { MATCH_STATUS, TURN_PHASE } from "./game-state.js";
import {
  chooseDie,
  commitMove,
  drawHand,
  endTurn,
  moveForPawn,
  resolveReactions,
  rollChosenDie,
  selectPawn,
} from "./turn-manager.js";

/** The four things `ui/` may ask for. There is deliberately no "move this pawn there". */
export const INTENT = {
  /** `{ faces }`. Pick one card of the drawn hand, then roll it (FR-19, FR-20). */
  CHOOSE_DIE: "choose-die",
  /** `{ pawn }`. Highlight a pawn's move before committing to it (FR-32). */
  SELECT_PAWN: "select-pawn",
  /** `{ pawn }`. Play the move for that pawn (FR-10, FR-11). */
  COMMIT_MOVE: "commit-move",
  /** No payload. Hand the turn to the next player (FR-04). */
  END_TURN: "end-turn",
};

/** Why an intent was refused, as i18next keys. */
export const REJECTED = {
  MATCH_OVER: "intent.rejected.match-over",
  WRONG_PHASE: "intent.rejected.wrong-phase",
  UNKNOWN_INTENT: "intent.rejected.unknown-intent",
  CARD_NOT_IN_HAND: "intent.rejected.card-not-in-hand",
  NO_MOVE_FOR_PAWN: "intent.rejected.no-move-for-pawn",
};

function reject(state, reason) {
  return { state, accepted: false, reason };
}

function accept(state) {
  return { state, accepted: true, reason: null };
}

function handleChooseDie(state, intent, deps) {
  if (state.phase !== TURN_PHASE.CHOOSE) return reject(state, REJECTED.WRONG_PHASE);
  if (!state.hand.includes(intent.faces)) return reject(state, REJECTED.CARD_NOT_IN_HAND);

  return accept(rollChosenDie(chooseDie(state, intent.faces), deps));
}

function handleSelectPawn(state, intent) {
  if (state.phase !== TURN_PHASE.ACT) return reject(state, REJECTED.WRONG_PHASE);
  if (moveForPawn(state, intent.pawn) === null) return reject(state, REJECTED.NO_MOVE_FOR_PAWN);

  return accept(selectPawn(state, intent.pawn));
}

function handleCommitMove(state, intent, deps) {
  if (state.phase !== TURN_PHASE.ACT) return reject(state, REJECTED.WRONG_PHASE);
  if (moveForPawn(state, intent.pawn) === null) return reject(state, REJECTED.NO_MOVE_FOR_PAWN);

  return accept(resolveReactions(commitMove(state, intent.pawn), deps));
}

/**
 * Ending the turn also draws the next player's hand, so that the board is never in a phase the
 * player can see and cannot act on. The one exception is a match that has just been won: the guard
 * in `dispatch` catches that before this runs.
 */
function handleEndTurn(state, deps) {
  if (state.phase !== TURN_PHASE.TURN_END) return reject(state, REJECTED.WRONG_PHASE);

  return accept(drawHand(endTurn(state, deps), deps));
}

/**
 * Apply one intent, or refuse it and say why.
 *
 * `intent` is `{ type, ... }`. `deps` is `{ diceSource, rng }`, the same pair the turn manager takes.
 */
export function dispatch(state, intent, deps) {
  if (state.status !== MATCH_STATUS.RUNNING) return reject(state, REJECTED.MATCH_OVER);

  switch (intent.type) {
    case INTENT.CHOOSE_DIE:
      return handleChooseDie(state, intent, deps);
    case INTENT.SELECT_PAWN:
      return handleSelectPawn(state, intent);
    case INTENT.COMMIT_MOVE:
      return handleCommitMove(state, intent, deps);
    case INTENT.END_TURN:
      return handleEndTurn(state, deps);
    default:
      return reject(state, REJECTED.UNKNOWN_INTENT);
  }
}
