/**
 * What is standing on a field, and what is stuck to a pawn. Issue #45, screen S3.
 *
 * `ui/` only: jQuery and i18next, no rule. Every question is already answered in the state; this file
 * writes the answers onto the DOM as attributes and nothing else.
 *
 * ## Why this is not in `board-view.js`
 *
 * That file builds the board once and then writes the state onto it. It was at 252 lines with one mark
 * in it, `markSkillSquares`, and this issue adds three more plus the pawn statuses. The seam is real
 * rather than a line count: **`board-view.js` renders the board's own shape**, the grid, the regions and
 * where each pawn is, and all of that comes from `board-geometry.js` and the pawn list. **This file
 * renders what has been *put on* the board by cards**, which is a different source and changes for
 * different reasons.
 *
 * `markSkillSquares` moved here with them, so all four marks are in one place and `updateBoard` makes
 * one call.
 *
 * ## Nothing here renders yet, and that is the honest position
 *
 * Design handoff 07 is out and unanswered: D51 to D60 cover what a trap looks like, how a blocker reads
 * differently, whether the owner is shown, how three marks on one field coexist, and how a stunned pawn
 * reads. `CLAUDE.md` forbids this side from taking any of those decisions.
 *
 * So the attributes ship and the stylesheet waits, which is exactly what `data-skill-square` did for a
 * day until D27 was answered. Two things that costs and both are deliberate: a Playwright suite can
 * assert the whole mechanic today, and when the spec lands it is a stylesheet and not a rewrite.
 *
 * **The one exception is the announcement**, which is text rather than a look, and it ships in
 * `move-hints.js`. A trap that eats a player's turn in silence is a bug; a trap announced in the wrong
 * colour is debt with a brief open against it.
 *
 * ## Rewritten in full on every update
 *
 * Every function below clears its attribute off all forty fields or all sixteen pawns and writes it
 * again. `markSkillSquares` already worked that way and the reason still holds: a used skill square
 * moves, a trap fires, a status expires, and the work is one attribute on at most forty elements.
 * Tracking what changed would be more code than the work it saves, and it would be the code that
 * silently misses a change.
 */

import $ from "jquery";

import { TRACK_LENGTH } from "../core/board.js";
import { NULLIFY_RADIUS, nullifyingTrap } from "../core/trap-rules.js";
import { isBlocker } from "../core/traps.js";
import { t } from "../i18n/index.js";
import { seatLabel } from "./player-labels.js";

/**
 * Put `data-skill-square="true"` on the eight fields that hand out a card, and take it off the rest
 * (FR-22).
 *
 * Answered by D27 of design handoff 03 and styled in `board.css`: an ink-outlined teal diamond inset 24
 * per cent, stepping back to 30 per cent on a field that is also a legal target, so the target ring
 * stays the widest thing on the field. Teal rather than the purple the earlier material described,
 * because violet is `--color-hint` and every legal-move highlight already uses it.
 */
function markSkillSquares($board, skillSquares) {
  $board.find(".square--track").each(function markSquare() {
    const $square = $(this);
    const isSkillSquare = skillSquares.includes(Number($square.attr("data-square")));

    if (isSkillSquare) $square.attr("data-skill-square", "true");
    else $square.removeAttr("data-skill-square");
  });
}

/**
 * Put the object standing on each field onto that field, and its owner onto the span inside it.
 *
 * Three attributes and not one, because the design will want to answer three different questions:
 *
 * - `data-trap` is the **behaviour**, `trap` or `blocker`. A trap is a single-use surprise that may not
 *   even be aimed at you; a blocker is a standing wall that refuses a move for three rounds. That is
 *   what D52 keys off, and a fifth kind of object is a line in `core/traps.js` and no CSS at all.
 * - `data-trap-kind` is the **specific object**, for the per-kind mark of D51.
 * - `data-player` on the span is the **owner**, and it goes on the span rather than the field because
 *   `board.css` already turns `[data-player]` on any element into `--player` and `--player-soft`. A
 *   `data-trap-owner` would have needed its own four-block mapping, repeating the seat table a fifth
 *   time, which design spec 06 already flagged as a smell.
 *
 * The accessible name is where the words live (NFR-03, NFR-08). A mark drawn in CSS cannot carry text,
 * and "a coloured shape on a square" is nothing at all to a screen reader, so the field's own span gets
 * the object's name and its owner from i18next.
 *
 * The owner's name comes from `seatLabel` rather than from `owner + 1`. That is not a detail: a
 * two-player match seats its players on 0 and 2, so a seat plus one would announce "Player 3" for the
 * second of two players. `player-labels.js` exists because four places got that wrong at once.
 */
function markTraps($board, traps, seats) {
  const bySquare = new Map(traps.map((trap) => [trap.square, trap]));

  $board.find(".square--track").each(function markSquare() {
    const $square = $(this);
    const trap = bySquare.get(Number($square.attr("data-square")));
    const $mark = $square.find(".square__trap");

    if (trap === undefined) {
      $square.removeAttr("data-trap").removeAttr("data-trap-kind");
      $mark.removeAttr("data-player").removeAttr("aria-label");
      return;
    }

    $square.attr("data-trap", isBlocker(trap.kind) ? "blocker" : "trap");
    $square.attr("data-trap-kind", trap.kind);
    $mark.attr("data-player", trap.owner);
    $mark.attr(
      "aria-label",
      t("trap.owned", {
        object: t(`trap.label.${trap.kind}`),
        player: seatLabel(seats, trap.owner),
      })
    );
  });
}

/**
 * Mark the fields an It's Not That Deep is protecting.
 *
 * Up to seven contiguous fields per trap, and it is the one mark here that is not about the field
 * itself: it says an offensive card aimed at this field will do nothing. A player who cannot see it
 * cannot avoid wasting a card in it, which is what makes it worth putting in the DOM before D58 has
 * decided whether to draw it at all.
 *
 * The owner is not written, and that is deliberate rather than an omission. An aura only stops
 * **other** players' cards, so which player is looking changes the answer, and this view does not
 * render per seat. `nullifyingTrap` is asked with `null` as the actor, which no seat ever equals, so
 * the attribute means "some aura reaches here" and the exact reading is D58's to settle.
 */
function markAura($board, traps) {
  const covered = traps.length === 0 ? new Set() : auraSquares(traps);

  $board.find(".square--track").each(function markSquare() {
    const $square = $(this);

    if (covered.has(Number($square.attr("data-square")))) {
      $square.attr("data-trap-aura", "true");
    } else {
      $square.removeAttr("data-trap-aura");
    }
  });
}

/** Every absolute square some aura reaches. Asked of `core/`, never worked out here. */
function auraSquares(traps) {
  const covered = new Set();

  for (const trap of traps) {
    for (let step = -NULLIFY_RADIUS; step <= NULLIFY_RADIUS; step += 1) {
      const square = (trap.square + step + TRACK_LENGTH) % TRACK_LENGTH;
      if (nullifyingTrap(traps, square, null) !== null) covered.add(square);
    }
  }

  return covered;
}

/**
 * Put every status a pawn is carrying onto that pawn, as a space-separated list.
 *
 * One attribute and not eight, because a pawn can carry several at once: locked and armoured and
 * slippery is an ordinary combination. Eight boolean attributes would be eight write-and-remove pairs
 * per pawn per update, and CSS matches a whitespace list natively with `[data-statuses~="stunned"]`,
 * which is what that operator exists for.
 *
 * **Nothing was shown for any status before this**, which is worth stating: a held pawn was simply a
 * pawn without `data-movable`, and the only words the player got came from the turn-level refusal, and
 * only when *every* pawn had been refused for the same reason. Issue #45 creates `stunned`, and a
 * stunned pawn losing a turn with no mark and no message would be the game taking a turn away in
 * silence. All eight kinds go into the DOM in the same pass, so the attribute is written once; D56 and
 * D57 cover the two this issue is about and the other six are listed in brief 07 as owed.
 *
 * A status attached to the whole board rather than to a pawn, which is what The Purge is, is skipped:
 * it belongs on `.board` and it has no mark anywhere yet either.
 */
function markStatuses($board, statuses) {
  const kinds = new Map();

  for (const status of statuses) {
    if (status.player === null || status.pawn === null) continue;

    const key = `${status.player}.${status.pawn}`;
    kinds.set(key, [...(kinds.get(key) ?? []), status.kind]);
  }

  $board.find(".pawn").each(function markPawn() {
    const $pawn = $(this);
    const key = `${$pawn.attr("data-player")}.${$pawn.attr("data-pawn")}`;
    const held = kinds.get(key);

    if (held === undefined) $pawn.removeAttr("data-statuses");
    else $pawn.attr("data-statuses", held.join(" "));
  });
}

/**
 * Every mark, in one call from `updateBoard`.
 *
 * The order is not a rule: the four write four different attributes on overlapping elements and none
 * reads what another wrote.
 */
export function applyBoardMarks($board, state) {
  markSkillSquares($board, state.skillSquares);
  markTraps($board, state.traps, state.seats);
  markAura($board, state.traps);
  markStatuses($board, state.statuses);
}
