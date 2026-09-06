/**
 * The stage a played skill card gets to itself. Design brief 18 § 3, design spec 18.
 *
 * `ui/` only: jQuery and the card component, no rule and no dispatch. It reads the state and writes
 * attributes, and every question it asks has already been answered somewhere else: which family a card
 * casts as is `cast-vocabulary.js`, where its effect landed is `cast-hits.js`, and where that is in
 * pixels is `cast-geometry.js`. What is left here is the DOM.
 *
 * ## What was missing, which is what this is for
 *
 * A card play had no **moment**. The card left the hand, the effect happened in the same synchronous
 * pass, and the only evidence was a sentence in the strip and a small plate five along in the HUD. For
 * a bot's card that meant a player could not tell what had just been done to them. D104's answer:
 * the card is the moment, the board is the consequence, the plate is the record.
 *
 * ## Built once and then written to
 *
 * D10, and here it is load-bearing rather than a convention. Every animation in `cast.css` hangs off
 * `data-cast` changing on an element that stays put; an element replaced when the cast starts would
 * restart every transition on it and the card would flicker instead of arriving.
 *
 * ## The attributes, and the two rules they follow
 *
 * An attribute with nothing to say is **removed** and never set to the empty string, because
 * `card.css` already distinguishes `data-card-category` absent from present-and-empty. And
 * `data-actor` and `data-seat` are written whether any stylesheet reads them or not, on D51's
 * precedent: a fact that is already known costs nothing in the DOM and gives a later decision
 * something to hang off.
 */

import $ from "jquery";

import { cardById } from "../core/cards/catalogue.js";
import { isBot } from "../state/bots.js";
import { GEOMETRY_PROPERTIES, castGeometry } from "./cast-geometry.js";
import { auraHits, castHits } from "./cast-hits.js";
import { castFamily, castOutcome, castsOnBoard } from "./cast-vocabulary.js";
import { createCard, updateCard } from "./card-view.js";
import { skillCard } from "./skill-hand-view.js";

/**
 * How many parts the effect layer holds. D110: four, and no card needs a fifth.
 *
 * They are built empty and stay empty. A part is a disc that an accent reshapes into a ring, a bar, a
 * stone or a card silhouette, all in CSS, so nothing here knows what any of them look like.
 */
const PARTS = 4;

/**
 * The stage, empty, with every part of the contract present.
 *
 * `aria-hidden` on the effect layer because the parts are decoration: the card inside carries the
 * words, and the strip and the plate both say what happened in a sentence a screen reader can read.
 */
export function renderCast() {
  const $fx = $("<div>", { class: "cast__fx" }).attr("aria-hidden", "true");

  for (let part = 0; part < PARTS; part += 1) {
    $fx.append($("<span>", { class: "cast__part" }).attr("data-part", part));
  }

  return $("<div>", { class: "cast" })
    .attr("data-cast", "idle")
    .append($("<div>", { class: "cast__card" }).append(createCard().addClass("card--full")), $fx);
}

/**
 * Fill the stage with one played card and put it in its first state.
 *
 * Returns the plan the driver needs: whether there is a board stage, and what that stage marks. The
 * view works it out because it is the view that knows the card and the outcome; the driver works the
 * clock and knows neither.
 */
export function fillCast($cast, state, played, { boardStageOnly = false } = {}) {
  const cardId = played.cardId;
  const card = cardById(cardId);
  const family = castFamily(cardId);
  const outcome = castOutcome(state, played);

  // Which stage this play gets is `cast-vocabulary.js`'s answer, because it is a decision about the
  // card and its outcome rather than about the DOM, and D113's three branches deserve a unit test.
  const board = family !== null && castsOnBoard(cardId, outcome);

  const hits =
    outcome === "nullified"
      ? auraHits(played, state)
      : castHits(family, played, state, state.cardReach ?? null);

  $cast
    .attr("data-card-id", cardId)
    .attr("data-card-type", card.type)
    .attr("data-seat", String(played.seat))
    .attr("data-actor", isBot(state, played.seat) ? "bot" : "human")
    .attr("data-outcome", outcome)
    .attr("data-board", String(board));

  if (family === null) $cast.removeAttr("data-cast-family");
  else $cast.attr("data-cast-family", family);

  if (card.category === null) $cast.removeAttr("data-card-category");
  else $cast.attr("data-card-category", card.category);

  writeGeometry($cast, state, played, hits.point);

  // The card is a record and not an offer while it is on the stage: not playable, not a tab stop.
  updateCard(
    $cast.find(".cast__card > .card"),
    skillCard(cardId, { playable: false, selected: false, focusable: false })
  );

  $cast.attr("data-cast", boardStageOnly ? "board" : "card");

  return { hasBoardStage: board, hits };
}

/**
 * The four pairs of pixels, plus the one direction the shove family reads.
 *
 * `--cast-dir` is `1` forwards and `-1` backwards. It is the card's own direction where it has one
 * and the direction of travel where it does not: a Yeet pushes backwards, so its lunge goes the other
 * way. Every card without a direction leaves the property off and `cast-base.css` reads `1`.
 */
function writeGeometry($cast, state, played, point) {
  const $app = $cast.parent();

  for (const property of [...GEOMETRY_PROPERTIES, "--cast-dir"]) {
    $cast[0].style.removeProperty(property);
  }

  const style = castGeometry($app, { seat: played.seat, point });
  for (const [property, value] of Object.entries(style)) {
    $cast[0].style.setProperty(property, value);
  }

  const direction = played.cardId === "action-yeet" ? -1 : (played.target?.direction ?? null);
  if (direction === 1 || direction === -1) {
    $cast[0].style.setProperty("--cast-dir", String(direction));
  }
}

/** Move the cast to its next state. The stylesheet only ever answers `data-cast`. */
export function castStage($cast, stage) {
  $cast.attr("data-cast", stage);
}

/**
 * Put the stage away.
 *
 * `data-cast="idle"` hides it, and the card and the parts stay in the DOM: they are built once and
 * this is the state they wait in. The card id comes off with the rest, because a stylesheet that keyed
 * on it would otherwise still be keying on it between casts.
 */
export function endCast($cast) {
  $cast
    .attr("data-cast", "idle")
    .removeAttr("data-card-id")
    .removeAttr("data-card-type")
    .removeAttr("data-card-category")
    .removeAttr("data-cast-family")
    .removeAttr("data-seat")
    .removeAttr("data-actor")
    .removeAttr("data-outcome")
    .removeAttr("data-board");
}
