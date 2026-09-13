/**
 * Driving a turn from a spec: choose a card, carry on, move, wait for the turn to pass. Issues #31, #38,
 * #45 and #89.
 *
 * Split out of `helpers.js` in issue #89, when the bonus roll added `playOutMoves` and `afterMove` and
 * took that file past 300 lines. `helpers.js` reads the board (`boardState`, `pawnPositions`, the
 * locators) and re-exports everything here, so every spec keeps importing from one place.
 *
 * ## The one thing every driver has to know since issue #89
 *
 * A move no longer ends the turn for certain. A natural maximum on a D6 or larger rolls the same die
 * again, up to three rolls a turn, so after a move the board is either passing the turn on or back in
 * `act` with `data-rolls` one higher. `afterMove` is the single place that question is asked, and
 * `playOutMoves` is the loop that keeps moving until the answer is "passed".
 */

import { expect } from "@playwright/test";

import { boardState, diceHand, firstMovablePawn, prompt } from "./helpers.js";

/** Poll `read` until it answers something other than `null`, and return that answer. */
async function pollFor(read, timeout = 15_000) {
  let answer = null;

  await expect
    .poll(
      async () => {
        answer = await read();
        return answer !== null;
      },
      { timeout }
    )
    .toBe(true);

  return answer;
}

/**
 * Pick the dice card in slot 0 and wait until choosing has actually happened.
 *
 * **Choosing no longer rolls.** Until issue #38 `choose-die` ran steps 3 to 5 as one intent; the action
 * phase now sits in that gap, so the phase after this is `action` when the player holds a playable card
 * and `act` or `turn-end` when they do not. `carryOn` below is the other half.
 *
 * **The wait cannot be "the phase is no longer `choose`", and that mistake cost half a test run.**
 * With `?fast=1` a turn nobody can move in rolls, passes, hands over and draws the next hand inside
 * one tick, so between the click and the next poll the board is back in `choose` for the *next*
 * player. The phase looks unchanged and the click looks lost. The turn number only counts upward, so
 * "the phase moved on, or the turn did" is the condition that cannot be fooled. This is the same trap
 * `waitPastTurn` below was written for.
 */
export async function chooseDiceCard(board) {
  const { turnNumber } = await boardState(board);

  await diceHand(board).locator('.card[data-slot="0"]').click();

  await expect
    .poll(
      async () => {
        const now = await boardState(board);
        return now.phase !== "choose" || now.turnNumber > turnNumber || now.status !== "running";
      },
      { timeout: 15_000 }
    )
    .toBe(true);
}

/**
 * Press "carry on" if the turn is waiting in the action phase, and do nothing if it is not.
 *
 * A no-op most of the time, which is the point: the loop skips the action phase by itself whenever the
 * active player holds no playable card, so a spec cannot know in advance whether the button will be
 * there. Asking the board rather than assuming is what keeps every spec that predates issue #38 working
 * with one extra line.
 *
 * **It plays no card.** These helpers drive the turn, and a card played here would change the RNG
 * sequence and invalidate every pinned seed. Playing cards is `skill-hand.spec.js`'s job.
 */
export async function carryOn(board) {
  const { phase, turnNumber } = await boardState(board);
  if (phase !== "action") return;

  await prompt(board).locator('[data-prompt-action="skip"]').click();

  await expect
    .poll(
      async () => {
        const now = await boardState(board);
        return now.phase !== "action" || now.turnNumber > turnNumber || now.status !== "running";
      },
      { timeout: 15_000 }
    )
    .toBe(true);
}

/**
 * Choose a dice card and then get past the action phase, which is what most specs actually want.
 *
 * Two steps where issue #31 had one. Kept as a pair rather than folded into `chooseDiceCard`, because a
 * spec that is *about* the action phase needs to stop between them.
 */
export async function chooseAndCarryOn(board) {
  await chooseDiceCard(board);
  await carryOn(board);
}

/**
 * Wait until the turn number has moved past `turnNumber`, or the match has ended.
 *
 * **Always wait on the turn number, never on the phase or the active seat.** With `?fast=1` a turn
 * nobody can move in passes itself in the same tick, so between two polls the board can leave `act`,
 * hand over, pass, hand back and be in `act` again. The phase and the seat would both read unchanged.
 * The turn number only counts upward, so it cannot hide a turn that has already happened.
 *
 * Exported since issue #45, because a spec that has to look at the board **during** a turn cannot use
 * `playTurn` or `playUntil`: both of them wait past the turn before they hand control back, and a
 * message that lives until the turn passes is gone by then. Such a spec drives the phases itself and
 * needs this to end each turn properly.
 */
export async function waitPastTurn(board, turnNumber) {
  await expect
    .poll(
      async () => {
        const now = await boardState(board);
        return now.status !== "running" || now.turnNumber > turnNumber;
      },
      { timeout: 15_000 }
    )
    .toBe(true);
}

/**
 * Move the lowest-numbered movable pawn.
 *
 * Two clicks on the same pawn, which is the interaction the game loop implements: the first selects
 * and the second commits. The pawn keeps `data-movable` in between, so the locator resolves to the
 * same element both times.
 */
export async function moveFirstMovablePawn(board) {
  const pawn = firstMovablePawn(board);

  await pawn.click();
  await expect(pawn).toHaveAttribute("data-selected", "true");
  await pawn.click();
}

/**
 * What a turn does after a move: it passes, or it comes back to `act` on a bonus roll (issue #89).
 *
 * Polls until one of the two has happened and says which. "Passed" is the turn number moving on, the
 * match ending, or the turn resting in `turn-end` (the handover screen holds it there without `fast=1`).
 * "Again" is the same turn in `act` with `data-rolls` above `rolls`, which is the count read before the
 * move; comparing the count is what tells a fresh `act` from the one the click was made in.
 */
export async function afterMove(board, turnNumber, rolls) {
  return pollFor(async () => {
    const now = await boardState(board);
    if (now.status !== "running" || now.turnNumber > turnNumber || now.phase === "turn-end") {
      return "passed";
    }
    return now.phase === "act" && now.rolls > rolls ? "again" : null;
  });
}

/**
 * Move for as long as this turn keeps rolling, and stop when it is over or waiting to be handed on.
 *
 * Since issue #89 a natural maximum on a D6 or larger rolls the same die again, so one turn can hold up
 * to three moves. Every helper that used to make one move and wait for the turn to pass goes through
 * this instead. It does **not** wait past the turn: `handover.spec.js` and the bot specs need to look at
 * the board while the turn is still resting in `turn-end`.
 */
export async function playOutMoves(board) {
  const start = await boardState(board);
  if (start.phase !== "act") return;

  let rolls = start.rolls;
  for (let move = 0; move < 4; move += 1) {
    await moveFirstMovablePawn(board);
    if ((await afterMove(board, start.turnNumber, rolls)) === "passed") return;
    rolls = (await boardState(board)).rolls;
  }
}

/**
 * Play whatever this turn still needs, then wait for it to be over.
 *
 * Handles all three states the turn can be in when it is called: a card still to choose, a pawn ready
 * to move, or a turn already finished because nothing could move. A caller does not have to look at
 * the phase first, which is what stops every spec from having to know the shape of a turn.
 */
export async function playTurn(board) {
  const { turnNumber, phase } = await boardState(board);

  if (phase === "choose") await chooseDiceCard(board);
  await carryOn(board);
  await playOutMoves(board);

  await waitPastTurn(board, turnNumber);
}

/**
 * Play until `done(board)` returns true, or until the match ends, or until the step cap is reached.
 *
 * **`done` is asked once per step and not once per turn**, and the step that matters is the one after
 * a card has been chosen: at that point the roll is known and no pawn has moved yet, which is the only
 * moment a caller can ask "is this the situation I was waiting for" and still act on the answer. That
 * is why choosing does a `continue` rather than falling through to the pawn.
 *
 * The cap is a real bound and not a formality: a bug that parks the loop in one phase forever would
 * otherwise hang the suite instead of failing it. It counts steps, so a match may use two per turn.
 */
export async function playUntil(board, done, maxSteps = 400) {
  for (let step = 0; step < maxSteps; step += 1) {
    if (await done(board)) return true;

    const { status, phase, turnNumber } = await boardState(board);
    if (status !== "running") return await done(board);

    if (phase === "choose") {
      await chooseDiceCard(board);
      await carryOn(board);
      continue;
    }

    if (phase === "action") {
      await carryOn(board);
      continue;
    }

    if (phase === "act") {
      // A bonus roll (issue #89) brings the same turn back to `act`, and `done` has to be asked about
      // that roll too, so the loop goes round again rather than waiting for the turn to pass.
      const { rolls } = await boardState(board);
      await moveFirstMovablePawn(board);
      if ((await afterMove(board, turnNumber, rolls)) === "again") continue;
    }

    await waitPastTurn(board, turnNumber);
  }

  throw new Error(`the match did not reach the wanted situation within ${maxSteps} steps`);
}
