/**
 * The screens around a match, and the flow between them. Screens S1, S2, S3, S8, S9, the handover, and
 * issue #41's acceptance criterion for FR-38: menu to match to pause to match to win to menu, with no
 * page reload.
 *
 * **A player count no longer starts a match** (issue #76). It opens the line-up screen, which asks who
 * plays each of those seats, and the Start button on that screen is what begins the match. Two gestures
 * where there used to be one, and the reason is that the computer was reachable only through `?bots=`
 * before it. The `?players=` route below is untouched and still goes straight to a match.
 *
 * `ui/` only. It owns the **view's** screen, creates a match when one is asked for, and hands every
 * rule question to `state/`.
 *
 * ## The screen is view state and never enters the game state
 *
 * Which of the seven screens is up is not a fact about the game: the rules know nothing about a pause,
 * and `createGameState` has no field for one. Putting it in the frozen state object would make the
 * rules layer hold a fact about a button, which is the same reasoning `skill-hand-view.js` records for
 * a half-finished card play. **The half-made line-up is the same answer twice over** and it lives
 * beside the screen, in `lineup.js`, for the same reason.
 *
 * ## Why a new match rebuilds the page
 *
 * The board's DOM depends on the player count: a two-player match has eight pawns and a four-player one
 * has sixteen. So starting a match builds fresh regions and mounts them, and the old elements go away
 * with their jQuery handlers still attached to them, which is what keeps handlers from accumulating over
 * a session of restarts.
 *
 * **The chrome and the overlay are the exception and live for the whole session**, because they are not
 * part of a match: the language switch works on the main menu, and the overlay is what the main menu is.
 *
 * ## One pool per match, which is what the pool asked for
 *
 * Every match here is built by `match-setup.js`, which gives each one a fresh dice pool and carries the
 * reason: a match that ends mid-turn never returns its three drawn cards. Since issue #42 there are
 * three callers of those builders, the hot-seat start, Play Again and the online host, which is why they
 * stopped being two pairs of lines in this file.
 */

import { renderChrome, updateChrome } from "./chrome-view.js";
import { bindChromeEvents, bindOverlayEvents } from "./events.js";
import { createGameLoop } from "./game-loop.js";
import { turnLine } from "./hud-view.js";
import { createLineupFlow } from "./lineup.js";
import { freshMatchParts, restartParts } from "./match-setup.js";
import { screenDescription } from "./overlay-screens.js";
import { OVERLAY_SCREEN, focusOverlay, renderOverlay, updateOverlay } from "./overlay-view.js";
import { emptyParts, matchParts, mount } from "./page.js";
import { poolCountsFor } from "./pool-screen.js";
import { createSessionActions } from "./session-actions.js";

/**
 * Drive a whole session: menus, matches and the screens in between.
 *
 * - `rng` is the injected randomness (NFR-09). One per session, so a restart is a different match.
 * - `players` starts a match immediately with that count and skips the menu. `main.js` passes it only
 *   when `?players=` is in the address bar, which is what keeps every end-to-end spec written before
 *   the menu existed working unchanged.
 * - `skipHandover` passes the turn without waiting for the Ready button. Tied to `?fast=1`, for the same
 *   reason that flag already collapses the thirty-second reaction window: the shape of the turn is
 *   identical either way and only the waiting is gone. It takes the **waiting** away and not the
 *   secrecy: `handover.js` still refuses to make a bot the viewer, so a computer's hand stays face
 *   down in a fast run too.
 * - `stack` is a list of skill card ids that becomes the top of the pool, from `?stack=`. It changes no
 *   rule: `startMatch` has accepted a stacked pool since issue #38 and nothing in production passed one,
 *   so a test can put a named card in a hand instead of hoping a seed does. `main.js` carries the reason
 *   a seed could not.
 * - `bots` is how many of the seats play themselves, from `?bots=`, and it is a **count** rather than a
 *   list of seats because which seats they are is `botSeatsFor`'s rule in `state/` (FR-43). The line-up
 *   screen hands `freshMatch` the list directly instead, because D95 lets the player put the computer
 *   on seat 0 and a count cannot say that.
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
  let loop = null;
  let state = null;
  let deps = null;

  /**
   * Redraw the overlay and the chrome. Called whenever the screen or the language changes.
   *
   * The turn sentence is read off the **loop's** state and not the flow's copy, because the flow only
   * refreshes its copy at a handover or a win, and pausing mid-turn would otherwise blank the one line
   * on the page that says whose turn it is. It is empty on the menu, where no match is running.
   */
  function drawShell() {
    const live = loop?.getState() ?? null;

    updateOverlay(
      session.$overlay,
      screenDescription(screen, {
        state,
        seat: handoverSeat,
        pool: poolCountsFor(deps),
        lineup: lineup.snapshot(),
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

  /** The match is over, by a win or by being given up. Both reach the same screen (FR-05, FR-07). */
  function onMatchOver(finalState) {
    state = finalState;
    openScreen(OVERLAY_SCREEN.WIN);
  }

  /**
   * The screen has to change hands: put the curtain up over whatever is behind it.
   *
   * **Whether one is needed at all is `handover.js`'s question, not this one.** That module knows who
   * is holding the device, and a bot, a soloist playing three bots, and the person who already has the
   * screen all get no curtain and no call. What arrives here is the seat the overlay has to name.
   *
   * Since 2026-09-06 there are three moments it arrives from, not one: the end of a turn, a reaction
   * window waiting on somebody else, and that window shutting again. The hold in `waits.afterTurn`
   * still runs before the first of them, unchanged: a move has to finish arriving and a refusal has to
   * be readable whoever plays next.
   *
   * **The match pauses under the curtain**, which the turn-end handover never had to do and a
   * mid-turn one does: a reaction window has a thirty second clock on it and it must not run down
   * while somebody is reading "hand the screen over". This is the pause screen's own path, so the
   * window reopens at the full thirty seconds on the way back out.
   *
   * Why the flow and not the loop: the loop's own comment says that who decides the screen has changed
   * hands is a question about the person in front of it and not about the turn, and this is that
   * question.
   */
  function onCurtain(seat) {
    state = loop.getState();

    loop.pause();
    openScreen(OVERLAY_SCREEN.HANDOVER, seat);
  }

  /**
   * Build a match and put it on screen, replacing whatever was there. Returns the loop.
   *
   * `createLoop` and `loopOptions` are issue #42's two additions: the online guest runs a mirror loop
   * with the same public surface, and the online host runs the ordinary loop with a broadcasting
   * dispatcher and its own seat as the only local one. Both defaults are today's hot-seat match.
   */
  function beginMatch(nextState, nextDeps, { createLoop = createGameLoop, loopOptions = {} } = {}) {
    state = nextState;
    deps = nextDeps;

    const parts = matchParts(state, deps.diceSource.handSize);

    mount($root, parts, session);

    loop = createLoop({
      initialState: state,
      deps,
      parts: { ...parts, $chrome: session.$chrome },
      delays,
      onCurtain,
      onMatchOver,
      skipHandover,
      ...loopOptions,
    });

    openScreen(OVERLAY_SCREEN.NONE);
    loop.start();

    return loop;
  }

  /** A fresh match on a fresh pool. `match-setup.js` carries the bot clamp and the stack. */
  function freshMatch(playerCount, botSeats = null) {
    const built = freshMatchParts(rng, playerCount, { botSeats, botCount: bots, stack });

    beginMatch(built.state, built.deps);
  }

  /** A fresh match with the same players (FR-06), on a pool that is whole again. */
  function playAgain() {
    const built = restartParts(state, rng);

    beginMatch(built.state, built.deps);
  }

  /**
   * Give the match up and go back to the menu (FR-07).
   *
   * **The page is rebuilt empty**, and that is not cosmetic even though the menu's sheet is opaque and
   * hides whatever is behind it. Leaving the abandoned match mounted means its board, its pawns and its
   * HUD are still in the document, still answering every selector, for as long as the player sits on the
   * menu. A test caught it: after quitting, `.board .pawn` still resolved to eight elements.
   */
  function quitToMenu() {
    loop?.stop();
    loop = null;
    state = null;
    // The pool goes with the match, so the overview cannot describe an abandoned one from the menu.
    deps = null;

    mount($root, emptyParts(), session);
    openScreen(OVERLAY_SCREEN.MENU);
  }

  /**
   * The line-up screen, which happens before there is a session to own. `lineup.js` holds the
   * half-made line-up and the three operations on it; this module hands it the three things it needs
   * back. The dependency points one way, exactly as `session-actions.js` below does.
   *
   * `drawShell` and `freshMatch` are function declarations, so they are hoisted and this line can
   * stand above them.
   */
  const lineup = createLineupFlow({ openScreen, drawShell, freshMatch });

  /**
   * What each button means is in `session-actions.js`, which reached for nothing but these operations,
   * so moving it was a move rather than a rewrite. This module owns the session; that one decides what
   * a click asks of it.
   */
  const actions = createSessionActions({
    openScreen,
    lineup,
    playAgain,
    quitToMenu,
    drawShell,
    getLoop: () => loop,
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

      mount($root, emptyParts(), session);
      openScreen(OVERLAY_SCREEN.MENU);
    },

    /** The running match's loop, or `null` on the menu. For tests and for the browser console. */
    getLoop() {
      return loop;
    },

    /** Which of the six screens is up. */
    getScreen() {
      return screen;
    },
  };
}
