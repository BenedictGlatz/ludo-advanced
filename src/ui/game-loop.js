/**
 * What the view does between the player's clicks. Issue #62, extended by issues #33 and #34.
 *
 * This is the only stateful thing in `ui/`: it holds the current state object, hands intents to
 * `state/`, and replaces its own reference with whatever comes back. It never writes into a state
 * object, which `game-state.js` also makes impossible by freezing.
 *
 * ## The four controls, and what still happens by itself
 *
 * **What a click *means* moved out of this file in issue #39.** `turn-controls.js` owns the dice card and
 * the pawn, `card-controls.js` owns the cards and the prompt, and the always-present chrome belongs to
 * `match-flow.js`, which owns the pause screen the button opens. What is left here is the question this
 * file is named for: what the game does when nobody is clicking.
 *
 * The loop was built on 2026-08-30 with **the pawn click as its only control**. It now has four:
 *
 * | Control | Phase it answers | Landed in |
 * | --- | --- | --- |
 * | Pick one of three dice cards | `choose` | Issue #31 |
 * | Play a skill card, or carry on | `action` | Issue #34 |
 * | Pick a pawn, then commit it | `act` | Issue #62 |
 * | Play a Reaction, or decline | any, while a window is open | Issue #33 |
 *
 * **Since issue #43 a seat can answer all four without a person**, and that changed nothing here except
 * two lines in `advance()`. `bot-driver.js` is the fifth sibling and asks `src/ai/` the same questions
 * the four controls above answer from a click. A bot is a player without a screen.
 *
 * Two things still happen without the player, and both for a stated reason:
 *
 * - **`roll` rolls itself.** There is nothing to decide there. The phase exists so that the on-roll
 *   reaction window has a moment to open in, and so a roll animation has something to hang off (D70).
 * - **The turn hands over on its own** only when nobody is watching for it. Since issue #39 the pause
 *   after a move ends in the handover overlay rather than in the next turn: `onHandover` is called and a
 *   person presses Ready. The timer is still there and still uses the design's durations, because a move
 *   has to finish animating and a refusal has to be readable **before** anything covers the board. When
 *   no `onHandover` is given the loop passes the turn itself, which is what keeps a match driven straight
 *   out of `createGameLoop` playable and is how `?fast=1` keeps the end-to-end suite short.
 *
 * And one thing happens by itself only when there is nothing to decide: **the action phase is skipped
 * when the active player holds no playable card.** Waiting there would stall the game, which is not a
 * design choice but the difference between a working game and a hung one.
 *
 * ## The waiting is not in this file any more
 *
 * It used to be, and the durations with it. Since design spec 11's D70 the roll has a hold of its own,
 * so both of the waits the loop takes by itself live in `turn-waits.js`, the reaction window's thirty
 * seconds are `card-controls.js`'s, and the bot's pause is `bot-driver.js`'s. What is left here is the
 * decision to wait, never how long, and never what the waiting looks like.
 */

import { MATCH_STATUS, TURN_PHASE } from "../state/game-state.js";
import { INTENT, dispatch } from "../state/intents.js";
import { playableCards } from "../state/intents-cards.js";
import { nextSeat } from "../state/turn-manager.js";
import { createBotDriver } from "./bot-driver.js";
import { createCardControls } from "./card-controls.js";
import { bindMatchEvents } from "./events.js";
import { createRenderer } from "./render.js";
import { createTimers } from "./timers.js";
import { createTurnControls } from "./turn-controls.js";
import { createTurnWaits } from "./turn-waits.js";

/**
 * Drive a match. `deps` is the injected `{ rng, diceSource }` pair (NFR-09).
 *
 * `parts` is every region of the page, and it is passed through to `render.js` whole rather than
 * destructured here. Only four of the seven are named below, and that is the point: the board, the two
 * hands and the prompt are the ones the loop **binds events to**. The HUD, the chrome and the message
 * strip are drawn and never clicked, so this file has no business knowing they exist.
 */
export function createGameLoop({
  initialState,
  deps,
  parts,
  delays = {},
  onHandover = null,
  onMatchOver = null,
}) {
  const { $board, $diceHand, $skillHand, $prompt } = parts;

  let state = initialState;
  let finished = false;
  const timers = createTimers();
  const draw = createRenderer(parts);

  /** Redraw, with the three pieces of presentation state `card-controls.js` owns. */
  function render() {
    draw(state, {
      selectedSlot: cards.selectedSlot(),
      secondsLeft: cards.secondsLeft(),
      pick: cards.pick(),
    });
  }

  /**
   * Hand one intent to `state/` and keep the answer.
   *
   * A refused intent leaves `state` exactly as it was, and the caller is told so. Every caller here stops
   * on a refusal rather than trying again, which is what keeps a rejected intent from turning into a loop
   * that dispatches the same impossible thing forever.
   */
  function apply(intent) {
    const result = dispatch(state, intent, deps);
    if (result.accepted) state = result.state;

    return result.accepted;
  }

  /**
   * What every sibling that can wait needs from the loop: the timer registry, the durations, the one
   * state reference, the one dispatcher, and the two ways back in.
   *
   * Written out three times identically until issue #43 was about to write it a fourth. It is not only
   * repetition: the list **is** the contract of a sibling module, and having it in one place is what
   * makes "no module holds its own copy of the state" checkable by reading five lines.
   */
  const wiring = {
    timers,
    delays,
    getState: () => state,
    apply,
    refresh: render,
    resume: () => advance(),
  };

  const cards = createCardControls({ $board, ...wiring });
  const waits = createTurnWaits({ parts, ...wiring });
  const bots = createBotDriver({ $board, ...wiring, afterCard: cards.carryOn });

  const board = createTurnControls({
    getState: () => state,
    apply,
    render,
    advance: () => advance(),
    isPicking: () => cards.isPicking(),
  });

  /**
   * Stop everything that is waiting. Three callers wrote these lines out identically until the fourth
   * sibling was about to be added to each of them, and the symptom of missing one is a timer firing
   * into a match that is already gone.
   *
   * `bots.stop()` is redundant after `timers.clearAll()`, which clears every name. It is here on the
   * convention `waits` already follows: **a module that starts a timer is asked to stop it**, so
   * nothing depends on the registry's sweep also being right.
   */
  function halt() {
    timers.clearAll();
    cards.stop();
    waits.stop();
    bots.stop();
  }

  /**
   * Hand the turn on and carry straight into the next one.
   *
   * Split out of `advance` because there are now two callers: the timer, when nothing is watching for the
   * handover, and the Ready button on the handover overlay.
   */
  function passTurn() {
    if (!apply({ type: INTENT.END_TURN })) return;
    advance();
  }

  /**
   * Render, then take whatever step the turn takes without the player.
   *
   * The recursion is bounded rather than a growing stack: every branch either advances the phase or
   * returns, and the handover comes back round through a timer.
   */
  function advance() {
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

    // **The roll's moment, asked before the phase and not inside the `roll` branch**, because a roll
    // arrives through two doors: `roll-die` rolls when no card answers it, and `close-window` rolls
    // when one did. Only the first of those comes back through the branch below. `turn-waits.js`
    // carries the argument and what it cost to learn.
    if (waits.needsRollMoment(state)) {
      waits.showRoll();
      return;
    }

    if (state.reactionWindow !== null) {
      // **Bots answer first**, so the clock and the prompt only ever address people. Two things
      // follow from the order: a window with nobody but bots in it shuts at once instead of running a
      // thirty-second countdown, and in a mixed round `seatOnShow`, which is `eligible[0]`, is a
      // person. A decline takes no pause; a card play is scheduled and returns true, so the loop waits.
      if (bots.answerWindow()) return;
      if (cards.handleWindow()) return;
      advance();
      return;
    }

    // Nobody can play anything, so there is nothing to wait for. A game that waited here would hang.
    if (
      state.phase === TURN_PHASE.ACTION &&
      playableCards(state, state.activePlayer).length === 0
    ) {
      if (!apply({ type: INTENT.SKIP_ACTION })) return;
      advance();
      return;
    }

    if (state.phase === TURN_PHASE.ROLL) {
      if (!apply({ type: INTENT.ROLL_DIE })) return;
      advance();
      return;
    }

    if (state.phase === TURN_PHASE.REACTION) {
      if (!apply({ type: INTENT.CLOSE_WINDOW })) return;
      advance();
      return;
    }

    if (state.phase === TURN_PHASE.TURN_END) {
      waits.afterTurn(onHandover === null ? passTurn : () => onHandover(nextSeat(state)));
      return;
    }

    // A bot in `choose`, in `action` holding a playable card, or in `act`. It comes **after** the three
    // self-taken steps above, so a bot with nothing playable is skipped through the action phase with no
    // pause at all, rather than appearing to think about a decision it does not have.
    if (bots.takeTurn()) return;

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
     * card frozen part way through its throw, and the next match's first render would find `data-rolling`
     * already set. `waits.stop()` is what handles that half.
     */
    stop: halt,

    /**
     * Pass the turn on, which is what the handover overlay's Ready button does.
     *
     * Exposed rather than done inside the loop, because who decides that the screen has changed hands is
     * a question about the person in front of it and not about the turn.
     */
    passTurn,

    /**
     * Freeze the match (FR-07). Every pending timer and the reaction clock stop.
     *
     * The state object is untouched, because a pause is not a game event: nothing in the rulebook knows
     * about it, and putting it in the frozen state would make the rules layer hold a fact about a button.
     *
     * **This is also why a bot can never move under an overlay.** Both the pause screen and the pool
     * overview go through here, and `halt()` clears the bot's pending timer with everything else.
     */
    pause: halt,

    /**
     * Carry on from where the pause left off.
     *
     * `advance()` re-enters whatever phase the turn was in, which is why pausing needs to save nothing.
     * A reaction window that was open reopens its clock at the full thirty seconds, and that is the
     * intended reading: the players stopped, so the window did too.
     */
    resume() {
      advance();
    },

    /** The current state, for tests and for the browser console. Frozen, so it cannot be written. */
    getState() {
      return state;
    },
  };
}
