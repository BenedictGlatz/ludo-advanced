/**
 * The steps a turn takes by itself, with nobody clicking. Issue #42.
 *
 * Imports `state/` only, never `ui/` (NFR-01). Pure: it reads a state and names one intent.
 *
 * ## Why this is a module and not three `if` blocks in the loop
 *
 * `ui/game-loop.js` used to hold three branches in a row: skip the action phase when nobody can play a
 * card, roll in `roll`, close the window in `reaction`. `tests/unit/ai/bot-match.test.js` had the same
 * three written out a second time as `mechanicalIntent`, with a comment asking for exactly this file.
 *
 * Online play (FR-42) is the third caller and the one that made the duplication a bug rather than a
 * smell. The host has to refuse a guest who sends one of these intents, because the host's loop and
 * clock own them: a guest `roll-die` would roll a second time, and a guest `close-window` would shut a
 * window whose thirty seconds are the host's to count. "Which intents does the loop take by itself" has
 * to be one list, in one place, that `ui/` and `net/` both read. It lives in `state/` because `net/` may
 * not import `ui/`.
 *
 * ## The rule, and the one deliberate gap
 *
 * `autoIntent` answers `null` while a reaction window is open and still has somebody in it. That is not
 * the loop's step to take: it belongs to the person being asked, or to the clock in `card-controls.js`.
 * With an **empty** window it answers `close-window`, which is FR-25's "everybody declined, play
 * continues at once".
 */

import { TURN_PHASE } from "./game-state.js";
import { INTENT } from "./intents.js";
import { playableCards } from "./intents-cards.js";

/**
 * The three intents no player ever sends: the loop dispatches them, and a guest is refused them.
 *
 * `end-turn` is in this list and is **not** in `autoIntent`, because the loop does not take it at once:
 * it waits for the handover hold and then the curtain, both of which are `ui/`'s and neither of which a
 * rule can see. What both callers agree on is that a player never asks for it.
 */
export const LOOP_OWNED_INTENTS = Object.freeze([
  INTENT.ROLL_DIE,
  INTENT.CLOSE_WINDOW,
  INTENT.END_TURN,
]);

/** Is `type` one of the intents the loop owns? The question the host guard asks of a guest. */
export function isLoopOwned(type) {
  return LOOP_OWNED_INTENTS.includes(type);
}

/**
 * The intent the loop takes by itself right now, or `null` when a person is being asked something.
 *
 * The order is the order `advance()` in `ui/game-loop.js` always had: the window first, because while
 * one is open `dispatch` refuses everything but the three window intents, so a `roll-die` here would be
 * refused rather than merely early.
 */
export function autoIntent(state) {
  if (state.reactionWindow !== null) {
    return state.reactionWindow.eligible.length === 0 ? { type: INTENT.CLOSE_WINDOW } : null;
  }

  switch (state.phase) {
    case TURN_PHASE.ACTION:
      // Nobody can play anything, so there is nothing to wait for. A game that waited here would hang.
      return playableCards(state, state.activePlayer).length === 0
        ? { type: INTENT.SKIP_ACTION }
        : null;
    case TURN_PHASE.ROLL:
      return { type: INTENT.ROLL_DIE };
    case TURN_PHASE.REACTION:
      return { type: INTENT.CLOSE_WINDOW };
    default:
      return null;
  }
}
