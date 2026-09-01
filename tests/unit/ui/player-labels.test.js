/**
 * The seat-to-player numbering, and the bug it fixes. Issue #39.
 *
 * Only `displayNumber` is tested here, because it is the only function in `player-labels.js` that does
 * not call `t()`. The two that do are covered through Playwright, the same way the rest of `ui/` is:
 * `vitest.config.js` runs with `environment: "node"` and this file needs no DOM.
 *
 * It is worth a unit test of its own rather than being left to the end-to-end suite, because the defect
 * it closes is an off-by-one that **looks right** in the common case. A four-player match numbered
 * seats 1, 2, 3, 4 either way, so the bug was invisible in every screenshot anybody had taken.
 */

import { describe, expect, it } from "vitest";

import { seatsFor } from "../../../src/core/board.js";
import { displayNumber } from "../../../src/ui/player-labels.js";

describe("displayNumber", () => {
  /**
   * The regression. `seatsFor(2)` is `[0, 2]`, so the old `seat + 1` produced "Spieler 1" and
   * "Spieler 3" and there was no Spieler 2 at the table.
   */
  it("numbers a two-player match 1 and 2, not 1 and 3", () => {
    const seats = seatsFor(2);

    expect(seats).toEqual([0, 2]);
    expect(displayNumber(seats, 0)).toBe(1);
    expect(displayNumber(seats, 2)).toBe(2);
  });

  it("numbers a three-player match 1, 2, 3", () => {
    const seats = seatsFor(3);

    expect(seats.map((seat) => displayNumber(seats, seat))).toEqual([1, 2, 3]);
  });

  it("agrees with seat + 1 for four players, which is why the bug hid", () => {
    const seats = seatsFor(4);

    expect(seats.map((seat) => displayNumber(seats, seat))).toEqual([1, 2, 3, 4]);
    expect(seats.map((seat) => seat + 1)).toEqual([1, 2, 3, 4]);
  });

  it("counts from 1 with no gaps, for every player count", () => {
    for (const playerCount of [2, 3, 4]) {
      const seats = seatsFor(playerCount);
      const numbers = seats.map((seat) => displayNumber(seats, seat));

      expect(numbers).toEqual(Array.from({ length: playerCount }, (_, index) => index + 1));
    }
  });

  it("falls back to seat + 1 for a seat that is not in the match", () => {
    // Should not happen. Returning something readable beats returning 0 from an indexOf miss, which
    // would print "Spieler 0" and look like a real player.
    expect(displayNumber(seatsFor(2), 1)).toBe(2);
    expect(displayNumber(seatsFor(2), 3)).toBe(4);
  });
});
