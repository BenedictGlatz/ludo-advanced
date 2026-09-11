# Handoff 11, brief: the roll

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-03
**Read against:** `3a8c8bc`, on branch `fix/layout-stage-and-fan`. Every line number below is that tree
**Issue:** none. A feature request from the Product Owner, and half of a `must have` requirement
underneath it
**Answers:** nothing. **D70 to D74**

---

## 0 What was asked for, and what it turned out to be

The request was one sentence: **the roll animation is boring, a number just appears.**

That is exactly what happens, and the description is kinder than the situation. Looking for the place
to put a better animation found that there is no animation to improve and no moment to put one in.

| What was asked for | What is actually there |
| --- | --- |
| "a number just appears" | Correct, literally. `.card__result` is hidden by `:empty { display: none }` in `card-state.css` lines 32 to 34, the view writes text into it, and the number is on screen. No keyframe, no transition, no token, in any file |
| (not reported) | **The roll has no moment of its own at all.** `advance()` in `game-loop.js` lines 209 to 213 rolls and carries straight on in the same synchronous pass, so the number is painted in the same frame as everything else that turn did |
| (not reported) | **A roll that cards changed is an unexplained number.** `state.rollSteps` records the whole chain, the sentences for it are translated into both languages, and **no file under `src/ui/` reads either.** That is NFR-08, a `must have` |

So this is not one animation. It is a moment that does not exist, a badge that cannot animate, and an
explanation that is built and unread.

---

## 1 Why the roll has no moment, and why that is our fault rather than a missing stylesheet

`game-loop.js` lines 26 and 27 describe the `roll` phase in its own words:

> **`roll` rolls itself.** There is nothing to decide there. The phase exists so that the on-roll
> reaction window has a moment to open in, and so a roll animation has something to hang off.

The first half is true. The second half is not: nothing hangs off it. `advance()` is synchronous and
re-entrant, so one player click runs the whole rest of the turn before the browser paints once:

| Step | Where | What the DOM gets |
| --- | --- | --- |
| The player clicks a dice card | `turn-controls.js` lines 38 to 44 | `chosenDie`, phase `action` |
| The action phase is skipped when no card is playable | `game-loop.js` lines 200 to 207 | phase `roll` |
| The die is rolled | `game-loop.js` lines 209 to 213 | `roll`, `rollSteps`, phase `act` |

Every one of those calls `render()`, and the browser paints the last one. What a player sees is a
single frame in which the kept card lifts, **the two cards nobody kept start flying back to the pool**
(`hand.css` lines 142 to 149, `data-resolved`), and the number is already sitting on the kept card.
The three things that make up "you rolled" happen at once, and the one the player is waiting for is
the one with no motion attached.

**There is one case where a pause already exists, and it is not an animation.** `handleRollDie` in
`intents.js` lines 116 to 123 opens the on-roll reaction window **before** rolling, because Critical
Failure, Devil Die and Hold Pawn are all played "as any player rolls" and have to be played before the
number is known. When such a window opens, the roll waits for it and happens on window close
(`intents.js` lines 161 to 164). So the game already knows how to stop in front of a roll. It just
never does it for the roll's own sake.

---

## 2 What the repository already decides about the roll, so nothing is answered twice

This section exists because of the D59 accident: a question was answered twice, in two files, and
neither side could see the other. It is the standing § 2 from brief 08 on.

| Already decided | Where | Status in this brief |
| --- | --- | --- |
| **The number goes on the card that produced it**, as a cream ink-outlined badge in the top right of the art window | D32, `card-state.css` lines 11 to 30 | **Confirmed, not reopened.** D71 may animate it and may not move it |
| **The board deliberately does not show the roll.** `data-roll` on `.board` is a test hook and says so | `board-view.js` lines 199 to 201, and the attribute at line 210 | **Confirmed.** "The number itself belongs to the dice hand" |
| Three motion budgets and their split: `--motion-feedback` 90 ms is the NFR-11 first-response budget, `--motion-move` 240 ms, `--motion-capture` 320 ms | D8, `tokens.css` lines 160 to 162 | The precedent D70 argues against |
| Two hold tokens that are reading time rather than movement, and that deliberately sit **outside** the `prefers-reduced-motion` block | D20 and D60, `tokens.css` lines 187 and 194, block at 266 to 279 | The other precedent D70 argues against |
| The three cards arrive and the two unkept ones travel back, both on `--motion-move` | D31, `hand.css` lines 112 to 153 | **Works. Not reopened**, except where D71 collides with it in time |
| The dice row is **excluded** from the hover reveal on purpose | D66, `card-reveal.css` lines 17 to 20 | Unchanged. This brief asks for nothing on hover |
| The card carries a transition on `transform`, `box-shadow`, `filter` and `opacity`, and the selected and hover states write `transform` | `card.css` lines 45 to 49, `card-state.css` lines 40 to 51 | The thing D71 option 2 has to share the property with |

---

## 3 The measurements

Read off the files, not off a screenshot. `app.css` line 47 sets the root text size to
`min(100vw / 100, 100vh / 56.25)`, which at the design resolution of 1440 by 900 is **14.4 px**, and
`hand.css` line 31 sets the dice hand's `--card-u` to **0.76**.

| Thing | Where | At 14.4 px and 0.76 |
| --- | --- | --- |
| A dice card | `card.css` lines 34 and 35, `--card-u * 16.25rem` at 260/380 | 177.8 by 259.9 px |
| The card's own text size | `card.css` line 38, `--card-u * 1rem` | 10.94 px |
| The badge | `card-state.css` lines 18 and 19, `--card-u * 2.75rem` | 30.1 by 30.1 px |
| The number in it | `card-state.css` line 22, `1.625em` of 10.94 px | 17.8 px |
| The badge's offset from the card's top right | `card-state.css` lines 13 and 14 | 30.1 px down, 8.2 px in |
| The gap between the three cards | `hand.css` line 32, `--card-u * 0.75rem` | 8.2 px |
| **How long the roll takes today** | nowhere | **0 ms** |

One consequence worth having in front of you before D71: **the badge is 30 px square and the digits in
it are 17.8 px.** A roll can be two digits, and since issue #38 it can be larger than the die's
maximum, so `min-width` and the padding at `card-state.css` line 20 are what a three-digit result
would grow into.

---

## 4 The half of the roll that nobody can see

`state.rollSteps` is written on every roll (`turn-manager.js` lines 143 to 162, the field at
`game-state.js` line 228) and holds the trace of the chain in `core/roll.js` lines 141 to 181. Nine
kinds of step exist (`roll.js` lines 55 to 74):

| Step | What it means | Card |
| --- | --- | --- |
| `base` | One ordinary roll | none |
| `fixed` | The roll was named instead of rolled | FR FR |
| `advantage` / `disadvantage` | Rolled twice, higher or lower kept | Critical Success, Critical Failure |
| `add-die` / `sub-die` | An extra die added or subtracted | Angel Die, Devil Die |
| `missed` | A threshold was not cleared and the roll collapsed to zero | 67 |
| `multiplier` | The result multiplied | Speedrun Any% |
| `floor` | The result would have gone below zero and was held there | any |

The sentences are already written, in both languages, at `src/i18n/locales/en/ui.json` lines 153 to
164 and the same lines in `de`. "Plus a D8: 5", "Rolled twice, higher: 17", "Times 2: 22".

**Nothing reads any of it.** Not the trace, not the sentences. `rollSteps` appears in `src/` only where
it is written, and the only other reader in the repository is a unit test. So a turn in which a player
plays Critical Success, Angel Die and Speedrun Any% ends with a 44 on a D20 card and no account of
where 44 came from. `turn-manager.js` line 137 says the trace exists "so the screen can explain a
number that three cards had a hand in (NFR-08)", and the screen does not.

**Two gaps of ours go with that, and they are ours to fix rather than yours to answer.** `missed` has
no locale key in either language, so eight of the nine steps are translated. And `turn.rolled`,
"Rolled: {{roll}}" and "Gewürfelt: {{roll}}", sits in both files and is read by nothing.

**This is why the request was widened.** The Product Owner chose to ask about the arrival of the number
and the explanation of it in one brief, because an animation designed without the breakdown in mind has
to be designed a second time when the breakdown arrives.

---

## 5 The DOM contract we offer

| Selector | Meaning | Why it is new |
| --- | --- | --- |
| `.hand--dice[data-rolling="true"]` | The roll is happening now | The exact twin of `data-dealing`, which `hand.css` line 128 already animates. Restarting it needs the attribute removed, a reflow forced and the attribute put back, which is `replayDeal` in `dice-hand-view.js` lines 60 to 64, already written and already gated to fire once per turn at lines 92 to 95 |
| The same attribute on `.card[data-selected="true"]` instead | The roll is happening on the one card that produced it | Offered as the alternative, because D71 may want the animation on the card rather than on the row. Say which, and it is one line either way |
| An element for the breakdown of § 4 | Where the chain is read | We do not name it, because D73 decides whether it is on the card, in the message strip, or somewhere else. **Name it in the spec and we build it**, which is a much smaller change than a stylesheet built on a guess |
| A placeholder or an attribute in place of `:empty` on `.card__result` | The badge can be transitioned into | See D72. We will make whichever change the answer needs |

Two things we are **not** offering, so they are not assumed:

- **No new grid row.** `app.css` lays the page out as a fitted 16:9 stage with five rows (D62, still
  awaiting confirmation in handoff 09). There is no spare row, and asking for one reopens D35.
- **No string in CSS.** The number and every sentence in § 4 are text a player reads, so NFR-03 keeps
  them in the DOM. No `content:`, no `attr()`.

---

## 6 The five open decisions

### D70. Does the roll get a moment of its own, and what measures it?

Today it gets none. The project has a precedent pointing each way, which is why this is asked first.

1. **Is it a movement or a hold?** A movement is `--motion-move`'s kind: it runs and the game carries
   on around it. A hold is `--motion-trap-hold`'s kind: **the game waits, and the loop is what waits.**
   D60 chose a hold for a trap going off, and its reason reads almost word for word here, because a
   trap and a roll are both something that arrives rather than something the player is doing.
2. **How long?** If it is a movement, is `--motion-move` right, or does the roll need its own token?
   D68 is the precedent that a new duration gets a number rather than being invented in a stylesheet.
3. **What happens under `prefers-reduced-motion`?** D12's rule is that loops stop and feedback stays.
   The two hold tokens sit outside that block deliberately, because a player who asked for less
   movement has not asked for less time to read. A roll is arguably both.

The three parts are one decision because they are one piece of code: a movement is a stylesheet and
nothing else, a hold is a stylesheet plus a wait in `game-loop.js`, and the reduced-motion answer
decides whether that wait can be skipped.

### D71. What does the roll look like, and by which mechanism?

The core question, and we are not choosing, because all three routes are a look. Here is what each one
costs, so the choice is made against real numbers.

**Option 1, the number arrives in the badge.** The digits settle, tumble, count, or land, inside the
badge that D32 already put on the card.

- Cheapest by a wide margin. No new element and no new view code.
- Cost: § 3's measurement. The badge is 30.1 px square and the digits are 17.8 px, so whatever happens
  happens in a field smaller than the fingertip pointing at it.
- Cost: it cannot start from nothing, which is D72.

**Option 2, the card performs the roll.** The kept card tips, shakes, settles, and the number is there
when it comes to rest.

- No new element either, and it uses the whole 177.8 by 259.9 px of the card rather than 30 px of it.
- Cost, and it is a real one: `card.css` lines 45 to 49 already transition `transform`, and
  `card-state.css` lines 40 to 51 already write `translateY` for the playable, hover and selected
  states. A keyframe on `transform` replaces those values rather than adding to them, so the animation
  and the lift have to be reconciled rather than layered. `card-reveal.css` lines 14 and 15 hit exactly
  this and solved it by using `scale` instead of `transform`, which is the precedent worth reading.
- Cost: `hand.css` lines 142 to 153 are moving the other two cards at the same time. Say which of the
  two goes first, or that they overlap.

**Option 3, a die as its own object.** The first thing in the game that depicts a die rather than a
card with a number on it.

- Cost: a new element, new view code, and § 5's "no new grid row". It has to live inside a region that
  already exists, over the board, or on the card.
- Cost: it is the only one of the three that could contradict D32 by putting the number somewhere else
  for a moment. If it does, say what happens to the badge, because the badge is what stays.
- Gain, and it is the reason the option is here: it is the only one where **rolling reads as an action
  the player took** rather than as a value appearing. FR-33's wording is that rolling "produces visible
  feedback", and a tumbling die is the one answer nobody has to be taught.

Whichever it is, four things need saying with it:

- **What happens to the two cards nobody kept**, given § 1. They are travelling back to the pool in the
  same instant today.
- **Whether the kept card is still the subject.** D32 says the number belongs on the card that produced
  it, and we would rather confirm that than discover it was quietly dropped.
- **Whether the three cards move as a row or the one card moves alone**, which is what picks between
  the two selectors in § 5.
- **What is on screen while the roll is running**, if D70 makes it a hold. A hold means the player is
  looking at something for a stated time, and "nothing yet" is a poor thing to look at.

### D72. The badge cannot animate out of nothing

`card-state.css` lines 32 to 34 hide the badge with `:empty { display: none }`. An element with
`display: none` has no transition and no animation: there is no start state to move from. So the
arrival needs a different mechanism, and this is the one question in the brief where every answer is
also a small change to our code, which is why it is asked separately rather than folded into D71.

The routes we can see, and there may be a fourth:

1. `:empty` stays and the animation runs on an ancestor or a pseudo-element instead.
2. `:empty` stays and the badge holds a placeholder while the roll runs, so it is not empty. That
   placeholder would be a character a player can read, so NFR-03 makes it ours to put in the DOM and
   yours to name.
3. `:empty` goes, the badge is always in the layout, and its visibility hangs on an attribute we write.
   The cost is that a hand of three then has three invisible badges taking space in the card's box.

### D73. How does a roll that cards changed read?

§ 4 is the whole background. Four parts.

1. **Where does the breakdown live?** The stage has no spare row. The candidates we can see are the
   card itself, which is 177.8 px wide and already carries a title, a type label, two tags and the art;
   and the message strip, which since D55 has two voices on the `data-message-kind` seam and is already
   the place the game explains itself in a sentence. Either is fine and they need different files.
2. **Do the steps arrive one after another, or together?** One after another is the explanation a player
   would give out loud, and it costs time, which makes it a D70 question as well. Together is one
   paint and no timing.
3. **What happens on an ordinary roll?** This is the case that matters, because it is almost all of
   them: no cards played means exactly one step, `base`, and "D8: 5" next to a badge reading 5 is noise.
   Say whether the breakdown appears at all below some number of steps.
4. **Does it stay or go?** A refusal holds for four seconds and a trap for two, both because they
   arrive unasked. A breakdown arrives unasked too, but the player is also about to move a pawn.

### D74. What survives reduced motion, and what survives the test suite?

The second half is our problem and is in the brief anyway, because it constrains the answer.

1. **Reduced motion.** D12's rule, and D70 part 3 asked half of this. What is left here is the
   breakdown specifically: if D73 makes it sequential, a player with `prefers-reduced-motion` gets
   either the whole chain at once or a sequence that no longer moves. Say which.
2. **A duration the suite can switch off.** `main.js` line 108 is
   `FAST_DELAYS = { afterMove: 0, afterRefusal: 0, afterTrapCard: 0, reaction: 0 }`, passed at line
   170 when the address bar carries `?fast=1`. Every end-to-end spec drives turns through that, and a
   hold with no key in that object makes the whole Playwright suite wait for it once per turn. If D70
   answers "hold", **this brief promises a fifth key in that object**, and what we need from you is
   only the confirmation that skipping the wait entirely in a test run is acceptable rather than a
   figure that has to be honoured everywhere.
3. **The 90 ms budget.** NFR-11 is on the *first* visible response, not on the whole animation. If the
   roll becomes a two-second event, say what answers inside 90 ms, the way D68 kept the lift out of
   `--motion-reveal-delay` for exactly this reason.

---

## 7 The rules that apply to the delivery

The five standing ones from `00-open-requests.md` § 5, unchanged: no user-facing string in a
`content:` property; no CSS file over 300 lines after `npm run format`; built once, then only
attributes rewritten; two skins from the tokens with `prefers-reduced-motion` respected; and **no em
dash**, in the spec or in a CSS comment, neither the character nor the rhetorical habit.

Four that are specific to this one:

6. **Room is tight in the two files this lands in.** Measured on `3a8c8bc`: `tokens.css` is at 281
   lines and `card-state.css` at 122, so those have 19 and 178 lines of headroom. `hand.css` is at
   208 and `card.css` at 238. **`tokens.css` is the one to watch**: if D70 and D73 both want a token,
   19 lines with their comments is not much, and a split has never been done on that file. If it needs
   one, name the seam rather than dropping the comments.
7. **Name what is superseded, by file and line.** Standing request since handoff 08. D71 option 2 in
   particular would take over rules in `card.css` and `card-state.css` that D29 put there.
8. **Say which of the three options in D71 you took, and why the other two lost.** The three differ in
   cost by a large factor, so the reason is worth more than usual, and the rejected alternative is the
   part the report is graded on.
9. **Name the commit you read us against.** `3a8c8bc` is at the top of this file. Handoff 10's package
   said "the working tree of 2026-09-03", which had four commits in it, and five stylesheets had to be
   merged by hand instead of copied in. Writing "read against `3a8c8bc`" is checkable by this side in
   one command.

---

## 8 What is out of scope

- **D32's placement.** The badge is on the card that produced the roll, and that is confirmed above
  rather than asked again.
- **The deal and the return.** D31, `hand.css` lines 112 to 153. Both work. They are in this brief only
  where they share the same instant as the roll.
- **The pawn's movement.** D8, `--motion-move`. The roll ends where the move begins and neither is the
  other.
- **The hover reveal.** D66 excluded the dice row from it on purpose and nothing here reopens that.
- **Sound.** Issue #40, deferred out of epic #39 on 2026-09-01. A rolling die is the most obvious
  sound in the game and it is still not being asked for.
- **The dice card pool overview.** D43 to D47, closed, and it shows the same component. If your answer
  targets `.card` rather than `.hand--dice .card`, say explicitly whether the overview inherits it.
- **The reaction window in front of the roll.** § 1 describes it because it is the one pause that
  exists. What it looks like is D35's prompt strip and the still-open countdown leftover, neither of
  which is asked here.

---

## 9 The landing checks

The five standing ones, plus:

6. **`npx playwright test tests/e2e/dice-hand.spec.js`.** Two of its cases read the badge directly,
   one asserting it holds the roll and one asserting all three are empty again on the next turn, and a
   third drives the whole choice from the keyboard. They must stay green, or the spec must say which
   is superseded and what replaces it.
7. **`npx playwright test tests/e2e/pawn-moves.spec.js` and `capture.spec.js`.** Both drive turns
   through helpers that poll on attributes rather than sleeping. A roll that holds without a
   `FAST_DELAYS` key shows up here as flake rather than as a failure, which is the worse of the two.
8. **A new `tests/e2e/roll-animation.spec.js`**, which we write once the spec lands. It will assert
   that the roll has a state of its own on screen, that the breakdown appears when cards changed the
   roll and not when they did not, and that both survive `prefers-reduced-motion`. **There is no test
   on the roll's timing today at all**, and there is no unit test for `dice-hand-view.js` or
   `card-view.js` either, which is why § 1 was never noticed.
9. **1440 by 900**, the design resolution, and one check below the 84rem breakpoint where the stage is
   off and the regions stack. An animation with a hold behaves differently on a page that can scroll.
