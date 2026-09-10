/**
 * How long the current match has been running. Issue #77, asked for by the Product Owner on 2026-09-10.
 *
 * `ui/` only, and without jQuery. The game state carries no time at all, by design: `state/` and `ai/`
 * are forbidden a clock so that a rules layer can be replayed in a test, and `turnNumber` is the only
 * time-like thing in the frozen state. So "how long has this match run" is **presentation state**, like
 * the reaction countdown in `reaction-clock.js`, and it lives beside the match in `match-session.js`
 * rather than inside it.
 *
 * ## What it measures, and what it does not
 *
 * Wall-clock time since `start()`, which `match-session.js` calls whenever a match is put on screen: a
 * fresh one, Play Again, and the online guest's mirror of the host's. **It keeps counting while the
 * match is paused.** The question the pause screen answers is "how long have we been at this", and a
 * player who opened the pause screen ten minutes ago has still been at it for ten minutes. A clock that
 * stopped under the pause screen would also have to stop under the handover curtain, the pool overview
 * and the win screen, each of which pauses the loop, and the number would then say something nobody
 * asked. Rejected for that reason, and recorded in the journal.
 *
 * Online, each screen runs its own clock from the moment its own match began, so a guest who joined
 * late reads a smaller number than the host. The two are not synchronised, because the host's state
 * carries no timestamp to synchronise from, and the difference is the seconds the guest spent connecting.
 *
 * ## Why the redraw is a named timer and not an interval
 *
 * `watch(redraw)` re-arms itself once a second under the name `match-tick` in a `timers.js` registry,
 * the same way `reaction-tick` does, so a torn-down session can clear it by name and a test can ask
 * whether it is armed without watching a real clock. It is idempotent: the pause screen's redraw calls
 * `watch` again on every tick, and a second call while the timer is armed does nothing.
 */

import { createTimers } from "./timers.js";

/** How often the number on the pause screen is redrawn. One second, because it is shown in seconds. */
export const TICK_MS = 1000;

const TICK = "match-tick";

/** Two digits, for the minutes and the seconds. */
function pad(value) {
  return String(value).padStart(2, "0");
}

/**
 * `mm:ss`, or `h:mm:ss` once a match has run for an hour.
 *
 * Digits and colons only, so the same string is right in both languages and the locale key that wraps
 * it (`pause.elapsed`) carries the words. A four-bot match with casts can take seven minutes, and a
 * four-person hot-seat match with reading time can take an hour, so both shapes are real.
 */
export function formatElapsed(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * The clock. `now` and `timers` are injectable so the unit test can move time by hand.
 */
export function createMatchClock({ now = () => Date.now(), timers = createTimers() } = {}) {
  /** When the current match began, as a timestamp, or `null` before the first match. */
  let startedAt = null;

  return {
    /** A match has just been put on screen: count from now. */
    start() {
      startedAt = now();
    },

    /** Milliseconds since the match began, or `null` when no match has begun. */
    elapsedMs() {
      return startedAt === null ? null : Math.max(0, now() - startedAt);
    },

    /** Call `redraw` once a second until `unwatch`. Idempotent while armed. */
    watch(redraw) {
      if (timers.has(TICK)) return;

      // Re-armed **before** the redraw, so a redraw that calls `watch` again finds it armed.
      const tick = () => {
        timers.set(TICK, tick, TICK_MS);
        redraw();
      };

      timers.set(TICK, tick, TICK_MS);
    },

    /** Stop redrawing. Safe to call when nothing is armed. */
    unwatch() {
      timers.clear(TICK);
    },
  };
}
