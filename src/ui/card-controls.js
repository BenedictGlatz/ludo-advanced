/**
 * Everything the player does with a card, and the thirty-second clock. Issues #33 and #34.
 *
 * `ui/` only. Split out of `game-loop.js` when that file would have passed 300 lines, and the seam is a
 * real one: the loop drives the **phases** of a turn, and this drives the **cards**. The loop asks two
 * questions of it (is a card play half finished, how many seconds are left) and hands it four DOM
 * handlers to bind.
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
 * | `handover` (the loop's) | The pause after a finished turn |
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
import { PROMPT_ACTION } from "./prompt-view.js";
import { createTargetPicker } from "./target-picker.js";

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
        if (apply({ type: INTENT.CLOSE_WINDOW })) resume();
      },
      windowMs()
    );
    timers.set("reaction-tick", tick, TICK_MS);
  }

  /** Every target is in, so the card can finally be played. */
  function onReady(cardId, seat, target) {
    if (!apply({ type: INTENT_CARD.PLAY_CARD, seat, cardId, target })) {
      refresh();
      return;
    }

    resume();
  }

  const picker = createTargetPicker({ $board, onReady, onChange: refresh });

  /**
   * A click on a card in the skill hand.
   *
   * The seat is `seatOnShow` and not simply the active player: during a reaction window the hand on screen
   * belongs to whoever is being asked, and they are the one playing the card.
   */
  function onSkillCardActivated(cardId, slot) {
    if (picker.isPicking()) return;

    const state = getState();

    picker.start(state, cardId, slot, seatOnShow(state));
  }

  function onPromptAction(action, value) {
    const state = getState();

    switch (action) {
      case PROMPT_ACTION.SKIP:
        if (apply({ type: INTENT.SKIP_ACTION })) resume();
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
    if (apply({ type: INTENT_CARD.DECLINE_REACTION, seat: seatOnShow(state) })) resume();
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

    /** Stop everything. Called when the loop stops, so a torn-down match leaves no clock running. */
    stop() {
      stopClock();
      picker.cancel();
    },
  };
}
