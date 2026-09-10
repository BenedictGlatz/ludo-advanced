/**
 * The host's lobby seats bots. Issue #101.
 *
 * Driven with the same fakes as `online-flow.test.js`. What is asserted is the wiring and not the rule:
 * the rule is `lobby-seats.js` and has its own test. Here: a bot seat reaches `beginMatch` in the state,
 * the guest lands on the seat the bot left free, an invite with no seat left is hung up, and neither a
 * seated guest nor the host's last companion can be turned into a bot.
 */

import { describe, expect, it } from "vitest";

import { browser, fakeLinks, joinTable, settle, table } from "../../helpers/online-fakes.js";

describe("bots in the host's lobby", () => {
  it("seats a bot on a free seat, the guest on the next one, and starts with that bot", async () => {
    const links = fakeLinks();
    const host = browser(links);
    host.flow.host(3);
    await settle();

    // Seat 2 goes to the computer; the invite already out stays, because seat 1 is still free.
    host.flow.setController(2, "bot");
    expect(host.flow.snapshot()).toMatchObject({ bots: [2], pending: true, invite: "invite:1" });

    const guest = await joinTable(host, links);
    expect(host.flow.snapshot().connected).toEqual([1]);

    host.flow.start();
    await settle();
    await settle();

    // The host's loop is the ordinary one with a bot in the state; the guest mounts the same state.
    expect(host.begun[0].state.bots).toEqual([2]);
    expect(host.begun[0].loopOptions.localSeats).toEqual([0]);
    expect(guest.begun[0].state.bots).toEqual([2]);
    expect(guest.begun[0].loopOptions.localSeats).toEqual([1]);
  });

  it("drops the invite on offer when the last free seat becomes a bot", async () => {
    const { host, links } = await table(3, 1);
    host.flow.addGuest();
    await settle();
    expect(host.flow.snapshot()).toMatchObject({ connected: [1], pending: true });

    host.flow.setController(2, "bot");

    expect(host.flow.snapshot()).toMatchObject({ bots: [2], pending: false, invite: null });
    expect(links.hostLinks.at(-1).closed).toBe(true);

    // And back again: the seat is free, so it is a waiting seat once more.
    host.flow.setController(2, "human");
    expect(host.flow.snapshot().bots).toEqual([]);
  });

  it("never switches a seated guest, and never leaves the host alone against bots", async () => {
    const { host } = await table(3, 1);
    host.flow.setController(1, "bot");
    expect(host.flow.snapshot().bots).toEqual([]);

    // A three-seat table with nobody in: the second free seat is refused, or the host would be alone.
    const lonely = browser(fakeLinks());
    lonely.flow.host(3);
    await settle();
    lonely.flow.setController(1, "bot");
    lonely.flow.setController(2, "bot");
    expect(lonely.flow.snapshot().bots).toEqual([1]);

    lonely.flow.start();
    await settle();
    expect(lonely.begun).toHaveLength(0);
  });

  it("keeps the bots through Play Again, and forgets them when the lobby is left", async () => {
    const links = fakeLinks();
    const host = browser(links);
    host.flow.host(3);
    await settle();
    host.flow.setController(2, "bot");
    await joinTable(host, links);
    host.flow.start();
    await settle();

    host.flow.playAgain();
    await settle();
    expect(host.begun).toHaveLength(2);
    expect(host.begun[1].state.bots).toEqual([2]);

    host.flow.leave();
    host.flow.host(3);
    expect(host.flow.snapshot().bots).toEqual([]);
  });
});
