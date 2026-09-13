/**
 * The two selectors `ui/` reads before it draws the skill hand. Issue #34.
 *
 * Split from `intents-cards.test.js` when that file passed 300 lines, at the seam the module itself has:
 * the cases left behind **dispatch** intents and assert what changed, and these two ask questions and
 * change nothing.
 *
 * They are in `state/` and not in the view on purpose. `playableCards` is built on the same `cardRefusal`
 * the dispatcher checks first, so a card the hand offers is a card the dispatcher accepts. A view that
 * worked it out for itself would be a second copy of five rules, and the failure that produces is the
 * worst kind in a card game: the player is told they may do something and then told they may not.
 */

import { describe, expect, it } from "vitest";

import { fixedDieSource } from "../../../src/core/dice-source.js";
import { TURN_PHASE, createGameState, nextState } from "../../../src/state/game-state.js";
import { dispatch } from "../../../src/state/intents.js";
import { INTENT_CARD, playableCards, seatOnShow } from "../../../src/state/intents-cards.js";

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
/**
 * The two selectors `ui/` reads. Issue #34.
 *
 * They are in `state/` and not in the view on purpose: `playableCards` is built on the same `cardRefusal`
 * the dispatcher checks first, so a card the hand offers is a card the dispatcher accepts. A view that
 * worked it out for itself would be a second copy of five rules.
 */
describe("what the skill hand asks before it draws itself", () => {
  it("offers the Action cards in the active player's hand during the action phase", () => {
    const state = inActionPhase({ 0: ["action-angel-die", "reaction-devil-die"] });

    expect(playableCards(state, 0)).toEqual(["action-angel-die"]);
    // Nobody else may play anything on somebody else's turn (FR-23).
    expect(playableCards(state, 2)).toEqual([]);
  });

  it("offers nothing at all outside the action phase", () => {
    const state = inActionPhase({ 0: ["action-angel-die"] }, { phase: TURN_PHASE.ACT });

    expect(playableCards(state, 0)).toEqual([]);
  });

  it("offers only the Reactions that fit an open window, and only to eligible seats", () => {
    const opened = play(
      inActionPhase({
        0: ["action-angel-die"],
        2: ["reaction-nuehue", "reaction-devil-die", "action-rock"],
      }),
      0,
      "action-angel-die"
    ).state;

    // Nühü answers a card, Devil Die answers a roll, and an Action card answers nothing.
    expect(playableCards(opened, 2)).toEqual(["reaction-nuehue"]);
    expect(playableCards(opened, 1)).toEqual([]);
  });

  /**
   * The hand on screen is never nobody's, and that is the fix for a real bug: fusing "whose hand" with
   * "who may act" left the hand blank in every phase except the action phase, so a player could not see
   * what they held while choosing a dice card.
   */
  it("always names a seat whose hand is on screen", () => {
    for (const phase of Object.values(TURN_PHASE)) {
      const state = inActionPhase({}, { phase });

      expect(seatOnShow(state), phase).toBe(0);
    }
  });

  it("shows the seat being asked while a window is open, whoever's turn it is", () => {
    const opened = play(
      inActionPhase({ 0: ["action-angel-die"], 2: ["reaction-nuehue"] }),
      0,
      "action-angel-die"
    ).state;

    expect(seatOnShow(opened)).toBe(2);
  });

  /**
   * A window whose eligible list has emptied is about to be closed by the loop, and until it is, the hand
   * on screen falls back to the active player's rather than to nobody's.
   */
  it("falls back to the active player when the window has nobody left in it", () => {
    const opened = play(
      inActionPhase({ 0: ["action-angel-die"], 2: ["reaction-nuehue"] }),
      0,
      "action-angel-die"
    ).state;
    const answered = play(opened, 2, "reaction-nuehue").state;

    expect(answered.reactionWindow.eligible).toEqual([]);
    expect(seatOnShow(answered)).toBe(0);
  });
});
