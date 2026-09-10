/**
 * What the view does between the player's clicks. Issue #62, extended by issues #33, #34 and #42.
 *
 * Since issue #42 the state cell is one file over, in `loop-store.js`: that module holds the current
 * state object, hands intents to a dispatcher and replaces its own reference with whatever comes back.
 * This file decides **when** an intent is dispatched without a click, and nothing else.
 *
 * ## The four controls, and what still happens by itself
 *
 * **What a click *means* moved out of this file in issue #39.** `turn-controls.js` owns the dice card and
 * the pawn, `card-controls.js` owns the cards and the prompt, and the always-present chrome belongs to
 * `match-flow.js`, which owns the pause screen the button opens. What is left here is the question this
 * file is named for: what the game does when nobody is clicking.
 *
 * | Control | Phase it answers | Landed in |
 * | --- | --- | --- |
 * | Pick one of three dice cards | `choose` | Issue #31 |
 * | Play a skill card, or carry on | `action` | Issue #34 |
 * | Pick a pawn, then commit it | `act` | Issue #62 |
 * | Play a Reaction, or decline | any, while a window is open | Issue #33 |
 *
 * **Since issue #43 a seat can answer all four without a person**, and `bot-driver.js` is the fifth
 * sibling. A bot is a player without a screen. **Since issue #42 a seat can answer them from another
 * screen**, and to this loop that is the same thing: `isLocal(seat)` in the store says who may click
 * here, and a remote person's seat is unclickable and face down exactly as a bot's is.
 *
 * Three steps still happen without the player, and `state/auto-steps.js` names them: the roll rolls
 * itself, an empty window shuts, and the action phase is skipped when the active player holds nothing
 * playable. **The turn hands over on its own** only when nobody is watching for it: since issue #39 the
 * pause after a move ends in the handover overlay, and `handover.js` decides whether one is needed.
 *
 * ## Two doors in, since issue #42
 *
 * A click enters through `apply` on the wiring, as it always did. An intent from another screen enters
 * through `submit`, which is `apply` followed by `advance()`: the host's session validates it first and
 * hands it in here, so the loop treats a remote click exactly as a local one. `submit` refuses while the
 * match is paused, because `advance()` would restart the timers under the pause screen.
 *
 * ## The waiting is not in this file any more
 *
 * Both of the waits the loop takes by itself live in `turn-waits.js`, the reaction window's thirty
 * seconds are `card-controls.js`'s, and the bot's pause is `bot-driver.js`'s. The five siblings are built
 * in `loop-parts.js`, with the `halt` that stops all of them.
 */

import { MATCH_STATUS, TURN_PHASE } from "../state/game-state.js";
import { autoIntent } from "../state/auto-steps.js";
import { seatOnShow } from "../state/intents-cards.js";
import { abandonMatch } from "../state/match.js";
import { nextSeat } from "../state/turn-resolution.js";
import { bindMatchEvents } from "./events.js";
import { createLoopParts } from "./loop-parts.js";
import { createLoopStore } from "./loop-store.js";
import { createRenderer } from "./render.js";
import { createTimers } from "./timers.js";

/**
 * Drive a match. `deps` is the injected `{ rng, diceSource }` pair (NFR-09).
 *
 * `parts` is every region of the page, and it is passed through to `render.js` whole rather than
 * destructured here. Only four of the seven are named below, and that is the point: the board, the two
 * hands and the prompt are the ones the loop **binds events to**.
 *
 * `dispatcher` and `localSeats` are the two options online play added, and both go straight to the
 * store. Their defaults are `dispatch` and "everybody who is not a bot", which is today's hot-seat match.
 */
export function createGameLoop({
  initialState,
  deps,
  parts,
  delays = {},
  onCurtain = null,
  onMatchOver = null,
  skipHandover = false,
  dispatcher = undefined,
  localSeats = null,
}) {
  const { $board, $diceHand, $skillHand, $prompt } = parts;

  const store = createLoopStore({ initialState, deps, dispatcher, localSeats });
  let finished = false;
  let paused = false;
  const timers = createTimers();
  const draw = createRenderer(parts);

  /**
   * Redraw, with the presentation state that is not in the frozen game state.
   *
   * Three pieces belong to `card-controls.js` and the fourth to `handover.js`: which seat's person is
   * actually in front of the screen, which is what decides whether the hand on show is face up.
   */
  function render() {
    draw(store.getState(), {
      selectedSlot: cards.selectedSlot(),
      secondsLeft: cards.secondsLeft(),
      pick: cards.pick(),
      viewerSeat: handover.seat(),
      canAct: store.isLocal(store.getState().activePlayer),
      // The seat a window asks is `eligible[0]`, and it is a bot for the 900 ms a bot's card play
      // waits out. Decline is drawn only when it is a person here (issue #77).
      canAnswer: store.isLocal(seatOnShow(store.getState())),
    });
  }

  /**
   * What every sibling that can wait needs from the loop: the timer registry, the durations, the one
   * state reference, the one dispatcher, the question of who may click here, and the two ways back in.
   * `loop-parts.js` carries why it is one object rather than the same arguments written out five times.
   */
  const wiring = {
    timers,
    delays,
    getState: store.getState,
    apply: store.apply,
    isLocal: store.isLocal,
    refresh: render,
    resume: () => advance(),
  };

  const { board, bots, cards, handover, waits, halt } = createLoopParts({
    parts,
    wiring,
    onCurtain,
    skipHandover,
  });

  /**
   * Render, then take whatever step the turn takes without the player.
   *
   * The recursion is bounded rather than a growing stack: every branch either advances the phase or
   * returns, and the handover comes back round through a timer.
   */
  function advance() {
    const state = store.getState();
    render();

    if (state.status !== MATCH_STATUS.RUNNING) {
      halt();

      // Guarded, because `advance()` is re-entered after every accepted intent and the match-over
      // screen must open once rather than on every pass.
      if (!finished) {
        finished = true;
        onMatchOver?.(state);
      }
      return;
    }

    // **The moments the turn owes, asked before the phase and not inside a branch**, because both of
    // them arrive through more doors than one: a roll happens in `roll-die` when no card answers it
    // and in `close-window` when one did, and a card is played by a person, by a bot, into an open
    // window, or by the window shutting. `turn-waits.js` carries the argument and what it cost to learn.
    if (waits.takeMoment(state)) return;

    if (state.reactionWindow !== null) {
      // **Bots answer first**, so the clock and the prompt only ever address people. A window with
      // nobody but bots in it shuts at once instead of running a thirty-second countdown, and in a
      // mixed round `seatOnShow`, which is `eligible[0]`, is a person.
      if (bots.answerWindow()) return;

      // **After the bots and before the clock.** The seat being asked may be a person who is not
      // holding the device, and their hand must not come up face down and unusable in front of the
      // player whose turn it still is.
      if (handover.handTo(seatOnShow(state))) return;

      if (cards.handleWindow()) return;
      advance();
      return;
    }

    // The three steps the loop takes by itself: skip an action phase with nothing playable, roll, and
    // close the reaction phase. One list in `state/auto-steps.js`, shared with the host's guard.
    const auto = autoIntent(state);
    if (auto !== null) {
      if (!store.apply(auto)) return;
      advance();
      return;
    }

    if (state.phase === TURN_PHASE.TURN_END) {
      // The callback reads the store when it fires, not the `state` captured above: the hold is real
      // time, and a remote intent could in principle have moved the state on before it runs.
      waits.afterTurn(() => handover.handTo(nextSeat(store.getState()), { endsTurn: true }));
      return;
    }

    // A bot in `choose`, in `action` holding a playable card, or in `act`. It comes **after** the
    // self-taken steps above, so a bot with nothing playable is skipped through the action phase with no
    // pause at all, rather than appearing to think about a decision it does not have.
    if (bots.takeTurn()) return;

    // The three phases below wait for a person, and after a reaction window that person's device may
    // still be in somebody else's hands. This is the curtain back, and it costs nothing in every turn
    // where the window never moved the viewer.
    if (handover.handTo(state.activePlayer)) return;

    // `choose`, `action` with a card in hand, and `act` are the phases that wait for a person.
  }

  return {
    /** Put the board on screen and start the first turn. */
    start() {
      bindMatchEvents({ $board, $diceHand, $skillHand, $prompt }, { board, cards });
      advance();
    },

    /**
     * Redraw without advancing the turn.
     *
     * The flow calls this after a language change. Every view rewrites its own text from `t()` on every
     * update, so a plain redraw is the whole of FR-34's "every visible string changes".
     */
    refresh: render,

    /**
     * Stop every pending timer, and take the throw off the dice hand if one was running.
     *
     * The attribute matters as much as the timers: a match torn down mid-roll would otherwise leave a
     * card frozen part way through its throw. `waits.stop()` is what handles that half.
     */
    stop: halt,

    /**
     * The handover overlay's Ready button: the person named on the curtain now has the device.
     *
     * A turn-end curtain still passes the turn; a mid-turn one carries the window on. Which of the two
     * it was is `handover.js`'s to remember, not the button's.
     */
    arrive: handover.arrive,

    /** Pass the turn on without a curtain. Who decides the screen changed hands is the flow's question. */
    passTurn: handover.passTurn,

    /**
     * Freeze the match (FR-07). Every pending timer and the reaction clock stop.
     *
     * The state object is untouched, because a pause is not a game event: nothing in the rulebook knows
     * about it, and putting it in the frozen state would make the rules layer hold a fact about a button.
     * **This is also why a bot can never move under an overlay**: `halt()` clears its pending timer.
     */
    pause() {
      paused = true;
      halt();
    },

    /**
     * Carry on from where the pause left off.
     *
     * `advance()` re-enters whatever phase the turn was in, which is why pausing needs to save nothing.
     * A reaction window that was open reopens its clock at the full thirty seconds: the players stopped,
     * so the window did too.
     */
    resume() {
      paused = false;
      advance();
    },

    /**
     * An intent from another screen (issue #42): apply it and let the turn carry on, exactly as a click
     * does. `false` when it was refused, or when the match is paused and a step now would restart the
     * timers under the pause screen. The host's session answers the guest from that boolean.
     */
    submit(intent) {
      if (paused) return false;
      if (!store.apply(intent)) return false;

      advance();
      return true;
    },

    /**
     * Give the match up from outside the rules (issue #42): a guest's connection dropped and there is
     * no reconnect. `abandonMatch` is the same transition the pause screen's Quit would reach, and
     * `advance()` then does what it does for any finished match: halt and open the win screen. `by` is
     * the seat that dropped, when the caller knows it, so the win screen can name it (D121.3).
     */
    abandon(by = null) {
      store.replace(abandonMatch(store.getState(), by));
      advance();
    },

    /** The current state, for tests and for the browser console. Frozen, so it cannot be written. */
    getState: store.getState,
  };
}
