/**
 * The eight cards that move pawns. Issue #38, requirements FR-26 and FR-28.
 *
 * Split from `effects.test.js` at the seam the effects files themselves use: the cards there write a
 * modifier, a hand or a status, and the cards here move pawns or sweep several squares at once. Every
 * one of these needs a pawn list, which is what makes them longer to set up. The four cards that lay
 * something on a square are in `trap-effects.test.js`.
 *
 * The RNG is scripted throughout, because six of the eight roll a die of their own.
 */

import { describe, expect, it } from "vitest";

import { HOME_R, START_R } from "../../../../src/core/board.js";
import { createContext } from "../../../../src/core/cards/context.js";
import { effectFor } from "../../../../src/core/cards/effects/index.js";
import { HEAD_OUT } from "../../../../src/core/cards/effects/displacement-effects.js";
import { pawnsAt, rngForDice } from "../../../helpers/fixtures.js";

/** Run one card, with the RNG scripted as `[[roll, faces], ...]`. */
function play(cardId, fields = {}, dice = []) {
  return effectFor(cardId)(createContext({ rng: rngForDice(dice), ...fields }));
}

/** Where one pawn ended up in a patch's pawn list. */
function at(patch, player, pawn) {
  return patch.pawns.find((entry) => entry.player === player && entry.pawn === pawn).r;
}

describe("Yeet pushes an opponent's pawn back a D6", () => {
  it("moves it back by what the die said", () => {
    const patch = play(
      "action-yeet",
      { pawns: pawnsAt(4, { "1.0": 20 }), target: { pawn: { player: 1, pawn: 0 } } },
      [[4, 6]]
    );

    expect(at(patch, 1, 0)).toBe(16);
  });

  /**
   * The floor that keeps a pushback a setback rather than a cheap capture. Recorded as a decision: if
   * this could reach `r = 0`, three cards would replace the mechanic the whole game is built around.
   */
  it("stops at the entry square and never sends the pawn home", () => {
    const patch = play(
      "action-yeet",
      { pawns: pawnsAt(4, { "1.0": 3 }), target: { pawn: { player: 1, pawn: 0 } } },
      [[6, 6]]
    );

    expect(at(patch, 1, 0)).toBe(1);
  });

  it("cannot touch a pawn that is still in its start area", () => {
    const patch = play(
      "action-yeet",
      { pawns: pawnsAt(4), target: { pawn: { player: 1, pawn: 0 } } },
      [[6, 6]]
    );

    expect(at(patch, 1, 0)).toBe(START_R);
  });
});

describe("Aight Imma Head Out offers two options", () => {
  const own = { pawn: { player: 0, pawn: 0 } };

  it("jumps forward four when that is the option chosen", () => {
    const patch = play("action-head-out", {
      pawns: pawnsAt(4, { "0.0": 12 }),
      target: { ...own, choice: HEAD_OUT.ADVANCE },
    });

    expect(at(patch, 0, 0)).toBe(16);
  });

  /**
   * The retreat goes to the entry square and **not** to the start area, which is what makes it a real
   * choice rather than a worse capture: the pawn loses the lap it had walked and keeps its place in the
   * game.
   */
  it("retreats to the entry square, staying on the board", () => {
    const patch = play("action-head-out", {
      pawns: pawnsAt(4, { "0.0": 30 }),
      target: { ...own, choice: HEAD_OUT.RETREAT },
    });

    expect(at(patch, 0, 0)).toBe(1);
  });

  it("does nothing for a pawn still in its start area, either way", () => {
    for (const choice of [HEAD_OUT.ADVANCE, HEAD_OUT.RETREAT]) {
      expect(play("action-head-out", { pawns: pawnsAt(4), target: { ...own, choice } })).toEqual(
        {}
      );
    }
  });
});

describe("Let Him Cook rolls a D12 and runs", () => {
  it("moves the pawn forward by the whole roll", () => {
    const patch = play(
      "action-let-him-cook",
      { pawns: pawnsAt(4, { "0.0": 10 }), target: { pawn: { player: 0, pawn: 0 } } },
      [[9, 12]]
    );

    expect(at(patch, 0, 0)).toBe(19);
  });

  /**
   * Where the artwork's `RISKY` label lives. `displace` alone would clamp at `HOME_R`, which would make
   * this a free win for any pawn near home, so the overshoot is checked in the card and costs the lap.
   *
   * Deliberately harsher than FR-13, which merely refuses an overshooting move: a move the player chose
   * is refused, a gamble the player took is lost.
   */
  it("sends the pawn home when the run would go past the deepest house square", () => {
    const patch = play(
      "action-let-him-cook",
      { pawns: pawnsAt(4, { "0.0": HOME_R - 2 }), target: { pawn: { player: 0, pawn: 0 } } },
      [[12, 12]]
    );

    expect(at(patch, 0, 0)).toBe(START_R);
  });
});

describe("the two Reactions to a capture", () => {
  const pendingMove = { player: 0, pawn: 1, kind: "advance", from: 10, to: 13, captures: null };

  /**
   * The whole move is cancelled, not only the capture. Cancelling only the capture would leave the
   * attacker arriving on a square the ghost is still standing on, which is two pawns on one square.
   */
  it("Ghost Mode cancels the move and moves nothing", () => {
    expect(play("reaction-ghost-mode")).toEqual({ cancelMove: true });
  });

  it("Uno Reverse cancels the move and sends the attacker home", () => {
    const patch = play("reaction-uno-reverse", {
      pawns: pawnsAt(4, { "0.1": 10 }),
      pendingMove,
    });

    expect(patch.cancelMove).toBe(true);
    expect(at(patch, 0, 1)).toBe(START_R);
  });

  it("Uno Reverse still cancels when there is no declared move to reverse", () => {
    expect(play("reaction-uno-reverse", { pendingMove: null })).toEqual({ cancelMove: true });
  });
});

describe("the two cards that hit more than one square", () => {
  /**
   * Hyperbeam's "straight cardinal lane" is a property of the 11 by 11 drawing grid, which lives in
   * `ui/board-geometry.js`, and `core/` may not import `ui/`. Read as a run along the track instead: the
   * D4, the direction, the run and the friendly fire all survive; the geometry does not.
   */
  it("Hyperbeam clears the run in front of the pawn that fired it", () => {
    // Seat 0's r = 11 is absolute square 10. Firing forwards over a D4 of 3 sweeps 11, 12 and 13, where
    // seat 1's r = 2 (square 11) and seat 2's r = 34 (square 13) are standing.
    const patch = play(
      "action-hyperbeam",
      {
        pawns: pawnsAt(4, { "0.0": 11, "1.0": 2, "2.0": 34, "3.0": 5 }),
        target: { pawn: { player: 0, pawn: 0 }, direction: 1 },
      },
      [[3, 4]]
    );

    expect(at(patch, 1, 0)).toBe(START_R);
    expect(at(patch, 2, 0)).toBe(START_R);
    // Out of the run and untouched.
    expect(at(patch, 3, 0)).toBe(5);
    // And the shooter is not in its own run, because the run starts one square away.
    expect(at(patch, 0, 0)).toBe(11);
  });

  /**
   * The friendly fire the artwork asks for. A card that sent four pawns home with no risk to its owner
   * would be the only card anybody ever played.
   */
  it("Hyperbeam hits the firing player's own pawns too", () => {
    const patch = play(
      "action-hyperbeam",
      {
        pawns: pawnsAt(4, { "0.0": 11, "0.1": 12 }),
        target: { pawn: { player: 0, pawn: 0 }, direction: 1 },
      },
      [[2, 4]]
    );

    expect(at(patch, 0, 1)).toBe(START_R);
  });

  it("Hyperbeam cannot be fired from a pawn that is not on the shared track", () => {
    const patch = play(
      "action-hyperbeam",
      { pawns: pawnsAt(4, { "0.0": 42 }), target: { pawn: { player: 0, pawn: 0 }, direction: 1 } },
      [[3, 4]]
    );

    expect(patch).toEqual({});
  });

  it("Janky RPG hits what it aimed at on a 4 or better", () => {
    // Seat 1's r = 3 is absolute square 12.
    const patch = play(
      "action-janky-rpg",
      { pawns: pawnsAt(4, { "1.0": 3 }), target: { square: 12 } },
      [[5, 6]]
    );

    expect(at(patch, 1, 0)).toBe(START_R);
  });

  /**
   * Where the card's name comes from. On a 3 or less the shot goes wide and hits both neighbours, which
   * means the square that was aimed at is the one place that is safe.
   */
  it("Janky RPG hits both neighbours and spares the target on a 3 or less", () => {
    const patch = play(
      "action-janky-rpg",
      // Absolute squares 11, 12 and 13: seat 1 at r = 2, 3 and 4.
      { pawns: pawnsAt(4, { "1.0": 2, "1.1": 3, "1.2": 4 }), target: { square: 12 } },
      [[2, 6]]
    );

    expect(at(patch, 1, 0)).toBe(START_R);
    expect(at(patch, 1, 2)).toBe(START_R);
    expect(at(patch, 1, 1)).toBe(3);
  });
});

describe("67 is a gamble on the player's own roll", () => {
  /**
   * Two entries in the roll chain rather than a pawn touched anywhere: a threshold the dice have to
   * clear, and a doubling if they do. `core/roll.js` applies the threshold **before** the multiplier for
   * this card, so a 3 doubled to 6 cannot pass a test it failed.
   */
  it("sets a threshold of six and a doubling", () => {
    const patch = play("action-sixty-seven");

    expect(patch.modifiers.atLeast).toBe(6);
    expect(patch.modifiers.multiplier).toBe(2);
  });
});
