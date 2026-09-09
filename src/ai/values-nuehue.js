/**
 * What stopping somebody else's card is worth (Nühü). Issue #82, rebuilt by the bot tactics plan's
 * phase 2c.
 *
 * Pure `ai/`, split out of [values-window.js](values-window.js) when the flat number below became four
 * real ones. Same signature and currency as every other value.
 *
 * ## The one value in the project that prices a card from the receiving end
 *
 * Every other value asks "what does this card do for me". Nühü asks "what is that card about to do
 * **to** me", and there is no shortcut: what the card is worth depends entirely on which of the other
 * twenty-eight opened the window.
 *
 * It used to answer that with a flat 8 for anything aimed at me, and 8 was a guess standing in for
 * four completely different cards. A Yeet on a pawn one step out of the yard costs almost nothing; the
 * same Yeet on a pawn six squares from home, standing in front of two enemies, costs a large part of a
 * pawn. A flat number cannot tell those apart, so the bot burned Nühü on the first one and kept it for
 * the second.
 *
 * **Four values and not twenty-nine.** Only four cards in the catalogue can be aimed at me or at a
 * pawn of mine by an opponent: Yeet, Ragebait and Hold Pawn name one of my pawns, and Tax Fraud names
 * me. Every other pawn card is played on the player's own pawns. So the receiving-end table is
 * complete at four entries rather than being a second value table for the whole catalogue, which is
 * what the old comment feared and what stopped it being written.
 *
 * The three cases below the table are unchanged: a buff on the active player's roll is worth a share
 * of the gain it would give them, an area card is worth what my pawns standing in it would cost me,
 * and a trap in my way is worth `TRAP_AHEAD`.
 */

import { YEET_DIE } from "../core/cards/effects/displacement-effects.js";
import { HYPERBEAM_DIE, JANKY_DIE, JANKY_HIT } from "../core/cards/effects/area-effects.js";
import { PUSHBACK_FLOOR, pawnsOnSquare, squareOf } from "../core/displacement.js";
import { withPawnAt } from "../core/pawns.js";
import { neighbourSquares, squareRun } from "../core/path.js";
import { boardOf } from "../state/game-state.js";
import { squareAhead } from "./geometry.js";
import { DEFAULT_PROFILE } from "./profile.js";
import { pawnWorth } from "./score.js";
import { threatOn } from "./threat.js";
import { boardWith, ownOnTrack, pawnAt, rollChange, share, turnValue } from "./values-shared.js";
import { heldStatus } from "./values-window.js";

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

/** The three cards that leave something standing on a square. */
const TRAP_CARDS = Object.freeze([
  "action-banana-peel",
  "action-oil-spill",
  "action-not-that-deep",
]);

/** The mean of a D6, rounded: where a Yeet is likely to leave its victim. */
const YEET_PUSH = Math.round((YEET_DIE + 1) / 2);

/**
 * What a Yeet on one of my pawns costs me: the steps it loses, plus the danger it lands in.
 *
 * The second half is the one a flat number could never say. A pushback is not only a setback, it puts
 * the pawn on a different square with a different set of enemies behind it, and `core/slide.js` stops
 * it at `PUSHBACK_FLOOR` rather than letting it reach the yard. So the pawn is moved on a copy of the
 * list and the same `threatOn * pawnWorth` the move scorer uses is asked twice, before and after.
 *
 * It can come out **negative**, when being shoved backwards happens to move a pawn out of trouble, and
 * then the bot correctly keeps its Nühü. That is worth having: it is a real board and the old flat 8
 * would have spent a card to stay in danger.
 */
function yeetHarm(state, seat, entry) {
  const mine = pawnAt(state, entry.target.pawn);
  if (mine === undefined || squareOf(mine) === null) return 0;

  const landing = Math.max(PUSHBACK_FLOOR, mine.r - YEET_PUSH);
  const after = withPawnAt(state.pawns, mine, landing);
  const pushed = after.find((pawn) => pawn.player === mine.player && pawn.pawn === mine.pawn);
  const board = boardOf(state);

  const danger =
    threatOn(after, pushed, board) * pawnWorth(pushed) -
    threatOn(state.pawns, mine, board) * pawnWorth(mine);

  return mine.r - landing + danger;
}

/**
 * What a Hold Pawn on one of my pawns costs me: `holdPawn`'s own formula with the `share` left off.
 *
 * Left off because this is my own turn being spoiled, not somebody else's, and my own loss counts in
 * full. The status object comes from `values-window.js` so that the two sides of the card cannot drift
 * apart.
 */
function holdHarm(state, seat, entry, profile) {
  const mine = pawnAt(state, entry.target.pawn);
  if (mine === undefined) return 0;

  const before = turnValue(state, state.modifiers, undefined, profile);
  const after = turnValue(
    state,
    state.modifiers,
    boardWith(state, heldStatus(state, mine)),
    profile
  );

  return before - after;
}

/**
 * The four cards an opponent can aim at me, and what each of them actually costs.
 *
 * Ragebait costs a taunt: I am made to walk the wrong pawn, which is what `tauntWorth` prices in
 * `values-attacks.js` from the other side. Tax Fraud costs exactly one card out of my hand.
 */
const HARM_AT_ME = Object.freeze({
  "action-yeet": yeetHarm,
  "reaction-hold-pawn": holdHarm,
  "action-ragebait": (state, seat, entry, profile) => profile.tauntWorth,
  "action-tax-fraud": (state, seat, entry, profile) => profile.cardWorth,
});

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
 * The card that opened this window does not happen (Nühü), in four cases and in this order:
 *
 * 1. **It is aimed at me**, at one of my pawns or at me as a player. Priced by the card, out of
 *    `HARM_AT_ME`, which is complete at four entries. See the module header.
 * 2. **It buffs the active player's roll.** Worth a share of the gain it would have given them, which
 *    is the same `rollChange` the buffs price themselves with, and is 0 when the buff was a bad play.
 * 3. **It is an area card that would hit my pawns.** Worth what those pawns would have cost me.
 * 4. **It lays a trap one to six squares in front of one of my pawns.** Worth `TRAP_AHEAD`.
 *
 * Everything else is worth nothing: an opponent buffing their own defence or drawing cards is not
 * worth a card of mine to stop, and the threshold in `card-choice.js` then keeps the card in hand.
 */
export function nuehue(state, seat, profile = DEFAULT_PROFILE) {
  const entry = state.pendingCard;
  if (entry === null || entry === undefined) return null;

  const target = entry.target ?? {};

  if (target.pawn?.player === seat || target.player === seat) {
    const harm = HARM_AT_ME[entry.cardId];

    return { value: harm === undefined ? 0 : harm(state, seat, entry, profile), target: {} };
  }

  if (ROLL_CARDS.includes(entry.cardId)) {
    return {
      value: Math.max(
        0,
        share(state, state.activePlayer) * rollChange(state, entry.cardId, target, profile)
      ),
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
