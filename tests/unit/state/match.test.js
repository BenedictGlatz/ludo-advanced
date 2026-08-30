import { describe, expect, it } from "vitest";

import { HOME_R, START_R } from "../../../src/core/board.js";
import { createSeededRng, fixedDieSource } from "../../../src/core/dice-source.js";
import { findPawn, pawnsOf } from "../../../src/core/pawns.js";
import { MATCH_STATUS, TURN_PHASE } from "../../../src/state/game-state.js";
import { INTENT, dispatch } from "../../../src/state/intents.js";
import { abandonMatch, matchDeps, restartMatch, startMatch } from "../../../src/state/match.js";
import { movablePawns } from "../../../src/state/turn-manager.js";
import { rngForRolls } from "../../helpers/fixtures.js";

/**
 * Dependencies for a match that is about the turn machinery and not about the Dice Card Pool.
 *
 * The pool is the default since issue #30, and it spends the injected RNG on picking cards as well
 * as on rolling them. That is right for a real match and useless for a test that scripts an exact
 * sequence of rolls, so these tests hand in the single-card stand-in and keep every RNG value for
 * the die. What the pool itself does is `tests/unit/core/dice-pool.test.js`.
 */
function scripted(rolls) {
  return matchDeps(rngForRolls(rolls, 6), fixedDieSource(6));
}

describe("startMatch (FR-01)", () => {
  it("starts 2, 3 and 4 player matches with the first hand already drawn", () => {
    for (const playerCount of [2, 3, 4]) {
      const state = startMatch(playerCount, scripted([6]));

      expect(state.playerCount).toBe(playerCount);
      expect(state.phase).toBe(TURN_PHASE.CHOOSE);
      expect(state.hand).toEqual([6]);
      expect(state.pawns.every((pawn) => pawn.r === START_R)).toBe(true);
    }
  });

  it("checks the injected dependencies before the first turn, not three phases into it", () => {
    const rng = rngForRolls([6], 6);

    expect(() => startMatch(2, { diceSource: fixedDieSource(6) })).toThrow(TypeError);
    expect(() => startMatch(2, { rng })).toThrow(TypeError);
    expect(() => startMatch(2, { rng, diceSource: { draw: () => [6] } })).toThrow(TypeError);
  });
});

describe("restartMatch (FR-06)", () => {
  it("gives a fresh match with every field reset, and never reloads anything", () => {
    const deps = scripted([6, 6]);
    const started = startMatch(2, deps);
    const played = dispatch(started, { type: INTENT.CHOOSE_DIE, faces: 6 }, deps).state;
    const moved = dispatch(played, { type: INTENT.COMMIT_MOVE, pawn: 0 }, deps).state;

    expect(findPawn(moved.pawns, { player: 0, pawn: 0 }).r).toBe(1);

    const restarted = restartMatch(moved, deps);

    expect(restarted.pawns.every((pawn) => pawn.r === START_R)).toBe(true);
    expect(restarted.activePlayer).toBe(0);
    expect(restarted.turnNumber).toBe(1);
    expect(restarted.status).toBe(MATCH_STATUS.RUNNING);
    expect(restarted.winner).toBeNull();
  });
});

describe("abandonMatch (FR-07)", () => {
  it("stops the match and leaves the pawns where they stood", () => {
    const deps = scripted([6]);
    const started = startMatch(2, deps);
    const moved = dispatch(
      dispatch(started, { type: INTENT.CHOOSE_DIE, faces: 6 }, deps).state,
      { type: INTENT.COMMIT_MOVE, pawn: 0 },
      deps
    ).state;

    const abandoned = abandonMatch(moved);

    expect(abandoned.status).toBe(MATCH_STATUS.ABANDONED);
    expect(abandoned.phase).toBe(TURN_PHASE.MATCH_OVER);
    expect(abandoned.winner).toBeNull();
    expect(findPawn(abandoned.pawns, { player: 0, pawn: 0 }).r).toBe(1);
  });
});

describe("matchDeps", () => {
  it("defaults to the real twenty-card pool, and has no default RNG", () => {
    const deps = matchDeps(createSeededRng(1));
    const hand = deps.diceSource.draw(deps.rng);

    expect(deps.diceSource.handSize).toBe(3);
    expect(hand).toHaveLength(3);

    // No default RNG on purpose: the default would have to be Math.random, and NFR-09 exists to
    // keep that out of the rules.
    expect(matchDeps(undefined).rng).toBeUndefined();
  });

  it("takes the stand-in die when a caller wants a predictable one", () => {
    expect(scripted([6]).diceSource.draw()).toEqual([6]);
  });
});

/**
 * The pawn furthest along that can move this turn. A deliberately simple strategy, chosen because it
 * makes the scripted match below finish one pawn at a time and therefore hand-checkable.
 */
function furthestMovablePawn(state) {
  let best = null;

  for (const pawn of movablePawns(state)) {
    const { r } = findPawn(state.pawns, { player: state.activePlayer, pawn });
    if (best === null || r > best.r) best = { pawn, r };
  }

  return best.pawn;
}

describe("a complete match, played end to end on a scripted RNG (NFR-09)", () => {
  it("reaches an exact final state", () => {
    // Player 0 walks one pawn into the house at a time, furthest pawn first. Because the house
    // holds one pawn per square, the four squares fill from the back: pawn 0 takes r = 44, pawn 1
    // r = 43, pawn 2 r = 42 and pawn 3 r = 41. So the four walks are different lengths, and only
    // two of them need a final exact roll (FR-13); the other two land on their square on a 6.
    // Player 1 rolls a 1 every turn and can never leave the start area (FR-09).
    const walks = [
      { sixes: 7, last: 1 }, // pawn 0: leave, then 1 -> 43 in seven 6s, then a 1 onto r = 44
      { sixes: 7, last: null }, // pawn 1: leave, then seven 6s land it exactly on r = 43
      { sixes: 6, last: 5 }, // pawn 2: leave, then six 6s to r = 37, then a 5 onto r = 42
      { sixes: 6, last: 4 }, // pawn 3: leave, then six 6s to r = 37, then a 4 onto r = 41
    ];

    const playerZeroRolls = [];
    for (const walk of walks) {
      playerZeroRolls.push(6); // the maximum, to leave the start area
      for (let step = 0; step < walk.sixes; step += 1) playerZeroRolls.push(6);
      if (walk.last !== null) playerZeroRolls.push(walk.last);
    }
    expect(playerZeroRolls).toHaveLength(33);

    const rolls = [];
    for (const roll of playerZeroRolls) rolls.push(roll, 1);

    const deps = scripted(rolls);
    let state = startMatch(2, deps);
    let turns = 0;

    while (state.status === MATCH_STATUS.RUNNING) {
      turns += 1;
      expect(turns, "the scripted match did not finish").toBeLessThan(200);

      state = dispatch(state, { type: INTENT.CHOOSE_DIE, faces: state.hand[0] }, deps).state;

      if (state.phase === TURN_PHASE.ACT) {
        const pawn = furthestMovablePawn(state);
        state = dispatch(state, { type: INTENT.COMMIT_MOVE, pawn }, deps).state;
      }

      if (state.status !== MATCH_STATUS.RUNNING) break;
      state = dispatch(state, { type: INTENT.END_TURN }, deps).state;
    }

    expect(state.status).toBe(MATCH_STATUS.WON);
    expect(state.phase).toBe(TURN_PHASE.MATCH_OVER);
    expect(state.winner).toBe(0);

    // 33 rolls take player 0's four pawns into the house, and player 1 takes a turn between every
    // pair of them, so the match ends on turn 2 x 33 - 1.
    expect(turns).toBe(65);
    expect(state.turnNumber).toBe(65);

    expect(pawnsOf(state.pawns, 0).map((pawn) => pawn.r)).toEqual([HOME_R, 43, 42, 41]);

    // The opponent is on seat 2, not seat 1. Asserting the count as well as the positions matters
    // here: `pawnsOf` for an empty seat returns [], and `[].every(...)` is true, so the seat number
    // could be wrong and this check would still pass.
    const opponent = pawnsOf(state.pawns, 2);
    expect(opponent).toHaveLength(4);
    expect(opponent.every((pawn) => pawn.r === START_R)).toBe(true);
    expect(pawnsOf(state.pawns, 1)).toEqual([]);
  });

  it("refuses every intent once it is won", () => {
    const deps = scripted([6]);
    const won = abandonMatch(startMatch(2, deps));

    expect(dispatch(won, { type: INTENT.END_TURN }, deps).accepted).toBe(false);
  });
});
