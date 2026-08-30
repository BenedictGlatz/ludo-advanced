/**
 * The only place in the project where a jQuery event handler lives. Issue #62.
 *
 * `CLAUDE.md` puts every DOM event here so that "what can the player do" is one file long. Each
 * handler does exactly one thing: turn a DOM event into a call on the game loop. It reads no state,
 * decides no rule, and never asks whether the move is legal. `[data-movable="true"]` in the selector
 * is not a rule check either: it is the attribute `move-hints.js` already wrote after `core/` had
 * answered the question.
 *
 * ## Why the handlers are delegated
 *
 * They are bound to `.board` and filtered by selector rather than bound to each pawn. Nothing in the
 * view is destroyed and rebuilt, so this is not about surviving a re-render. It is that the filter is
 * evaluated at click time: a pawn that cannot move this turn matches nothing and the click quietly
 * does nothing, without a handler having to be attached and detached every turn.
 */

import $ from "jquery";

/** The pawn identity a DOM event happened on. */
function pawnOf(element) {
  return Number($(element).attr("data-pawn"));
}

/**
 * Bind the board's handlers.
 *
 * `handlers.onPawnActivated(pawn)` is called with the pawn number, once per activation. What an
 * activation means, selecting or committing, is the game loop's decision and not this file's.
 */
export function bindBoardEvents($board, handlers) {
  $board.on("click", '.pawn[data-movable="true"]', function onClick() {
    handlers.onPawnActivated(pawnOf(this));
  });

  // D11 designed a `:focus-visible` ring, which is only worth having if the keyboard can actually
  // reach and activate a pawn. Enter and Space are what a button responds to, and a pawn that can be
  // clicked is behaving as one.
  $board.on("keydown", '.pawn[data-movable="true"]', function onKeydown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    handlers.onPawnActivated(pawnOf(this));
  });
}
