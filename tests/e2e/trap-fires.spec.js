/**
 * A trap going off, and what the player is told. Issue #45, requirement FR-30.
 *
 * Split from `traps.spec.js`, which reached the 300-line NFR-02 limit. The seam is a real one: that file
 * covers **laying** an object and seeing it, which is one turn and one click, and this covers a trap
 * **firing**, which takes a match played until somebody walks into it.
 *
 * ## Why these cases cannot use the driving helpers
 *
 * The announcement is a turn-level field, so it is wiped when the turn passes. `playTurn` and
 * `playUntil` both wait past the turn before handing control back, so by the time either returns the
 * message is gone. `playUntilTrapFires` in `trap-helpers.js` drives the phases itself and reads the
 * strip straight after the move, which is the one moment the message exists.
 *
 * That is also why this is the hardest thing the suite asserts so far: under the new rules Banana Peel
 * does not move the pawn. Proving it happened means proving something about a board that looks exactly
 * like a board where nothing happened.
 */

import { expect, test } from "@playwright/test";

import { SEEDS, chooseDiceCard, openMatch } from "./helpers.js";
import {
  chipRatio,
  pawnStatuses,
  playCardAndAwaitSquare,
  playUntilTrapFires,
  square,
} from "./trap-helpers.js";

const withStack = (stack) => ({ fast: true, stack });

test.describe("a trap going off", () => {
  /**
   * The hardest assertion in the suite so far: proving that something happened when **nothing moved**.
   *
   * Under the new rules Banana Peel does not move the pawn. It applies a status, so the pawn arrives
   * exactly where it was aimed and the trap is removed from the list. Three things have to be true
   * together for that to be visible at all: the object is gone from the field, the pawn carries
   * `stunned`, and the strip says so in real words.
   *
   * The trap is laid on seat 1's entry-adjacent stretch and then turns are played until it fires. Which
   * turn that is depends on the rolls, so the spec waits for the outcome rather than counting turns.
   */
  test("clears the object, stuns the pawn and says so", async ({ page }) => {
    test.slow();

    // **A two-player match, and the seed choice is the whole difficulty of this case.** A trap never
    // fires under its own owner's pawn, so the layer and the victim have to be different seats, which
    // means the spec needs a match where a *second* seat has a pawn on the track and keeps moving it.
    // With four players that is three other seats each waiting for the die's maximum to leave the yard,
    // and 60 turns went by without one of them crossing the trap. Two players halves the turn cycle and
    // `capturesEarly` is the seed where both seats are on the track by turn 4.
    const board = await openMatch(page, SEEDS.capturesEarly, withStack(["action-banana-peel"]));

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-banana-peel");

    // Two players sit on seats 0 and 2, which enter the ring at absolute 0 and 20. Seat 0 lays the trap
    // three squares past seat 2's entry square, so the first pawn seat 2 walks up the track crosses it.
    await square(board, 23).click();
    await expect(square(board, 23)).toHaveAttribute("data-trap-kind", "banana-peel");

    // Not `playUntil`: the announcement is a turn-level field, so it is wiped when the turn passes,
    // and every driving helper waits past the turn before handing control back. `playUntilTrapFires`
    // drives the phases itself and reads the strip straight after the move, which is the one moment
    // the message exists. Its header carries the argument.
    const announced = await playUntilTrapFires(board);

    // A match that ends before anybody walks over the trap is a property of the seed rather than a
    // failure of the mechanic, so the spec says which happened instead of asserting into a bare board.
    test.skip(announced === null, "the match ended before a pawn reached the trap");

    // The pawn did **not** move, which is the whole reason the announcement exists: under the new rules
    // Banana Peel applies a status, so without the message the pawn arrives exactly where it was aimed
    // and then silently cannot move next turn.
    expect(announced.key).toBe("trap.fired.banana-peel");
    expect(announced.kind).toBe("trap");

    // NFR-03: a translated sentence and never a raw key. The rules produced `trap.fired.banana-peel`
    // and knew no language at all.
    expect(announced.text).not.toContain("trap.fired");
    expect(announced.text.length).toBeGreaterThan(10);

    // The durable half, read after the fact: the object is used up and the pawn carries the status.
    await expect(square(board, 23)).not.toHaveAttribute("data-trap", "trap");

    const stunned = Object.entries(await pawnStatuses(board)).filter(([, kinds]) =>
      kinds.includes("stunned")
    );

    expect(stunned).toHaveLength(1);
  });
});

test.describe("the one-screen layout (FR-31)", () => {
  /**
   * The same check `skill-hand.spec.js` makes for the prompt strip, repeated for a strip that now
   * appears at a different moment in the turn. A message that pushed the page taller than the window
   * would break FR-31 exactly when the player is being told something.
   */
  test("the announcement does not make the page scroll", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce, withStack(["action-banana-peel"]));

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-banana-peel");
    await square(board, 12).click();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight
    );

    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("the object standing on a field", () => {
  /**
   * **This case used to be a deliberate negative and it did its job.**
   *
   * It asserted that `.square__trap` had a box of exactly zero, because design brief 07 was out with ten
   * unanswered decisions and a trap was in the DOM and invisible. Its own comment said that if the case
   * ever started failing, the spec had landed and the right move was to check the marks against the DOM
   * contract rather than to delete the test. Handoff 07 landed on 2026-09-03, the case went red on the
   * first run after it, and this is that check.
   *
   * A box proves something painted. The **ratio** proves it is the 30 per cent chip D51 specified rather
   * than merely something, and it is a ratio and not a pixel count so that it survives a change to
   * `--board-size`.
   *
   * **There were two more assertions here until 2026-09-05.** One read the `clip-path` off
   * `.square__trap::before` and proved the owner's seat shape was inside the chip; the other measured
   * `.pawn__mark` as a control. Design handoff 16 (D97) withdrew the seat shapes across the whole game,
   * so the chip is a dot in the owner's colour and the pawn has no mark at all. Both facts are gone on
   * purpose and the assertions were deleted rather than rewritten, for the reason `greyscale.spec.js`
   * gives: a dot is a dot on all four seats. What NFR-12 rests on now, and what it costs, is § 4 of
   * `16-spec-seat-dots-and-message-strip.md`.
   */
  test("draws the trap as a chip in its owner's colour", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce, withStack(["action-banana-peel"]));

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-banana-peel");
    await square(board, 17).click();

    const field = square(board, 17);

    // **Polled and not measured once, and the reason is worth knowing.** The chip is at `scale: 0.4`
    // and `opacity: 0` until its field carries `[data-trap]`, and it grows in over `--motion-capture`
    // (D55). A single measurement taken right after the click reads the *start* of that transition, so
    // the first version of this case measured 0.12 of the field and looked like a broken stylesheet.
    await expect.poll(() => chipRatio(field)).toBeGreaterThan(0.2);
    expect(await chipRatio(field)).toBeLessThan(0.4);
  });

  /**
   * D52's whole message is the size difference, so the size difference is what this asserts.
   *
   * A trap is a small thing lying on a path and a blocker is the path being gone: 30 per cent of the
   * field against 76. The second variable is the corner, square instead of round, and it is worth
   * asserting too because it is the one that stops a 76 per cent chip reading as a large trap.
   *
   * Both objects are laid in one match so the comparison is against a real chip on the same board at the
   * same board size, rather than against a number copied out of the spec.
   */
  test("draws a blocker as a wall rather than as a large trap", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce, withStack(["action-big-ah-rock"]));

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-big-ah-rock");
    await square(board, 17).click();

    await expect(square(board, 17)).toHaveAttribute("data-trap", "blocker");

    const field = square(board, 17);

    // The size is the message. A trap covers 30 per cent of the field, asserted in the case above on
    // this same viewport; a blocker covers 76, which is the field being gone rather than an object
    // lying on it. Anything over 0.6 is a wall and anything under 0.4 is a chip, so the two cases
    // cannot pass each other's assertion by accident. Polled for the same reason as the trap chip.
    await expect.poll(() => chipRatio(field)).toBeGreaterThan(0.6);

    // The second variable, and the one that stops a large chip reading as a large trap: a squared
    // corner. Asserted against the object's own width rather than against a token value, because a
    // pill radius is by definition at least half the box and a squared one is well under it.
    const chip = await field.locator(".square__trap").boundingBox();
    const radius = await field
      .locator(".square__trap")
      .evaluate((span) => Number.parseFloat(window.getComputedStyle(span).borderTopLeftRadius));
    expect(radius).toBeLessThan((chip?.width ?? 0) / 2);
  });
});
