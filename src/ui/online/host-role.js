/**
 * The host's side of the lobby and the match. Issue #42, FR-42.
 *
 * `ui/` only, and **without jQuery and without i18next**, so `online-flow.test.js` can drive it with fake
 * links. It holds the half-made lobby, one connection per guest, and, once the match starts, the host
 * session that broadcasts every state.
 *
 * ## The exchange, once per guest
 *
 * `addGuest` opens a fresh peer connection and produces an invite code once the browser has finished
 * gathering its network candidates. The host sends it through any chat; the guest pastes it, produces a
 * reply code, and sends that back; `connect(replyCode)` completes the handshake. When the data channel
 * opens the guest is seated at the next free seat and the lobby says so. Three or four players repeat the
 * exchange, each on its own connection, which is the star topology `host-session.js` describes.
 *
 * ## Why twenty seconds
 *
 * There is no relay (TURN) server, only a public STUN server, so two players behind strict NATs may
 * never connect. Nothing in the browser says so; the channel simply never opens. Twenty seconds after the
 * reply code is accepted the lobby stops saying "connecting" and says the NAT sentence instead, so the
 * players learn to try a different network rather than waiting on a spinner.
 */

import { seatsFor } from "../../core/board.js";
import { createHostSession } from "../../net/host-session.js";
import { freshMatchParts, restartParts } from "../match-setup.js";
import { REACTION_WINDOW_MS } from "../reaction-clock.js";
import { STAGE } from "./lobby-screen.js";

/** How long the lobby waits for a channel to open before it names the NAT problem. */
export const CONNECT_TIMEOUT_MS = 20_000;

/**
 * - `links.createHostLink()` makes one peer connection; `webrtc-link.js` in production, a fake in tests.
 * - `beginMatch(state, deps, options)` is the flow's, and returns the loop.
 * - `refresh()` redraws the lobby; `onMatchOver(state)` is the flow's win screen.
 * - `wait(fn, ms)` is `setTimeout`, injectable so a test can fire it.
 */
export function createHostRole({
  links,
  rng,
  delays,
  beginMatch,
  refresh,
  onMatchOver,
  wait = (fn, ms) => setTimeout(fn, ms),
}) {
  let playerCount = null;
  let seats = [];
  let guests = [];
  let pending = null;
  let stage = STAGE.IDLE;
  let error = null;
  let invite = null;
  let copied = false;
  let session = null;
  let loop = null;
  let lost = false;

  const nextSeat = () => seats[guests.length + 1];

  /** One more guest: a fresh connection and an invite code for it. */
  async function addGuest() {
    if (pending !== null || playerCount === null || guests.length >= playerCount - 1) return;

    pending = links.createHostLink();
    stage = STAGE.GATHERING;
    error = null;
    copied = false;
    refresh();

    try {
      invite = await pending.invite();
      stage = STAGE.WAITING;
    } catch {
      error = "failed";
      stage = STAGE.IDLE;
      pending = null;
    }
    refresh();
  }

  /** The guest's reply code has arrived: finish the handshake and seat them when the channel opens. */
  async function connect(replyCode) {
    if (pending === null) return;

    const link = pending;
    stage = STAGE.CONNECTING;
    error = null;
    refresh();

    const timeout = wait(() => {
      if (stage === STAGE.CONNECTING && pending === link) {
        error = "nat";
        refresh();
      }
    }, CONNECT_TIMEOUT_MS);

    try {
      const transport = await link.accept(replyCode);
      guests = [...guests, { seat: nextSeat(), transport }];
      stage = STAGE.CONNECTED;
      invite = null;
      pending = null;
    } catch (failure) {
      error = failure?.message === "bad-code" ? "badCode" : "failed";
      stage = STAGE.WAITING;
    }
    clearTimeout(timeout);
    refresh();
  }

  /** Build the match, seat the host on the first seat, and tell every guest. */
  function startWith(built) {
    session = createHostSession({
      guests,
      poolRemaining: () => built.deps.diceSource.remaining(),
      onLost: () => {
        lost = true;
        loop?.abandon();
        session?.close();
      },
    });

    loop = beginMatch(built.state, built.deps, {
      loopOptions: {
        dispatcher: session.dispatcher,
        localSeats: [seats[0]],
        onMatchOver,
      },
    });
    session.attach(loop);
    session.sayHello({ seats, windowMs: delays.reaction ?? REACTION_WINDOW_MS });
    session.broadcastState(loop.getState());
  }

  return {
    /** The count was chosen: size the table and open the first invite. */
    begin(count) {
      playerCount = count;
      seats = seatsFor(count);
      guests = [];
      lost = false;
      addGuest();
    },

    addGuest,
    connect,

    /** Copy was pressed. The label flips to "copied" until the next redraw of the stage. */
    markCopied() {
      copied = true;
      refresh();
    },

    /** Everybody is in: a fresh match on a fresh pool, no bots. */
    start() {
      if (playerCount === null || guests.length !== playerCount - 1) return;
      startWith(freshMatchParts(rng, playerCount, { botSeats: [] }));
    },

    /** Play Again is the host's alone: the same guests, a new match, a new pool. */
    playAgain() {
      if (loop === null || lost) return;
      session.detach();
      startWith(restartParts(loop.getState(), rng));
    },

    /** The host's Pause is everybody's. */
    pause(paused) {
      session?.broadcastPause(paused);
    },

    /** Is a match on and every guest still there? What decides whether Play Again is offered. */
    canRestart: () => loop !== null && !lost,
    inMatch: () => loop !== null,

    /** Leave: say goodbye to every guest and forget the lobby. */
    leave() {
      session?.close();
      pending?.close();
      for (const guest of guests) guest.transport.close();
      playerCount = null;
      seats = [];
      guests = [];
      pending = null;
      session = null;
      loop = null;
      invite = null;
      stage = STAGE.IDLE;
      error = null;
    },

    snapshot() {
      return {
        role: "host",
        playerCount,
        seats: [...seats],
        connected: guests.map((guest) => guest.seat),
        invite,
        reply: null,
        stage,
        error,
        copied,
      };
    },
  };
}
