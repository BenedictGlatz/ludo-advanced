/**
 * What the two cards played on somebody else's pawn are worth. Issue #82, split out of
 * `values-pawns.test.js` with the module.
 *
 * ## These are the two cases where "which opponent" is the whole decision
 *
 * The bot tactics plan's phase 2a made an opponent's loss depend on how far ahead they are, and these
 * are the two cards that pick a victim outright, so this is where that rule is pinned. Every board
 * below has one seat well ahead of the table average, which is what a real board looks like by the
 * time a Yeet is worth playing, and the factor comes out of `share`'s clamp at double.
 *
 * Seat 0's entry square is 0, seat 1's is 10, so seat 1's `r = 20` stands on square 29 and seat 0's
 * `r = 28` stands on square 27, two behind it.
 */

import { describe, expect, it } from "vitest";

import { DEFAULT_PROFILE } from "../../../src/ai/profile.js";
import { ragebait, yeet } from "../../../src/ai/values-attacks.js";
import { pawnsAt, stateFor } from "../../helpers/fixtures.js";

/** The action phase of seat 0's turn, with a die already chosen. */
function acting(placements) {
  return stateFor({ phase: "action", chosenDie: 6, pawns: pawnsAt(4, placements) });
}

describe("Ragebait: forcing the wrong pawn to move", () => {
  /**
   * Aimed at the opponent's rearmost pawn, which is the pawn whose forced move wastes their turn.
   *
   * Seat 1 has walked 35 of the 46 steps on the board against a table average of 11.5, so it is three
   * times the average and `share` clamps that to double. A third, doubled, is two thirds of the
   * taunt's worth.
   */
  it("taunts the opponent's rearmost pawn", () => {
    const state = acting({ "0.0": 11, "1.0": 30, "1.1": 5 });
    const scored = ragebait(state, 0);

    expect(scored.target).toEqual({ pawn: { player: 1, pawn: 1 } });
    expect(scored.value).toBeCloseTo((DEFAULT_PROFILE.tauntWorth * 2) / 3, 10);
  });

  it("is not worth playing against a player with only one pawn out", () => {
    expect(ragebait(acting({ "0.0": 11, "1.0": 30 }), 0)).toBeNull();
  });

  /**
   * The lead weighting, seen on one board rather than in one number: two opponents with two pawns out
   * each, and the taunt goes to the one who has got further. Before phase 2a the two were worth
   * exactly the same and the answer was whichever seat came first in the list.
   */
  it("taunts the opponent who is winning, not the one who happens to be first", () => {
    const state = acting({ "1.0": 3, "1.1": 6, "3.0": 25, "3.1": 30 });

    expect(ragebait(state, 0).target.pawn.player).toBe(3);
  });
});

describe("Yeet: pushing an opponent back", () => {
  /**
   * With nothing of mine nearby it is worth a share of the four steps the victim loses. Seat 1 is 20
   * of the 31 steps on the board against an average of 7.75, so the clamp doubles the third again.
   */
  it("is worth a share of the steps the victim loses", () => {
    const state = acting({ "0.0": 11, "1.0": 20 });

    expect(yeet(state, 0).target).toEqual({ pawn: { player: 1, pawn: 0 } });
    expect(yeet(state, 0).value).toBeCloseTo((4 * 2) / 3, 10);
  });

  /**
   * The term a careless bot would miss. A push resolves a capture on the square it lands on, so one
   * of my own pawns sitting behind the victim can be sent home by my own card. Seat 1's `r = 20` is
   * square 29 and seat 0's `r = 28` is square 27, two behind it, so one face of the D6 captures my
   * own pawn and the value goes negative.
   */
  it("refuses to push a pawn back onto one of mine", () => {
    const state = acting({ "0.0": 28, "1.0": 20 });

    expect(yeet(state, 0).value).toBeLessThan(0);
  });

  /** The other side of it: pushing a pawn out of range of my own leader is worth extra. */
  it("is worth more when it pushes an attacker away from my pawn", () => {
    // Seat 0's r = 34 is square 33, four in front of seat 1's r = 20 on square 29.
    const relieved = acting({ "0.0": 34, "1.0": 20 });
    const plain = acting({ "0.0": 11, "1.0": 20 });

    expect(yeet(relieved, 0).value).toBeGreaterThan(yeet(plain, 0).value);
  });

  it("cannot push a pawn that is already on its entry square", () => {
    expect(yeet(acting({ "0.0": 11, "1.0": 1 }), 0)).toBeNull();
  });
});
