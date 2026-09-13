/**
 * The ICE server list, and the two mistakes that would silently disable the relay. Issue #42.
 *
 * Neither test can prove a relay actually forwards anything, which needs two real browsers and is
 * `online.spec.js`'s job. What they can prove is that the list is shaped the way `RTCPeerConnection`
 * reads it, because both ways of getting that wrong fail quietly: a connection is still made, it just
 * never uses the relay, and the failure looks exactly like the NAT problem the relay was added for.
 */

import { describe, expect, it } from "vitest";

import {
  ICE_SERVERS,
  TOKEN_EXPIRES_AT,
  hasWorkingRelay,
  relayServers,
} from "../../../src/net/ice-servers.js";

describe("ICE_SERVERS", () => {
  it("offers a relay as well as the STUN servers", () => {
    expect(relayServers().length).toBeGreaterThan(0);
    expect(ICE_SERVERS.some((server) => server.urls.startsWith("stun:"))).toBe(true);
  });

  it("spells the field `urls`, not Twilio's `url`", () => {
    // The API answers with both. `url` was dropped from the standard, and a list using it is accepted
    // without complaint and then ignored, which is the whole reason this assertion is here.
    for (const server of ICE_SERVERS) {
      expect(typeof server.urls).toBe("string");
      expect(server).not.toHaveProperty("url");
    }
  });

  it("gives every relay a username and a credential", () => {
    // A TURN entry without credentials is not refused either. It is simply never used.
    for (const relay of relayServers()) {
      expect(relay.username).toBeTruthy();
      expect(relay.credential).toBeTruthy();
    }
  });

  it("reaches the relay over UDP and over TCP on 443", () => {
    // 443 is the port outgoing HTTPS uses, and the one a restrictive network is least likely to block.
    const urls = relayServers().map((relay) => relay.urls);

    expect(urls.some((url) => url.endsWith("transport=udp"))).toBe(true);
    expect(urls.some((url) => url.includes(":443?"))).toBe(true);
  });
});

describe("hasWorkingRelay", () => {
  const issued = new Date(TOKEN_EXPIRES_AT);

  it("is true up to the moment the credentials expire", () => {
    expect(hasWorkingRelay(new Date(issued.getTime() - 60_000))).toBe(true);
  });

  it("is false once they have expired", () => {
    expect(hasWorkingRelay(new Date(issued.getTime() + 60_000))).toBe(false);
  });
});
