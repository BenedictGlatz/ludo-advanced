/**
 * The HUD: who is playing, whose turn it is, and how far everyone has got. Screen S7, issue #35,
 * requirement FR-36.
 *
 * `ui/` only: jQuery, i18next, no rule of its own. Every number it shows comes from `seatProgress` in
 * `state/game-state.js`, so this file counts nothing.
 *
 * ## The question this file exists to answer
 *
 * "How do I even see whose turn it is?" There was no answer. The board carried three cues and not one of
 * them was text: an ink halo on the active seat's yard, dimmed pawns for everyone else, and a lifted ring
 * on whichever hand plate was asking for a decision. All three tell a player who has already worked out
 * which colour is theirs. None of them tells a player who has not.
 *
 * The locale key `turn.prompt`, "Spieler {{number}} ist am Zug", had been sitting in both language files
 * since the i18n commit, called from nowhere.
 *
 * ## What it shows, and what it deliberately does not
 *
 * Per seat: the short name, the four progress numbers, and whether it is their turn. FR-36 asks for pawns in
 * start, on track and home; the fourth number is the size of the skill hand, and it is there because the
 * Product Owner made an opponent's hand size public on 2026-09-01 (decision D33).
 *
 * **FR-37, the resource and energy display, is `won't have` and has no slot here.** Issue #35 is titled
 * *Game HUD & Resource Display* and section 5 of the requirements specification rules the second half
 * out, on the grounds that no rule for it exists anywhere in the rulebook. Pool and discard counters were
 * considered at the same time and dropped, so that sixteen numbers on screen do not become twenty-four.
 *
 * ## Design note, and it is a gap rather than a decision
 *
 * **No design specification covers this region.** Handoffs 01 and 03 both excluded the HUD explicitly.
 * `hud.css` composes tokens that already exist and invents no colour, size, spacing or type, which is the
 * most this side can honestly do. The real design is owed by handoff 04 as D35 to D37. This is the same
 * situation `prompt-view.js` is in, and it is recorded rather than hidden.
 */

import $ from "jquery";

import { PAWNS_PER_PLAYER } from "../core/board.js";
import { t } from "../i18n/index.js";
import { seatProgress } from "../state/game-state.js";
import { isBot } from "../state/bots.js";
import { seatLabel, seatName } from "./player-labels.js";

/**
 * The four numbers per seat, in reading order.
 *
 * A list rather than four hard-coded elements, because the row is built and updated by the same loop and
 * the two cannot fall out of step. `start`, `track` and `home` are FR-36; `cards` is D33.
 */
const COUNTS = ["start", "track", "home", "cards"];

/** One `<li>` holding a number and the word for what it counts. */
function countSlot(kind) {
  return $("<li>", { class: "hud__count" })
    .attr("data-kind", kind)
    .append($("<span>", { class: "hud__value" }), $("<span>", { class: "hud__label" }));
}

/** One seat's row, empty. `data-player` is the seat, so `--color-p0` to `--color-p3` apply unchanged. */
function seatRow(seat) {
  return $("<div>", { class: "hud__seat" })
    .attr("data-player", seat)
    .append(
      $("<span>", { class: "hud__name" }),
      $("<ul>", { class: "hud__counts" }).append(...COUNTS.map(countSlot))
    );
}

/**
 * The HUD region, with one row per seat actually in the match.
 *
 * **Only seats in the match are rendered**, so a two-player match produces two rows carrying
 * `data-player="0"` and `data-player="2"`. Four rows with two of them blanked would put two empty
 * players on screen, and the board already drains the unused seats rather than drawing them.
 */
export function renderHud(state) {
  return $("<div>", { class: "hud" })
    .attr("data-players", state.playerCount)
    .append(...state.seats.map(seatRow));
}

/**
 * Which seats this HUD currently has rows for.
 *
 * Read back off the DOM rather than remembered, so there is one source of truth for it and no field that
 * can drift from what is on screen.
 */
function renderedSeats($hud) {
  return $hud
    .children(".hud__seat")
    .map(function seatOf() {
      return Number($(this).attr("data-player"));
    })
    .get();
}

/**
 * Redraw the HUD.
 *
 * **The rows are rebuilt only when the set of seats changes**, which happens when a restart starts a
 * match with a different player count and at no other time. Everything else is an attribute or a text
 * rewrite, per D10 of design spec 01: an element that is replaced restarts every transition on it, and
 * this region is redrawn several times per turn.
 */
export function updateHud($hud, state) {
  if (String(renderedSeats($hud)) !== String(state.seats)) {
    $hud
      .attr("data-players", state.playerCount)
      .empty()
      .append(...state.seats.map(seatRow));
  }

  for (const seat of state.seats) {
    const $seat = $hud.children(`.hud__seat[data-player="${seat}"]`);
    const progress = seatProgress(state, seat);
    const onTurn = state.activePlayer === seat;

    $seat.attr("data-on-turn", String(onTurn));
    $seat.attr("data-finished", String(progress.home === PAWNS_PER_PLAYER));

    // Who is playing this seat, as a language-independent attribute (FR-43). Two readers, and both
    // matter: `bots.spec.js` asserts on it rather than on the word "Bot", which is what every other
    // spec in this suite does with an attribute; and it is the hook Design needs if D85 decides a bot
    // seat should look different. Nothing styles it yet, on purpose: Claude Code does not invent a
    // design rule, and putting the attribute in the DOM is what lets Design answer without new markup.
    $seat.attr("data-controller", isBot(state, seat) ? "bot" : "human");

    // The **short** name, "Spieler 2", and not the full "Spieler 2 (Grün)". The colour is not
    // lost, because `hud.css` paints the plate in the seat's own colour and puts the seat's D16
    // shape next to the name, and the turn sentence above spells the full label out. A number, a
    // shape and a colour is what a scoreboard row is.
    //
    // The arithmetic that used to be here was a seat row of 332 px, from issue #39, and D37 has
    // since fixed the plate at its own width instead. Remeasured on 2026-09-03: the four numbers
    // need 278 px, which is why the plate is 308 and not D37's 248, and the full label needs 107.
    // The short name is still the one that fits without a second line.
    $seat.children(".hud__name").text(seatName(state, seat));

    $seat.find(".hud__count").each(function updateCount() {
      const $count = $(this);
      const kind = $count.attr("data-kind");

      $count.children(".hud__value").text(String(progress[kind]));
      $count.children(".hud__label").text(t(`hud.${kind}`));
    });
  }

  return $hud;
}

/**
 * The one sentence that answers the question this whole file exists for: "{{player}} ist am Zug".
 *
 * **It is one sentence for the region and not a chip on every seat row**, and the reason is a
 * measurement. A plate is 308 px wide, of which the four numbers need 278 and a name needs 107, and
 * a per-seat "am Zug" chip needs another 55. It did not fit, and what it did instead was wrap onto a
 * second line and truncate the names to "Spi...". Four plates plus their gaps are already 1268 px of
 * the 1552 the row has, so there is no width to find for a fifth thing either.
 *
 * The alternatives were shrinking `--board-size` to buy the height, which is a design trade and not
 * ours, or dropping the words next to the numbers, which makes the numbers meaningless. A sentence is
 * better than a chip anyway: `turn.prompt` was written as a sentence and has been sitting unused in
 * both locale files since the i18n commit.
 *
 * The seat row still carries `data-on-turn`, so the stylesheet marks the row without spending width.
 */
export function turnLine(state) {
  return t("turn.prompt", { player: seatLabel(state, state.activePlayer) });
}
