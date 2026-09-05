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

import $ from "jquery";

import { REGION, absoluteSquare, homeColumnStep, region } from "../core/board.js";
import { MATCH_STATUS, TURN_PHASE } from "../state/game-state.js";
import { movablePawns } from "../state/turn-manager.js";
import { t } from "../i18n/index.js";
import { pawnElement } from "./board-view.js";
import { seatLabel } from "./player-labels.js";
import { rollBreakdown } from "./roll-steps.js";
import { botCardPlayed } from "./timers.js";

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
 * `kind` stays, even though the strip had exactly one kind left, because it is the seam the region is
 * told apart by and removing it would be a change to two end-to-end specs for no gain. **Issue #45
 * gave it a second kind and vindicated keeping it**, so `data-message-kind` is now load-bearing rather
 * than vestigial. Design spec 11's D73 gave it a third, which is the reason the element was renamed
 * from `.move-refusal` to `.message-strip`: two of the three things it says are not refusals.
 *
 * ## The two new kinds, and the colour they ship in
 *
 * A trap going off and a card being cancelled by an aura are both things that happen **to** the player
 * without them asking. Under the new rules Banana Peel is the extreme case: the pawn arrives exactly
 * where it was aimed and silently loses its next turn, so with no message the game simply eats a turn.
 *
 * They are announced in this strip, which is painted in `--color-warn`, the colour the game reserves
 * for "you cannot do that". **That is wrong and it ships anyway**, which is a deviation and not an
 * oversight. The three options were: announce it in the wrong colour, wait for design handoff 07 and
 * leave a Banana Peel eating turns in silence until then, or invent a third neutral treatment, which
 * `CLAUDE.md` forbids this side from doing. D55 of brief 07 is open against it.
 *
 * The three branches are mutually exclusive in practice. A refusal means no move was possible, and a
 * trap only fires on a move that happened. The order below is nonetheless deliberate: a refusal is
 * about what the player may do next and outranks a report about what already happened.
 */
function message(state) {
  if (state.refusalReason !== null) {
    return { kind: "refusal", key: state.refusalReason, options: {} };
  }

  if (state.trapFired !== null) {
    return {
      kind: "trap",
      key: `trap.fired.${state.trapFired.kind}`,
      options: {
        player: seatLabel(state, state.trapFired.player),
        owner: seatLabel(state, state.trapFired.owner),
        squares: state.trapFired.squares,
      },
    };
  }

  if (state.nullifiedCard !== null) {
    return { kind: "trap", key: "trap.nullified", options: {} };
  }

  return rollMessage(state) ?? cardMessage(state);
}

/**
 * The fourth kind: a **bot** played a card. Issue #82.
 *
 * A person who plays a card watched themselves do it, so only a bot's play is announced. Without this
 * the whole card mechanic of a match against three bots happens in silence: several cards leave the
 * board looking exactly as it did before, and the strip is the only place the play can be seen at all.
 *
 * **Last of the four branches, which is deliberate.** In the action phase there is no roll yet, so
 * `rollMessage` answers `null` and the card play is what the strip says; once the die is rolled the
 * breakdown of that roll is the more useful thing and takes the strip back. The card play is therefore
 * on screen for the part of the turn it belongs to, and `card-controls.js` holds the turn for
 * `--motion-trap-hold` so it cannot be missed.
 *
 * **It ships in `--color-warn`, the colour the game reserves for "you cannot do that", and that is
 * wrong.** No stylesheet reads `data-message-kind="card"`, so the strip keeps its default voice. It is
 * the same deviation issue #45 shipped for the trap announcement and for the same reason: the
 * alternative is to invent a treatment, which `CLAUDE.md` forbids this side from doing. D87 of design
 * brief 14 is open against it, and the fix is expected to be two selectors rather than a component.
 */
function cardMessage(state) {
  const played = botCardPlayed(state);
  if (played === null) return null;

  return {
    kind: "card",
    key: "turn.cardPlayed",
    options: {
      name: seatLabel(state, played.seat),
      card: t(`card.skill.${played.cardId}.title`),
    },
  };
}

/**
 * The third kind of message: a roll that cards changed, explaining itself. D73, NFR-08.
 *
 * Last of the four branches, because a refusal is about what the player may do next and a trap is
 * something that happened to them, and both outrank a footnote about a number that is already on the
 * card. In practice they are mutually exclusive: this is asked in `act`, and a refusal means no move was
 * possible, so the turn never reached `act` at all.
 *
 * ## Two conditions, and only one of them comes from the spec
 *
 * **`act`** is D73.4: the breakdown stays as long as the player is deciding which pawn to move, because
 * that is the decision it informs, and it is cleared when the phase leaves that. It holds nothing and
 * costs no milliseconds, which is also why D70's hold could stay as short as 900 ms.
 *
 * **`running`** is not in the spec and comes from a test. `win.spec.js` asserts that the strip carries no
 * `data-message-kind` at all once a match is over, which is D40: the overlay says "you won" and the strip
 * says nothing. A won match can be sitting in `act` with a chain still in the state, so without this the
 * win screen would open over a strip explaining the winning roll.
 *
 * `data-reason-key` is a **latch and not a locale key**, which is the one surprising thing here.
 * `message-strip.css` makes the strip visible with
 * `[data-reason-key]:not([data-reason-key=""])`, so something has to be in it, and this message has a
 * list instead of a sentence. Nothing calls `t()` on it and there is no `turn.roll-steps` in `ui.json`.
 */
function rollMessage(state) {
  if (state.status !== MATCH_STATUS.RUNNING || state.phase !== TURN_PHASE.ACT) return null;

  const steps = rollBreakdown(state);
  if (steps === null) return null;

  return { kind: "roll", key: "turn.roll-steps", steps };
}

/**
 * Fill the strip that hangs above the skill plate, or empty it.
 *
 * `.text()` first in the list case as well as in the empty one, because it is what removes the children
 * of whatever the strip said last. Three kinds of message share one element, so every write has to be
 * able to undo any of the other two.
 *
 * **The list is the one element in this file that is built rather than rewritten**, which is the standing
 * delivery rule it bends. The reason it is allowed to: the number of steps changes from roll to roll, so
 * there is no fixed set of slots to keep, and nothing on it transitions. The strip itself, which does
 * transition, is built once by `page.js` and only ever gets attributes here.
 */
export function showMessage($message, state) {
  const next = message(state);

  if (next === null) {
    $message.removeAttr("data-reason-key").removeAttr("data-message-kind").text("");
    return;
  }

  $message.attr("data-reason-key", next.key).attr("data-message-kind", next.kind).text("");

  if (next.steps === undefined) {
    $message.text(t(next.key, next.options));
    return;
  }

  const $steps = $("<ol>", { class: "message-strip__steps" });

  for (const step of next.steps) {
    $steps.append(
      $("<li>", { class: "message-strip__step", "data-roll-step": step.kind }).text(step.text)
    );
  }

  $message.append($steps);
}
