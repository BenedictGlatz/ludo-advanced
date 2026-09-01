/**
 * What the dice card pool overview says. Issue #30, requirements FR-16 and FR-17.
 *
 * `ui/` only, and **pure**: it takes the two numbers it needs and returns a description. Same split as
 * `overlay-screens.js`, which is the file that calls `t()` while `overlay-view.js` renders whatever it
 * is handed. So the screen can be tested by asking what it says rather than by looking at the DOM.
 *
 * ## The gap this closes, and why it is a rules gap and not a cosmetic one
 *
 * Every turn the player is dealt three dice cards and keeps one (FR-18, FR-19). That is only a decision
 * because of what the pool holds: a D2 leaves the start area half the time and a D20 one time in twenty
 * (FR-09), so whether a hand of three is a good hand depends on the twenty cards behind it. Until this
 * screen there was no way to see those twenty. A player who has not read section 5.1 of the game design
 * document was choosing without the information the choice is made of.
 *
 * ## Why a screen and not a counter
 *
 * Pool and discard counters were considered for the HUD on 2026-09-01 and dropped, so that sixteen
 * numbers on screen do not become twenty-four (see the header of `hud-view.js`). That closed the route
 * of a number that is permanently there. It did not close this one: a screen the player opens costs no
 * space until it is asked for, and it can show the seven cards themselves rather than a number about
 * them.
 *
 * **Rejected: a prose rules screen.** S10 (FR-35, `should have`, no backlog issue) explains dice cards,
 * skill cards and the leaving-start rule in words. This shows one of the three instead of describing it,
 * which is both cheaper and, for a composition table, clearer. If S10 is ever built, this is the part of
 * it that already exists.
 *
 * ## What it deliberately does not show
 *
 * **Which three cards are on the hand right now.** The overview describes the pool, not the hand, and
 * the hand is on screen behind the overlay. Naming the cards on loan would make this a second view of
 * something already visible, and it would invite the player to read a face-down pool as a known one.
 */

import { POOL_COMPOSITION } from "../core/dice-pool.js";
import { t } from "../i18n/index.js";
import { diceCardDescription } from "./dice-card.js";
import { OVERLAY_ACTION, OVERLAY_SCREEN } from "./overlay-vocabulary.js";

/**
 * One card per denomination, in composition order, each carrying how many copies the pool holds.
 *
 * Built from `POOL_COMPOSITION` rather than from a list here, so FR-17 keeps its promise: reweighting
 * the pool is a change to that one table and this screen follows without being touched.
 *
 * The copy count is a **third tag** on top of the two every dice card carries. It is passed in rather
 * than built into `diceCardDescription`, because "4 mal im Pool" is a fact about the pool and not about
 * the card, and the same card in a hand must not claim it.
 */
function poolCards() {
  return POOL_COMPOSITION.map((entry) =>
    diceCardDescription(entry.faces, {
      tags: [t("card.dice.copies", { copies: entry.copies })],
    })
  );
}

/**
 * The overview, from the pool's own two numbers.
 *
 * `remaining` comes from `deps.diceSource.remaining()` and `total` from `POOL_SIZE`. **It says 17 of 20
 * almost every time it is opened**, because a turn draws three at the start and returns them at the end
 * (FR-18, FR-21), and the only moment the pool is whole is between `endTurn` and the next `drawHand`,
 * which the player cannot open this screen inside. That is deliberate reassurance that nothing has been
 * lost rather than a number that moves, and it is why the count is one quiet sentence and not a gauge.
 *
 * **The close button reuses `OVERLAY_ACTION.RESUME`** rather than introducing a verb of its own.
 * `match-flow.js` already answers RESUME with "close the overlay and resume the loop", which is exactly
 * what closing this screen means, and a second action name for the same behaviour would be two places to
 * keep in step.
 */
export function poolScreen({ remaining, total }) {
  return {
    screen: OVERLAY_SCREEN.POOL,
    title: t("pool.title"),
    text: t("pool.text", { remaining, total }),
    player: null,
    cards: poolCards(),
    buttons: [{ action: OVERLAY_ACTION.RESUME, label: t("pool.close"), variant: "primary" }],
  };
}
