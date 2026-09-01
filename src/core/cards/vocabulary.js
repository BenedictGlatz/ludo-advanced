/**
 * The words the card catalogue is allowed to use. Issue #38, requirements FR-26 and FR-28.
 *
 * A separate module from `catalogue.js` for a boring reason: the two data files import these names,
 * and `catalogue.js` imports the two data files. Putting the names in `catalogue.js` would make that
 * a circle.
 *
 * ## Why the catalogue holds strings and not functions
 *
 * FR-26 says a card's effect is a rule over game state and is matched to its artwork **by card id**,
 * with neither importing the other. So the catalogue is data: what a card is, when it may be played,
 * and what the player has to point at. What it *does* is a separate function in `core/cards/effects/`,
 * looked up by the same id. A view can render a card it has no effect for, and a test can check the
 * catalogue without loading a single effect.
 */

/** When a card may be played. This is the only field of a card that is a hard rule. */
export const TYPE = Object.freeze({
  /** Only on your own turn, in the action step, after the dice card is picked (FR-23). */
  ACTION: "action",
  /** Only during someone else's turn, into an open reaction window (FR-24, FR-25). */
  REACTION: "reaction",
});

/**
 * The four groups the artwork puts on the cards of artboard `4a`: flavour and grouping, no rule.
 *
 * **The ten cards of artboard `6a` have no category**, and they get `null` rather than an invented
 * one. That artboard labels a card by type and a sub-kind instead. Reconciling the two labelling
 * schemes into one card component is open decision D28 of design handoff 03, and inventing a category
 * here would be answering a design question that is not this side's to answer.
 */
export const CATEGORY = Object.freeze({
  MOVEMENT: "movement",
  BLOCKING: "blocking",
  TROLL: "troll",
  OFFENSIVE: "offensive",
});

/**
 * The sub-kind label the artwork prints under the banner, for all 29 cards.
 *
 * **No code reads this yet**, and it is stored anyway. The catalogue is the machine-readable
 * transcription of a generated HTML artboard that nobody is going to open again, so being lossy
 * against that source is the worse failure. D28 needs exactly these labels to reconcile the two
 * schemes, and re-extracting them from the artwork a second time is the alternative.
 *
 * Some of the values are odd, and they are the artwork's own: `ACTION` and `REACTION` repeat what
 * `type` already says, and `D4` and `D6` name a die the card rolls. Transcribed as they are rather
 * than tidied up, because tidying them would be a decision hidden inside a transcription.
 */
export const KIND = Object.freeze({
  ACTION: "action",
  BUFF: "buff",
  CHAOS: "chaos",
  CONTROL: "control",
  D4: "d4",
  D6: "d6",
  DEBUFF: "debuff",
  DEFENSIVE: "defensive",
  DRAW: "draw",
  ECONOMY: "economy",
  GAMBLE: "gamble",
  LOCKOUT: "lockout",
  NEGATE: "negate",
  PASSIVE: "passive",
  REACTION: "reaction",
  RISKY: "risky",
  TAUNT: "taunt",
  TRAP: "trap",
  UPGRADE: "upgrade",
});

/**
 * What the player has to point at before a card can resolve.
 *
 * Read by the target picker (issue #34), which switches the board into the matching selection mode.
 * A card can need more than one, so `targets` is a list: Hyperbeam needs a pawn **and** a direction.
 */
export const TARGET = Object.freeze({
  /** Nothing to pick. The card acts on the turn, the roll, or the window that opened. */
  NONE: "none",
  OWN_PAWN: "own-pawn",
  ENEMY_PAWN: "enemy-pawn",
  /** One of the 40 shared track squares. */
  TRACK_SQUARE: "track-square",
  /** Forwards or backwards. */
  DIRECTION: "direction",
  /** A number the player names instead of rolling, as FR FR does. */
  NUMBER: "number",
  /** An opponent, not one of their pawns, as Tax Fraud does. */
  PLAYER: "player",
  /** One of the two things the card offers, as Aight Imma Head Out does. */
  CHOICE: "choice",
});

/**
 * The moment a card may be played into.
 *
 * Every Action card has exactly `ACTION_PHASE`, because the player's own rules put skill cards after
 * the dice card and before the roll. The three others are the windows a Reaction can answer, and they
 * are the three points where `state/` opens one.
 */
export const TRIGGER = Object.freeze({
  /** Step 4 of the turn: the dice card is picked, the roll has not happened. */
  ACTION_PHASE: "action-phase",
  /** Someone played a card. */
  ON_CARD: "on-card",
  /** The roll just happened and has not been applied. */
  ON_ROLL: "on-roll",
  /** A committed move is about to capture a pawn. */
  ON_CAPTURE: "on-capture",
});

/**
 * How many of each card the pool holds, so 29 cards make a 58-card pool.
 *
 * Two rather than one so that a card is not gone for the match the first time somebody plays it, and
 * two rather than three so that the pool stays small enough that a player who has seen a card can
 * reasonably expect to see it again. It is one constant, and it is a playtesting question.
 */
export const COPIES_PER_CARD = 2;
