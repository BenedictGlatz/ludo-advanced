/**
 * The arena's command line. Bot tactics plan, phase 0.
 *
 * Split out of [bot-arena.js](bot-arena.js) so that the file which plays the matches is about
 * playing matches. Argument parsing is the part of a script that grows without anybody deciding to
 * grow it, and NFR-02's 300 lines applies to scripts as much as to `src/`.
 *
 * ```bash
 * npm run bots:arena                                            # four default bots, 200 matches
 * npm run bots:arena -- --seats=default,plain,default,plain     # the new terms against the old
 * npm run bots:arena -- --seats=default,random --players=2      # against the floor
 * npm run bots:arena -- --seats=riskWeight=1.5,default,riskWeight=1.5,default
 * ```
 */

import { MAX_PLAYERS, MIN_PLAYERS, PLAYER_COUNTS } from "../src/core/board.js";
import { DEFAULT_PROFILE, PLAIN_PROFILE, makeProfile } from "../src/ai/profile.js";

/** What the arena does when nothing is asked of it: four shipping bots, enough matches to mean something. */
const DEFAULTS = Object.freeze({ players: MAX_PLAYERS, matches: 200, rotate: true });

/**
 * One seat's player, built from its name on the command line.
 *
 * Three names are reserved and everything else is read as a list of knob overrides joined by `+`, so
 * `riskWeight=1.5+opportunityWeight=0` is one bot. An unknown knob is an error rather than a silently
 * ignored typo: a run that measured the wrong thing for twenty minutes is worse than a run that
 * refused to start.
 *
 * `label` is what the report prints and what the tally is keyed by, so two seats spelled the same
 * way are one bot with two seats, which is exactly what "two new against two old" wants.
 */
export function playerFor(spec) {
  if (spec === "random") return { label: "random", random: true, profile: DEFAULT_PROFILE };
  if (spec === "plain") return { label: "plain", profile: PLAIN_PROFILE };
  if (spec === "default") return { label: "default", profile: DEFAULT_PROFILE };

  const overrides = {};
  for (const pair of spec.split("+")) {
    const [knob, value] = pair.split("=");
    if (!Object.hasOwn(DEFAULT_PROFILE, knob)) {
      throw new Error(`unknown profile knob "${knob}" in seat "${spec}"`);
    }
    if (!Number.isFinite(Number(value))) {
      throw new Error(`knob "${knob}" needs a number, got "${value}"`);
    }
    overrides[knob] = Number(value);
  }

  return { label: spec, profile: makeProfile(overrides) };
}

/**
 * `--name=value` and `--no-name`, as a plain object. Nothing positional, so nothing to get out of order.
 *
 * Split at the **first** `=` and not at every one, because a seat spec is full of them:
 * `--seats=riskWeight=0+landingWeight=0,plain` has three, and a plain `split("=")` throws the value
 * away after the first, which comes back as "knob needs a number, got undefined" a long way from
 * where the mistake was.
 */
function parseFlags(argv) {
  const flags = {};

  for (const argument of argv) {
    if (!argument.startsWith("--")) {
      throw new Error(`arena arguments are all named: "${argument}" is not --name=value`);
    }

    const body = argument.slice(2);
    const split = body.indexOf("=");

    flags[split === -1 ? body : body.slice(0, split)] = split === -1 ? true : body.slice(split + 1);
  }

  return flags;
}

/** A whole number in range, or an error naming the flag rather than the value. */
function whole(flags, name, fallback, low, high) {
  if (flags[name] === undefined) return fallback;

  const value = Number(flags[name]);
  if (!Number.isInteger(value) || value < low || value > high) {
    throw new Error(`--${name} must be a whole number from ${low} to ${high}, got ${flags[name]}`);
  }

  return value;
}

/**
 * The line-up, one player per seat, padded or trimmed to the player count.
 *
 * Padding by repeating the list is deliberate: `--seats=default,plain` at a four-player table means
 * two of each, alternating, which is the shape almost every comparison wants and is tedious to type
 * out. Naming four seats explicitly still does exactly what it says.
 */
function lineupFor(flags, players) {
  const specs = (flags.seats ?? "default").split(",").filter((entry) => entry.length > 0);

  return Array.from({ length: players }, (_, index) => playerFor(specs[index % specs.length]));
}

/** Everything the run needs, checked before a single match is played. */
export function readOptions(argv) {
  const flags = parseFlags(argv);
  const players = whole(flags, "players", DEFAULTS.players, MIN_PLAYERS, MAX_PLAYERS);

  if (!PLAYER_COUNTS.includes(players)) {
    throw new Error(`--players must be one of ${PLAYER_COUNTS.join(", ")}, got ${players}`);
  }

  return {
    players,
    matches: whole(flags, "matches", DEFAULTS.matches, 1, 100000),
    rotate:
      flags.rotate !== undefined ? flags.rotate !== "false" : flags["no-rotate"] === undefined,
    lineup: lineupFor(flags, players),
  };
}
