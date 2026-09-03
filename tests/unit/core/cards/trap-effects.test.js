/**
 * The four cards that put something on a square. Issue #38, requirements FR-26, FR-28 and FR-30.
 *
 * Split from `board-effects.test.js` when that file passed 300 lines. **This file now covers the
 * placement only**, which is all `trap-effects.js` still does: issue #45 moved the firing rules out to
 * `core/trap-fire.js`, and their tests went with them.
 */

import { describe, expect, it } from "vitest";

import { START_R } from "../../../../src/core/board.js";
import { createContext } from "../../../../src/core/cards/context.js";
import { BIG_ROCK_ROUNDS } from "../../../../src/core/cards/effects/trap-effects.js";
import { effectFor } from "../../../../src/core/cards/effects/index.js";
import { PUSHBACK_FLOOR } from "../../../../src/core/displacement.js";
import { turnsForRounds } from "../../../../src/core/statuses.js";
import { TRAP_KIND } from "../../../../src/core/traps.js";
import { pawnsAt, rngForDice } from "../../../helpers/fixtures.js";

/** Run one card, with the RNG scripted as `[[roll, faces], ...]`. */
function play(cardId, fields = {}, dice = []) {
  return effectFor(cardId)(createContext({ rng: rngForDice(dice), ...fields }));
}

/** Where one pawn ended up in a patch's pawn list. */
const rOf = (patch, player, pawn) =>
  patch.pawns.find((entry) => entry.player === player && entry.pawn === pawn).r;

describe("the four cards that put something on a square", () => {
  const target = { square: 17 };

  it("each lays its own kind of object, owned by whoever played it", () => {
    const cards = {
      "action-banana-peel": TRAP_KIND.BANANA_PEEL,
      "action-oil-spill": TRAP_KIND.OIL_SPILL,
      "action-not-that-deep": TRAP_KIND.NOT_THAT_DEEP,
      "action-big-ah-rock": TRAP_KIND.BIG_AH_ROCK,
    };

    for (const [cardId, kind] of Object.entries(cards)) {
      const patch = play(cardId, { actor: 2, target });

      expect(patch.traps).toHaveLength(1);
      expect(patch.traps[0]).toMatchObject({ kind, square: 17, owner: 2 });
    }
  });

  /**
   * The three traps wait as long as it takes; the blocker is the only one with a deadline. A trap with a
   * deadline would be a trap that quietly stopped being there, which nobody could tell from a bug.
   *
   * Three rounds at four seats is twelve turns, so a rock dropped on turn 5 stands until 17. It was
   * two rounds and 13 until issue #45; the rulebook always said three.
   */
  it("gives the blocker a deadline and the traps none", () => {
    expect(play("action-banana-peel", { target }).traps[0].until).toBeNull();
    expect(
      play("action-big-ah-rock", { turnNumber: 5, playerCount: 4, target }).traps[0].until
    ).toBe(5 + turnsForRounds(BIG_ROCK_ROUNDS, 4));
  });
});

describe("Big Ah Rock also knocks the pawn behind it back (issue #45)", () => {
  const target = { square: 17 };

  /**
   * The half of the card that was never built. Seat 2's `r = 37` is absolute 16, one square behind the
   * rock on 17, so it is the nearest pawn behind and gets pushed three back to `r = 34`.
   */
  it("pushes the nearest enemy pawn behind the rock back three", () => {
    const patch = play("action-big-ah-rock", {
      actor: 0,
      target,
      pawns: pawnsAt(4, { "2.0": 37 }),
    });

    expect(rOf(patch, 2, 0)).toBe(34);
  });

  /**
   * "Behind" is measured from the rock and runs backwards round the whole ring, first hit wins. Seat 2
   * on absolute 16 is nearer than seat 1 on absolute 10, so seat 1 is untouched.
   */
  it("finds the nearest one and leaves the others alone", () => {
    const patch = play("action-big-ah-rock", {
      actor: 0,
      target,
      pawns: pawnsAt(4, { "2.0": 37, "1.0": 1 }),
    });

    expect(rOf(patch, 2, 0)).toBe(34);
    expect(rOf(patch, 1, 0)).toBe(1);
  });

  /** A card that knocked back its own pawn would be a card nobody plays. */
  it("skips the placing player's own pawns", () => {
    const patch = play("action-big-ah-rock", {
      actor: 0,
      target,
      pawns: pawnsAt(4, { "0.0": 17, "2.0": 30 }),
    });

    expect(rOf(patch, 0, 0)).toBe(17);
    expect(rOf(patch, 2, 0)).toBe(27);
  });

  /**
   * The rock's own square is not "behind" it, and the module has always promised that a pawn already
   * standing there is not moved. Seat 2's `r = 38` is absolute 17, the rock's square itself, so the
   * search finds nobody and the card writes **no pawn list at all**. Asserting the absence is stronger
   * than asserting the position: a patch with no `pawns` key cannot have moved anything.
   */
  it("does not move a pawn standing on the square the rock lands on", () => {
    const patch = play("action-big-ah-rock", {
      actor: 0,
      target,
      pawns: pawnsAt(4, { "2.0": 38 }),
    });

    expect(patch.pawns).toBeUndefined();
    expect(patch.traps).toHaveLength(1);
  });

  /** No enemy pawn anywhere on the track, so the placement is all that happens. */
  it("is a plain placement when there is nobody behind it", () => {
    const patch = play("action-big-ah-rock", { actor: 0, target, pawns: pawnsAt(4) });

    expect(patch.traps).toHaveLength(1);
    expect(patch.pawns).toBeUndefined();
  });

  /**
   * The knockback goes through `shove`, so it gets the same rules a trap-driven push does. Seat 1's
   * `r = 25` is absolute 34, and seat 2 pushed back from absolute 16 to absolute 13 would pass it, so
   * this needs the two on the same square instead: seat 1 at `r = 4` is absolute 13.
   */
  it("captures a pawn the knockback lands on", () => {
    const patch = play("action-big-ah-rock", {
      actor: 0,
      target,
      pawns: pawnsAt(4, { "2.0": 37, "1.0": 4 }),
    });

    expect(rOf(patch, 2, 0)).toBe(34);
    expect(rOf(patch, 1, 0)).toBe(START_R);
  });

  /**
   * The floor is the entry square, so a knockback never substitutes for a capture. Seat 2's `r = 2` is
   * absolute 21, one behind a rock on 22, and three back from `r = 2` would be `r = -1`.
   */
  it("stops the knockback at the entry square", () => {
    const patch = play("action-big-ah-rock", {
      actor: 0,
      target: { square: 22 },
      pawns: pawnsAt(4, { "2.0": 2 }),
    });

    expect(rOf(patch, 2, 0)).toBe(PUSHBACK_FLOOR);
  });
});

/**
 * The firing half of these four cards is now `tests/unit/core/trap-fire.test.js`, and the walk a fired
 * trap sends the pawn on is `tests/unit/core/enter.test.js`. Both moved with the code in issue #45:
 * `fireTrap` left this module for `core/trap-fire.js` and stopped writing pawn positions at all.
 */
