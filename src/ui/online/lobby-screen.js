/**
 * What the three online screens say: the door, the host's lobby and the guest's. Issue #42, FR-42.
 *
 * `ui/` only, and **pure**: it takes the online flow's snapshot and returns a description, so each
 * screen can be tested by asking what it says. Same split as `lineup-screen.js` and `menu-screen.js`.
 *
 * ## Built without a design handoff, on purpose and on record
 *
 * `CLAUDE.md` gives a new screen to Claude Design. This one was built on the existing overlay patterns
 * and tokens instead, because FR-42 arrived with four working days left and a brief-and-spec round costs
 * days. The deviation is recorded in the journal and a brief for the lobby's look is filed in
 * `01-Design/Handoff/00-open-requests.md`. Nothing here invents a look: the panel, the buttons, the seat
 * rows and the text are the ones the line-up and the setup screen already have, plus one textarea whose
 * chrome is copied from the button's.
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

const back = () => ({ action: OVERLAY_ACTION.BACK, label: t("online.back") });

/** The door: host a match, or join one. */
export function onlineScreen() {
  return {
    screen: OVERLAY_SCREEN.ONLINE,
    title: t("online.title"),
    text: t("online.text"),
    player: null,
    buttons: [
      { action: OVERLAY_ACTION.JOIN, label: t("online.join") },
      { action: OVERLAY_ACTION.HOST, label: t("online.host"), variant: "primary" },
      back(),
    ],
  };
}

/** The one sentence under the title: the stage, an error, or a hint. */
function statusText(snapshot, hint) {
  if (snapshot.error !== null) return t(`online.error.${snapshot.error}`);
  if (snapshot.stage !== STAGE.IDLE) return t(`online.stage.${snapshot.stage}`);

  return t(hint);
}

/**
 * The host's idle sentence. While a seat is still free or already a bot the sentence also says what the
 * control does, because nothing else on the screen explains it (D91.4's argument: one sentence for the
 * whole screen, since it is a fact about bots and not about seat 3).
 */
function hostHint(snapshot) {
  const explainsBots = snapshot.bots.length > 0 || freeSeats(snapshot).length > 0;

  return explainsBots
    ? `${t("online.hint.host")} ${t("online.hint.hostBots")}`
    : t("online.hint.host");
}

/**
 * One seat row of the host's lobby: who sits there, whether they are connected, and, on a seat nobody
 * has taken, the control that hands it to the computer.
 */
function seatRow(snapshot, seat) {
  const status = seatStatus(snapshot, seat);
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

  const ready = everybodyIn(snapshot);
  const fields = [];
  const buttons = [];

  if (snapshot.invite !== null) {
    fields.push({
      name: "invite",
      label: t("online.inviteLabel"),
      value: snapshot.invite,
      readonly: true,
    });
    fields.push({ name: "reply", label: t("online.replyLabel"), value: null, readonly: false });
    buttons.push({
      action: OVERLAY_ACTION.COPY,
      label: t(snapshot.copied ? "online.copied" : "online.copy"),
      field: "invite",
    });
    buttons.push({ action: OVERLAY_ACTION.CONNECT, label: t("online.connect"), field: "reply" });
  } else if (freeSeats(snapshot).length > 0) {
    buttons.push({ action: OVERLAY_ACTION.ADD_GUEST, label: t("online.addGuest") });
  }

  if (ready) {
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
    text:
      snapshot.error === null && snapshot.stage === STAGE.IDLE
        ? hostHint(snapshot)
        : statusText(snapshot, "online.hint.host"),
    player: null,
    seats: snapshot.seats.map((seat) => seatRow(snapshot, seat)),
    fields,
    buttons,
  };
}

/** The guest's lobby: paste the invite, then copy the reply and wait for the host. */
export function joinScreen(snapshot) {
  const fields = [{ name: "invite", label: t("online.inviteLabel"), value: null, readonly: false }];
  const buttons = [];

  if (snapshot.reply === null) {
    buttons.push({
      action: OVERLAY_ACTION.CONNECT,
      label: t("online.connect"),
      field: "invite",
      variant: "primary",
    });
  } else {
    fields.push({
      name: "reply",
      label: t("online.replyLabel"),
      value: snapshot.reply,
      readonly: true,
    });
    buttons.push({
      action: OVERLAY_ACTION.COPY,
      label: t(snapshot.copied ? "online.copied" : "online.copy"),
      field: "reply",
    });
  }
  buttons.push(back());

  return {
    screen: OVERLAY_SCREEN.JOIN,
    title: t("online.joinTitle"),
    text: statusText(snapshot, "online.hint.join"),
    player: null,
    fields,
    buttons,
  };
}
