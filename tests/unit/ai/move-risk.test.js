/**
 * Danger, opportunity and what is lying on the landing square. Bot tactics plan, phase 1.
 *
 * `move-scoring.test.js` pins the five categories, which is the ranking. This file pins the three
 * corrections added on top of them, and every case is built the same way:
 *
 * **Two moves of exactly the same category and exactly the same length**, so the category score is a
 * tie and the correction is the only thing that can decide. Each case is then run against more than
 * one profile and the answers have to differ. That is worth more than an assertion about a number: it
 * shows the term changing a decision, and it fails if a later change quietly switches the term off.
 *
 * Without the corrections the tie goes to the pawn that has got **further** (`bestMove`'s second
 * tie-break), so every board below is arranged so that the plain bot picks the wrong pawn.
 *
 * ## Two of the three terms are switched off in the shipped bot, and the cases say so
 *
 * `npm run bots:arena` measured the opportunity term and the landing bonus as **losses**, so
 * `DEFAULT_PROFILE` carries them at zero and `FULL_PROFILE` is what the plan designed. Their cases
 * below assert both halves: the term does what it was built to do under `FULL_PROFILE`, and the
 * shipped bot behaves like the plain one. Deleting the code would have thrown away a measured negative
 * finding and the knob a later run needs to re-test it, so it stays, tested, and off.
 *
 * Seat 0's entry square is 0, seat 1's is 10, seat 2's is 20 and seat 3's is 30. A pawn of seat `s`
 * on `r` stands on absolute square `(entry(s) + r - 1) mod 40`.
 */

import { describe, expect, it } from "vitest";

import { legalMoves } from "../../../src/core/movement.js";
import { TRAP_KIND } from "../../../src/core/traps.js";
import { boardOf } from "../../../src/state/game-state.js";
import { bestMove, scoringContext } from "../../../src/ai/move-scoring.js";
import { DEFAULT_PROFILE, FULL_PROFILE, PLAIN_PROFILE } from "../../../src/ai/profile.js";
import { pawnsAt, stateFor } from "../../helpers/fixtures.js";

/** Seat 0's legal moves for one roll, plus the state they were computed against. */
function turn(placements, roll, fields = {}) {
  const state = stateFor({ pawns: pawnsAt(4, placements), ...fields });

  return { state, moves: legalMoves(state.pawns, 0, roll, 20, boardOf(state)) };
}

/** Which pawn each of the three bots would move: no corrections, the shipped ones, all three. */
function choices(placements, roll, fields = {}) {
  const { state, moves } = turn(placements, roll, fields);
  const pick = (profile) =>
    bestMove(moves, state.pawns, scoringContext(state, 0, profile)).move.pawn;

  return { plain: pick(PLAIN_PROFILE), tuned: pick(DEFAULT_PROFILE), full: pick(FULL_PROFILE) };
}

describe("danger: the bot stops walking into captures", () => {
  /**
   * Two six-step walks. Pawn 0 goes from square 9 to square 15, which nobody is behind; pawn 1 goes
   * from square 19 to square 25, one and two squares in front of two pawns of seat 2.
   *
   * Both are worth six steps, so the plain bot takes the tie-break and walks the leading pawn into
   * the pair. Landing one square in front of somebody is the most dangerous square on the board: the
   * hit table puts it at better than one chance in four per attacker.
   */
  it("prefers the safe walk to the one that lands in front of two enemies", () => {
    const picked = choices({ "0.0": 10, "0.1": 20, "2.0": 5, "2.1": 4 }, 6);

    expect(picked.plain).toBe(1);
    expect(picked.tuned).toBe(0);
  });

  /**
   * The categories still dominate the correction, which is the property that keeps the heuristic a
   * heuristic. Pawn 0 finishes on a 1 and pawn 1 takes an ordinary step onto an empty square, and no
   * amount of danger anywhere makes the walk the better move.
   */
  it("still finishes a pawn rather than making the safe little walk", () => {
    const picked = choices({ "0.0": 43, "0.1": 20, "2.0": 5, "2.1": 4 }, 1);

    expect(picked.plain).toBe(0);
    expect(picked.tuned).toBe(0);
  });

  /**
   * Leaving the yard is worth 25 and a twenty-step walk is worth 20, so the plain bot empties its
   * yard every time it rolls a maximum. It should not do that onto an entry square with four pawns
   * queued up behind it: the pawn arrives on `r = 1`, worth 26, with a two-in-three chance of never
   * seeing `r = 2`.
   *
   * Seat 3's `r = 7` to `r = 10` are squares 36 to 39, which are four, three, two and one square
   * behind seat 0's entry square.
   */
  it("does not walk out of the yard into a queue of four attackers", () => {
    const board = { "0.0": 15, "3.0": 7, "3.1": 8, "3.2": 9, "3.3": 10 };
    const picked = choices(board, 20);

    // The plain bot leaves the yard, which on this board is pawn 1: pawn 0 is the one on the track.
    expect(picked.plain).not.toBe(0);
    expect(picked.tuned).toBe(0);
  });
});

describe("opportunity: the bot starts setting captures up", () => {
  /**
   * Two six-step walks. Pawn 0 lands on square 11, four squares behind seat 2's pawn; pawn 1 lands on
   * square 31, sixteen squares in front of it, which is out of reach in either direction.
   *
   * Four squares is what a D4 or a D6 covers, so it is one of the likeliest numbers in the hit table.
   * The victim is deliberately a long way round its own lap (`r = 36`, worth 61), because the term is
   * the chance times what the capture would be worth, and a rich victim is what makes the setup worth
   * more than the tie-break it has to beat.
   *
   * **Every square on a forty-square ring is within twenty of every other**, so the moving pawn also
   * gets a small risk relief for walking away from the same enemy. The case is arranged so that the
   * opportunity is the larger of the two, which is the honest way to test a correction made of terms
   * that cannot be switched off one at a time.
   */
  it("parks within a roll of a valuable enemy when the two walks are otherwise equal", () => {
    const picked = choices({ "0.0": 6, "0.1": 26, "2.0": 36 }, 6);

    expect(picked.plain).toBe(1);
    expect(picked.full).toBe(0);

    // And the shipped bot does not, because the arena measured the term as a loss: a bot that goes
    // out of its way to set a capture up takes more captures and wins fewer matches.
    expect(picked.tuned).toBe(picked.plain);
  });
});

describe("the landing square: a card to pick up, a trap to walk into", () => {
  /** Square 11 hands out a skill card, which is worth `cardWorth` and breaks the tie. */
  it("walks onto a skill square rather than onto a plain one", () => {
    const picked = choices({ "0.0": 6, "0.1": 26 }, 6, { skillSquares: [11] });

    expect(picked.plain).toBe(1);
    expect(picked.full).toBe(0);
    expect(picked.tuned).toBe(picked.plain);
  });

  /** Somebody else's Banana Peel on square 31 costs a whole turn, which is worth more than the walk. */
  it("walks round somebody else's Banana Peel", () => {
    const peel = [{ kind: TRAP_KIND.BANANA_PEEL, square: 31, owner: 1, until: null }];
    const picked = choices({ "0.0": 6, "0.1": 26 }, 6, { traps: peel });

    expect(picked.plain).toBe(1);
    expect(picked.full).toBe(0);
    expect(picked.tuned).toBe(picked.plain);
  });

  /**
   * A trap never fires under a pawn of whoever laid it, and `firstTrapOnPath` already knows that. The
   * value asks rather than repeating the rule, and this is the case that proves it asks: the same
   * board with the peel owned by seat 0 goes back to the plain tie-break even with every term on.
   */
  it("walks straight over its own Banana Peel", () => {
    const mine = [{ kind: TRAP_KIND.BANANA_PEEL, square: 31, owner: 0, until: null }];
    const picked = choices({ "0.0": 6, "0.1": 26 }, 6, { traps: mine });

    expect(picked.plain).toBe(1);
    expect(picked.full).toBe(1);
  });
});

describe("the shipped profile is the one the arena chose", () => {
  /**
   * A test that reads like a comment, and it is here on purpose: two of the three weights are zero
   * because 1200 measured matches said so, and a later reader who switches one back on because "it
   * obviously ought to help" is exactly what the arena exists to catch. The run and its command are in
   * `notes/09-source-code-overview.md`.
   */
  it("keeps danger on and the other two terms off", () => {
    expect(DEFAULT_PROFILE.riskWeight).toBe(1);
    expect(DEFAULT_PROFILE.opportunityWeight).toBe(0);
    expect(DEFAULT_PROFILE.landingWeight).toBe(0);
  });
});
