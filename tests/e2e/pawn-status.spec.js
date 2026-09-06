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

import { SEEDS, openMatch, playTurn } from "./helpers.js";
import { awaitCardInHand, pawnStatuses, reachOwnPawnOnTrack, skillHand } from "./trap-helpers.js";

test("a locked pawn carries a title naming both of Lock In's statuses", async ({ page }) => {
  const board = await openMatch(page, SEEDS.advancesEarly, {
    fast: true,
    stack: ["action-lock-in"],
  });
  test.skip(
    !(await awaitCardInHand(board, "action-lock-in", playTurn)),
    "card never reached a hand"
  );
  test.skip(
    !(await reachOwnPawnOnTrack(board, playTurn)),
    "seat 0 had no action phase with a track pawn"
  );

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

test("a locked pawn wears two marks, the tag and the shell (D101)", async ({ page }) => {
  const board = await openMatch(page, SEEDS.advancesEarly, {
    fast: true,
    stack: ["action-lock-in"],
  });
  test.skip(
    !(await awaitCardInHand(board, "action-lock-in", playTurn)),
    "card never reached a hand"
  );
  test.skip(
    !(await reachOwnPawnOnTrack(board, playTurn)),
    "seat 0 had no action phase with a track pawn"
  );

  await skillHand(board).locator('.card[data-card-id="action-lock-in"]').first().click();
  await board.locator('.pawn[data-pickable="true"]').first().click();

  const pawn = board.locator('.pawn[data-statuses~="locked"]').first();
  await expect(pawn).toHaveAttribute("data-statuses", /armoured/);

  // Two channels, one play. Lock In writes `locked` and `armoured` together, and design spec 17 draws
  // them in two places on purpose: the shell is for the player who wants to capture the pawn, the tag
  // is for its owner, who cannot move it. This is the playtest finding as one case.
  //
  // The two marks are asked about by the property that carries them and not by their geometry. An
  // `inset` or an `outline-offset` would report the next design adjustment as a defect (17-spec § 5.4),
  // while "the tag is shown" and "the disc has an outline" are what the marks *are*.
  const marks = () =>
    pawn.evaluate((element) => ({
      tag: window.getComputedStyle(element.querySelector(".pawn__status")).opacity,
      shell: window.getComputedStyle(element, "::after").outlineStyle,
    }));

  // Polled rather than read once, for the reason `chipRatio` in `trap-helpers.js` carries in a comment:
  // the tag arrives over --motion-feedback, so a measurement taken straight after the click reads the
  // beginning of the transition rather than the state.
  await expect.poll(async () => Number((await marks()).tag)).toBe(1);
  expect((await marks()).shell).toBe("solid");
});

test("a pawn carrying nothing has no title at all", async ({ page }) => {
  const board = await openMatch(page, SEEDS.advancesEarly);

  await expect(board.locator(".pawn[title]")).toHaveCount(0);
});
