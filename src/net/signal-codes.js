/**
 * Invite and reply codes: a WebRTC session description as one line of text. Issue #42, FR-42.
 *
 * `net/` may import `core/` and `state/`, never `ui/` or `i18n/`. This file imports nothing.
 *
 * ## The players are the signaling server
 *
 * WebRTC needs the two browsers to swap a description of themselves (an SDP offer and an answer, each
 * with the network candidates ICE has gathered) before a direct connection exists. Every other option
 * in the options document paid for a server to carry that exchange. Manual codes pay for it with two
 * paste operations instead: the host copies a code into a chat, the guest pastes it and sends one back.
 * No server, no dependency, and the whole exchange is readable by the people doing it.
 *
 * ## Why compressed, and why base64url
 *
 * An SDP with candidates is 1 to 3 KB of very repetitive text. Deflate takes it to a third, and
 * base64url makes it one line with no characters a chat client would turn into a link or a smiley.
 * `CompressionStream` is a browser API since 2023 (Chrome 80, Firefox 113, Safari 16.4) and a Node
 * global since 18, which is why this file has a unit test. Rejected: a compression library, which would
 * be a runtime dependency for something the platform already does.
 *
 * ## Non-trickle ICE
 *
 * Ordinarily candidates trickle in over a few seconds and are sent one by one. With a code that is
 * pasted once, the code has to carry every candidate, so `waitForIceComplete` holds the code back until
 * gathering has finished. That is the "gathering" stage the lobby shows.
 */

/**
 * How long to wait for ICE gathering before the code is produced with what has been gathered so far.
 *
 * **Raised from 5 to 20 seconds on 2026-09-10, and the reason is the TURN relay.** With STUN alone,
 * gathering is one round trip to one server and five seconds was generous. A relay has to be *allocated*,
 * over three transports (UDP, TCP, TCP on 443), each with its own handshake, and on a home connection
 * that regularly takes longer than five seconds. The old limit therefore cut gathering short and produced
 * an invite code with no relay candidate in it, which is a code that cannot work and gives no sign of why.
 * Intermittently, because it depended on how fast the network was that minute.
 *
 * The cost is the worst case: a lobby that waits longer before showing a code on a network where one
 * interface never answers. That is why the timeout still exists at all. A code with most of the
 * candidates beats no code, but a code produced too early beats nothing, and 20 seconds is the point
 * where waiting has clearly stopped helping.
 */
export const ICE_GATHER_TIMEOUT_MS = 20_000;

async function bytesThrough(text, stream) {
  const compressed = new Response(text).body.pipeThrough(stream);

  return new Uint8Array(await new Response(compressed).arrayBuffer());
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function fromBase64Url(code) {
  const padded = code
    .replaceAll("-", "+")
    .replaceAll("_", "/")
    .padEnd(Math.ceil(code.length / 4) * 4, "=");
  const binary = atob(padded);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/** `{ type, sdp }` as one line of text a chat can carry. */
export async function encodeSignal({ type, sdp }) {
  const bytes = await bytesThrough(
    JSON.stringify({ type, sdp }),
    new CompressionStream("deflate-raw")
  );

  return toBase64Url(bytes);
}

/**
 * The `{ type, sdp }` a code carries, or `null` when the text is not a code.
 *
 * `null` rather than a throw for the same reason `protocol.js`'s `decode` answers `null`: the text was
 * pasted by a person, and a truncated paste is a thing to say on screen, not a programming error.
 */
export async function decodeSignal(code) {
  try {
    const bytes = fromBase64Url(code.trim());
    const text = new TextDecoder().decode(
      await bytesThrough(bytes, new DecompressionStream("deflate-raw"))
    );
    const parsed = JSON.parse(text);

    if (typeof parsed?.type !== "string" || typeof parsed?.sdp !== "string") return null;

    return { type: parsed.type, sdp: parsed.sdp };
  } catch {
    return null;
  }
}

/**
 * Resolve once the peer connection has finished gathering candidates, or after the timeout.
 *
 * Takes anything with `iceGatheringState` and `addEventListener`, so a fake can stand in for the real
 * connection in a test. The timeout is a safety net for networks where one interface never answers: a
 * code with most of the candidates beats no code at all.
 *
 * **Answers `true` when gathering actually finished and `false` when the timeout cut it short.** The
 * caller does nothing differently either way, and it is not a failure: it is the one fact that tells a
 * half-empty invite code apart from a complete one, and without it the log cannot say which happened.
 */
export function waitForIceComplete(pc, timeoutMs = ICE_GATHER_TIMEOUT_MS) {
  if (pc.iceGatheringState === "complete") return Promise.resolve(true);

  return new Promise((resolve) => {
    const done = (completed) => {
      clearTimeout(timer);
      pc.removeEventListener("icegatheringstatechange", check);
      resolve(completed);
    };
    const check = () => {
      if (pc.iceGatheringState === "complete") done(true);
    };
    const timer = setTimeout(() => done(false), timeoutMs);

    pc.addEventListener("icegatheringstatechange", check);
  });
}
