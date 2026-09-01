/**
 * Pointing at what a card acts on. Issue #34.
 *
 * `ui/` only. Holds no rules: which targets a card needs comes from the catalogue, and whether the
 * finished answer is acceptable is `checkTarget` in `state/skill-play.js`. This file is the **gesture**
 * between the two.
 *
 * ## Why it is a small state machine and not one prompt
 *
 * Sixteen of the 29 cards need a target and two of them need **two**: Hyperbeam wants a pawn and a
 * direction, Aight Imma Head Out wants a pawn and one of two options. So a card play is a sequence of
 * questions, and the player has to be able to abandon it halfway.
 *
 * ```
 * click a card -> [ask for each target in turn] -> dispatch play-card
 *                          |
 *                       cancel -> nothing happened
 * ```
 *
 * **Nothing is dispatched until every target is in.** That is what makes cancelling free: no intent was
 * sent, so there is nothing to undo, and the rules layer never knew a card had been clicked.
 *
 * ## The half-finished play is presentation state, and it lives here
 *
 * It is deliberately **not** in the frozen game state. A clicked card with no target yet is a fact about
 * a mouse, it disappears if the player changes their mind, and putting it in the state object would make
 * the rules layer hold it. `game-loop.js` passes what it needs to the two views on every render.
 *
 * ## Three kinds are answered on the board and four with buttons
 *
 * A pawn and a square are pointed at. A direction, one of two options, a number and "which opponent" are
 * not things on the board, so `prompt-view.js` renders buttons for them. The split is per target kind and
 * it is the only reason this file knows about the board at all.
 */

import { PAWNS_PER_PLAYER, REGION, TRACK_LENGTH, region } from "../core/board.js";
import { targetsFor } from "./prompt-view.js";

/** The target kinds the player answers by clicking the board. Everything else is a button. */
const ON_BOARD = ["own-pawn", "enemy-pawn", "track-square"];

/** The two options "Aight Imma Head Out" offers. The one card in the set with a `choice` target. */
const CHOICES = { "action-head-out": ["advance", "retreat"] };

/**
 * Mark what can be clicked for this target kind, and say so on the board.
 *
 * `data-picking` on `.board` and `data-pickable` on each candidate, which is the same shape
 * `move-hints.js` already uses for legal moves: the view writes down an answer rather than the CSS
 * working one out. A pawn or a square that is not a candidate matches no selector and the click quietly
 * does nothing.
 *
 * **A pawn in a start area or a house cannot be pointed at**, because no card in the set can act on one:
 * every pawn-targeting card either pushes it along the track or puts something on the square it is
 * standing on, and neither exists off the track. Refusing it here means the player is never offered a
 * click that `checkTarget` would accept and the effect would silently ignore.
 */
function markBoard($board, kind, seat, state) {
  clearBoard($board);
  if (!ON_BOARD.includes(kind)) return;

  $board.attr("data-picking", kind);

  if (kind === "track-square") {
    $board.find(".square--track").attr("data-pickable", "true");
    return;
  }

  for (const pawn of state.pawns) {
    const mine = pawn.player === seat;
    if (kind === "own-pawn" ? !mine : mine) continue;
    if (region(pawn.r) !== REGION.TRACK) continue;

    $board
      .find(`.pawn[data-player="${pawn.player}"][data-pawn="${pawn.pawn}"]`)
      .attr("data-pickable", "true");
  }
}

/** Take every picking mark back off the board. */
function clearBoard($board) {
  $board.removeAttr("data-picking");
  $board.find("[data-pickable]").removeAttr("data-pickable");
}

/**
 * A picker.
 *
 * `onReady(cardId, seat, target)` fires when every target is in, which is where `game-loop.js` dispatches
 * `play-card`. `onChange()` fires whenever the question changes, so the loop can re-render.
 */
export function createTargetPicker({ $board, onReady, onChange }) {
  let pick = null;

  function finish() {
    const { cardId, seat, collected } = pick;

    pick = null;
    clearBoard($board);
    onReady(cardId, seat, collected);
  }

  function ask(state) {
    const kind = pick.kinds[pick.index];

    markBoard($board, kind, pick.seat, state);
    onChange();
  }

  /** One answer recorded. Moves on to the next question, or finishes. */
  function record(state, value) {
    pick.collected = { ...pick.collected, ...value };
    pick.index += 1;

    if (pick.index >= pick.kinds.length) {
      finish();
      return;
    }

    ask(state);
  }

  return {
    /**
     * The player clicked a card. Start collecting, or dispatch straight away.
     *
     * A card with no target at all is the common case, thirteen of the 29, and it must not put a
     * "point at something" prompt on screen for a frame.
     */
    start(state, cardId, slot, seat) {
      const kinds = targetsFor(cardId);
      pick = { cardId, slot, seat, kinds, index: 0, collected: {} };

      if (kinds.length === 0) {
        finish();
        return;
      }

      ask(state);
    },

    /** What the prompt should be asking, or `null`. Includes what the buttons need to render. */
    current(state) {
      if (pick === null) return null;

      return {
        kind: pick.kinds[pick.index],
        seats: state.seats,
        actor: pick.seat,
        chosenDie: state.chosenDie ?? TRACK_LENGTH,
        choices: CHOICES[pick.cardId] ?? [],
      };
    },

    /** Which slot of the hand is mid-play, for `updateSkillHand`. `-1` when nothing is. */
    selectedSlot() {
      return pick === null ? -1 : pick.slot;
    },

    /** A pawn was clicked while a pawn was being asked for. */
    pickPawn(state, player, pawn) {
      if (pick === null || !ON_BOARD.includes(pick.kinds[pick.index])) return;
      if (!Number.isInteger(pawn) || pawn < 0 || pawn >= PAWNS_PER_PLAYER) return;

      record(state, { pawn: { player, pawn } });
    },

    /** A track square was clicked while a square was being asked for. */
    pickSquare(state, square) {
      if (pick === null || pick.kinds[pick.index] !== "track-square") return;

      record(state, { square });
    },

    /**
     * A button in the prompt was pressed.
     *
     * The value arrives as a string, because it came off a DOM attribute, and the four kinds want three
     * different types back. Converting here rather than in `events.js` keeps the event layer free of any
     * knowledge of what a target is.
     */
    pickValue(state, raw) {
      if (pick === null) return;

      const kind = pick.kinds[pick.index];
      const value = {
        direction: () => ({ direction: Number(raw) }),
        choice: () => ({ choice: raw }),
        number: () => ({ number: Number(raw) }),
        player: () => ({ player: Number(raw) }),
      }[kind];

      if (value === undefined) return;

      record(state, value());
    },

    /** The player changed their mind. Nothing was dispatched, so nothing has to be undone. */
    cancel() {
      if (pick === null) return;

      pick = null;
      clearBoard($board);
      onChange();
    },

    /** Is a card play half finished? The loop asks before it treats a pawn click as a move. */
    isPicking() {
      return pick !== null;
    },
  };
}
