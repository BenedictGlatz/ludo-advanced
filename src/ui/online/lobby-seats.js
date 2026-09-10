/**
 * Who sits where in the host's lobby, and what may still change. Issue #101, FR-42 and FR-43.
 *
 * `ui/` only, and **pure**: it takes the host role's snapshot and answers four questions about its seats.
 * It exists so the rule "may this seat be switched" is written **once** and asked twice, by the button
 * that goes `disabled` in `lobby-screen.js` and by the refusal in `host-role.js`. A rule in two places is
 * the drift the line-up avoided with `canBeBot`, and the same argument holds one screen over.
 *
 * ## The four kinds of seat
 *
 * | Status | Meaning | May switch |
 * | --- | --- | --- |
 * | `host` | The first seat, the person at this screen | never |
 * | `connected` | A guest whose channel is open | never: a person who joined is not turned into a bot |
 * | `bot` | Nobody joins here, the host's computer plays it | back to a person, always |
 * | `waiting` | Free: a guest may still take it | to a bot, if two persons remain |
 *
 * ## Why two persons and not one
 *
 * FR-01 says at least one person plays, and `canBeBot`'s default enforces exactly that. Online the floor
 * is the host **plus one guest**: a host alone against bots is a hot-seat match reached by a detour, and
 * a lobby that lets it happen has a Start button that starts nothing anybody wanted. So every switch to a
 * bot asks `canBeBot` with a floor of two, and a table with no guest can never run out of free seats.
 */

import { canBeBot } from "../../state/bots.js";

/** The host plus at least one guest. See the header. */
export const MIN_PEOPLE_ONLINE = 2;

/** The lobby's word for one seat. */
export function seatStatus(snapshot, seat) {
  if (seat === snapshot.seats[0]) return "host";
  if (snapshot.connected.includes(seat)) return "connected";
  if (snapshot.bots.includes(seat)) return "bot";

  return "waiting";
}

/** The seats a guest may still take: neither the host's, nor a bot's, nor already taken. */
export function freeSeats(snapshot) {
  return snapshot.seats.filter((seat) => seatStatus(snapshot, seat) === "waiting");
}

/**
 * May this seat be switched to `value`, `"human"` or `"bot"`?
 *
 * The host's seat and a connected guest's never move. A bot always goes back to a person. A free seat
 * becomes a bot only while two persons would remain, which is `canBeBot` with the online floor.
 */
export function canToggle(snapshot, seat, value) {
  const status = seatStatus(snapshot, seat);

  if (status === "host" || status === "connected") return false;
  if (value === "human") return status === "bot";
  if (value === "bot") return canBeBot(snapshot.seats, snapshot.bots, seat, MIN_PEOPLE_ONLINE);

  return false;
}

/** May the match start? Every seat is spoken for, and at least one of them by a guest. */
export function everybodyIn(snapshot) {
  return freeSeats(snapshot).length === 0 && snapshot.connected.length >= 1;
}
