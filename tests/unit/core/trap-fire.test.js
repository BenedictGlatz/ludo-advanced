/**
 * What a trap does when a pawn walks into it. Issue #45, requirement FR-30.
 *
 * Moved out of `cards/trap-effects.test.js` with the code it tests, and the assertions changed shape
 * with it: **`fireTrap` no longer returns a pawn list.** It returns the two lists it can change plus
 * `slide`, the distance the pawn is to be pushed, and something else does the pushing. So the cases
 * here are about the *decision* a trap makes, and `enter.test.js` covers where the pawn ends up.
 *
 * That split is worth stating, because it is why two of these cases are one line shorter than the ones
 * they replaced: a rule that hands back a number is easier to check than a rule that hands back
 * sixteen pawns.
 */

import { describe, expect, it } from "vitest";

import { STATUS, turnsForRounds } from "../../../src/core/statuses.js";
import { NOT_THAT_DEEP_PUSHBACK, OIL_SLIDE, fireTrap } from "../../../src/core/trap-fire.js";
import { TRAP_KIND } from "../../../src/core/traps.js";
import { rngForDice } from "../../helpers/fixtures.js";

const mover = { player: 0, pawn: 0 };

const trapOn = (kind, square = 12) => ({ kind, square, owner: 2, until: null });

/** Fire one kind of trap under seat 0's pawn 0. `turnNumber` is 7 and the table has four seats. */
function fire(kind, dice = [], overrides = {}) {
  const trap = trapOn(kind);

  return fireTrap({
    statuses: [],
    traps: [trap],
    trap,
    mover,
    turnNumber: 7,
    playerCount: 4,
    rng: rngForDice(dice),
    ...overrides,
  });
}

describe("Banana Peel stuns the pawn instead of moving it", () => {
  /**
   * The rule the Game Design Document always described, and which the code did not do until issue #45:
   * "the next pawn to cross it is stunned and loses its next turn". It used to send the pawn home,
   * which cost a full lap rather than a turn.
   */
  it("writes a stun and asks for no movement at all", () => {
    const result = fire(TRAP_KIND.BANANA_PEEL);

    expect(result.slide).toBe(0);
    expect(result.statuses).toHaveLength(1);
    expect(result.statuses[0]).toMatchObject({
      kind: STATUS.STUNNED,
      player: 0,
      pawn: 0,
      source: "action-banana-peel",
    });
  });

  /**
   * The deadline is `turnNumber + turnsForRounds(1, playerCount) + 1`, and the `+ 1` is the whole
   * subtlety. `hasStatus` applies while `turnNumber < until`, and a trap sprung during a dice move
   * fires under the active seat's own pawn, so the turn to be missed is a full round away. Without the
   * `+ 1` the stun would expire on exactly that turn and cost nothing.
   *
   * Checked at every table size, because `turnsForRounds` is the only thing that varies and a
   * hard-coded 4 would have hidden a two-player bug.
   */
  it("lasts until after that pawn's next turn, at every table size", () => {
    for (const playerCount of [2, 3, 4]) {
      const result = fire(TRAP_KIND.BANANA_PEEL, [], { playerCount });
      const missedTurn = 7 + turnsForRounds(1, playerCount);

      expect(result.statuses[0].until).toBe(missedTurn + 1);
      expect(result.statuses[0].until).toBeGreaterThan(missedTurn);
    }
  });

  /**
   * A NaN deadline expires immediately, so a missing `playerCount` would make the stun silently do
   * nothing. That is the quietest kind of bug in a rules engine, so it throws instead.
   */
  it("refuses to guess the table size", () => {
    expect(() => fire(TRAP_KIND.BANANA_PEEL, [], { playerCount: undefined })).toThrow(RangeError);
  });
});

describe("the two traps that move the pawn hand back a distance", () => {
  /**
   * A fixed 1, and it draws no die at all. It used to be a D6, averaging 3.5, which made the card with
   * the smallest name the second harshest trap in the game. The scripted RNG is deliberately left empty
   * here: `rngForDice` throws when it is asked for a roll it was not given, so this asserts that no die
   * is drawn rather than merely that the answer is 1.
   */
  it("It's Not That Deep asks for a one-square push and rolls nothing", () => {
    const result = fire(TRAP_KIND.NOT_THAT_DEEP);

    expect(result.slide).toBe(-NOT_THAT_DEEP_PUSHBACK);
    expect(result.slide).toBe(-1);
    expect(result.statuses).toEqual([]);
  });

  /**
   * Oil Spill slides the pawn **and** marks it, so the square it stops on hands out no skill card. A
   * card whose whole point is speed should not also be the best way to farm cards.
   */
  it("Oil Spill asks for a forward slide and marks the pawn as having slid", () => {
    // The slide is 3 plus a D3 minus 1, so a 1 on the D3 is the shortest slide.
    const result = fire(TRAP_KIND.OIL_SPILL, [[1, 3]]);

    expect(result.slide).toBe(OIL_SLIDE.min);
    expect(result.statuses[0]).toMatchObject({
      kind: STATUS.SLIPPERY,
      player: 0,
      pawn: 0,
      until: 8,
    });
  });

  it("Oil Spill's slide stays inside the 3 to 5 the card promises", () => {
    for (const roll of [1, 2, 3]) {
      const slide = fire(TRAP_KIND.OIL_SPILL, [[roll, 3]]).slide;

      expect(slide).toBeGreaterThanOrEqual(OIL_SLIDE.min);
      expect(slide).toBeLessThanOrEqual(OIL_SLIDE.max);
    }
  });
});

describe("the trap list afterwards", () => {
  /**
   * A trap is single use. One that survived because the pawn it caught happened to be unmovable would
   * sit there being a surprise twice.
   */
  it("clears the trap off the board, whatever it decided", () => {
    for (const [kind, dice] of [
      [TRAP_KIND.BANANA_PEEL, []],
      [TRAP_KIND.NOT_THAT_DEEP, []],
      [TRAP_KIND.OIL_SPILL, [[1, 3]]],
    ]) {
      expect(fire(kind, dice).traps).toEqual([]);
    }
  });

  it("leaves any other trap on the board standing", () => {
    const sprung = trapOn(TRAP_KIND.BANANA_PEEL, 12);
    const other = trapOn(TRAP_KIND.OIL_SPILL, 20);

    const result = fireTrap({
      statuses: [],
      traps: [sprung, other],
      trap: sprung,
      mover,
      turnNumber: 7,
      playerCount: 4,
      rng: rngForDice([]),
    });

    expect(result.traps).toEqual([other]);
  });
});

describe("a blocker must never get here", () => {
  /**
   * **This case inverted in issue #45**, and the inversion is the point. It used to assert that a
   * blocker reaching `fireTrap` did nothing and stayed standing, which meant a missing rule for a new
   * trap kind was swallowed by the same branch in complete silence.
   *
   * Two guards already stand between a blocker and this function: `blockedSquares` refuses the move,
   * and `firstTrapOnPath` skips blockers anyway. Arriving here means one of them broke, and that is
   * worth an exception rather than a no-op that hides which.
   */
  it("throws rather than quietly doing nothing", () => {
    expect(() => fire(TRAP_KIND.BIG_AH_ROCK)).toThrow(/not a trap/);
  });
});
