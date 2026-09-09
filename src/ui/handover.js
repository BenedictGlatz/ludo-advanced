/**
 * Who is sitting in front of the screen, and when the screen has to change hands.
 *
 * `ui/` only, and deliberately **without jQuery and without i18next**, so this file runs in Vitest's
 * `node` environment and the rule below is a unit test rather than a Playwright run. Same argument
 * `turn-controls.js` already makes for what a click means.
 *
 * ## The one thing the code was missing: a viewer
 *
 * There is one screen and one skill hand region, so it shows exactly one hand: `seatOnShow(state)`.
 * Nothing anywhere knew **whose eyes** were in front of it, so `skill-hand-view.js` had no choice but
 * to hard-code `data-face="up"` and hope. Two hands were on screen face up that nobody was allowed to
 * see: a bot's, for the whole of its turn, and during a reaction window the answering player's, in
 * front of the person whose turn it still was.
 *
 * `viewerSeat` is that missing word, and both leaks close on one comparison:
 *
 * ```js
 * faceUp = seatOnShow(state) === viewerSeat
 * ```
 *
 * A bot is never the viewer, so a bot's hand is never face up. A second person is only the viewer once
 * they have said so, so their hand is only face up after they have taken the device.
 *
 * **It is presentation state and never enters the game state.** Which human is holding the mouse is not
 * a fact about the match: `createGameState` has no field for it, and putting it in the frozen object
 * would make the rules layer hold a fact about a chair. Same reasoning `skill-hand-view.js` records for
 * a half-finished card play and `match-flow.js` for which screen is up.
 *
 * ## Why the curtain now goes up mid-turn as well
 *
 * The handover screen used to be a thing that happened *between* turns. But `seatOnShow` moves away
 * from the active player during a reaction window, by design: eligible seats are asked in seat order
 * because two people cannot both be holding the mouse. So the device changes hands twice inside one
 * turn, and it needs a curtain in both directions:
 *
 * | Moment | `handTo` is asked about |
 * | --- | --- |
 * | The turn is over | `nextSeat(state)`, and this one passes the turn as well |
 * | A window is waiting on a person | `seatOnShow(state)`, the seat being asked |
 * | The window has shut | `state.activePlayer`, who gets their own turn back |
 *
 * The screen it puts up is the **existing** handover screen, word for word: "Weitergeben an {{player}}",
 * "Gib den Bildschirm weiter, bevor du auf Bereit drückst.", "Bereit". Those three sentences were
 * written for a turn change and are exactly as true for a reaction, so this is one component used in a
 * second place rather than a new screen.
 *
 * ## Why the curtain pauses the match
 *
 * A reaction window has a thirty second clock on it, and it must not run down while somebody is reading
 * "hand the screen over". `match-flow.js` answers `onCurtain` with `loop.pause()`, which is the pause
 * screen's own path: every timer stops, and `advance()` re-enters the phase on the way back out. The
 * window reopens its clock at the full thirty seconds, which is the reading `game-loop.js` already gave
 * a pause: the players stopped, so the window did too.
 */

import { handoverNeeded, isBot } from "../state/bots.js";
import { INTENT } from "../state/intents.js";

/**
 * The device, and who has it.
 *
 * - `getState`, `apply` and `resume` are the loop's `wiring`, so there is still one state reference in
 *   `ui/` and one place that dispatches.
 * - `onCurtain(seat)` puts the handover screen up. `null` means nobody is watching for a handover, which
 *   is what a loop built straight out of `createGameLoop` looks like, and then the turn simply passes.
 * - `skipHandover` is `?fast=1`. It takes the waiting away, not the secrecy: the viewer follows every
 *   **person** immediately and with no screen in between, and still never follows a bot.
 */
export function createHandover({
  getState,
  apply,
  resume,
  onCurtain = null,
  skipHandover = false,
  isLocal = (seat) => !isBot(getState(), seat),
}) {
  /**
   * The seat whose person is in front of the screen.
   *
   * Seeded with the first seat that has a person **at this screen** rather than with seat 0, because
   * the line-up screen (D95) lets the computer sit on seat 0 and the first thing on screen would then
   * be a bot's hand claimed as the viewer's own. Online (issue #42) the same line seeds a guest with
   * its own seat rather than the host's, which would have kept the guest's hand face down all match.
   */
  let viewerSeat = getState().seats.find(isLocal) ?? null;

  /** `{ seat, endsTurn }` while a curtain is standing, otherwise `null`. */
  let pending = null;

  /**
   * Does the device have to change hands before `seat` is asked anything?
   *
   * `handoverNeeded` in `state/` answers two thirds of it and is not duplicated here: a bot is handed
   * nothing, and a soloist playing three bots never puts the mouse down. What this adds is the third
   * part, which only makes sense once there is a viewer at all: the person who already has the device
   * does not need to be handed it.
   */
  function needsCurtain(seat) {
    if (onCurtain === null || skipHandover) return false;
    if (seat === viewerSeat) return false;
    // A person at another screen has their own screen (issue #42). Raising a curtain here, and pausing
    // the match under it, would stop the host's clock every time the guest is asked anything.
    if (!isLocal(seat)) return false;

    return handoverNeeded(getState(), seat);
  }

  /**
   * Pass the turn on and carry straight into the next one.
   *
   * Moved here from `game-loop.js` with the rest of this subject, and it is still on the loop's public
   * interface because `session-actions.js` reaches for it. A refused `end-turn` stops rather than
   * retrying, like every other dispatch in `ui/`.
   */
  function passTurn() {
    if (!apply({ type: INTENT.END_TURN })) return;

    resume();
  }

  return {
    /** Whose eyes are in front of the screen. `render.js` hands it to the skill hand. */
    seat: () => viewerSeat,

    /**
     * Hand the device to `seat`, and say whether the loop has to stop for it.
     *
     * `true` means a curtain is standing and a person is being asked to pass the screen on. `false`
     * means the device is already in the right hands, and the viewer has moved with it when `seat` is
     * a person. A bot never becomes the viewer: nobody is handed anything, and the person keeps the
     * device while the computer plays.
     *
     * `endsTurn` is the turn-end call, which is the only one that also has a turn to pass. Doing it
     * here rather than at the call site is what keeps the loop's branch to a single line and what makes
     * the two ways out of a curtain, Ready and no-curtain-needed, one piece of code each.
     */
    handTo(seat, { endsTurn = false } = {}) {
      if (needsCurtain(seat)) {
        pending = { seat, endsTurn };
        onCurtain(seat);
        return true;
      }

      if (isLocal(seat)) viewerSeat = seat;
      if (endsTurn) passTurn();

      return false;
    },

    /**
     * Ready has been pressed: the person named on the curtain now has the device.
     *
     * **The viewer moves and the game is re-rendered before the curtain comes down**, which is the same
     * ordering rule `session-actions.js` has carried since the handover screen was built. Closing the
     * overlay first would leave one painted frame of the previous hand in front of the person picking
     * the device up, and no CSS can cover a frame that is already on screen.
     */
    arrive() {
      if (pending === null) return;

      const { seat, endsTurn } = pending;

      pending = null;
      viewerSeat = seat;

      if (endsTurn) passTurn();
      else resume();
    },

    passTurn,
  };
}
