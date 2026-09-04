/**
 * Whether the bot plays a card at all, and whether it cheats. Issue #82.
 *
 * ## The fairness test is the reason this file exists
 *
 * A bot may read its own hand, the board, and **how many** cards everybody else holds, because that
 * count is on screen for everybody since decision D33. It may not read what those cards are. Nothing
 * in JavaScript stops it: `state.skillHands[1]` is right there, and a value function that peeked would
 * look like an improvement and pass every other test in the suite.
 *
 * So it is tested by experiment. The same board is decided twice with completely different cards in
 * the opponents' hands, and the answer has to be identical. That catches a peek at the cards while
 * still allowing the count, which is exactly the line the rules draw.
 *
 * ## And the threshold, which is what makes this a bot that plays cards rather than one that empties
 * its hand
 *
 * `PLAY_AT` is 4 and drops to 1 when the hand is full at five, because a full hand throws its next
 * draw away. The pair of cases below is the same board and the same cards, one card apart.
 */

import { describe, expect, it } from "vitest";

import { TRAP_KIND } from "../../../src/core/traps.js";
import { INTENT } from "../../../src/state/intents.js";
import { INTENT_CARD } from "../../../src/state/intents-cards.js";
import { chooseAction, chooseReaction } from "../../../src/ai/card-choice.js";
import { pawnsAt, stateFor } from "../../helpers/fixtures.js";

/** Seat 0's action phase, with a die chosen. */
function acting(fields) {
  return stateFor({ phase: "action", activePlayer: 0, chosenDie: 6, ...fields });
}

/**
 * A board where nothing in the hand is worth much: one pawn on the turn-off square, nobody behind it,
 * and no opponent out of the yard at all.
 *
 * - Rock walls a pawn nobody is walking towards, so 0.
 * - Built Different insures a pawn nobody can reach, so 0.
 * - Lock In is that minus the round the pawn loses, so -5.
 * - Let Him Cook on `r = 40` sends the pawn back to the yard on eight faces of twelve, so about -43.
 * - Pot of Greed is worth one card, 3, because a full hand has room for one of its two draws.
 */
const quiet = { pawns: pawnsAt(4, { "0.0": 40 }) };
const cheap = ["action-rock", "action-built-different", "action-lock-in", "action-let-him-cook"];

describe("the threshold: playing a card is not the same as having one", () => {
  it("keeps a hand of cards that are worth less than the threshold", () => {
    const state = acting({ ...quiet, skillHands: { 0: cheap, 1: [], 2: [], 3: [] } });

    expect(chooseAction(state)).toEqual({ type: INTENT.SKIP_ACTION });
  });

  /**
   * The same board with one more card in hand. Five is the limit, so the next draw would be thrown
   * away, and the threshold drops to 1: Pot of Greed's three points are suddenly worth having.
   */
  it("lowers the threshold when the hand is full, because a draw would be lost", () => {
    const full = [...cheap, "action-pot-of-greed"];
    const state = acting({ ...quiet, skillHands: { 0: full, 1: [], 2: [], 3: [] } });

    expect(chooseAction(state)).toEqual({
      type: INTENT_CARD.PLAY_CARD,
      seat: 0,
      cardId: "action-pot-of-greed",
      target: {},
    });
  });

  it("plays the best card when several clear the threshold", () => {
    // A pawn eight from home on a D6: Angel Die reaches the finish, and FR FR cannot name an 8 on a
    // D6 at all, so the die-changing card wins against the number-naming one.
    const state = acting({
      pawns: pawnsAt(4, { "0.0": 36, "0.1": 5, "0.2": 10, "0.3": 15 }),
      skillHands: { 0: ["action-rock", "action-angel-die"], 1: [], 2: [], 3: [] },
    });

    expect(chooseAction(state).cardId).toBe("action-angel-die");
  });
});

describe("the bot reads only what a person can see", () => {
  /** Three of seat 0's pawns out, with something worth playing in hand and cards on the far side. */
  const board = {
    pawns: pawnsAt(4, { "0.0": 36, "0.1": 5, "0.2": 10, "1.0": 12, "2.0": 20 }),
    skillHands: { 0: ["action-angel-die", "action-tax-fraud"], 1: [], 2: [], 3: [] },
  };

  it("decides the same way whatever the opponents are holding", () => {
    const one = acting({
      ...board,
      skillHands: {
        ...board.skillHands,
        1: ["reaction-ghost-mode", "reaction-nuehue"],
        2: ["action-yeet"],
      },
    });
    const other = acting({
      ...board,
      skillHands: {
        ...board.skillHands,
        1: ["action-hyperbeam", "reaction-the-purge"],
        2: ["reaction-devil-die"],
      },
    });

    expect(chooseAction(one)).toEqual(chooseAction(other));
  });

  /**
   * The count, on the other hand, is public and the bot is allowed to use it. Tax Fraud robs whoever
   * holds the most cards, so **how many** they hold has to change the answer while **what** they hold
   * does not. Without this case the fairness test above could be passed by a bot that ignores the
   * other hands entirely, which is a different bot from the one that was designed.
   */
  it("still uses the public card count", () => {
    const hands = { 0: ["action-tax-fraud"], 1: ["action-rock"], 2: ["action-rock"], 3: [] };
    const richer = { ...hands, 2: ["action-rock", "action-yeet"] };

    const first = chooseAction(acting({ ...quiet, skillHands: hands }));
    const second = chooseAction(acting({ ...quiet, skillHands: richer }));

    expect(first.target).toEqual({ player: 1 });
    expect(second.target).toEqual({ player: 2 });
  });
});

describe("the aura, checked once for all six offensive cards", () => {
  /**
   * Janky RPG aimed into a cluster of three opponents is worth fifteen points, and an It's Not That
   * Deep within three squares of the target makes it do nothing at all while still spending the card.
   * `nullifiedBy` is asked in `card-choice.js` rather than in the six offensive values, and this is
   * the case that proves the filter is wired up.
   *
   * **A known simplification:** the card is dropped rather than re-aimed. The value picks its best
   * square, the aura rejects that square, and the bot moves on to another card instead of searching
   * for the best square outside the aura. Recorded in `notes/06`.
   */
  it("does not spend an offensive card inside somebody else's It's Not That Deep", () => {
    const board = {
      pawns: pawnsAt(4, { "1.0": 5, "1.1": 6, "1.2": 7 }),
      skillHands: { 0: ["action-janky-rpg"], 1: [], 2: [], 3: [] },
    };

    expect(chooseAction(acting(board)).cardId).toBe("action-janky-rpg");

    const guarded = acting({
      ...board,
      traps: [{ kind: TRAP_KIND.NOT_THAT_DEEP, square: 13, owner: 1, until: null }],
    });

    expect(chooseAction(guarded)).toEqual({ type: INTENT.SKIP_ACTION });
  });
});

describe("answering a window", () => {
  function answering(fields) {
    return stateFor({
      phase: "reaction",
      activePlayer: 0,
      chosenDie: 6,
      reactionWindow: { trigger: "on-capture", actor: 0, eligible: [2], declined: [], played: [] },
      ...fields,
    });
  }

  it("declines when the hand holds nothing worth playing", () => {
    const state = answering({
      pawns: pawnsAt(4, { "0.0": 5, "1.0": 15 }),
      pendingMove: { player: 0, pawn: 0, from: 5, to: 15, captures: { player: 1, pawn: 0 } },
      skillHands: { 0: [], 1: [], 2: ["reaction-ghost-mode"], 3: [] },
    });

    // The capture is aimed at seat 1's pawn, so seat 2's Ghost Mode would dodge nothing.
    expect(chooseReaction(state, 2)).toEqual({ type: INTENT_CARD.DECLINE_REACTION, seat: 2 });
  });

  it("plays the card when it is the seat's own pawn about to be taken", () => {
    const state = answering({
      pawns: pawnsAt(4, { "0.0": 5, "2.0": 15 }),
      pendingMove: { player: 0, pawn: 0, from: 5, to: 15, captures: { player: 2, pawn: 0 } },
      skillHands: { 0: [], 1: [], 2: ["reaction-ghost-mode"], 3: [] },
    });

    expect(chooseReaction(state, 2)).toEqual({
      type: INTENT_CARD.PLAY_CARD,
      seat: 2,
      cardId: "reaction-ghost-mode",
      target: {},
    });
  });

  /** Uno Reverse is Ghost Mode plus the attacker going home, so it wins when both are held. */
  it("prefers Uno Reverse to Ghost Mode when it holds both", () => {
    const state = answering({
      pawns: pawnsAt(4, { "0.0": 5, "2.0": 15 }),
      pendingMove: { player: 0, pawn: 0, from: 5, to: 15, captures: { player: 2, pawn: 0 } },
      skillHands: { 0: [], 1: [], 2: ["reaction-ghost-mode", "reaction-uno-reverse"], 3: [] },
    });

    expect(chooseReaction(state, 2).cardId).toBe("reaction-uno-reverse");
  });
});
