/**
 * A full match, played from the start area to a filled house. Requirement FR-05, and the second half
 * of acceptance criterion SG1 in `SMART-Analysis.md`.
 *
 * This is the test that makes the slice a vertical one rather than a demo. It plays a complete
 * two-player match through the real interface, clicking pawns, and stops when somebody has won.
 *
 * The seed is the quickest win `npm run test:seeds` found while searching seeds 1 to 400. Every act
 * turn is two clicks, so the run is a few hundred interactions and needs a raised timeout; that is the
 * honest cost of testing a whole match instead of asserting a state object.
 *
 * **This spec does not name the winning seat.** It used to, and it was wrong twice in one week: which
 * seat wins is a property of the seed, and the seeds were regenerated for issue #30 and again for
 * issue #38. So the spec reads the winner off `data-winner` and asserts the rule instead, that the
 * winner's four pawns fill the four house squares and the message names that seat. In a two-player
 * match the seats are 0 and 2, because `seatsFor` sits two players opposite each other, and the seat
 * numbering is why the message for seat 2 reads "Spieler 3".
 */

import { expect, test } from "@playwright/test";

import { HOME_R, TRACK_LENGTH } from "../../src/core/board.js";
import { SEEDS, boardState, openMatch, pawnPositions, playUntil } from "./helpers.js";

test.describe("winning a match", () => {
  test.slow();

  test("ends the match when one player's four pawns fill their house, and names the winner", async ({
    page,
  }) => {
    const board = await openMatch(page, SEEDS.winsQuickest);

    await playUntil(board, async () => (await boardState(board)).status !== "running");

    await expect(board).toHaveAttribute("data-status", "won");
    await expect(board).toHaveAttribute("data-phase", "match-over");

    // Read the winner rather than assuming one: seats in a two-player match are 0 and 2, and which of
    // them fills its house first is decided by the seed.
    const winner = Number(await board.getAttribute("data-winner"));
    expect([0, 2]).toContain(winner);

    const message = page.locator(".move-refusal");
    await expect(message).toHaveAttribute("data-message-kind", "win");
    await expect(message).toHaveText(`Spieler ${winner + 1} hat gewonnen`);

    const positions = await pawnPositions(board);
    const winnerPositions = [0, 1, 2, 3]
      .map((index) => positions[`${winner}.${index}`])
      .sort((a, b) => a - b);

    // A full house is one pawn on each of the four house squares. Not four pawns on one square:
    // there is no shared home area, so this is the only arrangement that can win.
    expect(winnerPositions).toEqual([41, 42, 43, HOME_R]);
    for (const r of winnerPositions) expect(r).toBeGreaterThan(TRACK_LENGTH);
  });

  test("stops accepting clicks once it is over", async ({ page }) => {
    const board = await openMatch(page, SEEDS.winsQuickest);

    await playUntil(board, async () => (await boardState(board)).status !== "running");

    await expect(board.locator('.pawn[data-movable="true"]')).toHaveCount(0);
    await expect(board.locator('.square[data-legal-target="true"]')).toHaveCount(0);

    const positions = await pawnPositions(board);
    await board.locator(".pawn").first().click({ force: true });
    expect(await pawnPositions(board)).toEqual(positions);
  });
});
