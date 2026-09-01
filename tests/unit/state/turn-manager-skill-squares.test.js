/**
 * Using up a skill square when a move resolves. Issue #38, requirement FR-22.
 *
 * Split out of `turn-manager.test.js` when that file passed 300 lines. The seam is a real one: every
 * case here pins the skill squares to one known place and asserts what happens to **the board**, while
 * the cases left behind assert what happens to **the turn**.
 */

import { describe, expect, it } from "vitest";

import { HOME_R, START_R } from "../../../src/core/board.js";
import { fixedDieSource } from "../../../src/core/dice-source.js";
import { findPawn } from "../../../src/core/pawns.js";
import { INITIAL_SKILL_SQUARES } from "../../../src/core/skill-squares.js";
import { MATCH_STATUS, createGameState, nextState } from "../../../src/state/game-state.js";
import {
  chooseDie,
  commitMove,
  drawHand,
  passAction,
  resolveMove,
  rollChosenDie,
} from "../../../src/state/turn-manager.js";
import { pawnsAt, rngForRolls } from "../../helpers/fixtures.js";

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

    return { state: rollChosenDie(passAction(chooseDie(drawHand(start, d), 6)), d), deps: d };
  }

  it("moves the square somewhere else when a pawn lands on it", () => {
    // Seat 0 enters on square 0, so r = 5 is absolute square 4.
    const { state, deps: d } = onBoard([4], pawnsAt(2, { "0.0": 1 }), [4]);
    const resolved = resolveMove(commitMove(state, 0), d);

    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(5);
    expect(resolved.skillSquares).toHaveLength(1);
    expect(resolved.skillSquares).not.toContain(4);
  });

  it("leaves the board alone when the pawn merely passes over the square", () => {
    // Crossing does not count. Otherwise a D20 would collect several squares in one move and a D2
    // almost none, which makes "always take the biggest die" the only sensible choice.
    const { state, deps: d } = onBoard([4], pawnsAt(2, { "0.0": 1 }), [6]);
    const resolved = resolveMove(commitMove(state, 0), d);

    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(7);
    expect(resolved.skillSquares).toEqual([4]);
  });

  it("leaves the board alone on an ordinary square", () => {
    const { state, deps: d } = onBoard([4], pawnsAt(2, { "0.0": 1 }), [3]);

    expect(resolveMove(commitMove(state, 0), d).skillSquares).toEqual([4]);
  });

  it("does not trigger for the pawn that was captured, only for the one that moved", () => {
    // Seat 2 at r = 21 stands on absolute square 0. Seat 0's pawn at r = 4 rolls a 1 onto absolute
    // square 4, a skill square, and there is no capture. Then the reverse: a capture that lands on a
    // square that is not a skill square must change nothing, and a captured pawn goes to its start
    // area, which is not a track square at all.
    const captureBoard = onBoard([4], pawnsAt(2, { "0.0": 0, "2.0": 21 }), [6]);
    const resolved = resolveMove(commitMove(captureBoard.state, 0), captureBoard.deps);

    expect(findPawn(resolved.pawns, { player: 2, pawn: 0 }).r).toBe(START_R);
    expect(resolved.skillSquares).toEqual([4]);
  });

  it("does not use up a square on the move that wins the match", () => {
    // The win branch returns early. That is deliberate rather than an oversight: nothing happens after
    // the match ends, so a card earned on the winning move would have nowhere to go.
    const pawns = pawnsAt(2, { "0.0": 40, "0.1": 42, "0.2": 43, "0.3": HOME_R });
    const { state, deps: d } = onBoard([4], pawns, [1]);
    const resolved = resolveMove(commitMove(state, 0), d);

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
    const state = rollChosenDie(passAction(chooseDie(drawHand(start, d), 6)), d);
    const resolved = resolveMove(commitMove(state, 0), d);

    expect(findPawn(resolved.pawns, { player: 2, pawn: 0 }).r).toBe(5);
    expect(resolved.skillSquares).not.toContain(24);
  });
});
