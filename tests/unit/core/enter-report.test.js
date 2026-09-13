/**
 * What `enterSquares` tells the view about a trap that went off. Issue #45, requirement FR-30.
 *
 * Split out of `enter.test.js`, which hit the 300-line NFR-02 limit. The seam is a real one: that file
 * is about **what a walk does to the board**, and this one is about **what the player is told**. The
 * two happen to come out of the same function because the report has to be taken while the evidence
 * still exists.
 *
 * ## Why the report exists at all, which is the point of every case below
 *
 * Under the new rules a Banana Peel does not move the pawn. It applies a status. So the pawn arrives
 * exactly where the player aimed it, the trap is removed from the list, and the board afterwards is
 * indistinguishable from one where nothing happened, while the pawn has quietly lost its next turn.
 * None of that is derivable after the fact, which is why `core/enter.js` reports it rather than
 * leaving the view to read it back off the board.
 *
 * ## Reading the coordinates
 *
 * `absoluteSquare(player, r) = (10 * player + r - 1) mod 40`, so for seat 0 an absolute square is
 * simply `r - 1`. Every fixture uses seat 0 for the mover to keep that arithmetic invisible.
 */

import { describe, expect, it } from "vitest";

import { START_R } from "../../../src/core/board.js";
import { enterSquares } from "../../../src/core/enter.js";
import { STATUS } from "../../../src/core/statuses.js";
import { TRAP_KIND } from "../../../src/core/traps.js";
import { pawnsAt, rngForDice } from "../../helpers/fixtures.js";

const mover = { player: 0, pawn: 0 };

const trap = (kind, square, owner = 2) => ({ kind, square, owner, until: null });

/** A world for `core/enter.js`. Seat 0 is the mover, the table has four seats, the turn is 7. */
function worldWith({ pawns = pawnsAt(4), traps = [], statuses = [], dice = [] } = {}) {
  return { pawns, statuses, traps, turnNumber: 7, playerCount: 4, rng: rngForDice(dice) };
}

const hasStun = (result) => result.statuses.some((entry) => entry.kind === STATUS.STUNNED);

describe("what the report names", () => {
  it("the object, its square, its owner and the pawn it caught", () => {
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 15 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 11, 3)],
    });
    const result = enterSquares(world, mover, 10, 15);

    expect(result.trapFired).toEqual({
      kind: TRAP_KIND.BANANA_PEEL,
      square: 11,
      owner: 3,
      player: 0,
      pawn: 0,
      squares: 0,
    });
  });

  /**
   * The owner is in the report because the message says whose trap it was, and because a trap belonging
   * to the player walking over it does not fire at all. Both facts are only available here.
   */
  it("the owner, taken from the trap rather than from the mover", () => {
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 15 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 11, 1)],
    });

    expect(enterSquares(world, mover, 10, 15).trapFired.owner).toBe(1);
  });
});

describe("the distance, for the one message that needs a number in it", () => {
  /** Oil Spill's sentence says how far the pawn slid, so the distance has to be carried. */
  it("carries the slide distance", () => {
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 15 }),
      traps: [trap(TRAP_KIND.OIL_SPILL, 11)],
      dice: [[1, 3]],
    });
    const result = enterSquares(world, mover, 10, 15);

    expect(result.trapFired.kind).toBe(TRAP_KIND.OIL_SPILL);
    expect(result.trapFired.squares).toBe(3);
  });

  /** A pushback is reported as a distance, not as a signed offset. A sentence does not want a minus. */
  it("reports a pushback as a positive distance", () => {
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 15 }),
      traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 11)],
    });

    expect(enterSquares(world, mover, 10, 15).trapFired.squares).toBe(1);
  });

  /** A trap that moves nothing reports zero rather than omitting the field. */
  it("reports zero for a trap that moves nothing", () => {
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 15 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 11)],
    });

    expect(enterSquares(world, mover, 10, 15).trapFired.squares).toBe(0);
  });
});

describe("a chain is one event as far as the message is concerned", () => {
  /**
   * The **first** trap is the one named. It is the one the player walked into and the only one they
   * could have seen coming; the second was reached by being pushed. Reporting the last would name a
   * trap the player never chose to go near.
   */
  it("names the first trap of a chain, not the last", () => {
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 12 }),
      traps: [trap(TRAP_KIND.OIL_SPILL, 11), trap(TRAP_KIND.BANANA_PEEL, 14)],
      dice: [[1, 3]],
    });
    const result = enterSquares(world, mover, 10, 12);

    expect(result.trapFired.kind).toBe(TRAP_KIND.OIL_SPILL);
    expect(hasStun(result)).toBe(true);
  });
});

describe("when there is nothing to report", () => {
  it("reports nothing when no trap was on the walk", () => {
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 15 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 30)],
    });

    expect(enterSquares(world, mover, 10, 15).trapFired).toBeNull();
  });

  it("reports nothing on an empty board", () => {
    const world = worldWith({ pawns: pawnsAt(4, { "0.0": 15 }) });

    expect(enterSquares(world, mover, 10, 15).trapFired).toBeNull();
  });

  /** A captured pawn going home crosses nothing, so there is nothing to announce either. */
  it("reports nothing for a pawn going home", () => {
    const world = worldWith({
      pawns: pawnsAt(4),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 11)],
    });

    expect(enterSquares(world, mover, 15, START_R).trapFired).toBeNull();
  });

  /** A trap belonging to the pawn's own player does not fire, so it is not reported. */
  it("reports nothing for the mover's own trap", () => {
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 15 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 11, 0)],
    });

    expect(enterSquares(world, mover, 10, 15).trapFired).toBeNull();
  });
});
