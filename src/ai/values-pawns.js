/**
 * What the cards that act on a pawn are worth. Issue #82, requirement FR-43.
 *
 * Pure `ai/`. Same signature as every other value, `(state, seat) => { value, target } | null`, and
 * the same currency: see [values-shared.js](values-shared.js).
 *
 * ## Every one of these seven searches, and that is the difference from the roll cards
 *
 * A roll card has one target or none. These name a pawn, and which pawn is the whole decision: Built
 * Different on a pawn nobody can reach is a wasted card, and on the leading pawn with two opponents
 * behind it, it is worth most of a pawn. So each value walks the seat's own pawns (or one opponent's),
 * prices each, and returns the best.
 *
 * The danger term they lean on is `threatOn` in [threat.js](threat.js), which carries its own reasons
 * for being as crude as it is. What matters here is that it is the **same** term in all seven, so the
 * cards are ranked against each other and not against seven different ideas of danger.
 *
 * ## Two of them are priced by asking the rules where the pawn would end up
 *
 * Aight Imma Head Out's forward option and every displacement in the game go through `core/slide.js`,
 * which stops in front of a boulder, resolves a capture and can set off a trap. So the value calls
 * `slidePawn` on the real board rather than adding four to `r`: on a clear track those are the same
 * number, and in front of a Big Ah Rock they are not, which is exactly when the bot should not spend
 * the card.
 *
 * `slidePawn` is pure and returns a new list, so calling it to look is free and changes nothing.
 */

import { HOME_R, TRACK_LENGTH } from "../core/board.js";
import {
  HEAD_OUT,
  HEAD_OUT_STEPS,
  YEET_DIE,
  COOK_DIE,
} from "../core/cards/effects/displacement-effects.js";
import { squareOf } from "../core/displacement.js";
import { slidePawn } from "../core/slide.js";
import { boardOf } from "../state/game-state.js";
import { SCORE } from "./move-scoring.js";
import { enemiesBehind, friendsBehind, oddsOfHit, pawnWorth, threatOn } from "./threat.js";
import { enemiesOnTrack, opponents, ownOnTrack, pawnAt, share } from "./values-shared.js";

/** A pawn's identity as a card target. */
function ref(pawn) {
  return { player: pawn.player, pawn: pawn.pawn };
}

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

/** How far behind a Rock or a Big Ah Rock still matters. Six squares: one D6 away from walking into it. */
const BLOCK_RANGE = 6;

/** What one pawn being stopped by a blocker is worth. A guess, and the same one for both rock cards. */
const BLOCK_WORTH = 3;

/**
 * Turn one of your own pawns into a wall (Rock).
 *
 * Worth `BLOCK_WORTH` for every opponent pawn close enough behind to run into it, less the same for
 * every one of my own pawns behind it, because a Rock blocks its owner exactly as hard as everybody
 * else. That subtraction is the entire card: a wall in front of my own train of pawns is a card played
 * against myself.
 */
export function rock(state, seat) {
  return best(
    ownOnTrack(state, seat).map((pawn) => {
      const square = squareOf(pawn);
      const enemies = enemiesBehind(state.pawns, square, BLOCK_RANGE, seat).length;
      const friends = friendsBehind(state.pawns, square, BLOCK_RANGE, seat).length;

      return { value: BLOCK_WORTH * (enemies - friends), target: { pawn: ref(pawn) } };
    })
  );
}

/**
 * One of your own pawns cannot be captured (Built Different).
 *
 * The value of insurance: how likely the pawn is to be taken, times what losing it would cost. A pawn
 * on `r = 38` with an opponent six squares behind is worth about six points of protection; the same
 * pawn with a clear track behind it is worth nothing at all, and the bot keeps the card.
 */
export function builtDifferent(state, seat) {
  return best(
    ownOnTrack(state, seat).map((pawn) => ({
      value: threatOn(state.pawns, pawn) * pawnWorth(pawn),
      target: { pawn: ref(pawn) },
    }))
  );
}

/** What standing still for a round costs, in steps. Roughly one average roll of the smaller dice. */
const LOCK_COST = 5;

/**
 * The same protection, and the pawn may not move for a round (Lock In).
 *
 * Built Different's value less what the pawn gives up by sitting out, so the bot reaches for Lock In
 * only when Built Different is not in the hand, which is the right order: the two cards protect the
 * same pawn and one of them also costs a turn of walking.
 */
export function lockIn(state, seat) {
  const insured = builtDifferent(state, seat);

  return insured === null ? null : { ...insured, value: insured.value - LOCK_COST };
}

/** What forcing an opponent to move the wrong pawn is worth, before the `share` rule is applied. */
const TAUNT_WORTH = 3;

/**
 * If a named opponent pawn can move, its owner has to move it (Ragebait).
 *
 * Aimed at the opponent's **rearmost** pawn, and only when they have one further ahead. That is the
 * whole card: forcing a player to walk the pawn that has got least far means the pawn that has got
 * furthest stands still, and `move-scoring.js`'s second tie-break says why that hurts: concentrating
 * on a leading pawn is what gets it home.
 *
 * Worth nothing against a player with one pawn on the board, because then the taunt names the only
 * pawn they were going to move anyway.
 */
export function ragebait(state, seat) {
  return best(
    opponents(state, seat).map((other) => {
      const theirs = state.pawns.filter((pawn) => pawn.player === other && squareOf(pawn) !== null);
      if (theirs.length < 2) return null;

      const rear = theirs.reduce((lowest, pawn) => (pawn.r < lowest.r ? pawn : lowest));

      return { value: TAUNT_WORTH * share(state), target: { pawn: ref(rear) } };
    })
  );
}

/** The mean of a D6, rounded, for pricing where a Yeet is likely to leave its victim. */
const YEET_PUSH = Math.round((YEET_DIE + 1) / 2);

/**
 * Push an opponent's pawn back a D6 (Yeet).
 *
 * Three terms, and the third is the one a careless bot would miss:
 *
 * 1. **The steps the victim loses**, as a share. Capped by how far back it can actually go: the
 *    pushback floor is `r = 1`, so a pawn on `r = 2` loses one step and not three and a half.
 * 2. **The threat it stops being.** A pawn six squares behind mine is a one-in-six chance of losing
 *    that pawn; pushed back, it needs a bigger die to reach the same square, so some of that threat
 *    goes away. Priced as the drop in `oddsOfHit` over the expected push.
 * 3. **The risk of handing them a capture.** A push resolves a capture on the square it lands on, so
 *    one of my own pawns sitting one to six squares behind their pawn can be sent home by my own card.
 *    Each such pawn is a one-in-six chance of losing it outright, and that term is why the bot does
 *    not Yeet an opponent standing just in front of its own leader.
 */
export function yeet(state, seat) {
  return best(
    enemiesOnTrack(state, seat)
      .filter((victim) => victim.r > 1)
      .map((victim) => {
        const square = squareOf(victim);
        const pushed = Math.min(YEET_PUSH, victim.r - 1);

        let value = share(state) * pushed;

        for (const mine of ownOnTrack(state, seat)) {
          const ahead = (squareOf(mine) - square + TRACK_LENGTH) % TRACK_LENGTH;
          if (ahead >= 1 && ahead <= YEET_DIE) {
            value += (oddsOfHit(ahead) - oddsOfHit(ahead + pushed)) * pawnWorth(mine);
          }
        }

        for (const mine of friendsBehind(state.pawns, square, YEET_DIE, seat)) {
          value -= (1 / YEET_DIE) * pawnWorth(mine);
        }

        return { value, target: { pawn: ref(victim) } };
      })
  );
}

/**
 * Four forward, or back to the entry square (Aight Imma Head Out).
 *
 * Both options are priced for every pawn and the better one wins, which is what the card's `CHOICE`
 * target is for. They are two completely different cards sharing a picture:
 *
 * - **Advance** is a small move outside the turn's move: the real steps `core/slide.js` says the pawn
 *   would take, plus a capture if it lands on somebody. A capture is counted in full and not as a
 *   share, because it is the same event `scoreMove` prices at `CAPTURE + r` and the currency has to
 *   mean one thing.
 * - **Retreat** is an escape: it gives up the walk from the entry square to here and buys off the
 *   whole threat against the pawn. Worth playing on a pawn about to be taken a long way round, which
 *   is precisely the situation `displacement-effects.js` says the option exists for.
 */
export function headOut(state, seat) {
  return best(
    ownOnTrack(state, seat).flatMap((pawn) => [
      advanceOption(state, pawn),
      retreatOption(state, pawn),
    ])
  );
}

function advanceOption(state, pawn) {
  const slid = slidePawn(state.pawns, boardOf(state), ref(pawn), HEAD_OUT_STEPS);
  const victim = slid.captured === null ? null : pawnAt(state, slid.captured);

  const capture = victim === null ? 0 : SCORE.CAPTURE + SCORE.CAPTURE_PER_STEP * victim.r;

  return {
    value: slid.to - slid.from + capture,
    target: { pawn: ref(pawn), choice: HEAD_OUT.ADVANCE },
  };
}

/** The threat bought off, less the walk from the entry square that the pawn gives up. */
function retreatOption(state, pawn) {
  if (pawn.r <= 1) return null;

  const relief = threatOn(state.pawns, pawn) * pawnWorth(pawn);

  return {
    value: relief - (pawn.r - 1),
    target: { pawn: ref(pawn), choice: HEAD_OUT.RETREAT },
  };
}

/**
 * Roll a D12 and run (Let Him Cook).
 *
 * The mean over the twelve faces, which is the only honest way to price a gamble: a roll that would
 * take the pawn past the deepest house square sends it back to the yard instead, so the card is worth
 * a lot on a pawn in the middle of the track and is a coin flip on one near home. A pawn on `r = 40`
 * loses everything on nine of the twelve faces, and the mean says so.
 */
export function letHimCook(state, seat) {
  return best(
    ownOnTrack(state, seat).map((pawn) => {
      let total = 0;

      for (let steps = 1; steps <= COOK_DIE; steps += 1) {
        total += pawn.r + steps <= HOME_R ? steps : -pawnWorth(pawn);
      }

      return { value: total / COOK_DIE, target: { pawn: ref(pawn) } };
    })
  );
}
