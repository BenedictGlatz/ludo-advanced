/**
 * The online screens, bound to one session. Issue #42, FR-42. The `lineup.js` pattern: `match-flow.js`
 * owns the session and hands in the few operations this needs; this decides what the lobby's buttons ask
 * of it and which of the two roles is playing.
 *
 * `ui/` only, and **without jQuery and without i18next**: the links, the guest loop factory and the
 * clipboard are injected, so a unit test can host a three-player table with fake links and assert that
 * `beginMatch` was called with the right `localSeats` for each role.
 *
 * ## Two roles, one surface
 *
 * The host and the guest do very different things (`host-role.js`, `guest-role.js`), and the buttons
 * do not care: Connect pastes a code whoever you are, Copy copies whichever code is on screen, Back
 * leaves. This file routes each of those to whichever role is active and answers the questions the rest
 * of the flow asks: is an online match on, may Play Again be offered, and what does the lobby say.
 */

import { OVERLAY_SCREEN } from "../overlay-vocabulary.js";
import { createGuestRole } from "./guest-role.js";
import { createHostRole } from "./host-role.js";

/** The clipboard, reached lazily so this module never touches a browser global at import time. */
const browserClipboard = {
  write: (text) => globalThis.navigator?.clipboard?.writeText(text) ?? Promise.resolve(),
};

/**
 * `session` is `{ openScreen, getScreen, drawShell, beginMatch, onMatchOver, rng, delays }` from
 * `match-flow.js`, plus the three injectables: `links`, `loops` and `clipboard`.
 */
export function createOnlineFlow(session) {
  const { links, loops, clipboard = browserClipboard, delays = {} } = session;
  let role = null;

  const shared = {
    links,
    delays,
    beginMatch: session.beginMatch,
    refresh: session.drawShell,
    onMatchOver: session.onMatchOver,
    wait: session.wait,
  };

  function leave() {
    role?.leave();
    role = null;
  }

  return {
    /** The menu's Online Multiplayer door. */
    open() {
      leave();
      session.openScreen(OVERLAY_SCREEN.ONLINE);
    },

    /** Host a match. Without a count, the screen asks for one; with a count, the first invite opens. */
    host(playerCount = null) {
      if (role === null || role.snapshot().role !== "host") {
        leave();
        role = createHostRole({ ...shared, rng: session.rng });
        session.openScreen(OVERLAY_SCREEN.HOST);
      }
      if (playerCount !== null) role.begin(playerCount);
    },

    /** Join a match: the screen with the invite field. */
    join() {
      leave();
      role = createGuestRole({
        ...shared,
        loops,
        openScreen: session.openScreen,
        getScreen: session.getScreen,
      });
      session.openScreen(OVERLAY_SCREEN.JOIN);
    },

    /** A code was pasted and Connect pressed. Which code it is depends on who is pressing. */
    connect(code) {
      const text = (code ?? "").trim();
      if (text === "") return;
      role?.connect(text);
    },

    /** The host wants one more seat filled. */
    addGuest() {
      role?.addGuest?.();
    },

    /** Copy the code on screen. */
    copy(text) {
      clipboard.write(text ?? "");
      role?.markCopied();
    },

    /** The host's Start match. */
    start() {
      role?.start?.();
    },

    /** Play Again, which only the host has a button for. */
    playAgain() {
      role?.playAgain?.();
    },

    /** The chrome's Pause and the pause screen's Resume, forwarded to the guests by a host. */
    pause(paused) {
      role?.pause?.(paused);
    },

    /** Leaving the lobby or the match, from Back, Quit, or a new hot-seat match. */
    leave,

    /** Is an online match running on this screen? */
    active: () => role !== null && role.inMatch(),

    /** May this screen offer Play Again? Hot-seat yes; online only the host with every guest present. */
    canRestart: () => role === null || (role.canRestart?.() ?? false),

    /** Which of the two this screen is, or `null` off-line. */
    role: () => role?.snapshot().role ?? null,

    /** What the lobby screens are built from. `null` on every other screen. */
    snapshot: () => role?.snapshot() ?? null,
  };
}
