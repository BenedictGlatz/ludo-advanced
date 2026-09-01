/**
 * The four cards that put something on a square, and what happens when a pawn touches it.
 * Issue #38, requirements FR-26 and FR-29.
 *
 * Pure `core/`. The four placement functions take a snapshot and return a patch, like every other
 * effect. `fireTrap` is different and the difference is worth naming: it is not a card effect at all.
 *
 * | Card | What it puts down | What it does when touched |
 * | --- | --- | --- |
 * | Banana Peel | A trap | The pawn goes back to its start area |
 * | Oil Spill | A trap | The pawn slides 3 to 5 further and skips the skill square it lands on |
 * | It's Not That Deep | A trap | The pawn is pushed back a D6 |
 * | Big Ah Rock | A blocker | Nothing passes it while it stands |
 *
 * ## Why `fireTrap` is here and not in `traps.js`
 *
 * `core/traps.js` owns the **list**: what is on which square, which entries block, which one a walk hits
 * first. It deliberately knows nothing about what any of them does, so that a fifth trap is a line there
 * and a case here.
 *
 * `fireTrap` owns the **effects**, and it is called from `state/`'s move resolution rather than from a
 * card play. That makes it the only function in `core/cards/effects/` that is not a card effect, and it
 * is here because a trap's behaviour belongs with the card that laid it. Splitting the two halves of
 * Banana Peel across two files to satisfy a naming convention would be worse.
 *
 * ## A trap fires on crossing, not only on landing
 *
 * This is the one place in the project that looks at the whole walk, and the reason it is worth the
 * exception: a trap that only fired on an exact landing would almost never fire. A D20 crosses twenty
 * squares and lands on one.
 *
 * The skill squares work the other way round, on landing only, and that difference is deliberate. A
 * skill square is a reward, so making it collectable in bulk by taking the biggest die would undo the
 * point of the dice pool. A trap is a punishment, and a punishment you can jump over is not one.
 */

import { rollDie } from "../../dice-source.js";
import { displace, sendHome } from "../../displacement.js";
import { STATUS, addStatus, turnsForRounds } from "../../statuses.js";
import { TRAP_KIND, placeTrap, removeTrap } from "../../traps.js";

/** How long a Big Ah Rock stands, in rounds. */
export const BIG_ROCK_ROUNDS = 2;

/** The die It's Not That Deep pushes back by, and the slide Oil Spill gives. */
export const NOT_THAT_DEEP_DIE = 6;
export const OIL_SLIDE = Object.freeze({ min: 3, max: 5 });

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

/**
 * One trap goes off under one pawn.
 *
 * Takes and returns the three lists it can touch, so `state/` spreads the answer into the next state.
 * Not a card effect: it is called from move resolution, and the pawn it fires at is whoever walked into
 * it rather than a target somebody chose.
 *
 * **The trap is removed whether or not it changed anything.** A trap is single use, and a trap that
 * survived because the pawn it caught happened to be unmovable would sit there being a surprise twice.
 */
export function fireTrap({ pawns, statuses, traps, trap, mover, turnNumber, rng }) {
  const cleared = removeTrap(traps, trap.square);

  switch (trap.kind) {
    case TRAP_KIND.BANANA_PEEL:
      return { pawns: sendHome(pawns, mover), statuses, traps: cleared };

    case TRAP_KIND.NOT_THAT_DEEP:
      return {
        pawns: displace(pawns, mover, -rollDie(NOT_THAT_DEEP_DIE, rng)),
        statuses,
        traps: cleared,
      };

    case TRAP_KIND.OIL_SPILL: {
      // 3 to 5 squares: a D3 rolled and offset, so the slide is still one draw from the injected RNG.
      const slide = OIL_SLIDE.min + rollDie(OIL_SLIDE.max - OIL_SLIDE.min + 1, rng) - 1;

      return {
        pawns: displace(pawns, mover, slide),
        /**
         * The pawn slid rather than walked, so the square it stops on hands out no card (FR-22).
         *
         * A status lasting exactly this turn, rather than a flag returned to the caller. Both would
         * work for the skill-square check that happens two lines later, and the status is also the
         * honest record: the pawn *did* slide this turn, and the view can say so.
         */
        statuses: addStatus(statuses, {
          kind: STATUS.SLIPPERY,
          player: mover.player,
          pawn: mover.pawn,
          until: turnNumber + 1,
          source: "action-oil-spill",
        }),
        traps: cleared,
      };
    }

    default:
      // A blocker. Nothing should ever walk onto one, because `blockedSquares` refuses the move first,
      // and a rule that relies on another rule having run is a rule that breaks when the order changes.
      return { pawns, statuses, traps };
  }
}
