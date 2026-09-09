/**
 * What a button on the overlay or the chrome means. Issue #45, split out of `match-flow.js`.
 *
 * `ui/` only, and it holds no rule and no state. Every branch here maps one action name onto one call
 * on the session it was given.
 *
 * ## Why this is a file, and where the seam is
 *
 * `match-flow.js` reached the 300-line NFR-02 limit. The seam is not the line count: that module
 * **owns a session**, the six screens, the loop, the state and the pool, and it is the only thing that
 * may change any of them. These two functions **decide what a click means** and then ask it to.
 * Different question, and the giveaway is that neither of them touches a variable: they read
 * `session.getScreen()` and call `session.openScreen()`, and everything they know about a match arrives
 * through the argument.
 *
 * That is also why the split is safe. If either of these had been reaching into the flow's closure
 * variables, moving it would have meant threading state through a module boundary, which is worse than
 * a long file. They were not, so this is a move rather than a rewrite.
 *
 * ## The two orderings in here are rules about a screen, not about a rule
 *
 * Both comments below were in `match-flow.js` and both are load-bearing. The handover one prevented a
 * real leak of one player's cards to another, and the pause one prevents a turn advancing while a
 * player is reading a table. Neither is a game rule, which is why they live in `ui/` at all.
 */

import { CHROME_ACTION } from "./chrome-view.js";
import { OVERLAY_ACTION, OVERLAY_SCREEN } from "./overlay-view.js";
import { changeLanguage, nextLanguage } from "../i18n/index.js";

/**
 * The two handlers, bound to one session.
 *
 * `session` is the small interface `match-flow.js` hands in: `openScreen`, `playAgain`, `quitToMenu`,
 * `drawShell`, `getLoop`, `getScreen`, `lineup` and `online`. Naming it as an argument rather than
 * importing the flow keeps the dependency pointing one way, which is what lets this file be read on its own.
 *
 * **`session.lineup` and `session.online` are the two entries that are objects rather than functions.**
 * The first is `createLineupFlow`'s three operations from `lineup.js`; the second is `online-flow.js`'s
 * lobby and match operations (issue #42). Separate entries would have been several names for one screen
 * each, and this file would then be the only place that knew they belonged together.
 */
export function createSessionActions(session) {
  /** Is a match running with nothing on top of it? The guard both chrome buttons need. */
  function inPlay() {
    return session.getLoop() !== null && session.getScreen() === OVERLAY_SCREEN.NONE;
  }

  /** Which screen Back leaves for. The three online screens (issue #42) each have their own answer. */
  function backTarget() {
    const screen = session.getScreen();

    if (screen === OVERLAY_SCREEN.ONLINE) return OVERLAY_SCREEN.MENU;
    if (screen === OVERLAY_SCREEN.HOST || screen === OVERLAY_SCREEN.JOIN)
      return OVERLAY_SCREEN.ONLINE;

    return OVERLAY_SCREEN.SETUP;
  }

  function onOverlayAction(action, value, choice) {
    // Two of the menu's three doors are handled. Settings is `disabled` in the DOM (D77.2), so no click
    // ever arrives and a filter here would be dead code.
    if (action === OVERLAY_ACTION.HOTSEAT) session.openScreen(OVERLAY_SCREEN.SETUP);
    if (action === OVERLAY_ACTION.ONLINE) session.online.open();
    if (action === OVERLAY_ACTION.RESTART) session.playAgain();
    if (action === OVERLAY_ACTION.QUIT) session.quitToMenu();

    // The online lobby (issue #42). `value` is a player count on the HOST door and the pasted code on
    // Connect and Copy, which `events.js` read off the textarea the button names.
    if (action === OVERLAY_ACTION.HOST)
      session.online.host(value === undefined ? null : Number(value));
    if (action === OVERLAY_ACTION.JOIN) session.online.join();
    if (action === OVERLAY_ACTION.CONNECT) session.online.connect(value);
    if (action === OVERLAY_ACTION.COPY) session.online.copy(value);
    if (action === OVERLAY_ACTION.ADD_GUEST) session.online.addGuest();
    if (action === OVERLAY_ACTION.START_ONLINE) session.online.start();

    // **The count click stopped starting a match** (issue #76). It sizes the match and opens the
    // line-up, which asks who plays each of those seats, and BEGIN is what starts it. That is one line
    // here and the whole of the feature's change to the flow, which is why the line-up could be built
    // without touching `core/` or `ai/` at all.
    //
    // BACK goes to the count screen and is the only back button in the game (D94.2). It throws the
    // half-made line-up away rather than remembering it, because `open` rebuilds the line-up from the
    // count: a player who comes back and picks a smaller number must not carry bots into seats that do
    // not exist.
    if (action === OVERLAY_ACTION.PLAYERS) session.lineup.open(Number(value));
    if (action === OVERLAY_ACTION.CONTROLLER) session.lineup.setController(Number(value), choice);
    if (action === OVERLAY_ACTION.BEGIN) session.lineup.begin();
    if (action === OVERLAY_ACTION.BACK) {
      const target = backTarget();
      // Leaving a lobby hangs up: a code that was handed out is no good once its connection is gone.
      if (target !== OVERLAY_SCREEN.SETUP) session.online.leave();
      session.openScreen(target);
    }

    if (action === OVERLAY_ACTION.RESUME) {
      session.openScreen(OVERLAY_SCREEN.NONE);
      session.getLoop().resume();
      session.online.pause(false);
    }

    // **The game moves before the curtain comes down, and that order is the whole point of the screen.**
    // `arrive` is what re-renders the rail for the arriving seat, so closing the overlay first left one
    // painted frame of the *leaving* player's five skill cards in front of the person picking the device
    // up, which is the exact leak D33's secrecy rule and D39's handover exist to prevent. Design spec 04
    // § 5 states it as its one ordering requirement, and no CSS can cover a frame already on screen.
    //
    // It was `passTurn` until 2026-09-06, when the curtain stopped being a thing that only happens
    // between turns: it now also goes up before a reaction window asks somebody else and again when
    // that window shuts. A turn-end curtain still passes the turn and a mid-turn one carries the window
    // on, and which of the two this was is `handover.js`'s to remember rather than this button's.
    //
    // The guard is not decoration: `arrive` can advance the turn, and an advance can reach `match-over`,
    // in which case `onMatchOver` has already put the win screen up and there is no curtain left to take
    // down. Without it, a win on the first move of a turn would be replaced by an empty screen.
    if (action === OVERLAY_ACTION.READY) {
      session.getLoop().arrive();

      if (session.getScreen() === OVERLAY_SCREEN.HANDOVER) {
        session.openScreen(OVERLAY_SCREEN.NONE);
      }
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
        session.drawShell();
        session.getLoop()?.refresh();
      });
      return;
    }

    if (action === CHROME_ACTION.PAUSE && inPlay()) {
      session.getLoop().pause();
      session.openScreen(OVERLAY_SCREEN.PAUSE);
      // A host's pause is everybody's; `online.pause` is a no-op for a guest and off-line.
      session.online.pause(true);
    }

    // The pool overview pauses too, and that is not politeness. The loop advances the `roll`, `reaction`
    // and `turn-end` phases on timers of its own, so a player who opened the overview to decide between
    // three cards would come back to a turn that had moved without them. Closing it is
    // `OVERLAY_ACTION.RESUME`, handled above, which is why there is no second resume path.
    if (action === CHROME_ACTION.POOL && inPlay()) {
      session.getLoop().pause();
      session.openScreen(OVERLAY_SCREEN.POOL);
      session.online.pause(true);
    }
  }

  return { onOverlayAction, onChromeAction };
}
