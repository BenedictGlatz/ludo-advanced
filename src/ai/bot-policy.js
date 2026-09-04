/**
 * What a bot does when the game asks it something. Issue #43, requirement FR-43.
 *
 * ## A bot is a player without a screen
 *
 * `decide` does exactly what a jQuery click handler in `ui/` does: it reads the state and returns one
 * intent. It dispatches nothing itself, it starts no timers, and it knows nothing about time. The
 * game loop dispatches, and `ui/bot-driver.js` supplies the pause that makes a bot turn readable.
 *
 * That split is the whole architecture of this feature in one sentence, and it is what lets
 * `bot-match.test.js` play a full four-bot match under Vitest with no browser in sight.
 *
 * ## It answers only where a person would be asked
 *
 * ```
 * draw -> choose -> action -> roll -> act -> reaction -> turn-end
 *          ^^^^^^   ^^^^^^           ^^^
 * ```
 *
 * Three phases wait for a human, plus an open reaction window. `decide` covers those four and returns
 * `null` everywhere else.
 *
 * **`roll-die`, `close-window` and `end-turn` are deliberately left to the loop**, even though a bot
 * could technically issue them. They are not decisions, they are the machinery of the turn, and the
 * loop hangs its hold times off them: `needsRollMoment` gives the roll its moment on screen, and
 * `afterTurn` holds the result long enough to read. A second issuer of `roll-die` would race the roll
 * animation, and the bug would look like a flickering die rather than like a bot problem.
 *
 * ## No skill cards, for now
 *
 * The bot always passes on the action phase and always declines a reaction window. That is a scope
 * decision made with the Product Owner on 2026-09-04 and not a gap: card tactics need a value model
 * for 36 different cards, which is a piece of work in its own right and its own issue. What matters
 * for FR-43 is that the bot's behaviour is *defined* rather than accidental, so "plays no card" is
 * written into the acceptance criterion and tested.
 */

import { INTENT } from "../state/intents.js";
import { INTENT_CARD } from "../state/intents-cards.js";
import { MATCH_STATUS, TURN_PHASE } from "../state/game-state.js";
import { isBot } from "../state/bots.js";
import { chooseDie } from "./dice-choice.js";
import { bestMove } from "./move-scoring.js";

/**
 * The one intent a bot wants dispatched right now, or `null` when no bot is being asked anything.
 *
 * Callers must treat `null` as "carry on as normal", not as an error. In an all-human match every
 * single call returns `null`, which is exactly why the driver can be wired into the loop
 * unconditionally.
 */
export function decide(state) {
  if (state.status !== MATCH_STATUS.RUNNING) return null;

  // The window comes first, and before the active-seat check on purpose: a bot can be asked to
  // react during a *person's* turn, and that is the only moment a non-active seat is ever asked
  // anything at all.
  if (state.reactionWindow !== null) {
    const seat = state.reactionWindow.eligible.find((eligible) => isBot(state, eligible));
    return seat === undefined ? null : { type: INTENT_CARD.DECLINE_REACTION, seat };
  }

  if (!isBot(state, state.activePlayer)) return null;

  switch (state.phase) {
    case TURN_PHASE.CHOOSE:
      return { type: INTENT.CHOOSE_DIE, faces: chooseDie(state) };

    case TURN_PHASE.ACTION:
      return { type: INTENT.SKIP_ACTION };

    case TURN_PHASE.ACT:
      return commitBestMove(state);

    default:
      // draw, roll, reaction, turn-end, match-over: the loop's own steps, see the module header.
      return null;
  }
}

/**
 * The move intent for the best pawn on the board.
 *
 * There is no `select-pawn` on the way. Selecting is pure presentation, it highlights a move before
 * the player commits to it, and a bot has nothing to look at. Whether the chosen pawn should light up
 * for a moment before it walks is a question for Design, filed as D84.
 *
 * `null` when there is genuinely nothing to move. The loop never asks in that case, because a turn
 * with no legal move is refused in `roll` and skips straight to `turn-end`, but a policy that trusts
 * its caller about the state of the board is a policy that crashes the day the caller changes.
 */
function commitBestMove(state) {
  const best = bestMove(state.legalMoves, state.pawns);

  return best === null ? null : { type: INTENT.COMMIT_MOVE, pawn: best.move.pawn };
}
