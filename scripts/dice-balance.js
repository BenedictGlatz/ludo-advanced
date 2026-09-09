/**
 * The dice pool balance, derived and measured. Issue #30.
 *
 * ## Why this is a script and not a paragraph
 *
 * Section 5 of the game design document carried balance conclusions derived by hand against a
 * 58-step journey. The journey became 44 steps on 2026-08-30 and the section was marked out of date
 * rather than rewritten, because nobody could re-derive it without redoing the arithmetic.
 *
 * The same lesson `scripts/find-seeds.js` records applies here: **a conclusion written down without
 * the calculation that produced it expires silently.** So the arithmetic lives here, next to a
 * measurement that checks it against real matches, and section 5 quotes this script's output.
 *
 * ```bash
 * npm run docs:dice-balance
 * ```
 *
 * ## What it computes
 *
 * 1. **Theory.** How many turns one lone pawn needs for the whole journey on a single die, exactly,
 *    including the turns it loses to the exact-count rule (FR-13). Solved backwards as a recurrence,
 *    not simulated, so the numbers have no sampling error in them.
 * 2. **Measurement.** How long real matches actually take, played through the shipped `dispatch`
 *    with the same policy the end-to-end tests click.
 *
 * The two disagree, and the disagreement is the interesting part. See section 5.2 of the game design
 * document.
 */

import { HOME_R } from "../src/core/board.js";
import { POOL_COMPOSITION } from "../src/core/dice-pool.js";
import { createSeededRng } from "../src/core/dice-source.js";
import { MATCH_STATUS, TURN_PHASE } from "../src/state/game-state.js";
import { INTENT, dispatch } from "../src/state/intents.js";
import { matchDeps, startMatch } from "../src/state/match.js";
import { movablePawns } from "../src/state/turn-manager.js";

/** The journey length the old, superseded arithmetic in section 5 was derived against. */
const OLD_HOME_R = 58;

/** How many matches to play per player count. */
const MATCHES = 400;
const MAX_TURNS = 2000;

/**
 * Expected turns for one lone pawn to travel from the entry square to the back of the house.
 *
 * `T(r)` is the expected number of turns from relative position `r` to `homeR`. A roll that would
 * overshoot is illegal (FR-13) and the pawn simply does not move that turn, which is what makes the
 * last stretch expensive on a large die:
 *
 * ```
 * m    = min(faces, homeR - r)            how many of the faces are legal from r
 * T(r) = faces / m + (1 / m) * sum T(r + k)   for k = 1..m
 * ```
 *
 * Solved backwards from `T(homeR) = 0`, so it is exact rather than sampled.
 */
function travelTurns(faces, homeR) {
  const expected = new Array(homeR + 1).fill(0);

  for (let r = homeR - 1; r >= 1; r -= 1) {
    const legal = Math.min(faces, homeR - r);
    let sum = 0;
    for (let step = 1; step <= legal; step += 1) sum += expected[r + step];
    expected[r] = faces / legal + sum / legal;
  }

  return expected[1];
}

/**
 * The whole journey for one pawn: leaving the start area, then travelling.
 *
 * Leaving needs the die's maximum (FR-09), which is a geometric wait on `P = 1/faces`, so it costs
 * `faces` turns on average and lands the pawn on `r = 1`.
 */
function journey(faces, homeR) {
  const travel = travelTurns(faces, homeR);
  return { leave: faces, travel, total: faces + travel };
}

/** What the journey would cost if the exact-count rule did not exist. The gap is the rule's price. */
function idealTravel(faces, homeR) {
  return (homeR - 1) / ((faces + 1) / 2);
}

function printTheory(homeR, label) {
  console.log(`\n### One pawn, one die, journey of ${homeR} steps (${label})\n`);
  console.log("  die  leave  travel  total   travel if home needed no exact count  turns lost");

  let best = null;
  for (const { faces } of POOL_COMPOSITION) {
    const { leave, travel, total } = journey(faces, homeR);
    const ideal = idealTravel(faces, homeR);

    console.log(
      `  D${String(faces).padEnd(3)}${leave.toFixed(1).padStart(6)}${travel
        .toFixed(1)
        .padStart(8)}${total.toFixed(1).padStart(7)}${ideal.toFixed(1).padStart(40)}${(
        travel - ideal
      )
        .toFixed(1)
        .padStart(12)}`
    );

    if (best === null || total < best.total) best = { faces, total };
  }

  const fastestTravel = POOL_COMPOSITION.map(({ faces }) => ({
    faces,
    travel: travelTurns(faces, homeR),
  })).sort((a, b) => a.travel - b.travel)[0];

  console.log(`\n  cheapest whole journey: D${best.faces} at ${best.total.toFixed(1)} turns`);
  console.log(
    `  cheapest travel alone:  D${fastestTravel.faces} at ${fastestTravel.travel.toFixed(1)} turns`
  );
}

/**
 * Play one match to the end and report how long it took.
 *
 * The policy is the one `scripts/find-seeds.js` documents and the end-to-end helpers click: take the
 * first drawn card, move the lowest-numbered movable pawn. It is a **floor on skill**, so every
 * number it produces is a worst case for a real player.
 */
function playMatch(seed, playerCount) {
  const deps = matchDeps(createSeededRng(seed));
  let state = startMatch(playerCount, deps);
  let turns = 0;
  let stuck = 0;

  while (state.status === MATCH_STATUS.RUNNING && turns < MAX_TURNS) {
    turns += 1;

    if (state.phase === TURN_PHASE.CHOOSE) {
      state = dispatch(state, { type: INTENT.CHOOSE_DIE, faces: state.hand[0] }, deps).state;
    }

    if (state.phase === TURN_PHASE.ACT) {
      const pawn = Math.min(...movablePawns(state));
      state = dispatch(state, { type: INTENT.COMMIT_MOVE, pawn }, deps).state;
    } else {
      stuck += 1;
    }

    if (state.status !== MATCH_STATUS.RUNNING) break;
    state = dispatch(state, { type: INTENT.END_TURN }, deps).state;
  }

  return { turns, stuck, won: state.status === MATCH_STATUS.WON };
}

function printMeasurement() {
  console.log(`\n### Real matches, ${MATCHES} seeds per player count\n`);
  console.log("  players  finished  shortest  median  mean  longest  turns with no legal move");

  for (const playerCount of [2, 3, 4]) {
    const lengths = [];
    let stuck = 0;
    let played = 0;

    for (let seed = 1; seed <= MATCHES; seed += 1) {
      const match = playMatch(seed, playerCount);
      if (match.won) lengths.push(match.turns);
      stuck += match.stuck;
      played += match.turns;
    }

    lengths.sort((a, b) => a - b);
    const mean = lengths.reduce((total, value) => total + value, 0) / lengths.length;
    const median = lengths[Math.floor(lengths.length / 2)];

    console.log(
      `  ${String(playerCount).padEnd(9)}${`${lengths.length}/${MATCHES}`.padEnd(10)}${String(
        lengths[0]
      ).padEnd(10)}${String(median).padEnd(8)}${mean.toFixed(0).padEnd(6)}${String(
        lengths[lengths.length - 1]
      ).padEnd(9)}${((stuck / played) * 100).toFixed(1)}%`
    );
  }
}

console.log("Dice pool balance. Feeds section 5 of Game-Design-Document.md.");
printTheory(HOME_R, "current");
printTheory(OLD_HOME_R, "superseded, for comparison");
printMeasurement();
console.log(
  "\nThe measurement uses the no-skill policy: first drawn card, lowest movable pawn. Every\n" +
    "figure above is therefore a worst case for a player who actually chooses."
);
