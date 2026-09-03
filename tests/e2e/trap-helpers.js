/**
 * The trap vocabulary an end-to-end spec needs. Issue #45, requirement FR-30.
 *
 * Split from `helpers.js` at the seam that file already implies: it drives a **turn**, and everything
 * in it is about choosing a card, moving a pawn and waiting for the next seat. These read the objects
 * standing on the board, which is a different subject and one that only one spec needs.
 *
 * ## Why any of this needs a helper at all
 *
 * A trap is only visible through attributes. Design brief 07 is out and unanswered, so `board.css` has
 * no rule for `[data-trap]` and nothing is painted. That is deliberate and it is what makes these
 * helpers the whole test surface: everything a player will eventually see is in the DOM today, so the
 * mechanic can be asserted end to end before a single line of CSS exists.
 */

import { expect } from "@playwright/test";

import {
  boardState,
  carryOn,
  chooseDiceCard,
  moveFirstMovablePawn,
  waitPastTurn,
} from "./helpers.js";

/** The 40 shared track fields. */
export function trackSquares(board) {
  return board.locator(".square--track");
}

/** One track field by its absolute index. */
export function square(board, index) {
  return board.locator(`.square--track[data-square="${index}"]`);
}

/** Every field that may be clicked to answer the question the prompt is asking. */
export function pickableSquares(board) {
  return board.locator('.square--track[data-pickable="true"]');
}

/**
 * The absolute indexes of the fields holding an object, and what each one holds.
 *
 * `data-trap` is on the field itself and not on a child, so the selector is a **compound** on
 * `.square--track` rather than a descendant lookup. Writing it the other way returns nothing and reads
 * as "no traps on the board", which is a passing-looking empty result rather than an error.
 */
export async function objectsOnBoard(board) {
  return board.locator(".square--track[data-trap]").evaluateAll((squares) =>
    Object.fromEntries(
      squares.map((element) => [
        Number(element.getAttribute("data-square")),
        {
          behaviour: element.getAttribute("data-trap"),
          kind: element.getAttribute("data-trap-kind"),
          owner: Number(element.querySelector(".square__trap")?.getAttribute("data-player")),
        },
      ])
    )
  );
}

/** The statuses stuck to each pawn, keyed `"seat.pawn"`. Only pawns carrying one appear. */
export async function pawnStatuses(board) {
  return board
    .locator(".pawn[data-statuses]")
    .evaluateAll((pawns) =>
      Object.fromEntries(
        pawns.map((pawn) => [
          `${pawn.getAttribute("data-player")}.${pawn.getAttribute("data-pawn")}`,
          (pawn.getAttribute("data-statuses") ?? "").split(" ").filter(Boolean),
        ])
      )
    );
}

/** The message strip beside the board, and what kind of message it is carrying. */
export function messageStrip(board) {
  return board.page().locator(".move-refusal");
}

/** The skill hand, which design spec 03 put in a rail beside the board and not inside it. */
export function skillHand(board) {
  return board.page().locator(".hand--skill");
}

/**
 * Play the named skill card out of the hand, and wait until the picker is asking for a field.
 *
 * Asserts `data-picking` rather than sleeping, because that attribute is written the moment the picker
 * starts collecting and is the only signal that the click was taken.
 */
export async function playCardAndAwaitSquare(board, cardId, kind = "free-square") {
  await skillHand(board).locator(`.card[data-card-id="${cardId}"]`).first().click();
  await expect(board).toHaveAttribute("data-picking", kind);
}

/**
 * Wait until the active seat's hand holds the named card, playing turns until it does.
 *
 * `?stack=` puts the card at the top of the pool, so seat 0 draws it on turn 1 and this returns at
 * once. The loop is here for the case where a spec stacks several cards: whoever draws the second one
 * is a fact about the turn order, not something the spec should encode.
 */
export async function awaitCardInHand(board, cardId, playTurn, maxTurns = 12) {
  for (let step = 0; step < maxTurns; step += 1) {
    if ((await skillHand(board).locator(`.card[data-card-id="${cardId}"]`).count()) > 0)
      return true;
    await playTurn(board);
  }

  return false;
}

/**
 * Play turns until a trap goes off, and return what the strip said **at that moment**.
 *
 * ## Why this cannot be `playUntil`
 *
 * The announcement is a turn-level field, so it is wiped by `clearedTurnFields` when the turn passes.
 * `playUntil` and `playTurn` both wait past the turn before handing control back, so by the time
 * either of them returns, the message is gone. That is not a flaw in them: they exist to drive a match
 * to a situation, and this is a spec that has to look at the board **inside** a turn.
 *
 * So this drives the four phases itself and reads the strip in the one place it can: **straight after
 * the move**, which is what fires a trap, and before `waitPastTurn` lets the turn end.
 *
 * Returns `{ key, kind, text }`, or `null` when the match ended or the cap was reached without a trap
 * firing. `null` is a legitimate outcome of a seeded match rather than a failure, and the caller says
 * which happened instead of asserting into a bare board.
 */
export async function playUntilTrapFires(board, maxTurns = 60) {
  for (let step = 0; step < maxTurns; step += 1) {
    const { status, phase, turnNumber } = await boardState(board);
    if (status !== "running") return null;

    if (phase === "choose") await chooseDiceCard(board);
    await carryOn(board);

    if ((await boardState(board)).phase === "act") {
      await moveFirstMovablePawn(board);

      const key = await messageStrip(board).getAttribute("data-reason-key");
      if (key !== null && key.startsWith("trap.fired.")) {
        return {
          key,
          kind: await messageStrip(board).getAttribute("data-message-kind"),
          text: await messageStrip(board).innerText(),
        };
      }
    }

    await waitPastTurn(board, turnNumber);
  }

  return null;
}
