/**
 * The one state reference in `ui/`. Issue #42.
 *
 * Unit tested for the reason `handover.js` and `turn-controls.js` are: no jQuery, no DOM, and a rule
 * whose failure is silent. `isLocal` is the guard every click in the game goes through, and the wrong
 * default would either let a person click a bot's pawn again or, online, let the host click the guest's.
 */

import { describe, expect, it } from "vitest";

import { createGameState } from "../../../src/state/game-state.js";
import { createLoopStore } from "../../../src/ui/loop-store.js";

const accepting = (state, intent) => ({ accepted: true, state: { ...state, last: intent.type } });
const refusing = (state) => ({ accepted: false, state });

describe("the loop store", () => {
  it("keeps the state a dispatcher accepts and drops one it refuses", () => {
    const initialState = { turn: 1 };
    const accepted = createLoopStore({ initialState, deps: null, dispatcher: accepting });

    expect(accepted.apply({ type: "x" })).toBe(true);
    expect(accepted.getState()).toEqual({ turn: 1, last: "x" });

    const refused = createLoopStore({ initialState, deps: null, dispatcher: refusing });

    expect(refused.apply({ type: "x" })).toBe(false);
    expect(refused.getState()).toBe(initialState);
  });

  it("hands the dispatcher the deps it was built with", () => {
    const deps = { rng: () => 0.5 };
    let seen = null;
    const store = createLoopStore({
      initialState: {},
      deps,
      dispatcher: (state, intent, given) => {
        seen = given;
        return { accepted: true, state };
      },
    });

    store.apply({ type: "x" });

    expect(seen).toBe(deps);
  });

  it("replaces the state without dispatching", () => {
    let dispatched = 0;
    const store = createLoopStore({
      initialState: { turn: 1 },
      deps: null,
      dispatcher: (state) => {
        dispatched += 1;
        return { accepted: true, state };
      },
    });

    store.replace({ turn: 7 });

    expect(store.getState()).toEqual({ turn: 7 });
    expect(dispatched).toBe(0);
  });
});

describe("isLocal", () => {
  it("means 'not a bot' by default, which is what a hot-seat match is", () => {
    const store = createLoopStore({ initialState: createGameState(4, [], [2, 3]), deps: null });

    expect(store.isLocal(0)).toBe(true);
    expect(store.isLocal(1)).toBe(true);
    expect(store.isLocal(2)).toBe(false);
    expect(store.isLocal(3)).toBe(false);
  });

  it("means 'sits at this screen' when the seats are named, whatever the bots say", () => {
    const store = createLoopStore({
      initialState: createGameState(4, [], []),
      deps: null,
      localSeats: [2],
    });

    expect(store.isLocal(2)).toBe(true);
    // A person on another screen is, to this screen, exactly what a bot is.
    expect(store.isLocal(0)).toBe(false);
  });
});
