import { describe, expect, it } from "vitest";

import { HOME_R, START_R } from "../../../src/core/board.js";
import { fixedDieSource } from "../../../src/core/dice-source.js";
import { REFUSAL } from "../../../src/core/movement.js";
import { findPawn } from "../../../src/core/pawns.js";
import {
  MATCH_STATUS,
  TURN_PHASE,
  createGameState,
  nextState,
} from "../../../src/state/game-state.js";
import {
  chooseDie,
  commitMove,
  drawHand,
  endTurn,
  moveForPawn,
  movablePawns,
  resolveReactions,
  rollChosenDie,
  selectPawn,
} from "../../../src/state/turn-manager.js";
import { pawnsAt, rngForRolls } from "../../helpers/fixtures.js";

/** A match of `playerCount` players with a scripted roll sequence and the D6 stand-in pool. */
function deps(rolls) {
  return { rng: rngForRolls(rolls, 6), diceSource: fixedDieSource(6) };
}

/** A state in the `act` phase, with `pawns` on the board and `roll` already made. */
function afterRoll(pawns, rolls, playerCount = 2) {
  const d = deps(rolls);
  const start = nextState(createGameState(playerCount), { pawns });
  return { state: rollChosenDie(chooseDie(drawHand(start, d), 6), d), deps: d };
}

describe("the eight-step sequence (section 3 of the game design document)", () => {
  it("draws, chooses, rolls and lands in the act phase", () => {
    const d = deps([6]);

    const drawn = drawHand(createGameState(2), d);
    expect(drawn.phase).toBe(TURN_PHASE.CHOOSE);
    expect(drawn.hand).toEqual([6]);

    const chosen = chooseDie(drawn, 6);
    expect(chosen.phase).toBe(TURN_PHASE.ROLL);
    expect(chosen.chosenDie).toBe(6);

    const rolled = rollChosenDie(chosen, d);
    expect(rolled.phase).toBe(TURN_PHASE.ACT);
    expect(rolled.roll).toBe(6);
    expect(rolled.legalMoves).toHaveLength(4);
    expect(rolled.refusalReason).toBeNull();
  });

  it("goes straight to the end of the turn when nothing can move, and says why (FR-14)", () => {
    const { state } = afterRoll(pawnsAt(2), [3]);

    expect(state.phase).toBe(TURN_PHASE.TURN_END);
    expect(state.legalMoves).toEqual([]);
    expect(state.refusalReason).toBe(REFUSAL.NEEDS_MAXIMUM);
  });

  it("opens the reaction window between committing and resolving a move", () => {
    const { state } = afterRoll(pawnsAt(2), [6]);

    const committed = commitMove(state, 0);
    expect(committed.phase).toBe(TURN_PHASE.REACTION);
    expect(committed.pendingMove.to).toBe(1);
    // Nothing has moved yet: the window is open and the move is still pending.
    expect(findPawn(committed.pawns, { player: 0, pawn: 0 }).r).toBe(0);

    const resolved = resolveReactions(committed);
    expect(resolved.phase).toBe(TURN_PHASE.TURN_END);
    expect(resolved.pendingMove).toBeNull();
    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(1);
  });

  it("sends a captured pawn back to its start area when the move resolves (FR-11)", () => {
    // Player 1 at r = 40 stands on absolute square 0, which is player 0's entry square.
    const { state } = afterRoll(pawnsAt(2, { "1.0": 40 }), [6]);

    expect(state.legalMoves[0].captures).toEqual({ player: 1, pawn: 0 });

    const resolved = resolveReactions(commitMove(state, 0));

    expect(findPawn(resolved.pawns, { player: 1, pawn: 0 }).r).toBe(START_R);
    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(1);
  });

  it("ends the match the moment the fourth pawn arrives home (FR-05)", () => {
    const pawns = pawnsAt(2, { "0.0": 55, "0.1": HOME_R, "0.2": HOME_R, "0.3": HOME_R });
    const { state } = afterRoll(pawns, [3]);
    const resolved = resolveReactions(commitMove(state, 0));

    expect(resolved.status).toBe(MATCH_STATUS.WON);
    expect(resolved.phase).toBe(TURN_PHASE.MATCH_OVER);
    expect(resolved.winner).toBe(0);
  });
});

describe("turn order (FR-04)", () => {
  it("rotates in a fixed order and wraps, for 2, 3 and 4 players", () => {
    for (const playerCount of [2, 3, 4]) {
      const d = deps(Array.from({ length: playerCount * 2 }, () => 3));
      let state = createGameState(playerCount);
      const seen = [];

      for (let turn = 0; turn < playerCount * 2; turn += 1) {
        seen.push(state.activePlayer);
        state = rollChosenDie(chooseDie(drawHand(state, d), 6), d);
        state = endTurn(state, d);
      }

      const expected = Array.from({ length: playerCount * 2 }, (_, i) => i % playerCount);
      expect(seen).toEqual(expected);
      expect(state.turnNumber).toBe(playerCount * 2 + 1);
    }
  });

  it("clears everything that belonged to the finished turn", () => {
    const { state, deps: d } = afterRoll(pawnsAt(2), [6]);
    const ended = endTurn(resolveReactions(commitMove(state, 0)), d);

    expect(ended.hand).toEqual([]);
    expect(ended.legalMoves).toEqual([]);
    expect(ended.chosenDie).toBeNull();
    expect(ended.roll).toBeNull();
    expect(ended.selectedPawn).toBeNull();
    expect(ended.refusalReason).toBeNull();
    expect(ended.phase).toBe(TURN_PHASE.DRAW);
  });

  it("gives the drawn cards back to the pool (FR-21)", () => {
    const returned = [];
    const d = {
      rng: rngForRolls([3], 6),
      diceSource: { handSize: 1, draw: () => [6], returnHand: (hand) => returned.push(hand) },
    };

    const rolled = rollChosenDie(chooseDie(drawHand(createGameState(2), d), 6), d);
    endTurn(rolled, d);

    expect(returned).toEqual([[6]]);
  });
});

describe("what the view needs from a turn", () => {
  it("lists the pawns that can move, without duplicates", () => {
    const { state } = afterRoll(pawnsAt(2, { "0.0": 10, "0.1": 20 }), [4]);

    expect(movablePawns(state)).toEqual([0, 1]);
  });

  it("finds the single move for a pawn, or null", () => {
    const { state } = afterRoll(pawnsAt(2, { "0.0": 10 }), [4]);

    expect(moveForPawn(state, 0).to).toBe(14);
    expect(moveForPawn(state, 1)).toBeNull();
  });

  it("records a selected pawn without moving anything (FR-32)", () => {
    const { state } = afterRoll(pawnsAt(2, { "0.0": 10 }), [4]);
    const selected = selectPawn(state, 0);

    expect(selected.selectedPawn).toBe(0);
    expect(selected.pawns).toBe(state.pawns);
  });
});

describe("the phase guards", () => {
  it("refuse every step taken out of order", () => {
    const d = deps([6, 6]);
    const fresh = createGameState(2);

    expect(() => chooseDie(fresh, 6)).toThrow(/expected phase "choose"/);
    expect(() => rollChosenDie(fresh, d)).toThrow(/expected phase "roll"/);
    expect(() => commitMove(fresh, 0)).toThrow(/expected phase "act"/);
    expect(() => resolveReactions(fresh)).toThrow(/expected phase "reaction"/);
    expect(() => endTurn(fresh, d)).toThrow(/expected phase "turn-end"/);
    expect(() => drawHand(drawHand(fresh, d), d)).toThrow(/expected phase "draw"/);
  });

  it("refuse a card that is not in the drawn hand", () => {
    const drawn = drawHand(createGameState(2), deps([6]));

    expect(() => chooseDie(drawn, 20)).toThrow(/no card with 20 faces/);
  });

  it("refuse a pawn that has no legal move", () => {
    const { state } = afterRoll(pawnsAt(2, { "0.0": 10 }), [4]);

    expect(() => commitMove(state, 1)).toThrow(/no legal move/);
    expect(() => selectPawn(state, 1)).toThrow(/no legal move/);
  });

  it("refuse a dice source that draws nothing", () => {
    const d = { rng: rngForRolls([1], 6), diceSource: { draw: () => [] } };

    expect(() => drawHand(createGameState(2), d)).toThrow(/empty hand/);
  });
});
