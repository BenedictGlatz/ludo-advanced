/**
 * What a click on a dice card or a pawn is allowed to do. Issue #43.
 *
 * ## Why a `ui/` module is unit tested at all
 *
 * `ui/` is covered by Playwright, on the argument in Ch. 08 that a coverage figure for jQuery
 * rendering measures nothing. `turn-controls.js` is the exception that argument allows for: it imports
 * no jQuery and touches no DOM. It takes five callbacks and decides what an activation means, which is
 * a branch, and branches are what unit tests are for.
 *
 * ## Why now
 *
 * Because issue #43 put a **third** condition in a guard that had two, and the new one protects against
 * something with a 900 ms window: during a bot's thinking pause the phase is already `act` and its
 * pawns already carry `data-movable="true"`, so a click would commit the bot's move for it. Catching
 * that in the browser means racing a pause that `?fast=1` removes, which is a flaky test by
 * construction. Here it is three assertions.
 */

import { describe, expect, it, vi } from "vitest";

import { MATCH_STATUS, TURN_PHASE } from "../../../src/state/game-state.js";
import { INTENT } from "../../../src/state/intents.js";
import { createTurnControls } from "../../../src/ui/turn-controls.js";

/**
 * The controls plus the record of what they asked for.
 *
 * `apply` reports success, which is what the real loop's does, so a control that stops on a refusal
 * can be told from one that never dispatched at all.
 */
function controls(state, { accepted = true, picking = false } = {}) {
  const applied = [];
  const advance = vi.fn();

  const board = createTurnControls({
    getState: () => state,
    apply: (intent) => {
      applied.push(intent);
      return accepted;
    },
    render: vi.fn(),
    advance,
    isPicking: () => picking,
  });

  return { board, applied, advance };
}

/** A four-player match with seats 2 and 3 played by bots, in whichever phase the test needs. */
function match(fields) {
  return {
    status: MATCH_STATUS.RUNNING,
    seats: [0, 1, 2, 3],
    bots: [2, 3],
    activePlayer: 0,
    phase: TURN_PHASE.CHOOSE,
    selectedPawn: null,
    ...fields,
  };
}

describe("clicking a dice card", () => {
  it("chooses it on the active player's own turn", () => {
    const { board, applied } = controls(match({ phase: TURN_PHASE.CHOOSE }));

    board.onDiceCardActivated(6);

    expect(applied).toEqual([{ type: INTENT.CHOOSE_DIE, faces: 6 }]);
  });

  it("does nothing in the wrong phase or after the match is over", () => {
    for (const state of [
      match({ phase: TURN_PHASE.ACT }),
      match({ status: MATCH_STATUS.WON }),
      match({ status: MATCH_STATUS.ABANDONED }),
    ]) {
      const { board, applied } = controls(state);

      board.onDiceCardActivated(6);
      expect(applied).toEqual([]);
    }
  });

  it("does nothing while a bot is choosing (FR-43)", () => {
    const { board, applied } = controls(match({ activePlayer: 2 }));

    board.onDiceCardActivated(6);

    expect(applied).toEqual([]);
  });
});

describe("clicking a pawn", () => {
  const acting = (fields) => match({ phase: TURN_PHASE.ACT, ...fields });

  it("selects on the first click and commits on the second", () => {
    const { board, applied } = controls(acting({ selectedPawn: null }));
    board.onPawnActivated(1);
    expect(applied).toEqual([{ type: INTENT.SELECT_PAWN, pawn: 1 }]);

    const second = controls(acting({ selectedPawn: 1 }));
    second.board.onPawnActivated(1);
    expect(second.applied).toEqual([{ type: INTENT.COMMIT_MOVE, pawn: 1 }]);
    expect(second.advance).toHaveBeenCalled();
  });

  it("does nothing while a card is being aimed", () => {
    const { board, applied } = controls(acting({ selectedPawn: 1 }), { picking: true });

    board.onPawnActivated(1);

    expect(applied).toEqual([]);
  });

  /**
   * The regression this file was written for.
   *
   * The bot's pawn is already movable and its move is already chosen; it is simply waiting out its
   * thinking pause. A click here would play the bot's turn for it, a second early, and possibly with a
   * different pawn than the one the bot had picked.
   */
  it("does nothing to a bot's pawn during the bot's turn (FR-43)", () => {
    const { board, applied } = controls(acting({ activePlayer: 2, selectedPawn: null }));

    board.onPawnActivated(0);
    board.onPawnActivated(0);

    expect(applied).toEqual([]);
  });

  it("stops rather than retrying when the move is refused", () => {
    const { board, applied, advance } = controls(acting({ selectedPawn: 1 }), { accepted: false });

    board.onPawnActivated(1);

    expect(applied).toHaveLength(1);
    expect(advance).not.toHaveBeenCalled();
  });
});
