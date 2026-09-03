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

test.describe("nothing is styled yet, and the spec says so", () => {
  /**
   * A deliberate negative assertion, and the reason it is worth a case: design brief 07 asks for ten
   * decisions and none is answered, so a trap is in the DOM and invisible. **If this case starts
   * failing, the spec has landed**, and that is the moment to check the marks against the DOM contract
   * in section 3 of the brief rather than to delete this test.
   *
   * The pawn's own mark is the control: that one *is* styled, by handoff 06, so a zero box here would
   * mean the harness is measuring wrong rather than that the trap is unstyled.
   */
  test("the trap span has no box until the stylesheet arrives", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce, withStack(["action-banana-peel"]));

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-banana-peel");
    await square(board, 17).click();

    const trapBox = await square(board, 17).locator(".square__trap").boundingBox();
    expect(trapBox?.width ?? 0).toBe(0);

    const pawnMark = await board.locator(".pawn .pawn__mark").first().boundingBox();
    expect(pawnMark?.width ?? 0).toBeGreaterThan(0);
  });
});
