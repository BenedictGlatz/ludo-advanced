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
    // Player 1's pawn sits on absolute square 10, which player 0 crosses at r = 11.
    const pawns = pawnsAt(2, { "0.0": 10, "1.0": 1 });
    const move = legalMoves(pawns, 0, 6, 6).find((entry) => entry.pawn === 0);

    expect(move.to).toBe(16);
    expect(move.captures).toBeNull();
  });

  it("carries the pawn off the track and into its own house", () => {
    const pawns = pawnsAt(2, { "0.0": 40 });
    const move = legalMoves(pawns, 0, 4, 6).find((entry) => entry.pawn === 0);

    expect(move.to).toBe(HOME_R);
  });
});

describe("an own pawn on the target square (FR-12)", () => {
  it("is not offered as a move", () => {
    const pawns = pawnsAt(2, { "0.0": 10, "0.1": 14 });
    const moves = legalMoves(pawns, 0, 4, 6);

    expect(moves.find((entry) => entry.pawn === 0)).toBeUndefined();
  });

  it("blocks inside the house too", () => {
    const pawns = pawnsAt(2, { "0.0": 41, "0.1": 43 });
    const moves = legalMoves(pawns, 0, 2, 6);

    expect(moves.find((entry) => entry.pawn === 0)).toBeUndefined();
  });

  it("blocks on the deepest house square as well, because the house holds one pawn per square", () => {
    // Under the 52-square board this square was a shared "home" with four separate slots, so this
    // move used to be legal. The 40-square board of 2026-08-30 removed that separate home area, and
    // the block here is exactly what forces all four house squares to be filled for FR-05.
    const pawns = pawnsAt(2, { "0.0": 40, "0.1": HOME_R });
    const moves = legalMoves(pawns, 0, 4, 6);

    expect(moves.find((entry) => entry.pawn === 0)).toBeUndefined();
  });

  it("marks each blocked pawn with its own reason, which is what the screen shows (FR-32)", () => {
    const pawns = pawnsAt(2, { "0.0": 26, "0.1": 32, "0.2": 38, "0.3": HOME_R });
    const result = evaluateTurn(pawns, 0, 6, 6);
    const blocked = result.refusals.filter((entry) => entry.reason === REFUSAL.OWN_PAWN);

    expect(blocked.map((entry) => entry.pawn)).toEqual([0, 1, 2]);
    expect(result.refusals.find((entry) => entry.pawn === 3).reason).toBe(REFUSAL.ALREADY_HOME);
  });

  it("can be the turn-level reason once a pawn has finished, which the 52-square board made impossible", () => {
    // The finding recorded here on 2026-08-29 was that "every target blocked by an own pawn" could
    // never be a *turn-level* reason, because `r` only counts upward and the leading pawn therefore
    // has nobody in front of it. That held while home was a shared area no own pawn could block.
    // With the four-square house it no longer does: the leader sits on the deepest square, reports
    // ALREADY_HOME, and drops out of the vote, so the three behind it agree.
    const pawns = pawnsAt(2, { "0.0": 26, "0.1": 32, "0.2": 38, "0.3": HOME_R });
    const result = evaluateTurn(pawns, 0, 6, 6);

    expect(result.moves).toEqual([]);
    expect(result.reason).toBe(REFUSAL.OWN_PAWN);
  });

  it("still falls back to none-available when the leader overshoots instead of finishing", () => {
    const pawns = pawnsAt(2, { "0.0": 25, "0.1": 31, "0.2": 37, "0.3": 43 });
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

describe("the exact count into the house (FR-13)", () => {
  it("refuses any move that would pass r = 44", () => {
    const pawns = pawnsAt(2, { "0.0": 41 });

    for (let roll = 4; roll <= 6; roll += 1) {
      expect(legalMoves(pawns, 0, roll, 6).find((entry) => entry.pawn === 0)).toBeUndefined();
    }
  });

  it("allows the roll that lands exactly on 44", () => {
    const pawns = pawnsAt(2, { "0.0": 41 });
    const move = legalMoves(pawns, 0, 3, 6).find((entry) => entry.pawn === 0);

    expect(move.to).toBe(HOME_R);
  });

  it("names the reason when every pawn would overshoot", () => {
    const pawns = pawnsAt(2, { "0.0": 43, "0.1": 42, "0.2": 41, "0.3": 40 });
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
    const pawns = pawnsAt(2, { "0.1": 41, "0.2": 42, "0.3": 43 });
    const result = evaluateTurn(pawns, 0, 4, 6);

    expect(result.moves).toEqual([]);
    expect(result.reason).toBe(REFUSAL.NONE_AVAILABLE);
  });

  it("ignores a pawn that has finished when picking the reason", () => {
    // Three pawns overshoot, one is on the deepest house square. The reason must be the overshoot.
    const pawns = pawnsAt(2, { "0.0": 40, "0.1": 42, "0.2": 43, "0.3": HOME_R });
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
