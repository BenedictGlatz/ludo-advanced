/**
 * The skill squares: which track squares hand out a skill card, and where one moves to once used.
 * Issue #38, requirement FR-22.
 *
 * Pure `core/`: no DOM, no jQuery, no i18next, and no import from `state/` or `ui/`.
 *
 * ## What a skill square is
 *
 * Eight of the forty shared track squares. A pawn that **lands** on one earns its owner an extra
 * skill card. The square is then used up: it disappears and reappears somewhere else on the track, so
 * the board slowly rearranges itself over a match instead of the same eight squares being farmed for
 * the whole game.
 *
 * The respawn is the team's own rule, decided on 2026-08-30. No document had it, and the game design
 * document's static squares are what it replaces.
 *
 * ## Landing, not crossing
 *
 * Only the square a pawn finishes its move on counts. Passing over a skill square does nothing.
 *
 * Without that, a D20 would collect several cards in one move and a D2 almost none, which turns the
 * choice of dice card into "always take the biggest" and undoes the whole point of the dice pool. It
 * also matches how capture already works, so a player learns one rule instead of two.
 *
 * ## Why the squares are absolute and not relative
 *
 * A skill square is a place on the shared board, so it is stored as an absolute square index 0 to 39,
 * the same numbering `absoluteSquare(player, r)` returns. Stored relative to a player, the same
 * physical square would have four different numbers and "is this square taken" would need four
 * comparisons.
 */

import { MAX_PLAYERS, REGION, TRACK_LENGTH, absoluteSquare, entrySquare, region } from "./board.js";

/**
 * The eight squares the match starts with: four, seven, fourteen, seventeen, and so on.
 *
 * **Built rather than typed out**, so that the symmetry is a property of the code and not a claim in a
 * comment. Each player's quarter of the ring gets a square at `entry + 4` and one at `entry + 7`,
 * which means every player meets a skill square at exactly the same points of their own journey:
 * relative positions 5 and 8, then 15 and 18, then 25 and 28, then 35 and 38.
 *
 * **Why symmetry matters more than the exact offsets.** Turn order already gives seat 0 the first
 * move, and FR-04 fixes that order without compensating for it. A board that also gave one seat an
 * earlier first card would stack a second advantage on top, and nothing in the rules would balance
 * it. The offsets 4 and 7
 * themselves are a playtesting question: they are far enough from the entry square that a pawn cannot
 * reach one with a D2 straight out of the start area, and far enough apart that one move rarely covers
 * both.
 */
const OFFSETS_PER_QUARTER = Object.freeze([4, 7]);

export const INITIAL_SKILL_SQUARES = Object.freeze(
  Array.from({ length: MAX_PLAYERS }, (_, player) =>
    OFFSETS_PER_QUARTER.map((offset) => entrySquare(player) + offset)
  )
    .flat()
    .sort((a, b) => a - b)
);

/** How many skill squares are on the board. Constant for the whole match: one is used, one appears. */
export const SKILL_SQUARE_COUNT = INITIAL_SKILL_SQUARES.length;

/**
 * The four entry squares, 0, 10, 20 and 30. A skill square never moves onto one of these.
 *
 * The reason is not fairness, it is that the entry square is the busiest square a player has: every
 * pawn of theirs passes over it, and every pawn of theirs starts on it. A skill square there would
 * pay out far more often than one anywhere else, and it would pay out to whoever owns that quarter.
 */
export const EXCLUDED_SQUARES = Object.freeze(
  Array.from({ length: MAX_PLAYERS }, (_, player) => entrySquare(player))
);

/** Is `absolute` one of the squares that hands out a card right now? */
export function isSkillSquare(squares, absolute) {
  return squares.includes(absolute);
}

/**
 * Every square a used-up skill square is allowed to reappear on.
 *
 * Exported because the test asserts the count rather than trusting the arithmetic in a comment: 40
 * track squares, minus the 4 entry squares, minus the 7 skill squares still standing, minus the one
 * just used, leaves 28.
 *
 * **The used square is excluded from its own respawn.** Landing on a skill square and having it
 * reappear under the same pawn would read as nothing having happened, and the player would have no way
 * to tell that from a bug.
 *
 * Houses need no exclusion. They are not track squares, so an absolute square index never refers to
 * one.
 */
export function respawnCandidates(squares, used) {
  const taken = new Set([...squares, used, ...EXCLUDED_SQUARES]);

  return Array.from({ length: TRACK_LENGTH }, (_, square) => square).filter(
    (square) => !taken.has(square)
  );
}

/**
 * Use up the skill square at `absolute` and return the **new** list, with it moved elsewhere.
 *
 * The list is sorted, so two states with the same set of squares hold the same array. Without that,
 * the same board would compare unequal depending on the order squares happened to be used in, and a
 * test would have to sort before every assertion.
 *
 * `rng` is injected, as everywhere in `core/` (NFR-09). Throws when `absolute` is not a skill square,
 * because a caller asking to use up a square that is not there has a bug the rules cannot paper over.
 */
export function consumeSkillSquare(squares, absolute, rng) {
  if (!isSkillSquare(squares, absolute)) {
    throw new RangeError(`square ${absolute} is not a skill square, so it cannot be used up`);
  }

  const candidates = respawnCandidates(squares, absolute);
  const replacement = candidates[Math.floor(rng() * candidates.length)];

  return squares
    .filter((square) => square !== absolute)
    .concat(replacement)
    .sort((a, b) => a - b);
}

/**
 * The skill square a finished move landed on, or `null`.
 *
 * Takes the pawn **after** the move, so the caller does not repeat arithmetic `applyMove` already did.
 *
 * A pawn in a start area or a house is never on a skill square. `absoluteSquare` throws for those
 * rather than returning a number, so the region is checked first instead of the throw being caught: a
 * caught exception used as a branch hides the day the throw means something else.
 */
export function skillSquareLandedOn(squares, pawn) {
  if (region(pawn.r) !== REGION.TRACK) return null;

  const absolute = absoluteSquare(pawn.player, pawn.r);

  return isSkillSquare(squares, absolute) ? absolute : null;
}
