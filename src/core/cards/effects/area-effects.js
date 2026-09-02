/**
 * The three cards that hit more than one square. Issue #38, requirements FR-26 and FR-28.
 *
 * Pure `core/`: every function takes a snapshot and returns a patch. See
 * [../context.js](../context.js) for both shapes.
 *
 * | Card | What it hits |
 * | --- | --- |
 * | Hyperbeam | A run of 1 to D4 squares in front of one of your own pawns, your own pawn included |
 * | Janky RPG | A named square, or both its neighbours, depending on a D6 |
 * | 67 | Nothing on the board. It is a gamble on your own roll |
 *
 * 67 is here because it is the third card that reads as an area effect on the artwork and because it
 * belongs nowhere else: it writes a roll modifier, and `roll-effects.js` is the file for cards whose
 * *whole* effect is one modifier, which this one is not quite.
 *
 * ## Both real area effects deliberately hit their own side
 *
 * Hyperbeam's artwork says "friendly fire" outright, and Janky RPG's whole name is that it is unreliable.
 * Neither filters the mover's own pawns out of what it sweeps, and that is the design rather than an
 * omission: a card that sends four pawns home with no risk to its owner would be the only card anybody
 * ever played.
 *
 * ## Neither of them fires a trap, and that is not an oversight (issue #45)
 *
 * Issue #45 routed the three cards in `displacement-effects.js` through `core/enter.js`, so that
 * card-driven movement sets off traps as FR-30 requires. **These two were deliberately left alone.**
 *
 * The only thing either does to a pawn is `sendHome`, and a start area is not a tile. Sending a pawn home
 * is the one arrival in the game that sets off nothing, for a reason worth keeping in view: walking a
 * pawn from `r = 17` to `r = 0` counts seventeen squares backwards, so Hyperbeam, which can send four
 * pawns home at once, would detonate every trap between them and their yards.
 *
 * So routing these through the choke point would be a no-op wrapped in an import. Said here because the
 * silence would otherwise read as a card somebody forgot.
 */

import { rollDie } from "../../dice-source.js";
import { pawnsOnSquares, sendHome, squareOf } from "../../displacement.js";
import { neighbourSquares, squareRun } from "../../path.js";
import { pawnIn } from "../context.js";

/** The dice these cards roll. The artwork prints both. */
export const HYPERBEAM_DIE = 4;
export const JANKY_DIE = 6;

/** The roll Janky RPG needs to hit what it was aimed at. Below it, the shot goes wide. */
export const JANKY_HIT = 4;

/** What 67 asks of the roll, and what it pays when the roll delivers. */
export const SIXTY_SEVEN = Object.freeze({ needs: 6, multiplier: 2 });

/** Every pawn on `squares` sent back to its start area, as a patch. */
function sweep(context, squares) {
  let pawns = context.pawns;

  for (const pawn of pawnsOnSquares(context.pawns, squares)) {
    pawns = sendHome(pawns, pawn);
  }

  return { pawns };
}

/**
 * Fire a beam from one of your own pawns and clear the squares in front of it (Hyperbeam).
 *
 * The artwork says "a straight cardinal lane", which is a property of the 11 by 11 drawing grid. That
 * grid lives in `ui/board-geometry.js` and `core/` may not import `ui/`, so a lane is not expressible
 * here at all. Read instead as a run along the track: pick one of your own pawns and a direction, roll a
 * D4, and everything on the next 1 to D4 shared squares goes home.
 *
 * What survives from the card: the D4, the direction, the run of squares, and the friendly fire. What is
 * lost: the geometry. Recorded as a deviation in the catalogue and in Chapter 05.
 *
 * A pawn in a start area or a house cannot fire, because it is not on a shared square and there is no
 * square in front of it to name.
 */
export function hyperbeam(context) {
  const shooter = pawnIn(context, context.target.pawn);
  const from = shooter === undefined ? null : squareOf(shooter);

  if (from === null) return {};

  const length = rollDie(HYPERBEAM_DIE, context.rng);

  return sweep(context, squareRun(from, context.target.direction, length));
}

/**
 * Aim at a square and probably miss (Janky RPG).
 *
 * A D6: on a 4 or better the shot lands on the square that was named, and everything standing there goes
 * home. On a 3 or less it goes wide and hits **both neighbours** instead, which is the artwork's own
 * description of the card and is where its name comes from.
 *
 * "Both neighbours" is unambiguous on a ring of forty and meaningless in a house column, which is why
 * the card takes a track square rather than a pawn. `neighbourSquares` wraps, so square 0's neighbours
 * are 39 and 1.
 */
export function jankyRpg(context) {
  const square = context.target.square;
  const aim = rollDie(JANKY_DIE, context.rng);

  return sweep(context, aim >= JANKY_HIT ? [square] : neighbourSquares(square));
}

/**
 * All or nothing on your own roll (67).
 *
 * "Roll a 6" is impossible on a D2 or a D4, so the card is unplayable when the chosen dice card has
 * fewer than six faces. That is a playability rule and it lives in `state/skill-play.js`, because it is
 * not a target and the catalogue cannot express it.
 *
 * The gamble itself is two entries in the roll chain: a threshold the dice have to clear, and a doubling
 * if they do. `core/roll.js` applies the threshold **before** the multiplier for exactly this card, so
 * that a 3 doubled to 6 cannot pass a test it failed.
 */
export function sixtySeven(context) {
  return {
    modifiers: {
      ...context.modifiers,
      atLeast: SIXTY_SEVEN.needs,
      multiplier: SIXTY_SEVEN.multiplier,
    },
  };
}
