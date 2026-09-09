/**
 * Where a position on the board is, in grid cells. Issue #62.
 *
 * This is the `ui/` half of the board: `core/board.js` says a pawn is at relative position `r`,
 * this file says which of the 121 cells of the 11 by 11 grid that is. It imports `core/` and is
 * imported by the view. It touches no DOM and holds no rule, so it is unit-testable without a
 * browser even though it lives in `ui/`.
 *
 * ## Why the numbers are here and not in `core/`
 *
 * A grid cell is a presentation fact. `core/` must not know that the board is drawn at all, let
 * alone on an 11 by 11 grid, which is NFR-01. What `core/` owns is "index 4 comes after index 3";
 * what this file owns is "index 4 is drawn in row 5, column 5".
 *
 * ## The one thing that can silently break
 *
 * `TRACK_CELLS` below and the 40 rules in `src/ui/styles/board-track.css` are the same table written
 * twice, once for JavaScript and once for CSS. If they drift, pawns walk over the board next to the
 * squares instead of onto them, and nothing throws. `tests/unit/ui/board-geometry.test.js` reads the
 * stylesheet and compares the two, which is the only reason writing it twice is acceptable.
 *
 * Both come from D3 of
 * [01-spec-foundations-and-board.md](../../01-Design/Handoff/01-spec-foundations-and-board.md).
 */

import { MAX_PLAYERS, REGION, absoluteSquare, homeColumnStep, region } from "../core/board.js";

/** The board is 11 cells square. Rows and columns are 1 based, as in CSS grid. */
export const GRID_SIZE = 11;

/**
 * Track index to `[row, column]`.
 *
 * Travel is clockwise and index 0 is player 0's entry field. Indices 4, 14, 24 and 34 are the four
 * corners of the centre 3 by 3: they are ordinary track fields, and they are the hinge that joins
 * one arm's outer row to the next arm's inner row, which is what closes the ring (D3a).
 */
export const TRACK_CELLS = [
  [5, 1],
  [5, 2],
  [5, 3],
  [5, 4],
  [5, 5],
  [4, 5],
  [3, 5],
  [2, 5],
  [1, 5],
  [1, 6],
  [1, 7],
  [2, 7],
  [3, 7],
  [4, 7],
  [5, 7],
  [5, 8],
  [5, 9],
  [5, 10],
  [5, 11],
  [6, 11],
  [7, 11],
  [7, 10],
  [7, 9],
  [7, 8],
  [7, 7],
  [8, 7],
  [9, 7],
  [10, 7],
  [11, 7],
  [11, 6],
  [11, 5],
  [10, 5],
  [9, 5],
  [8, 5],
  [7, 5],
  [7, 4],
  [7, 3],
  [7, 2],
  [7, 1],
  [6, 1],
];

/** The top left cell of each seat's 4 by 4 yard, seat 0 to seat 3. */
export const YARD_ORIGIN = [
  [1, 1],
  [1, 8],
  [8, 8],
  [8, 1],
];

/**
 * Where each of the four waiting slots sits inside a yard, as an offset from the yard's origin.
 *
 * A 2 by 2 cluster in the middle of the 4 by 4 block, which leaves a one-cell border of seat colour
 * around it on every side.
 */
export const SLOT_OFFSETS = [
  [1, 1],
  [1, 2],
  [2, 1],
  [2, 2],
];

/**
 * The four house squares of each seat, step 1 first.
 *
 * Step 1 is always the square against that seat's turn-off field and step 4 is the deepest one, so
 * the four lists run in four different directions. `board.css` gets the same result from flex
 * direction rather than from four sets of placements; here they are written out, because a lookup
 * table is easier to check against the board than a direction rule is.
 */
export const HOUSE_CELLS = [
  [
    [6, 2],
    [6, 3],
    [6, 4],
    [6, 5],
  ],
  [
    [2, 6],
    [3, 6],
    [4, 6],
    [5, 6],
  ],
  [
    [6, 10],
    [6, 9],
    [6, 8],
    [6, 7],
  ],
  [
    [10, 6],
    [9, 6],
    [8, 6],
    [7, 6],
  ],
];

function assertSeat(seat) {
  if (!Number.isInteger(seat) || seat < 0 || seat >= MAX_PLAYERS) {
    throw new RangeError(`seat must be an integer 0..${MAX_PLAYERS - 1}, got ${seat}`);
  }
}

/** The cell holding waiting slot `slot` of `seat`'s yard. */
export function startSlotCell(seat, slot) {
  assertSeat(seat);
  if (!Number.isInteger(slot) || slot < 0 || slot >= SLOT_OFFSETS.length) {
    throw new RangeError(`slot must be an integer 0..${SLOT_OFFSETS.length - 1}, got ${slot}`);
  }

  const [originRow, originColumn] = YARD_ORIGIN[seat];
  const [offsetRow, offsetColumn] = SLOT_OFFSETS[slot];
  return [originRow + offsetRow, originColumn + offsetColumn];
}

/** The cell holding house square `step`, 1 to 4, of `seat`. */
export function houseCell(seat, step) {
  assertSeat(seat);
  const cells = HOUSE_CELLS[seat];
  if (!Number.isInteger(step) || step < 1 || step > cells.length) {
    throw new RangeError(`step must be an integer 1..${cells.length}, got ${step}`);
  }
  return cells[step - 1];
}

/** The cell holding track index `index`, 0 to 39. */
export function trackCell(index) {
  const cell = TRACK_CELLS[index];
  if (cell === undefined) {
    throw new RangeError(
      `track index must be an integer 0..${TRACK_CELLS.length - 1}, got ${index}`
    );
  }
  return cell;
}

/**
 * The cell a pawn stands in.
 *
 * `slot` is the pawn's own number, 0 to 3, and is only used while the pawn is in its yard: the four
 * pawns of a seat wait in four different slots, so the pawn number is what tells them apart there.
 * Everywhere else the position alone decides.
 */
export function pawnCell(seat, r, slot) {
  switch (region(r)) {
    case REGION.START:
      return startSlotCell(seat, slot);
    case REGION.TRACK:
      return trackCell(absoluteSquare(seat, r));
    default:
      return houseCell(seat, homeColumnStep(r));
  }
}

/**
 * The centre of a cell, in fractional cell units measured from the board's top left corner.
 *
 * This is the pair the view writes into `--pawn-col` and `--pawn-row`, and `pawn.css` turns into a
 * `transform`. A cell at column `c` and row `t`, both 1 based, has its centre half a cell inside its
 * own top left corner, so the numbers come out as `c - 0.5` and `t - 0.5`.
 */
export function cellCentre([row, column]) {
  return { column: column - 0.5, row: row - 0.5 };
}

/** The centre of the cell a pawn stands in, ready to be written onto the element. */
export function pawnCentre(seat, r, slot) {
  return cellCentre(pawnCell(seat, r, slot));
}
