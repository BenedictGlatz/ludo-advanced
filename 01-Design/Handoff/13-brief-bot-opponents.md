# Handoff 13, brief: playing against the computer

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-04
**Read against:** `9fb13f4`, on branch `feature/43-bot-opponents`. Every line number below is that tree
**Issue:** #43, bot opponents. Requirement FR-43, and FR-01 for the lower bound of one person
**Answers:** nothing. **D81 to D86**, and D86 is the one that is actually a screen

---

## 0 What has already happened, so the brief is not asking about a plan

**The bot is built and it works.** That is unusual for this loop and it changes what is being asked.
Every earlier brief described something that did not exist yet; this one describes something a player
can already play against, badly dressed. So the questions below are about **what it looks like while it
happens**, and one of them, D86, is about the screen that does not exist yet.

A match started with `/?players=4&bots=3` seats you first and lets the computer play the other three.
A bot picks one of the three drawn dice cards, rolls it, moves a pawn, never plays a skill card, and
always passes when a reaction window reaches it. Nothing about it is currently drawn: it takes its turn
using the same board, the same hands and the same prompt strip a person does.

> **Correction, 2026-09-04, later the same day (issue #82): the paragraph above and the first bullet
> below are out of date, and brief 14 supersedes them.** A bot now plays skill cards in its own turn and
> Reaction cards in other people's, on a rule-based value model, and it answers a reaction window with a
> card when the card is worth more than keeping it. Its hand no longer fills up unspent, which is what
> D82 and D83 were asked about. The rest of this brief still stands: D81, D84, D85 and D86 are unchanged
> and unanswered.

**Two things about it are already decided and are not open questions here.**

- **A bot plays no skill cards.** ~~Agreed with the Product Owner. Card tactics are a separate piece of
  work, so a bot's hand fills up over the match and is never spent.~~ **No longer true as of the same
  day: see the correction above and brief 14.** A bot's hand is now spent as the match goes on, so a
  drawing that assumes a hand of five sitting there for the whole match would be drawing the wrong
  thing.
- **The hand-over screen does not appear before a bot's turn**, and with one person and three bots it
  does not appear at all. There is nobody to hand the keyboard to, so D33's secrecy argument has nothing
  to protect.

---

## 1 Hard constraints

- **No duration invented in code.** `CLAUDE.md` forbids Claude Code from setting a design rule, and a
  duration in `tokens.css` is one. The bot's pause currently **borrows** `--motion-roll-hold`, which is
  D81's whole subject. It is a placeholder with a stated reason, not a choice.
- **No user-facing string outside the locale files** (NFR-03). The two new keys are `player.bot` and
  `player.botNamed`, in both languages.
- **300 lines per file** (NFR-02), and two files are at the limit right now: `game-loop.js` is at
  **exactly 300** and `tests/e2e/helpers.js` at 300. Anything that needs new logic in the loop needs a
  split first, so a decision that costs the loop nothing is cheaper than one that costs it two lines.
- **A stylesheet per screen where a screen earns one**, on the `handover.css` and `menu.css` precedent.
  A setup screen with per-seat controls probably earns one.
- **The dark skin and `prefers-reduced-motion` both have to work**, as for every other component.
- **A reading time is not a movement.** `--motion-refusal-hold`, `--motion-trap-hold` and
  `--motion-roll-hold` all sit outside the `prefers-reduced-motion` block, because a player who asked
  for less movement did not ask for less time to read. Whatever D81 decides inherits that argument.

---

## 2 The DOM contract

What is already in the document and can be targeted today:

| Selector | Meaning | Written by |
| --- | --- | --- |
| `.hud__seat[data-controller="bot"]` | This scoreboard row is played by the computer | `hud-view.js` |
| `.hud__seat[data-controller="human"]` | This one is played by a person | `hud-view.js` |
| `.hud__seat[data-on-turn="true"]` | Whose turn it is. Unchanged | `hud-view.js` |
| `.board[data-active-player="N"]` | The seat on turn, as a number. Unchanged | `board-view.js` |
| `.hud__name` | "Spieler 1", or "Bot 2" | `hud-view.js` |
| `.hand--skill[data-seat]`, `[data-face]` | Whose skill hand is shown, and whether it is face up | `skill-hand-view.js` |
| `.hand--dice`, `.card[data-slot]`, `[data-playable]` | The three drawn dice cards | `dice-hand-view.js` |
| `.pawn[data-movable]`, `[data-selected]` | A pawn that can move, and the one picked | `board-view.js`, `move-hints.js` |
| `.overlay[data-screen]` | Which of the six screens is up | `overlay-view.js` |

**`data-controller` is new and exists for this handoff.** Nothing styles it. It was put in the DOM so
that D85 can be answered without any new markup, and so the end-to-end spec can assert on an attribute
rather than on the German word "Bot".

**Anything D86 needs does not exist yet**, and that is the point of asking. The setup screen today is a
row of three buttons carrying `data-count="2|3|4"`, built by `overlay-screens.js` and rendered by
`overlay-view.js` like every other screen.

---

## 3 Facts the design must match

Numbers from the code and the game design document, not invented here:

| Fact | Value |
| --- | --- |
| Seats a match can have | 2, 3 or 4 (FR-01) |
| People a match must have | at least 1 (FR-01, as of 2026-09-04) |
| Bots a match can have | 0 up to seats minus 1 |
| Which seats become bots | the last ones in seat order, so a person keeps seat 0 |
| A bot's name | the seat's own number: seat 2 of four is "Bot 2", never "Bot 1" |
| Decisions a bot makes per turn | two: which dice card, and which pawn |
| The pause today | one per decision, 900 ms each, borrowed from `--motion-roll-hold` |
| A bot's turn today | pause, card, roll hold (900 ms), pause, move, hold after the turn |
| So a bot turn takes | roughly 3 seconds, and a round of three bots roughly 9 |
| Skill cards a bot plays | none |
| Reaction windows a bot answers | none; it declines immediately and without a pause |

**That nine seconds is the number worth reacting to.** It is the price of the feature and it was
measured rather than estimated. If it is too long, D81 is where it gets shorter.

---

## 4 Open decisions this handoff must answer

### D81. The bot's thinking pause: its token, its length, and whether it is per decision or per turn

Three questions in one, because they trade against each other.

1. Does the bot get its own token, or keep borrowing `--motion-roll-hold`? Borrowing says "this is
   reading time for a decision the turn hangs on", which is true, and it means the two can never be
   tuned apart.
2. Is 900 ms right? It is the roll's number and was chosen for a number stamping into a badge, not for
   a decision a player is trying to follow.
3. Is a pause per **decision** right, or should a bot's whole turn get one pause? Today a bot pauses
   before picking its card and again before moving, so a turn has two of them plus the roll's own.

Please answer all three, and please say which of the three seconds per turn are doing work.

### D82. A bot's skill hand during its own turn

The rail shows the hand of whoever is on turn, face up since D65. So a bot's five cards are currently
face up in front of the person playing against it.

Two readings, and they point in opposite directions:

- **A bot has no secrets**, so showing its hand is honest and lets a player reason about what it might
  do. Except that it will never do any of it, because it plays no cards.
- **It is inconsistent with a person's turn**, where D33 says the count is public and the cards are not.

A third option is that the rail shows nothing at all during a bot's turn.

> **Update, 2026-09-04, issue #82: the question got sharper rather than going away.** A bot now does
> play those cards, so the first bullet's "except" no longer applies: a face-up bot hand is a genuine
> preview of what it might do next, which is either the most informative thing on screen or an unfair
> look into an opponent's hand, depending on which reading wins. The bot itself never reads anybody
> else's hand, only how many cards they hold, which is public (D33).

### D83. The dice hand during a bot's turn, and how the choice is shown

The three drawn cards appear, one of them lifts, the other two fly back to the pool: the same animation
a person's choice produces. Nobody clicked, so there is no moment of intent before it.

Should the chosen card be marked differently when the computer chose it? Should the two rejected cards
be visible at all? This is the half of a bot's turn that most looks like something happening, so it is
also the half most likely to be confusing if it is not marked.

> **Update, 2026-09-04, issue #82:** it is no longer the only half. A bot's turn can now contain a card
> play as well, which is announced in the message strip and holds the turn for two seconds. D87 of brief
> 14 is about that announcement, and whichever way D83 is answered should sit beside it: the two are the
> same turn seen twice.

### D84. Does a bot's chosen pawn light up before it moves?

A person selects a pawn and then commits it, so `data-selected` is on screen for as long as they take
to decide. A bot dispatches `commit-move` directly, with no selection step, because selecting is
presentation and a bot has nothing to look at.

Should the chosen pawn be marked for the length of the pause before it walks? It would make the move
readable in advance rather than only in retrospect. It costs `bot-policy.js` a second intent, which is
a real cost but a small one.

### D85. How a bot seat is marked, and in how many places

`data-controller` is on every `.hud__seat` and nothing reads it. The name says "Bot 2" already, so this
is about whether that is enough.

Three places could carry a mark, and the answer may be different for each: the scoreboard row, the
sentence at the top that says whose turn it is, and the pawns on the board. Please say which, and
please say what a player is meant to learn from it that the name does not already tell them.

### D86. The setup screen, with a person or a bot per seat. **This is the real commission.**

Today the only way to play against the computer is to type `?bots=3` into the address bar. That is not
a feature anybody can find.

The screen that exists is S2: a title and three buttons reading 2, 3 and 4. What is needed is a way to
say, for a match of N seats, which of them are people and which are computers, with **at least one
person** always. The rules underneath are already in place: the state takes a list of bot seats and
`botSeatsFor` turns a count into that list.

Constraints worth knowing before drawing:

- The seats are fixed by the count and are not chosen: 2 players sit on seats 0 and 2, 3 on 0, 1 and 2.
- Each seat has a colour, and the colour is how a player identifies their pawns.
- The person at the keyboard keeps seat 0 today. Whether that has to stay true is part of this question.
- The setup screen is inside the same overlay component as the other five screens, so a shape that
  needs a completely different container is a bigger change than one that does not.

Drawing this is issue #76 on the board, which is deliberately blocked on this answer. Please draw it.
If more than one direction is worth looking at, this is the second handoff where
drawing alternatives and letting the Product Owner pick is welcome, as in handoff 12.

---

## 5 Deliverables

| File | Goes to |
| --- | --- |
| `13-spec-bot-opponents.md` | `01-Design/Handoff/` |
| Any new or amended stylesheet | `src/ui/styles/`, named in the spec |
| Any artboards drawn for D86 | wherever handoff 12's went, referenced from the spec |

**Please deliver a diff and not a whole file** for any stylesheet that already exists. That was asked
after handoff 11 and it is asked again here: a delivered file that was read against an older tree
silently undoes work, and only a diff makes the difference visible.

**Please read against commit `9fb13f4`.**

---

## 6 Out of scope

- **Card tactics for the bot.** ~~It plays no skill cards, on purpose, and that is a separate issue.~~
  **Corrected 2026-09-04, later the same day:** that separate issue is #82 and it is built. What a bot's
  card play looks like is **brief 14**, which asks three questions this brief could not have.
- **Difficulty levels.** There is one bot and it plays one way.
- **Online multiplayer** (FR-42). A bot is local and the two have nothing to do with each other.
- **The pause and win screens.** Unchanged by this feature.
- **The `reaction.*` sentences.** ~~They still say "Spieler" where they should name the seat, which is a
  known gap in the code and is being fixed there rather than designed around.~~ **Fixed in the code on
  2026-09-04 with issue #82**, because a bot can now play a card into a window and the line has to be
  able to name one. It says "Bot 3 will eine Figur schlagen".
