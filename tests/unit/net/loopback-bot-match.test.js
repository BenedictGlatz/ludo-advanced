/**
 * A bot on the host plays its seat over the wire. Issue #101, FR-43 online.
 *
 * The argument the whole feature rests on is that a bot online is **nothing new to the network**: the host
 * runs the ordinary loop, `bot-driver.js` asks `decide`, and the guest learns who the bot is from the
 * state that arrives anyway. So this asks the same question `loopback-match.test.js` does, with a third
 * seat that belongs to nobody: does the match finish, is the guest's board the host's after every echo,
 * and does the guard still keep the guest off the bot's turn?
 *
 * Here the bot is a **real** one, in `state.bots`, driven with `decide` on the plain state, exactly as the
 * driver does on the host; `wants` is used only for the two persons.
 */

import { describe, expect, it } from "vitest";

import { decide } from "../../../src/ai/bot-policy.js";
import { MATCH_STATUS } from "../../../src/state/game-state.js";
import {
  MATCH_TIMEOUT_MS,
  onlineTable,
  playHostTurn,
  settle,
  wants,
} from "../../helpers/loopback-table.js";

const HOST = 0;
const BOT = 1;
const GUEST = 2;

describe("a bot on the host plays its seat over the wire (issue #101)", () => {
  it(
    "finishes a three-seat match with the host on seat 0, a bot on seat 1 and a guest on seat 2",
    async () => {
      const table = onlineTable(13, { players: 3, bots: [BOT] });
      const { loop, guest } = table;
      let botMoves = 0;
      let steps = 0;

      await settle();
      loop.run();
      await settle();

      // The guest learns who the bot is from the state itself; `hello` carries no such field.
      expect(table.mirror().bots).toEqual([BOT]);

      while (loop.getState().status === MATCH_STATUS.RUNNING) {
        steps += 1;
        expect(steps, "the match with a bot on the host did not finish").toBeLessThan(30000);

        const state = loop.getState();
        const botIntent = decide(state);
        const guestIntent = wants(state, GUEST);

        if (botIntent !== null) {
          // What `bot-driver.js` does on the host, with the pause taken out.
          botMoves += 1;
          expect(loop.submit(botIntent), botIntent.type).toBe(true);
        } else if (guestIntent !== null) {
          expect(guest.apply(guestIntent), guestIntent.type).toBe(true);
        } else {
          const hostIntent = wants(state, HOST);
          if (hostIntent === null)
            throw new Error(`nobody knows how to leave phase ${state.phase}`);
          expect(loop.submit(hostIntent), hostIntent.type).toBe(true);
        }

        await settle();
        expect(table.mirror()).toEqual(loop.getState());
      }

      expect(botMoves).toBeGreaterThan(0);
      expect(loop.getState().status).toBe(MATCH_STATUS.WON);
      expect(table.mirror().winner).toBe(loop.getState().winner);
      expect(table.refused).toEqual([]);
    },
    MATCH_TIMEOUT_MS
  );

  it("refuses a guest's move on the bot's turn, and leaves the host's state alone", async () => {
    const table = onlineTable(13, { players: 3, bots: [BOT] });
    const { loop, guest } = table;

    await settle();
    loop.run();
    playHostTurn(loop, HOST);
    await settle();

    const before = loop.getState();
    expect(before.activePlayer).toBe(BOT);

    // The guest tries to play the bot's turn with what the bot itself would play.
    expect(guest.apply(decide(before))).toBe(true);
    await settle();

    expect(table.refused).toEqual(["intent.rejected.not-your-turn"]);
    expect(loop.getState()).toBe(before);
  });
});
