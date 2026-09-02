/**
 * Where a pawn that was pushed actually stops. Issue #45, requirement FR-30.
 *
 * Pure `core/`: no DOM, no state object, no randomness.
 *
 * ## Why this is not in `displacement.js`
 *
 * That module's header says, in so many words, that it "checks nothing about legality, because the card
 * is the authority", and enforces only the two things that are properties of the board rather than of
 * any rule. **That sentence is the reason eleven cards can safely call it**, and it would stop being
 * true the moment blockers and captures were added to it.
 *
 * So `displace` stays blunt and this module is the careful one. A trap that shoves a pawn is not a card
 * being deliberately blunt, it is the board resolving a consequence, and a consequence has to leave the
 * board in a state the rest of the rules can read.
 *
 * ## The bug this exists to close
 *
 * Before issue #45 an Oil Spill slide or a Yeet could put a pawn onto a square that already held one and
 * simply leave both there. Two pawns of *different* players on one square is caught later:
 * `captureTarget` throws, because FR-11 makes it impossible. Two pawns of the **same** player is not
 * caught at all, because that function filters to opponents, so the board would be quietly corrupt, and
 * inside a house column it would break the FR-05 win condition several turns later.
 *
 * ## A pushed pawn stops on the square before anything it cannot share
 *
 * Three things count as impassable, and the first two are not a new rule:
 *
 * | What | Why | Where the rule already lives |
 * | --- | --- | --- |
 * | A Rock or a Big Ah Rock | Nothing crosses or lands on one while it stands | `blockedSquares` |
 * | A pawn of the pushed pawn's own player | Two of one player's pawns may not share a square (FR-12), and in a house that is what forces the four pawns onto the four house squares | `isSameSquare`, and `ownPawnBlocking` for an ordinary move |
 * | A pawn carrying `STATUS.ARMOURED` | Built Different, and Lock In's "immune to capture and to forced movement" | `moveOnto`, which already reasons that "a pawn that cannot be captured cannot be landed on either, because the alternative is two pawns sharing a square" |
 *
 * **One walk and one rule.** The rejected alternative was to let the slide pass over these and only
 * refuse to *stop* on them, stepping back a square at a time until it found somewhere legal. That needs
 * a loop whose retreat can itself be blocked, so it is three rules where this is one, and it can move a
 * pawn backwards out of a forward slide, which no card says happens.
 *
 * ## Going home is never a slide
 *
 * `sendHome` is a different function and stays one. That is not tidiness, it is how the rule "a captured
 * pawn sets off nothing" is implemented: not as a filter somewhere, but by the two paths being separate.
 * Walking a pawn from `r = 17` to `r = 0` would otherwise count seventeen squares backwards and fire
 * whatever was standing on them.
 */

import { HOME_R, REGION, START_R, absoluteSquare, isSameSquare, region } from "./board.js";
import { captureTarget, resolveCapture } from "./capture.js";
import { PUSHBACK_FLOOR, pawnsOnSquare } from "./displacement.js";
import { withPawnAt } from "./pawns.js";
import { STATUS, hasStatus } from "./statuses.js";
import { blockedSquares } from "./traps.js";

/** The pawn `ref` names, or `undefined`. */
function pawnFor(pawns, ref) {
  return pawns.find((entry) => entry.player === ref.player && entry.pawn === ref.pawn);
}

/**
 * May the pawn `ref` neither cross nor stop on relative position `r`?
 *
 * `blocked` is passed in rather than recomputed, because it is the same list for every step of one
 * walk and it reads every pawn to build.
 *
 * The order of the three checks is not arbitrary. The own-pawn test uses `isSameSquare`, which is the
 * only one of the three that works in a house column, and it is asked before the two track-only tests
 * so that a house square is answered correctly and then returns early.
 */
function impassable(pawns, board, ref, r, blocked) {
  const arriving = { player: ref.player, r };

  const own = pawns.some(
    (entry) =>
      entry.player === ref.player && entry.pawn !== ref.pawn && isSameSquare(arriving, entry)
  );
  if (own) return true;

  if (region(r) !== REGION.TRACK) return false;

  const square = absoluteSquare(ref.player, r);
  if (blocked.includes(square)) return true;

  return pawnsOnSquare(pawns, square).some((entry) =>
    hasStatus(board.statuses, STATUS.ARMOURED, entry)
  );
}

/**
 * The relative position a push of `delta` really ends on.
 *
 * The clamp is `displace`'s and is deliberately identical: forwards is capped at `HOME_R`, backwards
 * stops at `PUSHBACK_FLOOR` so a pushback never substitutes for a capture, and a pawn in its start area
 * does not move at all. Only after the clamp does the walk look for something in the way, so a slide
 * cannot be blocked by a square it was never going to reach.
 *
 * Answers the pawn's current position when it cannot move, which makes "did anything happen" a
 * comparison the caller can make rather than a flag this has to return.
 */
export function slideStop(pawns, board, ref, delta) {
  const pawn = pawnFor(pawns, ref);
  if (pawn === undefined) return START_R;
  if (pawn.r === START_R || delta === 0) return pawn.r;

  const target = Math.min(HOME_R, Math.max(PUSHBACK_FLOOR, pawn.r + delta));
  const step = target >= pawn.r ? 1 : -1;
  const blocked = blockedSquares(pawns, board);

  let stop = pawn.r;
  for (let r = pawn.r + step; r !== target + step; r += step) {
    if (impassable(pawns, board, ref, r, blocked)) break;
    stop = r;
  }

  return stop;
}

/**
 * One pawn pushed, and whatever it landed on resolved.
 *
 * Returns `{ pawns, from, to, captured }`. `from` and `to` are there because the caller needs the walk
 * the pawn actually took to ask what it crossed, and only this function knows where the push stopped.
 * `captured` is a pawn reference or `null`.
 *
 * The capture is written before the mover, which is the order `applyMove` uses. The two touch different
 * pawns so the result is the same either way; matching the existing order means one less thing that has
 * to be true for the two paths to agree.
 */
export function slidePawn(pawns, board, ref, delta) {
  const from = slideStop(pawns, board, ref, 0);
  const to = slideStop(pawns, board, ref, delta);

  if (to === from) return { pawns, from, to, captured: null };

  const captured = captureTarget(pawns, ref.player, to);
  const cleared = captured === null ? pawns : resolveCapture(pawns, captured);

  return {
    pawns: withPawnAt(cleared, ref, to),
    from,
    to,
    captured: captured === null ? null : { player: captured.player, pawn: captured.pawn },
  };
}
