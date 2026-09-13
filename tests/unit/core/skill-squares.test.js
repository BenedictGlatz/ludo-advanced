/**
 * The skill squares. Issue #38, requirement FR-22.
 *
 * The respawn rule is the team's own, decided 2026-08-30, and no document existed to check it
 * against. So the tests state the rule rather than a worked example: a used square never comes back
 * under the pawn that used it, never lands on a player's entry square, never doubles up on an
 * occupied square, and the count on the board never changes.
 */

import { describe, expect, it } from "vitest";

import { MAX_PLAYERS, TRACK_LENGTH, absoluteSquare, entrySquare } from "../../../src/core/board.js";
import { createSeededRng } from "../../../src/core/dice-source.js";
import {
  EXCLUDED_SQUARES,
  INITIAL_SKILL_SQUARES,
  SKILL_SQUARE_COUNT,
  consumeSkillSquare,
  isSkillSquare,
  respawnCandidates,
  skillSquareLandedOn,
} from "../../../src/core/skill-squares.js";

describe("the eight squares the match starts with (FR-22)", () => {
  it("are eight of the forty track squares, in ascending order and without duplicates", () => {
    expect(SKILL_SQUARE_COUNT).toBe(8);
    expect(INITIAL_SKILL_SQUARES).toEqual([4, 7, 14, 17, 24, 27, 34, 37]);
    expect(new Set(INITIAL_SKILL_SQUARES).size).toBe(8);

    for (const square of INITIAL_SKILL_SQUARES) {
      expect(square).toBeGreaterThanOrEqual(0);
      expect(square).toBeLessThan(TRACK_LENGTH);
    }
  });

  it("gives every player the same journey, which is the point of the layout", () => {
    // Turn order already favours seat 0, and FR-04 fixes that order without compensating for it.
    // An earlier first card would stack a second advantage on top with nothing to balance it, so
    // this is the test that matters here.
    const relativePositions = (player) =>
      Array.from({ length: TRACK_LENGTH }, (_, index) => index + 1).filter((r) =>
        isSkillSquare(INITIAL_SKILL_SQUARES, absoluteSquare(player, r))
      );

    const seatZero = relativePositions(0);

    expect(seatZero).toEqual([5, 8, 15, 18, 25, 28, 35, 38]);
    for (let player = 1; player < MAX_PLAYERS; player += 1) {
      expect(relativePositions(player), `player ${player}`).toEqual(seatZero);
    }
  });

  it("is frozen, so no caller can edit the starting layout for everyone", () => {
    expect(Object.isFrozen(INITIAL_SKILL_SQUARES)).toBe(true);
  });

  it("never starts on an entry square", () => {
    expect(EXCLUDED_SQUARES).toEqual([0, 10, 20, 30]);
    for (const square of EXCLUDED_SQUARES) {
      expect(isSkillSquare(INITIAL_SKILL_SQUARES, square)).toBe(false);
    }
  });

  it("cannot be reached out of the start area with the smallest die", () => {
    // The lowest offset is 4, so a pawn leaving the start area lands on the entry square and needs a
    // further roll. A skill square one step off the entry would be a free card every time a pawn
    // came out.
    for (let player = 0; player < MAX_PLAYERS; player += 1) {
      expect(isSkillSquare(INITIAL_SKILL_SQUARES, entrySquare(player) + 1)).toBe(false);
      expect(isSkillSquare(INITIAL_SKILL_SQUARES, entrySquare(player) + 2)).toBe(false);
    }
  });
});

describe("respawnCandidates", () => {
  it("leaves 28 squares, which is the arithmetic the comment claims", () => {
    // 40 track squares, minus 4 entry squares, minus the 7 skill squares still standing, minus the
    // one just used.
    const candidates = respawnCandidates(INITIAL_SKILL_SQUARES, 4);

    expect(candidates).toHaveLength(28);
  });

  it("excludes the entry squares, the standing skill squares and the used one", () => {
    const candidates = respawnCandidates(INITIAL_SKILL_SQUARES, 4);

    expect(candidates).not.toContain(4);
    for (const square of EXCLUDED_SQUARES) expect(candidates).not.toContain(square);
    for (const square of INITIAL_SKILL_SQUARES) expect(candidates).not.toContain(square);
  });
});

describe("consumeSkillSquare", () => {
  const rng = () => 0.5;

  it("returns a new list and leaves the old one untouched", () => {
    const before = [...INITIAL_SKILL_SQUARES];
    const after = consumeSkillSquare(before, 4, rng);

    expect(after).not.toBe(before);
    expect(before).toEqual(INITIAL_SKILL_SQUARES);
  });

  it("keeps the count at eight: one square is used, one appears", () => {
    let squares = [...INITIAL_SKILL_SQUARES];
    const random = createSeededRng(11);

    for (let step = 0; step < 200; step += 1) {
      squares = consumeSkillSquare(squares, squares[step % squares.length], random);

      expect(squares).toHaveLength(SKILL_SQUARE_COUNT);
      expect(new Set(squares).size, "two skill squares on one square").toBe(SKILL_SQUARE_COUNT);
    }
  });

  it("never puts a square on an entry square, over 200 uses", () => {
    let squares = [...INITIAL_SKILL_SQUARES];
    const random = createSeededRng(7);

    for (let step = 0; step < 200; step += 1) {
      squares = consumeSkillSquare(squares, squares[0], random);

      for (const excluded of EXCLUDED_SQUARES) {
        expect(squares, `landed on entry square ${excluded} at step ${step}`).not.toContain(
          excluded
        );
      }
    }
  });

  it("never puts the square back where it was", () => {
    const random = createSeededRng(3);

    for (const used of INITIAL_SKILL_SQUARES) {
      for (let attempt = 0; attempt < 40; attempt += 1) {
        expect(consumeSkillSquare(INITIAL_SKILL_SQUARES, used, random)).not.toContain(used);
      }
    }
  });

  it("returns the list sorted, so the same board is the same array", () => {
    // Otherwise two states with the same eight squares compare unequal depending on the order the
    // squares happened to be used in, and every test would have to sort first.
    const random = createSeededRng(5);
    let squares = [...INITIAL_SKILL_SQUARES];

    for (let step = 0; step < 50; step += 1) {
      squares = consumeSkillSquare(squares, squares[step % squares.length], random);

      expect(squares).toEqual([...squares].sort((a, b) => a - b));
    }
  });

  it("can reach every one of the 28 candidates", () => {
    // A respawn that only ever used half the board would satisfy every test above.
    const random = createSeededRng(42);
    const seen = new Set();

    for (let attempt = 0; attempt < 2000; attempt += 1) {
      const [replacement] = consumeSkillSquare(INITIAL_SKILL_SQUARES, 4, random).filter(
        (square) => !INITIAL_SKILL_SQUARES.includes(square)
      );
      seen.add(replacement);
    }

    expect(seen.size).toBe(28);
  });

  it("gives the same sequence of boards for the same seed (NFR-09)", () => {
    const replay = (seed) => {
      const random = createSeededRng(seed);
      let squares = [...INITIAL_SKILL_SQUARES];
      const boards = [];

      for (let step = 0; step < 20; step += 1) {
        squares = consumeSkillSquare(squares, squares[0], random);
        boards.push(squares);
      }

      return boards;
    };

    expect(replay(99)).toEqual(replay(99));
    expect(replay(99)).not.toEqual(replay(100));
  });

  it("refuses to use up a square that is not a skill square", () => {
    expect(() => consumeSkillSquare(INITIAL_SKILL_SQUARES, 5, rng)).toThrow(RangeError);
  });
});

describe("skillSquareLandedOn", () => {
  it("answers with the square when the pawn finished on one", () => {
    // Seat 0 enters on square 0, so r=5 is absolute square 4.
    expect(skillSquareLandedOn(INITIAL_SKILL_SQUARES, { player: 0, pawn: 0, r: 5 })).toBe(4);
  });

  it("answers null for an ordinary track square", () => {
    expect(skillSquareLandedOn(INITIAL_SKILL_SQUARES, { player: 0, pawn: 0, r: 6 })).toBe(null);
  });

  it("answers null in a start area and in a house, rather than throwing", () => {
    expect(skillSquareLandedOn(INITIAL_SKILL_SQUARES, { player: 0, pawn: 0, r: 0 })).toBe(null);
    expect(skillSquareLandedOn(INITIAL_SKILL_SQUARES, { player: 0, pawn: 0, r: 42 })).toBe(null);
  });

  it("sees the same physical square through every player's own numbering", () => {
    // Absolute square 14 is r=5 for seat 1 and r=35 for seat 0. Both are the same square and both
    // hand out a card, which is what "the squares are absolute" means in practice.
    expect(skillSquareLandedOn(INITIAL_SKILL_SQUARES, { player: 1, pawn: 0, r: 5 })).toBe(14);
    expect(skillSquareLandedOn(INITIAL_SKILL_SQUARES, { player: 0, pawn: 0, r: 15 })).toBe(14);
  });
});
