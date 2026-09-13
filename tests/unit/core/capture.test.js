import { describe, expect, it } from "vitest";

import { HOME_R, START_R, TRACK_LENGTH, absoluteSquare } from "../../../src/core/board.js";
import { captureTarget, resolveCapture } from "../../../src/core/capture.js";
import { findPawn } from "../../../src/core/pawns.js";
import { pawnsAt } from "../../helpers/fixtures.js";

describe("captureTarget on the shared track (FR-11)", () => {
  it("finds the opponent standing on the square the mover would reach", () => {
    // Player 1's entry square is absolute 10. Player 0 reaches absolute 10 at r = 11.
    const pawns = pawnsAt(4, { "1.0": 1 });

    expect(captureTarget(pawns, 0, 11)).toEqual({ player: 1, pawn: 0, r: 1 });
  });

  it("returns null for an empty square", () => {
    expect(captureTarget(pawnsAt(4, { "1.0": 1 }), 0, 20)).toBeNull();
  });

  it("returns null when the mover's own pawn is there, because that is a block and not a capture", () => {
    // FR-12 refuses this move in movement.js. Capture must not also claim it.
    expect(captureTarget(pawnsAt(2, { "0.1": 14 }), 0, 14)).toBeNull();
  });

  it("finds the right opponent for every pair of players at every point on the track", () => {
    // The exhaustive version of the first test: 12 ordered player pairs x 40 squares.
    for (let attacker = 0; attacker < 4; attacker += 1) {
      for (let victim = 0; victim < 4; victim += 1) {
        if (attacker === victim) continue;

        for (let victimR = 1; victimR <= TRACK_LENGTH; victimR += 1) {
          const square = absoluteSquare(victim, victimR);
          const attackerR =
            ((square - absoluteSquare(attacker, 1) + TRACK_LENGTH) % TRACK_LENGTH) + 1;
          const pawns = pawnsAt(4, { [`${victim}.0`]: victimR });

          expect(captureTarget(pawns, attacker, attackerR)).toEqual({
            player: victim,
            pawn: 0,
            r: victimR,
          });
        }
      }
    }
  });

  it("throws if two opponents somehow share one square, which FR-11 makes impossible", () => {
    // Player 1 at r = 1 and player 2 at r = 31 both stand on absolute square 10.
    const pawns = pawnsAt(3, { "1.0": 1, "2.0": 31 });
    expect(absoluteSquare(1, 1)).toBe(absoluteSquare(2, 31));

    expect(() => captureTarget(pawns, 0, 11)).toThrow(/two opponents/);
  });
});

describe("captureTarget off the shared track", () => {
  it("never captures in the start area, because it holds four separate slots", () => {
    expect(captureTarget(pawnsAt(4), 0, START_R)).toBeNull();
  });

  it("never captures inside a house, because a house is owner-only", () => {
    const pawns = pawnsAt(4, { "1.0": 41, "2.0": 41, "3.0": 41 });

    for (let step = 41; step <= HOME_R; step += 1) {
      expect(captureTarget(pawns, 0, step)).toBeNull();
    }
  });

  it("never captures on the deepest house square either, which is where a pawn finishes", () => {
    // Since 2026-08-30 this square is an ordinary house square rather than a shared home area, so
    // it needs no rule of its own: the owner-only argument above already covers it.
    const pawns = pawnsAt(4, { "1.0": HOME_R, "2.0": HOME_R });
    expect(captureTarget(pawns, 0, HOME_R)).toBeNull();
  });
});

describe("resolveCapture", () => {
  it("sends the captured pawn back to its start area (FR-11)", () => {
    const before = pawnsAt(4, { "1.0": 1, "1.1": 30 });
    const after = resolveCapture(before, { player: 1, pawn: 0 });

    expect(findPawn(after, { player: 1, pawn: 0 }).r).toBe(START_R);
  });

  it("touches no other pawn", () => {
    const before = pawnsAt(4, { "0.0": 14, "1.0": 1, "1.1": 30 });
    const after = resolveCapture(before, { player: 1, pawn: 0 });

    expect(findPawn(after, { player: 0, pawn: 0 }).r).toBe(14);
    expect(findPawn(after, { player: 1, pawn: 1 }).r).toBe(30);
  });

  it("never writes to the list it was given", () => {
    const before = pawnsAt(4, { "1.0": 1 });
    const snapshot = JSON.stringify(before);

    resolveCapture(before, { player: 1, pawn: 0 });

    expect(JSON.stringify(before)).toBe(snapshot);
  });
});
