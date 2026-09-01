/**
 * Landing on an opponent sends that pawn back to its start area. Requirement FR-11.
 *
 * Seed 120 with two players captures on turn 11, found by replaying the match headlessly with the
 * same lowest-movable-pawn policy these helpers use.
 *
 * The capture is detected by watching the positions rather than by watching for `data-captured`.
 * That attribute is transient by design: `board-view.js` clears it once the return animation has
 * run, so waiting for it would be a race. A pawn going from somewhere on the track back to `r = 0`
 * is the rule itself and is not transient at all.
 */

import { expect, test } from "@playwright/test";

import { absoluteSquare } from "../../src/core/board.js";
import { SEEDS, boardState, openMatch, pawnPositions, playTurn } from "./helpers.js";

/** Play until one pawn is sent home, and report who did it to whom. */
async function playUntilCapture(board, maxTurns = 60) {
  let before = await pawnPositions(board);

  for (let turn = 0; turn < maxTurns; turn += 1) {
    const { status, activePlayer } = await boardState(board);
    if (status !== "running") break;

    // `playTurn` picks a dice card, moves a pawn if one can move, and returns only once the turn
    // number has moved on. So the positions read below are the ones this turn produced and not a
    // snapshot taken halfway through it. A turn nobody can move in changes no position, which is why
    // it needs no branch of its own here.
    await playTurn(board);

    const after = await pawnPositions(board);
    const sentHome = Object.keys(after).filter((id) => before[id] > 0 && after[id] === 0);

    if (sentHome.length > 0) {
      const advanced = Object.keys(after).filter((id) => after[id] > before[id]);
      return {
        capturedId: sentHome[0],
        capturedFrom: before[sentHome[0]],
        moverId: advanced[0],
        moverTo: after[advanced[0]],
        activePlayer,
      };
    }

    before = after;
  }

  throw new Error(`no capture happened within ${maxTurns} turns`);
}

test.describe("capture", () => {
  test("sends the captured pawn back to its start area and gives the square to the mover", async ({
    page,
  }) => {
    const board = await openMatch(page, SEEDS.capturesEarly);
    const capture = await playUntilCapture(board);

    const [capturedSeat] = capture.capturedId.split(".").map(Number);
    const [moverSeat] = capture.moverId.split(".").map(Number);

    // The two pawns belong to different players. FR-11 is about opponents, and a player landing on
    // their own pawn is refused by FR-12 rather than resolved as a capture.
    expect(moverSeat).not.toBe(capturedSeat);
    expect(moverSeat).toBe(capture.activePlayer);

    // Exactly one pawn was sent back, and it went to r = 0.
    const positions = await pawnPositions(board);
    expect(positions[capture.capturedId]).toBe(0);

    // The mover is standing on the square the captured pawn was standing on. Both are converted to
    // absolute track squares first, because two pawns of different players count from different
    // starting points and their relative positions are not comparable.
    expect(absoluteSquare(moverSeat, capture.moverTo)).toBe(
      absoluteSquare(capturedSeat, capture.capturedFrom)
    );
  });

  test("puts the captured pawn back in its own yard, not somebody else's", async ({ page }) => {
    const board = await openMatch(page, SEEDS.capturesEarly);
    const capture = await playUntilCapture(board);
    const [capturedSeat, capturedIndex] = capture.capturedId.split(".").map(Number);

    // Polled rather than measured once. The captured pawn does not jump back to its yard, it
    // travels there over `--motion-capture` (D8), so a single reading taken the moment the turn ends
    // catches it somewhere along the way. Waiting for it to arrive is also the only way this test
    // says anything about the animation actually finishing where it was supposed to.
    await expect
      .poll(
        async () =>
          board.evaluate(
            (element, { seat, index }) => {
              const pawn = element.querySelector(
                `.pawn[data-player="${seat}"][data-pawn="${index}"]`
              );
              const slot = element.querySelector(
                `.start-area[data-player="${seat}"] .slot[data-slot="${index}"]`
              );

              const a = pawn.getBoundingClientRect();
              const b = slot.getBoundingClientRect();
              return (
                Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2) < 2 &&
                Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2) < 2
              );
            },
            { seat: capturedSeat, index: capturedIndex }
          ),
        { timeout: 5000 }
      )
      .toBe(true);
  });
});
