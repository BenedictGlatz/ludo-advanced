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
  passAction,
  resolveMove,
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
  return { state: rollChosenDie(passAction(chooseDie(drawHand(start, d), 6)), d), deps: d };
}

describe("the nine-step sequence (section 3 of the game design document)", () => {
  /**
   * Every test in this file builds its state from `createGameState`, which starts with an **empty**
   * skill card pool. That is what keeps the scripted roll sequences below exact: `drawHand` now draws
   * a skill card as well, and a draw from an empty pool spends no randomness at all.
   *
   * `match.test.js` covers the other half, a match started through `startMatch` with the pool
   * shuffled, and it deliberately does not script individual rolls.
   */
  it("draws, chooses, passes on the action, rolls and lands in the act phase", () => {
    const d = deps([6]);

    const drawn = drawHand(createGameState(2), d);
    expect(drawn.phase).toBe(TURN_PHASE.CHOOSE);
    expect(drawn.hand).toEqual([6]);

    const chosen = chooseDie(drawn, 6);
    expect(chosen.phase).toBe(TURN_PHASE.ACTION);
    expect(chosen.chosenDie).toBe(6);

    // The step issue #38 added. Nothing is rolled until the player has had their chance to play a
    // card, which is what makes an Action card that changes the roll worth holding.
    const passed = passAction(chosen);
    expect(passed.phase).toBe(TURN_PHASE.ROLL);
    expect(passed.roll).toBeNull();

    const rolled = rollChosenDie(passed, d);
    expect(rolled.phase).toBe(TURN_PHASE.ACT);
    expect(rolled.roll).toBe(6);
    expect(rolled.legalMoves).toHaveLength(4);
    expect(rolled.refusalReason).toBeNull();
  });

  /**
   * The roll trace exists so the screen can explain a number that cards had a hand in (NFR-08). With
   * no card played it is one entry, and asserting that here is what makes the entry for a modified
   * roll meaningful rather than decorative.
   */
  it("records how the roll came about, even when nothing modified it", () => {
    const { state } = afterRoll(pawnsAt(2), [6]);

    expect(state.rollSteps).toEqual([{ step: "base", value: 6, faces: 6 }]);
  });

  it("goes straight to the end of the turn when nothing can move, and says why (FR-14)", () => {
    const { state } = afterRoll(pawnsAt(2), [3]);

    expect(state.phase).toBe(TURN_PHASE.TURN_END);
    expect(state.legalMoves).toEqual([]);
    expect(state.refusalReason).toBe(REFUSAL.NEEDS_MAXIMUM);
  });

  it("opens the reaction window between committing and resolving a move", () => {
    const { state, deps: d } = afterRoll(pawnsAt(2), [6]);

    const committed = commitMove(state, 0);
    expect(committed.phase).toBe(TURN_PHASE.REACTION);
    expect(committed.pendingMove.to).toBe(1);
    // Nothing has moved yet: the window is open and the move is still pending.
    expect(findPawn(committed.pawns, { player: 0, pawn: 0 }).r).toBe(0);

    const resolved = resolveMove(committed, d);
    expect(resolved.phase).toBe(TURN_PHASE.TURN_END);
    expect(resolved.pendingMove).toBeNull();
    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(1);
  });

  it("sends a captured pawn back to its start area when the move resolves (FR-11)", () => {
    // A two-player match seats the opponent on seat 2, and player 2 at r = 21 stands on absolute
    // square 0, which is player 0's entry square.
    const { state, deps: d } = afterRoll(pawnsAt(2, { "2.0": 21 }), [6]);

    expect(state.legalMoves[0].captures).toEqual({ player: 2, pawn: 0 });

    const resolved = resolveMove(commitMove(state, 0), d);

    expect(findPawn(resolved.pawns, { player: 2, pawn: 0 }).r).toBe(START_R);
    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(1);
  });

  it("ends the match the moment the fourth pawn reaches the house (FR-05)", () => {
    // Three pawns already fill the back of the house, so the last one only needs r = 41.
    const pawns = pawnsAt(2, { "0.0": 40, "0.1": 42, "0.2": 43, "0.3": HOME_R });
    const { state, deps: d } = afterRoll(pawns, [1]);
    const resolved = resolveMove(commitMove(state, 0), d);

    expect(resolved.status).toBe(MATCH_STATUS.WON);
    expect(resolved.phase).toBe(TURN_PHASE.MATCH_OVER);
    expect(resolved.winner).toBe(0);
  });
});

describe("turn order (FR-04)", () => {
  it("rotates through the seated players and wraps, for 2, 3 and 4 players", () => {
    // The seats are not 0..playerCount-1. Two players sit opposite each other, on 0 and 2, so a
    // rotation that counted upward would hand the turn to an empty seat.
    const seatOrder = { 2: [0, 2], 3: [0, 1, 2], 4: [0, 1, 2, 3] };

    for (const playerCount of [2, 3, 4]) {
      const seats = seatOrder[playerCount];
      const d = deps(Array.from({ length: playerCount * 2 }, () => 3));
      let state = createGameState(playerCount);
      const seen = [];

      expect(state.seats).toEqual(seats);

      for (let turn = 0; turn < playerCount * 2; turn += 1) {
        seen.push(state.activePlayer);
        state = rollChosenDie(passAction(chooseDie(drawHand(state, d), 6)), d);
        state = endTurn(state, d);
      }

      expect(seen).toEqual([...seats, ...seats]);
      expect(state.turnNumber).toBe(playerCount * 2 + 1);
    }
  });

  it("clears everything that belonged to the finished turn", () => {
    const { state, deps: d } = afterRoll(pawnsAt(2), [6]);
    const ended = endTurn(resolveMove(commitMove(state, 0), d), d);

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

    const rolled = rollChosenDie(passAction(chooseDie(drawHand(createGameState(2), d), 6)), d);
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
    expect(() => passAction(fresh)).toThrow(/expected phase "action"/);
    expect(() => rollChosenDie(fresh, d)).toThrow(/expected phase "roll"/);
    expect(() => commitMove(fresh, 0)).toThrow(/expected phase "act"/);
    expect(() => resolveMove(fresh)).toThrow(/expected phase "reaction"/);
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
