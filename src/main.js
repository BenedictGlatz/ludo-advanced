/**
 * Composition root.
 *
 * This is the only file allowed to know about all four layers at once. It boots i18next, reads the
 * two things the address bar is allowed to say, builds a match with the RNG and the dice source
 * injected into it, and hands the result to the view. Nothing in `core/`, `state/`, `ui/` or `i18n/`
 * imports this file: the arrows all point inward.
 *
 * ## The address bar, and why only this file reads it
 *
 * `?seed=42` fixes the RNG so a Playwright run plays the same match every time, which is NFR-09.
 * `?players=4` picks the seat count **and skips the main menu**, and `?fast=1` shortens the two pauses in
 * the turn loop and passes the handover screen without waiting for its button, so a test does not spend
 * four seconds and a click per turn.
 *
 * All three are read **here and nowhere else**. `core/` never sees a query parameter, a global or
 * `Math.random`, which is the whole point of injecting the RNG rather than reaching for one. The
 * arithmetic that turns a seed into numbers is `createSeededRng` in `core/dice-source.js`, because
 * that is arithmetic; deciding that the seed comes out of a URL is composition, and that is here.
 *
 * ## What this file stopped doing in issue #41
 *
 * It used to build the page and start a match. It cannot any more, because there is a main menu in front
 * of the match now and the board's markup depends on a player count nobody has chosen yet. Assembling the
 * page moved to `ui/match-flow.js`, which is also what starts, pauses, restarts and abandons a match.
 *
 * What is left here is composition and nothing else: boot i18next, read the address bar, make the RNG,
 * and hand all three to the flow.
 *
 * ## Nothing here is stubbed any more
 *
 * The dice source is the real twenty-card pool (issue #30) and the player picks which of the three drawn
 * cards gets rolled (issue #31), so issue #37 is complete. The skill hand holds real cards, all 29 of them
 * have their rule, and the reaction window and its thirty-second clock are wired up, so issue #38 is
 * complete too.
 *
 * ## Every region on screen now has a design behind it, except one
 *
 * Design handoff 04 landed on 2026-09-01 and replaced the four interim stylesheets that used to be
 * listed here: the prompt strip, the HUD, the chrome and the overlay. **`pool.css` is the one left**, and
 * it is the request that handoff 05 has not answered yet.
 *
 * The import order below is the one 04-spec § 1 asks for, and two entries in it are load-bearing rather
 * than tidy. `prompt.css` has to come after `app.css`, because both place `.prompt` on the grid and at
 * equal specificity the later file wins. `handover.css` has to come after `overlay.css`, because it
 * overrides the sheet's transition to none, which is the whole of D39's concealment.
 */

import $ from "jquery";

import { PLAYER_COUNTS } from "./core/board.js";
import { createSeededRng } from "./core/dice-source.js";
import { initI18n } from "./i18n/index.js";
import { createMatchFlow } from "./ui/match-flow.js";

import "./ui/styles/tokens.css";
import "./ui/styles/board.css";
import "./ui/styles/board-track.css";
import "./ui/styles/board-regions.css";
import "./ui/styles/pawn.css";
import "./ui/styles/refusal.css";
import "./ui/styles/card.css";
import "./ui/styles/card-state.css";
import "./ui/styles/hand.css";
import "./ui/styles/app.css";
import "./ui/styles/hud.css";
import "./ui/styles/chrome.css";
import "./ui/styles/prompt.css";
import "./ui/styles/overlay.css";
import "./ui/styles/handover.css";
import "./ui/styles/pool.css";

/**
 * How long a Playwright run waits, in milliseconds, when `?fast=1` is set.
 *
 * `reaction` is the thirty-second window collapsed to nothing, which is the difference between a suite
 * that takes a minute and one that takes half an hour. It changes the waiting and nothing else: the window
 * still opens, and a run with `?fast=1` behaves exactly as though every eligible player declined at once.
 */
const FAST_DELAYS = { afterMove: 0, afterRefusal: 0, reaction: 0 };

/**
 * The three settings the address bar may carry.
 *
 * Every one of them falls back rather than throwing. A malformed URL should start a normal game, not
 * a blank page: this is the entry point, so there is nowhere for an error to be reported to yet.
 *
 * **`players` is `null` when the address bar does not name one**, and that is load-bearing since issue
 * #41. A named count skips the main menu and starts a match at once, which is what keeps every
 * end-to-end spec written before the menu existed working without a line changed. No count means the
 * game boots onto the menu, which is what a player gets.
 */
export function readOptions(search) {
  const params = new URLSearchParams(search);
  const seed = Number.parseInt(params.get("seed") ?? "", 10);
  const players = Number.parseInt(params.get("players") ?? "", 10);

  return {
    seed: Number.isInteger(seed) ? seed : Math.floor(Math.random() * 2 ** 31),
    players: PLAYER_COUNTS.includes(players) ? players : null,
    fast: params.get("fast") === "1",
  };
}

/**
 * Boot the game.
 *
 * Returns the flow so that a browser console, and a Playwright test that needs to look at the state
 * rather than at the screen, has something to hold on to.
 */
export async function boot(root = "#app", search = window.location.search) {
  const options = readOptions(search);

  await initI18n();

  const flow = createMatchFlow({
    $root: $(root),
    rng: createSeededRng(options.seed),
    players: options.players,
    delays: options.fast ? FAST_DELAYS : {},
    skipHandover: options.fast,
  });

  flow.start();
  return flow;
}

// Exposed so a Playwright test can read the state the rules produced, rather than inferring it from
// the pixels. The board's own attributes are what the tests assert on; this is for diagnosing a
// failure, not for driving one. `window.ludo.getLoop()` is null while the main menu is up.
boot().then((flow) => {
  window.ludo = flow;
});
