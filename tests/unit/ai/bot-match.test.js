import { describe, expect, it } from "vitest";

import { createSeededRng } from "../../../src/core/dice-source.js";
import { pawnsOf } from "../../../src/core/pawns.js";
import { botSeatsFor } from "../../../src/state/bots.js";
import { MATCH_STATUS, TURN_PHASE } from "../../../src/state/game-state.js";
import { INTENT, dispatch } from "../../../src/state/intents.js";
import { matchDeps, startMatch } from "../../../src/state/match.js";
import { decide } from "../../../src/ai/bot-policy.js";

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
function playOut(state, deps, limit) {
  let current = state;
  let steps = 0;

  while (current.status === MATCH_STATUS.RUNNING) {
    steps += 1;
    expect(steps, `the bot match did not finish within ${limit} intents`).toBeLessThan(limit);

    const intent = decide(current) ?? mechanicalIntent(current);
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
 * The open window comes first for the same reason it does in `advance()`: while one is open, `dispatch`
 * refuses everything except the three window intents, so a `roll-die` here would be rejected rather
 * than merely early.
 */
function mechanicalIntent(state) {
  if (state.reactionWindow !== null) return { type: INTENT.CLOSE_WINDOW };

  switch (state.phase) {
    case TURN_PHASE.ROLL:
      return { type: INTENT.ROLL_DIE };
    case TURN_PHASE.REACTION:
      return { type: INTENT.CLOSE_WINDOW };
    case TURN_PHASE.TURN_END:
      return { type: INTENT.END_TURN };
    default:
      throw new Error(`nothing knows how to leave phase ${state.phase}`);
  }
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

  it("plays four bots on a full skill pool, and none of them ever plays a card", () => {
    const deps = matchDeps(createSeededRng(5));
    const start = startMatch(4, deps, undefined, undefined, botSeatsFor(4, 4));

    const { state } = playOut(start, deps, 20000);

    expect(state.status).toBe(MATCH_STATUS.WON);

    // Windows opened and were declined, hands filled up from the skill squares, and the discard pile
    // stayed empty because a declined window discards nothing. That is the scope decision made
    // visible: "the bot plays no skill cards" is a property of the match, not a promise in a comment.
    expect(state.skillDiscard).toEqual([]);
    expect(state.traps).toEqual([]);
    expect(state.seats.some((seat) => state.skillHands[seat].length > 0)).toBe(true);
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
