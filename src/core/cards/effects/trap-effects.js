/**
 * The three cards that put something on a square, and what happens when a pawn touches it.
 * Issue #38, requirements FR-26, FR-28 and FR-30.
 *
 * Pure `core/`. Three placement functions, each taking a snapshot and returning a patch like every
 * other effect. **This file only puts things down.** What happens when a pawn walks into one of them
 * is `core/trap-fire.js`, and how far the pawn then travels is `core/slide.js`.
 *
 * | Card | What it puts down | What it does when touched |
 * | --- | --- | --- |
 * | Banana Peel | A trap | The pawn is stunned and loses its next turn |
 * | Oil Spill | A trap | The pawn slides 3 to 5 further and skips the skill square it lands on |
 * | It's Not That Deep | A trap | The pawn is pushed back one square |
 *
 * **Big Ah Rock was the fourth row until issue #90.** It dropped a blocker on a square; it now turns one
 * of the caster's own pawns to stone, like Rock, and lives in `status-effects.js` with it. That also
 * took the knockback and this file's reach into `core/enter.js` with it, so the module is back to what
 * its name says.
 *
 * ## Why `fireTrap` left this file in issue #45
 *
 * It was here because a trap's behaviour belongs with the card that laid it, and that was a fair
 * argument while the file was small and the two halves did not need each other. The firing rules
 * stopped writing pawn positions at all and now hand back a distance, which is a different kind of
 * thing from a card effect's patch and reads badly next to three of them.
 *
 * `core/traps.js` still owns the **list**: what is on which square, which one a walk hits first. So the
 * three modules split cleanly: the list, the placement, the consequence.
 */

import { TRAP_KIND, placeTrap } from "../../traps.js";

/** One object placed on the target square, as a patch. */
function place(context, kind) {
  return {
    traps: placeTrap(context.traps, {
      kind,
      square: context.target.square,
      owner: context.actor,
      until: null,
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
