/**
 * A card play refused because the square cannot take an object. Issue #45, requirement FR-30.
 *
 * `tests/unit/core/trap-rules.test.js` tests the rules; this file tests that a play is actually refused
 * by them, and that the one card which fires *at* a square rather than occupying one is untouched.
 *
 * A file of its own because `intents-cards.test.js` is close enough to the 300-line NFR-02 limit that it
 * cannot take a case.
 */

import { describe, expect, it } from "vitest";

import { TRACK_LENGTH } from "../../../src/core/board.js";
import { EXCLUDED_SQUARES } from "../../../src/core/skill-squares.js";
import { TRAP_KIND } from "../../../src/core/traps.js";
import { createGameState, nextState } from "../../../src/state/game-state.js";
import { checkTarget, pickableSquares } from "../../../src/state/skill-play.js";
import { REJECTED } from "../../../src/state/rejections.js";
import { pawnsAt } from "../../helpers/fixtures.js";

const trap = (kind, square) => ({ kind, square, owner: 2, until: null });

/** A four-seat state with some pawns placed and some objects down. */
function board({ pawns = pawnsAt(4), traps = [] } = {}) {
  return nextState(createGameState(4), { pawns, traps });
}

/** Absolute 5 is seat 0's `r = 6`, and no rule objects to it on an empty board. */
const FREE = 5;

const PLACEMENT_CARDS = [
  "action-banana-peel",
  "action-oil-spill",
  "action-not-that-deep",
  "action-big-ah-rock",
];

describe("the four cards that leave something standing on a square", () => {
  it("accept a free square", () => {
    for (const cardId of PLACEMENT_CARDS) {
      expect(checkTarget(board(), cardId, { square: FREE }, 0)).toBeNull();
    }
  });

  it("are refused on a square that already holds an object", () => {
    const state = board({ traps: [trap(TRAP_KIND.BANANA_PEEL, FREE)] });

    for (const cardId of PLACEMENT_CARDS) {
      expect(checkTarget(state, cardId, { square: FREE }, 0)).toBe(REJECTED.BAD_TARGET);
    }
  });

  it("are refused on a square a pawn is standing on", () => {
    const state = board({ pawns: pawnsAt(4, { "0.0": 6 }) });

    expect(checkTarget(state, "action-banana-peel", { square: FREE }, 0)).toBe(REJECTED.BAD_TARGET);
  });

  it("are refused on an entry square", () => {
    for (const square of EXCLUDED_SQUARES) {
      expect(checkTarget(board(), "action-banana-peel", { square }, 0)).toBe(REJECTED.BAD_TARGET);
    }
  });

  /**
   * Naming nothing is a prompt and naming the wrong thing is a mistake, and the player is told which.
   * That distinction predates this issue and has to survive the new target kind.
   */
  it("ask for a square when none was named at all", () => {
    expect(checkTarget(board(), "action-banana-peel", {}, 0)).toBe(REJECTED.NEEDS_TARGET);
  });

  it("still refuse a number that is not a square at all", () => {
    expect(checkTarget(board(), "action-banana-peel", { square: TRACK_LENGTH }, 0)).toBe(
      REJECTED.BAD_TARGET
    );
  });
});

describe("Janky RPG fires at a square and is not restricted", () => {
  /**
   * The distinction the whole `FREE_SQUARE` kind exists for. Aiming this card at a square that already
   * holds a trap, or that a pawn is standing on, is exactly what it is for, so it keeps `TRACK_SQUARE`
   * and keeps all forty squares.
   */
  it("accepts a square holding a trap, a square under a pawn, and an entry square", () => {
    const state = board({
      pawns: pawnsAt(4, { "0.0": 6 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 17)],
    });

    expect(checkTarget(state, "action-janky-rpg", { square: 17 }, 0)).toBeNull();
    expect(checkTarget(state, "action-janky-rpg", { square: FREE }, 0)).toBeNull();
    expect(checkTarget(state, "action-janky-rpg", { square: EXCLUDED_SQUARES[0] }, 0)).toBeNull();
  });
});

describe("the squares the picker is told to offer", () => {
  it("is all forty for Janky RPG and fewer for a placement card", () => {
    const state = board({ traps: [trap(TRAP_KIND.BANANA_PEEL, 17)] });

    expect(pickableSquares(state, "action-janky-rpg")).toHaveLength(TRACK_LENGTH);
    expect(pickableSquares(state, "action-banana-peel")).not.toContain(17);
  });

  /**
   * `null` rather than an empty list, so the caller can tell "this card wants no square" from "this card
   * wants a square and there is none left".
   */
  it("is null for a card that asks about no square at all", () => {
    expect(pickableSquares(board(), "action-angel-die")).toBeNull();
  });

  /**
   * The property that matters: the picker must never offer a square `checkTarget` would then refuse.
   * Checked across all forty for every square-targeting card rather than on one example.
   */
  it("never offers a square the rules would refuse", () => {
    const state = board({
      pawns: pawnsAt(4, { "0.0": 6, "2.0": 15 }),
      traps: [trap(TRAP_KIND.BANANA_PEEL, 17), trap(TRAP_KIND.BIG_AH_ROCK, 23)],
    });

    for (const cardId of [...PLACEMENT_CARDS, "action-janky-rpg"]) {
      const offered = pickableSquares(state, cardId);

      for (let square = 0; square < TRACK_LENGTH; square += 1) {
        const accepted = checkTarget(state, cardId, { square }, 0) === null;

        expect(offered.includes(square)).toBe(accepted);
      }
    }
  });
});
