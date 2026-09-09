/**
 * The host's side of an online match. Issue #42, FR-42.
 *
 * `net/` may import `core/` and `state/`, never `ui/` or `i18n/`. It knows nothing about a screen: it is
 * handed transports, a loop to feed intents into, and a way to read how full the dice pool is.
 *
 * ## What the host does that a hot-seat match does not
 *
 * Two things, and both hang off the one seam `ui/` has. The host's loop runs with this module's
 * `dispatcher` instead of `dispatch`, so **every accepted intent is followed by a broadcast** of the new
 * state to every guest. And each guest's transport is listened to, so **an intent arriving from a guest
 * enters the loop through `loop.submit`**, after `intent-guard.js` has said who may ask for what.
 *
 * Everything else about the match is the ordinary loop: the roll, the handover hold, the thirty-second
 * clock and, later, the bots all run on the host exactly as they do in hot-seat play. That is the whole
 * argument for host-authoritative play: one place owns time and randomness, and the guests watch.
 *
 * ## Star topology
 *
 * One transport per guest, each tagged with the seat that guest holds. The host never forwards one
 * guest's message to another: a guest learns what another guest did the same way it learns what the
 * host did, from the next `state`. Three and four players are therefore two and three transports and no
 * new code path.
 *
 * ## A dropped guest ends the match
 *
 * `onLost(seat)` fires when a transport closes or a guest says `bye`. There is no reconnect in v1, so the
 * flow answers it with `abandonMatch`. Written into the changelog as a known limitation.
 */

import { dispatch } from "../state/intents.js";
import { guestIntentRefusal, GUEST_REFUSED } from "./intent-guard.js";
import { REJECTED } from "../state/rejections.js";
import { MESSAGE, decode, encode, hello, refusedMessage, stateMessage } from "./protocol.js";

/**
 * The host session.
 *
 * - `guests` is `[{ seat, transport }]`, one entry per connected guest.
 * - `poolRemaining()` says how many dice cards are face down in the host's pool right now. The guest's
 *   pool overview prints it, because the guest has no pool of its own.
 * - `onLost(seat)` is called once when a guest's pipe closes.
 */
export function createHostSession({ guests, poolRemaining, onLost = () => {} }) {
  let seq = 0;
  let paused = false;
  let loop = null;
  const lost = new Set();

  function broadcast(message) {
    const text = encode(message);
    for (const { transport } of guests) transport.send(text);
  }

  /** Send the state to every guest. Called after every accepted intent, and once before the first turn. */
  function broadcastState(state) {
    seq += 1;
    broadcast(stateMessage(seq, state, poolRemaining()));
  }

  /**
   * The loop's dispatcher: the rules, then the wire. Same shape as `dispatch`, so the loop and its five
   * siblings never learn that anything happened after the rules answered.
   */
  function dispatcher(state, intent, deps) {
    const result = dispatch(state, intent, deps);
    if (result.accepted) broadcastState(result.state);

    return result;
  }

  /** One guest's intent: the guard, then the pause, then the loop. Every refusal is answered. */
  function receive(guest, message) {
    const refuse = (reason) => guest.transport.send(encode(refusedMessage(message.seq, reason)));

    if (loop === null) return refuse(REJECTED.WRONG_PHASE);

    const reason = guestIntentRefusal(loop.getState(), message.intent, [guest.seat]);
    if (reason !== null) return refuse(reason);
    if (paused) return refuse(GUEST_REFUSED.PAUSED);
    if (!loop.submit(message.intent)) return refuse(REJECTED.WRONG_PHASE);

    return undefined;
  }

  function lose(seat) {
    if (lost.has(seat)) return;
    lost.add(seat);
    onLost(seat);
  }

  return {
    dispatcher,
    broadcastState,

    /** Tell every guest which seat it holds, who else plays, and how long a reaction window lasts. */
    sayHello({ seats, windowMs }) {
      for (const { seat, transport } of guests) {
        transport.send(encode(hello({ seat, seats, windowMs })));
      }
    },

    /** Start listening: guest intents go into `loop.submit`, and a closed pipe is a lost guest. */
    attach(nextLoop) {
      loop = nextLoop;

      for (const guest of guests) {
        guest.transport.onMessage((text) => {
          const message = decode(text);
          if (message === null) return;

          if (message.kind === MESSAGE.INTENT) receive(guest, message);
          if (message.kind === MESSAGE.BYE) lose(guest.seat);
        });
        guest.transport.onClose(() => lose(guest.seat));
      }
    },

    /** Stop feeding the loop. The pipes stay open until `close`. */
    detach() {
      loop = null;
    },

    /** The host's Pause button, for everybody. Guest intents are refused with `paused` meanwhile. */
    broadcastPause(next) {
      paused = next;
      broadcast({ kind: next ? MESSAGE.PAUSED : MESSAGE.RESUMED });
    },

    /** Leave on purpose: say goodbye, then close every pipe. */
    close() {
      broadcast({ kind: MESSAGE.BYE });
      for (const { transport } of guests) transport.close();
    },
  };
}
