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
 * match the seats are 0 and 2, because `seatsFor` sits two players opposite each other.
 *
 * **The winner's name is built from the locale file rather than typed out**, since issue #39. The message
 * used to be pinned as the literal "Spieler 3 hat gewonnen", which encoded two things a test should not
 * own: the German wording, and the old seat-plus-one numbering that made a two-player match have no
 * Spieler 2. Filling the real templates means this assertion still checks the numbering, and a reworded
 * sentence changes one JSON file rather than breaking a test.
 *
 * **Where the message is read from changed on 2026-09-01**, when design spec 04 answered D40. It used to
 * be the refusal strip under the board and it is now the win overlay, because the strip is orange and
 * orange means the game refused something. The wording assertion is the same one; only the element it is
 * made against moved, and this spec now also checks that the strip is left empty.
 */

import { expect, test } from "@playwright/test";

import { HOME_R, TRACK_LENGTH, seatsFor } from "../../src/core/board.js";
import de from "../../src/i18n/locales/de/ui.json" with { type: "json" };
import { SEEDS, boardState, openMatch, pawnPositions, playUntil } from "./helpers.js";

/** The winner's label, composed the way `player-labels.js` composes it, out of the real locale file. */
function wonMessage(seat) {
  const player = de.player.named
    .replace("{{number}}", String(seatsFor(2).indexOf(seat) + 1))
    .replace("{{colour}}", de.player.colour[seat]);

  return de.match.won.replace("{{player}}", player);
}

/**
 * A whole match, played click by click, is the most expensive kind of test in this suite.
 *
 * Measured on 2026-09-01: 1.1 to 1.3 minutes each when the three browser projects run with three
 * workers. `test.slow()` triples the default 30 seconds to 90, which was enough while the suite was
 * smaller and is not any more: at Playwright's default worker count, half of sixteen cores, eight
 * browsers each playing a 77-turn match pushed these two past 90 seconds and the run reported four
 * failures that were purely contention.
 *
 * Four minutes is deliberately generous. The alternative was pinning `workers` in
 * `playwright.config.js`, which would have slowed all 177 tests to fix two.
 */
const FULL_MATCH_TIMEOUT_MS = 240_000;

test.describe("winning a match", () => {
  test.setTimeout(FULL_MATCH_TIMEOUT_MS);

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

    // **The overlay says it and the strip says nothing**, which is D40 of design spec 04 and a change
    // from what this test asserted before 2026-09-01. The strip is `--color-warn` orange, the colour the
    // game reserves for "you cannot do that", and announcing a win in it was a recorded defect. The
    // sentence itself is unchanged, so this still checks the seat numbering it was written to check.
    const overlay = page.locator(".overlay");

    await expect(overlay).toHaveAttribute("data-screen", "win");
    await expect(overlay).toHaveAttribute("data-outcome", "won");
    await expect(overlay).toHaveAttribute("data-player", String(winner));
    await expect(overlay.locator(".overlay__title")).toHaveText(wonMessage(winner));

    const message = page.locator(".move-refusal");
    await expect(message).toHaveText("");
    await expect(message).not.toHaveAttribute("data-message-kind", /.*/);

    // The numbering itself, stated so a regression is readable: seats 0 and 2 are players 1 and 2.
    // Before issue #39 a win by seat 2 announced "Spieler 3" and there was no Spieler 2 at the table.
    expect(wonMessage(2)).toContain("Spieler 2");

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
