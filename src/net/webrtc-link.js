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
 * ## STUN, and the NAT that can still fail
 *
 * `DEFAULT_ICE_SERVERS` names one public STUN server, so a code carries the browser's public address and
 * two machines on different networks can find each other. It is an external service, not a dependency:
 * nothing is installed, and without it the game still works on one network. There is no TURN relay, so
 * two players behind strict NATs may fail to connect; the lobby says so after twenty seconds.
 */

import { decodeSignal, encodeSignal, waitForIceComplete } from "./signal-codes.js";
import { channelTransport } from "./transport.js";

/** Google's public STUN server. Named in the journal as the one external service the feature touches. */
export const DEFAULT_ICE_SERVERS = Object.freeze([{ urls: "stun:stun.l.google.com:19302" }]);

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
export function createHostLink({ iceServers = DEFAULT_ICE_SERVERS, createPeer = defaultPeer } = {}) {
  const pc = createPeer({ iceServers });
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
export function createGuestLink({ iceServers = DEFAULT_ICE_SERVERS, createPeer = defaultPeer } = {}) {
  const pc = createPeer({ iceServers });

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
