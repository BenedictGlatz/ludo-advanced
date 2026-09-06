/**
 * The two cards that turn one of your own pawns to stone. Issue #90, requirement FR-26.
 *
 * Both write `STATUS.ROCK`; they differ in how long, and in Big Ah Rock's knockback of the nearest enemy
 * pawn behind the stone. Until issue #90 Big Ah Rock targeted a free square and lived with the trap
 * cards; a playtest asked for it to petrify a pawn instead and the Product Owner agreed.
 *
 * What the status *does* is tested where it is read: `move-rules.test.js` for the refusal to the owner
 * and the wall, `slide.test.js` for the stone not sliding.
 */

import { describe, expect, it } from "vitest";

import { START_R } from "../../../../src/core/board.js";
import { createContext } from "../../../../src/core/cards/context.js";
import { effectFor } from "../../../../src/core/cards/effects/index.js";
import { DURATION_ROUNDS, KNOCKBACK } from "../../../../src/core/cards/effects/status-effects.js";
import { PUSHBACK_FLOOR } from "../../../../src/core/displacement.js";
import { STATUS, turnsForRounds } from "../../../../src/core/statuses.js";
import { TRAP_KIND } from "../../../../src/core/traps.js";
import { pawnsAt, rngForDice } from "../../../helpers/fixtures.js";

function play(cardId, fields = {}, dice = []) {
  return effectFor(cardId)(createContext({ rng: rngForDice(dice), ...fields }));
}

const rOf = (patch, player, pawn) =>
  patch.pawns.find((entry) => entry.player === player && entry.pawn === pawn).r;

/** Seat 0's pawn 0 on `r = 18`, which is absolute 17, the square the old fixtures used. */
const own = { pawn: { player: 0, pawn: 0 } };
const base = { actor: 0, target: own, turnNumber: 5, playerCount: 4 };

describe("both cards write the same status on the caster's own pawn", () => {
  it("Rock lasts two rounds", () => {
    const patch = play("action-rock", { ...base, pawns: pawnsAt(4, { "0.0": 18 }) });

    expect(patch.statuses).toEqual([
      expect.objectContaining({
        kind: STATUS.ROCK,
        player: 0,
        pawn: 0,
        until: 5 + turnsForRounds(DURATION_ROUNDS.rock, 4),
        source: "action-rock",
      }),
    ]);
  });

  it("Big Ah Rock lasts three rounds, as the rulebook has always said", () => {
    const patch = play("action-big-ah-rock", { ...base, pawns: pawnsAt(4, { "0.0": 18 }) });

    expect(patch.statuses).toEqual([
      expect.objectContaining({
        kind: STATUS.ROCK,
        player: 0,
        pawn: 0,
        until: 5 + turnsForRounds(DURATION_ROUNDS.bigAhRock, 4),
        source: "action-big-ah-rock",
      }),
    ]);
    expect(DURATION_ROUNDS.bigAhRock).toBeGreaterThan(DURATION_ROUNDS.rock);
  });

  it("Big Ah Rock writes no trap: it stopped being a square object in issue #90", () => {
    const patch = play("action-big-ah-rock", { ...base, pawns: pawnsAt(4, { "0.0": 18 }) });

    expect(patch.traps).toBeUndefined();
  });
});

describe("Big Ah Rock knocks the nearest enemy pawn behind the stone back", () => {
  /** Seat 2's `r = 37` is absolute 16, one square behind the stone on 17, so it goes back three. */
  it("pushes the nearest enemy pawn behind the stone back three", () => {
    const patch = play("action-big-ah-rock", {
      ...base,
      pawns: pawnsAt(4, { "0.0": 18, "2.0": 37 }),
    });

    expect(rOf(patch, 2, 0)).toBe(37 - KNOCKBACK);
  });

  /** Behind runs backwards round the ring, first hit wins: seat 2 on 16 is nearer than seat 1 on 10. */
  it("finds the nearest one and leaves the others alone", () => {
    const patch = play("action-big-ah-rock", {
      ...base,
      pawns: pawnsAt(4, { "0.0": 18, "2.0": 37, "1.0": 1 }),
    });

    expect(rOf(patch, 2, 0)).toBe(34);
    expect(rOf(patch, 1, 0)).toBe(1);
  });

  /** The caster's other pawns are not enemies, so the search walks past them. */
  it("skips the caster's own pawns", () => {
    const patch = play("action-big-ah-rock", {
      ...base,
      pawns: pawnsAt(4, { "0.0": 18, "0.1": 17, "2.0": 30 }),
    });

    expect(rOf(patch, 0, 1)).toBe(17);
    expect(rOf(patch, 2, 0)).toBe(27);
  });

  it("is a plain petrification when there is nobody behind the stone", () => {
    const patch = play("action-big-ah-rock", { ...base, pawns: pawnsAt(4, { "0.0": 18 }) });

    expect(patch.pawns).toBeUndefined();
    expect(patch.trapFired).toBeUndefined();
  });

  /**
   * The knockback goes through `shove`, so it captures what it lands on. Seat 1 at `r = 4` is absolute
   * 13, where seat 2 is pushed to from 16.
   */
  it("captures a pawn the knockback lands on", () => {
    const patch = play("action-big-ah-rock", {
      ...base,
      pawns: pawnsAt(4, { "0.0": 18, "2.0": 37, "1.0": 4 }),
    });

    expect(rOf(patch, 2, 0)).toBe(34);
    expect(rOf(patch, 1, 0)).toBe(START_R);
  });

  /** The floor is the entry square, so a knockback never substitutes for a capture. */
  it("stops the knockback at the entry square", () => {
    // Stone on absolute 22 (seat 0's r = 23); seat 2's r = 2 is absolute 21, right behind it.
    const patch = play("action-big-ah-rock", {
      ...base,
      pawns: pawnsAt(4, { "0.0": 23, "2.0": 2 }),
    });

    expect(rOf(patch, 2, 0)).toBe(PUSHBACK_FLOOR);
  });

  /** A pushed pawn that is itself stone does not move (issue #90), and nothing is reported. */
  it("cannot knock back a pawn that is itself petrified", () => {
    const stone = { kind: STATUS.ROCK, player: 2, pawn: 0, until: 99, source: "test" };
    const patch = play("action-big-ah-rock", {
      ...base,
      pawns: pawnsAt(4, { "0.0": 18, "2.0": 37 }),
      statuses: [stone],
    });

    expect(rOf(patch, 2, 0)).toBe(37);
    expect(patch.trapFired).toBeNull();
  });
});

describe("the knockback is announced", () => {
  /**
   * A pawn moving three squares with nobody having asked is exactly what `trapFired` exists for. The
   * report carries the key the strip reads, `trap.fired.big-ah-rock`, with the victim and the caster.
   */
  it("reports the push through trapFired when no trap fired on the way", () => {
    const patch = play("action-big-ah-rock", {
      ...base,
      pawns: pawnsAt(4, { "0.0": 18, "2.0": 37 }),
    });

    expect(patch.trapFired).toEqual({
      kind: "big-ah-rock",
      square: 17,
      owner: 0,
      player: 2,
      pawn: 0,
      squares: KNOCKBACK,
    });
  });

  /** A trap the victim was pushed over is the thing they could have seen coming, so it keeps the report. */
  it("lets a trap the push set off keep the report", () => {
    const patch = play("action-big-ah-rock", {
      ...base,
      pawns: pawnsAt(4, { "0.0": 18, "2.0": 37 }),
      traps: [{ kind: TRAP_KIND.BANANA_PEEL, square: 14, owner: 1, until: null }],
    });

    expect(patch.trapFired.kind).toBe(TRAP_KIND.BANANA_PEEL);
  });
});
