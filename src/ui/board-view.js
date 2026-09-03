/**
 * The board, rendered out of state. Issue #62, screen S3.
 *
 * Reads state and writes DOM. **It never writes to state**, which `game-state.js` also enforces by
 * freezing, and it holds no rule: every question it asks about the board is asked of `core/` or of
 * `board-geometry.js`.
 *
 * ## Built once, updated after that
 *
 * `renderBoard` produces the whole markup of the DOM contract in one pass and is called once.
 * `updateBoard` then only writes attributes and two custom properties per pawn. Nothing is destroyed
 * and rebuilt, and that is not an optimisation: it is what makes the movement animation possible at
 * all. D10 of the design spec has the argument in full. A CSS transition needs the same element to
 * change position over time, so a pawn that is removed and re-created between two squares moves
 * instantly and invisibly, no matter what the stylesheet says.
 *
 * ## The four regions are always drawn, even for two players
 *
 * `renderBoard` lays out all four yards and all four houses whatever the player count, and only the
 * pawns follow who is actually playing. Unused seats are drained by `board.css` through
 * `.board[data-players="N"]` (D3). Two things follow: the geometry never depends on the player count,
 * so there is one grid and not three, and every Playwright selector keeps working across 2, 3 and 4
 * player matches.
 */

import $ from "jquery";

import {
  HOME_COLUMN_LENGTH,
  MAX_PLAYERS,
  PAWNS_PER_PLAYER,
  TRACK_LENGTH,
  entrySquare,
  turnOffSquare,
} from "../core/board.js";
import { applyBoardMarks } from "./board-marks.js";
import { pawnCentre } from "./board-geometry.js";

const SEATS = Array.from({ length: MAX_PLAYERS }, (_, seat) => seat);

/**
 * Read a duration token off the board, in milliseconds.
 *
 * The durations belong to `tokens.css` (D8), so reading them back is how the view stays in step with
 * the design instead of holding a second copy of `240ms` that nobody remembers to update. `fallback`
 * covers the case where the stylesheet has not loaded, which happens in a test harness rather than in
 * a browser.
 */
export function motionMs($board, token, fallback) {
  const raw = window.getComputedStyle($board[0]).getPropertyValue(token).trim();
  const value = Number.parseFloat(raw);

  if (Number.isNaN(value)) return fallback;
  return raw.endsWith("ms") ? value : value * 1000;
}

/**
 * The 40 shared track fields, with the eight that belong to somebody marked.
 *
 * `.square__trap` is the empty element design brief 07 asks for, and it is on **every** field from the
 * moment the board is built, whether anything is standing there or not. Two reasons, and the second is
 * the one that forced it:
 *
 * 1. **D10's contract.** `updateBoard` writes attributes and never creates an element, which is what
 *    makes a CSS transition possible: a mark that is created when a trap appears has no previous state
 *    to animate from. The span costs 40 empty elements and renders nothing without `[data-trap]`.
 * 2. **Both pseudo-elements of `.square` are already taken.** `::before` is D27's skill diamond and
 *    `::after` is the turn-off bar on squares 9, 19, 29 and 39, all four of which are legal trap
 *    targets. There was no third layer to give the mark, which is the same situation `.pawn__mark`
 *    solved for the piece in design handoff 06.
 */
function trackSquares() {
  const entries = new Map(SEATS.map((seat) => [entrySquare(seat), seat]));
  const turnOffs = new Map(SEATS.map((seat) => [turnOffSquare(seat), seat]));

  return Array.from({ length: TRACK_LENGTH }, (_, index) => {
    const $square = $("<div>", { class: "square square--track" }).attr("data-square", index);

    if (entries.has(index)) $square.attr("data-entry-of", entries.get(index));
    if (turnOffs.has(index)) $square.attr("data-turnoff-of", turnOffs.get(index));

    return $square.append($("<span>", { class: "square__trap" }));
  });
}

/** One seat's yard: the coloured block and the four waiting slots inside it. */
function yard(seat) {
  const slots = Array.from({ length: PAWNS_PER_PLAYER }, (_, slot) =>
    $("<div>", { class: "slot" }).attr("data-slot", slot)
  );

  return $("<div>", { class: "start-area" }).attr("data-player", seat).append(slots);
}

/** One seat's house: four squares, step 1 against that seat's turn-off field. */
function house(seat) {
  const squares = Array.from({ length: HOME_COLUMN_LENGTH }, (_, index) =>
    $("<div>", { class: "square square--home-column" })
      .attr("data-player", seat)
      .attr("data-home-step", index + 1)
  );

  return $("<div>", { class: "home-column" }).attr("data-player", seat).append(squares);
}

/**
 * One pawn.
 *
 * It is a direct child of `.board` for its whole life and is never moved into a square, which is the
 * D10 contract change. `tabindex` is what makes the `:focus-visible` ring of D11 reachable: the
 * design specified a keyboard state, so the markup has to be keyboard-reachable for it to exist.
 *
 * `.pawn__mark` is the empty element design spec 04 § 5 asked for: the seat's shape (D16, NFR-12) goes
 * on the piece, and the two pseudo-elements of `pawn.css` are already taken by the body and the state
 * ring. It carries no text and no attribute of its own; `data-player` on the pawn is what keys it.
 * Styled by design handoff 06.
 *
 * `.pawn__status` is the second one, asked for by name in design spec 07 § 5 (D57), and it is here for
 * the same reason there is a first one: **the piece has nothing left to draw on.** Both pseudo-elements
 * are taken and `.pawn__mark` is the seat mark, which is the one thing on the board that may not come to
 * mean something else. So a status that has to be visible needs a box of its own.
 *
 * Both spans are built once and never touched again, which is D10's contract and not tidiness: a mark
 * created at the moment a status appears has no previous state to transition from, so it would arrive
 * fully drawn however the stylesheet is written. They render nothing until the pawn carries a status,
 * the same way the 40 `.square__trap` spans render nothing on an empty field.
 */
function pawn(seat, index) {
  return $("<div>", { class: "pawn", tabindex: 0 })
    .attr("data-player", seat)
    .attr("data-pawn", index)
    .attr("data-r", 0)
    .append($("<span>", { class: "pawn__mark" }), $("<span>", { class: "pawn__status" }));
}

/**
 * The whole board as one detached element, ready to be put on the page.
 *
 * Order matters. The squares and the regions are grid children and come first; the pawns are
 * absolutely positioned and come last, so that a pawn painted over a square is the normal case and
 * not something `z-index` has to rescue.
 */
export function renderBoard(state) {
  const $board = $("<div>", { class: "board" })
    .attr("data-players", state.playerCount)
    .attr("data-active-player", state.activePlayer);

  $board.append(trackSquares());
  for (const seat of SEATS) $board.append(yard(seat), house(seat));
  for (const entry of state.pawns) $board.append(pawn(entry.player, entry.pawn));

  updateBoard($board, state);
  return $board;
}

/** The element for one pawn identity. */
export function pawnElement($board, seat, index) {
  return $board.find(`.pawn[data-player="${seat}"][data-pawn="${index}"]`);
}

/**
 * Move one pawn to where the state says it is, and report whether it was just sent home.
 *
 * The previous position is read off the element's own `data-r` rather than from a copy of the last
 * state. The element already carries it, so a second record of the same fact would be one more thing
 * that can go stale.
 */
function placePawn($board, entry) {
  const $pawn = pawnElement($board, entry.player, entry.pawn);
  const previous = Number($pawn.attr("data-r"));
  const { column, row } = pawnCentre(entry.player, entry.r, entry.pawn);

  $pawn.attr("data-r", entry.r);
  $pawn.each(function setPosition() {
    this.style.setProperty("--pawn-col", column);
    this.style.setProperty("--pawn-row", row);
  });

  return previous > 0 && entry.r === 0;
}

/**
 * Write the current state onto an already rendered board.
 *
 * Everything here is an attribute or a custom property. No element is created, moved or removed, so
 * every transition in `pawn.css` runs from the position the pawn was already in.
 */
export function updateBoard($board, state) {
  $board.attr("data-active-player", state.activePlayer);
  $board.attr("data-players", state.playerCount);

  // `data-phase`, `data-status` and `data-roll` are additions to the DOM contract, made on
  // 2026-08-30. No stylesheet reads them and none is expected to. They exist so that a Playwright
  // test can wait for the turn to reach a phase, instead of waiting for a number of milliseconds and
  // hoping: a test that sleeps is either slow or flaky, usually both in turn. `data-roll` also lets
  // "the pawn advanced exactly the number rolled" be asserted against the roll that actually
  // happened, rather than against a number copied into the test from a seed.
  //
  // The roll is not shown to the player anywhere, and that is deliberate rather than forgotten. What
  // a player needs is where the pawn will land, and the legal-target highlight of D7 says that
  // directly. The number itself belongs to the dice hand, which is issue #31.
  //
  // `data-die` joined them with issue #30, when the pool started dealing seven different
  // denominations. Before that the die was always a six and a test could write `expect(roll).toBe(6)`
  // for "the maximum was rolled". Now the maximum depends on which card was picked, so the rule
  // FR-09 actually states, that leaving the start area needs the die's maximum, is only checkable if
  // the view says which die is in play.
  $board.attr("data-phase", state.phase);
  $board.attr("data-status", state.status);
  $board.attr("data-roll", state.roll ?? "");
  $board.attr("data-die", state.chosenDie ?? "");

  // `data-winner` joined them with issue #38, for the same kind of reason `data-die` did. The win
  // spec used to name seat 2 and the text "Spieler 3", because that was what the seed happened to
  // produce. Two seed regenerations later, in one week, that had to be corrected twice. Which seat
  // wins is a property of the seed and not a rule, so the spec now reads the winner off the board and
  // asserts the rule instead: the winner's four pawns fill the four house squares, and the message
  // names that seat.
  $board.attr("data-winner", state.winner ?? "");

  // `data-turn` only ever counts upward, and that is the point of it. A test that waits for the
  // phase or the active seat to change can miss the change entirely: with the pauses collapsed, a
  // turn that nobody can move in passes itself immediately, so the board can go from seat 0 through
  // seat 2 and back to seat 0 between two polls. The turn number cannot go back.
  $board.attr("data-turn", state.turnNumber);

  // Everything that cards have put on the board: the skill squares, the objects standing on a field,
  // the fields an aura protects, and the statuses stuck to a pawn. Moved out to `board-marks.js` in
  // issue #45, which added three marks to the one that was here. The seam: this file renders the
  // board's own shape, that one renders what has been put on it.
  applyBoardMarks($board, state);

  const captured = state.pawns.filter((entry) => placePawn($board, entry));
  markCaptured($board, captured);
}

/**
 * Flag the pawns that were just sent back to their yard, so `pawn.css` can play the capture
 * treatment, then clear the flag once the transition it drives has finished.
 *
 * The delay is read from `--motion-capture` rather than written here, so the design owns the number
 * and the view owns only the decision to stop. Clearing it late is harmless; clearing it early would
 * cut the animation off.
 */
function markCaptured($board, captured) {
  if (captured.length === 0) return;

  for (const entry of captured) {
    pawnElement($board, entry.player, entry.pawn).attr("data-captured", "true");
  }

  const duration = motionMs($board, "--motion-capture", 320);
  window.setTimeout(() => {
    for (const entry of captured) {
      pawnElement($board, entry.player, entry.pawn).removeAttr("data-captured");
    }
  }, duration);
}
