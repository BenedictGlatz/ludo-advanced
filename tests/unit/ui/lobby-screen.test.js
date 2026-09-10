/**
 * What the three online screens say. Issues #42 and #101, design spec 19.
 *
 * Pure descriptions, tested the way `lineup-screen.test.js` and `menu-screen.test.js` are: by asking what
 * a screen offers in a given lobby state rather than by looking at the DOM. The cases are the ones a
 * player would notice: is there a Copy button beside every code, does Start appear only when everybody
 * is in, does the guest get a reply code to copy only after Connect, and, since spec 19, does the stage
 * stand on the seat row it belongs to and does a failure offer a fresh code.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { initI18n } from "../../../src/i18n/index.js";
import { OVERLAY_ACTION, OVERLAY_SCREEN } from "../../../src/ui/overlay-vocabulary.js";
import {
  STAGE,
  hostScreen,
  joinScreen,
  onlineScreen,
} from "../../../src/ui/online/lobby-screen.js";

const actions = (description) => description.buttons.map((button) => button.action);
const fields = (description) => (description.fields ?? []).map((field) => field.name);
const fieldButton = (description, name) =>
  description.fields.find((field) => field.name === name).button;

/** A host lobby snapshot with `fields` written over the idle defaults. */
function hosting(fields = {}) {
  return {
    role: "host",
    playerCount: 3,
    seats: [0, 1, 2],
    connected: [],
    bots: [],
    pending: false,
    invite: null,
    reply: null,
    stage: STAGE.IDLE,
    error: null,
    copied: false,
    ...fields,
  };
}

describe("the online door", () => {
  beforeAll(async () => {
    await initI18n("de");
  });

  it("offers Join, Host as the primary, and Back", () => {
    const description = onlineScreen();

    expect(description.screen).toBe(OVERLAY_SCREEN.ONLINE);
    expect(actions(description)).toEqual([
      OVERLAY_ACTION.JOIN,
      OVERLAY_ACTION.HOST,
      OVERLAY_ACTION.BACK,
    ]);
    expect(description.buttons[1].variant).toBe("primary");
  });
});

describe("the host's lobby", () => {
  it("asks for a player count first, with the same three counts as the setup screen", () => {
    const description = hostScreen(hosting({ playerCount: null, seats: [] }));

    expect(description.buttons.filter((b) => b.action === OVERLAY_ACTION.HOST)).toHaveLength(3);
    expect(description.buttons.map((b) => b.count)).toEqual([2, 3, 4, undefined]);
    expect(fields(description)).toEqual([]);
  });

  it("puts Copy beside the invite and Connect beside the reply, not in the actions row (D119.2)", () => {
    const description = hostScreen(hosting({ invite: "abc", stage: STAGE.WAITING, pending: true }));

    expect(fields(description)).toEqual(["invite", "reply"]);
    expect(description.fields[0]).toMatchObject({ value: "abc", readonly: true });
    expect(description.fields[1]).toMatchObject({ value: null, readonly: false });

    expect(fieldButton(description, "invite")).toMatchObject({
      action: OVERLAY_ACTION.COPY,
      field: "invite",
      autofocus: true,
    });
    expect(fieldButton(description, "reply")).toMatchObject({
      action: OVERLAY_ACTION.CONNECT,
      field: "reply",
    });
    expect(actions(description)).toEqual([OVERLAY_ACTION.BACK]);
  });

  it("names every seat with its status, the host first", () => {
    const description = hostScreen(hosting({ connected: [1] }));

    expect(description.seats.map((seat) => seat.status)).toEqual(["host", "connected", "waiting"]);
    expect(description.seats.map((seat) => seat.player)).toEqual([0, 1, 2]);
    expect(description.seats.every((seat) => seat.statusLabel !== "")).toBe(true);
  });

  it("offers the next invite while seats are free, and Start once everybody is in", () => {
    const oneIn = hostScreen(hosting({ connected: [1] }));
    expect(actions(oneIn)).toEqual([OVERLAY_ACTION.ADD_GUEST, OVERLAY_ACTION.BACK]);

    const allIn = hostScreen(hosting({ connected: [1, 2], stage: STAGE.CONNECTED }));
    expect(actions(allIn)).toEqual([OVERLAY_ACTION.START_ONLINE, OVERLAY_ACTION.BACK]);
    expect(allIn.buttons[0].variant).toBe("primary");
  });

  it("hands a free seat to the computer on the line-up's control, and names it Bot (issue #101)", () => {
    const description = hostScreen(hosting({ connected: [1], bots: [2] }));
    const [host, guest, bot] = description.seats;

    expect(description.seats.map((seat) => seat.status)).toEqual(["host", "connected", "bot"]);
    // The host and a person who joined have nothing to switch.
    expect(host.choices).toEqual([]);
    expect(guest.choices).toEqual([]);
    // The bot's row renames itself and its Bot position is the pressed one, as on the line-up.
    expect(bot.controller).toBe("bot");
    expect(bot.label).toMatch(/^Bot 3/u);
    expect(bot.choices.map((choice) => [choice.value, choice.pressed, choice.disabled])).toEqual([
      ["human", false, false],
      ["bot", true, false],
    ]);
    expect(bot.choices[0].action).toBe(OVERLAY_ACTION.CONTROLLER);
  });

  it("refuses the last free seat while no guest is in, and Start needs one guest (issue #101)", () => {
    // Host plus two free seats: one may become a bot, the last one may not, or the host plays alone.
    const oneBot = hostScreen(hosting({ bots: [2] }));
    const waiting = oneBot.seats[1];
    expect(waiting.status).toBe("waiting");
    expect(waiting.choices.find((choice) => choice.value === "bot").disabled).toBe(true);
    expect(actions(oneBot)).toEqual([OVERLAY_ACTION.ADD_GUEST, OVERLAY_ACTION.BACK]);

    // One guest and one bot fill the table: Start, and no further invite.
    const ready = hostScreen(hosting({ connected: [1], bots: [2], stage: STAGE.CONNECTED }));
    expect(actions(ready)).toEqual([OVERLAY_ACTION.START_ONLINE, OVERLAY_ACTION.BACK]);
  });

  it("explains the control in the idle sentence while a seat is free or a bot", () => {
    const withFreeSeat = hostScreen(hosting());
    const full = hostScreen(hosting({ connected: [1, 2] }));

    expect(withFreeSeat.text.length).toBeGreaterThan(full.text.length);
    expect(withFreeSeat.text.startsWith(full.text)).toBe(true);
  });

  /**
   * D118.1: the stage is a fact about one seat, so it stands on that seat's row. The sentence under the
   * title keeps the hint, and the row being connected carries no control while the browser works on it.
   */
  it("puts gathering and connecting on the seat the invite is for, and keeps the hint (D118.1)", () => {
    const idle = hostScreen(hosting({ connected: [1] }));
    const gathering = hostScreen(
      hosting({ connected: [1], stage: STAGE.GATHERING, pending: true })
    );
    const connecting = hostScreen(
      hosting({ connected: [1], stage: STAGE.CONNECTING, pending: true, invite: "abc" })
    );

    expect(gathering.seats.map((seat) => seat.status)).toEqual(["host", "connected", "gathering"]);
    expect(connecting.seats.map((seat) => seat.status)).toEqual([
      "host",
      "connected",
      "connecting",
    ]);
    expect(gathering.seats[2].statusLabel).not.toBe(idle.seats[2].statusLabel);
    expect(gathering.seats[2].choices).toEqual([]);
    expect(gathering.text).toBe(idle.text);
    expect(gathering.tone).toBeNull();
  });

  it("marks a failure as warn, and after nat or failed offers a fresh code where Connect was (D121.2)", () => {
    const nat = hostScreen(hosting({ connected: [1], error: "nat" }));
    const failed = hostScreen(hosting({ error: "failed" }));
    const badCode = hostScreen(
      hosting({ error: "badCode", invite: "abc", stage: STAGE.WAITING, pending: true })
    );
    const plain = hostScreen(hosting({ connected: [1] }));

    expect(nat.tone).toBe("warn");
    expect(nat.text).toContain("20");
    expect(actions(nat)).toEqual([OVERLAY_ACTION.ADD_GUEST, OVERLAY_ACTION.BACK]);
    expect(nat.buttons[0].label).not.toBe(plain.buttons[0].label);
    expect(failed.buttons[0].label).toBe(nat.buttons[0].label);

    // A bad paste keeps the invite: the player only has to copy it again.
    expect(badCode.tone).toBe("warn");
    expect(fields(badCode)).toEqual(["invite", "reply"]);
    expect(plain.tone).toBeNull();
  });
});

describe("the guest's lobby", () => {
  it("starts with the invite field and Connect beside it, then Back", () => {
    const description = joinScreen(hosting({ role: "guest", playerCount: null, seats: [] }));

    expect(description.screen).toBe(OVERLAY_SCREEN.JOIN);
    expect(fields(description)).toEqual(["invite"]);
    expect(fieldButton(description, "invite")).toMatchObject({
      action: OVERLAY_ACTION.CONNECT,
      field: "invite",
      variant: "primary",
      autofocus: true,
    });
    expect(actions(description)).toEqual([OVERLAY_ACTION.BACK]);
  });

  it("shows the reply code with a Copy button beside it once the invite was answered", () => {
    const description = joinScreen(
      hosting({ role: "guest", reply: "xyz", stage: STAGE.WAITING, copied: true })
    );

    expect(fields(description)).toEqual(["invite", "reply"]);
    expect(description.fields[1]).toMatchObject({ value: "xyz", readonly: true });
    expect(fieldButton(description, "invite")).toBeUndefined();
    expect(fieldButton(description, "reply")).toMatchObject({
      action: OVERLAY_ACTION.COPY,
      field: "reply",
    });
    expect(actions(description)).toEqual([OVERLAY_ACTION.BACK]);
  });

  it("keeps the stage in its sentence, since it has no seat rows, and warns on a failure", () => {
    const waiting = joinScreen(hosting({ role: "guest", reply: "xyz", stage: STAGE.WAITING }));
    const failed = joinScreen(hosting({ role: "guest", error: "nat", stage: STAGE.WAITING }));
    const hint = joinScreen(hosting({ role: "guest" }));

    expect(new Set([waiting.text, failed.text, hint.text]).size).toBe(3);
    expect(waiting.tone).toBeNull();
    expect(failed.tone).toBe("warn");
  });
});
