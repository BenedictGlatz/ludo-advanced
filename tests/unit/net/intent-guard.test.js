/**
 * What a guest may ask the host for: every row of the table in `intent-guard.js`. Issue #42.
 *
 * The guard adds two questions the rules never had to ask, who sent it and what the loop owns, so each
 * case below is one of those two questions with one answer.
 */

import { describe, expect, it } from "vitest";

import { TURN_PHASE } from "../../../src/state/game-state.js";
import { INTENT, REJECTED } from "../../../src/state/intents.js";
import { INTENT_CARD } from "../../../src/state/intents-cards.js";
import { GUEST_REFUSED, guestIntentRefusal } from "../../../src/net/intent-guard.js";
import { stateFor } from "../../helpers/fixtures.js";

/** Seat 2 is the guest. Seat 0 is the host. */
const GUEST = [2];
const window = (eligible) => ({ trigger: "on-roll", actor: 0, eligible, declined: [], played: [] });

describe("the turn intents", () => {
  const turn = (fields) => stateFor({ phase: TURN_PHASE.CHOOSE, ...fields });

  it("are allowed on the guest's own turn", () => {
    const state = turn({ activePlayer: 2 });

    for (const type of [INTENT.CHOOSE_DIE, INTENT.SELECT_PAWN, INTENT.COMMIT_MOVE]) {
      expect(guestIntentRefusal(state, { type }, GUEST), type).toBeNull();
    }
  });

  it("are refused on somebody else's turn, and while a window is open", () => {
    const hostsTurn = turn({ activePlayer: 0 });
    expect(guestIntentRefusal(hostsTurn, { type: INTENT.CHOOSE_DIE, faces: 6 }, GUEST)).toBe(
      GUEST_REFUSED.NOT_YOUR_TURN
    );

    const asked = turn({ activePlayer: 2, reactionWindow: window([0]) });
    expect(guestIntentRefusal(asked, { type: INTENT.SELECT_PAWN, pawn: 0 }, GUEST)).toBe(
      GUEST_REFUSED.NOT_YOUR_TURN
    );
  });
});

describe("skip-action", () => {
  it("is allowed when the guest holds a playable card and it is the guest's action phase", () => {
    const state = stateFor({
      phase: TURN_PHASE.ACTION,
      activePlayer: 2,
      skillHands: { 0: [], 1: [], 2: ["action-double-dip"], 3: [] },
    });

    expect(guestIntentRefusal(state, { type: INTENT.SKIP_ACTION }, GUEST)).toBeNull();
  });

  it("is the loop's when nothing is playable, and not-your-turn on the host's turn", () => {
    const empty = stateFor({ phase: TURN_PHASE.ACTION, activePlayer: 2 });
    expect(guestIntentRefusal(empty, { type: INTENT.SKIP_ACTION }, GUEST)).toBe(
      GUEST_REFUSED.LOOP_OWNED
    );

    const hosts = stateFor({ phase: TURN_PHASE.ACTION, activePlayer: 0 });
    expect(guestIntentRefusal(hosts, { type: INTENT.SKIP_ACTION }, GUEST)).toBe(
      GUEST_REFUSED.NOT_YOUR_TURN
    );
  });
});

describe("play-card", () => {
  const holding = stateFor({
    phase: TURN_PHASE.ACTION,
    activePlayer: 2,
    skillHands: { 0: ["action-double-dip"], 1: [], 2: ["action-double-dip"], 3: [] },
  });

  it("needs the guest's own seat, named explicitly", () => {
    const own = { type: INTENT_CARD.PLAY_CARD, seat: 2, cardId: "action-double-dip" };
    expect(guestIntentRefusal(holding, own, GUEST)).toBeNull();

    // No seat at all: `intents-cards.js` would fill in the active player, which is exactly the hole.
    const unnamed = { type: INTENT_CARD.PLAY_CARD, cardId: "action-double-dip" };
    expect(guestIntentRefusal(holding, unnamed, GUEST)).toBe(GUEST_REFUSED.NOT_YOUR_SEAT);

    const hosts = { type: INTENT_CARD.PLAY_CARD, seat: 0, cardId: "action-double-dip" };
    expect(guestIntentRefusal(holding, hosts, GUEST)).toBe(GUEST_REFUSED.NOT_YOUR_SEAT);
  });

  it("then lets cardRefusal decide", () => {
    const notHeld = { type: INTENT_CARD.PLAY_CARD, seat: 2, cardId: "action-no-take-backsies" };
    expect(guestIntentRefusal(holding, notHeld, GUEST)).toBe(REJECTED.CARD_NOT_IN_SKILL_HAND);

    const wrongTurn = stateFor({ ...holding, activePlayer: 0 });
    const card = { type: INTENT_CARD.PLAY_CARD, seat: 2, cardId: "action-double-dip" };
    expect(guestIntentRefusal(wrongTurn, card, GUEST)).toBe(REJECTED.NOT_YOUR_TURN);
  });
});

describe("decline-reaction", () => {
  it("needs the guest's own seat and an open window it is eligible in", () => {
    const asked = stateFor({
      phase: TURN_PHASE.ROLL,
      activePlayer: 0,
      reactionWindow: window([2]),
    });

    expect(
      guestIntentRefusal(asked, { type: INTENT_CARD.DECLINE_REACTION, seat: 2 }, GUEST)
    ).toBeNull();
    expect(guestIntentRefusal(asked, { type: INTENT_CARD.DECLINE_REACTION, seat: 0 }, GUEST)).toBe(
      GUEST_REFUSED.NOT_YOUR_SEAT
    );

    const notAsked = stateFor({ ...asked, reactionWindow: window([1]) });
    expect(
      guestIntentRefusal(notAsked, { type: INTENT_CARD.DECLINE_REACTION, seat: 2 }, GUEST)
    ).toBe(REJECTED.NOT_ELIGIBLE);

    const noWindow = stateFor({ phase: TURN_PHASE.ROLL, activePlayer: 0 });
    expect(
      guestIntentRefusal(noWindow, { type: INTENT_CARD.DECLINE_REACTION, seat: 2 }, GUEST)
    ).toBe(REJECTED.NO_WINDOW);
  });
});

describe("the loop-owned and unknown intents", () => {
  it("refuses roll-die, close-window and end-turn whatever the state says", () => {
    const state = stateFor({ phase: TURN_PHASE.ROLL, activePlayer: 2 });

    for (const type of [INTENT.ROLL_DIE, INTENT.CLOSE_WINDOW, INTENT.END_TURN]) {
      expect(guestIntentRefusal(state, { type }, GUEST), type).toBe(GUEST_REFUSED.LOOP_OWNED);
    }
  });

  it("refuses anything it does not know, including a non-object", () => {
    const state = stateFor({ activePlayer: 2 });

    expect(guestIntentRefusal(state, { type: "teleport" }, GUEST)).toBe(REJECTED.UNKNOWN_INTENT);
    expect(guestIntentRefusal(state, null, GUEST)).toBe(REJECTED.UNKNOWN_INTENT);
    expect(guestIntentRefusal(state, "choose-die", GUEST)).toBe(REJECTED.UNKNOWN_INTENT);
  });
});
