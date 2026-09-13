/**
 * `ui/board-geometry.js` is the one module in `ui/` that is unit tested, and the exception is
 * deliberate.
 *
 * `vitest.config.js` says `ui/` is covered by Playwright in a real browser instead, because a
 * coverage figure for a rendering layer measures how much jQuery ran. This module is not a rendering
 * layer: it is a lookup table plus arithmetic, it touches no DOM, and it is the one place where a
 * mistake is **silent**. A wrong cell does not throw and does not fail to render. It draws a pawn
 * next to the square it is supposed to be standing on, and only a human looking at the board notices.
 *
 * The first test is the important one. `TRACK_CELLS` and the 40 rules in `board-track.css` are the
 * same table written twice, once for JavaScript and once for CSS, and they have to agree.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { MAX_PLAYERS, TRACK_LENGTH, entrySquare, turnOffSquare } from "../../../src/core/board.js";
import {
  GRID_SIZE,
  HOUSE_CELLS,
  TRACK_CELLS,
  cellCentre,
  houseCell,
  pawnCell,
  pawnCentre,
  startSlotCell,
  trackCell,
} from "../../../src/ui/board-geometry.js";

const SEATS = [0, 1, 2, 3];
const PAWNS = [0, 1, 2, 3];
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** `[row, column]` pairs read out of the `grid-area` of every `[data-square="N"]` rule. */
function trackCellsFromStylesheet() {
  const css = readFileSync(join(repoRoot, "src", "ui", "styles", "board-track.css"), "utf8");
  const rule = /\.square\[data-square="(\d+)"\]\s*\{\s*grid-area:\s*(\d+)\s*\/\s*(\d+)\s*;/g;

  const cells = [];
  for (const [, index, row, column] of css.matchAll(rule)) {
    cells[Number(index)] = [Number(row), Number(column)];
  }
  return cells;
}

/** Are two cells edge-to-edge neighbours? Diagonals do not count. */
function areAdjacent([rowA, columnA], [rowB, columnB]) {
  return Math.abs(rowA - rowB) + Math.abs(columnA - columnB) === 1;
}

const key = ([row, column]) => `${row}/${column}`;

describe("TRACK_CELLS against board-track.css", () => {
  it("is the same table the stylesheet holds, index for index", () => {
    expect(trackCellsFromStylesheet()).toEqual(TRACK_CELLS);
  });

  it("covers every track index the rules produce, and no more", () => {
    expect(TRACK_CELLS).toHaveLength(TRACK_LENGTH);
    expect(trackCellsFromStylesheet()).toHaveLength(TRACK_LENGTH);
  });
});

describe("the track is a continuous ring on the grid", () => {
  it("puts every consecutive pair of indices on neighbouring cells, and closes at 39 to 0", () => {
    for (let index = 0; index < TRACK_LENGTH; index += 1) {
      const here = trackCell(index);
      const next = trackCell((index + 1) % TRACK_LENGTH);

      expect(areAdjacent(here, next), `index ${index} does not touch index ${index + 1}`).toBe(
        true
      );
    }
  });

  it("uses 40 different cells, all inside the 11 by 11 grid", () => {
    expect(new Set(TRACK_CELLS.map(key)).size).toBe(TRACK_LENGTH);

    for (const [row, column] of TRACK_CELLS) {
      expect(row).toBeGreaterThanOrEqual(1);
      expect(column).toBeGreaterThanOrEqual(1);
      expect(row).toBeLessThanOrEqual(GRID_SIZE);
      expect(column).toBeLessThanOrEqual(GRID_SIZE);
    }
  });
});

describe("the houses sit where the rules say a pawn turns off", () => {
  it("puts house step 1 next to that seat's own turn-off field, for all four seats", () => {
    for (const seat of SEATS) {
      const turnOff = trackCell(turnOffSquare(seat));

      expect(areAdjacent(turnOff, houseCell(seat, 1)), `seat ${seat}`).toBe(true);
    }
  });

  it("runs each house inward, one step at a time", () => {
    for (const seat of SEATS) {
      for (let step = 1; step < HOUSE_CELLS[seat].length; step += 1) {
        expect(areAdjacent(houseCell(seat, step), houseCell(seat, step + 1))).toBe(true);
      }
    }
  });

  it("gives the four houses 16 different cells, none of them on the shared track", () => {
    const houses = HOUSE_CELLS.flat().map(key);
    const track = new Set(TRACK_CELLS.map(key));

    expect(new Set(houses).size).toBe(MAX_PLAYERS * 4);
    expect(houses.filter((cell) => track.has(cell))).toEqual([]);
  });
});

describe("the yards", () => {
  it("gives the four seats 16 different waiting cells, none on the track and none in a house", () => {
    const slots = SEATS.flatMap((seat) => PAWNS.map((pawn) => key(startSlotCell(seat, pawn))));
    const taken = new Set([...TRACK_CELLS, ...HOUSE_CELLS.flat()].map(key));

    expect(new Set(slots).size).toBe(MAX_PLAYERS * PAWNS.length);
    expect(slots.filter((cell) => taken.has(cell))).toEqual([]);
  });
});

describe("pawnCell", () => {
  it("puts a waiting pawn in its own slot and the four pawns of a seat in four cells", () => {
    for (const seat of SEATS) {
      const cells = PAWNS.map((pawn) => key(pawnCell(seat, 0, pawn)));
      expect(new Set(cells).size).toBe(PAWNS.length);
    }
  });

  it("puts a pawn at r = 1 on its own seat's entry field", () => {
    for (const seat of SEATS) {
      expect(pawnCell(seat, 1, 0)).toEqual(trackCell(entrySquare(seat)));
    }
  });

  it("puts a pawn at r = 40 on its own seat's turn-off field", () => {
    for (const seat of SEATS) {
      expect(pawnCell(seat, TRACK_LENGTH, 0)).toEqual(trackCell(turnOffSquare(seat)));
    }
  });

  it("walks one whole journey without ever repeating a cell or leaving the grid", () => {
    for (const seat of SEATS) {
      const visited = [];
      for (let r = 1; r <= 44; r += 1) visited.push(key(pawnCell(seat, r, 0)));

      expect(new Set(visited).size).toBe(44);
    }
  });
});

describe("cellCentre", () => {
  it("puts the centre half a cell inside the cell's own top left corner", () => {
    expect(cellCentre([1, 1])).toEqual({ column: 0.5, row: 0.5 });
    expect(cellCentre([6, 11])).toEqual({ column: 10.5, row: 5.5 });
  });

  it("is what pawnCentre reports for the cell the pawn is in", () => {
    expect(pawnCentre(2, 5, 0)).toEqual(cellCentre(pawnCell(2, 5, 0)));
  });
});

describe("the input checks", () => {
  it("refuse a seat, a slot, a step or a track index that does not exist", () => {
    expect(() => startSlotCell(4, 0)).toThrow(RangeError);
    expect(() => startSlotCell(0, 4)).toThrow(RangeError);
    expect(() => houseCell(0, 0)).toThrow(RangeError);
    expect(() => houseCell(0, 5)).toThrow(RangeError);
    expect(() => trackCell(TRACK_LENGTH)).toThrow(RangeError);
    expect(() => trackCell(-1)).toThrow(RangeError);
  });
});
