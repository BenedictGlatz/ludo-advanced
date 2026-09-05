/**
 * The half-made line-up: who plays which seat, between the player count and the match. Issue #76,
 * design handoff 15, requirements FR-43 and FR-01.
 *
 * `ui/` only, and it holds **no jQuery, no `t()` and no rule of its own**: the one rule this screen
 * has, that the last person may not become a bot, is `canBeBot` in `state/bots.js`. What is here is
 * the screen's working memory and nothing else, which is what makes it a unit test.
 *
 * ## Why this is view state and never enters the game state
 *
 * The same argument `match-flow.js` makes about the screen in its own header. A player who is halfway
 * through setting up a line-up **has not started a match**, so there is nothing for `state/` to hold:
 * `createGameState` has no field for a match that does not exist, and putting one there would make the
 * rules layer hold a fact about a menu.
 *
 * **Rejected: two more closure variables in `match-flow.js`.** It is the obvious thing and it is the
 * wrong place twice over. That file was at the 300-line NFR-02 limit, and more importantly a line-up
 * inside a closure that also owns the loop, the pool and the state cannot be tested without a browser.
 *
 * **Rejected: putting it in `session-actions.js`.** Its own header says neither of its functions
 * touches a variable, and that promise is what made it splittable from `match-flow.js` in the first
 * place. Breaking it for a menu would be spending a good seam badly.
 *
 * ## What `begin` starts with, and why it is not a recommendation
 *
 * **Every seat a person** (D92). The player has just said how many are playing, on the screen one click
 * earlier, and a screen that answers "four" with "one of you and three computers" has overwritten the
 * answer it was given. It also keeps today's behaviour for anyone who clicks straight through.
 *
 * The cost is stated rather than hidden: the single-player match is two clicks away rather than one, on
 * a screen that exists because that match was unreachable.
 */

import { seatsFor } from "../core/board.js";
import { toggleController } from "../state/bots.js";

/**
 * A line-up that a screen can ask questions of and a click can change.
 *
 * ```js
 * const lineup = createLineup();
 * lineup.begin(4);              // seats [0, 1, 2, 3], nobody a bot
 * lineup.toggle(3);             // seat 3 is the computer
 * lineup.snapshot();            // { playerCount: 4, seats: [0, 1, 2, 3], bots: [3] }
 * ```
 *
 * `snapshot()` returns exactly what the screen description and `startMatch` need between them and
 * nothing else. The arrays are copies, so a caller that keeps one cannot change the line-up by
 * accident.
 */
export function createLineup() {
  let playerCount = null;
  let seats = [];
  let bots = [];

  return {
    /**
     * Start a line-up for a match of this many players.
     *
     * **It forgets the previous line-up completely**, and that is the case worth naming: a player who
     * goes back to the count screen and picks a smaller number must not carry three bots into a
     * two-seat match. `seatsFor` is what says which seats a count actually uses, so two players are
     * seats 0 and 2 and there is no seat 1 to have an opinion about.
     */
    begin(count) {
      playerCount = count;
      seats = seatsFor(count);
      bots = [];
    },

    /**
     * Switch one seat between a person and the computer.
     *
     * The refusal is `toggleController`'s and not this file's: it hands back the list unchanged when
     * the seat is the last person, so a refused click leaves the line-up exactly as it was.
     */
    toggle(seat) {
      bots = toggleController(seats, bots, seat);
    },

    /** Everything anybody outside needs, as copies. `playerCount` is `null` before `begin`. */
    snapshot() {
      return { playerCount, seats: [...seats], bots: [...bots] };
    },
  };
}
