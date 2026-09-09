/**
 * The two transports. Issue #42.
 *
 * The loopback pair is what the whole online match runs on in Vitest, so its one property worth
 * asserting is the one a real data channel has: delivery is never synchronous. `channelTransport` is
 * tested against a hand-made channel object, because there is no `RTCDataChannel` under Node.
 */

import { describe, expect, it, vi } from "vitest";

import { channelTransport, createLoopbackPair } from "../../../src/net/transport.js";

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("the loopback pair", () => {
  it("delivers from one end to the other, one microtask later", async () => {
    const [a, b] = createLoopbackPair();
    const heard = [];
    b.onMessage((text) => heard.push(text));

    a.send("one");
    expect(heard).toEqual([]);

    await settle();
    expect(heard).toEqual(["one"]);
  });

  it("closes both ends when one hangs up, and drops anything sent afterwards", async () => {
    const [a, b] = createLoopbackPair();
    const closedA = vi.fn();
    const closedB = vi.fn();
    const heard = vi.fn();
    a.onClose(closedA);
    b.onClose(closedB);
    b.onMessage(heard);

    a.close();
    a.send("late");
    await settle();

    expect(closedA).toHaveBeenCalledTimes(1);
    expect(closedB).toHaveBeenCalledTimes(1);
    expect(heard).not.toHaveBeenCalled();
  });
});

describe("a transport over a data channel", () => {
  /** The four things `channelTransport` touches on an `RTCDataChannel`. */
  function fakeChannel() {
    return { send: vi.fn(), close: vi.fn(), onmessage: null, onclose: null, onerror: null };
  }

  it("sends through the channel and hears what arrives on it", () => {
    const channel = fakeChannel();
    const transport = channelTransport(channel);
    const heard = [];
    transport.onMessage((text) => heard.push(text));

    transport.send("out");
    channel.onmessage({ data: "in" });

    expect(channel.send).toHaveBeenCalledWith("out");
    expect(heard).toEqual(["in"]);
  });

  it("reports a closed channel once, and closes the channel when asked", () => {
    const channel = fakeChannel();
    const transport = channelTransport(channel);
    const closed = vi.fn();
    transport.onClose(closed);

    channel.onclose();
    channel.onerror();
    transport.send("after");

    expect(closed).toHaveBeenCalledTimes(1);
    expect(channel.send).not.toHaveBeenCalled();

    transport.close();
    expect(channel.close).toHaveBeenCalledTimes(1);
  });
});
