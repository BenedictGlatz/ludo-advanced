/**
 * The half-made line-up between the player count and the match. Issue #76, design handoff 15.
 *
 * `lineup.js` is worth a unit test for the same reason `pool-screen.js` is: it is pure, it holds no
 * jQuery and no `t()`, and it is the one piece of this screen that remembers something. The screen
 * itself, that a click switches a row and that the match starts with the seats the screen showed, is
 * covered by `tests/e2e/lineup.spec.js`.
 */

import { describe, expect, it } from "vitest";

import { createLineup } from "../../../src/ui/lineup.js";

describe("the line-up", () => {
  it("knows nothing before a count is chosen", () => {
    expect(createLineup().snapshot()).toEqual({ playerCount: null, seats: [], bots: [] });
  });

  it("opens with every seat a person, for two, three and four players (D92)", () => {
    // Not a recommendation the screen invents: it keeps what the player just said on the count screen,
    // and it is what every existing end-to-end spec gets by clicking straight through.
    for (const count of [2, 3, 4]) {
      const lineup = createLineup();
      lineup.begin(count);

      expect(lineup.snapshot().bots).toEqual([]);
      expect(lineup.snapshot().playerCount).toBe(count);
    }
  });

  it("uses the seats the count actually has, so two players are seats 0 and 2", () => {
    const lineup = createLineup();

    lineup.begin(2);
    expect(lineup.snapshot().seats).toEqual([0, 2]);

    lineup.begin(3);
    expect(lineup.snapshot().seats).toEqual([0, 1, 2]);

    lineup.begin(4);
    expect(lineup.snapshot().seats).toEqual([0, 1, 2, 3]);
  });

  it("does nothing when the position that is already chosen is clicked", () => {
    // Both positions are live at all times, so "Spieler" on a row that is already a person has to be
    // a no-op rather than a switch to the computer. That is the whole reason this sets a value.
    const lineup = createLineup();
    lineup.begin(4);
    lineup.setController(2, "bot");

    lineup.setController(2, "bot");
    expect(lineup.snapshot().bots).toEqual([2]);

    lineup.setController(1, "human");
    expect(lineup.snapshot().bots).toEqual([2]);
  });

  it("switches a seat to the computer and back", () => {
    const lineup = createLineup();
    lineup.begin(4);

    lineup.setController(3, "bot");
    expect(lineup.snapshot().bots).toEqual([3]);

    lineup.setController(3, "human");
    expect(lineup.snapshot().bots).toEqual([]);
  });

  it("lets seat 0 be the computer, which is D95", () => {
    // The person may sit anywhere the count puts a seat. In a two-player match that means the bot can
    // have red and move first, and the player takes green.
    const lineup = createLineup();
    lineup.begin(2);
    lineup.setController(0, "bot");

    expect(lineup.snapshot().bots).toEqual([0]);
  });

  it("refuses to turn the last person into a bot, and changes nothing when it does (FR-01)", () => {
    const lineup = createLineup();
    lineup.begin(3);
    lineup.setController(1, "bot");
    lineup.setController(2, "bot");

    expect(lineup.snapshot().bots).toEqual([1, 2]);

    lineup.setController(0, "bot");
    expect(lineup.snapshot().bots).toEqual([1, 2]);
  });

  it("forgets the previous line-up completely when a new count is chosen", () => {
    // The player goes back to the count screen and picks a smaller number. Three bots must not follow
    // them into a two-seat match, where two of those seats do not exist.
    const lineup = createLineup();
    lineup.begin(4);
    lineup.setController(1, "bot");
    lineup.setController(2, "bot");
    lineup.setController(3, "bot");

    lineup.begin(2);

    expect(lineup.snapshot()).toEqual({ playerCount: 2, seats: [0, 2], bots: [] });
  });

  it("hands out copies, so a caller holding a snapshot cannot change the line-up", () => {
    const lineup = createLineup();
    lineup.begin(4);

    const snapshot = lineup.snapshot();
    snapshot.bots.push(2);
    snapshot.seats.length = 0;

    expect(lineup.snapshot()).toEqual({ playerCount: 4, seats: [0, 1, 2, 3], bots: [] });
  });
});
