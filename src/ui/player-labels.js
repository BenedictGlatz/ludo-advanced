/**
 * What a player is called on screen. Issue #39.
 *
 * One file, because until now four places built a player's name and all four built it the same wrong
 * way. `ui/` only: it calls `t()` and holds no rule.
 *
 * **`displayNumber` takes `state.seats`; the two name builders take `{ seats, bots }`.** The seat list
 * used to be all any of them needed. Issue #43 added a second fact a name depends on, whether the seat
 * is played by a person, so those two take an object instead. **The state object is one**, so every
 * call site inside a match simply passes `state`; the two that have no state to hand, the reaction line
 * and the opponent-picker buttons in `prompt-view.js`, build the pair themselves.
 *
 * `bots` is read as `?? []`, so a hand-built fixture that predates issue #43 keeps working and names
 * every seat a person. There are a lot of those in the unit tests.
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
 * Which of the two vocabularies names this seat: `player.*` or `player.bot*`. Issue #43.
 *
 * **A bot keeps the seat's number rather than being counted separately.** Seat 2 of four is "Bot 2",
 * not "Bot 1", and the rule from this file's header is why: the number says the turn order and the
 * colour says which pieces. Counting the bots on their own would put a "Bot 1" and a "Spieler 1" at the
 * same table looking like the same seat.
 *
 * Rejected: *a single key with the word interpolated*, `t("player.name", { kind })`. It reads as one
 * fewer key and it is untranslatable: a language that inflects the two words differently, or puts them
 * in a different position, has nowhere to say so.
 */
const KEYS = {
  human: { short: "player.name", full: "player.named" },
  bot: { short: "player.bot", full: "player.botNamed" },
};

function keysFor(match, seat) {
  return (match.bots ?? []).includes(seat) ? KEYS.bot : KEYS.human;
}

/**
 * The short name: "Spieler 2", or "Bot 2".
 *
 * For places where the full label does not fit, which today is the opponent-picker buttons in the
 * prompt strip. Whether that is the right trade is D42's neighbourhood and not settled here.
 *
 * `match` is `{ seats, bots }`, and a state object is one.
 */
export function seatName(match, seat) {
  return t(keysFor(match, seat).short, { number: displayNumber(match.seats, seat) });
}

/** The full label: "Spieler 2 (Grün)", or "Bot 3 (Blau)". Used wherever there is room for it. */
export function seatLabel(match, seat) {
  return t(keysFor(match, seat).full, {
    number: displayNumber(match.seats, seat),
    colour: t(`player.colour.${seat}`),
  });
}
