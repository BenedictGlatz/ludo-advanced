/**
 * Two browsers, one match. Issue #42, FR-42's acceptance criterion: "two browsers on different machines
 * play one match". Two `browser.newContext()` pages are two browsers as far as WebRTC is concerned: they
 * share nothing, and the data channel between them is a real one over the loopback interface.
 *
 * ## Chromium only, and why
 *
 * The two contexts connect over 127.0.0.1 with no STUN server, which Chromium does out of the box.
 * Firefox's and Edge's ICE behaviour under Playwright has not been checked, so the spec skips there and
 * the gap is recorded as outstanding in Chapter 08 rather than hidden behind a green run.
 *
 * ## What is asserted
 *
 * The exchange of the two codes through the lobby, both boards showing the same two players, the host
 * playing turn one with the ordinary turn helpers, the guest's board following, and then the guest's own
 * turn: its hand face up and its dice cards clickable, the host's board moving when it picks one.
 */

import { expect, test } from "@playwright/test";

import { boardState, chooseDiceCard, playTurn } from "./helpers.js";

test.describe("online multiplayer (FR-42)", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "chromium only, see the header");

  const overlay = (page) => page.locator(".overlay");
  const button = (page, action) => page.locator(`.overlay__button[data-action="${action}"]`);
  const field = (page, name) => page.locator(`textarea[data-field="${name}"]`);

  /** Open the menu with a fixed seed and go through the online door. */
  async function openOnline(page) {
    await page.goto("/?seed=1&fast=1");
    await expect(overlay(page)).toHaveAttribute("data-screen", "menu");
    await button(page, "online").click();
    await expect(overlay(page)).toHaveAttribute("data-screen", "online");
  }

  /** One position of one lobby row: the line-up's control, on the host's screen (issue #101). */
  const position = (page, seat, value) =>
    page.locator(
      `.overlay__button[data-action="controller"][data-seat="${seat}"][data-value="${value}"]`
    );

  /**
   * Host and guest swap their two codes through the lobby, as two people would through a chat. `bots`
   * are the seats the host hands to the computer before the guest joins (issue #101).
   */
  async function connect(host, guest, { count = 2, bots = [] } = {}) {
    await openOnline(host);
    await button(host, "host").click();
    await button(host, "host")
      .and(host.locator(`[data-count="${count}"]`))
      .click();
    for (const seat of bots) await position(host, seat, "bot").click();

    // Gathering candidates takes a moment, so the invite field gets a longer wait than the default.
    await expect(field(host, "invite")).toHaveValue(/.+/, { timeout: 10_000 });
    const invite = await field(host, "invite").inputValue();

    await openOnline(guest);
    await button(guest, "join").click();
    await field(guest, "invite").fill(invite);
    await button(guest, "connect").click();
    await expect(field(guest, "reply")).toHaveValue(/.+/, { timeout: 10_000 });
    const reply = await field(guest, "reply").inputValue();

    await field(host, "reply").fill(reply);
    await button(host, "connect").click();

    await expect(host.locator('.overlay__seat[data-status="connected"]')).toHaveCount(1, {
      timeout: 15_000,
    });
  }

  test("two contexts connect through the lobby and play the first two turns", async ({
    browser,
  }) => {
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const host = await hostContext.newPage();
    const guest = await guestContext.newPage();

    await connect(host, guest);
    await button(host, "start-online").click();

    const hostBoard = host.locator(".board");
    const guestBoard = guest.locator(".board");
    await expect(hostBoard).toHaveAttribute("data-players", "2");
    await expect(guestBoard).toHaveAttribute("data-players", "2", { timeout: 10_000 });
    await expect(guestBoard).toHaveAttribute("data-turn", "1");

    // On the host's turn the guest's dice cards are not clickable and its hand region is not its own.
    await expect(guest.locator('.hand--dice .card[data-playable="true"]')).toHaveCount(0);
    await expect(guest.locator(".hand--skill")).toHaveAttribute("data-face", "down");

    // Turn one: the host plays a whole turn with the ordinary helpers, and the guest follows.
    await playTurn(hostBoard);
    await expect
      .poll(async () => (await boardState(guestBoard)).turnNumber, { timeout: 15_000 })
      .toBe(2);
    expect((await boardState(guestBoard)).activePlayer).toBe(2);

    // Turn two: the guest's own. Its hand is face up, its dice cards are live, and the host follows.
    await expect(guest.locator(".hand--skill")).toHaveAttribute("data-face", "up");
    await expect(guest.locator('.hand--dice .card[data-playable="true"]')).toHaveCount(3);
    await expect(host.locator('.hand--dice .card[data-playable="true"]')).toHaveCount(0);

    await chooseDiceCard(guestBoard);
    await expect
      .poll(async () => (await boardState(hostBoard)).phase, { timeout: 15_000 })
      .not.toBe("choose");

    await hostContext.close();
    await guestContext.close();
  });

  test("a bot on the host fills a seat and plays its turn on both screens without a click", async ({
    browser,
  }) => {
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const host = await hostContext.newPage();
    const guest = await guestContext.newPage();

    // Three seats: the host, the computer on seat 1, and the guest on the seat left free, seat 2.
    await connect(host, guest, { count: 3, bots: [1] });
    await expect(host.locator('.overlay__seat[data-player="1"]')).toHaveAttribute(
      "data-controller",
      "bot"
    );
    await expect(host.locator('.overlay__seat[data-player="2"]')).toHaveAttribute(
      "data-status",
      "connected"
    );
    await button(host, "start-online").click();

    const hostBoard = host.locator(".board");
    const guestBoard = guest.locator(".board");
    await expect(hostBoard).toHaveAttribute("data-players", "3");
    await expect(guestBoard).toHaveAttribute("data-players", "3", { timeout: 10_000 });
    // The guest learns who the bot is from the state: its HUD names seat 1 a bot.
    await expect(guest.locator('.hud__seat[data-player="1"]')).toHaveAttribute(
      "data-controller",
      "bot"
    );

    // Turn one is the host's. Turn two is the bot's and passes on its own; turn three is the guest's.
    await playTurn(hostBoard);
    await expect
      .poll(async () => (await boardState(hostBoard)).turnNumber, { timeout: 30_000 })
      .toBe(3);
    expect((await boardState(hostBoard)).activePlayer).toBe(2);
    await expect
      .poll(async () => (await boardState(guestBoard)).turnNumber, { timeout: 15_000 })
      .toBe(3);
    await expect(guest.locator('.hand--dice .card[data-playable="true"]')).toHaveCount(3);

    await hostContext.close();
    await guestContext.close();
  });

  test("a host that quits ends the guest's match as abandoned", async ({ browser }) => {
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const host = await hostContext.newPage();
    const guest = await guestContext.newPage();

    await connect(host, guest);
    await button(host, "start-online").click();
    await expect(guest.locator(".board")).toHaveAttribute("data-players", "2", { timeout: 10_000 });

    await host.locator('[data-action="pause"]').click();
    await expect(overlay(guest)).toHaveAttribute("data-screen", "pause", { timeout: 10_000 });

    await button(host, "quit").click();
    await expect(overlay(guest)).toHaveAttribute("data-screen", "win", { timeout: 10_000 });
    await expect(overlay(guest)).toHaveAttribute("data-outcome", "abandoned");
    // Play Again is the host's button; the guest only gets the way back to the menu.
    await expect(button(guest, "restart")).toHaveCount(0);

    await hostContext.close();
    await guestContext.close();
  });
});
