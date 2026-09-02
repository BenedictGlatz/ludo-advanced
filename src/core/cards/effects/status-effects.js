/**
 * The six cards that leave something behind on a pawn. Issue #38, requirements FR-26 and FR-28.
 *
 * Pure `core/`: every function takes a snapshot and returns a patch. See
 * [../context.js](../context.js) for both shapes.
 *
 * ## Why these are together
 *
 * Every one of them writes a single entry into `statuses` and nothing else. The rule that makes the
 * status *do* something lives in `core/move-rules.js`, which reads the list when it works out what a
 * pawn may do. That split is worth stating: **a card writes a fact, movement reads it.** No card
 * contains a movement rule, and no movement rule knows a card by name.
 *
 * | Card | Status | Lasts | Read by |
 * | --- | --- | --- | --- |
 * | Hold Pawn | `held` | This turn | `evaluatePawn` drops the pawn |
 * | The Purge | `purge` | One round | `moveOnto` stops treating an own pawn as a blocker |
 * | Rock | `rock` | Two rounds | `blockedSquares` follows the pawn |
 * | Lock In | `locked` and `armoured` | One round | `evaluatePawn` and `moveOnto` |
 * | Built Different | `armoured` | Two rounds | `moveOnto` refuses to land on it |
 * | Ragebait | `ragebait` | One round | `applyRagebait` filters the move list |
 *
 * ## Every duration is in rounds, and one is in turns
 *
 * `turnsForRounds` converts, so a card lasts the same amount of *play* at a two-player table and a
 * four-player one. The exception is Hold Pawn, which lasts exactly the turn it is played into, because
 * that is the whole card: it is a Reaction played into the roll window, and it takes one pawn out of the
 * choice the roll is about to offer.
 *
 * **The lengths themselves are a playtesting question and nothing more.** The artwork prints a number
 * for some cards and not for others; where it does, that number is used. Where it does not, one round is
 * the default and two rounds is used only where one round would mean the card expired before its owner
 * could benefit from it.
 */

import { STATUS, addStatus, turnsForRounds } from "../../statuses.js";

/** How long each status runs, in rounds. One round is one turn per player at the table. */
export const DURATION_ROUNDS = Object.freeze({
  purge: 1,
  rock: 2,
  lockIn: 1,
  builtDifferent: 2,
  ragebait: 1,
});

/** The deadline for a status of `rounds` rounds, starting from the turn it is played in. */
function deadline(context, rounds) {
  return context.turnNumber + turnsForRounds(rounds, context.playerCount);
}

/** One status added to the snapshot's list, as a patch. */
function withStatus(context, status) {
  return { statuses: addStatus(context.statuses, status) };
}

/**
 * One named opponent pawn drops out of this turn's move choice (Hold Pawn).
 *
 * The artwork says "as its turn begins", which is not a reaction to anything: nothing happens at the
 * start of a turn that another player could answer. Read instead as the window the **roll** opens, which
 * is the last moment before the move choice exists and therefore the only moment where holding a pawn
 * changes anything. Recorded as a deviation in the catalogue and in Chapter 05.
 *
 * `until` is the next turn number, so it covers exactly this turn.
 */
export function holdPawn(context) {
  return withStatus(context, {
    kind: STATUS.HELD,
    player: context.target.pawn.player,
    pawn: context.target.pawn.pawn,
    until: context.turnNumber + 1,
    source: "reaction-hold-pawn",
  });
}

/**
 * For one round every landing captures, own pawns included (The Purge).
 *
 * The artwork adds "even pawns already home" and "you may enter an opponent's house". Neither is
 * expressible: a house is private to one player, `isSameSquare` requires the same player, and there is
 * no number that names another player's house square. So the house half is dropped and the rest is the
 * card: an own pawn stops blocking and is captured instead.
 *
 * **Board-wide, so `player` and `pawn` are both `null`.** One entry rather than sixteen, which is the
 * reason `hasStatus` matches loosely upwards.
 */
export function thePurge(context) {
  return withStatus(context, {
    kind: STATUS.PURGE,
    player: null,
    pawn: null,
    until: deadline(context, DURATION_ROUNDS.purge),
    source: "reaction-the-purge",
  });
}

/**
 * One of your own pawns becomes a wall nothing may pass (Rock).
 *
 * The status goes on the **pawn**, not on the square it is standing on, so the wall walks when the pawn
 * walks. `core/move-rules.js` carries the reason: a stored square would be a copy of a pawn position
 * that goes stale silently.
 *
 * Two rounds rather than one, because a blocker that expires before the opponent's next turn has come
 * round is a blocker nobody had to walk into.
 */
export function rock(context) {
  return withStatus(context, {
    kind: STATUS.ROCK,
    player: context.actor,
    pawn: context.target.pawn.pawn,
    until: deadline(context, DURATION_ROUNDS.rock),
    source: "action-rock",
  });
}

/**
 * One of your own pawns cannot be moved and cannot be captured (Lock In).
 *
 * The artwork labels this `DEFENSIVE`, and a card that only stopped you moving your own pawn would be
 * a card that does nothing but hurt its owner. Read as both halves of "locked in": the pawn sits still
 * **and** nothing can touch it. That makes it the answer to a pawn parked one square from home with an
 * opponent closing in, which is the situation the label points at.
 *
 * Two statuses from one card, which is why `addStatus` is called twice.
 */
export function lockIn(context) {
  const until = deadline(context, DURATION_ROUNDS.lockIn);
  const ref = { player: context.actor, pawn: context.target.pawn.pawn };
  const locked = addStatus(context.statuses, {
    kind: STATUS.LOCKED,
    ...ref,
    until,
    source: "action-lock-in",
  });

  return {
    statuses: addStatus(locked, { kind: STATUS.ARMOURED, ...ref, until, source: "action-lock-in" }),
  };
}

/**
 * One of your own pawns cannot be captured (Built Different).
 *
 * The artwork reads "survives one capture". Taken literally the capture is cancelled and the mover still
 * arrives, which puts two pawns on one square and breaks the board's most basic invariant. So the rule
 * is that the pawn cannot be **landed on** at all, and the "once" is replaced by a duration. Recorded as
 * a deviation in the project journal, not as a transcription.
 */
export function builtDifferent(context) {
  return withStatus(context, {
    kind: STATUS.ARMOURED,
    player: context.actor,
    pawn: context.target.pawn.pawn,
    until: deadline(context, DURATION_ROUNDS.builtDifferent),
    source: "action-built-different",
  });
}

/**
 * If a named opponent pawn can move, its owner has to move it (Ragebait).
 *
 * The status is the fact; `applyRagebait` in `core/move-rules.js` is the rule, and it stands down when
 * the taunted pawn has no move at all. A card that could strand a player with no legal move would end
 * their turn for them, which is not what a taunt is.
 */
export function ragebait(context) {
  return withStatus(context, {
    kind: STATUS.RAGEBAIT,
    player: context.target.pawn.player,
    pawn: context.target.pawn.pawn,
    until: deadline(context, DURATION_ROUNDS.ragebait),
    source: "action-ragebait",
  });
}
