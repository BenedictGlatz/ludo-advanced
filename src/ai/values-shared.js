/**
 * The vocabulary the card-value files share. Issue #82, requirement FR-43.
 *
 * Pure `ai/`. It holds no card's value: it holds the words the values are written in.
 *
 * ## Why this file exists, since the plan did not name it
 *
 * Twenty-nine card values in one file would be well past NFR-02's 300 lines, so they are split by
 * mechanic the same way `core/cards/effects/` is: `values-roll.js` for the roll, `values-pawns.js` for
 * your own pawns, `values-attacks.js` for somebody else's, `values-squares.js` for a square,
 * `values-window.js` for the reactions and `values-nuehue.js` for the one that prices another card.
 * Most of the terms below are used by most of them, and three copies of "damage to one opponent counts
 * as a share of my own gain" is three chances to write it differently. So the terms are here and the
 * values are there.
 *
 * ## The four decisions this file is made of
 *
 * **One currency.** Every value is in the units of `SCORE` in [score.js](score.js): 1 is one step,
 * leaving the yard is 25, a capture is 60 plus the victim's progress, finishing is 100. That is what
 * makes "Angel Die on a D6" and "Yeet the leader" comparable at all, and it means `npm run bots:arena`
 * stays the scoreboard for tuning either of them.
 *
 * **Damage to an opponent counts as a share.** `share` is `1 / (seats - 1)`, weighted by how far
 * ahead the victim is. Two players at the table and their loss is my gain outright; four players and
 * it is a third, because the other two benefit from it as much as I do. See `share` for the lead
 * weighting, which is the bot tactics plan's phase 2a.
 *
 * **A card is asked its own rule.** The roll cards are priced by calling the real effect out of
 * `core/cards/effects/` and reading the modifiers back, never by a copy of the card's arithmetic. The
 * effects that only write `modifiers` are pure and draw nothing from the RNG, which is what makes that
 * possible; the ones that move pawns are priced by their own file instead.
 *
 * **A pawn is worth its walk plus its way out of the yard.** `pawnWorth` in [score.js](score.js).
 */

import { createContext } from "../core/cards/context.js";
import { effectFor } from "../core/cards/effects/index.js";
import { pawnsOnSquare } from "../core/displacement.js";
import { addStatus } from "../core/statuses.js";
import { boardOf } from "../state/game-state.js";
import { onTrack } from "./geometry.js";
import { DEFAULT_PROFILE } from "./profile.js";
import { expectedMoveScore } from "./roll-odds.js";
import { pawnWorth } from "./score.js";

/**
 * How far outside its yard a seat's four pawns have got, in steps.
 *
 * The plainest measure of "who is winning" there is, and the one the lead weighting needs: it is the
 * same `r` the whole layer is priced in, so a seat with a pawn home and three out is ahead of a seat
 * with four halfway, which is exactly right.
 */
export function seatSteps(state, seat) {
  return state.pawns
    .filter((pawn) => pawn.player === seat)
    .reduce((total, pawn) => total + pawn.r, 0);
}

/**
 * How far the lead weighting is allowed to swing a card's value.
 *
 * Between half and double. Without a cap a seat two turns from winning while everybody else is still
 * in the yard would be worth four times a normal target at a four-player table, and a reaction card
 * priced at four times its worth starts beating moves it has no business beating. With the cap the
 * ranking among the opponents is kept, which is the whole point, and the size of a card stays the
 * size of a card.
 */
const LEAD_SWING = Object.freeze({ min: 0.5, max: 2 });

/**
 * How much of an opponent's loss counts as my gain.
 *
 * `1 / (seats - 1)` as it always was, times how far ahead the victim is compared with the table
 * average. **Gang up on the leader**, which is the standard multiplayer tactic and which the bot did
 * not do at all: hurting the player about to win was worth exactly as much as hurting the player who
 * had not left the yard.
 *
 * The comparison is against every seat's average and not against the other opponents', because the
 * asking seat's own progress is part of "who is ahead" and leaving it out would make a bot in the lead
 * treat a distant second as the runaway. It also means `share` needs no third argument.
 *
 * `opponent` may be left out, and then the plain share comes back. Two callers genuinely have no one
 * victim: a card that hits a whole square prices each pawn on it separately, and the value that asks
 * "what would a card cost me on average" has nobody in mind.
 */
export function share(state, opponent = null) {
  const base = 1 / Math.max(1, state.seats.length - 1);
  if (opponent === null) return base;

  const total = state.seats.reduce((sum, seat) => sum + seatSteps(state, seat), 0);
  if (total <= 0) return base;

  const average = total / state.seats.length;
  const lead = seatSteps(state, opponent) / average;

  return base * Math.min(LEAD_SWING.max, Math.max(LEAD_SWING.min, lead));
}

/** Every seat but this one. */
export function opponents(state, seat) {
  return state.seats.filter((other) => other !== seat);
}

/**
 * How many cards a seat holds.
 *
 * **Public information since D33**, which is what makes it fair for a bot to read: the count is on
 * screen in the HUD for every seat, and only the cards themselves are secret. A bot that read
 * `state.skillHands[opponent]` would be cheating, and `card-choice.js` carries the test that proves it
 * does not.
 */
export function handSize(state, seat) {
  return (state.skillHands[seat] ?? []).length;
}

/** This seat's pawns that are out on the shared track, in pawn order. */
export function ownOnTrack(state, seat) {
  return state.pawns.filter((pawn) => pawn.player === seat && onTrack(pawn));
}

/** Every other seat's pawns that are out on the shared track. */
export function enemiesOnTrack(state, seat) {
  return state.pawns.filter((pawn) => pawn.player !== seat && onTrack(pawn));
}

/** The pawn `ref` names, or `undefined`. `findPawn` throws, and a value may not. */
export function pawnAt(state, ref) {
  return state.pawns.find((pawn) => pawn.player === ref.player && pawn.pawn === ref.pawn);
}

/**
 * The turn's modifiers with one card's rule applied, by running the card's real effect.
 *
 * Only ever called for the seven cards whose whole effect is `{ modifiers }`. They take nothing from
 * the context except `modifiers`, `chosenDie` and the target, and they draw no random numbers, so
 * running one to find out what it would do is free and cannot drift from what the card does when it is
 * really played.
 */
export function modifiersAfter(state, cardId, target = {}) {
  const patch = effectFor(cardId)(
    createContext({ modifiers: state.modifiers, chosenDie: state.chosenDie, target })
  );

  return patch.modifiers ?? state.modifiers;
}

/** Is there a die to price a roll card against yet? Nothing in `action` should ever say no. */
export function hasDie(state) {
  return Number.isInteger(state.chosenDie) && state.chosenDie >= 2;
}

/**
 * What the **active player's** turn is worth right now, or with a different board.
 *
 * The active player and not the asking seat, because every card that touches the roll touches the roll
 * of the turn it is played in: the four buffs are played by the active player on their own roll, and
 * the two debuffs are played by an opponent on that same roll. One function answers both, and the sign
 * is the caller's business.
 *
 * The `profile` is the **active player's** turn being priced, so it is the asking seat's own profile
 * that is threaded through: a cautious bot judging an opponent's turn judges it the way it would judge
 * its own. Modelling each opponent's temperament separately is a second bot inside the bot and there
 * is nothing on screen a person could read it off.
 */
export function turnValue(
  state,
  modifiers = state.modifiers,
  board = boardOf(state),
  profile = DEFAULT_PROFILE
) {
  if (!hasDie(state)) return 0;

  return expectedMoveScore(state, state.activePlayer, state.chosenDie, modifiers, board, profile);
}

/** How much a roll card changes the active player's turn, in steps. Negative for a debuff. */
export function rollChange(state, cardId, target = {}, profile = DEFAULT_PROFILE) {
  if (!hasDie(state)) return 0;

  return (
    turnValue(state, modifiersAfter(state, cardId, target), boardOf(state), profile) -
    turnValue(state, state.modifiers, boardOf(state), profile)
  );
}

/** The board with one more status on it. How a card that changes the board rather than the roll is priced. */
export function boardWith(state, status) {
  return { statuses: addStatus(state.statuses, status), traps: state.traps };
}

/**
 * What it is worth to `seat` if everything standing on `square` were sent home.
 *
 * The one term the two area cards and Nühü all need: an opponent's pawn counts as `share` of its
 * worth, one of my own counts as its whole worth against me. Friendly fire is priced, because both
 * area cards have it and a bot that ignored it would Hyperbeam its own leading pawn.
 *
 * Each pawn is shared against **its own owner**, so a beam that sweeps the leader and the last-placed
 * player prices the two of them differently, which is what the lead weighting is for.
 */
export function squareSwing(state, seat, square) {
  let total = 0;

  for (const pawn of pawnsOnSquare(state.pawns, square)) {
    total += pawn.player === seat ? -pawnWorth(pawn) : share(state, pawn.player) * pawnWorth(pawn);
  }

  return total;
}
