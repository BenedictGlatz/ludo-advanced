import { describe, it, expect } from "vitest";
import {
  TRACK_LENGTH,
  MAX_PLAYERS,
  PLAYER_OFFSET,
  HOME_COLUMN_LENGTH,
  PAWNS_PER_PLAYER,
  START_R,
  HOME_R,
  REGION,
  entrySquare,
  turnOffSquare,
  absoluteSquare,
  region,
  homeColumnStep,
  isSameSquare,
} from "../../../src/core/board.js";

const PLAYERS = [0, 1, 2, 3];

describe("the constants match section 2 of the game design document", () => {
  it("has a 52-square shared track split evenly between 4 players", () => {
    expect(TRACK_LENGTH).toBe(52);
    expect(MAX_PLAYERS).toBe(4);
    expect(PLAYER_OFFSET).toBe(13);
    expect(TRACK_LENGTH).toBe(PLAYER_OFFSET * MAX_PLAYERS);
  });

  it("gives each player 5 home column squares and 4 pawns", () => {
    expect(HOME_COLUMN_LENGTH).toBe(5);
    expect(PAWNS_PER_PLAYER).toBe(4);
  });

  it("makes a pawn's whole journey 58 steps", () => {
    expect(START_R).toBe(0);
    expect(HOME_R).toBe(58);
  });
});

describe("entrySquare", () => {
  it("returns 0, 13, 26 and 39 for players 0 to 3", () => {
    expect(PLAYERS.map(entrySquare)).toEqual([0, 13, 26, 39]);
  });

  it("puts every player on a different square", () => {
    expect(new Set(PLAYERS.map(entrySquare)).size).toBe(MAX_PLAYERS);
  });

  it("rejects a player number that does not exist", () => {
    expect(() => entrySquare(4)).toThrow(RangeError);
    expect(() => entrySquare(-1)).toThrow(RangeError);
    expect(() => entrySquare(1.5)).toThrow(RangeError);
  });
});

describe("turnOffSquare", () => {
  it("is the square immediately behind the entry square, for all four players", () => {
    for (const player of PLAYERS) {
      const behindEntry = (entrySquare(player) + TRACK_LENGTH - 1) % TRACK_LENGTH;
      expect(turnOffSquare(player)).toBe(behindEntry);
    }
  });

  it("returns 51, 12, 25 and 38", () => {
    expect(PLAYERS.map(turnOffSquare)).toEqual([51, 12, 25, 38]);
  });

  it("is the square a pawn stands on at r = 52, so a pawn walks a full lap before turning off", () => {
    for (const player of PLAYERS) {
      expect(absoluteSquare(player, TRACK_LENGTH)).toBe(turnOffSquare(player));
    }
  });
});

describe("absoluteSquare", () => {
  it("puts a pawn at r = 1 on its own entry square", () => {
    for (const player of PLAYERS) {
      expect(absoluteSquare(player, 1)).toBe(entrySquare(player));
    }
  });

  it("wraps around the end of the track: player 3 at r = 14 is on absolute square 0", () => {
    expect(absoluteSquare(3, 14)).toBe(0);
  });

  it("wraps for every player, one step past their turn-off square", () => {
    // r = 52 is the turn-off square, so r = 52 would be square 51 for player 0. Player 1 reaches
    // square 51 at r = 39, which is the same physical square from a different starting point.
    expect(absoluteSquare(0, 52)).toBe(51);
    expect(absoluteSquare(1, 39)).toBe(51);
    expect(absoluteSquare(2, 26)).toBe(51);
    expect(absoluteSquare(3, 13)).toBe(51);
  });

  it("visits all 52 squares exactly once per lap, for every player", () => {
    for (const player of PLAYERS) {
      const visited = [];
      for (let r = 1; r <= TRACK_LENGTH; r += 1) visited.push(absoluteSquare(player, r));
      expect(new Set(visited).size).toBe(TRACK_LENGTH);
      expect(Math.min(...visited)).toBe(0);
      expect(Math.max(...visited)).toBe(TRACK_LENGTH - 1);
    }
  });

  it("refuses positions that are not on the shared track", () => {
    expect(() => absoluteSquare(0, START_R)).toThrow(RangeError);
    expect(() => absoluteSquare(0, 53)).toThrow(RangeError);
    expect(() => absoluteSquare(0, HOME_R)).toThrow(RangeError);
  });

  it("refuses a position outside 0 to 58 entirely", () => {
    expect(() => absoluteSquare(0, 59)).toThrow(RangeError);
    expect(() => absoluteSquare(0, -1)).toThrow(RangeError);
  });
});

describe("region", () => {
  it("returns the right region at every boundary", () => {
    expect(region(0)).toBe(REGION.START);
    expect(region(1)).toBe(REGION.TRACK);
    expect(region(52)).toBe(REGION.TRACK);
    expect(region(53)).toBe(REGION.HOME_COLUMN);
    expect(region(57)).toBe(REGION.HOME_COLUMN);
    expect(region(58)).toBe(REGION.HOME);
  });

  it("classifies every position from 0 to 58, with no gaps", () => {
    const counts = { start: 0, track: 0, "home-column": 0, home: 0 };
    for (let r = START_R; r <= HOME_R; r += 1) counts[region(r)] += 1;
    expect(counts).toEqual({ start: 1, track: 52, "home-column": 5, home: 1 });
  });

  it("rejects a position outside the journey", () => {
    expect(() => region(-1)).toThrow(RangeError);
    expect(() => region(59)).toThrow(RangeError);
  });
});

describe("homeColumnStep", () => {
  it("numbers the five home column squares 1 to 5", () => {
    expect([53, 54, 55, 56, 57].map(homeColumnStep)).toEqual([1, 2, 3, 4, 5]);
  });

  it("refuses any position outside a home column", () => {
    expect(() => homeColumnStep(52)).toThrow(RangeError);
    expect(() => homeColumnStep(HOME_R)).toThrow(RangeError);
    expect(() => homeColumnStep(START_R)).toThrow(RangeError);
  });
});

describe("isSameSquare", () => {
  it("sees two pawns of different players meeting on the track", () => {
    // Player 0 at r = 14 and player 1 at r = 1 are both on absolute square 13.
    expect(absoluteSquare(0, 14)).toBe(13);
    expect(absoluteSquare(1, 1)).toBe(13);
    expect(isSameSquare({ player: 0, r: 14 }, { player: 1, r: 1 })).toBe(true);
  });

  it("sees two pawns of the same player on the same track square", () => {
    expect(isSameSquare({ player: 2, r: 7 }, { player: 2, r: 7 })).toBe(true);
  });

  it("keeps two pawns on different track squares apart", () => {
    expect(isSameSquare({ player: 0, r: 14 }, { player: 1, r: 2 })).toBe(false);
  });

  it("never lets two players' home columns overlap, at any step", () => {
    for (const a of PLAYERS) {
      for (const b of PLAYERS) {
        if (a === b) continue;
        for (let ra = 53; ra <= 57; ra += 1) {
          for (let rb = 53; rb <= 57; rb += 1) {
            expect(isSameSquare({ player: a, r: ra }, { player: b, r: rb })).toBe(false);
          }
        }
      }
    }
  });

  it("does let one player collide with itself inside its own home column", () => {
    expect(isSameSquare({ player: 1, r: 55 }, { player: 1, r: 55 })).toBe(true);
    expect(isSameSquare({ player: 1, r: 55 }, { player: 1, r: 56 })).toBe(false);
  });

  it("never puts a home column square on the shared track", () => {
    for (const player of PLAYERS) {
      for (let r = 53; r <= 57; r += 1) {
        for (let other = 1; other <= TRACK_LENGTH; other += 1) {
          expect(isSameSquare({ player, r }, { player: 0, r: other })).toBe(false);
        }
      }
    }
  });

  it("treats start areas and homes as separate slots, so they never collide", () => {
    expect(isSameSquare({ player: 0, r: START_R }, { player: 0, r: START_R })).toBe(false);
    expect(isSameSquare({ player: 0, r: START_R }, { player: 1, r: START_R })).toBe(false);
    expect(isSameSquare({ player: 3, r: HOME_R }, { player: 3, r: HOME_R })).toBe(false);
    expect(isSameSquare({ player: 3, r: HOME_R }, { player: 2, r: HOME_R })).toBe(false);
  });
});
