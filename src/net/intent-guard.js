/**
 * What a guest may ask the host for. Issue #42, FR-42.
 *
 * `net/` may import `core/` and `state/`, never `ui/` or `i18n/`. Pure: a state, an intent and the seats
 * the sender holds go in, and a refusal key or `null` comes out.
 *
 * ## Why a guard at all, when `dispatch` already checks everything
 *
 * `dispatch` knows the rules and re-checks every intent against the host's state anyway. What it does
 * **not** know is two things only the network side can know:
 *
 * - **Who sent it.** A `choose-die` is legal in the choose phase whoever dispatches it, because in a
 *   hot-seat match there is one screen and the person at it is the active player by construction. Online
 *   that is no longer true, so "is it this guest's turn" is a question the rules never had to ask.
 * - **What the loop owns.** `roll-die`, `close-window` and `end-turn` are the host loop's and the host
 *   clock's to dispatch. A guest sending one would roll twice or shut a window early, and `dispatch`
 *   would accept it as perfectly legal.
 *
 * The guard adds exactly those two questions and nothing else. Every rule question is still `dispatch`'s.
 *
 * ## The table, every row unit tested
 *
 * | Intent from a guest | Allowed when | Otherwise |
 * | --- | --- | --- |
 * | `choose-die`, `select-pawn`, `commit-move` | the active player is that guest's and no window is open | `not-your-turn` |
 * | `skip-action` | as above, and `autoIntent` has nothing to take | `not-your-turn` / `loop-owned` |
 * | `play-card` | `seat` is an integer and the guest's; then `cardRefusal` decides | `not-your-seat` or the card reason |
 * | `decline-reaction` | `seat` is the guest's and in the window's `eligible` | `not-your-seat` / `not-eligible` |
 * | `roll-die`, `close-window`, `end-turn` | never | `loop-owned` |
 * | anything else | never | `unknown-intent` |
 *
 * `play-card` requires `seat` **explicitly**. `intents-cards.js` fills in `state.activePlayer` when the
 * field is missing, which is right for a click and wrong for a guest: a guest omitting the seat would be
 * playing as whoever's turn it is.
 *
 * Reasons are i18next keys under `intent.rejected.*`, like every refusal in `state/`, so the guest's
 * message strip can print them.
 */

import { autoIntent, isLoopOwned } from "../state/auto-steps.js";
import { INTENT, REJECTED } from "../state/intents.js";
import { INTENT_CARD, cardRefusal } from "../state/intents-cards.js";

/** The three refusals only the network side can give. The others are `state/`'s own. */
export const GUEST_REFUSED = Object.freeze({
  /** A turn intent while it is somebody else's turn, or while a window is open. */
  NOT_YOUR_TURN: REJECTED.NOT_YOUR_TURN,
  /** A card intent naming a seat this guest does not hold. */
  NOT_YOUR_SEAT: "intent.rejected.not-your-seat",
  /** One of the intents the host's loop and clock dispatch themselves. */
  LOOP_OWNED: "intent.rejected.loop-owned",
  /** The host has the match paused. Answered by the session, not by this guard. */
  PAUSED: "intent.rejected.paused",
});

const TURN_INTENTS = [INTENT.CHOOSE_DIE, INTENT.SELECT_PAWN, INTENT.COMMIT_MOVE];

/** Is it this guest's turn, with no window in the way? */
function ownTurn(state, guestSeats) {
  return state.reactionWindow === null && guestSeats.includes(state.activePlayer);
}

/** Does the intent name a seat, as an integer, that this guest holds? */
function ownSeat(intent, guestSeats) {
  return Number.isInteger(intent.seat) && guestSeats.includes(intent.seat);
}

/**
 * Why the host must not hand this intent to its loop, or `null` when it may.
 *
 * `guestSeats` is the list of seats the sending guest holds. One seat in v1, and a list because the
 * transport is per connection and nothing here should have to change if a connection ever carries two.
 */
export function guestIntentRefusal(state, intent, guestSeats) {
  if (intent === null || typeof intent !== "object") return REJECTED.UNKNOWN_INTENT;
  if (isLoopOwned(intent.type)) return GUEST_REFUSED.LOOP_OWNED;

  if (TURN_INTENTS.includes(intent.type)) {
    return ownTurn(state, guestSeats) ? null : GUEST_REFUSED.NOT_YOUR_TURN;
  }

  if (intent.type === INTENT.SKIP_ACTION) {
    if (!ownTurn(state, guestSeats)) return GUEST_REFUSED.NOT_YOUR_TURN;
    // The loop skips an action phase with nothing playable by itself, so a guest's skip in that moment
    // is a duplicate of a step the host is already taking.
    return autoIntent(state) === null ? null : GUEST_REFUSED.LOOP_OWNED;
  }

  if (intent.type === INTENT_CARD.PLAY_CARD) {
    if (!ownSeat(intent, guestSeats)) return GUEST_REFUSED.NOT_YOUR_SEAT;
    return cardRefusal(state, intent.seat, intent.cardId);
  }

  if (intent.type === INTENT_CARD.DECLINE_REACTION) {
    if (!ownSeat(intent, guestSeats)) return GUEST_REFUSED.NOT_YOUR_SEAT;
    if (state.reactionWindow === null) return REJECTED.NO_WINDOW;
    return state.reactionWindow.eligible.includes(intent.seat) ? null : REJECTED.NOT_ELIGIBLE;
  }

  return REJECTED.UNKNOWN_INTENT;
}
