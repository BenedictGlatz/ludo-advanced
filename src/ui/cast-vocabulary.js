/**
 * Which of the six families a skill card casts as, and whether it reaches the board at all.
 * Design spec 18, D105 and D109.
 *
 * `ui/` only, and it is **vocabulary rather than logic**: two lookup tables and three questions about
 * them, on the pattern `dice-card.js`, `overlay-vocabulary.js` and `roll-steps.js` already set. No
 * rule reads any of it, and nothing here decides what a card *does*.
 *
 * ## Why the family is the mechanic and not the type or the category
 *
 * D105. A family's job is to say, before the effect lands, **what kind of thing is about to happen and
 * where to look for it**. The type is already the card's band and the category is already its pill,
 * both on screen the whole time the card is on the stage, so a family keyed on either would draw a
 * fact the card already carries. The one thing about a card that nothing draws yet is its mechanic,
 * and the mechanic is also what decides whether there is a board stage at all.
 *
 * | Family | Cards | Where the eye goes |
 * | --- | --- | --- |
 * | `roll` | 7 | the dice plate |
 * | `hand` | 5 | the hands |
 * | `status` | 7 | one pawn |
 * | `shove` | 4 | a pawn travelling |
 * | `trap` | 3 | one field |
 * | `area` | 3 | a region |
 *
 * Two placements are judgement calls and D105 states both: **Big Ah Rock is `status`**, because the
 * stone is the card and the knockback is its accent, and **Ghost Mode is `status`**, because a dodge
 * is a protection the pawn had rather than a pawn being moved.
 *
 * ## Why the table is written out and not derived from `effects/index.js`
 *
 * `core/cards/effects/index.js` groups its imports by mechanic, and the six groups are nearly these
 * six. Nearly is the problem: 67 sits with the path cards there because it is written next to them,
 * and The Purge sits with the statuses. Deriving the families from comment headings in another file
 * would be reading a layout as data. `ui/` may not import a rule anyway, and this is a design decision
 * from a spec, so it is written where a reader of the spec would look for it.
 *
 * The test that stops the quiet failure is in `tests/unit/ui/cast-vocabulary.test.js`: it walks the
 * **real catalogue** and asserts all 29 ids resolve. A missing entry has to be a red test and not a
 * card that animates as `undefined`.
 */

/** Every card, by the family whose base movement it plays. D105. */
const FAMILY_FOR = Object.freeze({
  // The roll chain. The card is about the die, and it is not the die.
  "action-critical-success": "roll",
  "action-angel-die": "roll",
  "action-speedrun": "roll",
  "action-fr-fr": "roll",
  "action-sixty-seven": "roll",
  "reaction-critical-failure": "roll",
  "reaction-devil-die": "roll",

  // The card economy. These cards move cards.
  "action-pot-of-greed": "hand",
  "action-double-dip": "hand",
  "action-no-take-backsies": "hand",
  "action-tax-fraud": "hand",
  "reaction-nuehue": "hand",

  // Something is pressed onto a piece and stays there.
  "action-rock": "status",
  "action-big-ah-rock": "status",
  "action-lock-in": "status",
  "action-built-different": "status",
  "action-ragebait": "status",
  "reaction-hold-pawn": "status",
  "reaction-ghost-mode": "status",

  // A pawn moved without a move.
  "action-yeet": "shove",
  "action-head-out": "shove",
  "action-let-him-cook": "shove",
  "reaction-uno-reverse": "shove",

  // An object placed on a field.
  "action-banana-peel": "trap",
  "action-oil-spill": "trap",
  "action-not-that-deep": "trap",

  // More than one square at once.
  "action-hyperbeam": "area",
  "action-janky-rpg": "area",
  "reaction-the-purge": "area",
});

/**
 * The 12 cards whose cast is the card stage alone. D109's last paragraph.
 *
 * A negative list rather than a positive one, because "does this card do something on the board" is
 * the question with 17 yeses, and the 12 exceptions each have a reason that is the same reason:
 * **what they changed is not on the board.** Seven change the roll, which already has D70's throw and
 * D73's breakdown. Two change a hand, which re-flows. One shuts the remaining windows, and no prompt
 * appears. One negates a card, and the plate reads negated. One takes a card out of a hand nobody on
 * this screen can see. Drawing any of those on the board would be drawing a thing that did not happen
 * there.
 */
const NO_BOARD_STAGE = Object.freeze(
  new Set([
    "action-critical-success",
    "action-angel-die",
    "action-speedrun",
    "action-fr-fr",
    "action-sixty-seven",
    "reaction-critical-failure",
    "reaction-devil-die",
    "action-pot-of-greed",
    "action-double-dip",
    "action-no-take-backsies",
    "action-tax-fraud",
    "reaction-nuehue",
  ])
);

/**
 * Which family a card casts as, or `null` for an id the table does not know.
 *
 * `null` rather than a default family, and that is the point of the test above: a card that fell out
 * of the table has to be visible as a missing attribute, not hidden behind whichever family was
 * chosen as the fallback.
 */
export function castFamily(cardId) {
  return FAMILY_FOR[cardId] ?? null;
}

/**
 * Does this card have anything to land on the board?
 *
 * Asked twice per cast and for two different things: the view writes it as `data-board`, and
 * `holds.js` subtracts the board stage from the hold when it is false. One answer, so the CSS and the
 * clock can never disagree about whether a stage happened.
 */
export function hasBoardStage(cardId) {
  return castFamily(cardId) !== null && !NO_BOARD_STAGE.has(cardId);
}

/** Every card the table knows, for the test that walks the catalogue against it. */
export function castCardIds() {
  return Object.keys(FAMILY_FOR);
}
