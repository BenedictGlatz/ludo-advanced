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
 * | It's Not That Deep | A trap | The pawn is pushed back |
 * | Big Ah Rock | A blocker | Nothing passes it while it stands |
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

import { turnsForRounds } from "../../statuses.js";
import { TRAP_KIND, placeTrap } from "../../traps.js";

/** How long a Big Ah Rock stands, in rounds. */
export const BIG_ROCK_ROUNDS = 2;

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
 * Drop a Big Ah Rock on a track square (Big Ah Rock).
 *
 * A blocker with a deadline, unlike Rock, which is a status on a pawn and walks with it. The two are
 * stored differently because of what they are attached to, and `core/move-rules.js` reads both.
 *
 * **It does not move whoever is standing there.** A blocker stops pawns arriving and passing; a pawn
 * already on the square keeps standing there and can walk off it, which is the only reading that does
 * not need a rule about which direction it is allowed to leave in.
 */
export function bigAhRock(context) {
  const until = context.turnNumber + turnsForRounds(BIG_ROCK_ROUNDS, context.playerCount);

  return place(context, TRAP_KIND.BIG_AH_ROCK, until);
}
