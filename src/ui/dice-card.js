/**
 * What one dice card says, translated. Issues #30 and #31.
 *
 * `ui/` only: i18next and the art table, no jQuery and no rule. It returns the description object
 * `card-view.js`'s `updateCard` consumes, which is why `card-view.js` itself calls no `t()`.
 *
 * ## Why this is its own module and not a private function in the hand
 *
 * It was one, until the pool overview of issue #30 needed the same card. The overview is not part of the
 * hand and has no business importing from it: they render the same component for two unrelated reasons,
 * and a shared dependency between them would have made the hand the owner of a screen it knows nothing
 * about. Same seam as `player-labels.js`, which the HUD, the overlay and the board all use without any
 * of them importing each other.
 */

import { t } from "../i18n/index.js";
import { diceArt } from "./art/index.js";

/**
 * The description of a dice card with `faces` faces.
 *
 * The title is the denomination, `W8` in German and `D8` in English, which is why it is a locale string
 * and not something the view formats out of a number.
 *
 * The two standing tags are the reason the pool is a decision at all, restated on the card: how far this
 * die can move a pawn, and the number it needs to get one out of the start area (FR-09). A hand holding
 * a D2 and a D20 is a choice between those two things, and a player should not have to remember which.
 *
 * `tags` appends further tags after those two. The pool overview passes the copy count that way, because
 * "4 mal im Pool" is true of the pool and not of the card, and a card in a hand must not claim it.
 */
export function diceCardDescription(faces, { tags = [] } = {}) {
  return {
    id: `dice-d${faces}`,
    family: "dice",
    faces,
    typeLabel: t("card.family.dice"),
    kindLabel: t(`card.dice.kind.${faces}`),
    title: t("card.dice.name", { faces }),
    tags: [t("card.dice.range", { faces }), t("card.dice.leave", { faces }), ...tags],
    art: diceArt(faces),
  };
}
