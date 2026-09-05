# Handoff 15, spec: the line-up screen, who is a person and who is a computer

**From:** Claude Design
**To:** Claude Code
**Date:** 2026-09-05
**Answers:** [15-brief-bot-setup-menu.md](15-brief-bot-setup-menu.md), D90 to D96.
**Read against:** `2d01e73`, on branch `feature/82-bot-card-tactics`, as constraint 9 asks. One
qualification on that in § 1, and it is the same one handoff 12 reported.
**Supersedes:** D86 of brief 13, as the brief itself retires it. D81, D84 and D85 of brief 13 stay
open and nothing here touches them.

The artboards are in `handoff-15/mockup/`, five of them on one canvas: S2 as it stands, the four seat
case as the screen opens, the four seat case with one person and the FR-01 lock, the two seat case,
and the screen below the 84rem breakpoint. § 7 of the brief made them optional and asked, if they were
drawn at all, for the four seat case and the two seat case. Both are there, because two seats is red
and green with a gap where yellow is not.

---

## 1 Files delivered

| File | State | Lines |
| --- | --- | --- |
| `src/ui/styles/lineup.css` | **New.** The whole of the line-up's own layout | 223 |
| `01-Design/Handoff/15-spec-bot-setup-menu.md` | New, this file | n/a |

**Nothing else changes. `overlay.css` is not amended and `tokens.css` gains no token, so there is no
diff to read against an older tree.** That is the shape of the answer and not an omission:

- **`overlay.css` is untouched** because `lineup.css` composes with it at higher specificity, the way
  `handover.css` and then `menu.css` do. Every rule in it still applies to the other six screens, and
  § 4 names the two that are added to on this one. `.overlay__actions` in particular is left exactly as
  it is: a centred wrapping row is what a Back and a Start want to be.
- **`tokens.css` gains nothing**, which matters more this time than last. Constraint 6 measures it at
  298 of 300 lines, so it is full, and a decision that needed a token would have had to name a split
  with it. This screen adds no duration, no colour and no size: the two numbers it owns, the panel's
  44rem and the control pair's 14rem, are measurements of one screen and live in that screen's file,
  which is what D75.3 already settled for `menu.css`.

**Load order: `lineup.css` after `overlay.css`.** It is independent of `handover.css` and of
`menu.css`; no two of the three ever match the same element.

**On the commit, and it is a finding rather than a formality.** The stylesheet copies available to this
side still predate the tree the brief measures: `overlay.css` is 229 lines here against the 234 quoted
in the brief, and `tokens.css` has no `--stage-w`. So every line number quoted below is from the local
copy with **the selector named alongside it**, and if a rule has moved between the two trees the
selector is what to trust. Nothing in this delivery could revert anything, because the only file in it
is new.

---

## 2 The shape of the answer, in five sentences

The line-up is a screen of its own, S3, `data-screen="lineup"`, with S2 unchanged in front of it, and
it gets its own stylesheet on the `handover.css` and `menu.css` precedent (D90). It keeps the curtain
and keeps the panel as a card, widened from setup's 34rem to 44rem, because it is the same question
asked twice and the two screens are seen back to back (D90.3). One seat is one row: the seat's plate,
the seat's name, and one control with two positions that are both named at all times, of which exactly
one is chosen, and the chosen one is the one that keeps the face and the hard shadow every raised
object in this game has, so the state of a row survives greyscale twice over, in that raise and in the
word in the name (D91). The screen opens with every seat a person, so it never rewrites the number the
player just gave and anyone who clicks straight through gets today's match, and the rule that at least
one seat is a person is a permanent sentence above the rows, which is what lets the one control that
would break it be `disabled` rather than argumentative (D92, D93). Start is the screen's one primary
and takes the keyboard when the screen opens, Back returns to the count, seat 0 may be a bot like any
other seat, and the words are the words the HUD already uses (D94, D95, D96).

---

## 3 The two screens, drawn as a pair

§ 3 of the brief says the pair is what is being designed, so S2 is on the canvas next to the line-up
and unchanged. What it looks like together, at the design resolution:

| | Panel | What is in it |
| --- | --- | --- |
| S2 | 34rem, 490 px | A title, three count buttons in the numeric face |
| S3, the line-up | 44rem, 634 px | A title, one sentence, 2 to 4 rows, a Back and a Start |

The line-up is the wider and the fuller of the two, and it should be: it is the screen the player
spends time on, and S2 is one click. The 44rem is not a decorative number. It is what the widest row
this screen holds needs: a plate, the longest German seat name, and a pair of positions at 14rem, with
the panel's `--space-6` padding on both sides. Four rows at that width fill the middle of the panel
without the rows becoming bands across the stage.

**What the pair does not do is repeat itself.** S2 asks how many, this screen asks who, and the titles
are different questions rather than two phrasings of one (D96.1).

---

## 4 The decisions

### D90. Two screens. S2 unchanged, and the line-up is S3 with its own stylesheet

**A seventh value in `OVERLAY_SCREEN`, `lineup`. S2 keeps its three count buttons and its title, and
what changes behind it is one line: `session-actions.js` line 53 stops calling `freshMatch(count)` and
opens the line-up with that count instead. `lineup.css` is new, on the `handover.css` and `menu.css`
precedent: one screen's own stylesheet, not a second component.**

**1. Two screens, not one that grows.** Three reasons, in the order they matter.

FR-01's acceptance criterion reads against S2, and the Obligations Book describes S2 as the screen with
the three counts on it. Option 2 would leave that sentence describing the top third of a screen that
also does something else, and the cheapest way to keep a written obligation true is to not move the
thing it is written about.

Then the interaction reason, which is the one that decided it. A screen that holds both the count and
the seats has to answer what happens to the seats when the count changes: four rows are set, the player
clicks 3, and one row has to go. Whichever way that is answered, the player has done work that the
screen then discards. Two screens make that a Back, which is a gesture the player chose rather than a
consequence they discovered.

And the flow reason: option 2 saves the third click, and the third click is not what is expensive here.
Nothing in this game is entered from a cold start more than once per session, and the click it saves is
paid for by a screen that is two things at once.

*Rejected: one screen that grows, D90.2.* It shows the consequence of the count immediately, which is
a real argument, and it costs the flow no step. It loses on the two reasons above, and it loses a third
time on the tests: `match-flow.spec.js`, `handover.spec.js` and `dice-pool.spec.js` all click
`[data-count]` and expect a match, so both options break them equally, but only option 2 also changes
what S2 **is**.

**2. Its own stylesheet.** Third time on this seam and it holds again. One screen, one job the other six
do not have, one file, and `data-screen` on the element is what makes it possible without touching
`overlay-view.js`. The rows are a `display: grid` group that no other screen wants, and putting them in
`overlay.css` would put 60 lines that match nothing on six screens into the file every screen reads.

*Rejected: the rows in `overlay.css`.* It is what a fourth screen with a handful of controls would
deserve. It loses on constraint 6, which measures `overlay.css` at 234 lines: the rows and their
control would take it past 290, and the next screen after this one would then be the one that has to
do the split. Better the file that is new carries its own weight.

*Rejected: a second component, `lineup-view.js`.* Same three counts as D75 rejected it on: the seven
contents share `data-open`, the arrival, the focus call and `Escape`; the title and the sentence would
stop being built by the function FR-34's language switch is wired into; and nothing in the drawing needs
it. The half made line-up is view state beside `screen` in the flow, exactly as § 5 of the brief offers.

**3. It looks like S2's sibling.** Same curtain, opaque and `--color-app-bg`, because it is a pre-match
screen and there is no match behind it to see through to. Same panel as a card, same padding, same
title size, same button family. What is different is the width and the group of rows, which is the one
thing S2 does not have. The two screens are the only pair in this game seen back to back, and a player
walking from one to the other should see the same object asking a second question, not a second
interface.

*Rejected: making the line-up look like the menu, wide and cardless.* The menu earns that treatment
because it is the front door and because its content is three doors. This screen's content is a small
table, a table wants a ground under it, and the panel is that ground.

### D91. A row is a plate, a name and a pair of named positions. The row is not clickable

**`.overlay__seat[data-player="N"][data-controller="human|bot"]`, a three column grid: the seat plate,
the seat's name, and `.overlay__seat-choice` holding two `.overlay__button[data-action="controller"]`
elements, one per position, with `aria-pressed` on both. The chosen position keeps the button's face and
hard shadow; the other loses both and lies flat on the row. Only the two positions are clickable.**

**1. The order in the row, and what carries the seat.** Plate, name, control, reading left to right in
German and in English: what this row is about, then what it is called, then what you can do to it. The
plate is the same two lines of chrome the HUD plate, the chrome row's turn sentence and the win panel
already use, so a seat is the same object in all four places, and it is `--player` filled and
`--seat-shape` clipped from the one `[data-player="N"]` block in `board.css`. **Nothing about the seat
is restated in this file**, which is the whole point of D2 and NFR-12: the colour and the shape arrive
together or not at all.

The row also carries the seat's own `--player-soft` as a wash. It is one declaration, it is paired in
both skins, and it is the cheapest thing on this screen that makes four seats read as four seats before
a word is read.

**2. The control is a pair of positions, and both are named at all times.** A player can see what the
other position would be without clicking it, and that is the argument against every other shape.
Exactly one is chosen and the chosen one is the raised one: it keeps the `--color-surface` face and the
hard offset shadow of `overlay.css`'s `.overlay__button`, the other keeps the full ink edge and gives up
the face and the shadow. So the pair says its state the way every other raised object in this game says
it (D14), and the unchosen position is not drawn as dead: its edge stays at full weight and its label
stays at full strength, because it is a live choice one click away. That is the one difference from
`menu.css`'s dead door, which is dashed and low weight because there is nothing behind it.

The pair is a two track grid at a fixed 14rem, so the two positions are the same width whatever the two
words are, in either language, and the four rows' controls line up as a column down the panel.

**3. The state is readable without reading the label, twice.** The raise is one cue and it is not a
colour. The word in the row's own name is the second: `player.named` gives "Spieler 2 (Gelb)" and
`player.botNamed` gives "Bot 2 (Gelb)", so the row renames itself when it is switched. Both survive
greyscale, which is what NFR-12 measures. The `--player-soft` wash is deliberately **not** a state cue:
it says which seat, never who plays it.

**4. Nothing on the row says what a bot is. One sentence on the screen does.** It is the second half of
`.overlay__text`: a bot plays a whole turn, dice card, roll, move and skill cards. Four rows saying it
four times is the same fact printed four times, and it is a fact about bots rather than about seat 3.

*Rejected: one button per row that flips it.* The cheapest control on offer, one element instead of
two, and the state fits on it. It loses because a button that flips has to be labelled either with what
the row is now or with what clicking it would do, and both readings are available to the player at
once. "Bot" on a row that is currently a person is the classic version of that bug.

*Rejected: a switch, or a segmented control with a sliding thumb.* A switch is the right control for
on and off, and this is not on and off: a person and a computer are two named things, neither of which
is the absence of the other. The sliding thumb has a second problem that is specific to this project:
`overlay-view.js` lines 197 to 201 rebuild the buttons on every screen change **and on every language
switch**, so a thumb that animates into position would animate again every time the player switches
language.

*Rejected: the whole row clickable.* It makes the target enormous, which is worth something on a
screen four people lean over. It loses because the row holds two positions and a click on the row has
to mean one of them, so the row would mean "flip", and D91.2 already rejected flipping. A row that is
both a target and a container is also a real problem for the keyboard: the tab stop count doubles and
`Enter` on the row and `Enter` on a position would do different things.

*Rejected: a dropdown per row.* Two options behind a click, in a game whose every other control is a
thing you can see.

### D92. The screen opens with every seat a person

**All rows `data-controller="human"`, all `human` positions `aria-pressed="true"`. Nothing is stored
between matches.**

The screen arrives showing a recommendation whether or not it means to, so it should recommend the
thing that is true today. Two reasons, and the first is about trust rather than about tests. The player
has just said how many people are playing, on the screen immediately before this one, and a screen that
answers "four" with "one of you and three computers" has overwritten the answer it was given. The count
means seats, but the player who clicked 4 was almost certainly counting people.

The second is that it keeps today's behaviour for anyone who clicks straight through, which is what
every existing end to end spec does and what every player who has played this game before will do.

**The cost, stated plainly:** the single player match is now two clicks away rather than one, on a
screen that exists because that match was unreachable. Two clicks and both of them visible, against a
default that silently disagrees with the player. That is the trade and it is worth making.

*Rejected: one person and the rest bots, D92.2.* It puts the mode this whole screen exists for one
click from the board, and it is a defensible answer. It loses on the argument above, and on a second
thing: with four seats it opens on the state where three rows are bots and the fourth is locked, so the
first thing a new player sees on this screen is a disabled control.

*Rejected: remembering the last line-up, D92.3.* Nothing in this game stores anything between matches
and saying no is the cheap answer the brief offers. Worth one sentence for later: if it is ever wanted,
it belongs beside `screen` in the flow for one page, not in `core/` and not in `localStorage`, and it
would want the count remembered with it, which is a change to S2 and not to this screen.

### D93. The rule is said once above the rows, and the control that would break it is disabled

**`.overlay__text` carries "Mindestens ein Sitz gehört einem Spieler" permanently. The last person's
`bot` position takes the DOM `disabled` property: muted label, `--color-dormant` edge, no face, no
shadow, no hover, no tab stop. No `data-locked` attribute is needed on the row.**

**1. Both, and that is the answer rather than a compromise.** D77.2 chose `disabled` for the two dead
menu doors, and the argument there was that the door's permanent second line already explained itself.
The brief is right that the equivalent explanation does not exist here, so this decision creates it:
the rule is the first thing the sentence above the rows says, it is on screen at all times, it is text
in the DOM in document order before any row (NFR-03), and it is read by any screen reader traversing
the panel. With that sentence present, the disabled control is a control the player has already been
told about. Without it, `disabled` would be a refusal with no reason attached, and then
`aria-disabled` with a spoken refusal would have been the right answer.

**2. The lock is on the position, not on the row, and never under the pointer.** Only the `bot` position
of the one remaining person is disabled. Its own `human` position stays live and does nothing, its
row's plate and name are unchanged, and the row is not dimmed: that seat is played, and dimming it
would say it is not in the match, which is what `board-regions.css` draws in `--color-dormant-soft`.

The lock moves as the player clicks, and it never lands on the control under the hand. To reach the
locked state a player has to make some **other** row a bot, so at the moment the lock appears the
pointer is on a different row's `bot` position. The reverse direction is free: switching any bot back to
a person unlocks the locked one, and there is no state from which the player cannot get back.

**3. `--color-dormant` for the edge, not the dashed low weight ink of an empty slot.** This project
draws a thing that is not asking anything for now in `--color-dormant`, and it draws a place where
something would go in dashed ink (`hand.css` lines 137 to 141, and `menu.css` after it). A refused
control is the first, not the second: it exists, it is the right control, and the rule is what is in the
way.

*Rejected: `aria-disabled="true"` with the click filtered in `session-actions.js`.* It keeps the tab
stop and can announce why. It loses for the reason spec 05 § 5 gave when it took seven tab stops out of
the pool overview: a stop where `Enter` does nothing tells a keyboard user nothing they cannot read.
Here the reason is on screen, before the rows, in text. This is the decision to flip if the sentence is
ever removed.

*Rejected: `data-locked="true"` on the row, which § 5 of the brief offers.* A second attribute for a
fact the DOM already carries, and it would invite a row treatment, which D93.2 has just argued against.

*Rejected: the rule stated only when it is about to be broken.* A line that appears on the click is a
line the player meets as a telling off, and it appears exactly when they have stopped reading.

*Rejected: no lock at all, refusing at Start instead.* One rule enforced in one place, which is tidy in
the code and wrong on the screen: it lets the player build a line-up the game will not accept and then
refuses the button they came for.

### D94. Start is the primary and takes the keyboard. Back returns to the count

**`.overlay__actions` holds two buttons in this DOM order: `.overlay__button[data-action="back"]`,
plain, and `.overlay__button[data-action="begin"][data-variant="primary"]`, "Spiel starten". The
centred wrapping row of `overlay.css`'s `.overlay__actions` is unchanged. `focusOverlay` gains one
exception: on this screen the keyboard goes to `[data-action="begin"]`.**

**1. Start exists and it is the screen's one primary.** The count click stops starting the match
(`session-actions.js` line 53), so something has to, and this screen is the first in the game where the
player assembles something before committing to it. It says "Spiel starten" rather than "Los" or
"Weiter": it names what happens, and it is the only button in the game that begins a match.

**2. Back exists, and it is a plain button to the left of Start.** No screen in this game has a back
button today, and this is the first screen that has anywhere to go back to: S2 is a decision the player
made one click ago and there is otherwise no way to change it without reloading. It is told apart from
the primary by the violet fill and by position, which is the same pair of cues that tell Resume from
Quit on the pause screen. `.overlay__actions` needs no rule for this: it is already a centred wrapping
row with a `--space-3` gap.

**3. The keyboard goes to Start, and that is a named change to `overlay-view.js` lines 213 to 215.**
Today the call takes the first `.overlay__button` in the DOM, which on this screen is seat 0's `human`
position, a position that is already chosen, so `Enter` on arrival would do nothing at all. Start is the
one control on this screen where `Enter` on arrival does what the player came for, and D92 makes the
arriving line-up a valid one, so the express route through both screens is 4 then Enter.

The change we ask for is scoped rather than general: focus `[data-action="begin"]` if the screen has
one, otherwise the first `.overlay__button` as today. **The cost, stated plainly:** a keyboard user
reaching the rows does it with `Shift+Tab`, because the rows are before the actions in the DOM and
should be. That is one keystroke, against `Enter` doing nothing on every arrival.

*Rejected: leaving `focusOverlay` alone.* Free, and the brief would rather the change were made on
purpose than by accident, which is why it is here with its cost attached.

*Rejected: putting the actions before the rows in the DOM so the first button is Start.* It would get
the focus for free and it would make a screen that reads bottom to top.

**4. The screen does not summarise itself, and it does not name a mode.** "One person and three
computers, four seats" is a sentence a screen can carry, and here it would be a sentence counting the
four rows directly above it. The rows are the summary, they are in seat order, and each one says in
words which of the two it is. On the mode: no such word exists in the game today, and this screen is
the wrong place to introduce one, because the mode is a description of the line-up rather than a
setting on it. The Product Owner's sentence named single and multiplayer; the honest answer is that the
game has neither, it has a line-up, and D96.4 says the same thing about the locale keys.

*Rejected: a live summary line above Start.* It is a fifth thing that changes on every click, on a
screen where four things already change and say so themselves.

### D95. Seat 0 may be a bot, like any other seat

**No seat is exempt. Seat 0's control is present and live, and the person may sit anywhere the count
puts a seat. Nothing on this screen marks turn order, because the rows are in seat order and seat order
is turn order.**

**1. Yes.** The rules allow it, `botSeatsFor` in `state/bots.js` lines 47 to 55 is a default for a
match started from a URL parameter and not a rule the game holds, and a per seat screen whose first
seat is exempt is a per seat screen with an asterisk on it. There is also a plain reason to allow it: a
player who wants the green pieces should be able to have them, and this is the only screen in the game
where anyone will ever say which seat is theirs.

**A note for the implementation, because this is where it reaches beyond CSS.** `botSeatsFor` computes
which seats are bots from a count and a number. This screen produces the set directly, so the line-up
it hands to `freshMatch` is a set of seats and not a count of bots. `options.js` lines 105 to 110 keep
refusing `bots >= players` and stay exactly as they are, as the second guard behind D93.

**2. Nothing marks who plays first.** Turn order is seat order, the rows are drawn in seat order, and
the top row is the first to move. Adding a mark to say so would be adding a fact this screen does not
otherwise talk about, and it would compete with the one thing the row is for. The HUD is where turn
order is drawn, and it draws it during the match, on the seat whose turn it is.

*Rejected: seat 0's control absent, or present and locked, D95.3.* Absent is the smaller screen and
locked is the screen that explains its own rule, and both defend a default rather than a rule. It also
breaks the two seat case in a visible way: with seats 0 and 2 the person would be pinned to red and the
bot to green, forever.

*Rejected: a "beginnt" mark on the first row.* Named above. If turn order is ever worth stating before
the match, it is worth stating on all rows as an order, which is a different screen.

### D96. The words

**Six new keys, in `de/ui.json` and `en/ui.json` in the same commit. The row labels reuse
`player.named` and `player.botNamed`. The two positions are "Spieler" and "Bot", which is the HUD's
word. S2's title is unchanged. No key names a mode.**

| Key | German | English |
| --- | --- | --- |
| `lineup.title` | Spieler oder Bot? | Player or bot? |
| `lineup.text` | Mindestens ein Sitz gehört einem Spieler. Ein Bot spielt einen ganzen Zug: Würfelkarte, Wurf, Zug und Skillkarten. | At least one seat is a player's. A bot plays a whole turn: dice card, roll, move and skill cards. |
| `lineup.human` | Spieler | Player |
| `lineup.bot` | Bot | Bot |
| `lineup.begin` | Spiel starten | Start the match |
| `lineup.back` | Zurück | Back |

**1. The title is a different question from S2's, not a rephrasing.** S2 asks "Wie viele spielen mit?"
and this asks "Spieler oder Bot?", which is the choice on the screen in the two words the controls use.
The brief offers to have S2's title changed and this spec declines: it is correct, it is tested, and the
two questions do not collide.

**2. The row labels are `player.named` and `player.botNamed`**, which already produce "Spieler 2
(Gelb)" and "Bot 2 (Gelb)" and already keep a bot on its own seat number. This screen invents no
naming. In the two seat case that means the rows read "Spieler 1 (Rot)" and "Spieler 3 (Grün)", with no
2, because the seats are 0 and 2. That looks like a bug and is not one, and it is drawn on the canvas
for exactly that reason.

**3. "Spieler" and "Bot", not "Mensch" and "Computer".** Constraint 8: `hud-view.js` says Bot, the row
label says Bot, so the position says Bot. One word for one thing in three places. "Spieler" for the
other position follows from `player.named` for the same reason, and `data-controller="human"` keeps the
code's word without it being a word a player reads. That gap between the attribute and the label is
worth naming rather than fixing: the attribute is `hud-view.js`'s and is not changing, and "Mensch" on
a button in a board game is a strange thing to read.

**4. No mode is named.** Neither "Einzelspieler" nor "Mehrspieler" enters the game. § 0 of the brief
already establishes there is no mode switch anywhere in the flow, and a word that appears only as a
label on a state the player can see is a word that will one day disagree with the state. If the
Product Owner wants the mode named, the place is the HUD or the win panel, where the match it describes
actually exists.

*Rejected: "Mensch" and "Computer" for the positions.* Named above, and it is the more explanatory
pair for a first time player. It loses to one word for one thing.

*Rejected: a hint per row saying what a bot does.* D91.4. One sentence, once.

*Rejected: "Los" for the primary.* Shorter and it is the game's register. It loses because this button
is the one that begins a match and nothing else in the game does, so it should say so.

---

## 5 Token reference

**No token is added, removed or renamed**, which constraint 6 makes the only acceptable answer.
`lineup.css` reads:

| Token | Where |
| --- | --- |
| `--space-2`, `--space-3` | The row's padding and gaps, the group's gap, the pair's gap |
| `--space-5` | The seat plate's size |
| `--text-md`, `--weight-medium`, `--leading-tight` | The seat name |
| `--color-text`, `--color-text-muted` | The seat name, and the label of a position that is refused |
| `--color-dormant` | The edge of a position that is refused |
| `--color-ink`, `--border-hair` | The seat plate's outline, the same recipe as `hud.css` lines 82 to 84 |
| `--radius-card` | The row's corner |
| `--player`, `--player-soft`, `--seat-shape` | Inherited from `data-player` through `board.css`. Not declared here |
| `--overlay-panel-w` | Set to 44rem on this screen, 26rem below the breakpoint |

The three seat customs are the point of the file's economy: the colour, the soft tone and the D16 shape
all arrive from the one `[data-player="N"]` block in `board.css`, so a seat's identity is written once
in this project and this screen is the fifth element to read it.

---

## 6 The DOM contract, state by state

Against § 5 of the brief. Every selector it offers is either taken or named as declined.

| Selector or state | Styled | Note |
| --- | --- | --- |
| `.overlay[data-screen="lineup"]` | Yes. The sheet, a flex line, the panel width | `lineup` is kept as the word |
| `.overlay__panel` on this screen | Not touched. It stays the card, at 44rem | D90.3 |
| `.overlay__title` on this screen | Not touched. `--text-xl` from `overlay.css` | |
| `.overlay__text` on this screen | One declaration, 46ch instead of 34ch | It carries two facts, D93.1 and D91.4 |
| `.overlay__seats` | Yes. **New element, and the one thing added to the contract:** the group the rows sit in | Its own rhythm at `--space-2`, so four rows read as one table |
| `.overlay__seat[data-player="0..3"]` | Yes. The three column grid, the wash, the plate as `::before` | |
| `.overlay__seat[data-controller="human"]`, `[data-controller="bot"]` | **Present in the DOM, and deliberately unstyled** | The state is drawn on the control, D91.3. The attribute is the flow's own record of the row and is what `freshMatch` reads |
| `.overlay__seat-name` | Yes. **New element.** `player.named` or `player.botNamed` | |
| `.overlay__seat-choice` | Yes. **New element.** The 14rem two track grid | |
| `.overlay__button[data-action="controller"][data-seat="N"][data-value="human|bot"]` | Yes, in both `aria-pressed` states and in `:disabled` | `data-value` is the one addition to the offer: the pair needs to say which position it is |
| `.overlay__seat[data-locked="true"]` | **Declined.** `disabled` on the one position carries it | D93.1 |
| `.overlay__button[data-action="begin"]`, `[data-action="back"]` | Inherited from `overlay.css` unchanged, primary and plain | D94 |
| `.overlay__actions` on this screen | Not touched | |
| Hover, active, focus on a live position | Inherited from `overlay.css`. `:disabled:hover` is turned off by name | |
| Below 84rem, and portrait | Yes. The pair drops under the name and spans the row as two half width targets, both still 44 px tall | The plate and the name keep their line |
| `prefers-reduced-motion` | Nothing to declare. No transition and no animation in this file | Already answered in `overlay.css` |
| Both skins | Every value is a token, so the dark skin needs no rule | |
| Greyscale | Two cues, the raise and the word in the name. § D91.3 | |

**What Claude Code has to do.** One screen value, three elements, one attribute, six strings, one focus
exception and one line in the flow:

1. **`OVERLAY_SCREEN.LINEUP = "lineup"`**, the seventh value. The word is kept as offered.
2. **`session-actions.js` line 53**: the count click opens the line-up with that count instead of
   calling `freshMatch(count)`. The half made line-up lives beside `screen` in `match-flow.js`, as
   § 5 of the brief offers, and nothing about it reaches `core/`.
3. **The rows.** One `.overlay__seats` group, one `.overlay__seat[data-player][data-controller]` per
   seat **the count actually uses** (2 and 3 map to seats 0 and 2, and 0, 1 and 2, per § 4 of the
   brief), each holding `.overlay__seat-name` and `.overlay__seat-choice` with two
   `.overlay__button[data-action="controller"][data-seat][data-value]` elements carrying `aria-pressed`.
4. **`disabled` on the `bot` position of the last remaining person**, recomputed on every switch. No
   click filter, which is the point of D93.1.
5. **`.overlay__actions` with Back then Start**, Start carrying `data-variant="primary"`.
6. **`focusOverlay`, `overlay-view.js` lines 213 to 215**: prefer `[data-action="begin"]`, else the
   first `.overlay__button` as today. Scoped, per D94.3.
7. **Six locale keys in both `de/ui.json` and `en/ui.json` in the same commit**, per
   `tests/unit/i18n/locales.test.js`. The table in § D96 is the list. `player.named` and
   `player.botNamed` are reused as they are.
8. **`lineup.css` in the load order** in `main.js`, after `overlay.css`.

**One thing to watch on the way in.** The buttons are rebuilt on every screen change and on every
language switch (`overlay-view.js` lines 197 to 201), and a rebuild of this screen has to put
`aria-pressed`, `data-controller` and the `disabled` position back from the flow's line-up, not from
the DOM. Switching language mid line-up is the case that finds it.

---

## 7 What is still open

**Nothing from this brief.** D90 to D96 are answered and D86 of brief 13 is retired with them.

**Two things this spec hands on rather than settles.**

1. **The line-up is a set of seats, not a count of bots**, § D95.1. `botSeatsFor` stays where it is for
   the URL parameters, and `freshMatch` gains a way to be given the set. That is the one place this
   delivery reaches past a stylesheet, and it is named here so it is not discovered during the build.
2. **Remembering the line-up between matches** is declined by D92.3, with the note on where it would
   live if it is ever wanted.

**Still open and not touched here:** D81, D84 and D85 of brief 13, brief 14 in full, D61 from brief 08,
D62 to D64 from brief 09, D70 to D74 from brief 11, and the eight leftovers of handoff 02. Nothing in
this spec depends on any of them. This screen ends when the match starts, so how a bot looks while it
plays (D85) is untouched by it and untouchable from it.

**One finding, carried over from handoff 12 § 7 because it is on this screen too.**
`.chrome__turn:empty` takes the turn sentence out of flow, and the sentence is empty on the menu, on
setup and now on the line-up. `.app__chrome` is a flex row with a gap and no spacer, so with the
sentence gone the language button should sit at the **left** end of the row. The mockup pushes it right
with a one declaration override and does not guess which is true.

---

## 8 The landing checks

The five standing ones, plus the four from § 10 of the brief:

1. **D90 to D96 answered**, none skipped, and each carries at least one named rejected alternative.
   Nineteen across the seven, five of them on D91, where the control had no precedent in the project,
   and four on D93, where the refusal had one for something else.
2. **No CSS file over 300 lines after `npm run format`.** `lineup.css` is 223 unformatted and every
   declaration in it is already on its own line, so it lands near 230. Nothing else in
   `src/ui/styles/` changes size, and `tokens.css` stays at 298.
3. **No user-facing string in a `content:` property.** `lineup.css` declares `content: ""` once, on the
   seat plate, which is a shape and not a word.
4. **Built once, then only attributes rewritten.** Nothing in this file animates a control's arrival,
   so the rebuild on a language switch restarts nothing. The note at the end of § 6 is the other half
   of this check.
5. **Two skins and `prefers-reduced-motion`.** § 6.
6. **`npx playwright test tests/e2e/match-flow.spec.js`.** It owns this flow and clicks `[data-count]`
   expecting a match. Every one of those clicks now needs a Start after it, which § 10 of the brief
   already books as Claude Code's work.
7. **`npx playwright test tests/e2e/handover.spec.js tests/e2e/dice-pool.spec.js`.** Three more count
   clicks, same one step addition. The `?players=` and `?bots=` parameters are untouched, so the sixteen
   specs that boot straight into a match are unaffected.
8. **A new spec for this screen.** The brief names three cases: that a seat can be switched, that the
   last person cannot be, and that the match that starts has the bots the screen said it would. Four
   more worth having while it is being written: that the screen opens with every seat a person (D92);
   that a two player line-up has rows for seats 0 and 2 and none for seat 1 (§ 4 of the brief, and the
   case a four row drawing hides); that seat 0 can be the bot and the match starts with the person on
   seat 2 (D95.1); and that the keyboard lands on `[data-action="begin"]` when the screen opens
   (D94.3).
9. **1440 by 900, and one check below the 84rem breakpoint.** Both are on the canvas, the second at 430
   by 820 in a live frame, where the pair drops under the name and the page does not scroll at four
   seats.

**No em dash, in this file or in `lineup.css`.** Rule 5 of the work order, checked.
