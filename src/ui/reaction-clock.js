/**
 * The thirty-second clock on a reaction window (FR-25). Split out of `card-controls.js` on 2026-09-09.
 *
 * `ui/` only, and without jQuery. The seam is the one that file's own header drew under "The thirty
 * seconds": the rules layer is not allowed to read a clock, so the countdown lives in `ui/` and expiry is
 * an ordinary intent. Everything else in `card-controls.js` is about a card being played; this is about
 * time passing, and the two were in one file only because both had started there.
 *
 * Two timers, which is why `timers.js` had to become a registry:
 *
 * | Timer | What it does |
 * | --- | --- |
 * | `reaction` | Fires once, at the deadline, and dispatches `close-window` |
 * | `reaction-tick` | Fires every second, only so the number on screen changes |
 *
 * **A timeout and "everybody declined" are the same dispatch**, which is what FR-25 asks for: if everyone
 * declines the window shuts at once without waiting, and if the clock runs out it shuts as though they
 * had. Nothing in `state/` can tell the two apart, and nothing needs to.
 *
 * The duration is overridable, like the loop's pauses, and `?fast=1` sets it to zero. Online (issue #42)
 * the host owns the clock and a guest only draws it: the guest's loop calls `syncClock` on every
 * incoming state, and its dispatcher refuses `close-window` locally, so the guest's expiry is a redraw and
 * the host's is the dispatch.
 */

import { INTENT } from "../state/intents.js";

/** How long a reaction window stays open (FR-25). The Product Owner's number. */
export const REACTION_WINDOW_MS = 30_000;

/** How often the countdown on screen is redrawn. One second, because it is displayed in seconds. */
const TICK_MS = 1000;

/**
 * The clock.
 *
 * `onClosed` is called after the clock has shut the window itself, so the caller can carry the turn on
 * with whatever hold the announcement needs. `getState`, `apply` and `refresh` are the loop's wiring.
 */
export function createReactionClock({ timers, getState, apply, refresh, delays = {}, onClosed }) {
  /** When the open window shuts, as a timestamp, or `null` when no window is open. */
  let deadline = null;

  function windowMs() {
    return delays.reaction ?? REACTION_WINDOW_MS;
  }

  /** Whole seconds left on the open window, or `null`. What the prompt prints. */
  function secondsLeft() {
    if (deadline === null) return null;

    return Math.max(0, Math.ceil((deadline - Date.now()) / TICK_MS));
  }

  function stop() {
    deadline = null;
    timers.clear("reaction");
    timers.clear("reaction-tick");
  }

  function tick() {
    refresh();
    if (deadline !== null) timers.set("reaction-tick", tick, TICK_MS);
  }

  /**
   * Start, keep or stop the clock, to match whether a window is open.
   *
   * Called by the loop on every advance. It is idempotent on purpose: a window that is still open keeps
   * the deadline it already had, so the thirty seconds cover **the whole window** rather than restarting
   * every time a seat plays or declines. That is what makes it one shared window and not one per player.
   */
  function syncClock() {
    if (getState().reactionWindow === null) {
      stop();
      return;
    }
    if (deadline !== null) return;

    deadline = Date.now() + windowMs();
    timers.set(
      "reaction",
      () => {
        stop();
        if (apply({ type: INTENT.CLOSE_WINDOW })) onClosed();
      },
      windowMs()
    );
    timers.set("reaction-tick", tick, TICK_MS);
  }

  return { secondsLeft, syncClock, stop };
}
