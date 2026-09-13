/**
 * A scoreboard for the bots. Bot tactics plan, phase 0.
 *
 * ```bash
 * npm run bots:arena -- --players=4 --matches=200 --seats=default,plain,default,plain
 * ```
 *
 * ## Why this is a script and not a test
 *
 * `bot-match.test.js` proves the bot can **finish** a match without asking for anything the rules
 * refuse. That is the property a test suite should own, and it says nothing at all about whether a
 * change made the bot better.
 *
 * Answering that needs a few hundred matches, because in a four-seat game a bot exactly as good as
 * the others wins one match in four and the noise around that is wide. A test suite must never run
 * for minutes; a script may. The same reasoning `scripts/dice-balance.js` opens with applies here:
 * **a conclusion written down without the calculation that produced it expires silently**, so the
 * calculation lives next to the command and `notes/09-source-code-overview.md` quotes the output.
 *
 * ## How a bot is seated against another bot
 *
 * `decide(state, profile)` takes a second argument since phase 0, and `profileFor` lets that be a
 * function from a seat to a profile. So two different bots play in the **same build**, out of the
 * same source, with only their tuning knobs different. The alternative was keeping a copy of the old
 * code around to play against, which goes stale the first time anybody edits either copy.
 *
 * The whole line-up moves round by one seat every match unless `--no-rotate` says otherwise, so each
 * profile sits in every seat equally often. Seat 0 plays first and that is worth something; without
 * the rotation a comparison would be measuring the seat as much as the bot.
 *
 * ## The random baseline is the floor
 *
 * A seat named `random` picks a legal die and a legal move uniformly at random and never plays a
 * card. It lives here and **not** in `src/ai/`, because `ai/` may contain no randomness at all
 * (NFR-09) and a seeded generator in that layer would be a loophole rather than an exception.
 *
 * If a change ever loses to the random seat, the change is wrong however good the argument for it
 * sounded.
 */

import { seatsFor } from "../src/core/board.js";
import { createSeededRng } from "../src/core/dice-source.js";
import { isBot } from "../src/state/bots.js";
import { MATCH_STATUS, TURN_PHASE } from "../src/state/game-state.js";
import { INTENT, dispatch } from "../src/state/intents.js";
import { INTENT_CARD } from "../src/state/intents-cards.js";
import { matchDeps, startMatch } from "../src/state/match.js";
import { decide } from "../src/ai/bot-policy.js";
import { readOptions } from "./arena-options.js";
import { printReport } from "./arena-report.js";

/** How many intents one match is allowed before it is called a hang. `bot-match.test.js` uses the same. */
const INTENT_LIMIT = 20000;

/**
 * Which seat the game is waiting on, or `null`.
 *
 * The same order `decide` uses and for the same reason: an open window asks a seat that is not the
 * active one, and it is the only moment a non-active seat is asked anything at all. The two must
 * agree, or a random seat would be handed a question `decide` was going to answer.
 */
function askedSeat(state) {
  if (state.reactionWindow !== null) {
    return state.reactionWindow.eligible.find((seat) => isBot(state, seat)) ?? null;
  }

  return isBot(state, state.activePlayer) ? state.activePlayer : null;
}

/** A legal die and a legal move, picked with no thought at all. Cards are never played. */
function randomIntent(state, rng) {
  if (state.reactionWindow !== null) return null;

  if (state.phase === TURN_PHASE.CHOOSE) {
    return { type: INTENT.CHOOSE_DIE, faces: state.hand[Math.floor(rng() * state.hand.length)] };
  }

  if (state.phase === TURN_PHASE.ACTION) return { type: INTENT.SKIP_ACTION };

  if (state.phase === TURN_PHASE.ACT && state.legalMoves.length > 0) {
    const move = state.legalMoves[Math.floor(rng() * state.legalMoves.length)];
    return { type: INTENT.COMMIT_MOVE, pawn: move.pawn };
  }

  return null;
}

/** The steps the game loop takes for itself, in the loop's own order. Copied from `bot-match.test.js`. */
function mechanicalIntent(state) {
  if (state.reactionWindow !== null) return { type: INTENT.CLOSE_WINDOW };

  switch (state.phase) {
    case TURN_PHASE.ROLL:
      return { type: INTENT.ROLL_DIE };
    case TURN_PHASE.REACTION:
      return { type: INTENT.CLOSE_WINDOW };
    case TURN_PHASE.TURN_END:
      return { type: INTENT.END_TURN };
    default:
      throw new Error(`nothing knows how to leave phase ${state.phase}`);
  }
}

/** Was this commit-move intent a capture? Read off the move the state has already computed. */
function capturedBy(state, intent) {
  if (intent.type !== INTENT.COMMIT_MOVE) return false;

  const move = state.legalMoves.find((entry) => entry.pawn === intent.pawn);

  return move !== undefined && move.captures !== null;
}

/**
 * One match, played to a winner.
 *
 * Returns the winning seat plus what each seat did on the way, which is what turns a win rate into
 * something a person can argue with: a bot that wins by hiding in its yard is a bug, and the capture
 * and card counts are what show it.
 *
 * The random seat gets a generator of its own, seeded a long way from the match's, so that changing
 * the bot never changes the cards the pool deals. Two runs of the same seed are identical, which is
 * the same promise `?seed=` makes to a player.
 */
function playMatch(seed, lineup, playerCount) {
  const deps = matchDeps(createSeededRng(seed));
  const rng = createSeededRng(seed + 1000000);
  const seats = seatsFor(playerCount);

  let state = startMatch(playerCount, deps, undefined, undefined, seats);
  const tally = new Map(seats.map((seat) => [seat, { cards: 0, captures: 0 }]));

  for (let step = 0; state.status === MATCH_STATUS.RUNNING; step += 1) {
    if (step >= INTENT_LIMIT) {
      throw new Error(`match ${seed} did not finish within ${INTENT_LIMIT} intents`);
    }

    const seat = askedSeat(state);
    const asked = seat === null ? null : lineup(seat);
    const chosen = asked === null ? null : askedIntent(state, asked, lineup, rng);
    const intent = chosen ?? mechanicalIntent(state);

    if (intent.type === INTENT_CARD.PLAY_CARD) tally.get(intent.seat).cards += 1;
    if (capturedBy(state, intent)) tally.get(state.activePlayer).captures += 1;

    const result = dispatch(state, intent, deps);
    if (!result.accepted) {
      throw new Error(`match ${seed}: ${intent.type} was refused in phase ${state.phase}`);
    }
    state = result.state;
  }

  return { winner: state.winner, turns: state.turnNumber, tally };
}

/** What the seat being asked wants: its own randomness, or the real policy with its own profile. */
function askedIntent(state, asked, lineup, rng) {
  if (asked.random) return randomIntent(state, rng);

  return decide(state, (seat) => lineup(seat).profile);
}

/**
 * The whole run: `matches` matches from seeds `1..matches`, tallied by profile and by seat.
 *
 * Both tallies are printed. The profile tally is the answer; the seat tally is the control, because
 * with the rotation on it should come out close to even and a lopsided one means the rotation is not
 * doing its job.
 */
function runArena(options) {
  const seats = seatsFor(options.players);
  const byProfile = new Map(options.lineup.map((player) => [player.label, blank(player.label)]));
  const bySeat = seats.map(() => 0);
  let turns = 0;

  for (let match = 0; match < options.matches; match += 1) {
    const shift = options.rotate ? match % seats.length : 0;
    const lineup = (seat) => options.lineup[(seats.indexOf(seat) + shift) % seats.length];

    const played = playMatch(match + 1, lineup, options.players);
    turns += played.turns;

    byProfile.get(lineup(played.winner).label).wins += 1;
    bySeat[seats.indexOf(played.winner)] += 1;

    for (const [seat, counts] of played.tally) {
      const row = byProfile.get(lineup(seat).label);
      row.cards += counts.cards;
      row.captures += counts.captures;
      row.seatsPlayed += 1;
    }
  }

  return { rows: [...byProfile.values()], bySeat, seats, turns: turns / options.matches };
}

/** One profile's row, before anything has happened. `seatsPlayed` is what the averages divide by. */
function blank(label) {
  return { label, wins: 0, cards: 0, captures: 0, seatsPlayed: 0 };
}

const options = readOptions(process.argv.slice(2));
printReport(options, runArena(options));
