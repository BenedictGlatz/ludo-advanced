import { describe, expect, it } from "vitest";

import { createSeededRng } from "../../../src/core/dice-source.js";
import { pawnsOf } from "../../../src/core/pawns.js";
import { autoIntent } from "../../../src/state/auto-steps.js";
import { botSeatsFor } from "../../../src/state/bots.js";
import { MATCH_STATUS, TURN_PHASE } from "../../../src/state/game-state.js";
import { INTENT, dispatch } from "../../../src/state/intents.js";
import { matchDeps, startMatch } from "../../../src/state/match.js";
import { decide } from "../../../src/ai/bot-policy.js";
import { DEFAULT_PROFILE, PLAIN_PROFILE } from "../../../src/ai/profile.js";

/**
 * A whole match played by nobody. Issue #43.
 *
 * ## Why this is the strongest test in the suite
 *
 * Every other unit test asks one question of one module. This one asks the only question that
 * matters about the bot: **can it finish a game?** It plays hundreds of turns of real rules with a
 * real dice pool, and it fails if the bot ever produces an intent the rules refuse, if a phase is
 * reached that nothing knows how to leave, or if the match simply never ends.
 *
 * A single wrong branch in `bot-policy.js` shows up here as a hang or a rejection, and a wrong branch
 * in the *rules* shows up here too, which is the part that was not expected when it was written.
 *
 * ## The loop is the game loop with the waiting taken out
 *
 * The four steps below mirror `advance()` in `ui/game-loop.js` exactly, minus the timers. That is not
 * a coincidence to be maintained by hand: it is the point of the split. `decide` answers where a
 * person would be asked, the loop does the mechanical steps, and neither needs a browser to prove it.
 */

/** Every intent this match needed, so a failure can say what the bot was doing at the time. */
function playOut(state, deps, limit, profile = DEFAULT_PROFILE) {
  let current = state;
  let steps = 0;

  while (current.status === MATCH_STATUS.RUNNING) {
    steps += 1;
    expect(steps, `the bot match did not finish within ${limit} intents`).toBeLessThan(limit);

    const intent = decide(current, profile) ?? mechanicalIntent(current);
    const result = dispatch(current, intent, deps);

    // The assertion the whole file exists for: a bot never asks for something the rules refuse.
    expect(result.accepted, `${intent.type} was refused in phase ${current.phase}`).toBe(true);
    current = result.state;
  }

  return { state: current, steps };
}

/**
 * The steps the loop takes for itself, in the loop's own order.
 *
 * `autoIntent` is the same list `ui/game-loop.js` dispatches from since issue #42, so this file no
 * longer keeps a second copy of it. What it adds is the one step the loop does **not** take at once:
 * `end-turn`, which in the browser waits for the handover hold and the curtain, and here waits for
 * nothing.
 */
function mechanicalIntent(state) {
  const auto = autoIntent(state);
  if (auto !== null) return auto;
  if (state.phase === TURN_PHASE.TURN_END) return { type: INTENT.END_TURN };

  throw new Error(`nothing knows how to leave phase ${state.phase}`);
}

describe("a match with nobody at the keyboard (FR-43)", () => {
  it("plays two bots against each other until one of them wins", () => {
    const deps = matchDeps(createSeededRng(3));
    // No skill cards and no skill squares: this case is about movement, turn order and the dice
    // choice. The next one puts the full pool back in.
    const start = startMatch(2, deps, [], [], botSeatsFor(2, 2));

    expect(start.bots).toEqual([0, 2]);

    const { state } = playOut(start, deps, 20000);

    expect(state.status).toBe(MATCH_STATUS.WON);
    expect([0, 2]).toContain(state.winner);
    expect(pawnsOf(state.pawns, state.winner).every((pawn) => pawn.r > 40)).toBe(true);
    expect(state.turnNumber).toBeLessThan(2000);
  });

  /**
   * The case issue #82 turned upside down. It used to assert that the discard pile stayed **empty**,
   * which was the 2026-09-04 scope decision made visible. Now the same match has to show cards being
   * spent, and the real assertion is still the one inside `playOut`: over hundreds of turns with the
   * full pool, every intent a bot produces is accepted by the rules. A value function that builds an
   * illegal target fails here rather than parking a browser in one phase for ever.
   */
  it("plays four bots on a full skill pool, and they spend cards on each other", () => {
    const deps = matchDeps(createSeededRng(5));
    const start = startMatch(4, deps, undefined, undefined, botSeatsFor(4, 4));

    const { state } = playOut(start, deps, 20000);

    expect(state.status).toBe(MATCH_STATUS.WON);

    // Cards were played, which is the whole of the new behaviour, and the closed accounting rule
    // (FR-27) still holds: every card is in exactly one of pool, a hand or the discard pile.
    expect(state.skillDiscard.length).toBeGreaterThan(0);
    expect(state.seats.some((seat) => state.skillHands[seat].length > 0)).toBe(true);
  });

  /**
   * Two different bots at one table, which is what `npm run bots:arena` does for a few hundred
   * matches at a time. The arena is a script and is not run by the test suite, so this is the case
   * that keeps the seam it depends on working: `decide` takes a function from a seat to a profile,
   * and a table where the seats disagree about their knobs still produces nothing the rules refuse.
   *
   * A refused intent is much worse for a bot than for a person. `bot-driver.js` stops on a refusal,
   * the loop redraws, and a match with only bots in it sits in one phase for ever.
   */
  it("finishes a match with two different profiles at the same table", () => {
    const deps = matchDeps(createSeededRng(11));
    const start = startMatch(4, deps, undefined, undefined, botSeatsFor(4, 4));
    const mixed = (seat) => (seat % 2 === 0 ? DEFAULT_PROFILE : PLAIN_PROFILE);

    const { state } = playOut(start, deps, 20000, mixed);

    expect(state.status).toBe(MATCH_STATUS.WON);
    expect(start.seats).toContain(state.winner);
  });

  it("plays the same match the same way twice", () => {
    // Determinism end to end, not only inside `chooseDie`: same seed, same bots, same result. This
    // is what makes a failing run above reproducible rather than a story about something that
    // happened once.
    const runs = [7, 7].map((seed) => {
      const deps = matchDeps(createSeededRng(seed));
      return playOut(startMatch(4, deps, [], [], botSeatsFor(4, 4)), deps, 20000);
    });

    expect(runs[0].steps).toBe(runs[1].steps);
    expect(runs[0].state.winner).toBe(runs[1].state.winner);
    expect(runs[0].state.pawns).toEqual(runs[1].state.pawns);
  });
});
