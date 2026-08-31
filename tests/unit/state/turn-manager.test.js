import { describe, expect, it } from "vitest";

import { HOME_R, START_R } from "../../../src/core/board.js";
import { fixedDieSource } from "../../../src/core/dice-source.js";
import { REFUSAL } from "../../../src/core/movement.js";
import { findPawn } from "../../../src/core/pawns.js";
import { INITIAL_SKILL_SQUARES } from "../../../src/core/skill-squares.js";
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
    const { state, deps: d } = afterRoll(pawnsAt(2), [6]);

    const committed = commitMove(state, 0);
    expect(committed.phase).toBe(TURN_PHASE.REACTION);
    expect(committed.pendingMove.to).toBe(1);
    // Nothing has moved yet: the window is open and the move is still pending.
    expect(findPawn(committed.pawns, { player: 0, pawn: 0 }).r).toBe(0);

    const resolved = resolveReactions(committed, d);
    expect(resolved.phase).toBe(TURN_PHASE.TURN_END);
    expect(resolved.pendingMove).toBeNull();
    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(1);
  });

  it("sends a captured pawn back to its start area when the move resolves (FR-11)", () => {
    // A two-player match seats the opponent on seat 2, and player 2 at r = 21 stands on absolute
    // square 0, which is player 0's entry square.
    const { state, deps: d } = afterRoll(pawnsAt(2, { "2.0": 21 }), [6]);

    expect(state.legalMoves[0].captures).toEqual({ player: 2, pawn: 0 });

    const resolved = resolveReactions(commitMove(state, 0), d);

    expect(findPawn(resolved.pawns, { player: 2, pawn: 0 }).r).toBe(START_R);
    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(1);
  });

  it("ends the match the moment the fourth pawn reaches the house (FR-05)", () => {
    // Three pawns already fill the back of the house, so the last one only needs r = 41.
    const pawns = pawnsAt(2, { "0.0": 40, "0.1": 42, "0.2": 43, "0.3": HOME_R });
    const { state, deps: d } = afterRoll(pawns, [1]);
    const resolved = resolveReactions(commitMove(state, 0), d);

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
        state = rollChosenDie(chooseDie(drawHand(state, d), 6), d);
        state = endTurn(state, d);
      }

      expect(seen).toEqual([...seats, ...seats]);
      expect(state.turnNumber).toBe(playerCount * 2 + 1);
    }
  });

  it("clears everything that belonged to the finished turn", () => {
    const { state, deps: d } = afterRoll(pawnsAt(2), [6]);
    const ended = endTurn(resolveReactions(commitMove(state, 0), d), d);

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

describe("using up a skill square when a move resolves (FR-22)", () => {
  /**
   * A state in the `act` phase with a scripted roll, on a board whose skill squares are pinned.
   *
   * The rolls have to be scripted through `rngForRolls`, and the respawn draws from the same `rng`.
   * Every test here therefore scripts exactly one roll and then never rolls again, so the second draw
   * the generator is asked for is the respawn and nothing else depends on it.
   */
  function onBoard(skillSquares, pawns, rolls) {
    const d = { rng: rngForRolls([...rolls, 1], 6), diceSource: fixedDieSource(6) };
    const start = nextState(createGameState(2, skillSquares), { pawns });

    return { state: rollChosenDie(chooseDie(drawHand(start, d), 6), d), deps: d };
  }

  it("moves the square somewhere else when a pawn lands on it", () => {
    // Seat 0 enters on square 0, so r = 5 is absolute square 4.
    const { state, deps: d } = onBoard([4], pawnsAt(2, { "0.0": 1 }), [4]);
    const resolved = resolveReactions(commitMove(state, 0), d);

    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(5);
    expect(resolved.skillSquares).toHaveLength(1);
    expect(resolved.skillSquares).not.toContain(4);
  });

  it("leaves the board alone when the pawn merely passes over the square", () => {
    // Crossing does not count. Otherwise a D20 would collect several squares in one move and a D2
    // almost none, which makes "always take the biggest die" the only sensible choice.
    const { state, deps: d } = onBoard([4], pawnsAt(2, { "0.0": 1 }), [6]);
    const resolved = resolveReactions(commitMove(state, 0), d);

    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(7);
    expect(resolved.skillSquares).toEqual([4]);
  });

  it("leaves the board alone on an ordinary square", () => {
    const { state, deps: d } = onBoard([4], pawnsAt(2, { "0.0": 1 }), [3]);

    expect(resolveReactions(commitMove(state, 0), d).skillSquares).toEqual([4]);
  });

  it("does not trigger for the pawn that was captured, only for the one that moved", () => {
    // Seat 2 at r = 21 stands on absolute square 0. Seat 0's pawn at r = 4 rolls a 1 onto absolute
    // square 4, a skill square, and there is no capture. Then the reverse: a capture that lands on a
    // square that is not a skill square must change nothing, and a captured pawn goes to its start
    // area, which is not a track square at all.
    const captureBoard = onBoard([4], pawnsAt(2, { "0.0": 0, "2.0": 21 }), [6]);
    const resolved = resolveReactions(commitMove(captureBoard.state, 0), captureBoard.deps);

    expect(findPawn(resolved.pawns, { player: 2, pawn: 0 }).r).toBe(START_R);
    expect(resolved.skillSquares).toEqual([4]);
  });

  it("does not use up a square on the move that wins the match", () => {
    // The win branch returns early. That is deliberate rather than an oversight: nothing happens after
    // the match ends, so a card earned on the winning move would have nowhere to go.
    const pawns = pawnsAt(2, { "0.0": 40, "0.1": 42, "0.2": 43, "0.3": HOME_R });
    const { state, deps: d } = onBoard([4], pawns, [1]);
    const resolved = resolveReactions(commitMove(state, 0), d);

    expect(resolved.status).toBe(MATCH_STATUS.WON);
    expect(resolved.skillSquares).toEqual([4]);
  });

  it("starts a match with the real eight-square layout when nothing is pinned", () => {
    expect(createGameState(2).skillSquares).toEqual(INITIAL_SKILL_SQUARES);
  });

  it("sees the same square through a second player's numbering", () => {
    // Seat 2 enters on square 20, so its r = 5 is absolute square 24. Pinning 24 and moving seat 2 is
    // the check that the conversion uses the moving pawn's own entry square and not seat 0's: a
    // version that always used seat 0 would look for absolute 4 and find nothing.
    const d = { rng: rngForRolls([4, 1], 6), diceSource: fixedDieSource(6) };
    const start = nextState(createGameState(2, [24]), {
      pawns: pawnsAt(2, { "2.0": 1 }),
      activePlayer: 2,
    });
    const state = rollChosenDie(chooseDie(drawHand(start, d), 6), d);
    const resolved = resolveReactions(commitMove(state, 0), d);

    expect(findPawn(resolved.pawns, { player: 2, pawn: 0 }).r).toBe(5);
    expect(resolved.skillSquares).not.toContain(24);
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
