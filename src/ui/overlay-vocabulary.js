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
});

/** What an overlay button can ask for, as the `data-action` the event handler reads. */
export const OVERLAY_ACTION = Object.freeze({
  /**
   * Leave the main menu for the match setup. Called `start` until design handoff 12, which made the
   * menu three doors rather than one button, so the action had to say **which** door (D80).
   */
  HOTSEAT: "hotseat",
  /**
   * The two menu doors that do not work: online play (FR-42, no technology chosen) and the settings
   * screen (S11, deliberately deleted).
   *
   * **Nothing handles either of them, and that is the decision rather than an omission.** D77.2 draws
   * them with the DOM's own `disabled` attribute, and a browser fires no click on a disabled button, so
   * there is no branch to write in `session-actions.js` and no stop for a keyboard to land on where
   * `Enter` would do nothing. They exist here because the door still needs a `data-action` to be told
   * apart in the stylesheet and in a test.
   */
  ONLINE: "online",
  SETTINGS: "settings",
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
  /** Back from the line-up to the player count. The only back button in the game (D94.2). */
  BACK: "back",
});
