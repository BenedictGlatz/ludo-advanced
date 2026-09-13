/**
 * The guest's side of an online match. Issue #42, FR-42.
 *
 * `net/` may import `core/` and `state/`, never `ui/` or `i18n/`. It knows nothing about a screen: it is
 * handed one transport and offers the guest loop a way to send and four things to listen for.
 *
 * ## A guest never dispatches
 *
 * `apply(intent)` sends the intent to the host and returns `true`, meaning "sent", not "accepted". The
 * answer comes back as a `state` when the host accepted it and a `refused` when it did not, and the guest
 * loop replaces its state on the first and prints the reason on the second. That is why the guest can
 * never drift: it holds no rule state of its own, only the host's last word.
 *
 * ## Two refusals happen here, before anything is sent
 *
 * - **A loop-owned intent** (`roll-die`, `close-window`, `end-turn`). The guest runs the same
 *   `card-controls.js` clock as the host does, for the countdown ring, and that clock would dispatch
 *   `close-window` when it runs out. The host owns that moment, so the guest refuses it locally rather
 *   than sending something the host would refuse anyway.
 * - **A second intent while one is in flight.** A pawn click selects and a second click commits, and a
 *   quick double click would send both before the first echo. The second is dropped; the player clicks
 *   again once the board has caught up, which is a moment later.
 */

import { deepFreeze } from "../state/freeze.js";
import { isLoopOwned } from "../state/auto-steps.js";
import { MESSAGE, decode, encode, intentMessage } from "./protocol.js";

/**
 * The guest session over one transport.
 *
 * The four `on*` registrations take one listener each and are called by the guest loop and the lobby.
 */
export function createGuestSession({ transport }) {
  let seq = 0;
  let inFlight = false;
  let remaining = 0;
  let closed = false;

  const handlers = {
    hello: () => {},
    state: () => {},
    refused: () => {},
    paused: () => {},
    close: () => {},
  };

  function end() {
    if (closed) return;
    closed = true;
    handlers.close();
  }

  transport.onMessage((text) => {
    const message = decode(text);
    if (message === null) return;

    switch (message.kind) {
      case MESSAGE.HELLO:
        handlers.hello(message);
        return;
      case MESSAGE.STATE:
        inFlight = false;
        remaining = message.pool.remaining;
        // Frozen like every state the game holds, so a view that wrote into it would throw here too.
        handlers.state(deepFreeze(message.state));
        return;
      case MESSAGE.REFUSED:
        inFlight = false;
        handlers.refused(message.reason);
        return;
      case MESSAGE.PAUSED:
        handlers.paused(true);
        return;
      case MESSAGE.RESUMED:
        handlers.paused(false);
        return;
      case MESSAGE.BYE:
        end();
        return;
      default:
        return;
    }
  });
  transport.onClose(end);

  return {
    /** Send one intent to the host. `true` means sent; the answer arrives as a state or a refusal. */
    apply(intent) {
      if (closed || inFlight || isLoopOwned(intent.type)) return false;

      seq += 1;
      inFlight = true;
      transport.send(encode(intentMessage(seq, intent)));

      return true;
    },

    onHello: (fn) => (handlers.hello = fn),
    onState: (fn) => (handlers.state = fn),
    onRefused: (fn) => (handlers.refused = fn),
    onPaused: (fn) => (handlers.paused = fn),
    onClose: (fn) => (handlers.close = fn),

    /** How many dice cards the host's pool holds face down, as of the last state. */
    poolRemaining: () => remaining,

    /** Is an intent still waiting for its echo? For tests. */
    isInFlight: () => inFlight,

    /** Leave on purpose. */
    close() {
      if (!closed) transport.send(encode({ kind: MESSAGE.BYE }));
      end();
      transport.close();
    },
  };
}
