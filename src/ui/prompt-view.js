/**
 * The strip that asks the player a question. Issues #33 and #34.
 *
 * `ui/` only: jQuery, i18next, no rules. One element with three jobs, because all three are the same
 * thing from the player's side: **the game is waiting for you, here is why, here are your buttons.**
 *
 * | The game is waiting for | What the strip shows |
 * | --- | --- |
 * | An Action card, or a pass (FR-23) | "Play a card or carry on", and a Carry on button |
 * | A Reaction, or a decline (FR-24, FR-25) | Who did what, the countdown, and Decline |
 * | A target for a card that was clicked | What to point at, and Cancel |
 *
 * Three separate regions would each be empty most of the time and would move the board when they
 * appeared, which is what FR-31's one-screen layout cannot afford.
 *
 * ## The countdown is displayed here and measured elsewhere
 *
 * `secondsLeft` is passed in. `ui/timers.js` owns the timeout that fires and `game-loop.js` owns the
 * interval that redraws, because how often a number is repainted is a presentation decision and nothing
 * else in the project has an opinion on it. This file renders whatever number it is handed.
 *
 * ## Design note, and it is a gap rather than a decision
 *
 * **No design specification covers this strip.** Design spec 03 covered the cards and the two hands and
 * stopped there. Everything below composes tokens that already exist in `tokens.css` and reuses the
 * refusal strip's shape from spec 01: no colour, size, spacing or type choice is made here. That is the
 * most this side can honestly do, and the real design is owed by handoff 04. Recorded in Chapter 04.
 */

import $ from "jquery";

import { cardById } from "../core/cards/catalogue.js";
import { t } from "../i18n/index.js";

/** What the strip is currently for. `prompt.css` keys its layout off this. */
export const PROMPT_MODE = {
  NONE: "none",
  ACTION: "action",
  REACTION: "reaction",
  TARGET: "target",
};

/** The buttons the strip can offer, as the `data-prompt-action` the event handler reads. */
export const PROMPT_ACTION = {
  SKIP: "skip",
  DECLINE: "decline",
  CANCEL: "cancel",
  /** A `direction`, `choice`, `number` or `player` target answered by a button rather than by a click. */
  PICK: "pick",
};

/** The strip, empty. One element, built once, never rebuilt. */
export function renderPrompt() {
  return $("<div>", { class: "prompt" })
    .attr("data-mode", PROMPT_MODE.NONE)
    .append(
      $("<p>", { class: "prompt__line" }),
      $("<span>", { class: "prompt__clock" }),
      $("<div>", { class: "prompt__buttons" })
    );
}

function button(label, action, value) {
  const $button = $("<button>", { type: "button", class: "prompt__button", text: label }).attr(
    "data-prompt-action",
    action
  );

  return value === undefined ? $button : $button.attr("data-prompt-value", value);
}

/** The one-line description of an open reaction window: who is doing what to whom. */
function windowLine(window) {
  const played = window.played
    .map((entry) =>
      t("reaction.played", {
        number: entry.seat + 1,
        card: t(`card.skill.${entry.cardId}.title`),
      })
    )
    .join(" · ");

  const trigger = t(`reaction.trigger.${window.trigger}`, { number: window.actor + 1 });

  return played === "" ? trigger : `${trigger} · ${played}`;
}

/**
 * The buttons a target kind is answered with, or an empty list when the board answers it.
 *
 * Four of the seven target kinds cannot be pointed at on the board: a direction, one of two options, a
 * number, and an opponent as a whole rather than one of their pawns. Those become buttons; the other
 * three are clicks on a pawn or a square and `target-picker.js` handles them.
 *
 * `number` is the awkward one. It offers every face of the chosen die as its own button rather than a
 * text field, because a text field needs validation, a submit and a keyboard, and the die has at most
 * twenty faces. FR FR is the only card that uses it.
 */
function targetButtons(kind, { seats, actor, chosenDie, choices }) {
  switch (kind) {
    case "direction":
      return [
        button(t("action.target.forward"), PROMPT_ACTION.PICK, "1"),
        button(t("action.target.backward"), PROMPT_ACTION.PICK, "-1"),
      ];
    case "choice":
      return choices.map((value) => button(t(`action.target.${value}`), PROMPT_ACTION.PICK, value));
    case "number":
      return Array.from({ length: chosenDie }, (_, index) =>
        button(String(index + 1), PROMPT_ACTION.PICK, String(index + 1))
      );
    case "player":
      return seats
        .filter((seat) => seat !== actor)
        .map((seat) =>
          button(t("player.name", { number: seat + 1 }), PROMPT_ACTION.PICK, String(seat))
        );
    default:
      return [];
  }
}

/** Redraw the strip for whatever the game is waiting on. `pick` is the target picker's state, or `null`. */
export function updatePrompt($prompt, state, { secondsLeft = null, pick = null } = {}) {
  const $line = $prompt.find(".prompt__line");
  const $clock = $prompt.find(".prompt__clock");
  const $buttons = $prompt.find(".prompt__buttons").empty();

  if (pick !== null) {
    $prompt.attr("data-mode", PROMPT_MODE.TARGET);
    $line.text(t(`action.target.${pick.kind}`));
    $clock.text("");
    $buttons.append(
      ...targetButtons(pick.kind, pick),
      button(t("action.target.cancel"), PROMPT_ACTION.CANCEL)
    );
    return $prompt;
  }

  if (state.reactionWindow !== null) {
    $prompt.attr("data-mode", PROMPT_MODE.REACTION);
    $line.text(windowLine(state.reactionWindow));
    $clock.text(secondsLeft === null ? "" : t("reaction.prompt", { seconds: secondsLeft }));
    $buttons.append(button(t("reaction.decline"), PROMPT_ACTION.DECLINE));
    return $prompt;
  }

  if (state.phase === "action") {
    $prompt.attr("data-mode", PROMPT_MODE.ACTION);
    $line.text(t("action.prompt"));
    $clock.text("");
    $buttons.append(button(t("action.skip"), PROMPT_ACTION.SKIP));
    return $prompt;
  }

  $prompt.attr("data-mode", PROMPT_MODE.NONE);
  $line.text("");
  $clock.text("");

  return $prompt;
}

/** The target kinds a card still needs, in the order the player is asked for them. */
export function targetsFor(cardId) {
  return cardById(cardId).targets.filter((kind) => kind !== "none");
}
