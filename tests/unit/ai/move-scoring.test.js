import { describe, expect, it } from "vitest";

import { HOME_R } from "../../../src/core/board.js";
import { MOVE_KIND } from "../../../src/core/move-rules.js";
import { SCORE, bestMove, scoreMove } from "../../../src/ai/move-scoring.js";

/**
 * A move as `core/movement.js` builds one. Written out by hand rather than produced by
 * `evaluateTurn`, because these tests are about the *ranking* and not about the rules: a literal
 * `{ from: 39, to: 42 }` says "this move enters the house" in a way that a board setup does not.
 */
function move(fields) {
  return { player: 0, pawn: 0, kind: MOVE_KIND.ADVANCE, captures: null, ...fields };
}

/** Four pawns of player 1, wherever the test needs them. Only ever read for a capture's victim. */
function victims(positions) {
  return positions.map((r, pawn) => ({ player: 1, pawn, r }));
}

describe("scoreMove: the five categories, in order (FR-43)", () => {
  const pawns = victims([37, 5, 0, 0]);

  const finish = move({ from: 41, to: HOME_R });
  const capture = move({ from: 10, to: 15, captures: { player: 1, pawn: 1 } });
  const enterHome = move({ from: 39, to: 42 });
  const leaveStart = move({ from: 0, to: 1, kind: MOVE_KIND.LEAVE_START });
  const advance = move({ from: 10, to: 30 });

  it("scores each category on its own number", () => {
    expect(scoreMove(finish, pawns)).toBe(SCORE.FINISH);
    expect(scoreMove(enterHome, pawns)).toBe(SCORE.ENTER_HOME);
    expect(scoreMove(leaveStart, pawns)).toBe(SCORE.LEAVE_START);
    expect(scoreMove(advance, pawns)).toBe(20 * SCORE.ADVANCE_PER_STEP);
  });

  it("ranks finish > capture > enter-home > leave-start > advance", () => {
    const ranked = [finish, capture, enterHome, leaveStart, advance].map((entry) =>
      scoreMove(entry, pawns)
    );

    for (let index = 1; index < ranked.length; index += 1) {
      expect(
        ranked[index - 1],
        `category ${index} outscores category ${index + 1}`
      ).toBeGreaterThan(ranked[index]);
    }
  });

  it("keeps the twenty-step walk below leaving the start area", () => {
    // The reason `LEAVE_START` is 25 and not 15. Twenty is the biggest an advance can ever be,
    // because D20 is the largest card in the pool.
    expect(scoreMove(advance, pawns)).toBeLessThan(SCORE.LEAVE_START);
  });
});

describe("scoreMove: a capture is worth what it costs the opponent", () => {
  it("prefers sending a pawn back from far away to sending one back from near home", () => {
    const pawns = victims([38, 3, 0, 0]);
    const far = move({ from: 10, to: 15, captures: { player: 1, pawn: 0 } });
    const near = move({ from: 10, to: 15, captures: { player: 1, pawn: 1 } });

    expect(scoreMove(far, pawns)).toBe(SCORE.CAPTURE + 38 * SCORE.CAPTURE_PER_STEP);
    expect(scoreMove(near, pawns)).toBe(SCORE.CAPTURE + 3 * SCORE.CAPTURE_PER_STEP);
    expect(scoreMove(far, pawns)).toBeGreaterThan(scoreMove(near, pawns));
  });

  it("counts a capture made while leaving the start area as a capture", () => {
    // Landing on your own entry square can take an opponent with it. The higher category wins, so
    // this is worth more than the flat 25 of an ordinary exit.
    const pawns = victims([12, 0, 0, 0]);
    const exit = move({
      from: 0,
      to: 1,
      kind: MOVE_KIND.LEAVE_START,
      captures: { player: 1, pawn: 0 },
    });

    expect(scoreMove(exit, pawns)).toBe(SCORE.CAPTURE + 12 * SCORE.CAPTURE_PER_STEP);
  });
});

describe("bestMove", () => {
  const pawns = victims([20, 0, 0, 0]);

  it("returns null for an empty list", () => {
    expect(bestMove([], pawns)).toBeNull();
  });

  it("picks the highest score and reports it", () => {
    const walk = move({ pawn: 0, from: 5, to: 9 });
    const home = move({ pawn: 1, from: 39, to: 41 });

    expect(bestMove([walk, home], pawns)).toEqual({ move: home, score: SCORE.ENTER_HOME });
  });

  it("breaks a tie towards the pawn that has got further", () => {
    // Two identical four-step walks. Concentrating on the leading pawn brings one pawn home;
    // spreading the steps evenly brings none.
    const behind = move({ pawn: 0, from: 5, to: 9 });
    const ahead = move({ pawn: 1, from: 25, to: 29 });

    expect(bestMove([behind, ahead], pawns).move).toBe(ahead);
    expect(bestMove([ahead, behind], pawns).move).toBe(ahead);
  });

  it("breaks a remaining tie towards the lower pawn index, whatever the list order", () => {
    // Nothing about play depends on this. Repeatability does: without it the bot's choice would
    // depend on the order `evaluateTurn` happened to return, and a bug report could not be reproduced.
    const second = move({ pawn: 2, from: 5, to: 9 });
    const first = move({ pawn: 1, from: 5, to: 9 });

    expect(bestMove([second, first], pawns).move).toBe(first);
    expect(bestMove([first, second], pawns).move).toBe(first);
  });
});
