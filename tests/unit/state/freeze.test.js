/**
 * `deepFreeze` and `isDeeplyFrozen`. Issue #38.
 *
 * Two kinds of test here, and the split is deliberate. Most tests use `isDeeplyFrozen`, because it
 * reads well and covers a whole shape in one line. A few assert `Object.isFrozen` by hand on a named
 * path, because both functions share `isPlainContainer`: if that decided an array was not a container,
 * `isDeeplyFrozen` would agree with `deepFreeze` and both would be wrong. The hand-written assertions
 * are the ones that would still fail.
 */

import { describe, expect, it } from "vitest";

import { deepFreeze, isDeeplyFrozen } from "../../../src/state/freeze.js";

describe("deepFreeze", () => {
  it("returns the same object, so it reads as an expression", () => {
    const original = { a: 1 };

    expect(deepFreeze(original)).toBe(original);
  });

  it("freezes an object, its arrays, and the objects inside those arrays", () => {
    const state = deepFreeze({
      pawns: [{ id: "0.0", r: 0 }],
      legalMoves: [{ pawnId: "0.0", captures: [{ id: "1.0" }] }],
      hand: [2, 4, 6],
    });

    // By hand, on named paths, so this test does not depend on isPlainContainer being right.
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.pawns)).toBe(true);
    expect(Object.isFrozen(state.pawns[0])).toBe(true);
    expect(Object.isFrozen(state.hand)).toBe(true);
    expect(Object.isFrozen(state.legalMoves[0].captures)).toBe(true);
    expect(Object.isFrozen(state.legalMoves[0].captures[0])).toBe(true);
  });

  it("reaches a field nested three levels deep, which is where the skill hands will live", () => {
    // skillHands is an object keyed by seat, holding an array per seat, holding card ids. That shape
    // is the reason the hand-written freeze list was given up.
    const state = deepFreeze({ skillHands: { 0: [{ id: "action-angel-die" }], 1: [] } });

    expect(isDeeplyFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.skillHands[0][0])).toBe(true);
  });

  it("makes a write throw rather than dropping it, which is the whole point", () => {
    "use strict";
    const state = deepFreeze({ pawns: [{ id: "0.0", r: 0 }] });

    expect(() => {
      state.pawns[0].r = 5;
    }).toThrow(TypeError);
    expect(() => {
      state.pawns.push({ id: "0.1", r: 0 });
    }).toThrow(TypeError);
  });

  it("survives a cycle instead of running out of stack", () => {
    // The game state has no cycles. This is the four-line guard the old hand-written freeze named as
    // its reason for not being generic, so it gets a test.
    const a = { name: "a" };
    const b = { name: "b", a };
    a.b = b;

    expect(() => deepFreeze(a)).not.toThrow();
    expect(Object.isFrozen(a)).toBe(true);
    expect(Object.isFrozen(b)).toBe(true);
  });

  it("visits a shared subtree once and freezes it", () => {
    const shared = { faces: 8 };
    const state = deepFreeze({ chosen: shared, hand: [shared, { faces: 2 }] });

    expect(Object.isFrozen(state.chosen)).toBe(true);
    expect(Object.isFrozen(state.hand[1])).toBe(true);
  });

  it("passes primitives and null straight through", () => {
    expect(deepFreeze(null)).toBe(null);
    expect(deepFreeze(7)).toBe(7);
    expect(deepFreeze("draw")).toBe("draw");
    expect(deepFreeze(undefined)).toBe(undefined);
  });

  it("freezes an object made with Object.create(null)", () => {
    const bag = Object.create(null);
    bag.cards = [1, 2];

    deepFreeze(bag);

    expect(Object.isFrozen(bag)).toBe(true);
    expect(Object.isFrozen(bag.cards)).toBe(true);
  });

  it("leaves a Map, a Date and a function alone rather than pretending to protect them", () => {
    // Object.freeze on a Map does not stop map.set, so freezing one would look like protection and
    // not be. Nothing of this kind belongs in the state; leaving it untouched keeps the lie out.
    const map = new Map();
    const date = new Date(0);
    const fn = () => 1;
    const state = deepFreeze({ map, date, fn });

    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(map)).toBe(false);
    expect(Object.isFrozen(date)).toBe(false);
    expect(Object.isFrozen(fn)).toBe(false);
    expect(() => map.set("a", 1)).not.toThrow();
  });
});

describe("isDeeplyFrozen", () => {
  it("says no when one array inside a frozen object is still writable", () => {
    // This is exactly the bug the hand-written freeze list could produce by forgetting one line.
    const state = { pawns: [{ id: "0.0" }], hand: [2, 4] };
    Object.freeze(state.pawns[0]);
    Object.freeze(state.pawns);
    Object.freeze(state);

    expect(Object.isFrozen(state)).toBe(true);
    expect(isDeeplyFrozen(state)).toBe(false);
  });

  it("says yes for something deepFreeze produced", () => {
    expect(isDeeplyFrozen(deepFreeze({ a: [{ b: [1, 2] }] }))).toBe(true);
  });

  it("says yes for a primitive, because there is nothing to freeze", () => {
    expect(isDeeplyFrozen(3)).toBe(true);
    expect(isDeeplyFrozen(null)).toBe(true);
  });

  it("says no for an unfrozen container", () => {
    expect(isDeeplyFrozen({})).toBe(false);
    expect(isDeeplyFrozen([])).toBe(false);
  });
});
