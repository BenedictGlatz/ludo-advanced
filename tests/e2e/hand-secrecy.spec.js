/**
 * A hand you are not holding. Decision D33, and the first real use of `data-face="down"`.
 *
 * D33 says an opponent's skill cards are secret and only the count is public. The count half was built
 * on 2026-09-01 and sits in the HUD. The secret half was **not**: `skill-hand-view.js` wrote
 * `data-face="up"` unconditionally, and two hands were on screen face up that nobody was allowed to see.
 *
 * - **A bot's, for the whole of its turn.** No curtain ever covered it, and correctly so: `handoverNeeded`
 *   says nobody is being handed anything when the next seat is a computer.
 * - **The answering player's, during a reaction window.** `seatOnShow` moves off the active player while
 *   a window is open, because eligible seats are asked in seat order at one shared screen. So the other
 *   person's five cards came up in front of the player whose turn it still was.
 *
 * ## Why this is its own spec file
 *
 * `card-reveal.spec.js` is about **reading a card you are holding** and asserts computed style.
 * `handover.spec.js` is about the moment between two turns. This one is about a card you are **not**
 * holding, it spans both of those subjects, and it fails for a reason neither of them would catch. Same
 * seam `card-reveal.spec.js` was split off `skill-hand.spec.js` on.
 *
 * ## Why neither case runs with `?fast=1`
 *
 * The bot case needs the bot's thinking pause, because with the pauses gone a bot's turn is over inside
 * one tick and there is nothing on screen long enough to assert against. The reaction case needs the
 * curtain, and `?fast=1` is the flag that passes every curtain without the button. Both are the same
 * affordance `handover.spec.js` and `reaction-prompt.spec.js` already use.
 */

import { expect, test } from "@playwright/test";

import { chooseAndCarryOn, chooseDiceCard, playOutMoves } from "./helpers.js";
import { playPersonTurn } from "./bot-helpers.js";

const skillHand = (page) => page.locator(".hand--skill");
const overlay = (page) => page.locator(".overlay");
const action = (page, name) => page.locator(`.overlay__button[data-action="${name}"]`);

/** Devil Die is a Reaction to a roll, so a stacked pool makes an on-roll window certain (FR-24). */
const DEVIL_DICE = Array(4).fill("reaction-devil-die").join(",");

test.describe("a bot's hand", () => {
  test("lies face down for the whole of the bot's turn, and the count stays public", async ({
    page,
  }) => {
    test.slow();

    await page.goto("/?seed=1&players=2&bots=1");
    const board = page.locator(".board");
    await expect(board).toHaveAttribute("data-players", "2");

    const hand = skillHand(page);

    // The person's own hand first, so the case is a change and not the way the hand always looked.
    await expect(hand).toHaveAttribute("data-face", "up");
    await expect(hand).toHaveAttribute("data-seat", "0");

    await playPersonTurn(page, board);

    // The bot's turn. No curtain covers it and none should: nobody is being handed anything.
    await expect(hand).toHaveAttribute("data-seat", "2", { timeout: 20_000 });
    await expect(hand).toHaveAttribute("data-face", "down");

    // Not just the attribute. `card-state.css` hides every real child of the card, so the title is the
    // thing that has to be gone, exactly as `card-reveal.spec.js` asserts it has to be there.
    const card = hand.locator(".card[data-card-id]").first();
    await expect(card.locator(".card__title")).not.toBeVisible();

    // And it is not offered as something to do either. `card-controls.js` refuses the click anyway, so
    // a pointer cursor and a tab stop would be a gesture the game then takes back.
    await expect(card).toHaveAttribute("data-playable", "false");
    await expect(card).toHaveAttribute("tabindex", "-1");

    // And the plate stays dormant rather than lifting as though it were asking this player something.
    // D65's meaning of `data-active` is unchanged: a hand nobody at the screen may play from has
    // nothing playable in it, so the attribute and the five refused cards agree with each other.
    await expect(hand).toHaveAttribute("data-active", "false");

    // The count is the half of D33 that stays public, in both places it is written.
    const held = Number(await hand.getAttribute("data-count"));
    expect(held).toBeGreaterThan(0);
    await expect(
      page.locator('.hud__seat[data-player="2"] .hud__count[data-kind="cards"] .hud__value')
    ).toHaveText(String(held));
  });
});

test.describe("a reaction window at one shared screen", () => {
  /**
   * Two people, no computer. Seat 0 draws a Devil Die on turn 1 and seat 2 draws one on turn 2, so the
   * roll seat 2 makes on its own turn opens a window that **seat 0** is being asked about. That is the
   * moment the screen has to change hands twice: over to seat 0 to answer, and back to seat 2 to carry
   * its turn on.
   */
  test("hands the screen over before it shows the other player their hand, and back again", async ({
    page,
  }) => {
    test.slow();

    await page.goto(`/?seed=1&players=2&stack=${DEVIL_DICE}`);
    const board = page.locator(".board");
    await expect(board).toHaveAttribute("data-players", "2");

    const hand = skillHand(page);

    // Turn 1 belongs to seat 0 and is played out in full, so that seat 2 draws a card of its own.
    await chooseAndCarryOn(board);
    await playOutMoves(board);

    await expect(overlay(page)).toHaveAttribute("data-screen", "handover", { timeout: 20_000 });
    await action(page, "ready").click();

    // Seat 2's own turn, and its own hand, face up: this is the viewer now.
    await expect(hand).toHaveAttribute("data-seat", "2", { timeout: 20_000 });
    await expect(hand).toHaveAttribute("data-face", "up");

    // Choosing a die rolls it, and the roll is what opens the window on seat 0.
    await chooseDiceCard(board);

    // **The curtain, mid-turn.** Before this change seat 0's five cards simply appeared, face up, in
    // front of seat 2. The turn has not ended, so the screen names seat 0 without passing anything.
    await expect(overlay(page)).toHaveAttribute("data-screen", "handover", { timeout: 20_000 });
    await expect(overlay(page)).toHaveAttribute("data-player", "0");

    // And the hand underneath it is already face down, so no painted frame of it leaks when the
    // curtain comes off. This is the ordering rule design spec 04 § 5 states, applied to a window.
    await expect(hand).toHaveAttribute("data-face", "down");

    await action(page, "ready").click();

    // Seat 0 has the device and may read what it holds.
    await expect(hand).toHaveAttribute("data-seat", "0");
    await expect(hand).toHaveAttribute("data-face", "up");
    await expect(hand.locator(".card[data-card-id] .card__title").first()).toBeVisible();

    // The window is genuinely open and genuinely seat 0's to answer.
    const prompt = page.locator(".prompt");
    await expect(prompt).toHaveAttribute("data-mode", "reaction");
    await prompt.locator('[data-prompt-action="decline"]').click();

    // **The curtain back.** Seat 2's turn carries on, and seat 2 is not looking at the screen yet.
    await expect(overlay(page)).toHaveAttribute("data-screen", "handover", { timeout: 20_000 });
    await expect(overlay(page)).toHaveAttribute("data-player", "2");

    await action(page, "ready").click();

    await expect(overlay(page)).toHaveAttribute("data-screen", "none");
    await expect(hand).toHaveAttribute("data-seat", "2");
    await expect(hand).toHaveAttribute("data-face", "up");
  });
});
