/**
 * The one module that knows both shapes: the game state and a card's context. Issue #38, FR-26.
 *
 * Imports `core/`, never `ui/` (NFR-01). Holds no rules of its own.
 *
 * ## Why a translator exists at all
 *
 * `core/` may not know the shape of the state object (NFR-01), so a card effect takes a flat snapshot
 * and returns a flat patch. Something has to build the snapshot and write the patch back, and that
 * something is this file. It is the **only** place in the project where the two shapes meet, which is
 * the whole point: 29 effects are unit testable with three literals each, and one module carries the
 * translation.
 *
 * ```
 * state  --contextFor-->  snapshot  --effect-->  patch  --applyPatch-->  state
 * ```
 *
 * ## Two of the patch fields are not board state
 *
 * `negate` and `cancelMove` are instructions, and `applyPatch` deliberately does not act on either.
 * They are returned to the caller, because both are decisions about something an effect cannot see:
 * `negate` is about the reaction window and `cancelMove` is about the declared move. Silently dropping
 * them would make Nühü and Ghost Mode do nothing, so `applyPatch` hands them back and
 * `reaction-window.js` acts on them.
 *
 * ## The target check is here and not in 29 effects
 *
 * A card's `targets` list says what the player has to point at. `checkTarget` is the one place that
 * checks it, so every effect may read `context.target.pawn` without guarding it. That is 29 guards
 * saved, and more importantly one place for the rule rather than 29 chances to write it differently.
 */

import { PAWNS_PER_PLAYER, TRACK_LENGTH } from "../core/board.js";
import { assertPatch, createContext } from "../core/cards/context.js";
import { effectFor } from "../core/cards/effects/index.js";
import { TARGET } from "../core/cards/vocabulary.js";
import { cardById } from "../core/cards/catalogue.js";
import { discardCard } from "../core/skill-pool.js";
import { REJECTED } from "./rejections.js";

/**
 * The snapshot of `state` that one played card sees.
 *
 * The entry is `{ seat, cardId, target }`, which is the shape a card play has everywhere: in
 * `pendingCard`, in a window's `played` list, and in the intent that created it. **`seat` becomes
 * `context.actor`**, and the rename is the point: the state calls it the seat that played the card,
 * and an effect calls it the actor, because an effect does not know what a seat is.
 */
export function contextFor(state, { seat, target = {} }, deps) {
  return createContext({
    pawns: state.pawns,
    seats: state.seats,
    playerCount: state.playerCount,
    turnNumber: state.turnNumber,
    activePlayer: state.activePlayer,
    actor: seat,
    target,
    chosenDie: state.chosenDie,
    roll: state.roll,
    modifiers: state.modifiers,
    statuses: state.statuses,
    traps: state.traps,
    skillSquares: state.skillSquares,
    hands: state.skillHands,
    pool: state.skillPool,
    discard: state.skillDiscard,
    pendingMove: state.pendingMove,
    cardBudget: state.cardBudget,
    reactionsLocked: state.reactionsLocked,
    rng: deps.rng,
  });
}

/** The state fields a patch field writes to. The whole of the mapping, in one place. */
const FIELD_FOR = Object.freeze({
  pawns: "pawns",
  modifiers: "modifiers",
  statuses: "statuses",
  traps: "traps",
  skillSquares: "skillSquares",
  hands: "skillHands",
  pool: "skillPool",
  discard: "skillDiscard",
  cardBudget: "cardBudget",
  reactionsLocked: "reactionsLocked",
});

/**
 * Run one card's rule and turn its answer into a changes object.
 *
 * Returns `{ changes, negate, cancelMove }`. The caller spreads `changes` into `nextState` and decides
 * what to do about the two instructions.
 */
export function resolveCard(state, entry, deps) {
  const context = contextFor(state, entry, deps);
  const patch = assertPatch(effectFor(entry.cardId)(context), entry.cardId);

  const changes = {};
  for (const [from, to] of Object.entries(FIELD_FOR)) {
    if (Object.hasOwn(patch, from)) changes[to] = patch[from];
  }

  return { changes, negate: patch.negate === true, cancelMove: patch.cancelMove === true };
}

/**
 * The card leaves the hand and goes to the discard pile, as a changes object.
 *
 * Done when the card is **played**, not when its effect resolves. That matters for a card sitting in an
 * open reaction window: it has left the hand, it cannot be played again, and it may still be cancelled
 * by Nühü. A cancelled card stays in the discard pile, which is right. It was played.
 */
export function discardChanges(state, seat, cardId) {
  const result = discardCard(state.skillHands[seat] ?? [], state.skillDiscard, cardId);

  return {
    skillHands: { ...state.skillHands, [seat]: result.hand },
    skillDiscard: result.discard,
  };
}

/** Is `ref` a real pawn of a real seat? Whose it is, is the caller's question. */
function isPawnRef(state, ref) {
  if (typeof ref !== "object" || ref === null) return false;
  if (!state.seats.includes(ref.player)) return false;

  return Number.isInteger(ref.pawn) && ref.pawn >= 0 && ref.pawn < PAWNS_PER_PLAYER;
}

/**
 * One target kind checked. `true` when the player pointed at something the card can act on.
 *
 * `OWN_PAWN` and `ENEMY_PAWN` both read `target.pawn` and differ only in whose it must be. Sharing the
 * key rather than having `ownPawn` and `enemyPawn` is what lets an effect read `context.target.pawn`
 * without knowing which of the two its own card asked for.
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
      return Number.isInteger(target.square) && target.square >= 0 && target.square < TRACK_LENGTH;
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
 * The smallest die a card can be played on, for the one card that has a floor.
 *
 * 67 says "roll a 6". On a D2 or a D4 that is not unlikely, it is impossible, so the card is not
 * playable at all when the chosen dice card has fewer than six faces. That is a playability rule and not
 * a target, which is why it cannot live in the catalogue's `targets` list.
 *
 * A table rather than a special case in the handler, so the second card that needs one is a line here.
 */
export const MINIMUM_DIE = Object.freeze({ "action-sixty-seven": 6 });

/**
 * Can this card be played at all, right now, leaving aside the target and the budget?
 *
 * Returns `null` or a rejection reason. Separate from `checkTarget` because the two answer different
 * questions and the player needs to be told which: "that card cannot do anything with a D4" is not the
 * same message as "you have not picked a pawn yet".
 */
export function checkPlayable(state, cardId) {
  const minimum = MINIMUM_DIE[cardId];

  if (minimum !== undefined && (state.chosenDie ?? 0) < minimum) {
    return REJECTED.CARD_NOT_PLAYABLE_NOW;
  }

  return null;
}
