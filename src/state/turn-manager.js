/**
 * The turn as an eight-step sequence. Issue #27, section 3 of the game design document.
 *
 * Imports `core/` and never `ui/` (NFR-01). Contains no rules: every rule question is asked of
 * `core/` and the answer is written into a new state object.
 *
 * ## The sequence, and where each step lives
 *
 * | Rulebook step | Function here | Phase afterwards |
 * | --- | --- | --- |
 * | 1 Turn start, 2 Draw | `drawHand` | `choose` |
 * | 3 Choose | `chooseDie` | `roll` |
 * | 4 Roll, 5 Compute legal moves | `rollChosenDie` | `act`, or `turn-end` when nothing can move |
 * | 6 Act | `commitMove` | `reaction` |
 * | 7 Resolve | `resolveReactions` | `turn-end`, or `match-over` |
 * | 8 End of turn | `endTurn` | `draw` for the next player |
 *
 * ## Why the reaction window is a phase and not a special case
 *
 * Skill cards are issue #38 and do not exist. The window between committing a move and applying it
 * is still a real phase here, and `resolveReactions` currently opens it and closes it again with
 * nothing in between. That is deliberate: retrofitting an interruption point into a sequence that
 * resolves a move in one step means rewriting the sequence, while filling an empty phase does not.
 *
 * ## What `deps` is
 *
 * `{ diceSource, rng }`, both injected and never constructed here. `rng` is NFR-09's injectable
 * randomness, so a test hands in a fixed sequence and asserts an exact board state. `diceSource` is
 * the stand-in from `core/dice-source.js` today and the real Dice Card Pool after issue #37.
 */

import { rollDie } from "../core/dice-source.js";
import { applyMove, evaluateTurn } from "../core/movement.js";
import { findWinner } from "../core/win.js";
import { MATCH_STATUS, TURN_PHASE, clearedTurnFields, nextState } from "./game-state.js";

/**
 * Every function below refuses to run in the wrong phase.
 *
 * The turn is a state machine, and a state machine that accepts a transition out of order is not one.
 * `intents.js` checks the phase first and turns this into a refusal the player can see; reaching this
 * error means something inside `state/` called out of order, which is a bug and not a player action.
 */
function assertPhase(state, expected) {
  if (state.phase !== expected) {
    throw new Error(`expected phase "${expected}", but the turn is in "${state.phase}"`);
  }
}

/** Steps 1 and 2: draw the hand of dice cards for the active player (FR-18). */
export function drawHand(state, deps) {
  assertPhase(state, TURN_PHASE.DRAW);

  const hand = deps.diceSource.draw(deps.rng);
  if (!Array.isArray(hand) || hand.length === 0) {
    throw new Error("the dice source drew an empty hand");
  }

  return nextState(state, { hand, phase: TURN_PHASE.CHOOSE });
}

/**
 * Step 3: the active player picks one card of the hand. The other cards are not rolled (FR-19).
 *
 * `faces` identifies the card, so a hand holding two cards of the same denomination is picked from
 * by denomination. That is the right behaviour: the two cards are indistinguishable to the rules.
 */
export function chooseDie(state, faces) {
  assertPhase(state, TURN_PHASE.CHOOSE);

  if (!state.hand.includes(faces)) {
    throw new Error(`no card with ${faces} faces in the drawn hand [${state.hand.join(", ")}]`);
  }

  return nextState(state, { chosenDie: faces, phase: TURN_PHASE.ROLL });
}

/**
 * Steps 4 and 5: roll the chosen die and work out what the active player can do with it.
 *
 * When nothing can be done the turn goes straight to its end and carries the reason with it
 * (FR-14). The reason comes from `core/movement.js` rather than being decided here, because it is a
 * rule and not a presentation choice.
 */
export function rollChosenDie(state, deps) {
  assertPhase(state, TURN_PHASE.ROLL);

  const roll = rollDie(state.chosenDie, deps.rng);
  const result = evaluateTurn(state.pawns, state.activePlayer, roll, state.chosenDie);

  return nextState(state, {
    roll,
    legalMoves: result.moves,
    refusalReason: result.reason,
    phase: result.moves.length === 0 ? TURN_PHASE.TURN_END : TURN_PHASE.ACT,
  });
}

/** Which pawns have at least one legal move this turn. `ui/` renders this as `data-movable`. */
export function movablePawns(state) {
  return [...new Set(state.legalMoves.map((move) => move.pawn))];
}

/** The legal move for one pawn, or `null`. At most one exists, because one roll is one distance. */
export function moveForPawn(state, pawn) {
  return state.legalMoves.find((move) => move.pawn === pawn) ?? null;
}

/** The active player picks a pawn. Presentation state only: no rule and no pawn moves (FR-32). */
export function selectPawn(state, pawn) {
  assertPhase(state, TURN_PHASE.ACT);

  if (moveForPawn(state, pawn) === null) {
    throw new Error(`pawn ${pawn} has no legal move this turn`);
  }

  return nextState(state, { selectedPawn: pawn });
}

/**
 * Step 6: the active player commits to a move, and the reaction window opens.
 *
 * The move is looked up in `state.legalMoves` rather than trusted from the caller. A caller that
 * builds its own move object would be a second place where the rules are applied.
 */
export function commitMove(state, pawn) {
  assertPhase(state, TURN_PHASE.ACT);

  const move = moveForPawn(state, pawn);
  if (move === null) {
    throw new Error(`pawn ${pawn} has no legal move this turn`);
  }

  return nextState(state, { pendingMove: move, selectedPawn: pawn, phase: TURN_PHASE.REACTION });
}

/**
 * Step 7: the reaction window closes and the committed move is applied.
 *
 * Nothing can be played into the window yet, which is issue #38. The phase exists so that adding
 * cards later is filling it rather than reshaping the sequence.
 */
export function resolveReactions(state) {
  assertPhase(state, TURN_PHASE.REACTION);

  const pawns = applyMove(state.pawns, state.pendingMove);
  const winner = findWinner(pawns, state.playerCount);

  if (winner !== null) {
    return nextState(state, {
      pawns,
      pendingMove: null,
      winner,
      status: MATCH_STATUS.WON,
      phase: TURN_PHASE.MATCH_OVER,
    });
  }

  return nextState(state, { pawns, pendingMove: null, phase: TURN_PHASE.TURN_END });
}

/**
 * Step 8: the drawn cards go back into the pool (FR-21) and the next player takes over (FR-04).
 *
 * Drawing skill cards up to the hand limit also belongs to this step and is issue #38.
 */
export function endTurn(state, deps) {
  assertPhase(state, TURN_PHASE.TURN_END);

  deps.diceSource.returnHand(state.hand);

  return nextState(state, {
    ...clearedTurnFields(),
    activePlayer: (state.activePlayer + 1) % state.playerCount,
    turnNumber: state.turnNumber + 1,
    phase: TURN_PHASE.DRAW,
  });
}
