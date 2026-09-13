/**
 * The reaction window's clock (FR-25), shortened from thirty seconds to ten on 2026-09-13.
 *
 * Same arrangement as `match-clock.test.js`: the `timers.js` registry is a plain map that records what
 * was armed, and `Date.now()` is Vitest's fake system time, so no case here waits on a real clock.
 *
 * The last case reads `motion.css`. The ring on screen drains over `--clock-window`, a CSS animation,
 * while the window shuts on `REACTION_WINDOW_MS`, a timer. Nothing connects the two numbers except
 * both being edited, and a ring that empties after ten seconds on a window that shuts after thirty (or
 * the other way round) is exactly the kind of mismatch nobody notices until a playtest.
 */

import { readFileSync } from "node:fs";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { INTENT } from "../../../src/state/intents.js";
import { REACTION_WINDOW_MS, createReactionClock } from "../../../src/ui/reaction-clock.js";

/** A registry that remembers instead of scheduling. `fire(name)` runs a timer the way the browser would. */
function fakeTimers() {
  const pending = new Map();

  return {
    set: (name, action, ms) => pending.set(name, { action, ms }),
    clear: (name) => pending.delete(name),
    has: (name) => pending.has(name),
    fire(name) {
      const entry = pending.get(name);
      pending.delete(name);
      entry.action();
    },
    pending,
  };
}

/** A clock over a state whose window is open until `close-window` is applied. */
function openWindowClock(delays = {}) {
  const timers = fakeTimers();
  const applied = [];
  let state = { reactionWindow: { eligible: [1] } };
  let closed = 0;

  const clock = createReactionClock({
    timers,
    getState: () => state,
    apply: (intent) => {
      applied.push(intent);
      state = { reactionWindow: null };
      return true;
    },
    refresh: () => {},
    delays,
    onClosed: () => {
      closed += 1;
    },
  });

  return { clock, timers, applied, closedCount: () => closed };
}

describe("the reaction clock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("gives a window ten seconds", () => {
    expect(REACTION_WINDOW_MS).toBe(10_000);

    const { clock, timers } = openWindowClock();
    clock.syncClock();

    expect(timers.pending.get("reaction").ms).toBe(10_000);
    expect(clock.secondsLeft()).toBe(10);
  });

  it("counts down in whole seconds and keeps its deadline when synced again", () => {
    const { clock } = openWindowClock();
    clock.syncClock();

    vi.setSystemTime(3_500);
    clock.syncClock();

    expect(clock.secondsLeft()).toBe(7);
  });

  it("shuts the window when the time is up, exactly as though everybody declined", () => {
    const { clock, timers, applied, closedCount } = openWindowClock();
    clock.syncClock();

    timers.fire("reaction");

    expect(applied).toEqual([{ type: INTENT.CLOSE_WINDOW }]);
    expect(closedCount()).toBe(1);
    expect(clock.secondsLeft()).toBeNull();
    expect(timers.has("reaction-tick")).toBe(false);
  });

  it("still takes an override, which is what ?fast=1 and an online guest use", () => {
    const { clock, timers } = openWindowClock({ reaction: 0 });
    clock.syncClock();

    expect(timers.pending.get("reaction").ms).toBe(0);
  });

  it("drains the ring on screen over the same ten seconds", () => {
    const css = readFileSync(new URL("../../../src/ui/styles/motion.css", import.meta.url), "utf8");
    const [, seconds] = css.match(/--clock-window:\s*(\d+)s;/);

    expect(Number(seconds) * 1000).toBe(REACTION_WINDOW_MS);
  });
});
