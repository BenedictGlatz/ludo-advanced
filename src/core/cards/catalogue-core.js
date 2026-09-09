/**
 * The ten cards of artboard `6a`. Issue #38, requirement FR-28.
 *
 * Transcribed from `01-Design/Handoff/Card artwork design planning/Card Art.dc.html`, artboard `6a`.
 *
 * ## Why these ten are a file of their own
 *
 * They are the ten cards that need **no new board concept**. Every one of them acts on the roll, on
 * another card, or on a player's card budget, all of which the turn already has. The nineteen cards of
 * artboard `4a` are in `catalogue-extra.js` and need five mechanics that do not exist yet: traps,
 * blockers, backward movement, timed statuses and area effects.
 *
 * That split is a delivery decision and not a taxonomy. After these ten work, the game is playable
 * with skill cards. If the schedule runs out, this is where it can stop.
 *
 * ## The ids
 *
 * Kebab-case, prefixed with the type, as FR-26 requires for the contract between `core/` and `ui/`.
 * Two names could not be transcribed literally: `Nühü` has an umlaut, which becomes `nuehue` because
 * an id with a non-ASCII character is one URL encoding away from a bug nobody enjoys.
 */

import { KIND, TARGET, TRIGGER, TYPE } from "./vocabulary.js";

export const CORE_CARDS = [
  {
    id: "action-pot-of-greed",
    type: TYPE.ACTION,
    category: null,
    kind: KIND.DRAW,
    targets: [TARGET.NONE],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "action-double-dip",
    type: TYPE.ACTION,
    category: null,
    kind: KIND.ECONOMY,
    targets: [TARGET.NONE],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "action-no-take-backsies",
    type: TYPE.ACTION,
    category: null,
    kind: KIND.LOCKOUT,
    targets: [TARGET.NONE],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "action-critical-success",
    type: TYPE.ACTION,
    category: null,
    kind: KIND.BUFF,
    targets: [TARGET.NONE],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "action-angel-die",
    type: TYPE.ACTION,
    category: null,
    kind: KIND.BUFF,
    targets: [TARGET.NONE],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    // "Play as any player rolls", so the window the roll opens.
    id: "reaction-critical-failure",
    type: TYPE.REACTION,
    category: null,
    kind: KIND.DEBUFF,
    targets: [TARGET.NONE],
    triggers: [TRIGGER.ON_ROLL],
  },
  {
    id: "reaction-devil-die",
    type: TYPE.REACTION,
    category: null,
    kind: KIND.DEBUFF,
    targets: [TARGET.NONE],
    triggers: [TRIGGER.ON_ROLL],
  },
  {
    // Cancels the card that opened the window, so it needs no target of its own.
    id: "reaction-nuehue",
    type: TYPE.REACTION,
    category: null,
    kind: KIND.NEGATE,
    targets: [TARGET.NONE],
    triggers: [TRIGGER.ON_CARD],
  },
  {
    // The artwork says "as its turn begins", which is not a reaction to anything. Read as the window
    // the roll opens: the named pawn drops out of that turn's move choice. See Ch. 05.
    id: "reaction-hold-pawn",
    type: TYPE.REACTION,
    category: null,
    kind: KIND.CONTROL,
    targets: [TARGET.ENEMY_PAWN],
    triggers: [TRIGGER.ON_ROLL],
  },
  {
    // Changes the rules for a round rather than answering one specific event, so it is playable into
    // any open window. The alternative, picking one window arbitrarily, would be a coin flip
    // pretending to be a rule.
    id: "reaction-the-purge",
    type: TYPE.REACTION,
    category: null,
    kind: KIND.CHAOS,
    targets: [TARGET.NONE],
    triggers: [TRIGGER.ON_CARD, TRIGGER.ON_ROLL, TRIGGER.ON_CAPTURE],
  },
];
