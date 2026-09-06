/**
 * Who is in front of the screen, and when it has to change hands. 2026-09-06.
 *
 * ## Why a `ui/` module is unit tested at all
 *
 * `ui/` is covered by Playwright, on the argument in Ch. 08 that a coverage figure for jQuery rendering
 * measures nothing. `handover.js` is the second exception that argument allows for, after
 * `turn-controls.js`: it imports no jQuery, touches no DOM, and what it holds is a decision with four
 * branches in it.
 *
 * ## Why it is worth the file
 *
 * The rule it owns is a **secrecy** rule, and the failure mode is silent. A hand that is face up when it
 * should not be looks exactly like a hand that is correctly face up, and the only person who can see the
 * difference is the opponent sitting next to the screen. The two leaks this module was written for both
 * survived two sprints in a suite of a thousand tests, because nothing anywhere asked the question.
 *
 * The `?fast=1` case is the one that is easy to get wrong twice over: it has to take the **waiting**
 * away, so the end-to-end suite is not four hundred Ready clicks long, and it must not take the
 * **secrecy** away with it, or a bot's hand is face up in every run that actually asserts anything.
 */

import { describe, expect, it, vi } from "vitest";

import { createGameState } from "../../../src/state/game-state.js";
import { INTENT } from "../../../src/state/intents.js";
import { createHandover } from "../../../src/ui/handover.js";

/**
 * A handover over a four-seat match, plus the record of what it asked for.
 *
 * `apply` reports success, which is what the real loop's does, so a `passTurn` that stopped on a
 * refusal can be told from one that never dispatched.
 */
function handoverOver(bots = [], { skipHandover = false, curtain = true } = {}) {
  const state = createGameState(4, undefined, bots);
  const raised = [];
  const resume = vi.fn();
  const applied = [];

  const handover = createHandover({
    getState: () => state,
    apply: (intent) => {
      applied.push(intent);
      return true;
    },
    resume,
    onCurtain: curtain ? (seat) => raised.push(seat) : null,
    skipHandover,
  });

  return { handover, raised, resume, applied };
}

describe("who is holding the device", () => {
  it("starts on the first seat that has a person on it", () => {
    expect(handoverOver([]).handover.seat()).toBe(0);

    // D95 lets the line-up screen put the computer on seat 0, and the first thing on screen must not
    // be a bot's hand claimed as the viewer's own.
    expect(handoverOver([0, 1]).handover.seat()).toBe(2);
  });

  it("never hands the device to a bot, and never puts a curtain over one", () => {
    const { handover, raised } = handoverOver([2, 3]);

    expect(handover.handTo(2)).toBe(false);
    expect(raised).toEqual([]);

    // The person keeps the device while the computer plays, which is what makes the bot's hand not
    // the viewer's and therefore face down.
    expect(handover.seat()).toBe(0);
  });

  it("asks nobody to hand the screen to themselves", () => {
    const { handover, raised } = handoverOver([]);

    expect(handover.handTo(0)).toBe(false);
    expect(raised).toEqual([]);
    expect(handover.seat()).toBe(0);
  });

  it("puts a curtain up for a second person, and moves the viewer only on Ready", () => {
    const { handover, raised, resume } = handoverOver([]);

    expect(handover.handTo(2)).toBe(true);
    expect(raised).toEqual([2]);

    // Still the old viewer: the curtain is standing and nobody has said they took the device.
    expect(handover.seat()).toBe(0);

    handover.arrive();

    expect(handover.seat()).toBe(2);
    expect(resume).toHaveBeenCalledTimes(1);
  });

  it("passes the turn on a turn-end curtain and only carries on on a mid-turn one", () => {
    const ending = handoverOver([]);

    ending.handover.handTo(2, { endsTurn: true });
    ending.handover.arrive();

    expect(ending.applied).toEqual([{ type: INTENT.END_TURN }]);

    const midTurn = handoverOver([]);

    midTurn.handover.handTo(2);
    midTurn.handover.arrive();

    // A reaction window is not the end of anybody's turn, so nothing is dispatched at all.
    expect(midTurn.applied).toEqual([]);
    expect(midTurn.resume).toHaveBeenCalledTimes(1);
  });

  it("ignores Ready when no curtain is standing", () => {
    const { handover, resume, applied } = handoverOver([]);

    handover.arrive();

    expect(resume).not.toHaveBeenCalled();
    expect(applied).toEqual([]);
  });

  it("never asks a soloist playing three bots to hand anything over (FR-43)", () => {
    const { handover, raised } = handoverOver([1, 2, 3]);

    expect(handover.handTo(0, { endsTurn: true })).toBe(false);
    expect(raised).toEqual([]);
  });
});

describe("?fast=1 takes the waiting away and not the secrecy", () => {
  it("moves the viewer to a person at once, with no curtain", () => {
    const { handover, raised } = handoverOver([], { skipHandover: true });

    expect(handover.handTo(2)).toBe(false);
    expect(raised).toEqual([]);
    expect(handover.seat()).toBe(2);
  });

  it("still refuses to make a bot the viewer", () => {
    const { handover } = handoverOver([2, 3], { skipHandover: true });

    handover.handTo(2);

    expect(handover.seat()).toBe(0);
  });
});

describe("a loop nobody is watching for a handover", () => {
  it("passes the turn itself when no onCurtain was given", () => {
    const { handover, applied } = handoverOver([], { curtain: false });

    expect(handover.handTo(2, { endsTurn: true })).toBe(false);
    expect(applied).toEqual([{ type: INTENT.END_TURN }]);
  });
});
