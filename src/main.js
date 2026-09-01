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
 * ## Nothing here is stubbed any more
 *
 * The dice source is the real twenty-card pool (issue #30) and the player picks which of the three drawn
 * cards gets rolled (issue #31), so issue #37 is complete. The skill hand holds real cards, all 29 of them
 * have their rule, and the reaction window and its thirty-second clock are wired up, so issue #38 is
 * complete too.
 *
 * Five regions are mounted: the board, the dice hand, the skill hand, the prompt strip and the refusal
 * strip. The prompt strip is the one with **no design specification behind it**, and that is recorded
 * rather than hidden: see the header of `ui/prompt-view.js`.
 */

import $ from "jquery";

import { createDicePool } from "./core/dice-pool.js";
import { createSeededRng } from "./core/dice-source.js";
import { initI18n } from "./i18n/index.js";
import { matchDeps, startMatch } from "./state/match.js";
import { renderBoard } from "./ui/board-view.js";
import { renderDiceHand } from "./ui/dice-hand-view.js";
import { createGameLoop } from "./ui/game-loop.js";
import { renderPrompt } from "./ui/prompt-view.js";
import { renderSkillHand } from "./ui/skill-hand-view.js";

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
import "./ui/styles/prompt.css";

/** Player counts a match can start with (FR-01). Anything else in the URL falls back to four. */
const PLAYER_COUNTS = [2, 3, 4];

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
 * Build the page: the four regions design spec 03 laid out as D30, plus the prompt strip.
 *
 * Board on the left, the two hands stacked in a rail on the right, the refusal strip across the foot. The
 * plate elements are `.app__dice` and `.app__skill`; the hand itself goes inside, because `app.css`
 * styles the plate and `hand.css` styles the row of cards, and keeping those two jobs on two elements is
 * what lets the plate carry the "it is your turn" ring without touching the cards.
 *
 * **The prompt strip is the fifth region and it has no design specification.** It shares the foot of the
 * page with the refusal strip, and it is the one thing on screen composed only of existing tokens rather
 * than from a delivered spec. Recorded in the header of `ui/prompt-view.js` and in Chapter 04.
 */
function mount($root, parts) {
  const $app = $("<div>", { class: "app" }).append(
    $("<div>", { class: "app__board" }).append(parts.$board),
    $("<div>", { class: "app__dice" }).append(parts.$diceHand),
    $("<div>", { class: "app__skill" }).append(parts.$skillHand),
    parts.$prompt,
    parts.$message
  );

  $root.empty().append($app);
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

  const parts = {
    $board: renderBoard(state),
    $diceHand: renderDiceHand(deps.diceSource.handSize),
    $skillHand: renderSkillHand(),
    $prompt: renderPrompt(),
    $message: $("<div>", { class: "move-refusal" }),
  };

  mount($(root), parts);

  const loop = createGameLoop({
    initialState: state,
    deps,
    ...parts,
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
