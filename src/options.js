/**
 * What the address bar may say, and what a fast test run waits. Moved out of `main.js` in issue #43.
 *
 * ## Why this is a file of its own
 *
 * Not the 300-line limit: `main.js` was at 204. It is that `readOptions` **could not be unit tested**,
 * and issue #43 added a fifth option with real arithmetic in it. Importing `main.js` from a test pulls
 * in jQuery, twenty stylesheets and a call to `boot()` at module level, none of which a test of string
 * parsing has any use for.
 *
 * So this module imports one thing, `PLAYER_COUNTS` from `core/board.js`, and holds no jQuery, no DOM
 * beyond `URLSearchParams`, and no side effect. `main.js` is still the only caller, and the sentence
 * its header makes is unchanged: **the options are read once, by the composition root.**
 *
 * Every option falls back rather than throwing. A malformed URL should start a normal game, not a blank
 * page: this is the entry point, so there is nowhere for an error to be reported to yet.
 */

import { PLAYER_COUNTS } from "./core/board.js";

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
 *
 * `bot` is the bot's thinking pause, and it is a **sixth** key, on exactly the same argument as `roll`.
 * A four-bot match at 900 ms a turn is minutes of an end-to-end run spent watching nothing happen. The
 * two specs in `bots.spec.js` that are actually about the pause run without `?fast=1`.
 */
export const FAST_DELAYS = {
  afterMove: 0,
  afterRefusal: 0,
  afterTrapCard: 0,
  reaction: 0,
  roll: 0,
  bot: 0,
};

/**
 * The five settings the address bar may carry.
 *
 * **`players` is `null` when the address bar does not name one**, and that is load-bearing since issue
 * #41. A named count skips the main menu and starts a match at once, which is what keeps every
 * end-to-end spec written before the menu existed working without a line changed. No count means the
 * game boots onto the menu, which is what a player gets.
 *
 * ## `stack` is from issue #45, and it exists because a seed could not do the job
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
 *
 * ## `bots` is new in issue #43, and it is a **number** rather than a list of seats
 *
 * How many of the seats play themselves (FR-43). **Which** seats those are is `botSeatsFor`'s rule in
 * `state/bots.js`, and putting it here would be the same rule in two places.
 *
 * Three ways to get 0, and each of them is a decision rather than a defensive check:
 *
 * - **No `players`.** Bots only make sense once the seats exist, and a count typed without a player
 *   count would have to guess how many seats it is choosing from.
 * - **`bots >= players`.** A match made only of bots is a fine thing for a test to build directly and a
 *   useless thing to hand somebody through a URL: nobody would be playing. `state/` allows it and this
 *   is the layer that does not.
 * - **Anything unparseable or negative.** A broken value starts an ordinary game, like every other
 *   option here.
 */
export function readOptions(search) {
  const params = new URLSearchParams(search);
  const seed = Number.parseInt(params.get("seed") ?? "", 10);
  const players = Number.parseInt(params.get("players") ?? "", 10);
  const bots = Number.parseInt(params.get("bots") ?? "", 10);
  const stack = params.get("stack");
  const seated = PLAYER_COUNTS.includes(players) ? players : null;

  return {
    seed: Number.isInteger(seed) ? seed : Math.floor(Math.random() * 2 ** 31),
    players: seated,
    fast: params.get("fast") === "1",
    bots: seated !== null && Number.isInteger(bots) && bots >= 0 && bots < seated ? bots : 0,
    // An empty or absent value is `null` and not `[]`: an empty array is a legitimate thing to hand
    // `startMatch`, meaning "a pool with no cards in it", and that is not what a missing parameter says.
    stack: stack === null || stack === "" ? null : stack.split(",").filter((id) => id !== ""),
  };
}
