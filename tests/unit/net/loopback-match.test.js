/**
 * A whole online match, with no browser and no network. Issue #42.
 *
 * Modelled on `tests/unit/ai/bot-match.test.js`, which is the strongest test in the suite because it
 * asks the only question that matters about a bot: can it finish a game? This asks the same about the
 * protocol: **can two sessions on a loopback pair finish a game, with the guest's board equal to the
 * host's after every echo?** A wrong guard, a missed broadcast or a state that does not survive JSON all
 * show up here as a hang, a refusal, or two boards that disagree.
 *
 * ## How the two seats are driven
 *
 * Neither side has a screen, so both are driven by `decide` from `src/ai/`, each with its own seat
 * written into a `bots` view of the state so the policy answers for it. The host drives seat 0 through
 * its loop directly; the guest drives seat 2 through `session.apply`, exactly as a click would. The host
 * loop is the game loop with the waiting taken out: `autoIntent` and `end-turn`, as in the bot match.
 */

import { describe, expect, it } from "vitest";

import { createSeededRng } from "../../../src/core/dice-source.js";
import { decide } from "../../../src/ai/bot-policy.js";
import { autoIntent } from "../../../src/state/auto-steps.js";
import { MATCH_STATUS, TURN_PHASE } from "../../../src/state/game-state.js";
import { INTENT, dispatch } from "../../../src/state/intents.js";
import { matchDeps, startMatch } from "../../../src/state/match.js";
import { createGuestSession } from "../../../src/net/guest-session.js";
import { createHostSession } from "../../../src/net/host-session.js";
import { createLoopbackPair } from "../../../src/net/transport.js";

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

/** The game loop with the waiting taken out: apply, then every step the loop takes by itself. */
function headlessLoop(start, deps, dispatcher) {
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
const wants = (state, seat) => decide({ ...state, bots: [seat] });

/** A two-player online table: host on seat 0, guest on seat 2, both human as far as the state knows. */
function onlineTable(seed) {
  const deps = matchDeps(createSeededRng(seed));
  const start = startMatch(2, deps);
  const [hostEnd, guestEnd] = createLoopbackPair();

  const host = createHostSession({
    guests: [{ seat: 2, transport: hostEnd }],
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

  return { deps, loop, host, guest, mirror: () => mirror, refused };
}

describe("a whole match over a loopback pair (FR-42)", () => {
  it("is played to a win by a host and a guest, and the guest's board never disagrees", async () => {
    const table = onlineTable(3);
    const { loop, guest } = table;
    let steps = 0;

    await settle();
    loop.run();
    await settle();

    while (loop.getState().status === MATCH_STATUS.RUNNING) {
      steps += 1;
      expect(steps, "the online match did not finish within 20000 intents").toBeLessThan(20000);

      // The guest acts through the wire, the host acts through its loop. Exactly one of the two seats
      // is being asked anything at any moment, so one of these is null on every pass.
      const guestIntent = wants(loop.getState(), 2);
      const hostIntent = wants(loop.getState(), 0);

      if (guestIntent !== null) {
        expect(guest.apply(guestIntent), guestIntent.type).toBe(true);
      } else if (hostIntent !== null) {
        expect(loop.submit(hostIntent), hostIntent.type).toBe(true);
      } else {
        throw new Error(`nobody knows how to leave phase ${loop.getState().phase}`);
      }

      await settle();

      // The assertion the whole file exists for.
      expect(table.mirror()).toEqual(loop.getState());
      expect(guest.isInFlight()).toBe(false);
    }

    expect(loop.getState().status).toBe(MATCH_STATUS.WON);
    expect(table.mirror().winner).toBe(loop.getState().winner);
    expect(table.refused).toEqual([]);
  });

  it("refuses a guest's roll and a guest's move on the host's turn, leaving the host's state alone", async () => {
    const table = onlineTable(5);
    const { loop, guest } = table;
    await settle();
    const before = loop.getState();
    expect(before.activePlayer).toBe(0);

    expect(guest.apply({ type: INTENT.ROLL_DIE })).toBe(false);
    expect(guest.apply({ type: INTENT.CHOOSE_DIE, faces: before.hand[0] })).toBe(true);
    await settle();

    expect(table.refused).toEqual(["intent.rejected.not-your-turn"]);
    expect(loop.getState()).toBe(before);
    expect(guest.isInFlight()).toBe(false);
  });

  it("keeps a mid-match four-player state under 16 KB on the wire", () => {
    const deps = matchDeps(createSeededRng(7));
    let state = startMatch(4, deps, undefined, undefined, [0, 1, 2, 3]);
    let largest = 0;

    // Four hundred intents of a real four-bot match, so traps, statuses and hands have something in
    // them, measuring the state after every one rather than only at the end.
    for (let steps = 0; steps < 400 && state.status === MATCH_STATUS.RUNNING; steps += 1) {
      const intent =
        decide(state) ??
        autoIntent(state) ??
        (state.phase === TURN_PHASE.TURN_END ? { type: INTENT.END_TURN } : null);
      const result = dispatch(state, intent, deps);
      expect(result.accepted, intent.type).toBe(true);
      state = result.state;
      largest = Math.max(largest, JSON.stringify(state).length);
    }

    expect(largest).toBeLessThan(16 * 1024);
  });
});
