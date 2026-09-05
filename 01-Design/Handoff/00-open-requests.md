# Open requests: everything Claude Design is currently owed

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-01, **updated the same evening, twice on 2026-09-02, six times on 2026-09-03, four
times on 2026-09-04, and once on 2026-09-05**

---

## Status on 2026-09-05: handoff 15 landed, D86 is retired, and one rule was added to the stylesheet

**[15-spec-bot-setup-menu.md](15-spec-bot-setup-menu.md) answered D90 to D96, and the line-up screen is
built and shipped.** `lineup.css` is in `src/ui/styles/`, loaded after `overlay.css`, unchanged except
for the one addition below. **D86 of brief 13 is retired with them**, as brief 15 asked.

The computer is reachable from the menu for the first time: main menu, player count, line-up, match. The
`?players=` and `?bots=` parameters are untouched, so the sixteen specs that boot straight into a match
are unaffected.

### What was built, against § 6 of the spec

All eight items, unchanged: `OVERLAY_SCREEN.LINEUP`, the one line in `session-actions.js`, the rows with
their two positions, `disabled` on the last person's `bot` position, Back then Start, the scoped focus
exception, the six locale keys in both languages, and `lineup.css` in the load order. Eleven end-to-end
cases cover the screen and the whole suite is green in all three browsers.

### One rule was added to `lineup.css`, and it is reported rather than absorbed

**`.overlay__seats:empty { display: none }`, three lines, with a comment naming the precedent.**

`.overlay__seats` is built once in `renderOverlay` and lives in the panel on all seven screens, the same
way `.overlay__cards` does. `.overlay__panel` is a flex column with a `--space-4` gap, so an empty group
leaves a hole on the other six screens. `pool.css` met exactly this and answered it the same way for the
card region, so the rule is the project's own and not an invention.

**Nothing else in the delivered file was changed.** It is flagged here because a stylesheet quietly
edited on this side is how two trees drift, which is the thing § 3 of your own README is about.

### A finding in the spec, and the code is the one that is right

**§ D96.2 and mockup 15c name a two-player line-up wrongly.** They draw the rows as **"Spieler 1 (Rot)"
and "Spieler 3 (Grün)"**, on the reading that the label follows the seat number, so seat 2 is player 3.

`displayNumber` in `player-labels.js` counts the seat's **position in the seat list**, not the seat
number, so the real rows are **"Spieler 1 (Rot)" and "Spieler 2 (Grün)"**. That file's header records
"Spieler 1 and Spieler 3 with no Spieler 2" as the two-year-old off-by-one it exists to fix.

**Nothing had to change.** The spec's instruction is to reuse `player.named` and `player.botNamed`,
which is what was built. Only the example is wrong, and the thing that made the case worth drawing
survives either way and is arguably more surprising: **Spieler 2 is green**, because the colour is keyed
on the seat and the number on the position. It was found by a unit test written from the spec's own
sentence, which failed against correct code.

### Two things asked back, neither of them blocking

1. **`.chrome__turn:empty` and where the language button sits**, carried over from handoff 12 § 7 and
   repeated in § 7 of this spec. The turn sentence is empty on the menu, on setup and now on the
   line-up, and `.app__chrome` is a flex row with no spacer, so the button sits at the **left** end.
   The mockup pushes it right with a one-declaration override and deliberately does not guess. It is on
   screen on three of the seven screens now, so it is worth an answer.
2. **A confirmation of the `:empty` rule above**, or a different answer if the group should be built
   only on the screen that uses it.

### Still open and untouched by this

D81, D84 and D85 of brief 13, brief 14 in full, D61 from brief 08, D62 to D64 from brief 09, D70 to D74
from brief 11, and the eight leftovers of handoff 02. Nothing in handoff 15 depended on any of them.

---

## Status on 2026-09-04, last: one line of handoff 10 was changed in code, and here is why

**A defect from a test round, and the fix touches `card-reveal.css`.** Reported with a screenshot: while
the player reads a card in the skill hand, the dice card they had just chosen paints over the top third
of it.

**10-spec § 3 rules on this overlap and the ruling was right about the wrong two elements.** It says the
revealed card is above the dice plate because `.app__skill` follows `.app__dice` in the DOM, "with no
`z-index` needed". That holds for the two plates. It does not hold for the cards in them: `card.css`
gives every card `position: relative` and a `z-index`, so **every card is a stacking context of its
own**, while neither plate sets either property, so **neither plate is one**. The cards of both hands
therefore compete in a single z-index space, where the number decides before document order does. The
chosen dice card is at `--layer-card-selected`, 3. The card being read was at `--layer-card-raised`, 2.

**What was changed, and it is one line plus one token.** `tokens.css` gained `--layer-card-reading: 4`,
and the three reveal selectors in `card-reveal.css` use it in place of `--layer-card-raised`. Nothing
else in either file is touched, no colour is added, and the reveal is still pure CSS. The token table in
10-spec § 4 is one row short as a result.

**It fixed a second case that had not been reported.** Inside the fan, a selected skill card also sits at
3, so it covered a revealed neighbour at 2. One mistake, two places.

*Rejected: `isolation: isolate` on the two plates,* which would make them the stacking contexts § 3
assumed and let DOM order decide, because it leaves the in-fan case broken and puts the change in
`app.css`, which handoff 10 did not deliver.

**What this side would like back.** A confirmation that "the card being read is the top card layer" is
the rule you want, or a different answer. It interacts with D64, still open: if the fan's stacking order
is ever turned around, this layer stays correct, but the reason it exists should be in the spec rather
than only in a comment.

---

## Status on 2026-09-04, later still: brief 14 is out, and it corrects brief 13 from this morning

**[14-brief-bot-cards.md](14-brief-bot-cards.md) is sent. D87 to D89.**

**Brief 13 said twice that a bot plays no skill cards, and that stopped being true the same day.** A bot
now prices every card in its hand against the board and plays the best one when it beats a threshold, in
its own turn and in other people's. Both places in brief 13 carry a dated correction pointing at brief
14; D81, D84, D85 and D86 are unaffected and still open, and **D82 and D83 got sharper rather than going
away**, which is noted on each of them.

**D87 is the real commission, and unlike most of these it is already answered badly rather than
missing.** A bot's card play is announced in the message strip, and the strip's default voice is
`--color-warn`, the colour the game reserves for "you cannot do that". A bot playing a card is not a
refusal. This is the same deviation issue #45 shipped for the trap announcement, and D55 answered that
one with **two selectors** in `message-strip.css` giving it the strip's second voice. The same two
selectors are a perfectly good answer here, and the brief says so.

**Two more borrowed durations, both flagged as guesses rather than choices.** The announcement is held
for `--motion-trap-hold` (2 s), because that token already means "reading time for something that
happened without being asked", and a bot answering a window waits `--motion-roll-hold` (900 ms) like
every other bot decision. Neither is a decision this side is allowed to take. D87.3 and D88 are where
they are confirmed or replaced, and they add up with D81: a bot turn with a card in it currently spends
about four seconds of reading time before anything moves, and a card is played on roughly every other
turn.

**One thing was fixed rather than designed around.** Brief 13's section 6 said the `reaction.*`
sentences still say "Spieler" for a bot seat. They do not any more: the moment a bot could play a card
**into** a window, the line had to be able to name one, so four keys per language now take a name and
the strip says "Bot 3 will eine Figur schlagen". That was a code gap and it is closed in code.

**Nothing new is in the DOM for you this time.** `data-message-kind="card"` on the existing
`.message-strip` is the whole contract, and the element is built once and only ever gets attributes.

**Please deliver a diff and not a whole file** for any stylesheet that already exists. Asked after
handoff 11, asked again in 13, asked again here.

**What is still owed, after this send.** Four briefs.

| Brief | Owes | State |
| --- | --- | --- |
| [14-brief-bot-cards.md](14-brief-bot-cards.md) | `14-spec-bot-cards.md`, D87 to D89, plus the CSS the answers imply | **Open.** Sent 2026-09-04, read against `35993fe` |
| [13-brief-bot-opponents.md](13-brief-bot-opponents.md) | `13-spec-bot-opponents.md`, D81 to D86, plus any artboards drawn for D86 and a new stylesheet if the setup screen earns one | **Open.** Sent 2026-09-04, read against `9fb13f4`, corrected in place the same day |
| [09-brief-layout-and-fan.md](09-brief-layout-and-fan.md) | `09-spec-layout-and-fan.md`, confirming or replacing D62 to D64 | **Open.** Sent 2026-09-03 |
| [08-brief-pickable-field.md](08-brief-pickable-field.md) | `08-spec-pickable-field.md`, D61 | **Open.** Sent 2026-09-03 |

---

## Status on 2026-09-04, later: brief 13 is out, and the thing it describes already works

**[13-brief-bot-opponents.md](13-brief-bot-opponents.md) is sent. D81 to D86.**

**This brief is the wrong way round compared with every other one, and that is deliberate.** Usually a
brief describes something that does not exist yet. The bot opponent is built, shipped and playable
today: `/?players=4&bots=3` seats you first and the computer plays the other three. What is missing is
everything about how it *looks* while it happens, and one screen that does not exist at all.

**D86 is the real commission and the other five are dressing.** The only way to play against the
computer today is to type `?bots=3` into the address bar, which is not a feature anybody can find.
What is needed is a setup screen that says, per seat, whether a person or a computer is playing it,
with at least one person always. The rules underneath are already in place, so this is a drawing
question and not an engineering one. It is issue #76 on the board, deliberately blocked on this answer
so that the screen does not get invented in code. As in handoff 12, drawing more than one direction and
letting the Product Owner pick is welcome.

**One number is worth reacting to before anything is drawn.** A bot's turn takes about three seconds
and a round of three bots about nine, because the pause is 900 ms per decision and there are two
decisions plus the roll's own hold. That figure was measured, not estimated, and D81 is where it gets
shorter if it is too long.

**One placeholder is flagged as a placeholder.** The bot's pause currently borrows
`--motion-roll-hold`, because `CLAUDE.md` forbids Claude Code from inventing a duration and that token
already means "reading time for a decision the turn hangs on". It is a stated guess, not a choice, and
D81.1 is where it is confirmed or replaced.

**One attribute was put in the DOM for you and nothing styles it.** Every `.hud__seat` now carries
`data-controller="bot"` or `"human"`, so D85 can be answered without any new markup.

**Please deliver a diff and not a whole file** for any stylesheet that already exists. Asked after
handoff 11, asked again here.

**What is still owed, after this send.** Three briefs.

| Brief | Owes | State |
| --- | --- | --- |
| [13-brief-bot-opponents.md](13-brief-bot-opponents.md) | `13-spec-bot-opponents.md`, D81 to D86, plus any artboards drawn for D86 and a new stylesheet if the setup screen earns one | **Open.** Sent 2026-09-04, read against `9fb13f4` |
| [09-brief-layout-and-fan.md](09-brief-layout-and-fan.md) | `09-spec-layout-and-fan.md`, confirming or replacing D62 to D64 | **Open.** Sent 2026-09-03 |
| [08-brief-pickable-field.md](08-brief-pickable-field.md) | `08-spec-pickable-field.md`, D61 | **Open.** Sent 2026-09-03 |

---

## Status on 2026-09-04: handoff 12 landed, and its own open finding turned out to be real

**[12-spec-main-menu.md](12-spec-main-menu.md) is in and closed.** D75 to D80, all six answered for
artboard 12c, all six on screen, and eighteen named rejected alternatives across them. The menu is three
doors in the game's own card chrome, `menu.css` is the second screen to own a stylesheet on the
`handover.css` precedent, and `overlay.css` and `tokens.css` were not touched, exactly as the delivery
promised.

**Two things are worth having back, and neither one blocks anything.**

**1. `overlayButton` did have to change, and the delivery said it would not.** The note's claim that
"nothing changes in `overlay-view.js`" is true of the `focusOverlay` call it checked, which is correct as
written because Hotseat is first in the DOM. It is not true of `overlayButton`, which set the label as
the button's **own text** and therefore could not hold `.overlay__art`, `.overlay__label` and
`.overlay__hint`. It is now a shared shell plus a door branch, taken when a description carries a `hint`,
so no other screen is affected. **The process point rather than the defect:** the delivery checked the one
function the brief had offered to change and not the one it had not. Nothing is owed here, it is recorded
because the same shape of miss is cheap to repeat.

**2. § 7's open finding was real, and it is fixed.** The spec could not tell from the stylesheets whether
the language button sits at the right end of the chrome row on the menu, said so instead of guessing, and
pushed it right in the mockup with a declaration it labelled a guess. **It was on the left.**
`.chrome__turn` carries `flex: 1 1 auto` and is the row's only spacer, so the controls were pushed right
by the turn sentence rather than by a rule, and `chrome.css` takes that sentence out of flow with
`:empty { display: none }` on the menu and on the setup screen. With pause and pool hidden there too, the
button was the only child left. Fixed with `justify-content: flex-end` on `.app__chrome`, which is inert
during a match because a growing flex child already eats the slack. **The mockup guessed right**, and this
is the first finding in the project that a brief located by reasoning about the stylesheets rather than by
looking at a screen.

**One deviation from the spec, and it is arithmetic rather than judgement.** § D78.3 names the six locale
keys as `menu.hotseat`, `menu.hotseat.hint`, and so on. **A JSON key cannot be a string and an object at
the same time**, so they nest with `.label` instead: `menu.hotseat.label` and `menu.hotseat.hint`. No
other key changed, and `menu.title` and `menu.text` kept their values as asked.

**The keyboard check D76.4 asked for, answered.** Focus opens on the Hotseat door, the sheet has exactly
one tab stop, and the language button is reached **backwards** with `Shift+Tab`, because the chrome is
earlier in the DOM but outside the overlay. `Enter` on each does what it says, which was the condition.

**One small thing for a later contrast pass, not raised as a defect.** The dashed edge on an unavailable
door is faint in the dark skin, because 32 per cent of `--color-ink` on a dark ground is close to that
ground. It is the value `hand.css` already uses for the empty skill slot and the spec copied it on purpose
so the two edges match, so this is a pre-existing property of that treatment rather than anything handoff
12 introduced. The other two cues carry it: the missing face and the missing shadow both read in the dark
skin and in greyscale.

**What is still owed, after this close.** Two briefs, 09 first because it confirms three things that are
already implemented, then 08.

| Brief | Owes | State |
| --- | --- | --- |
| [09-brief-layout-and-fan.md](09-brief-layout-and-fan.md) | `09-spec-layout-and-fan.md`, confirming or replacing D62 to D64 | **Open.** Sent 2026-09-03. `tokens.css` is still the tightest file in the project and handoff 12 deliberately added no token to it, so the seam 11-spec § 7 names is unchanged and still worth folding into this answer |
| [08-brief-pickable-field.md](08-brief-pickable-field.md) | `08-spec-pickable-field.md`, D61 | **Open.** Sent 2026-09-03 |

---

## Status on 2026-09-03, later: handoff 11 landed, and the stale-file problem happened a second time

**[11-spec-roll-animation.md](11-spec-roll-animation.md) is in and closed.** D70 to D74, all five
answered, all five on screen, and every answer carries a reason and a named rejected alternative,
fifteen across the five. The roll now has a moment of its own of 900 ms, the kept dice card performs the
throw, and a roll that cards changed lists its steps in the message strip. **NFR-08's explanation half
is closed**, which is the second of the three "a rule runs and nothing renders it" findings to be cleared
after handoff 07's traps.

**What is still owed, after this close.** Two briefs, 09 first because it confirms three things that are
already implemented, then 08. **Handoff 12 has dropped off this list**, because it was answered in the
same package and the Product Owner confirmed 12c on 2026-09-04: the row is kept below for the state of
it, but nothing is owed from your side.

| Brief | Owes | State |
| --- | --- | --- |
| [09-brief-layout-and-fan.md](09-brief-layout-and-fan.md) | `09-spec-layout-and-fan.md`, confirming or replacing D62 to D64 | **Open.** Sent 2026-09-03. `tokens.css` now sits at 294 lines after this delivery, and 11-spec § 7 names the seam for the split it will need: everything from `--motion-feedback` to `--ease-curtain` plus the four hold tokens and the whole `prefers-reduced-motion` block moves to `motion.css`, about 60 lines. Worth folding into this answer, since it touches the same file |
| [08-brief-pickable-field.md](08-brief-pickable-field.md) | `08-spec-pickable-field.md`, D61 | **Open.** Sent 2026-09-03 |
| [12-brief-main-menu.md](12-brief-main-menu.md) | Nothing. **The loop is closed on both sides** | **Answered, chosen and landed 2026-09-04**, see the section above. Claude Design recommended 12c, three doors in the game's own card language, and the spec answers D75 to D80 for that one with 12a and 12b as drawn rejected alternatives. The Product Owner confirmed 12c on 2026-09-04 and asked that implementation wait; it was released the same day and built the same day |

**The best answer in the package is D72, and it is the one the brief got wrong.** The brief offered three
routes and every one of them required `card-state.css`'s `:empty { display: none }` to change. The spec
found a fourth: write the number into the badge at the **start** of the throw and let the keyframe's
`backwards` fill hold it invisible until the card lands. An element that is already in the layout has a
start state to animate from. So `card-state.css`, `card.css` and `hand.css` were not delivered and needed
no change, and it cost this side zero lines of code, because the badge is filled from `state.roll` by the
same render that sets the attribute. Both follow from one fact, so they cannot get out of step. **The
brief's premise was right and its three options were all more expensive than the question deserved**,
which is worth recording: asking rather than telling is what made the cheaper answer possible.

### One thing is asked back, and it is the same thing as last time

**`tokens.css` was read against a tree older than the commit the package names.** The delivered copy has
no `--stage-w` and no `--stage-h` and a `--board-size` of `44vw`, so it predates `e486bb4`. Copying it in
would have reverted D62's fitted 16:9 stage, which is exactly what handoff 10 nearly did to four files.
Only the two additive hunks were taken and `git diff` was checked for removals.

The close of handoff 10 asked for one word: **name the commit, not the date.** That was done, correctly,
and it did not help, because naming a commit and re-reading the file at delivery time are two different
acts. So the ask is sharpened rather than repeated: **deliver an amended file as a diff and not as a
whole file.** A diff cannot silently carry a reversion, it is a third of the size, and it makes the
merge that this side has now done twice unnecessary. `refusal.css` in the same package was purely
additive and merged without a thought, which is the shape to aim for.

### Two names changed on this side, and one is still yours

**`.move-refusal` is now `.message-strip`, and `refusal.css` is `message-strip.css`.** The spec noticed
it itself under "Noticed and not done": the strip carried two kinds of message that are not refusals and
this delivery made it three. It landed as a commit of its own, ahead of the feature, so nothing about the
rename is mixed into the roll. `__steps` and `__step` from D73 use the new prefix. **Future specs should
name `.message-strip`.**

**`--layer-refusal` still carries the old name** and lives in `tokens.css`, which is yours, so it is
asked here rather than changed from here. `--motion-refusal-hold` is deliberately left alone: it really
is the hold a refusal gets.

### One finding for the record, and it needs no answer

The spec's example HTML shows running totals, "Plus a D8: 22". The existing locale sentences interpolate
the step's **own** value, so it renders "Plus a D8: 5", because `roll.js` stores what each step
contributed rather than the total after it. The exceptions are `multiplier` and `missed`, where the step
is the whole result. The sentences are consistent with the data and nothing was changed. It is written
down because a reader could take the illustration for the contract.

---

## Status on 2026-09-03, late night: two briefs are out, and one of them asks for three drawings

**[11-brief-roll-animation.md](11-brief-roll-animation.md) and
[12-brief-main-menu.md](12-brief-main-menu.md) are out, D70 to D80.** Two feature requests from the
Product Owner in one message: the roll is boring, and the main menu is barebones. Both descriptions are
accurate, and looking for the place to build each one found something underneath it.

| Brief | Owes | State |
| --- | --- | --- |
| [08-brief-pickable-field.md](08-brief-pickable-field.md) | `08-spec-pickable-field.md`, plus whichever of `prompt.css` and `board.css` the answer touches | **Open.** Sent 2026-09-03 |
| [09-brief-layout-and-fan.md](09-brief-layout-and-fan.md) | `09-spec-layout-and-fan.md`, confirming or replacing D62 to D64, plus whichever of `app.css`, `tokens.css`, `hud.css`, `hand.css` and `card.css` the answer changes | **Open.** Sent 2026-09-03 |
| [11-brief-roll-animation.md](11-brief-roll-animation.md) | `11-spec-roll-animation.md`, plus whichever of `card-state.css`, `hand.css`, `card.css` and `tokens.css` the answer changes, and a new file if D71 needs more than about thirty lines | **Open.** Sent 2026-09-03 |
| [12-brief-main-menu.md](12-brief-main-menu.md) | `12-spec-main-menu.md`, **three mockups in `handoff-12/`**, plus whichever of `overlay.css` and `tokens.css` the answer changes, and a new stylesheet if D75 says the menu is its own layout | **Open.** Sent 2026-09-03 |

### The roll turned out to be three things, and only the first one was reported

"A number just appears" is literally what happens: `.card__result` is hidden by `:empty` and gets text
written into it. The two that were not reported are worse.

**The roll has no moment of its own.** `advance()` in `game-loop.js` lines 209 to 213 rolls and carries
straight on in the same synchronous pass, so the number is painted in the same frame as the kept card's
lift and the two unkept cards flying back to the pool. All three parts of "you rolled" happen at once,
and the one the player is waiting for is the one with no motion on it. The file's own header, lines 26
and 27, says the `roll` phase exists "so a roll animation has something to hang off", and nothing hangs
off it. **That sentence went in with `182e5fa` on 2026-09-01** and has been describing something that
does not exist ever since.

**And a roll that cards changed is an unexplained number.** `state.rollSteps` records the whole chain,
nine kinds of step, and the sentences for it are written in both languages at `ui.json` lines 153 to
164. **No file under `src/ui/` reads either.** `turn-manager.js` line 137 says the trace exists "so the
screen can explain a number that three cards had a hand in (NFR-08)", and it does not. A turn with
Critical Success, Angel Die and Speedrun Any% in it ends with a 44 on a D20 card and no account of
where 44 came from. **This is the third `must have` requirement in three handoffs that was half met
because a rule ran where nothing rendered it**, after `state.traps` in handoff 07 and the face-down own
hand in handoff 10.

Two gaps of ours go with it and are ours to fix rather than yours to answer: `ROLL_STEP.MISSED` has no
locale key in either language, so eight of nine steps are translated, and `turn.rolled` sits in both
files unread.

### The menu's finding is an absence, and it is the reason 12 asks for drawings

**Nothing in this project styles a control you cannot use.** Neither `disabled` nor `aria-disabled`
appears in any of the eighteen stylesheets or in any file under `src/ui/`. Two of the three menu items
the Product Owner asked for are exactly that, so D77 has no precedent anywhere to reuse, and it is the
one decision in the brief that cannot be judged from a description. All three mockups have to show it.

**The three items are not decoration**, and the brief says so with the requirement ids: Hotseat is
FR-01 and built, Online Multiplayer is FR-42 with no chosen technology and is named in the
Requirements Specification as the largest available cut, and Settings is S11, which was **deliberately
split and deleted** on 2026-09-01 with its language half moved into the chrome and only the mute left
outstanding. So the two unavailable items are unavailable for two different reasons, which is D78.

### One thing about the loop is new, and it is the first brief to ask for a choice

**Brief 12 asks for three mockups and a pick, which no brief has done before.** The reason is that
"barebones" is not a defect with a cause: the three elements on the menu are each correct, and what is
being asked for is a direction. The spec then answers D75 to D80 for the mockup that was chosen, and
**the two that were not chosen are the named rejected alternatives** § 2 of the spec template requires
anyway. That is the usual rule met by a cheaper route, and it is worth noting as a pattern for the next
request that is a preference rather than a defect.

**Both briefs name the commit they were read against, `3a8c8bc`.** That is the request the previous
status block made of the delivery side, and it applies in both directions. Asking for it without doing
it would have been the wrong way round.

**Nothing was implemented, unlike handoff 09.** That was the Product Owner's choice and the reason is
in D70: whether the roll is a movement or a hold decides whether `game-loop.js` grows a wait, and that
file has **7 lines left** before NFR-02's limit. Guessing wrong means building it twice.

**Four briefs are open at once now, which is one more than the count that made this file necessary.**
The order that gets the most out of the least work is unchanged at the front and grows at the back:
**09, 08, 11, 12.** Handoff 09 is still confirmation of three things already on screen and still the
cheapest. Handoff 08 is still the only open decision that blocks a requirement, NFR-08's second half.
**Handoff 11 comes next because it blocks the other half of the same requirement**, NFR-08's
explanation half, and because D70 alone unblocks the code: it is one question about a duration, it
needs no drawing, and the other four cannot be usefully answered before it. **If only one thing can be
delivered out of brief 11, deliver D70.** Handoff 12 is last because it blocks nothing and because it
is the one that needs drawing time.

---

## Status on 2026-09-03, night: handoff 10 landed, and it was read against a tree four hours old

**[10-spec-card-reveal-on-hover.md](10-spec-card-reveal-on-hover.md) landed. D65 to D69, all five
answered, all five on screen.** A player can read the cards in their own hand now, by pointing at one or
by tabbing to it. Thank you for rejecting the gesture the request named and explaining why: "a turn does
not change the size, so the paragraph is still under 9 px" is the sentence that made the whole answer
obvious, and landing the magnification exactly on `.card--full` rather than near it is worth more than it
looks, because the player has met that object before.

**Two attributes and no code, as promised.** `data-face` on the hand and a tab stop on every card with an
id. The second one needed slightly more than a one-line change and the reason is worth knowing for next
time: `updateCard` is shared by the skill hand, the dice hand and the pool overview, and design spec 05
§ 5 took seven dead tab stops **out** of the pool overview. So "every card is focusable" could not go in
the shared component. It is a `focusable` field on the card, the default is unchanged, and the skill hand
is the one caller that opts out. Nothing in the pool changed.

| Brief | Owes | State |
| --- | --- | --- |
| [08-brief-pickable-field.md](08-brief-pickable-field.md) | `08-spec-pickable-field.md`, plus whichever of `prompt.css` and `board.css` the answer touches | **Open.** Sent 2026-09-03 |
| [09-brief-layout-and-fan.md](09-brief-layout-and-fan.md) | `09-spec-layout-and-fan.md`, confirming or replacing D62 to D64, plus whichever of `app.css`, `tokens.css`, `hud.css`, `hand.css` and `card.css` the answer changes | **Open.** Sent 2026-09-03 |
| [10-brief-card-reveal-on-hover.md](10-brief-card-reveal-on-hover.md) | Nothing | **Closed.** Landed 2026-09-03 |

### One new thing is owed, and it is about the loop rather than about a pixel

**The five stylesheets were read against a tree that was one commit old, and nothing in the process could
have told either side.** The delivery says "read against the working tree of 2026-09-03", which was true
when it was written and stale about four hours later: `e486bb4` had touched all four of the amended files
that afternoon. Copying the delivered files in would have reverted three things that have nothing to do
with D65 to D69:

| Would have been reverted | What breaks |
| --- | --- |
| `--stage-w` and `--stage-h` in `tokens.css` (D62) | `app.css` reads both for `#app`'s size. The 16:9 stage collapses and FR-31 breaks again on any window shorter than 900 px |
| The `--shadow-dir` sign in `card.css`, `card-state.css` and `hand.css` (D64) | The fan's shadow falls right again and hides under the next card, which is the defect the Product Owner reported that morning |
| `z-index: 0` and `content: none` on the empty slot in `hand.css` | A slot paints its dashed border across the last real card again |

**It was caught by diffing, and it would also have been caught by the suite**, which is the part worth
saying: two of the three carry an end-to-end case added the same day, and the stage would have failed four
more. The delivery was merged by hand instead, taking only the hunks that belong to D65 to D69.

**What is asked, and it is small.** Name the commit, not the date. "Read against `e486bb4`" is checkable
in one command by the side receiving it; "read against the working tree of 2026-09-03" is not checkable at
all once the day has more than one commit in it, and 2026-09-03 had four. Nothing else about the delivery
format needs to change.

**One delivered rule was amended on landing, and it is recorded in the spec itself.** `card-reveal.css`
casts a revealed card's hard shadow down and to the right, because it was written before D64. A revealed
card is still sitting in the fan, so the shadow would have flipped from left to right under the pointer,
which is D64's defect undone one card at a time. Both offsets now multiply by `--shadow-dir`. **If D64
comes back rejected, this is the second place that changes.**

**Two of the five decisions now sit on top of an unconfirmed one.** D66's measurements are taken at the
fitted stage's 14.4 px root, which is D62, and the amendment above is D64. Handoff 09 is still open. That
is not a complaint: it is the consequence of implementing three things and asking afterwards, and it is
the second reason 09 is the cheapest of the three open briefs to answer.

**Not asked and not owed: `.card--reading` is exactly right.** It is asserted by
`tests/e2e/card-reveal.spec.js`, which is also what keeps it from becoming a rule nothing reaches, and the
same case proves nothing in `src/` writes it.

---

## Status on 2026-09-03, evening: a feature request turned into a defect one status block old

**[10-brief-card-reveal-on-hover.md](10-brief-card-reveal-on-hover.md) is out, D65 to D69.** The request
was that hovering an Action or Reaction card should turn it over so its text can be read. Looking for the
place to put that found two reasons a player cannot read a card in their own hand, and neither is the one
the request described.

| Brief | Owes | State |
| --- | --- | --- |
| [08-brief-pickable-field.md](08-brief-pickable-field.md) | `08-spec-pickable-field.md`, plus whichever of `prompt.css` and `board.css` the answer touches | **Open.** Sent 2026-09-03 |
| [09-brief-layout-and-fan.md](09-brief-layout-and-fan.md) | `09-spec-layout-and-fan.md`, confirming or replacing D62 to D64, plus whichever of `app.css`, `tokens.css`, `hud.css`, `hand.css` and `card.css` the answer changes | **Open.** Sent 2026-09-03 |
| [10-brief-card-reveal-on-hover.md](10-brief-card-reveal-on-hover.md) | `10-spec-card-reveal-on-hover.md`, plus whichever of `card.css`, `card-state.css` and `hand.css` the answer changes, and a new file if D66 needs more than about thirty lines | **Open.** Sent 2026-09-03 |

**The first reason is a finding this file already carried, one block down, filed too low.** The block above
lists it among the two findings that need no decision: `data-active` on the skill hand means "some card is
playable" rather than "this seat is on turn". That was right about the cause. What it missed is the
consequence. `card-state.css` draws every card in a hand with `data-active="false"` as a back, and
`intents-cards.js` refuses every card outside the action phase, so **the player's own hand is a row of
backs through the dice card choice and the move, and again once the card budget is spent.** It is D65 now,
and the note in the block below is superseded by it.

**And the back is not what enforces D33.** The handover curtain is, together with one ordering rule in
`session-actions.js` that passes the turn before the curtain comes down. A hand belonging to somebody else
is never on screen with the board visible, so every case this back fires on is the player's own hand. The
plate is already dimmed by `app.css` in the same state, so the region says "I am not asking you anything"
twice, once in a way that also hides what the player owns.

**The second reason is that turning a hand card over would not have helped.** `card.css` shows the rules
paragraph at the reference size only, and at the hand's factor it computes to 8.57 px at the design
resolution. So the request needs a size decision, not only a motion, and D66 puts three mechanisms with
their real costs in front of the answer rather than picking one.

**Nothing was implemented this time**, unlike handoff 09. D66 option 2, a genuine two sided turn, would
rebuild the card's DOM and break three end-to-end checks, and building that twice costs more than waiting.
That was the Product Owner's choice.

**Three briefs are open at once now, and the order that gets the most out of the least work is 09, 08,
10.** Handoff 09 is confirmation of three things already on screen, so it is the cheapest and it unblocks
nothing else. Handoff 08 is next because D61 is still the only open decision that blocks a requirement,
NFR-08's second half. Handoff 10 is the largest, and **within it D65 can be answered on its own**: it is
one question about an attribute, it needs no drawing, and the other four cannot be usefully answered
before it. If only one thing can be delivered out of this brief, deliver D65.

---

## Status on 2026-09-03, afternoon: a test round found four layout defects, and three of them are yours

**[09-brief-layout-and-fan.md](09-brief-layout-and-fan.md) is out, and it is the first brief in this loop
that reports work already done.** The Product Owner played a round at 1438 by 770 CSS px, which is a 2876
by 1750 panel at 200 % Windows scaling, and reported four things in one message. The game was unplayable
without scrolling on that machine, so all four were fixed the same day and the three that change a
numbered decision are sent back for confirmation rather than asked first. That route was the Product
Owner's choice and the brief says so in its own § 0.

| Brief | Owes | State |
| --- | --- | --- |
| [08-brief-pickable-field.md](08-brief-pickable-field.md) | `08-spec-pickable-field.md`, plus whichever of `prompt.css` and `board.css` the answer touches | **Open.** Sent 2026-09-03 |
| [09-brief-layout-and-fan.md](09-brief-layout-and-fan.md) | `09-spec-layout-and-fan.md`, confirming or replacing D62 to D64, plus whichever of `app.css`, `tokens.css`, `hud.css`, `hand.css` and `card.css` the answer changes | **Open.** Sent 2026-09-03 |

**What the four were.** One is a `must have` requirement that was only ever true at one window size, and it
is the interesting one: **D6's "there is no target resolution" is an answer about the board, and every
other region on the page is `rem`.** The rail costs a fixed 705 px and the page 820, up to D35's 882 with
the prompt strip up, whatever the window does, so FR-31 held at 1440 by 900 and nowhere else. The other
three: the seat plate is narrower than its own four numbers and the neighbouring plate painted over the
overflow (D63), an empty skill-hand slot was wearing a card back's `::before` and `::after` and painting
its outline over the last real card, and the fan's hard shadow is cast to the right so every shadow but the
last is hidden under the next card (D64).

**Two of the four were not design questions at all** and were fixed without asking: the empty slot's
pseudo-elements and its z-index. Both were selector accidents between two files that each answered half of
"what does an empty slot look like".

**One report was diagnosed differently from how it was made, and that is worth reading.** The request was
to turn the fan's stacking order around so the left card lies on top. The order is not the defect: it is
what leaves each card's left strip exposed, which is what D28 chose deliberately. The shadow is the defect.
Both looks were drawn out for the Product Owner with the consequence stated, that left-on-top cuts the
titles, and the shadow was chosen.

**The brief also carries two findings that need no decision from you**, both named because a spec's
measurements depend on them: `data-active` on the skill hand means "some card is playable" rather than
"this seat is on turn", so D33's hot-seat privacy hangs on the wrong state, and **Baloo 2 and Nunito are
declared in `tokens.css` and loaded by nothing**, which is D24 and which means no pixel figure in any spec
was measured against the fonts the game actually renders.

---

## Status on 2026-09-03: handoff 07 is closed, and answering it opened one question

**[07-spec-trap-marker.md](07-spec-trap-marker.md) landed.** All ten decisions came back, D51 to D60,
and nine of them are on screen. Five stylesheets: `board.css` amended, `board-trap.css` new, `pawn.css`,
`refusal.css` and `tokens.css` amended, plus a `--motion-trap-hold` token the view reads. The five
landing checks passed, the one element the spec named by name is wired (`.pawn__status`), and the four
`--seat-shape` repeats in `hud.css`, `chrome.css` and `overlay.css` are deleted as § 2 asked.

**Two things this closed that were live defects rather than preferences.** D55 took the trap announcement
out of `--color-warn`, the colour reserved for "you cannot do that", which had been shipping wrong on
purpose since 2026-09-02 with a note against it in `notes/04`. D60 gave a trap fired by a card two
seconds of guaranteed time on screen, which the game had simply not been giving the player.

| Brief | Owes | State |
| --- | --- | --- |
| [08-brief-pickable-field.md](08-brief-pickable-field.md) | `08-spec-pickable-field.md`, plus whichever of `prompt.css` and `board.css` the answer touches | **Open.** Sent 2026-09-03 |

**One decision did not land, and it is not a delivery problem.** D59 answers "what does a pickable field
look like" with violet and no dimming. `prompt.css` has answered the same question since handoff 04 with
teal and a dim, at the same specificity, and it loads later, so the D59 block is inert. Neither side could
have known: brief 07 asked D59 as an item this file's own § 4 listed as never answered **in a spec**, and
it had been implemented in the meantime.

**It blocks NFR-08's second half, which makes it the first requirement-blocking design item since brief
06 closed one on 2026-09-02.** The offer and the focus rings are both built from `box-shadow`, so the same
collision swallows D59's keyboard focus treatment: a field can be reached with Tab and gives no sign of
being reached. The reach itself shipped with issue #45 and works.

**The package landed whole and untouched anyway**, which the Product Owner chose over deleting the earlier
rules (that would leave a teal pawn beside a violet field, which is a design decision) or holding
`board.css` back (it carries the `--seat-shape` consolidation `board-trap.css` needs). Two places in the
repository record the current state: `src/main.js`'s import comment, where the cascade order is visible,
and a deliberate negative assertion in `tests/e2e/field-keyboard.spec.js` that is **meant to start
failing** when D61 is answered.

**One change to how a brief is written comes out of this.** A brief lists the DOM contract and the
constraints; it does not list the rules that already exist for the element it is about. This file guards
against a request being dropped and has no guard against a question being answered twice, because it
tracks what was asked and not what the repository already does. § 2 of brief 08 does list them, and the
next brief should too.

---

## Status on 2026-09-02, late: one brief is out again

**[07-brief-trap-marker.md](07-brief-trap-marker.md) was sent for issue #45.** The loop was empty for a
few hours and is not any more. D51 to D60 are open and are in the table in § 4.

| Brief | Owes | State |
| --- | --- | --- |
| [07-brief-trap-marker.md](07-brief-trap-marker.md) | `07-spec-trap-marker.md`, plus amendments to `board.css`, `pawn.css` and `refusal.css` | **Open.** Sent 2026-09-02 |

**What it is about.** The trap mechanic shipped with epic #38 on 2026-08-31 and not one file under
`src/ui/` reads `state.traps`, so the game has been enforcing rules the player cannot see. Issue #45
rebuilds those rules to match the Game Design Document and makes every trap and blocker public with its
owner shown, which turns an invisible rule into a rendering job with ten open looks in it.

**It blocks no requirement.** FR-30 is a `could have`, so this is the first brief since 02 that is about a
preference rather than a requirement. Brief 06 closed the last requirement-blocking item.

**Two of the ten are worth more than the rest, and the brief says so.** **D55** is what a trap firing looks
like, and it carries a deviation that is already shipping: the announcement goes into the D9 refusal strip,
which is painted in `--color-warn`, the colour reserved for "you cannot do that". A trap going off is not a
refusal. The alternative was leaving a Banana Peel silently eating a player's turn, and `CLAUDE.md` forbids
this side from inventing a third treatment, so it shipped wrong on purpose and D55 fixes it. **D59** is what
a pickable field looks like: `[data-pickable]` on a field is styled by nothing today, no field is reachable
from the keyboard at all, and four of the five field-targeting cards are the trap cards.

**Everything else about #45 ships without waiting.** All the attributes in the brief's § 3 go into the DOM
unstyled, along with the announcement text and a full Playwright suite that asserts them. That is the D27
precedent on purpose: markup now, stylesheet when the spec lands.

---

## Status on 2026-09-02, evening: nothing is owed

**Handoffs 05 and 06 were both answered in one delivery and both landed the same day.** The four files are
in the repository, the five landing checks were run, and the two DOM changes the specs asked for by name
are wired: `data-copies` on the pool overview card, and `tabindex` made conditional on a card being
playable. Both mockup folders, `handoff-04/` and `handoff-05/`, were reviewed and deleted.

| Brief | Answered by | Result |
| --- | --- | --- |
| [06-brief-pawn-mark.md](06-brief-pawn-mark.md) | [06-spec-pawn-mark.md](06-spec-pawn-mark.md) | **Closed.** D48, D49, D50, and D16 with them. `pawn.css` amended. **NFR-12 is met**, and `greyscale.spec.js` runs green with no expected-failure marker for the first time since 2026-08-30 |
| [05-brief-dice-pool-overlay.md](05-brief-dice-pool-overlay.md) | [05-spec-dice-pool-overlay.md](05-spec-dice-pool-overlay.md) | **Closed.** D43, D44, D45, D47. `pool.css` replaced, and it was the **last placeholder stylesheet in the project** |

**What this means for the loop.** Five stylesheets were written by Claude Code and should not have been,
and none of them is left. Every rule in the project's CSS now comes from a numbered decision in a spec.

**What is still open, and none of it blocks a requirement:** D17, D21, D22, D23 and D24 from handoff 02,
which never received a spec of its own, and the fonts still loading from Google Fonts since spec 01
section 5. Spec 06 also names one improvement it deliberately did not make: the seat-to-shape mapping now
repeats in four stylesheets and belongs in the one `[data-player="N"]` block in `board.css`, which a
delivery touching that file should do.

**One note for the next delivery, since this one got it right.** The package stated the date and the tree
its unchanged copies were read from, which is what the rule added after handoff 04 asks for, and only the
four files it declared changed were copied in. That rule now has a clean application as well as the near
miss that produced it.

## Status after handoff 04

**Handoff 04 was answered on the evening this file was written, and it is landed.** The spec is at
[04-spec-hud-menus-and-handover.md](04-spec-hud-menus-and-handover.md); the ten stylesheets are in
`src/ui/styles/`; the three DOM attributes it asked for by name are wired up; `npm test`, `npm run lint`
and the 213-case Playwright run are green. What that leaves:

| Was owed | Now |
| --- | --- |
| `04-spec-hud-menus-and-handover.md` | **Delivered and landed** |
| `prompt.css`, `hud.css`, `overlay.css`, `chrome.css` | **Replaced.** Plus `handover.css`, which is new |
| `tokens.css`, `app.css`, `hand.css`, `refusal.css`, `pawn.css` | **Amended and landed** |
| `05-spec-dice-pool-overlay.md` and `pool.css` | **Still owed.** D43, D44, D45, D47. D46 was answered inside D42 |
| D16, and NFR-12 with it | **Answered, not closed.** See below |

**The one thing to read before anything else.** D16's answer is in and it is on the HUD, the chrome and two
overlay panels, but NFR-12 is measured **on the pawn** and the mark is not there. The spec names what is
missing: `.pawn__mark`, an empty `<span>` inside `.pawn`, and about fifteen lines of `pawn.css` after it.
Those fifteen lines were not in the delivery. **That is the only outstanding design item in the project
that blocks a requirement at all**, `greyscale.spec.js` is still marked expected-to-fail because of it,
and it has no brief of its own. It is a smaller ask than the handoff 05 spec and it is worth more.

Two notes on landing the delivery, for the next one:

- **`board.css`, `card.css` and `card-state.css` were not copied in.** All three are listed as "unchanged,
  included so the mockup runs", and two of them differ from the repository only in Prettier formatting.
  `board.css` does not: the delivered copy predates the NFR-02 split into `board.css`, `board-track.css`
  and `board-regions.css`, so copying it would have reverted that split silently. **If a future delivery
  includes files it did not change, say which commit or date the snapshot was taken from.**
- **Every delivered file was under 300 lines after `npm run format`**, which is the first handoff to manage
  that without a split. Writing one declaration and one selector per line is what did it. `prompt.css` is
  the closest at 244.
- **The spec arrived with five em dashes and they were edited out before it was committed.** CLAUDE.md bans
  the character and the rhetorical habit outright, in every document and every language, and no brief in
  this loop has ever said so. **It is added to section 5 below**, because it is a rule about the deliverable
  and every brief lists the rules about the deliverable. Two were table placeholders and three were the
  habit: a claim interrupted by an aside and then a stated consequence.

The rest of this file is the work order as it was written, and sections 1, 2.1 and 2.2 are now partly
historical. Section 4's decision table and section 5's rules still apply as written.

---

## 0 What this file is, and what it is not

**It is not a brief.** [README.md](../README.md) defines the loop as numbered pairs, `NN-brief-<topic>.md`
answered by `NN-spec-<topic>.md`, and this file is neither half of a pair. It is a **work order**: an index
of the requests that are already out, the files each one owes, and the order they are best answered in. It
carries the `00-` prefix so it sorts above the pairs and reads as the cover sheet it is.

**Every technical requirement is in the briefs, not here.** Do not design from this file. It tells you
which briefs to read and what is expected back; the DOM contracts, the constraints and the numbered
decisions live in the briefs themselves and this file only points at them.

**Why it exists.** Three briefs are outstanding at once, two of them sent on the same day, and one of the
files that is owed appears in **no brief's deliverables table at all** (§ 2.2). At three open requests the
loop needs an index or something gets quietly dropped, and something already had been.

---

## 1 Status of the loop

| Handoff | Brief | Spec | State |
| --- | --- | --- | --- |
| 01 Foundations and board | [01-brief](01-brief-foundations-and-board.md) | [01-spec](01-spec-foundations-and-board.md) | **Closed.** Landed 2026-08-30 |
| 02 Board review | [02-brief](02-brief-board-review.md) | *none* | **Open since 2026-08-30, and no spec was ever returned.** D19 was answered inside spec 03 and D18 was re-asked as D40 in brief 04. Eight decisions have no answer anywhere |
| 03 Cards and hands | [03-brief](03-brief-cards-and-hands.md) | [03-spec](03-spec-cards-and-hands.md) | **Closed.** Landed 2026-08-31 |
| 04 HUD, menus and handover | [04-brief](04-brief-hud-menus-and-handover.md) | [04-spec](04-spec-hud-menus-and-handover.md) | **Closed.** Landed 2026-09-01. D16 answered for the page furniture, not for the pawn |
| 05 Dice card pool overlay | [05-brief](05-brief-dice-pool-overlay.md) | [05-spec](05-spec-dice-pool-overlay.md) | **Closed.** Landed 2026-09-02. D43 to D47; D46 answered inside D42 |
| 06 The seat mark on the pawn | [06-brief](06-brief-pawn-mark.md) | [06-spec](06-spec-pawn-mark.md) | **Closed.** Landed 2026-09-02. D48 to D50, and D16 with them |
| 07 Traps, blockers and pawn statuses | [07-brief](07-brief-trap-marker.md) | [07-spec](07-spec-trap-marker.md) | **Closed.** Landed 2026-09-03. D51 to D60, all ten answered. Nine are on screen; D59 is inert because `prompt.css` answers the same question and loads later, which is now D61 |
| 08 The pickable field | [08-brief](08-brief-pickable-field.md) | *none yet* | **Open.** Sent 2026-09-03. D61, one question with four parts. **Blocks NFR-08's second half**: a field can be tabbed to and gives no sign of it |
| 09 The stage, the seat plate and the fan | [09-brief](09-brief-layout-and-fan.md) | *none yet* | **Open.** Sent 2026-09-03. D62 to D64, **all three already implemented and sent back for confirmation**, because FR-31 was broken on the machine the round was played on and the fix could not wait |
| 10 Reading a card you are holding | [10-brief](10-brief-card-reveal-on-hover.md) | [10-spec](10-spec-card-reveal-on-hover.md) | **Closed.** Landed 2026-09-03. D65 to D69, all five answered and all five on screen. The five stylesheets were **merged rather than copied in**, because they had been read against a tree four hours old; one delivered rule in `card-reveal.css` was amended for the same reason. See the status block at the top of this file |
| 11 The roll | [11-brief](11-brief-roll-animation.md) | [11-spec](11-spec-roll-animation.md) | **Closed.** Landed 2026-09-03. D70 to D74, all five answered and all five on screen. **NFR-08's explanation half is closed with D73.** The package was one new stylesheet and two amendments; `tokens.css` was **merged rather than copied in**, because the delivered copy predated `e486bb4` and would have reverted D62's stage. Second delivery in a row with that problem: see the status block at the top |
| 12 The main menu | [12-brief](12-brief-main-menu.md) | *none yet* | **Open.** Sent 2026-09-03. D75 to D80, and **the first brief in the loop that asks for three drawings and a choice between them.** Three menu items, one usable, and nothing in the project styles a control you cannot use |

**The 02 row is the one worth reading twice.** A brief with no spec is not a brief that was declined, it is
a brief nobody closed, and one of its eight open items (D16) is the only design question in this project
that blocks a requirement rather than a preference. **It is `should have`, not `must have`**: that label was
wrong in this file and in four others, and it is corrected in the risk register and in
`00-Meta/Documentation/notes/01-requirements-and-goals.md`.

---

## 2 The files that are missing

### 2.1 Spec documents

| File to create | Answers | Read first |
| --- | --- | --- |
| ~~`01-Design/Handoff/04-spec-hud-menus-and-handover.md`~~ | D35 to D42 | **Delivered 2026-09-01** |
| `01-Design/Handoff/06-spec-pawn-mark.md` | D48 to D50, closing D16 | [06-brief](06-brief-pawn-mark.md), **first** |
| `01-Design/Handoff/05-spec-dice-pool-overlay.md` | D43 to D47 | [05-brief](05-brief-dice-pool-overlay.md), second |

Both follow the five-section spec template in [README.md](../README.md): files delivered, one answer per
open decision **with its reason and its rejected alternatives**, a token reference table, component states
checked against the brief's DOM contract, and what is still open.

Handoff 02's eight leftovers do **not** need a spec document of their own. Answer whichever of them the
work on D35 to D47 happens to settle, in whichever spec settles it, and say which are still open.

### 2.2 Stylesheets

**Five files in `src/ui/styles/` were written by Claude Code and should not have been.** Each one says so in
its own header, composes existing tokens only, and names the decision that is owed. They are listed in the
order they appeared.

| File | Lines | Owed by | In that brief's deliverables table? |
| --- | --- | --- | --- |
| `prompt.css` | 183 | D35, D36 and spec 03 § 5 (the countdown) | Yes, brief 04 |
| `hud.css` | 167 | D35, D36, D37 | Yes, brief 04 |
| `overlay.css` | 185 | D38, D39, D40 | Yes, brief 04 |
| `chrome.css` | 88 | D42, and now D46 | **No. This is the omission.** |
| `pool.css` | 92 | D43, D44, D45, D46 | Yes, brief 05 |

> **All five are replaced as of 2026-09-02.** Four went with handoff 04 and `pool.css` with handoff 05.
> The table is kept as the record of what the loop was asked to fix.

**`chrome.css` is the finding.** Brief 04 asks about the chrome in D42 and `chrome.css` names D42 in its
header, but the file is absent from brief 04 § 6 and brief 05 only lists it conditionally, "only if D46
restructures the row". So nothing actually asked for it, and a spec answering D42 in prose while leaving
the placeholder stylesheet in place would have looked complete. **It is requested here explicitly.** It has
also grown since brief 04 was written: issue #30 added a third button to that row, so the file's own header
sentence about "the two controls" was already stale and has been corrected.

Two files are **amended and never replaced**, because they are shipped, tested and referenced by name
throughout the documentation notes:

| File | How |
| --- | --- |
| `tokens.css` | New tokens added to the existing set. Do not remove or rename an existing one without saying so in the spec |
| `app.css` | The HUD and chrome regions per D35. Additive |

`card.css` and `hand.css` are yours from spec 03 and may be revised, but say in the spec that they changed
and why. D35 already changed two of their values under protest and asks to be overruled.

---

## 3 Suggested order, and the reason for it

> **Superseded 2026-09-02.** Handoff 04 landed, so the order below is history. The current order is in the
> status block at the top of this file: **06 first, 05 second.** Kept so the reasoning is readable.

1. ~~**Handoff 04 first.**~~ It owns the page layout, and D35 decides how many grid rows the foot of the page
   costs. Everything else sits inside that answer: the pool overview is a panel on the same sheet
   `overlay.css` draws, and the chrome row D46 asks about is the row D42 is about. **Done.**
2. **Handoff 05**, and it is small: one panel, one card region, one sentence. D46 was a sub-question of
   D42 and was answered in the 04 spec, which the 05 spec should confirm.
3. ~~**D16 whenever it can be answered, and preferably not last.**~~ **Now brief 06, and first.** It is
   the only item in this file that blocks a requirement rather than a preference. See § 4.

~~**If only one thing can be delivered, deliver the 04 spec.**~~ **If only one thing can be delivered,
deliver the 06 spec.** It is fifteen lines and it closes a requirement.

---

## 4 Every open decision, in one table

| No. | In one line | Brief | Blocks a requirement? |
| --- | --- | --- | --- |
| ~~**D16**~~ | Telling four seats apart without relying on colour | 02 | **Closed 2026-09-02, and NFR-12 with it.** Answered by spec 04 for the HUD, the chrome and two overlay panels, re-asked as D48 to D50 in brief 06, and closed by spec 06 with the shape on the piece. `greyscale.spec.js` asserts four different shapes and carries no expected-failure marker |
| D17 | Does the legal-target set read as one group, given the entry-square exception | 02 | No |
| D20 | Does the four-second refusal minimum become a token | 02 | No |
| D21 | Does a legal target that captures look different | 02 | No |
| D22 | The overlapping movable rings inside a yard | 02 | No |
| D23 | Who owns `board-track.css`, and how CSS is delivered under the 300-line limit | 02 | No, but it is a process answer worth having |
| D24 | Self-hosting Baloo 2 and Nunito as woff2 | 02 | No. Open since spec 01 § 5 |
| D35 | Where the HUD and the chrome go, and what they cost in page height | 04 | Indirectly: FR-31, one screen with no scrolling |
| D36 | What "on turn" looks like, and how many places say it | 04 | No |
| D37 | Sixteen numbers on screen: how the HUD reads at a glance | 04 | No |
| D38 | One overlay component, five contents. Is that the right seam | 04 | No |
| D39 | The handover screen, which must actually conceal the skill hand | 04 | Yes in substance: D33's secrecy answer depends on it |
| D40 | The win screen, and the orange strip that also says it. Was D18 | 04 | No |
| D41 | The 36 illustrations against the two skins | 04 | No |
| D42 | The two, now **three**, persistent controls | 04 | No |
| ~~D43~~ | Seven cards at once: what size, what arrangement | 05 | **Closed.** Four then three at `--card-u: 0.68` in a 54.5rem panel, centred |
| ~~D44~~ | How the copy count is shown, and whether the weighting is readable as a shape | 05 | **Closed.** Both: the number stays in the tag and the card is drawn as the pile it stands for |
| ~~D45~~ | Where the face-down sentence sits, and how loud it is | 05 | **Closed.** It stays where it is, unchanged, because the number barely moves |
| ~~D46~~ | A third chrome button. Answer with D42 if that is easier | 05 | **Closed** inside D42, and spec 05 confirms three buttons need no new structure |
| ~~D47~~ | Does the pool overview also open from the dice hand | 05 | **Closed. No**, and `hand.css` is untouched |
| ~~**D48**~~ | Size and placement of the seat mark on the pawn, and what happens to the eyes of D14 | 06 | **Closed.** 38 % of the piece, low on the disc, ink, and the creature is unchanged |
| ~~**D49**~~ | The mark through the five pawn states: selected at 1.14, captured at 0.82 and 70 %, movable loop, focus, reduced motion | 06 | **Closed.** It takes part in none of them, which is a decision with the capture state's 2.16:1 named as its cost |
| ~~D50~~ | What happens to the luminance-only measurement in `greyscale.spec.js` once the shape is on the piece: retire, keep as a weaker check, or re-spread the palette as well | 06 | **Closed. Retired**, the four-different-greys case kept as the palette floor, and the 1.146 figure moved into the notes |
| ~~**D51**~~ | What a trap looks like on a field. Three kinds, one shape language or three | 07 | **Closed.** A chip in the field's foot-left corner at 30 per cent, built exactly like a pawn: seat fill, hair ink edge, seat shape in ink, piece shadow. **The three kinds look identical on purpose**, and the kind stays in the `aria-label`, so `data-trap-kind` is in the DOM and deliberately unread |
| ~~**D52**~~ | How a blocker reads differently from a trap. Confirms or replaces `data-trap="blocker"`, which spec 01 § 5 predicted as `data-blocked="true"` | 07 | **Closed.** `data-trap="blocker"` confirmed. The same object at 76 per cent with square corners: a trap is a small thing lying on the path, a blocker is the path being gone. It stops 12 per cent short of the edge so the turn-off bar stays visible over it |
| ~~**D53**~~ | Whether and how the owning seat is shown on a 1-cell field, given that NFR-12 forbids colour alone | 07 | **Closed.** Shown, by the seat colour as the chip's fill and the seat's shape in ink inside it, off the one mapping in `board.css`. The cost is stated: the shape is 10 px at the design size and 6 px at the board's floor, so at the floor the owner reads by colour alone. NFR-12 is measured on the pawn and unaffected |
| ~~**D54**~~ | How three marks on one field coexist: trap, D27's skill diamond, D7's legal-target ring | 07 | **Closed. Nothing gives way.** The ring is the field's own edge, the diamond is centred, the chip is in a corner, and D27's existing step back to `inset: 30%` absorbs the one place two of them meet |
| ~~**D55**~~ | What a trap firing looks like, and what the announcement is. **The one that fixes a deviation already shipping**: the announcement is currently in the refusal orange, and a trap going off is not a refusal | 07 | **Closed, and it was a live defect rather than a preference.** The chip fades and scales over `--motion-capture` in both directions, and the strip gets a second voice on the `data-message-kind` seam: the panel colour with an ink dot. Two declarations, no new token, no new component |
| ~~**D56**~~ | How a stunned pawn reads. The first status mark on a pawn in the project | 07 | **Closed.** The piece tips nine degrees and its fill mixes 58 per cent toward `--color-dormant`. The tilt is the point: it is the only piece on the board not upright, so it reads at a glance and in greyscale. The seat mark is untouched |
| ~~**D57**~~ | How the Oil Spill `SLIPPERY` status reads. Answerable with D56 | 07 | **Closed**, with D56 as one pawn-status decision. A dormant disc with an ink skid on the piece's upper right shoulder, on a new `.pawn__status` span the spec named and Claude Code added. **It is the slot for the six statuses this issue does not answer** |
| ~~**D58**~~ | Whether the It's Not That Deep aura is drawn, and how. Seven contiguous fields | 07 | **Closed. Drawn**, as a 45 degree hatch in `--color-text` at 22 per cent on `background-image`, the one paint layer on `.square` nothing else used. Seven fields of texture read as one region; seven of colour would read as a second board |
| **D59** | What a pickable field looks like, and its keyboard state. Also answers the third unnumbered leftover below, asked for a field | 07 | **Answered, not landed. This is now D61.** Violet with no dimming, and focus as two rings outside the field. `prompt.css` has answered the same question in teal with a dim since handoff 04, at equal specificity, and loads later, so the whole block is inert. See the status block at the top of this file |
| ~~**D60**~~ | Whether a trap announcement gets a hold token, and whether the game waits for a mid-turn one. D20 is the precedent | 07 | **Closed. Yes to both.** `--motion-trap-hold: 2s`, and the view holds the turn for it when a trap fires from a card. Two seconds and not D20's four, because a refusal follows the player's own click and this arrives unasked. It needed code rather than CSS |

| **D61** | How the pickable field and the pickable pawn are drawn, given that handoff 04 and D59 answered the same question in opposite directions. Four parts: which answer wins for the field, what a focused field looks like, whether the pawn follows, and what happens to the dim | 08 | **Yes, and it is the only one open that does.** NFR-08's second half: the collision swallows D59's focus treatment as well as its fill, so a field can be reached with Tab and gives no sign of it |

| **D62** | Whether the page is drawn on a fitted 16:9 stage, and at what size. Against D6, which made the **board** fluid and left the other four regions in `rem`, and against D30's breakpoint | 09 | **It did.** FR-31 was true at 1440 by 900 and nowhere else: the page needs a fixed 820 px of height, 882 while it is asking something, so a 1438 by 770 laptop scrolled by 50 px and by 112 with the prompt up. **Already implemented and sent back for confirmation** |
| **D63** | Whether the seat plate takes the width its four numbers need. Against D37's fixed 15.5rem | 09 | No. The plate gave the numbers 218 px and they need 278, so the last one ran 45 px out and the next plate painted over it. **Already implemented as `min-width`, sent back for confirmation** |
| **D64** | Whether the fan keeps its stacking order and flips its shadow to the left. Against the depth cue in `card.css`, not against D28's exposed left strip, which is intact | 09 | No. Comes with two findings the answer should absorb: the overlap table follows `data-count` while the hand builds five permanent slots, so a hand of three is wider than a hand of five, and the hover reveal under-shifts at the higher counts. **Already implemented, sent back for confirmation.** The hover finding is carried on as **D69** and is no longer owed here |

| ~~**D65**~~ | Whether the player's own skill hand stays face down when nothing is playable. Against half of D33, which put the back there for hot-seat privacy. Four parts: is the own hand always face up, what still says the region is dormant, does the closed-up overlap survive, and what `.card--back` is still for | 10 | **Closed. It is always face up.** `data-face` is split off `data-active` on the hand: one answers "may this person see these cards", the other keeps D36's "can something here be played". The plate dim and the desaturation are what say the region is dormant, and the closed-up overlap moved onto `data-face="down"`, which has no case in hot seat play and is kept in the contract for a spectator view, a replay or the online mode. `.card--back` is kept for the pool and the discard pile and is now the only definition of the back |
| ~~**D66**~~ | What a revealed card looks like, and by which mechanism. Three routes are offered with their real costs and none is chosen: grow in place, a genuine turn, or a detail card at the reference size beside the hand | 10 | **Closed. Option 1, grow in place, landing exactly on `.card--full`.** `scale: calc(1 / var(--card-u))`, anchored at the bottom edge, so the layout box does not change and no neighbour moves, while the insides re-flow and the paragraph is painted at 12.6 px. The turn was rejected with the reason spelled out: it does not change the size, so it would have to be bought on top of a size change rather than instead of one. Costs no element, no view code and no mouse handler. `card-reveal.css` is the new file |
| ~~**D67**~~ | Whether a card that cannot be played reveals too, and what the focus state is there | 10 | **Closed. Yes to all of it, and NFR-08's reading half is closed with it.** The reveal is keyed on `[data-card-id]` and not on playability, the focus ring is the same ring, the reveal cancels the desaturation so a card is read at full contrast, and nothing needs `Escape`. The tab stop needed a `focusable` field on the card view model rather than a change inside `updateCard`, because the pool overview renders through the same component and spec 05 § 5's reason still stands there |
| ~~**D68**~~ | Which token times the reveal, and what survives `prefers-reduced-motion`. D8 and D12 own motion; D20 and D60 are the precedent that a new duration gets a number | 10 | **Closed. Two tokens.** `--motion-reveal: 160ms`, between the 90 ms feedback budget and the 240 ms move budget, collapsing to 1 ms under reduced motion because reading a card is feedback. `--motion-reveal-delay: 120ms`, declared per property so the lift is never delayed, and deliberately **not** in the reduced-motion block: it guards against a latch rather than being a movement, the same argument as `--motion-refusal-hold` |
| ~~**D69**~~ | Whether the reveal replaces the sideways fan out in `hand.css` or joins it | 10 | **Closed. Replaces it, deleted rather than joined.** A revealed card is painted at `--layer-card-raised`, above both its neighbours, so nothing covers the thing being read and there is nothing left for the neighbours to step aside for. It removes a number that had to be right at five different counts, and the second thing that moved when a pointer crossed the fan |

| ~~**D70**~~ | Whether the roll gets a moment of its own, and what measures it. Three parts: is it a movement like `--motion-move` or a hold like `--motion-trap-hold` that the loop actually waits for, how long, and what happens to it under `prefers-reduced-motion` | 11 | **Closed. A hold, and the loop waits for it.** Two tokens: `--motion-roll: 520ms` is the throw and `--motion-roll-hold: 900ms` is what the loop waits. The argument for a hold over a movement is that a stylesheet cannot make a moment out of a frame that has already been painted, so a keyframe would have animated the number while two other cards flew past it. `--motion-roll-hold` stays out of the reduced-motion block, on D20's and D60's argument, and is the third token to do so: a hold is time, not movement |
| ~~**D71**~~ | What the roll looks like, and by which mechanism. Three routes with their real costs and none is chosen: the number arrives in the 30 px badge, the card performs the roll, or a die becomes its own object | 11 | **Closed. Route 2, the kept dice card is the die and performs the throw**, with route 1's badge arrival kept as its last beat. Route 3 was rejected on meaning rather than on cost: a D8 card already depicts an octahedron, so a second one beside it draws the same object twice in two visual languages. Written on `rotate` and `translate` and never on `transform`, so it composes with the lift that `card-state.css` and `hand.css` write instead of replacing it. No new element and no new view code |
| ~~**D72**~~ | What replaces `:empty { display: none }` on the roll badge, since an element with `display: none` has no start state to animate from. Three routes, and every one of them is also a small change to our code | 11 | **Closed. Nothing replaces it, and this is the best answer in the delivery.** A fourth route the brief had not offered: write the number into the badge at the **start** of the throw rather than at the end, and let the keyframe's `backwards` fill hold it invisible until the card comes to rest. An element already in the layout has a start state, so `card-state.css`, `card.css` and `hand.css` were not delivered and needed no change. It cost this side zero lines: the badge is filled from `state.roll` by the same render that sets the attribute, because both follow from one fact |
| ~~**D73**~~ | How a roll that cards changed reads on screen. Four parts: where the breakdown lives, whether the steps arrive one at a time, what happens on an ordinary one-step roll, and whether it stays | 11 | **Closed, and NFR-08's explanation half is closed with it.** A list in the message strip, as a third value of `data-message-kind`, all steps in one paint, and **only from two steps up**: one step is `base`, which is almost every roll, so the strip speaking is itself the signal that cards changed the roll. It takes the trap's voice and not the refusal's, which is D55's seam used a second time. It holds no timer and costs no milliseconds, which is why D70's hold could stay as short as it is |
| ~~**D74**~~ | What survives reduced motion, and what survives the test suite. D12 owns the first; the second is a promise from our side that a hold gets a fifth key in `FAST_DELAYS`, and needs only your confirmation | 11 | **Closed. Confirmed, `roll: 0`.** Skipping the hold entirely in a test run is acceptable because nothing in the game state depends on it: it changes no value and no rule branches on it. One spec, `roll-animation.spec.js`, pays for the timing at real speed instead of all 333 paying for it. NFR-11's 90 ms is answered by the click and not by the roll, which is D68's structure repeated: the slow thing is never the first thing |

| **D75** | Whether the menu is still the overlay panel or becomes its own layout, and whether it gets its own stylesheet. Against D38, whose seam has held for five screens and meets its first content that is not the game stopping to ask a question | 12 | No |
| **D76** | What the three menu items are as objects: a stack of buttons, tiles, rows, or the game's own card language. Plus whether Hotseat is drawn larger than the two that do not work, and what the tab order is | 12 | No |
| **D77** | What an item you cannot use looks like, and whether it is `disabled` or `aria-disabled`. **Nothing in this project styles an unusable control**: neither attribute appears in any of the eighteen stylesheets or in any file under `src/ui/`. NFR-12 applies, so it cannot rest on colour | 12 | No. It is the decision with no precedent to reuse, and the reason all three mockups have to show it |
| **D78** | Whether an unavailable item explains itself and where that text sits. The two unavailable items are unavailable for **different** reasons: FR-42 was never built, and S11 was deliberately deleted with its language half already in the chrome | 12 | No. NFR-03 keeps the sentence out of CSS, so it needs an element we build once the spec names it |
| **D79** | What else is on the menu. The game's name, which is an `<h2>` at the same size as the word "Paused"; the one sentence; the language button that already floats over the menu at `--layer-chrome`; and whether a place is reserved for S10 without designing it | 12 | No |
| **D80** | Whether Hotseat still leads to the separate player-count screen S2. **Asked as a confirmation**, because the Product Owner chose to keep the two screens: S2 has its own requirement and acceptance criterion, its three count buttons are already designed, and three end-to-end specs click them | 12 | No |

Four more items are open from spec 03 § 5 and brief 04 § 5.1 and are not numbered: what the reaction
countdown looks like, whether the prompt strip belongs at the foot or in the rail, how a pickable pawn
differs from a movable one, and what an **empty hand slot** looks like. The last one is visible in any
screenshot of a hand holding one card and currently renders as a blank card, which is neither of the two
answers the existing specs give.

**The third one is the cautionary tale of this file and it is worth reading twice.** It was asked properly
as **D59**, for a field rather than for a pawn, because issue #45 made four of the five field-targeting
cards trap cards. D59 was answered, and the answer could not land: **the item had already been
implemented**, on 2026-09-01, in `prompt.css`, in a block whose own comment says it is answering this
exact leftover. So this list was right that no spec covered it and wrong that nothing did, and the loop
had no step that would have caught the difference. It is now **D61**, and § 2 of brief 08 lists the rules
that already exist for the element it asks about, which is the change that would have prevented it.

---

## 5 The rules that apply to every delivery

Full versions are in each brief's § 2. The five that get broken most often, and the fifth is new because
handoff 04 was the first delivery to break it:

1. **No user-facing string in CSS.** Nothing a player reads in a `content:` property (NFR-03). Overlays are
   almost entirely text, which is where this bites.
2. **No CSS file over 300 lines, measured after `npm run format`.** `board.css` was delivered at 248 lines
   and Prettier expanded it to 407. Split yourself at roughly 250 unformatted lines.
3. **Built once, then only attributes rewritten.** The HUD updates after every turn, so a re-created
   element restarts every transition on it.
4. **Two skins from the tokens, through `light-dark()` pairs, and `prefers-reduced-motion` respected.**
5. **No em dash, anywhere, in the spec or in a CSS comment.** CLAUDE.md bans the character and the
   rhetorical habit it enables: a claim interrupted mid-sentence by an inserted aside and then a stated
   consequence, or "either A, in which case B, or C, in which case D". Use a colon, a semicolon, a comma,
   or two ordinary sentences. In a table cell where a value is genuinely absent, write `n/a` or `none`.
   Handoff 04's spec had five and they were edited out on landing, which is a change to a delivered
   document and is better avoided than corrected.

**If an answer needs a DOM element the brief does not promise, name it in the spec rather than styling
around its absence.** Claude Code adds it, and that is a much smaller change than a stylesheet built on a
guess about markup.

---

## 6 The five landing checks

Claude Code does not merge a spec unread. Same list every time:

1. Every open decision the brief names is answered, none silently skipped.
2. Every answer carries a reason **and** a named rejected alternative.
3. No CSS file over 300 lines after `npm run format`.
4. No user-facing string in a `content:` property.
5. Every state in the brief's DOM contract is actually styled, and any element the spec needs that the
   contract does not promise is named rather than assumed.

A missing reason is asked for **now**, while somebody still remembers it, and not reconstructed for the
report later. That is the whole point of the round trip.

---

## 7 What is deliberately not being asked

- **Audio and every sound cue.** Issue #40, deferred out of epic #39 on 2026-09-01.
- **The rules screen, S10** (FR-35). A `should have` with no board issue. The pool overview of handoff 05
  covers the dice-card third of it by accident, and that is as far as it goes.
- **The board, the pawns and the two hands.** Specs 01 and 03 own them. Amend only where a decision forces
  it, and say so.
- **The 36 illustrations themselves.** They exist and are on screen. D41 is about the colour they are drawn
  in, not the drawings.
- **The skill card pool.** Fifty-eight cards over twenty-nine ids with a real discard pile. A different data
  model, and it needs its own brief before it needs a design.
