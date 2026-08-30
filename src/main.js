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
 * `?players=4` picks the seat count, and `?fast=1` shortens the two pauses in the turn loop so a test
 * does not spend four seconds per passed turn.
 *
 * All three are read **here and nowhere else**. `core/` never sees a query parameter, a global or
 * `Math.random`, which is the whole point of injecting the RNG rather than reaching for one. The
 * arithmetic that turns a seed into numbers is `createSeededRng` in `core/dice-source.js`, because
 * that is arithmetic; deciding that the seed comes out of a URL is composition, and that is here.
 *
 * ## What is still stubbed
 *
 * The dice source is the real twenty-card pool as of issue #30. Which of the three drawn cards gets
 * rolled is still picked for the player by `ui/game-loop.js`, because the hand has no design yet and
 * therefore nothing to click. That is the last piece of issue #37 and it is issue #31.
 */

import $ from "jquery";

import { createDicePool } from "./core/dice-pool.js";
import { createSeededRng } from "./core/dice-source.js";
import { initI18n } from "./i18n/index.js";
import { matchDeps, startMatch } from "./state/match.js";
import { renderBoard } from "./ui/board-view.js";
import { createGameLoop } from "./ui/game-loop.js";

import "./ui/styles/tokens.css";
import "./ui/styles/app.css";
import "./ui/styles/board.css";
import "./ui/styles/board-track.css";
import "./ui/styles/pawn.css";
import "./ui/styles/refusal.css";

/** Player counts a match can start with (FR-01). Anything else in the URL falls back to four. */
const PLAYER_COUNTS = [2, 3, 4];

/** How long a Playwright run waits, in milliseconds, when `?fast=1` is set. */
const FAST_DELAYS = { afterMove: 0, afterRefusal: 0 };

/**
 * The three settings the address bar may carry.
 *
 * Every one of them falls back rather than throwing. A malformed URL should start a normal game, not
 * a blank page: this is the entry point, so there is nowhere for an error to be reported to yet.
 */
export function readOptions(search) {
  const params = new URLSearchParams(search);
  const seed = Number.parseInt(params.get("seed") ?? "", 10);
  const players = Number.parseInt(params.get("players") ?? "", 10);

  return {
    seed: Number.isInteger(seed) ? seed : Math.floor(Math.random() * 2 ** 31),
    playerCount: PLAYER_COUNTS.includes(players) ? players : 4,
    fast: params.get("fast") === "1",
  };
}

/** Build the page: an `.app` shell holding the board and the message region under it. */
function mount($root, $board) {
  const $message = $("<div>", { class: "move-refusal" });

  $root.empty().append($("<div>", { class: "app" }).append($board, $message));
  return $message;
}

/**
 * Boot the game.
 *
 * Returns the loop so that a browser console, and a Playwright test that needs to look at the state
 * rather than at the screen, has something to hold on to.
 */
export async function boot(root = "#app", search = window.location.search) {
  const options = readOptions(search);

  await initI18n();

  const deps = matchDeps(createSeededRng(options.seed), createDicePool());
  const state = startMatch(options.playerCount, deps);

  const $board = renderBoard(state);
  const $message = mount($(root), $board);

  const loop = createGameLoop({
    initialState: state,
    deps,
    $board,
    $message,
    delays: options.fast ? FAST_DELAYS : {},
  });

  loop.start();
  return loop;
}

// Exposed so a Playwright test can read the state the rules produced, rather than inferring it from
// the pixels. The board's own attributes are what the tests assert on; this is for diagnosing a
// failure, not for driving one.
boot().then((loop) => {
  window.ludo = loop;
});
