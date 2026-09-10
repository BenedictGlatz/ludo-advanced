/**
 * The STUN and TURN servers a peer connection may use. Issue #42, FR-42.
 *
 * `net/` may import `core/` and `state/`, never `ui/` or `i18n/`. This file imports nothing.
 *
 * ## Why a TURN relay was added after all
 *
 * The 2026-09-09 decision shipped STUN alone and named the consequence: two players behind strict NATs
 * would never connect, and the lobby would say so after twenty seconds. That is exactly what happened on
 * 2026-09-10, on three home connections at once. STUN only tells a browser its own public address; when
 * a router hands out a different port for every destination, or when the connection has no public IPv4
 * of its own (DS-Lite, which most German cable and mobile contracts use), that address is already wrong
 * by the time the other side tries it. No amount of waiting fixes it.
 *
 * A TURN server is the fix: both browsers open an ordinary outgoing connection to it and it passes the
 * data between them. Outgoing connections are what every router allows, so this works where nothing else
 * does. The cost is that the data takes a detour, which for a game that sends a state under 16 KB per
 * move is not a cost worth measuring.
 *
 * ## These credentials expire, and that is not a bug
 *
 * Twilio's Network Traversal Service does not hand out a permanent password. `TOKEN_EXPIRES_AT` below is
 * when this set stops working, twenty-four hours after it was issued. Run `npm run net:turn` to write a
 * fresh set into this file. That script needs the account's auth token, which is why it reads it from the
 * environment: **the auth token must never be committed, and it is not in this repository.**
 *
 * ## Why the credentials themselves are committed, and what that costs
 *
 * They ship inside the published build, so anybody who opens the page can read them. That is not an
 * oversight, it is the only way a static GitHub Pages build can reach a relay at all: hiding them would
 * need a server to hand them out, and a server is precisely what this whole feature was built to avoid.
 *
 * What a stranger could do with them, honestly stated: relay their own traffic through the account until
 * the set expires. The account is a trial with no payment method on it, so the worst case is that the
 * free credit runs out and the relay stops, which puts the game back exactly where it was before this
 * file existed. Rejected: leaving TURN out to avoid the exposure, which trades a real problem the players
 * hit today against a theoretical one nobody has hit; and an ephemeral-credential endpoint, which is a
 * server.
 */

/** When `TURN_CREDENTIAL` stops being accepted. ISO 8601, UTC. Written by `scripts/turn-credentials.js`. */
export const TOKEN_EXPIRES_AT = "2026-09-11T12:29:43Z";

const TURN_USERNAME = "92d683fbdf5d196e7536265b28f247b25e906f503a5a9a38faa8f77f91003e04";
const TURN_CREDENTIAL = "JqwnBZIRiYGpTzhDgn8pEoYTEpare24/+XJ5HaAiaBw=";

/**
 * The servers, most direct first.
 *
 * Three TURN entries for one relay, because the transport is what makes the difference on a hostile
 * network: UDP is the fast one and the first thing a restrictive firewall drops; TCP on 3478 survives
 * more of them; TCP on 443 is the port outgoing HTTPS uses, so a network that blocks everything else
 * usually still lets it through. The browser tries them in order and keeps whichever answers.
 *
 * `urls` and not Twilio's `url`: the API answers with both spellings, and `url` is the one the standard
 * dropped years ago. Copying the wrong key produces a connection that silently never uses the relay.
 */
export const ICE_SERVERS = Object.freeze([
  Object.freeze({ urls: "stun:stun.l.google.com:19302" }),
  Object.freeze({ urls: "stun:global.stun.twilio.com:3478" }),
  Object.freeze({
    urls: "turn:global.turn.twilio.com:3478?transport=udp",
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL,
  }),
  Object.freeze({
    urls: "turn:global.turn.twilio.com:3478?transport=tcp",
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL,
  }),
  Object.freeze({
    urls: "turn:global.turn.twilio.com:443?transport=tcp",
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL,
  }),
]);

/** Every relay in the list, which is what a diagnostic and the unit test ask about. */
export const relayServers = () => ICE_SERVERS.filter((server) => server.urls.startsWith("turn:"));

/** Is there a relay at all, and has this set not expired yet? */
export function hasWorkingRelay(now = new Date()) {
  return relayServers().length > 0 && now < new Date(TOKEN_EXPIRES_AT);
}
