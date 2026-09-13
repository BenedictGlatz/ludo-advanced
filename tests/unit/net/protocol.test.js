/**
 * The wire vocabulary. Issue #42.
 *
 * `decode` is the one function here that reads text from another machine, so the cases that matter are
 * the ones where that text is wrong: not JSON, JSON that is not a message, a kind nobody knows.
 */

import { describe, expect, it } from "vitest";

import {
  MESSAGE,
  PROTOCOL_VERSION,
  decode,
  encode,
  hello,
  intentMessage,
  refusedMessage,
  stateMessage,
} from "../../../src/net/protocol.js";

describe("encode and decode", () => {
  it("round-trips every message kind", () => {
    const messages = [
      hello({ seat: 2, seats: [0, 2], windowMs: 30_000 }),
      stateMessage(3, { turnNumber: 4 }, 17),
      intentMessage(1, { type: "choose-die", faces: 6 }),
      refusedMessage(1, "intent.rejected.not-your-turn"),
      { kind: MESSAGE.PAUSED },
      { kind: MESSAGE.RESUMED },
      { kind: MESSAGE.BYE },
    ];

    for (const message of messages) {
      expect(decode(encode(message))).toEqual(message);
    }
  });

  it("stamps the protocol version on hello", () => {
    expect(hello({ seat: 0, seats: [0, 2], windowMs: 0 }).version).toBe(PROTOCOL_VERSION);
  });

  it("answers null to garbage rather than throwing", () => {
    for (const text of ["", "not json", "42", "null", '"a string"', "[]", "{}", '{"kind":"x"}']) {
      expect(decode(text), text).toBeNull();
    }
  });
});
