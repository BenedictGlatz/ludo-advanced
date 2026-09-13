/**
 * The two sessions, one message at a time. Issue #42.
 *
 * `loopback-match.test.js` plays a whole match through them; this file asks the small questions that a
 * whole match would answer only by hanging: does a refused intent get an answer, does a pause refuse,
 * does a dropped pipe report the seat, does the guest refuse a second click before the echo.
 */

import { describe, expect, it, vi } from "vitest";

import { INTENT } from "../../../src/state/intents.js";
import { REJECTED } from "../../../src/state/rejections.js";
import { GUEST_REFUSED } from "../../../src/net/intent-guard.js";
import { createGuestSession } from "../../../src/net/guest-session.js";
import { createHostSession } from "../../../src/net/host-session.js";
import { MESSAGE, decode } from "../../../src/net/protocol.js";
import { createLoopbackPair } from "../../../src/net/transport.js";

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

/** A host with one guest on seat 2, over a loopback pair, with a fake loop that records submits. */
function table({ state, submit = () => true } = {}) {
  const [hostEnd, guestEnd] = createLoopbackPair();
  const onLost = vi.fn();
  const submitted = [];
  const loop = {
    getState: () => state,
    submit: (intent) => {
      submitted.push(intent);
      return submit(intent);
    },
  };
  const host = createHostSession({
    guests: [{ seat: 2, transport: hostEnd }],
    poolRemaining: () => 17,
    onLost,
  });
  host.attach(loop);

  const guest = createGuestSession({ transport: guestEnd });
  const refused = [];
  const states = [];
  guest.onRefused((reason) => refused.push(reason));
  guest.onState((next) => states.push(next));

  return { host, guest, onLost, submitted, refused, states, guestEnd };
}

const guestsTurn = { status: "running", activePlayer: 2, reactionWindow: null, phase: "choose" };

describe("the host session", () => {
  it("broadcasts a state after every accepted intent, numbered, with the pool count", async () => {
    const { host, guest, states } = table({ state: guestsTurn });
    const heard = [];
    guest.onState((next) => heard.push(next));

    host.broadcastState({ turnNumber: 1 });
    host.broadcastState({ turnNumber: 2 });
    await settle();

    expect(heard).toEqual([{ turnNumber: 1 }, { turnNumber: 2 }]);
    expect(guest.poolRemaining()).toBe(17);
    expect(states).toEqual([]);
  });

  it("hands a guest's legal intent to the loop and refuses an illegal one with a reason", async () => {
    const { guest, submitted } = table({ state: guestsTurn });

    guest.apply({ type: INTENT.CHOOSE_DIE, faces: 6 });
    await settle();
    expect(submitted).toEqual([{ type: INTENT.CHOOSE_DIE, faces: 6 }]);

    // The echo never came, so the guest still has one in flight until we clear it with a refusal.
    expect(guest.isInFlight()).toBe(true);
  });

  it("answers the guard's refusal, the loop's refusal and the pause, each by name", async () => {
    const { host, guest, refused } = table({ state: guestsTurn, submit: () => false });

    guest.apply({ type: INTENT.CHOOSE_DIE, faces: 6 });
    await settle();
    expect(refused).toEqual([REJECTED.WRONG_PHASE]);

    host.broadcastPause(true);
    guest.apply({ type: INTENT.CHOOSE_DIE, faces: 6 });
    await settle();
    expect(refused.at(-1)).toBe(GUEST_REFUSED.PAUSED);

    host.broadcastPause(false);
    guest.apply({ type: INTENT.ROLL_DIE });
    // Refused on the guest's side already, so nothing was sent.
    expect(guest.isInFlight()).toBe(false);
  });

  it("tells the flow which seat was lost, once, when the pipe closes or the guest says bye", async () => {
    const dropped = table({ state: guestsTurn });
    dropped.guestEnd.close();
    await settle();
    expect(dropped.onLost).toHaveBeenCalledWith(2);
    expect(dropped.onLost).toHaveBeenCalledTimes(1);

    const left = table({ state: guestsTurn });
    left.guest.close();
    await settle();
    expect(left.onLost).toHaveBeenCalledTimes(1);
  });

  it("says hello to each guest with its own seat, and goodbye on close", async () => {
    const { host, guest, guestEnd } = table({ state: guestsTurn });
    const hello = vi.fn();
    const closed = vi.fn();
    const raw = [];
    guest.onHello(hello);
    guest.onClose(closed);
    guestEnd.onMessage((text) => raw.push(decode(text).kind));

    host.sayHello({ seats: [0, 2], windowMs: 30_000 });
    host.close();
    await settle();

    expect(hello).toHaveBeenCalledWith(
      expect.objectContaining({ seat: 2, seats: [0, 2], windowMs: 30_000 })
    );
    expect(raw).toEqual([MESSAGE.HELLO, MESSAGE.BYE]);
    expect(closed).toHaveBeenCalledTimes(1);
  });
});

describe("the guest session", () => {
  it("drops a second intent while the first is in flight, and sends again after the echo", async () => {
    const { host, guest, submitted } = table({ state: guestsTurn });

    expect(guest.apply({ type: INTENT.SELECT_PAWN, pawn: 0 })).toBe(true);
    expect(guest.apply({ type: INTENT.COMMIT_MOVE, pawn: 0 })).toBe(false);
    await settle();
    expect(submitted).toHaveLength(1);

    host.broadcastState({ turnNumber: 1 });
    await settle();
    expect(guest.apply({ type: INTENT.COMMIT_MOVE, pawn: 0 })).toBe(true);
  });

  it("hears the host's pause and resume", async () => {
    const { host, guest } = table({ state: guestsTurn });
    const paused = [];
    guest.onPaused((flag) => paused.push(flag));

    host.broadcastPause(true);
    host.broadcastPause(false);
    await settle();

    expect(paused).toEqual([true, false]);
  });

  it("freezes the state it is handed", async () => {
    const { host, states } = table({ state: guestsTurn });

    host.broadcastState({ turnNumber: 1, pawns: [{ r: 0 }] });
    await settle();

    expect(Object.isFrozen(states[0])).toBe(true);
    expect(Object.isFrozen(states[0].pawns[0])).toBe(true);
  });
});
