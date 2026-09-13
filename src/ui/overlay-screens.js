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
import { lineupScreen } from "./lineup-screen.js";
import { formatElapsed } from "./match-clock.js";
import { menuScreen } from "./menu-screen.js";
import { hostScreen, joinScreen, onlineScreen } from "./online/lobby-screen.js";
import { OVERLAY_ACTION, OVERLAY_SCREEN } from "./overlay-vocabulary.js";
import { seatLabel } from "./player-labels.js";
import { poolScreen } from "./pool-screen.js";
import { settingsScreen } from "./settings-screen.js";

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

/**
 * S8. Reachable at any point in a turn (FR-07). Resume, or give the match up.
 *
 * Online (issue #42) the screen gains one sentence, because a pause means two different things: the
 * host's Pause stops the match for everybody, and a guest's stops only their own screen while the
 * host's clock keeps running. `online` is `"host"`, `"guest"` or `null`.
 *
 * **Since issue #77 it also says how long the match has been running**, from `elapsed`, milliseconds
 * or `null`. It goes into the same `.overlay__text` slot as the online sentence rather than into an
 * element of its own, because the pause screen has no design spec beyond D38's veil and a new element
 * on it would be a design decision. The flow redraws the screen once a second while it is up, which is
 * what makes the number move; `match-clock.js` carries what the number means.
 */
function pauseScreen(online, elapsed) {
  const sentences = [
    online === null ? null : t(`pause.online.${online}`),
    elapsed === null ? null : t("pause.elapsed", { time: formatElapsed(elapsed) }),
  ].filter((sentence) => sentence !== null);

  return {
    screen: OVERLAY_SCREEN.PAUSE,
    title: t("pause.title"),
    text: sentences.join(" "),
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
 *
 * `canRestart` is `false` on an online guest (issue #42): Play Again is the host's button, and the
 * guest's next match arrives over the wire when the host presses it.
 *
 * **An online match that ended because one player's connection dropped names that player** under the
 * title (design spec 19, D121.3). The state carries the seat in `abandonedBy`; a match given up on
 * purpose carries `null` and the sentence stays empty, so the title says everything it did before.
 */
function winScreen(state, canRestart) {
  const won = state.status === MATCH_STATUS.WON;
  const dropped = state.abandonedBy ?? null;

  return {
    screen: OVERLAY_SCREEN.WIN,
    title: won ? t("match.won", { player: seatLabel(state, state.winner) }) : t("match.abandoned"),
    text:
      !won && dropped !== null
        ? t("match.abandonedBy", { player: seatLabel(state, dropped) })
        : undefined,
    player: won ? state.winner : null,
    outcome: won ? "won" : "abandoned",
    buttons: [
      ...(canRestart
        ? [{ action: OVERLAY_ACTION.RESTART, label: t("match.restart"), variant: "primary" }]
        : []),
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
    title: t("handover.title", { player: seatLabel(state, seat) }),
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
 * used by the handover, `pool` only by the pool overview, and `lineup` only by the line-up screen.
 *
 * **The pool overview and the main menu live in their own files** rather than as two more functions
 * here. The pool overview is the only screen with cards on it and the only one whose content comes from
 * `core/` rather than from the game state; the menu became three doors with artwork and a paragraph of
 * its own in design handoff 12. Both carry more reasoning than a screen description usually does, and
 * this file stays a switch.
 *
 * `pool` is handed in rather than read, because the face-down count lives in the dice source inside
 * `deps` and this file is pure. A screen that reached into the running match for a number would be the
 * one place in `ui/` that could not be tested by asking it what it says.
 *
 * `lineup` is handed in for the same reason and it is a **snapshot**, `{ playerCount, seats, bots }`,
 * from `lineup.js`. There is no match behind the line-up screen, so `state` is `null` there too.
 *
 * `online` is the third snapshot (issue #42), from `online-flow.js`: `{ role, snapshot, canRestart }`.
 * The two lobbies are built from `snapshot`, the pause screen reads `role`, and the win screen reads
 * `canRestart`. All three default to the hot-seat answers.
 *
 * `elapsed` is how long the match has run, in milliseconds, or `null` when there is no match
 * (issue #77). Only the pause screen reads it. Handed in rather than read from a clock, for the same
 * reason `pool` is: this file is pure, and a screen that read `Date.now()` could not be tested by
 * asking it what it says.
 */
export function screenDescription(
  screen,
  { state = null, seat = null, pool = null, lineup = null, online = null, elapsed = null } = {}
) {
  switch (screen) {
    case OVERLAY_SCREEN.MENU:
      return menuScreen();
    case OVERLAY_SCREEN.SETUP:
      return setupScreen();
    case OVERLAY_SCREEN.SETTINGS:
      return settingsScreen();
    case OVERLAY_SCREEN.PAUSE:
      return pauseScreen(online?.role ?? null, elapsed);
    case OVERLAY_SCREEN.WIN:
      return winScreen(state, online?.canRestart ?? true);
    case OVERLAY_SCREEN.ONLINE:
      return onlineScreen();
    case OVERLAY_SCREEN.HOST:
      return online?.snapshot ? hostScreen(online.snapshot) : noScreen();
    case OVERLAY_SCREEN.JOIN:
      return online?.snapshot ? joinScreen(online.snapshot) : noScreen();
    case OVERLAY_SCREEN.HANDOVER:
      return handoverScreen(state, seat);
    case OVERLAY_SCREEN.LINEUP:
      // `noScreen` when no count has been chosen, on the same argument as the pool overview below: a
      // line-up with no seats on it would be a screen asking about a match nobody has sized. The flow
      // hands in a snapshot rather than `null` once it has a line-up object at all, so the empty
      // `playerCount` is what the check has to be written against and not the argument being absent.
      return lineup === null || lineup.playerCount === null ? noScreen() : lineupScreen(lineup);
    case OVERLAY_SCREEN.POOL:
      // `noScreen` when there is no match, so a stale POOL screen cannot outlive the pool it describes.
      return pool === null ? noScreen() : poolScreen(pool);
    default:
      return noScreen();
  }
}
