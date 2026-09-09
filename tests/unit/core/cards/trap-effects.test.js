/**
 * The three cards that put something on a square. Issue #38, requirements FR-26, FR-28 and FR-30.
 *
 * Split from `board-effects.test.js` when that file passed 300 lines. **This file now covers the
 * placement only**, which is all `trap-effects.js` still does: issue #45 moved the firing rules out to
 * `core/trap-fire.js`, and their tests went with them.
 */

import { describe, expect, it } from "vitest";

import { createContext } from "../../../../src/core/cards/context.js";
import { effectFor } from "../../../../src/core/cards/effects/index.js";
import { TRAP_KIND } from "../../../../src/core/traps.js";
import { rngForDice } from "../../../helpers/fixtures.js";

/** Run one card, with the RNG scripted as `[[roll, faces], ...]`. */
function play(cardId, fields = {}, dice = []) {
  return effectFor(cardId)(createContext({ rng: rngForDice(dice), ...fields }));
}

describe("the three cards that put something on a square", () => {
  const target = { square: 17 };

  it("each lays its own kind of object, owned by whoever played it", () => {
    const cards = {
      "action-banana-peel": TRAP_KIND.BANANA_PEEL,
      "action-oil-spill": TRAP_KIND.OIL_SPILL,
      "action-not-that-deep": TRAP_KIND.NOT_THAT_DEEP,
    };

    for (const [cardId, kind] of Object.entries(cards)) {
      const patch = play(cardId, { actor: 2, target });

      expect(patch.traps).toHaveLength(1);
      expect(patch.traps[0]).toMatchObject({ kind, square: 17, owner: 2 });
    }
  });

  /** Every trap waits as long as it takes. A deadline would be a trap that quietly stopped being there. */
  it("gives no trap a deadline", () => {
    for (const cardId of ["action-banana-peel", "action-oil-spill", "action-not-that-deep"]) {
      expect(play(cardId, { target }).traps[0].until).toBeNull();
    }
  });
});

/**
 * The firing half of these three cards is now `tests/unit/core/trap-fire.test.js`, and the walk a fired
 * trap sends the pawn on is `tests/unit/core/enter.test.js`. Both moved with the code in issue #45:
 * `fireTrap` left this module for `core/trap-fire.js` and stopped writing pawn positions at all.
 */

/**
 * Big Ah Rock left this file in issue #90. It targets one of the caster's own pawns now, like Rock, and
 * its tests are in `rock-effects.test.js` beside the status it writes.
 */
