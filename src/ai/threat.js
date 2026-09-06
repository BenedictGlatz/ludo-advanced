/**
 * How much danger a pawn is in. Issue #82, rebuilt by the bot tactics plan's phase 1.
 *
 * Pure `ai/`: probabilities over the pawn list, no state transitions, no randomness. The geometry it
 * stands on is [geometry.js](geometry.js) and the probabilities are [hit-odds.js](hit-odds.js); what
 * is left here is the one question the card values and the move scorer both ask, **"what is the chance
 * I lose this pawn before I move it again?"**
 *
 * ## Three things changed in phase 1, and each was a real mistake
 *
 * **1. The odds were a guess and are now a calculation.** `oddsOfHit` used to be `1/6`, `1/12` or
 * `1/20` by range. It is now averaged over all 1140 hands the dice pool can deal, and at short range
 * that is nearly twice as dangerous as the guess said. See `hit-odds.js` for the arithmetic and for
 * why reading the pool's composition is not cheating.
 *
 * **2. The sum became a probability.** `threatOn` used to add the attackers' chances up. That was
 * defended in issue #82 and the defence was sound *at the time*: a threat was only ever compared with
 * another threat, and a sum keeps "twice as many attackers is twice as bad" true. From phase 1 on the
 * threat is multiplied by a pawn's worth and compared against a **gain**, such as the 25 points of
 * getting a pawn out of the yard, so it has to be a real number between 0 and 1. Four attackers six
 * squares back add up to about 0.55 and the true chance is about 0.45, and with seven attackers the
 * sum passes 1 and prices a pawn at more than a pawn.
 *
 * **3. Yards were invisible.** A pawn standing on an opponent's entry square is captured the moment
 * that opponent rolls a maximum with a pawn in the yard, which happens more than a quarter of the
 * time. Standing there is the classic Ludo mistake and the bot used to make it happily.
 *
 * ## What it still ignores, on purpose
 *
 * That an attacker might be held, stunned, locked or petrified and cannot move at all; that they
 * might have something better to do than capture; and that a Rock between us would stop them. All
 * three make the number **smaller**, so ignoring them keeps the model pessimistic, which is the side
 * to be wrong on: a lost pawn costs up to 65 points and a lost tempo costs a handful.
 */

import { START_R, entrySquare } from "../core/board.js";
import { squareOf } from "../core/displacement.js";
import { EMPTY_BOARD } from "../core/move-rules.js";
import { STATUS, hasStatus } from "../core/statuses.js";
import { enemiesBehind } from "./geometry.js";
import { ENTRY_ODDS, MAX_REACH, oddsOfHit } from "./hit-odds.js";

/** Is this pawn sitting in its own start area, waiting for a maximum to get out? */
function inYard(pawn) {
  return pawn.r === START_R;
}

/**
 * Every chance of losing `pawn` this round, one per attacker, as a flat list of probabilities.
 *
 * Two sources, and the second is the one a person sees and a program has to be told about:
 *
 * 1. **Somebody behind it on the track.** One entry per enemy pawn within twenty squares, at the odds
 *    of rolling exactly that distance.
 * 2. **Somebody's yard, when the pawn is standing on their entry square.** A pawn entering the board
 *    lands on that square and captures whatever is there, and it enters on a maximum, so the chance is
 *    `ENTRY_ODDS` for every opponent who still has a pawn waiting. It is one entry per opponent and
 *    not per waiting pawn: they get one roll, and one roll gets one pawn out.
 */
function dangers(pawns, pawn, square) {
  const odds = enemiesBehind(pawns, square, MAX_REACH, pawn.player).map((enemy) =>
    oddsOfHit(enemy.distance)
  );

  const seats = new Set(pawns.map((other) => other.player));
  for (const seat of seats) {
    if (seat === pawn.player || entrySquare(seat) !== square) continue;

    const waiting = pawns.some((other) => other.player === seat && inYard(other));
    if (waiting) odds.push(ENTRY_ODDS);
  }

  return odds;
}

/**
 * The chance that this pawn is captured before its owner moves it again, as a number 0 to 1.
 *
 * `1 - prod(1 - p)`, the proper "at least one of them succeeds". See the module header for why this
 * used to be a sum and why a sum stopped being good enough.
 *
 * Two answers are exactly zero and both matter:
 *
 * - **A pawn in a start area or a home column**, through `squareOf`. Neither is a shared square, so
 *   nothing can reach it there.
 * - **An armoured pawn** (Built Different). The next capture of it is refused outright, so the whole
 *   point of the card is that this number is zero, and a bot that still saw danger there would buy
 *   the insurance twice.
 */
export function threatOn(pawns, pawn, board = EMPTY_BOARD) {
  const square = squareOf(pawn);
  if (square === null) return 0;

  if (hasStatus(board.statuses, STATUS.ARMOURED, { player: pawn.player, pawn: pawn.pawn })) {
    return 0;
  }

  const safe = dangers(pawns, pawn, square).reduce((product, p) => product * (1 - p), 1);

  return 1 - safe;
}
