/**
 * The online lobby, driven with fake links. Issue #42.
 *
 * `online-flow.js`, `host-role.js` and `guest-role.js` import no jQuery, so the whole lobby can be
 * driven here: a host with one, two and three guests, a guest joining, a bad code, leaving, and the one
 * assertion the whole design rests on, that `beginMatch` is called with the right `localSeats` for each
 * role. The links are fakes whose codes are plain strings and whose channels are loopback pairs.
 */

import { describe, expect, it, vi } from "vitest";

import { createSeededRng } from "../../../src/core/dice-source.js";
import { MATCH_STATUS } from "../../../src/state/game-state.js";
import { createLoopbackPair } from "../../../src/net/transport.js";
import { createOnlineFlow } from "../../../src/ui/online/online-flow.js";
import { OVERLAY_SCREEN } from "../../../src/ui/overlay-vocabulary.js";

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Fake links: an invite code is `invite:<n>`, a reply code is `reply:<n>`, and accepting the right reply
 * hands the host one end of a loopback pair whose other end the matching guest link resolves with.
 */
function fakeLinks() {
  const pairs = new Map();
  let next = 0;

  return {
    createHostLink() {
      const id = (next += 1);
      return {
        invite: async () => `invite:${id}`,
        accept: async (reply) => {
          if (reply !== `reply:${id}`) throw new Error("bad-code");
          const [hostEnd, guestEnd] = createLoopbackPair();
          pairs.set(id, guestEnd);
          return hostEnd;
        },
        close() {},
      };
    },
    createGuestLink() {
      return {
        join: async (invite) => {
          const match = /^invite:(\d+)$/u.exec(invite);
          if (match === null) throw new Error("bad-code");
          const id = Number(match[1]);
          const ready = new Promise((resolve) => {
            const poll = () => (pairs.has(id) ? resolve(pairs.get(id)) : setTimeout(poll, 0));
            poll();
          });
          return { replyCode: `reply:${id}`, ready };
        },
        close() {},
      };
    },
  };
}

/** A headless loop with the surface the roles call, recording what it was built with. */
function fakeLoop(options) {
  let state = options.initialState;
  return {
    options,
    start() {},
    getState: () => state,
    submit() {
      return false;
    },
    receive(next) {
      state = next;
    },
    abandon() {
      state = { ...state, status: MATCH_STATUS.ABANDONED };
      options.onMatchOver?.(state);
    },
    showRefusal() {},
    pause() {},
    resume() {},
    stop() {},
  };
}

/** One browser: a flow with a recording `beginMatch` and a fake screen. */
function browser(links) {
  const begun = [];
  let screen = OVERLAY_SCREEN.MENU;
  const flow = createOnlineFlow({
    openScreen: (next) => (screen = next),
    getScreen: () => screen,
    drawShell: vi.fn(),
    beginMatch: (state, deps, { createLoop, loopOptions }) => {
      const loop = (createLoop ?? fakeLoop)({ initialState: state, deps, ...loopOptions });
      begun.push({ state, loop, loopOptions });
      return loop;
    },
    onMatchOver: vi.fn(),
    rng: createSeededRng(1),
    delays: { reaction: 0 },
    links,
    loops: { createGuestLoop: fakeLoop, guestDeps: () => ({ rng: null, diceSource: {} }) },
    clipboard: { write: vi.fn() },
    wait: () => 0,
  });

  return { flow, begun, screen: () => screen };
}

/** Host `count` players: the host plus `count - 1` guests, codes swapped through the fakes. */
async function table(count) {
  const links = fakeLinks();
  const host = browser(links);
  const guests = [];

  host.flow.open();
  host.flow.host(count);
  await settle();

  for (let n = 0; n < count - 1; n += 1) {
    if (n > 0) {
      host.flow.addGuest();
      await settle();
    }
    const guest = browser(links);
    guest.flow.join();
    guest.flow.connect(host.flow.snapshot().invite);
    await settle();
    host.flow.connect(guest.flow.snapshot().reply);
    await settle();
    await settle();
    guests.push(guest);
  }

  return { host, guests };
}

describe("hosting", () => {
  it("opens the door, asks for a count, then makes the first invite", async () => {
    const { flow, screen } = browser(fakeLinks());

    flow.open();
    expect(screen()).toBe(OVERLAY_SCREEN.ONLINE);

    flow.host();
    expect(screen()).toBe(OVERLAY_SCREEN.HOST);
    expect(flow.snapshot()).toMatchObject({ role: "host", playerCount: null, invite: null });

    flow.host(2);
    await settle();
    expect(flow.snapshot()).toMatchObject({ playerCount: 2, seats: [0, 2], invite: "invite:1" });
  });

  it.each([2, 3, 4])(
    "seats %i players in join order and starts one match for each screen",
    async (count) => {
      const { host, guests } = await table(count);
      const seats = host.flow.snapshot().seats;

      expect(host.flow.snapshot().connected).toEqual(seats.slice(1));

      host.flow.start();
      await settle();
      await settle();

      // The host runs the ordinary loop with its own seat local and a broadcasting dispatcher.
      expect(host.begun).toHaveLength(1);
      expect(host.begun[0].loopOptions.localSeats).toEqual([seats[0]]);
      expect(typeof host.begun[0].loopOptions.dispatcher).toBe("function");
      expect(host.begun[0].state.playerCount).toBe(count);
      expect(host.begun[0].state.bots).toEqual([]);

      // Every guest mounted the same state, with its own seat as the only local one.
      guests.forEach((guest, index) => {
        expect(guest.begun).toHaveLength(1);
        expect(guest.begun[0].loopOptions.localSeats).toEqual([seats[index + 1]]);
        expect(guest.begun[0].state).toEqual(host.begun[0].state);
        expect(guest.begun[0].loopOptions.delays.reaction).toBe(0);
        expect(guest.flow.active()).toBe(true);
        expect(guest.flow.canRestart()).toBe(false);
      });
      expect(host.flow.canRestart()).toBe(true);
    }
  );

  it("refuses a wrong reply code and stays in the lobby", async () => {
    const { flow } = browser(fakeLinks());
    flow.host(2);
    await settle();

    flow.connect("reply:99");
    await settle();

    expect(flow.snapshot()).toMatchObject({ error: "badCode", connected: [] });
    expect(flow.snapshot().invite).toBe("invite:1");
  });

  it("copies the code on screen and says so", async () => {
    const links = fakeLinks();
    const clipboard = { write: vi.fn() };
    const flow = createOnlineFlow({
      openScreen: vi.fn(),
      getScreen: () => OVERLAY_SCREEN.HOST,
      drawShell: vi.fn(),
      beginMatch: vi.fn(),
      onMatchOver: vi.fn(),
      rng: createSeededRng(1),
      links,
      loops: {},
      clipboard,
    });
    flow.host(2);
    await settle();

    flow.copy("invite:1");

    expect(clipboard.write).toHaveBeenCalledWith("invite:1");
    expect(flow.snapshot().copied).toBe(true);
  });
});

describe("joining", () => {
  it("refuses a bad invite and otherwise shows the reply code while waiting", async () => {
    const { flow, screen } = browser(fakeLinks());

    flow.join();
    expect(screen()).toBe(OVERLAY_SCREEN.JOIN);

    flow.connect("nonsense");
    await settle();
    expect(flow.snapshot()).toMatchObject({ role: "guest", error: "badCode", reply: null });

    flow.connect("invite:1");
    await settle();
    expect(flow.snapshot()).toMatchObject({ reply: "reply:1", stage: "waiting", error: null });
  });

  it("ignores an empty Connect", () => {
    const { flow } = browser(fakeLinks());
    flow.join();

    flow.connect("   ");

    expect(flow.snapshot().stage).toBe("idle");
  });
});

describe("leaving", () => {
  it("ends the guest's match as abandoned when the host quits", async () => {
    const { host, guests } = await table(2);
    host.flow.start();
    await settle();
    await settle();

    host.flow.leave();
    await settle();
    await settle();

    expect(guests[0].begun[0].loop.getState().status).toBe(MATCH_STATUS.ABANDONED);
    expect(host.flow.role()).toBeNull();
    expect(host.flow.snapshot()).toBeNull();
  });

  it("forgets the lobby, so a new match starts clean", async () => {
    const { flow } = browser(fakeLinks());
    flow.host(3);
    await settle();

    flow.leave();

    expect(flow.role()).toBeNull();
    expect(flow.active()).toBe(false);
    expect(flow.canRestart()).toBe(true);
  });
});
