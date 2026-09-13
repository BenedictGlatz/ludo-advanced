/**
 * Where a played card's effect landed, as marks for the board to wear. Design spec 18, D109.
 *
 * `ui/` only, and it holds no rule: every answer below is read out of the card's own target, the state
 * it produced, and the `cardReach` the four rolling cards report. It decides nothing about what a card
 * does; it decides only what a **cast** draws while the turn is held.
 *
 * ## The four kinds of field mark and the three kinds of pawn mark
 *
 * | `data-cast-hit` | On | Means |
 * | --- | --- | --- |
 * | `direct` | a field | the field the card was aimed at |
 * | `splash` | a field | a neighbour the effect spilled onto |
 * | `path` | a field | a field the effect travelled across. A run reads as a dotted line |
 * | `aura` | a field | the reach of an It's Not That Deep, or the region that cancelled a card |
 * | `victim` | a pawn | this is being done to you |
 * | `actor` | a pawn | the caster's own piece answering its card |
 * | `shielded` | a pawn | a protection arriving on the piece it will stay on |
 *
 * ## The one honest approximation in this file, stated rather than hidden
 *
 * A `path` is the run a shoved pawn crossed, and it is reconstructed here from **where the pawn is
 * now** plus `cardReach`, walking the track backwards along the direction it travelled. It is not read
 * out of the move, because there is no move: a shove is not a move and nothing records the squares it
 * crossed. Two cases make the reconstruction approximate and both are deliberate:
 *
 * - A Yeet is floored at the entry square, so a pawn pushed six from `r = 3` crossed two squares and
 *   the card reports six. The run drawn is six long, which is what the card did.
 * - A Let Him Cook that overshoots is sent home, so there is no pawn on the track to walk back from
 *   and the run is not drawn at all.
 *
 * Both are cosmetic and neither can be wrong in a way a player can act on, which is the test for
 * whether an approximation belongs in `ui/`. Getting them exactly right would mean recording the
 * squares crossed in `core/`, and D109 asked for a reach and not a route.
 */

import { squareOf } from "../core/displacement.js";
import { NULLIFY_RADIUS } from "../core/trap-rules.js";
import { neighbourSquares, squareRun } from "../core/path.js";
import { JANKY_HIT } from "../core/cards/effects/area-effects.js";
import { HEAD_OUT, HEAD_OUT_STEPS } from "../core/cards/effects/displacement-effects.js";

/** Nothing landed anywhere. What the 12 card-stage-only cards get, and any card missing its target. */
const NOTHING = Object.freeze({ squares: [], pawns: [], point: null });

/** The square a pawn reference is standing on right now, or `null` if it is not on the track. */
function squareUnder(state, ref) {
  const pawn = state.pawns.find(
    (entry) => entry.player === ref?.player && entry.pawn === ref?.pawn
  );

  return pawn === undefined ? null : squareOf(pawn);
}

/** A run of fields, `path`, numbered from the pawn outward so the dots arrive one after another. */
function path(squares) {
  return squares.map((square, index) => ({ square, hit: "path", index }));
}

/** The squares an It's Not That Deep's aura covers, the centre excluded: `NULLIFY_RADIUS` each way. */
function auraAround(square) {
  const steps = [...squareRun(square, -1, NULLIFY_RADIUS), ...squareRun(square, 1, NULLIFY_RADIUS)];

  return steps.map((reached) => ({ square: reached, hit: "aura" }));
}

/** The run a shoved pawn crossed, walked back from where it stands now. See the header. */
function shoveRun(state, ref, reach, direction) {
  const from = squareUnder(state, ref);
  if (from === null || !Number.isInteger(reach) || reach <= 0) return [];

  return path(squareRun(from, direction, Math.min(reach, 12)));
}

/**
 * The three cards that lay something on a field. The field itself is `direct`; what else is marked is
 * what the object reaches from there.
 */
function trapHits(cardId, square) {
  if (!Number.isInteger(square)) return NOTHING;

  const spread = {
    "action-oil-spill": path(neighbourSquares(square)),
    "action-not-that-deep": auraAround(square),
  };

  return {
    squares: [{ square, hit: "direct" }, ...(spread[cardId] ?? [])],
    pawns: [],
    point: { square },
  };
}

/** The seven cards that press a status onto a piece. Which ring it wears is what the status is for. */
function statusHits(cardId, played, state) {
  const ref = played.target.pawn ?? null;

  // Ghost Mode names no pawn: the piece it protects is the one the declared move was about to take.
  if (cardId === "reaction-ghost-mode") {
    const saved = state.pendingMove?.captures ?? null;
    return saved === null
      ? NOTHING
      : { squares: [], pawns: [{ ...saved, hit: "shielded" }], point: { pawn: saved } };
  }

  if (ref === null) return NOTHING;

  const mark = {
    "action-rock": "actor",
    "action-big-ah-rock": "actor",
    "action-lock-in": "shielded",
    "action-built-different": "shielded",
    "action-ragebait": "victim",
    "reaction-hold-pawn": "victim",
  };

  return { squares: [], pawns: [{ ...ref, hit: mark[cardId] ?? "victim" }], point: { pawn: ref } };
}

/** The four cards that move a piece without a move. Each of them draws the run it travelled. */
function shoveHits(cardId, played, state, reach) {
  if (cardId === "reaction-uno-reverse") {
    const move = state.pendingMove ?? null;
    if (move === null) return NOTHING;

    const attacker = { player: move.player, pawn: move.pawn };
    return { squares: [], pawns: [{ ...attacker, hit: "victim" }], point: { pawn: attacker } };
  }

  const ref = played.target.pawn ?? null;
  if (ref === null) return NOTHING;

  // A pushback travelled the squares now in front of the pawn; a run forwards, the ones behind it.
  const runs = {
    "action-yeet": shoveRun(state, ref, reach, 1),
    "action-let-him-cook": shoveRun(state, ref, reach, -1),
    "action-head-out":
      played.target.choice === HEAD_OUT.RETREAT ? [] : shoveRun(state, ref, HEAD_OUT_STEPS, -1),
  };

  return {
    squares: runs[cardId] ?? [],
    pawns: [{ ...ref, hit: cardId === "action-yeet" ? "victim" : "actor" }],
    point: { pawn: ref },
  };
}

/** The three cards that hit more than one field at a time. The Purge hits the board and no field. */
function areaHits(cardId, played, state, reach) {
  if (cardId === "reaction-the-purge") return NOTHING;

  if (cardId === "action-janky-rpg") {
    const square = played.target.square;
    if (!Number.isInteger(square)) return NOTHING;

    // The die decides whether the shot landed, and the view asks the same question the effect asked.
    const wide = Number.isInteger(reach) && reach < JANKY_HIT;
    const splash = neighbourSquares(square).map((near) => ({ square: near, hit: "splash" }));

    return {
      squares: [{ square, hit: "direct" }, ...(wide ? splash : [])],
      pawns: [],
      point: { square },
    };
  }

  const ref = played.target.pawn ?? null;
  const from = ref === null ? null : squareUnder(state, ref);
  if (from === null) return NOTHING;

  const direction = played.target.direction === -1 ? -1 : 1;

  return {
    squares: path(squareRun(from, direction, reach ?? 1)),
    pawns: [{ ...ref, hit: "victim" }],
    point: { pawn: ref },
  };
}

/**
 * Everything a card's board stage marks: `{ squares, pawns, point }`.
 *
 * `point` is where the effect flies to, and it is a target reference rather than a coordinate, because
 * turning a square or a pawn into pixels is `cast-geometry.js`'s job and it does it by measuring the
 * element rather than by computing a cell. `null` means the effect has no destination, which is true
 * of exactly one card: The Purge, which has every target and therefore none.
 *
 * **A nullified card marks the aura that cancelled it and not its own target** (D113). That branch is
 * `cast-view.js`'s, because whether the card was nullified is a fact about the play and not about the
 * card, and this file answers per card.
 */
export function castHits(family, played, state, reach = null) {
  const cardId = played.cardId;

  switch (family) {
    case "trap":
      return trapHits(cardId, played.target.square);
    case "status":
      return statusHits(cardId, played, state);
    case "shove":
      return shoveHits(cardId, played, state, reach);
    case "area":
      return areaHits(cardId, played, state, reach);
    default:
      return NOTHING;
  }
}

/**
 * The fields an It's Not That Deep's aura covers around the square a cancelled card was aimed at.
 *
 * D113's one branch: a nullified card still plays its cast, and its board stage lights **the region
 * that refused it** rather than the target it never reached. That is the honest picture of what
 * happened, and it is the only way a player finds out an aura is there at all.
 */
export function auraHits(played, state) {
  // The card may have been aimed at a pawn rather than at a field, so the square is asked for the
  // same way `core/trap-rules.js` asks it: a square target is itself, a pawn target is where it stands.
  const square = played.target.square ?? squareUnder(state, played.target.pawn);
  if (!Number.isInteger(square)) return NOTHING;

  return {
    squares: [{ square, hit: "aura" }, ...auraAround(square)],
    pawns: [],
    point: { square },
  };
}
