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

/**
 * Bind the skill hand's handlers. Issue #34.
 *
 * The same shape as the dice hand: a third binding root, because the hand is in the rail and not inside
 * the board, and the same `[data-playable="true"]` filter. `skill-hand-view.js` wrote that attribute
 * from `playableCards`, which is the dispatcher's own check, so the filter is a fact and not a rule.
 *
 * `handlers.onSkillCardActivated(cardId, slot)` gets **both** the card and the slot. The card is what the
 * intent needs and the slot is what the view needs, because a hand can hold two copies of one card and
 * marking the played one by id would light up both.
 */
export function bindSkillHandEvents($hand, handlers) {
  const activate = (element) =>
    handlers.onSkillCardActivated(
      $(element).attr("data-card-id"),
      Number($(element).attr("data-slot"))
    );

  $hand.on("click", '.card[data-playable="true"]', function onClick() {
    activate(this);
  });

  $hand.on("keydown", '.card[data-playable="true"]', function onKeydown(event) {
    if (!isActivationKey(event)) return;

    event.preventDefault();
    activate(this);
  });
}

/**
 * Bind the prompt strip's buttons. Issues #33 and #34.
 *
 * One handler for every button on the strip, told apart by `data-prompt-action`. A `<button>` needs no
 * keyboard handler of its own: Enter and Space activate it and fire a click, which is exactly why the
 * strip uses real buttons and the cards and pawns, which cannot be, carry a `keydown` each.
 *
 * `handlers.onPromptAction(action, value)` gets the action and, for a target button, what it stands for.
 */
export function bindPromptEvents($prompt, handlers) {
  $prompt.on("click", "[data-prompt-action]", function onClick() {
    handlers.onPromptAction($(this).attr("data-prompt-action"), $(this).attr("data-prompt-value"));
  });
}

/**
 * Bind the board's picking handlers: a pawn or a square being pointed at for a card. Issue #34.
 *
 * A **second** binding on `.board`, kept apart from `bindBoardEvents` because the two answer different
 * questions and must not be confused. `[data-movable]` means "this pawn can make a move this turn";
 * `[data-pickable]` means "this is a legal answer to the question the prompt is asking right now". A pawn
 * can carry either, both, or neither, and the two are written by different modules.
 */
export function bindPickEvents($board, handlers) {
  const pickPawn = (element) =>
    handlers.onPawnPicked(Number($(element).attr("data-player")), pawnOf(element));

  const pickSquare = (element) => handlers.onSquarePicked(Number($(element).attr("data-square")));

  $board.on("click", '.pawn[data-pickable="true"]', function onClick() {
    pickPawn(this);
  });

  $board.on("click", '.square--track[data-pickable="true"]', function onClick() {
    pickSquare(this);
  });

  // Both keyboard pairs are new in issue #45, and the square one closes a real gap rather than adding
  // a nicety: **no field on the board was reachable from the keyboard at all.** Pawns and cards each
  // got a `keydown` when they became clickable and fields were simply missed, which was survivable
  // while one card in 29 pointed at a field. Issue #45 makes it five cards, four of them the trap
  // cards, so a keyboard player could not play a trap at all. NFR-08.
  //
  // A field is not a `<button>` and cannot be one: it is a grid cell that pawns are painted over. So it
  // needs the same `keydown` plus `tabindex` treatment the pawns and cards have, and `target-picker.js`
  // adds the `tabindex` only while the field is actually pickable.
  $board.on("keydown", '.pawn[data-pickable="true"]', function onKeydown(event) {
    if (!isActivationKey(event)) return;

    event.preventDefault();
    pickPawn(this);
  });

  $board.on("keydown", '.square--track[data-pickable="true"]', function onKeydown(event) {
    if (!isActivationKey(event)) return;

    event.preventDefault();
    pickSquare(this);
  });
}

/**
 * Bind everything inside a match, in one call. Issue #43.
 *
 * The five bindings below it are unchanged and still exported: `match-flow.js` binds the chrome and the
 * overlay separately, because those two live for the whole session rather than for one match. What this
 * groups is exactly the set `game-loop.js`'s `start()` had written out, and the grouping is a real seam
 * rather than a line count: **these are the five regions that are rebuilt with every match.**
 *
 * `regions` is `{ $board, $diceHand, $skillHand, $prompt }` and `handlers` is `{ board, cards }`, the
 * two controller objects the loop already holds.
 */
export function bindMatchEvents({ $board, $diceHand, $skillHand, $prompt }, { board, cards }) {
  bindBoardEvents($board, { onPawnActivated: board.onPawnActivated });
  bindPickEvents($board, cards.handlers);
  bindDiceHandEvents($diceHand, { onDiceCardActivated: board.onDiceCardActivated });
  bindSkillHandEvents($skillHand, cards.handlers);
  bindPromptEvents($prompt, cards.handlers);
}

/**
 * Bind the always-present controls: the language switch and the pause button. Issue #39.
 *
 * The same shape as the prompt strip's binding and for the same reason: one handler for every button in
 * the region, told apart by `data-action`, and no `keydown` of its own because these are real
 * `<button>` elements.
 *
 * `handlers.onChromeAction(action)` gets `"language"` or `"pause"`.
 */
export function bindChromeEvents($chrome, handlers) {
  $chrome.on("click", "[data-action]", function onClick() {
    handlers.onChromeAction($(this).attr("data-action"));
  });
}

/**
 * Bind the overlay's buttons. Issues #39 and #41.
 *
 * The same shape as the prompt strip and the chrome: one handler for every button in the region, told
 * apart by `data-action`, and no `keydown` of its own because these are real `<button>` elements.
 *
 * `handlers.onOverlayAction(action, value)` gets the action and, for the match-setup buttons, the player
 * count they stand for.
 */
export function bindOverlayEvents($overlay, handlers) {
  $overlay.on("click", "[data-action]", function onClick() {
    handlers.onOverlayAction($(this).attr("data-action"), $(this).attr("data-count"));
  });
}
