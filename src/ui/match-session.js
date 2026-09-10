/**
 * The running match, as the session holds it: the loop, its state and its `deps`. Issue #42, split out
 * of `match-flow.js`.
 *
 * `ui/` only. The seam is the one `match-flow.js`'s own header drew between two questions: **which screen
 * is the session on**, which stays there, and **what match is on the page**, which is this file. The two
 * had been one file because a session used to have exactly one way into a match; with the line-up, the
 * `?players=` route, Play Again and now the online host and guest there are five, and the part that
 * mounts a board and holds the loop is the part they all share.
 *
 * ## Why a new match rebuilds the page
 *
 * The board's DOM depends on the player count: a two-player match has eight pawns and a four-player one
 * has sixteen. So starting a match builds fresh regions and mounts them, and the old elements go away
 * with their jQuery handlers still attached to them, which is what keeps handlers from accumulating over
 * a session of restarts. **The chrome and the overlay are the exception and live for the whole session**,
 * because they are not part of a match: the language switch works on the main menu, and the overlay is
 * what the main menu is.
 */

import { createGameLoop } from "./game-loop.js";
import { createMatchClock } from "./match-clock.js";
import { freshMatchParts, restartParts } from "./match-setup.js";
import { emptyParts, matchParts, mount } from "./page.js";

/**
 * - `$root` and `session` (`{ $chrome, $overlay }`) are what `page.js`'s `mount` needs.
 * - `rng`, `delays`, `skipHandover`, `stack` and `bots` are the flow's boot options, passed through to
 *   every loop and every match built here.
 * - `onCurtain`, `onMatchOver` and `onMount` are the flow's: put the handover up, put the win screen up,
 *   and take the overlay down when a board has just been mounted.
 */
export function createMatchSession({
  $root,
  session,
  rng,
  delays,
  skipHandover,
  stack,
  bots,
  onCurtain,
  onMatchOver,
  onMount,
}) {
  let loop = null;
  let state = null;
  let deps = null;

  /**
   * How long the match on screen has been running (issue #77). Started in `beginMatch` and nowhere
   * else, so every route into a match, fresh, Play Again and the online guest's mirror, counts from the
   * moment its board appeared. The pause screen reads it; `match-clock.js` says why it never stops.
   */
  const clock = createMatchClock();

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

    onMount();
    clock.start();
    loop.start();

    return loop;
  }

  return {
    beginMatch,
    clock,

    /** A fresh match on a fresh pool. `match-setup.js` carries the bot clamp and the stack. */
    freshMatch(playerCount, botSeats = null) {
      const built = freshMatchParts(rng, playerCount, { botSeats, botCount: bots, stack });

      beginMatch(built.state, built.deps);
    },

    /** A fresh match with the same players (FR-06), on a pool that is whole again. */
    playAgain() {
      const built = restartParts(state, rng);

      beginMatch(built.state, built.deps);
    },

    /**
     * The curtain is going up: remember the state the screens describe, and stop the clock under it.
     *
     * The flow refreshes its copy of the state only at a handover or a win, so the handover screen names
     * the right seat; `loop.pause()` is the pause screen's own path, so the window's clock stops too.
     */
    holdForCurtain() {
      state = loop.getState();
      loop.pause();
    },

    /** The match is over, by a win or by being given up. The win screen reads this state. */
    finish(finalState) {
      state = finalState;
    },

    /**
     * Give the match up and go back to an empty page (FR-07).
     *
     * **The page is rebuilt empty**, and that is not cosmetic even though the menu's sheet is opaque and
     * hides whatever is behind it. Leaving the abandoned match mounted means its board, its pawns and its
     * HUD are still in the document, still answering every selector, for as long as the player sits on
     * the menu. A test caught it: after quitting, `.board .pawn` still resolved to eight elements.
     */
    quit() {
      loop?.stop();
      loop = null;
      state = null;
      // The pool goes with the match, so the overview cannot describe an abandoned one from the menu.
      deps = null;

      mount($root, emptyParts(), session);
    },

    /** An empty page for the menu to sit over, at boot. */
    mountEmpty() {
      mount($root, emptyParts(), session);
    },

    getLoop: () => loop,
    getState: () => state,
    getDeps: () => deps,
  };
}
