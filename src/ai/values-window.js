/**
 * What six of the seven Reaction cards are worth. Issue #82, requirement FR-43.
 *
 * Pure `ai/`. Same signature and currency as the Action files: see
 * [values-shared.js](values-shared.js). `seat` is the seat being **asked** and `state.activePlayer` is
 * whoever is being answered, which is the one structural difference from an Action card: a Reaction is
 * always played against somebody else's turn.
 *
 * The seventh card, Nühü, is [values-nuehue.js](values-nuehue.js). It is the only value in the project
 * that has to read another card and price it from the receiving end, it is now four cases long, and
 * this file was at 257 of NFR-02's 300 lines before it grew. Splitting it out was cheaper than
 * squeezing it in, and the seam is honest: six cards answer "what is this moment worth to me" and one
 * answers "what is that card worth to whoever played it".
 *
 * ## Why almost every value here is multiplied by `share`
 *
 * A Reaction card mostly does not help me: it hurts the player whose turn it is. In a duel that is the
 * same thing, and at a four-player table it is a third as good, because the other two opponents get
 * the benefit for free. `share` is that rule and it is why the bot answers a lot in a two-player match
 * and rarely in a four-player one, with nothing card-specific saying so. Since the bot tactics plan's
 * phase 2a it also weights the victim by how far ahead they are, so a Critical Failure lands on the
 * leader's turn rather than on whoever happens to be rolling.
 *
 * The exceptions are Ghost Mode and Uno Reverse, which save **my own** pawn from a capture that has
 * already been declared. That is my gain outright and it is counted in full.
 *
 * ## The window's cards are priced against the roll that has not happened yet
 *
 * Critical Failure, Devil Die and Hold Pawn are played into the `on-roll` window, before the die is
 * rolled. So each is priced as the drop in `expectedMoveScore` for the active player: over the roll's
 * whole distribution for the two debuffs, and over the same distribution with one of their pawns
 * held for the third. That is the same machinery the Action buffs use, with the sign turned round.
 */

import { STATUS } from "../core/statuses.js";
import { DEFAULT_PROFILE } from "./profile.js";
import { SCORE, pawnWorth } from "./score.js";
import { boardWith, pawnAt, rollChange, share, turnValue } from "./values-shared.js";

/** The best of a list of `{ value, target }`, or `null`. First one wins a tie, so it is repeatable. */
function best(candidates) {
  let winner = null;

  for (const candidate of candidates) {
    if (candidate !== null && (winner === null || candidate.value > winner.value)) {
      winner = candidate;
    }
  }

  return winner;
}

/** A debuff on the active player's roll: their loss, as a share of it, weighted by their lead. */
function rollDebuff(cardId) {
  return (state, seat, profile = DEFAULT_PROFILE) => ({
    value: -share(state, state.activePlayer) * rollChange(state, cardId, {}, profile),
    target: {},
  });
}

export const criticalFailure = rollDebuff("reaction-critical-failure");
export const devilDie = rollDebuff("reaction-devil-die");

/**
 * Take one of the active player's pawns out of this turn's move choice (Hold Pawn).
 *
 * Priced by asking `evaluateTurn` the same question twice: what is their turn worth, and what is it
 * worth with a `held` status on this pawn. The difference is the whole card, and it produces exactly
 * the behaviour a person would play: holding a pawn matters when it is the only one that can use the
 * roll, and is worth nothing when the player has three others in the same position.
 *
 * The status is built here rather than by calling the effect, because the effect writes into a
 * context's status list and what is needed is a **board** to evaluate against. `boardWith` builds it
 * through `addStatus`, so the shape cannot drift from the real one.
 */
export function holdPawn(state, seat, profile = DEFAULT_PROFILE) {
  const before = turnValue(state, state.modifiers, undefined, profile);

  return best(
    state.pawns
      .filter((pawn) => pawn.player === state.activePlayer)
      .map((pawn) => {
        const held = heldStatus(state, pawn);
        const after = turnValue(state, state.modifiers, boardWith(state, held), profile);

        return {
          value: share(state, state.activePlayer) * (before - after),
          target: { pawn: { player: pawn.player, pawn: pawn.pawn } },
        };
      })
  );
}

/**
 * The `held` status Hold Pawn would write, as a board effect rather than as a context patch.
 *
 * Exported because [values-nuehue.js](values-nuehue.js) needs the identical object to price a Hold
 * Pawn **aimed at one of its own pawns**: the harm of the card is the same arithmetic seen from the
 * other side, and two copies of a status shape is exactly the drift this project keeps warning about.
 */
export function heldStatus(state, pawn) {
  return {
    kind: STATUS.HELD,
    player: pawn.player,
    pawn: pawn.pawn,
    until: state.turnNumber + 1,
    source: "reaction-hold-pawn",
  };
}

/** The pawn of `seat` that the declared move is about to capture, or `null`. */
function victimOf(state, seat) {
  const move = state.pendingMove;
  if (move === null || move === undefined || move.captures === null) return null;
  if (move.captures.player !== seat) return null;

  return pawnAt(state, move.captures) ?? null;
}

/**
 * The capture about to happen does not happen (Ghost Mode).
 *
 * Worth the whole pawn, in full and not as a share, because the pawn is mine. `null` when the declared
 * capture is not against me: the card would still cancel the move, but cancelling a capture between
 * two opponents mostly helps the one about to be captured, and spending a card to help somebody else
 * is not a play.
 */
export function ghostMode(state, seat) {
  const victim = victimOf(state, seat);

  return victim === null ? null : { value: pawnWorth(victim), target: {} };
}

/**
 * The capture happens to the attacker instead (Uno Reverse).
 *
 * Ghost Mode plus a share of the attacker's own pawn going home, which is why the bot prefers it when
 * it holds both. Unlike Ghost Mode it is worth something even when the pawn about to be captured is
 * not mine, because the attacker is sent home either way.
 *
 * **One term is deliberately left out:** cancelling a capture between two opponents also saves the
 * pawn of whoever was about to be captured, which is worth a little against me. It is smaller than
 * the attacker's loss in every position and adding it would make the value read as an argument about
 * three players at once.
 */
export function unoReverse(state, seat) {
  const move = state.pendingMove;
  if (move === null || move === undefined || move.captures === null) return null;

  const victim = victimOf(state, seat);
  const saved = victim === null ? 0 : pawnWorth(victim);
  const attacker = move.from + SCORE.LEAVE_START;

  return { value: saved + share(state, move.player) * attacker, target: {} };
}

/**
 * For one round every landing captures, own pawns included (The Purge). The bot never plays it.
 *
 * **A deliberate negative finding, like Oil Spill.** The card suspends the rule that an own pawn
 * blocks, board-wide and for everybody, for a round. There is no one-step reading of that: it makes
 * every player's pawns capturable by every other player, including the pawns of whoever played it, and
 * whether it is good depends on four seats' worth of positions at once.
 *
 * A value for it would be the largest single piece of reasoning in `ai/` and it would be a guess.
 * Recorded in `notes/06` rather than half-built, and the card stays in the hand.
 */
export function thePurge() {
  return null;
}
