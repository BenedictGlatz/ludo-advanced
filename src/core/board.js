/**
 * Board topology and position arithmetic. Issue #26, requirements FR-02 and FR-08.
 *
 * Pure functions over numbers. No DOM, no state, no imports from any other layer. Everything here
 * runs and is tested without a browser, which is NFR-01.
 *
 * **Every number in this file comes from section 2 of the game design document.** None of it is
 * invented here, and none of it is duplicated anywhere else in the code: if the rulebook changes,
 * this file changes and nothing else has to.
 *
 * ## The one idea worth understanding first
 *
 * A pawn's position is stored as a **relative position `r`**, counted from its own player's point of
 * view, never as a square on the board. It runs from 0 to 58:
 *
 * | `r`      | Where the pawn is                                              |
 * | -------- | -------------------------------------------------------------- |
 * | `0`      | The start area                                                  |
 * | `1`      | The player's entry square                                        |
 * | `1`..`52`| Somewhere on the shared 52-square track                          |
 * | `53`..`57`| The player's own home column, steps 1 to 5                      |
 * | `58`     | Home                                                             |
 *
 * Why relative and not absolute: every player walks the same 58 steps, so a movement rule written
 * against `r` is the same rule for all four of them. Turning `r` into the physical square everyone
 * shares is one function, `absoluteSquare`, and it is the only place the offset between players
 * appears at all.
 */

/** Squares on the shared track, indexed 0 to 51, closing on itself (FR-08). */
export const TRACK_LENGTH = 52;

/** 2 to 4 players play, but the board always has four fixed seats (FR-01). */
export const MAX_PLAYERS = 4;

/**
 * 52 = 4 x 13, which is what makes the board symmetric: every player sits exactly 13 squares from
 * the next one, so everybody meets everybody at the same relative distances.
 */
export const PLAYER_OFFSET = TRACK_LENGTH / MAX_PLAYERS;

/** Home column squares per player, enterable only by their owner. */
export const HOME_COLUMN_LENGTH = 5;

/** Pawns per player, and also slots in a start area and in a home. */
export const PAWNS_PER_PLAYER = 4;

/** A pawn waiting in the start area. It has no square index, because the start area is not a square. */
export const START_R = 0;

/**
 * The last position: home. Derived rather than asserted, so that the "58 steps" figure in the
 * rulebook and the one in the code cannot drift apart. 52 track squares, 5 home column squares,
 * and home itself.
 */
export const HOME_R = TRACK_LENGTH + HOME_COLUMN_LENGTH + 1;

/** The four regions a pawn can be in. String values, so a failing test reads as words. */
export const REGION = {
  START: "start",
  TRACK: "track",
  HOME_COLUMN: "home-column",
  HOME: "home",
};

function assertPlayer(player) {
  if (!Number.isInteger(player) || player < 0 || player >= MAX_PLAYERS) {
    throw new RangeError(`player must be an integer 0..${MAX_PLAYERS - 1}, got ${player}`);
  }
}

function assertRelative(r) {
  if (!Number.isInteger(r) || r < START_R || r > HOME_R) {
    throw new RangeError(`r must be an integer ${START_R}..${HOME_R}, got ${r}`);
  }
}

/**
 * The square a pawn of `player` is placed on when it leaves the start area.
 * E(p) = 13 x p, so 0, 13, 26 and 39.
 */
export function entrySquare(player) {
  assertPlayer(player);
  return PLAYER_OFFSET * player;
}

/**
 * The last shared square a pawn of `player` stands on before turning into its home column.
 * T(p) = (E(p) + 51) mod 52, which is the square immediately *behind* the player's own entry
 * square. A pawn therefore walks one full lap before it can turn off.
 */
export function turnOffSquare(player) {
  return (entrySquare(player) + TRACK_LENGTH - 1) % TRACK_LENGTH;
}

/**
 * The physical square index, 0 to 51, that relative position `r` means for `player`.
 * Only defined while the pawn is on the shared track, so `r` must be 1 to 52.
 */
export function absoluteSquare(player, r) {
  assertRelative(r);
  if (region(r) !== REGION.TRACK) {
    throw new RangeError(`r=${r} is not on the shared track, so it has no absolute square`);
  }
  return (entrySquare(player) + r - 1) % TRACK_LENGTH;
}

/** Which region relative position `r` falls in. */
export function region(r) {
  assertRelative(r);
  if (r === START_R) return REGION.START;
  if (r <= TRACK_LENGTH) return REGION.TRACK;
  if (r < HOME_R) return REGION.HOME_COLUMN;
  return REGION.HOME;
}

/**
 * Which home column square, 1 to 5, relative position `r` means. The view renders this as
 * `data-home-step`. Throws for any `r` outside a home column.
 */
export function homeColumnStep(r) {
  if (region(r) !== REGION.HOME_COLUMN) {
    throw new RangeError(`r=${r} is not in a home column`);
  }
  return r - TRACK_LENGTH;
}

/**
 * Do these two pawns stand on the same physical square?
 *
 * A pawn is `{ player, r }`. The answer follows from the topology rather than from a rule:
 *
 * - **Start areas and homes never collide**, not even between two pawns of the same player. Each
 *   holds 4 separate slots, so two pawns there are next to each other and not on top of each other.
 * - **On the shared track**, two pawns collide when their absolute squares match. This is the only
 *   case where pawns of *different* players can meet, which is why capture (FR-11) can only ever
 *   happen on the track.
 * - **In a home column**, only the owner can ever stand there, so a collision needs the same player
 *   and the same `r`. This is why "capture inside a home column" needs no special rule anywhere:
 *   it cannot be expressed.
 */
export function isSameSquare(pawnA, pawnB) {
  const regionA = region(pawnA.r);
  const regionB = region(pawnB.r);

  if (regionA !== regionB) return false;

  if (regionA === REGION.TRACK) {
    return absoluteSquare(pawnA.player, pawnA.r) === absoluteSquare(pawnB.player, pawnB.r);
  }

  if (regionA === REGION.HOME_COLUMN) {
    return pawnA.player === pawnB.player && pawnA.r === pawnB.r;
  }

  // START and HOME: separate slots, so never the same square.
  return false;
}
