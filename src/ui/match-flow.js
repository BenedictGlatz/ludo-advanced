/**
 * The screens around a match, and the flow between them. Screens S1, S2, S3, S8, S9, the handover, the
 * pool overview and, since issue #42, the three online screens. Issue #41's acceptance criterion for
 * FR-38: menu to match to pause to match to win to menu, with no page reload.
 *
 * **A player count no longer starts a match** (issue #76). It opens the line-up screen, which asks who
 * plays each of those seats, and the Start button on that screen is what begins the match. The
 * `?players=` route still goes straight to a match.
 *
 * `ui/` only. It owns the **view's** screen and hands every rule question to `state/`. Since issue #42
 * the match itself, the loop, its state and its `deps`, is held one file over in `match-session.js`,
 * and this file is the switchboard: which screen is up, and which of the four flows (line-up, online,
 * session actions, the match) a change goes to.
 *
 * ## The screen is view state and never enters the game state
 *
 * Which screen is up is not a fact about the game: the rules know nothing about a pause, and
 * `createGameState` has no field for one. Putting it in the frozen state object would make the rules
 * layer hold a fact about a button, which is the same reasoning `skill-hand-view.js` records for a
 * half-finished card play. **The half-made line-up and the half-made lobby are the same answer twice
 * over** and live beside the screen, in `lineup.js` and `online/online-flow.js`, for the same reason.
 */

import { createGuestLink, createHostLink } from "../net/webrtc-link.js";
import { renderChrome, updateChrome } from "./chrome-view.js";
import { bindChromeEvents, bindOverlayEvents } from "./events.js";
import { turnLine } from "./hud-view.js";
import { createLineupFlow } from "./lineup.js";
import { createMatchSession } from "./match-session.js";
import { createGuestLoop, guestDeps } from "./online/guest-loop.js";
import { createOnlineFlow } from "./online/online-flow.js";
import { screenDescription } from "./overlay-screens.js";
import { OVERLAY_SCREEN, focusOverlay, renderOverlay, updateOverlay } from "./overlay-view.js";
import { poolCountsFor } from "./pool-screen.js";
import { createSessionActions } from "./session-actions.js";

/**
 * Drive a whole session: menus, matches and the screens in between.
 *
 * - `rng` is the injected randomness (NFR-09). One per session, so a restart is a different match.
 * - `players` starts a match immediately with that count and skips the menu (`?players=`).
 * - `skipHandover` passes the turn without waiting for the Ready button (`?fast=1`). It takes the
 *   **waiting** away and not the secrecy: `handover.js` still refuses to make a bot the viewer.
 * - `stack` is a list of skill card ids that becomes the top of the pool, from `?stack=`.
 * - `bots` is how many of the seats play themselves, from `?bots=`; the line-up screen hands
 *   `freshMatch` a list of seats instead, because D95 lets the player put the computer on seat 0.
 */
export function createMatchFlow({
  $root,
  rng,
  players = null,
  delays = {},
  skipHandover = false,
  stack = null,
  bots = 0,
}) {
  const session = { $chrome: renderChrome(), $overlay: renderOverlay() };

  let screen = OVERLAY_SCREEN.NONE;
  let handoverSeat = null;

  /**
   * Redraw the overlay and the chrome. Called whenever the screen or the language changes.
   *
   * The turn sentence is read off the **loop's** state and not the session's copy, because the session
   * only refreshes its copy at a handover or a win, and pausing mid-turn would otherwise blank the one
   * line on the page that says whose turn it is. It is empty on the menu, where no match is running.
   */
  function drawShell() {
    const loop = match.getLoop();
    const live = loop?.getState() ?? null;

    updateOverlay(
      session.$overlay,
      screenDescription(screen, {
        state: match.getState(),
        seat: handoverSeat,
        pool: poolCountsFor(match.getDeps()),
        lineup: lineup.snapshot(),
        online: { role: online.role(), snapshot: online.snapshot(), canRestart: online.canRestart() },
      })
    );
    updateChrome(session.$chrome, {
      canPause: loop !== null && screen === OVERLAY_SCREEN.NONE,
      turn: live === null ? "" : turnLine(live),
      player: live === null ? null : live.activePlayer,
    });

    // `data-paused` is on the shell rather than on the prompt strip, because the strip is rebuilt with
    // every match and the pause is a fact about the session. Design spec 04 asks for it so the reaction
    // countdown can stop: the ring is a CSS animation off `data-mode`, and an animation cannot pause
    // itself. Every screen except none means the game has stopped, which is what FR-07 pauses.
    session.$app?.attr("data-paused", String(loop !== null && screen !== OVERLAY_SCREEN.NONE));
  }

  /**
   * Put a screen up, or take the overlay away with `OVERLAY_SCREEN.NONE`.
   *
   * Focus moves to the first button, because an overlay a keyboard cannot reach is worse than the timer
   * it replaced (NFR-08). It happens here and not in `updateOverlay`, which also runs on a language
   * change, where stealing focus back would be wrong.
   */
  function openScreen(next, seat = null) {
    screen = next;
    handoverSeat = seat;
    drawShell();

    if (next !== OVERLAY_SCREEN.NONE) focusOverlay(session.$overlay);
  }

  /**
   * The running match: the loop, its state and its `deps`, and the four ways to start or end one.
   *
   * Three callbacks come back this way. The curtain: `handover.js` decides whether one is needed, and
   * what arrives here is the seat the overlay has to name; the match pauses under it, because a reaction
   * window has a thirty second clock that must not run down while somebody reads "hand the screen over".
   * The win: a won and an abandoned match reach the same screen (FR-05, FR-07). The mount: a board has
   * just been put on the page, so whatever screen was up comes down.
   */
  const match = createMatchSession({
    $root,
    session,
    rng,
    delays,
    skipHandover,
    stack,
    bots,
    onCurtain(seat) {
      match.holdForCurtain();
      openScreen(OVERLAY_SCREEN.HANDOVER, seat);
    },
    onMatchOver(finalState) {
      match.finish(finalState);
      openScreen(OVERLAY_SCREEN.WIN);
    },
    onMount: () => openScreen(OVERLAY_SCREEN.NONE),
  });

  /** A fresh hot-seat match. Leaving the lobby first, in case one was open. */
  function freshMatch(playerCount, botSeats = null) {
    online.leave();
    match.freshMatch(playerCount, botSeats);
  }

  /**
   * Play Again (FR-06). Online, the host's button keeps the guests and their connections and the guest
   * has no button at all, because `winScreen` hides it when `online.canRestart()` says no.
   */
  function playAgain() {
    if (online.role() !== null) {
      online.playAgain();
      return;
    }
    match.playAgain();
  }

  /** Give the match up and go back to the menu (FR-07). The other side is told first. */
  function quitToMenu() {
    online.leave();
    match.quit();
    openScreen(OVERLAY_SCREEN.MENU);
  }

  /**
   * The line-up screen and the online lobby happen before there is a match to own. Each holds its own
   * half-made thing and the operations on it; this module hands each the few things it needs back, and
   * the dependency points one way, exactly as `session-actions.js` below does.
   *
   * The online flow is handed `beginMatch` because both roles start a match, the guest's on a mirror loop
   * built by `createGuestLoop`; the links are the WebRTC wrappers, injected so its unit test can use fakes.
   */
  const lineup = createLineupFlow({ openScreen, drawShell, freshMatch });
  const online = createOnlineFlow({
    openScreen,
    getScreen: () => screen,
    drawShell,
    beginMatch: match.beginMatch,
    onMatchOver(finalState) {
      match.finish(finalState);
      openScreen(OVERLAY_SCREEN.WIN);
    },
    rng,
    delays,
    links: { createHostLink, createGuestLink },
    loops: { createGuestLoop, guestDeps },
  });

  /** What each button means is in `session-actions.js`. This module owns the session; that one decides. */
  const actions = createSessionActions({
    openScreen,
    lineup,
    online,
    playAgain,
    quitToMenu,
    drawShell,
    getLoop: match.getLoop,
    getScreen: () => screen,
  });

  return {
    /** Boot: either straight into a match, or onto the main menu. */
    start() {
      bindChromeEvents(session.$chrome, { onChromeAction: actions.onChromeAction });
      bindOverlayEvents(session.$overlay, { onOverlayAction: actions.onOverlayAction });

      if (players !== null) {
        freshMatch(players);
        return;
      }

      match.mountEmpty();
      openScreen(OVERLAY_SCREEN.MENU);
    },

    /** The running match's loop, or `null` on the menu. For tests and for the browser console. */
    getLoop: match.getLoop,

    /** Which screen is up. */
    getScreen() {
      return screen;
    },
  };
}
