/**
 * A pawn tells you what is stuck to it. Issue #94, requirement NFR-08.
 *
 * The playtest behind this: a tester tried to capture a pawn and could not, and read it as a bug on the
 * square. The pawn was protected by a card, the message strip said so, and the pawn itself said
 * nothing. Now a pawn carrying a status has a `title`, so pointing at it explains the refusal before
 * it happens.
 *
 * Lock In is the card used here because it writes two statuses at once (`locked` and `armoured`), so
 * one hover covers the join as well as the single case. `?stack=` puts it on top of the pool, and
 * `SEEDS.advancesEarly` gives seat 0 a pawn on the track on turn 1, which an own-pawn card needs.
 */

import { expect, test } from "@playwright/test";

import { SEEDS, boardState, chooseDiceCard, openMatch, playTurn } from "./helpers.js";
import { awaitCardInHand, pawnStatuses, skillHand } from "./trap-helpers.js";

/** Drive the match to seat 0's action phase on a turn where seat 0 has a pawn on the track. */
async function reachOwnPawnOnTrack(board) {
  for (let step = 0; step < 6; step += 1) {
    const { activePlayer, phase } = await boardState(board);
    const onTrack = await board
      .locator('.pawn[data-player="0"]')
      .evaluateAll((pawns) => pawns.some((p) => Number(p.getAttribute("data-r")) > 0));

    if (activePlayer === 0 && phase === "choose" && onTrack) {
      await chooseDiceCard(board);
      return (await boardState(board)).phase === "action";
    }
    await playTurn(board);
  }
  return false;
}

test("a locked pawn carries a title naming both of Lock In's statuses", async ({ page }) => {
  const board = await openMatch(page, SEEDS.advancesEarly, {
    fast: true,
    stack: ["action-lock-in"],
  });
  test.skip(
    !(await awaitCardInHand(board, "action-lock-in", playTurn)),
    "card never reached a hand"
  );
  test.skip(!(await reachOwnPawnOnTrack(board)), "seat 0 had no action phase with a track pawn");

  await skillHand(board).locator('.card[data-card-id="action-lock-in"]').first().click();
  await expect(board).toHaveAttribute("data-picking", "own-pawn");

  const target = board.locator('.pawn[data-pickable="true"]').first();
  const seat = await target.getAttribute("data-player");
  const index = await target.getAttribute("data-pawn");
  await target.click();

  const pawn = board.locator(`.pawn[data-player="${seat}"][data-pawn="${index}"]`);
  await expect(pawn).toHaveAttribute("data-statuses", /locked/);
  await expect(pawn).toHaveAttribute("title", /Locked in|Eingesperrt/);
  await expect(pawn).toHaveAttribute("title", /Armoured|Gepanzert/);

  const statuses = await pawnStatuses(board);
  expect(statuses[`${seat}.${index}`]).toEqual(expect.arrayContaining(["locked", "armoured"]));
});

test("a pawn carrying nothing has no title at all", async ({ page }) => {
  const board = await openMatch(page, SEEDS.advancesEarly);

  await expect(board.locator(".pawn[title]")).toHaveCount(0);
});
