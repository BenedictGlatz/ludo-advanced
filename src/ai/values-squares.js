/**
 * What the cards that act on a square are worth. Issue #82, requirement FR-43.
 *
 * Pure `ai/`. Same signature and currency as the other three value files: see
 * [values-shared.js](values-shared.js).
 *
 * ## The four trap cards all ask the same question
 *
 * "Which free square is worth putting this on?" And they all give a version of the same answer: **one
 * square in front of an opponent's pawn**, because that is the square that pawn is most likely to
 * enter next. It is not the cleverest possible answer. A trap laid 4 squares ahead catches a D6 more
 * often than one laid at 1 catches anything, and pricing that properly needs the distribution of what
 * the victim will roll, which depends on a dice hand that does not exist yet. Recorded as the obvious
 * next improvement rather than half-built.
 *
 * `pickableSquares` is asked for the list of legal squares rather than the rule being repeated here.
 * A trap may not go on an occupied square, under a pawn, or on one of the four entry squares, and
 * `core/trap-rules.js` owns all three reasons.
 *
 * ## The two area cards are priced by their own dice
 *
 * Hyperbeam sweeps 1 to D4 squares, so the square immediately in front of the shooter is hit on all
 * four faces and the fourth square only on one. Janky RPG hits what it aimed at on a 4, 5 or 6 and
 * both neighbours otherwise. Both are summed over their outcomes with `squareSwing`, which prices an
 * opponent's pawn as a share of its worth and one of my own as its whole worth **against** me. That
 * second half is the friendly fire both cards are famous for, and a bot that ignored it would
 * regularly send its own leading pawn home.
 */

import { TRACK_LENGTH } from "../core/board.js";
import { HYPERBEAM_DIE, JANKY_DIE, JANKY_HIT } from "../core/cards/effects/area-effects.js";
import { KNOCKBACK } from "../core/cards/effects/trap-effects.js";
import { squareOf } from "../core/displacement.js";
import { neighbourSquares, ringDistance, squareRun } from "../core/path.js";
import { pickableSquares } from "../state/card-legality.js";
import { friendsBehind, squareAhead } from "./threat.js";
import { enemiesOnTrack, ownOnTrack, share, squareSwing } from "./values-shared.js";

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

/**
 * Every free square one step in front of an opponent's pawn, leading pawn first.
 *
 * Sorted by how far the victim has got, then by seat and pawn, so that two squares of equal value are
 * always chosen between the same way. Without the sort the answer would depend on the order of the
 * pawn list, which is a repeatability bug rather than a strategy.
 */
function squaresAheadOfEnemies(state, seat, cardId) {
  const free = pickableSquares(state, cardId) ?? [];

  return enemiesOnTrack(state, seat)
    .slice()
    .sort((a, b) => b.r - a.r || a.player - b.player || a.pawn - b.pawn)
    .map((victim) => ({ victim, square: squareAhead(victim, 1) }))
    .filter((entry) => entry.square !== null && free.includes(entry.square));
}

/** What losing a turn costs, in steps: roughly one average roll of the middle of the dice pool. */
const STUN_WORTH = 7;

/**
 * Lay a Banana Peel (`stun`) on a square an opponent is about to walk onto.
 *
 * A stun costs the victim their next turn with that pawn, priced as `STUN_WORTH` steps and taken as a
 * share. It is the same number wherever it is laid, so the leading opponent pawn wins by the sort
 * above rather than by the arithmetic.
 */
export function bananaPeel(state, seat) {
  const [first] = squaresAheadOfEnemies(state, seat, "action-banana-peel");

  return first === undefined
    ? null
    : { value: share(state) * STUN_WORTH, target: { square: first.square } };
}

/**
 * Lay an Oil Spill, which the bot never does.
 *
 * **A deliberate negative finding, not a gap.** An Oil Spill slides whoever steps on it 3 to 5 squares
 * **forwards**, and a pawn does not set off its own side's traps in any way that helps: the card is a
 * gift to whoever walks into it. There is one board where it is good, a victim one square from
 * overshooting their house, and pricing that needs the victim's exact `r`, their remaining house
 * distance and the slide distribution, for a card that is a mistake on every other board.
 *
 * So the bot holds it, and at a full hand it is worth 0 and still loses to anything else. Recorded in
 * `notes/06` next to The Purge, which is the other one.
 */
export function oilSpill() {
  return null;
}

/** What an It's Not That Deep is worth for its pushback alone, before the aura is counted. */
const NOT_THAT_DEEP_BASE = 2;

/** How far the aura reaches, in squares either side. `core/trap-rules.js` owns the number. */
const AURA_RADIUS = 3;

/**
 * Lay an It's Not That Deep (`push back one`) in front of an opponent.
 *
 * The pushback is worth almost nothing, which is the joke on the card. What the card is actually for
 * is the **aura**: an offensive card aimed within three squares of it does nothing at all, so it is
 * area denial for whatever of mine is standing nearby. Priced as one point per own pawn inside the
 * radius, on top of the pushback.
 */
export function notThatDeep(state, seat) {
  return best(
    squaresAheadOfEnemies(state, seat, "action-not-that-deep").map(({ square }) => {
      const guarded = ownOnTrack(state, seat).filter(
        (pawn) => ringDistance(squareOf(pawn), square) <= AURA_RADIUS
      ).length;

      return { value: NOT_THAT_DEEP_BASE + guarded, target: { square } };
    })
  );
}

/** What a boulder standing in the way is worth, and what one of my own pawns stuck behind it costs. */
const BOULDER_WORTH = 4;
const BOULDER_COST = 2;

/** How far behind a boulder still matters. Six squares: one D6 away from running into it. */
const BOULDER_RANGE = 6;

/**
 * Drop a Big Ah Rock in front of an opponent (`knock back three, then block for three rounds`).
 *
 * Two halves, and the card only makes sense when both land: the pawn directly behind the square is
 * knocked back `KNOCKBACK`, and the square then blocks everything for three rounds. So it is worth the
 * knockback plus the blocking, as a share, less what my own pawns behind it lose by being stuck too.
 * The boulder is nobody's friend, exactly like Rock.
 */
export function bigAhRock(state, seat) {
  return best(
    squaresAheadOfEnemies(state, seat, "action-big-ah-rock").map(({ square }) => {
      const mine = friendsBehind(state.pawns, square, BOULDER_RANGE, seat).length;

      return {
        value: share(state) * (KNOCKBACK + BOULDER_WORTH) - BOULDER_COST * mine,
        target: { square },
      };
    })
  );
}

/**
 * Fire a beam from one of your own pawns (Hyperbeam).
 *
 * Every own pawn on the track, times both directions, priced as the sum over the run of
 * `P(the D4 reaches this far) * what is standing there`. The square in front of the shooter is hit
 * four times out of four, the fourth square one time in four, and nothing beyond it.
 *
 * The shooter's own square is never in the run (`squareRun` starts one step out), so the pawn firing
 * is safe. Its four sisters standing in the lane are not, which is the friendly fire.
 */
export function hyperbeam(state, seat) {
  return best(
    ownOnTrack(state, seat).flatMap((pawn) =>
      [1, -1].map((direction) => {
        const run = squareRun(squareOf(pawn), direction, HYPERBEAM_DIE);
        let value = 0;

        run.forEach((square, index) => {
          const reach = (HYPERBEAM_DIE - index) / HYPERBEAM_DIE;
          value += reach * squareSwing(state, seat, square);
        });

        return { value, target: { pawn: { player: pawn.player, pawn: pawn.pawn }, direction } };
      })
    )
  );
}

/**
 * Aim at a square and probably miss (Janky RPG).
 *
 * On a 4 or better everything on the named square goes home; on a 3 or less both neighbours are hit
 * instead. So the value is half the square plus half of both its neighbours, and the two halves have
 * the same sign only when the whole neighbourhood is opponents. That is the card being unreliable
 * rather than the value being cautious: aiming into a cluster with one of my own pawns in it prices
 * out, and the bot aims somewhere else.
 *
 * All forty squares are searched, because the card takes any track square (it fires **at** a square
 * rather than occupying one) and an empty square is worth exactly zero, so no filtering is needed.
 */
export function jankyRpg(state, seat) {
  const onTarget = (JANKY_DIE - JANKY_HIT + 1) / JANKY_DIE;

  return best(
    Array.from({ length: TRACK_LENGTH }, (_, square) => {
      const wide = neighbourSquares(square).reduce(
        (total, side) => total + squareSwing(state, seat, side),
        0
      );

      return {
        value: onTarget * squareSwing(state, seat, square) + (1 - onTarget) * wide,
        target: { square },
      };
    })
  );
}
