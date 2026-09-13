/**
 * The online lobby, driven with fake links. Issue #42.
 *
 * `online-flow.js`, `host-role.js` and `guest-role.js` import no jQuery, so the whole lobby can be
 * driven here: a host with one, two and three guests, a guest joining, a bad code, leaving, and the one
 * assertion the whole design rests on, that `beginMatch` is called with the right `localSeats` for each
 * role. The fakes live in `tests/helpers/online-fakes.js` since issue #101, shared with
 * `online-flow-bots.test.js`, where the host seats bots.
 */

import { describe, expect, it, vi } from "vitest";

import { createSeededRng } from "../../../src/core/dice-source.js";
import { MATCH_STATUS } from "../../../src/state/game-state.js";
import { createOnlineFlow } from "../../../src/ui/online/online-flow.js";
import { OVERLAY_SCREEN } from "../../../src/ui/overlay-vocabulary.js";
import { browser, fakeLinks, settle, table } from "../../helpers/online-fakes.js";

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

  it("hangs up a handshake that failed and lets the next code start fresh", async () => {
    // What a Firefox guest hits when the host pastes the reply too late: the channel never opens and
    // `ready` rejects. Until 2026-09-10 the dead link was kept, `connect` refused while one existed, and
    // every retry in the lobby did nothing.
    const guestLinks = [];
    const links = {
      ...fakeLinks(),
      createGuestLink() {
        const link = {
          closed: false,
          join: async () => ({ replyCode: "reply:1", ready: Promise.reject(new Error("closed")) }),
          close() {
            link.closed = true;
          },
        };
        guestLinks.push(link);
        return link;
      },
    };
    const { flow } = browser(links);
    flow.join();

    flow.connect("invite:1");
    await settle();
    expect(flow.snapshot()).toMatchObject({ error: "failed", stage: "idle", reply: null });
    expect(guestLinks[0].closed).toBe(true);

    flow.connect("invite:1");
    await settle();
    expect(guestLinks).toHaveLength(2);
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
