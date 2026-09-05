import { describe, expect, it } from "vitest";

import {
  assertBotSeats,
  botSeatsFor,
  canBeBot,
  handoverNeeded,
  humanSeats,
  isBot,
  toggleController,
} from "../../../src/state/bots.js";

/** The two fields these functions read. Nothing here needs a real match. */
function seated(seats, bots) {
  return { seats, bots };
}

describe("botSeatsFor (FR-43)", () => {
  it("takes the last seats, which for two players means seat 2 and not seat 1", () => {
    // The one case where "the last seat" and "seat playerCount - 1" disagree: two players sit
    // opposite each other on seats 0 and 2, so the bot in a one-human match is seat 2.
    expect(botSeatsFor(2, 1)).toEqual([2]);
    expect(botSeatsFor(3, 1)).toEqual([2]);
    expect(botSeatsFor(4, 2)).toEqual([2, 3]);
    expect(botSeatsFor(4, 1)).toEqual([3]);
  });

  it("returns an empty list for no bots, and does not fall for slice(-0)", () => {
    // `seats.slice(-0)` is `slice(0)`, which is every seat. If this ever comes back with the whole
    // list, an ordinary hot-seat match has quietly turned into a bot-only one.
    expect(botSeatsFor(3, 0)).toEqual([]);
    expect(botSeatsFor(4, 0)).toEqual([]);
  });

  it("clamps a count that is too large or negative", () => {
    expect(botSeatsFor(2, 5)).toEqual([0, 2]);
    expect(botSeatsFor(4, 4)).toEqual([0, 1, 2, 3]);
    expect(botSeatsFor(4, -1)).toEqual([]);
  });
});

describe("assertBotSeats", () => {
  it("accepts an empty list and any subset of the seats in play", () => {
    expect(() => assertBotSeats([0, 2], [])).not.toThrow();
    expect(() => assertBotSeats([0, 2], [2])).not.toThrow();
    expect(() => assertBotSeats([0, 1, 2, 3], [1, 3])).not.toThrow();
  });

  it("rejects a seat nobody is sitting on", () => {
    // Seat 1 is empty in a two-player match, so a bot on it would own a HUD row and four pawns
    // that do not exist.
    expect(() => assertBotSeats([0, 2], [1])).toThrow(RangeError);
    expect(() => assertBotSeats([0, 2], [3])).toThrow(RangeError);
  });

  it("rejects a repeated seat and a non-array", () => {
    expect(() => assertBotSeats([0, 1, 2], [1, 1])).toThrow(RangeError);
    expect(() => assertBotSeats([0, 2], 2)).toThrow(TypeError);
  });
});

describe("isBot and humanSeats", () => {
  it("splits the seats in play into the two kinds", () => {
    const state = seated([0, 1, 2, 3], [2, 3]);

    expect(isBot(state, 0)).toBe(false);
    expect(isBot(state, 2)).toBe(true);
    expect(humanSeats(state)).toEqual([0, 1]);
  });

  it("treats a state with no bots field at all as an all-human match", () => {
    // Every hand-built fixture written before issue #43 is one of these, and there are a lot of them.
    const state = { seats: [0, 2] };

    expect(isBot(state, 0)).toBe(false);
    expect(humanSeats(state)).toEqual([0, 2]);
  });
});

describe("handoverNeeded (FR-43, and the rule change it makes to FR-04)", () => {
  it("asks for the screen only when a second person is going to take it", () => {
    const twoHumans = seated([0, 1, 2, 3], [2, 3]);

    expect(handoverNeeded(twoHumans, 1)).toBe(true);
    expect(handoverNeeded(twoHumans, 0)).toBe(true);
  });

  it("never asks before a bot's turn", () => {
    const twoHumans = seated([0, 1, 2, 3], [2, 3]);

    expect(handoverNeeded(twoHumans, 2)).toBe(false);
    expect(handoverNeeded(twoHumans, 3)).toBe(false);
  });

  it("never asks at all when one person is playing three bots", () => {
    // The consequence worth pinning down: with a single human the hand-over screen disappears from
    // the game entirely, because there is nobody to hand anything to.
    const soloist = seated([0, 1, 2, 3], [1, 2, 3]);

    for (const seat of soloist.seats) {
      expect(handoverNeeded(soloist, seat)).toBe(false);
    }
  });

  it("still asks in an ordinary hot-seat match", () => {
    const hotseat = seated([0, 2], []);

    expect(handoverNeeded(hotseat, 0)).toBe(true);
    expect(handoverNeeded(hotseat, 2)).toBe(true);
  });
});

/**
 * The line-up screen's rule, issue #76 and design handoff 15, D93.
 *
 * These two take plain arrays rather than a state, because there is no state: the player is on a menu
 * and no match has been built. The seats used below are the real ones `seatsFor` produces, which is
 * what makes the two-player case worth its own test.
 */
describe("canBeBot (FR-01)", () => {
  it("lets any seat become a bot while a second person is still playing", () => {
    expect(canBeBot([0, 1, 2, 3], [], 0)).toBe(true);
    expect(canBeBot([0, 1, 2, 3], [3], 1)).toBe(true);
    expect(canBeBot([0, 1, 2, 3], [2, 3], 0)).toBe(true);
  });

  it("refuses the last remaining person, which is the whole of FR-01", () => {
    expect(canBeBot([0, 1, 2, 3], [1, 2, 3], 0)).toBe(false);
    expect(canBeBot([0, 2], [2], 0)).toBe(false);
  });

  it("refuses a seat that is already a bot, and one that is not in the match", () => {
    // Not a rule, an answer to a question that does not apply: a bot is not a person to be protected,
    // and seat 1 is empty in a two-player match.
    expect(canBeBot([0, 1, 2], [2], 2)).toBe(false);
    expect(canBeBot([0, 2], [], 1)).toBe(false);
  });
});

describe("toggleController (FR-01)", () => {
  it("turns a person into a bot and back again", () => {
    expect(toggleController([0, 1, 2, 3], [], 2)).toEqual([2]);
    expect(toggleController([0, 1, 2, 3], [2], 2)).toEqual([]);
  });

  it("keeps the list sorted, so it is the same shape botSeatsFor produces", () => {
    // `state.bots` is in seat order whichever route into a match was taken, the line-up screen or
    // `?bots=`, so nothing downstream has to care which one built it.
    expect(toggleController([0, 1, 2, 3], [3], 1)).toEqual([1, 3]);
    expect(toggleController([0, 1, 2, 3], [1, 3], 0)).toEqual([0, 1, 3]);
  });

  it("returns the list unchanged instead of throwing when the toggle is refused", () => {
    // The caller is a click. A refused click on a menu is normal, and `assertBotSeats` is the function
    // that throws about a list that has already been decided.
    const bots = [1, 2, 3];

    expect(toggleController([0, 1, 2, 3], bots, 0)).toEqual([1, 2, 3]);
    expect(() => toggleController([0, 1, 2, 3], bots, 0)).not.toThrow();
  });

  it("works on a two-player match, where the seats are 0 and 2 and there is no seat 1", () => {
    // The case a four-seat test hides, and the same one `botSeatsFor` has its first test for.
    expect(toggleController([0, 2], [], 0)).toEqual([0]);
    expect(toggleController([0, 2], [0], 2)).toEqual([0]);
    expect(toggleController([0, 2], [0], 0)).toEqual([]);
  });

  it("never mutates the list it was given", () => {
    const bots = [3];

    toggleController([0, 1, 2, 3], bots, 1);
    expect(bots).toEqual([3]);
  });
});
