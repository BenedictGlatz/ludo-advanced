/**
 * The loop's five siblings, built and stopped in one place. Split out of `game-loop.js` (NFR-02).
 *
 * `ui/` only, and it holds no state: it takes the loop's own wiring, hands the same wiring to every
 * sibling, and gives the loop back the five objects plus the one function that stops all of them.
 *
 * ## Why this is a real seam and not just where the line count fell
 *
 * `game-loop.js` answers **what the game does between the player's clicks**. Which modules exist, what
 * each of them is handed, and what has to be torn down when a match goes away is a different question,
 * and it is the question that changes every time a sibling is added. It was written out three times
 * identically before issue #43 was about to write it a fourth, and `handover.js` was the fifth.
 *
 * The giveaway that the split is safe is that nothing here reaches into the loop's closure: every
 * sibling is constructed from the argument, and the loop's own `state`, `render` and `advance` arrive
 * as the four functions in `wiring`.
 */

import { createBotDriver } from "./bot-driver.js";
import { createCardControls } from "./card-controls.js";
import { createHandover } from "./handover.js";
import { createTurnControls } from "./turn-controls.js";
import { createTurnWaits } from "./turn-waits.js";

/**
 * Build the five, and the `halt` that stops them.
 *
 * `wiring` is what every sibling that can wait needs from the loop: the timer registry, the durations,
 * the one state reference, the one dispatcher, and the two ways back in (`refresh` and `resume`). The
 * list **is** the contract of a sibling module, and having it in one place is what makes "no module
 * holds its own copy of the state" checkable by reading five lines.
 *
 * `parts` is every region of the page, for `turn-waits.js`; `$board` is where the two modules that
 * animate read their durations off. `onCurtain` and `skipHandover` belong to the handover alone.
 */
export function createLoopParts({ parts, wiring, onCurtain = null, skipHandover = false }) {
  const { $board } = parts;

  const cards = createCardControls({ $board, ...wiring });
  const waits = createTurnWaits({ parts, ...wiring });
  const bots = createBotDriver({ $board, ...wiring, afterCard: cards.carryOn });
  const handover = createHandover({ ...wiring, onCurtain, skipHandover });

  /**
   * What a click means, and the one sibling that is not handed the whole wiring.
   *
   * It cannot wait for anything, so it has no use for the timers or the durations, and giving it them
   * anyway would say it might start one.
   */
  const board = createTurnControls({
    getState: wiring.getState,
    apply: wiring.apply,
    render: wiring.refresh,
    advance: wiring.resume,
    isPicking: () => cards.isPicking(),
  });

  /**
   * Stop everything that is waiting. Three callers wrote these lines out identically until the fourth
   * sibling was about to be added to each of them, and the symptom of missing one is a timer firing
   * into a match that is already gone.
   *
   * `bots.stop()` is redundant after `timers.clearAll()`, which clears every name. It is here on the
   * convention `waits` already follows: **a module that starts a timer is asked to stop it**, so
   * nothing depends on the registry's sweep also being right.
   *
   * `handover` is not in the list and needs no line: it starts no timer of its own, and the curtain it
   * puts up is the flow's screen rather than something this file could take down.
   */
  function halt() {
    wiring.timers.clearAll();
    cards.stop();
    waits.stop();
    bots.stop();
  }

  return { board, bots, cards, handover, waits, halt };
}
