/**
 * Where a pushed pawn stops. Issue #45, requirement FR-30.
 *
 * `displacement.js` used to own a blunt `displace` that clamped and nothing else. Issue #45 deleted it,
 * because once this module existed every caller wanted it. This
 * file covers the careful one, and every case is about a square the pawn is *not* allowed to end on.
 *
 * ## Reading the coordinates
 *
 * A pawn's `r` is relative to its own seat and an object on a square is absolute, so the two never
 * match and the tests have to convert. `absoluteSquare(player, r) = (10 * player + r - 1) mod 40`, so:
 *
 * | Pawn | `r` | Absolute square |
 * | --- | --- | --- |
 * | seat 0 | 10 | 9 |
 * | seat 0 | 13 | 12 |
 * | seat 2 | 33 | 12 |
 *
 * Seat 2 at `r = 33` and seat 0 at `r = 13` are therefore standing on the **same** square, which is
 * what makes them useful for a capture case and for a blocker case in the same fixture.
 */

import { describe, expect, it } from "vitest";

import { HOME_R, START_R } from "../../../src/core/board.js";
import { PUSHBACK_FLOOR } from "../../../src/core/displacement.js";
import { slidePawn, slideStop } from "../../../src/core/slide.js";
import { STATUS } from "../../../src/core/statuses.js";
import { TRAP_KIND } from "../../../src/core/traps.js";
import { pawnsAt } from "../../helpers/fixtures.js";

const boardWith = (statuses = [], traps = []) => ({ statuses, traps });

const status = (kind, player, pawn, until = 99) => ({ kind, player, pawn, until, source: "test" });

const blocker = (square) => ({
  kind: TRAP_KIND.BIG_AH_ROCK,
  square,
  owner: 3,
  until: 99,
});

const rOf = (pawns, player, pawn) =>
  pawns.find((entry) => entry.player === player && entry.pawn === pawn).r;

const mover = { player: 0, pawn: 0 };

describe("an unobstructed push goes the whole way", () => {
  it("carries a pawn forwards by exactly the distance asked for", () => {
    const pawns = pawnsAt(4, { "0.0": 10 });

    expect(slideStop(pawns, boardWith(), mover, 5)).toBe(15);
  });

  it("carries a pawn backwards too, which is the same walk counting down", () => {
    const pawns = pawnsAt(4, { "0.0": 10 });

    expect(slideStop(pawns, boardWith(), mover, -4)).toBe(6);
  });

  it("moves nothing for a delta of zero", () => {
    const pawns = pawnsAt(4, { "0.0": 10 });
    const result = slidePawn(pawns, boardWith(), mover, 0);

    expect(result.to).toBe(10);
    expect(result.pawns).toBe(pawns);
  });
});

describe("a blocker stops the slide on the square before it", () => {
  /**
   * A Big Ah Rock is an entry in the trap list with a square of its own, so this is the simple half.
   * Absolute 12 is seat 0's `r = 13`, so a push of 5 from `r = 10` walks into it and stops at 12.
   */
  it("stops before a Big Ah Rock rather than sliding through it", () => {
    const pawns = pawnsAt(4, { "0.0": 10 });
    const board = boardWith([], [blocker(12)]);

    expect(slideStop(pawns, board, mover, 5)).toBe(12);
  });

  /**
   * The other half, and the reason `blockedSquares` reads pawns at all: a Rock is a status on a pawn,
   * so the blocked square is wherever that pawn is standing this instant. Seat 2 at `r = 33` is on
   * absolute 12.
   */
  it("stops before a Rock, which is a blocker that walks", () => {
    const pawns = pawnsAt(4, { "0.0": 10, "2.0": 33 });
    const board = boardWith([status(STATUS.ROCK, 2, 0)]);

    expect(slideStop(pawns, board, mover, 5)).toBe(12);
  });

  /**
   * The clamp runs before the walk, so a slide cannot be stopped by something on a square it was
   * never going to reach. Absolute 16 is seat 0's `r = 17`, two squares past the target.
   */
  it("ignores a blocker beyond where the push would have ended anyway", () => {
    const pawns = pawnsAt(4, { "0.0": 10 });
    const board = boardWith([], [blocker(16)]);

    expect(slideStop(pawns, board, mover, 5)).toBe(15);
  });
});

describe("what the slide may and may not share a square with", () => {
  /**
   * The ordinary Ludo rule survives: pawns pass over occupied squares freely and only the square the
   * pawn stops on captures. Seat 2 at `r = 33` is crossed here, not landed on, so it stays put.
   */
  it("slides straight over an opponent it does not land on", () => {
    const pawns = pawnsAt(4, { "0.0": 10, "2.0": 33 });
    const result = slidePawn(pawns, boardWith(), mover, 5);

    expect(result.to).toBe(15);
    expect(result.captured).toBeNull();
    expect(rOf(result.pawns, 2, 0)).toBe(33);
  });

  /** The bug this module exists to close: a slide onto an opponent used to leave both pawns there. */
  it("captures an opponent standing on the square it stops on", () => {
    const pawns = pawnsAt(4, { "0.0": 10, "2.0": 33 });
    const result = slidePawn(pawns, boardWith(), mover, 3);

    expect(result.to).toBe(13);
    expect(result.captured).toEqual({ player: 2, pawn: 0 });
    expect(rOf(result.pawns, 2, 0)).toBe(START_R);
    expect(rOf(result.pawns, 0, 0)).toBe(13);
  });

  /**
   * FR-12. Two pawns of one player may never share a square, and `captureTarget` would not have
   * caught this one: it filters to opponents, so the corruption would have been silent.
   */
  it("stops behind a pawn of its own player and captures nothing", () => {
    const pawns = pawnsAt(4, { "0.0": 10, "0.1": 13 });
    const result = slidePawn(pawns, boardWith(), mover, 5);

    expect(result.to).toBe(12);
    expect(result.captured).toBeNull();
    expect(rOf(result.pawns, 0, 1)).toBe(13);
  });

  /**
   * `moveOnto` already reasons that a pawn which cannot be captured cannot be landed on either,
   * because the alternative is two pawns sharing a square. A shove follows the same rule.
   */
  it("stops behind an armoured opponent rather than capturing it", () => {
    const pawns = pawnsAt(4, { "0.0": 10, "2.0": 33 });
    const board = boardWith([status(STATUS.ARMOURED, 2, 0)]);
    const result = slidePawn(pawns, board, mover, 5);

    expect(result.to).toBe(12);
    expect(result.captured).toBeNull();
    expect(rOf(result.pawns, 2, 0)).toBe(33);
  });

  /**
   * The same own-pawn rule inside a house column, where it is what forces all four house squares to
   * be filled before FR-05's win condition can be met. `isSameSquare` is the only one of the three
   * checks that works here, which is why it is asked first.
   */
  it("stops behind an own pawn in the house column", () => {
    const pawns = pawnsAt(4, { "0.0": 40, "0.1": 42 });

    expect(slideStop(pawns, boardWith(), mover, 3)).toBe(41);
  });
});

describe("the two clamps, inherited unchanged from the deleted displace", () => {
  it("caps a forward push at the deepest house square", () => {
    const pawns = pawnsAt(4, { "0.0": 42 });

    expect(slideStop(pawns, boardWith(), mover, 9)).toBe(HOME_R);
  });

  /**
   * The floor is a game decision and not arithmetic: if a pushback reached the start area, three
   * cards would be cheap substitutes for a capture and capture would be worth nothing.
   */
  it("stops a backward push at the entry square and never re-enters the start area", () => {
    const pawns = pawnsAt(4, { "0.0": 3 });

    expect(slideStop(pawns, boardWith(), mover, -10)).toBe(PUSHBACK_FLOOR);
  });

  it("does not move a pawn that is still in its start area", () => {
    const pawns = pawnsAt(4);
    const result = slidePawn(pawns, boardWith(), mover, 5);

    expect(result.to).toBe(START_R);
    expect(result.pawns).toBe(pawns);
  });

  it("answers the start area for a pawn reference that names nothing", () => {
    expect(slideStop(pawnsAt(4), boardWith(), { player: 0, pawn: 99 }, 5)).toBe(START_R);
  });
});

describe("the walk it reports", () => {
  /**
   * `from` and `to` exist so the caller can ask what the pawn crossed, and only this function knows
   * where the push stopped. A blocked slide has to report the shortened walk and not the intended one,
   * or the trap check that runs afterwards would look at squares the pawn never touched.
   */
  it("reports the walk the pawn really took, not the one that was asked for", () => {
    const pawns = pawnsAt(4, { "0.0": 10 });
    const board = boardWith([], [blocker(12)]);
    const result = slidePawn(pawns, board, mover, 5);

    expect(result.from).toBe(10);
    expect(result.to).toBe(12);
  });
});
