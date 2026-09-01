/**
 * Where skill cards enter and leave a turn. Issue #38, requirements FR-22, FR-23 and FR-27.
 *
 * Imports `core/`, never `ui/` (NFR-01). Holds no rules: every question is asked of `core/` and the
 * answer is written into a changes object for `nextState`.
 *
 * ## Why this is a file and not four more functions in `turn-manager.js`
 *
 * The turn manager was at 227 of its 300 lines before skill cards existed, and the three things below
 * are all bookkeeping around the edges of a turn rather than steps of it:
 *
 * - the pool being shuffled once, at the start of the match
 * - a card being drawn at the start of every turn, and another when a pawn lands on a skill square
 * - the card budget: how many cards a seat may still play this turn
 *
 * None of them is a phase, none of them is something the player triggers, and all of them are called
 * from inside a step rather than being one. Keeping them here leaves `turn-manager.js` a readable list
 * of nine steps, which is the only reason that file is worth reading.
 *
 * ## Every function returns a changes object, never a state
 *
 * `{ skillPool, skillDiscard, skillHands }` and nothing else, ready to spread into `nextState`. The
 * caller decides what else changes in the same transition, so a turn start that both expires statuses
 * and draws a card is one new state object rather than three.
 */

import { fireTrap } from "../core/cards/effects/trap-effects.js";
import { squaresCrossed } from "../core/path.js";
import { createSkillPool, drawSkillCard } from "../core/skill-pool.js";
import { consumeSkillSquare, skillSquareLandedOn } from "../core/skill-squares.js";
import { STATUS, expireStatuses, hasStatus } from "../core/statuses.js";
import { firstTrapOnPath } from "../core/traps.js";

/** How many cards a seat may play in one turn unless a card says otherwise (FR-23). */
export const DEFAULT_CARD_BUDGET = 1;

/**
 * The shuffled pool a match starts with.
 *
 * Called by `match.js` rather than by `createGameState`, because a shuffle needs the injected RNG and
 * keeping `createGameState` free of randomness is what lets half the unit tests build a board with no
 * `deps` at all.
 *
 * `cards` overrides the pool, and `match.js` carries the reason: a test that scripts an exact sequence
 * of rolls cannot survive the 57 RNG draws that shuffling 58 cards spends. Nothing in production passes
 * it.
 */
export function seedSkillCards(state, deps, cards) {
  return { skillPool: cards === undefined ? createSkillPool(deps.rng) : [...cards] };
}

/**
 * Steps 1 and 2 of the turn: statuses expire, then the active player draws a card.
 *
 * **Expiry runs before the draw and before anything else reads a status.** A status added on turn 14
 * with a deadline of 16 is in force on 14 and 15 and gone on 16, and doing the filter at the start of
 * the turn is what makes that true no matter what order the turn does things in.
 *
 * The draw can come back empty, when the hand is already at its limit of five. That is a normal
 * situation and not a failure: `drawSkillCard` refuses and the card stays in the pool, which is the
 * decision recorded in `core/skill-pool.js`.
 */
export function turnStartChanges(state, deps) {
  return {
    statuses: expireStatuses(state.statuses, state.turnNumber),
    ...drawFor(state, state.activePlayer, deps),
  };
}

/**
 * One card drawn into one seat's hand, as a changes object.
 *
 * Takes the seat rather than assuming the active player, because a skill square pays out to whoever
 * owns the pawn that landed on it, and in the middle of a capture that is not always the mover. It is
 * always the mover today; the parameter is there so that stays visible rather than assumed.
 */
export function drawFor(state, seat, deps) {
  const hand = state.skillHands[seat] ?? [];
  const result = drawSkillCard(state.skillPool, state.skillDiscard, hand, deps.rng);

  return {
    skillPool: result.pool,
    skillDiscard: result.discard,
    skillHands: { ...state.skillHands, [seat]: result.hand },
  };
}

/**
 * The skill-square part of resolving a move: nothing, or the square used up, moved, and a card drawn.
 *
 * Reads the move rather than searching the new pawn list, because `move.player` and `move.to` already
 * say which pawn ended where.
 *
 * Three things fall out of the board's own shape and need no rule of their own:
 *
 * - **A captured pawn cannot trigger this.** It goes back to its start area, which is not a track
 *   square, so `skillSquareLandedOn` answers `null` for it.
 * - **Crossing a skill square does nothing.** Only `move.to` is looked at (FR-22).
 * - **A house square is never a skill square**, for the same reason as the start area.
 *
 * The one real rule here is Oil Spill's: a pawn that slid rather than walked skips the square it lands
 * on. Without that, a card whose whole point is speed would also be the best way to farm cards.
 */
export function skillSquareChanges(state, move, deps) {
  const landedOn = skillSquareLandedOn(state.skillSquares, { player: move.player, r: move.to });
  if (landedOn === null) return {};

  if (hasStatus(state.statuses, STATUS.SLIPPERY, { player: move.player, pawn: move.pawn })) {
    return {};
  }

  return {
    skillSquares: consumeSkillSquare(state.skillSquares, landedOn, deps.rng),
    ...drawFor(state, move.player, deps),
  };
}

/**
 * The trap part of resolving a move: nothing, or one trap going off under the pawn that walked into it.
 *
 * `state` here must already have the **moved** pawn list in it, because a trap acts on where the pawn
 * ended up and `displace` looks the pawn up by identity. `turn-manager.js` passes the post-move state
 * for exactly that reason.
 *
 * **The whole walk is checked, not just the destination.** That is the one exception to the rule the rest
 * of the project follows, and `core/cards/effects/trap-effects.js` carries the reason: a trap that only
 * fired on an exact landing would almost never fire, because a D20 crosses twenty squares and lands on
 * one. The skill squares work the other way round, on landing only, and that difference is deliberate.
 *
 * Only the **first** trap on the path fires. A move that crosses two Banana Peels sets off the near one
 * and stops there, which keeps one move from having two outcomes.
 */
export function trapChanges(state, move, deps) {
  if (state.traps.length === 0) return {};

  const crossed = squaresCrossed(move.player, move.from, move.to);
  const trap = firstTrapOnPath(state.traps, crossed, move);
  if (trap === null) return {};

  return fireTrap({
    pawns: state.pawns,
    statuses: state.statuses,
    traps: state.traps,
    trap,
    mover: { player: move.player, pawn: move.pawn },
    turnNumber: state.turnNumber,
    rng: deps.rng,
  });
}

/** How many cards `seat` may play this turn: one, unless a card has raised it (Double Dip). */
export function cardBudget(state, seat) {
  return state.cardBudget[seat] ?? DEFAULT_CARD_BUDGET;
}

/** How many `seat` has already played this turn. */
export function cardsPlayedBy(state, seat) {
  return state.cardsPlayed[seat] ?? 0;
}

/**
 * May `seat` still play a card this turn (FR-23)?
 *
 * The budget is per seat and per **turn**, not per window. The game design document said per window,
 * and the Product Owner overrode it: per window means a player with a full hand can answer every
 * single thing that happens in one turn, and the reaction window would never close.
 */
export function canPlayCard(state, seat) {
  return cardsPlayedBy(state, seat) < cardBudget(state, seat);
}

/** One card of the budget spent, as a changes object. */
export function spendCard(state, seat) {
  return { cardsPlayed: { ...state.cardsPlayed, [seat]: cardsPlayedBy(state, seat) + 1 } };
}
