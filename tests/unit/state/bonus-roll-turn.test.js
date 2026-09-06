/**
 * The bonus roll inside the turn sequence. Issue #89.
 *
 * `core/bonus-roll.js` decides *whether* a roll earns another; this file covers what the turn manager
 * does about it: back to `roll` with the same die, the last roll's leftovers cleared, and the turn number
 * unchanged. Its own file rather than more cases in `turn-manager.test.js`, which is at its 300-line
 * limit; the two helpers below are that file's, copied.
 */

import { describe, expect, it } from "vitest";

import { HOME_R } from "../../../src/core/board.js";
import { fixedDieSource } from "../../../src/core/dice-source.js";
import { findPawn } from "../../../src/core/pawns.js";
import { createModifiers } from "../../../src/core/roll.js";
import {
  MATCH_STATUS,
  TURN_PHASE,
  createGameState,
  nextState,
} from "../../../src/state/game-state.js";
import {
  chooseDie,
  commitMove,
  drawHand,
  passAction,
  rollChosenDie,
} from "../../../src/state/turn-manager.js";
import { resolveMove } from "../../../src/state/turn-resolution.js";
import { pawnsAt, rngForRolls } from "../../helpers/fixtures.js";

/** A match of `playerCount` players with a scripted roll sequence and the D6 stand-in pool. */
function deps(rolls) {
  return { rng: rngForRolls(rolls, 6), diceSource: fixedDieSource(6) };
}

/** A state in the `act` phase, with `pawns` on the board and `roll` already made. */
function afterRoll(pawns, rolls, playerCount = 2) {
  const d = deps(rolls);
  const start = nextState(createGameState(playerCount), { pawns });
  return { state: rollChosenDie(passAction(chooseDie(drawHand(start, d), 6)), d), deps: d };
}

describe("a natural maximum on a D6 or larger rolls again (issue #89)", () => {
  /**
   * The classic Ludo bonus, with the floor the Product Owner set. Seat 0 leaves the start area on a 6,
   * the move resolves, and instead of `turn-end` the turn is back in `roll` with the same die, the
   * roll's leftovers cleared and the turn number unchanged.
   */
  it("goes back to the roll phase after the move instead of ending the turn", () => {
    const { state, deps: d } = afterRoll(pawnsAt(2), [6, 3]);
    expect(state.rollsThisTurn).toBe(1);

    const again = resolveMove(commitMove(state, 0), d);

    expect(again.phase).toBe(TURN_PHASE.ROLL);
    expect(again.bonusRoll).toBe(true);
    expect(again.turnNumber).toBe(1);
    expect(again.chosenDie).toBe(6);
    expect(again.roll).toBeNull();
    expect(again.rollSteps).toEqual([]);
    expect(again.legalMoves).toEqual([]);
    expect(again.selectedPawn).toBeNull();
    expect(findPawn(again.pawns, { player: 0, pawn: 0 }).r).toBe(1);

    const second = rollChosenDie(again, d);
    expect(second.phase).toBe(TURN_PHASE.ACT);
    expect(second.roll).toBe(3);
    expect(second.rollsThisTurn).toBe(2);
    expect(second.bonusRoll).toBe(true);
  });

  it("ends the turn after a roll below the maximum, exactly as before", () => {
    const { state, deps: d } = afterRoll(pawnsAt(2, { "0.0": 5 }), [4]);

    expect(resolveMove(commitMove(state, 0), d).phase).toBe(TURN_PHASE.TURN_END);
  });

  /** The floor: a D4's 4 is its maximum and still earns nothing. */
  it("gives no bonus on a D2 or a D4", () => {
    const d = { rng: rngForRolls([4], 4), diceSource: fixedDieSource(4) };
    const start = nextState(createGameState(2), { pawns: pawnsAt(2) });
    const rolled = rollChosenDie(passAction(chooseDie(drawHand(start, d), 4)), d);
    expect(rolled.roll).toBe(4);

    expect(resolveMove(commitMove(rolled, 0), d).phase).toBe(TURN_PHASE.TURN_END);
  });

  /** Three sixes: the third roll ends the turn however it lands. */
  it("stops after three rolls in one turn", () => {
    // Pawn 0 walks all three: after leaving it stands on the entry square, so no other pawn can leave.
    const { state, deps: d } = afterRoll(pawnsAt(2), [6, 6, 6]);
    const afterFirst = resolveMove(commitMove(state, 0), d);
    const afterSecond = resolveMove(commitMove(rollChosenDie(afterFirst, d), 0), d);
    expect(afterSecond.phase).toBe(TURN_PHASE.ROLL);
    expect(afterSecond.rollsThisTurn).toBe(2);

    const third = rollChosenDie(afterSecond, d);
    expect(third.roll).toBe(6);
    expect(third.rollsThisTurn).toBe(3);

    const ended = resolveMove(commitMove(third, 0), d);
    expect(ended.phase).toBe(TURN_PHASE.TURN_END);
    expect(findPawn(ended.pawns, { player: 0, pawn: 0 }).r).toBe(13);
  });

  /**
   * A maximum that could not be used still earns the bonus: `rollChosenDie` goes back to `roll` rather
   * than to `turn-end`. Seat 0 has one pawn at `r = 40` and three home, so a 6 overshoots; the 2 that
   * follows reaches the one free house square.
   */
  it("rolls again after a maximum with no legal move", () => {
    const pawns = pawnsAt(2, { "0.0": 40, "0.1": HOME_R, "0.2": 43, "0.3": 41 });
    const { state, deps: d } = afterRoll(pawns, [6, 2]);

    expect(state.phase).toBe(TURN_PHASE.ROLL);
    expect(state.bonusRoll).toBe(true);
    expect(state.refusalReason).toBeNull();

    const second = rollChosenDie(state, d);
    expect(second.phase).toBe(TURN_PHASE.ACT);
    expect(second.legalMoves.map((move) => move.to)).toEqual([42]);
  });

  /** A card buffs the roll it was played into, not the roll that roll earned. */
  it("clears the roll modifiers before the bonus roll", () => {
    const d = deps([6, 6, 2]);
    const start = nextState(createGameState(2), { pawns: pawnsAt(2) });
    const buffed = nextState(passAction(chooseDie(drawHand(start, d), 6)), {
      modifiers: { ...createModifiers(), advantage: true },
    });
    const rolled = rollChosenDie(buffed, d);
    expect(rolled.rollSteps[0].step).toBe("advantage");

    const again = resolveMove(commitMove(rolled, 0), d);
    expect(again.phase).toBe(TURN_PHASE.ROLL);
    expect(again.modifiers).toEqual(createModifiers());
  });

  /** Winning on a maximum ends the match, not the roll. */
  it("gives no bonus after the winning move", () => {
    const pawns = pawnsAt(2, { "0.0": 38, "0.1": 43, "0.2": 42, "0.3": 41 });
    const { state, deps: d } = afterRoll(pawns, [6]);
    const resolved = resolveMove(commitMove(state, 0), d);

    expect(resolved.status).toBe(MATCH_STATUS.WON);
    expect(resolved.phase).toBe(TURN_PHASE.MATCH_OVER);
  });
});
