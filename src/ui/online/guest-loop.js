/**
 * The guest's loop: a mirror of the host's match. Issue #42, FR-42.
 *
 * `ui/` only. It has the same public surface `match-flow.js` calls on a loop (`start`, `refresh`, `stop`,
 * `pause`, `resume`, `arrive`, `passTurn`, `getState`), so the flow does not know which of the two loops
 * it is holding. What it does **not** do is the whole point:
 *
 * - **It never advances a phase.** The host's loop rolls, shuts empty windows and passes turns; the guest
 *   only ever learns that those things happened, from the next `state` on the wire.
 * - **It never runs a bot** and **never owns the reaction clock.** Both are the host's. The clock here is
 *   drawn from the same `card-controls.js` the host uses, so the two countdown rings agree, and its expiry
 *   is refused locally by `guest-session.js` before anything is sent.
 * - **Its `apply` sends.** The store's dispatcher hands the intent to the session and answers `accepted`
 *   with "sent", leaving the state as it was. The echo is a `state` message, and `receive` is where the
 *   board actually changes.
 *
 * Everything else is reused unchanged: the controls, the target picker, the renderer, the waits and the
 * event bindings. The bot driver and the handover are built and idle: there are no bots in an online
 * match, and `handTo` is never called because nothing here advances.
 *
 * ## `receive(next)` does what the host's `advance()` does after a dispatch
 *
 * Replace the state, sync the clock, and either take the moment the turn owes (a played card's cast, the
 * roll's 900 ms) or simply redraw. Without `takeMoment`, `data-rolling` would stick on the dice hand and
 * the cards would stop being clickable after the first roll, because only `turn-waits.js` ever takes that
 * attribute off. That fact cost the hot-seat loop a red suite once already, and the guest inherits it.
 */

import { abandonMatch } from "../../state/match.js";
import { MATCH_STATUS } from "../../state/game-state.js";
import { HAND_SIZE } from "../../core/dice-pool.js";
import { t } from "../../i18n/index.js";
import { bindMatchEvents } from "../events.js";
import { createLoopParts } from "../loop-parts.js";
import { createLoopStore } from "../loop-store.js";
import { createRenderer } from "../render.js";
import { createTimers } from "../timers.js";

/**
 * The guest's `deps`: nothing to roll with, and a pool it can only ask the host about.
 *
 * `draw` and `returnHand` throw rather than pretend, because nothing on the guest may ever call them:
 * the guest dispatches nothing, and `startMatch`, the one function that checks `deps`, never runs here.
 * `remaining` is what the pool overview prints, and it is the host's number as of the last state.
 */
export function guestDeps(session) {
  const refuse = () => {
    throw new Error("a guest never draws: the host owns the dice pool");
  };

  return {
    rng: null,
    diceSource: {
      handSize: HAND_SIZE,
      remaining: () => session.poolRemaining(),
      draw: refuse,
      returnHand: refuse,
    },
  };
}

/**
 * Build the mirror loop. Same options as `createGameLoop` where they overlap, plus `session`, the
 * guest session whose `apply` sends. `onCurtain` and `skipHandover` are accepted and ignored.
 */
export function createGuestLoop({
  initialState,
  deps,
  parts,
  delays = {},
  localSeats,
  session,
  onMatchOver = null,
}) {
  const { $board, $diceHand, $skillHand, $prompt, $message } = parts;

  const store = createLoopStore({
    initialState,
    deps,
    dispatcher: (state, intent) => ({ accepted: session.apply(intent), state }),
    localSeats,
  });
  let finished = false;
  const timers = createTimers();
  const draw = createRenderer(parts);

  function render() {
    draw(store.getState(), {
      selectedSlot: cards.selectedSlot(),
      secondsLeft: cards.secondsLeft(),
      pick: cards.pick(),
      viewerSeat: handover.seat(),
      canAct: store.isLocal(store.getState().activePlayer),
    });
  }

  const wiring = {
    timers,
    delays,
    getState: store.getState,
    apply: store.apply,
    isLocal: store.isLocal,
    refresh: render,
    // Nothing here advances a phase, so "carry on" means "draw what we have".
    resume: () => render(),
  };

  const { board, cards, handover, waits, halt } = createLoopParts({ parts, wiring });

  /** The match is over, by a win or by the host going away. Told to the flow once. */
  function finish(state) {
    halt();
    render();
    if (finished) return;
    finished = true;
    onMatchOver?.(state);
  }

  return {
    start() {
      bindMatchEvents({ $board, $diceHand, $skillHand, $prompt }, { board, cards });
      render();
    },

    refresh: render,
    stop: halt,

    /** A guest's Pause is local: the host's clock keeps running, so only the drawing stops. */
    pause: halt,
    resume: render,

    /** No curtain ever stands on a guest, so Ready and the turn pass have nothing to do. */
    arrive() {},
    passTurn() {},

    getState: store.getState,

    /** The host's next word. What `advance()` is to the host loop. */
    receive(next) {
      store.replace(next);
      cards.syncClock();

      if (next.status !== MATCH_STATUS.RUNNING) {
        finish(next);
        return;
      }

      if (!waits.takeMoment(next)) render();
    },

    /** The host refused an intent. The strip says why, until the next state redraws it. */
    showRefusal(reason) {
      $message.attr("data-reason-key", reason).attr("data-message-kind", "refusal").text(t(reason));
    },

    /** The host went away mid-match. No reconnect in v1, so the match is over for this screen too. */
    abandon() {
      if (finished) return;
      const ended = abandonMatch(store.getState());
      store.replace(ended);
      finish(ended);
    },
  };
}
