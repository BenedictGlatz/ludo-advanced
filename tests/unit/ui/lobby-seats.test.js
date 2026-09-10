/**
 * Who may sit where in the host's online lobby. Issue #101.
 *
 * The rule file is pure, so every row of its table in the header is one assertion here, and the two
 * callers (`lobby-screen.js` for the disabled position, `host-role.js` for the refusal) are tested only
 * for reading it, not for the rule itself.
 */

import { describe, expect, it } from "vitest";

import {
  canToggle,
  everybodyIn,
  freeSeats,
  seatStatus,
} from "../../../src/ui/online/lobby-seats.js";

/** A four-seat host snapshot with `fields` written over the empty table. */
const lobby = (fields = {}) => ({
  seats: [0, 1, 2, 3],
  connected: [],
  bots: [],
  pending: false,
  ...fields,
});

describe("seatStatus", () => {
  it("names the host, a connected guest, a bot and a free seat", () => {
    const snapshot = lobby({ connected: [1], bots: [3] });

    expect([0, 1, 2, 3].map((seat) => seatStatus(snapshot, seat))).toEqual([
      "host",
      "connected",
      "waiting",
      "bot",
    ]);
  });
});

describe("freeSeats", () => {
  it("is the seats a guest may still take, in seat order", () => {
    expect(freeSeats(lobby())).toEqual([1, 2, 3]);
    expect(freeSeats(lobby({ connected: [1], bots: [3] }))).toEqual([2]);
    expect(freeSeats(lobby({ connected: [1, 2], bots: [3] }))).toEqual([]);
  });
});

describe("canToggle", () => {
  it("never moves the host or a guest who joined", () => {
    const snapshot = lobby({ connected: [1] });

    expect(canToggle(snapshot, 0, "bot")).toBe(false);
    expect(canToggle(snapshot, 1, "bot")).toBe(false);
    expect(canToggle(snapshot, 1, "human")).toBe(false);
  });

  it("lets a free seat become a bot while the host and one more person remain", () => {
    expect(canToggle(lobby(), 3, "bot")).toBe(true);
    expect(canToggle(lobby({ bots: [3] }), 2, "bot")).toBe(true);
    // Seats 2 and 3 are bots, seat 1 is the only other person: the host would be alone.
    expect(canToggle(lobby({ bots: [2, 3] }), 1, "bot")).toBe(false);
    // With a guest seated, every free seat may go, because the guest is the second person.
    expect(canToggle(lobby({ connected: [1], bots: [3] }), 2, "bot")).toBe(true);
  });

  it("always lets a bot go back to a person, and answers nothing else", () => {
    expect(canToggle(lobby({ bots: [3] }), 3, "human")).toBe(true);
    expect(canToggle(lobby(), 3, "human")).toBe(false);
    expect(canToggle(lobby(), 3, "remote")).toBe(false);
  });
});

describe("everybodyIn", () => {
  it("needs every seat spoken for and at least one guest among them", () => {
    expect(everybodyIn(lobby({ connected: [1, 2, 3] }))).toBe(true);
    expect(everybodyIn(lobby({ connected: [1], bots: [2, 3] }))).toBe(true);
    expect(everybodyIn(lobby({ connected: [1], bots: [2] }))).toBe(false);
    // Cannot be reached through `canToggle`, and refused on its own terms all the same.
    expect(everybodyIn(lobby({ bots: [1, 2, 3] }))).toBe(false);
  });
});
