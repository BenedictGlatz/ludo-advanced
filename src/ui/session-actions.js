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
 * `session` is the small interface `match-flow.js` hands in: `openScreen`, `freshMatch`, `playAgain`,
 * `quitToMenu`, `drawShell`, `getLoop` and `getScreen`. Naming it as an argument rather than importing
 * the flow keeps the dependency pointing one way, which is what lets this file be read on its own.
 */
export function createSessionActions(session) {
  /** Is a match running with nothing on top of it? The guard both chrome buttons need. */
  function inPlay() {
    return session.getLoop() !== null && session.getScreen() === OVERLAY_SCREEN.NONE;
  }

  function onOverlayAction(action, value) {
    // The Hotseat door, and it is the only one of the menu's three that is handled. The other two are
    // `disabled` in the DOM (D77.2), so no click ever arrives and a filter here would be dead code.
    if (action === OVERLAY_ACTION.HOTSEAT) session.openScreen(OVERLAY_SCREEN.SETUP);
    if (action === OVERLAY_ACTION.PLAYERS) session.freshMatch(Number(value));
    if (action === OVERLAY_ACTION.RESTART) session.playAgain();
    if (action === OVERLAY_ACTION.QUIT) session.quitToMenu();

    if (action === OVERLAY_ACTION.RESUME) {
      session.openScreen(OVERLAY_SCREEN.NONE);
      session.getLoop().resume();
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
      session.getLoop().passTurn();

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
    }

    // The pool overview pauses too, and that is not politeness. The loop advances the `roll`, `reaction`
    // and `turn-end` phases on timers of its own, so a player who opened the overview to decide between
    // three cards would come back to a turn that had moved without them. Closing it is
    // `OVERLAY_ACTION.RESUME`, handled above, which is why there is no second resume path.
    if (action === CHROME_ACTION.POOL && inPlay()) {
      session.getLoop().pause();
      session.openScreen(OVERLAY_SCREEN.POOL);
    }
  }

  return { onOverlayAction, onChromeAction };
}
