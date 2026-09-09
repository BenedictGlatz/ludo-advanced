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
 * ## The thirty seconds (FR-25) live next door since 2026-09-09
 *
 * The countdown is `reaction-clock.js`, split out when issue #42's `isLocal` guards took this file past
 * 300 lines. The seam was already drawn in this header: the clock is about time passing, and everything
 * else here is about a card being played. What this file keeps is the `announcement` timer, the D60 hold
 * that gives a trap fired by a card two seconds before the turn carries on.
 *
 * **`announcement` is deliberately not cleared by the clock's `stop`.** `syncClock` runs on every
 * advance where no window is open, so clearing the hold there would cancel it the instant it was set.
 * It is cleared by `stop()` below and by the loop's own `clearAll`, which is what a torn-down or paused
 * match needs.
 */

import { INTENT } from "../state/intents.js";
import { INTENT_CARD, seatOnShow } from "../state/intents-cards.js";
import { isBot } from "../state/bots.js";
import { motionMs } from "./board-view.js";
import { PROMPT_ACTION } from "./prompt-view.js";
import { createTargetPicker } from "./target-picker.js";
import { announcement, holdMidTurn } from "./holds.js";
import { REACTION_WINDOW_MS, createReactionClock } from "./reaction-clock.js";

export { REACTION_WINDOW_MS };

/**
 * The card half of the loop.
 *
 * `getState` and `apply` come from `game-loop.js` so that there is still exactly one state reference in
 * `ui/` and one place that dispatches. `refresh` re-renders; `resume` carries the turn on after something
 * this module dispatched changed the phase. `isLocal(seat)` says whether a person at this screen plays
 * `seat` (issue #42); the default is "not a bot", which is what a hot-seat match means.
 */
export function createCardControls({
  $board,
  timers,
  getState,
  apply,
  refresh,
  resume,
  delays = {},
  isLocal = (seat) => !isBot(getState(), seat),
}) {
  /** The announcement `carryOn` has already held for, so that one message is not held twice. */
  let held = null;

  /** Durations belong to `tokens.css`, so they are read off the board rather than written here. */
  const readToken = (token, fallback) => motionMs($board, token, fallback);

  /** The thirty seconds. `carryOn` is a function declaration below, so it is hoisted and safe here. */
  const clock = createReactionClock({
    timers,
    getState,
    apply,
    refresh,
    delays,
    onClosed: () => carryOn(),
  });
  const { secondsLeft, syncClock } = clock;

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
   * **A hand that is not this screen's is not clickable** (issues #43 and #42): a bot's during its own
   * turn, and online another person's during theirs or while a window asks them. `seatOnShow` is the
   * seat whose hand is drawn, so it is the seat the guard asks about; in hot-seat play it is always a
   * person during a window, because `bot-driver.js` empties the bots out of `eligible` first.
   */
  function onSkillCardActivated(cardId, slot) {
    if (picker.isPicking()) return;

    const state = getState();
    if (!isLocal(seatOnShow(state))) return;

    picker.start(state, cardId, slot, seatOnShow(state));
  }

  function onPromptAction(action, value) {
    const state = getState();

    switch (action) {
      case PROMPT_ACTION.SKIP:
        // Carry on is the active seat's own step, so nobody at another screen, or for a bot, presses it.
        if (!isLocal(state.activePlayer)) return;
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
    // Online, the seat on show may be a person at another screen, and this screen's Decline must not
    // answer the window for them (issue #42).
    if (!isLocal(seatOnShow(state))) return;
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
      clock.stop();
      timers.clear("announcement");
      picker.cancel();
    },
  };
}
