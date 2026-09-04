/**
 * Playing against the computer. Issue #43, requirement FR-43.
 *
 * ## Two of the three cases run at real speed, and that is the point
 *
 * `?fast=1` collapses the bot's thinking pause to zero along with every other wait, so under it a bot
 * turn happens inside one tick. That is exactly what most specs want and exactly what these two must
 * not have: what they are testing is **the hand-over rule**, which is about who is asked to press a
 * button between turns, and the only honest way to check that nothing asks is to let real time pass
 * and watch the overlay stay away.
 *
 * `handover.spec.js` runs at real speed for the same reason, and this file borrows its shape: the URL
 * is built here rather than through `openMatch`, because `helpers.js` is at its 300-line limit (NFR-02)
 * and a fourth option is not worth splitting it for.
 *
 * ## The third case cannot use `playUntil`, and the reason is worth knowing
 *
 * `boardState` reads six attributes with six separate round trips, which was harmless while every turn
 * waited for a click somewhere. With three bots under `?fast=1` the bots' three turns happen between
 * two of those reads, so a caller can get `phase` from a bot's fleeting `act` and `turnNumber` from two
 * turns later and try to click a pawn that no longer exists. It is not a bug in the helper: it is a
 * property that only shows up once turns can pass with nobody clicking.
 *
 * So that case reads the state **atomically**, through `window.ludo`, which `main.js` exposes for
 * exactly this: "a Playwright test that needs to look at the state rather than at the screen". It only
 * ever touches the page while the board is resting on the person's turn.
 */

import { expect, test } from "@playwright/test";

import { boardState, chooseAndCarryOn, moveFirstMovablePawn, playTurn } from "./helpers.js";

const overlay = (page) => page.locator(".overlay");
const seatRow = (page, seat) => page.locator(`.hud__seat[data-player="${seat}"]`);

/**
 * A whole match played click by click, the same figure `win.spec.js` and `match-flow.spec.js` use and
 * for the same measured reason: at Playwright's default worker count the browsers contend, and the
 * default 30 seconds reports contention as a failure.
 */
const FULL_MATCH_TIMEOUT_MS = 240_000;

/** `?bots=` is not one of `openMatch`'s options, so the query is written out. */
function openBotMatch(page, { seed, players, bots, fast = false }) {
  const query = `?seed=${seed}&players=${players}&bots=${bots}${fast ? "&fast=1" : ""}`;

  return page.goto(`/${query}`);
}

/**
 * One turn of a person's, without waiting for it to be over.
 *
 * `playTurn` cannot be used before a hand-over: it waits for the turn number to move, and the whole
 * point of the screen is that the turn does **not** pass until somebody presses Ready.
 * `handover.spec.js` drives its turns the same way for the same reason.
 */
async function playHumanTurn(board) {
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
async function progress(page, board) {
  const { turnNumber, activePlayer, status } = await boardState(board);

  return {
    turnNumber,
    activePlayer,
    status,
    screen: await overlay(page).getAttribute("data-screen"),
  };
}

/** The whole answer in one round trip. See the header for why the attributes will not do here. */
function snapshot(page) {
  return page.evaluate(() => {
    const state = window.ludo.getLoop()?.getState() ?? null;
    if (state === null) return null;

    return {
      status: state.status,
      phase: state.phase,
      seat: state.activePlayer,
      isBot: state.bots.includes(state.activePlayer),
      turnNumber: state.turnNumber,
    };
  });
}

/**
 * Wait until the board has come to rest on a person's turn, or the match is over.
 *
 * "At rest" is the three phases that wait for input. Every other phase either belongs to the loop or
 * belongs to a bot, and both pass on their own.
 */
async function waitForPerson(page) {
  let latest = null;

  await expect
    .poll(
      async () => {
        latest = await snapshot(page);
        if (latest === null) return false;
        if (latest.status !== "running") return true;

        return !latest.isBot && ["choose", "action", "act"].includes(latest.phase);
      },
      { timeout: 20_000 }
    )
    .toBe(true);

  return latest;
}

/** Wait until the board is no longer in exactly the state `from` describes. */
async function waitPast(page, from) {
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
async function playPersonTurn(page, board) {
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

test.describe("bot opponents", () => {
  // The two real-speed cases spend about fifteen seconds each doing nothing on purpose: three bot
  // turns at 900 ms a decision, plus the roll's own hold. That is close enough to Playwright's default
  // thirty seconds that a contended run would report waiting as failing.
  test.setTimeout(90_000);

  test("one person and three bots: the bots take their turns and nothing asks to hand over", async ({
    page,
  }) => {
    await openBotMatch(page, { seed: 1, players: 4, bots: 3 });

    const board = page.locator(".board");
    await expect(board).toHaveAttribute("data-players", "4");

    // `data-controller` rather than the word "Bot": every other spec in this suite asserts on an
    // attribute, because a text check is a check on the current language.
    await expect(seatRow(page, 0)).toHaveAttribute("data-controller", "human");
    for (const seat of [1, 2, 3]) {
      await expect(seatRow(page, seat)).toHaveAttribute("data-controller", "bot");
    }

    await expect(seatRow(page, 0).locator(".hud__name")).toHaveText("Spieler 1");
    await expect(seatRow(page, 1).locator(".hud__name")).toHaveText("Bot 2");

    // The only turn a person plays in this test.
    await playTurn(board);

    // Three bot turns at real speed, with no click of any kind. The poll fails the moment a hand-over
    // screen appears, which is the rule under test: with one person at the screen there is nobody to
    // hand anything to.
    await expect
      .poll(
        async () => {
          const now = await progress(page, board);
          expect(now.screen, "a hand-over screen opened for a single player").not.toBe("handover");

          return now.turnNumber >= 5 && now.activePlayer === 0;
        },
        { timeout: 45_000 }
      )
      .toBe(true);
  });

  test("two people and two bots: the screen changes hands between the people and not around the bots", async ({
    page,
  }) => {
    await openBotMatch(page, { seed: 1, players: 4, bots: 2 });

    const board = page.locator(".board");
    await expect(seatRow(page, 1)).toHaveAttribute("data-controller", "human");
    await expect(seatRow(page, 2)).toHaveAttribute("data-controller", "bot");

    // Seat 0 plays, and the screen has to change hands, because seat 1 is a person.
    await playHumanTurn(board);
    await expect(overlay(page)).toHaveAttribute("data-screen", "handover", { timeout: 20_000 });
    await expect(overlay(page)).toHaveAttribute("data-player", "1");

    await page.locator('.overlay__button[data-action="ready"]').click();
    await expect(overlay(page)).toHaveAttribute("data-screen", "none");

    // Seat 1 plays turn 2, and the two bots then take turns 3 and 4 with no screen in between. So the
    // next hand-over is the one at the end of turn 4, and it names seat 0.
    await playHumanTurn(board);

    await expect
      .poll(async () => (await progress(page, board)).screen, { timeout: 60_000 })
      .toBe("handover");

    await expect(overlay(page)).toHaveAttribute("data-player", "0");

    // **Four and not five.** The screen opens *before* `end-turn` is dispatched, because the hold that
    // precedes it is there so the finished turn can be read. So the board still says turn 4, and the
    // number is the evidence that two whole turns went by unattended: seat 1 played turn 2, and this
    // is the end of turn 4.
    expect((await boardState(board)).turnNumber).toBe(4);
  });

  test("a match with three bots in it plays to a win", async ({ page }) => {
    test.setTimeout(FULL_MATCH_TIMEOUT_MS);

    // `?fast=1` here, because this one is about the whole match rather than about the waiting. It is
    // the browser's counterpart to `bot-match.test.js`, and it is the case that would catch a bot
    // whose intents the rules refuse only once a jQuery view is in the loop.
    await openBotMatch(page, { seed: 1, players: 4, bots: 3, fast: true });

    const board = page.locator(".board");
    await expect(board).toHaveAttribute("data-players", "4");

    // The person plays roughly one turn in four, and the three bots fill the gaps without being
    // asked. The cap is a real bound: a bug that parks the loop in one phase would otherwise hang the
    // suite instead of failing it.
    for (let turn = 0; turn < 300; turn += 1) {
      const now = await playPersonTurn(page, board);

      if (now.status !== "running") {
        await expect(board).toHaveAttribute("data-status", "won");
        expect(now.turnNumber).toBeGreaterThan(20);
        return;
      }
    }

    throw new Error("the bot match did not finish within 300 of the person's turns");
  });
});
