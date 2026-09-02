/**
 * What the skill cards do to movement. Issue #38.
 *
 * `movement.test.js` still owns every rule that existed before this: leaving the start area, capture,
 * the exact count home, the turn-level reason. It passes unchanged, because `board` defaults to
 * `EMPTY_BOARD` and an empty board is the pre-issue-38 game.
 *
 * This file covers only what the default hides. Every case builds a board with one status or one trap
 * on it and asserts the one rule that changes.
 */

import { describe, expect, it } from "vitest";

import { REFUSAL, evaluateTurn, legalMoves } from "../../../src/core/movement.js";
import { blockedSquares } from "../../../src/core/move-rules.js";
import { STATUS } from "../../../src/core/statuses.js";
import { TRAP_KIND } from "../../../src/core/traps.js";
import { pawnsAt } from "../../../tests/helpers/fixtures.js";

const boardWith = (statuses = [], traps = []) => ({ statuses, traps });

const status = (kind, player, pawn, until = 99) => ({ kind, player, pawn, until, source: "test" });

describe("leaving the start area is now roll >= dieMax (FR-09)", () => {
  /**
   * The rule change Angel Die forced. Under the old `roll === dieMax` a buff would have made leaving
   * the yard impossible, which is the opposite of what a buff is for.
   *
   * The second assertion is the compatibility claim: with no card in play a roll can never exceed the
   * maximum, so every match played before this change plays identically.
   */
  it("lets a buffed roll above the maximum get a pawn out", () => {
    expect(legalMoves(pawnsAt(4), 0, 11, 6)).toHaveLength(4);
  });

  it("still refuses anything below the maximum", () => {
    const result = evaluateTurn(pawnsAt(4), 0, 5, 6);

    expect(result.moves).toEqual([]);
    expect(result.reason).toBe(REFUSAL.NEEDS_MAXIMUM);
  });
});

describe("a roll of zero (Devil Die)", () => {
  it("moves nothing and says so with its own reason rather than four copies of one", () => {
    const result = evaluateTurn(pawnsAt(4, { "0.0": 12 }), 0, 0, 6);

    expect(result.moves).toEqual([]);
    expect(result.refusals).toEqual([]);
    expect(result.reason).toBe(REFUSAL.NO_STEPS);
  });
});

describe("Hold Pawn and Lock In take one pawn out of the choice", () => {
  it("drops a held pawn and leaves the others alone", () => {
    const pawns = pawnsAt(4, { "0.0": 12, "0.1": 14 });
    const board = boardWith([status(STATUS.HELD, 0, 0)]);
    const moves = legalMoves(pawns, 0, 3, 6, board);

    expect(moves.map((move) => move.pawn)).toEqual([1]);
  });

  it("names the reason per pawn, so the screen can say which one is stuck (NFR-08)", () => {
    const pawns = pawnsAt(4, { "0.0": 12 });
    const board = boardWith([status(STATUS.LOCKED, 0, 0)]);
    const result = evaluateTurn(pawns, 0, 3, 6, board);

    expect(result.refusals).toContainEqual({ player: 0, pawn: 0, reason: REFUSAL.LOCKED });
  });
});

describe("a Banana Peel's stun takes one pawn out of the choice too (issue #45)", () => {
  /**
   * The Product Owner's reading of "the next pawn to cross it is stunned and loses its next turn":
   * **only that pawn sits out.** Its owner's other three are unaffected, which is exactly the shape
   * Hold Pawn already has, so there is no new step in the turn sequence.
   */
  it("drops the stunned pawn and leaves its owner's others alone", () => {
    const pawns = pawnsAt(4, { "0.0": 12, "0.1": 14, "0.2": 16 });
    const board = boardWith([status(STATUS.STUNNED, 0, 0)]);
    const moves = legalMoves(pawns, 0, 3, 6, board);

    expect(moves.map((move) => move.pawn)).toEqual([1, 2]);
  });

  /**
   * A reason of its own rather than reusing `HELD`, and the difference matters to the player: Hold
   * Pawn is something an opponent played at them, a stun is something they walked into. The turn-level
   * answer only collapses to one reason when every pawn was refused for the same one.
   */
  it("says a trap did it, not that the pawn is being held", () => {
    const pawns = pawnsAt(4, { "0.0": 12 });
    const board = boardWith([status(STATUS.STUNNED, 0, 0)]);
    const result = evaluateTurn(pawns, 0, 3, 6, board);

    expect(result.refusals).toContainEqual({ player: 0, pawn: 0, reason: REFUSAL.STUNNED });
  });

  /**
   * The turn-level answer, which only collapses to one reason when **every** pawn was refused for the
   * same one (FR-14). All four have to be on the track and stunned: a fixture with three pawns still
   * in the start area answers `NONE_AVAILABLE`, because they are refused for needing the maximum and
   * two different reasons do not describe a turn.
   */
  it("describes the whole turn when every pawn is stunned", () => {
    const pawns = pawnsAt(4, { "0.0": 12, "0.1": 14, "0.2": 16, "0.3": 18 });
    const board = boardWith([
      status(STATUS.STUNNED, 0, 0),
      status(STATUS.STUNNED, 0, 1),
      status(STATUS.STUNNED, 0, 2),
      status(STATUS.STUNNED, 0, 3),
    ]);
    const result = evaluateTurn(pawns, 0, 3, 6, board);

    expect(result.moves).toEqual([]);
    expect(result.reason).toBe(REFUSAL.STUNNED);
  });
});

describe("Ragebait forces the taunted pawn to move", () => {
  /**
   * The one card whose effect is about the relationship between a player's moves rather than about a
   * single pawn, which is why it is a filter over the finished list and not a rule inside
   * `evaluatePawn`. Asking one pawn "may I move" cannot answer "is a different pawn obliged to".
   */
  it("removes every other move while the taunted pawn can move", () => {
    const pawns = pawnsAt(4, { "0.0": 12, "0.1": 14, "0.2": 16 });
    const board = boardWith([status(STATUS.RAGEBAIT, 0, 1)]);

    expect(legalMoves(pawns, 0, 3, 6, board).map((move) => move.pawn)).toEqual([1]);
  });

  /**
   * A card that could strand a player with no legal move at all would end their turn for them, which
   * is not what a taunt is. Here the taunted pawn is already home, so it has no move and the filter
   * has to stand down.
   */
  it("leaves the list alone when the taunted pawn cannot move", () => {
    const pawns = pawnsAt(4, { "0.0": 12, "0.1": 44 });
    const board = boardWith([status(STATUS.RAGEBAIT, 0, 1)]);

    expect(legalMoves(pawns, 0, 3, 6, board).map((move) => move.pawn)).toEqual([0]);
  });
});

describe("Built Different protects a pawn from being landed on", () => {
  /**
   * A pawn that cannot be captured cannot be landed on either, because the alternative is two pawns
   * sharing a square. So a protective status turns into a movement refusal rather than into a capture
   * that quietly does nothing.
   */
  it("refuses the move instead of capturing", () => {
    // Player 0's r = 15 is absolute square 14, and so is player 1's r = 5: entry 10, plus 5, minus 1.
    const pawns = pawnsAt(4, { "0.0": 12, "1.0": 5 });
    const board = boardWith([status(STATUS.ARMOURED, 1, 0)]);
    const result = evaluateTurn(pawns, 0, 3, 6, board);

    expect(result.refusals).toContainEqual({ player: 0, pawn: 0, reason: REFUSAL.PROTECTED });
  });
});

describe("The Purge makes an own pawn capturable instead of blocking", () => {
  it("turns the FR-12 refusal into a capture of the mover's own pawn", () => {
    const pawns = pawnsAt(4, { "0.0": 12, "0.1": 15 });
    const purge = [{ kind: STATUS.PURGE, player: null, pawn: null, until: 99 }];

    expect(evaluateTurn(pawns, 0, 3, 6).refusals).toContainEqual({
      player: 0,
      pawn: 0,
      reason: REFUSAL.OWN_PAWN,
    });

    const move = legalMoves(pawns, 0, 3, 6, boardWith(purge)).find((entry) => entry.pawn === 0);
    expect(move.captures).toEqual({ player: 0, pawn: 1 });
  });
});

describe("Rocks block the path, not just the target", () => {
  /**
   * This is the one rule that had to look at the whole walk. Every other rule in the project checks
   * the destination, and the module's own comment says why: a pawn jumping over three opponents is
   * classic Ludo working correctly.
   */
  it("refuses a move that passes over a blocked square without landing on it", () => {
    // Player 2 enters at square 20, so its r = 5 is absolute square 24. Player 0 walking from r = 22
    // to r = 27 crosses absolute 22 to 26, so it passes over 24 and lands two squares beyond it.
    const pawns = pawnsAt(4, { "0.0": 22, "2.0": 5 });
    const board = boardWith([status(STATUS.ROCK, 2, 0)]);
    const result = evaluateTurn(pawns, 0, 5, 6, board);

    expect(result.refusals).toContainEqual({ player: 0, pawn: 0, reason: REFUSAL.BLOCKED });
  });

  it("lets a move that stops short of the rock through", () => {
    const pawns = pawnsAt(4, { "0.0": 22, "2.0": 5 });
    const board = boardWith([status(STATUS.ROCK, 2, 0)]);

    expect(legalMoves(pawns, 0, 2, 6, board).map((move) => move.pawn)).toContain(0);
  });

  it("blocks a Big Ah Rock's square with no pawn standing on it", () => {
    const traps = [{ kind: TRAP_KIND.BIG_AH_ROCK, square: 14, owner: 2, until: 99 }];
    const pawns = pawnsAt(4, { "0.0": 12 });
    const result = evaluateTurn(pawns, 0, 3, 6, boardWith([], traps));

    expect(result.refusals).toContainEqual({ player: 0, pawn: 0, reason: REFUSAL.BLOCKED });
  });
});

describe("blockedSquares", () => {
  /**
   * Rock is stored as a status on a pawn and not as a square, so that the blocked square follows the
   * pawn. Storing the square would be storing a copy of a pawn position that goes stale the moment the
   * pawn walks, which is exactly the quiet duplication the state layer is built to avoid.
   */
  it("reads a Rock's square off the pawn's current position", () => {
    const board = boardWith([status(STATUS.ROCK, 2, 0)]);

    expect(blockedSquares(pawnsAt(4, { "2.0": 5 }), board)).toEqual([24]);
    expect(blockedSquares(pawnsAt(4, { "2.0": 8 }), board)).toEqual([27]);
  });

  it("ignores a Rock on a pawn that is in its start area or its house", () => {
    const board = boardWith([status(STATUS.ROCK, 2, 0)]);

    expect(blockedSquares(pawnsAt(4), board)).toEqual([]);
    expect(blockedSquares(pawnsAt(4, { "2.0": 43 }), board)).toEqual([]);
  });

  it("merges the two sources and lists each square once", () => {
    const traps = [{ kind: TRAP_KIND.BIG_AH_ROCK, square: 24, owner: 1, until: 99 }];
    const board = boardWith([status(STATUS.ROCK, 2, 0)], traps);

    expect(blockedSquares(pawnsAt(4, { "2.0": 5 }), board)).toEqual([24]);
  });
});
