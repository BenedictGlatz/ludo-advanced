/**
 * What each of the overlay screens says. Issues #39, #41 and #30.
 *
 * `ui/` only. This is the file that calls `t()`; `overlay-view.js` renders whatever it returns and knows
 * nothing about screens. Same split as `dice-hand-view.js` and `card-view.js`, and for the same reason:
 * the component stays one component while the number of screens grows.
 *
 * Every function here is **pure**. It takes what it needs and returns a description, so the flow can be
 * tested by asking what a screen says rather than by looking at the DOM.
 */

import { PLAYER_COUNTS } from "../core/board.js";
import { MATCH_STATUS } from "../state/game-state.js";
import { t } from "../i18n/index.js";
import { OVERLAY_ACTION, OVERLAY_SCREEN } from "./overlay-vocabulary.js";
import { seatLabel } from "./player-labels.js";
import { poolScreen } from "./pool-screen.js";

/** S1. The entry point: one button, because there is one thing to do here (FR-38). */
function menuScreen() {
  return {
    screen: OVERLAY_SCREEN.MENU,
    title: t("menu.title"),
    text: t("menu.text"),
    player: null,
    buttons: [{ action: OVERLAY_ACTION.START, label: t("menu.start"), variant: "primary" }],
  };
}

/**
 * S2. Choose 2, 3 or 4 players (FR-01).
 *
 * One button per count rather than a dropdown or a stepper: there are three options, so the buttons
 * **are** the whole control, and a stepper would add a confirm step for a choice that is one click.
 */
function setupScreen() {
  return {
    screen: OVERLAY_SCREEN.SETUP,
    title: t("setup.title"),
    text: t("setup.text"),
    player: null,
    buttons: PLAYER_COUNTS.map((players) => ({
      action: OVERLAY_ACTION.PLAYERS,
      label: t("setup.players", { players }),
      count: players,
    })),
  };
}

/** S8. Reachable at any point in a turn (FR-07). Resume, or give the match up. */
function pauseScreen() {
  return {
    screen: OVERLAY_SCREEN.PAUSE,
    title: t("pause.title"),
    player: null,
    buttons: [
      { action: OVERLAY_ACTION.RESUME, label: t("pause.resume"), variant: "primary" },
      { action: OVERLAY_ACTION.QUIT, label: t("pause.quit") },
    ],
  };
}

/**
 * S9. Names the winner and offers a restart with no page reload (FR-05, FR-06).
 *
 * **An abandoned match arrives here too**, by a different route: `abandonMatch` reaches the same
 * `match-over` phase. It reads completely differently to a player, so the title comes from the status
 * rather than from the screen, and the abandoned version names nobody because nobody won.
 *
 * `outcome` is what lets `overlay.css` draw the two apart, and it is deliberately a second field rather
 * than something the stylesheet infers from `player` being absent. D40 of design spec 04 asked for it by
 * name: a win takes the winner's colour and the game's only `--text-2xl` title, and an abandoned match
 * drops both, because the same screen in a different colour would be a small cruelty.
 */
function winScreen(state) {
  const won = state.status === MATCH_STATUS.WON;

  return {
    screen: OVERLAY_SCREEN.WIN,
    title: won
      ? t("match.won", { player: seatLabel(state.seats, state.winner) })
      : t("match.abandoned"),
    player: won ? state.winner : null,
    outcome: won ? "won" : "abandoned",
    buttons: [
      { action: OVERLAY_ACTION.RESTART, label: t("match.restart"), variant: "primary" },
      { action: OVERLAY_ACTION.QUIT, label: t("win.quit") },
    ],
  };
}

/**
 * The handover, which has no screen id because no document had asked for it before this sprint.
 *
 * It exists because of decision D33: an opponent's skill cards are secret and only the count is public.
 * At a shared screen that is only true if something covers the rail while the device changes hands, and
 * before this the rail flipped from one player's face-up cards to the next player's after 320 ms with
 * nothing in between.
 *
 * `seat` is the seat about to play, from `nextSeat` in the turn manager, so this names the same player
 * `endTurn` is about to hand the turn to.
 */
function handoverScreen(state, seat) {
  return {
    screen: OVERLAY_SCREEN.HANDOVER,
    title: t("handover.title", { player: seatLabel(state.seats, seat) }),
    text: t("handover.text"),
    player: seat,
    buttons: [{ action: OVERLAY_ACTION.READY, label: t("handover.ready"), variant: "primary" }],
  };
}

/** Nothing on the overlay: the match is on screen and the game is not asking anything. */
function noScreen() {
  return {
    screen: OVERLAY_SCREEN.NONE,
    title: "",
    text: "",
    player: null,
    outcome: null,
    cards: [],
    buttons: [],
  };
}

/**
 * The description for whichever screen the flow is on.
 *
 * `state` is `null` on the menu and the setup screen, because there is no match yet. `seat` is only
 * used by the handover, and `pool` only by the pool overview.
 *
 * **The pool overview lives in its own file** rather than as a seventh function here. It is the only
 * screen with cards on it, it is the only one whose content comes from `core/` rather than from the game
 * state, and it carries a paragraph of reasoning of its own. This file stays a switch.
 *
 * `pool` is handed in rather than read, because the face-down count lives in the dice source inside
 * `deps` and this file is pure. A screen that reached into the running match for a number would be the
 * one place in `ui/` that could not be tested by asking it what it says.
 */
export function screenDescription(screen, { state = null, seat = null, pool = null } = {}) {
  switch (screen) {
    case OVERLAY_SCREEN.MENU:
      return menuScreen();
    case OVERLAY_SCREEN.SETUP:
      return setupScreen();
    case OVERLAY_SCREEN.PAUSE:
      return pauseScreen();
    case OVERLAY_SCREEN.WIN:
      return winScreen(state);
    case OVERLAY_SCREEN.HANDOVER:
      return handoverScreen(state, seat);
    case OVERLAY_SCREEN.POOL:
      // `noScreen` when there is no match, so a stale POOL screen cannot outlive the pool it describes.
      return pool === null ? noScreen() : poolScreen(pool);
    default:
      return noScreen();
  }
}
