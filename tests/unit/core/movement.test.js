import { describe, expect, it } from "vitest";

import { HOME_R, START_R } from "../../../src/core/board.js";
import { MOVE_KIND, REFUSAL, evaluateTurn, legalMoves } from "../../../src/core/movement.js";
import { pawnsAt } from "../../helpers/fixtures.js";

describe("leaving the start area (FR-09)", () => {
  it("is offered only on the die's maximum", () => {
    const pawns = pawnsAt(2);

    for (let roll = 1; roll < 6; roll += 1) {
      expect(legalMoves(pawns, 0, roll, 6)).toEqual([]);
    }
    expect(legalMoves(pawns, 0, 6, 6)).toHaveLength(4);
  });

  it("works the same for a D2 and a D20, because the rule is written against the maximum", () => {
    const pawns = pawnsAt(2);

    expect(legalMoves(pawns, 0, 2, 2)).toHaveLength(4);
    expect(legalMoves(pawns, 0, 19, 20)).toEqual([]);
    expect(legalMoves(pawns, 0, 20, 20)).toHaveLength(4);
  });

  it("puts the pawn on the entry square and spends the whole roll", () => {
    const [move] = legalMoves(pawnsAt(2), 0, 6, 6);

    expect(move).toEqual({
      player: 0,
      pawn: 0,
      kind: MOVE_KIND.LEAVE_START,
      from: START_R,
      to: 1,
      captures: null,
    });
  });

  it("names the reason when the roll was not the maximum", () => {
    const result = evaluateTurn(pawnsAt(2), 0, 3, 6);

    expect(result.moves).toEqual([]);
    expect(result.reason).toBe(REFUSAL.NEEDS_MAXIMUM);
    expect(result.refusals).toHaveLength(4);
  });
});

describe("advancing (FR-10)", () => {
  it("moves the pawn exactly the number rolled", () => {
    const pawns = pawnsAt(2, { "0.0": 10 });
    const move = legalMoves(pawns, 0, 4, 6).find((entry) => entry.pawn === 0);

    expect(move.kind).toBe(MOVE_KIND.ADVANCE);
    expect(move.from).toBe(10);
    expect(move.to).toBe(14);
  });

  it("passes over occupied squares freely, because only the landing square is checked", () => {
    // Player 1's pawn sits on absolute square 13, which player 0 crosses at r = 14.
    const pawns = pawnsAt(2, { "0.0": 10, "1.0": 1 });
    const move = legalMoves(pawns, 0, 6, 6).find((entry) => entry.pawn === 0);

    expect(move.to).toBe(16);
    expect(move.captures).toBeNull();
  });

  it("carries the pawn into its own home column and then home", () => {
    const pawns = pawnsAt(2, { "0.0": 52 });
    const move = legalMoves(pawns, 0, 6, 6).find((entry) => entry.pawn === 0);

    expect(move.to).toBe(HOME_R);
  });
});

describe("an own pawn on the target square (FR-12)", () => {
  it("is not offered as a move", () => {
    const pawns = pawnsAt(2, { "0.0": 10, "0.1": 14 });
    const moves = legalMoves(pawns, 0, 4, 6);

    expect(moves.find((entry) => entry.pawn === 0)).toBeUndefined();
  });

  it("blocks in the home column too", () => {
    const pawns = pawnsAt(2, { "0.0": 53, "0.1": 55 });
    const moves = legalMoves(pawns, 0, 2, 6);

    expect(moves.find((entry) => entry.pawn === 0)).toBeUndefined();
  });

  it("does not block at home, which holds four separate slots", () => {
    const pawns = pawnsAt(2, { "0.0": 52, "0.1": HOME_R });
    const move = legalMoves(pawns, 0, 6, 6).find((entry) => entry.pawn === 0);

    expect(move.to).toBe(HOME_R);
  });

  it("marks each blocked pawn with its own reason, which is what the screen shows (FR-32)", () => {
    const pawns = pawnsAt(2, { "0.0": 40, "0.1": 46, "0.2": 52, "0.3": HOME_R });
    const result = evaluateTurn(pawns, 0, 6, 6);
    const blocked = result.refusals.filter((entry) => entry.reason === REFUSAL.OWN_PAWN);

    expect(blocked.map((entry) => entry.pawn)).toEqual([0, 1]);
  });

  it("can never be the turn-level reason, because the pawn furthest along is never blocked", () => {
    // The tightest chain the board allows: every pawn six steps behind the next one. Three pawns
    // are blocked by their own, and the leader overshoots instead. There is no arrangement where
    // all four are blocked by an own pawn, because r only ever counts upward, so the leader has
    // nobody in front of it. Section 6.3 of the game design document names "every target square
    // blocked by an own pawn" as one of three reasons a turn passes, and this is the negative
    // finding: as a *turn-level* reason it is unreachable. It stays in REFUSAL because it is a real
    // per-pawn reason, and because FR-12 is still unsigned by the Product Owner.
    const pawns = pawnsAt(2, { "0.0": 39, "0.1": 45, "0.2": 51, "0.3": 57 });
    const result = evaluateTurn(pawns, 0, 6, 6);

    expect(result.refusals.map((entry) => entry.reason)).toEqual([
      REFUSAL.OWN_PAWN,
      REFUSAL.OWN_PAWN,
      REFUSAL.OWN_PAWN,
      REFUSAL.OVERSHOOT,
    ]);
    expect(result.reason).toBe(REFUSAL.NONE_AVAILABLE);
  });
});

describe("the exact count into home (FR-13)", () => {
  it("refuses any move that would pass r = 58", () => {
    const pawns = pawnsAt(2, { "0.0": 55 });

    for (let roll = 4; roll <= 6; roll += 1) {
      expect(legalMoves(pawns, 0, roll, 6).find((entry) => entry.pawn === 0)).toBeUndefined();
    }
  });

  it("allows the roll that lands exactly on 58", () => {
    const pawns = pawnsAt(2, { "0.0": 55 });
    const move = legalMoves(pawns, 0, 3, 6).find((entry) => entry.pawn === 0);

    expect(move.to).toBe(HOME_R);
  });

  it("names the reason when every pawn would overshoot", () => {
    const pawns = pawnsAt(2, { "0.0": 57, "0.1": 56, "0.2": 55, "0.3": 54 });
    const result = evaluateTurn(pawns, 0, 6, 6);

    expect(result.moves).toEqual([]);
    expect(result.reason).toBe(REFUSAL.OVERSHOOT);
  });
});

describe("the turn-level reason (FR-14)", () => {
  it("is null while any move exists", () => {
    expect(evaluateTurn(pawnsAt(2), 0, 6, 6).reason).toBeNull();
  });

  it("falls back to none-available when the pawns are stuck for different reasons", () => {
    // Pawn 0 waits in the start area on a non-maximum roll, the other three all overshoot.
    const pawns = pawnsAt(2, { "0.1": 55, "0.2": 56, "0.3": 57 });
    const result = evaluateTurn(pawns, 0, 4, 6);

    expect(result.moves).toEqual([]);
    expect(result.reason).toBe(REFUSAL.NONE_AVAILABLE);
  });

  it("ignores pawns that are already home when picking the reason", () => {
    // Three pawns home, one overshooting. The reason must still be the overshoot.
    const pawns = pawnsAt(2, { "0.0": 57, "0.1": HOME_R, "0.2": HOME_R, "0.3": HOME_R });
    const result = evaluateTurn(pawns, 0, 6, 6);

    expect(result.moves).toEqual([]);
    expect(result.reason).toBe(REFUSAL.OVERSHOOT);
  });
});

describe("input checks", () => {
  it("refuses a roll outside 1 to dieMax", () => {
    for (const roll of [0, 7, -1, 2.5, "3"]) {
      expect(() => legalMoves(pawnsAt(2), 0, roll, 6)).toThrow(RangeError);
    }
  });

  it("refuses a die with fewer than two faces", () => {
    for (const faces of [1, 0, 6.5, "6"]) {
      expect(() => legalMoves(pawnsAt(2), 0, 1, faces)).toThrow(RangeError);
    }
  });
});
