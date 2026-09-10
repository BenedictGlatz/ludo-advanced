/**
 * What the three online screens say. Issue #42.
 *
 * Pure descriptions, tested the way `lineup-screen.test.js` and `menu-screen.test.js` are: by asking what
 * a screen offers in a given lobby state rather than by looking at the DOM. The cases are the ones a
 * player would notice: is there a Copy button beside every code, does Start appear only when everybody
 * is in, does the guest get a reply code to copy only after Connect.
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

  it("shows the invite to copy and the reply to paste while a guest is being invited", () => {
    const description = hostScreen(hosting({ invite: "abc", stage: STAGE.WAITING }));

    expect(fields(description)).toEqual(["invite", "reply"]);
    expect(description.fields[0]).toMatchObject({ value: "abc", readonly: true });
    expect(description.fields[1]).toMatchObject({ value: null, readonly: false });

    const copy = description.buttons.find((b) => b.action === OVERLAY_ACTION.COPY);
    const connect = description.buttons.find((b) => b.action === OVERLAY_ACTION.CONNECT);
    expect(copy.field).toBe("invite");
    expect(connect.field).toBe("reply");
    expect(actions(description)).not.toContain(OVERLAY_ACTION.START_ONLINE);
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

  it("puts an error before the stage, and the stage before the hint", () => {
    const hint = hostScreen(hosting());
    const stage = hostScreen(hosting({ stage: STAGE.CONNECTING }));
    const error = hostScreen(hosting({ stage: STAGE.CONNECTING, error: "nat" }));

    expect(new Set([hint.text, stage.text, error.text]).size).toBe(3);
    expect(error.text).toContain("20");
  });
});

describe("the guest's lobby", () => {
  it("starts with the invite field and Connect, and Back", () => {
    const description = joinScreen(hosting({ role: "guest", playerCount: null, seats: [] }));

    expect(description.screen).toBe(OVERLAY_SCREEN.JOIN);
    expect(fields(description)).toEqual(["invite"]);
    expect(actions(description)).toEqual([OVERLAY_ACTION.CONNECT, OVERLAY_ACTION.BACK]);
    expect(description.buttons[0].field).toBe("invite");
  });

  it("shows the reply code with a Copy button once the invite was answered", () => {
    const description = joinScreen(
      hosting({ role: "guest", reply: "xyz", stage: STAGE.WAITING, copied: true })
    );

    expect(fields(description)).toEqual(["invite", "reply"]);
    expect(description.fields[1]).toMatchObject({ value: "xyz", readonly: true });
    expect(actions(description)).toEqual([OVERLAY_ACTION.COPY, OVERLAY_ACTION.BACK]);
    expect(description.buttons[0].field).toBe("reply");
  });
});
