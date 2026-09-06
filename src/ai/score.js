/**
 * The one currency every number in `ai/` is written in. Issues #43, #82 and the bot tactics plan.
 *
 * Pure `ai/` and the only file in the layer that imports nothing at all. That is the whole reason it
 * exists: `move-scoring.js` prices danger, danger is `threat.js`, and `threat.js` needs the currency.
 * With the table living in the scorer those three would import each other in a ring, and a ring of ES
 * modules works right up until one of them reads a `const` of another at import time, which is a bug
 * that shows up as an undefined constant on the day somebody adds a line.
 *
 * So the currency is here, on its own, and everybody imports downwards.
 *
 * ## What the currency is
 *
 * **One point is one step of one pawn.** Every value in the layer, a card's worth included, has to be
 * expressible as "how many steps is this worth", or it cannot be compared with the move it competes
 * with. `SCORE` is the move side of that and the four `_WORTH` numbers below are the card side.
 */

/**
 * The five move categories, as the numbers that rank them. Frozen: a bot does not retune itself.
 *
 * A move scores in **exactly one** of these, the highest that applies, and the numbers are spaced so
 * that the ranking survives the comparison between two moves of the same turn:
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
 * **The order is the heuristic. The distances are a knob.** Anybody tuning this bot should move the
 * numbers, not the ranking, and should do it with `npm run bots:arena` as the scoreboard.
 */
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
 * What one skill card in hand is worth, for everything that trades in cards rather than in steps.
 *
 * Three points, a little under `PLAY_AT`: a card is worth having and not worth spending a whole
 * turn's budget on by itself. Pot of Greed drawing two is therefore worth 6 and plays; landing on a
 * skill square earns one, which is what the move scorer's landing bonus is made of.
 *
 * Measured against the arena in the bot tactics plan's phase 3, see `notes/09-source-code-overview.md`.
 */
export const CARD_WORTH = 3;

/** What losing a turn costs, in steps: roughly one average roll of the middle of the dice pool. */
export const STUN_WORTH = 7;

/** What standing still for a round costs, in steps. Roughly one average roll of the smaller dice. */
export const LOCK_COST = 5;

/** What one pawn being stopped by a blocker is worth. The same number for both rock cards. */
export const BLOCK_WORTH = 3;

/** What forcing an opponent to move the wrong pawn is worth, before the `share` rule is applied. */
export const TAUNT_WORTH = 3;

/**
 * What a pawn is worth to its owner, as the loss if it were sent home.
 *
 * `r` steps walked plus `LEAVE_START`, because a captured pawn loses the walk **and** has to be got
 * out of the yard again. Here rather than in `threat.js` because the move scorer needs it too, and
 * this is the file both of them may import.
 */
export function pawnWorth(pawn) {
  return pawn.r + SCORE.LEAVE_START;
}
