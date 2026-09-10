/**
 * Fakes for driving the online lobby without jQuery or a network. Issues #42 and #101.
 *
 * Not a test file itself: Vitest only collects `*.test.js`, so nothing here runs on its own. Split out of
 * `tests/unit/ui/online-flow.test.js` when the bot cases (issue #101) took that file past 300 lines.
 *
 * The links are fakes whose codes are plain strings and whose channels are loopback pairs; the loop is a
 * headless one with the surface the roles call; a `browser` is one `createOnlineFlow` with a recording
 * `beginMatch` and a fake screen.
 */

import { vi } from "vitest";

import { createSeededRng } from "../../src/core/dice-source.js";
import { MATCH_STATUS } from "../../src/state/game-state.js";
import { createLoopbackPair } from "../../src/net/transport.js";
import { createOnlineFlow } from "../../src/ui/online/online-flow.js";
import { OVERLAY_SCREEN } from "../../src/ui/overlay-vocabulary.js";

export const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Fake links: an invite code is `invite:<n>`, a reply code is `reply:<n>`, and accepting the right reply
 * hands the host one end of a loopback pair whose other end the matching guest link resolves with.
 * `hostLinks` lists every host link made, so a test can see that one was hung up (issue #101).
 */
export function fakeLinks() {
  const pairs = new Map();
  const hostLinks = [];
  let next = 0;

  return {
    createHostLink() {
      const id = (next += 1);
      const link = {
        closed: false,
        invite: async () => `invite:${id}`,
        accept: async (reply) => {
          if (reply !== `reply:${id}`) throw new Error("bad-code");
          const [hostEnd, guestEnd] = createLoopbackPair();
          pairs.set(id, guestEnd);
          return hostEnd;
        },
        close() {
          link.closed = true;
        },
      };
      hostLinks.push(link);
      return link;
    },
    createGuestLink() {
      return {
        join: async (invite) => {
          const match = /^invite:(\d+)$/u.exec(invite);
          if (match === null) throw new Error("bad-code");
          const id = Number(match[1]);
          const ready = new Promise((resolve) => {
            const poll = () => (pairs.has(id) ? resolve(pairs.get(id)) : setTimeout(poll, 0));
            poll();
          });
          return { replyCode: `reply:${id}`, ready };
        },
        close() {},
      };
    },
    hostLinks,
  };
}

/** A headless loop with the surface the roles call, recording what it was built with. */
export function fakeLoop(options) {
  let state = options.initialState;
  return {
    options,
    start() {},
    getState: () => state,
    submit() {
      return false;
    },
    receive(next) {
      state = next;
    },
    abandon() {
      state = { ...state, status: MATCH_STATUS.ABANDONED };
      options.onMatchOver?.(state);
    },
    showRefusal() {},
    pause() {},
    resume() {},
    stop() {},
  };
}

/** One browser: a flow with a recording `beginMatch` and a fake screen. */
export function browser(links) {
  const begun = [];
  let screen = OVERLAY_SCREEN.MENU;
  const flow = createOnlineFlow({
    openScreen: (next) => (screen = next),
    getScreen: () => screen,
    drawShell: vi.fn(),
    beginMatch: (state, deps, { createLoop, loopOptions }) => {
      const loop = (createLoop ?? fakeLoop)({ initialState: state, deps, ...loopOptions });
      begun.push({ state, loop, loopOptions });
      return loop;
    },
    onMatchOver: vi.fn(),
    rng: createSeededRng(1),
    delays: { reaction: 0 },
    links,
    loops: { createGuestLoop: fakeLoop, guestDeps: () => ({ rng: null, diceSource: {} }) },
    clipboard: { write: vi.fn() },
    wait: () => 0,
  });

  return { flow, begun, screen: () => screen };
}

/** One guest joins the host's table through the invite on screen. */
export async function joinTable(host, links) {
  const guest = browser(links);
  guest.flow.join();
  guest.flow.connect(host.flow.snapshot().invite);
  await settle();
  host.flow.connect(guest.flow.snapshot().reply);
  await settle();
  await settle();

  return guest;
}

/**
 * Host a `count`-seat table and connect `guestCount` guests, every seat's by default, codes swapped
 * through the fakes. Fewer guests leave the table half full, which is where the bot cases start.
 */
export async function table(count, guestCount = count - 1) {
  const links = fakeLinks();
  const host = browser(links);
  const guests = [];

  host.flow.open();
  host.flow.host(count);
  await settle();

  for (let n = 0; n < guestCount; n += 1) {
    if (n > 0) {
      host.flow.addGuest();
      await settle();
    }
    guests.push(await joinTable(host, links));
  }

  return { host, guests, links };
}
