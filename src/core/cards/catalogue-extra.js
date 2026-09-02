/**
 * The nineteen cards of artboard `4a`. Issue #38, requirement FR-28.
 *
 * Transcribed from `01-Design/Handoff/Card artwork design planning/Card Art.dc.html`, artboard `4a`.
 *
 * These are the cards that needed mechanics the game did not have: traps on squares, blockers that stop
 * a pawn passing through, backward movement, statuses with a duration, and effects over several
 * squares at once. The ten cards in `catalogue-core.js` needed none of that. All five mechanics were
 * built by the end of issue #38.
 *
 * **This file is data only**, and that has not changed: the entries here are what the target picker and
 * the card view read, and a card's rule lives in `effects/` matched by id. What *has* changed is the
 * sentence this comment used to carry, "no effect is implemented yet". Every one of the 29 cards has had
 * a rule since 2026-08-31, and `effects/index.js` is the table that proves it. Five of the nineteen
 * still carry a note because the artwork describes something the board model cannot express; each note
 * says what was read instead, and Chapter 05 carries the reasons in full.
 *
 * ## Two names had to be changed to be usable as ids
 *
 * `67` becomes `action-sixty-seven`, because an identifier that starts with a digit is a trap in some
 * of the places an id travels through. `Speedrun Any%` becomes `action-speedrun`, because a per cent
 * sign in an id is a URL escape waiting to happen. `Aight Imma Head Out` and `It's Not That Deep` are
 * shortened to `action-head-out` and `action-not-that-deep`, which is a readability choice and the only
 * one in the file that is not forced.
 */

import { CATEGORY, KIND, TARGET, TRIGGER, TYPE } from "./vocabulary.js";

export const EXTRA_CARDS = [
  {
    id: "action-banana-peel",
    type: TYPE.ACTION,
    category: CATEGORY.BLOCKING,
    kind: KIND.TRAP,
    targets: [TARGET.TRACK_SQUARE],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    // The artwork's "straight cardinal lane" is a property of the 11 x 11 drawing grid, which lives in
    // `ui/board-geometry.js`, and `core/` may not import `ui/`. Read as: pick one of your own pawns and
    // a direction, roll a D4, everything on the next 1 to D4 squares goes home, your own pawn included.
    // "Friendly fire" and "roll a D4" both survive.
    id: "action-hyperbeam",
    type: TYPE.ACTION,
    category: CATEGORY.OFFENSIVE,
    kind: KIND.D4,
    targets: [TARGET.OWN_PAWN, TARGET.DIRECTION],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "reaction-uno-reverse",
    type: TYPE.REACTION,
    category: CATEGORY.TROLL,
    kind: KIND.REACTION,
    targets: [TARGET.NONE],
    triggers: [TRIGGER.ON_CAPTURE],
  },
  {
    id: "action-rock",
    type: TYPE.ACTION,
    category: CATEGORY.BLOCKING,
    kind: KIND.ACTION,
    targets: [TARGET.OWN_PAWN],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "action-big-ah-rock",
    type: TYPE.ACTION,
    category: CATEGORY.BLOCKING,
    kind: KIND.UPGRADE,
    targets: [TARGET.TRACK_SQUARE],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    // The artwork has the slide skip "every skill tile and safe zone". There are no safe squares in the
    // MVP (FR-15), so only the skill square half is implementable.
    id: "action-oil-spill",
    type: TYPE.ACTION,
    category: CATEGORY.BLOCKING,
    kind: KIND.TRAP,
    targets: [TARGET.TRACK_SQUARE],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "reaction-ghost-mode",
    type: TYPE.REACTION,
    category: CATEGORY.MOVEMENT,
    kind: KIND.REACTION,
    targets: [TARGET.NONE],
    triggers: [TRIGGER.ON_CAPTURE],
  },
  {
    // Two options on one card, so the player picks a pawn and then which of the two to use.
    id: "action-head-out",
    type: TYPE.ACTION,
    category: CATEGORY.MOVEMENT,
    kind: KIND.ACTION,
    targets: [TARGET.OWN_PAWN, TARGET.CHOICE],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "action-speedrun",
    type: TYPE.ACTION,
    category: CATEGORY.MOVEMENT,
    kind: KIND.RISKY,
    targets: [TARGET.NONE],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    // "Both neighbours" is unambiguous on the ring and not in a house, so this is playable on a track
    // square only, with neighbours `(square +/- 1) mod 40`.
    id: "action-janky-rpg",
    type: TYPE.ACTION,
    category: CATEGORY.OFFENSIVE,
    kind: KIND.D6,
    targets: [TARGET.TRACK_SQUARE],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "action-yeet",
    type: TYPE.ACTION,
    category: CATEGORY.OFFENSIVE,
    kind: KIND.ACTION,
    targets: [TARGET.ENEMY_PAWN],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "action-tax-fraud",
    type: TYPE.ACTION,
    category: CATEGORY.TROLL,
    kind: KIND.ACTION,
    targets: [TARGET.PLAYER],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "action-lock-in",
    type: TYPE.ACTION,
    category: CATEGORY.TROLL,
    kind: KIND.DEFENSIVE,
    targets: [TARGET.OWN_PAWN],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "action-not-that-deep",
    type: TYPE.ACTION,
    category: CATEGORY.BLOCKING,
    kind: KIND.TRAP,
    targets: [TARGET.TRACK_SQUARE],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "action-let-him-cook",
    type: TYPE.ACTION,
    category: CATEGORY.MOVEMENT,
    kind: KIND.RISKY,
    targets: [TARGET.OWN_PAWN],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "action-built-different",
    type: TYPE.ACTION,
    category: CATEGORY.MOVEMENT,
    kind: KIND.PASSIVE,
    targets: [TARGET.OWN_PAWN],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "action-fr-fr",
    type: TYPE.ACTION,
    category: CATEGORY.TROLL,
    kind: KIND.ACTION,
    targets: [TARGET.NUMBER],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    // "Roll a 6" is impossible on a D2 or a D4, so the card is only playable when the chosen dice card
    // has at least six faces. That is a playability rule and not a target.
    id: "action-sixty-seven",
    type: TYPE.ACTION,
    category: CATEGORY.OFFENSIVE,
    kind: KIND.GAMBLE,
    targets: [TARGET.NONE],
    triggers: [TRIGGER.ACTION_PHASE],
  },
  {
    id: "action-ragebait",
    type: TYPE.ACTION,
    category: CATEGORY.TROLL,
    kind: KIND.TAUNT,
    targets: [TARGET.ENEMY_PAWN],
    triggers: [TRIGGER.ACTION_PHASE],
  },
];
