/**
 * What the connection actually did, printed to the browser console. Issue #42, the 2026-09-10 follow-up.
 *
 * `net/` may import `core/` and `state/`, never `ui/` or `i18n/`. This file imports nothing.
 *
 * ## Why this exists
 *
 * An online match that fails looks the same from the outside whatever the cause: the lobby says the
 * connection was lost, and that is all anybody sees. Underneath there are at least four different
 * failures (no relay candidate in the code, a handshake that never completes, a route that works and
 * then stops answering, and a channel closed by an error nobody looked at), and every one of them needs
 * a different fix. Guessing between them costs evenings.
 *
 * So this prints the four things that separate them: how gathering went and what the code carries, every
 * connection state the browser passes through, which candidate pair actually won, and the real reason a
 * channel closed. `transport.js` used to discard that last one, which is how "Verbindung verloren" ended
 * up being everything a player and a maintainer both got to know.
 *
 * ## Off unless asked for, and never in the way
 *
 * `?netlog=1` turns it on, through `options.js` like every other switch. Off, `netLog` returns without
 * touching its arguments, and nothing in the lobby, the protocol or the sessions behaves differently
 * either way. **A diagnostic that changes what it measures is worse than none**, so this only ever reads:
 * it never closes anything, never retries, and never decides.
 *
 * Rejected: sending the log somewhere. Two players comparing consoles is enough for a team of three, and
 * collecting it would need the server this whole feature exists to avoid.
 */

let on = false;
let startedAt = 0;

/** Turn logging on. Called once, by `main.js`, when the address bar asks for it. */
export function enableNetLog() {
  on = true;
  startedAt = Date.now();
  console.log("[net] logging on. Copy this whole console if you are reporting a failure.");
}

export const isNetLogOn = () => on;

/** Seconds since logging began, so two consoles can be lined up against each other. */
const stamp = () => `+${((Date.now() - startedAt) / 1000).toFixed(1)}s`;

/** One line. `detail` is optional and printed as an object, so it stays expandable in the console. */
export function netLog(label, detail) {
  if (!on) return;

  if (detail === undefined) console.log(`[net ${stamp()}] ${label}`);
  else console.log(`[net ${stamp()}] ${label}`, detail);
}

/**
 * How many candidates of each kind an SDP carries.
 *
 * This is the single most useful line in the whole log. `relay: 0` means the code cannot reach the relay
 * at all and no amount of waiting on the other side will help; `srflx: 0` as well means even STUN did not
 * answer. Both are conclusions, not hints.
 */
export function candidateSummary(sdp) {
  const counts = { host: 0, srflx: 0, relay: 0, prflx: 0 };

  for (const line of sdp.split(/\r?\n/u)) {
    if (!line.startsWith("a=candidate:")) continue;
    const parts = line.split(" ");
    const kind = parts[parts.indexOf("typ") + 1];
    if (kind in counts) counts[kind] += 1;
  }

  return counts;
}

/** The pair the browser settled on, as text. Answers "did this go through the relay, or direct?" */
async function selectedPair(pc) {
  const stats = await pc.getStats();
  let pair = null;
  const byId = new Map();

  for (const report of stats.values()) {
    byId.set(report.id, report);
    // `selected` is Firefox's spelling; Chromium marks the pair through the transport report below.
    if (report.type === "candidate-pair" && (report.selected || report.nominated)) pair = report;
  }
  for (const report of stats.values()) {
    if (report.type === "transport" && report.selectedCandidatePairId) {
      pair = byId.get(report.selectedCandidatePairId) ?? pair;
    }
  }
  if (pair === null) return "none yet";

  const local = byId.get(pair.localCandidateId);
  const remote = byId.get(pair.remoteCandidateId);
  const side = (c) =>
    c ? `${c.candidateType} ${c.protocol} ${c.address ?? "?"}:${c.port ?? "?"}` : "?";

  return `${side(local)}  ->  ${side(remote)}`;
}

/**
 * Follow one peer connection for as long as it lives.
 *
 * `who` is "host" or "guest", because the two consoles are read side by side and the first question is
 * always which of them stopped first. Every listener is added rather than assigned, so nothing this
 * function does can overwrite a handler the link itself needs.
 */
export function watchPeer(pc, who) {
  if (!on) return pc;

  const state = () =>
    netLog(
      `${who}: ice=${pc.iceConnectionState} conn=${pc.connectionState} gather=${pc.iceGatheringState}`
    );

  pc.addEventListener("iceconnectionstatechange", () => {
    state();
    // The two that end a match. `disconnected` often recovers on its own; `failed` never does.
    if (pc.iceConnectionState === "failed") {
      netLog(
        `${who}: ICE FAILED. No route survived. Relay credentials expired, or both sides blocked.`
      );
    }
  });

  pc.addEventListener("connectionstatechange", () => {
    state();
    if (pc.connectionState === "connected") {
      selectedPair(pc).then((pair) => netLog(`${who}: route in use: ${pair}`));
    }
  });

  pc.addEventListener("icegatheringstatechange", state);

  // Fires per failed STUN/TURN server. A 401 here means the credentials are wrong or have expired.
  pc.addEventListener("icecandidateerror", (event) => {
    netLog(`${who}: candidate error ${event.errorCode} from ${event.url ?? "?"}`, {
      text: event.errorText,
    });
  });

  return pc;
}
