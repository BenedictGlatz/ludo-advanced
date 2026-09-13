/**
 * The two ways an exchange ends badly, and a guest who drops mid-match. Issue #42, design spec 19,
 * D121.2 and D121.3.
 *
 * Driven with the fakes of `online-fakes.js` plus two links that fail on purpose. What is asserted is the
 * host role's bookkeeping: after twenty seconds without a channel the invite is dropped and its link hung
 * up, so the lobby offers a fresh code; a handshake that fails does the same; a bad paste keeps the
 * invite; and a guest who leaves a running match is named in the abandoned state every other guest gets
 * before the pipes close.
 */

import { describe, expect, it } from "vitest";

import { createHostRole } from "../../../src/ui/online/host-role.js";
import { MATCH_STATUS } from "../../../src/state/game-state.js";
import { STAGE } from "../../../src/ui/online/lobby-screen.js";
import { fakeLinks, settle, table } from "../../helpers/online-fakes.js";

/** A host role with recording hooks, and the timeout callback caught so a test can fire it. */
function hostWith(links) {
  const timeouts = [];
  const role = createHostRole({
    links,
    rng: () => 0.5,
    delays: {},
    beginMatch: () => null,
    refresh: () => {},
    onMatchOver: () => {},
    wait: (fn) => {
      timeouts.push(fn);
      return 0;
    },
  });

  return { role, fire: () => timeouts.forEach((fn) => fn()) };
}

/** Links whose handshake never opens a channel (`accept` hangs) or fails outright. */
function stuckLinks({ acceptFails = false } = {}) {
  const hostLinks = [];

  return {
    hostLinks,
    createHostLink() {
      const link = {
        closed: false,
        invite: async () => "invite:stuck",
        accept: () =>
          acceptFails ? Promise.reject(new Error("ice-failed")) : new Promise(() => {}),
        close() {
          link.closed = true;
        },
      };
      hostLinks.push(link);
      return link;
    },
  };
}

describe("the twenty-second failure (D121.2)", () => {
  it("drops the invite, hangs up the link and says nat, so a fresh code is the next step", async () => {
    const links = stuckLinks();
    const { role, fire } = hostWith(links);
    role.begin(2);
    await settle();
    role.connect("reply:whatever");
    await settle();
    expect(role.snapshot()).toMatchObject({ stage: STAGE.CONNECTING, pending: true });

    fire();

    expect(role.snapshot()).toMatchObject({
      error: "nat",
      stage: STAGE.IDLE,
      pending: false,
      invite: null,
    });
    expect(links.hostLinks[0].closed).toBe(true);

    // The next invite starts clean: no error, a new link.
    await role.addGuest();
    expect(role.snapshot()).toMatchObject({ error: null, invite: "invite:stuck", pending: true });
    expect(links.hostLinks).toHaveLength(2);
  });

  it("drops the invite when the handshake itself fails, and keeps it on a bad paste", async () => {
    const failing = stuckLinks({ acceptFails: true });
    const { role } = hostWith(failing);
    role.begin(2);
    await settle();
    await role.connect("reply:whatever");

    expect(role.snapshot()).toMatchObject({ error: "failed", pending: false, invite: null });
    expect(failing.hostLinks[0].closed).toBe(true);

    const links = fakeLinks();
    const badPaste = hostWith(links);
    badPaste.role.begin(2);
    await settle();
    await badPaste.role.connect("nonsense");

    expect(badPaste.role.snapshot()).toMatchObject({
      error: "badCode",
      pending: true,
      invite: "invite:1",
      stage: STAGE.WAITING,
    });
    expect(links.hostLinks[0].closed).toBe(false);
  });

  it("closes a link that gathers into nothing rather than leaving it half open", async () => {
    const links = {
      hostLinks: [],
      createHostLink() {
        const link = {
          closed: false,
          invite: () => Promise.reject(new Error("no-candidates")),
          close() {
            link.closed = true;
          },
        };
        links.hostLinks.push(link);
        return link;
      },
    };
    const { role } = hostWith(links);
    role.begin(2);
    await settle();

    expect(role.snapshot()).toMatchObject({ error: "failed", pending: false });
    expect(links.hostLinks[0].closed).toBe(true);
  });
});

describe("a guest who drops mid-match (D121.3)", () => {
  it("is named in the abandoned state the other guests receive before the host hangs up", async () => {
    const { host, guests } = await table(3);
    host.flow.start();
    await settle();
    await settle();

    // Seat 1 leaves; its `bye` reaches the host, which abandons and tells seat 2 who left.
    guests[0].flow.leave();
    await settle();
    await settle();

    const hostState = host.begun[0].loop.getState();
    expect(hostState).toMatchObject({ status: MATCH_STATUS.ABANDONED, abandonedBy: 1 });
    expect(guests[1].begun[0].loop.getState()).toMatchObject({
      status: MATCH_STATUS.ABANDONED,
      abandonedBy: 1,
    });
    expect(host.flow.canRestart()).toBe(false);
  });
});
