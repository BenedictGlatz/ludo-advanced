/**
 * The single game-state object and the two ways it is ever built. Issue #27.
 *
 * This module may import `core/`, never `ui/` (NFR-01). It holds no rules: every rule question is
 * asked of `core/` and the answer is written here.
 *
 * ## Why the state is frozen
 *
 * Every state object this module produces is deeply frozen, and every transition builds a new one.
 * `CLAUDE.md` says `ui/` never mutates state directly and dispatches intents instead. Freezing turns
 * that from a convention into an error: ES modules run in strict mode, so an assignment to a frozen
 * object **throws** rather than being silently dropped. A view that writes to the board fails
 * immediately and in the line that did it.
 *
 * The cost is one shallow copy of a small object per transition, in a turn-based game that changes
 * state a few times per turn. That is not a performance question.
 *
 * ## What is stored and what is derived
 *
 * Stored: the pawn positions, whose turn it is, which phase the turn is in, the drawn hand, the
 * chosen die, the roll. These cannot be recomputed from anything else.
 *
 * Derived and cached for one turn only: `legalMoves` and `refusalReason`. Both come from
 * `core/movement.js` and are written when the die is rolled, because the view needs them for
 * highlighting (FR-32) and for the refusal text (NFR-08), and recomputing them on every render would
 * put a rules call in the render path.
 *
 * Not stored at all: whether a player has won. `core/win.js` answers that from the pawn positions,
 * and a stored copy would be a second source of truth for the same fact. `winner` holds the answer
 * once the match is over, which is a record of the outcome and not a shortcut around the rule.
 */

import { seatsFor } from "../core/board.js";
import { createPawns } from "../core/pawns.js";

/**
 * The turn as a state machine, matching the eight steps in section 3 of the game design document.
 *
 * A phase name says **what the game is waiting for**, which is what the view needs to know.
 */
export const TURN_PHASE = {
  /** Step 2. Nothing is drawn yet. */
  DRAW: "draw",
  /** Step 3. Three dice cards are on the table and the player must pick one (FR-18, FR-19). */
  CHOOSE: "choose",
  /** Step 4. A card is picked and the die has not been rolled yet. */
  ROLL: "roll",
  /** Steps 5 and 6. The roll is known, the legal moves are computed, the player must pick one. */
  ACT: "act",
  /** Step 7. A move is committed and the reaction window is open. Empty until issue #38. */
  REACTION: "reaction",
  /** Step 8. The move is resolved and the turn can be handed on. */
  TURN_END: "turn-end",
  /** Nothing more happens in this match. */
  MATCH_OVER: "match-over",
};

/** Whether a match is still being played, and if not, why it stopped (FR-05, FR-07). */
export const MATCH_STATUS = {
  RUNNING: "running",
  WON: "won",
  ABANDONED: "abandoned",
};

/**
 * Freeze an object, the arrays in it and the objects inside those arrays.
 *
 * Hand-written rather than a general recursive freeze, because the state is a known, flat-ish shape
 * and a general one would have to guard against cycles it cannot have.
 */
function freezeState(state) {
  for (const pawn of state.pawns) Object.freeze(pawn);
  Object.freeze(state.pawns);
  Object.freeze(state.seats);

  for (const move of state.legalMoves) {
    if (move.captures !== null) Object.freeze(move.captures);
    Object.freeze(move);
  }
  Object.freeze(state.legalMoves);
  Object.freeze(state.hand);

  if (state.pendingMove !== null) {
    if (state.pendingMove.captures !== null) Object.freeze(state.pendingMove.captures);
    Object.freeze(state.pendingMove);
  }

  return Object.freeze(state);
}

/**
 * A fresh match: `playerCount` players, four pawns each in their start areas, the first seat to
 * move, and nothing drawn yet (FR-01).
 *
 * **`seats` is stored, and `playerCount` alone is not enough.** `core/board.js` seats two players
 * opposite each other, on seats 0 and 2, so the seats in play are not `0` to `playerCount - 1` and
 * cannot be recomputed from a count without repeating that rule here. Storing the list means
 * `state/` asks `core/` once, at the start of the match, and every later question about turn order
 * reads the answer instead of deriving it again.
 */
export function createGameState(playerCount) {
  const seats = seatsFor(playerCount);

  return freezeState({
    playerCount,
    seats,
    status: MATCH_STATUS.RUNNING,
    activePlayer: seats[0],
    turnNumber: 1,
    phase: TURN_PHASE.DRAW,
    pawns: createPawns(playerCount),

    // Everything below is cleared at the end of every turn.
    hand: [],
    chosenDie: null,
    roll: null,
    legalMoves: [],
    selectedPawn: null,
    pendingMove: null,
    refusalReason: null,

    winner: null,
  });
}

/**
 * The next state: this one, with `changes` applied, frozen.
 *
 * **This is the only place in the whole project that produces a new state object.** Every transition
 * in `turn-manager.js` and `match.js` goes through it, so there is exactly one line to read to know
 * that nothing is ever written in place.
 */
export function nextState(state, changes) {
  return freezeState({ ...state, ...changes });
}

/**
 * The fields that belong to one turn, reset to empty.
 *
 * A function and not a constant, so that no two states ever share the same empty array. A shared
 * array would be harmless while it stayed empty and a very confusing bug on the day it did not.
 */
export function clearedTurnFields() {
  return {
    hand: [],
    chosenDie: null,
    roll: null,
    legalMoves: [],
    selectedPawn: null,
    pendingMove: null,
    refusalReason: null,
  };
}
