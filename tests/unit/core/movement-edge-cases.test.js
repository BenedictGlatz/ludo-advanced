/**
 * One test per row of the edge-case table in section 8 of the game design document, plus the
 * `applyMove` writes and the single-pawn journey that is half of acceptance criterion SG1.
 *
 * The table exists so that nobody has to re-derive these under time pressure during implementation.
 * Testing it row by row is what stops the table and the code from drifting apart.
 */

import { describe, expect, it } from "vitest";

import { HOME_R, START_R, absoluteSquare, isSameSquare } from "../../../src/core/board.js";
import { MOVE_KIND, REFUSAL, applyMove, evaluateTurn } from "../../../src/core/movement.js";
import { findPawn, pawnsOf } from "../../../src/core/pawns.js";
import { hasWon } from "../../../src/core/win.js";
import { pawnsAt } from "../../helpers/fixtures.js";

describe("entry square blocked by an own pawn when the maximum is rolled", () => {
  it("makes leaving the start area illegal that turn", () => {
    const pawns = pawnsAt(2, { "0.0": 1 });
    const result = evaluateTurn(pawns, 0, 6, 6);

    expect(result.moves.some((move) => move.kind === MOVE_KIND.LEAVE_START)).toBe(false);
    expect(
      result.refusals.filter((entry) => entry.reason === REFUSAL.OWN_PAWN).map((e) => e.pawn)
    ).toEqual([1, 2, 3]);
  });
});

describe("entry square held by an opponent when the maximum is rolled", () => {
  it("makes the entering pawn capture it, because entry squares are not safe (FR-15)", () => {
    // Player 1 at r = 40 stands on absolute square 0, which is player 0's entry square.
    expect(absoluteSquare(1, 40)).toBe(absoluteSquare(0, 1));

    const pawns = pawnsAt(2, { "1.0": 40 });
    const move = evaluateTurn(pawns, 0, 6, 6).moves[0];

    expect(move.kind).toBe(MOVE_KIND.LEAVE_START);
    expect(move.captures).toEqual({ player: 1, pawn: 0 });

    const after = applyMove(pawns, move);
    expect(findPawn(after, { player: 1, pawn: 0 }).r).toBe(START_R);
    expect(findPawn(after, { player: 0, pawn: 0 }).r).toBe(1);
  });
});

describe("the maximum rolled with no pawn in the start area", () => {
  it("is not wasted: it becomes an ordinary move", () => {
    const pawns = pawnsAt(2, { "0.0": 10, "0.1": 20, "0.2": 30, "0.3": 40 });
    const result = evaluateTurn(pawns, 0, 6, 6);

    expect(result.moves).toHaveLength(4);
    expect(result.moves.every((move) => move.kind === MOVE_KIND.ADVANCE)).toBe(true);
    expect(result.moves.map((move) => move.to)).toEqual([16, 26, 36, 46]);
  });
});

describe("two own pawns on one square", () => {
  it("cannot happen after any legal move, from any of these positions", () => {
    const positions = [
      { "0.0": 1, "0.1": 7, "0.2": 13, "0.3": 19 },
      { "0.0": 46, "0.1": 50, "0.2": 53, "0.3": 55 },
      { "0.0": 52, "0.1": 57, "0.2": HOME_R },
      { "0.1": 1, "0.2": 2 },
    ];

    for (const position of positions) {
      const pawns = pawnsAt(2, position);

      for (let roll = 1; roll <= 6; roll += 1) {
        for (const move of evaluateTurn(pawns, 0, roll, 6).moves) {
          const own = pawnsOf(applyMove(pawns, move), 0);

          for (let a = 0; a < own.length; a += 1) {
            for (let b = a + 1; b < own.length; b += 1) {
              expect(isSameSquare(own[a], own[b])).toBe(false);
            }
          }
        }
      }
    }
  });
});

describe("a pawn captured while the player's others are home", () => {
  it("restarts at r = 0 and has to leave again under FR-09", () => {
    // Player 0 has three pawns home and one on the track. Player 1 leaves the start area onto it.
    const pawns = pawnsAt(2, { "0.0": 14, "0.1": HOME_R, "0.2": HOME_R, "0.3": HOME_R });
    const capturing = evaluateTurn(pawns, 1, 6, 6).moves[0];

    expect(capturing.captures).toEqual({ player: 0, pawn: 0 });

    const after = applyMove(pawns, capturing);
    expect(findPawn(after, { player: 0, pawn: 0 }).r).toBe(START_R);
    expect(hasWon(after, 0)).toBe(false);

    // Back at r = 0, only the die's maximum gets it out again.
    expect(evaluateTurn(after, 0, 5, 6).moves).toEqual([]);
    expect(evaluateTurn(after, 0, 5, 6).reason).toBe(REFUSAL.NEEDS_MAXIMUM);
    expect(evaluateTurn(after, 0, 6, 6).moves).toHaveLength(1);
  });

  it("leaves the pawns that are already home where they are", () => {
    const pawns = pawnsAt(2, { "0.0": 14, "0.1": HOME_R, "0.2": HOME_R, "0.3": HOME_R });
    const after = applyMove(pawns, evaluateTurn(pawns, 1, 6, 6).moves[0]);

    for (const pawn of [1, 2, 3]) {
      expect(findPawn(after, { player: 0, pawn }).r).toBe(HOME_R);
    }
  });

  it("never offers a move for a pawn that is home", () => {
    const pawns = pawnsAt(2, { "0.0": HOME_R });

    for (let roll = 1; roll <= 6; roll += 1) {
      const result = evaluateTurn(pawns, 0, roll, 6);
      expect(result.moves.some((move) => move.pawn === 0)).toBe(false);
      expect(result.refusals.find((entry) => entry.pawn === 0).reason).toBe(REFUSAL.ALREADY_HOME);
    }
  });
});

describe("applyMove", () => {
  it("never writes to the list it was given", () => {
    const before = pawnsAt(2, { "1.0": 40 });
    const snapshot = JSON.stringify(before);

    applyMove(before, evaluateTurn(before, 0, 6, 6).moves[0]);

    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it("throws on a stale move rather than corrupting the board", () => {
    const pawns = pawnsAt(2, { "0.0": 10 });
    const move = evaluateTurn(pawns, 0, 4, 6).moves.find((entry) => entry.pawn === 0);
    const moved = applyMove(pawns, move);

    expect(() => applyMove(moved, move)).toThrow(/stale move/);
  });
});

describe("one pawn from the start area to home (acceptance criterion SG1)", () => {
  it("walks the full 58 steps on a scripted sequence of D6 rolls", () => {
    const rolls = [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3];
    const expected = [1, 7, 13, 19, 25, 31, 37, 43, 49, 55, HOME_R];

    let pawns = pawnsAt(2);
    for (let turn = 0; turn < rolls.length; turn += 1) {
      const move = evaluateTurn(pawns, 0, rolls[turn], 6).moves.find((entry) => entry.pawn === 0);

      expect(move, `no legal move for pawn 0 on roll ${rolls[turn]}`).toBeDefined();
      pawns = applyMove(pawns, move);
      expect(findPawn(pawns, { player: 0, pawn: 0 }).r).toBe(expected[turn]);
    }

    expect(findPawn(pawns, { player: 0, pawn: 0 }).r).toBe(HOME_R);
    expect(hasWon(pawns, 0)).toBe(false);
  });
});
