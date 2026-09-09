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

/** How long to wait for ICE gathering before the code is produced with what has been gathered so far. */
export const ICE_GATHER_TIMEOUT_MS = 5000;

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
 */
export function waitForIceComplete(pc, timeoutMs = ICE_GATHER_TIMEOUT_MS) {
  if (pc.iceGatheringState === "complete") return Promise.resolve();

  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      pc.removeEventListener("icegatheringstatechange", check);
      resolve();
    };
    const check = () => {
      if (pc.iceGatheringState === "complete") done();
    };
    const timer = setTimeout(done, timeoutMs);

    pc.addEventListener("icegatheringstatechange", check);
  });
}
