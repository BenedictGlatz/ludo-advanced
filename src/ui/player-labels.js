/**
 * What a player is called on screen. Issue #39.
 *
 * One file, because until now four places built a player's name and all four built it the same wrong
 * way. `ui/` only: it calls `t()` and holds no rule.
 *
 * **Every function takes `state.seats` rather than the state**, because the seat list is the only thing
 * any of them needs. Two of the three call sites do not have a state object to hand: the reaction line
 * and the opponent-picker buttons in `prompt-view.js` are built from a window and a pick descriptor.
 *
 * ## The bug this file exists to fix
 *
 * A seat is 0 to 3, and a match uses `seatsFor(playerCount)`, which seats two players **opposite each
 * other on seats 0 and 2** rather than side by side. Everything on screen labelled a seat `seat + 1`,
 * so a two-player match was played by "Spieler 1" and "Spieler 3", and there was no Spieler 2. It was
 * recorded as a defect in this file's predecessor comment in `move-hints.js` and never fixed, because
 * fixing it in four places is four chances to miss one.
 *
 * **The seat stays the seat everywhere else.** `data-player`, the colour tokens, the entry squares and
 * every rule in `core/` keep using 0 to 3, because that is what the board is built on. This is a
 * presentation-only translation, and it lives in `ui/` for exactly that reason.
 *
 * ## Why the colour is in the name
 *
 * Decided with the Product Owner on 2026-09-01. A pawn on the board is identified by nothing but its
 * colour, so a name that does not say the colour leaves the player to work out which of four reds,
 * yellows, greens and blues is theirs. The number says the turn order, the colour says which pieces.
 *
 * **The colour word is keyed on the seat, not on the display number**, because the colour belongs to
 * the seat: seat 2 is green whether it is the second player of two or the third of four.
 *
 * The words themselves come from `01-Design/Handoff/01-spec-foundations-and-board.md` § D1, which is
 * the table that also fixes the hex values. If a word is wrong for the colour, the spec is where it
 * gets corrected, not here.
 */

import { t } from "../i18n/index.js";

/**
 * Which player this seat is, counted from 1 in seat order: 1, 2, 3, 4.
 *
 * Falls back to `seat + 1` for a seat that is not in the match. That should not happen, and returning
 * something readable is better than returning `0` from an `indexOf` miss, because the failure would
 * show up as an off-by-one in a label rather than as an error anyone would notice.
 */
export function displayNumber(seats, seat) {
  const index = seats.indexOf(seat);
  return index === -1 ? seat + 1 : index + 1;
}

/**
 * The short name: "Spieler 2".
 *
 * For places where the full label does not fit, which today is the opponent-picker buttons in the
 * prompt strip. Whether that is the right trade is D42's neighbourhood and not settled here.
 */
export function seatName(seats, seat) {
  return t("player.name", { number: displayNumber(seats, seat) });
}

/** The full label: "Spieler 2 (Grün)". Used wherever there is room for it. */
export function seatLabel(seats, seat) {
  return t("player.named", {
    number: displayNumber(seats, seat),
    colour: t(`player.colour.${seat}`),
  });
}
