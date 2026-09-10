/**
 * A whole online match, with no browser and no network. Issue #42.
 *
 * Modelled on `tests/unit/ai/bot-match.test.js`, which is the strongest test in the suite because it
 * asks the only question that matters about a bot: can it finish a game? This asks the same about the
 * protocol: **can two sessions on a loopback pair finish a game, with the guest's board equal to the
 * host's after every echo?** A wrong guard, a missed broadcast or a state that does not survive JSON all
 * show up here as a hang, a refusal, or two boards that disagree.
 *
 * The table, the headless loop and `wants` live in `tests/helpers/loopback-table.js` since issue #101,
 * shared with `loopback-bot-match.test.js`, where a bot on the host takes the third seat.
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
import {
  MATCH_TIMEOUT_MS,
  headlessLoop,
  onlineTable,
  settle,
  wants,
} from "../../helpers/loopback-table.js";

describe("a whole match over a loopback pair (FR-42)", () => {
  it(
    "is played to a win by a host and a guest, and the guest's board never disagrees",
    async () => {
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
    },
    MATCH_TIMEOUT_MS
  );

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

describe("three players over two loopback pairs (FR-42, seats 3 and 4 add only plumbing)", () => {
  it(
    "is played to a win with the host on seat 0 and guests on seats 1 and 2",
    async () => {
      const deps = matchDeps(createSeededRng(9));
      const start = startMatch(3, deps);
      const guestSeats = start.seats.slice(1);
      const pairs = guestSeats.map(() => createLoopbackPair());

      const host = createHostSession({
        guests: guestSeats.map((seat, index) => ({ seat, transport: pairs[index][0] })),
        poolRemaining: () => deps.diceSource.remaining(),
      });
      const loop = headlessLoop(start, deps, host.dispatcher);
      host.attach(loop);

      const guests = guestSeats.map((seat, index) => {
        const session = createGuestSession({ transport: pairs[index][1] });
        const view = { seat, session, mirror: null };
        session.onState((next) => (view.mirror = next));
        session.onRefused((reason) => {
          throw new Error(`seat ${seat} was refused: ${reason}`);
        });
        return view;
      });

      host.broadcastState(start);
      await settle();
      loop.run();
      await settle();

      let steps = 0;
      while (loop.getState().status === MATCH_STATUS.RUNNING) {
        steps += 1;
        expect(steps, "the three-player online match did not finish").toBeLessThan(30000);

        const state = loop.getState();
        const asked = guests.find((guest) => wants(state, guest.seat) !== null);

        if (asked !== undefined) {
          expect(asked.session.apply(wants(state, asked.seat))).toBe(true);
        } else {
          const hostIntent = wants(state, start.seats[0]);
          if (hostIntent === null)
            throw new Error(`nobody knows how to leave phase ${state.phase}`);
          expect(loop.submit(hostIntent), hostIntent.type).toBe(true);
        }

        await settle();

        // Every guest's board is the host's board, whoever moved.
        for (const guest of guests) expect(guest.mirror).toEqual(loop.getState());
      }

      expect(loop.getState().status).toBe(MATCH_STATUS.WON);
      expect(start.seats).toContain(loop.getState().winner);
    },
    MATCH_TIMEOUT_MS
  );
});
