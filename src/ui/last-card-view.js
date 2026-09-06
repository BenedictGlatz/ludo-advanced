/**
 * The last card anybody played, as the fifth plate in the HUD row. Issue #93, design spec 17, D100.
 *
 * `ui/` only: jQuery, i18next, no rule of its own. Everything on the plate comes from `state.lastCard`,
 * the match-level record `intents-cards.js` writes when a card leaves a hand and `reaction-window.js`
 * settles when the window shuts. This file counts nothing and remembers nothing.
 *
 * ## The question it answers
 *
 * A playtester could not tell what had just happened. A bot plays a card, the strip says one sentence and
 * the sentence goes away, and three turns later the pawn that will not move is still unexplained. The
 * strip is the moment; this plate is the record, and D100 keeps both because they are two different
 * questions: "what just happened" and "what was it again".
 *
 * ## Why it is a child of `.hud` and not a region of its own
 *
 * The HUD row spans both columns of the app grid and centres its plates, so a plate outside that row
 * cannot sit at its end. Spec 17 § 5 says it in one line: build it as the last child of `.hud`. That is
 * why `hud-view.js` renders and updates it rather than `render.js` calling an eighth region, and it is
 * also why this file is a file: the HUD was at 170 lines and none of what is below is about a seat.
 *
 * ## The card in the plate is the card component, unchanged
 *
 * `.last-card__reveal` holds a `.card.card--full`, built by `card-view.js` and described by
 * `skill-hand-view.js`'s `skillCard`, which is the same description the hand uses. The plate shows the
 * card's **name** in words and keeps the card itself one hover away, because a card small enough for a
 * 15.5rem plate is about 32 px wide and its title is not a title at that size (D100).
 *
 * `state.lastCard` records skill cards only, which is why the description builder is the skill hand's.
 * A dice card is picked and rolled rather than played, and the roll breakdown already says what it did.
 */

import $ from "jquery";

import { t } from "../i18n/index.js";
import { createCard, updateCard } from "./card-view.js";
import { seatLabel } from "./player-labels.js";
import { skillCard } from "./skill-hand-view.js";

/**
 * What `data-outcome` says when there is nothing to report.
 *
 * `resolved` is the outcome with no treatment on it at all, so an empty plate carries the neutral value
 * rather than an absent attribute. The CSS reads `data-empty` for the empty case and would otherwise
 * have to read the absence of a second attribute as well.
 */
const NEUTRAL_OUTCOME = "resolved";

/**
 * The plate, empty, with every part of the contract present.
 *
 * Built once and then rewritten, per D10: the plate is redrawn several times a turn, and an element that
 * is replaced restarts every transition on it, which here would mean the reveal flickering while a
 * player is reading it.
 *
 * `tabindex="0"` on the section is D67's rule, not decoration: the reveal answers focus as well as
 * hover, so every card in the game can be read from the keyboard. The card inside is **not** a second
 * tab stop, which is what `focusable: false` below buys.
 */
export function renderLastCard() {
  return $("<section>", { class: "last-card", tabindex: 0 })
    .attr("data-empty", "true")
    .attr("data-outcome", NEUTRAL_OUTCOME)
    .append(
      $("<h2>", { class: "last-card__heading" }),
      $("<p>", { class: "last-card__line" }),
      $("<p>", { class: "last-card__by" }),
      $("<div>", { class: "last-card__reveal" }).append(createCard().addClass("card--full"))
    );
}

/**
 * The plate before the first card of the match.
 *
 * It is in the row from the first frame and says so, because a plate that appears on turn three moves
 * the other four sideways once, in the middle of a game, for no reason the player can see (D100).
 *
 * `data-player` is **removed** rather than set to anything: `last-card.css` hides the seat dot when the
 * plate is empty, and a seat number on a plate that names no seat would be a fact waiting to be read by
 * the next rule somebody writes.
 */
function showEmpty($plate) {
  $plate
    .attr("data-empty", "true")
    .attr("data-outcome", NEUTRAL_OUTCOME)
    .removeAttr("data-player")
    .removeAttr("data-turn");

  $plate.children(".last-card__line").text("");
  $plate.children(".last-card__by").text(t("lastCard.empty"));

  return $plate;
}

/**
 * Redraw the plate from the state.
 *
 * The four outcomes are `data-outcome` and nothing else: `resolved` gets no treatment, `pending` gets the
 * breathing violet edge, and `nullified` and `negated` read identically, which is D100's rule that an
 * aura cancelling a card and a Nühü cancelling it are two rules and one fact. Which one it was is in the
 * sentence, and the sentence is one line long and right there.
 *
 * `data-turn` is not read by any stylesheet. It is written because the number is a fact about the record
 * and an attribute is what the end-to-end tests can ask about without reading a translated sentence.
 */
export function updateLastCard($plate, state) {
  $plate.children(".last-card__heading").text(t("lastCard.heading"));

  const entry = state.lastCard;
  if (entry === null || entry === undefined) return showEmpty($plate);

  $plate
    .attr("data-empty", "false")
    .attr("data-outcome", entry.outcome)
    .attr("data-player", String(entry.seat))
    .attr("data-turn", String(entry.turnNumber));

  $plate.children(".last-card__line").text(t(`card.skill.${entry.cardId}.title`));
  $plate.children(".last-card__by").text(
    t(`lastCard.${entry.outcome}`, {
      player: seatLabel(state, entry.seat),
      turn: entry.turnNumber,
    })
  );

  // The card is a record and not an offer, so it is not playable and not a tab stop. `playable: false`
  // is also what `last-card.css` desaturates the nullified card **against**, which is why the plate
  // clears `card-state.css`'s unplayable filter on the card it holds: see the comment on
  // `.last-card__reveal .card` in that file.
  updateCard(
    $plate.find(".last-card__reveal > .card"),
    skillCard(entry.cardId, { playable: false, selected: false, focusable: false })
  );

  return $plate;
}
