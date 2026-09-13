/**
 * What the arena prints. Bot tactics plan, phase 0.
 *
 * Split out of [bot-arena.js](bot-arena.js) with the argument parsing, and for the same reason.
 *
 * ## The confidence interval is the whole point of the table
 *
 * A win rate on its own invites the mistake the plan is written to prevent: two bots at a four-seat
 * table, 200 matches, and the new one wins 27 % against 23 %. That looks like an improvement and it
 * is inside the noise. So every rate is printed with a 95 % interval next to it, and the rule in
 * phase 3 is that a change is kept only when the intervals do not overlap the even split.
 *
 * The interval is the ordinary normal approximation, `1.96 * sqrt(p * (1 - p) / n)`. It is not the
 * most careful interval available for a proportion, and at these sample sizes and rates the careful
 * ones differ in the third decimal, which is well inside what anybody would act on.
 */

/** The multiplier for a 95 % two-sided interval on a normal approximation. */
const Z_95 = 1.96;

/** The half-width of the interval around a rate measured over `n` tries. */
function halfWidth(rate, n) {
  return n === 0 ? 0 : Z_95 * Math.sqrt((rate * (1 - rate)) / n);
}

/** A rate as a percentage with one decimal, padded so a column of them lines up. */
function percent(rate) {
  return `${(100 * rate).toFixed(1).padStart(5)} %`;
}

/** One row of the profile table. */
function profileLine(row, matches, width) {
  const rate = row.wins / matches;
  const per = row.seatsPlayed === 0 ? 0 : 1 / row.seatsPlayed;

  return [
    row.label.padEnd(width),
    String(row.wins).padStart(6),
    percent(rate),
    `+/- ${(100 * halfWidth(rate, matches)).toFixed(1).padStart(4)}`,
    (row.captures * per).toFixed(2).padStart(8),
    (row.cards * per).toFixed(2).padStart(7),
  ].join("  ");
}

/**
 * The whole report.
 *
 * `captures` and `cards` are **per seat per match**, not totals, so a bot holding two seats is not
 * flattered by having played twice as often. That is what `seatsPlayed` is counted for.
 */
export function printReport(options, result) {
  const width = Math.max(7, ...result.rows.map((row) => row.label.length));
  const rotation = options.rotate ? "rotating" : "fixed";

  console.log(
    `\n${options.matches} matches, ${options.players} seats, seeds 1..${options.matches}, ` +
      `${rotation} line-up, ${result.turns.toFixed(1)} turns per match on average\n`
  );

  console.log(
    ["profile".padEnd(width), "  wins", "  rate", "     95 %", "captures", "  cards"].join("  ")
  );
  console.log("-".repeat(width + 44));

  for (const row of [...result.rows].sort((a, b) => b.wins - a.wins)) {
    console.log(profileLine(row, options.matches, width));
  }

  console.log(`\nwins by seat (the control: with a rotating line-up this should be close to even)`);
  console.log(
    result.seats
      .map((seat, index) => `  seat ${seat}: ${result.bySeat[index]}`)
      .join("")
      .trim()
  );
  console.log("");
}
