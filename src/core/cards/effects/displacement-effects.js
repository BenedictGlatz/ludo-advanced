/**
 * The five cards that move a pawn without a move. Issue #38, requirements FR-26 and FR-29.
 *
 * Pure `core/`: every function takes a snapshot and returns a patch. See
 * [../context.js](../context.js) for both shapes.
 *
 * ## Why these five are together
 *
 * They all write `pawns`, and none of them goes through `evaluateTurn`. A pawn shoved by Yeet is not
 * making a move: nobody chose it, no legality was checked, and its owner cannot refuse it.
 * `core/displacement.js` is the blunt instrument that does it, and it carries the reason it is blunt.
 *
 * | Card | Type | What it does |
 * | --- | --- | --- |
 * | Yeet | Action | Push an opponent's pawn back a D6 |
 * | Aight Imma Head Out | Action | Move your own pawn forward four, or back to your entry square |
 * | Let Him Cook | Action | Roll a D12 and run. Overshoot the house and the pawn goes home |
 * | Ghost Mode | Reaction | The capture about to happen does not happen |
 * | Uno Reverse | Reaction | The capture happens to the attacker instead |
 *
 * ## The backwards floor is the same for all of them
 *
 * `displace` stops at `r = 1` and never re-enters a start area, which is a decision recorded in the
 * project journal: if a pushback could send a pawn home, all three of these would be cheap substitutes
 * for a capture, and capture is the mechanic the whole game is built around.
 *
 * The two cards that **do** send a pawn home say so and call `sendHome`. That is a different function
 * for exactly that reason.
 */

import { HOME_R, START_R } from "../../board.js";
import { rollDie } from "../../dice-source.js";
import { displace, sendHome } from "../../displacement.js";
import { pawnIn } from "../context.js";

/** The die Yeet rolls, and the one Let Him Cook rolls. The artwork's numbers. */
export const YEET_DIE = 6;
export const COOK_DIE = 12;

/** How far "Aight Imma Head Out" jumps forward, if that is the option chosen. */
export const HEAD_OUT_STEPS = 4;

/** The two options on "Aight Imma Head Out". `state/` checks that the player picked one of them. */
export const HEAD_OUT = Object.freeze({ ADVANCE: "advance", RETREAT: "retreat" });

/**
 * Push an opponent's pawn back a D6 (Yeet).
 *
 * The distance is rolled rather than fixed, which is the artwork's own design and is also what stops the
 * card being a precise tool: a player cannot line up a pushback that lands an opponent exactly where they
 * want them.
 */
export function yeet(context) {
  const steps = rollDie(YEET_DIE, context.rng);

  return { pawns: displace(context.pawns, context.target.pawn, -steps) };
}

/**
 * Move one of your own pawns forward four, or send it back to your entry square (Aight Imma Head Out).
 *
 * The retreat is to `r = 1` and **not** to the start area, so the pawn stays on the board. That is what
 * makes it a real choice rather than a worse capture: a pawn about to be captured a long way round can
 * duck back to the entry square, losing the lap it had walked but keeping its place in the game.
 *
 * A pawn still in its start area cannot use either option. `displace` refuses to move it forwards, and
 * retreating it would be moving it out of the yard past FR-09.
 */
export function headOut(context) {
  const ref = context.target.pawn;
  const pawn = pawnIn(context, ref);

  if (pawn === undefined || pawn.r === START_R) return {};

  if (context.target.choice === HEAD_OUT.RETREAT) {
    return { pawns: displace(context.pawns, ref, 1 - pawn.r) };
  }

  return { pawns: displace(context.pawns, ref, HEAD_OUT_STEPS) };
}

/**
 * Roll a D12 and run (Let Him Cook).
 *
 * The artwork labels it `RISKY` and this is where the risk is: **a run that would go past the deepest
 * house square sends the pawn back to its start area instead.** `displace` on its own would clamp at
 * `HOME_R`, which would make the card a free win for any pawn near home, so the overshoot is checked
 * here rather than left to the clamp.
 *
 * That is deliberately harsher than FR-13, which merely refuses an overshooting *move*. A move the
 * player chose is refused; a gamble the player took is lost.
 */
export function letHimCook(context) {
  const ref = context.target.pawn;
  const pawn = pawnIn(context, ref);

  if (pawn === undefined || pawn.r === START_R) return {};

  const steps = rollDie(COOK_DIE, context.rng);

  if (pawn.r + steps > HOME_R) {
    return { pawns: sendHome(context.pawns, ref) };
  }

  return { pawns: displace(context.pawns, ref, steps) };
}

/**
 * The capture about to happen does not happen (Ghost Mode).
 *
 * `{ cancelMove: true }` is an instruction rather than a patch: the declared move belongs to the turn,
 * and an effect cannot reach it. `intents.js` throws the move away and the turn ends with nothing moved.
 *
 * **The whole move is cancelled, not just the capture.** Cancelling only the capture would leave the
 * attacking pawn arriving on a square the ghost is still standing on, which is two pawns on one square.
 * "You dodge and they stay where they were" is also what the card's name says.
 */
export function ghostMode() {
  return { cancelMove: true };
}

/**
 * The capture happens to the attacker instead (Uno Reverse).
 *
 * Two things at once, and both are needed: the declared move is cancelled **and** the attacking pawn is
 * sent home. Without the cancellation the attacker would both go home and arrive on the target square.
 *
 * Reads the attacker off `pendingMove`, which is the only card that needs it. That is why the declared
 * move is in the context at all.
 */
export function unoReverse(context) {
  const move = context.pendingMove;
  if (move === null) return { cancelMove: true };

  return {
    cancelMove: true,
    pawns: sendHome(context.pawns, { player: move.player, pawn: move.pawn }),
  };
}
