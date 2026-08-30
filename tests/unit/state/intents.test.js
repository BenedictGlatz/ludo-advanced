import { describe, expect, it } from "vitest";

import { fixedDieSource } from "../../../src/core/dice-source.js";
import { REFUSAL } from "../../../src/core/movement.js";
import { findPawn } from "../../../src/core/pawns.js";
import { TURN_PHASE, createGameState, nextState } from "../../../src/state/game-state.js";
import { INTENT, REJECTED, dispatch } from "../../../src/state/intents.js";
import { abandonMatch, startMatch } from "../../../src/state/match.js";
import { pawnsAt, rngForRolls } from "../../helpers/fixtures.js";

function deps(rolls) {
  return { rng: rngForRolls(rolls, 6), diceSource: fixedDieSource(6) };
}

/** A started match whose board has been arranged, waiting for the die to be chosen. */
function matchWith(placements, rolls) {
  const d = deps(rolls);
  const started = startMatch(2, d);
  return { state: nextState(started, { pawns: pawnsAt(2, placements) }), deps: d };
}

describe("the four intents `ui/` may dispatch", () => {
  it("choose-die picks the card and rolls it in one step (FR-19, FR-20)", () => {
    const { state, deps: d } = matchWith({}, [6]);
    const result = dispatch(state, { type: INTENT.CHOOSE_DIE, faces: 6 }, d);

    expect(result.accepted).toBe(true);
    expect(result.state.chosenDie).toBe(6);
    expect(result.state.roll).toBe(6);
    expect(result.state.phase).toBe(TURN_PHASE.ACT);
  });

  it("select-pawn highlights without moving anything (FR-32)", () => {
    const { state, deps: d } = matchWith({ "0.0": 10 }, [4]);
    const rolled = dispatch(state, { type: INTENT.CHOOSE_DIE, faces: 6 }, d).state;
    const result = dispatch(rolled, { type: INTENT.SELECT_PAWN, pawn: 0 }, d);

    expect(result.accepted).toBe(true);
    expect(result.state.selectedPawn).toBe(0);
    expect(result.state.pawns).toBe(rolled.pawns);
  });

  it("commit-move commits and resolves, because the reaction window is empty until #38", () => {
    const { state, deps: d } = matchWith({ "0.0": 10 }, [4]);
    const rolled = dispatch(state, { type: INTENT.CHOOSE_DIE, faces: 6 }, d).state;
    const result = dispatch(rolled, { type: INTENT.COMMIT_MOVE, pawn: 0 }, d);

    expect(result.accepted).toBe(true);
    expect(result.state.phase).toBe(TURN_PHASE.TURN_END);
    expect(findPawn(result.state.pawns, { player: 0, pawn: 0 }).r).toBe(14);
  });

  it("end-turn hands over and draws the next player's hand in one step", () => {
    const { state, deps: d } = matchWith({}, [3]);
    const rolled = dispatch(state, { type: INTENT.CHOOSE_DIE, faces: 6 }, d).state;
    const result = dispatch(rolled, { type: INTENT.END_TURN }, d);

    expect(result.accepted).toBe(true);
    // Seat 2, not seat 1: a two-player match seats its players opposite each other.
    expect(result.state.activePlayer).toBe(2);
    expect(result.state.turnNumber).toBe(2);
    // Never a phase the player can see and cannot act on.
    expect(result.state.phase).toBe(TURN_PHASE.CHOOSE);
    expect(result.state.hand).toEqual([6]);
  });
});

describe("a rejected intent leaves the state untouched (NFR-01)", () => {
  it("returns the very same object, not a copy", () => {
    const { state, deps: d } = matchWith({}, [6]);
    const result = dispatch(state, { type: INTENT.COMMIT_MOVE, pawn: 0 }, d);

    expect(result.accepted).toBe(false);
    expect(result.state).toBe(state);
  });

  it("refuses an intent dispatched in the wrong phase", () => {
    const { state, deps: d } = matchWith({}, [6]);

    for (const intent of [
      { type: INTENT.SELECT_PAWN, pawn: 0 },
      { type: INTENT.COMMIT_MOVE, pawn: 0 },
      { type: INTENT.END_TURN },
    ]) {
      expect(dispatch(state, intent, d).reason).toBe(REJECTED.WRONG_PHASE);
    }
  });

  it("refuses a card that is not in the drawn hand", () => {
    const { state, deps: d } = matchWith({}, [6]);
    const result = dispatch(state, { type: INTENT.CHOOSE_DIE, faces: 20 }, d);

    expect(result.reason).toBe(REJECTED.CARD_NOT_IN_HAND);
  });

  it("refuses a pawn that has no legal move, which is the illegal-move case", () => {
    const { state, deps: d } = matchWith({ "0.0": 10 }, [4]);
    const rolled = dispatch(state, { type: INTENT.CHOOSE_DIE, faces: 6 }, d).state;
    const result = dispatch(rolled, { type: INTENT.COMMIT_MOVE, pawn: 1 }, d);

    expect(result.accepted).toBe(false);
    expect(result.reason).toBe(REJECTED.NO_MOVE_FOR_PAWN);
    expect(result.state).toBe(rolled);
  });

  it("refuses select-pawn for a pawn that cannot move, so no highlight can lie", () => {
    const { state, deps: d } = matchWith({ "0.0": 10 }, [4]);
    const rolled = dispatch(state, { type: INTENT.CHOOSE_DIE, faces: 6 }, d).state;
    const result = dispatch(rolled, { type: INTENT.SELECT_PAWN, pawn: 1 }, d);

    expect(result.reason).toBe(REJECTED.NO_MOVE_FOR_PAWN);
    expect(result.state).toBe(rolled);
  });

  it("refuses an intent type it does not know", () => {
    const { state, deps: d } = matchWith({}, [6]);

    expect(dispatch(state, { type: "teleport-pawn" }, d).reason).toBe(REJECTED.UNKNOWN_INTENT);
  });

  it("refuses everything once the match is over (FR-05, FR-07)", () => {
    const { state, deps: d } = matchWith({}, [6]);
    const abandoned = abandonMatch(state);

    expect(dispatch(abandoned, { type: INTENT.CHOOSE_DIE, faces: 6 }, d).reason).toBe(
      REJECTED.MATCH_OVER
    );
  });
});

describe("a turn nobody can act on", () => {
  it("carries its reason all the way out to the view (FR-14, NFR-08)", () => {
    const { state, deps: d } = matchWith({}, [3]);
    const result = dispatch(state, { type: INTENT.CHOOSE_DIE, faces: 6 }, d);

    expect(result.accepted).toBe(true);
    expect(result.state.phase).toBe(TURN_PHASE.TURN_END);
    expect(result.state.legalMoves).toEqual([]);
    expect(result.state.refusalReason).toBe(REFUSAL.NEEDS_MAXIMUM);
  });
});

describe("the intent vocabulary", () => {
  it("has exactly four entries, and none of them is 'move this pawn there'", () => {
    expect(Object.values(INTENT)).toEqual(["choose-die", "select-pawn", "commit-move", "end-turn"]);
  });

  it("names every rejection reason as an i18next key, never as a sentence (NFR-03)", () => {
    for (const reason of Object.values(REJECTED)) {
      expect(reason).toMatch(/^intent\.rejected\.[a-z-]+$/);
    }
  });

  it("cannot be dispatched into a state that was never started", () => {
    // createGameState leaves the phase at "draw"; only match.js draws the first hand.
    const raw = createGameState(2);
    const result = dispatch(raw, { type: INTENT.CHOOSE_DIE, faces: 6 }, deps([6]));

    expect(result.reason).toBe(REJECTED.WRONG_PHASE);
  });
});
