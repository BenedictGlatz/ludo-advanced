/**
 * How the page is put together. Issue #41.
 *
 * Split out of `match-flow.js` when that file passed the 300-line limit (NFR-02), along the seam that
 * was already there: **this file answers "what elements does the page consist of", and `match-flow.js`
 * answers "which screen is the session on".** The two had been in one file only because assembling the
 * page used to happen once, in `main.js`, and now happens again every time a match starts.
 *
 * `ui/` only, and it holds nothing: every function returns fresh elements or moves existing ones.
 */

import $ from "jquery";

import { renderBoard } from "./board-view.js";
import { renderDiceHand } from "./dice-hand-view.js";
import { renderHud } from "./hud-view.js";
import { renderPrompt } from "./prompt-view.js";
import { renderSkillHand } from "./skill-hand-view.js";

/**
 * The six regions a running match needs.
 *
 * `handSize` comes from the dice source rather than being the literal 3, for the same reason
 * `dice-hand-view.js` takes it: reweighting the pool to deal four cards should be a change in
 * `core/dice-pool.js` and nowhere else.
 */
export function matchParts(state, handSize) {
  return {
    $board: renderBoard(state),
    $hud: renderHud(state),
    $diceHand: renderDiceHand(handSize),
    $skillHand: renderSkillHand(),
    $prompt: renderPrompt(),
    $message: $("<div>", { class: "message-strip" }),
  };
}

/**
 * The same six regions with no match in them, for the main menu to sit over.
 *
 * Empty regions rather than no regions, so `app.css`'s grid has the same shape whether a match is on or
 * not and the menu does not sit on a page that jumps into existence behind it.
 */
export function emptyParts() {
  return {
    $board: $("<div>", { class: "board" }),
    $hud: $("<div>", { class: "hud" }),
    $diceHand: $("<div>", { class: "hand hand--dice" }),
    $skillHand: $("<div>", { class: "hand hand--skill" }),
    $prompt: renderPrompt(),
    $message: $("<div>", { class: "message-strip" }),
  };
}

/**
 * Put the page in the document, replacing whatever was there.
 *
 * The order is the grid order in `app.css`: chrome, HUD, board, the two hand plates, the prompt strip.
 * The overlay is last so it paints over all of them without needing a z-index that competes with the
 * card layers in `tokens.css`.
 *
 * **The message strip is inside `.app__skill` and not a row of the grid**, which is D35 of design spec 04
 * and is the reason that spec could give the board its 44vw back. It used to hold a full-width row at the
 * foot of the page permanently, faded to nothing, so that an arriving refusal would not make the page
 * jump. It hangs off a plate instead: `message-strip.css` positions it absolutely and `app.css` makes the
 * plate the containing block, so it costs no height and still cannot make the page jump.
 *
 * **Which plate changed on 2026-09-05, D98 of design handoff 16.** It hung off the bottom of the board
 * until then, and in play that put it over two start areas and the last four fields of two tracks. The
 * board is the one region in the game that may not be covered, so the strip now hangs above the skill
 * plate and grows upward from there. It is the first child of `.app__skill` so the source order matches
 * the paint order; the CSS does not depend on that.
 *
 * **The two session elements are detached before the wipe, and that is not a tidiness measure.**
 * jQuery's `.empty()` deliberately unbinds every handler on the children it removes, so from the second
 * match onward the chrome and the overlay would come back with their buttons dead. The symptom is
 * particularly nasty: everything still renders, so the menu and the handover look right and simply stop
 * responding. `.detach()` is the documented way to take an element out of the document and keep what is
 * bound to it.
 *
 * **`session.$app` is written here**, because the shell element is built in this function and rebuilt on
 * every match, and `match-flow.js` needs a handle on it to write `data-paused`. Design spec 04 asks for
 * that attribute so the reaction countdown's CSS animation can stop when FR-07's pause is up: an
 * animation cannot pause itself, and the flow is what knows the game has stopped.
 */
export function mount($root, parts, session) {
  session.$chrome.detach();
  session.$overlay.detach();

  session.$app = $("<div>", { class: "app" });

  $root
    .empty()
    .append(
      session.$app.append(
        session.$chrome,
        parts.$hud,
        $("<div>", { class: "app__board" }).append(parts.$board),
        $("<div>", { class: "app__dice" }).append(parts.$diceHand),
        $("<div>", { class: "app__skill" }).append(parts.$message, parts.$skillHand),
        parts.$prompt,
        session.$overlay
      )
    );
}
