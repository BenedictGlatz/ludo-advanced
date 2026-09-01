import { describe, expect, it } from "vitest";

import { fixedDieSource } from "../../../src/core/dice-source.js";
import { REFUSAL } from "../../../src/core/movement.js";
import { findPawn } from "../../../src/core/pawns.js";
import { TURN_PHASE, createGameState, nextState } from "../../../src/state/game-state.js";
import { INTENT, REJECTED, dispatch } from "../../../src/state/intents.js";
import { drawHand } from "../../../src/state/turn-manager.js";
import { abandonMatch } from "../../../src/state/match.js";
import { pawnsAt, rngForRolls } from "../../helpers/fixtures.js";

function deps(rolls) {
  return { rng: rngForRolls(rolls, 6), diceSource: fixedDieSource(6) };
}

/**
 * A match whose board has been arranged, waiting for the die to be chosen.
 *
 * **Deliberately not `startMatch`.** Since issue #38 that shuffles the 58-card skill pool, which spends
 * 57 draws from the RNG before the first roll and would exhaust every scripted sequence in this file
 * instantly. A state built from `createGameState` has an **empty** skill pool, and a draw from an empty
 * pool spends no randomness at all, so the roll scripts below stay exact.
 *
 * `match.test.js` is where the seeded pool is covered, and it does not script individual rolls.
 */
function matchWith(placements, rolls) {
  const d = deps(rolls);
  const arranged = nextState(createGameState(2), { pawns: pawnsAt(2, placements) });

  return { state: drawHand(arranged, d), deps: d };
}

/**
 * Choose the die, pass on the action phase and roll: the three intents that used to be one.
 *
 * Written as a helper rather than inlined, because almost every test below needs a state in the `act`
 * phase and none of them is about how it got there. The one test that *is* about that spells the three
 * steps out.
 */
function toAct(state, d) {
  let current = dispatch(state, { type: INTENT.CHOOSE_DIE, faces: 6 }, d).state;
  current = dispatch(current, { type: INTENT.SKIP_ACTION }, d).state;

  return dispatch(current, { type: INTENT.ROLL_DIE }, d).state;
}

describe("the seven intents `ui/` may dispatch", () => {
  /**
   * `choose-die` used to pick the card **and** roll it, because the rulebook had no player input
   * between them. Issue #38 put the action phase in that gap, so it now does one step and stops.
   */
  it("choose-die picks the card and stops in the action phase (FR-19, FR-23)", () => {
    const { state, deps: d } = matchWith({}, [6]);
    const result = dispatch(state, { type: INTENT.CHOOSE_DIE, faces: 6 }, d);

    expect(result.accepted).toBe(true);
    expect(result.state.chosenDie).toBe(6);
    expect(result.state.roll).toBeNull();
    expect(result.state.phase).toBe(TURN_PHASE.ACTION);
  });

  it("skip-action carries the turn to the roll without playing anything", () => {
    const { state, deps: d } = matchWith({}, [6]);
    const chosen = dispatch(state, { type: INTENT.CHOOSE_DIE, faces: 6 }, d).state;
    const result = dispatch(chosen, { type: INTENT.SKIP_ACTION }, d);

    expect(result.accepted).toBe(true);
    expect(result.state.phase).toBe(TURN_PHASE.ROLL);
    expect(result.state.cardsPlayed).toEqual({});
  });

  it("roll-die rolls, computes the legal moves and waits for a pawn (FR-20, FR-32)", () => {
    const { state, deps: d } = matchWith({}, [6]);
    const rolled = toAct(state, d);

    expect(rolled.roll).toBe(6);
    expect(rolled.phase).toBe(TURN_PHASE.ACT);
    expect(rolled.legalMoves).toHaveLength(4);
  });

  it("select-pawn highlights without moving anything (FR-32)", () => {
    const { state, deps: d } = matchWith({ "0.0": 10 }, [4]);
    const rolled = toAct(state, d);
    const result = dispatch(rolled, { type: INTENT.SELECT_PAWN, pawn: 0 }, d);

    expect(result.accepted).toBe(true);
    expect(result.state.selectedPawn).toBe(0);
    expect(result.state.pawns).toBe(rolled.pawns);
  });

  /**
   * The split issue #38 made. `commit-move` used to run steps 7 and 8 as one call, because the
   * reaction window between them was empty. It stops in `reaction` now, and the pawn has not moved.
   */
  it("commit-move declares the move and stops, without moving the pawn (FR-25)", () => {
    const { state, deps: d } = matchWith({ "0.0": 10 }, [4]);
    const rolled = toAct(state, d);
    const result = dispatch(rolled, { type: INTENT.COMMIT_MOVE, pawn: 0 }, d);

    expect(result.accepted).toBe(true);
    expect(result.state.phase).toBe(TURN_PHASE.REACTION);
    expect(result.state.pendingMove.to).toBe(14);
    expect(findPawn(result.state.pawns, { player: 0, pawn: 0 }).r).toBe(10);
  });

  it("close-window applies what the window was holding up", () => {
    const { state, deps: d } = matchWith({ "0.0": 10 }, [4]);
    const committed = dispatch(toAct(state, d), { type: INTENT.COMMIT_MOVE, pawn: 0 }, d).state;
    const result = dispatch(committed, { type: INTENT.CLOSE_WINDOW }, d);

    expect(result.accepted).toBe(true);
    expect(result.state.phase).toBe(TURN_PHASE.TURN_END);
    expect(result.state.pendingMove).toBeNull();
    expect(findPawn(result.state.pawns, { player: 0, pawn: 0 }).r).toBe(14);
  });

  it("end-turn hands over and draws the next player's hand in one step", () => {
    const { state, deps: d } = matchWith({}, [3]);
    const rolled = toAct(state, d);
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
      { type: INTENT.SKIP_ACTION },
      { type: INTENT.ROLL_DIE },
      { type: INTENT.SELECT_PAWN, pawn: 0 },
      { type: INTENT.COMMIT_MOVE, pawn: 0 },
      { type: INTENT.CLOSE_WINDOW },
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
    const rolled = toAct(state, d);
    const result = dispatch(rolled, { type: INTENT.COMMIT_MOVE, pawn: 1 }, d);

    expect(result.accepted).toBe(false);
    expect(result.reason).toBe(REJECTED.NO_MOVE_FOR_PAWN);
    expect(result.state).toBe(rolled);
  });

  it("refuses select-pawn for a pawn that cannot move, so no highlight can lie", () => {
    const { state, deps: d } = matchWith({ "0.0": 10 }, [4]);
    const rolled = toAct(state, d);
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
    const rolled = toAct(state, d);

    expect(rolled.phase).toBe(TURN_PHASE.TURN_END);
    expect(rolled.legalMoves).toEqual([]);
    expect(rolled.refusalReason).toBe(REFUSAL.NEEDS_MAXIMUM);
  });
});

describe("the intent vocabulary", () => {
  it("has exactly seven entries, and none of them is 'move this pawn there'", () => {
    expect(Object.values(INTENT)).toEqual([
      "choose-die",
      "skip-action",
      "roll-die",
      "select-pawn",
      "commit-move",
      "close-window",
      "end-turn",
    ]);
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
