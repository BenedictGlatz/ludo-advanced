/**
 * Playing a card, through the real dispatcher. Issue #38, requirements FR-23 to FR-25.
 *
 * `effects.test.js` checks what each card does. `reaction-window.test.js` checks who may answer. This
 * file checks the thing neither of them can: that a click on a card in a hand turns into all of it, in
 * the right order, and is refused for the right reason when it should not be allowed.
 *
 * Every state here is built by hand rather than by playing a match, so that the card under test is in
 * the hand it needs to be in. `match.test.js` covers a whole match.
 */

import { describe, expect, it } from "vitest";

import { fixedDieSource } from "../../../src/core/dice-source.js";
import { STATUS } from "../../../src/core/statuses.js";
import { TURN_PHASE, createGameState, nextState } from "../../../src/state/game-state.js";
import { INTENT, REJECTED, dispatch } from "../../../src/state/intents.js";
import { INTENT_CARD } from "../../../src/state/intents-cards.js";
import { pawnsAt, rngForDice } from "../../helpers/fixtures.js";

const deps = { rng: () => 0, diceSource: fixedDieSource(6) };

/** A four-player state in the action phase, with a chosen die and the given hands. */
function inActionPhase(hands, extra = {}) {
  return nextState(createGameState(4), {
    phase: TURN_PHASE.ACTION,
    chosenDie: 6,
    hand: [6],
    skillHands: { 0: [], 1: [], 2: [], 3: [], ...hands },
    ...extra,
  });
}

const play = (state, seat, cardId, target) =>
  dispatch(state, { type: INTENT_CARD.PLAY_CARD, seat, cardId, target }, deps);

describe("playing an Action card (FR-23)", () => {
  /**
   * The simple path: nobody holds a Reaction, so no window opens and the rule runs at once.
   */
  it("spends the budget, discards the card and applies its rule", () => {
    const state = inActionPhase({ 0: ["action-angel-die"] });
    const result = play(state, 0, "action-angel-die");

    expect(result.accepted).toBe(true);
    expect(result.state.modifiers.addDice).toEqual([8]);
    expect(result.state.skillHands[0]).toEqual([]);
    expect(result.state.skillDiscard).toEqual(["action-angel-die"]);
    expect(result.state.cardsPlayed).toEqual({ 0: 1 });
    // Still the action phase: a player with a raised budget may play again.
    expect(result.state.phase).toBe(TURN_PHASE.ACTION);
  });

  /**
   * The card leaves the hand and the budget is spent **now**, and the rule waits. That is the whole
   * design of the window, and this is where it becomes visible from outside.
   */
  it("waits in the window when somebody can answer it", () => {
    const state = inActionPhase({ 0: ["action-angel-die"], 2: ["reaction-nuehue"] });
    const result = play(state, 0, "action-angel-die");

    expect(result.state.reactionWindow.eligible).toEqual([2]);
    expect(result.state.pendingCard).toMatchObject({ seat: 0, cardId: "action-angel-die" });
    expect(result.state.skillHands[0]).toEqual([]);
    // The rule has not run.
    expect(result.state.modifiers.addDice).toEqual([]);
  });

  it("refuses a card that is not in that seat's hand", () => {
    const state = inActionPhase({ 0: ["action-angel-die"] });

    expect(play(state, 0, "action-rock", { pawn: { player: 0, pawn: 0 } }).reason).toBe(
      REJECTED.CARD_NOT_IN_SKILL_HAND
    );
  });

  it("refuses an Action card played by anybody but the active player (FR-23)", () => {
    const state = inActionPhase({ 2: ["action-angel-die"] });

    expect(play(state, 2, "action-angel-die").reason).toBe(REJECTED.NOT_YOUR_TURN);
  });

  it("refuses a Reaction card in the action phase, and a card played outside it", () => {
    const reaction = inActionPhase({ 0: ["reaction-devil-die"] });
    expect(play(reaction, 0, "reaction-devil-die").reason).toBe(REJECTED.CARD_NOT_PLAYABLE_NOW);

    const rolling = inActionPhase({ 0: ["action-angel-die"] }, { phase: TURN_PHASE.ROLL });
    expect(play(rolling, 0, "action-angel-die").reason).toBe(REJECTED.WRONG_PHASE);
  });

  it("refuses a second card once the budget is spent, and allows one after Double Dip", () => {
    const hands = { 0: ["action-angel-die", "action-critical-success"] };
    const spent = inActionPhase(hands, { cardsPlayed: { 0: 1 } });
    expect(play(spent, 0, "action-angel-die").reason).toBe(REJECTED.CARD_BUDGET_SPENT);

    const raised = inActionPhase(hands, { cardsPlayed: { 0: 1 }, cardBudget: { 0: 2 } });
    expect(play(raised, 0, "action-angel-die").accepted).toBe(true);
  });

  /**
   * Double Dip has to be net positive to be worth anything, and this is the assertion that says so:
   * playing it spends one of one, the budget becomes two, and a second card goes through.
   */
  it("lets Double Dip pay for itself", () => {
    const state = inActionPhase({ 0: ["action-double-dip", "action-angel-die"] });
    const first = play(state, 0, "action-double-dip");

    expect(first.state.cardsPlayed).toEqual({ 0: 1 });
    expect(first.state.cardBudget).toEqual({ 0: 2 });
    expect(play(first.state, 0, "action-angel-die").accepted).toBe(true);
  });
});

describe("the target check happens once, not in 29 effects", () => {
  it("asks for a target the card needs and has not been given", () => {
    const state = inActionPhase({ 0: ["action-rock"] });

    expect(play(state, 0, "action-rock").reason).toBe(REJECTED.NEEDS_TARGET);
  });

  /**
   * "You have not picked a pawn yet" and "that pawn is not yours" are different situations for the
   * player, so they are different reasons. The first is a prompt; the second is a mistake.
   */
  it("tells a wrong target apart from a missing one", () => {
    const state = inActionPhase({ 0: ["action-rock"] });
    const enemyPawn = { pawn: { player: 2, pawn: 0 } };

    expect(play(state, 0, "action-rock", enemyPawn).reason).toBe(REJECTED.BAD_TARGET);
  });

  it("accepts the card once the right kind of target is named", () => {
    const state = inActionPhase({ 0: ["action-rock"] });
    const result = play(state, 0, "action-rock", { pawn: { player: 0, pawn: 1 } });

    expect(result.accepted).toBe(true);
    expect(result.state.statuses[0]).toMatchObject({ kind: STATUS.ROCK, player: 0, pawn: 1 });
  });

  /**
   * 67's floor. "Roll a 6" is not unlikely on a D4, it is impossible, so the card is not playable at all.
   * That is a playability rule rather than a target, which is why it cannot live in the catalogue.
   */
  it("refuses 67 on a die that cannot roll a six", () => {
    const small = inActionPhase({ 0: ["action-sixty-seven"] }, { chosenDie: 4 });

    expect(play(small, 0, "action-sixty-seven").reason).toBe(REJECTED.CARD_NOT_PLAYABLE_NOW);
  });
});

describe("playing a Reaction card into an open window (FR-24)", () => {
  /** The state just after seat 0 played an Action card that seat 2 can answer. */
  function windowOpen() {
    const state = inActionPhase({ 0: ["action-angel-die"], 2: ["reaction-nuehue"] });

    return play(state, 0, "action-angel-die").state;
  }

  it("records the play without running the rule, and drops the seat out of the window", () => {
    const result = play(windowOpen(), 2, "reaction-nuehue");

    expect(result.accepted).toBe(true);
    expect(result.state.reactionWindow.eligible).toEqual([]);
    expect(result.state.reactionWindow.played).toHaveLength(1);
    expect(result.state.skillDiscard).toContain("reaction-nuehue");
  });

  it("refuses a seat that is not eligible, including the actor", () => {
    const open = windowOpen();

    expect(
      dispatch(open, { type: INTENT_CARD.PLAY_CARD, seat: 1, cardId: "reaction-nuehue" }, deps)
        .reason
    ).toBe(REJECTED.NOT_ELIGIBLE);
  });

  it("refuses a Reaction whose triggers do not include this moment", () => {
    const state = inActionPhase({
      0: ["action-angel-die"],
      2: ["reaction-nuehue", "reaction-devil-die"],
    });
    const open = play(state, 0, "action-angel-die").state;

    // Devil Die answers the roll, not a card.
    expect(play(open, 2, "reaction-devil-die").reason).toBe(REJECTED.CARD_NOT_PLAYABLE_NOW);
  });

  it("freezes the turn while the window is open", () => {
    const open = windowOpen();

    for (const type of [INTENT.SKIP_ACTION, INTENT.ROLL_DIE, INTENT.END_TURN]) {
      expect(dispatch(open, { type }, deps).reason).toBe(REJECTED.WRONG_PHASE);
    }
  });

  it("declines, which is what the timer running out also does", () => {
    const result = dispatch(windowOpen(), { type: INTENT_CARD.DECLINE_REACTION, seat: 2 }, deps);

    expect(result.state.reactionWindow.declined).toEqual([2]);
    expect(result.state.reactionWindow.eligible).toEqual([]);
  });

  it("refuses a decline with no window open", () => {
    const state = inActionPhase({ 0: [] });

    expect(dispatch(state, { type: INTENT_CARD.DECLINE_REACTION, seat: 2 }, deps).reason).toBe(
      REJECTED.NO_WINDOW
    );
  });
});

describe("the three moments a window interrupts, and what happens after it shuts", () => {
  it("on-card: the turn is still in the action phase", () => {
    const state = inActionPhase({ 0: ["action-angel-die"], 2: ["reaction-nuehue"] });
    const open = play(state, 0, "action-angel-die").state;
    const closed = dispatch(open, { type: INTENT.CLOSE_WINDOW }, deps).state;

    expect(closed.phase).toBe(TURN_PHASE.ACTION);
    expect(closed.modifiers.addDice).toEqual([8]);
  });

  /**
   * The on-roll window is the one that has to open **before** the number is known. A debuff playable
   * after seeing a good roll would be a debuff nobody would ever play at any other time.
   */
  it("on-roll: rolling opens the window first, and closing it rolls", () => {
    const state = inActionPhase({ 2: ["reaction-devil-die"] }, { phase: TURN_PHASE.ROLL });
    const opened = dispatch(state, { type: INTENT.ROLL_DIE }, deps);

    expect(opened.state.roll).toBeNull();
    expect(opened.state.reactionWindow.trigger).toBe("on-roll");

    const declined = dispatch(opened.state, { type: INTENT_CARD.DECLINE_REACTION, seat: 2 }, deps);
    const closed = dispatch(declined.state, { type: INTENT.CLOSE_WINDOW }, deps).state;

    expect(closed.roll).not.toBeNull();
    expect(closed.reactionWindow).toBeNull();
  });

  it("on-roll: a Devil Die played into it lands on the roll that follows", () => {
    const state = inActionPhase(
      { 2: ["reaction-devil-die"] },
      { phase: TURN_PHASE.ROLL, pawns: pawnsAt(4, { "0.0": 10 }) }
    );
    const scripted = {
      rng: rngForDice([
        [6, 6],
        [3, 8],
      ]),
      diceSource: fixedDieSource(6),
    };

    const opened = dispatch(state, { type: INTENT.ROLL_DIE }, scripted).state;
    const played = dispatch(
      opened,
      { type: INTENT_CARD.PLAY_CARD, seat: 2, cardId: "reaction-devil-die" },
      scripted
    ).state;
    const closed = dispatch(played, { type: INTENT.CLOSE_WINDOW }, scripted).state;

    // The scripted generator gives 6 on the D6 and then 3 on the added D8, so 6 - 3.
    expect(closed.rollSteps.map((step) => step.step)).toEqual(["base", "sub-die"]);
    expect(closed.roll).toBe(3);
  });

  /**
   * Only a capture is worth interrupting. A pawn walking onto an empty square is the ordinary turn, and
   * a window there would put a countdown in front of most of the game.
   */
  it("on-capture: a window opens for a capture and not for a plain move", () => {
    const base = {
      phase: TURN_PHASE.ACT,
      chosenDie: 6,
      roll: 3,
      skillHands: { 0: [], 1: [], 2: ["reaction-the-purge"], 3: [] },
    };

    // Seat 0's r = 13 is absolute square 12, and so is seat 1's r = 3.
    const capturing = nextState(createGameState(4), {
      ...base,
      pawns: pawnsAt(4, { "0.0": 10, "1.0": 3 }),
      legalMoves: [
        { player: 0, pawn: 0, kind: "advance", from: 10, to: 13, captures: { player: 1, pawn: 0 } },
      ],
    });
    const plain = nextState(createGameState(4), {
      ...base,
      pawns: pawnsAt(4, { "0.0": 10 }),
      legalMoves: [{ player: 0, pawn: 0, kind: "advance", from: 10, to: 13, captures: null }],
    });

    expect(
      dispatch(capturing, { type: INTENT.COMMIT_MOVE, pawn: 0 }, deps).state.reactionWindow
    ).not.toBeNull();
    expect(
      dispatch(plain, { type: INTENT.COMMIT_MOVE, pawn: 0 }, deps).state.reactionWindow
    ).toBeNull();
  });
});
