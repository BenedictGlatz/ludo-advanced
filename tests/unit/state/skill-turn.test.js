/**
 * Where skill cards enter and leave a turn. Issue #38, requirements FR-22, FR-23 and FR-27.
 *
 * Every function under test returns a **changes object** rather than a state, so most of these tests
 * read a plain object out and never build a state at all. That is the shape on purpose: the caller
 * decides what else changes in the same transition, so a turn start that expires statuses and draws a
 * card is one new frozen state rather than three.
 */

import { describe, expect, it } from "vitest";

import { SKILL_HAND_LIMIT, totalCards } from "../../../src/core/skill-pool.js";
import { STATUS } from "../../../src/core/statuses.js";
import { createGameState, nextState } from "../../../src/state/game-state.js";
import {
  DEFAULT_CARD_BUDGET,
  canPlayCard,
  cardBudget,
  cardsPlayedBy,
  drawFor,
  seedSkillCards,
  skillSquareChanges,
  spendCard,
  turnStartChanges,
} from "../../../src/state/skill-turn.js";
import { rngForRolls } from "../../helpers/fixtures.js";

/** An RNG that always returns the same value. Enough for every draw here: the card drawn never matters. */
const steadyRng = () => 0.5;

function stateWith(changes) {
  return nextState(createGameState(4), changes);
}

describe("seedSkillCards", () => {
  it("shuffles the real 58-card pool by default", () => {
    const state = createGameState(4);

    expect(seedSkillCards(state, { rng: steadyRng }).skillPool).toHaveLength(58);
  });

  /**
   * The override that makes every scripted-roll test in the project possible. Shuffling 58 cards spends
   * 57 draws from the RNG, and a test scripting a list of rolls would be exhausted before the first
   * die. `match.js` carries the full reason.
   */
  it("takes a pool a caller hands it, so a scripted test can start with none", () => {
    expect(seedSkillCards(createGameState(4), {}, []).skillPool).toEqual([]);
  });
});

describe("drawFor", () => {
  it("moves one card from the pool into one seat's hand", () => {
    const state = stateWith({ skillPool: ["action-angel-die", "action-pot-of-greed"] });
    const changes = drawFor(state, 2, { rng: steadyRng });

    expect(changes.skillPool).toHaveLength(1);
    expect(changes.skillHands[2]).toHaveLength(1);
    // Nobody else's hand changed, and the new object is not the old one.
    expect(changes.skillHands[0]).toEqual([]);
    expect(changes.skillHands).not.toBe(state.skillHands);
  });

  /**
   * An empty pool is the case every scripted test depends on, and the important half is that it spends
   * **no randomness**. An RNG that throws when called is the only honest way to assert that.
   */
  it("spends no randomness at all when there is nothing to draw", () => {
    const state = stateWith({ skillPool: [], skillDiscard: [] });
    const exhausted = rngForRolls([], 6);

    expect(() => drawFor(state, 0, { rng: exhausted })).not.toThrow();
    expect(drawFor(state, 0, { rng: exhausted }).skillHands[0]).toEqual([]);
  });

  it("leaves the card in the pool when the hand is already full (FR-27)", () => {
    const full = Array.from({ length: SKILL_HAND_LIMIT }, () => "action-angel-die");
    const state = stateWith({ skillPool: ["action-pot-of-greed"], skillHands: { 0: full } });
    const changes = drawFor(state, 0, { rng: steadyRng });

    expect(changes.skillPool).toEqual(["action-pot-of-greed"]);
    expect(changes.skillHands[0]).toHaveLength(SKILL_HAND_LIMIT);
  });

  it("keeps the books closed: nothing is created and nothing is lost", () => {
    const state = stateWith({ skillPool: ["a", "b", "c"], skillDiscard: ["d"] });
    const after = nextState(state, drawFor(state, 1, { rng: steadyRng }));

    expect(totalCards(withHands(after))).toBe(totalCards(withHands(state)));
  });
});

/** `totalCards` takes the three lists by name, so this reshapes a state into what it expects. */
function withHands(state) {
  return { pool: state.skillPool, discard: state.skillDiscard, hands: state.skillHands };
}

describe("turnStartChanges", () => {
  /**
   * Expiry runs **before** the draw, and before anything else in the turn reads a status. That is what
   * makes a deadline mean the same thing however the rest of the turn is ordered.
   */
  it("expires what is due and then draws one card", () => {
    const state = stateWith({
      turnNumber: 10,
      skillPool: ["action-angel-die"],
      statuses: [
        { kind: STATUS.HELD, player: 1, pawn: 0, until: 10 },
        { kind: STATUS.ROCK, player: 2, pawn: 0, until: 14 },
      ],
    });
    const changes = turnStartChanges(state, { rng: steadyRng });

    expect(changes.statuses).toHaveLength(1);
    expect(changes.statuses[0].kind).toBe(STATUS.ROCK);
    expect(changes.skillHands[state.activePlayer]).toHaveLength(1);
  });
});

describe("skillSquareChanges (FR-22)", () => {
  const move = { player: 0, pawn: 0, from: 1, to: 5, captures: null };

  it("uses the square up, moves it, and draws a card for the pawn's owner", () => {
    // Seat 0 enters on square 0, so r = 5 is absolute square 4.
    const state = stateWith({ skillSquares: [4], skillPool: ["action-angel-die"] });
    const changes = skillSquareChanges(state, move, { rng: steadyRng });

    expect(changes.skillSquares).toHaveLength(1);
    expect(changes.skillSquares).not.toContain(4);
    expect(changes.skillHands[0]).toHaveLength(1);
  });

  it("does nothing at all on an ordinary square", () => {
    const state = stateWith({ skillSquares: [17], skillPool: ["action-angel-die"] });

    expect(skillSquareChanges(state, move, { rng: steadyRng })).toEqual({});
  });

  /**
   * Oil Spill's rule, and the one real game decision in this module. A card whose whole point is speed
   * should not also be the best way to farm cards.
   */
  it("skips the square for a pawn that slid there rather than walking (Oil Spill)", () => {
    const state = stateWith({
      skillSquares: [4],
      skillPool: ["action-angel-die"],
      statuses: [{ kind: STATUS.SLIPPERY, player: 0, pawn: 0, until: 99 }],
    });

    expect(skillSquareChanges(state, move, { rng: steadyRng })).toEqual({});
  });

  it("pays out to the owner of the pawn that landed, not to the active player", () => {
    // Seat 2 enters on square 20, so its r = 5 is absolute square 24.
    const state = stateWith({
      activePlayer: 0,
      skillSquares: [24],
      skillPool: ["action-angel-die"],
    });
    const changes = skillSquareChanges(state, { ...move, player: 2 }, { rng: steadyRng });

    expect(changes.skillHands[2]).toHaveLength(1);
    expect(changes.skillHands[0]).toEqual([]);
  });
});

describe("the card budget (FR-23)", () => {
  it("is one card per seat per turn unless something raised it", () => {
    const state = createGameState(4);

    expect(cardBudget(state, 0)).toBe(DEFAULT_CARD_BUDGET);
    expect(cardsPlayedBy(state, 0)).toBe(0);
    expect(canPlayCard(state, 0)).toBe(true);
  });

  it("is spent by playing a card and not by anything else", () => {
    const state = nextState(createGameState(4), spendCard(createGameState(4), 0));

    expect(cardsPlayedBy(state, 0)).toBe(1);
    expect(canPlayCard(state, 0)).toBe(false);
    // One seat's budget is one seat's budget.
    expect(canPlayCard(state, 1)).toBe(true);
  });

  /**
   * Double Dip's whole effect, and the reason the budget is a field rather than a constant. It has to be
   * net positive: playing the card spends one of one, the budget becomes two, so one is left.
   */
  it("can be raised for one seat and one turn (Double Dip)", () => {
    const state = stateWith({ cardBudget: { 0: 2 }, cardsPlayed: { 0: 1 } });

    expect(cardBudget(state, 0)).toBe(2);
    expect(canPlayCard(state, 0)).toBe(true);
    expect(canPlayCard(state, 1)).toBe(true);
  });
});
