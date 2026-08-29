import { describe, expect, it } from "vitest";

import { HOME_R, START_R } from "../../../src/core/board.js";
import { fixedDieSource } from "../../../src/core/dice-source.js";
import { findPawn, pawnsOf } from "../../../src/core/pawns.js";
import { MATCH_STATUS, TURN_PHASE } from "../../../src/state/game-state.js";
import { INTENT, dispatch } from "../../../src/state/intents.js";
import { abandonMatch, matchDeps, restartMatch, startMatch } from "../../../src/state/match.js";
import { movablePawns } from "../../../src/state/turn-manager.js";
import { rngForRolls } from "../../helpers/fixtures.js";

describe("startMatch (FR-01)", () => {
  it("starts 2, 3 and 4 player matches with the first hand already drawn", () => {
    for (const playerCount of [2, 3, 4]) {
      const state = startMatch(playerCount, matchDeps(rngForRolls([6], 6)));

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
    const deps = matchDeps(rngForRolls([6, 6], 6));
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
    const deps = matchDeps(rngForRolls([6], 6));
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
  it("defaults to the single-die stand-in pool, and has no default RNG", () => {
    const deps = matchDeps(rngForRolls([6], 6));

    expect(deps.diceSource.draw()).toEqual([6]);
    expect(matchDeps(undefined).rng).toBeUndefined();
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
    // Player 0 walks one pawn home at a time: a 6 to leave, nine 6s along the track, then a 3 to
    // land exactly on r = 58 (FR-13). Player 1 rolls a 1 every turn and can never leave (FR-09).
    const playerZeroRolls = [];
    for (let pawn = 0; pawn < 4; pawn += 1) {
      playerZeroRolls.push(6);
      for (let step = 0; step < 9; step += 1) playerZeroRolls.push(6);
      playerZeroRolls.push(3);
    }

    const rolls = [];
    for (const roll of playerZeroRolls) rolls.push(roll, 1);

    const deps = matchDeps(rngForRolls(rolls, 6));
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

    // 44 rolls take player 0 home, one for each of the 11 steps of each of the four pawns, and
    // player 1 takes a turn between every pair of them.
    expect(turns).toBe(87);
    expect(state.turnNumber).toBe(87);

    expect(pawnsOf(state.pawns, 0).map((pawn) => pawn.r)).toEqual([HOME_R, HOME_R, HOME_R, HOME_R]);
    expect(pawnsOf(state.pawns, 1).every((pawn) => pawn.r === START_R)).toBe(true);
  });

  it("refuses every intent once it is won", () => {
    const deps = matchDeps(rngForRolls([6], 6));
    const won = abandonMatch(startMatch(2, deps));

    expect(dispatch(won, { type: INTENT.END_TURN }, deps).accepted).toBe(false);
  });
});
