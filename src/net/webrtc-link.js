/**
 * One peer connection between a host and one guest, as two small state machines. Issue #42, FR-42.
 *
 * `net/` may import `core/` and `state/`, never `ui/` or `i18n/`. This is the only file in the project
 * that names `RTCPeerConnection`, and it takes it from an injected factory so the machines can be tested
 * against a fake. The real class does not exist under Node, which is why `vitest.config.js` leaves this
 * one file out of the coverage floor and the two-context Playwright spec covers it instead.
 *
 * ## The exchange
 *
 * ```
 * HOST                                     GUEST
 * createHostLink().invite()  -> code  --->  createGuestLink().join(code) -> { replyCode, ready }
 * accept(replyCode) -> transport     <---   (the guest sends replyCode back through the chat)
 *                                           await ready -> transport
 * ```
 *
 * The host creates the one ordered data channel, named `ludo`, before it makes its offer, so the channel
 * is part of the description the guest answers. Both sides wait for ICE gathering to finish before they
 * produce a code (`signal-codes.js` says why), and both hand back a `transport` from `transport.js` once
 * the channel opens, so nothing downstream knows it is on WebRTC at all.
 *
 * ## STUN, TURN, and the NAT that used to fail
 *
 * Which servers a connection may use is `ice-servers.js`, together with why there is now a relay among
 * them. This file only passes the list on. They are external services, not dependencies: nothing is
 * installed, and without any of them the game still works on one network.
 *
 * `relayOnly` forces every connection through the relay by refusing every direct route. It is a
 * **diagnostic and not a mode of play**: a connection that works with it on proves the TURN credentials
 * are good, which is otherwise very hard to tell apart from a route that happened to work directly.
 * `?relay=1` in the address bar is how a player reaches it, through `options.js` like every other switch.
 */

import { ICE_SERVERS } from "./ice-servers.js";
import { decodeSignal, encodeSignal, waitForIceComplete } from "./signal-codes.js";
import { channelTransport } from "./transport.js";

/** Re-exported under the name the two links already used, so nothing downstream had to change. */
export const DEFAULT_ICE_SERVERS = ICE_SERVERS;

/** What `RTCPeerConnection` is handed. `relay` is the browser's own name for "no direct route". */
const peerConfig = (iceServers, relayOnly) => ({
  iceServers,
  ...(relayOnly ? { iceTransportPolicy: "relay" } : {}),
});

/** The one channel a match runs on. Ordered, because a `state` must never overtake the one before it. */
const CHANNEL_LABEL = "ludo";

const defaultPeer = (config) => new RTCPeerConnection(config);

/** A promise for the transport over `channel`, resolving when it opens and rejecting if it closes first. */
function whenOpen(channel) {
  return new Promise((resolve, reject) => {
    if (channel.readyState === "open") {
      resolve(channelTransport(channel));
      return;
    }
    channel.onopen = () => resolve(channelTransport(channel));
    channel.onclose = () => reject(new Error("closed"));
    channel.onerror = () => reject(new Error("failed"));
  });
}

/** The host's machine: make an offer, then accept one answer. */
export function createHostLink({
  iceServers = DEFAULT_ICE_SERVERS,
  relayOnly = false,
  createPeer = defaultPeer,
} = {}) {
  const pc = createPeer(peerConfig(iceServers, relayOnly));
  const channel = pc.createDataChannel(CHANNEL_LABEL, { ordered: true });

  return {
    /** The invite code: this browser's offer, with every candidate gathered. */
    async invite() {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitForIceComplete(pc);

      return encodeSignal(pc.localDescription);
    },

    /** The guest's reply code came back: finish the handshake and wait for the channel. */
    async accept(replyCode) {
      const answer = await decodeSignal(replyCode);
      if (answer === null || answer.type !== "answer") throw new Error("bad-code");

      await pc.setRemoteDescription(answer);

      return whenOpen(channel);
    },

    close() {
      pc.close();
    },
  };
}

/** The guest's machine: answer one invite. */
export function createGuestLink({
  iceServers = DEFAULT_ICE_SERVERS,
  relayOnly = false,
  createPeer = defaultPeer,
} = {}) {
  const pc = createPeer(peerConfig(iceServers, relayOnly));

  return {
    /** Paste the invite, get back the reply code to send and a promise for the open channel. */
    async join(inviteCode) {
      const offer = await decodeSignal(inviteCode);
      if (offer === null || offer.type !== "offer") throw new Error("bad-code");

      const ready = new Promise((resolve, reject) => {
        pc.ondatachannel = (event) => whenOpen(event.channel).then(resolve, reject);
      });

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await waitForIceComplete(pc);

      return { replyCode: await encodeSignal(pc.localDescription), ready };
    },

    close() {
      pc.close();
    },
  };
}
