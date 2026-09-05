# Handoff 15, brief: the line-up screen, who is a person and who is a computer

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-05
**Read against:** `2d01e73`, on branch `feature/82-bot-card-tactics`. Every line number below is that tree
**Issue:** #76, the setup screen with bots on it. Requirement FR-43, and FR-01 for the lower bound of
one person
**Answers:** nothing. **Supersedes D86 of brief 13** and asks **D90 to D96** in its place. D81, D84 and
D85 of brief 13 stay open and are untouched by this file

> **This file currently sits in the repository root, not in `01-Design/Handoff/`.** It is a plan the
> Product Owner asked for before it becomes a commissioned brief. On approval it moves to
> `01-Design/Handoff/15-brief-bot-setup-menu.md` unchanged, and the spec answering it lands next to it
> as `15-spec-bot-setup-menu.md`.

---

## 0 What was asked for, and what has changed since brief 13

The Product Owner, 2026-09-05:

> The bots can only be reached through a URL parameter at the moment. Plan a selection menu for them in
> the main menu, appearing after the player decides between the single and the multiplayer mode.

Brief 13 asked the same thing once already, as **D86**, and called it "the real commission". That
question is still unanswered, and it was deliberately wide: it asked for a screen without saying what
the control on it was. Since then two things about it have been decided with the Product Owner, so
re-asking it in its old shape would be asking for work that is already ruled out.

**Decided on 2026-09-05, not open here:**

1. **The screen comes after the player count, not before it.** The route is main menu, then S2 with its
   2, 3 and 4 buttons, then the new screen, then the match. The player count is what fixes how many
   seats there are to talk about, so a screen that names the seats cannot come first.
2. **The choice is per seat, not a number.** The screen says, for each of the seats this match has,
   whether a person or the computer plays it. It does not ask "how many bots" and it does not ask the
   player to pick a difficulty, because there is one bot and it plays one way (brief 13 § 6).

**A consequence worth stating, because the Product Owner's sentence says "single or multiplayer mode"
and this screen does not:** there is no mode switch anywhere in the flow. One person and two bots is a
single-player match, two people and one bot is a multiplayer match, and the difference is nothing but
how many rows on this screen say "person". Whether the screen should still **name** the mode it has
just produced is D96.

So D86 is retired and D90 to D96 replace it. Everything brief 13 said about the bot itself, its pause
(D81), its card play (brief 14) and how a bot seat is marked during a match (D85) is unchanged.

---

## 1 The flow today, and the one place a screen can be inserted

**There is no router.** Which screen is up is a single closure variable, `screen`, in
`src/ui/match-flow.js` line 71, deliberately kept out of the frozen game state because the rules know
nothing about a pause. A screen is opened by `openScreen(OVERLAY_SCREEN.X)`, and what a button means is
one line in `src/ui/session-actions.js` lines 51 to 54.

Today, in full:

```
main menu (S1)            three doors: hotseat, online, settings
  hotseat click           session-actions.js line 52
setup (S2)                three buttons, data-count 2, 3, 4
  count click             session-actions.js line 53 -> freshMatch(count) -> the match starts at once
match
```

The count click is the important line. **It both chooses a number and starts the match**, in one
gesture and with no confirmation. The new screen breaks that in two: the count click will open the
line-up, and something on the line-up will start the match. That is a change to the flow and not only a
new picture, which is why D94 asks about it explicitly.

Four mechanical facts to have before drawing anything:

| What | Where | Consequence for a design |
| --- | --- | --- |
| The overlay's buttons are **rebuilt on every screen change**, and on every language switch | `overlay-view.js` lines 197 to 201, reason at lines 24 to 26 | Nothing may animate a control's arrival. A row that slides in would slide in again every time the language is switched |
| The keyboard is put on the **first** `.overlay__button` when a screen opens | `overlay-view.js` lines 213 to 215 | Whatever is first in the DOM takes focus. On a screen of four seat rows plus a start button, say which one that should be |
| `.overlay__actions` is a **centred, wrapping flex row** | `overlay.css` lines 158 to 163 | Seat rows stacked vertically is a different rule, as it was for the menu. `menu.css` scoped its own layout to `[data-screen="menu"]` and left the row alone. Say which you do |
| The chrome sits **above** the overlay and keeps only the language button on a menu screen | `chrome-view.js` lines 94 to 126, `--layer-chrome: 7` | The top right of this screen is already occupied, exactly as it is on the menu |

---

## 2 What the repository already decides here, so nothing is answered twice

The standing § 2 since brief 08.

| Already decided | Where | Status in this brief |
| --- | --- | --- |
| **One overlay component behind six screens**, told apart by `data-screen` | D38, spec 04 | Unchanged. A seventh value is added for this screen and nothing else moves |
| **A screen may have its own stylesheet without becoming a second component** | `handover.css`, then `menu.css` under D75.2 | The precedent this screen most likely follows. Brief 13 § 1 already guessed it earns one |
| **Menu and setup are an opaque curtain**, pause and win a translucent veil | `overlay.css` lines 50 to 54 | The line-up is a pre-match screen, so the curtain is the default. Say if it is not |
| **The setup panel is 34rem wide**, the default panel 30rem, the menu 84rem | `overlay.css` lines 65 and 75 to 77, `menu.css` line 41 | All three are precedents and none is a constraint. The line-up picks its own |
| **At most one primary button per screen** | `overlay.css` lines 183 to 187 | Relevant the moment this screen gets a Start button (D94) |
| **The three count buttons are a choice between equals**, one size, square-ish, in the numeric face | `overlay.css` lines 196 to 203 | S2 keeps its look. This screen does not inherit it, and the two now sit one after the other, so they will be compared |
| **A seat is identified by a colour and a shape, never by colour alone** (NFR-12) | D1 and D2, spec 01; the `[data-player="N"]` block in `board.css` maps both | Binding here. A column of four colour swatches is exactly the case D2 was written for |
| **A bot keeps its seat's number**: seat 2 of four is "Bot 2", never "Bot 1" | `player-labels.js` lines 55 to 70 | Binding. The screen names seats with the same two vocabularies the HUD uses |
| **`data-controller="bot"` or `"human"` is already in the DOM** on every `.hud__seat` | `hud-view.js`, brief 13 § 2 | The attribute name to reuse on this screen, so one word means one thing in two places |
| **The person keeps seat 0 today**, and the bots take the last seats | `botSeatsFor`, `state/bots.js` lines 47 to 55 | **Reopened by this screen**, because a per-seat choice can put a bot on seat 0. See D95 |
| **At least one person plays** | FR-01, and `options.js` lines 105 to 110 refuse `bots >= players` | Binding, and it is the one rule this screen has to enforce in front of the player rather than behind them. See D93 |

---

## 3 The measurements

`app.css` line 47 sets the root text size to `min(100vw / 100, 100vh / 56.25)`, which at the design
resolution of 1440 by 900 is **14.4 px**, and `.app` is a fitted stage of `100rem` by `56.25rem`, so
**1440 by 810 px** with letterbox bars.

| Thing | Where | At 14.4 px |
| --- | --- | --- |
| The stage | `app.css` lines 74 and 75 | 1440 by 810 px |
| The setup panel, the screen immediately before this one | `overlay.css` lines 75 to 77 | 489.6 px wide |
| The menu, for the other end of the range | `menu.css` line 41, `84rem` | 1209.6 px wide |
| Panel padding, and the gap between its children | `--space-6`, `--space-4` | 28.8 px, 14.4 px |
| A title | `overlay.css` lines 116 to 124, `--text-xl` | 25.2 px |
| A paragraph, capped at 34ch and muted | `overlay.css` lines 143 to 150, `--text-md` | 15.3 px |
| A button | `overlay.css` lines 165 to 181 | 39.6 px tall, 15.3 px text |
| Rows this screen has to hold | 2, 3 or 4, decided one screen earlier | n/a |

**Four rows, each with a name and a two-way control, is the worst case**, and it is a small amount of
content for a 1440 by 810 px stage. The menu had the same problem and answered it by growing. This
screen may answer it differently, and the reason to say so out loud is that S2 sits directly before it:
two consecutive screens that each hold a handful of controls in a small card is a sequence a player
walks through, and how the two look together is part of what is being drawn.

---

## 4 The facts the screen must obey

Read out of `core/board.js`, `state/bots.js` and the locale files. None of these is invented here and
none of them is negotiable in a stylesheet.

| Fact | Value |
| --- | --- |
| Seats a match can have | 2, 3 or 4 (FR-01) |
| **Which seats those are** | 2 players sit on seats **0 and 2**, 3 players on **0, 1 and 2**, 4 players on **0 to 3** |
| The seat colours | 0 red `#FF5D5D`, 1 yellow, 2 green, 3 blue (D1, spec 01) |
| So a two-player line-up is | two rows, red and green. **Not red and yellow**, and a mockup that shows yellow for the second of two is showing a seat that is not in the match |
| A seat's name | "Spieler 2" or "Bot 2", plus the colour word in the full form: "Spieler 2 (Gelb)" |
| People a match must have | at least one, always |
| Bots a match may have | 0 up to seats minus 1 |
| Difficulty levels | none. There is one bot and it plays one way |
| What a bot does in a match | picks a dice card, rolls, moves, plays skill cards and answers reaction windows (issue #82) |
| The line-up the screen opens with | undecided, and it is D92 |

---

## 5 The DOM contract we offer

Nothing on this screen exists yet, so all of it is an offer rather than a description. We build
whatever the spec names; what is listed here is what we would build without being asked.

| Selector | Meaning | Note |
| --- | --- | --- |
| `.overlay[data-screen="lineup"]` | The screen, told apart from the other six | A seventh value in `OVERLAY_SCREEN`. **Say if you want another word than `lineup`**, the code has no name for this screen yet |
| `.overlay__seat[data-player="0..3"]` | One row, one seat, carrying the seat number so the seat colour and the D16 shape come for free | The same attribute the HUD, the board and the win panel already use |
| `.overlay__seat[data-controller="human"]` and `[data-controller="bot"]` | What that seat is set to right now | The word is `hud-view.js`'s, reused deliberately |
| `.overlay__button[data-action="controller"][data-seat="N"]` | The control that changes one row | Shape undecided: one toggle, two buttons, a switch. That is D91 |
| `.overlay__button[data-action="begin"]` | Start the match with this line-up | Only if D94 says there is one |
| `.overlay__button[data-action="back"]` | Return to the count screen | Only if D94 says there is one |
| `.overlay__seat[data-locked="true"]` | The row that may not be changed, because it is the last person | Only if D93 asks for it. **Alternative offered:** the DOM `disabled` property on that row's control, which is what D77.2 chose for the two dead menu doors |
| `.overlay__title`, `.overlay__text`, `.overlay__actions`, `.overlay__panel` | The panel as it stands | All four exist and all four are yours to keep, re-scope or leave unused |

What we are **not** offering:

- **No new grid row, and no change to the chrome.** D42 owns that row and it sits above this screen on
  purpose, as it does over the menu.
- **No new game state.** The half-made line-up is view state and lives beside `screen` in the flow, for
  the same reason the screen does. Nothing about it reaches `core/`.
- **No string in CSS.** Every word on this screen is text a player reads (NFR-03), in German and in
  English, in the DOM. German is the default and usually the longer: "Spieler 2 (Gelb)" against
  "Player 2 (yellow)".
- **No drag and drop, and no seat reordering**, unless a decision below asks for it in those words. It
  is a much bigger change than a stylesheet, so it is priced rather than refused.

---

## 6 The open decisions

### D90. Is the line-up a screen of its own, or the setup screen grown?

The Product Owner has decided the **order**: count first, line-up second. What is still open is
whether that is two screens or one screen in two steps.

1. **Two screens, S2 unchanged plus a new one.** Cheapest, and it keeps FR-01's acceptance criterion
   reading against the screen it was written for. The cost is a third click between the menu and the
   board, and two consecutive nearly empty panels.
2. **One screen that grows.** The counts stay at the top, and choosing one reveals that many rows
   underneath. It is one screen, it shows the consequence of the count immediately, and it costs the
   flow a step. The cost is that S2 stops being the screen the Obligations Book describes.
3. If it is two screens, **does the line-up look like S2's sibling or like its own thing?** They are
   seen back to back, which no other pair of screens in this game is.

### D91. What is a seat row, and what is the control on it?

The heart of the commission.

1. **What is a row made of?** A colour mark, a name, a control. In what order, and is the row itself
   clickable or is only the control?
2. **What is the control?** A two-position segmented toggle, a switch, two mutually exclusive buttons,
   or a single button that flips the row when clicked? Each says something different about whether
   "bot" is a setting or a choice.
3. **Is the control's state readable without reading the label?** NFR-12 applies: the difference
   between a person and a bot must survive greyscale, so it cannot be carried by colour.
4. **Does anything on the row say what a bot is?** A player who has never seen one does not know that
   the computer plays a full turn with cards. One sentence on the screen, one per row, or nothing.

### D92. What is the line-up when the screen opens?

The screen has to arrive showing something, and what it shows is a recommendation whether or not it is
meant as one.

1. **All people, so the player has to add a bot?** That preserves today's behaviour for anyone who
   clicks straight through, which is what every existing end-to-end test does.
2. **One person and the rest bots**, so the single-player match is one click away? That is the mode
   that is currently unreachable, and this whole screen exists because of it.
3. **Something remembered from the last match?** We would have to store it, and nothing in this game
   stores anything between matches today. Saying no is a perfectly good answer, and saying yes means
   naming where it lives.

### D93. The last person cannot be turned into a bot. What does the screen do about it?

FR-01. A match of nothing but bots is refused today in `options.js` lines 105 to 110, silently, before
anything is drawn. On a screen the refusal happens in front of the player, and there is no precedent in
the project for refusing a click except D77's two dead menu doors.

1. **Is the last human row's control disabled, or does it refuse when used?** D77.2 chose the DOM
   `disabled` property for the menu, because a browser stops the click for free and takes the tab stop
   away. The argument was that the door's permanent second line already explained itself. **Here the
   equivalent explanation does not exist yet**, so if the control is disabled, say what tells the
   player why.
2. **Which row is the locked one?** With three bots and one person it is whichever row is still a
   person, and that moves as the player clicks. A control that becomes disabled under the pointer is a
   real interaction and needs an answer.
3. **Or is the rule stated once, above the rows, instead of being carried by a row?** "At least one
   seat has to be yours" as a permanent line is cheaper and quieter than a control that fights back.

### D94. How does the match start, and can the player go back?

Today the count click starts the match. After this screen it cannot.

1. **Is there an explicit Start button?** Almost certainly yes, and it is the screen's one `primary`
   under the rule at `overlay.css` lines 183 to 187. Confirm it, and say what it says: "Start", "Los",
   or something that names what is about to happen.
2. **Is there a Back to the count?** No screen in this game has a back button today. The pause screen
   has Resume and Quit, and that is the closest thing. If there is one, say where it sits so it is not
   mistaken for the primary.
3. **What takes the keyboard when the screen opens?** `focusOverlay` takes the first `.overlay__button`
   in the DOM, which would be the first seat row's control. If Start should take it instead, that is a
   change to `overlay-view.js` lines 213 to 215 and we would rather make it on purpose.
4. **Does the screen say what it is about to start?** "One person and three computers, four seats" is a
   sentence a screen can carry, and it is the only place the mode the Product Owner named would appear.

### D95. Does the person keep seat 0?

`botSeatsFor` puts the bots on the last seats so that the person keeps seat 0: they play first, and the
board is drawn around their colour. A per-seat screen can break that, and it is not obvious that it
should.

1. **May a player make seat 0 a bot and sit on seat 2?** The rules allow it. The board does not rotate,
   so the person would be playing from the red pieces' opposite corner and moving second.
2. **If yes, does anything on the screen say which seat plays first?** Turn order is seat order, and it
   is invisible on this screen unless it is drawn.
3. **If no, is seat 0's control simply absent, or present and locked?** Absent is a smaller screen;
   locked is a screen that explains its own rule.

### D96. The words on the screen

Every one of them is a new locale key in both languages, so this is the list we write.

1. **The title.** S2 asks "Wie viele spielen mit?". This screen asks something like "Wer spielt mit?",
   which is close enough to be confusing back to back. Name both if you want S2's changed.
2. **The row labels.** "Spieler 2 (Gelb)" and "Bot 2 (Gelb)" already exist as `player.named` and
   `player.botNamed`. Reuse them, or does this screen name a seat differently?
3. **The two control positions.** "Mensch" and "Computer", or "Spieler" and "Bot"? The HUD says "Bot",
   so anything else here is a second word for the same thing.
4. **Is the mode named at all?** The Product Owner's sentence says "single or multiplayer mode". No
   such word exists in the game today. If the screen should say "Einzelspieler" once the line-up has
   one person in it, this is where that is decided.

---

## 7 Deliverables

| File | What |
| --- | --- |
| `01-Design/Handoff/15-spec-bot-setup-menu.md` | The spec. D90 to D96, one answer each, each with its reason and its named rejected alternative, following the five-section template in `01-Design/README.md` |
| A new stylesheet if D90 says the screen is its own layout | `src/ui/styles/lineup.css`, on the `menu.css` and `handover.css` precedent, loaded after `overlay.css` |
| A diff for `overlay.css` and `tokens.css` if either changes | **A diff and not a whole file.** Asked after handoff 11 and again in brief 13 § 5: a delivered file read against an older tree silently undoes work |
| Artboards, if more than one direction is worth looking at | Wherever handoff 12's went, referenced from the spec. Optional here, unlike handoff 12 |

If a mockup is drawn, **draw the four-seat case and the two-seat case**, because two seats is red and
green with a gap where yellow is not, and that is the case a four-row drawing hides.

---

## 8 The rules that apply to the delivery

The five standing ones from `00-open-requests.md` § 5, unchanged: no user-facing string in a `content:`
property; no CSS file over 300 lines after `npm run format`; built once, then only attributes rewritten;
two skins from the tokens with `prefers-reduced-motion` respected; and **no em dash**, in the spec or in
a CSS comment, neither the character nor the rhetorical habit.

Four specific to this one:

6. **Room in the files this lands in.** Measured on `2d01e73`: `overlay.css` is at 234 lines, `menu.css`
   at 264 and `tokens.css` at **298 of 300**. `tokens.css` is full. A decision that needs a new token
   needs the seam for a split named with it.
7. **Name what is superseded, by file and line.** Standing since handoff 08.
8. **`data-controller` already means something.** If this screen uses a different word for the same
   fact, say why, because `hud-view.js` will not be changed to follow it.
9. **Name the commit you read us against.** `2d01e73` is at the top of this file.

---

## 9 What is out of scope

- **Difficulty levels.** There is one bot. Brief 13 § 6 already ruled this out and nothing has changed.
- **Choosing colours, or seat order.** The seats a count uses are fixed in `core/board.js` and the
  colours are D1. This screen says who plays a seat, not which seat is which colour.
- **Online multiplayer** (FR-42). A bot is local and the menu's Online door stays a door with nothing
  behind it.
- **How a bot looks while it plays.** That is D85 of brief 13, and briefs 13 and 14 in general, all
  still open. This screen ends when the match starts.
- **The `?bots=` and `?players=` parameters.** They stay exactly as they are, because sixteen end-to-end
  specs boot straight into a match with them. This screen is a second route to the same match, not a
  replacement.
- **Remembering anything between sessions.** Unless D92.3 asks for it, and then only within one page.

---

## 10 The landing checks

The five standing ones from `00-open-requests.md` § 6, plus:

6. **`npx playwright test tests/e2e/match-flow.spec.js`.** It owns this flow and it clicks
   `[data-count]` three times expecting a match to appear. Every one of those needs a new step, and that
   is our work, not yours. It is listed here so the spec's author knows the flow has tests on it.
7. **`npx playwright test tests/e2e/handover.spec.js tests/e2e/dice-pool.spec.js`.** Three more clicks
   on a count button, same story.
8. **A new spec for this screen**, which we write once the spec lands: that a seat can be switched, that
   the last person cannot be, and that the match that starts has the bots the screen said it would.
9. **1440 by 900**, and one check below the 84rem breakpoint where `overlay.css` line 219 changes the
   panel's padding.
