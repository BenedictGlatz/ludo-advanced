/**
 * The four pairs of pixels a cast is told about. Design spec 18, § 5.
 *
 * `ui/` only, and the whole file is one idea: **measure the element, do not compute the cell.**
 *
 * | Written on `.cast` | What it is |
 * | --- | --- |
 * | `--cast-from-x/y` | where the card came from: the actor's hand plate, or their HUD seat |
 * | `--cast-stage-x/y` | the centre of `.board`, where the card stands |
 * | `--cast-to-x/y` | the centre of the field or pawn the effect lands on |
 * | `--cast-rest-x/y` | the centre of `.last-card`, where the card leaves for |
 *
 * All four are in px relative to `.app`, which is the containing block `app.css` was amended to
 * provide. A pair that cannot be measured is **left off**, and `cast.css` falls back to the stage for
 * every one of them, so a missing plate shrinks the card in place rather than throwing it to 0,0.
 *
 * ## Why the DOM and not `board-geometry.js`
 *
 * The plan proposed `cellCentre` and `pawnCentre`, which are the functions the drag already uses. They
 * answer in **cell units from the board's top left**, so using them here would mean multiplying by a
 * cell size read back off the stylesheet and adding the board's own offset: three numbers to get
 * right, each of which can disagree with where the piece is actually drawn. Every square and every
 * pawn is already in the DOM at all times (`board-view.js` builds all 40 fields and all 16 pieces from
 * the start), so `getBoundingClientRect()` answers the same question directly and cannot be out of
 * step with the screen. It is also right below the breakpoint, where the board is a different size.
 *
 * The cost is that this file only works in a browser, which is why the cast's end-to-end coverage is
 * Playwright's and not Vitest's.
 */

/** The centre of one element in px relative to `.app`, or `null` when it is not on the page. */
function centreIn($app, $element) {
  if ($app.length === 0 || $element === null || $element.length === 0) return null;

  const app = $app[0].getBoundingClientRect();
  const box = $element[0].getBoundingClientRect();

  if (box.width === 0 && box.height === 0) return null;

  return {
    x: box.left - app.left + box.width / 2,
    y: box.top - app.top + box.height / 2,
  };
}

/**
 * Where the card comes from. D114 and D115's one rule, and it is about geometry rather than about who
 * is playing.
 *
 * The actor's hand if it is the hand on screen, and the actor's HUD plate if it is not. A bot has no
 * hand on screen, and neither does a hot-seat player answering somebody else's card, so without the
 * second half a card would come from wherever the previous player's hand happened to be.
 *
 * **The plate and not the slot.** The spec asks for the slot the card left, and by the time a cast
 * runs the card has already gone from the hand and the slot has re-flowed, so the slot cannot be
 * identified any more without threading a click's presentation state through the loop. The hand plate
 * is a few centimetres out and is a place the player can point at, which is what D114 asked for.
 * Recorded as a known simplification rather than left to be noticed.
 */
function fromPoint($app, seat) {
  const $hand = $app.find(`.hand--skill[data-seat="${seat}"]`);
  if ($hand.length > 0) return centreIn($app, $hand);

  return centreIn($app, $app.find(`.hud__seat[data-player="${seat}"]`));
}

/** The element the effect lands on: a field, a pawn, or nothing at all. */
function targetElement($app, point) {
  if (point === null || point === undefined) return null;

  if (Number.isInteger(point.square)) {
    return $app.find(`.square--track[data-square="${point.square}"]`);
  }

  const ref = point.pawn;
  if (ref === undefined || ref === null) return null;

  return $app.find(`.pawn[data-player="${ref.player}"][data-pawn="${ref.pawn}"]`);
}

/**
 * Every pair the cast needs, as a plain object of custom property names to px strings.
 *
 * Returned rather than written, so the one place that touches the DOM's style attribute is
 * `cast-view.js` and this file stays a pure measurement. Pairs that could not be measured are simply
 * absent from the object, and the caller removes them.
 */
export function castGeometry($app, { seat, point }) {
  const pairs = {
    "cast-from": fromPoint($app, seat),
    "cast-stage": centreIn($app, $app.find(".board")),
    "cast-to": centreIn($app, targetElement($app, point)),
    "cast-rest": centreIn($app, $app.find(".last-card")),
  };

  const style = {};
  for (const [name, centre] of Object.entries(pairs)) {
    if (centre === null) continue;

    style[`--${name}-x`] = `${Math.round(centre.x)}px`;
    style[`--${name}-y`] = `${Math.round(centre.y)}px`;
  }

  return style;
}

/** Every property this file can write, so `cast-view.js` can clear the lot without listing them twice. */
export const GEOMETRY_PROPERTIES = Object.freeze([
  "--cast-from-x",
  "--cast-from-y",
  "--cast-stage-x",
  "--cast-stage-y",
  "--cast-to-x",
  "--cast-to-y",
  "--cast-rest-x",
  "--cast-rest-y",
]);
