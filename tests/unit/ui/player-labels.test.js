/**
 * The seat-to-player numbering, and the bug it fixes. Issue #39.
 *
 * It is worth a unit test of its own rather than being left to the end-to-end suite, because the defect
 * it closes is an off-by-one that **looks right** in the common case. A four-player match numbered
 * seats 1, 2, 3, 4 either way, so the bug was invisible in every screenshot anybody had taken.
 *
 * **The two functions that call `t()` were untested here until issue #43**, on the grounds that
 * Playwright covers them. That stopped being enough when a seat gained a second vocabulary: which of
 * "Spieler 2" and "Bot 2" a seat gets is a branch, and `overlay-screens.test.js` had already shown that
 * `initI18n` works fine under `environment: "node"` with no DOM.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { seatsFor } from "../../../src/core/board.js";
import { initI18n } from "../../../src/i18n/index.js";
import { displayNumber, seatLabel, seatName } from "../../../src/ui/player-labels.js";

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

describe("seatName and seatLabel: people and bots (FR-43)", () => {
  beforeAll(async () => {
    await initI18n("de");
  });

  const match = { seats: [0, 1, 2, 3], bots: [2, 3] };

  it("names a person and a bot differently, on the same numbering", () => {
    expect(seatName(match, 1)).toBe("Spieler 2");
    expect(seatName(match, 2)).toBe("Bot 3");
    expect(seatLabel(match, 1)).toBe("Spieler 2 (Gelb)");
    expect(seatLabel(match, 2)).toBe("Bot 3 (Grün)");
  });

  it("keeps the seat's own number rather than counting the bots separately", () => {
    // "Bot 1" beside "Spieler 1" would look like one seat named twice. The number is the turn order.
    expect(seatName({ seats: [0, 2], bots: [2] }, 2)).toBe("Bot 2");
    expect(seatName({ seats: [0, 1, 2, 3], bots: [3] }, 3)).toBe("Bot 4");
  });

  it("treats a state with no bots field as an all-human match", () => {
    // Every fixture written before issue #43 is one of these.
    expect(seatName({ seats: [0, 2] }, 2)).toBe("Spieler 2");
    expect(seatLabel({ seats: [0, 2] }, 0)).toBe("Spieler 1 (Rot)");
  });
});
