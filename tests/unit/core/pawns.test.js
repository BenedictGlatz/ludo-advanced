import { describe, expect, it } from "vitest";

import { MAX_PLAYERS, PAWNS_PER_PLAYER, START_R, seatsFor } from "../../../src/core/board.js";
import {
  MIN_PLAYERS,
  createPawns,
  findPawn,
  pawnsOf,
  playerCountOf,
  seatsIn,
  withPawnAt,
} from "../../../src/core/pawns.js";

describe("createPawns", () => {
  it("gives every seated player four pawns, all in the start area (FR-01)", () => {
    for (let playerCount = MIN_PLAYERS; playerCount <= MAX_PLAYERS; playerCount += 1) {
      const pawns = createPawns(playerCount);

      expect(pawns).toHaveLength(playerCount * PAWNS_PER_PLAYER);
      expect(pawns.every((entry) => entry.r === START_R)).toBe(true);

      for (const player of seatsFor(playerCount)) {
        expect(pawnsOf(pawns, player)).toHaveLength(PAWNS_PER_PLAYER);
      }
    }
  });

  it("seats two players opposite each other, on seats 0 and 2 (D3 of the design spec)", () => {
    expect(seatsIn(createPawns(2))).toEqual([0, 2]);
    expect(pawnsOf(createPawns(2), 1)).toEqual([]);
  });

  it("seats three players on 0, 1 and 2, and four on all of them", () => {
    expect(seatsIn(createPawns(3))).toEqual([0, 1, 2]);
    expect(seatsIn(createPawns(4))).toEqual([0, 1, 2, 3]);
  });

  it("numbers each player's pawns 0 to 3", () => {
    const pawns = createPawns(4);

    for (let player = 0; player < 4; player += 1) {
      expect(pawnsOf(pawns, player).map((entry) => entry.pawn)).toEqual([0, 1, 2, 3]);
    }
  });

  it("refuses a player count outside 2 to 4", () => {
    for (const bad of [0, 1, 5, 2.5, -1, "3", null]) {
      expect(() => createPawns(bad)).toThrow(RangeError);
    }
  });
});

describe("pawnsOf", () => {
  it("returns an empty list for a seat nobody occupies", () => {
    expect(pawnsOf(createPawns(2), 3)).toEqual([]);
  });
});

describe("findPawn", () => {
  it("finds a pawn by its identity", () => {
    const pawns = createPawns(3);
    expect(findPawn(pawns, { player: 2, pawn: 1 })).toEqual({ player: 2, pawn: 1, r: START_R });
  });

  it("throws rather than returning undefined for a pawn that is not there", () => {
    expect(() => findPawn(createPawns(2), { player: 3, pawn: 0 })).toThrow(/no pawn/);
  });
});

describe("withPawnAt", () => {
  it("moves exactly one pawn and leaves the rest alone", () => {
    const before = createPawns(4);
    const after = withPawnAt(before, { player: 1, pawn: 2 }, 17);

    expect(findPawn(after, { player: 1, pawn: 2 }).r).toBe(17);
    expect(after.filter((entry) => entry.r !== START_R)).toHaveLength(1);
  });

  it("never writes to the list it was given", () => {
    const before = createPawns(2);
    const snapshot = JSON.stringify(before);

    withPawnAt(before, { player: 0, pawn: 0 }, 30);

    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it("throws for a pawn that is not in the list", () => {
    expect(() => withPawnAt(createPawns(2), { player: 3, pawn: 0 }, 5)).toThrow(/no pawn/);
  });
});

describe("playerCountOf", () => {
  it("counts the distinct players in a list", () => {
    for (let playerCount = MIN_PLAYERS; playerCount <= MAX_PLAYERS; playerCount += 1) {
      expect(playerCountOf(createPawns(playerCount))).toBe(playerCount);
    }
  });
});
