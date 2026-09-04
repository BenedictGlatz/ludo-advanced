/**
 * What the marks handoff 07 delivered actually draw. Issue #45, design spec 07, screen S3.
 *
 * ## Why this is a third trap spec and not more cases in the other two
 *
 * `traps.spec.js` covers **laying** an object, `trap-fires.spec.js` covers one **going off**, and both
 * are about what the game decided. This one is about how the decision was drawn, which is a different
 * subject and a different kind of assertion: these read computed style rather than attributes.
 *
 * The two are worth keeping apart, because an attribute check and a paint check fail for different
 * reasons. An attribute says the rules layer got it right; a computed value says the stylesheet did.
 * When both are in one case a red test does not say which half broke.
 *
 * ## Two rules every case here follows
 *
 * **Compare, never name a value.** A case that asserted `rgb(255, 93, 93)` would have to be rewritten
 * the day the palette moves, and the palette is the design's to move. So a mark is compared against
 * another mark, against a field with nothing on it, or against a token read off `:root`, which asserts
 * the *choice* of token and not its value. `greyscale.spec.js` set that pattern.
 *
 * **Poll anything measured.** Every mark in this delivery transitions in, so a single measurement taken
 * right after a click reads the start of the transition rather than the finished box. `chipRatio` in
 * `trap-helpers.js` carries the full argument; it cost real time once.
 */

import { expect, test } from "@playwright/test";

import { SEEDS, chooseDiceCard, openMatch } from "./helpers.js";
import {
  pawnStatuses,
  playCardAndAwaitSquare,
  playUntilTrapFires,
  square,
} from "./trap-helpers.js";

const withStack = (stack) => ({ fast: true, stack });

/** A token's computed value off `:root`, so a case can assert which one was used. */
function token(page, name) {
  return page.evaluate(
    (property) =>
      window.getComputedStyle(document.documentElement).getPropertyValue(property).trim(),
    name
  );
}

/** Every pawn's computed transform, keyed by `player.pawn`. */
function pawnTransforms(board) {
  return board
    .locator(".pawn")
    .evaluateAll((pawns) =>
      Object.fromEntries(
        pawns.map((pawn) => [
          `${pawn.getAttribute("data-player")}.${pawn.getAttribute("data-pawn")}`,
          window.getComputedStyle(pawn).transform,
        ])
      )
    );
}

/**
 * Is this pawn's transform rotated?
 *
 * Every pawn already carries a translate and a scale, so the sixteen transforms are all different and
 * cannot be compared as a set. What the tilt promises is narrower: no other piece shares this one's
 * **rotation**. A `matrix(a, b, c, d, e, f)` that has only been translated and scaled has `b` at zero
 * and `a` equal to `d`, whatever the translation and the scale are, so the two shear terms answer it
 * without the test knowing the angle. The angle stays the design's to change.
 */
function tipped(transforms, id) {
  const [a, b, , d] = transforms[id]?.match(/-?[\d.]+/g)?.map(Number) ?? [1, 0, 0, 1];

  return Math.abs(b) > 0.001 || Math.abs(a - d) > 0.001;
}

/** Every pawn's status tag opacity, keyed by `player.pawn`. */
function tagOpacity(board) {
  return board
    .locator(".pawn")
    .evaluateAll((pawns) =>
      Object.fromEntries(
        pawns.map((pawn) => [
          `${pawn.getAttribute("data-player")}.${pawn.getAttribute("data-pawn")}`,
          Number(window.getComputedStyle(pawn.querySelector(".pawn__status")).opacity),
        ])
      )
    );
}

test.describe("the protected zone (D58)", () => {
  /**
   * The aura is the one mark that is not about the field it is drawn on: it says an offensive card aimed
   * here will do nothing. A player who cannot see it cannot avoid spending a card inside it, which is the
   * whole point of the card that made it, so "is it drawn at all" is the assertion worth having.
   *
   * `background-image` is the layer D58 chose because nothing else on `.square` uses it. That is what
   * makes the hatch safe on an entry square, on a legal target and under everything else a field can be,
   * with no override, and it is why the check is on that property rather than on a background colour.
   */
  test("hatches the fields an It's Not That Deep reaches, and only those", async ({ page }) => {
    const board = await openMatch(
      page,
      SEEDS.leavesStartAtOnce,
      withStack(["action-not-that-deep"])
    );

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-not-that-deep");
    await square(board, 17).click();

    await expect(square(board, 17)).toHaveAttribute("data-trap-kind", "not-that-deep");

    // Radius 3 in either direction round the ring, so 14 to 20 inclusive, and the trap's own field is
    // one of the seven. 21 is the first field outside it and is the control: without a field that is
    // *not* hatched, a stylesheet that tinted all forty would pass.
    const painted = async (index) =>
      square(board, index)
        .locator("xpath=.")
        .evaluate((field) => window.getComputedStyle(field).backgroundImage);

    await expect.poll(() => painted(17)).not.toBe("none");

    for (const index of [14, 16, 18, 20]) {
      expect(await painted(index), `field ${index} is inside the aura`).not.toBe("none");
    }

    for (const index of [21, 13, 30]) {
      expect(await painted(index), `field ${index} is outside the aura`).toBe("none");
    }
  });
});

test.describe("the announcement's second voice (D55)", () => {
  /**
   * **The case that closes a deviation this project carried for a day and wrote down twice.**
   *
   * The announcement shipped in `--color-warn`, the colour the game reserves for "you cannot do that",
   * because the refusal strip was the only message region that existed and inventing a second treatment
   * was not this side's decision to take. A trap going off is not a refusal: the player did nothing
   * wrong. D55 answered it with two declarations on the `data-message-kind` seam.
   *
   * Asserted against the two tokens rather than against two colours, so the case says which decision was
   * taken and stays true if the palette moves. `--color-warn-soft` is the one it must **not** be, and
   * that is the assertion that would have failed before handoff 07 landed.
   */
  test("says a trap in the panel colour and not in the refusal orange", async ({ page }) => {
    test.slow();

    const board = await openMatch(page, SEEDS.capturesEarly, withStack(["action-banana-peel"]));

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-banana-peel");
    await square(board, 23).click();

    const announced = await playUntilTrapFires(board);
    test.skip(announced === null, "the match ended before a pawn reached the trap");

    const strip = page.locator(".message-strip");
    await expect(strip).toHaveAttribute("data-message-kind", "trap");

    // **The kind and the colour are read in one pass**, and this is the second draft. Reading them in
    // two round trips failed once in a full three-browser run: the announcement is on screen for
    // `--motion-trap-hold`, and under twelve workers the turn can move on between the assertion above
    // and the read below, which finds the strip already saying the next thing in the default colour.
    // Same lesson as `bot-helpers.js`'s `snapshot`: what is asserted together has to be read together.
    const shown = await strip.evaluate((element) => ({
      kind: element.getAttribute("data-message-kind"),
      ground: window.getComputedStyle(element).backgroundColor,
    }));

    expect(shown.kind).toBe("trap");
    const ground = shown.ground;
    const warn = await token(page, "--color-warn-soft");
    const panel = await token(page, "--color-panel");

    // Both tokens are hex in `tokens.css` and computed style is `rgb()`, so the comparison goes through
    // one channel each. Anything more would be reimplementing a colour parser inside a test.
    const channels = (value) => value.match(/\d+/g)?.map(Number) ?? [];
    const hex = (value) => [1, 3, 5].map((at) => Number.parseInt(value.slice(at, at + 2), 16));

    expect(channels(ground)).toEqual(hex(panel));
    expect(channels(ground)).not.toEqual(hex(warn));
  });
});

test.describe("a pawn's condition (D56, D57)", () => {
  /**
   * A stunned pawn tips nine degrees, and the tilt is the whole answer to the hardest case in the
   * handoff: a Banana Peel does not move the pawn, so the piece the player was just moving arrives
   * exactly where they aimed it and silently loses a turn. A mark on that piece is the one of the three
   * signals they are certainly looking at.
   *
   * Asserted as **different from every other pawn's transform** rather than as a rotation of minus nine
   * degrees. The angle is the design's to change and a matrix is what computed style returns; what the
   * decision actually promises is that this is the only piece on the board not standing upright.
   */
  test("tips the stunned pawn and leaves every other piece upright", async ({ page }) => {
    test.slow();

    const board = await openMatch(page, SEEDS.capturesEarly, withStack(["action-banana-peel"]));

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-banana-peel");
    await square(board, 23).click();

    const announced = await playUntilTrapFires(board);
    test.skip(announced === null, "the match ended before a pawn reached the trap");

    const stunned = Object.entries(await pawnStatuses(board))
      .filter(([, kinds]) => kinds.includes("stunned"))
      .map(([id]) => id);

    expect(stunned).toHaveLength(1);

    // **Polled, because the tilt arrives through the pawn's own `transform` transition.** The rotation
    // runs from 0 to minus nine degrees over `--motion-move`, so a matrix read the instant the status
    // appears is still upright. That is the same trap `chipRatio` documents, reached from a different
    // property.
    await expect.poll(async () => tipped(await pawnTransforms(board), stunned[0])).toBe(true);

    const transforms = await pawnTransforms(board);

    for (const id of Object.keys(transforms)) {
      if (id === stunned[0]) continue;
      expect(tipped(transforms, id), `pawn ${id} is upright`).toBe(false);
    }
  });

  /**
   * The slippery tag is a note about the piece rather than a change to it: the status lasts one turn and
   * its only consequence has already happened by the time the player reads the mark, which is that the
   * field the pawn stopped on handed out no card.
   *
   * **Opacity and not a box, and the first version of this case got that wrong.** `.pawn__status` is on
   * every pawn from the moment the board is built, which is D10's contract, and it is hidden by
   * `opacity: 0` and `scale: 0.4` rather than by `display: none`, because a hidden element with no box
   * has no previous state to transition from. So an untagged pawn's span still measures about 15 per
   * cent of the piece, and the zero-versus-non-zero measurement the trap chip's case uses reports every
   * pawn as tagged. Opacity is what the rule actually changes, so opacity is what to read.
   */
  test("puts a tag on a slippery pawn and on no other", async ({ page }) => {
    test.slow();

    const board = await openMatch(page, SEEDS.capturesEarly, withStack(["action-oil-spill"]));

    await chooseDiceCard(board);
    await playCardAndAwaitSquare(board, "action-oil-spill");
    await square(board, 23).click();

    const announced = await playUntilTrapFires(board);
    test.skip(announced === null, "the match ended before a pawn reached the trap");

    const slippery = Object.entries(await pawnStatuses(board))
      .filter(([, kinds]) => kinds.includes("slippery"))
      .map(([id]) => id);

    test.skip(slippery.length === 0, "the status had already expired when the board was read");

    // Polled, because the tag fades in over `--motion-feedback`.
    await expect.poll(async () => (await tagOpacity(board))[slippery[0]]).toBe(1);

    const tags = await tagOpacity(board);

    for (const [id, opacity] of Object.entries(tags)) {
      if (slippery.includes(id)) continue;
      expect(opacity, `pawn ${id} wears no tag`).toBe(0);
    }
  });
});
