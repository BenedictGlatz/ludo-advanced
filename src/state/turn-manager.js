/**
 * The turn as a nine-step sequence. Issue #27, extended by issue #38.
 *
 * Imports `core/` and never `ui/` (NFR-01). Contains no rules: every rule question is asked of
 * `core/` and the answer is written into a new state object.
 *
 * ## The sequence, and where each step lives
 *
 * | Rulebook step | Function here | Phase afterwards |
 * | --- | --- | --- |
 * | 1 Turn start, 2 Draw | `drawHand` | `choose` |
 * | 3 Choose a dice card | `chooseDie` | `action` |
 * | 4 Play an Action card, or pass | `passAction` | `roll` |
 * | 5 Roll, 6 Compute legal moves | `rollChosenDie` | `act`, or `turn-end` when nothing can move |
 * | 7 Act | `commitMove` | `reaction` |
 * | 8 Resolve | `resolveMove` | `turn-end`, or `match-over`. Uses up a skill square (FR-22) |
 * | 9 End of turn | `endTurn` | `draw` for the next player |
 *
 * ## What issue #38 changed, and what it deliberately did not
 *
 * Two seams that were left open on purpose in issue #27 have now been filled, and neither needed the
 * sequence reshaped:
 *
 * - **The action phase is new.** It sits after the dice card and before the roll, because the Product
 *   Owner's rule is that skill cards come after the die is known. Half the Action cards change the
 *   roll, and deciding whether to buff a D20 or a D4 is what makes them a decision.
 * - **Committing a move no longer resolves it.** `intents.js` used to run steps 7 and 8 as one call,
 *   because the reaction window between them was empty. It is not empty any more: `commitMove` stops
 *   at `reaction` and something else has to close the window. That "something else" is
 *   `state/reaction-window.js`.
 *
 * **Turn start did not become a phase.** The plan sketched one, and it would be a phase in which
 * nothing can be done and which the view would have to skip immediately. `drawHand` already covered
 * "turn start and draw" as one step, so the skill card is drawn there. A phase name says what the game
 * is waiting for, and this one would be waiting for nobody.
 *
 * ## What `deps` is
 *
 * `{ diceSource, rng }`, both injected and never constructed here. **`rng` is now spent in up to five
 * places per turn**: the roll, every extra die a card adds, a skill square respawn, a skill card draw
 * and a skill pool reshuffle. A test that scripts an exact sequence of rolls has to account for all of
 * them, which is why the tests that assert exact boards use `fixedDieSource` and start their match with
 * no skill squares.
 */

import { applyMove, evaluateTurn } from "../core/movement.js";
import { findPawn } from "../core/pawns.js";
import { resolveRoll } from "../core/roll.js";
import { expireStatuses } from "../core/statuses.js";
import { expireTraps } from "../core/traps.js";
import { findWinner } from "../core/win.js";
import { MATCH_STATUS, TURN_PHASE, boardOf, clearedTurnFields, nextState } from "./game-state.js";
import { drawFor, skillSquareChanges, trapChanges } from "./skill-turn.js";

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

/**
 * Steps 1 and 2: the turn starts and the active player draws.
 *
 * Three things happen in one transition, and the order inside it matters:
 *
 * 1. **Statuses and traps expire first**, before anything reads either list. A status added on turn 14
 *    with a deadline of 16 applies on 14 and 15 and is gone on 16, whatever order the rest of the turn
 *    does things in.
 * 2. **One skill card is drawn** for the active player (FR-23). It can come back empty, when the hand
 *    is already at its limit of five, and that is an ordinary situation rather than a failure.
 * 3. **Three dice cards are drawn** (FR-18).
 *
 * The skill draw comes before the dice draw so that a card which could change what the dice hand is
 * worth is in the player's hand before they see it. Nothing exploits that yet, and reversing it later
 * would be a rule change rather than a tidy-up, so it is settled now.
 */
export function drawHand(state, deps) {
  assertPhase(state, TURN_PHASE.DRAW);

  const started = {
    statuses: expireStatuses(state.statuses, state.turnNumber),
    traps: expireTraps(state.traps, state.turnNumber),
  };
  const drawn = drawFor({ ...state, ...started }, state.activePlayer, deps);

  const hand = deps.diceSource.draw(deps.rng);
  if (!Array.isArray(hand) || hand.length === 0) {
    throw new Error("the dice source drew an empty hand");
  }

  return nextState(state, { ...started, ...drawn, hand, phase: TURN_PHASE.CHOOSE });
}

/**
 * Step 3: the active player picks one card of the hand. The other cards are not rolled (FR-19).
 *
 * `faces` identifies the card, so a hand holding two cards of the same denomination is picked from by
 * denomination. That is the right behaviour: the two cards are indistinguishable to the rules.
 *
 * The turn now stops in `action` rather than going on to `roll`, which is the one line of this file
 * that opened the whole of issue #38.
 */
export function chooseDie(state, faces) {
  assertPhase(state, TURN_PHASE.CHOOSE);

  if (!state.hand.includes(faces)) {
    throw new Error(`no card with ${faces} faces in the drawn hand [${state.hand.join(", ")}]`);
  }

  return nextState(state, { chosenDie: faces, phase: TURN_PHASE.ACTION });
}

/**
 * Step 4, the passing half: the active player plays no Action card and the turn goes on to the roll.
 *
 * Playing one is `state/skill-play.js`, because a card's effect is a rule and this file holds none.
 * What is here is the part that is purely the sequence: the phase moves on.
 */
export function passAction(state) {
  assertPhase(state, TURN_PHASE.ACTION);

  return nextState(state, { phase: TURN_PHASE.ROLL });
}

/**
 * Steps 5 and 6: roll the chosen die and work out what the active player can do with it.
 *
 * The roll is `core/roll.js`'s chain rather than a single call, so every modifier a card wrote into
 * `state.modifiers` applies here, in the documented order. `rollSteps` keeps the trace so the screen
 * can explain a number that three cards had a hand in (NFR-08).
 *
 * When nothing can be done the turn goes straight to its end and carries the reason with it (FR-14).
 * The reason comes from `core/movement.js` rather than being decided here, because it is a rule and not
 * a presentation choice.
 */
export function rollChosenDie(state, deps) {
  assertPhase(state, TURN_PHASE.ROLL);

  const rolled = resolveRoll({ dieMax: state.chosenDie, modifiers: state.modifiers }, deps.rng);
  const result = evaluateTurn(
    state.pawns,
    state.activePlayer,
    rolled.roll,
    state.chosenDie,
    boardOf(state)
  );

  return nextState(state, {
    roll: rolled.roll,
    rollSteps: rolled.steps,
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
 * Step 7: the active player commits to a move, and the reaction window opens.
 *
 * The move is looked up in `state.legalMoves` rather than trusted from the caller. A caller that built
 * its own move object would be a second place where the rules are applied.
 *
 * **This no longer resolves the move.** Until issue #38 the committing intent ran step 8 as well,
 * because there was nothing to put between them. Now there is, and the split is what lets a Reaction
 * card be played against a capture that has been declared and not yet happened (FR-25).
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
    return nextState(state, { phase: TURN_PHASE.TURN_END });
  }

  // Three steps in one transition, and the order is the rule: the pawn arrives, then a trap it walked
  // into goes off, and only then is the square it is actually standing on asked whether it hands out a
  // card. A trap can move the pawn, so asking about the skill square first would ask about a square the
  // pawn is no longer on.
  const moved = { ...state, pawns: applyMove(state.pawns, move) };
  const sprung = { ...moved, ...trapChanges(moved, move, deps) };
  const board = { pawns: sprung.pawns, statuses: sprung.statuses, traps: sprung.traps };

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

  return nextState(state, {
    ...board,
    pendingMove: null,
    ...skillSquareChanges(sprung, { ...move, to: landed.r }, deps),
    phase: TURN_PHASE.TURN_END,
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
  return nextState(state, { pendingMove: null, phase: TURN_PHASE.TURN_END });
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
