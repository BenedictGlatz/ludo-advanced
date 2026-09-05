/**
 * Which seats play themselves. Issue #43, requirement FR-43.
 *
 * Imports `core/`, never `ui/` (NFR-01). This module holds no strategy at all: **what** a bot decides
 * is `src/ai/`, and **which seats** are bots is here, because that is a fact about the match and not
 * about playing well.
 *
 * ## Why a list of seats and not a count
 *
 * `state.bots` is a sorted list of seat numbers, `[]` by default. A four-player match with two bots
 * stores `seats [0, 1, 2, 3]` and `bots [2, 3]`.
 *
 * This follows `seats` in [game-state.js](game-state.js), one file over, and for the same reason:
 * state asks `core/` once and everybody else reads the answer. Storing only the number 2 would make
 * every reader re-derive "the last two of the seats in play", and a rule copied into five readers is
 * a rule that drifts.
 *
 * Rejected: a `controllers` map like `{ 0: "human", 2: "bot" }`. It is a second truth about who is
 * playing beside `seats`, and object keys are strings, so `Object.entries` hands back `"0"` and the
 * seat comparisons downstream quietly stop matching. `skillHands` already cost us that afternoon.
 *
 * ## Why the *last* seats become bots
 *
 * Somebody has to decide, and the person at the keyboard should keep seat 0: they play first, and
 * their colour is the one the board is drawn around. So the humans fill up from the front and the
 * bots take what is left over. `botSeatsFor` is the only place that rule is written down.
 *
 * **That default is not a rule, and the line-up screen does not use it.** `botSeatsFor` answers
 * "which seats" for a match started from `?bots=`, where a number is all there is to go on. The
 * line-up screen (issue #76, design handoff 15, D95) lets the player say which seats directly, seat 0
 * included, and hands `startMatch` the set. Both routes end at the same argument, so there is one code
 * path below the two entry points and nothing to drift.
 */

import { seatsFor } from "../core/board.js";

/**
 * The last `count` seats of a `playerCount` match, in seat order.
 *
 * ```js
 * botSeatsFor(4, 2);   // [2, 3]
 * botSeatsFor(2, 1);   // [2]     two players sit on seats 0 and 2, so the bot is seat 2
 * botSeatsFor(3, 0);   // []
 * ```
 *
 * `count` is clamped into `0..playerCount`, so a caller that asks for more bots than there are seats
 * gets an all-bot match rather than an exception. Whether that is allowed at all is a question for
 * whoever typed the number, and it is answered in `src/options.js`, not here: a match made only of
 * bots is exactly what the bot-against-bot regression test starts.
 */
export function botSeatsFor(playerCount, count) {
  const seats = seatsFor(playerCount);
  const wanted = Math.max(0, Math.min(count, seats.length));

  // Not `seats.slice(-wanted)`. `slice(-0)` is `slice(0)`, which is the whole list, so a zero-bot
  // match would come back with every seat a bot. This is the one line in the file worth a comment.
  return seats.slice(seats.length - wanted);
}

/**
 * May this seat be turned into a bot? `false` only for the last seat that still has a person on it.
 *
 * FR-01: at least one person plays. `options.js` already refuses `bots >= players` before a match is
 * built, silently and behind the player's back, which is the right answer for something typed into an
 * address bar. The line-up screen (issue #76) asks the same question **in front of** the player, one
 * click at a time, so the rule needs a shape a button can be disabled from.
 *
 * ## Why these two take arrays and `isBot` above them takes a state
 *
 * There is no state yet. A player halfway through setting up a line-up has not started a match, and
 * `createGameState` has no field for one that has not started, so the only two things there are to
 * work with are the seats the count produced and the bot seats chosen so far. The asymmetry with
 * `isBot` and `humanSeats` one function above is deliberate and should not be tidied away: those two
 * are asked during a match and these two are asked before there is one.
 */
export function canBeBot(seats, bots, seat) {
  if (!seats.includes(seat)) return false;
  if (bots.includes(seat)) return false;

  // The seat is a person today, so turning it into a bot removes one person. That is allowed exactly
  // as long as somebody else is still a person.
  return seats.filter((other) => !bots.includes(other)).length > 1;
}

/**
 * Switch one seat between a person and a bot, and give back the new bot list.
 *
 * **A refused toggle returns the list unchanged rather than throwing.** The caller is a click, and a
 * refused click on a menu is a normal thing rather than a programming error. `assertBotSeats` above is
 * the function that throws, and it keeps that job: it is asked once, when a match is built, about a
 * list that has already been decided.
 *
 * The result is sorted, so a line-up's bot list and `botSeatsFor`'s are the same shape and `state.bots`
 * is in seat order whichever of the two routes into a match was taken.
 */
export function toggleController(seats, bots, seat) {
  if (bots.includes(seat)) return bots.filter((other) => other !== seat);
  if (!canBeBot(seats, bots, seat)) return bots;

  return [...bots, seat].sort((a, b) => a - b);
}

/**
 * Check that a bot list actually describes seats of this match, before the match starts rather than
 * three turns in when a HUD row is named after a seat nobody is sitting on.
 *
 * The same argument as `assertDeps` in [match.js](match.js): the failure is a programming error, and
 * the useful moment to hear about it is the moment it is made.
 */
export function assertBotSeats(seats, bots) {
  if (!Array.isArray(bots)) {
    throw new TypeError(`bots must be an array of seat numbers, got ${typeof bots}`);
  }

  for (const seat of bots) {
    if (!seats.includes(seat)) {
      throw new RangeError(
        `bot seat ${seat} is not one of the seats in play (${seats.join(", ")})`
      );
    }
  }

  if (new Set(bots).size !== bots.length) {
    throw new RangeError(`bots must not repeat a seat, got ${bots.join(", ")}`);
  }
}

/** Does this seat play itself? The question every view and every guard asks. */
export function isBot(state, seat) {
  return (state.bots ?? []).includes(seat);
}

/** The seats with a person behind them, in seat order. */
export function humanSeats(state) {
  return state.seats.filter((seat) => !isBot(state, seat));
}

/**
 * Does the screen have to change hands before `seat` plays?
 *
 * Two things make the hand-over screen pointless, and this answers both at once:
 *
 * - **The next seat is a bot.** Nobody is being handed anything.
 * - **There is only one person in the match.** They never put the mouse down, so asking them to
 *   confirm that they are still themselves is a click for nothing.
 *
 * This lives in `state/` and not in `ui/` on the precedent of `seatOnShow` in
 * [intents-cards.js](intents-cards.js#L127): it is a question about the screen, but it is answered
 * out of pure state, and putting it here is what makes it a unit test instead of a Playwright run.
 *
 * The consequence is worth stating plainly, because it is a rule change and not only a convenience:
 * with one human and three bots the hand-over screen never appears. The secrecy argument behind it
 * (decision D33, a player's cards stay their own) has nothing to protect when there is no second
 * person at the screen.
 */
export function handoverNeeded(state, seat) {
  return !isBot(state, seat) && humanSeats(state).length > 1;
}
