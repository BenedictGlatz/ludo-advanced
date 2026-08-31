/**
 * The squares a move steps on. Issue #38.
 *
 * Two things are worth asserting and neither is obvious from the code: that house squares drop out of
 * the answer, and that the ring wraps. Everything else is a loop.
 */

import { describe, expect, it } from "vitest";

import { neighbourSquares, squareRun, squaresCrossed } from "../../../src/core/path.js";

describe("squaresCrossed", () => {
  it("excludes the square the pawn started on and includes the one it lands on", () => {
    expect(squaresCrossed(0, 5, 8)).toEqual([5, 6, 7]);
  });

  /**
   * Player 0's `r = 1` is absolute square 0, so `r` and the absolute number differ by one. Player 1
   * enters at square 10, so the same relative walk is a different set of shared squares. That
   * conversion is the whole reason this module exists rather than the callers doing the arithmetic.
   */
  it("converts relative positions to the shared square numbers of that player's lap", () => {
    expect(squaresCrossed(0, 0, 1)).toEqual([0]);
    expect(squaresCrossed(1, 0, 1)).toEqual([10]);
    expect(squaresCrossed(2, 3, 5)).toEqual([23, 24]);
  });

  it("wraps round the end of the ring", () => {
    // Player 1 enters at square 10, so r = 31 is square 0 and r = 32 is square 1.
    expect(squaresCrossed(1, 30, 32)).toEqual([0, 1]);
  });

  /**
   * A house square is private to one player, so no shared trap or blocker can sit on one, and
   * `absoluteSquare` throws rather than returning a number for them. Filtering here means no caller
   * has to remember that, and it is why a walk off the track into the house is shorter than the roll.
   */
  it("drops the house squares, so walking into the house returns only the track part", () => {
    // r 39 and 40 are the last two track squares, r 41 upwards is the house column.
    expect(squaresCrossed(0, 38, 42)).toEqual([38, 39]);
  });

  it("drops the start area, which is not a square anything can sit on either", () => {
    expect(squaresCrossed(0, 0, 0)).toEqual([]);
  });

  it("counts down for a backward move, which is where the three pushback cards get their path", () => {
    expect(squaresCrossed(0, 8, 5)).toEqual([6, 5, 4]);
  });
});

describe("neighbourSquares", () => {
  it("returns the square before and the square after", () => {
    expect(neighbourSquares(17)).toEqual([16, 18]);
  });

  it("wraps at both ends of the ring, which is the whole content of the function", () => {
    expect(neighbourSquares(0)).toEqual([39, 1]);
    expect(neighbourSquares(39)).toEqual([38, 0]);
  });
});

describe("squareRun", () => {
  it("starts one square away and never includes the square it was fired from", () => {
    expect(squareRun(10, 1, 3)).toEqual([11, 12, 13]);
  });

  it("runs backwards too, wrapping past zero", () => {
    expect(squareRun(1, -1, 3)).toEqual([0, 39, 38]);
  });

  it("is empty for a run of zero, which is what a D4 can never roll but a caller can ask for", () => {
    expect(squareRun(10, 1, 0)).toEqual([]);
  });
});
