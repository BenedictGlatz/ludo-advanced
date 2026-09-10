/**
 * What the three online screens say: the door, the host's lobby and the guest's. Issue #42, FR-42.
 *
 * `ui/` only, and **pure**: it takes the online flow's snapshot and returns a description, so each
 * screen can be tested by asking what it says. Same split as `lineup-screen.js` and `menu-screen.js`.
 *
 * ## Designed since handoff 19
 *
 * The lobby was built without a design handoff on 2026-09-09 and said so; design spec 19 (D116 to D122)
 * replaced its look on 2026-09-10 and asked six things of this side, all of them here or one file over:
 * Copy and Connect sit **beside their field** rather than in the actions row (D119.2); the sentence under
 * the host's title carries the hint or a failure and never the stage, which moved onto the seat row being
 * connected as `gathering` and `connecting` (D118.1); a failure marks the sentence `tone: "warn"`
 * (D118.2); the keyboard lands on Copy while an invite is out and on Connect on the guest's screen
 * (D119.2); and after the twenty-second failure or a failed handshake the host is offered a fresh code
 * where Connect was (D121.2). The sixth, naming who dropped on the abandoned screen, is
 * `overlay-screens.js`'s.
 *
 * ## What the words have to say (the facts the plan lists)
 *
 * - A code is one long line; there is always a Copy button beside it.
 * - Without a relay server two players behind strict NATs may fail to connect; the lobby says so when the
 *   channel does not open within twenty seconds.
 * - Codes go stale after a few minutes; the host is told to make a new one.
 *
 * ## Bots sit at the table since issue #101
 *
 * A seat nobody has joined carries the line-up's two-position control, so the host can hand it to the
 * computer. The row then renames itself to "Bot 3 (Grün)" exactly as the line-up's does, and its status
 * word says `bot`. Which seats may switch is `lobby-seats.js`'s answer, asked once here for the disabled
 * position and once in `host-role.js` for the refusal.
 */

import { t } from "../../i18n/index.js";
import { OVERLAY_ACTION, OVERLAY_SCREEN } from "../overlay-vocabulary.js";
import { seatChoices } from "../lineup-screen.js";
import { seatLabel } from "../player-labels.js";
import { PLAYER_COUNTS } from "../../core/board.js";
import { canToggle, everybodyIn, freeSeats, seatStatus } from "./lobby-seats.js";

/** The stages a connection goes through, as the lobby names them. */
export const STAGE = Object.freeze({
  IDLE: "idle",
  GATHERING: "gathering",
  WAITING: "waiting",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  LOST: "lost",
  STALE: "stale",
});

/** The two failures after which the code on offer is gone and a fresh one is the way out (D121.2). */
const RETRY_ERRORS = ["nat", "failed"];

const back = () => ({ action: OVERLAY_ACTION.BACK, label: t("online.back") });

/** `"warn"` while the sentence under the title is a failure, so `lobby.css` can wash it (D118.2). */
const tone = (snapshot) => (snapshot.error === null ? null : "warn");

/** The door: host a match, or join one. */
export function onlineScreen() {
  return {
    screen: OVERLAY_SCREEN.ONLINE,
    title: t("online.title"),
    text: t("online.text"),
    tone: null,
    player: null,
    buttons: [
      { action: OVERLAY_ACTION.JOIN, label: t("online.join") },
      { action: OVERLAY_ACTION.HOST, label: t("online.host"), variant: "primary" },
      back(),
    ],
  };
}

/** The guest's one sentence under the title: an error, the stage, or the hint. */
function statusText(snapshot, hint) {
  if (snapshot.error !== null) return t(`online.error.${snapshot.error}`);
  if (snapshot.stage !== STAGE.IDLE) return t(`online.stage.${snapshot.stage}`);

  return t(hint);
}

/**
 * The host's sentence: an error, or the hint. Never the stage, which sits on the seat row it belongs to
 * since D118.1. While a seat is still free or already a bot the hint also says what the control does,
 * because nothing else on the screen explains it (D91.4's argument: one sentence for the whole screen,
 * since it is a fact about bots and not about seat 3; confirmed as D118.4).
 */
function hostText(snapshot) {
  if (snapshot.error !== null) return t(`online.error.${snapshot.error}`);

  const explainsBots = snapshot.bots.length > 0 || freeSeats(snapshot).length > 0;

  return explainsBots
    ? `${t("online.hint.host")} ${t("online.hint.hostBots")}`
    : t("online.hint.host");
}

/**
 * The word on a seat row. `lobby-seats.js` knows four; the two stages that are the browser's own work
 * land on the one free seat the invite is for (D118.1), so "Code wird erzeugt" stands under the name of
 * the seat it will fill and not under the title for the whole table.
 */
function rowStatus(snapshot, seat) {
  const status = seatStatus(snapshot, seat);
  const busy = snapshot.stage === STAGE.GATHERING || snapshot.stage === STAGE.CONNECTING;

  if (status === "waiting" && busy && snapshot.pending && freeSeats(snapshot)[0] === seat) {
    return snapshot.stage;
  }

  return status;
}

/**
 * One seat row of the host's lobby: who sits there, whether they are connected, and, on a seat nobody
 * has taken, the control that hands it to the computer. A seat the browser is busy connecting carries
 * no control for those seconds: the seat is being taken.
 */
function seatRow(snapshot, seat) {
  const status = rowStatus(snapshot, seat);
  const controller = status === "bot" ? "bot" : "human";
  const switchable = status === "waiting" || status === "bot";

  return {
    player: seat,
    controller,
    label: seatLabel({ seats: snapshot.seats, bots: snapshot.bots }, seat),
    status,
    statusLabel: t(`online.seat.${status}`),
    choices: switchable
      ? seatChoices(seat, controller, (value) => canToggle(snapshot, seat, value))
      : [],
  };
}

/** The code on screen and its button, `Copy` or `Connect`, which sits beside it (D119.2). */
function codeField(name, value, button) {
  return { name, label: t(`online.${name}Label`), value, readonly: value !== null, button };
}

function copyButton(field, copied, autofocus) {
  return {
    action: OVERLAY_ACTION.COPY,
    label: t(copied ? "online.copied" : "online.copy"),
    field,
    autofocus,
  };
}

/**
 * The host's lobby. Before a count is chosen it is the three count buttons; afterwards it is the seat
 * rows, the invite code to copy, the reply code to paste, and Start once everybody is in.
 */
export function hostScreen(snapshot) {
  if (snapshot.playerCount === null) {
    return {
      screen: OVERLAY_SCREEN.HOST,
      title: t("online.hostTitle"),
      text: t("online.playerCount"),
      tone: null,
      player: null,
      buttons: [
        ...PLAYER_COUNTS.map((players) => ({
          action: OVERLAY_ACTION.HOST,
          label: t("setup.players", { players }),
          count: players,
        })),
        back(),
      ],
    };
  }

  const fields = [];
  const buttons = [];

  if (snapshot.invite !== null) {
    fields.push(codeField("invite", snapshot.invite, copyButton("invite", snapshot.copied, true)));
    fields.push(
      codeField("reply", null, {
        action: OVERLAY_ACTION.CONNECT,
        label: t("online.connect"),
        field: "reply",
      })
    );
  } else if (freeSeats(snapshot).length > 0) {
    // After a failed exchange the same button reads "make a new code": the next step, not Back (D121.2).
    const retry = RETRY_ERRORS.includes(snapshot.error);
    buttons.push({
      action: OVERLAY_ACTION.ADD_GUEST,
      label: t(retry ? "online.retry" : "online.addGuest"),
    });
  }

  if (everybodyIn(snapshot)) {
    buttons.push({
      action: OVERLAY_ACTION.START_ONLINE,
      label: t("online.start"),
      variant: "primary",
    });
  }
  buttons.push(back());

  return {
    screen: OVERLAY_SCREEN.HOST,
    title: t("online.hostTitle"),
    text: hostText(snapshot),
    tone: tone(snapshot),
    player: null,
    seats: snapshot.seats.map((seat) => seatRow(snapshot, seat)),
    fields,
    buttons,
  };
}

/** The guest's lobby: paste the invite, then copy the reply and wait for the host. */
export function joinScreen(snapshot) {
  const fields = [];

  if (snapshot.reply === null) {
    fields.push(
      codeField("invite", null, {
        action: OVERLAY_ACTION.CONNECT,
        label: t("online.connect"),
        field: "invite",
        variant: "primary",
        autofocus: true,
      })
    );
  } else {
    fields.push(codeField("invite", null, undefined));
    fields.push(codeField("reply", snapshot.reply, copyButton("reply", snapshot.copied, true)));
  }

  return {
    screen: OVERLAY_SCREEN.JOIN,
    title: t("online.joinTitle"),
    text: statusText(snapshot, "online.hint.join"),
    tone: tone(snapshot),
    player: null,
    fields,
    buttons: [back()],
  };
}
