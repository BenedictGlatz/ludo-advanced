/**
 * The intent boundary: the only vocabulary `ui/` may use to change anything. Issue #27.
 *
 * Imports `core/` and `state/`, never `ui/` (NFR-01).
 *
 * ## Why this file exists at all
 *
 * `CLAUDE.md` says `ui/` reads state and dispatches intents, and never mutates state directly.
 * `game-state.js` makes writing impossible by freezing; this file makes it *unnecessary*, by giving
 * the view a fixed list of things it is allowed to ask for. A jQuery handler turns one DOM event into
 * one intent and hands it over. It never decides whether the move is legal, because that is a rule.
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
 * ## Where one intent still covers more than one rulebook step
 *
 * Only one is left, and it shrank. `choose-die` used to pick the card **and roll it**, steps 3 to 5,
 * because the rulebook had no player input between them. Issue #38 put the action phase in that gap,
 * so it now does step 3 alone. `end-turn` still runs step 9 and then the next turn's steps 1 and 2, so
 * that the board is never in a phase the player can see and cannot act on.
 */

import { MATCH_STATUS, TURN_PHASE } from "./game-state.js";
import { REJECTED, accept, reject } from "./rejections.js";
import {
  chooseDie,
  commitMove,
  drawHand,
  endTurn,
  moveForPawn,
  passAction,
  resolveMove,
  rollChosenDie,
  selectPawn,
} from "./turn-manager.js";

/** The seven things `ui/` may ask for. There is deliberately no "move this pawn there". */
export const INTENT = {
  /** `{ faces }`. Pick one card of the drawn hand (FR-19). */
  CHOOSE_DIE: "choose-die",
  /** No payload. Play no Action card this turn and go on to the roll (FR-23). */
  SKIP_ACTION: "skip-action",
  /** No payload. Roll the chosen card with every modifier applied (FR-20). */
  ROLL_DIE: "roll-die",
  /** `{ pawn }`. Highlight a pawn's move before committing to it (FR-32). */
  SELECT_PAWN: "select-pawn",
  /** `{ pawn }`. Declare the move for that pawn, which opens the reaction window (FR-10, FR-11). */
  COMMIT_MOVE: "commit-move",
  /** No payload. The reaction window is finished, so apply what it was holding up (FR-25). */
  CLOSE_WINDOW: "close-window",
  /** No payload. Hand the turn to the next player (FR-04). */
  END_TURN: "end-turn",
};

export { REJECTED };

function handleChooseDie(state, intent) {
  if (state.phase !== TURN_PHASE.CHOOSE) return reject(state, REJECTED.WRONG_PHASE);
  if (!state.hand.includes(intent.faces)) return reject(state, REJECTED.CARD_NOT_IN_HAND);

  return accept(chooseDie(state, intent.faces));
}

function handleSkipAction(state) {
  if (state.phase !== TURN_PHASE.ACTION) return reject(state, REJECTED.WRONG_PHASE);

  return accept(passAction(state));
}

function handleRollDie(state, deps) {
  if (state.phase !== TURN_PHASE.ROLL) return reject(state, REJECTED.WRONG_PHASE);

  return accept(rollChosenDie(state, deps));
}

function handleSelectPawn(state, intent) {
  if (state.phase !== TURN_PHASE.ACT) return reject(state, REJECTED.WRONG_PHASE);
  if (moveForPawn(state, intent.pawn) === null) return reject(state, REJECTED.NO_MOVE_FOR_PAWN);

  return accept(selectPawn(state, intent.pawn));
}

/**
 * Declaring a move no longer applies it.
 *
 * This is the split issue #38 made: the phase after this is `reaction`, and `close-window` is what
 * finishes the job. Until a Reaction card existed the two ran as one call, which is why the seam had
 * to be reopened rather than added.
 */
function handleCommitMove(state, intent) {
  if (state.phase !== TURN_PHASE.ACT) return reject(state, REJECTED.WRONG_PHASE);
  if (moveForPawn(state, intent.pawn) === null) return reject(state, REJECTED.NO_MOVE_FOR_PAWN);

  return accept(commitMove(state, intent.pawn));
}

function handleCloseWindow(state, deps) {
  if (state.phase !== TURN_PHASE.REACTION) return reject(state, REJECTED.WRONG_PHASE);

  return accept(resolveMove(state, deps));
}

/**
 * Ending the turn also draws the next player's hand, so that the board is never in a phase the player
 * can see and cannot act on. The one exception is a match that has just been won: the guard in
 * `dispatch` catches that before this runs.
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
      return handleChooseDie(state, intent);
    case INTENT.SKIP_ACTION:
      return handleSkipAction(state);
    case INTENT.ROLL_DIE:
      return handleRollDie(state, deps);
    case INTENT.SELECT_PAWN:
      return handleSelectPawn(state, intent);
    case INTENT.COMMIT_MOVE:
      return handleCommitMove(state, intent);
    case INTENT.CLOSE_WINDOW:
      return handleCloseWindow(state, deps);
    case INTENT.END_TURN:
      return handleEndTurn(state, deps);
    default:
      return reject(state, REJECTED.UNKNOWN_INTENT);
  }
}
