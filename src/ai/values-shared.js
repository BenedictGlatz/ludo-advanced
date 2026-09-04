/**
 * The vocabulary the four card-value files share. Issue #82, requirement FR-43.
 *
 * Pure `ai/`. It holds no card's value: it holds the words the values are written in.
 *
 * ## Why this file exists, since the plan did not name it
 *
 * Twenty-nine card values in one file would be well past NFR-02's 300 lines, so they are split by
 * mechanic (`values-roll.js`, `values-pawns.js`, `values-squares.js`, `values-window.js`) the same way
 * `core/cards/effects/` is. Four of the terms below are used by three of those four files, and three
 * copies of "damage to one opponent counts as a share of my own gain" is three chances to write it
 * differently. So the terms are here and the values are there.
 *
 * ## The four decisions this file is made of
 *
 * **One currency.** Every value is in the units of `SCORE` in [move-scoring.js](move-scoring.js):
 * 1 is one step, leaving the yard is 25, a capture is 60 plus the victim's progress, finishing is 100.
 * That is what makes "Angel Die on a D6" and "Yeet the leader" comparable at all, and it means the
 * bot-against-bot test stays the scoreboard for tuning either of them.
 *
 * **Damage to an opponent counts as a share.** `share(state)` is `1 / (seats - 1)`. Two players at the
 * table and their loss is my gain outright; four players and it is a third, because the other two
 * benefit from it as much as I do. One line, and it makes reaction cards sharp in a duel and rare in a
 * crowd with no card needing a special case.
 *
 * **A card is asked its own rule.** The roll cards are priced by calling the real effect out of
 * `core/cards/effects/` and reading the modifiers back, never by a copy of the card's arithmetic. The
 * effects that only write `modifiers` are pure and draw nothing from the RNG, which is what makes that
 * possible; the ones that move pawns are priced by their own file instead.
 *
 * **A pawn is worth its walk plus its way out of the yard.** `pawnWorth` in [threat.js](threat.js).
 */

import { createContext } from "../core/cards/context.js";
import { effectFor } from "../core/cards/effects/index.js";
import { pawnsOnSquare } from "../core/displacement.js";
import { addStatus } from "../core/statuses.js";
import { boardOf } from "../state/game-state.js";
import { expectedMoveScore } from "./roll-odds.js";
import { onTrack, pawnWorth } from "./threat.js";

/**
 * How much a card has to be worth before the bot plays it rather than keeping it.
 *
 * Four points is a little under a fifth of getting a pawn out of the yard, and the reasoning is that a
 * card in hand is worth something: it can be played on a better board next turn, and the budget is one
 * card per turn, so a cheap play spends the only slot the turn has. Below the threshold the bot passes.
 *
 * **A guess, not a measurement.** It is one number, in one place, and the bot-against-bot match is how
 * a later change to it is judged.
 */
export const PLAY_AT = 4;

/**
 * The threshold when the hand is full (`SKILL_HAND_LIMIT`, five).
 *
 * A full hand throws the next draw away: `drawSkillCard` refuses and the card stays in the pool. So
 * holding on has stopped being worth anything, and anything at all beats losing a card a turn.
 */
export const PLAY_AT_FULL_HAND = 1;

/**
 * What one skill card in hand is worth, for the three cards that trade in cards rather than in steps.
 *
 * Three points, which is a little under `PLAY_AT`: a card is worth having and not worth spending a
 * whole turn's budget on by itself. Pot of Greed drawing two is therefore worth 6 and plays; Tax Fraud
 * takes one and costs the victim one, which is where `share` comes in.
 */
export const CARD_WORTH = 3;

/** How much of an opponent's loss counts as my gain. See the module header. */
export function share(state) {
  return 1 / Math.max(1, state.seats.length - 1);
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
 */
export function turnValue(state, modifiers = state.modifiers, board = boardOf(state)) {
  if (!hasDie(state)) return 0;

  return expectedMoveScore(state, state.activePlayer, state.chosenDie, modifiers, board);
}

/** How much a roll card changes the active player's turn, in steps. Negative for a debuff. */
export function rollChange(state, cardId, target = {}) {
  if (!hasDie(state)) return 0;

  return turnValue(state, modifiersAfter(state, cardId, target)) - turnValue(state);
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
 */
export function squareSwing(state, seat, square) {
  let total = 0;

  for (const pawn of pawnsOnSquare(state.pawns, square)) {
    total += pawn.player === seat ? -pawnWorth(pawn) : share(state) * pawnWorth(pawn);
  }

  return total;
}
