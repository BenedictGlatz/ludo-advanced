/**
 * What the reaction strip says while a window is open, and whether it offers Decline. Issue #77.
 *
 * `ui/` only, and **pure**: i18next and the seat vocabulary, no jQuery and no DOM. Same split as
 * `overlay-screens.js` against `overlay-view.js`, and for the same reason: `prompt-view.js` imports
 * jQuery, so nothing in it can be unit tested under `environment: "node"`, and the one decision in
 * this strip that was ever wrong is a decision and not a look.
 *
 * ## The bug this file exists for
 *
 * `openWindow` guarantees that **somebody** at the table holds a matching Reaction card. It does not
 * say who, and the strip used to draw "Ablehnen" for whoever was looking at the screen the moment
 * `state.reactionWindow` stopped being `null`. Two cases put a person in front of a Decline that was
 * not theirs to press:
 *
 * | Who saw the button | Why |
 * | --- | --- |
 * | A person in a match against bots, during the bot's 900 ms card hold | The loop renders before `bot-driver.js` answers, and a bot that plays a card waits out its hold with the window still open |
 * | An online guest who holds no Reaction card | The strip never asked whether this screen's seat was in `eligible`, and `onDecline` silently dropped the click |
 *
 * The rule is one line: **the strip offers Decline only when the seat being asked is a person at this
 * screen.** The seat being asked is `seatOnShow`, `eligible[0]`, because that is the seat whose hand is
 * on screen and whose card a click would play. Whether that seat is at this screen is the loop's
 * `isLocal`, which is what the skill hand and the dice hand already ask before they draw a clickable
 * card. Everybody else sees who did what, and who the game is waiting for.
 *
 * `reaction.waiting` was written for exactly this line and had no reader until now.
 */

import { seatOnShow } from "../state/intents-cards.js";
import { t } from "../i18n/index.js";
import { seatName } from "./player-labels.js";

/** The separator between the sentences the strip strings together. */
const SEPARATOR = " · ";

/**
 * The one-line description of an open reaction window: who is doing what, and what has been played into it.
 *
 * `match` is `{ seats, bots }`, and a state object is one. The seat list is needed because the players
 * are numbered by position in the match rather than by seat index: a two-player match otherwise reads
 * "Spieler 3 würfelt" and has no Spieler 2. See `player-labels.js`.
 *
 * **The bot list is needed because it used to say "Spieler" for a bot** (issue #82). Every one of these
 * three sentences named a number and the locale wrote the word "Spieler" in front of it, so a window
 * opened by a bot in a match where the HUD says "Bot 3" read "Spieler 3 will eine Figur schlagen".
 * Now a bot can play a card **into** a window, so the line has to be able to name one, and the three
 * keys interpolate `{{name}}` instead of `{{number}}`.
 */
export function windowLine(match, window) {
  const played = window.played.map((entry) =>
    t("reaction.played", {
      name: seatName(match, entry.seat),
      card: t(`card.skill.${entry.cardId}.title`),
    })
  );

  const trigger = t(`reaction.trigger.${window.trigger}`, {
    name: seatName(match, window.actor),
  });

  return [trigger, ...played].join(SEPARATOR);
}

/**
 * What the strip shows for the open window in `state`.
 *
 * `canAnswer` is whether the seat being asked is a person at this screen. Returns `{ line, decline }`:
 * the sentence, and whether a Decline button belongs under it. When nobody here is being asked, the
 * sentence gains "Warte auf {{name}}" and the button is left out, so a player who holds no Reaction
 * card is told what is happening rather than asked a question they cannot answer.
 */
export function reactionPrompt(state, canAnswer) {
  const window = state.reactionWindow;
  const line = windowLine(state, window);

  if (canAnswer) return { line, decline: true };

  const waiting = t("reaction.waiting", { name: seatName(state, seatOnShow(state)) });

  return { line: [line, waiting].join(SEPARATOR), decline: false };
}
