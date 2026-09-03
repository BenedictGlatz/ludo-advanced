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
 * How long a refusal stays on screen before the turn passes.
 *
 * D9 of the design spec: the strip "stays until the player's next action, and at minimum for 4 seconds".
 * With the pawn click as the only control there was no next action to wait for, so the minimum was the
 * whole rule.
 *
 * **This is the fallback now and not the number.** It used to be the only place the four seconds existed,
 * which the previous version of this comment flagged as a design decision living outside the design.
 * D20 of design spec 04 answered it: the duration is `--motion-refusal-hold` in `tokens.css`, and
 * `game-loop.js` reads it off the board with `motionMs` the same way it already reads `--motion-capture`.
 * What is left here is what to use when no stylesheet has loaded, which happens in a test harness rather
 * than in a browser.
 *
 * It lives here rather than in `game-loop.js` since issue #39, because this module is where the game's
 * named waits belong and it was the only thing left in the loop that was a duration rather than a step.
 */
export const REFUSAL_MIN_MS = 4000;

/**
 * How long to leave the finished turn on screen before the handover screen covers it.
 *
 * Moved out of `game-loop.js` in issue #45, and the seam is not the line count: **the loop decides
 * *that* it waits, this module decides *how long*.** Every other named wait in the game was already
 * here, and this was the last duration left in the loop.
 *
 * Three cases, longest first, because they are checked in order and a refusal outranks a report:
 *
 * 1. **A refusal** holds for `--motion-refusal-hold`, which is D20's answer: the strip stays until the
 *    player's next action and at minimum for four seconds.
 * 2. **A trap that went off, or a card an aura cancelled** get the same hold. This is new in issue #45
 *    and it is the point of the whole announcement: a Banana Peel does not move the pawn, so if the
 *    handover screen covers the board on the ordinary move timer, the only evidence that a turn was
 *    taken away is gone before anybody reads it. It is exactly the argument D9 made for a refusal,
 *    applied to something that happened rather than something that was refused.
 * 3. **An ordinary move** waits `--motion-capture`, long enough for the piece to finish travelling.
 *
 * Both durations are read out of `tokens.css` rather than written here, so the design owns the numbers.
 * `delays` lets a test override either without a stylesheet, and `REFUSAL_MIN_MS` is the fallback when
 * no stylesheet has loaded at all.
 *
 * A trap fired **mid-turn** by a card is the other half of this and it is `holdMidTurn` below. It was
 * open as D60 of design brief 07 when this comment was first written; design spec 07 answered it on
 * 2026-09-03 with a shorter number and its own token.
 */
export function holdAfterTurn(state, delays, readToken) {
  if (state.refusalReason !== null) {
    return delays.afterRefusal ?? readToken("--motion-refusal-hold", REFUSAL_MIN_MS);
  }

  if (announcement(state) !== null) {
    return delays.afterTrap ?? readToken("--motion-refusal-hold", REFUSAL_MIN_MS);
  }

  return delays.afterMove ?? readToken("--motion-capture", 320);
}

/**
 * How long a mid-turn announcement is guaranteed on screen. The fallback, not the number.
 *
 * D60 puts the number in `--motion-trap-hold`, and this is what to use when no stylesheet has loaded,
 * which happens in a test harness rather than in a browser. Same arrangement as `REFUSAL_MIN_MS`.
 */
export const TRAP_HOLD_MS = 2000;

/**
 * What the message strip is currently announcing, or `null`.
 *
 * One definition, because three callers need the same answer and two of them are in another file. A
 * trap that went off outranks a card an aura cancelled, which matches the order `move-hints.js` prints
 * them in: both cannot be true of one event.
 *
 * **It returns the value and not a boolean**, and `card-controls.js` depends on that. The value is the
 * frozen object `resolveMove` produced, so comparing two calls by identity answers "is this still the
 * same announcement I already held for", which is what stops one announcement being held twice.
 */
export function announcement(state) {
  return state.trapFired ?? state.nullifiedCard ?? null;
}

/**
 * How long to hold the turn after a card announced something, before carrying on. `0` means carry on now.
 *
 * The other half of `holdAfterTurn`: that one is asked when the turn has ended, this one mid-turn.
 *
 * ## Why the two are different numbers
 *
 * D60's argument, and it is D20's with a shorter answer. A refusal follows the player's own click, so
 * they are already looking at the board and four seconds is a minimum for reading something they asked
 * for. A trap fired by a card interrupts a turn that is under way and arrives unasked, so what it needs
 * is a **guaranteed** window rather than a long one. Two seconds cannot be missed and does not turn a
 * turn with two traps in it into a slideshow.
 *
 * ## Why a refusal gets nothing here
 *
 * `holdAfterTurn` holds for a refusal and this deliberately does not, which is the one place the two
 * functions are not symmetrical. A refusal mid-action-phase is not an announcement: the player asked for
 * something and was told no, and they are still holding the controls. Copying the branch across would be
 * the natural mistake and there is a test pinning it.
 *
 * `--motion-trap-hold` is a reading time and not a motion, which is why the token sits outside
 * `tokens.css`'s `prefers-reduced-motion` block: a player who asked for less movement has not asked for
 * less time to read.
 */
export function holdMidTurn(state, delays, readToken) {
  if (announcement(state) === null) return 0;

  return delays.afterTrapCard ?? readToken("--motion-trap-hold", TRAP_HOLD_MS);
}

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
