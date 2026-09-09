/**
 * The roll's own moment, and the account of a roll that cards changed. Design spec 11, D70 to D74.
 *
 * FR-33 ("rolling produces visible feedback") and the explanation half of NFR-08. Both were half met
 * before this: the number appeared, in the same painted frame as the kept card's lift and the two unkept
 * cards flying back to the pool, and a roll that three cards had a hand in was an unexplained number.
 *
 * ## Why this spec runs at real speed and no other one does
 *
 * `?fast=1` sets `roll: 0`, which every other spec in the suite relies on: 900 ms times the roughly 250
 * rolls in a full run is minutes of wall clock for a frame nobody is watching. D74.2 confirmed that
 * skipping the hold entirely is acceptable, because nothing in the game state depends on it. **So this is
 * the one spec that pays for the timing**, and it opens with `fast: false` for that reason.
 *
 * ## What it asserts and what it cannot
 *
 * It asserts the **contract**: the attribute is on the row while the roll runs, it is gone before the
 * next hand is dealt, the badge holds the result from the start of the roll rather than the end, and the
 * strip speaks exactly when cards changed the roll. It does not assert that the card looks good tipping
 * over, which is what `handoff-11/mockup/Roll.dc.html` was for and what a person had to look at.
 */

import { expect, test } from "@playwright/test";

import {
  SEEDS,
  boardState,
  carryOn,
  chooseDiceCard,
  diceHand,
  openMatch,
  playTurn,
} from "./helpers.js";

/** The message strip, beside the board rather than inside it, like the hands. */
function strip(board) {
  return board.page().locator(".message-strip");
}

/** The badge on the card the player kept. D32 put it there and D71 leaves it there. */
function badge(board) {
  return diceHand(board).locator('.card[data-selected="true"] .card__result');
}

/**
 * Open a match, keep a dice card and get past the action phase, so the roll is the next thing to happen.
 *
 * `fast` is passed through, because two of the cases below need the real 900 ms and two of them would
 * rather not wait for it.
 */
async function openAndRoll(page, options) {
  const board = await openMatch(page, SEEDS.leavesStartAtOnce, options);

  await chooseDiceCard(board);
  await carryOn(board);

  return board;
}

test.describe("the roll has a moment of its own (D70)", () => {
  /**
   * The attribute, caught while it is still set. This is the case that would have been impossible to
   * write before D70: with the roll and everything after it in one synchronous pass there was no instant
   * at which a test could look, which is exactly the defect the Product Owner reported as "boring".
   */
  test("marks the dice hand while the throw runs", async ({ page }) => {
    test.slow();

    const board = await openAndRoll(page, { fast: false });

    await expect(diceHand(board)).toHaveAttribute("data-rolling", "true");
    await expect(board).toHaveAttribute("data-phase", "act");
  });

  /**
   * **The number is in the badge from the start of the throw and not at the end**, which is the whole of
   * D72 and the reason `card-state.css` needed no change. The badge is hidden by `:empty`, and an element
   * with `display: none` has no start state to animate from, so filling it early is what gives the
   * keyframe something to reveal.
   *
   * The assertion is deliberately on the text and not on visibility: for the first 520 ms the badge is
   * present at zero opacity, so a visibility check here would be asserting the opposite of the feature.
   */
  test("holds the result in the badge from the first frame of the throw", async ({ page }) => {
    test.slow();

    const board = await openAndRoll(page, { fast: false });
    const { roll } = await boardState(board);

    await expect(diceHand(board)).toHaveAttribute("data-rolling", "true");
    await expect(badge(board)).toHaveText(String(roll));
  });

  /**
   * The one ordering that would be a real bug rather than a cosmetic one. `hand.css` animates the deal
   * off `data-dealing`, and if `data-rolling` were still set when the next turn deals, `roll.css` would
   * restart the throw on a card that is arriving and two stylesheets would animate one element for
   * different reasons.
   */
  test("takes the mark off before the next hand is dealt", async ({ page }) => {
    const board = await openAndRoll(page, {});

    await playTurn(board);

    await expect(board).toHaveAttribute("data-phase", "choose");
    await expect(diceHand(board)).not.toHaveAttribute("data-rolling", "true");
  });
});

/**
 * The second door the roll comes through, and the regression test for the bug it caused.
 *
 * `handleRollDie` does not always roll. When an opponent holds Critical Failure, Devil Die or Hold Pawn
 * it opens the on-roll window instead and rolls nothing, and `resumeAfterWindow` is what rolls once the
 * window shuts, dispatched as `close-window` out of `card-controls.js`. The loop's `roll` branch is never
 * re-entered on that path.
 *
 * The first version of this feature hung the hold off that branch. The consequence was not a missing
 * animation: `roll.css` puts `pointer-events: none` on a rolling row, and only the hold takes the
 * attribute off, so from the first turn an opponent held one of those three cards the dice hand was
 * permanently unclickable. It surfaced as three unrelated specs timing out on a click, four minutes into
 * a 77-turn match, which is the worst possible place to find it.
 */
test.describe("a roll a card was allowed to answer (the on-roll window)", () => {
  test("leaves the dice hand clickable on every turn after the window opened", async ({ page }) => {
    test.slow();

    // Four copies, because `?stack=` replaces the pool and the draw is random among eligible cards, so
    // copies are what make it certain rather than likely. Same reasoning as `traps.spec.js`. Two players
    // means seat 0 draws on turn 1 and seat 2 on turn 2, so from turn 2 there is always an opponent
    // holding a Reaction that answers the roll, and every roll from then on takes the second door.
    const board = await openMatch(page, SEEDS.advancesEarly, {
      fast: true,
      stack: [
        "reaction-devil-die",
        "reaction-devil-die",
        "reaction-devil-die",
        "reaction-devil-die",
      ],
    });

    for (let turn = 0; turn < 6; turn += 1) {
      // The click itself is the assertion. With the attribute stuck this times out, because the plate
      // behind the row swallows the pointer event.
      await playTurn(board);
      await expect(diceHand(board)).not.toHaveAttribute("data-rolling", "true");
    }
  });
});

test.describe("a roll that cards changed explains itself (D73, NFR-08)", () => {
  /**
   * **The silence is the assertion.** One step is `base`, which is almost every roll, and D73.3 says the
   * strip says nothing at all about it: "D8: 5" beside a badge reading 5 would teach the player to stop
   * reading the strip. That makes the strip speaking itself the signal, so this case is what gives the
   * next one its meaning.
   */
  test("says nothing about an ordinary roll", async ({ page }) => {
    const board = await openAndRoll(page, {});

    await expect(board).toHaveAttribute("data-phase", "act");
    await expect(strip(board)).not.toHaveAttribute("data-message-kind", /.*/);
  });

  /**
   * The case NFR-08 had been failing since the trap epic. An Angel Die adds a D8, so the chain is `base`
   * plus `add-die` and the number on the card is one no die in the game can produce on its own.
   *
   * **Two copies of the same card, and that is not laziness.** `?stack=` replaces the pool rather than
   * prepending to it and the draw picks a random eligible card, so a stack of two different ids makes the
   * first draw a coin flip while two copies of one id make it certain. Same reasoning as `traps.spec.js`.
   *
   * Angel Die takes no target, which is why it is the card used here: clicking it plays it, with no
   * picker to drive and no field to point at.
   */
  test("lists every step of a roll an Action card changed", async ({ page }) => {
    const board = await openMatch(page, SEEDS.leavesStartAtOnce, {
      fast: true,
      stack: ["action-angel-die", "action-angel-die"],
    });

    await chooseDiceCard(board);
    await board
      .page()
      .locator('.hand--skill .card[data-card-id="action-angel-die"]')
      .first()
      .click();
    await carryOn(board);

    await expect(board).toHaveAttribute("data-phase", "act");
    await expect(strip(board)).toHaveAttribute("data-message-kind", "roll");

    // One <li> per step, in chain order. The base roll and the die the card added.
    const steps = strip(board).locator(".message-strip__step");
    await expect(steps).toHaveCount(2);
    await expect(steps.nth(0)).toHaveAttribute("data-roll-step", "base");
    await expect(steps.nth(1)).toHaveAttribute("data-roll-step", "add-die");

    // The sentence is real text out of `ui.json` and not a key that failed to resolve, which is how a
    // missing locale entry shows up on screen. `roll.step.missed` shipped that way for two sprints.
    await expect(steps.nth(1)).not.toContainText("roll.step");
  });

  /**
   * D40's rule, and the reason `move-hints.js` checks the match status as well as the phase: the overlay
   * says "you won" and the strip says nothing. A won match can be sitting in `act` with a chain still in
   * the state, so without that check the win screen would open over a strip explaining the winning roll.
   * `win.spec.js` asserts the same thing from the other direction.
   */
  test("clears the account when the turn moves on", async ({ page }) => {
    const board = await openAndRoll(page, {});

    await playTurn(board);

    await expect(strip(board)).not.toHaveAttribute("data-message-kind", "roll");
  });
});

/**
 * The two durations, in milliseconds, read off the board the way the view reads them.
 *
 * **In milliseconds and not as the raw string**, which cost one red test to learn: the production build
 * minifies `520ms` to `.52s` and `900ms` to `.9s`, so a spec that compares the text passes against the
 * dev server and fails against `npm run preview`, which is what the suite actually runs. `motionMs` in
 * `board-view.js` does the same conversion for the same reason.
 */
async function rollTokens(board) {
  return board.evaluate((element) => {
    const style = window.getComputedStyle(element);
    const ms = (token) => {
      const raw = style.getPropertyValue(token).trim();
      const value = Number.parseFloat(raw);
      return raw.endsWith("ms") ? value : value * 1000;
    };

    return { roll: ms("--motion-roll"), hold: ms("--motion-roll-hold") };
  });
}

test.describe("with less motion asked for (D70.3, D74.1)", () => {
  /**
   * `page.emulateMedia` and not `test.use({ reducedMotion })`, and that is not a preference.
   * The projects in `playwright.config.js` spread a viewport into their own `use` block, and the
   * file-level option did not survive it: `matchMedia("(prefers-reduced-motion: reduce)")` still read
   * false inside the test, so both cases below passed for the wrong reason. Emulating on the page is
   * the call that cannot be overridden by a project, and it survives the navigation `openMatch` does.
   */
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  /**
   * **The throw goes and the hold stays**, which is the third token in the project to sit outside
   * `tokens.css`'s `prefers-reduced-motion` block, after `--motion-refusal-hold` and
   * `--motion-trap-hold`. A hold is time and not movement: a player who asked for less motion did not
   * ask for less time to read, and with the wind up gone they have less warning that a number is coming
   * rather than more.
   *
   * So the assertion is that the roll still **happens as an event** with the attribute set and the number
   * present, and not that it is instant. `--motion-roll` collapsing to 1 ms is what makes it instant, and
   * that is a computed style rather than a behaviour, which is the next case.
   */
  test("still gives the roll its hold", async ({ page }) => {
    test.slow();

    const board = await openAndRoll(page, { fast: false });
    const { roll } = await boardState(board);

    await expect(diceHand(board)).toHaveAttribute("data-rolling", "true");
    await expect(badge(board)).toHaveText(String(roll));
  });

  /**
   * The movement itself, read off the token rather than watched. There is no media query in `roll.css` or
   * `message-strip.css`: the one block in this delivery is the one that already existed in `tokens.css`,
   * so everything derived from `--motion-roll` collapses with it, including the strip's delay.
   */
  test("collapses the throw to nothing and leaves the hold alone", async ({ page }) => {
    const board = await openAndRoll(page, {});
    const reduced = await rollTokens(board);

    expect(reduced.roll).toBe(1);
    expect(reduced.hold).toBe(900);
  });
});

/**
 * The other half of the case above. Asserting that the throw is 1 ms under reduced motion only means
 * something if it is not 1 ms otherwise, and a media query that never matched would pass both.
 */
test.describe("with motion allowed", () => {
  test("keeps the throw and the hold at their full length", async ({ page }) => {
    const board = await openAndRoll(page, {});
    const full = await rollTokens(board);

    expect(full.roll).toBe(520);
    expect(full.hold).toBe(900);
  });
});
