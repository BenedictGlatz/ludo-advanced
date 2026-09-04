/**
 * How good a move is, as one number. Issue #43, requirement FR-43.
 *
 * The `ai/` layer may import `core/` and `state/`. It must never touch `ui/`, `i18n/`, jQuery or the
 * DOM, and ESLint enforces that. Everything here is pure and deterministic: no `rng`, no
 * `Math.random`, no `Date`. A test is a literal board and a literal number, which is the whole reason
 * the bot is a layer of its own rather than a file in `ui/`.
 *
 * ## The heuristic in one sentence
 *
 * Finishing a pawn beats capturing, capturing beats reaching the safety of the home column, that
 * beats getting a pawn out of the yard, and anything beats simply walking.
 *
 * ## Why the categories are exclusive and not added up
 *
 * A move scores in **exactly one** category, the highest that applies. The numbers are then spaced so
 * that the category order survives the comparison *between different moves of the same turn*, which is
 * the only comparison that ever happens:
 *
 * | Category | Score | Beats everything below because |
 * | --- | --- | --- |
 * | Finish | 100 | Nothing else ends a pawn's journey |
 * | Capture | 60 + the victim's `r` | At most 100, and it costs an opponent up to 40 steps |
 * | Enter the home column | 30 | The pawn leaves the capturable track for good |
 * | Leave the start area | 25 | A pawn in the yard does nothing at all |
 * | Advance | 1 per step | At most 20, on a D20, so it never outranks the 25 above it |
 *
 * That last row is why 25 is 25. A twenty-step walk is the biggest an advance can ever be, so setting
 * `LEAVE_START` above 20 makes "get a pawn out" win against "walk a long way" every single time,
 * without a special case anywhere.
 *
 * **The order is the heuristic. The distances are a knob.** Anybody tuning this bot later should move
 * the numbers, not the ranking, and should do it with the bot-against-bot test as the scoreboard.
 *
 * ## What is deliberately missing: danger
 *
 * Nothing here asks "does this land my pawn in front of an opponent". That is the obvious next step
 * and it is genuinely harder: it needs absolute-square arithmetic across seats (`absoluteSquare` per
 * player) plus a model of what the *opponent's* dice hand can roll, and a wrong model makes the bot
 * play worse than one that ignores danger altogether. It is named as follow-up work in
 * `notes/06-state-and-turn-flow.md` rather than half-built here.
 */

import { HOME_R, TRACK_LENGTH } from "../core/board.js";
import { MOVE_KIND } from "../core/move-rules.js";
import { findPawn } from "../core/pawns.js";

/** The five categories, as the numbers that rank them. Frozen: a bot does not retune itself. */
export const SCORE = Object.freeze({
  /** `move.to === HOME_R`: the pawn can never be captured again, and a quarter of the win is done. */
  FINISH: 100,
  /** `move.captures !== null`, plus `CAPTURE_PER_STEP` for every step the victim loses. */
  CAPTURE: 60,
  /**
   * Sending a pawn on `r = 38` back to its yard costs that opponent 38 steps; one on `r = 3` costs
   * them 3. Without this the bot would capture the nearest pawn it could reach, which is the cheapest
   * capture on the board.
   */
  CAPTURE_PER_STEP: 1,
  /** `from <= TRACK_LENGTH && to > TRACK_LENGTH`: off the shared track for good. */
  ENTER_HOME: 30,
  /** `kind === MOVE_KIND.LEAVE_START`: a pawn in the yard contributes nothing whatsoever. */
  LEAVE_START: 25,
  /** The fallback, so that a long walk beats a short one when nothing else separates them. */
  ADVANCE_PER_STEP: 1,
});

/**
 * What one move is worth. Higher is better, and the lowest possible score is 1.
 *
 * `pawns` is the list the move was computed against, and it is needed for one thing only: how far the
 * captured pawn had got. `core/` hands the capture back as an identity `{ player, pawn }` rather than
 * a position, so the position has to be looked up.
 */
export function scoreMove(move, pawns) {
  if (move.to === HOME_R) {
    return SCORE.FINISH;
  }

  if (move.captures !== null) {
    const victim = findPawn(pawns, move.captures);
    return SCORE.CAPTURE + SCORE.CAPTURE_PER_STEP * victim.r;
  }

  // A move that crosses out of the shared track and into the player's own house. `from` is on the
  // track (or in the yard, which is 0 and therefore also `<= TRACK_LENGTH`), `to` is past its end.
  if (move.from <= TRACK_LENGTH && move.to > TRACK_LENGTH) {
    return SCORE.ENTER_HOME;
  }

  if (move.kind === MOVE_KIND.LEAVE_START) {
    return SCORE.LEAVE_START;
  }

  return SCORE.ADVANCE_PER_STEP * (move.to - move.from);
}

/**
 * The best of a list of moves, as `{ move, score }`, or `null` when the list is empty.
 *
 * **The tie-breaks are part of the contract, not an accident of `Array.sort`.** A bot that picks a
 * different pawn on two runs of the same board cannot be tested and cannot be reported as a bug, so
 * the order is fixed here and asserted in `move-scoring.test.js`:
 *
 * 1. The higher score.
 * 2. Then the pawn that has got **further** (`from`), because concentrating on a leading pawn gets it
 *    home, while spreading the same steps over four pawns gets none of them home.
 * 3. Then the lower pawn index, which decides nothing about play and everything about repeatability.
 */
export function bestMove(moves, pawns) {
  let best = null;

  for (const move of moves) {
    const score = scoreMove(move, pawns);
    if (best === null || beats({ move, score }, best)) {
      best = { move, score };
    }
  }

  return best;
}

function beats(candidate, best) {
  if (candidate.score !== best.score) return candidate.score > best.score;
  if (candidate.move.from !== best.move.from) return candidate.move.from > best.move.from;

  return candidate.move.pawn < best.move.pawn;
}
