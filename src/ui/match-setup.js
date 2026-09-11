/**
 * Building a match: the state and the `deps` it plays on, as one pair. Issue #42, split out of
 * `match-flow.js`.
 *
 * `ui/` only, and deliberately **without jQuery and without i18next**, so it runs in Vitest's `node`
 * environment. It holds no state and touches no screen: two pure builders that return `{ state, deps }`.
 *
 * ## Why this is a file
 *
 * `match-flow.js` built a match in two places, `freshMatch` and `playAgain`, and each did the same two
 * things: a fresh dice pool through `matchDeps(rng, createDicePool())`, then `startMatch` or
 * `restartMatch` on it. Online play is a third caller, the host's Start button, and a third copy of two
 * lines is where "one pool per match" stops being checkable by reading. Here it is one function per
 * shape and one unit test that asserts two matches never share a pool.
 *
 * ## One pool per match, which is what the pool asked for
 *
 * `createDicePool`'s own header says "the closure is created once per match by the composition root, so
 * two matches never share a pool", and both builders give every match a fresh one. It matters: a match
 * that ends mid-turn never returns its three drawn cards, so a second match on the same pool would start
 * with seventeen and `draw()` throws outright once four matches have leaked twelve. The RNG is
 * deliberately **not** reset, so a restart plays a different match rather than replaying the same one.
 */

import { createDicePool } from "../core/dice-pool.js";
import { botSeatsFor } from "../state/bots.js";
import { matchDeps, restartMatch, startMatch, startStackedMatch } from "../state/match.js";

/**
 * A fresh match for `playerCount` players on a fresh pool.
 *
 * - `botSeats` is the list of seats the computer plays, from the line-up screen (D95 lets it be seat 0).
 *   `null` means "derive it from `botCount`", which is the `?bots=` route.
 * - `botCount` is how many of the seats play themselves. **`Math.min(botCount, playerCount - 1)` is not
 *   belt and braces.** `?bots=` is read once, off the address bar, and `playerCount` changes every time
 *   somebody picks a different count on the setup screen, so `?players=4&bots=3`, quit, start a
 *   two-player match would otherwise seat three bots at a two-seat table. One person is always left at
 *   the keyboard.
 * - `stack` is a list of skill card ids from `?stack=`, or `null`. It is dealt into the hands at the start,
 *   one card per seat in turn order, because no turn draws a card any more (FR-22).
 */
export function freshMatchParts(rng, playerCount, { botSeats = null, botCount = 0, stack = null }) {
  const deps = matchDeps(rng, createDicePool());
  const seats = botSeats ?? botSeatsFor(playerCount, Math.min(botCount, playerCount - 1));
  const state =
    stack === null
      ? startMatch(playerCount, deps, undefined, undefined, seats)
      : startStackedMatch(playerCount, deps, stack, seats);

  return { state, deps };
}

/**
 * A fresh match with the same players (FR-06), on a pool that is whole again.
 *
 * `restartMatch` rather than `startMatch(state.playerCount, ...)`, because "the same players" is a
 * question about a match and `state/` is where a match's vocabulary lives. The **new pool** is the
 * important half: the match being restarted from has three dice cards still out on the hand it never
 * finished, so reusing its pool would start this one seventeen cards deep.
 */
export function restartParts(state, rng) {
  const deps = matchDeps(rng, createDicePool());

  return { state: restartMatch(state, deps), deps };
}
