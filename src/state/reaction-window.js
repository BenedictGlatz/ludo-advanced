/**
 * The reaction window: who may answer, and what happens when it shuts. Issue #38, FR-24 and FR-25.
 *
 * Imports `core/`, never `ui/` (NFR-01). **Measures no time at all**: see the note on the timer below.
 *
 * ## The shape of a window
 *
 * ```js
 * {
 *   trigger: "on-roll",                                  // what opened it
 *   actor: 0,                                            // whose action it is answering
 *   eligible: [1, 3],                                    // seats that may still act
 *   declined: [2],
 *   played: [{ seat: 2, cardId: "reaction-devil-die", target: {} }],
 * }
 * ```
 *
 * A window opens at three moments, and only when somebody could actually use it:
 *
 * | Trigger | Opened by | Answered by |
 * | --- | --- | --- |
 * | `on-card` | An Action card being played | Nühü, The Purge |
 * | `on-roll` | The roll, before it happens | Critical Failure, Devil Die, Hold Pawn, The Purge |
 * | `on-capture` | A declared move that would capture | Ghost Mode, Uno Reverse, The Purge |
 *
 * ## A window that nobody could use does not open
 *
 * `eligibleSeats` asks three questions of every other seat: is your card budget unspent, do you hold a
 * Reaction card whose triggers include this moment, and does that card have a rule yet. If no seat
 * answers yes to all three, `openWindow` returns `null` and the turn simply carries on.
 *
 * That is not an optimisation. A window that opened every time would put a thirty-second countdown in
 * front of every roll of a game whose ordinary turn is two clicks, and it would show a prompt to players
 * who have nothing to press.
 *
 * ## Every effect resolves when the window closes, and none before
 *
 * A card played into a window leaves its player's hand immediately and its **rule does not run** until
 * the window shuts. That one decision is what makes cancellation possible with nothing ever having to be
 * undone, and undoing an effect is not something this design could support: `pawns`, `statuses` and
 * `traps` are all replaced wholesale by a patch.
 *
 * So Nühü does not reverse anything. The window resolves the played cards first, in the order they were
 * played, and **then** the card that opened it, unless one of the reactions said not to.
 *
 * ## Where the thirty seconds are, and why they are not here
 *
 * ESLint forbids `window` and `setTimeout` in `state/`, and the reason is not tidiness: a rules layer
 * that reads a clock cannot be tested. So the countdown runs in `ui/timers.js`, and when it runs out the
 * view dispatches `close-window` exactly as it would if the last eligible player had declined. Nothing
 * here knows how long anybody took.
 */

import { TYPE } from "../core/cards/vocabulary.js";
import { cardById } from "../core/cards/catalogue.js";
import { hasEffect } from "../core/cards/effects/index.js";
import { nextState } from "./game-state.js";
import { canPlayCard } from "./skill-turn.js";
import { resolveCard } from "./skill-play.js";

/** Could `seat` play something into a window opened by `trigger`? */
export function canReact(state, seat, trigger) {
  if (!canPlayCard(state, seat)) return false;

  return (state.skillHands[seat] ?? []).some((cardId) => {
    const card = cardById(cardId);

    return card?.type === TYPE.REACTION && card.triggers.includes(trigger) && hasEffect(cardId);
  });
}

/** Every seat that could answer this moment. The actor is never one of them (FR-24). */
export function eligibleSeats(state, trigger, actor) {
  return state.seats.filter((seat) => seat !== actor && canReact(state, seat, trigger));
}

/**
 * A window, or `null` when nobody could use one.
 *
 * `null` also whenever No Take-Backsies has been played this turn: `reactionsLocked` shuts every
 * remaining window, which is the whole of that card.
 */
export function openWindow(state, trigger, actor) {
  if (state.reactionsLocked) return null;

  const eligible = eligibleSeats(state, trigger, actor);
  if (eligible.length === 0) return null;

  return { trigger, actor, eligible, declined: [], played: [] };
}

/** One seat drops out of the window, having played `entry` or nothing. */
function withoutSeat(window, seat, entry) {
  return {
    ...window,
    eligible: window.eligible.filter((other) => other !== seat),
    declined: entry === null ? [...window.declined, seat] : window.declined,
    played: entry === null ? window.played : [...window.played, entry],
  };
}

/**
 * A card is played into the open window, as a changes object.
 *
 * The seat drops out of `eligible` whatever it played, which is what makes the window terminate: every
 * play and every decline shortens the list by one, and a seat cannot rejoin. One card per player per turn
 * (FR-23) would bound it anyway; this bounds it without depending on the budget.
 */
export function recordPlay(state, entry) {
  return { reactionWindow: withoutSeat(state.reactionWindow, entry.seat, entry) };
}

/** One seat passes, as a changes object (FR-25: the window shuts as soon as everyone has). */
export function recordDecline(state, seat) {
  return { reactionWindow: withoutSeat(state.reactionWindow, seat, null) };
}

/** Has everybody who could answer answered? Then the window has nothing left to wait for. */
export function isWindowFinished(state) {
  return state.reactionWindow === null || state.reactionWindow.eligible.length === 0;
}

/**
 * Shut the window and run everything it was holding.
 *
 * Returns `{ state, trigger, cancelMove, negated }`. The **caller** decides what happens next, because
 * that depends on which moment the window interrupted and the sequence belongs to `intents.js`:
 *
 * | Trigger | What the caller does next |
 * | --- | --- |
 * | `on-card` | Nothing. The turn is still in the action phase |
 * | `on-roll` | Rolls, now that the modifiers the window collected are in place |
 * | `on-capture` | Applies the declared move, or throws it away if a card cancelled it |
 *
 * A new state per card rather than one merged patch, because each effect has to see what the one before
 * it did: two Devil Dice must both land in `modifiers`, and Tax Fraud after Pot of Greed has to see the
 * hand Pot of Greed left behind.
 */
export function closeWindow(state, deps) {
  const window = state.reactionWindow;
  let current = state;
  let negated = false;
  let cancelMove = false;
  let nullifiedCard = null;

  for (const entry of window?.played ?? []) {
    const result = resolveCard(current, entry, deps);
    current = nextState(current, result.changes);
    negated = negated || result.negate;
    cancelMove = cancelMove || result.cancelMove;
    if (result.nullified) nullifiedCard = entry.cardId;
  }

  // The card that opened the window resolves last, and only if nothing cancelled it (Nühü).
  if (state.pendingCard !== null && !negated) {
    const result = resolveCard(current, state.pendingCard, deps);
    current = nextState(current, result.changes);
    cancelMove = cancelMove || result.cancelMove;
    if (result.nullified) nullifiedCard = state.pendingCard.cardId;
  }

  // The **last** card an aura cancelled, not a list. A window resolving two nullified offensive cards
  // is possible and vanishingly rare, and one message the player can read beats a list nobody built a
  // place for. Recorded as a known simplification rather than left to be discovered.
  return {
    state: nextState(current, { reactionWindow: null, pendingCard: null, nullifiedCard }),
    trigger: window?.trigger ?? null,
    cancelMove,
    negated,
  };
}
