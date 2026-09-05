/**
 * Which of the three drawn dice cards a bot picks. Issue #43, requirements FR-19 and FR-43.
 *
 * Pure and deterministic, like the rest of `ai/`: it asks `core/movement.js` what every face of a die
 * would allow and averages the answers. It never rolls anything and never touches `deps.rng`, which is
 * what keeps the recorded seeds in `npm run test:seeds` valid.
 *
 * ## Why the average and not the best case
 *
 * This is the one decision in the file worth understanding, because the obvious choice is wrong.
 *
 * A pawn leaves the start area on the die's **maximum** (FR-09). So with every pawn still in the yard,
 * a D20 can get one out and so can a D2. Score the dice by their best possible outcome and both come
 * back with the same number, and the bot picks whichever it saw first.
 *
 * Averaging asks the useful question instead: *how often* does this die do something good?
 *
 * | Die | Chance of leaving the yard | Average score |
 * | --- | --- | --- |
 * | D2 | 1 in 2 | 25 / 2 = 12.5 |
 * | D6 | 1 in 6 | 25 / 6 ≈ 4.2 |
 * | D20 | 1 in 20 | 25 / 20 = 1.25 |
 *
 * The bot picks the D2, which is exactly what a person does at the start of a game of Ludo. A roll
 * that produces no legal move at all scores 0 and is counted in the average, so "this die usually does
 * nothing" is expressed rather than ignored.
 *
 * ## Cost
 *
 * Three cards in hand, at most twenty faces each, four pawns to evaluate: 240 calls to `evaluatePawn`
 * per turn, on numbers. This runs faster than the animation it is hidden behind, so there is nothing
 * to cache and nothing to be clever about.
 */

import { createModifiers } from "../core/roll.js";
import { expectedMoveScore } from "./roll-odds.js";

/**
 * What a die of `faces` faces is worth on this board: the mean best move over every face it has.
 *
 * The statuses and the traps go in through `boardOf`, so a held pawn or a Rock in the way is already
 * priced in. That matters more than it sounds: a bot that ignored a Hold Pawn would keep choosing the
 * die that suits a pawn it is not allowed to move.
 *
 * **The loop over the faces moved into [roll-odds.js](roll-odds.js) in issue #82** and the numbers did
 * not change: an unmodified die is a flat distribution over 1..faces, so a mean over the faces and a
 * mean weighted by their probabilities are the same sum. What the move buys is that the card values
 * priced against a **modified** roll are computed by the same function as this one, in the same units.
 *
 * `createModifiers()` and not `state.modifiers` on purpose. The dice card is chosen in `choose`, one
 * phase before any Action card can be played, so there is nothing in force yet; asking for the empty
 * set says that plainly instead of relying on it.
 */
export function expectedScore(state, faces) {
  return expectedMoveScore(state, state.activePlayer, faces, createModifiers());
}

/**
 * The die to pick out of `state.hand`.
 *
 * **Ties go to the smaller die.** A smaller die overshoots the house less often (FR-13 wants an exact
 * count), and when a big die is genuinely better the advance term has already said so by scoring it
 * higher. Ties after that go to the card that was drawn first, so the choice is repeatable.
 */
export function chooseDie(state) {
  let best = null;

  for (const faces of state.hand) {
    const score = expectedScore(state, faces);
    if (best === null || score > best.score || (score === best.score && faces < best.faces)) {
      best = { faces, score };
    }
  }

  return best?.faces ?? null;
}
