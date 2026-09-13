/**
 * Invite and reply codes. Issue #42.
 *
 * The round trip is the whole contract; the garbage cases are what a person pasting half a code produces.
 * `CompressionStream` is a Node global since 18, which is why this file can run at all.
 */

import { describe, expect, it } from "vitest";

import { decodeSignal, encodeSignal, waitForIceComplete } from "../../../src/net/signal-codes.js";

const OFFER = {
  type: "offer",
  sdp: [
    "v=0",
    "o=- 4611731400430051336 2 IN IP4 127.0.0.1",
    "s=-",
    "t=0 0",
    "a=group:BUNDLE 0",
    "m=application 9 UDP/DTLS/SCTP webrtc-datachannel",
    "a=candidate:1 1 udp 2113937151 192.168.0.12 51234 typ host generation 0",
    "a=candidate:2 1 udp 1677729535 203.0.113.9 51234 typ srflx raddr 0.0.0.0 rport 0",
    "a=sctp-port:5000",
  ].join("\r\n"),
};

describe("a signal code", () => {
  it("round-trips a session description as one line of URL-safe text", async () => {
    const code = await encodeSignal(OFFER);

    expect(code).toMatch(/^[A-Za-z0-9_-]+$/u);
    expect(code).not.toContain("\n");
    expect(await decodeSignal(code)).toEqual(OFFER);
  });

  it("is shorter than the description it carries", async () => {
    const code = await encodeSignal(OFFER);

    expect(code.length).toBeLessThan(JSON.stringify(OFFER).length);
  });

  it("survives the whitespace a chat adds around it", async () => {
    const code = await encodeSignal(OFFER);

    expect(await decodeSignal(`  ${code}\n`)).toEqual(OFFER);
  });

  it("answers null to garbage, a truncated code, and a code that is not a description", async () => {
    const code = await encodeSignal(OFFER);

    expect(await decodeSignal("")).toBeNull();
    expect(await decodeSignal("not a code at all")).toBeNull();
    expect(await decodeSignal(code.slice(0, code.length / 2))).toBeNull();

    // Valid deflate, valid JSON, wrong shape.
    const notADescription = await encodeSignal({ type: 7, sdp: null });
    expect(await decodeSignal(notADescription)).toBeNull();
  });
});

describe("waiting for ICE gathering", () => {
  /** The two things `waitForIceComplete` reads off a peer connection. */
  function gatheringPeer(state = "gathering") {
    const listeners = new Set();
    return {
      iceGatheringState: state,
      addEventListener: (_name, fn) => listeners.add(fn),
      removeEventListener: (_name, fn) => listeners.delete(fn),
      finish() {
        this.iceGatheringState = "complete";
        for (const fn of listeners) fn();
      },
      listening: () => listeners.size,
    };
  }

  it("resolves at once when gathering is already complete", async () => {
    await expect(waitForIceComplete(gatheringPeer("complete"))).resolves.toBe(true);
  });

  it("resolves when the state changes to complete, and stops listening", async () => {
    const pc = gatheringPeer();
    const waited = waitForIceComplete(pc, 10_000);

    expect(pc.listening()).toBe(1);
    pc.finish();
    await expect(waited).resolves.toBe(true);
    expect(pc.listening()).toBe(0);
  });

  it("gives up after the timeout rather than waiting for ever, and says that it did", async () => {
    // `false` is what tells a half-empty invite code apart from a complete one in the log. Without it a
    // code with no relay candidate in it looks exactly like a network that genuinely has none.
    await expect(waitForIceComplete(gatheringPeer(), 5)).resolves.toBe(false);
  });
});
