/**
 * Laying a trap, seeing it, and having one go off. Issue #45, requirement FR-30.
 *
 * The first end-to-end coverage of a card that changes the board. `skill-hand.spec.js` covers playing a
 * card as a gesture; this covers a card whose whole effect is a thing left standing on a field that
 * somebody else walks into two turns later.
 *
 * ## Nothing here looks at a pixel, and that is the point
 *
 * Design brief 07 is out and unanswered, so `board.css` has no rule for `[data-trap]` and a trap is
 * invisible. Every attribute a player will eventually see is in the DOM today, so the whole mechanic is
 * assertable now and the spec does not have to be rewritten when the stylesheet lands. That is the same
 * bargain `data-skill-square` made while D27 was open.
 *
 * The one exception is the announcement, which is text and not a look, so it is asserted as text.
 *
 * ## Why `?stack=` exists
 *
 * A trap card is 4 ids out of 29 and the flow needs two turns to line up: one to lay the trap and
 * another for a foreign pawn to walk over it. `skill-hand.spec.js` handles the odds by asserting the
 * mechanism and skipping when the shuffle produced something else, which cannot work for a two-turn
 * sequence. Pinning a seed is worse: `scripts/find-seeds.js` never plays a card, so it cannot search
 * for one. `?stack=` puts named cards on top of the pool and changes no rule. `src/main.js` has the
 * reasoning in full.
 */

import { expect, test } from "@playwright/test";

import {
  SEEDS,
  boardState,
  chooseDiceCard,
  openMatch,
  pawnPositions,
  playTurn,
} from "./helpers.js";
import {
  awaitCardInHand,
  objectsOnBoard,
  pawnStatuses,
  pickableSquares,
  playCardAndAwaitSquare,
  skillHand,
  square,
  trackSquares,
} from "./trap-helpers.js";

/** The four fields where a seat enters the ring. Never a legal place for an object. */
const ENTRY_SQUARES = [0, 10, 20, 30];

const withStack = (stack) => ({ fast: true, stack });

test.describe("laying a trap", () => {
  /**
   * FR-30's placement rule, and the cheapest possible check that the picker asks `core/` rather than
   * lighting everything up. It used to mark all forty fields.
   *
   * 36 rather than 40, because the four entry squares are excluded and nothing else is in the way on
   * turn 1: every pawn is still in a yard, so no field is occupied and no object is down yet.
   */
  test("offers only the fields an object may go on (FR-30)", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce, withStack(["action-banana-peel"]));

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-banana-peel");

    await expect(trackSquares(board)).toHaveCount(40);
    await expect(pickableSquares(board)).toHaveCount(36);

    for (const entry of ENTRY_SQUARES) {
      await expect(square(board, entry)).not.toHaveAttribute("data-pickable", "true");
    }
  });

  /** The object is on the field afterwards, and it says whose it is. */
  test("puts the object on the field, with its owner", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce, withStack(["action-banana-peel"]));

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-banana-peel");
    await square(board, 17).click();

    await expect(square(board, 17)).toHaveAttribute("data-trap", "trap");
    await expect(square(board, 17)).toHaveAttribute("data-trap-kind", "banana-peel");
    await expect(square(board, 17).locator(".square__trap")).toHaveAttribute("data-player", "0");
  });

  /**
   * A blocker reads differently from a trap in the DOM, which is what design decision D52 will key
   * off. Both are entries in one list in `core/`, and `data-trap` is the coarse behaviour.
   */
  test("marks a blocker as a blocker and not as a trap", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce, withStack(["action-big-ah-rock"]));

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-big-ah-rock");
    await square(board, 17).click();

    await expect(square(board, 17)).toHaveAttribute("data-trap", "blocker");
    await expect(square(board, 17)).toHaveAttribute("data-trap-kind", "big-ah-rock");
  });

  /**
   * The destructive case the placement rule exists for. Before issue #45 laying a trap on a field that
   * already held one silently deleted the first, which no card in the set is supposed to be able to do.
   */
  test("does not offer a field that already holds an object", async ({ page }) => {
    test.slow();

    // **Two copies of the same card, and that is not laziness.** `?stack=` replaces the pool rather
    // than prepending to it, and `drawSkillCard` picks a **random** eligible card out of what is there.
    // So a stack of two different ids makes the first draw a coin flip, while two copies of one id make
    // it certain. Two copies is also what the real pool holds of every card (`COPIES_PER_CARD`).
    const board = await openMatch(
      page,
      SEEDS.leavesStartAtOnce,
      withStack(["action-banana-peel", "action-banana-peel"])
    );

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-banana-peel");
    await square(board, 17).click();
    await expect(square(board, 17)).toHaveAttribute("data-trap-kind", "banana-peel");

    // Whoever draws the second copy is a fact about the turn order, so the spec waits for a hand that
    // holds one rather than assuming it is the next seat.
    const found = await awaitCardInHand(board, "action-banana-peel", playTurn);
    expect(found).toBe(true);

    if ((await boardState(board)).phase === "choose") await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-banana-peel");

    await expect(square(board, 17)).not.toHaveAttribute("data-pickable", "true");
    await expect(square(board, 17)).toHaveAttribute("data-trap-kind", "banana-peel");
  });

  /**
   * Janky RPG also points at a field and must keep every one of the forty, because it fires **at** a
   * field rather than occupying one. Aiming it at an occupied field is the whole point of the card, so
   * this is the case that proves the restriction is per card and not per target kind.
   */
  test("still offers all forty fields to Janky RPG", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce, withStack(["action-janky-rpg"]));

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-janky-rpg", "track-square");

    await expect(pickableSquares(board)).toHaveCount(40);
  });
});

test.describe("every player can see every trap", () => {
  /**
   * The Product Owner's binding decision. It is also the case that would catch a future "hide it from
   * the others" regression, which the Game Design Document's own "face-down trap" wording invites.
   *
   * The turn passing is what makes it a real check rather than a re-read of the same render.
   * `markTraps` rewrites the attribute on all forty fields on **every** board update, so a mark that
   * was only written for the laying seat would be gone once another seat is active.
   */
  test("the object is still there once another seat is on turn", async ({ page }) => {
    test.slow();

    const board = await openMatch(page, SEEDS.leavesStartAtOnce, withStack(["action-banana-peel"]));

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-banana-peel");
    await square(board, 17).click();

    await playTurn(board);
    await expect(board).not.toHaveAttribute("data-active-player", "0");

    expect(await objectsOnBoard(board)).toMatchObject({
      17: { behaviour: "trap", kind: "banana-peel", owner: 0 },
    });
  });
});

test.describe("a field can be picked from the keyboard (NFR-08)", () => {
  /**
   * A new capability rather than a regression check. **No field on the board was reachable from the
   * keyboard at all** before this issue: `bindPickEvents` bound `click` and no `keydown`, and nothing
   * gave a field a `tabindex`. That was survivable while one card in 29 pointed at a field, and four of
   * the five that do are the trap cards, so a keyboard player could not have played a trap.
   */
  test("lays a trap with Enter alone", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce, withStack(["action-banana-peel"]));

    await chooseDiceCard(board);

    // The card is reached with the keyboard too, so the whole gesture is keyboard-only.
    await skillHand(board).locator('.card[data-card-id="action-banana-peel"]').first().focus();
    await page.keyboard.press("Enter");
    await expect(board).toHaveAttribute("data-picking", "free-square");

    await square(board, 17).focus();
    await page.keyboard.press("Enter");

    await expect(square(board, 17)).toHaveAttribute("data-trap-kind", "banana-peel");
  });

  /**
   * A field is in the tab order only while it is an answer to a question. Forty permanent tab stops on
   * the board would sit between a keyboard player and every control on the page, which is the defect
   * design spec 05 found on the pool overview.
   */
  test("takes the fields back out of the tab order afterwards", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce, withStack(["action-banana-peel"]));

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-banana-peel");
    await expect(board.locator(".square--track[tabindex]")).toHaveCount(36);

    await square(board, 17).click();
    await expect(board.locator(".square--track[tabindex]")).toHaveCount(0);
  });
});

test.describe("the board keeps its shape", () => {
  /** Forty fields, forty spans, built once with the board and never re-created (D10). */
  test("every track field carries an empty trap span", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    await expect(trackSquares(board)).toHaveCount(40);
    await expect(trackSquares(board).locator(".square__trap")).toHaveCount(40);
    await expect(board.locator("[data-trap]")).toHaveCount(0);
  });

  /** No pawn carries a status on turn 1, so the attribute is absent rather than empty. */
  test("carries no status attribute before anything has happened", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);

    expect(await pawnStatuses(board)).toEqual({});
    expect(await pawnPositions(board)).toBeTruthy();
  });
});
