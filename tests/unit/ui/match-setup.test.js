/**
 * Building a match, and the one rule that had never been a test: one pool per match. Issue #42.
 *
 * `match-flow.js` carried this rule in a comment and in two identical pairs of lines that nothing could
 * assert on, because that file imports jQuery. Now the two builders are jQuery-free and the rule is three
 * assertions.
 */

import { describe, expect, it } from "vitest";

import { POOL_SIZE } from "../../../src/core/dice-pool.js";
import { createSeededRng } from "../../../src/core/dice-source.js";
import { MATCH_STATUS, TURN_PHASE } from "../../../src/state/game-state.js";
import { freshMatchParts, restartParts } from "../../../src/ui/match-setup.js";

describe("freshMatchParts", () => {
  it("starts a running match with the first hand drawn, on its own pool", () => {
    const { state, deps } = freshMatchParts(createSeededRng(1), 2, {});

    expect(state.status).toBe(MATCH_STATUS.RUNNING);
    expect(state.phase).toBe(TURN_PHASE.CHOOSE);
    expect(state.hand).toHaveLength(3);
    // Three cards are out on the hand, so the pool holds the rest.
    expect(deps.diceSource.remaining()).toBe(POOL_SIZE - 3);
  });

  it("gives two matches two pools, never one", () => {
    const rng = createSeededRng(1);
    const first = freshMatchParts(rng, 2, {});
    const second = freshMatchParts(rng, 2, {});

    expect(second.deps.diceSource).not.toBe(first.deps.diceSource);
    expect(second.deps.diceSource.remaining()).toBe(POOL_SIZE - 3);
  });

  it("seats the bots from a list, or from a count clamped to leave one person", () => {
    const listed = freshMatchParts(createSeededRng(1), 4, { botSeats: [0, 3] });
    expect(listed.state.bots).toEqual([0, 3]);

    // `?players=4&bots=3`, quit, then a two-player match: one person stays at the keyboard.
    const counted = freshMatchParts(createSeededRng(1), 2, { botCount: 3 });
    expect(counted.state.bots).toEqual([2]);

    expect(freshMatchParts(createSeededRng(1), 3, {}).state.bots).toEqual([]);
  });

  it("puts a stacked card on top of the skill pool", () => {
    const { state } = freshMatchParts(createSeededRng(1), 2, {
      stack: ["action-double-dip"],
    });

    // The first turn's draw has already happened, so the stacked card is in the first hand.
    expect(state.skillHands[0]).toContain("action-double-dip");
  });
});

describe("restartParts", () => {
  it("keeps the players and the bots, and starts on a whole new pool", () => {
    const rng = createSeededRng(3);
    const first = freshMatchParts(rng, 4, { botSeats: [2, 3] });
    const again = restartParts(first.state, rng);

    expect(again.state.playerCount).toBe(4);
    expect(again.state.bots).toEqual([2, 3]);
    expect(again.state.turnNumber).toBe(1);
    expect(again.deps.diceSource).not.toBe(first.deps.diceSource);
    expect(again.deps.diceSource.remaining()).toBe(POOL_SIZE - 3);
  });
});
