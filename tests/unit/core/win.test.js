import { describe, expect, it } from "vitest";

import { HOME_R } from "../../../src/core/board.js";
import { findWinner, hasWon } from "../../../src/core/win.js";
import { pawnsAt } from "../../helpers/fixtures.js";

const allHome = { "0.0": HOME_R, "0.1": HOME_R, "0.2": HOME_R, "0.3": HOME_R };

describe("hasWon (FR-05)", () => {
  it("is true only when all four pawns are at r = 58", () => {
    expect(hasWon(pawnsAt(2, allHome), 0)).toBe(true);
  });

  it("is false with three pawns home and one anywhere else", () => {
    for (const r of [0, 1, 52, 57]) {
      const pawns = pawnsAt(2, { ...allHome, "0.0": r });
      expect(hasWon(pawns, 0)).toBe(false);
    }
  });

  it("is false for a seat nobody is sitting in", () => {
    // An empty pawn list would otherwise win, because `[].every(...)` is true.
    expect(hasWon(pawnsAt(2, allHome), 3)).toBe(false);
  });
});

describe("findWinner", () => {
  it("returns null while the match is still running", () => {
    expect(findWinner(pawnsAt(4), 4)).toBeNull();
    expect(findWinner(pawnsAt(4, { ...allHome, 0.3: 57 }), 4)).toBeNull();
  });

  it("names the player who got all four pawns home", () => {
    const pawns = pawnsAt(4, {
      "2.0": HOME_R,
      "2.1": HOME_R,
      "2.2": HOME_R,
      "2.3": HOME_R,
    });

    expect(findWinner(pawns, 4)).toBe(2);
  });

  it("looks only at the seats that are actually playing", () => {
    // Player 3 is not in a 2-player match, so a 2-player match can never report them as the winner.
    expect(findWinner(pawnsAt(2, allHome), 2)).toBe(0);
  });
});
