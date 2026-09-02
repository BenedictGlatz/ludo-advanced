/**
 * Entering a square, and the chain one trap can start. Issue #45, requirement FR-30.
 *
 * The other half of what used to be one function. `trap-fire.test.js` covers the decision a trap
 * makes; this file covers the walk, which is the part that has rules of its own: only the first trap on
 * a path fires, a chain continues from wherever the pawn was pushed to, a blocker cuts it short, and
 * two kinds of arrival set off nothing at all.
 *
 * ## Reading the coordinates
 *
 * `absoluteSquare(player, r) = (10 * player + r - 1) mod 40`, so for seat 0 an absolute square is
 * simply `r - 1`. Every fixture below uses seat 0 for the mover to keep that arithmetic invisible, and
 * seat 2 for anybody who needs to be somewhere specific.
 */

import { describe, expect, it } from "vitest";

import { START_R } from "../../../src/core/board.js";
import { TRAP_CHAIN_LIMIT, enterSquares, shove } from "../../../src/core/enter.js";
import { STATUS } from "../../../src/core/statuses.js";
import { NOT_THAT_DEEP_DIE } from "../../../src/core/trap-fire.js";
import { TRAP_KIND } from "../../../src/core/traps.js";
import { pawnsAt, rngForDice } from "../../helpers/fixtures.js";

const mover = { player: 0, pawn: 0 };

const trap = (kind, square, owner = 2) => ({ kind, square, owner, until: null });

/** A world for `core/enter.js`. Seat 0 is the mover, the table has four seats, the turn is 7. */
function worldWith({ pawns = pawnsAt(4), traps = [], statuses = [], dice = [] } = {}) {
  return { pawns, statuses, traps, turnNumber: 7, playerCount: 4, rng: rngForDice(dice) };
}

const rOf = (result, player, pawn) =>
  result.pawns.find((entry) => entry.player === player && entry.pawn === pawn).r;

const hasStun = (result) => result.statuses.some((entry) => entry.kind === STATUS.STUNNED);

describe("which trap on the walk fires", () => {
  /**
   * The exception the whole module exists for: a trap fires on **crossing**, not only on landing. A
   * trap that needed an exact landing would almost never fire, because a D20 crosses twenty squares
   * and lands on one.
   */
  it("fires a trap the pawn crossed without landing on", () => {
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 15 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 11)],
    });
    const result = enterSquares(world, mover, 10, 15);

    expect(hasStun(result)).toBe(true);
    expect(result.traps).toEqual([]);
  });

  /** One move has one outcome. The near trap goes off and the far one is still there afterwards. */
  it("fires the nearest of two and leaves the far one standing", () => {
    const far = trap(TRAP_KIND.OIL_SPILL, 13);
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 15 }),
      traps: [far, trap(TRAP_KIND.BANANA_PEEL, 11)],
    });
    const result = enterSquares(world, mover, 10, 15);

    expect(hasStun(result)).toBe(true);
    expect(result.traps).toEqual([far]);
  });

  /** A card that punishes the player who played it is a card nobody plays. */
  it("does not fire a trap under a pawn of the player who laid it", () => {
    const own = trap(TRAP_KIND.BANANA_PEEL, 11, 0);
    const world = worldWith({ pawns: pawnsAt(4, { "0.0": 15 }), traps: [own] });
    const result = enterSquares(world, mover, 10, 15);

    expect(hasStun(result)).toBe(false);
    expect(result.traps).toEqual([own]);
  });

  it("leaves everything alone when nothing is on the way", () => {
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 15 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 30)],
    });
    const result = enterSquares(world, mover, 10, 15);

    expect(result.statuses).toEqual([]);
    expect(result.traps).toHaveLength(1);
  });
});

describe("the two arrivals that set off nothing", () => {
  /**
   * A captured pawn goes to `r = 0`, and walking it there would count every square between where it
   * stood and its own yard. So a captured pawn would be punished on its way to being punished, and
   * Hyperbeam, which sends up to four pawns home at once, could detonate the whole board.
   *
   * Implemented by `sendHome` being a different function that never reaches here, and guarded here as
   * well so the rule is checkable rather than merely true by construction.
   */
  it("a pawn arriving in its start area fires nothing", () => {
    const laid = trap(TRAP_KIND.BANANA_PEEL, 11);
    const world = worldWith({ pawns: pawnsAt(4), traps: [laid] });
    const result = enterSquares(world, mover, 15, START_R);

    expect(result.statuses).toEqual([]);
    expect(result.traps).toEqual([laid]);
  });

  it("an empty trap list is answered without walking anything", () => {
    const world = worldWith({ pawns: pawnsAt(4, { "0.0": 15 }) });

    expect(enterSquares(world, mover, 10, 15)).toEqual({
      pawns: world.pawns,
      statuses: [],
      traps: [],
    });
  });
});

describe("the chain a trap that moves the pawn starts", () => {
  /**
   * The Product Owner's decision: a trap-driven displacement can itself walk into a trap. Seat 0's
   * pawn is pushed back from `r = 14` by a scripted D6 of 3, landing on `r = 11`, and crosses absolute
   * 11 and 10 on the way. The Banana Peel on 10 is the second link.
   */
  it("a pushback that crosses a second trap sets that one off too", () => {
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 14 }),
      traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 13), trap(TRAP_KIND.BANANA_PEEL, 10)],
      dice: [[3, NOT_THAT_DEEP_DIE]],
    });
    const result = enterSquares(world, mover, 13, 14);

    expect(rOf(result, 0, 0)).toBe(11);
    expect(hasStun(result)).toBe(true);
    expect(result.traps).toEqual([]);
  });

  /**
   * A blocker cuts the chain short, which is the case `displace` could not express at all: the slide
   * used to carry the pawn straight through a boulder.
   */
  it("a blocker stops the push and the pawn ends in front of it", () => {
    const rock = trap(TRAP_KIND.BIG_AH_ROCK, 10);
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 14 }),
      traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 13), rock],
      dice: [[3, NOT_THAT_DEEP_DIE]],
    });
    const result = enterSquares(world, mover, 13, 14);

    expect(rOf(result, 0, 0)).toBe(12);
    expect(result.traps).toEqual([rock]);
  });

  /**
   * The other half of `slide.js`'s rule, reached through a trap rather than a card. Seat 2 at `r = 33`
   * is on absolute 12, which is seat 0's `r = 13`.
   */
  it("a push that lands on an opponent captures it", () => {
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 15, "2.0": 33 }),
      traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 14)],
      dice: [[2, NOT_THAT_DEEP_DIE]],
    });
    const result = enterSquares(world, mover, 14, 15);

    expect(rOf(result, 0, 0)).toBe(13);
    expect(rOf(result, 2, 0)).toBe(START_R);
  });

  /**
   * A stun moves nothing, so there is no second walk to ask about. Without this the chain would look
   * at a zero-length walk and re-fire the trap that had just gone off.
   */
  it("stops after a trap that moved nothing", () => {
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 15 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 14), trap(TRAP_KIND.BANANA_PEEL, 13)],
    });
    const result = enterSquares(world, mover, 14, 15);

    expect(rOf(result, 0, 0)).toBe(15);
    expect(result.traps).toHaveLength(1);
  });

  /**
   * The cap. It is not what makes the chain terminate, since every firing removes an entry, but it
   * bounds the recursion against a future trap kind that survives its own firing.
   *
   * Built as a run of It's Not That Deeps on consecutive squares, each pushing back 1 with a scripted
   * D6 of 1, so the pawn steps off one trap straight onto the next. Seat 0's pawn starts at `r = 32`
   * and the traps run backwards from absolute 31, which is the square `r = 32` stands on.
   * `TRAP_CHAIN_LIMIT + 2` are laid and exactly two must survive.
   */
  it("stops at the chain limit and leaves the rest standing and unfired", () => {
    const count = TRAP_CHAIN_LIMIT + 2;
    const traps = Array.from({ length: count }, (_, index) =>
      trap(TRAP_KIND.NOT_THAT_DEEP, 31 - index)
    );
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 32 }),
      traps,
      dice: Array.from({ length: count }, () => [1, NOT_THAT_DEEP_DIE]),
    });
    const result = enterSquares(world, mover, 31, 32);

    expect(result.traps).toHaveLength(count - TRAP_CHAIN_LIMIT);
  });
});

describe("shove, the entry point card-driven movement uses", () => {
  it("moves the pawn and fires what the push crossed", () => {
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 20 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 17)],
    });
    const result = shove(world, mover, -4);

    expect(rOf(result, 0, 0)).toBe(16);
    expect(hasStun(result)).toBe(true);
  });

  it("fires nothing when the push could not move the pawn at all", () => {
    const rock = trap(TRAP_KIND.BIG_AH_ROCK, 20);
    const world = worldWith({
      pawns: pawnsAt(4, { "0.0": 20 }),
      traps: [rock, trap(TRAP_KIND.BANANA_PEEL, 22)],
    });
    const result = shove(world, mover, 3);

    expect(rOf(result, 0, 0)).toBe(20);
    expect(result.traps).toHaveLength(2);
  });
});
