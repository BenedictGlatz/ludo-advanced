/**
 * The two link state machines, against a fake peer connection. Issue #42.
 *
 * `RTCPeerConnection` does not exist under Node, so this file cannot prove that two browsers connect;
 * `tests/e2e/online.spec.js` does that in Chromium. What it can prove is the order of the calls each side
 * makes and the two refusals: a code that is not a code, and an answer pasted where an offer belongs.
 */

import { describe, expect, it } from "vitest";

import { encodeSignal } from "../../../src/net/signal-codes.js";
import { createGuestLink, createHostLink } from "../../../src/net/webrtc-link.js";

/** A channel that opens when told to. */
function fakeChannel(label) {
  return {
    label,
    readyState: "connecting",
    send() {},
    close() {},
    open() {
      this.readyState = "open";
      this.onopen?.();
    },
  };
}

/** Enough of `RTCPeerConnection` for the two links: descriptions, one channel, gathering already done. */
function fakePeer(calls) {
  const channel = fakeChannel("ludo");
  return {
    iceGatheringState: "complete",
    localDescription: null,
    remoteDescription: null,
    addEventListener() {},
    removeEventListener() {},
    createDataChannel(label) {
      calls.push(`createDataChannel:${label}`);
      return channel;
    },
    async createOffer() {
      calls.push("createOffer");
      return { type: "offer", sdp: "v=0 offer" };
    },
    async createAnswer() {
      calls.push("createAnswer");
      return { type: "answer", sdp: "v=0 answer" };
    },
    async setLocalDescription(description) {
      calls.push(`setLocal:${description.type}`);
      this.localDescription = description;
    },
    async setRemoteDescription(description) {
      calls.push(`setRemote:${description.type}`);
      this.remoteDescription = description;
    },
    close() {
      calls.push("close");
    },
    channel,
  };
}

describe("host and guest links", () => {
  it("swap an offer and an answer and both end with a transport once the channel opens", async () => {
    const hostCalls = [];
    const guestCalls = [];
    const hostPeer = fakePeer(hostCalls);
    const guestPeer = fakePeer(guestCalls);
    const host = createHostLink({ createPeer: () => hostPeer });
    const guest = createGuestLink({ createPeer: () => guestPeer });

    const invite = await host.invite();
    expect(hostCalls).toEqual(["createDataChannel:ludo", "createOffer", "setLocal:offer"]);

    const { replyCode, ready } = await guest.join(invite);
    expect(guestCalls).toEqual(["setRemote:offer", "createAnswer", "setLocal:answer"]);

    const accepted = host.accept(replyCode);
    hostPeer.channel.open();
    const hostTransport = await accepted;
    expect(hostCalls.at(-1)).toBe("setRemote:answer");

    // The guest's channel arrives through `ondatachannel`, as the browser delivers it.
    const guestChannel = fakeChannel("ludo");
    guestPeer.ondatachannel({ channel: guestChannel });
    guestChannel.open();
    const guestTransport = await ready;

    for (const transport of [hostTransport, guestTransport]) {
      expect(typeof transport.send).toBe("function");
      expect(typeof transport.onMessage).toBe("function");
    }

    host.close();
    expect(hostCalls.at(-1)).toBe("close");
  });

  it("refuses text that is not a code, and a code of the wrong kind", async () => {
    const host = createHostLink({ createPeer: () => fakePeer([]) });
    const guest = createGuestLink({ createPeer: () => fakePeer([]) });

    await expect(host.accept("garbage")).rejects.toThrow("bad-code");
    await expect(guest.join("garbage")).rejects.toThrow("bad-code");

    // An offer pasted into the host's reply field, and an answer pasted into the guest's invite field.
    const offer = await encodeSignal({ type: "offer", sdp: "v=0" });
    const answer = await encodeSignal({ type: "answer", sdp: "v=0" });
    await expect(host.accept(offer)).rejects.toThrow("bad-code");
    await expect(guest.join(answer)).rejects.toThrow("bad-code");
  });
});
