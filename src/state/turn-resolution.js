/**
 * Steps 8 and 9 of the turn, and the rule that decides between them and another roll. Issue #27,
 * extended by #38, split out of `turn-manager.js` in #89.
 *
 * Imports `core/` and never `ui/` (NFR-01). Contains no rules: every rule question is asked of `core/`
 * and the answer is written into a new state object, exactly as in `turn-manager.js`.
 *
 * ## Why these three left `turn-manager.js`
 *
 * That file was at its 300-line limit when the bonus roll arrived (issue #89), and the seam was already
 * drawn in its own table: steps 1 to 7 take the turn up to a committed move, steps 8 and 9 make the move
 * happen and hand the turn on. `closeOrRollAgain` is the reason the split fell here and not somewhere
 * cheaper: "the turn is over, or rolls again" is asked in three places, two of them in this file, and it
 * belongs with the code that ends turns.
 */

import { grantsBonusRoll } from "../core/bonus-roll.js";
import { applyMove } from "../core/movement.js";
import { findPawn } from "../core/pawns.js";
import { createModifiers } from "../core/roll.js";
import { findWinner } from "../core/win.js";
import { MATCH_STATUS, TURN_PHASE, clearedTurnFields, nextState } from "./game-state.js";
import { skillSquareChanges, trapChanges } from "./skill-turn.js";

/** The same guard `turn-manager.js` has, and for the same reason: an out-of-order step is a bug. */
function assertPhase(state, expected) {
  if (state.phase !== expected) {
    throw new Error(`expected phase "${expected}", but the turn is in "${state.phase}"`);
  }
}

/**
 * The turn is over, unless the roll just used earns another one (issue #89).
 *
 * Asked after a resolved move, after a cancelled move, and after a roll with no legal move. When
 * `core/bonus-roll.js` says yes, the turn goes back to `roll` with the same die and everything the last
 * roll produced cleared: the number, its steps, the legal moves, the selection, the pending move and the
 * refusal. **The roll modifiers are cleared too**, because a card was played into the roll it was played
 * into; an Angel Die that buffed two rolls would be a card worth twice what it says.
 *
 * What stays: the drawn hand, the chosen die, the card budget, the reaction lock and every match-level
 * field. The action phase is not revisited, so there is no second Action card.
 */
export function closeOrRollAgain(state, changes = {}) {
  const again = grantsBonusRoll({
    dieMax: state.chosenDie,
    rollSteps: state.rollSteps,
    rollsThisTurn: state.rollsThisTurn,
  });

  if (!again) return nextState(state, { ...changes, phase: TURN_PHASE.TURN_END });

  return nextState(state, {
    ...changes,
    roll: null,
    rollSteps: [],
    legalMoves: [],
    selectedPawn: null,
    pendingMove: null,
    refusalReason: null,
    modifiers: createModifiers(),
    bonusRoll: true,
    phase: TURN_PHASE.ROLL,
  });
}

/**
 * Step 8: the committed move is applied.
 *
 * Called when the reaction window has closed, which is `state/reaction-window.js`'s decision and not
 * this file's. A move that a Reaction card cancelled never reaches here: the window resolves to
 * `cancelPendingMove` instead, and the turn ends with the pawn where it stood.
 *
 * This is also where a skill square is used up (FR-22), and it is the right place for one reason: the
 * square only counts if the pawn **finished** here. Doing it any earlier would mean acting on a move a
 * reaction card can still cancel.
 */
export function resolveMove(state, deps) {
  assertPhase(state, TURN_PHASE.REACTION);

  const move = state.pendingMove;
  if (move === null) {
    return closeOrRollAgain(state);
  }

  // Three steps in one transition, and the order is the rule: the pawn arrives, then a trap it walked
  // into goes off, and only then is the square it is actually standing on asked whether it hands out a
  // card. A trap can move the pawn, so asking the skill square first would ask about a square the pawn
  // is no longer on. `board` is `trapChanges`'s whole answer, never repacked: `skill-turn.js` says why.
  const moved = { ...state, pawns: applyMove(state.pawns, move) };
  const board = trapChanges(moved, move, deps);
  const sprung = { ...moved, ...board };

  const winner = findWinner(sprung.pawns);
  if (winner !== null) {
    return nextState(state, {
      ...board,
      pendingMove: null,
      winner,
      status: MATCH_STATUS.WON,
      phase: TURN_PHASE.MATCH_OVER,
    });
  }

  const landed = findPawn(sprung.pawns, move);

  return closeOrRollAgain(state, {
    ...board,
    pendingMove: null,
    ...skillSquareChanges(sprung, { ...move, to: landed.r }, deps),
  });
}

/**
 * The committed move is thrown away and the turn ends with nothing moved.
 *
 * What Ghost Mode and Uno Reverse resolve to. Kept here rather than in the card effects, because
 * "the declared move does not happen" is a step of the sequence and every card that reaches it needs
 * the same behaviour.
 */
export function cancelPendingMove(state) {
  return closeOrRollAgain(state, { pendingMove: null });
}

/**
 * Step 9: the drawn cards go back into the pool (FR-21) and the next player takes over (FR-04).
 *
 * `clearedTurnFields` is what makes this safe as skill cards pile more onto a turn: the roll
 * modifiers, the card budget and the reaction window all go with it, and the test in
 * `game-state.test.js` compares the result field by field against a fresh match rather than trusting
 * this list to be complete.
 */
export function endTurn(state, deps) {
  assertPhase(state, TURN_PHASE.TURN_END);

  deps.diceSource.returnHand(state.hand);

  return nextState(state, {
    ...clearedTurnFields(),
    activePlayer: nextSeat(state),
    turnNumber: state.turnNumber + 1,
    phase: TURN_PHASE.DRAW,
  });
}

/**
 * The seat that takes the next turn (FR-04).
 *
 * Turn order is the order of `state.seats`, not `activePlayer + 1`. In a two-player match the seats are
 * 0 and 2, so counting upward would hand the turn to seat 1, which nobody is sitting in.
 *
 * **Exported since issue #39** because the handover overlay names the player it is passing to, and it has
 * to name the same one `endTurn` is about to hand the turn to. A second walk over `state.seats` in `ui/`
 * would be a second answer to the same question, and the two would disagree the first time turn order
 * changes.
 */
export function nextSeat(state) {
  const index = state.seats.indexOf(state.activePlayer);
  return state.seats[(index + 1) % state.seats.length];
}
