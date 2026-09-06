/**
 * From a square on the board back to the move it stands for. Issue #91.
 *
 * jQuery-free, so it runs under `environment: "node"`; the element is a plain object with a `dataset`,
 * which is all `targetOfElement` reads.
 */

import { describe, expect, it } from "vitest";

import { moveReaching, targetOfElement } from "../../../src/ui/move-targets.js";

const el = (dataset) => ({ dataset });

describe("targetOfElement", () => {
  it("reads a track field as its absolute square", () => {
    expect(targetOfElement(el({ square: "17" }))).toEqual({ square: 17 });
  });

  it("reads a house field as its owner and step", () => {
    expect(targetOfElement(el({ player: "2", homeStep: "3" }))).toEqual({ player: 2, homeStep: 3 });
  });
});

describe("moveReaching", () => {
  // Seat 0's r = 5 is absolute 4; seat 2's r = 5 is absolute 24; r = 43 is house step 3.
  const state = {
    legalMoves: [
      { player: 0, pawn: 1, kind: "advance", from: 2, to: 5, captures: null },
      { player: 0, pawn: 2, kind: "advance", from: 40, to: 43, captures: null },
    ],
  };

  it("finds the move that ends on a track square", () => {
    expect(moveReaching(state, { square: 4 }).pawn).toBe(1);
  });

  it("finds the move that ends on a house square of the right owner", () => {
    expect(moveReaching(state, { player: 0, homeStep: 3 }).pawn).toBe(2);
    expect(moveReaching(state, { player: 2, homeStep: 3 })).toBeNull();
  });

  it("is null for a square nothing reaches", () => {
    expect(moveReaching(state, { square: 24 })).toBeNull();
    expect(moveReaching({ legalMoves: [] }, { square: 4 })).toBeNull();
  });

  /** Four pawns leaving the yard all reach the entry square; the first one listed is the answer. */
  it("answers the first of several moves that share a target", () => {
    const leaving = {
      legalMoves: [0, 1, 2, 3].map((pawn) => ({
        player: 0,
        pawn,
        kind: "leave-start",
        from: 0,
        to: 1,
      })),
    };

    expect(moveReaching(leaving, { square: 0 }).pawn).toBe(0);
  });
});
