/**
 * The diagnostic logger. Issue #42, the 2026-09-10 follow-up.
 *
 * Two things are worth pinning. `candidateSummary` is the line a failure is actually read off, so its
 * counts have to be right. And the logger has to be **silent when it is off**: a diagnostic that prints
 * during an ordinary match is one the team turns off again, and then it is not there when it is needed.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import { candidateSummary, isNetLogOn, netLog } from "../../../src/net/net-log.js";

const SDP = [
  "v=0",
  "a=candidate:1 1 udp 2113937151 192.168.1.20 51234 typ host generation 0",
  "a=candidate:2 1 udp 1677729535 84.132.5.7 51234 typ srflx raddr 192.168.1.20 rport 51234",
  "a=candidate:3 1 udp 50340351 18.156.18.172 29295 typ relay raddr 0.0.0.0 rport 0",
  "a=candidate:4 1 tcp 50340350 18.156.18.168 52086 typ relay raddr 0.0.0.0 rport 0",
  "m=application 9 UDP/DTLS/SCTP webrtc-datachannel",
].join("\r\n");

afterEach(() => vi.restoreAllMocks());

describe("candidateSummary", () => {
  it("counts each kind of candidate in an SDP", () => {
    expect(candidateSummary(SDP)).toEqual({ host: 1, srflx: 1, relay: 2, prflx: 0 });
  });

  it("answers all zeroes for a description with no candidates", () => {
    // The case that matters: a code produced before gathering found anything reads `relay: 0`, and that
    // is the reading that says the code cannot work rather than that something else went wrong.
    expect(candidateSummary("v=0\r\n")).toEqual({ host: 0, srflx: 0, relay: 0, prflx: 0 });
  });

  it("survives an empty string, which is what a missing local description gives it", () => {
    expect(candidateSummary("")).toEqual({ host: 0, srflx: 0, relay: 0, prflx: 0 });
  });
});

describe("netLog", () => {
  it("is off unless it has been switched on, and prints nothing while it is", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    expect(isNetLogOn()).toBe(false);
    netLog("host: something happened", { detail: 1 });

    expect(spy).not.toHaveBeenCalled();
  });

  it("prints once it has been switched on", async () => {
    // A fresh module instance, because "on" is module state by design: `main.js` sets it once and the
    // three files that log import a function rather than being handed a logger through four layers.
    vi.resetModules();
    const fresh = await import("../../../src/net/net-log.js");
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    fresh.enableNetLog();
    fresh.netLog("host: gathering finished", { relay: 5 });

    expect(fresh.isNetLogOn()).toBe(true);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0]).toMatch(/host: gathering finished/u);
    expect(spy.mock.calls[1][1]).toEqual({ relay: 5 });
  });
});
