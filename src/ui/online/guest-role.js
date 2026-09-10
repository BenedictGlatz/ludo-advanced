/**
 * The guest's side of the lobby and the match. Issue #42, FR-42.
 *
 * `ui/` only, and **without jQuery and without i18next**, so `online-flow.test.js` can drive it with a fake
 * link and a fake loop factory. It holds the one connection to the host and, once the first state
 * arrives, the mirror loop that draws it.
 *
 * ## The guest starts its match on the first `state`, not on `hello`
 *
 * `hello` says which seat this screen holds and how long a reaction window lasts; `state` is the board.
 * Both are needed before a board can be mounted, and they are two messages, so whichever arrives second
 * starts the match. In practice `hello` comes first, but a protocol that depended on the order would be
 * a protocol with a race in it.
 *
 * ## Play Again, seen from the guest
 *
 * The host presses it, and the guest's next `state` is turn one of a new match while the guest's loop is
 * finished on the win screen. A state arriving for a finished loop therefore starts a fresh match,
 * which is the whole of the guest's Play Again.
 */

import { createGuestSession } from "../../net/guest-session.js";
import { OVERLAY_SCREEN } from "../overlay-vocabulary.js";
import { STAGE } from "./lobby-screen.js";
import { CONNECT_TIMEOUT_MS } from "./host-role.js";

/**
 * - `links.createGuestLink()` makes the peer connection; `loops.createGuestLoop` builds the mirror loop
 *   and `loops.guestDeps(session)` its `deps`. Both are injected so this file imports no jQuery.
 * - `beginMatch`, `openScreen`, `getScreen`, `refresh` and `onMatchOver` are the flow's.
 */
export function createGuestRole({
  links,
  loops,
  delays,
  beginMatch,
  openScreen,
  getScreen,
  refresh,
  onMatchOver,
  wait = (fn, ms) => setTimeout(fn, ms),
}) {
  let link = null;
  let session = null;
  let hello = null;
  let loop = null;
  let finished = true;
  let reply = null;
  let stage = STAGE.IDLE;
  let error = null;
  let copied = false;
  let hostPaused = false;

  /** Mount a board for the state the host sent. */
  function startMatch(state) {
    const deps = loops.guestDeps(session);

    finished = false;
    loop = beginMatch(state, deps, {
      createLoop: loops.createGuestLoop,
      loopOptions: {
        localSeats: [hello.seat],
        session,
        delays: { ...delays, reaction: hello.windowMs },
        onMatchOver: (finalState) => {
          finished = true;
          onMatchOver(finalState);
        },
      },
    });
  }

  function onState(state) {
    if (hello === null) return;
    if (loop === null || finished) startMatch(state);
    else loop.receive(state);
  }

  /** The host is gone: a match in progress is abandoned, a lobby says so. */
  function onClose() {
    if (loop !== null && !finished) {
      loop.abandon();
      return;
    }
    stage = STAGE.LOST;
    refresh();
  }

  function onPaused(paused) {
    hostPaused = paused;
    if (loop === null || finished) return;

    if (paused) {
      loop.pause();
      openScreen(OVERLAY_SCREEN.PAUSE);
    } else if (getScreen() === OVERLAY_SCREEN.PAUSE) {
      openScreen(OVERLAY_SCREEN.NONE);
      loop.resume();
    }
  }

  function listen(transport) {
    session = createGuestSession({ transport });
    session.onHello((message) => (hello = message));
    session.onState(onState);
    session.onRefused((reason) => loop?.showRefusal(reason));
    session.onPaused(onPaused);
    session.onClose(onClose);
  }

  return {
    /** The invite code was pasted: answer it, show the reply code, and wait for the channel. */
    async connect(inviteCode) {
      if (link !== null) return;

      link = links.createGuestLink();
      stage = STAGE.GATHERING;
      error = null;
      copied = false;
      refresh();

      let joined;
      try {
        joined = await link.join(inviteCode);
      } catch (failure) {
        error = failure?.message === "bad-code" ? "badCode" : "failed";
        stage = STAGE.IDLE;
        link = null;
        refresh();
        return;
      }

      reply = joined.replyCode;
      stage = STAGE.WAITING;
      refresh();

      const timeout = wait(() => {
        if (stage === STAGE.WAITING) {
          error = "nat";
          refresh();
        }
      }, CONNECT_TIMEOUT_MS);

      try {
        listen(await joined.ready);
        stage = STAGE.CONNECTED;
        error = null;
      } catch {
        // The channel never opened: ICE gave up, or the host hung up first. Hang up this side too and
        // forget it, so the next invite pasted starts a fresh connection. Until 2026-09-10 `link` was
        // kept here, and `connect` above refuses while one exists, so every retry after a failed
        // handshake did nothing at all and the guest had to leave the lobby to try again.
        link.close();
        link = null;
        reply = null;
        error = "failed";
        stage = STAGE.IDLE;
      }
      clearTimeout(timeout);
      refresh();
    },

    markCopied() {
      copied = true;
      refresh();
    },

    inMatch: () => loop !== null && !finished,
    hostPaused: () => hostPaused,

    leave() {
      session?.close();
      link?.close();
      link = null;
      session = null;
      hello = null;
      loop = null;
      finished = true;
      reply = null;
      stage = STAGE.IDLE;
      error = null;
      hostPaused = false;
    },

    snapshot() {
      return {
        role: "guest",
        playerCount: hello?.seats.length ?? null,
        seats: hello?.seats ?? [],
        connected: [],
        invite: null,
        reply,
        stage,
        error,
        copied,
      };
    },
  };
}
