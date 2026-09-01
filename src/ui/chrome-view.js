/**
 * The controls that are on screen the whole time. Issues #39 and #30.
 *
 * Three of them, and they have nothing to do with each other beyond all being always reachable: the
 * language switch (FR-34), the pause button (FR-07) and the dice card pool overview (issue #30).
 *
 * **Why the pool overview is here and not on the hand.** The question it answers, "what am I choosing
 * from", is asked while looking at the hand, so the hand plate would be the nearer place for the control.
 * It is here because this row is where a control that is reachable at any point in a turn already lives,
 * and the overview has to be reachable in the `choose` phase or it does not help the decision it exists
 * for. Whether the hand should carry a second entry point is D47 of handoff 05, and the flow needs only
 * the extra element to support one.
 *
 * `ui/` only: jQuery, i18next, no rule.
 *
 * ## Why the language switch cannot live in a menu
 *
 * FR-34 is a `must have` and its acceptance criterion is that switching locale re-renders every visible
 * string, at runtime. `S11` in the obligations book pairs the language setting with the audio setting on
 * one settings screen reached from the main menu, and audio was dropped out of epic #39 on 2026-09-01.
 * Leaving the language switch behind in a screen that no longer exists would have quietly dropped a
 * must-have requirement, so it is here instead, where a player in the middle of a match can reach it.
 *
 * **The button shows the language you would switch to, not the one you are in.** `language.switch` is
 * "English" in the German file and "Deutsch" in the English one, so one key covers both directions and
 * the label is always a word the reader can act on. `data-lang` carries the language actually in use, for
 * the stylesheet and for the tests.
 *
 * ## It also carries the turn sentence, and that is a width decision
 *
 * "Spieler 1 (Rot) ist am Zug" is rendered here rather than in the HUD, because at the design
 * resolution a four-seat HUD row has no space left for it and this row has roughly 1200 px going spare.
 * The sentence itself is `hud-view.js`'s `turnLine`, which carries the measurement.
 *
 * ## Design note
 *
 * **No design specification covers this.** It is D42 in handoff 04, which asks where these two controls
 * sit and what the language control should be. `chrome.css` composes existing tokens only. Same situation
 * as `prompt-view.js` and `hud-view.js`, recorded rather than hidden.
 */

import $ from "jquery";

import { currentLanguage, t } from "../i18n/index.js";

/** What the chrome's buttons can ask for, as the `data-action` the event handler reads. */
export const CHROME_ACTION = {
  LANGUAGE: "language",
  PAUSE: "pause",
  /** Open the dice card pool overview (issue #30). */
  POOL: "pool",
};

function chromeButton(action) {
  return $("<button>", { type: "button", class: "chrome__button" }).attr("data-action", action);
}

/**
 * The chrome region, empty of text.
 *
 * Real `<button>` elements, so Enter and Space work without a `keydown` handler of their own. That is
 * the same reason the prompt strip uses buttons and the cards, which cannot be buttons, carry one each.
 */
export function renderChrome() {
  return $("<div>", { class: "app__chrome" }).append(
    $("<p>", { class: "chrome__turn" }),
    chromeButton(CHROME_ACTION.POOL),
    chromeButton(CHROME_ACTION.PAUSE),
    chromeButton(CHROME_ACTION.LANGUAGE)
  );
}

/**
 * Rewrite the labels.
 *
 * Called on every render, which is what makes the language switch work: `changeLanguage` resolves and
 * the loop re-renders, and every view rewrites its own text from `t()`. Nothing caches a translated
 * string, so there is no list of things to remember to refresh.
 *
 * `canPause` is passed in rather than read off the state, because whether pausing is possible is a
 * question about the view's own screen (there is nothing to pause on the main menu), and this file has
 * no state object.
 */
export function updateChrome($chrome, { canPause = true, turn = "" } = {}) {
  const language = currentLanguage();

  // The turn sentence rides in this row because the row has the width to spare and the HUD does not.
  // `hud-view.js` composes it and carries the arithmetic behind that.
  $chrome.children(".chrome__turn").text(turn);

  $chrome
    .children(`[data-action="${CHROME_ACTION.LANGUAGE}"]`)
    .attr("data-lang", language)
    .attr("aria-label", t("language.label"))
    .text(t("language.switch"));

  $chrome
    .children(`[data-action="${CHROME_ACTION.PAUSE}"]`)
    .attr("hidden", canPause ? null : "hidden")
    .text(t("pause.open"));

  // The pool overview shares `canPause`, because it is the same condition under a second name: there is
  // no pool to look at without a running match, and both buttons open the same overlay the same way.
  $chrome
    .children(`[data-action="${CHROME_ACTION.POOL}"]`)
    .attr("hidden", canPause ? null : "hidden")
    .attr("aria-label", t("pool.label"))
    .text(t("pool.open"));

  return $chrome;
}
