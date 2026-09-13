/**
 * An online table with no browser and no network, for the loopback match tests. Issues #42 and #101.
 *
 * Not a test file itself: Vitest only collects `*.test.js`, so nothing here runs on its own. Split out of
 * `tests/unit/net/loopback-match.test.js` when the bot case (issue #101) took that file past 300 lines.
 *
 * ## How the seats are driven
 *
 * Nobody here has a screen, so every seat is driven by `decide` from `src/ai/`. A **person's** seat gets
 * `wants`, which writes that one seat into a `bots` view of the state so the policy answers for it
 * without the state ever marking it a bot. A **real bot** on the host (issue #101) is asked with `decide`
 * on the plain state, exactly as `bot-driver.js` does. The host loop is the game loop with the waiting
 * taken out: `autoIntent` and `end-turn`, as in `bot-match.test.js`.
 */

import { createSeededRng } from "../../src/core/dice-source.js";
import { decide } from "../../src/ai/bot-policy.js";
import { autoIntent } from "../../src/state/auto-steps.js";
import { MATCH_STATUS, TURN_PHASE } from "../../src/state/game-state.js";
import { INTENT } from "../../src/state/intents.js";
import { matchDeps, startMatch } from "../../src/state/match.js";
import { createGuestSession } from "../../src/net/guest-session.js";
import { createHostSession } from "../../src/net/host-session.js";
import { createLoopbackPair } from "../../src/net/transport.js";

/** One macrotask: the loopback pair delivers on a microtask, so this is one message hop. */
export const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * A whole match is a few thousand macrotask turns, one per `settle`, and under `--coverage` the
 * instrumented rules run slowly enough that Vitest's default five seconds is not enough.
 */
export const MATCH_TIMEOUT_MS = 120_000;

/** The game loop with the waiting taken out: apply, then every step the loop takes by itself. */
export function headlessLoop(start, deps, dispatcher) {
  let state = start;

  function run() {
    for (;;) {
      const auto =
        autoIntent(state) ??
        (state.phase === TURN_PHASE.TURN_END ? { type: INTENT.END_TURN } : null);
      if (auto === null) return;

      const result = dispatcher(state, auto, deps);
      if (!result.accepted) throw new Error(`${auto.type} refused in phase ${state.phase}`);
      state = result.state;
    }
  }

  return {
    getState: () => state,
    submit(intent) {
      const result = dispatcher(state, intent, deps);
      if (!result.accepted) return false;
      state = result.state;
      run();
      return true;
    },
    run,
  };
}

/** What `seat` would do now, asked of the policy as though that seat were a bot. */
export const wants = (state, seat) => decide({ ...state, bots: [seat] });

/**
 * A table with the host on the first seat and one guest on the **last** seat. `players` is 2 by default,
 * which puts the guest on seat 2; `bots` marks seats the host's computer plays (issue #101), so a
 * three-seat table with `bots: [1]` is host, bot, guest.
 */
export function onlineTable(seed, { players = 2, bots = [] } = {}) {
  const deps = matchDeps(createSeededRng(seed));
  const start = startMatch(players, deps, undefined, undefined, bots);
  const guestSeat = start.seats.at(-1);
  const [hostEnd, guestEnd] = createLoopbackPair();

  const host = createHostSession({
    guests: [{ seat: guestSeat, transport: hostEnd }],
    poolRemaining: () => deps.diceSource.remaining(),
  });
  const loop = headlessLoop(start, deps, host.dispatcher);
  host.attach(loop);

  const guest = createGuestSession({ transport: guestEnd });
  let mirror = null;
  const refused = [];
  guest.onState((next) => (mirror = next));
  guest.onRefused((reason) => refused.push(reason));

  host.broadcastState(start);

  return { deps, start, loop, host, guest, guestSeat, mirror: () => mirror, refused };
}

/** Play the host's seat through its loop until it is somebody else's turn. */
export function playHostTurn(loop, hostSeat = 0) {
  while (
    loop.getState().status === MATCH_STATUS.RUNNING &&
    loop.getState().activePlayer === hostSeat
  ) {
    const intent = wants(loop.getState(), hostSeat);
    if (intent === null)
      throw new Error(`nobody knows how to leave phase ${loop.getState().phase}`);
    if (!loop.submit(intent)) throw new Error(`${intent.type} refused`);
  }
}
