# Handoff 09, brief: the stage, the seat plate and the fan's shadow

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-03
**Issue:** none. A test round on the Product Owner's own laptop, four reports in one message
**Answers:** nothing. **D62, D63 and D64 are already implemented and are sent back for confirmation**,
which is the opposite of every brief before this one

---

## 0 What happened, said plainly

**The Product Owner played a round at 1438 by 770 CSS px and reported four things.** Three were defects
with a measurable cause and one was a preference. All four were fixed the same day, because the game was
unplayable on that laptop without scrolling, and three of the fixes change a numbered decision that this
side does not own. So this brief is a confirmation request, not a question, and the Product Owner chose
that route knowing it.

| What was reported | What it turned out to be |
| --- | --- |
| "The viewport should always be 16:9 so you do not have to scroll" | A real defect. Everything except the board is measured in `rem`, so the page needs a fixed height whatever the window does, and D6 only ever made the **board** fluid. **D62** |
| "The card count per player at the top is cut off" | A real defect, and not clipping: the plate is too narrow for its own content and the next plate paints over the overflow. **D63** |
| "The cards at the bottom right are stacked strangely, is that a bug?" | Yes, two bugs. An empty slot was wearing a card back's pseudo-elements, and it was painting its dashed outline over the last real card. Neither is a design question and both are fixed |
| "The cards further right should be covered by the ones further left" | A preference with a real observation behind it, and the diagnosis was different from the request. **D64** |

**Everything in this brief is measured.** A throwaway Playwright spec injected the pre-fix CSS with
`page.addStyleTag` and printed the same numbers before and after in one run, so every figure below is a
measurement at a stated window size rather than arithmetic off the mockup. It was deleted again the same
session, for the reason `scripts/design-screenshots.js` already states: a screenshot, or a measurement, is
evidence and not an assertion.

---

## 1 Why the scrolling is a design question and not a bug fix, and this is the part to read

**D6's answer was right about the board and silent about the page.** "There is no target resolution, and
that is the answer rather than a dodge" makes `--board-size` one fluid unit and everything inside the board
a multiple of `--cell`. Nothing else on the page works that way. The rail's height is the sum of three
plates whose card sizes are `--card-u` times a `rem` length, the chrome and HUD rows are `rem`, and the
page padding and gaps are `rem`. So:

| Row | px | Where it comes from |
| --- | --- | --- |
| Page padding, top and bottom | 48 | `app.css` |
| Two row gaps | 32 | `app.css` |
| Chrome row | 36 | 04-spec § D35 |
| HUD row | 61 | 04-spec § D35 |
| Rail: 322 dice + 289 skill + two gaps | 643 | 04-spec § D35 |
| **Page, with nothing being asked** | **820** | measured |
| Prompt strip plus its gap, while the game asks something | 62 | 04-spec § D35 |
| **Page, worst case** | **882** | 04-spec § D35's own table |

**None of that depends on the window.** Measured at 1438 by 770, which is a 2876 by 1750 panel at 200 %
Windows scaling: the page was 820 px tall in a 770 px window, so 50 px of scrolling before the game asks
anything and 112 px once it does. FR-31 is a `must have` and it was true at exactly one window size, 1440
by 900, which is also the only size `tests/e2e/shell.spec.js` ever measured. The suite's own first case
says so out loud: "runs at 1440 by 900, which is what the design is drawn for".

**D6's rejected alternatives are the reason this is being sent back rather than just done.** D6 rejected
pinning the design to 1920 by 1080 because it breaks on 1366 by 768 laptops and at 125 % Windows scaling,
and it rejected three breakpoints because they snap at a boundary some real monitor sits on. Both
objections are about **fixed pixel layouts**, and both are answered by a stage that scales: the shape is
fixed, the size is not, and 200 % scaling is exactly the case that found the defect.

---

## 2 What was implemented, so the review is against something real

### 2.1 The stage, D62

One declaration does the work, because the layout is already in `rem`:

```css
html {
  font-size: min(calc(100vw / 100), calc(100vh / 56.25));
}
```

1rem becomes one per cent of the stage width, so a stage of `100rem` by `56.25rem` is 16:9 at any window
size and **every `rem` length in the project scales with it**. Nothing inside the layout was re-measured.

- `#app` is the frame: `display: grid; place-items: center; width: 100vw; height: 100vh; overflow: hidden`,
  painted in `--color-ink`. That is the one colour choice made here, and it is a token that exists rather
  than a new value. **If the bars should be their own token, say so and name it.**
- `.app` is the stage: `width: var(--stage-w); height: var(--stage-h)`, and `position: relative` so the
  overlay stays inside it.
- `--stage-w: 100rem` and `--stage-h: 56.25rem` are new in `tokens.css`.
- `--board-size` keeps D6's two percentages exactly. Only what they are a percentage of changed:
  `clamp(24rem, min(calc(var(--stage-h) * 0.82), calc(var(--stage-w) * 0.44)), 60rem)`.
- `overlay.css` changed `position: fixed` to `absolute`. A fixed sheet is positioned against the window, so
  it covered the bars and the letterbox disappeared whenever the menu opened.
- **D30's breakpoint is untouched.** Below 84rem, or in portrait, the stage is switched off
  (`html { font-size: 100% }`, a percentage so the reader's own text size comes back) and the stacked
  layout is exactly what it was. `rem` inside a media query is 16 px by definition and not the root's
  computed size, so the query cannot loop on itself.

**Why 1600 by 900 and not 1440 by 810.** D35's height budget is 882 px and it is measured in the mockup.
810 cannot carry it, and making it fit means re-deciding every card size in D26. 900 keeps the budget that
already works and 1600 is what makes the shape 16:9. **At 1440 by 900 the board still measures 634 px**,
exactly as before, with 45 px of bar above and below, so no number in any earlier spec moved.

**The cost, stated rather than buried.** The stage overrides the text size the reader set in their browser,
and above the breakpoint a small window makes everything evenly small instead of reflowing. For a game
field that is the usual trade and it is why this is D62 rather than a silent fix.

### 2.2 The seat plate, D63

`.hud__seat` keeps `15.5rem` as a `min-width` and takes `width: auto`.

| | px |
| --- | --- |
| D37's plate, content box | 218 |
| What the four numbers need, measured | 278 |
| How far the last item ended up outside the plate | 45 |
| The plate now | 308 |
| Four plates plus their gaps, against the stage's 1552 of content width | 1268 |

The 278 is four uppercase labels (`START`, `STRECKE`, `ZIEL`, `KARTEN`), four values, 36 px of outer gaps,
16 px of inner gaps and 12 px for the hairline the cards count sits behind. Nothing in that line can
shrink, because `.hud__count` is `white-space: nowrap` with no `min-width: 0`, and nothing clips it, so
**the next plate painted over the overflow**. Three of four seats read "1 KA" and only the last one, with
nothing to its right, read "KARTEN".

D37's answer is "one fixed size, and the row centres rather than stretching", and the second half is what
it is actually about: it rejects *stretching the plates to fill the row*. All four plates still come out
identical, because they hold the same labels and single-digit values, so what changed is the number and not
the rule.

### 2.3 The fan's shadow, D64, and the diagnosis that disagreed with the request

**The request was to turn the stacking order around so the left card lies on top. The order is not the
defect and it was not changed.** Every card is at `--layer-card`, DOM order breaks the tie, the card on the
right lies on top, and the strip that stays exposed is therefore each card's **left** edge, carrying the
band and the title. That is what D28 chose on purpose: "in a fan, where the pill is covered by the next
card, the exposed left strip of a card still shows type (band) and category (wash)".

What is broken is the depth cue. `card.css` casts the card's hard shadow down and to the **right**, so in a
fan every shadow but the last one is hidden under the next card. A row of overlapping cards with no edge
between them reads as a rendering fault, which is what was reported. Cast to the left it lands on the card
it is lying on.

The implementation is one sign: `.card { --shadow-dir: 1 }`, `.hand--skill .card { --shadow-dir: -1 }`, and
the four shadow declarations in `card.css` and `card-state.css` multiply their x offset by it. The dice
hand keeps its shadow on the right, because its three cards have a real `gap` and never overlap.

**The rejected option is the one that was asked for**, and it was put to the Product Owner with both looks
drawn out: left-on-top fixes the shadow as well, and it exposes the right-hand strip of every covered card,
so the kind pill survives and the title and the `AKTION`/`REAKTION` label are what gets cut. **A fan of
cards whose names cannot be read was the worse trade.** Also rejected: less overlap instead, which the
stage's wider rail would now afford, because that hides the question rather than answering it and the
overlap is D26's number.

### 2.4 The two that are not design questions, fixed without asking

**An empty slot was drawn as a card back.** `card-state.css` gives every card in a hand with
`data-active="false"` the back's dashed inner frame as `::before` and its violet diamond as `::after`.
`hand.css` draws an empty slot as a dashed silhouette and hides `> *`, the real children, and a
pseudo-element is not a child. So the four empty slots wore a card back's furniture inside an empty slot's
outline. At the inactive hand's 82 per cent overlap only 32 px of a slot is exposed and the diamond is
67 px wide, which is why the row read as a pile of clipped diamonds. Two lines of `content: none` in
`hand.css`, which wins on load order exactly as its `background` and `border` already do.

**An empty slot was painting over a real card.** A slot is a later sibling than the cards to its left and
every card sits at `--layer-card`, so DOM order put the slot on top and its dashed border was drawn
straight across the face of the last real card in the hand. Visible in the Product Owner's own screenshot
of the action cards once it was known to look for. The slot is now `z-index: 0`. **If the layer scale
should get a fourth name for this, say so**; it is a local value in `hand.css` today, which follows the
precedent of the hard-coded z-indexes inside `pawn.css` and `board-trap.css`.

---

## 3 The three decisions, and what an answer looks like

**D62. The stage.** Confirm it, or replace it.

1. **Is a fitted 16:9 stage the right answer to FR-31**, given that D6's fluid board cannot fix a page
   whose other four regions are `rem`? If not, the alternative has to make the rail's height fluid, which
   is D26's card sizes and D35's row heights re-opened, and this side cannot take that.
2. **Is 100 by 56.25rem the shape and size**, or should the stage be something else? The constraint is
   D35's 882 px worst case: a stage under 882 px tall at the default text size needs the rail to shrink.
3. **What paints the bars.** `--color-ink` today. A named token is a one-line change.
4. **Does D6's own text change?** Its two percentages are intact and its "no target resolution" claim is
   now true of the window and false of the stage. If D6 keeps its wording, say against what the
   percentages are measured, because that is the part a reader will get wrong.

**D63. The seat plate.** Confirm `min-width`, or answer the width question differently: shorter labels,
fewer counts, a second line, or a smaller type size are all yours to choose and none of them is ours. If
the plate stays a fixed width, it needs a number that fits 278 px of content.

**D64. The fan.** Confirm the shadow flip and the order, or overrule it. Two things come with it:

1. **The overlap table follows `data-count` while the hand always builds five slots**
   (`SKILL_HAND_LIMIT = 5`), so a hand of three is **wider** than a hand of five: 714 px against 672. It
   overflowed the old 734 px rail and fits the stage's 824, so it is not urgent. Spec 03 § 4.2 says the fan
   "keeps the same footprint at any limit", and with permanent slots that is only true if the overlap is
   constant. Spec 03 D30's own printed number, "skill fan 589 wide", solves to an overlap of 0.44 for five
   cards, which the table assigns to `data-count="6"`.
2. **The hover reveal shifts following siblings by 43.5 px** while the covered strip is 42.4 px at overlap
   0.24 and 77.8 px at 0.44, so at the higher counts a card cannot be fully revealed by hovering it.

---

## 4 Two findings that need no code from you, and one that might

**`data-active` on the skill hand does not mean what D33 needs.** `skill-hand-view.js` sets it from
`playable.length > 0`, so it means "some card in this hand is playable right now". D33's answer is about
hot-seat privacy: "your own hand, while the player next to you is taking their turn". Those are different
states, and the visible consequence is that **your own hand is face down during most of your own turn**,
which is what the Product Owner was looking at when they asked whether the stacked cards were a bug. Fixing
it is a view change and it is ours, but D33's answer is the thing that says which state it should read, so
it is named here first.

**Baloo 2 and Nunito are declared and loaded by nothing.** `tokens.css` names them in `--font-display`,
`--font-ui` and `--font-num`, and its comment says "the page loads them". No `@font-face` and no stylesheet
link exists anywhere in `index.html` or `src/`. Everything renders in `system-ui`. **So no pixel
measurement in any spec was taken against the metrics the game actually renders**, including D37's
15.5rem, and D24 has been open since handoff 02. Every figure in this brief was measured against the fonts
that are really there.

---

## 5 The rules that apply to the delivery

The five standing ones from `00-open-requests.md` § 5, unchanged: no user-facing string in a `content:`
property; no CSS file over 300 lines after `npm run format`; built once, then only attributes rewritten;
two skins from the tokens with `prefers-reduced-motion` respected; and **no em dash**, in the spec or in a
CSS comment, neither the character nor the rhetorical habit.

Two specific to this one:

6. **Say which existing rules are superseded, by file and line.** § 2 of brief 08 asked for this and D61
   is the reason: a rule answered twice with neither side seeing the other. This brief lists what it
   changed for the same reason.
7. **Room to work:** `tokens.css` and `board.css` are the two files with the least of it, and `card.css`
   and `app.css` have both grown in this change. If an answer needs more than about thirty lines in any of
   them, split at a real seam and name it, as `board-trap.css` did.

---

## 6 What is out of scope

- The board, the pawns, the trap marks and the overlays. Nothing in this brief touches them, and the stage
  deliberately changes no measurement inside the board at 1440 by 900.
- D61, which is still open and unaffected: the pickable field's hue is not a layout question.
- The six unstyled pawn statuses and the abandoned win screen. Both are on the open list and neither is
  here.

---

## 7 The landing checks

What this side will run when the spec arrives, so the delivery can predict the result:

1. `npm run lint`, `npm test`, `npm run test:e2e` across chromium, firefox and msedge.
2. `tests/e2e/shell.spec.js`: no scrolling and a centred 16:9 stage at 1438 by 770, 1920 by 1080, 1600 by
   900 and 1512 by 982, plus the stacked layout still present below the breakpoint.
3. `tests/e2e/hud.spec.js`: the four `.hud__count` items inside their plate, in both languages, at two,
   three and four seats. **Measure the items and not `.hud__counts`**: the `ul` is a block box and stays
   inside the plate however far its children stick out, so an assertion about it passes either way. That
   mistake was made once while writing this.
4. `tests/e2e/skill-hand.spec.js`: an empty slot has no back pseudo-elements and sits under every real
   card, and a fan card's shadow offset is negative while a dice card's is positive.
5. No CSS file over 300 lines after `npm run format`.
