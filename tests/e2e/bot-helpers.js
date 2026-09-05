/**
 * The helpers the bot specs need and no other spec does. Issues #43 and #82.
 *
 * Not a spec file itself: Playwright only collects `*.spec.js`, so nothing here runs on its own. Same
 * arrangement as [trap-helpers.js](trap-helpers.js).
 *
 * ## Why these could not stay in `helpers.js`
 *
 * That file is at exactly 300 lines, NFR-02's limit, and it is imported by every end-to-end spec in
 * the suite. Nothing below is of any use to a spec without a bot in it.
 *
 * ## Why a bot spec cannot use `boardState` and `playUntil`
 *
 * `boardState` reads six attributes with six separate round trips, which was harmless while every turn
 * waited for a click somewhere. With three bots under `?fast=1` the bots' three turns happen between
 * two of those reads, so a caller can get `phase` from a bot's fleeting `act` and `turnNumber` from two
 * turns later, and then try to click a pawn that no longer exists. It is not a bug in the helper: it is
 * a property that only shows up once turns can pass with nobody clicking.
 *
 * So these read the state **atomically**, through `window.ludo`, which `main.js` exposes for exactly
 * this: "a Playwright test that needs to look at the state rather than at the screen". The page is only
 * ever touched while the board is resting on the person's turn.
 */

import { expect } from "@playwright/test";

import { boardState, chooseAndCarryOn, moveFirstMovablePawn } from "./helpers.js";

/** The three phases that wait for somebody to click something. */
const RESTING = ["choose", "action", "act"];

/** `?bots=` is not one of `openMatch`'s options, so the query is written out. */
export function openBotMatch(page, { seed, players, bots, fast = false }) {
  const query = `?seed=${seed}&players=${players}&bots=${bots}${fast ? "&fast=1" : ""}`;

  return page.goto(`/${query}`);
}

/**
 * The whole answer in one round trip. See the header for why the attributes will not do here.
 *
 * `discards` and `cards` were added by issue #82, when a bot started playing cards: the discard pile
 * growing is how a spec can tell that a card was played at all, since several cards leave the board
 * looking exactly as it did before.
 */
export function snapshot(page) {
  return page.evaluate(() => {
    const state = window.ludo.getLoop()?.getState() ?? null;
    if (state === null) return null;

    return {
      status: state.status,
      phase: state.phase,
      seat: state.activePlayer,
      isBot: state.bots.includes(state.activePlayer),
      turnNumber: state.turnNumber,
      discards: state.skillDiscard.length,
      cards: Object.values(state.skillHands).reduce((total, hand) => total + hand.length, 0),
    };
  });
}

/**
 * Wait until the board has come to rest on a person's turn, or the match is over.
 *
 * "At rest" is the three phases that wait for input. Every other phase either belongs to the loop or
 * belongs to a bot, and both pass on their own.
 */
export async function waitForPerson(page, timeout = 20_000) {
  let latest = null;

  await expect
    .poll(
      async () => {
        latest = await snapshot(page);
        if (latest === null) return false;
        if (latest.status !== "running") return true;

        return !latest.isBot && RESTING.includes(latest.phase);
      },
      { timeout }
    )
    .toBe(true);

  return latest;
}

/** Wait until the board is no longer in exactly the state `from` describes. */
export async function waitPast(page, from) {
  await expect
    .poll(
      async () => {
        const now = await snapshot(page);

        return (
          now.status !== "running" || now.turnNumber !== from.turnNumber || now.phase !== from.phase
        );
      },
      { timeout: 20_000 }
    )
    .toBe(true);
}

/**
 * Take the person's whole turn, one resting phase at a time, letting the board settle between each.
 *
 * The settle between every click is what `playUntil` cannot do: it decides what to press from a read
 * that may already be two turns old. Here every decision comes from a state that is, by construction,
 * one a person is being asked about.
 */
export async function playPersonTurn(page, board) {
  const choosing = await waitForPerson(page);
  if (choosing.status !== "running") return choosing;

  if (choosing.phase === "choose") {
    await page.locator('.hand--dice .card[data-slot="0"]').click();
    await waitPast(page, choosing);
  }

  const acting = await waitForPerson(page);
  if (acting.status === "running" && acting.phase === "action") {
    await page.locator('.prompt [data-prompt-action="skip"]').click();
    await waitPast(page, acting);
  }

  const moving = await waitForPerson(page);
  if (moving.status === "running" && moving.phase === "act") {
    await moveFirstMovablePawn(board);
    await waitPast(page, moving);
  }

  return moving;
}

/**
 * One turn of a person's, without waiting for it to be over.
 *
 * `playTurn` cannot be used before a hand-over: it waits for the turn number to move, and the whole
 * point of the screen is that the turn does **not** pass until somebody presses Ready.
 * `handover.spec.js` drives its turns the same way for the same reason.
 */
export async function playHumanTurn(board) {
  await chooseAndCarryOn(board);
  if ((await boardState(board)).phase === "act") await moveFirstMovablePawn(board);
}

/**
 * The board's turn and seat, plus whichever screen is up, read in one pass.
 *
 * Read together on purpose. A poll that only watched the turn number would happily wait out a
 * hand-over screen that should never have opened and then report a timeout, which says nothing about
 * what went wrong. Reading the screen in the same pass turns that into an assertion that names it.
 */
export async function progress(page, board) {
  const { turnNumber, activePlayer, status } = await boardState(board);

  return {
    turnNumber,
    activePlayer,
    status,
    screen: await page.locator(".overlay").getAttribute("data-screen"),
  };
}
