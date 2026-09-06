/**
 * Two read-only views of the state: the board as `core/` wants it, and the HUD's four numbers per seat.
 * Issues #27 and #35, moved out of `game-state.js` in issue #93.
 *
 * Imports `core/` and never `ui/` (NFR-01). Neither function writes anything, which is what makes this
 * a seam of its own: `game-state.js` is about what the state **is** and how it changes, and these are
 * about what somebody reads off it.
 */

import { pawnProgress } from "../core/pawns.js";

/**
 * The board as `core/` wants to see it: the statuses and the traps, and nothing else.
 *
 * `core/` is not allowed to know the shape of the state object (NFR-01), so every rules call that needs
 * to know about card effects takes a `board` argument instead. This is the one function that builds it,
 * which means there is one line to change the day a third kind of board effect is added, rather than
 * one line per call site in the turn manager.
 */
export function boardOf(state) {
  return { statuses: state.statuses, traps: state.traps };
}

/**
 * Everything the HUD shows about one seat (FR-36, issue #35).
 *
 * ```js
 * { start: 2, track: 1, home: 1, cards: 3 }
 * ```
 *
 * The first three come from `pawnProgress` in `core/` and always sum to four. `cards` is how many skill
 * cards the seat holds, and it is here rather than in `core/` because a hand is a state field and
 * `core/` is not allowed to know the shape of the state object (NFR-01).
 *
 * **`cards` is on screen because the Product Owner made the count public on 2026-09-01**, answering
 * open decision D33 of design spec 03: the cards themselves stay secret, the number does not. Without
 * that decision this selector would return three numbers.
 *
 * A selector and not a stored field, because it is derivable from the pawns and the hands. Storing it
 * would mean two places that can disagree about how far a player has got, and the acceptance criterion
 * for FR-36 is precisely that they never do.
 */
export function seatProgress(state, seat) {
  return {
    ...pawnProgress(state.pawns, seat),
    cards: state.skillHands[seat]?.length ?? 0,
  };
}
