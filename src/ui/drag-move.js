/**
 * Dragging a pawn to its target. Issue #91.
 *
 * `ui/` only: jQuery, pointer events, no rule. A drag is the same two-step move as two clicks, spelled
 * as one gesture: picking the pawn up **selects** it (its target lights), letting go on that target
 * **commits**, letting go anywhere else puts it back. Every decision is `turn-controls.js`'s; this file
 * only turns three pointer events into `onDragStarted` and `onDragEnded`.
 *
 * ## Why this is not in `events.js`
 *
 * `events.js` promises that each handler "does exactly one thing" and holds no state. A drag is one
 * gesture spread over `pointerdown`, `pointermove` and `pointerup`, with a little state carried between
 * them (which pawn, where it started, whether it has moved far enough to count). That state is the whole
 * file, so it gets a file.
 *
 * ## Four decisions worth reading
 *
 * - **A press is not a drag until the pointer has moved `DRAG_THRESHOLD_PX`.** Below that the press is a
 *   click and the click handler in `events.js` takes it, so the two-click move is untouched. Selecting on
 *   `pointerdown` was rejected: the click that follows would then have found the pawn already selected
 *   and committed the move, which turns two clicks into one for every pawn on the board.
 * - **After a real drag the `click` that the browser fires anyway is swallowed**, in the capture phase on
 *   the board, before jQuery's delegated handlers see it. Without that a drag dropped off-target would
 *   leave the pawn selected and the trailing click would commit it.
 * - **The drop target is found with `elementsFromPoint`, plural**, because the pawn under the pointer is
 *   the first thing at that point and the square is underneath it. `pointer-events: none` on the dragged
 *   pawn would have done the same and this project has learned what a stuck one of those costs.
 * - **Pointer capture keeps the gesture on the pawn** when the pointer leaves the board, and `pointercancel`
 *   (the browser taking the pointer for a scroll, a lost touch) ends it as a drop on nothing.
 *
 * The pawn follows the pointer through two custom properties, `--drag-dx` and `--drag-dy`, which
 * `pawn.css` applies as a `translate` on top of the positioning transform. `data-dragging` is the attribute
 * the stylesheet and the tests key on. Neither survives the drop: `turn-controls.js`'s `render()` puts the
 * pawn where the state says it is, and the properties are cleared here first so there is nothing to undo.
 */

import $ from "jquery";

import { targetOfElement } from "./move-targets.js";

/** How far the pointer has to travel before a press counts as a drag rather than a click. */
export const DRAG_THRESHOLD_PX = 6;

/** The lit target square under the point, as a target description, or `null`. */
function targetUnder(x, y) {
  for (const element of document.elementsFromPoint(x, y)) {
    const square = element.closest?.('.square[data-legal-target="true"]');
    if (square) return targetOfElement(square);
  }

  return null;
}

/** Take the drag styling off a pawn, so `render()` has nothing to fight. */
function release(element) {
  element.removeAttribute("data-dragging");
  element.style.removeProperty("--drag-dx");
  element.style.removeProperty("--drag-dy");
}

/**
 * Bind the drag gesture on the board.
 *
 * `handlers.onDragStarted(pawn)` is called once, when the press becomes a drag; `handlers.onDragEnded(pawn,
 * target)` once, with the target description or `null`.
 */
export function bindDragEvents($board, handlers) {
  let drag = null;
  let swallowNextClick = false;

  // Capture phase, so it runs before the delegated handlers on the same element.
  $board.get(0).addEventListener(
    "click",
    (event) => {
      if (!swallowNextClick) return;
      swallowNextClick = false;
      event.stopPropagation();
      event.preventDefault();
    },
    true
  );

  $board.on("pointerdown", '.pawn[data-movable="true"]', function onPointerDown(event) {
    const pointer = event.originalEvent ?? event;
    if (pointer.button !== 0 && pointer.pointerType === "mouse") return;

    drag = {
      pointerId: pointer.pointerId,
      element: this,
      pawn: Number($(this).attr("data-pawn")),
      x: pointer.clientX,
      y: pointer.clientY,
      moving: false,
    };
  });

  $board.on("pointermove", function onPointerMove(event) {
    const pointer = event.originalEvent ?? event;
    if (drag === null || pointer.pointerId !== drag.pointerId) return;

    const dx = pointer.clientX - drag.x;
    const dy = pointer.clientY - drag.y;

    if (!drag.moving) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      drag.moving = true;
      drag.element.setPointerCapture?.(drag.pointerId);
      drag.element.setAttribute("data-dragging", "true");
      handlers.onDragStarted(drag.pawn);
    }

    drag.element.style.setProperty("--drag-dx", `${dx}px`);
    drag.element.style.setProperty("--drag-dy", `${dy}px`);
  });

  function end(event, dropped) {
    const pointer = event.originalEvent ?? event;
    if (drag === null || pointer.pointerId !== drag.pointerId) return;

    const finished = drag;
    drag = null;
    if (!finished.moving) return;

    release(finished.element);
    swallowNextClick = true;
    handlers.onDragEnded(
      finished.pawn,
      dropped ? targetUnder(pointer.clientX, pointer.clientY) : null
    );
  }

  $board.on("pointerup", (event) => end(event, true));
  $board.on("pointercancel", (event) => end(event, false));
}
