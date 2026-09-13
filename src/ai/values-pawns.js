/**
 * What the cards you play on **your own** pawns are worth. Issue #82, requirement FR-43.
 *
 * Pure `ai/`. Same signature as every other value, `(state, seat, profile) => { value, target } | null`,
 * and the same currency: see [values-shared.js](values-shared.js).
 *
 * ## Own pawns here, opponents' pawns next door
 *
 * The file used to hold all seven pawn cards and was at 290 of NFR-02's 300 lines, so the bot tactics
 * plan split it before adding anything. The seam is the one the old header already named without
 * using it: **defensive against offensive**. Six cards below buy something for a pawn of mine, and the
 * two in [values-attacks.js](values-attacks.js) take something off somebody else's. The two halves
 * ask different questions (which of my four is worth protecting, against which opponent is worth
 * hitting) and share only the vocabulary in `values-shared.js`.
 *
 * ## Every one of these searches, and that is the difference from the roll cards
 *
 * A roll card has one target or none. These name a pawn, and which pawn is the whole decision: Built
 * Different on a pawn nobody can reach is a wasted card, and on the leading pawn with two opponents
 * behind it, it is worth most of a pawn. So each value walks the seat's own pawns, prices each, and
 * returns the best.
 *
 * The danger term they lean on is `threatOn` in [threat.js](threat.js). What matters here is that it
 * is the **same** term in all of them, and the same one `move-scoring.js` prices a move with, so the
 * cards are ranked against each other and against moves rather than against several ideas of danger.
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

import { HOME_R } from "../core/board.js";
import { HEAD_OUT, HEAD_OUT_STEPS, COOK_DIE } from "../core/cards/effects/displacement-effects.js";
import { KNOCKBACK } from "../core/cards/effects/status-effects.js";
import { squareOf } from "../core/displacement.js";
import { slidePawn } from "../core/slide.js";
import { boardOf } from "../state/game-state.js";
import { enemiesBehind, friendsBehind } from "./geometry.js";
import { DEFAULT_PROFILE } from "./profile.js";
import { SCORE, pawnWorth } from "./score.js";
import { threatOn } from "./threat.js";
import { ownOnTrack, pawnAt, share } from "./values-shared.js";

/** A pawn's identity as a card target. */
export function ref(pawn) {
  return { player: pawn.player, pawn: pawn.pawn };
}

/** The best of a list of `{ value, target }`, or `null`. First one wins a tie, so it is repeatable. */
export function best(candidates) {
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

/**
 * What a wall on one of my pawns is worth: the enemies it stops, less my own pawns it stops, less the
 * pawn's own standstill.
 *
 * Shared by Rock and Big Ah Rock. The subtraction of friends is the card's whole character: a Rock
 * blocks its owner exactly as hard as everybody else. **The standstill is new in issue #90**, when a
 * petrified pawn stopped being movable by its owner: the same `lockCost` Lock In pays, because it is
 * the same fact, one pawn sitting out a round of walking.
 */
function wallValue(state, seat, pawn, profile) {
  const square = squareOf(pawn);
  const enemies = enemiesBehind(state.pawns, square, BLOCK_RANGE, seat).length;
  const friends = friendsBehind(state.pawns, square, BLOCK_RANGE, seat).length;

  return profile.blockWorth * (enemies - friends) - profile.lockCost;
}

/**
 * Turn one of your own pawns into a wall (Rock).
 *
 * Worth `blockWorth` for every opponent pawn close enough behind to run into it, less the same for
 * every one of my own pawns behind it, less what the pawn gives up by standing still. A wall in front
 * of my own train of pawns is a card played against myself.
 */
export function rock(state, seat, profile = DEFAULT_PROFILE) {
  return best(
    ownOnTrack(state, seat).map((pawn) => ({
      value: wallValue(state, seat, pawn, profile),
      target: { pawn: ref(pawn) },
    }))
  );
}

/**
 * The same wall for a round longer, and the nearest enemy behind it knocked back three (Big Ah Rock).
 *
 * Priced as Rock plus the knockback, taken as a share of that enemy's own loss, when there is one
 * within `BLOCK_RANGE` behind the pawn to knock. The rules push the nearest enemy anywhere round the
 * ring, and a pawn thirty squares behind is still pushed three; it is simply not worth spending the
 * card on, which is what the range says. Issue #90 moved this here from `values-squares.js`.
 */
export function bigAhRock(state, seat, profile = DEFAULT_PROFILE) {
  return best(
    ownOnTrack(state, seat).map((pawn) => {
      const [nearest] = enemiesBehind(state.pawns, squareOf(pawn), BLOCK_RANGE, seat);
      const knock = nearest === undefined ? 0 : share(state, nearest.player) * KNOCKBACK;

      return {
        value: wallValue(state, seat, pawn, profile) + knock,
        target: { pawn: ref(pawn) },
      };
    })
  );
}

/**
 * One of your own pawns cannot be captured (Built Different).
 *
 * The value of insurance: how likely the pawn is to be taken, times what losing it would cost. A pawn
 * on `r = 38` with an opponent six squares behind is worth about six points of protection; the same
 * pawn with a clear track behind it is worth nothing at all, and the bot keeps the card.
 *
 * **This is not double counting against the move scorer's risk term**, and the difference is worth
 * naming because the two look alike: the card buys safety for a pawn that **stays where it is**, and
 * the move term prices where a pawn would **go**. On a threatened leading pawn with nowhere safe to
 * walk, the card wins, and that is the case the test file pins.
 */
export function builtDifferent(state, seat) {
  return best(
    ownOnTrack(state, seat).map((pawn) => ({
      value: threatOn(state.pawns, pawn, boardOf(state)) * pawnWorth(pawn),
      target: { pawn: ref(pawn) },
    }))
  );
}

/**
 * The same protection, and the pawn may not move for a round (Lock In).
 *
 * Built Different's value less what the pawn gives up by sitting out, so the bot reaches for Lock In
 * only when Built Different is not in the hand, which is the right order: the two cards protect the
 * same pawn and one of them also costs a turn of walking.
 */
export function lockIn(state, seat, profile = DEFAULT_PROFILE) {
  const insured = builtDifferent(state, seat, profile);

  return insured === null ? null : { ...insured, value: insured.value - profile.lockCost };
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

  const relief = threatOn(state.pawns, pawn, boardOf(state)) * pawnWorth(pawn);

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
