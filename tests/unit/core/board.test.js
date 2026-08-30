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
  isFinished,
  seatsFor,
  isSameSquare,
} from "../../../src/core/board.js";

const PLAYERS = [0, 1, 2, 3];
const HOUSE = [41, 42, 43, 44];

describe("the constants match section 2 of the game design document", () => {
  it("has a 40-square shared track split evenly between 4 players", () => {
    expect(TRACK_LENGTH).toBe(40);
    expect(MAX_PLAYERS).toBe(4);
    expect(PLAYER_OFFSET).toBe(10);
    expect(TRACK_LENGTH).toBe(PLAYER_OFFSET * MAX_PLAYERS);
  });

  it("gives each player 4 house squares and 4 pawns", () => {
    expect(HOME_COLUMN_LENGTH).toBe(4);
    expect(PAWNS_PER_PLAYER).toBe(4);
  });

  it("gives the house exactly one square per pawn, which is what FR-05 rests on", () => {
    expect(HOME_COLUMN_LENGTH).toBe(PAWNS_PER_PLAYER);
  });

  it("makes a pawn's whole journey 44 steps", () => {
    expect(START_R).toBe(0);
    expect(HOME_R).toBe(44);
  });
});

describe("seatsFor", () => {
  it("seats two players opposite each other, on 0 and 2", () => {
    expect(seatsFor(2)).toEqual([0, 2]);
  });

  it("puts three players on 0, 1 and 2 and four on every seat", () => {
    expect(seatsFor(3)).toEqual([0, 1, 2]);
    expect(seatsFor(4)).toEqual([0, 1, 2, 3]);
  });

  it("puts the two-player seats half a lap apart, which is the whole point of the rule", () => {
    const [a, b] = seatsFor(2).map(entrySquare);
    expect(Math.abs(a - b)).toBe(TRACK_LENGTH / 2);
  });

  it("returns a fresh array, so a caller cannot edit the table", () => {
    seatsFor(2).push(1);
    expect(seatsFor(2)).toEqual([0, 2]);
  });

  it("refuses a player count that is not 2, 3 or 4", () => {
    for (const bad of [0, 1, 5, 2.5, -1, "3", null, undefined]) {
      expect(() => seatsFor(bad)).toThrow(RangeError);
    }
  });
});

describe("entrySquare", () => {
  it("returns 0, 10, 20 and 30 for players 0 to 3", () => {
    expect(PLAYERS.map(entrySquare)).toEqual([0, 10, 20, 30]);
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

  it("returns 39, 9, 19 and 29", () => {
    expect(PLAYERS.map(turnOffSquare)).toEqual([39, 9, 19, 29]);
  });

  it("is the square a pawn stands on at r = 40, so a pawn walks a full lap before turning off", () => {
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

  it("wraps around the end of the track: player 3 at r = 11 is on absolute square 0", () => {
    expect(absoluteSquare(3, 11)).toBe(0);
  });

  it("has all four players reach square 39 from four different relative positions", () => {
    // Square 39 is player 0's turn-off square, which player 0 reaches last of all at r = 40.
    // The other three walk over it much earlier, each at their own offset.
    expect(absoluteSquare(0, 40)).toBe(39);
    expect(absoluteSquare(1, 30)).toBe(39);
    expect(absoluteSquare(2, 20)).toBe(39);
    expect(absoluteSquare(3, 10)).toBe(39);
  });

  it("visits all 40 squares exactly once per lap, for every player", () => {
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
    expect(() => absoluteSquare(0, 41)).toThrow(RangeError);
    expect(() => absoluteSquare(0, HOME_R)).toThrow(RangeError);
  });

  it("refuses a position outside 0 to 44 entirely", () => {
    expect(() => absoluteSquare(0, 45)).toThrow(RangeError);
    expect(() => absoluteSquare(0, -1)).toThrow(RangeError);
  });
});

describe("region", () => {
  it("returns the right region at every boundary", () => {
    expect(region(0)).toBe(REGION.START);
    expect(region(1)).toBe(REGION.TRACK);
    expect(region(40)).toBe(REGION.TRACK);
    expect(region(41)).toBe(REGION.HOME_COLUMN);
    expect(region(44)).toBe(REGION.HOME_COLUMN);
  });

  it("has no separate home region, because the deepest house square is where a pawn finishes", () => {
    expect(REGION.HOME).toBeUndefined();
    expect(region(HOME_R)).toBe(REGION.HOME_COLUMN);
  });

  it("classifies every position from 0 to 44, with no gaps", () => {
    const counts = { start: 0, track: 0, "home-column": 0 };
    for (let r = START_R; r <= HOME_R; r += 1) counts[region(r)] += 1;
    expect(counts).toEqual({ start: 1, track: 40, "home-column": 4 });
  });

  it("rejects a position outside the journey", () => {
    expect(() => region(-1)).toThrow(RangeError);
    expect(() => region(45)).toThrow(RangeError);
  });
});

describe("homeColumnStep", () => {
  it("numbers the four house squares 1 to 4", () => {
    expect(HOUSE.map(homeColumnStep)).toEqual([1, 2, 3, 4]);
  });

  it("refuses any position outside a house", () => {
    expect(() => homeColumnStep(TRACK_LENGTH)).toThrow(RangeError);
    expect(() => homeColumnStep(START_R)).toThrow(RangeError);
  });
});

describe("isFinished", () => {
  it("is true only on the deepest house square", () => {
    expect(isFinished(HOME_R)).toBe(true);
    expect(isFinished(HOME_R - 1)).toBe(false);
    expect(isFinished(TRACK_LENGTH)).toBe(false);
    expect(isFinished(START_R)).toBe(false);
  });

  it("rejects a position outside the journey", () => {
    expect(() => isFinished(45)).toThrow(RangeError);
  });
});

describe("isSameSquare", () => {
  it("sees two pawns of different players meeting on the track", () => {
    // Player 0 at r = 11 and player 1 at r = 1 are both on absolute square 10.
    expect(absoluteSquare(0, 11)).toBe(10);
    expect(absoluteSquare(1, 1)).toBe(10);
    expect(isSameSquare({ player: 0, r: 11 }, { player: 1, r: 1 })).toBe(true);
  });

  it("sees two pawns of the same player on the same track square", () => {
    expect(isSameSquare({ player: 2, r: 7 }, { player: 2, r: 7 })).toBe(true);
  });

  it("keeps two pawns on different track squares apart", () => {
    expect(isSameSquare({ player: 0, r: 11 }, { player: 1, r: 2 })).toBe(false);
  });

  it("never lets two players' houses overlap, at any step", () => {
    for (const a of PLAYERS) {
      for (const b of PLAYERS) {
        if (a === b) continue;
        for (const ra of HOUSE) {
          for (const rb of HOUSE) {
            expect(isSameSquare({ player: a, r: ra }, { player: b, r: rb })).toBe(false);
          }
        }
      }
    }
  });

  it("does let one player collide with itself inside its own house", () => {
    expect(isSameSquare({ player: 1, r: 43 }, { player: 1, r: 43 })).toBe(true);
    expect(isSameSquare({ player: 1, r: 43 }, { player: 1, r: 44 })).toBe(false);
  });

  it("collides on the deepest house square too, which is what forces one pawn per square", () => {
    expect(isSameSquare({ player: 3, r: HOME_R }, { player: 3, r: HOME_R })).toBe(true);
    expect(isSameSquare({ player: 3, r: HOME_R }, { player: 2, r: HOME_R })).toBe(false);
  });

  it("never puts a house square on the shared track", () => {
    for (const player of PLAYERS) {
      for (const r of HOUSE) {
        for (let other = 1; other <= TRACK_LENGTH; other += 1) {
          expect(isSameSquare({ player, r }, { player: 0, r: other })).toBe(false);
        }
      }
    }
  });

  it("treats start areas as separate slots, so they never collide", () => {
    expect(isSameSquare({ player: 0, r: START_R }, { player: 0, r: START_R })).toBe(false);
    expect(isSameSquare({ player: 0, r: START_R }, { player: 1, r: START_R })).toBe(false);
  });
});
