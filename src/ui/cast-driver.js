/**
 * A played card's moment, in four steps and one hold. Design spec 18, D108 and D113.
 *
 * `ui/` only. It is to a card play what `turn-waits.js`'s roll hold is to a roll: the turn stops, one
 * thing is shown, and then the turn carries on. It lives in a file of its own because a cast has a
 * **sequence** where the roll has a single wait, and because `turn-waits.js` would have been the fifth
 * file this feature pushed past NFR-02's 300 lines.
 *
 * ## The sequence, and why it is written as three timers rather than as CSS
 *
 * ```
 *  0 ms                 data-cast = "card"    the card arrives and its family's gesture plays
 *  --motion-cast        data-cast = "board"   the effect crosses to its target; the marks go on
 *  + --motion-cast-board  data-cast = "done"  the marks come off; the card leaves for the plate
 *  --motion-cast-hold   data-cast = "idle"    the turn carries on
 * ```
 *
 * A stylesheet cannot do this on its own, because the board's marks are attributes on 40 other
 * elements and a keyframe cannot write an attribute. The durations are still the design's: every one
 * of them is read out of `tokens.css`, and this file holds only the decision to wait.
 *
 * ## The question is asked of the state, not of the phase
 *
 * The same lesson `turn-waits.js` paid a red suite for. A card play arrives through four doors: a
 * person's own play, a bot's play, a Reaction into an open window, and a window closing that resolves
 * the card that opened it. Only a state-level marker catches all four.
 *
 * The marker is the turn number, the number of cards played this turn, **and the outcome the record
 * carries**. The last part is what makes D113's fifth lifecycle path work: a card that opens a window
 * is `pending` when it is played and settles to `resolved`, `nullified` or `negated` when the window
 * shuts, so the same card gets two moments, one for the play and one for what came of it, with a
 * window between them. Nothing else in the state changes at that moment.
 *
 * Rejected: *comparing `lastCardPlayed` by identity.* It is `null` for every turn in which nobody
 * plays anything, and a marker that is null most of the time is one `??` away from a bug.
 */

import { motionMs } from "./board-view.js";
import { applyCastHits, clearCastHits } from "./board-marks.js";
import { castStage, endCast, fillCast } from "./cast-view.js";
import { holdCast } from "./holds.js";

/**
 * The cast, wired to the loop the way every other waiting sibling is.
 *
 * `parts` is the whole page rather than the two regions used, on `turn-waits.js`'s reasoning: naming
 * just the board and the stage would go stale the first time a third region is needed.
 */
export function createCastDriver({ parts, timers, delays = {}, getState, refresh, resume }) {
  const { $board, $cast } = parts;

  /** Durations belong to `tokens.css`, so they are read off the board rather than written here. */
  const readToken = (token, fallback) => motionMs($board, token, fallback);

  /** The card play that has already had its moment, so one play is never cast twice. */
  let shown = null;

  /**
   * The cards that have been on the stage as `pending` this turn, and which turn that was.
   *
   * D113's fifth lifecycle path in two fields. A card that opens a reaction window shows its card
   * stage and stops, because nothing has resolved yet. When the window shuts unanswered, the same
   * card resolves and wants its board stage, and showing the card a second time would be showing it
   * twice. So the second moment is filled with `data-cast="board"` directly and skips the card stage.
   *
   * Keyed by card id and scoped to the turn, because a card id is what identifies the play across the
   * window and nothing else survives it: `pendingCard` is cleared by the same dispatch that resolves
   * it, so it is already gone by the time this is asked.
   */
  let pending = new Set();
  let pendingTurn = null;

  /** One card play's identity: the turn, how many cards it has held, and how the record reads. */
  function castKey(state) {
    const played = state.lastCardPlayed ?? null;
    if (played === null) return null;

    const count = Object.values(state.cardsPlayed ?? {}).reduce((sum, n) => sum + n, 0);
    const outcome = state.lastCard?.outcome ?? "resolved";

    return `${state.turnNumber}.${count}.${played.cardId}.${outcome}`;
  }

  /** Has a card been played that has not been shown yet? */
  function needsMoment(state) {
    const key = castKey(state);

    return key !== null && key !== shown;
  }

  /**
   * Give the card its moment, then carry the turn on.
   *
   * ## Four details, three of which are `carryOn`'s and `showRoll`'s
   *
   * **`refresh()` comes first.** The intent has already changed the state and drawn nothing, so the
   * hand the card left and the plate it is going to have to be on screen before anything moves.
   *
   * **The marker is set before anything that can re-enter the loop**, or `resume()` would come
   * straight back here and cast the same card again.
   *
   * **Zero resumes synchronously rather than through the registry.** `?fast=1` overrides the hold to
   * 0, and `timers.set(..., 0)` would defer `advance()` to a macrotask. Every end-to-end spec in the
   * suite was written against the ordering the loop has today, so a zero hold has to be no hold at
   * all. **Every state is still visited**, which is the property the whole feature rests on: the
   * sequence is identical under `?fast=1` and under reduced motion, and only the waiting is shorter.
   *
   * **The fourth is the one that is not obvious**, and it is `showRoll`'s: while the hold runs the
   * phase has already moved on, so a quick player can end the turn before the 1.5 seconds are up. The
   * turn number is captured when the cast starts and the resume is skipped if it changed. The stage is
   * still put away and the board's marks still come off, because that has to happen whatever else did.
   */
  function show() {
    refresh();

    const state = getState();
    const played = state.lastCardPlayed;
    const turnNumber = state.turnNumber;

    shown = castKey(state);

    const boardStageOnly = secondMoment(state, played);
    const plan = fillCast($cast, state, played, { boardStageOnly });

    const finish = () => {
      endCast($cast);
      clearCastHits($board);
      if (getState().turnNumber === turnNumber) resume();
    };

    run(plan, boardStageOnly, holdCast(delays, readToken, plan), finish);
  }

  /**
   * Is this the **second** moment of a card that opened a window, the one that lands its effect?
   *
   * Also the place the pending list is kept, because the question and the bookkeeping are the same
   * two facts read in the same order. The list is emptied when the turn changes: a card played on one
   * turn cannot be pending on the next, and `lastCardPlayed` is cleared at the handover anyway.
   */
  function secondMoment(state, played) {
    if (pendingTurn !== state.turnNumber) {
      pending = new Set();
      pendingTurn = state.turnNumber;
    }

    if ((state.lastCard?.outcome ?? "resolved") === "pending") {
      pending.add(played.cardId);
      return false;
    }

    return pending.delete(played.cardId);
  }

  /**
   * Walk the stages, either through the clock or all at once.
   *
   * The two paths write the same attributes in the same order. The zero path is not a shortcut past
   * the sequence: it is the sequence with no waiting in it, which is what keeps `?fast=1` honest.
   */
  function run(plan, boardStageOnly, hold, finish) {
    const cardMs = boardStageOnly ? 0 : readToken("--motion-cast", 640);
    const boardMs = plan.hasBoardStage ? readToken("--motion-cast-board", 560) : 0;

    if (hold <= 0) {
      if (plan.hasBoardStage) startBoard(plan);
      castStage($cast, "done");
      finish();
      return;
    }

    if (plan.hasBoardStage) timers.set("cast-board", () => startBoard(plan), cardMs);
    timers.set("cast-done", () => castStage($cast, "done"), cardMs + boardMs);
    timers.set("cast", finish, hold);
  }

  /** The board half: the card id on the board, and the marks under the effect as it lands. */
  function startBoard(plan) {
    $board.attr("data-cast", $cast.attr("data-card-id"));
    castStage($cast, "board");
    applyCastHits($board, plan.hits);
  }

  return {
    needsMoment,
    show,

    /**
     * Stop waiting, and leave nothing on the board.
     *
     * Called when the loop stops or pauses. The marks matter as much as the timers: a match paused
     * mid-cast would otherwise come back with a ring standing on a field and a card frozen over the
     * board, because `resume()` re-enters the phase the turn was in and never passes through here.
     */
    stop() {
      timers.clear("cast");
      timers.clear("cast-board");
      timers.clear("cast-done");
      endCast($cast);
      clearCastHits($board);
      pending = new Set();
    },
  };
}
