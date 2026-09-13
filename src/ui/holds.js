/**
 * How long the game waits, and why. Split out of `timers.js` on 2026-09-06.
 *
 * `ui/` only. `timers.js` was two things in one file: a `setTimeout` registry keyed by name, and the
 * functions that answer **how long** each named wait lasts. The seam is the one that file's own header
 * already described in those words ("the loop decides *that* it waits, this module decides *how
 * long*"), and design spec 18's cast hold was the sixth wait, which would have taken the file past
 * NFR-02's 300 lines.
 *
 * So: `timers.js` keeps the registry, and every duration lives here.
 *
 * ## What every function in this file has in common
 *
 * Each one reads its number out of `tokens.css` through the `readToken` the caller hands it, so the
 * **design owns the value** and this module owns only the choice of token. The exported constants are
 * the fallbacks for a test harness with no stylesheet loaded, and they are deliberately not the
 * numbers: a duration that lives in two places goes stale in one of them.
 *
 * Every one of them is also overridable through `delays`, which is what lets a Playwright run take
 * seconds instead of minutes. `?fast=1` sets them all to zero, and **the shape of the turn is
 * identical either way**: nothing in the game state depends on a hold, no rule branches on one, and no
 * value changes while one runs.
 *
 * ## The two kinds of number, and the line between them
 *
 * A **movement** is inside `tokens.css`'s `prefers-reduced-motion` block and collapses to 1 ms. A
 * **reading time** is outside it and does not, because a player who asked for less movement has not
 * asked for less time to read. Every hold in this file is a reading time. That is D20's argument, and
 * `--motion-refusal-hold`, `--motion-trap-hold`, `--motion-roll-hold` and `--motion-cast-hold` are the
 * four tokens that follow it.
 */

import { isBot } from "../state/bots.js";

export const REFUSAL_MIN_MS = 4000;

/**
 * How long to leave the finished turn on screen before the handover screen covers it.
 *
 * Moved out of `game-loop.js` in issue #45, and the seam is not the line count: **the loop decides
 * *that* it waits, this module decides *how long*.** Every other named wait in the game was already
 * here, and this was the last duration left in the loop.
 *
 * Three cases, longest first, because they are checked in order and a refusal outranks a report:
 *
 * 1. **A refusal** holds for `--motion-refusal-hold`, which is D20's answer: the strip stays until the
 *    player's next action and at minimum for four seconds.
 * 2. **A trap that went off, or a card an aura cancelled** get the same hold. This is new in issue #45
 *    and it is the point of the whole announcement: a Banana Peel does not move the pawn, so if the
 *    handover screen covers the board on the ordinary move timer, the only evidence that a turn was
 *    taken away is gone before anybody reads it. It is exactly the argument D9 made for a refusal,
 *    applied to something that happened rather than something that was refused.
 * 3. **An ordinary move** waits `--motion-capture`, long enough for the piece to finish travelling.
 *
 * Both durations are read out of `tokens.css` rather than written here, so the design owns the numbers.
 * `delays` lets a test override either without a stylesheet, and `REFUSAL_MIN_MS` is the fallback when
 * no stylesheet has loaded at all.
 *
 * A trap fired **mid-turn** by a card is the other half of this and it is `holdMidTurn` below. It was
 * open as D60 of design brief 07 when this comment was first written; design spec 07 answered it on
 * 2026-09-03 with a shorter number and its own token.
 */
export function holdAfterTurn(state, delays, readToken) {
  if (state.refusalReason !== null) {
    return delays.afterRefusal ?? readToken("--motion-refusal-hold", REFUSAL_MIN_MS);
  }

  if (announcement(state) !== null) {
    return delays.afterTrap ?? readToken("--motion-refusal-hold", REFUSAL_MIN_MS);
  }

  return delays.afterMove ?? readToken("--motion-capture", 320);
}

/**
 * How long a mid-turn announcement is guaranteed on screen. The fallback, not the number.
 *
 * D60 puts the number in `--motion-trap-hold`, and this is what to use when no stylesheet has loaded,
 * which happens in a test harness rather than in a browser. Same arrangement as `REFUSAL_MIN_MS`.
 */
export const TRAP_HOLD_MS = 2000;

/**
 * What the message strip is currently announcing, or `null`.
 *
 * One definition, because three callers need the same answer and two of them are in another file. A
 * trap that went off outranks a card an aura cancelled, which matches the order `move-hints.js` prints
 * them in: both cannot be true of one event.
 *
 * **It returns the value and not a boolean**, and `card-controls.js` depends on that. The value is the
 * frozen object `resolveMove` produced, so comparing two calls by identity answers "is this still the
 * same announcement I already held for", which is what stops one announcement being held twice.
 */
export function announcement(state) {
  return state.trapFired ?? state.nullifiedCard ?? null;
}

/**
 * The same question mid-turn, and since 2026-09-06 it is the same answer.
 *
 * ## A bot's card play used to be counted here, and the cast took it away
 *
 * Issue #82 added `botCardPlayed` to this function, on the argument that a card played by nobody the
 * player can see has to be announced: the strip said one sentence and the turn held two seconds for
 * it. **Design spec 18's cast is that announcement, and a better one**, so the two seconds moved to
 * the cast rather than stacking on top of it. Leaving both in would add two seconds to every bot turn
 * that plays a card, on top of the 1.5 second cast, on top of the 900 ms the bot already pauses
 * before it acts.
 *
 * A **fired trap** keeps its own hold, because a trap is a second event that the cast did not show:
 * the cast draws the card landing, and the trap goes off afterwards.
 *
 * **The two functions stay two functions**, which is the decision in this file worth reading twice.
 * `holdAfterTurn` asks `announcement` as well, so a turn that fired a trap mid-turn does **not** get
 * the four-second refusal hold at the handover on top of the two seconds it already took.
 *
 * Returns the same identity on two calls with the same state, so `card-controls.js` can compare them
 * and hold one announcement once. `trapFired` is a frozen object on the state.
 */
export function midTurnAnnouncement(state) {
  return announcement(state);
}

/**
 * The card a bot just played, or `null`. A person's own card play is not an announcement.
 *
 * No longer part of `midTurnAnnouncement` since 2026-09-06 (see above), and still exported, because
 * `move-hints.js` writes the sentence the strip prints and that sentence is unchanged: the cast
 * replaced the **hold**, not the words.
 */
export function botCardPlayed(state) {
  const played = state.lastCardPlayed ?? null;

  return played !== null && isBot(state, played.seat) ? played : null;
}

/**
 * How long to hold the turn after a card announced something, before carrying on. `0` means carry on now.
 *
 * The other half of `holdAfterTurn`: that one is asked when the turn has ended, this one mid-turn.
 *
 * ## Why the two are different numbers
 *
 * D60's argument, and it is D20's with a shorter answer. A refusal follows the player's own click, so
 * they are already looking at the board and four seconds is a minimum for reading something they asked
 * for. A trap fired by a card interrupts a turn that is under way and arrives unasked, so what it needs
 * is a **guaranteed** window rather than a long one. Two seconds cannot be missed and does not turn a
 * turn with two traps in it into a slideshow.
 *
 * ## Why a refusal gets nothing here
 *
 * `holdAfterTurn` holds for a refusal and this deliberately does not, which is the one place the two
 * functions are not symmetrical. A refusal mid-action-phase is not an announcement: the player asked for
 * something and was told no, and they are still holding the controls. Copying the branch across would be
 * the natural mistake and there is a test pinning it.
 *
 * `--motion-trap-hold` is a reading time and not a motion, which is why the token sits outside
 * `tokens.css`'s `prefers-reduced-motion` block: a player who asked for less movement has not asked for
 * less time to read.
 */
export function holdMidTurn(state, delays, readToken) {
  if (midTurnAnnouncement(state) === null) return 0;

  return delays.afterTrapCard ?? readToken("--motion-trap-hold", TRAP_HOLD_MS);
}

/**
 * How long the roll stays on screen before the turn carries on. D70 of design spec 11. The fallback, not
 * the number.
 *
 * `--motion-roll-hold` is where the 900 ms live, and this is what to use when no stylesheet has loaded.
 * Same arrangement as `REFUSAL_MIN_MS` and `TRAP_HOLD_MS`.
 */
export const ROLL_HOLD_MS = 900;

/**
 * How long to hold the roll before the turn carries on.
 *
 * The third of this module's three waits, and the only one with no condition in it: **a roll that
 * happened always gets its moment.** The other two ask the state a question first, because a turn can end
 * with nothing to report and a card can announce nothing. A roll cannot happen and be nothing.
 *
 * ## Why the roll needed a wait at all, which is D70 and not obvious
 *
 * The request was that the roll is boring. What was underneath it is that the roll had no **moment**:
 * `advance()` rolls and carries straight on in the same synchronous pass, so the number was painted in the
 * same frame as the kept card's lift and the two unkept cards flying back to the pool. A stylesheet cannot
 * make a moment out of a frame that has already been painted, which is why this is a wait the loop takes
 * and not a keyframe somebody could have added without touching any JavaScript.
 *
 * ## Why it is `state`-free where its two siblings are not
 *
 * `holdAfterTurn` and `holdMidTurn` both take the state, because both have to decide **whether** to hold.
 * The decision here belongs to the caller: `game-loop.js` only asks once the roll has actually produced a
 * number, because the same phase opens the on-roll reaction window first and rolls nothing. Asking the
 * state again here would put that condition in two places.
 *
 * ## Why the hold is longer than the throw
 *
 * `--motion-roll` is 520 ms of movement and this is 900. The extra 380 ms are the number stamping into the
 * badge and then sitting still: D70.2's argument is that a number which appears and is immediately
 * overtaken by the next thing has not been shown, it has been mentioned. It costs about 0.9 seconds per
 * turn, roughly three and a half minutes over a four-player match, which is the price of the feature
 * stated rather than discovered.
 *
 * **The hold is time and not movement**, so `--motion-roll-hold` sits outside `tokens.css`'s
 * `prefers-reduced-motion` block while `--motion-roll` collapses to 1 ms inside it. That is D20's and
 * D60's argument and this is the third token to use it: a player who asked for less movement did not ask
 * for less time to read.
 */
export function holdRoll(delays, readToken) {
  return delays.roll ?? readToken("--motion-roll-hold", ROLL_HOLD_MS);
}

/**
 * How long a played skill card's cast holds the turn. Design spec 18, D108 and D111. The fallback,
 * not the number.
 *
 * `--motion-cast-hold` is where the 1500 ms live, and this is what to use when no stylesheet has
 * loaded. Same arrangement as the three constants above it.
 */
export const CAST_HOLD_MS = 1500;

/** The board stage's own duration, subtracted for a card that never reaches the board. */
export const CAST_BOARD_MS = 560;

/**
 * How long to hold the turn while a played card has its moment.
 *
 * ## Two numbers and one token, which is D108's arrangement and not an oversight
 *
 * A cast is two stages: the card on a stage over the board, and the effect landing on the board. The
 * 12 cards that change a roll, a hand or a window have **nothing to land**, so their cast is the card
 * stage alone and it costs the hold minus the board stage: 940 ms, which is the roll's own moment
 * within 40 ms. That is a subtraction and not a fourth token, because it is not a fourth number.
 *
 * ## Why it is a reading time and not a movement
 *
 * D111, and it is D20's and D70's argument for the fourth time. The card on the stage is the only
 * 1.5 seconds in which the fact that a card was played is anywhere the other players are looking. A
 * player who asked for less movement did not ask for less time to see what was played, so
 * `--motion-cast-hold` sits **outside** `tokens.css`'s `prefers-reduced-motion` block while the two
 * stage tokens inside it collapse to 1 ms. Under reduced motion the card is on the stage in frame one
 * and simply stands there for the hold.
 *
 * `?fast=1` sets it to zero, and the sequence is identical either way: every state is still visited,
 * and only the waiting is gone.
 */
export function holdCast(delays, readToken, { hasBoardStage }) {
  const hold = delays.cast ?? readToken("--motion-cast-hold", CAST_HOLD_MS);
  if (hasBoardStage || hold <= 0) return hold;

  return Math.max(0, hold - (delays.castBoard ?? readToken("--motion-cast-board", CAST_BOARD_MS)));
}

/**
 * How long a bot appears to think before it plays. Issue #43. The fallback, not the number.
 *
 * Same arrangement as the three constants above it, and the same reason: this is what to use when no
 * stylesheet has loaded, which happens in a test harness rather than in a browser.
 */
export const BOT_HOLD_MS = 900;

/**
 * How long to wait before dispatching a bot's intent. The fourth wait in this module.
 *
 * ## Why a bot waits at all
 *
 * The bot decides instantly, and instantly is unreadable. Without a pause a bot's whole turn (pick a
 * card, roll it, move a pawn) is painted inside one synchronous pass, so a player watching three
 * opponents would see the board jump from their own move to their next one. That is D70's argument
 * about the roll, applied to a whole turn: something which happens and is immediately overtaken has
 * not been shown, it has been mentioned.
 *
 * ## Why it reuses `--motion-roll-hold` instead of getting its own token
 *
 * `CLAUDE.md` is explicit that Claude Code does not invent design rules, and a duration in `tokens.css`
 * is a design rule. `--motion-roll-hold` is the one existing token that means "reading time for a
 * decision the turn hangs on", which is exactly what this is, so borrowing it states the intent without
 * deciding anything Design has not. **Whether the bot deserves a token of its own, whether 900 ms is
 * right, and whether the pause belongs per intent or per turn are D81**, and until that is answered the
 * borrowed token is the honest placeholder.
 *
 * Rejected: *a constant inside `bot-driver.js`.* It cannot be overridden, so every end-to-end run with
 * a bot in it would pay 900 ms per intent, and a duration living outside `tokens.css` is precisely what
 * D20 and D70 were raised to remove.
 */
export function holdBot(delays, readToken) {
  return delays.bot ?? readToken("--motion-roll-hold", BOT_HOLD_MS);
}
