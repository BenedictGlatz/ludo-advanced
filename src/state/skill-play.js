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
 * ## Two of the patch fields are not board state, and a third is not a rule
 *
 * `negate` and `cancelMove` are instructions, and this file deliberately does not write either into
 * state. They are returned to the caller, because both are decisions about something an effect cannot
 * see: `negate` is about the reaction window and `cancelMove` is about the declared move. Silently
 * dropping them would make Nühü and Ghost Mode do nothing, so they are handed back and
 * `reaction-window.js` acts on them.
 *
 * `trapFired` is the odd one. It arrives in a patch like the two above, but it **is** written into
 * state, because it is a report the view has to be able to read: a card that shoves a pawn can set off
 * a trap, and the player has to be told. `core/enter.js` carries the reason it cannot be derived.
 *
 * ## The target check is one place and not 29, and it now lives next door
 *
 * A card's `targets` list says what the player has to point at, and `checkTarget` is the one place that
 * checks it, so every effect may read `context.target.pawn` without guarding it. That is 29 guards
 * saved, and more importantly one place for the rule rather than 29 chances to write it differently.
 *
 * **It moved to `card-legality.js` in issue #45** and is re-exported from the foot of this file, so no
 * caller changed. That module's header carries the reason for the split.
 */

import { assertPatch, createContext } from "../core/cards/context.js";
import { effectFor } from "../core/cards/effects/index.js";
import { discardCard } from "../core/skill-pool.js";
import { nullifiedBy } from "./card-legality.js";

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

  /**
   * `core/enter.js`'s report, so a trap a **card** set off is announced too (issue #45).
   *
   * Yeet, Aight Imma Head Out and Let Him Cook all shove a pawn, and since issue #45 a shove fires
   * traps. Without this line those firings would change the board and say nothing, which is the one
   * thing the report exists to prevent.
   */
  trapFired: "trapFired",
});

/**
 * Run one card's rule and turn its answer into a changes object.
 *
 * Returns `{ changes, negate, cancelMove, nullified }`. The caller spreads `changes` into `nextState`
 * and decides what to do about the instructions.
 *
 * ## The It's Not That Deep aura is checked here, and this is the only place it could be
 *
 * An offensive card aimed within three squares of an It's Not That Deep does nothing. Two seams were
 * considered and rejected before this one:
 *
 * - **Inside the effect.** Impossible in the shape the effects have: an effect is a pure function of a
 *   context snapshot returning a patch, and there is no way for the board to tell it "do nothing".
 *   Twenty-nine effects would each have to ask, which is the opposite of why `checkTarget` is one place.
 * - **The `negate` instruction and `reaction-window.js`.** `negate` only reaches anything while a window
 *   is open, and an offensive card played when nobody can react resolves immediately in
 *   `playActionCard` with no window in existence. Half the plays would slip past. `negate` is also
 *   produced by an effect somebody played, and nothing plays the aura, so carrying it that way would
 *   mean minting a phantom card play and putting a fictional entry in the discard pile.
 *
 * This function is the single place any card's rule actually runs: `playActionCard` calls it once, and
 * `closeWindow` calls it per played card and again for the card that opened the window. One check here
 * covers every path, and it reads the board **at resolve time**, which is the honest reading of an aura.
 *
 * **The card is spent, not refused.** That matches the decision `discardChanges` already carries: a
 * cancelled card stays in the discard pile, because it was played. The player could not see the trap,
 * and losing the card is the punishment the trap exists for. Because it is spent silently, the caller
 * has to be able to say so, which is why `nullified` is returned rather than swallowed.
 */
export function resolveCard(state, entry, deps) {
  if (nullifiedBy(state, entry) !== null) {
    return { changes: {}, negate: false, cancelMove: false, nullified: true };
  }

  const context = contextFor(state, entry, deps);
  const patch = assertPatch(effectFor(entry.cardId)(context), entry.cardId);

  const changes = {};
  for (const [from, to] of Object.entries(FIELD_FOR)) {
    if (Object.hasOwn(patch, from)) changes[to] = patch[from];
  }

  return {
    changes,
    negate: patch.negate === true,
    cancelMove: patch.cancelMove === true,
    nullified: false,
  };
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

/**
 * Re-exported so every existing caller and test kept working when the legality half moved out.
 *
 * `intents-cards.js`, `reaction-window.js`, `ui/target-picker.js` and `skill-play.test.js` all read
 * these from here, and none of them was edited by the split. The precedent is `move-rules.js`, which
 * re-exports `TRAP_KIND` and `blockedSquares` for the same reason.
 *
 * The seam is in `card-legality.js`'s header: this file translates between two shapes, that one answers
 * whether a play is legal, and the two never spoke to each other.
 */
export { MINIMUM_DIE, checkPlayable, checkTarget, pickableSquares } from "./card-legality.js";
