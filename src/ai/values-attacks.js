/**
 * What the two cards you play on **somebody else's** pawn are worth. Bot tactics plan, split out of
 * `values-pawns.js`. Issue #82, requirement FR-43.
 *
 * Pure `ai/`. Same signature and currency as every other value file: see
 * [values-shared.js](values-shared.js), and [values-pawns.js](values-pawns.js) for why the seven pawn
 * cards are two files.
 *
 * ## An offensive card asks a question the defensive ones do not
 *
 * A defensive card asks "which of my four pawns is worth the card". These two ask **which opponent**,
 * and the answer is not "whichever pawn is nearest". `share(state, victim)` weights an opponent's loss
 * by how far ahead they are, so hurting the player two turns from winning is worth up to double
 * hurting the one still in the yard. That one function is the whole of the bot tactics plan's phase
 * 2a, and it lands here first because these are the two cards that pick a victim outright.
 */

import { TRACK_LENGTH } from "../core/board.js";
import { YEET_DIE } from "../core/cards/effects/displacement-effects.js";
import { squareOf } from "../core/displacement.js";
import { friendsBehind } from "./geometry.js";
import { oddsOfHit } from "./hit-odds.js";
import { DEFAULT_PROFILE } from "./profile.js";
import { pawnWorth } from "./score.js";
import { best, ref } from "./values-pawns.js";
import { enemiesOnTrack, opponents, ownOnTrack, share } from "./values-shared.js";

/**
 * If a named opponent pawn can move, its owner has to move it (Ragebait).
 *
 * Aimed at the opponent's **rearmost** pawn, and only when they have one further ahead. That is the
 * whole card: forcing a player to walk the pawn that has got least far means the pawn that has got
 * furthest stands still, and `move-scoring.js`'s second tie-break says why that hurts: concentrating
 * on a leading pawn is what gets it home.
 *
 * Worth nothing against a player with one pawn on the board, because then the taunt names the only
 * pawn they were going to move anyway. Between two opponents who both have two pawns out, the leader
 * is taunted, which is the lead weighting doing its job with no rule of its own here.
 */
export function ragebait(state, seat, profile = DEFAULT_PROFILE) {
  return best(
    opponents(state, seat).map((other) => {
      const theirs = state.pawns.filter((pawn) => pawn.player === other && squareOf(pawn) !== null);
      if (theirs.length < 2) return null;

      const rear = theirs.reduce((lowest, pawn) => (pawn.r < lowest.r ? pawn : lowest));

      return { value: profile.tauntWorth * share(state, other), target: { pawn: ref(rear) } };
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
 * 1. **The steps the victim loses**, as a share of their own loss. Capped by how far back it can
 *    actually go: the pushback floor is `r = 1`, so a pawn on `r = 2` loses one step and not three and
 *    a half.
 * 2. **The threat it stops being.** A pawn six squares behind mine is a real chance of losing that
 *    pawn; pushed back, it needs a bigger die to reach the same square, so some of that threat goes
 *    away. Priced as the drop in `oddsOfHit` over the expected push.
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

        let value = share(state, victim.player) * pushed;

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
