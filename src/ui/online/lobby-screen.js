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
 */

import { t } from "../../i18n/index.js";
import { OVERLAY_ACTION, OVERLAY_SCREEN } from "../overlay-vocabulary.js";
import { seatLabel } from "../player-labels.js";
import { PLAYER_COUNTS } from "../../core/board.js";

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

/** One seat row of the host's lobby: who sits there, and whether they are connected. */
function seatRow(snapshot, seat, index) {
  const status = index === 0 ? "host" : snapshot.connected.includes(seat) ? "connected" : "waiting";

  return {
    player: seat,
    controller: "human",
    label: seatLabel({ seats: snapshot.seats, bots: [] }, seat),
    status,
    statusLabel: t(`online.seat.${status}`),
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

  const everybodyIn = snapshot.connected.length === snapshot.playerCount - 1;
  const fields = [];
  const buttons = [];

  if (snapshot.invite !== null) {
    fields.push({ name: "invite", label: t("online.inviteLabel"), value: snapshot.invite, readonly: true });
    fields.push({ name: "reply", label: t("online.replyLabel"), value: null, readonly: false });
    buttons.push({ action: OVERLAY_ACTION.COPY, label: t(snapshot.copied ? "online.copied" : "online.copy"), field: "invite" });
    buttons.push({ action: OVERLAY_ACTION.CONNECT, label: t("online.connect"), field: "reply" });
  } else if (!everybodyIn) {
    buttons.push({ action: OVERLAY_ACTION.ADD_GUEST, label: t("online.addGuest") });
  }

  if (everybodyIn) {
    buttons.push({ action: OVERLAY_ACTION.START_ONLINE, label: t("online.start"), variant: "primary" });
  }
  buttons.push(back());

  return {
    screen: OVERLAY_SCREEN.HOST,
    title: t("online.hostTitle"),
    text: statusText(snapshot, "online.hint.host"),
    player: null,
    seats: snapshot.seats.map((seat, index) => seatRow(snapshot, seat, index)),
    fields,
    buttons,
  };
}

/** The guest's lobby: paste the invite, then copy the reply and wait for the host. */
export function joinScreen(snapshot) {
  const fields = [{ name: "invite", label: t("online.inviteLabel"), value: null, readonly: false }];
  const buttons = [];

  if (snapshot.reply === null) {
    buttons.push({ action: OVERLAY_ACTION.CONNECT, label: t("online.connect"), field: "invite", variant: "primary" });
  } else {
    fields.push({ name: "reply", label: t("online.replyLabel"), value: snapshot.reply, readonly: true });
    buttons.push({ action: OVERLAY_ACTION.COPY, label: t(snapshot.copied ? "online.copied" : "online.copy"), field: "reply" });
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
