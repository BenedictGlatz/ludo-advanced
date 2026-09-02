/**
 * The five cards that move a pawn without a move. Issue #38, requirements FR-26 and FR-28.
 *
 * Pure `core/`: every function takes a snapshot and returns a patch. See
 * [../context.js](../context.js) for both shapes.
 *
 * ## Why these five are together
 *
 * They all write `pawns`, and none of them goes through `evaluateTurn`. A pawn shoved by Yeet is not
 * making a move: nobody chose it, no legality was checked, and its owner cannot refuse it.
 *
 * | Card | Type | What it does |
 * | --- | --- | --- |
 * | Yeet | Action | Push an opponent's pawn back a D6 |
 * | Aight Imma Head Out | Action | Move your own pawn forward four, or back to your entry square |
 * | Let Him Cook | Action | Roll a D12 and run. Overshoot the house and the pawn goes home |
 * | Ghost Mode | Reaction | The capture about to happen does not happen |
 * | Uno Reverse | Reaction | The capture happens to the attacker instead |
 *
 * ## The three that move a pawn along the track now go through `shove` (issue #45)
 *
 * They used to call `displace` directly, which clamps a position and checks nothing else. FR-30 says a
 * trap fires when a pawn **enters** a tile, and these three enter tiles, so they fired nothing. Yeet's
 * own printed text says "or forward onto a trap, if you're feeling mean", which the game could not do.
 *
 * `shove` in `core/enter.js` is the choke point. Going through it means all three now stop before a
 * boulder, resolve a capture on the square they land on, and set off whatever they crossed. So a patch
 * from these three names three fields rather than one, which is harmless: a patch replaces a whole list
 * from the same snapshot, so an unchanged `traps` is identical to omitting it.
 *
 * ## The two that send a pawn home still do not, and that is the exception
 *
 * `letHimCook`'s overshoot and both Reaction cards call `sendHome`, which never reaches the choke point.
 * A start area is not a tile, so a captured or crashed pawn sets off nothing on its way there. The rule
 * is implemented by the two paths being **separate functions** rather than by a condition inside one, so
 * there is no flag anybody can pass wrongly.
 *
 * ## The backwards floor is the same for all of them
 *
 * The clamp stops at `r = 1` and never re-enters a start area, which is a decision recorded in the
 * project journal: if a pushback could send a pawn home, all three of these would be cheap substitutes
 * for a capture, and capture is the mechanic the whole game is built around.
 */

import { HOME_R, START_R } from "../../board.js";
import { rollDie } from "../../dice-source.js";
import { sendHome } from "../../displacement.js";
import { shove } from "../../enter.js";
import { pawnIn, worldIn } from "../context.js";

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

  return shove(worldIn(context), context.target.pawn, -steps);
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

  const steps = context.target.choice === HEAD_OUT.RETREAT ? 1 - pawn.r : HEAD_OUT_STEPS;

  return shove(worldIn(context), ref, steps);
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

  return shove(worldIn(context), ref, steps);
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
