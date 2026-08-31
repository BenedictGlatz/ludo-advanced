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
 * The dice source is the real twenty-card pool as of issue #30, and as of issue #31 the player picks
 * which of the three drawn cards gets rolled, so issue #37 is complete. The skill hand region is
 * mounted and **empty**: design spec 03 styles it, the card pool and the catalogue exist in `core/`,
 * and the wiring that draws a card into a hand is issue #38.
 */

import $ from "jquery";

import { createDicePool } from "./core/dice-pool.js";
import { createSeededRng } from "./core/dice-source.js";
import { initI18n } from "./i18n/index.js";
import { matchDeps, startMatch } from "./state/match.js";
import { renderBoard } from "./ui/board-view.js";
import { renderDiceHand } from "./ui/dice-hand-view.js";
import { createGameLoop } from "./ui/game-loop.js";

import "./ui/styles/tokens.css";
import "./ui/styles/app.css";
import "./ui/styles/board.css";
import "./ui/styles/board-track.css";
import "./ui/styles/board-regions.css";
import "./ui/styles/pawn.css";
import "./ui/styles/card.css";
import "./ui/styles/card-state.css";
import "./ui/styles/hand.css";
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

/**
 * Build the page: the four regions design spec 03 laid out as D30.
 *
 * Board on the left, the two hands stacked in a rail on the right, the refusal strip across the
 * foot. The plate elements are `.app__dice` and `.app__skill`; the hand itself goes inside, because
 * `app.css` styles the plate and `hand.css` styles the row of cards, and keeping those two jobs on
 * two elements is what lets the plate carry the "it is your turn" ring without touching the cards.
 *
 * **The skill hand region is mounted empty.** It is a region with a plate and no cards until issue
 * #38 draws one. Mounting it now rather than later is what makes the layout the one FR-31 asks for:
 * a rail that grows a second row halfway through the sprint would move the board.
 */
function mount($root, $board, $diceHand) {
  const $message = $("<div>", { class: "move-refusal" });
  const $skillHand = $("<div>", { class: "hand hand--skill" })
    .attr("data-count", 0)
    .attr("data-active", "false");

  const $app = $("<div>", { class: "app" }).append(
    $("<div>", { class: "app__board" }).append($board),
    $("<div>", { class: "app__dice" }).append($diceHand),
    $("<div>", { class: "app__skill" }).append($skillHand),
    $message
  );

  $root.empty().append($app);
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
  const $diceHand = renderDiceHand(deps.diceSource.handSize);
  const $message = mount($(root), $board, $diceHand);

  const loop = createGameLoop({
    initialState: state,
    deps,
    $board,
    $diceHand,
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
