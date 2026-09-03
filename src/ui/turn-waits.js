/**
 * The two waits the turn loop takes by itself. Design spec 11, D70.
 *
 * `ui/` only. Split out of `game-loop.js` when D70's roll hold would have pushed it past 300 lines
 * (NFR-02), and the seam is the one `card-controls.js` and `turn-controls.js` already cut twice: the loop
 * drives the **phases** of a turn, and a sibling module owns each thing that happens inside them.
 *
 * ## Three waits, three owners
 *
 * | Wait | What it holds for | Who owns it |
 * | --- | --- | --- |
 * | The roll | 900 ms, so the number that the whole turn hangs on has a frame of its own (D70) | here |
 * | Before the handover | A move has to finish arriving and a refusal has to be readable (D9, D20) | here |
 * | A mid-turn announcement | A trap fired by a card, 2 s (D60) | `card-controls.js` |
 *
 * The third one is not here and that is deliberate, not an oversight. It belongs to a card being played,
 * which is `card-controls.js`'s subject, and it is entered from four call sites in that file rather than
 * from the loop. What these two share is that **nobody clicked anything**: they are the pauses the game
 * takes on its own, which is exactly what `game-loop.js` is named for and exactly the part of it that had
 * grown too big to stay.
 *
 * ## The durations are the design's numbers and not this file's
 *
 * Every one of them is read out of `tokens.css` off the board, the same way since issue #45, so the design
 * owns the value and this file owns only the decision to wait. `timers.js` holds the fallbacks for a test
 * harness with no stylesheet loaded, and it holds the *choice of token*, which is the seam that module
 * describes: the loop decides **that** it waits, `timers.js` decides **how long**, and this decides *when*.
 *
 * All of them are overridable through `delays`, which is what lets a Playwright run take seconds instead
 * of minutes. `?fast=1` sets every one of them to zero. **The shape of the turn is identical either way
 * and only the waiting is shorter**, which is the property that makes the override safe: nothing in the
 * game state depends on a hold, no rule branches on one, and no value changes while one runs.
 */

import { endRoll } from "./dice-hand-view.js";
import { motionMs } from "./board-view.js";
import { holdAfterTurn, holdRoll } from "./timers.js";

/**
 * The loop's two waits.
 *
 * `parts` is the whole page, taken as one object rather than destructured, because the two regions needed
 * here are the board (which the tokens are read off) and the dice hand (which carries `data-rolling`), and
 * naming just those two would go stale the first time a third wait needs a third region.
 *
 * `getState`, `refresh` and `resume` come from `game-loop.js` for the reason `card-controls.js` gives: one
 * state reference in `ui/`, one place that dispatches, and no module that can get out of step with the
 * loop's copy of it.
 */
export function createTurnWaits({ parts, timers, delays = {}, getState, refresh, resume }) {
  const { $board, $diceHand } = parts;

  /** Durations belong to `tokens.css`, so they are read off the board rather than written here. */
  const readToken = (token, fallback) => motionMs($board, token, fallback);

  /** The turn whose roll has already had its moment, so one roll is never held twice. */
  let heldTurn = null;

  /**
   * Has a roll just appeared that has not been shown yet?
   *
   * **A roll arrives through two doors and this is the only test that catches both**, which cost a red
   * suite to find out. The obvious place for the hold was the loop's `roll` branch, right after
   * `apply(ROLL_DIE)`, and that misses the more interesting half of the cases:
   *
   * 1. **No card answers the roll.** `handleRollDie` rolls, and the loop's branch sees the number.
   * 2. **A card does.** `handleRollDie` opens the on-roll window instead and rolls nothing, and it is
   *    `resumeAfterWindow` at `intents.js` line 164 that rolls, dispatched as `close-window` out of
   *    `card-controls.js`. The loop's `roll` branch is never re-entered, so a hold hanging off it would
   *    have been skipped exactly when a Critical Failure or a Devil Die had changed the number, which
   *    is the roll most worth showing.
   *
   * The symptom of getting it wrong was not a missing animation. `roll.css` puts `pointer-events: none`
   * on a rolling row, `dice-hand-view.js` sets the attribute from the state on any render, and only this
   * module takes it off, so the second door left the dice hand permanently unclickable from that turn on.
   * Three end-to-end specs failed on a click that never landed.
   *
   * So the question is asked of the **state** and not of the phase: a roll exists and this turn has not
   * been held for. `state.turnNumber` is the marker rather than the roll itself, because a roll of 0 is a
   * real result once a card can subtract from a die.
   */
  function needsRollMoment(state) {
    return state.roll !== null && state.turnNumber !== heldTurn;
  }

  /**
   * Give the roll its moment, then carry the turn on. D70.
   *
   * ## Four details, and three of them are `carryOn`'s in `card-controls.js`
   *
   * **`refresh()` comes first.** The intent has already changed the state and drawn nothing, so a bare
   * wait would hold for 900 ms with the roll not on screen at all. That pass is also the one that sets
   * `data-rolling` and writes the number into the badge, which is D72: both follow from `state.roll`
   * being set, so they arrive together and cannot be sequenced wrongly.
   *
   * **Zero resumes synchronously rather than through the registry.** `?fast=1` overrides the hold to 0,
   * and `timers.set(..., 0)` would defer `advance()` to a macrotask. Every end-to-end spec in the suite
   * was written against the ordering the loop has today, so a zero hold has to be no hold at all.
   *
   * **The attribute comes off in both paths.** Forgetting it in the zero path is the mistake that would
   * only show up under `?fast=1`, which is where nobody is looking at the screen.
   *
   * **The fourth is this file's own, and it is the one that is not obvious.** While the hold runs the
   * phase is already `act`, so the pawns are movable and a quick player can finish the turn before the
   * 900 ms are up. If the timer then called `advance()` it would re-enter a phase that has moved on and,
   * in the `turn-end` case, restart the handover pause that is already counting. So the turn number is
   * captured when the hold starts and the resume is skipped if it changed. The attribute is still cleared,
   * because that has to happen before the next deal whatever else did.
   */
  function showRoll() {
    refresh();

    const turnNumber = getState().turnNumber;
    const ms = holdRoll(delays, readToken);

    // Before anything that can re-enter the loop, or `resume()` would come straight back here.
    heldTurn = turnNumber;

    if (ms <= 0) {
      endRoll($diceHand);
      resume();
      return;
    }

    timers.set(
      "roll",
      () => {
        endRoll($diceHand);
        if (getState().turnNumber === turnNumber) resume();
      },
      ms
    );
  }

  /**
   * Leave the finished turn on screen, then hand it on.
   *
   * **The wait comes first either way.** A move has to finish animating and a refusal has to be on screen
   * long enough to read (D9) **before** the overlay covers the board, so the handover screen opens on the
   * same timer that used to pass the turn. `next` is either the loop passing the turn itself or the flow
   * opening the handover screen, and which of the two it is makes no difference to the waiting.
   */
  function afterTurn(next) {
    timers.set("handover", next, holdAfterTurn(getState(), delays, readToken));
  }

  return {
    needsRollMoment,
    showRoll,
    afterTurn,

    /**
     * Stop waiting. Called when the loop stops or pauses, so a torn-down match leaves nothing running.
     *
     * The attribute is taken off as well as the timer cancelled. A match paused mid-roll would otherwise
     * come back with a card frozen mid-throw, because `resume()` re-enters the phase the turn was in and
     * the phase after a roll is `act`, which never passes through here again.
     */
    stop() {
      timers.clear("roll");
      timers.clear("handover");
      endRoll($diceHand);
    },
  };
}
