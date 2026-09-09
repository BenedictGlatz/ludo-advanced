import { describe, expect, it } from "vitest";

import {
  HOME_R,
  MAX_PLAYERS,
  PAWNS_PER_PLAYER,
  START_R,
  TRACK_LENGTH,
  seatsFor,
} from "../../../src/core/board.js";
import { hasWon } from "../../../src/core/win.js";
import {
  MIN_PLAYERS,
  createPawns,
  findPawn,
  pawnProgress,
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

describe("pawnProgress (FR-36)", () => {
  it("puts all four pawns in the start area at the beginning of a match", () => {
    for (let playerCount = MIN_PLAYERS; playerCount <= MAX_PLAYERS; playerCount += 1) {
      for (const seat of seatsFor(playerCount)) {
        expect(pawnProgress(createPawns(playerCount), seat)).toEqual({
          start: PAWNS_PER_PLAYER,
          track: 0,
          home: 0,
        });
      }
    }
  });

  it("counts one pawn per region as it moves out, along and home", () => {
    let pawns = createPawns(4);
    pawns = withPawnAt(pawns, { player: 0, pawn: 0 }, 1);
    pawns = withPawnAt(pawns, { player: 0, pawn: 1 }, TRACK_LENGTH);
    pawns = withPawnAt(pawns, { player: 0, pawn: 2 }, HOME_R);

    expect(pawnProgress(pawns, 0)).toEqual({ start: 1, track: 2, home: 1 });
  });

  /**
   * The invariant is the whole point: the HUD shows three numbers per seat and a player reads them as
   * a breakdown of four pawns. A bucket that missed a region would make them sum to three, and the
   * acceptance criterion for FR-36 is that the counts match the state after every turn.
   */
  it("always sums to four, wherever the pawns are", () => {
    let pawns = createPawns(2);

    for (let r = 0; r <= HOME_R; r += 1) {
      pawns = withPawnAt(pawns, { player: 0, pawn: 0 }, r);
      const { start, track, home } = pawnProgress(pawns, 0);

      expect({ r, total: start + track + home }).toEqual({ r, total: PAWNS_PER_PLAYER });
    }
  });

  /**
   * `home` has to mean exactly what winning means, or the HUD can read "4 home" for a player who has
   * not won, or the other way round. Both numbers come from `region()`, and this is the test that says
   * so out loud.
   */
  it("reads home: 4 exactly when that player has won", () => {
    let pawns = createPawns(2);
    for (let pawn = 0; pawn < PAWNS_PER_PLAYER; pawn += 1) {
      expect(hasWon(pawns, 0)).toBe(false);
      pawns = withPawnAt(pawns, { player: 0, pawn }, TRACK_LENGTH + 1 + pawn);
    }

    expect(pawnProgress(pawns, 0)).toEqual({ start: 0, track: 0, home: PAWNS_PER_PLAYER });
    expect(hasWon(pawns, 0)).toBe(true);
  });

  it("counts only the seat it was asked about", () => {
    const pawns = withPawnAt(createPawns(4), { player: 2, pawn: 0 }, HOME_R);

    expect(pawnProgress(pawns, 2).home).toBe(1);
    expect(pawnProgress(pawns, 0)).toEqual({ start: PAWNS_PER_PLAYER, track: 0, home: 0 });
  });
});
