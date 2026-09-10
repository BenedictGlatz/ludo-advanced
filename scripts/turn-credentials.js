/**
 * Fetch a fresh set of TURN credentials from Twilio and write them into `src/net/ice-servers.js`.
 * Issue #42, the TURN follow-up of 2026-09-10.
 *
 * ```bash
 * # PowerShell
 * $env:TWILIO_ACCOUNT_SID = "AC..."; $env:TWILIO_AUTH_TOKEN = "..."; npm run net:turn
 * ```
 *
 * ## Why this exists at all
 *
 * Twilio's Network Traversal Service issues credentials that live at most twenty-four hours. Somebody
 * therefore has to renew them before every session, and doing that by hand means pasting two long
 * strings into a source file and hoping the expiry comment was updated too. The comment is the part a
 * human forgets, and a stale expiry date is worse than none: it says the relay works when it does not.
 *
 * ## Why the auth token comes from the environment
 *
 * It is the password to the whole Twilio account, not just to TURN. A file would be committed sooner or
 * later, a command-line argument lands in the shell history, and a prompt cannot be used from a script.
 * The environment is the one place that is neither recorded nor shared. **This script never prints the
 * token, and nothing it writes contains it.**
 *
 * The credentials it does write are public by design: `ice-servers.js` explains why they are committed
 * and what the exposure actually costs.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** Twenty-four hours, which is also the longest Twilio will issue. */
const TTL_SECONDS = 86_400;

const TARGET = fileURLToPath(new URL("../src/net/ice-servers.js", import.meta.url));

/** Ask Twilio for one token. Returns the whole answer, `ice_servers` included. */
async function requestToken(sid, token) {
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Tokens.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ Ttl: String(TTL_SECONDS) }),
  });

  if (!response.ok) {
    // The status is the useful half: 401 is a wrong token, 403 a service the account may not use.
    throw new Error(`Twilio answered ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Replace the three generated values in place.
 *
 * A rewrite of three lines rather than a generated file, because everything else in `ice-servers.js` is
 * prose explaining a decision, and prose regenerated from a script is prose nobody edits.
 */
function writeCredentials({ username, password, expiresAt }) {
  const source = readFileSync(TARGET, "utf8");
  const replaced = source
    .replace(/(export const TOKEN_EXPIRES_AT = ")[^"]*(")/u, `$1${expiresAt}$2`)
    .replace(/(const TURN_USERNAME = ")[^"]*(")/u, `$1${username}$2`)
    .replace(/(const TURN_CREDENTIAL = ")[^"]*(")/u, `$1${password}$2`);

  if (replaced === source) throw new Error(`nothing replaced in ${TARGET}: has it been renamed?`);

  writeFileSync(TARGET, replaced);
}

const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;

if (!sid || !token) {
  console.error("Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in the environment first.");
  process.exit(1);
}

const answer = await requestToken(sid, token);
const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000).toISOString().replace(/\.\d+Z$/u, "Z");

writeCredentials({ username: answer.username, password: answer.password, expiresAt });

const relays = answer.ice_servers.filter((server) =>
  (server.urls ?? server.url).startsWith("turn:")
);

console.log(`Wrote ${relays.length} relay entries to src/net/ice-servers.js.`);
console.log(`They stop working at ${expiresAt}.`);
console.log("Check with: open the game with ?relay=1 and connect two browsers.");
