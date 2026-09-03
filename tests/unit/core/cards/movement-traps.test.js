/**
 * Card-driven movement setting off traps. Issue #45, requirement FR-30.
 *
 * A file of its own rather than cases added to `board-effects.test.js`, which is close enough to the
 * 300-line NFR-02 limit that it cannot take them. The seam is honest anyway: `board-effects.test.js`
 * asks what a card does to a pawn's position, and this file asks what the **board** does back.
 *
 * ## What is being tested, in one sentence
 *
 * Until this issue, a trap fired for a dice move and for nothing else. Yeet, Aight Imma Head Out and Let
 * Him Cook pushed pawns straight over traps and nothing happened, while Yeet's own printed text says "or
 * forward onto a trap, if you're feeling mean". All three now go through `core/enter.js`.
 *
 * ## Reading the coordinates
 *
 * `absoluteSquare(player, r) = (10 * player + r - 1) mod 40`. Seat 0 is the actor throughout, so its
 * absolute square is `r - 1`, and seat 2's is `(r + 19) mod 40`.
 */

import { describe, expect, it } from "vitest";

import { START_R } from "../../../../src/core/board.js";
import { createContext } from "../../../../src/core/cards/context.js";
import { HEAD_OUT } from "../../../../src/core/cards/effects/displacement-effects.js";
import { effectFor } from "../../../../src/core/cards/effects/index.js";
import { STATUS } from "../../../../src/core/statuses.js";
import { TRAP_KIND } from "../../../../src/core/traps.js";
import { pawnsAt, rngForDice } from "../../../helpers/fixtures.js";

const trap = (kind, square, owner = 3) => ({ kind, square, owner, until: null });

/** Run one card. `dice` scripts the injected RNG as `[[roll, faces], ...]`. */
function play(cardId, fields = {}, dice = []) {
  return effectFor(cardId)(createContext({ playerCount: 4, rng: rngForDice(dice), ...fields }));
}

const rOf = (patch, player, pawn) =>
  patch.pawns.find((entry) => entry.player === player && entry.pawn === pawn).r;

const stunOn = (patch, player, pawn) =>
  (patch.statuses ?? []).some(
    (entry) => entry.kind === STATUS.STUNNED && entry.player === player && entry.pawn === pawn
  );

describe("Yeet can throw a pawn onto a trap, which its own card text promises", () => {
  /**
   * Seat 2's `r = 25` is absolute 4. A D6 of 3 pushes it back to `r = 22`, absolute 1, crossing
   * absolute 3, 2 and 1. The Banana Peel on 2 is what it walks into.
   */
  it("fires a trap the push crossed", () => {
    const patch = play(
      "action-yeet",
      {
        actor: 0,
        target: { pawn: { player: 2, pawn: 0 } },
        pawns: pawnsAt(4, { "2.0": 25 }),
        traps: [trap(TRAP_KIND.BANANA_PEEL, 2)],
      },
      [[3, 6]]
    );

    expect(rOf(patch, 2, 0)).toBe(22);
    expect(stunOn(patch, 2, 0)).toBe(true);
    expect(patch.traps).toEqual([]);
  });

  /**
   * A boulder stops the throw, which the old `displace` could not express at all: the pawn used to slide
   * straight through.
   *
   * The boulder is on absolute 2, which for seat 2 is `r = 23`. The throw walks `r = 24`, then `r = 23`,
   * so it stops on the square before the boulder, and walking backwards that is `r = 24`.
   */
  it("is stopped by a boulder in the way", () => {
    const rock = trap(TRAP_KIND.BIG_AH_ROCK, 2);
    const patch = play(
      "action-yeet",
      {
        actor: 0,
        target: { pawn: { player: 2, pawn: 0 } },
        pawns: pawnsAt(4, { "2.0": 25 }),
        traps: [rock],
      },
      [[3, 6]]
    );

    expect(rOf(patch, 2, 0)).toBe(24);
    expect(patch.traps).toEqual([rock]);
  });

  /**
   * The other half of the same rule. Seat 1's `r = 32` is absolute 1, where seat 2's pawn is thrown, so
   * it is captured rather than sharing the square. Before this the two simply overlapped, and nothing
   * would have caught it: `captureTarget` throws only for two **opponents** on one square.
   */
  it("captures a pawn the throw lands on", () => {
    const patch = play(
      "action-yeet",
      {
        actor: 0,
        target: { pawn: { player: 2, pawn: 0 } },
        pawns: pawnsAt(4, { "2.0": 25, "1.0": 32 }),
      },
      [[3, 6]]
    );

    expect(rOf(patch, 2, 0)).toBe(22);
    expect(rOf(patch, 1, 0)).toBe(START_R);
  });
});

describe("Aight Imma Head Out sets off what it walks over, in both directions", () => {
  /** Forward four from `r = 10`, absolute 9, to `r = 14`, crossing absolute 10 to 13. */
  it("fires a trap on the way forward", () => {
    const patch = play("action-head-out", {
      actor: 0,
      target: { pawn: { player: 0, pawn: 0 }, choice: HEAD_OUT.ADVANCE },
      pawns: pawnsAt(4, { "0.0": 10 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 12)],
    });

    expect(rOf(patch, 0, 0)).toBe(14);
    expect(stunOn(patch, 0, 0)).toBe(true);
  });

  /**
   * The retreat is the long one: from `r = 10` all the way back to the entry square at `r = 1`, which
   * crosses nine squares. A trap anywhere along them fires, and the pushback it causes then applies on
   * top of the retreat.
   */
  it("fires a trap on the way back to the entry square", () => {
    const patch = play("action-head-out", {
      actor: 0,
      target: { pawn: { player: 0, pawn: 0 }, choice: HEAD_OUT.RETREAT },
      pawns: pawnsAt(4, { "0.0": 10 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 5)],
    });

    expect(rOf(patch, 0, 0)).toBe(1);
    expect(stunOn(patch, 0, 0)).toBe(true);
    expect(patch.traps).toEqual([]);
  });
});

describe("Let Him Cook", () => {
  /** A D12 of 4 runs from `r = 10` to `r = 14`, crossing absolute 10 to 13. */
  it("fires a trap on the run", () => {
    const patch = play(
      "action-let-him-cook",
      {
        actor: 0,
        target: { pawn: { player: 0, pawn: 0 } },
        pawns: pawnsAt(4, { "0.0": 10 }),
        traps: [trap(TRAP_KIND.BANANA_PEEL, 12)],
      },
      [[4, 12]]
    );

    expect(rOf(patch, 0, 0)).toBe(14);
    expect(stunOn(patch, 0, 0)).toBe(true);
  });

  /**
   * The card's own risk: a run past the deepest house square sends the pawn home instead. **That fires
   * nothing**, and it is the exception the whole trigger rests on. A start area is not a tile, and
   * walking a pawn there would count every square between it and its yard.
   */
  it("fires nothing when the run overshoots and the pawn goes home", () => {
    const laid = trap(TRAP_KIND.BANANA_PEEL, 40);
    const patch = play(
      "action-let-him-cook",
      {
        actor: 0,
        target: { pawn: { player: 0, pawn: 0 } },
        pawns: pawnsAt(4, { "0.0": 42 }),
        traps: [laid],
      },
      [[12, 12]]
    );

    expect(rOf(patch, 0, 0)).toBe(START_R);
    expect(patch.statuses).toBeUndefined();
    expect(patch.traps).toBeUndefined();
  });
});

describe("the two area cards fire nothing, and that is deliberate", () => {
  /**
   * Hyperbeam and Janky RPG only ever call `sendHome`, so there is nothing to route through the choke
   * point. Asserted rather than left implicit, because "this card fires no trap" looks exactly like a
   * card somebody forgot to wire up.
   *
   * Hyperbeam fires from seat 0's `r = 10`, absolute 9, forwards over a D4 of 3: absolute 10, 11, 12.
   * Seat 2's `r = 32` is absolute 11 and goes home. The Banana Peel on 12 is inside the beam and stays.
   */
  it("Hyperbeam sends pawns home without setting off the traps it sweeps", () => {
    const laid = trap(TRAP_KIND.BANANA_PEEL, 12);
    const patch = play(
      "action-hyperbeam",
      {
        actor: 0,
        target: { pawn: { player: 0, pawn: 0 }, direction: 1 },
        pawns: pawnsAt(4, { "0.0": 10, "2.0": 32 }),
        traps: [laid],
      },
      [[3, 4]]
    );

    expect(rOf(patch, 2, 0)).toBe(START_R);
    expect(patch.traps).toBeUndefined();
    expect(patch.statuses).toBeUndefined();
  });

  /** Janky RPG on a 4 or better clears the square it named. Same reasoning. */
  it("Janky RPG clears a square without setting off a trap on it", () => {
    const laid = trap(TRAP_KIND.BANANA_PEEL, 11);
    const patch = play(
      "action-janky-rpg",
      {
        actor: 0,
        target: { square: 11 },
        pawns: pawnsAt(4, { "2.0": 32 }),
        traps: [laid],
      },
      [[5, 6]]
    );

    expect(rOf(patch, 2, 0)).toBe(START_R);
    expect(patch.traps).toBeUndefined();
  });
});
