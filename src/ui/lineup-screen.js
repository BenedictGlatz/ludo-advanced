/**
 * What the line-up screen says. Screen S3, issue #76, design handoff 15, decisions D90 to D96.
 *
 * `ui/` only, and **pure**: it takes a snapshot of the line-up and returns a description, so the screen
 * can be tested by asking what it says rather than by looking at the DOM. Same split as
 * `menu-screen.js` and `pool-screen.js`, and it is here for the same reason both of those are:
 * `overlay-screens.js` says of itself that it stays a switch, and this screen carries rows.
 *
 * ## What the screen is for
 *
 * Until this screen the only way to play against the computer was to type `?bots=3` into the address
 * bar. The route is now main menu, player count, line-up, match. The count fixes how many seats there
 * are; this screen says, for each of those seats, whether a person or the computer plays it.
 *
 * ## The three things about a row that are not obvious
 *
 * - **A row is named with the vocabulary the HUD already uses.** `player.named` and `player.botNamed`
 *   give "Spieler 2 (Gelb)" and "Bot 2 (Gelb)", and a bot keeps its seat's number: seat 2 of four is
 *   "Bot 2" and never "Bot 1". So the row **renames itself** when it is switched, which is the second
 *   of the two cues that survive greyscale (NFR-12). The first is that the chosen position is the
 *   raised one, and neither cue is a colour.
 * - **A two-player match has rows for seats 0 and 2**, so it reads "Spieler 1 (Rot)" and
 *   "Spieler 3 (Grün)" with no 2 in sight. That looks like a bug and is not one: two players sit
 *   opposite each other, which is `seatsFor`'s rule and the reason `player-labels.js` exists.
 * - **The `bot` position of the last remaining person is `disabled`** (FR-01, D93). Not the row: that
 *   seat is played, and dimming it would say it is not in the match. The rule is also stated in words
 *   above the rows, permanently, which is what lets the control be disabled rather than argumentative.
 *   Without that sentence the right answer would have been `aria-disabled` with a spoken refusal.
 */

import { canBeBot } from "../state/bots.js";
import { t } from "../i18n/index.js";
import { OVERLAY_ACTION, OVERLAY_SCREEN } from "./overlay-vocabulary.js";
import { seatLabel } from "./player-labels.js";

/** The two positions of the control, in DOM order, which is also reading order. */
const CONTROLLERS = ["human", "bot"];

/**
 * One position of one row.
 *
 * `pressed` becomes `aria-pressed` and is what both the stylesheet and a screen reader read, so what
 * the screen shows and what is announced cannot drift apart: they are one attribute.
 *
 * The label is `lineup.human` or `lineup.bot`, which are "Spieler" and "Bot". Not "Mensch" and
 * "Computer" (D96.3): `hud-view.js` says Bot and the row's own name says Bot, so the position says Bot
 * as well. One word for one thing in three places. The gap between that and `data-controller="human"`
 * is deliberate: the attribute is the code's word and no player reads it.
 */
function position(seats, bots, seat, controller, value) {
  return {
    action: OVERLAY_ACTION.CONTROLLER,
    seat,
    value,
    label: t(`lineup.${value}`),
    pressed: controller === value,
    // Only the `bot` position of a seat that is still a person can be refused. A row that is already a
    // bot has nothing to protect, and `canBeBot` answers `false` for it as well, hence the first half.
    disabled: value === "bot" && controller === "human" && !canBeBot(seats, bots, seat),
  };
}

/** One seat: the plate and the wash come from `player`, the name from the two vocabularies. */
function seatRow(seats, bots, seat) {
  const controller = bots.includes(seat) ? "bot" : "human";

  return {
    player: seat,
    controller,
    label: seatLabel({ seats, bots }, seat),
    choices: CONTROLLERS.map((value) => position(seats, bots, seat, controller, value)),
  };
}

/**
 * S3, from the line-up as it stands.
 *
 * `.overlay__text` carries two facts and is on screen at all times: the FR-01 rule, and what a bot
 * actually does with a turn. One sentence for the whole screen rather than one per row (D91.4), because
 * it is a fact about bots and not about seat 3.
 *
 * **Back comes before Start in the DOM**, plain against `primary`, which is the same pair of cues that
 * tells Resume from Quit on the pause screen. Start is the screen's one primary under the rule in
 * `overlay.css`, and it says "Spiel starten" rather than "Los" because it is the only button in the
 * game that begins a match.
 *
 * The screen deliberately **does not summarise itself** and does not name a mode (D94.4, D96.4). The
 * rows are the summary, they are in seat order, and each one says in words which of the two it is.
 */
export function lineupScreen({ seats, bots }) {
  return {
    screen: OVERLAY_SCREEN.LINEUP,
    title: t("lineup.title"),
    text: t("lineup.text"),
    player: null,
    seats: seats.map((seat) => seatRow(seats, bots, seat)),
    buttons: [
      { action: OVERLAY_ACTION.BACK, label: t("lineup.back") },
      { action: OVERLAY_ACTION.BEGIN, label: t("lineup.begin"), variant: "primary" },
    ],
  };
}
