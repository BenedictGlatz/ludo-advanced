import { describe, expect, it } from "vitest";

import { HOME_R } from "../../../src/core/board.js";
import { findWinner, hasWon } from "../../../src/core/win.js";
import { pawnsAt } from "../../helpers/fixtures.js";

/**
 * A full house: four pawns on the four house squares, one each. Since 2026-08-30 this is the only
 * arrangement that wins, because there is no separate home area the four could share.
 */
const houseFull = { "0.0": 41, "0.1": 42, "0.2": 43, "0.3": HOME_R };

describe("hasWon (FR-05)", () => {
  it("is true when all four pawns fill the four house squares", () => {
    expect(hasWon(pawnsAt(2, houseFull), 0)).toBe(true);
  });

  it("does not care which pawn ended up on which house square", () => {
    const reversed = { "0.0": HOME_R, "0.1": 43, "0.2": 42, "0.3": 41 };
    expect(hasWon(pawnsAt(2, reversed), 0)).toBe(true);
  });

  it("is false with three pawns in the house and one anywhere else", () => {
    for (const r of [0, 1, 20, 40]) {
      const pawns = pawnsAt(2, { ...houseFull, "0.0": r });
      expect(hasWon(pawns, 0)).toBe(false);
    }
  });

  it("is false for a seat nobody is sitting in", () => {
    // An empty pawn list would otherwise win, because `[].every(...)` is true.
    expect(hasWon(pawnsAt(2, houseFull), 3)).toBe(false);
  });
});

describe("findWinner", () => {
  it("returns null while the match is still running", () => {
    expect(findWinner(pawnsAt(4), 4)).toBeNull();
    expect(findWinner(pawnsAt(4, { ...houseFull, "0.3": 40 }), 4)).toBeNull();
  });

  it("names the player who filled their house", () => {
    const pawns = pawnsAt(4, {
      "2.0": 41,
      "2.1": 42,
      "2.2": 43,
      "2.3": HOME_R,
    });

    expect(findWinner(pawns, 4)).toBe(2);
  });

  it("looks only at the seats that are actually playing", () => {
    // Player 3 is not in a 2-player match, so a 2-player match can never report them as the winner.
    expect(findWinner(pawnsAt(2, houseFull), 2)).toBe(0);
  });
});
