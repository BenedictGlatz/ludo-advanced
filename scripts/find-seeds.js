/**
 * Find the seeds the end-to-end suite plays on. Issue #30.
 *
 * ## Why this exists
 *
 * `tests/e2e/helpers.js` pins a seed per situation, such as "seed 9 captures on turn 8". Those facts
 * were originally found by replaying matches headlessly, and that replay was never committed. Then
 * issue #30 replaced the single stand-in die with the twenty-card pool, every seed produced a
 * different match, and there was no way to find new ones except to redo undocumented work.
 *
 * So the replay is a script now. Re-run it whenever something changes what the RNG is spent on, and
 * paste the block it prints into `tests/e2e/helpers.js`.
 *
 * ```bash
 * npm run test:seeds
 * ```
 *
 * ## Why it can be trusted to agree with the browser
 *
 * It runs the real modules. `startMatch`, `dispatch` and `createDicePool` are the same functions the
 * page loads, and the policy below is the same one the tests click:
 *
 * - **Choosing a die**: `hand[0]`, which is what `ui/game-loop.js` does while the hand has no design.
 * - **Choosing a pawn**: the lowest-numbered movable pawn, which is what `firstMovablePawn` selects,
 *   because the view appends pawns in seat and then pawn order and only the active seat is movable.
 *
 * If either of those two changes, this script has to change with it or the seeds go stale silently.
 */

import { createSeededRng } from "../src/core/dice-source.js";
import { MATCH_STATUS, TURN_PHASE } from "../src/state/game-state.js";
import { INTENT, dispatch } from "../src/state/intents.js";
import { matchDeps, startMatch } from "../src/state/match.js";
import { movablePawns } from "../src/state/turn-manager.js";

/** How many seeds to try, and how long a single match may run before it is written off. */
const SEEDS_TO_SCAN = 400;
const MAX_TURNS = 600;

/** The pawn the end-to-end helpers would click: the lowest-numbered one that can move. */
function lowestMovablePawn(state) {
  return Math.min(...movablePawns(state));
}

/**
 * Replay one match and record what happened on which turn.
 *
 * Returns the turn numbers of the first time each situation occurs, or `null` where it never did.
 */
function replay(seed, playerCount) {
  const deps = matchDeps(createSeededRng(seed));
  let state = startMatch(playerCount, deps);

  const found = { leaveStart: null, advance: null, capture: null, passed: null, won: null };
  let turns = 0;

  while (state.status === MATCH_STATUS.RUNNING && turns < MAX_TURNS) {
    turns += 1;

    // The loop picks the first drawn card for the player, exactly as the view does today.
    if (state.phase === TURN_PHASE.CHOOSE) {
      const chosen = dispatch(state, { type: INTENT.CHOOSE_DIE, faces: state.hand[0] }, deps);
      if (!chosen.accepted) return { failed: "the die could not be chosen", turns };
      state = chosen.state;
    }

    if (state.phase === TURN_PHASE.ACT) {
      const pawn = lowestMovablePawn(state);
      const move = state.legalMoves.find((entry) => entry.pawn === pawn);
      const turnNumber = state.turnNumber;

      if (move.kind === "leave-start" && found.leaveStart === null) found.leaveStart = turnNumber;
      if (move.kind === "advance" && found.advance === null) found.advance = turnNumber;
      if (move.captures !== null && found.capture === null) found.capture = turnNumber;

      const played = dispatch(state, { type: INTENT.COMMIT_MOVE, pawn }, deps);
      if (!played.accepted) return { failed: "the move was refused", turns };
      state = played.state;
    } else if (state.refusalReason !== null && found.passed === null) {
      found.passed = state.turnNumber;
    }

    if (state.status !== MATCH_STATUS.RUNNING) break;

    const ended = dispatch(state, { type: INTENT.END_TURN }, deps);
    if (!ended.accepted) return { failed: "the turn could not be ended", turns };
    state = ended.state;
  }

  if (state.status === MATCH_STATUS.WON) found.won = state.turnNumber;
  return { ...found, turns, winner: state.winner };
}

/** Replay every seed for one player count, skipping matches that never finished. */
function scan(playerCount) {
  const results = [];

  for (let seed = 1; seed <= SEEDS_TO_SCAN; seed += 1) {
    const result = replay(seed, playerCount);
    if (result.failed) {
      console.error(`seed ${seed} (${playerCount}p) stopped: ${result.failed}`);
      continue;
    }
    results.push({ seed, ...result });
  }

  return results;
}

/** The first seed whose replay satisfies `wanted`, or `null`. */
function firstWhere(results, wanted) {
  return results.find(wanted) ?? null;
}

function report(label, hit, note) {
  if (hit === null) {
    console.log(`  ${label}: NOT FOUND in ${SEEDS_TO_SCAN} seeds`);
    return;
  }
  console.log(`  ${label}: seed ${hit.seed}  (${note(hit)})`);
}

function main() {
  console.log(`Replaying seeds 1..${SEEDS_TO_SCAN} against the twenty-card pool.\n`);

  const twoPlayers = scan(2);
  const fourPlayers = scan(4);

  // A pawn leaves the start area on the very first turn, so the first thing on screen is a move.
  const leavesAtOnce = firstWhere(fourPlayers, (entry) => entry.leaveStart === 1);

  // Leaves early and then makes an ordinary advance soon after, which is the second rule to see.
  const advancesEarly = firstWhere(
    twoPlayers,
    (entry) => entry.leaveStart !== null && entry.advance !== null && entry.advance <= 12
  );

  // The earliest capture anywhere, because a capture spec should not play forty turns to get there.
  const capturesEarly =
    twoPlayers.filter((entry) => entry.capture !== null).sort((a, b) => a.capture - b.capture)[0] ??
    null;

  // Turn 1 has no legal move at all, so the refusal strip is the first thing the player sees.
  const passesOnTurnOne = firstWhere(fourPlayers, (entry) => entry.passed === 1);

  // The shortest finished match, so the win spec is the cheapest it can be.
  const winsQuickest =
    twoPlayers.filter((entry) => entry.won !== null).sort((a, b) => a.won - b.won)[0] ?? null;

  console.log("Seeds for tests/e2e/helpers.js:\n");
  report("leavesStartAtOnce (4p)", leavesAtOnce, (h) => `leaves on turn ${h.leaveStart}`);
  report("advancesEarly     (2p)", advancesEarly, (h) => `advances on turn ${h.advance}`);
  report("capturesEarly     (2p)", capturesEarly, (h) => `captures on turn ${h.capture}`);
  report("passesOnTurnOne   (4p)", passesOnTurnOne, () => "no legal move on turn 1");
  report("winsQuickest      (2p)", winsQuickest, (h) => `seat ${h.winner} wins on turn ${h.won}`);

  const finished = twoPlayers.filter((entry) => entry.won !== null).length;
  console.log(
    `\n${finished} of ${twoPlayers.length} two-player matches finished within ${MAX_TURNS} turns.`
  );
}

main();
