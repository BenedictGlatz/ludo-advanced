/**
 * What happens when a pawn walks into something. Issue #45, requirement FR-30.
 *
 * Pure `core/`: no DOM, no state object. Randomness only through the injected `rng` (NFR-09).
 *
 * ## Why this is its own module
 *
 * `fireTrap` used to live in `core/cards/effects/trap-effects.js`, whose header already argued that it
 * "is not a card effect at all": it is called from move resolution, and the pawn it fires at is whoever
 * walked into it rather than a target somebody chose. That argument was thin at 145 lines. Two things
 * made it decisive in issue #45:
 *
 * 1. Big Ah Rock gained a knockback, so `trap-effects.js` has to call `core/enter.js`, and `core/enter.js`
 *    has to call this. Leaving both in one file is an import cycle.
 * 2. The line budget. `trap-effects.js` keeps the four placement effects and stays readable.
 *
 * ## No trap kind writes a pawn position any more
 *
 * This is the seam worth naming, and it is what the whole of issue #45 hangs off. `fireTrap` returns
 * the two lists it can change plus **how far the pawn is to be pushed**, as a number:
 *
 * ```js
 * { statuses, traps, slide }   // slide is 0 when the trap moves nothing
 * ```
 *
 * One place performs the displacement, and it is the place that also knows about blockers and captures
 * (`core/slide.js`, reached through `core/enter.js`). Before this, each trap kind moved the pawn itself
 * with the old `displace`, which checked neither, so a slide could pass through a boulder and land on top of an
 * occupied square. Three rules each doing their own arithmetic is three chances to get it wrong; one
 * number handed to one walker is none.
 *
 * ## A trap fires on crossing, not only on landing
 *
 * The reason is worth keeping next to the code: a trap that only fired on an exact landing would almost
 * never fire, because a D20 crosses twenty squares and lands on one. The skill squares work the other
 * way round, on landing only, and that difference is deliberate. A skill square is a reward, so making
 * it collectable in bulk with the biggest die would undo the point of the dice pool. A trap is a
 * punishment, and a punishment you can jump over is not one.
 */

import { rollDie } from "./dice-source.js";
import { STATUS, addStatus, turnsForRounds } from "./statuses.js";
import { TRAP_KIND, isBlocker, removeTrap } from "./traps.js";

/** How long a Banana Peel's stun lasts, in rounds. One: the pawn loses its next turn and no more. */
export const STUN_ROUNDS = 1;

/**
 * How far It's Not That Deep pushes back, and the slide Oil Spill gives.
 *
 * **The pushback is a fixed 1 and used to be a D6.** The rulebook and the printed card both say "the
 * pawn that steps on it moves 1 square back", and the joke on the card is the whole point: a huge alarm
 * for a tiny consequence. A D6 averaging 3.5 made it the second harshest trap in the game and left the
 * card's name meaning nothing.
 *
 * It also stops the trap drawing from the RNG at all, which is why several scripted-roll tests had to be
 * re-counted when this changed.
 */
export const NOT_THAT_DEEP_PUSHBACK = 1;
export const OIL_SLIDE = Object.freeze({ min: 3, max: 5 });

/**
 * The turn number a stun applied now must last until.
 *
 * `hasStatus` applies while `turnNumber < until` and `expireStatuses` runs at the start of every turn,
 * so `until` has to be strictly greater than the turn we want the pawn to miss.
 *
 * **Hence the `+ 1`, and it is not an off-by-one.** A trap sprung during a dice move fires under the
 * *active* seat's own pawn, so the turn to be missed is `turnNumber + playerCount`, and `until` must
 * exceed it. A trap sprung by a card can catch another seat's pawn, whose next turn is sooner than a
 * full round away; the same deadline still costs it exactly one turn, because the turn after that is
 * `turnNumber + playerCount + 1` or later, which the deadline no longer covers. One expression is
 * correct in both cases, which is why there is no branch here.
 */
function stunUntil(turnNumber, playerCount) {
  return turnNumber + turnsForRounds(STUN_ROUNDS, playerCount) + 1;
}

/** Banana Peel: the pawn is stunned and loses its next turn. It is not moved. */
function stun({ statuses, mover, turnNumber, playerCount }) {
  return {
    statuses: addStatus(statuses, {
      kind: STATUS.STUNNED,
      player: mover.player,
      pawn: mover.pawn,
      until: stunUntil(turnNumber, playerCount),
      source: "action-banana-peel",
    }),
    slide: 0,
  };
}

/** It's Not That Deep: the pawn is pushed back one square. Draws no die. */
function pushBack({ statuses }) {
  return { statuses, slide: -NOT_THAT_DEEP_PUSHBACK };
}

/**
 * Oil Spill: the pawn slides forwards and is marked as having slid.
 *
 * The status rather than a flag returned to the caller, and the reason is that it is also the honest
 * record: the pawn *did* slide this turn, so the view can say so and `skillSquareChanges` can read it
 * two steps later without anything having to be threaded through.
 */
function slip({ statuses, mover, turnNumber, rng }) {
  // 3 to 5 squares: a D3 rolled and offset, so the slide is still one draw from the injected RNG.
  const slide = OIL_SLIDE.min + rollDie(OIL_SLIDE.max - OIL_SLIDE.min + 1, rng) - 1;

  return {
    statuses: addStatus(statuses, {
      kind: STATUS.SLIPPERY,
      player: mover.player,
      pawn: mover.pawn,
      until: turnNumber + 1,
      source: "action-oil-spill",
    }),
    slide,
  };
}

/** One rule per trap kind. A table and not a `switch`, so the check below can read it. */
const TRAP_RULES = Object.freeze({
  [TRAP_KIND.BANANA_PEEL]: stun,
  [TRAP_KIND.NOT_THAT_DEEP]: pushBack,
  [TRAP_KIND.OIL_SPILL]: slip,
});

/**
 * Runs at import. A fifth trap kind that nobody wrote a rule for stops the game at **boot**, naming
 * itself, rather than on the turn somebody happens to walk into one.
 *
 * This replaces a closed `switch` whose `default:` returned everything untouched. That branch existed
 * for blockers, which are in the same list and never fire, and it therefore also swallowed a missing
 * rule in complete silence. The pattern is `assertCatalogue`'s: check the table against the vocabulary
 * once, at the moment the module loads, so the failure lands on the day the kind was added.
 */
for (const kind of Object.values(TRAP_KIND)) {
  if (!isBlocker(kind) && !Object.hasOwn(TRAP_RULES, kind)) {
    throw new Error(`trap kind "${kind}" has no rule in core/trap-fire.js`);
  }
}

/**
 * One trap goes off under one pawn.
 *
 * Returns `{ statuses, traps, slide }`. The caller performs the displacement, because only it can see
 * blockers and captures.
 *
 * **The trap is removed whether or not it changed anything.** A trap is single use, and a trap that
 * survived because the pawn it caught happened to be unmovable would sit there being a surprise twice.
 *
 * **A blocker reaching here throws.** Nothing should ever walk onto one, because `blockedSquares`
 * refuses the move first, and `firstTrapOnPath` skips blockers besides. Two guards already stand
 * between a blocker and this function, so arriving anyway means one of them broke, and that is worth an
 * exception rather than a silent no-op that hides which.
 */
export function fireTrap({ statuses, traps, trap, mover, turnNumber, playerCount, rng }) {
  const rule = TRAP_RULES[trap.kind];
  if (rule === undefined) {
    throw new Error(`core/trap-fire.js was asked to fire "${trap.kind}", which is not a trap`);
  }

  // A bad playerCount would make the stun deadline NaN, and a NaN deadline expires immediately, so the
  // stun would silently never apply. Checked here because this is the only argument nothing else reads.
  if (!Number.isInteger(playerCount) || playerCount < 1) {
    throw new RangeError(`playerCount must be a positive integer, got ${playerCount}`);
  }

  const { statuses: next, slide } = rule({ statuses, mover, turnNumber, playerCount, rng });

  return { statuses: next, traps: removeTrap(traps, trap.square), slide };
}
