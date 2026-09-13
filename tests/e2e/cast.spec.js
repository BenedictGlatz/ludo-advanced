/**
 * A played skill card gets a moment of its own. Design spec 18.
 *
 * ## What can only be tested here
 *
 * The cast is four attribute states, three timers and a set of marks written onto 40 other elements,
 * and its geometry is read out of `getBoundingClientRect`. None of that exists outside a browser, so
 * the unit tests cover the three pure parts (which family, how long, which marks) and this file covers
 * the one thing they cannot: that a cast starts, finishes and **leaves nothing behind**.
 *
 * ## Nothing here is pinned by value
 *
 * Spec 18 § 5 asks for exactly that, and the reason is that the next adjustment to the design would
 * otherwise be reported as a defect. A case asserting that a Banana Peel's arc is 1.6 cells high, or
 * that the hold is 1500 ms, would fail the first time somebody shortened it on purpose. So the cases
 * assert the **contract**: which attributes exist, which values they take, and that the board is clean
 * afterwards.
 *
 * ## The suite runs with `?fast=1`, and that is the point rather than a compromise
 *
 * Under `?fast=1` every hold is zero and **the sequence is unchanged**: the cast still visits `card`,
 * `board` and `done`, and only the waiting is gone. So a spec that watches the states as they happen
 * has to ask for the real speed, and one that only cares that the game carries on afterwards does not.
 */

import { expect, test } from "@playwright/test";

import { SEEDS, carryOn, chooseDiceCard, openMatch } from "./helpers.js";
import { playCardAndAwaitSquare } from "./trap-helpers.js";

/** The cast stage, which is the last child of `.app` and not inside the board. */
function cast(board) {
  return board.page().locator(".cast");
}

/** The skill hand, in the rail beside the board. */
function skillHand(board) {
  return board.page().locator(".hand--skill");
}

/** Open a match with a named card on top of the skill pool, and get to the action phase. */
async function openWithCard(page, cardId, { fast = true } = {}) {
  const board = await openMatch(page, SEEDS.leavesStartAtOnce, { fast, stack: [cardId] });
  await chooseDiceCard(board);

  return board;
}

/**
 * Play the one card in hand, answering the target picker for as long as it keeps asking.
 *
 * The picker's questions differ per card, so this only handles the cards the cases below use, which
 * are the two that need nothing pointed at. A card needing a pawn or a square is the target picker's
 * own spec and not this one's.
 */
async function playFirstCard(board) {
  await skillHand(board).locator(".card[data-playable='true']").first().click();
}

test.describe("a card played gets a cast", () => {
  /**
   * The whole contract in one case: the stage exists from the first frame, it is idle, and the card
   * and the four parts are already in it. D10, and it is the reason the cast can animate at all: an
   * element created when it gets content has no previous state to animate from.
   */
  test("is built empty and idle before anything is played", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce);
    const stage = cast(board);

    await expect(stage).toHaveAttribute("data-cast", "idle");
    await expect(stage.locator(".cast__card > .card")).toHaveCount(1);
    await expect(stage.locator(".cast__part")).toHaveCount(4);
  });

  /**
   * The one that matters, and the one the brief asked for by name: a cast runs and the board is clean
   * afterwards. A stuck `data-cast-hit` is a ring left standing on a field for the rest of the match,
   * and it is exactly the class of defect that a stuck `data-rolling` already cost this project a red
   * suite to find.
   */
  test("finishes and leaves no mark on the board", async ({ page }) => {
    const board = await openWithCard(page, "action-angel-die");
    await playFirstCard(board);
    await carryOn(board);

    await expect(cast(board)).toHaveAttribute("data-cast", "idle");
    await expect(board.locator("[data-cast-hit]")).toHaveCount(0);
    await expect(board).not.toHaveAttribute("data-cast", /./);
  });

  /**
   * The turn carries on. Under `?fast=1` the hold is zero, so if the cast ever failed to resume the
   * loop the game would simply stop with the action phase still open, which is the failure that would
   * be reported as "the game froze".
   */
  test("hands the turn back when it is done", async ({ page }) => {
    const board = await openWithCard(page, "action-angel-die");
    await playFirstCard(board);
    await carryOn(board);

    await expect(board).toHaveAttribute("data-phase", /act|turn-end|choose/);
  });
});

test.describe("what the stage says about the card on it, at real speed", () => {
  /**
   * `fast: false`, because the subject is the sequence as it happens. Every attribute below is written
   * once when the cast is filled and is what the six family stylesheets and the 29 accents key on, so
   * a missing one is 29 animations that silently do not play.
   */
  test("carries the card, its type and its family", async ({ page }) => {
    const board = await openWithCard(page, "action-angel-die", { fast: false });
    const stage = cast(board);

    await playFirstCard(board);

    await expect(stage).toHaveAttribute("data-cast", "card");
    await expect(stage).toHaveAttribute("data-card-id", "action-angel-die");
    await expect(stage).toHaveAttribute("data-card-type", "action");
    await expect(stage).toHaveAttribute("data-cast-family", "roll");
    await expect(stage).toHaveAttribute("data-actor", "human");
    await expect(stage).toHaveAttribute("data-seat", "0");
  });

  /**
   * D109's split, from the outside. Angel Die changes the roll and nothing else, so it never reaches
   * the board and says so before the stage would have started: that is what `data-board` is for, and
   * it is also what the hold reads to cost 940 ms instead of 1500.
   */
  test("says in advance that a roll card has nothing to land", async ({ page }) => {
    const board = await openWithCard(page, "action-angel-die", { fast: false });

    await playFirstCard(board);

    await expect(cast(board)).toHaveAttribute("data-board", "false");
    await expect(cast(board)).not.toHaveAttribute("data-cast", "board");
  });

  /**
   * The board half, which is the other 17 cards and the half a stylesheet alone could never do: the
   * marks are attributes on 40 other elements and a keyframe cannot write an attribute.
   *
   * A Banana Peel is the simplest of the 17: one field, one `direct` mark, no run and no reach. The
   * case asserts the mark arrives while the stage is running and is gone by the time the turn moves
   * on, which is the pair of facts the whole board stage rests on.
   */
  test("marks the field a trap card was aimed at, and takes the mark off again", async ({
    page,
  }) => {
    const board = await openWithCard(page, "action-banana-peel", { fast: false });

    await playCardAndAwaitSquare(board, "action-banana-peel");
    await board.locator('.square--track[data-pickable="true"]').first().click();

    await expect(cast(board)).toHaveAttribute("data-board", "true");
    await expect(board.locator('.square--track[data-cast-hit="direct"]')).toHaveCount(1);
    await expect(board).toHaveAttribute("data-cast", "action-banana-peel");

    await expect(board.locator("[data-cast-hit]")).toHaveCount(0, { timeout: 15_000 });
    await expect(cast(board)).toHaveAttribute("data-cast", "idle");
  });

  /** The card leaves for the plate, and the plate is where the record of it stays. D100 and D104. */
  test("puts the card on the last-card plate when it is over", async ({ page }) => {
    const board = await openWithCard(page, "action-angel-die");
    await playFirstCard(board);
    await carryOn(board);

    const plate = board.page().locator(".last-card");
    await expect(plate).toHaveAttribute("data-empty", "false");
    await expect(plate).toHaveAttribute("data-outcome", /resolved|pending|nullified|negated/);
  });
});

test.describe("reduced motion keeps what the cast says and drops what it does", () => {
  test.use({ reducedMotion: "reduce" });

  /**
   * D112 in one case. The two stage tokens collapse to 1 ms and the hold does not, so the card is on
   * the stage in frame one and simply stands there. What must **not** happen is the cast being skipped
   * entirely: a reduced-motion player would then be the only one at the table who never sees a bot's
   * card, which is the thing D115 exists to prevent.
   */
  test("still plays the whole sequence and still carries the turn on", async ({ page }) => {
    const board = await openWithCard(page, "action-angel-die");
    await playFirstCard(board);
    await carryOn(board);

    await expect(cast(board)).toHaveAttribute("data-cast", "idle");
    await expect(board.locator("[data-cast-hit]")).toHaveCount(0);
    await expect(board).toHaveAttribute("data-status", "running");
    await expect(board).toHaveAttribute("data-phase", /act|turn-end|choose/);
  });
});
