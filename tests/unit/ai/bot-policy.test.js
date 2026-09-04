import { describe, expect, it } from "vitest";

import { MOVE_KIND } from "../../../src/core/move-rules.js";
import { MATCH_STATUS, TURN_PHASE } from "../../../src/state/game-state.js";
import { INTENT } from "../../../src/state/intents.js";
import { INTENT_CARD } from "../../../src/state/intents-cards.js";
import { decide } from "../../../src/ai/bot-policy.js";
import { pawnsAt } from "../../helpers/fixtures.js";

/**
 * A four-player match with seats 2 and 3 played by bots, in whichever phase the test needs.
 *
 * Hand-built rather than driven out of `startMatch`, because every test below is about **one**
 * question the policy is asked, and reaching that question through a real match would take a dozen
 * dispatches whose failures would look like policy failures.
 */
function match(fields) {
  return {
    status: MATCH_STATUS.RUNNING,
    seats: [0, 1, 2, 3],
    bots: [2, 3],
    activePlayer: 2,
    phase: TURN_PHASE.CHOOSE,
    pawns: pawnsAt(4),
    hand: [6, 20, 4],
    legalMoves: [],
    statuses: [],
    traps: [],
    reactionWindow: null,
    ...fields,
  };
}

describe("decide: who is being asked (FR-43)", () => {
  it("says nothing during a person's turn", () => {
    expect(decide(match({ activePlayer: 0 }))).toBeNull();
    expect(decide(match({ activePlayer: 1, phase: TURN_PHASE.ACTION }))).toBeNull();
  });

  it("says nothing once the match is over, whatever the phase says", () => {
    expect(decide(match({ status: MATCH_STATUS.WON }))).toBeNull();
    expect(decide(match({ status: MATCH_STATUS.ABANDONED }))).toBeNull();
  });

  it("says nothing in the phases the game loop owns", () => {
    // Not an oversight: `roll-die`, `close-window` and `end-turn` carry the loop's hold times, and a
    // second issuer of them would race the roll animation. The module header carries the reason.
    for (const phase of [
      TURN_PHASE.DRAW,
      TURN_PHASE.ROLL,
      TURN_PHASE.REACTION,
      TURN_PHASE.TURN_END,
    ]) {
      expect(decide(match({ phase })), `phase ${phase} belongs to the loop`).toBeNull();
    }
  });

  it("says nothing at all in an all-human match", () => {
    // The property that lets the driver be wired into the loop unconditionally.
    for (const phase of Object.values(TURN_PHASE)) {
      expect(decide(match({ bots: [], activePlayer: 0, phase }))).toBeNull();
    }
  });
});

describe("decide: the three phases a person would be asked in", () => {
  it("picks a dice card that is actually in the hand", () => {
    const state = match({ phase: TURN_PHASE.CHOOSE, hand: [6, 20, 4] });
    const intent = decide(state);

    expect(intent.type).toBe(INTENT.CHOOSE_DIE);
    expect(state.hand).toContain(intent.faces);
  });

  it("always passes on the action phase", () => {
    // The scope decision of 2026-09-04: no card tactics yet, and "plays no card" is defined
    // behaviour rather than a gap, so it is asserted.
    expect(decide(match({ phase: TURN_PHASE.ACTION }))).toEqual({ type: INTENT.SKIP_ACTION });
  });

  it("commits the best move it was offered", () => {
    const walk = { player: 2, pawn: 0, kind: MOVE_KIND.ADVANCE, from: 5, to: 9, captures: null };
    const exit = {
      player: 2,
      pawn: 3,
      kind: MOVE_KIND.LEAVE_START,
      from: 0,
      to: 1,
      captures: null,
    };
    const state = match({ phase: TURN_PHASE.ACT, legalMoves: [walk, exit] });

    // Leaving the yard beats a four-step walk, so pawn 3 and not pawn 0.
    expect(decide(state)).toEqual({ type: INTENT.COMMIT_MOVE, pawn: 3 });
  });

  it("names a pawn the game would accept", () => {
    const moves = [
      { player: 2, pawn: 1, kind: MOVE_KIND.ADVANCE, from: 12, to: 18, captures: null },
      { player: 2, pawn: 2, kind: MOVE_KIND.ADVANCE, from: 30, to: 36, captures: null },
    ];
    const intent = decide(match({ phase: TURN_PHASE.ACT, legalMoves: moves }));

    expect(moves.map((move) => move.pawn)).toContain(intent.pawn);
  });

  it("says nothing when the act phase has no move in it", () => {
    expect(decide(match({ phase: TURN_PHASE.ACT, legalMoves: [] }))).toBeNull();
  });
});

describe("decide: reaction windows (FR-25)", () => {
  const window = (eligible) => ({ eligible, trigger: "on-capture", played: [], declined: [] });

  it("declines for the first bot that is still eligible, in seat order", () => {
    const state = match({ activePlayer: 0, reactionWindow: window([1, 2, 3]) });

    expect(decide(state)).toEqual({ type: INTENT_CARD.DECLINE_REACTION, seat: 2 });
  });

  it("answers during a person's turn, which is the one time a non-active seat is asked", () => {
    // This is why the window branch runs before the active-seat check.
    const state = match({ activePlayer: 0, phase: TURN_PHASE.ACT, reactionWindow: window([2]) });

    expect(decide(state)).toEqual({ type: INTENT_CARD.DECLINE_REACTION, seat: 2 });
  });

  it("leaves a window of people alone", () => {
    const state = match({ activePlayer: 2, reactionWindow: window([0, 1]) });

    expect(decide(state)).toBeNull();
  });
});
