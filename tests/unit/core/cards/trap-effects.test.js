/**
 * The four cards that put something on a square, and what happens when a pawn walks into it.
 * Issue #38, requirements FR-26, FR-28 and FR-30.
 *
 * Split from `board-effects.test.js` when that file passed 300 lines. The seam is the one the source
 * uses: `trap-effects.js` is the only effects file with **two** halves to test, the placement and the
 * firing, and the firing is not a card effect at all. It is called from move resolution.
 */

import { describe, expect, it } from "vitest";

import { START_R } from "../../../../src/core/board.js";
import { createContext } from "../../../../src/core/cards/context.js";
import { effectFor } from "../../../../src/core/cards/effects/index.js";
import { fireTrap } from "../../../../src/core/cards/effects/trap-effects.js";
import { STATUS } from "../../../../src/core/statuses.js";
import { TRAP_KIND } from "../../../../src/core/traps.js";
import { pawnsAt, rngForDice } from "../../../helpers/fixtures.js";

/** Run one card, with the RNG scripted as `[[roll, faces], ...]`. */
function play(cardId, fields = {}, dice = []) {
  return effectFor(cardId)(createContext({ rng: rngForDice(dice), ...fields }));
}

/** Where one pawn ended up in a patch's pawn list. */
function at(patch, player, pawn) {
  return patch.pawns.find((entry) => entry.player === player && entry.pawn === pawn).r;
}

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
   */
  it("gives the blocker a deadline and the traps none", () => {
    expect(play("action-banana-peel", { target }).traps[0].until).toBeNull();
    expect(
      play("action-big-ah-rock", { turnNumber: 5, playerCount: 4, target }).traps[0].until
    ).toBe(13);
  });
});

describe("a trap going off", () => {
  const mover = { player: 0, pawn: 0 };
  const trapOn = (kind, square = 12) => ({ kind, square, owner: 2, until: null });

  function fire(kind, r, dice = []) {
    return fireTrap({
      pawns: pawnsAt(4, { "0.0": r }),
      statuses: [],
      traps: [trapOn(kind)],
      trap: trapOn(kind),
      mover,
      turnNumber: 7,
      rng: rngForDice(dice),
    });
  }

  it("Banana Peel sends the pawn back to its start area", () => {
    const result = fire(TRAP_KIND.BANANA_PEEL, 13);

    expect(at(result, 0, 0)).toBe(START_R);
  });

  it("It's Not That Deep pushes the pawn back a D6", () => {
    const result = fire(TRAP_KIND.NOT_THAT_DEEP, 13, [[4, 6]]);

    expect(at(result, 0, 0)).toBe(9);
  });

  /**
   * Oil Spill slides the pawn **and** marks it, so the square it stops on hands out no skill card. A card
   * whose whole point is speed should not also be the best way to farm cards.
   */
  it("Oil Spill slides the pawn forward and marks it as having slid", () => {
    // The slide is 3 plus a D3 minus 1, so a 1 on the D3 is the shortest slide.
    const result = fire(TRAP_KIND.OIL_SPILL, 13, [[1, 3]]);

    expect(at(result, 0, 0)).toBe(16);
    expect(result.statuses[0]).toMatchObject({
      kind: STATUS.SLIPPERY,
      player: 0,
      pawn: 0,
      until: 8,
    });
  });

  it("clears the trap off the board, whatever it did", () => {
    for (const kind of [TRAP_KIND.BANANA_PEEL, TRAP_KIND.OIL_SPILL]) {
      expect(fire(kind, 13, [[1, 6]]).traps).toEqual([]);
    }
  });

  /**
   * A blocker is in the same list and must not behave like a trap. Nothing should ever walk onto one,
   * because `blockedSquares` refuses the move first, and a rule that relies on another rule having run is
   * a rule that breaks when the order changes.
   */
  it("does nothing at all for a blocker, and leaves it standing", () => {
    const result = fire(TRAP_KIND.BIG_AH_ROCK, 13);

    expect(at(result, 0, 0)).toBe(13);
    expect(result.traps).toHaveLength(1);
  });
});
