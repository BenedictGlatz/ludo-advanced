/**
 * The screens around a match, and the flow between them. Screens S1, S2, S8, S9, the handover, and
 * issue #41's acceptance criterion for FR-38: menu to match to pause to match to win to menu, with no
 * page reload.
 *
 * `ui/` only. It owns the **view's** screen, creates a match when one is asked for, and hands every
 * rule question to `state/`.
 *
 * ## The screen is view state and never enters the game state
 *
 * Which of the six screens is up is not a fact about the game: the rules know nothing about a pause, and
 * `createGameState` has no field for one. Putting it in the frozen state object would make the rules
 * layer hold a fact about a button, which is the same reasoning `skill-hand-view.js` records for a
 * half-finished card play.
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
 * `createDicePool`'s own header says "the closure is created once per match by the composition root, so
 * two matches never share a pool", and every match here gets a fresh one. It matters: a match that ends
 * mid-turn never returns its three drawn cards, so a second match on the same pool would start with
 * seventeen and `draw()` throws outright once four matches have leaked twelve. The RNG is deliberately
 * **not** reset, so a restart plays a different match rather than replaying the same one.
 */

import { POOL_SIZE, createDicePool } from "../core/dice-pool.js";
import { matchDeps, restartMatch, startMatch } from "../state/match.js";
import { CHROME_ACTION, renderChrome, updateChrome } from "./chrome-view.js";
import { bindChromeEvents, bindOverlayEvents } from "./events.js";
import { createGameLoop } from "./game-loop.js";
import { turnLine } from "./hud-view.js";
import { screenDescription } from "./overlay-screens.js";
import {
  OVERLAY_ACTION,
  OVERLAY_SCREEN,
  focusOverlay,
  renderOverlay,
  updateOverlay,
} from "./overlay-view.js";
import { emptyParts, matchParts, mount } from "./page.js";
import { changeLanguage, nextLanguage } from "../i18n/index.js";

/**
 * Drive a whole session: menus, matches and the screens in between.
 *
 * - `rng` is the injected randomness (NFR-09). One per session, so a restart is a different match.
 * - `players` starts a match immediately with that count and skips the menu. `main.js` passes it only
 *   when `?players=` is in the address bar, which is what keeps every end-to-end spec written before
 *   the menu existed working unchanged.
 * - `skipHandover` passes the turn without waiting for the Ready button. Tied to `?fast=1`, for the same
 *   reason that flag already collapses the thirty-second reaction window: the shape of the turn is
 *   identical either way and only the waiting is gone.
 */
export function createMatchFlow({ $root, rng, players = null, delays = {}, skipHandover = false }) {
  const session = { $chrome: renderChrome(), $overlay: renderOverlay() };

  let screen = OVERLAY_SCREEN.NONE;
  let handoverSeat = null;
  let loop = null;
  let state = null;
  let deps = null;

  /**
   * The two numbers the pool overview needs, or `null` when there is no match.
   *
   * The face-down count is asked of the dice source at the moment the shell is drawn rather than kept in
   * a variable, because the pool is the only thing in the game that is not in the frozen state object and
   * a copy of its count would go stale on the next draw.
   *
   * `total` is `POOL_SIZE` because this flow builds a real `createDicePool()` for every match and never a
   * stand-in source, so the twenty is the truth here rather than an assumption about whatever was
   * injected.
   */
  function poolCounts() {
    if (deps === null) return null;

    return { remaining: deps.diceSource.remaining(), total: POOL_SIZE };
  }

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
      screenDescription(screen, { state, seat: handoverSeat, pool: poolCounts() })
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
   * The turn is finished and the screen is about to change hands.
   *
   * `seat` is `nextSeat` from the turn manager, so the overlay names the same player `endTurn` is about
   * to hand the turn to rather than working it out a second time.
   */
  function onHandover(seat) {
    state = loop.getState();
    openScreen(OVERLAY_SCREEN.HANDOVER, seat);
  }

  /** Build a match and put it on screen, replacing whatever was there. */
  function beginMatch(nextState) {
    state = nextState;

    const parts = matchParts(state, deps.diceSource.handSize);

    mount($root, parts, session);

    loop = createGameLoop({
      initialState: state,
      deps,
      parts: { ...parts, $chrome: session.$chrome },
      delays,
      onHandover: skipHandover ? null : onHandover,
      onMatchOver,
    });

    openScreen(OVERLAY_SCREEN.NONE);
    loop.start();
  }

  /** A fresh pool for every match, and a fresh match with it. See the header. */
  function freshMatch(playerCount) {
    deps = matchDeps(rng, createDicePool());
    beginMatch(startMatch(playerCount, deps));
  }

  /**
   * A fresh match with the same players (FR-06), on a pool that is whole again.
   *
   * `restartMatch` rather than `startMatch(state.playerCount, ...)`, because "the same players" is a
   * question about a match and `state/` is where a match's vocabulary lives. The **new pool** is the
   * important half: the match being restarted from has three dice cards still out on the hand it never
   * finished, so reusing its pool would start this one seventeen cards deep.
   */
  function playAgain() {
    deps = matchDeps(rng, createDicePool());
    beginMatch(restartMatch(state, deps));
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

  function onOverlayAction(action, value) {
    if (action === OVERLAY_ACTION.START) openScreen(OVERLAY_SCREEN.SETUP);
    if (action === OVERLAY_ACTION.PLAYERS) freshMatch(Number(value));
    if (action === OVERLAY_ACTION.RESTART) playAgain();
    if (action === OVERLAY_ACTION.QUIT) quitToMenu();

    if (action === OVERLAY_ACTION.RESUME) {
      openScreen(OVERLAY_SCREEN.NONE);
      loop.resume();
    }

    // **The turn passes before the curtain comes down, and that order is the whole point of the screen.**
    // `passTurn` is what re-renders the rail for the arriving seat, so closing the overlay first left one
    // painted frame of the *leaving* player's five skill cards in front of the person picking the device
    // up, which is the exact leak D33's secrecy rule and D39's handover exist to prevent. Design spec 04
    // § 5 states it as its one ordering requirement, and no CSS can cover a frame already on screen.
    //
    // The guard is not decoration: `passTurn` advances the turn, and an advance can reach `match-over`,
    // in which case `onMatchOver` has already put the win screen up and there is no curtain left to take
    // down. Without it, a win on the first move of a turn would be replaced by an empty screen.
    if (action === OVERLAY_ACTION.READY) {
      loop.passTurn();

      if (screen === OVERLAY_SCREEN.HANDOVER) openScreen(OVERLAY_SCREEN.NONE);
    }
  }

  /**
   * A click on one of the always-present controls.
   *
   * Switching language needs nothing but a redraw, because no view caches a translated string: every one
   * of them rewrites its own text from `t()` on every update. That is what makes FR-34's criterion, "no
   * string remains in the previous language", true by construction rather than by a list of things to
   * remember to refresh. Both the shell and the match have to be redrawn, because they are two renders.
   */
  function onChromeAction(action) {
    if (action === CHROME_ACTION.LANGUAGE) {
      changeLanguage(nextLanguage()).then(() => {
        drawShell();
        loop?.refresh();
      });
      return;
    }

    if (action === CHROME_ACTION.PAUSE && loop !== null && screen === OVERLAY_SCREEN.NONE) {
      loop.pause();
      openScreen(OVERLAY_SCREEN.PAUSE);
    }

    // The pool overview pauses too, and that is not politeness. The loop advances the `roll`, `reaction`
    // and `turn-end` phases on timers of its own, so a player who opened the overview to decide between
    // three cards would come back to a turn that had moved without them. Closing it is
    // `OVERLAY_ACTION.RESUME`, handled above, which is why there is no second resume path.
    if (action === CHROME_ACTION.POOL && loop !== null && screen === OVERLAY_SCREEN.NONE) {
      loop.pause();
      openScreen(OVERLAY_SCREEN.POOL);
    }
  }

  return {
    /** Boot: either straight into a match, or onto the main menu. */
    start() {
      bindChromeEvents(session.$chrome, { onChromeAction });
      bindOverlayEvents(session.$overlay, { onOverlayAction });

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
