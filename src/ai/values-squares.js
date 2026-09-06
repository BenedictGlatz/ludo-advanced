/**
 * What the cards that act on a square are worth. Issue #82, requirement FR-43.
 *
 * Pure `ai/`. Same signature and currency as the other value files: see
 * [values-shared.js](values-shared.js).
 *
 * ## The trap cards used to aim at the one square the victim was least likely to enter
 *
 * Both of them laid the trap **one** square in front of an opponent's leading pawn, and the old header
 * admitted why: pricing it properly needs the distribution of what the victim will roll, and that did
 * not exist yet. It does now (`hit-odds.js`), and the old answer turns out to be close to the worst
 * available. One square ahead is reached only by a D2 or a natural 1, which is the least likely
 * distance in the whole table; four squares ahead of three different pawns is a far better trap.
 *
 * So `trapSquares` prices **every legal square** by how likely somebody is to walk into it, summed
 * over every enemy pawn that could reach it and weighted by how far ahead that enemy is. A square
 * three pawns can each reach beats a square only the leader can reach, and among equals the leader's
 * square wins.
 *
 * **The known simplification, kept on purpose.** `oddsOfHit` is the chance of landing *exactly* there,
 * and a trap also fires on a square merely crossed, so the real chance is higher than the number
 * below. It is higher for every square, so the ranking is barely affected, and the alternative is a
 * second probability table modelling an opponent who is not aiming at anything. Recorded rather than
 * half-built, the same way the old one-square rule was.
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
import { squareOf } from "../core/displacement.js";
import { neighbourSquares, ringDistance, squareRun } from "../core/path.js";
import { pickableSquares } from "../state/card-legality.js";
import { MAX_REACH, oddsOfHit } from "./hit-odds.js";
import { DEFAULT_PROFILE } from "./profile.js";
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
 * Every legal square for this trap card, with the share-weighted chance that an enemy walks into it.
 *
 * `catch` is the sum over enemy pawns of `P(that pawn lands here) * share of its owner's loss`, so it
 * is already in the layer's currency: multiply it by what the trap does to a victim and the answer is
 * the expected value of laying it there.
 *
 * Squares nobody can reach are dropped, so a card with nothing worth trapping returns `null` rather
 * than picking square 0 by accident.
 *
 * Sorted by chance, then by square number, so two equally good squares are always chosen between the
 * same way. Without the sort the answer would depend on the order `pickableSquares` happened to
 * return, which is a repeatability bug rather than a strategy.
 */
function trapSquares(state, seat, cardId) {
  const free = pickableSquares(state, cardId) ?? [];
  const enemies = enemiesOnTrack(state, seat);

  return free
    .map((square) => {
      let caught = 0;

      for (const enemy of enemies) {
        const distance = (square - squareOf(enemy) + TRACK_LENGTH) % TRACK_LENGTH;
        if (distance < 1 || distance > MAX_REACH) continue;

        caught += oddsOfHit(distance) * share(state, enemy.player);
      }

      return { square, caught };
    })
    .filter((entry) => entry.caught > 0)
    .sort((a, b) => b.caught - a.caught || a.square - b.square);
}

/**
 * Lay a Banana Peel (`stun`) on a square an opponent is about to walk onto.
 *
 * A stun costs the victim their next turn with that pawn, priced as `stunWorth` steps. Unlike the old
 * flat value this one differs from square to square, so the search is a real search: the best square
 * is the one most likely to be walked on by the player most worth stopping.
 */
export function bananaPeel(state, seat, profile = DEFAULT_PROFILE) {
  return best(
    trapSquares(state, seat, "action-banana-peel").map(({ square, caught }) => ({
      value: caught * profile.stunWorth,
      target: { square },
    }))
  );
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
const NOT_THAT_DEEP_PUSH = 1;

/** How far the aura reaches, in squares either side. `core/trap-rules.js` owns the number. */
const AURA_RADIUS = 3;

/**
 * Lay an It's Not That Deep (`push back one`) in front of an opponent.
 *
 * The pushback is worth almost nothing, which is the joke on the card. What the card is actually for
 * is the **aura**: an offensive card aimed within three squares of it does nothing at all, so it is
 * area denial for whatever of mine is standing nearby. Priced as one point per own pawn inside the
 * radius, on top of the pushback.
 *
 * The aura is why this card searches every legal square and not only the ones an enemy can reach: a
 * square nobody will ever step on is still worth laying it on when three of my pawns are standing
 * beside it. So the candidate list is the free squares themselves, with `trapSquares` consulted for
 * the pushback half.
 */
export function notThatDeep(state, seat) {
  const caughtAt = new Map(
    trapSquares(state, seat, "action-not-that-deep").map((entry) => [entry.square, entry.caught])
  );

  return best(
    (pickableSquares(state, "action-not-that-deep") ?? []).map((square) => {
      const guarded = ownOnTrack(state, seat).filter(
        (pawn) => ringDistance(squareOf(pawn), square) <= AURA_RADIUS
      ).length;

      return {
        value: (caughtAt.get(square) ?? 0) * NOT_THAT_DEEP_PUSH + guarded,
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
