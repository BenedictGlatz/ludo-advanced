/**
 * Draw the whole page from one state object. Issue #39.
 *
 * Split out of `game-loop.js` when that file passed the 300-line limit (NFR-02), and the seam is a real
 * one rather than a convenient place to cut: **this file answers "what does the page look like for this
 * state", and `game-loop.js` answers "what does the game do between the player's clicks".** The two had
 * been in one file since the loop had one region to draw and four now.
 *
 * `ui/` only, and it holds no state of its own: every call is a pure function of what it is handed.
 *
 * ## Why one function and not seven calls at the call site
 *
 * The order does not matter and every one of the seven takes the same state, so a list of them is not
 * logic. What it **is** is a checklist, and the failure mode it prevents is a region that stops being
 * redrawn: the HUD updating on every render and the chrome only on a language change would be invisible
 * until somebody noticed the turn sentence going stale. One function means one place to add a region.
 */

import { updateBoard } from "./board-view.js";
import { updateChrome } from "./chrome-view.js";
import { updateDiceHand } from "./dice-hand-view.js";
import { turnLine, updateHud } from "./hud-view.js";
import { applyMoveHints, showMessage } from "./move-hints.js";
import { updatePrompt } from "./prompt-view.js";
import { updateSkillHand } from "./skill-hand-view.js";

/**
 * Bind the regions once and get back a `render(state, extras)`.
 *
 * `extras` carries the three things that are **presentation state** and are therefore not in the frozen
 * game state: which hand slot is mid-play, how many seconds are left on the reaction clock, and what the
 * target picker is currently asking for. `card-controls.js` owns all three.
 */
export function createRenderer({
  $board,
  $hud,
  $chrome,
  $diceHand,
  $skillHand,
  $prompt,
  $message,
}) {
  return function render(state, { selectedSlot = -1, secondsLeft = null, pick = null } = {}) {
    updateBoard($board, state);
    applyMoveHints($board, state);
    updateHud($hud, state);
    updateChrome($chrome, { turn: turnLine(state) });
    updateDiceHand($diceHand, state);
    updateSkillHand($skillHand, state, selectedSlot);
    updatePrompt($prompt, state, { secondsLeft, pick });
    showMessage($message, state);
  };
}
