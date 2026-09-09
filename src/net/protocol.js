/**
 * What travels between two browsers in an online match. Issue #42, FR-42.
 *
 * `net/` may import `core/` and `state/`, never `ui/` or `i18n/`. This file imports nothing at all: it is
 * the wire vocabulary, seven message kinds and the two functions that turn them into text and back.
 *
 * ## The protocol in one paragraph
 *
 * The host owns the match. A guest sends **intents**, the same `{ type, ... }` objects a click produces,
 * and the host answers each one with either a new **state** or a **refused**. The host also sends a state
 * after every intent of its own, so a guest's board is always the host's board a few milliseconds ago.
 * Nothing else is negotiated: `hello` says which seat a guest holds and how long a reaction window lasts,
 * `paused` and `resumed` carry the host's pause button, and `bye` says a side is leaving on purpose.
 *
 * ## Why the whole state travels and not the intent
 *
 * Only the host owns `deps = { rng, diceSource }`: the twenty physical dice cards and the seeded
 * generator's counter, both of which live **outside** the frozen state object. A guest that applied
 * intents itself would need identical copies of both and an identical intent order, and one missed
 * message would put its board out of step for the rest of the match with no way to notice. Shipping the
 * state makes a guest impossible to desync: whatever arrives last is the truth. A serialised four-player
 * state is a few kilobytes, which is nothing on a data channel.
 *
 * ## `version`
 *
 * Carried in `hello`, so two builds that disagree about the state's shape refuse each other with a
 * readable message rather than a `TypeError` three turns in.
 */

/** The wire version. Bump it when a state field or a message shape changes incompatibly. */
export const PROTOCOL_VERSION = 1;

/** The seven message kinds. `kind` is the field every message carries. */
export const MESSAGE = Object.freeze({
  /** Host to guest, once: `{ seat, seats, windowMs, version }`. */
  HELLO: "hello",
  /** Host to guest, after every accepted intent: `{ seq, state, pool: { remaining } }`. */
  STATE: "state",
  /** Guest to host: `{ seq, intent }`. */
  INTENT: "intent",
  /** Host to guest, answering one intent: `{ seq, reason }`, the reason an `intent.rejected.*` key. */
  REFUSED: "refused",
  /** Host to guest: the host pressed Pause. Guest intents are refused until `resumed`. */
  PAUSED: "paused",
  /** Host to guest: the host pressed Resume. */
  RESUMED: "resumed",
  /** Either way: this side is leaving the match on purpose. */
  BYE: "bye",
});

const KINDS = Object.values(MESSAGE);

/** One message as the text the data channel carries. */
export function encode(message) {
  return JSON.stringify(message);
}

/**
 * The message a text carries, or `null` when it is not one.
 *
 * `null` rather than a throw, because the text came from another machine and a malformed message is a
 * thing to ignore, not a programming error on this side.
 */
export function decode(text) {
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  if (parsed === null || typeof parsed !== "object" || !KINDS.includes(parsed.kind)) return null;

  return parsed;
}

/** The `hello` a guest gets first. */
export function hello({ seat, seats, windowMs }) {
  return { kind: MESSAGE.HELLO, seat, seats, windowMs, version: PROTOCOL_VERSION };
}

/** One state broadcast. `remaining` is how many dice cards are face down in the host's pool. */
export function stateMessage(seq, state, remaining) {
  return { kind: MESSAGE.STATE, seq, state, pool: { remaining } };
}

/** One intent from a guest. */
export function intentMessage(seq, intent) {
  return { kind: MESSAGE.INTENT, seq, intent };
}

/** The host's answer to a refused intent. */
export function refusedMessage(seq, reason) {
  return { kind: MESSAGE.REFUSED, seq, reason };
}
