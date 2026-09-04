/**
 * Everything the player does with a card, and the thirty-second clock. Issues #33 and #34.
 *
 * `ui/` only. Split out of `game-loop.js` when that file would have passed 300 lines, and the seam is a
 * real one: the loop drives the **phases** of a turn, and this drives the **cards**. The loop asks three
 * questions of it (is a card play half finished, how many seconds are left, and is a person being asked
 * something right now) and hands it four DOM handlers to bind.
 *
 * The third question is `handleWindow` and it arrived the same way this file did: `game-loop.js` passed
 * 300 lines again on 2026-09-03, when the roll got a hold of its own. It was the branch of the loop that
 * read a window this module already owned end to end, so it came here rather than to a new file.
 *
 * ## The thirty seconds (FR-25)
 *
 * The rules layer is not allowed to read a clock, so the countdown is here and expiry is an ordinary
 * intent. Two timers, which is why `timers.js` had to become a registry:
 *
 * | Timer | What it does |
 * | --- | --- |
 * | `reaction` | Fires once, at the deadline, and dispatches `close-window` |
 * | `reaction-tick` | Fires every second, only so the number on screen changes |
 * | `announcement` | The D60 hold: a trap fired by a card gets two seconds before the turn carries on |
 * | `handover` (the loop's) | The pause after a finished turn |
 *
 * **`announcement` is deliberately not cleared by `stopClock`.** `syncClock` calls that on every advance
 * where no window is open, so clearing the hold there would cancel it the instant it was set. It is
 * cleared by `stop()` and by the loop's own `clearAll`, which is what a torn-down or paused match needs.
 *
 * **A timeout and "everybody declined" are the same dispatch**, which is what FR-25 asks for: if everyone
 * declines the window shuts at once without waiting, and if the clock runs out it shuts as though they
 * had. Nothing in `state/` can tell the two apart, and nothing needs to.
 *
 * The duration is overridable, like the loop's two pauses, and `?fast=1` sets it to zero. That is what
 * keeps a Playwright run from spending thirty seconds per window; the shape of the turn is identical
 * either way and only the waiting is shorter.
 */

import { INTENT } from "../state/intents.js";
import { INTENT_CARD, seatOnShow } from "../state/intents-cards.js";
import { isBot } from "../state/bots.js";
import { motionMs } from "./board-view.js";
import { PROMPT_ACTION } from "./prompt-view.js";
import { createTargetPicker } from "./target-picker.js";
import { announcement, holdMidTurn } from "./timers.js";

/** How long a reaction window stays open (FR-25). The Product Owner's number. */
export const REACTION_WINDOW_MS = 30_000;

/** How often the countdown on screen is redrawn. One second, because it is displayed in seconds. */
const TICK_MS = 1000;

/**
 * The card half of the loop.
 *
 * `getState` and `apply` come from `game-loop.js` so that there is still exactly one state reference in
 * `ui/` and one place that dispatches. `refresh` re-renders; `resume` carries the turn on after something
 * this module dispatched changed the phase.
 */
export function createCardControls({
  $board,
  timers,
  getState,
  apply,
  refresh,
  resume,
  delays = {},
}) {
  /** When the open window shuts, as a timestamp, or `null` when no window is open. */
  let deadline = null;

  /** The announcement `carryOn` has already held for, so that one message is not held twice. */
  let held = null;

  /** Durations belong to `tokens.css`, so they are read off the board rather than written here. */
  const readToken = (token, fallback) => motionMs($board, token, fallback);

  function windowMs() {
    return delays.reaction ?? REACTION_WINDOW_MS;
  }

  /** Whole seconds left on the open window, or `null`. What the prompt prints. */
  function secondsLeft() {
    if (deadline === null) return null;

    return Math.max(0, Math.ceil((deadline - Date.now()) / TICK_MS));
  }

  function stopClock() {
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
      stopClock();
      return;
    }
    if (deadline !== null) return;

    deadline = Date.now() + windowMs();
    timers.set(
      "reaction",
      () => {
        stopClock();
        if (apply({ type: INTENT.CLOSE_WINDOW })) carryOn();
      },
      windowMs()
    );
    timers.set("reaction-tick", tick, TICK_MS);
  }

  /**
   * An open window, handled before the phase, because one can be open in three different phases and the
   * phase does not change while it is. The loop calls this and stops when it returns `true`.
   *
   * Two ways out, and this takes only the first: **`eligible` is empty**, so there is nobody left to wait
   * for and the window shuts at once (FR-25). The other way is the clock above. Returning `true` means
   * "stop, a person is being asked something".
   *
   * **It moved here from `game-loop.js` on 2026-09-03** when D70's roll hold pushed that file past its
   * 300 lines, and the seam was already drawn: this module owns the window's clock, its prompt and its
   * closing, and the loop was left holding the one branch that reads it. The loop still decides *where in
   * a turn* the question is asked, which is why the call site is still a branch in `advance()`.
   */
  function handleWindow() {
    if (getState().reactionWindow.eligible.length > 0) {
      syncClock();
      refresh();
      return true;
    }

    if (!apply({ type: INTENT.CLOSE_WINDOW })) return true;
    syncClock();

    return false;
  }

  /**
   * Carry the turn on, after giving a mid-turn announcement its guaranteed time on screen (D60).
   *
   * Every call to `resume` in this file goes through here, including the two that cannot produce an
   * announcement on their own. That is the point: the marker below makes the extra two free, and one
   * function is what stops the next call site somebody adds from forgetting.
   *
   * ## Three details, each of which was a bug in an earlier draft
   *
   * **`refresh()` comes first.** `apply` changes the state and draws nothing, so a bare delay would hold
   * for two seconds with the strip not yet on screen at all, which is the opposite of what D60 asks for.
   *
   * **Zero resumes synchronously rather than through the registry.** `?fast=1` overrides the hold to 0,
   * and `timers.set(..., 0)` would defer `advance()` to a macrotask. Every end-to-end spec in the suite
   * was written against the ordering this file has today, so a zero hold has to be no hold at all.
   *
   * **`held` stops one announcement being held twice.** `trapFired` is a turn-level field, cleared only
   * when the turn ends, so it is still set when the player presses Skip during the hold. Without the
   * marker that second pass would see an announcement and schedule another two seconds. The comparison
   * is by identity against the frozen object the rules layer produced. `nullifiedCard` is a card id, so
   * the same card nullified twice in one turn compares equal and holds once, which is the right answer
   * for the player: it is the same sentence on screen either way.
   *
   * **It delays the loop and does not block input**, which is deliberate. While it runs the phase is
   * still `action`: `turn-controls.js` ignores a pawn click outside `choose` and `act`, and
   * `applyMoveHints` paints nothing, so there is nothing on the board to click. What the player can
   * still do is play another card or press Skip, and either ends the hold early. That is the reading D9
   * already gave this strip: it stays until the player's next action. A deliberate click is the player
   * saying they have read it.
   */
  function carryOn() {
    refresh();

    const showing = announcement(getState());
    const ms = showing === held ? 0 : holdMidTurn(getState(), delays, readToken);

    held = showing;

    if (ms <= 0) {
      resume();
      return;
    }

    timers.set("announcement", resume, ms);
  }

  /** Every target is in, so the card can finally be played. */
  function onReady(cardId, seat, target) {
    if (!apply({ type: INTENT_CARD.PLAY_CARD, seat, cardId, target })) {
      refresh();
      return;
    }

    carryOn();
  }

  const picker = createTargetPicker({ $board, onReady, onChange: refresh });

  /**
   * A click on a card in the skill hand.
   *
   * The seat is `seatOnShow` and not simply the active player: during a reaction window the hand on screen
   * belongs to whoever is being asked, and they are the one playing the card.
   *
   * **A bot's hand is not clickable during its own turn** (issue #43). Declining an open window stays
   * allowed and needs no guard: `bot-driver.js` takes every bot out of `eligible` before the prompt is
   * drawn, so the seat on show during a window is always a person.
   */
  function onSkillCardActivated(cardId, slot) {
    if (picker.isPicking()) return;

    const state = getState();
    if (state.reactionWindow === null && isBot(state, state.activePlayer)) return;

    picker.start(state, cardId, slot, seatOnShow(state));
  }

  function onPromptAction(action, value) {
    const state = getState();

    switch (action) {
      case PROMPT_ACTION.SKIP:
        // Carry on is the bot's own step during its turn, so a person cannot press it for it.
        if (isBot(state, state.activePlayer)) return;
        if (apply({ type: INTENT.SKIP_ACTION })) carryOn();
        return;
      case PROMPT_ACTION.DECLINE:
        onDecline(state);
        return;
      case PROMPT_ACTION.CANCEL:
        picker.cancel();
        return;
      case PROMPT_ACTION.PICK:
        picker.pickValue(state, value);
        return;
      default:
        return;
    }
  }

  /**
   * One seat passes on the window.
   *
   * The clock is **not** restarted, and the window is closed here only when that decline emptied the
   * eligible list. Otherwise the next seat is asked with the same deadline still running.
   */
  function onDecline(state) {
    if (apply({ type: INTENT_CARD.DECLINE_REACTION, seat: seatOnShow(state) })) carryOn();
  }

  return {
    handlers: {
      onSkillCardActivated,
      onPromptAction,
      onPawnPicked: (player, pawn) => picker.pickPawn(getState(), player, pawn),
      onSquarePicked: (square) => picker.pickSquare(getState(), square),
    },

    /** What the prompt is asking for, or `null`. */
    pick: () => picker.current(getState()),
    /** Which slot of the hand is mid-play, or `-1`. */
    selectedSlot: () => picker.selectedSlot(),
    /** Is a card play half finished? The loop asks before it treats a pawn click as a move. */
    isPicking: () => picker.isPicking(),

    secondsLeft,
    syncClock,
    handleWindow,

    /**
     * The hold after a card play, handed to `bot-driver.js` as `afterCard` (issue #82).
     *
     * Exported rather than duplicated, because the two hard parts of it are not the delay: the marker
     * that stops one announcement being held twice, and the rule that a zero hold resumes
     * synchronously so the end-to-end suite's ordering is unchanged. A bot's card play needs both.
     */
    carryOn,

    /** Stop everything. Called when the loop stops, so a torn-down match leaves no clock running. */
    stop() {
      stopClock();
      timers.clear("announcement");
      picker.cancel();
    },
  };
}
