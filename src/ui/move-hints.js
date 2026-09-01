/**
 * What the player is allowed to do, shown on the board. Issue #62, screen S6.
 *
 * Requirements FR-32 (legal moves are highlighted before the player commits) and NFR-08 (a refused
 * move states its reason on screen). Reads state, writes attributes, decides nothing: which moves
 * are legal and why a pawn is stuck are both answered by `core/movement.js` and carried in the state
 * object, so this file only has to put the answers somewhere the player can see them.
 *
 * ## Everything is an attribute, and that is the whole interface to the design
 *
 * `board.css` and `pawn.css` style `[data-legal-target]`, `[data-movable]` and `[data-selected]`.
 * This file sets and clears exactly those three, plus `data-reason-key` on the message region. It
 * contains no colour, no size and no duration, so a design revision changes stylesheets and never
 * changes this file.
 *
 * ## Why the text is written here and not in the stylesheet
 *
 * NFR-03 forbids a user-facing string anywhere in `src/` outside the locale files, and a CSS
 * `content:` declaration holding a sentence would be exactly that. The design keeps to it: every
 * `content:` in the delivered stylesheets is `content: ""`. The container is styled by CSS and filled
 * by i18next here.
 */

import { REGION, absoluteSquare, homeColumnStep, region } from "../core/board.js";
import { MATCH_STATUS, TURN_PHASE } from "../state/game-state.js";
import { movablePawns } from "../state/turn-manager.js";
import { t } from "../i18n/index.js";
import { pawnElement } from "./board-view.js";

/**
 * The square a move lands on.
 *
 * Two cases, because a target is either shared or private. A track square is addressed by its
 * absolute index, which every player sees the same way. A house square is addressed by its owner and
 * its step, because four different squares carry step 1.
 */
function targetSquare($board, move) {
  if (region(move.to) === REGION.TRACK) {
    return $board.find(`.square[data-square="${absoluteSquare(move.player, move.to)}"]`);
  }

  return $board.find(
    `.home-column[data-player="${move.player}"] .square[data-home-step="${homeColumnStep(move.to)}"]`
  );
}

/** Every hint attribute, removed. Called first, so no hint can survive a turn it does not belong to. */
function clearHints($board) {
  $board.find("[data-legal-target]").removeAttr("data-legal-target");
  $board.find("[data-movable]").removeAttr("data-movable");
  $board.find("[data-selected]").removeAttr("data-selected");
  $board.find(".pawn").attr("tabindex", -1);
}

/**
 * Show what can be done this turn.
 *
 * **Which targets are lit depends on whether a pawn is selected.** With nothing selected, every legal
 * move is highlighted at once, which is what FR-32 asks for: the player sees the whole choice before
 * committing to any of it. Once a pawn is selected the set narrows to that pawn's one target, so the
 * second click has an unambiguous consequence.
 *
 * D7 was designed for the first case, the hard one, where several squares carry the highlight
 * together and have to read as one set rather than as several separate alerts.
 */
export function applyMoveHints($board, state) {
  clearHints($board);

  if (state.status !== MATCH_STATUS.RUNNING || state.phase !== TURN_PHASE.ACT) return;

  for (const pawn of movablePawns(state)) {
    pawnElement($board, state.activePlayer, pawn).attr("data-movable", "true").attr("tabindex", 0);
  }

  if (state.selectedPawn !== null) {
    pawnElement($board, state.activePlayer, state.selectedPawn).attr("data-selected", "true");
  }

  const shown =
    state.selectedPawn === null
      ? state.legalMoves
      : state.legalMoves.filter((move) => move.pawn === state.selectedPawn);

  for (const move of shown) {
    targetSquare($board, move).attr("data-legal-target", "true");
  }
}

/**
 * What the message region should say, as an i18next key plus its interpolation, or `null` for
 * nothing.
 *
 * **The strip says one kind of thing now, and that is the fix for a defect this comment used to
 * describe.** It used to carry the win message and the abandoned message as well as refusals, because
 * handoff 01 designed the strip and no win screen, and inventing a second component was not this side's
 * to do. The cost was that "you won" was announced in `--color-warn` orange, the colour the game
 * reserves for "you cannot do that", and that one message was said in two places at once.
 *
 * D40 of design spec 04 settled it: **the overlay says it and the strip says nothing.** So the two
 * status branches are gone from here, and `match-over` is now the win screen's business alone. See
 * `overlay-screens.js`.
 *
 * `kind` stays, even though the strip has exactly one kind left, because it is the seam the region is
 * told apart by and removing it would be a change to two end-to-end specs for no gain.
 */
function message(state) {
  if (state.refusalReason !== null) {
    return { kind: "refusal", key: state.refusalReason, options: {} };
  }
  return null;
}

/** Fill the strip that hangs off the bottom of the board, or empty it. */
export function showMessage($message, state) {
  const next = message(state);

  if (next === null) {
    $message.removeAttr("data-reason-key").removeAttr("data-message-kind").text("");
    return;
  }

  $message
    .attr("data-reason-key", next.key)
    .attr("data-message-kind", next.kind)
    .text(t(next.key, next.options));
}
