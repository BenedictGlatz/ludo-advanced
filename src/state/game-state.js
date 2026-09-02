/**
 * The single game-state object and the two ways it is ever built. Issue #27.
 *
 * This module may import `core/`, never `ui/` (NFR-01). It holds no rules: every rule question is
 * asked of `core/` and the answer is written here.
 *
 * ## Why the state is frozen
 *
 * Every state object this module produces is deeply frozen, and every transition builds a new one.
 * `CLAUDE.md` says `ui/` never mutates state directly and dispatches intents instead. Freezing turns
 * that from a convention into an error: ES modules run in strict mode, so an assignment to a frozen
 * object **throws** rather than being silently dropped. A view that writes to the board fails
 * immediately and in the line that did it.
 *
 * The cost is one shallow copy of a small object per transition, in a turn-based game that changes
 * state a few times per turn. That is not a performance question.
 *
 * The freezing itself is in [freeze.js](freeze.js) and is generic: it walks the whole object rather
 * than naming each field. That module carries the reason. The short version is that a hand-written
 * freeze list has to be edited whenever a field is added, and a forgotten line leaves one array
 * writable with no visible symptom, which is precisely the protection this was for.
 *
 * ## What is stored and what is derived
 *
 * Stored: the pawn positions, whose turn it is, which phase the turn is in, the drawn hand, the
 * chosen die, the roll. These cannot be recomputed from anything else.
 *
 * Derived and cached for one turn only: `legalMoves` and `refusalReason`. Both come from
 * `core/movement.js` and are written when the die is rolled, because the view needs them for
 * highlighting (FR-32) and for the refusal text (NFR-08), and recomputing them on every render would
 * put a rules call in the render path.
 *
 * Not stored at all: whether a player has won. `core/win.js` answers that from the pawn positions,
 * and a stored copy would be a second source of truth for the same fact. `winner` holds the answer
 * once the match is over, which is a record of the outcome and not a shortcut around the rule.
 *
 * `skillSquares` is stored and belongs to the match rather than the turn, because a used-up skill
 * square moves and stays moved (FR-22). It is the first field that neither describes the pawns nor is
 * wiped at the end of a turn, and `core/skill-squares.js` owns the rules for changing it.
 *
 * ## The three lifetimes a field can have, since issue #38
 *
 * Skill cards added enough fields that "stored or derived" stopped being the useful distinction.
 * What matters now is **how long a field lives**, and there are exactly three answers:
 *
 * | Lives for | Fields | Cleared by |
 * | --- | --- | --- |
 * | The match | `pawns`, `seats`, `skillSquares`, `skillPool`, `skillDiscard`, `skillHands` | nothing |
 * | Several turns | `statuses`, `traps` | their own deadline, or being used up |
 * | One turn | `hand`, `chosenDie`, `roll`, `modifiers`, `cardsPlayed`, `reactionWindow`, ... | `clearedTurnFields` |
 *
 * The middle row is the new one and it is the one worth naming. A status has a deadline in turns and
 * a trap sits on a square until something steps on it, so neither can be wiped at the end of a turn
 * and neither lasts the whole match. `core/statuses.js` and `core/traps.js` own the rules for
 * shortening them; this module only stores the lists.
 */

import { seatsFor } from "../core/board.js";
import { createPawns, pawnProgress } from "../core/pawns.js";
import { createModifiers } from "../core/roll.js";
import { INITIAL_SKILL_SQUARES } from "../core/skill-squares.js";
import { deepFreeze } from "./freeze.js";

/**
 * The turn as a state machine, matching the eight steps in section 3 of the game design document.
 *
 * A phase name says **what the game is waiting for**, which is what the view needs to know.
 */
export const TURN_PHASE = {
  /** Step 2. Nothing is drawn yet. */
  DRAW: "draw",
  /** Step 3. Three dice cards are on the table and the player must pick one (FR-18, FR-19). */
  CHOOSE: "choose",
  /**
   * Step 4. The dice card is picked and the active player may play one Action card (FR-23).
   *
   * This is the phase issue #38 added, and it sits here rather than before the dice card because the
   * Product Owner's rule is that skill cards come after the die is known. Half the Action cards
   * change the roll, and choosing whether to buff a D20 or a D4 is the decision that makes them
   * interesting.
   */
  ACTION: "action",
  /** Step 5. A card is picked, cards are played, and the die has not been rolled yet. */
  ROLL: "roll",
  /** Steps 6 and 7. The roll is known, the legal moves are computed, the player must pick one. */
  ACT: "act",
  /** Step 8. A move is committed and the reaction window is open (FR-24, FR-25). */
  REACTION: "reaction",
  /** Step 9. The move is resolved and the turn can be handed on. */
  TURN_END: "turn-end",
  /** Nothing more happens in this match. */
  MATCH_OVER: "match-over",
};

/** Whether a match is still being played, and if not, why it stopped (FR-05, FR-07). */
export const MATCH_STATUS = {
  RUNNING: "running",
  WON: "won",
  ABANDONED: "abandoned",
};

/**
 * A fresh match: `playerCount` players, four pawns each in their start areas, the first seat to
 * move, and nothing drawn yet (FR-01).
 *
 * **`seats` is stored, and `playerCount` alone is not enough.** `core/board.js` seats two players
 * opposite each other, on seats 0 and 2, so the seats in play are not `0` to `playerCount - 1` and
 * cannot be recomputed from a count without repeating that rule here. Storing the list means
 * `state/` asks `core/` once, at the start of the match, and every later question about turn order
 * reads the answer instead of deriving it again.
 *
 * **`skillSquares` is a parameter and not simply the constant**, because the skill squares are the one
 * part of the board that a match can be set up differently with. Two callers want that:
 *
 * - A test that scripts an exact sequence of rolls. `deps.rng` is drawn from twice per turn now, once
 *   for the roll and once for a skill square respawn, so a script written as a list of rolls silently
 *   shifts as soon as a pawn lands on a skill square. Handing in an empty list says "this test is
 *   about movement and turn order" instead of encoding a rule it is not testing.
 * - A Playwright spec that needs a skill square in a place its pawn will actually reach.
 *
 * The default is the real layout, so no production caller passes anything and there is no way to start
 * a match with an accidentally empty board.
 */
export function createGameState(playerCount, skillSquares = INITIAL_SKILL_SQUARES) {
  const seats = seatsFor(playerCount);

  return deepFreeze({
    playerCount,
    seats,
    status: MATCH_STATUS.RUNNING,
    activePlayer: seats[0],
    turnNumber: 1,
    phase: TURN_PHASE.DRAW,
    pawns: createPawns(playerCount),

    // Match-level and not turn-level: the board rearranges itself over the whole match (FR-22).
    skillSquares: [...skillSquares],

    /**
     * The skill card pool, the discard pile and one hand per seat (FR-27).
     *
     * The pool starts **empty** and `match.js` fills it, because shuffling needs the injected RNG and
     * this function deliberately has none. Keeping `createGameState` free of randomness means a test
     * can build a starting board with no `deps` at all, which about half of them do.
     */
    skillPool: [],
    skillDiscard: [],
    skillHands: Object.fromEntries(seats.map((seat) => [seat, []])),

    // Longer than a turn, shorter than the match: both carry their own end condition.
    statuses: [],
    traps: [],

    // Everything below is cleared at the end of every turn.
    ...clearedTurnFields(),

    winner: null,
  });
}

/**
 * The board as `core/` wants to see it: the statuses and the traps, and nothing else.
 *
 * `core/` is not allowed to know the shape of the state object (NFR-01), so every rules call that needs
 * to know about card effects takes a `board` argument instead. This is the one function that builds it,
 * which means there is one line to change the day a third kind of board effect is added, rather than
 * one line per call site in the turn manager.
 */
export function boardOf(state) {
  return { statuses: state.statuses, traps: state.traps };
}

/**
 * Everything the HUD shows about one seat (FR-36, issue #35).
 *
 * ```js
 * { start: 2, track: 1, home: 1, cards: 3 }
 * ```
 *
 * The first three come from `pawnProgress` in `core/` and always sum to four. `cards` is how many skill
 * cards the seat holds, and it is here rather than in `core/` because a hand is a state field and
 * `core/` is not allowed to know the shape of the state object (NFR-01).
 *
 * **`cards` is on screen because the Product Owner made the count public on 2026-09-01**, answering
 * open decision D33 of design spec 03: the cards themselves stay secret, the number does not. Without
 * that decision this selector would return three numbers.
 *
 * A selector and not a stored field, because it is derivable from the pawns and the hands. Storing it
 * would mean two places that can disagree about how far a player has got, and the acceptance criterion
 * for FR-36 is precisely that they never do.
 */
export function seatProgress(state, seat) {
  return {
    ...pawnProgress(state.pawns, seat),
    cards: state.skillHands[seat]?.length ?? 0,
  };
}

/**
 * The next state: this one, with `changes` applied, frozen.
 *
 * **This is the only place in the whole project that produces a new state object.** Every transition
 * in `turn-manager.js` and `match.js` goes through it, so there is exactly one line to read to know
 * that nothing is ever written in place.
 */
export function nextState(state, changes) {
  return deepFreeze({ ...state, ...changes });
}

/**
 * The fields that belong to one turn, reset to empty.
 *
 * A function and not a constant, so that no two states ever share the same empty array. A shared
 * array would be harmless while it stayed empty and a very confusing bug on the day it did not.
 *
 * **Every field a skill card writes is in here except the four that outlive a turn.** A card's roll
 * modifier, the budget it spent, the window it opened: all gone at the handover. The four that stay
 * are `statuses`, `traps`, `skillHands` and `skillDiscard`, and each of those has its own rule for
 * when it shrinks. Listing the turn-level ones in one function is what makes that split checkable:
 * `game-state.test.js` asserts that a state after `endTurn` differs from a fresh one only in the
 * fields that are supposed to survive.
 */
export function clearedTurnFields() {
  return {
    hand: [],
    chosenDie: null,
    roll: null,
    rollSteps: [],
    legalMoves: [],
    selectedPawn: null,
    pendingMove: null,
    refusalReason: null,

    /** The roll modifiers played this turn (`core/roll.js`). */
    modifiers: createModifiers(),
    /** How many cards each seat has played this turn, and how many it is allowed (FR-23). */
    cardsPlayed: {},
    cardBudget: {},
    /** True once No Take-Backsies has shut the remaining windows of this turn. */
    reactionsLocked: false,
    /** The open reaction window, or `null` (`state/reaction-window.js`). */
    reactionWindow: null,
    /** The card that opened the current window and has not resolved yet. */
    pendingCard: null,

    /**
     * The id of a card whose effect an It's Not That Deep's aura cancelled, or `null` (FR-30).
     *
     * A turn-level field beside `refusalReason` rather than something derived, because it cannot be
     * derived: the card is spent and its effect never ran, so afterwards the board looks exactly as it
     * would have if the player had done nothing at all. Without this the player has no way to tell a
     * nullified card from a bug, and `core/cards/context.js` already names a quiet no-op as "the
     * quietest possible bug in a system like this".
     */
    nullifiedCard: null,
  };
}
