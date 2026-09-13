/**
 * The one state reference in `ui/`, and the one place that dispatches. Issue #42.
 *
 * `ui/` only, and deliberately **without jQuery and without i18next**, so it runs in Vitest's `node`
 * environment. Split out of `game-loop.js` along the sentence that file's own header opens with: "the
 * only stateful thing in `ui/`: it holds the current state object, hands intents to `state/`, and
 * replaces its own reference with whatever comes back". That sentence is this file.
 *
 * ## Why the cell moved
 *
 * Online play (FR-42) needs two things the loop's closure variable could not give:
 *
 * - **A dispatcher that is not `dispatch`.** The host dispatches and then broadcasts the new state to
 *   every guest; a guest does not dispatch at all, it sends the intent to the host and waits for the
 *   echo. Both are the same shape as `dispatch(state, intent, deps)` and return `{ accepted, state }`,
 *   so the loop and its five siblings never learn which one they are talking to.
 * - **A way to replace the state from outside.** The guest's state arrives over the wire, and `replace`
 *   is the one door it comes in through. The hot-seat loop never calls it.
 *
 * ## `isLocal`: who may click, on this screen
 *
 * Every guard in `ui/` used to ask `isBot(state, seat)` to decide whether a click is a person's to make.
 * Online, a seat can be a person **on another screen**, and to this screen that person is exactly what
 * a bot is: not clickable, hand never face up, no curtain. `isLocal(seat)` is that one question with an
 * answer that depends on the screen, and this is where it lives because it needs the state reference.
 *
 * The default reproduces today's behaviour to the letter, `seat => !isBot(state, seat)`, so every
 * hot-seat unit test and end-to-end spec written before this file passes unchanged. `bot-driver.js` is
 * deliberately not routed through it: it asks `decide`, which reads `state.bots`, so the AI never plays
 * a remote human's seat.
 */

import { isBot } from "../state/bots.js";
import { dispatch } from "../state/intents.js";

/**
 * A store over one state object.
 *
 * - `initialState` is the frozen state the match starts from.
 * - `deps` is the injected `{ rng, diceSource }` pair (NFR-09), handed to the dispatcher unchanged.
 * - `dispatcher(state, intent, deps)` returns `{ accepted, state }`. `dispatch` from `state/` by
 *   default; the host's broadcasting dispatcher and the guest's sending one otherwise.
 * - `localSeats` is the list of seats whose people sit at this screen, or `null` for "everybody who is
 *   not a bot", which is what a hot-seat match means.
 */
export function createLoopStore({ initialState, deps, dispatcher = dispatch, localSeats = null }) {
  let state = initialState;

  /**
   * Hand one intent to the dispatcher and keep the answer.
   *
   * A refused intent leaves `state` exactly as it was, and the caller is told so. Every caller in
   * `ui/` stops on a refusal rather than trying again, which is what keeps a rejected intent from
   * turning into a loop that dispatches the same impossible thing forever.
   */
  function apply(intent) {
    const result = dispatcher(state, intent, deps);
    if (result.accepted) state = result.state;

    return result.accepted;
  }

  return {
    /** The current state. Frozen, so it cannot be written. */
    getState: () => state,

    apply,

    /**
     * Take a state that arrived from somewhere else. The guest's echo, and nothing in hot-seat play.
     *
     * No dispatch and no check: the host already applied the rules, and a guest that second-guessed the
     * host would be two sources of truth for one match.
     */
    replace(next) {
      state = next;
    },

    /** Does a person at this screen play `seat`? See the header. */
    isLocal(seat) {
      return localSeats === null ? !isBot(state, seat) : localSeats.includes(seat);
    },
  };
}
