# Handoff 12, brief: the main menu, and three of them to choose from

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-03
**Read against:** `3a8c8bc`, on branch `fix/layout-stage-and-fan`. Every line number below is that tree
**Issue:** #41, Main Menu, Pause and Win Screen Flow. Requirement FR-38, and FR-42 for the part that
does not exist yet
**Answers:** nothing. **D75 to D80**, and this is the first brief in the loop that asks for **more than
one drawing** and a choice between them

---

## 0 What was asked for

Two sentences from the Product Owner, and the second one is the unusual part:

> The main menu is very barebones. It should show three items to begin with: Hotseat, Online
> Multiplayer and Settings. Only Hotseat works for now. **Claude Design should draw several mockups and
> I will pick one.**

The first sentence is accurate and § 3 puts numbers on it. The second changes the shape of the
handoff: every brief so far has asked for one answer per decision. This one asks for **three
alternatives to look at**, and the reason is that "barebones" is not a defect with a cause. The three
existing items are correct, the layout is correct, and the thing being asked for is a direction. A
direction is chosen by looking, not by reading.

So the spec that answers this brief answers D75 to D80 **for the mockup that was picked**, and the two
that were not picked become the named rejected alternatives that § 2 of the spec template asks for
anyway. That is the same requirement met by a cheaper route than usual.

---

## 1 What the main menu is today, structurally, and why that makes the question harder than it looks

**The menu is not a screen. It is one of six contents of a single component.**

`overlay-screens.js` lines 19 to 28 build its whole content as a plain object:

```js
/** S1. The entry point: one button, because there is one thing to do here (FR-38). */
function menuScreen() {
  return {
    screen: OVERLAY_SCREEN.MENU,
    title: t("menu.title"),
    text: t("menu.text"),
    player: null,
    buttons: [{ action: OVERLAY_ACTION.START, label: t("menu.start"), variant: "primary" }],
  };
}
```

`overlay-view.js` lines 128 to 160 render that description, and the same function renders the setup
screen, the pause screen, the win screen, the handover and the dice card pool overview. That is D38's
seam, confirmed in spec 04: one component, five screens, because "the game has stopped and is asking
you something, and here are your buttons" is one thing from the player's side.

**Three items where one is usable is the first content that might not fit that sentence.** The menu is
not the game stopping to ask something. It is where the game starts, and it is the only screen a player
sees before they have decided to play. That is D75.

Two mechanical consequences you should have before drawing anything:

| What | Where | Consequence for a design |
| --- | --- | --- |
| `.overlay__actions` is a **centred, wrapping flex row** | `overlay.css` lines 158 to 163 | Three items stacked vertically is not a small change to that rule, it is a different rule. Say whether it is scoped to `[data-screen="menu"]` or replaces the row everywhere |
| The buttons are **rebuilt on every screen change**, unlike the panel | `overlay-view.js` lines 154 to 157, reason at lines 24 to 26 | Nothing may animate a button's arrival, or it restarts on every language switch |
| The keyboard is put on the **first** button when a screen opens | `overlay-view.js` lines 169 to 171 | Whatever is first in the DOM is what a keyboard user lands on. Hotseat first is the obvious answer and it is still an answer |
| The always-present chrome sits **above** the overlay | `--layer-overlay: 6` and `--layer-chrome: 7`, `tokens.css` lines 257 and 258 | The language button already floats over the menu today, on purpose. `chrome.css` lines 7 to 9 state the reason: FR-34 says the switch works at runtime and the menu is a runtime the player spends time in |
| On the menu the chrome hides the pause and pool buttons and keeps the language one | `chrome-view.js` lines 94 to 126 | So the top row of the menu is one button on the right and an empty turn sentence on the left |

---

## 2 What the repository already decides here, so nothing is answered twice

The standing § 2 since brief 08, and it exists because D59 was answered twice by two files that could
not see each other.

| Already decided | Where | Status in this brief |
| --- | --- | --- |
| **One overlay component behind five screens**, and `data-screen` is on the element precisely so a stylesheet can make the menu look nothing like the pause screen | D38, spec 04 | **This is what D75 asks you to confirm or overturn** |
| **The menu and the setup screen are an opaque curtain**, not the translucent veil the pause and win screens use | D38, `overlay.css` lines 51 to 54 | Confirmed unless a mockup needs otherwise. Say so if it does |
| **The panel is 30rem wide, and setup widens to 34rem** | `overlay.css` lines 65 and 75 to 77 | Free to change. It is the number § 3 measures |
| **At most one primary button per screen**, the one that carries the flow forward | `overlay.css` lines 183 to 187 | Three items with one usable is exactly the case that tests this |
| **Three persistent controls in the chrome**, in the order pool, language, pause | D42 and D46, `chrome-view.js` lines 75 to 82 | **Not reopened.** The menu has to live under that row, not replace it |
| **The language switch is not on a settings screen**, it is in the chrome, because S11 was split on 2026-09-01 and its audio half was deferred with issue #40 | Obligations Book § 2.2, S11 | The fact D79 has to be answered around |
| **A win takes the winner's colour and the game's only `--text-2xl` title** | D40, `overlay.css` lines 126 to 128 | Named so the menu's own title is chosen against it rather than beside it |
| `handover.css` exists as **one screen's own stylesheet**, split off the same component | Spec 04 | The precedent for D75 answering "its own thing" without meaning "a second component" |

And the finding that has no precedent at all:

> **Nothing in this project styles a control you cannot use.** `disabled` and `aria-disabled` appear in
> none of the eighteen stylesheets in `src/ui/styles/` and in no file under `src/ui/`. Two of the three
> menu items are exactly that. It is D77.

---

## 3 The measurements

Read off the files. `app.css` line 47 sets the root text size to `min(100vw / 100, 100vh / 56.25)`,
which at the design resolution of 1440 by 900 is **14.4 px**, and `.app` is a fitted stage of
`100rem` by `56.25rem` (`app.css` lines 74 and 75), so **1440 by 810 px** with letterbox bars.

| Thing | Where | At 14.4 px |
| --- | --- | --- |
| The stage the menu is drawn on | `app.css` lines 74 and 75 | 1440 by 810 px |
| The menu panel | `overlay.css` line 65, `min(30rem, 100%)` | 432 px wide, **30 per cent of the stage width** |
| The setup panel, for comparison | `overlay.css` lines 75 to 77, `34rem` | 489.6 px |
| Panel padding, and the gap between its three children | `--space-6` and `--space-4` | 28.8 px and 14.4 px |
| The title | `overlay.css` lines 116 to 124, `--text-xl` in the display face | 25.2 px |
| The one paragraph | `overlay.css` lines 143 to 150, `--text-md`, capped at `34ch`, muted | 15.3 px |
| The one button | `overlay.css` lines 165 to 181, `min-height: 2.75rem`, `--text-md` | 39.6 px tall, 15.3 px text |
| Everything on the menu, counted | `overlay-screens.js` lines 19 to 28 | **three elements** |

**That is the whole of "barebones" in numbers.** A title, one sentence and one button, in a 432 px panel
centred on a 1440 by 810 px stage. The panel uses under a third of the width and, stacked, well under a
third of the height. It is not that anything is wrong with those three elements. It is that the entry
point of the game is the emptiest screen in it.

---

## 4 The three items, and the requirement behind each

Numbers from the Requirements Specification and the Obligations Book, never invented here. **None of
the three is decoration**, and that matters for D78: a player who cannot use two of them is not looking
at placeholders, they are looking at the state of the project.

| Item | Requirement | Screen | Issue | What actually exists |
| --- | --- | --- | --- | --- |
| **Hotseat** | FR-01, `must have` | S2, match setup | #41 | Built and playable. It is the route the whole game is reached by today |
| **Online Multiplayer** | FR-42, `should have` | none | #42 | **Nothing.** No technology chosen, one acceptance criterion, no specification. The Requirements Specification calls it "the single largest cut available and the one most likely to be cut" |
| **Settings** | S11. FR-34 for language, FR-41 for the mute | S11, split | #40 for the audio half | **Half built, in another place.** The language switch (FR-34, `must have`) shipped inside the always-present chrome. The mute is what is outstanding, and it was deferred with issue #40 on 2026-09-01 |

So the honest reading of the three, and it is the reading the design has to carry:

- Hotseat is the game.
- Online Multiplayer is a promise that may never be kept.
- Settings is a screen that was deliberately deleted, whose only remaining content is a button that is
  already on screen four inches above it.

**Two of the three therefore have different reasons for being unavailable**, and D78 asks whether the
menu says so. "Not built yet" and "already available up there" are not the same sentence.

---

## 5 The DOM contract we offer

| Selector | Meaning | Why it is new |
| --- | --- | --- |
| `.overlay[data-screen="menu"]` | The menu, distinguishable from the other five screens | **Already there.** D38 put it on the element for exactly this |
| `.overlay__button[data-action="hotseat"]`, `[data-action="online"]`, `[data-action="settings"]` | The three items | Three new values in `OVERLAY_ACTION`, `overlay-vocabulary.js` lines 41 to 60. `start` exists today and is what Hotseat replaces or renames. **Say if you would rather the items were not `.overlay__button` at all**, which is a real possibility under D75 and D76 |
| An unavailable state on an item | Which items cannot be used | We will write whichever attribute D77 picks. Nothing in the repository picks one today, which is why it is a question and not a contract line |
| A second line of text inside an item | The sentence D78 may ask for | We will add the element once the spec names it. It is text a player reads, so NFR-03 keeps it in the DOM |
| `.overlay__panel`, `.overlay__title`, `.overlay__text`, `.overlay__actions` | The panel as it stands | All four are there and all four are yours to keep, re-scope or leave unused on this one screen |

What we are **not** offering:

- **No new grid row and no change to the chrome row.** The stage has five rows (`app.css` line 71) and
  the chrome is D42's. A menu that needs the language button moved is reopening D42, which is allowed,
  but say it in those words.
- **No routing.** There is no router and no `state.screen`. Which screen is up is one closure variable
  in `match-flow.js` line 71, deliberately kept out of the frozen game state. A mockup that implies
  navigation between several new screens is asking for more than a stylesheet.
- **No string in CSS.** Every label and every hint is text a player reads (NFR-03), and both German and
  English have to hold it. German is the default and the longer of the two: "Online Multiplayer" is
  the same in both, but a hint sentence usually is not.

---

## 6 The six open decisions

### D75. Is the menu still the overlay panel, or is it its own thing?

Against D38. The seam has held for five screens and this is the first content that strains it, for the
reason in § 1: the menu is not the game stopping to ask a question, it is the front door.

1. **Does the menu keep `.overlay__panel`?** A 432 px centred card on a 1440 by 810 px stage is right
   for "are you sure you want to abandon this match" and it is a decision, not a default, for a front
   door.
2. **If it becomes its own layout, does it get its own stylesheet?** `handover.css` is the precedent
   for a screen splitting off without becoming a second component, and it is the cheaper of the two
   shapes by a wide margin.
3. **If it keeps the panel, what does `--overlay-panel-w` become on this screen?** Setup already
   overrides it to 34rem, so the mechanism exists and costs three lines.
4. **Does the curtain stay opaque?** `overlay.css` lines 51 to 54 give the veil to pause and win only.
   Behind the menu there is no match to see through to, so the question is what an opaque curtain is
   made of when it is the first thing in the game a player looks at.

### D76. What are the three items, as objects?

The heart of what the mockups are for.

1. **What are they?** A stack of buttons, a column of tiles, a list of rows, something with the game's
   own card language in it? The card is the object the game is built out of, and it is already drawn
   (D25 to D28), which makes it the obvious idea and therefore the one worth stating a reason about
   rather than reaching for.
2. **Are they one size, or is Hotseat larger than the other two?** § 4 says Hotseat is the game and
   the other two are not. A menu that draws all three as equals is saying something false, and a menu
   that draws them unequally has to decide how unequal.
3. **Does the row become a column?** `.overlay__actions` is a centred wrapping row today. Say whether
   the change is scoped to the menu or general.
4. **What is the tab order, and does the first item still get focus on open?**
   `overlay-view.js` lines 169 to 171 focus the first `.overlay__button`. If the items are not buttons,
   or if an unavailable item is skipped, that function changes and we would rather change it on purpose.

### D77. What does an item you cannot use look like?

The gap named in § 2. There is no answer anywhere in the project to steal from, which is the whole
reason this is a question rather than a line of CSS.

1. **What is the treatment?** Whatever it is, NFR-12 applies: the difference must survive greyscale, so
   it cannot rest on colour alone. `--color-dormant` and `--color-text-muted` exist and are what a
   dormant thing is drawn in elsewhere, but "reuse the dormant colour" is your call and not ours.
2. **`disabled` or `aria-disabled`?** This is the technical half and we will implement whichever, but
   the two produce different screens. `disabled` takes the item out of the tab order and the click
   stops working for free. `aria-disabled` keeps the item reachable by keyboard, announces it as
   unavailable, and needs the click filtered in `session-actions.js` lines 44 to 71.
3. **The precedent points the other way and is worth weighing.** D67 gave every card in the hand a tab
   stop *because* focusing one now does something, and spec 05 § 5 had taken seven tab stops out of the
   pool overview because a stop where `Enter` does nothing tells a keyboard user nothing. By that
   argument an unavailable item takes no tab stop. **Unless D78 makes focusing it say something**, in
   which case the argument reverses. The two decisions have to agree.
4. **Does the item respond to a pointer at all?** A hover that lifts and then refuses is worse than no
   hover, and `overlay.css` lines 205 to 217 lift every button today.

### D78. Does an unavailable item explain itself, and where does that sit?

"Online Multiplayer", greyed out with no explanation, reads as a bug in the game rather than as a
feature that is not finished. § 4 also shows the two have different reasons, which is the part that
makes this more than a label.

1. **Is there a second line on the item, a hint under the group, both, or neither?**
2. **Is it the same sentence for both items, or one each?** "Not built yet" and "the language switch is
   already in the bar at the top" are different facts. One sentence for both is cheaper and says less.
3. **What is it made of?** It is text, so it needs an element and it cannot be a `content:` property
   (NFR-03). Name the element and we build it.
4. **Does Settings appear at all?** This is the one place we will take "no" as an answer. Its only
   working content is already on screen. A menu item that opens a screen holding one button that is
   also four inches above it is a defensible thing to leave out, and if the answer is to leave it out,
   say what the third item is instead or that there are two.

### D79. What else is on the menu?

The screen has 1440 by 810 px and currently uses a 432 px card in the middle of it.

1. **The game's name.** `menu.title` is the literal string "Ludo Advanced" and it is drawn as an
   `<h2>` at `--text-xl`, the same size and element as the word "Paused". If the front door should say
   the name louder, or as a mark rather than as a line of text, this is where that is decided. Note
   D40 already spends `--text-2xl` on exactly one thing in the game, the winner's name.
2. **The one sentence.** `menu.text` is "Ludo with a dice card pool and skill cards", capped at 34ch
   and muted. Does it stay, does it grow, does it go?
3. **The language button that is already there.** § 1's last row. It is above the overlay by design and
   it is the one control on the menu that is not part of the menu. A mockup that does not account for
   it will collide with it.
4. **Anything else?** A version line, a credit, the rules screen. **The rules screen is S10, FR-35, a
   `should have` with no issue and no design**, and `00-open-requests.md` § 7 lists it as deliberately
   not asked for. Reserving a place for it is fine; designing it is not this brief.

### D80. Does Hotseat still lead to the separate player-count screen?

**Asked as a confirmation, not as an open question.** The Product Owner has decided to keep the two
screens, and the reasons are here so that a disagreement is still possible.

Today: the menu's one button opens S2, which offers 2, 3 and 4 as three buttons
(`overlay-screens.js` lines 36 to 48, `session-actions.js` line 45). The reasons for leaving that
alone:

- S2 is a screen in the Obligations Book with its own requirement, FR-01, and its own acceptance
  criterion. Folding it into the menu makes that criterion read against a screen that no longer exists.
- The three count buttons already have a design of their own, `overlay.css` lines 196 to 203: one size,
  square-ish rather than word-shaped, in the numeric face, because they are a choice between equals.
- `.overlay__button[data-count]` is clicked by three end-to-end specs, `match-flow`, `handover` and
  `dice-pool`. The other sixteen bypass the menu entirely with `?players=` in the address bar, which is
  what keeps a menu rewrite from touching them. That option staying alive is our side of the bargain
  and it is not affected by anything you answer.

If you would fold the count into the menu anyway, say so and say what happens to S2. It is a bigger
change than it looks and it is not refused, it is priced.

---

## 7 The deliverables, and this is the part that is different

| File | What |
| --- | --- |
| `01-Design/Handoff/12-spec-main-menu.md` | The spec. D75 to D80, one answer each, each with its reason and its named rejected alternatives, following the five-section template in `01-Design/README.md` |
| `01-Design/Handoff/handoff-12/` | **Three mockups**, as three artboards on one canvas, plus a `README.md` saying it is not production code. Deleted after the review, the same as `handoff-04/`, `handoff-05/`, `handoff-07/` and `handoff-10/` |
| Whichever of `overlay.css` and `tokens.css` the answer changes | Amendments, with the changed lines named |
| A new stylesheet, if D75 says the menu is its own layout | `handover.css` is the precedent for the name and the size |

**What the three mockups need in order to be choosable:**

1. **Three genuinely different directions**, not one direction at three sizes. The point of three is
   that the Product Owner sees the range of what the menu could be.
2. **One or two sentences per artboard** saying what it does differently and what it gives up for that.
   The one that is picked has its reasons carried into the spec; the two that are not become the
   rejected alternatives the spec has to name anyway. **This is the cheap part of the round trip and it
   is the part the report is graded on**, so it is worth writing while the drawings are still fresh.
3. **All three showing the unavailable state**, because D77 is the decision with no precedent and it
   cannot be judged from a description.
4. **All three at 1440 by 900**, so the stage is 1440 by 810 and the numbers in § 3 apply as written.
   One of the three should also be shown below the 84rem breakpoint, where the stage is off and the
   page may scroll, since `overlay.css` line 219 already changes the panel's padding there.

---

## 8 The rules that apply to the delivery

The five standing ones from `00-open-requests.md` § 5, unchanged: no user-facing string in a
`content:` property; no CSS file over 300 lines after `npm run format`; built once, then only
attributes rewritten; two skins from the tokens with `prefers-reduced-motion` respected; and **no em
dash**, in the spec or in a CSS comment, neither the character nor the rhetorical habit.

Four that are specific to this one:

6. **Room in the files this lands in.** Measured on `3a8c8bc`: `overlay.css` is at 234 lines and
   `tokens.css` at 281, so those have 66 and 19 lines of headroom. **`tokens.css` is the tight one**,
   and handoff 11 is asking it for tokens at the same time. If both need more than 19 lines between
   them, name the seam for a split rather than dropping the comments.
7. **Name what is superseded, by file and line.** Standing request since handoff 08. If the menu's
   items stop being `.overlay__button`, say which of the rules at `overlay.css` lines 165 to 217 no
   longer apply to this screen.
8. **Say which mockup was picked and why the other two lost.** This is the same rule as always and here
   it is nearly free, because the two rejected alternatives are already drawn.
9. **Name the commit you read us against.** `3a8c8bc` is at the top of this file. Handoff 10's package
   said "the working tree of 2026-09-03", which had four commits in it, and five stylesheets had to be
   merged by hand instead of copied in.

---

## 9 What is out of scope

- **Building online multiplayer.** FR-42, issue #42. The menu item is a door with nothing behind it and
  that is the whole of what is being asked for. Nothing in this brief commits the project to the
  feature.
- **Building a settings screen.** S11 was split on 2026-09-01 and its audio half deferred with issue
  #40. If D78 says the item exists, it is an item and not a screen.
- **Sound and the mute.** Issue #40. The mute is the one real piece of content a settings screen would
  have, and it is still deferred.
- **The rules screen, S10.** FR-35, a `should have` with no issue. `00-open-requests.md` § 7 lists it as
  deliberately not asked for and that is unchanged.
- **The pause, win and handover screens.** D38, D39 and D40 own them and all three work. They are
  affected only if D75 changes the shared component rather than this one screen, in which case say so.
- **The chrome row.** D42 and D46. It sits above the menu on purpose and it is not being redesigned.
- **The setup screen's own look.** D80 confirms it stays and its three count buttons are already
  designed. If a mockup changes the way the menu leads into it, that is D80 and not a redesign of S2.

---

## 10 The landing checks

The five standing ones, plus:

6. **`npx playwright test tests/e2e/match-flow.spec.js`.** It is the spec that owns this flow. It
   asserts the menu opens on boot, that setup offers exactly three counts, that quitting returns to
   the menu, and **that switching language on the menu rewrites the title and the button label**. That
   last one is why every new string has to land in both `de/ui.json` and `en/ui.json` in the same
   commit, which `tests/unit/i18n/locales.test.js` enforces by comparing the flattened key sets.
7. **`npx playwright test tests/e2e/dice-pool.spec.js`.** One of its cases starts from the menu, so it
   traverses the new screen even though it is about something else.
8. **A new case for the unavailable item**, which we write once the spec lands: that it is visible, that
   clicking it starts nothing, and that whichever of `disabled` or `aria-disabled` D77 picks is
   actually on the element. **There is no test on a disabled control anywhere in the suite today**,
   because there is no disabled control.
9. **1440 by 900**, the design resolution, and one check below the 84rem breakpoint. The menu is the
   one screen a player might open on a phone before they ever see a board.
