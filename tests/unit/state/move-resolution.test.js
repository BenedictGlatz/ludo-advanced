/**
 * What happens between a declared move and the end of a turn. Issue #38, FR-22 and FR-30.
 *
 * `resolveMove` does three things in one transition and the **order** is the rule:
 *
 * 1. the pawn arrives, and a captured pawn goes home
 * 2. a trap it walked into goes off, which can move it again
 * 3. the square it is **actually standing on** is asked whether it hands out a skill card
 *
 * Getting that order wrong is invisible in almost every test, because a trap and a skill square rarely
 * meet. So the cases below put them on purpose in each other's way.
 */

import { describe, expect, it } from "vitest";

import { fixedDieSource } from "../../../src/core/dice-source.js";
import { findPawn } from "../../../src/core/pawns.js";
import { STATUS } from "../../../src/core/statuses.js";
import { TRAP_KIND } from "../../../src/core/traps.js";
import { TURN_PHASE, createGameState, nextState } from "../../../src/state/game-state.js";
import { cancelPendingMove, resolveMove } from "../../../src/state/turn-manager.js";
import { pawnsAt, rngForDice } from "../../helpers/fixtures.js";

const trap = (kind, square, owner = 2) => ({ kind, square, owner, until: null });

/**
 * A two-player state in the reaction phase with a declared move, ready for `resolveMove`.
 *
 * Seat 0 walks from `from` to `to`. Absolute square numbers for seat 0 are `r - 1`, so a walk from
 * `r = 11` to `r = 15` crosses absolute squares 10 to 14.
 */
function declared({ from, to, pawns, traps = [], skillSquares = [], skillPool = [] }) {
  return nextState(createGameState(2, skillSquares), {
    phase: TURN_PHASE.REACTION,
    turnNumber: 7,
    chosenDie: 6,
    pawns,
    traps,
    skillPool,
    pendingMove: { player: 0, pawn: 0, kind: "advance", from, to, captures: null },
  });
}

const deps = (dice = []) => ({ rng: rngForDice(dice), diceSource: fixedDieSource(6) });

describe("a trap on the way", () => {
  /**
   * The one place in the project that looks at the whole walk. A trap that fired only on an exact
   * landing would almost never fire: a D20 crosses twenty squares and lands on one.
   */
  it("fires when the pawn crosses it without landing on it", () => {
    const state = declared({
      from: 11,
      to: 15,
      pawns: pawnsAt(2, { "0.0": 11 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 12)],
    });
    const resolved = resolveMove(state, deps());

    // The pawn finishes its move. A Banana Peel takes its next turn, not its position, so the only
    // evidence the trap fired is the status and the empty trap list. Before issue #45 this asserted
    // START_R, because the card used to send the pawn home.
    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(15);
    expect(resolved.statuses[0]).toMatchObject({ kind: STATUS.STUNNED, player: 0, pawn: 0 });
    expect(resolved.traps).toEqual([]);
  });

  it("leaves the pawn where it landed when nothing is on the way", () => {
    const state = declared({
      from: 11,
      to: 15,
      pawns: pawnsAt(2, { "0.0": 11 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 30)],
    });
    const resolved = resolveMove(state, deps());

    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(15);
    expect(resolved.traps).toHaveLength(1);
  });

  it("does not fire a trap under a pawn of the player who laid it", () => {
    const state = declared({
      from: 11,
      to: 15,
      pawns: pawnsAt(2, { "0.0": 11 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 12, 0)],
    });

    expect(findPawn(resolveMove(state, deps()).pawns, { player: 0, pawn: 0 }).r).toBe(15);
  });

  /**
   * Only the first trap on the walk, so one move has one outcome. The Banana Peel on square 12 is
   * nearer than the It's Not That Deep on 16, and a stun moves nothing, so the far trap is never
   * walked into and is still standing afterwards.
   *
   * This case is worth keeping exactly as it was framed: it is the one that proves a single move
   * cannot have two outcomes, which the chain introduced in issue #45 makes easy to get wrong.
   */
  it("fires the nearest of two traps and leaves the far one standing", () => {
    const state = declared({
      from: 11,
      to: 18,
      pawns: pawnsAt(2, { "0.0": 11 }),
      traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 16), trap(TRAP_KIND.BANANA_PEEL, 12)],
    });
    const resolved = resolveMove(state, deps());

    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(18);
    expect(resolved.statuses[0].kind).toBe(STATUS.STUNNED);
    expect(resolved.traps).toHaveLength(1);
    expect(resolved.traps[0].kind).toBe(TRAP_KIND.NOT_THAT_DEEP);
  });
});

describe("the order of trap and skill square", () => {
  /**
   * The case the ordering exists for. The pawn walks onto a skill square, and a trap on the way pushes
   * it off again. An implementation that asked about the skill square first would hand out a card for a
   * square the pawn is no longer standing on.
   *
   * **This case had to be rebuilt in issue #45 and it is worth knowing why.** It used to use a Banana
   * Peel, which sent the pawn home. Under the Game Design Document's rule a Banana Peel stuns and moves
   * nothing, so the pawn would now land on the skill square and collect the card, and the test would
   * have asserted the opposite of what it is for. Nothing about the step order changed; the fixture
   * simply stopped demonstrating it.
   *
   * It's Not That Deep replaces it, because a pushback still moves the pawn off where it landed. Seat
   * 0's `r = 15` is absolute 14, the skill square; the trap on absolute 12 is crossed at `r = 13` and
   * pushes the pawn back one, to `r = 14`, which is absolute 13 and not a skill square.
   *
   * The empty `deps()` is part of the assertion. `rngForDice` throws when asked for a roll it was not
   * given, so this also proves the trap draws no die and the skill square was never consumed.
   */
  it("asks about the square the pawn is really standing on, not the one the move named", () => {
    const state = declared({
      from: 11,
      to: 15,
      pawns: pawnsAt(2, { "0.0": 11 }),
      traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 12)],
      skillSquares: [14],
      skillPool: ["action-angel-die"],
    });
    const resolved = resolveMove(state, deps());

    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(14);
    expect(resolved.skillSquares).toEqual([14]);
    expect(resolved.skillHands[0]).toEqual([]);
  });

  /**
   * Oil Spill's rule, seen through the whole resolution rather than through the effect alone. The pawn
   * slides onto a skill square and gets nothing, because it slid rather than walked.
   *
   * The slide is 3 plus a D3 minus 1, so a 3 on the D3 slides five squares: from r = 13 to r = 18, which
   * is absolute square 17.
   */
  it("hands out no card for a square a pawn slid onto (Oil Spill)", () => {
    const state = declared({
      from: 11,
      to: 13,
      pawns: pawnsAt(2, { "0.0": 11 }),
      traps: [trap(TRAP_KIND.OIL_SPILL, 12)],
      skillSquares: [17],
      skillPool: ["action-angel-die"],
    });
    const resolved = resolveMove(state, deps([[3, 3]]));

    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(18);
    expect(resolved.statuses[0].kind).toBe(STATUS.SLIPPERY);
    expect(resolved.skillSquares).toEqual([17]);
    expect(resolved.skillHands[0]).toEqual([]);
  });

  /**
   * The other direction, and the reason step 3 is not simply skipped when a trap fired: a trap can push a
   * pawn **onto** a skill square it was never going to reach.
   *
   * The pawn declares a walk to r = 20 and an It's Not That Deep on square 12 pushes it back one, to
   * r = 19, which is absolute square 18.
   *
   * **Two RNG draws now, and it used to be three.** The trap's D6 is gone since the pushback became a
   * fixed 1, so what is left is the skill square's respawn and the card drawn. Worth writing out
   * because a scripted-roll test is only readable if the draws are counted somewhere.
   */
  it("hands out a card for a square a trap pushed the pawn onto", () => {
    const state = declared({
      from: 11,
      to: 20,
      pawns: pawnsAt(2, { "0.0": 11 }),
      traps: [trap(TRAP_KIND.NOT_THAT_DEEP, 12)],
      skillSquares: [18],
      skillPool: ["action-angel-die"],
    });
    const resolved = resolveMove(
      state,
      deps([
        [1, 6],
        [1, 6],
      ])
    );

    expect(findPawn(resolved.pawns, { player: 0, pawn: 0 }).r).toBe(19);
    expect(resolved.skillSquares).not.toContain(18);
    expect(resolved.skillHands[0]).toEqual(["action-angel-die"]);
  });
});

describe("a move a card cancelled", () => {
  it("ends the turn with nothing moved and no trap sprung", () => {
    const state = declared({
      from: 11,
      to: 15,
      pawns: pawnsAt(2, { "0.0": 11 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 12)],
    });
    const cancelled = cancelPendingMove(state);

    expect(cancelled.phase).toBe(TURN_PHASE.TURN_END);
    expect(cancelled.pendingMove).toBeNull();
    expect(findPawn(cancelled.pawns, { player: 0, pawn: 0 }).r).toBe(11);
    expect(cancelled.traps).toHaveLength(1);
  });

  /**
   * `resolveMove` with no pending move is the same situation reached a different way, and it has to be
   * harmless rather than throwing: `close-window` reaches it whenever a reaction cancelled the move.
   */
  it("resolves to the end of the turn when there is no move left to apply", () => {
    const state = nextState(declared({ from: 11, to: 15, pawns: pawnsAt(2) }), {
      pendingMove: null,
    });

    expect(resolveMove(state, deps()).phase).toBe(TURN_PHASE.TURN_END);
  });
});
