/**
 * How good a move is, as one number. Issue #43, requirement FR-43, extended by the bot tactics plan.
 *
 * The `ai/` layer may import `core/` and `state/`. It must never touch `ui/`, `i18n/`, jQuery or the
 * DOM, and ESLint enforces that. Everything here is pure and deterministic: no `rng`, no
 * `Math.random`, no `Date`. A test is a literal board and a literal number, which is the whole reason
 * the bot is a layer of its own rather than a file in `ui/`.
 *
 * ## The heuristic in one sentence
 *
 * Finishing a pawn beats capturing, capturing beats reaching the safety of the home column, that
 * beats getting a pawn out of the yard, and anything beats simply walking. The five numbers that say
 * so are `SCORE` in [score.js](score.js), and **the order is the heuristic while the distances are a
 * knob**: tune the numbers, not the ranking.
 *
 * ## Danger and opportunity: a correction, not a sixth category
 *
 * The header of this file used to say that danger was "deliberately missing" and that a wrong model
 * of it would play worse than none. The model is now real (see [threat.js](threat.js), which averages
 * over every hand the dice pool can deal) and the missing term is here, as three corrections added to
 * the category score:
 *
 * | Term | Meaning | Sign |
 * | --- | --- | --- |
 * | Risk | How much more likely this pawn is to be captured where it lands than where it stands, times what losing it costs | subtracted |
 * | Opportunity | How many more enemy pawns the landing square puts within reach next turn than the square it left | added |
 * | Landing | What is lying on the way: a skill square earns a card, somebody else's Banana Peel costs a turn | added |
 *
 * **Why a correction and not a category.** A category is all-or-nothing, and danger is a matter of
 * degree: a pawn on `r = 3` in front of one enemy is a small risk, a pawn on `r = 38` in front of
 * three is a catastrophe. A term that scales with the pawn's worth and with the probability says both,
 * and it says them in the same currency as the category it corrects, so the two can be added at all.
 * A sixth category would have had to sit somewhere in the ranking, and there is no honest place for
 * "this is a bit dangerous" between "capture" and "leave the yard".
 *
 * The categories still dominate, which is the property to keep: the biggest correction a board can
 * produce is roughly one pawn's worth, so a finish still beats a capture and a capture still beats a
 * walk. What the correction decides is which of two *similar* moves to make, and that is most moves.
 *
 * ## Passing no context is passing the old bot
 *
 * `scoreMove(move, pawns)` with two arguments answers exactly what it answered before the plan: the
 * category and nothing else. The three terms need a board, the seat count and the skill squares, and
 * they arrive together in a `context` built by `scoringContext`. `NO_CONTEXT` carries `PLAIN_PROFILE`,
 * whose three weights are zero, so a caller that has no state object to hand gets the plain ranking
 * rather than a half-computed correction.
 */

import { HOME_R, MAX_PLAYERS, TRACK_LENGTH } from "../core/board.js";
import { squareOf } from "../core/displacement.js";
import { EMPTY_BOARD, MOVE_KIND } from "../core/move-rules.js";
import { applyMove } from "../core/movement.js";
import { findPawn } from "../core/pawns.js";
import { squaresCrossed } from "../core/path.js";
import { skillSquareLandedOn } from "../core/skill-squares.js";
import { OIL_SLIDE } from "../core/trap-fire.js";
import { TRAP_KIND, firstTrapOnPath } from "../core/traps.js";
import { boardOf } from "../state/selectors.js";
import { pawnsAhead } from "./geometry.js";
import { MAX_REACH, oddsOfHit } from "./hit-odds.js";
import { DEFAULT_PROFILE, PLAIN_PROFILE, profileFor } from "./profile.js";
import { SCORE, pawnWorth } from "./score.js";
import { threatOn } from "./threat.js";

/** Everything the three correction terms need, with the terms switched off. See the module header. */
export const NO_CONTEXT = Object.freeze({
  board: EMPTY_BOARD,
  seats: MAX_PLAYERS,
  skillSquares: Object.freeze([]),
  profile: PLAIN_PROFILE,
});

/**
 * The context for one seat's decision, built once and handed down through every move it prices.
 *
 * `board` is separate from the state on purpose: `values-window.js` prices Hold Pawn by asking what a
 * turn is worth on a board that has one more status on it, and that board is not the one the state is
 * in. Everything else is read off the state as it stands.
 */
export function scoringContext(state, seat, profile = DEFAULT_PROFILE, board = boardOf(state)) {
  return {
    board,
    seats: state.seats.length,
    skillSquares: state.skillSquares,
    profile: profileFor(profile, seat),
  };
}

/** How much of an opponent's loss counts as my gain, the same rule `values-shared.js` uses. */
function share(context) {
  return 1 / Math.max(1, context.seats - 1);
}

/** The category, which is the heuristic. See `SCORE` for why the five numbers are the numbers. */
function categoryScore(move, pawns) {
  if (move.to === HOME_R) {
    return SCORE.FINISH;
  }

  if (move.captures !== null) {
    const victim = findPawn(pawns, move.captures);
    return SCORE.CAPTURE + SCORE.CAPTURE_PER_STEP * victim.r;
  }

  // A move that crosses out of the shared track and into the player's own house. `from` is on the
  // track (or in the yard, which is 0 and therefore also `<= TRACK_LENGTH`), `to` is past its end.
  if (move.from <= TRACK_LENGTH && move.to > TRACK_LENGTH) {
    return SCORE.ENTER_HOME;
  }

  if (move.kind === MOVE_KIND.LEAVE_START) {
    return SCORE.LEAVE_START;
  }

  return SCORE.ADVANCE_PER_STEP * (move.to - move.from);
}

/**
 * How much more dangerous the landing square is than the one the pawn stands on, in steps.
 *
 * Both halves are `chance of losing it` times `what losing it costs`, which is the expected loss, so
 * the difference is what the move itself costs in danger. A pawn walking into a home column has a
 * threat of zero, so the term turns the last stretch into the relief it actually is.
 *
 * `after` is the pawn list with the move played, so a captured attacker has already gone home and is
 * correctly no longer a danger. That is worth stating because it is the one case where computing the
 * threat on the *old* list would be badly wrong: capturing the pawn behind you is the safest move on
 * the board and the old list would call it the most dangerous.
 */
function riskDelta(pawns, after, move, moved, context) {
  const before = findPawn(pawns, move);

  return (
    threatOn(after, moved, context.board) * pawnWorth(moved) -
    threatOn(pawns, before, context.board) * pawnWorth(before)
  );
}

/**
 * What one square sets up: the enemy pawns it puts within one roll, at the odds of rolling exactly
 * that far.
 *
 * The same table as the danger term, read the other way round. `oddsOfHit(4)` is the chance an
 * opponent four squares behind me lands on me, and it is equally the chance that I land on a pawn four
 * squares in front of me, because the pool does not know which way anybody is facing.
 */
function reach(pawns, pawn) {
  const square = squareOf(pawn);
  if (square === null) return 0;

  return pawnsAhead(pawns, square, MAX_REACH)
    .filter((enemy) => enemy.player !== pawn.player)
    .reduce((total, enemy) => total + oddsOfHit(enemy.distance) * pawnWorth(enemy), 0);
}

/**
 * How much more the pawn threatens from where it lands than from where it stands.
 *
 * **A difference and not an absolute, and the first version of this file got that wrong.** Danger was
 * written as a delta from the start, and it has to be: a pawn already in trouble should not be charged
 * for trouble it cannot escape. Opportunity was written as "what is in front of the landing square",
 * full stop, which quietly paid the bot for every short move that ended anywhere near an enemy,
 * including the ones that gave up a better position to get there. The arena said so: with that term
 * on and nothing else changed, the bot took **more** captures and won **fewer** matches, which is the
 * shape of a bot trading tempo for a capture it was going to get anyway.
 *
 * Taken as a `share` by the caller, like every other opponent's loss in the layer: at a four-player
 * table a capture I might make next turn helps the other two seats as much as it helps me.
 */
function opportunityDelta(pawns, after, move, moved) {
  return reach(after, moved) - reach(pawns, findPawn(pawns, move));
}

/** What each of the three traps does to whoever walks into it, in steps. */
function trapValue(kind, profile) {
  switch (kind) {
    case TRAP_KIND.BANANA_PEEL:
      return -profile.stunWorth;
    case TRAP_KIND.NOT_THAT_DEEP:
      return -1;
    case TRAP_KIND.OIL_SPILL:
      return (OIL_SLIDE.min + OIL_SLIDE.max) / 2;
    default:
      return 0;
  }
}

/**
 * What is lying on the way, in steps: the first trap the walk sets off, plus the skill square it
 * lands on.
 *
 * The **whole path** is asked about the traps and only the **landing square** about skill squares,
 * because that is how the two rules differ: `firstTrapOnPath` fires on any square crossed and
 * `skillSquareLandedOn` needs the pawn to stop there. A trap the mover laid themselves never fires,
 * and `firstTrapOnPath` already knows that, so this asks rather than repeating the rule.
 *
 * The Oil Spill's forward slide is counted as its mean and nothing more. It could carry the pawn onto
 * a capture, past a boulder or into an overshoot, and pricing that needs the whole slide chain out of
 * `core/slide.js` for a card the bot never lays itself. Recorded as a known simplification.
 */
function landingValue(move, moved, context) {
  const { profile } = context;
  let value = 0;

  const crossed = squaresCrossed(move.player, move.from, move.to);
  const trap = firstTrapOnPath(context.board.traps, crossed, move);
  if (trap !== null) value += trapValue(trap.kind, profile);

  if (skillSquareLandedOn(context.skillSquares, moved) !== null) value += profile.cardWorth;

  return value;
}

/**
 * The three corrections, weighted by the profile, or zero when the profile has them all switched off.
 *
 * The early return is not only a speed-up, it is what makes `PLAIN_PROFILE` mean "the old bot
 * exactly": with the weights at zero nothing below runs at all, so no rounding, no board lookup and no
 * `applyMove` can change an answer the old code gave.
 */
function correction(move, pawns, context) {
  const { profile } = context;
  if (!profile.riskWeight && !profile.opportunityWeight && !profile.landingWeight) return 0;

  const after = applyMove(pawns, move);
  const moved = findPawn(after, move);

  return (
    -profile.riskWeight * riskDelta(pawns, after, move, moved, context) +
    profile.opportunityWeight * share(context) * opportunityDelta(pawns, after, move, moved) +
    profile.landingWeight * landingValue(move, moved, context)
  );
}

/**
 * What one move is worth. Higher is better.
 *
 * `pawns` is the list the move was computed against, and it is needed for two things: how far the
 * captured pawn had got, and where every other pawn is standing when the danger term asks. `core/`
 * hands the capture back as an identity `{ player, pawn }` rather than a position, so the position has
 * to be looked up.
 *
 * **The lowest possible score used to be 1 and no longer is.** A move that walks a leading pawn into
 * three enemies scores below zero, which is the point: the bot should make it only when everything
 * else is worse, and sometimes everything else is.
 */
export function scoreMove(move, pawns, context = NO_CONTEXT) {
  return categoryScore(move, pawns) + correction(move, pawns, context);
}

/**
 * The best of a list of moves, as `{ move, score }`, or `null` when the list is empty.
 *
 * **The tie-breaks are part of the contract, not an accident of `Array.sort`.** A bot that picks a
 * different pawn on two runs of the same board cannot be tested and cannot be reported as a bug, so
 * the order is fixed here and asserted in `move-scoring.test.js`:
 *
 * 1. The higher score.
 * 2. Then the pawn that has got **further** (`from`), because concentrating on a leading pawn gets it
 *    home, while spreading the same steps over four pawns gets none of them home.
 * 3. Then the lower pawn index, which decides nothing about play and everything about repeatability.
 *
 * The corrections make an exact tie rarer than it was, since they are fractions rather than whole
 * steps. Rarer is not never, and a rule that only usually decides is not a rule.
 */
export function bestMove(moves, pawns, context = NO_CONTEXT) {
  let best = null;

  for (const move of moves) {
    const score = scoreMove(move, pawns, context);
    if (best === null || beats({ move, score }, best)) {
      best = { move, score };
    }
  }

  return best;
}

function beats(candidate, best) {
  if (candidate.score !== best.score) return candidate.score > best.score;
  if (candidate.move.from !== best.move.from) return candidate.move.from > best.move.from;

  return candidate.move.pawn < best.move.pawn;
}
