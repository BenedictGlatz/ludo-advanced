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

/** Enter and Space, which is what a button responds to and therefore what a clickable thing owes. */
function isActivationKey(event) {
  return event.key === "Enter" || event.key === " ";
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
    if (!isActivationKey(event)) return;

    event.preventDefault();
    handlers.onPawnActivated(pawnOf(this));
  });
}

/**
 * Bind the dice hand's handlers. Issue #31.
 *
 * A second binding root rather than a second selector on `.board`, because the hand lives in the rail
 * beside the board (D30) and is not inside it. The filter is the same idea as the pawns': a card that
 * is not this turn's to pick carries `data-playable="false"`, matches nothing, and the click quietly
 * does nothing. Whether picking is allowed right now is `dice-hand-view.js` writing down what the
 * phase already said, not a rule being decided here.
 *
 * `handlers.onDiceCardActivated(faces)` is called with the denomination, which is how the turn
 * manager identifies a card too.
 */
export function bindDiceHandEvents($hand, handlers) {
  const facesOf = (element) => Number($(element).attr("data-faces"));

  $hand.on("click", '.card[data-playable="true"]', function onClick() {
    handlers.onDiceCardActivated(facesOf(this));
  });

  $hand.on("keydown", '.card[data-playable="true"]', function onKeydown(event) {
    if (!isActivationKey(event)) return;

    event.preventDefault();
    handlers.onDiceCardActivated(facesOf(this));
  });
}
