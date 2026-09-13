/**
 * The knobs one bot plays with. Bot tactics plan, phase 0.
 *
 * Pure `ai/`: a frozen object of numbers and two small functions over it. It holds no strategy, only
 * the dials the strategy reads.
 *
 * ## Why a bot needs a profile at all
 *
 * Every constant in this layer was labelled "a guess", and there was no way to find out whether a
 * guess was a good one. `bot-match.test.js` proves a bot can **finish** a match; it says nothing about
 * whether a change made the bot stronger.
 *
 * A profile is what makes that measurable. `npm run bots:arena` seats four bots at one table and
 * hands each of them a different profile, so "the new danger term, switched on, against the same build
 * with it switched off" is one command and a few hundred matches, rather than an argument. That is why
 * `PLAIN_PROFILE` exists and why it has to stay exactly today's-behaviour-minus-the-new-terms: it is
 * the control group.
 *
 * ## It is also the seam a difficulty setting would use
 *
 * An easy bot is `makeProfile({ riskWeight: 0, playAt: 20 })`, which walks into captures and never
 * plays a card, and a hard bot is the tuned default. That is a one-object change here and nothing
 * anywhere else. **Whether the line-up screen should offer the choice is a Product Owner and Design
 * question**, filed as an open request rather than built.
 */

import { BLOCK_WORTH, CARD_WORTH, LOCK_COST, STUN_WORTH, TAUNT_WORTH } from "./score.js";

/**
 * How much a card has to be worth before the bot plays it rather than keeping it.
 *
 * Four points is a little under a fifth of getting a pawn out of the yard, and the reasoning is that a
 * card in hand is worth something: it can be played on a better board next turn, and the budget is one
 * card per turn, so a cheap play spends the only slot the turn has. Below the threshold the bot passes.
 */
export const PLAY_AT = 4;

/**
 * The threshold when the hand is full (`SKILL_HAND_LIMIT`, five).
 *
 * A full hand throws the next draw away: `drawSkillCard` refuses and the card stays in the pool. So
 * holding on has stopped being worth anything, and anything at all beats losing a card a turn.
 */
export const PLAY_AT_FULL_HAND = 1;

/**
 * The bot the game ships with. **Every number below was chosen by the arena**, and two of them are
 * zero because the arena said so.
 *
 * The three weights are multipliers on the three correction terms in `scoreMove`, in the layer's one
 * currency, so `riskWeight: 1` means "a pawn I am 30 % likely to lose is worth 30 % of a pawn less to
 * me", which is simply the expected value. A weight above 1 is a bot more afraid than the arithmetic
 * says it should be, and below 1 is a braver one.
 *
 * ## What the measurement said, and why two weights are off
 *
 * Every run is in `notes/09-source-code-overview.md` next to the command that produced it. In short,
 * measured one term at a time against the same build with that term off:
 *
 * - **Opportunity loses, clearly.** A bot that goes out of its way to stop within a roll of an enemy
 *   takes more captures and wins fewer matches. Chasing a capture costs more tempo than the capture is
 *   worth, and Ludo is a race. It was first written as an absolute rather than a difference, which is a
 *   real defect and was fixed, and fixing it changed nothing: the term loses in both forms.
 * - **The landing bonus loses.** Detouring onto a skill field for a card, and round somebody else's
 *   Banana Peel, costs more than it buys.
 * - **Danger is a draw.** Over 1200 matches it wins as often as the bot without it while losing
 *   noticeably fewer pawns.
 *
 * **Danger is shipped on although it does not win, and that is a product decision rather than a
 * measurement.** It costs nothing measurable and it removes the two blunders a person watching a bot
 * actually notices: parking a pawn one field in front of an opponent, and walking out of the yard onto
 * an entry field with pawns queued up behind it. A bot that visibly blunders is a worse opponent to
 * play against than its win rate says. Written down as a judgement so that the next person to run the
 * arena is not surprised to find a term that pays for itself in nothing but appearances.
 */
export const DEFAULT_PROFILE = Object.freeze({
  /** How hard the bot avoids parking a pawn where it can be captured. Measured: a draw. */
  riskWeight: 1,
  /** How hard it goes out of its way to land within a roll of an enemy pawn. Measured: it loses. */
  opportunityWeight: 0,
  /** How much it cares what is lying on the field it lands on. Measured: it loses. */
  landingWeight: 0,
  /** What a card has to be worth to be played. See `PLAY_AT`. */
  playAt: PLAY_AT,
  /** The same, with a full hand. See `PLAY_AT_FULL_HAND`. */
  playAtFullHand: PLAY_AT_FULL_HAND,
  /** What one skill card in hand is worth. See `score.js`. */
  cardWorth: CARD_WORTH,
  /** What losing a turn costs. See `score.js`. */
  stunWorth: STUN_WORTH,
  /** What a round of standing still costs. See `score.js`. */
  lockCost: LOCK_COST,
  /** What one pawn stopped by a wall is worth. See `score.js`. */
  blockWorth: BLOCK_WORTH,
  /** What forcing an opponent to move the wrong pawn is worth. See `score.js`. */
  tauntWorth: TAUNT_WORTH,
  /** How much of a turn No Take-Backsies protects. See `values-roll.js` for the argument behind it. */
  lockoutShare: 0.15,
});

/**
 * The move scorer as it was before the bot tactics plan: all three correction terms switched off.
 *
 * **This is the control group and it must keep meaning that.** A knob added later gets its old value
 * here, not its new one, or the arena stops comparing what it claims to compare.
 *
 * It is the control for the **move scorer** and not for the whole bot, and the difference matters when
 * reading a run: the card values changed too (the lead weighting in `share`, the trap search, Nühü's
 * four receiving-end values) and none of those is behind a knob, so both sides of every comparison
 * carry them. Putting them behind knobs is outstanding work, and until it is done the arena has
 * nothing to say about whether they helped.
 */
export const PLAIN_PROFILE = Object.freeze({
  ...DEFAULT_PROFILE,
  riskWeight: 0,
  opportunityWeight: 0,
  landingWeight: 0,
});

/** Every correction term on, which is what the plan designed and what the arena measured. */
export const FULL_PROFILE = Object.freeze({
  ...DEFAULT_PROFILE,
  riskWeight: 1,
  opportunityWeight: 1,
  landingWeight: 1,
});

/**
 * A profile with some knobs overridden, frozen, with every other knob at its default.
 *
 * Frozen because a profile is passed down through a dozen functions and something quietly writing to
 * one halfway through a match would be a bug nobody could reproduce.
 */
export function makeProfile(overrides = {}) {
  return Object.freeze({ ...DEFAULT_PROFILE, ...overrides });
}

/**
 * The profile that applies to one seat.
 *
 * A caller may pass a plain profile, which every bot at the table then plays with, or a function from
 * a seat to a profile, which is how the arena seats a new bot against an old one **in the same
 * build**. Keeping the old bot around as a copy of the old code was the alternative and it is worse in
 * every way: it goes stale, it doubles the file count, and it cannot be reviewed.
 */
export function profileFor(profile, seat) {
  const chosen = typeof profile === "function" ? profile(seat) : profile;

  return chosen ?? DEFAULT_PROFILE;
}
