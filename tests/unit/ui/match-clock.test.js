/**
 * The match clock behind the pause screen's "Spielzeit". Issue #77.
 *
 * `match-clock.js` reads `Date.now()` and a `timers.js` registry, and both are injected here, so no
 * case in this file waits on a real clock: `now` is a number the test moves by hand, and the registry
 * is a plain map that records what was armed. That is the same arrangement `reaction-clock.js` is
 * tested under, and it is what lets a one-second tick be asserted in a millisecond.
 */

import { describe, expect, it } from "vitest";

import { TICK_MS, createMatchClock, formatElapsed } from "../../../src/ui/match-clock.js";

/** A registry that remembers instead of scheduling. `fire(name)` runs a timer the way the browser would. */
function fakeTimers() {
  const pending = new Map();

  return {
    set: (name, action, ms) => pending.set(name, { action, ms }),
    clear: (name) => pending.delete(name),
    has: (name) => pending.has(name),
    clearAll: () => pending.clear(),
    fire(name) {
      const entry = pending.get(name);
      pending.delete(name);
      entry.action();
    },
    pending,
  };
}

describe("formatElapsed", () => {
  it("prints minutes and seconds, two digits each, under an hour", () => {
    expect(formatElapsed(0)).toBe("00:00");
    expect(formatElapsed(65_000)).toBe("01:05");
    expect(formatElapsed(59 * 60_000 + 59_000)).toBe("59:59");
  });

  it("adds the hours only once a match has run for one", () => {
    expect(formatElapsed(3_600_000)).toBe("1:00:00");
    expect(formatElapsed(3_600_000 + 7 * 60_000 + 3_000)).toBe("1:07:03");
  });

  it("rounds down to whole seconds and never goes negative", () => {
    expect(formatElapsed(1_999)).toBe("00:01");
    expect(formatElapsed(-5_000)).toBe("00:00");
  });
});

describe("the match clock", () => {
  it("knows nothing before a match has begun", () => {
    const clock = createMatchClock({ now: () => 1_000, timers: fakeTimers() });

    expect(clock.elapsedMs()).toBeNull();
  });

  it("counts from start, and starts over on the next match", () => {
    let time = 10_000;
    const clock = createMatchClock({ now: () => time, timers: fakeTimers() });

    clock.start();
    time = 25_000;
    expect(clock.elapsedMs()).toBe(15_000);

    // Play Again is a new match, and its clock is a new clock.
    clock.start();
    expect(clock.elapsedMs()).toBe(0);
  });

  /**
   * The redraw is armed under one name, once a second, and it re-arms itself before it redraws. That
   * order is the point of the second `watch` call inside `redraw`: the pause screen's redraw calls
   * `watch` again on every tick, and it must find the timer already armed rather than arm a second one.
   */
  it("redraws once a second while watched, and only once however often it is asked", () => {
    const timers = fakeTimers();
    const clock = createMatchClock({ now: () => 0, timers });
    let redraws = 0;
    const redraw = () => {
      redraws += 1;
      clock.watch(redraw);
    };

    clock.watch(redraw);
    clock.watch(redraw);
    expect(timers.pending.size).toBe(1);
    expect(timers.pending.get("match-tick").ms).toBe(TICK_MS);

    timers.fire("match-tick");
    expect(redraws).toBe(1);
    expect(timers.pending.size).toBe(1);

    timers.fire("match-tick");
    expect(redraws).toBe(2);
  });

  it("stops redrawing when unwatched, and does not mind being unwatched twice", () => {
    const timers = fakeTimers();
    const clock = createMatchClock({ now: () => 0, timers });

    clock.watch(() => {});
    clock.unwatch();
    clock.unwatch();

    expect(timers.has("match-tick")).toBe(false);
  });
});
