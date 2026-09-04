/**
 * What the seven Reaction cards are worth. Issue #82, requirement FR-43.
 *
 * Pure `ai/`. Same signature and currency as the three Action files: see
 * [values-shared.js](values-shared.js). `seat` is the seat being **asked** and `state.activePlayer` is
 * whoever is being answered, which is the one structural difference from an Action card: a Reaction is
 * always played against somebody else's turn, and `eligible` never contains the actor.
 *
 * ## Why almost every value here is multiplied by `share`
 *
 * A Reaction card mostly does not help me: it hurts the player whose turn it is. In a duel that is the
 * same thing, and at a four-player table it is a third as good, because the other two opponents get
 * the benefit for free. `share` is that rule and it is why the bot answers a lot in a two-player match
 * and rarely in a four-player one, with nothing card-specific saying so.
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
import { pawnsOnSquare, squareOf } from "../core/displacement.js";
import { HYPERBEAM_DIE, JANKY_DIE, JANKY_HIT } from "../core/cards/effects/area-effects.js";
import { neighbourSquares, squareRun } from "../core/path.js";
import { SCORE } from "./move-scoring.js";
import { pawnWorth, squareAhead } from "./threat.js";
import { boardWith, ownOnTrack, pawnAt, rollChange, share, turnValue } from "./values-shared.js";

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

/** A debuff on the active player's roll: their loss, as a share of it. */
function rollDebuff(cardId) {
  return (state) => ({ value: -share(state) * rollChange(state, cardId), target: {} });
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
export function holdPawn(state) {
  const before = turnValue(state);

  return best(
    state.pawns
      .filter((pawn) => pawn.player === state.activePlayer)
      .map((pawn) => {
        const held = {
          kind: STATUS.HELD,
          player: pawn.player,
          pawn: pawn.pawn,
          until: state.turnNumber + 1,
          source: "reaction-hold-pawn",
        };
        const after = turnValue(state, state.modifiers, boardWith(state, held));

        return {
          value: share(state) * (before - after),
          target: { pawn: { player: pawn.player, pawn: pawn.pawn } },
        };
      })
  );
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

  return { value: saved + share(state) * attacker, target: {} };
}

/** What a card aimed straight at me or at one of my pawns is worth stopping. */
const AIMED_AT_ME = 8;

/** What a trap laid in front of one of my pawns is worth stopping. */
const TRAP_AHEAD = 5;

/** How far in front of my own pawn a trap is still a problem. One D6. */
const TRAP_RANGE = 6;

/** The cards whose whole effect is a roll modifier, which `rollChange` can price directly. */
const ROLL_CARDS = Object.freeze([
  "action-critical-success",
  "action-angel-die",
  "action-speedrun",
  "action-sixty-seven",
  "action-fr-fr",
]);

/** The four cards that leave something standing on a square. */
const TRAP_CARDS = Object.freeze([
  "action-banana-peel",
  "action-oil-spill",
  "action-not-that-deep",
  "action-big-ah-rock",
]);

/** What my own pawns standing on `square` would lose if everything there were sent home. */
function harmOnSquare(state, seat, square) {
  return pawnsOnSquare(state.pawns, square)
    .filter((pawn) => pawn.player === seat)
    .reduce((total, pawn) => total + pawnWorth(pawn), 0);
}

/** What the two area cards would cost me, weighted by the dice they roll. */
function areaHarm(state, seat, entry) {
  if (entry.cardId === "action-janky-rpg") {
    const onTarget = (JANKY_DIE - JANKY_HIT + 1) / JANKY_DIE;
    const wide = neighbourSquares(entry.target.square).reduce(
      (total, side) => total + harmOnSquare(state, seat, side),
      0
    );

    return onTarget * harmOnSquare(state, seat, entry.target.square) + (1 - onTarget) * wide;
  }

  const shooter = pawnAt(state, entry.target.pawn);
  if (shooter === undefined || squareOf(shooter) === null) return 0;

  return squareRun(squareOf(shooter), entry.target.direction, HYPERBEAM_DIE).reduce(
    (total, square, index) =>
      total + ((HYPERBEAM_DIE - index) / HYPERBEAM_DIE) * harmOnSquare(state, seat, square),
    0
  );
}

/** Is one of my pawns about to walk onto the square this trap is being laid on? */
function trapInMyWay(state, seat, square) {
  return ownOnTrack(state, seat).some((pawn) =>
    Array.from({ length: TRAP_RANGE }, (_, step) => squareAhead(pawn, step + 1)).includes(square)
  );
}

/**
 * The card that opened this window does not happen (Nühü).
 *
 * The only value in the project that has to read **another card** and price it, and it does that in
 * four cases, in order:
 *
 * 1. **It is aimed at me**, at one of my pawns or at me as a player (Yeet, Ragebait, Tax Fraud, Hold
 *    Pawn). Worth `AIMED_AT_ME`, a flat number rather than the card's own value, because pricing
 *    every one of the 29 cards from the receiving end is a second value table.
 * 2. **It buffs the active player's roll.** Worth a share of the gain it would have given them, which
 *    is the same `rollChange` the buffs price themselves with, and is 0 when the buff was a bad play.
 * 3. **It is an area card that would hit my pawns.** Worth what those pawns would have cost me.
 * 4. **It lays a trap one to six squares in front of one of my pawns.** Worth `TRAP_AHEAD`.
 *
 * Everything else is worth nothing: an opponent buffing their own defence or drawing cards is not
 * worth a card of mine to stop, and the threshold in `card-choice.js` then keeps the card in hand.
 */
export function nuehue(state, seat) {
  const entry = state.pendingCard;
  if (entry === null || entry === undefined) return null;

  const target = entry.target ?? {};

  if (target.pawn?.player === seat || target.player === seat) {
    return { value: AIMED_AT_ME, target: {} };
  }

  if (ROLL_CARDS.includes(entry.cardId)) {
    return {
      value: Math.max(0, share(state) * rollChange(state, entry.cardId, target)),
      target: {},
    };
  }

  if (entry.cardId === "action-janky-rpg" || entry.cardId === "action-hyperbeam") {
    return { value: areaHarm(state, seat, entry), target: {} };
  }

  if (TRAP_CARDS.includes(entry.cardId) && trapInMyWay(state, seat, target.square)) {
    return { value: TRAP_AHEAD, target: {} };
  }

  return { value: 0, target: {} };
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
