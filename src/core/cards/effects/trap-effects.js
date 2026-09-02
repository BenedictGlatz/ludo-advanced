/**
 * The four cards that put something on a square, and what happens when a pawn touches it.
 * Issue #38, requirements FR-26, FR-28 and FR-30.
 *
 * Pure `core/`. Four placement functions, each taking a snapshot and returning a patch like every
 * other effect. **This file only puts things down.** What happens when a pawn walks into one of them
 * is `core/trap-fire.js`, and how far the pawn then travels is `core/slide.js`.
 *
 * | Card | What it puts down | What it does when touched |
 * | --- | --- | --- |
 * | Banana Peel | A trap | The pawn is stunned and loses its next turn |
 * | Oil Spill | A trap | The pawn slides 3 to 5 further and skips the skill square it lands on |
 * | It's Not That Deep | A trap | The pawn is pushed back one square |
 * | Big Ah Rock | A blocker | Nothing passes it while it stands. It also knocks the pawn behind it back 3, **on placement** rather than on being touched |
 *
 * ## Why `fireTrap` left this file in issue #45
 *
 * It was here because a trap's behaviour belongs with the card that laid it, and that was a fair
 * argument while the file was small and the two halves did not need each other. Both changed:
 *
 * - `bigAhRock` gained a knockback, so this file now has to reach `core/enter.js`, and `core/enter.js`
 *   reaches the firing rules. Keeping both halves here would be an import cycle, not a convenience.
 * - The firing rules stopped writing pawn positions at all and now hand back a distance, which is a
 *   different kind of thing from a card effect's patch and reads badly next to four of them.
 *
 * `core/traps.js` still owns the **list**: what is on which square, which entries block, which one a
 * walk hits first. So the three modules split cleanly: the list, the placement, the consequence.
 */

import { TRACK_LENGTH } from "../../board.js";
import { pawnsOnSquares } from "../../displacement.js";
import { shove } from "../../enter.js";
import { squareRun } from "../../path.js";
import { turnsForRounds } from "../../statuses.js";
import { TRAP_KIND, placeTrap } from "../../traps.js";
import { worldIn } from "../context.js";

/** How long a Big Ah Rock stands, in rounds. Three, as the rulebook has always said. */
export const BIG_ROCK_ROUNDS = 3;

/** How far Big Ah Rock knocks the enemy pawn behind it. */
export const KNOCKBACK = 3;

/** One object placed on the target square, as a patch. */
function place(context, kind, until = null) {
  return {
    traps: placeTrap(context.traps, {
      kind,
      square: context.target.square,
      owner: context.actor,
      until,
    }),
  };
}

/** Lay a Banana Peel on a track square. */
export function bananaPeel(context) {
  return place(context, TRAP_KIND.BANANA_PEEL);
}

/** Lay an Oil Spill on a track square. */
export function oilSpill(context) {
  return place(context, TRAP_KIND.OIL_SPILL);
}

/** Lay an It's Not That Deep on a track square. */
export function notThatDeep(context) {
  return place(context, TRAP_KIND.NOT_THAT_DEEP);
}

/**
 * The nearest enemy pawn behind `square`, or `null`.
 *
 * "Behind" needs no per-player logic, and that is worth one comment because it looks as though it
 * should. `absoluteSquare(player, r)` increases with `r` for **all four** seats, so every pawn walks
 * the ring in the same direction and "against the placing player's direction of travel" is simply
 * `-1`.
 *
 * The run is `TRACK_LENGTH - 1` squares and not the whole ring, so it stops one short of the rock's own
 * square. `pawnsOnSquares` answers in the order the squares were given, so the first foreign pawn in
 * the list is the nearest one behind and "first hit wins" costs nothing.
 */
function pawnBehind(context, square) {
  const behind = squareRun(square, -1, TRACK_LENGTH - 1);
  const found = pawnsOnSquares(context.pawns, behind).find((pawn) => pawn.player !== context.actor);

  return found === undefined ? null : { player: found.player, pawn: found.pawn };
}

/**
 * Drop a Big Ah Rock on a track square, and knock the pawn behind it back.
 *
 * A blocker with a deadline, unlike Rock, which is a status on a pawn and walks with it. The two are
 * stored differently because of what they are attached to, and `blockedSquares` reads both.
 *
 * **It does not move whoever is standing on the square.** A blocker stops pawns arriving and passing; a
 * pawn already there keeps standing there and can walk off, which is the only reading that does not
 * need a rule about which direction it is allowed to leave in.
 *
 * **The knockback is separate from that and is new in issue #45.** The rulebook has always said "a
 * square becomes a boulder for 3 turns, **and the enemy pawn directly behind you is knocked back 3**",
 * and only the first half was built. The pawn it hits is the one the boulder has just trapped, which is
 * what makes the two halves one card rather than two effects sharing a name.
 *
 * The rock is placed **before** the knockback resolves, so the push happens on the board the card has
 * already changed. It makes no difference today, since the victim is pushed away from the rock rather
 * than towards it, but a push resolved against a board that does not yet contain the thing the same card
 * just put down is the kind of ordering that is wrong the moment anything else moves.
 */
export function bigAhRock(context) {
  const until = context.turnNumber + turnsForRounds(BIG_ROCK_ROUNDS, context.playerCount);
  const placed = place(context, TRAP_KIND.BIG_AH_ROCK, until);

  const victim = pawnBehind(context, context.target.square);
  if (victim === null) return placed;

  // Through `shove` rather than a bare clamp, so the knockback respects blockers, resolves a capture, and
  // can set off a trap of its own. A boulder that shunted a pawn on top of another one would be laying
  // a corruption the rest of the rules cannot read.
  return { ...placed, ...shove({ ...worldIn(context), traps: placed.traps }, victim, -KNOCKBACK) };
}
