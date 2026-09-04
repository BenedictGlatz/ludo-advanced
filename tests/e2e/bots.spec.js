/**
 * Playing against the computer. Issues #43 and #82, requirement FR-43.
 *
 * ## Two of the four cases run at real speed, and that is the point
 *
 * `?fast=1` collapses the bot's thinking pause to zero along with every other wait, so under it a bot
 * turn happens inside one tick. That is exactly what most specs want and exactly what the two
 * hand-over cases must not have: the rule they are about is **who is asked to press a button between
 * turns**, and the only honest way to check that nothing asks is to let real time pass and watch the
 * overlay stay away. `handover.spec.js` runs at real speed for the same reason.
 *
 * The helpers live in [bot-helpers.js](bot-helpers.js), which carries the reason a bot spec cannot use
 * `boardState` and `playUntil`: with three bots under `?fast=1`, several turns can pass between two
 * attribute reads.
 */

import { expect, test } from "@playwright/test";

import { boardState, playTurn } from "./helpers.js";
import { openBotMatch, playHumanTurn, playPersonTurn, progress, snapshot } from "./bot-helpers.js";

const overlay = (page) => page.locator(".overlay");
const seatRow = (page, seat) => page.locator(`.hud__seat[data-player="${seat}"]`);

/**
 * A whole match played click by click, the same figure `win.spec.js` and `match-flow.spec.js` use and
 * for the same measured reason: at Playwright's default worker count the browsers contend, and the
 * default 30 seconds reports contention as a failure.
 */
const FULL_MATCH_TIMEOUT_MS = 240_000;

test.describe("bot opponents", () => {
  // The real-speed cases spend seconds at a time doing nothing on purpose: three bot turns at 900 ms
  // a decision, plus the roll's own hold, plus two seconds for every card a bot plays. That is close
  // enough to Playwright's default thirty seconds that a contended run would report waiting as
  // failing.
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

  /**
   * Issue #82's own case: the bots spend cards, the play is announced, and the match carries on.
   *
   * ## Three assertions in one match, because a match is what is expensive
   *
   * The discard pile is the evidence that a card was played, and it has to be, because several cards
   * leave the board looking exactly as it did before: Built Different writes a status, No Take-Backsies
   * shuts a window nobody was going to use, and a nullified card does nothing at all. The person in
   * this match never plays a card, so every entry in the pile came from a bot.
   *
   * **What it is really testing is that nothing hangs.** A bot whose card play the rules refuse leaves
   * `bot-driver.js` stopped and the phase unchanged, which is a browser sitting still rather than a
   * failing assertion, so the turn number moving on afterwards is the whole point.
   *
   * ## Why a MutationObserver instead of polling the strip
   *
   * The announcement is on screen for `--motion-trap-hold`, two seconds, and `?fast=1` collapses that
   * to nothing. Polling for it would therefore mean running the whole match at real speed and hoping a
   * round trip lands inside a two-second window, and the first draft of this spec did exactly that and
   * spent sixty seconds not seeing one. Recording every value the attribute ever takes turns a race
   * into a list, so the case runs fast and asserts more: the kind **and** the name in the sentence.
   *
   * The strip is built once by `page.js` and only ever gets attributes, so one observer covers the
   * whole match. How long the announcement stays is `mid-turn-hold.test.js`'s question, and a unit test
   * is the right place for a duration nothing on screen reports.
   */
  test("the bots spend their skill cards, and every play is announced", async ({ page }) => {
    test.setTimeout(FULL_MATCH_TIMEOUT_MS);

    await openBotMatch(page, { seed: 1, players: 4, bots: 3, fast: true });

    await page.evaluate(() => {
      const el = document.querySelector(".message-strip");
      window.announced = [];

      new MutationObserver(() => {
        const kind = el.getAttribute("data-message-kind");
        if (kind !== null) window.announced.push({ kind, text: el.textContent });
      }).observe(el, { attributes: true, attributeFilter: ["data-message-kind"] });
    });

    const announced = () => page.evaluate(() => window.announced);
    let played = null;

    // The person plays roughly one turn in four and never plays a card. Early turns are quiet on
    // purpose: with every pawn still in the yard almost nothing is worth playing, so the cards start
    // moving once the pawns are out and the hands are full.
    for (let turn = 0; turn < 40 && played === null; turn += 1) {
      const now = await playPersonTurn(page, page.locator(".board"));
      if (now.status !== "running") break;

      const state = await snapshot(page);
      if (state.discards > 0 && (await announced()).some((entry) => entry.kind === "card")) {
        played = state;
      }
    }

    expect(
      played,
      "no bot played an announced skill card in 40 of the person's turns"
    ).not.toBeNull();

    // The sentence names the seat, which is what the `{{name}}` interpolation is for: it used to say
    // "Spieler 2" for a seat the rest of the screen calls "Bot 2".
    const cards = (await announced()).filter((entry) => entry.kind === "card");
    expect(cards[0].text).toMatch(/Bot \d/);

    // And the match carries on: two more of the person's turns, with the three bots taking theirs in
    // between, which is six or more turns on top of the one the card was played in.
    //
    // Played rather than waited for, and the first draft got this wrong. Nothing moves while the board
    // rests on the person's turn, so a poll for a rising turn number sits there until it times out.
    for (let turn = 0; turn < 2; turn += 1) {
      await playPersonTurn(page, page.locator(".board"));
    }

    const later = await snapshot(page);
    expect(later.status).toBe("running");
    expect(later.turnNumber).toBeGreaterThan(played.turnNumber + 3);
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
