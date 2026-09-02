/**
 * May this card be played at all, and did the player point at something it can act on?
 * Issue #45, requirements FR-26 and FR-30.
 *
 * Imports `core/`, never `ui/` (NFR-01). Holds no rules of its own: every question is asked of `core/`.
 *
 * ## Why this split off `skill-play.js`
 *
 * That file had two halves that never spoke to each other. One translates between the shape of the game
 * state and the shape a card effect sees, which is a single idea and a well argued one. The other
 * answers "is this play legal", which is a different question with a different audience: the intent
 * handlers ask it, and so does the target picker, which needs the answer *before* anything is dispatched.
 *
 * The seam was visible before issue #45 and the file was small enough to leave alone. Then FR-30's
 * placement rules landed entirely on the second half, which would have pushed `skill-play.js` toward
 * NFR-02's 300-line limit. Splitting at a seam that was already there beats compressing one that is not.
 *
 * **`skill-play.js` re-exports everything here**, so `intents-cards.js`, `reaction-window.js` and
 * `skill-play.test.js` needed no edit. A refactor whose callers have to change is not a refactor.
 *
 * ## Two questions, and the player needs to be told which
 *
 * `checkTarget` is about what the player pointed at; `checkPlayable` is about whether the card can do
 * anything right now regardless of a target. "That card cannot do anything with a D4" is not the same
 * message as "you have not picked a pawn yet", which is why they are separate functions rather than one
 * with a longer answer.
 */

import { PAWNS_PER_PLAYER, TRACK_LENGTH } from "../core/board.js";
import { cardById } from "../core/cards/catalogue.js";
import { TARGET } from "../core/cards/vocabulary.js";
import { placeableSquares, trapPlacementRefusal } from "../core/trap-rules.js";
import { REJECTED } from "./rejections.js";

/**
 * The smallest die a card can be played on, for the one card that has a floor.
 *
 * 67 says "roll a 6". On a D2 or a D4 that is not unlikely, it is impossible, so the card is not
 * playable at all when the chosen dice card has fewer than six faces. That is a playability rule and not
 * a target, which is why it cannot live in the catalogue's `targets` list.
 *
 * A table rather than a special case in the handler, so the second card that needs one is a line here.
 */
export const MINIMUM_DIE = Object.freeze({ "action-sixty-seven": 6 });

/** Is `ref` a real pawn of a real seat? Whose it is, is the caller's question. */
function isPawnRef(state, ref) {
  if (typeof ref !== "object" || ref === null) return false;
  if (!state.seats.includes(ref.player)) return false;

  return Number.isInteger(ref.pawn) && ref.pawn >= 0 && ref.pawn < PAWNS_PER_PLAYER;
}

/** Is `square` one of the forty shared track squares? */
function isTrackSquare(square) {
  return Number.isInteger(square) && square >= 0 && square < TRACK_LENGTH;
}

/**
 * One target kind checked. `true` when the player pointed at something the card can act on.
 *
 * `OWN_PAWN` and `ENEMY_PAWN` both read `target.pawn` and differ only in whose it must be. Sharing the
 * key rather than having `ownPawn` and `enemyPawn` is what lets an effect read `context.target.pawn`
 * without knowing which of the two its own card asked for.
 *
 * `TRACK_SQUARE` and `FREE_SQUARE` share `target.square` for the same reason, and differ in exactly one
 * thing: a free square must also be able to take an object. Janky RPG fires at a square and takes the
 * first; the four cards that leave something standing there take the second.
 */
function isTargetPresent(state, kind, target, seat) {
  switch (kind) {
    case TARGET.NONE:
      return true;
    case TARGET.OWN_PAWN:
      return isPawnRef(state, target.pawn) && target.pawn.player === seat;
    case TARGET.ENEMY_PAWN:
      return isPawnRef(state, target.pawn) && target.pawn.player !== seat;
    case TARGET.TRACK_SQUARE:
      return isTrackSquare(target.square);
    case TARGET.FREE_SQUARE:
      return (
        isTrackSquare(target.square) &&
        trapPlacementRefusal(state.pawns, state.traps, target.square) === null
      );
    case TARGET.DIRECTION:
      return target.direction === 1 || target.direction === -1;
    case TARGET.NUMBER:
      return Number.isInteger(target.number) && target.number >= 1;
    case TARGET.PLAYER:
      return state.seats.includes(target.player) && target.player !== seat;
    case TARGET.CHOICE:
      return typeof target.choice === "string" && target.choice.length > 0;
    default:
      return false;
  }
}

/**
 * Does this card have every target it needs, and are they all real?
 *
 * Returns `null` when the target is fine, or the rejection reason. Two reasons rather than one, because
 * "you have not picked a pawn yet" and "that pawn does not exist" are different situations for the
 * player: the first is a prompt and the second is a mistake.
 *
 * **A square that cannot take an object is a `BAD_TARGET`**, not a reason of its own. `core/trap-rules.js`
 * keeps the three causes apart because the view may one day want them, but the player's next action is
 * the same for all three, pick a different square, and this codebase only splits a rejection when the
 * next action differs.
 */
export function checkTarget(state, cardId, target = {}, seat) {
  const card = cardById(cardId);
  const named = Object.keys(target).length > 0;

  for (const kind of card.targets) {
    if (isTargetPresent(state, kind, target, seat)) continue;
    return named ? REJECTED.BAD_TARGET : REJECTED.NEEDS_TARGET;
  }

  return null;
}

/**
 * Can this card be played at all, right now, leaving aside the target and the budget?
 *
 * Returns `null` or a rejection reason. Separate from `checkTarget` because the two answer different
 * questions and the player needs to be told which.
 */
export function checkPlayable(state, cardId) {
  const minimum = MINIMUM_DIE[cardId];

  if (minimum !== undefined && (state.chosenDie ?? 0) < minimum) {
    return REJECTED.CARD_NOT_PLAYABLE_NOW;
  }

  return null;
}

/**
 * Which squares this card may be pointed at. What the target picker marks as clickable.
 *
 * Exists so that `ui/` never works the rule out for itself. The picker used to mark all forty track
 * squares for every square-targeting card, which was right when one card in 29 wanted a square and is
 * wrong now that five do and four of them need the square free. A view that computed the difference
 * would be a second copy of the rule, free to disagree with `checkTarget` the moment either changed.
 *
 * Answers all forty for a card that takes any square, and `null` for a card that wants no square at all,
 * so the caller can tell "every square" from "not asking about squares".
 */
export function pickableSquares(state, cardId) {
  const kinds = cardById(cardId).targets;

  if (kinds.includes(TARGET.FREE_SQUARE)) return placeableSquares(state.pawns, state.traps);
  if (kinds.includes(TARGET.TRACK_SQUARE)) {
    return Array.from({ length: TRACK_LENGTH }, (_, square) => square);
  }

  return null;
}
