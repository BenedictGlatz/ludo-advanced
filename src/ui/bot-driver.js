/**
 * The one thing a bot is not allowed to know: time. Issue #43, requirement FR-43.
 *
 * `src/ai/` decides what to play and knows nothing about clocks, exactly as `core/` decides the rules
 * and knows nothing about the DOM. This module is the other half: it asks `decide(state)`, waits long
 * enough for a person to see what happened, and then dispatches.
 *
 * Built like [createTurnWaits](turn-waits.js), and it is the loop's fourth sibling after
 * `turn-controls.js` (what a click means), `card-controls.js` (what a card click means) and
 * `turn-waits.js` (the pauses the game takes on its own). The pattern is the same in all four: the loop
 * drives the **phases** of a turn, and one module owns each thing that happens inside them.
 *
 * ## Why the decision is asked twice
 *
 * `takeTurn()` asks `decide` once to find out whether there is anything to do, and `play()` asks it
 * **again** when the timer fires. That is not redundant. Between the two, 900 ms of real time pass, and
 * in that time the match can be paused, given up, restarted, or carried on by a person who clicked
 * something. Dispatching the intent captured at scheduling time would replay a decision made about a
 * board that no longer exists. Asking again costs a few hundred pure evaluations and cannot be wrong.
 *
 * ## Why a refused intent stops rather than retries
 *
 * `apply` returns false and this module gives up on that pass, redraws, and lets the loop carry on.
 * Retrying is how a bot turns one impossible intent into an infinite loop, and the game-loop's own
 * comment already makes this rule for every other control in `ui/`.
 */

import { decide } from "../ai/bot-policy.js";
import { motionMs } from "./board-view.js";
import { holdBot } from "./timers.js";

/**
 * The bot's hands on the controls.
 *
 * - `$board` is where the durations are read off, the same as `turn-waits.js`.
 * - `getState`, `apply`, `refresh` and `resume` come from `game-loop.js`, so there is one state
 *   reference in `ui/` and one place that dispatches.
 */
export function createBotDriver({ $board, timers, delays = {}, getState, apply, refresh, resume }) {
  const readToken = (token, fallback) => motionMs($board, token, fallback);

  /**
   * Every bot in the open window passes, at once and without a pause.
   *
   * **No pause, deliberately.** A window is not a bot's turn: somebody else is waiting on it, and a
   * three-bot table would put nearly three seconds in front of every capture a person made. What the
   * window is *for* is giving a person the chance to answer, and the bots dropping out immediately is
   * what leaves that window to the people who can use it. It also means a window with only bots in it
   * shuts at once instead of running a thirty-second clock nobody is watching.
   *
   * Returns whether anything was dispatched, so the caller can tell a changed state from an unchanged
   * one. It stops on a refusal, like every other control here.
   */
  function declineAll() {
    let acted = false;

    for (;;) {
      const intent = decide(getState());
      if (intent === null || getState().reactionWindow === null) return acted;
      if (!apply(intent)) return acted;
      acted = true;
    }
  }

  /**
   * Play this bot's move, after a moment.
   *
   * Returns `true` when the bot has taken the turn over, which tells the loop to stop and wait. `false`
   * means nobody is being asked and the loop should carry on as it always did, which is what every pass
   * of an all-human match returns.
   */
  function takeTurn() {
    if (decide(getState()) === null) return false;

    const ms = holdBot(delays, readToken);

    // Zero plays synchronously rather than through the registry. `timers.set(..., 0)` defers to a
    // macrotask, and every end-to-end spec in the suite was written against the ordering the loop has
    // today, so a zero hold has to be no hold at all. Same convention as `turn-waits.js`.
    if (ms <= 0) {
      play();
      return true;
    }

    timers.set("bot", play, ms);
    return true;
  }

  /** Ask again, now, and act on the answer. See the header for why it is asked twice. */
  function play() {
    const intent = decide(getState());

    // The board moved on while the pause ran: paused and resumed, given up, or a person finished the
    // turn. `resume()` re-enters `advance()`, which plans whatever the state now needs.
    if (intent === null) {
      resume();
      return;
    }

    if (!apply(intent)) {
      refresh();
      return;
    }

    resume();
  }

  return {
    declineAll,
    takeTurn,

    /** Stop waiting. Called when the loop stops or pauses, so a torn-down match leaves nothing running. */
    stop() {
      timers.clear("bot");
    },
  };
}
