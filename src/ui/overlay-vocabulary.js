/**
 * The names the overlay is addressed by: which screen it shows, and what its buttons ask for.
 * Issues #39, #41 and #30.
 *
 * Two frozen tables and nothing else. No jQuery, no i18next, no state.
 *
 * ## Why these are not in overlay-view.js, where they used to live
 *
 * `overlay-view.js` imports jQuery, and jQuery throws on import when there is no `document`. Vitest runs
 * unit tests with `environment: "node"` deliberately, so **anything that reaches overlay-view.js could
 * not be unit tested at all**, including the two files that are pure and describe screens rather than
 * render them.
 *
 * That went unnoticed until issue #30, because `overlay-screens.js` had no unit test to fail. It was
 * covered through Playwright like the rest of `ui/`, which is the right default and hid the fact that a
 * pure function had been made untestable by an import it did not need. The pool overview made it
 * visible: `pool-screen.js` is pure, its content comes from `POOL_COMPOSITION`, and it is worth a unit
 * test of its own so a reweighted pool cannot silently disagree with the screen that shows it.
 *
 * **Rejected: initialising a DOM for these tests.** `vitest.config.js` uses `environment: "node"` so
 * that a module in `core/` or `state/` reaching for `document` fails the run (NFR-01). Handing this
 * corner a browser environment would trade a real guard for a test's convenience.
 *
 * `overlay-view.js` re-exports both tables, so nothing that already imported them from there had to
 * change.
 */

/** Which screen the overlay is showing. `none` means the match is on screen and nothing is asked. */
export const OVERLAY_SCREEN = Object.freeze({
  NONE: "none",
  MENU: "menu",
  SETUP: "setup",
  PAUSE: "pause",
  WIN: "win",
  HANDOVER: "handover",
  /** The dice card pool overview (issue #30). The only screen with cards on it. */
  POOL: "pool",
  /**
   * S3, the line-up: who plays each seat of the match, a person or the computer (issue #76, FR-43).
   * The seventh screen, between the player count and the match, and the only one with rows on it.
   */
  LINEUP: "lineup",
  /** The online door: host a match or join one (issue #42, FR-42). */
  ONLINE: "online",
  /** The host's lobby: player count, seat rows, invite and reply codes, Start. */
  HOST: "host",
  /** The guest's lobby: paste the invite code, copy the reply code, wait for the host. */
  JOIN: "join",
  /** S11, the settings screen: the language choice (issue #77). Reached from the menu's third door. */
  SETTINGS: "settings",
});

/** What an overlay button can ask for, as the `data-action` the event handler reads. */
export const OVERLAY_ACTION = Object.freeze({
  /**
   * Leave the main menu for the match setup. Called `start` until design handoff 12, which made the
   * menu three doors rather than one button, so the action had to say **which** door (D80).
   */
  HOTSEAT: "hotseat",
  /**
   * The online door (FR-42). Disabled until issue #42 opened it on 2026-09-09; it now leads to
   * `OVERLAY_SCREEN.ONLINE`.
   */
  ONLINE: "online",
  /**
   * The settings door (S11). It leads to `OVERLAY_SCREEN.SETTINGS` since issue #77 on 2026-09-10.
   *
   * It was the one door that did not work from design handoff 12 until then: S11 had been deleted,
   * and D77.2 drew the door with the DOM's own `disabled` attribute so that no click arrived and no
   * keyboard stop landed where `Enter` would do nothing. That rule still stands for any door that is
   * dead; this one no longer is.
   */
  SETTINGS: "settings",
  /**
   * One language on the settings screen (issue #77). Carries `data-value`, the locale code, the same
   * way the line-up's two positions carry which position they are, and `aria-pressed` on the chosen one.
   */
  LANGUAGE: "language",
  /** A player count, 2, 3 or 4. Carries `data-count` as well. */
  PLAYERS: "players",
  /**
   * Close the overlay and carry on.
   *
   * Used by the pause screen and by the pool overview, which both suspend the match loop while they are
   * open and both mean exactly "put it back the way it was" when they close. One action rather than two
   * with identical handlers.
   */
  RESUME: "resume",
  /** A fresh match with the same players (FR-06). */
  RESTART: "restart",
  /** Give up and go back to the main menu (FR-07). */
  QUIT: "quit",
  /** The handover is acknowledged and the next player's turn may begin. */
  READY: "ready",
  /**
   * One position of one seat row on the line-up screen (issue #76, design handoff 15, D91).
   *
   * It carries **two** values rather than one: `data-seat`, the seat the row is about, and
   * `data-value`, which of the two positions was clicked. Both are needed because the control is a
   * pair of named positions and not one button that flips, so a click on the position that is already
   * chosen has to be a no-op rather than a switch to the other one.
   */
  CONTROLLER: "controller",
  /** Start the match with the line-up as it stands. The line-up screen's one primary (D94.1). */
  BEGIN: "begin",
  /**
   * Back one screen. The line-up's Back goes to the player count (D94.2); since issue #42 the three
   * online screens have one too, and `session-actions.js` decides where each goes.
   */
  BACK: "back",
  /** Host an online match. Carries `data-count` once a player count is being chosen (issue #42). */
  HOST: "host",
  /** Join an online match. */
  JOIN: "join",
  /** Paste a code and connect. Carries `data-field`, the textarea whose text is the code. */
  CONNECT: "connect",
  /** Copy the code on screen. Carries `data-field` as well. */
  COPY: "copy",
  /** The host wants one more guest: open a fresh invite. */
  ADD_GUEST: "add-guest",
  /** The host's Start match, once every seat is connected. */
  START_ONLINE: "start-online",
});
