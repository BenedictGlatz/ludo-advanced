/**
 * The one place a pawn enters a square. Issue #45, requirement FR-30.
 *
 * Pure `core/`: no DOM, no state object. Randomness only through the injected `rng` (NFR-09).
 *
 * ## Why a choke point, and what it replaced
 *
 * FR-30 says a trap "fires when a pawn enters that tile". Until issue #45 the trap check lived in
 * `state/skill-turn.js` and was called from exactly one place, `resolveMove`. So a trap fired for a
 * dice move and for nothing else: Yeet, Aight Imma Head Out and Let Him Cook could all push a pawn
 * straight over a Banana Peel and nothing happened. Yeet's own printed card text says "or forward onto
 * a trap, if you're feeling mean", which the game could not do.
 *
 * Moving the check behind one function is what makes "every movement" a property of the code rather
 * than a list of call sites somebody has to keep complete.
 *
 * ## A `world` is a `board` with three more fields
 *
 * ```js
 * { pawns, statuses, traps, turnNumber, playerCount, rng }
 * ```
 *
 * The first three are the lists it may change; the last three are facts it reads. It is a superset of
 * the `{ statuses, traps }` pair the movement rules call a `board`, deliberately, so it can be handed
 * straight to `slidePawn` and to `blockedSquares` with no repacking.
 *
 * ## The two halves are one idea and share a file
 *
 * `enterSquares` asks what a walk set off. `shove` performs a push and then asks the same question
 * about the walk *it* just made. They call each other, so splitting them into two modules would be an
 * import cycle rather than a seam.
 *
 * ```
 * enterSquares  ->  fireTrap  ->  slide != 0  ->  shove  ->  slidePawn  ->  enterSquares  ->  ...
 * ```
 *
 * ## Two things that deliberately set off nothing
 *
 * - **A pawn going home.** `sendHome` is a different function and never reaches here. Walking a pawn
 *   from `r = 17` to `r = 0` would otherwise count seventeen squares backwards and fire whatever stood
 *   on them, so a captured pawn would be punished on its way to being punished.
 * - **A slide that moved nothing**, because it was blocked on the very first square. There is no walk
 *   to ask about, and asking about a zero-length one would re-fire the trap that had just gone off.
 */

import { START_R } from "./board.js";
import { squaresCrossed } from "./path.js";
import { slidePawn } from "./slide.js";
import { fireTrap } from "./trap-fire.js";
import { firstTrapOnPath } from "./traps.js";

/**
 * How many traps one entry may set off.
 *
 * **The cap is not what makes the chain terminate**, and saying so is the honest version. Every firing
 * calls `removeTrap`, so each link consumes an entry and the recursion is already bounded by the length
 * of the trap list. The cap guards against a future trap kind that survives its own firing, which is
 * exactly the sort of change issue #45 itself makes plausible: It's Not That Deep now survives
 * *nullifying* something, and is only consumed by being stepped on.
 *
 * Six is the longest chain a real board can build. Three trap kinds fire, the pool holds two copies of
 * every card (`COPIES_PER_CARD`), so at most six firing traps can be on the board at once. The cap
 * therefore never truncates a legal outcome.
 *
 * On reaching it the trap is **left standing and unfired**, so the board stays honest and the player
 * can see it is still there. Rejected: a cap of 1, which is the "no chaining" the Product Owner
 * decided against; and a cap of 40, one per square, which is a number with no reason behind it.
 */
export const TRAP_CHAIN_LIMIT = 6;

/** The three lists, unpacked from a world. What both functions return when nothing happens. */
function boardOf(world) {
  return { pawns: world.pawns, statuses: world.statuses, traps: world.traps };
}

/**
 * A pawn has arrived at `toR` having come from `fromR`. The first trap on that walk goes off.
 *
 * Only the **first** one fires. A move that crosses two Banana Peels sets off the near one and stops
 * there, which is what a player expects and what keeps one move from having two outcomes. The chain is
 * a different thing: it continues from wherever the pawn was *pushed to*, along a new walk.
 */
export function enterSquares(world, ref, fromR, toR, depth = 0) {
  if (toR === START_R || world.traps.length === 0 || depth >= TRAP_CHAIN_LIMIT) {
    return boardOf(world);
  }

  const crossed = squaresCrossed(ref.player, fromR, toR);
  const trap = firstTrapOnPath(world.traps, crossed, ref);
  if (trap === null) return boardOf(world);

  const fired = fireTrap({
    statuses: world.statuses,
    traps: world.traps,
    trap,
    mover: ref,
    turnNumber: world.turnNumber,
    playerCount: world.playerCount,
    rng: world.rng,
  });

  const after = { ...world, statuses: fired.statuses, traps: fired.traps };
  if (fired.slide === 0) return boardOf(after);

  return shove(after, ref, fired.slide, depth + 1);
}

/**
 * A pawn is pushed `delta` squares without making a move, and then sets off whatever it crossed.
 *
 * The one call every card-driven movement makes, and the one the trap chain makes. `slidePawn` decides
 * where the push really ends, which is why the walk handed to `enterSquares` is read back off its
 * answer rather than computed from `delta`: a push stopped short by a boulder must not be credited with
 * squares the pawn never touched.
 */
export function shove(world, ref, delta, depth = 0) {
  const slid = slidePawn(world.pawns, world, ref, delta);
  const after = { ...world, pawns: slid.pawns };

  if (slid.from === slid.to) return boardOf(after);

  return enterSquares(after, ref, slid.from, slid.to, depth);
}
