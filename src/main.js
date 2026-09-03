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
 * ## Every region on screen has a design behind it
 *
 * That paragraph used to say "except one" and name `pool.css` as the last interim stylesheet Claude Code
 * had written. Handoff 05 answered it on 2026-09-02 and handoff 06 closed the pawn mark with it, so
 * **every rule in this project's CSS now comes from a numbered decision in a spec.** Handoff 07 added
 * `board-trap.css` on 2026-09-03 and kept that true.
 *
 * The import order below is the one 04-spec § 1 asks for, and five entries in it are load-bearing rather
 * than tidy. `prompt.css` has to come after `app.css`, because both place `.prompt` on the grid and at
 * equal specificity the later file wins. `handover.css` has to come after `overlay.css`, because it
 * overrides the sheet's transition to none, which is the whole of D39's concealment. `board-trap.css` has
 * to come after `board.css`, because it reads the one seat mapping that file owns. `card-reveal.css` has
 * to come after all three of `card.css`, `card-state.css` and `hand.css`, because it overrides
 * declarations in each of them and nothing in them overrides it: it is the one state that changes a
 * card's size and re-flows its insides, which is why 10-spec § 2 split it out rather than making any one
 * of the three reach into the other two.
 *
 * `roll.css` is the fifth and it is last of the card files, after `card-reveal.css`, which is what
 * 11-spec § 1 asks for. **It is there because it composes rather than because it overrides**, and that is
 * worth the sentence: the throw is written on `rotate` and `translate` and never on `transform`, so it
 * adds to the lift that `card-state.css` and `hand.css` write into `transform` instead of replacing it
 * (D71.1). Last is where a file that only adds belongs, so nothing has to be reconciled when one of the
 * four ahead of it changes.
 *
 * **One ordering is a known conflict rather than a decision**, and it is written down here because the
 * cascade is the only place it is visible. `prompt.css` styles a pickable field in the skill teal and
 * dims every field that is not offered, which handoff 04 delivered; `board.css` now styles the same
 * field violet with nothing dimmed, which handoff 07's D59 delivered. `prompt.css` loads later and wins,
 * so the D59 block is inert. Two specs answered one question in opposite directions, the loop had no way
 * to notice, and reconciling them is D61. See `01-Design/Handoff/08-brief-pickable-field.md`.
 *
 * **Moving `board-trap.css` later would not fix that and must not be tried.** The collision is between
 * `prompt.css` and `board.css`, on `box-shadow` and `background`, at equal specificity, and it swallows
 * D59's keyboard focus rule along with its fill. Reordering the imports to win it would silently take a
 * design decision that D61 exists to ask, and it would move a file whose position `board-trap.css`
 * depends on. `traps.spec.js` carries a case that asserts the current, wrong outcome and will go red the
 * day D61 lands.
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
import "./ui/styles/board-trap.css";
import "./ui/styles/pawn.css";
import "./ui/styles/message-strip.css";
import "./ui/styles/card.css";
import "./ui/styles/card-state.css";
import "./ui/styles/hand.css";
import "./ui/styles/card-reveal.css";
import "./ui/styles/roll.css";
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
 *
 * `afterTrapCard` is D60's two-second hold, collapsed the same way. It is a **fourth** key and not a reuse
 * of `afterTrap`, although both are about a trap: `afterTrap` is the wait once the turn has ended and
 * reads `--motion-refusal-hold`, this one is the mid-turn wait and reads `--motion-trap-hold`. Two
 * different numbers for two events that differ in who caused them, and a unit test pins that each can be
 * collapsed without the other.
 *
 * `roll` is D70's 900 ms hold, and it is a **fifth** key. Design spec 11 was asked whether skipping it
 * entirely in a test run is acceptable and answered yes, for a reason worth keeping: nothing in the game
 * state depends on the hold. It is reading time, it changes no value, and no rule branches on it. A
 * figure that had to be honoured everywhere would cost 900 ms on every one of the roughly 250 rolls in
 * an end-to-end run, which is minutes of wall clock for a frame nobody is watching. The place the timing
 * is asserted is `roll-animation.spec.js`, at real speed, so one spec pays for it instead of all of them.
 */
const FAST_DELAYS = { afterMove: 0, afterRefusal: 0, afterTrapCard: 0, reaction: 0, roll: 0 };

/**
 * The four settings the address bar may carry.
 *
 * Every one of them falls back rather than throwing. A malformed URL should start a normal game, not
 * a blank page: this is the entry point, so there is nowhere for an error to be reported to yet.
 *
 * **`players` is `null` when the address bar does not name one**, and that is load-bearing since issue
 * #41. A named count skips the main menu and starts a match at once, which is what keeps every
 * end-to-end spec written before the menu existed working without a line changed. No count means the
 * game boots onto the menu, which is what a player gets.
 *
 * ## `stack` is new in issue #45, and it exists because a seed could not do the job
 *
 * A comma-separated list of skill card ids that becomes the top of the skill pool, so a test can be
 * sure the hand it is about to play from holds the card it is testing.
 *
 * The trap flows are what forced it. A trap card is 4 ids out of 29, and the flow needs **two** turns
 * to line up: one to lay the trap, and another for a foreign pawn to walk over it. The existing answer
 * in `skill-hand.spec.js`, assert the mechanism and skip when the shuffle produced something else, is
 * no help when the thing under test is a two-turn sequence.
 *
 * **Pinning a seed is worse, and `scripts/find-seeds.js` says why in its own header:** it never plays a
 * card, "because a card played here would change what the RNG is spent on and every seed with it". So
 * it cannot find such a seed, and the seeds it does find have already gone stale three times.
 *
 * It changes no rule. `startMatch` has taken a stacked pool since issue #38 and its comment already
 * records that no production caller passes one, so this is a parameter finding its user rather than a
 * new seam. Same category as `?seed=` and `?fast=1`: read here and nowhere else.
 */
export function readOptions(search) {
  const params = new URLSearchParams(search);
  const seed = Number.parseInt(params.get("seed") ?? "", 10);
  const players = Number.parseInt(params.get("players") ?? "", 10);
  const stack = params.get("stack");

  return {
    seed: Number.isInteger(seed) ? seed : Math.floor(Math.random() * 2 ** 31),
    players: PLAYER_COUNTS.includes(players) ? players : null,
    fast: params.get("fast") === "1",
    // An empty or absent value is `null` and not `[]`: an empty array is a legitimate thing to hand
    // `startMatch`, meaning "a pool with no cards in it", and that is not what a missing parameter says.
    stack: stack === null || stack === "" ? null : stack.split(",").filter((id) => id !== ""),
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
    stack: options.stack,
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
