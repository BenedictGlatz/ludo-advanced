/**
 * More than one thing waiting at a time. Issue #38.
 *
 * `ui/` only, because `setTimeout` is a browser global and ESLint forbids it under `core/` and `state/`.
 * That ban is the reason this file exists at all: the thirty-second reaction window (FR-25) is a real
 * rule with a real number in it, and the rules layer is not allowed to read a clock. So the clock lives
 * here and expiry becomes an ordinary intent.
 *
 * ## Why a registry rather than a variable
 *
 * `game-loop.js` had **one** timer slot and a `later()` that cleared it unconditionally. That was right
 * while the only thing ever waiting was the pause before the turn changes hands. It stops being right the
 * moment a countdown runs at the same time: whichever of the two was scheduled second would silently
 * cancel the first, and the symptom would be a turn that never hands over, or a window that never shuts.
 *
 * Naming them makes that impossible to write by accident. `set("handover", ...)` and
 * `set("reaction", ...)` cannot cancel each other, and a name that is set twice replaces itself, which is
 * exactly what a countdown being restarted wants.
 *
 * ## What it is not
 *
 * It is not a scheduler and it does not tick. A countdown that has to be **displayed** needs a repeating
 * interval as well, and `reaction-prompt.js` owns that, because how often a number on screen is redrawn
 * is a presentation question and this file has no opinion on it.
 */

/**
 * A set of named timers.
 *
 * `window` is read from the caller's scope rather than injected, which is the same choice `game-loop.js`
 * already made: `ui/` is the layer that is allowed to know it is in a browser.
 */
export function createTimers() {
  const pending = new Map();

  function clear(name) {
    if (!pending.has(name)) return;

    window.clearTimeout(pending.get(name));
    pending.delete(name);
  }

  return {
    /**
     * Run `action` in `ms`, cancelling anything already waiting under this name.
     *
     * The entry is removed **before** `action` runs, so a callback that schedules the same name again
     * does not have its own timer cancelled out from under it. That is not hypothetical: the reaction
     * countdown restarts itself every second to redraw the number.
     */
    set(name, action, ms) {
      clear(name);
      pending.set(
        name,
        window.setTimeout(() => {
          pending.delete(name);
          action();
        }, ms)
      );
    },

    clear,

    /** Is something waiting under this name? What a test asks instead of watching the clock. */
    has(name) {
      return pending.has(name);
    },

    /** Cancel everything. Called when the loop stops, so a torn-down match leaves nothing running. */
    clearAll() {
      for (const name of [...pending.keys()]) clear(name);
    },
  };
}
