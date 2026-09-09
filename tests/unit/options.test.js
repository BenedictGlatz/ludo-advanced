/**
 * What the address bar is allowed to say. Issue #43.
 *
 * **This file could not exist until `readOptions` moved out of `main.js`**, and that is the whole
 * reason it moved: importing `main.js` pulls in jQuery, twenty stylesheets and a `boot()` call at
 * module level, none of which a test of string parsing has any use for. `src/options.js` imports one
 * thing, `PLAYER_COUNTS`.
 *
 * The existing behaviour of `seed`, `players`, `fast` and `stack` is pinned here as well as the new
 * `bots`. It had never been unit tested, so a silent change during the move would have shown up as a
 * strange end-to-end failure rather than as a failing assertion.
 */

import { describe, expect, it } from "vitest";

import { FAST_DELAYS, readOptions } from "../../src/options.js";

describe("readOptions: bots (FR-43)", () => {
  it("reads a count, when the address bar also names a player count", () => {
    expect(readOptions("?players=4&bots=2").bots).toBe(2);
    expect(readOptions("?players=4&bots=3").bots).toBe(3);
    expect(readOptions("?players=2&bots=1").bots).toBe(1);
  });

  it("refuses to fill every seat, because nobody would be playing", () => {
    // `state/` allows an all-bot match and the regression test starts one directly. This is the layer
    // that stops somebody being handed one through a URL.
    expect(readOptions("?players=4&bots=4").bots).toBe(0);
    expect(readOptions("?players=2&bots=2").bots).toBe(0);
    expect(readOptions("?players=4&bots=9").bots).toBe(0);
  });

  it("needs a player count first, because bots fill seats that do not exist yet", () => {
    expect(readOptions("?bots=2").bots).toBe(0);
    expect(readOptions("?players=5&bots=2").bots).toBe(0);
  });

  it("starts an ordinary game on a broken value", () => {
    for (const search of [
      "?players=4&bots=-1",
      "?players=4&bots=abc",
      "?players=4&bots=",
      "?players=4",
    ]) {
      expect(readOptions(search).bots, search).toBe(0);
    }
  });

  it("accepts an explicit zero", () => {
    expect(readOptions("?players=4&bots=0").bots).toBe(0);
  });
});

describe("readOptions: the four settings that were already there", () => {
  it("takes a seed when given one and invents one otherwise", () => {
    expect(readOptions("?seed=42").seed).toBe(42);
    expect(Number.isInteger(readOptions("").seed)).toBe(true);
    expect(Number.isInteger(readOptions("?seed=nonsense").seed)).toBe(true);
  });

  it("accepts only a real player count, and null means the main menu", () => {
    expect(readOptions("?players=3").players).toBe(3);
    expect(readOptions("?players=1").players).toBeNull();
    expect(readOptions("").players).toBeNull();
  });

  it("reads fast as the exact string 1", () => {
    expect(readOptions("?fast=1").fast).toBe(true);
    expect(readOptions("?fast=true").fast).toBe(false);
    expect(readOptions("").fast).toBe(false);
  });

  it("tells an empty stack from an absent one", () => {
    // `[]` is a legitimate thing to hand `startMatch`, meaning a pool with no cards in it, and that is
    // not what a missing parameter says.
    expect(readOptions("?stack=a,b").stack).toEqual(["a", "b"]);
    expect(readOptions("?stack=").stack).toBeNull();
    expect(readOptions("").stack).toBeNull();
    expect(readOptions("?stack=a,,b").stack).toEqual(["a", "b"]);
  });
});

describe("FAST_DELAYS", () => {
  it("collapses every wait in the turn loop, including the bot's", () => {
    // The list that cannot go stale, per `tests/e2e/helpers.js`. A new hold that is not in here costs
    // real seconds on every turn of the end-to-end suite.
    expect(Object.values(FAST_DELAYS).every((ms) => ms === 0)).toBe(true);
    expect(FAST_DELAYS.bot).toBe(0);
  });
});
