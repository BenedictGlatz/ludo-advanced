import { describe, expect, it } from "vitest";

import { STATUS } from "../../../src/core/statuses.js";
import { SCORE } from "../../../src/ai/score.js";
import { chooseDie, expectedScore } from "../../../src/ai/dice-choice.js";
import { PLAIN_PROFILE } from "../../../src/ai/profile.js";
import { pawnsAt } from "../../helpers/fixtures.js";

/**
 * The fields `expectedScore` reads. Not a real match: `startMatch` would shuffle a card pool and
 * draw a hand, and neither has anything to do with the arithmetic under test here.
 *
 * `seats` and `skillSquares` joined the list with the bot tactics plan, because the move scorer
 * now prices danger and what is lying on the landing square. Every board below is built so that both
 * of the new terms come out at zero: no opponent is ever out of its yard, so nothing can be captured
 * and nothing can be set up, and there are no skill squares. This file is about the **average over
 * the faces** and the danger model has its own.
 */
function board(pawns, hand, statuses = []) {
  return { pawns, seats: [0, 2], activePlayer: 0, hand, statuses, traps: [], skillSquares: [] };
}

/**
 * Player 0 with exactly one pawn on the board, plus four idle opponents.
 *
 * A deliberate simplification, and the reason is readability: with all four of player 0's pawns in
 * play the expected value of a die is a sum over four pawns, and the number in the assertion stops
 * saying anything. With one pawn, `103 / 4` is visibly "one step, two steps, home, overshoot".
 * `evaluateTurn` takes a plain list and does not care how long it is.
 */
function onePawnAt(r) {
  return [{ player: 0, pawn: 0, r }, ...pawnsAt(2).filter((pawn) => pawn.player === 2)];
}

describe("expectedScore: the average over every face, not the best case (FR-19, FR-43)", () => {
  it("prices a die by how often it gets a pawn out of the yard", () => {
    // Every pawn is in the start area, so only the die's maximum does anything at all (FR-09). The
    // best case is identical for all three cards, which is exactly why the best case is the wrong
    // question: a D20 gets a pawn out one time in twenty.
    const state = board(pawnsAt(2), [6, 20, 4]);

    expect(expectedScore(state, 6)).toBeCloseTo(SCORE.LEAVE_START / 6, 10);
    expect(expectedScore(state, 20)).toBeCloseTo(SCORE.LEAVE_START / 20, 10);
    expect(expectedScore(state, 4)).toBeCloseTo(SCORE.LEAVE_START / 4, 10);
  });

  it("counts a face that produces no legal move at all as zero", () => {
    // A pawn three steps from the deepest house square: 1 and 2 walk, 3 finishes it, and every
    // face above that overshoots (FR-13). So 103 points spread over however many faces the die has.
    const state = board(onePawnAt(41), [4, 6, 20]);

    expect(expectedScore(state, 4)).toBeCloseTo(103 / 4, 10);
    expect(expectedScore(state, 6)).toBeCloseTo(103 / 6, 10);
    expect(expectedScore(state, 20)).toBeCloseTo(103 / 20, 10);
  });

  it("reads the statuses through boardOf, so a held pawn drops out of the arithmetic", () => {
    // Without this the bot would keep picking the die that suits a pawn it is not allowed to move,
    // which is the visible symptom of an `ai/` layer that ignores the card effects.
    const pawns = [
      { player: 0, pawn: 0, r: 41 },
      { player: 0, pawn: 1, r: 5 },
    ];
    const held = [{ kind: STATUS.HELD, player: 0, pawn: 0, until: 99 }];

    expect(expectedScore(board(pawns, [4]), 4)).toBeCloseTo(107 / 4, 10);
    expect(expectedScore(board(pawns, [4], held), 4)).toBeCloseTo(10 / 4, 10);
  });
});

describe("chooseDie", () => {
  it("picks the small die when only the small die gets a pawn out", () => {
    expect(chooseDie(board(pawnsAt(2), [6, 20, 4]))).toBe(4);
    expect(chooseDie(board(pawnsAt(2), [20, 12, 2]))).toBe(2);
  });

  it("picks the die that hits the house exactly, not the biggest one", () => {
    expect(chooseDie(board(onePawnAt(41), [4, 6, 20]))).toBe(4);
  });

  it("picks the big die when the big die really does walk further", () => {
    // A pawn in the open with room ahead of it: every face of every die is a legal walk, so the
    // advance term decides and the D20 averages 10.5 steps against the D4's 2.5.
    expect(chooseDie(board(onePawnAt(5), [4, 6, 20]))).toBe(20);
  });

  it("breaks a tie towards the smaller die", () => {
    // Nothing can move, so every die is worth zero. The smaller card overshoots the house less
    // often, so it is the better card to be left holding.
    const stuck = board(onePawnAt(44), [20, 6, 12]);

    expect(expectedScore(stuck, 20)).toBe(0);
    expect(chooseDie(stuck)).toBe(6);
  });

  it("gives the same answer every time it is asked", () => {
    // No `rng`, no `Math.random`, no `Date`: a bot that played differently on two runs of the same
    // board could not be tested and could not be reported as a bug.
    const state = board(onePawnAt(30), [8, 10, 12]);

    expect(chooseDie(state)).toBe(chooseDie(state));
    expect(chooseDie(state)).toBe(chooseDie(board(onePawnAt(30), [12, 10, 8])));
  });
});

/**
 * The die choice inherits the danger model for nothing. Bot tactics plan, phase 1.
 *
 * `chooseDie` averages `bestMove` over every face a die can roll, so the moment `scoreMove` learned
 * about danger, every die started being priced by where it is likely to **land** rather than only by
 * how far it walks. Nothing in `dice-choice.js` changed to make that happen, which is the whole
 * argument for the correction living in the scorer.
 */
describe("chooseDie: the die whose landings are safe", () => {
  it("takes the smaller die when the bigger one can only reach an entry square", () => {
    // One pawn on r = 17, which is square 16. A D4 reaches r = 21, and seat 0's r = 21 is square 20,
    // which is seat 2's entry square with four of its pawns waiting behind it. A D2 cannot get there.
    const state = board(onePawnAt(17), [2, 4]);

    expect(chooseDie(state)).toBe(2);

    // Without the danger term the bigger die simply walks further, and the bot walks onto the trap.
    expect(chooseDie(state, PLAIN_PROFILE)).toBe(4);
  });
});
