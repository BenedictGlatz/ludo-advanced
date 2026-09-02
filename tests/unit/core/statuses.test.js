/**
 * Statuses with a duration. Issue #38, requirements FR-26 and FR-28.
 *
 * The whole module is arithmetic over a list, so every test here is a literal in and a literal out.
 * What is worth testing is not the filtering, it is the two decisions the filtering encodes: that a
 * duration is normalised to turns before it is stored, and that a broader status covers a narrower
 * question.
 */

import { describe, expect, it } from "vitest";

import {
  STATUS,
  addStatus,
  expireStatuses,
  hasStatus,
  removeStatus,
  statusesOfKind,
  turnsForRounds,
} from "../../../src/core/statuses.js";

const held = (overrides = {}) => ({
  kind: STATUS.HELD,
  player: 1,
  pawn: 2,
  until: 10,
  source: "reaction-hold-pawn",
  ...overrides,
});

describe("turnsForRounds", () => {
  /**
   * The reason this function exists at all: the same card means a different length of time at a
   * different table size, and the cards are printed in two different units.
   */
  it("makes one round as many turns as there are players", () => {
    expect(turnsForRounds(1, 2)).toBe(2);
    expect(turnsForRounds(1, 4)).toBe(4);
    expect(turnsForRounds(2, 3)).toBe(6);
  });

  it("refuses a duration that is not a positive whole number of rounds", () => {
    for (const rounds of [0, -1, 1.5, "2"]) {
      expect(() => turnsForRounds(rounds, 4)).toThrow(RangeError);
    }
  });
});

describe("expireStatuses", () => {
  /**
   * `until` is exclusive, and that is the difference between a card lasting as long as it says and
   * lasting one turn longer. "Held until turn 10" means turn 9 is the last one it applies to.
   */
  it("keeps a status up to but not including its deadline turn", () => {
    const statuses = [held({ until: 10 })];

    expect(expireStatuses(statuses, 9)).toHaveLength(1);
    expect(expireStatuses(statuses, 10)).toHaveLength(0);
    expect(expireStatuses(statuses, 11)).toHaveLength(0);
  });

  it("leaves a list with nothing expired alone", () => {
    const statuses = [held({ until: 20 }), held({ pawn: 3, until: 30 })];

    expect(expireStatuses(statuses, 5)).toHaveLength(2);
  });
});

describe("addStatus", () => {
  it("adds a status that is not there yet", () => {
    expect(addStatus([], held())).toHaveLength(1);
  });

  /**
   * Two Rocks on one pawn are one Rock. Stacking would let the list grow without bound over a long
   * match, and nothing in the 29 cards benefits from a status counting to two.
   */
  it("replaces the same kind on the same target instead of stacking it", () => {
    const result = addStatus([held({ until: 10 })], held({ until: 14 }));

    expect(result).toHaveLength(1);
    expect(result[0].until).toBe(14);
  });

  it("keeps the longer of the two deadlines, whichever order they arrive in", () => {
    expect(addStatus([held({ until: 20 })], held({ until: 12 }))[0].until).toBe(20);
  });

  it("treats the same kind on a different pawn as a different status", () => {
    expect(addStatus([held({ pawn: 1 })], held({ pawn: 2 }))).toHaveLength(2);
  });
});

describe("hasStatus", () => {
  it("finds a status attached to exactly that pawn", () => {
    const statuses = [held()];

    expect(hasStatus(statuses, STATUS.HELD, { player: 1, pawn: 2 })).toBe(true);
    expect(hasStatus(statuses, STATUS.HELD, { player: 1, pawn: 3 })).toBe(false);
    expect(hasStatus(statuses, STATUS.ROCK, { player: 1, pawn: 2 })).toBe(false);
  });

  /**
   * The loose match, and the reason The Purge is one entry rather than sixteen.
   *
   * A status with `pawn: null` belongs to a whole player and a status with both fields `null` belongs
   * to the whole board. Asking about one pawn has to find both, and asking about one pawn must never
   * be answered by a status on a *different* pawn.
   */
  it("lets a board-wide status answer for every pawn (The Purge)", () => {
    const purge = [{ kind: STATUS.PURGE, player: null, pawn: null, until: 20 }];

    expect(hasStatus(purge, STATUS.PURGE, { player: 3, pawn: 0 })).toBe(true);
    expect(hasStatus(purge, STATUS.PURGE)).toBe(true);
  });

  it("lets a player-wide status answer for any of that player's pawns and nobody else's", () => {
    const locked = [{ kind: STATUS.LOCKED, player: 2, pawn: null, until: 20 }];

    expect(hasStatus(locked, STATUS.LOCKED, { player: 2, pawn: 3 })).toBe(true);
    expect(hasStatus(locked, STATUS.LOCKED, { player: 1, pawn: 3 })).toBe(false);
  });
});

describe("statusesOfKind and removeStatus", () => {
  it("collects every status of one kind, whoever holds it", () => {
    const statuses = [held({ player: 0 }), held({ player: 1 }), { ...held(), kind: STATUS.ROCK }];

    expect(statusesOfKind(statuses, STATUS.HELD)).toHaveLength(2);
  });

  /**
   * Two statuses are spent rather than expiring, so there has to be a way to take one off early. A
   * duration alone cannot say "until it is needed once".
   */
  it("takes one status off one target and leaves the rest", () => {
    const statuses = [held({ pawn: 1 }), held({ pawn: 2 })];
    const result = removeStatus(statuses, STATUS.HELD, { player: 1, pawn: 1 });

    expect(result).toHaveLength(1);
    expect(result[0].pawn).toBe(2);
  });
});
