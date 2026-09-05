# 04 Frontend: structure and building blocks

> **Covers:** `src/ui/` and `src/i18n/`: the components the player sees, how they render, how they
> bind events, how they dispatch into `state/`, and how localisation works.
> **Does not cover:** game rules (Chapter 05) or state transitions (Chapter 06). If a fact is about
> *what the rule is*, it belongs in 05 even when the UI shows it.

## What this chapter must answer

- The list of UI components, one line each on what it does.
- How components interact, and how they are grouped.
- **One component in depth**: the most complex view, with its structure drawn out. The sample
  report does this with a single screen and it is one of its strongest sections. Pick the board
  renderer or the card-hand view, and put the component tree in the appendix as a text diagram.
- Modularisation: how the UI is split across files and why along those seams.
- How the UI reads state and dispatches intents: it never mutates state directly.
- Styling approach.
- Localisation: how i18next is set up, where the locale files live, how a key is resolved.
- Routing, if any. If there is none (a single-screen game), say so and explain why, rather than
  omitting the topic.

## Facts

### Where the design system lives, and how it gets here: 2026-08-29, issue #3

This chapter's *Open* section asked for exactly this: "when it does, record where it lives". It now
lives in two places on purpose, and the split is the fact worth carrying.

| What | Where | Why there |
| --- | --- | --- |
| The CSS itself | `src/ui/styles/` | It is production code and it is what the build ships. |
| The reasoning behind it | `01-Design/Handoff/` | "Why does it look like that" has to be findable without reading a stylesheet, six weeks later, by whoever writes the report. |

- **`01-Design/` is a new top-level folder, committed to git**, sitting next to `00-Meta`. It holds a
  `README.md` describing the loop, a `Handoff/` directory of numbered brief and spec pairs, and an
  `assets/` directory for exported images if any turn out to be needed.
- **The loop is a pair of documents with a fixed shape.** Claude Code writes a **seven-section
  brief**: what to design, hard constraints with reasons, the DOM contract, facts taken from the
  rulebook, numbered open decisions, deliverables with paths, and what is out of scope. Claude Design
  answers with a **five-section spec**: files delivered, one answer per open decision with a reason
  **and a rejected alternative**, a token reference table, the component states covered, and what is
  still open.
- **The rejected-alternative requirement is in the template rather than in a reminder.** A delivered
  palette looks finished, and a finished thing does not invite the question "compared to what". Asking
  for the alternative in the template costs a sentence per decision; reconstructing it for the report
  in week eight is not possible at all.
- **Brief 01 went out on 2026-08-29** as
  [01-brief-foundations-and-board.md](../../../01-Design/Handoff/01-brief-foundations-and-board.md).
  It covers screen S3 (the board), screen S6 (move hints and refusal) and the colour, spacing and
  typography foundations every later screen reuses. It asks **nine numbered decisions, D1 to D9**, and
  contains no colour, size or font of its own.
- **It went out after `core/board.js` existed and not before**, deliberately. The square indices,
  the entry squares and the 58-step journey in the brief are values a reader can check against real
  code rather than against a plan.

#### The DOM contract is the load-bearing part, and it is not a design rule

The brief specifies the exact markup `ui/board-view.js` will produce: `.board`, `.square--track` with
`data-square="0..51"`, `.start-area`, `.home-column` with `data-home-step="1..5"`, `.home`, `.pawn`
with `data-player`, `data-pawn` and `data-r`, and a `.move-refusal` region carrying a
`data-reason-key`. Five states are driven by attributes: `data-legal-target`, `data-movable`,
`data-selected`, `data-captured` on pawns and squares, and `data-active-player` on the board.

> **Three parts of that contract changed when the spec came back on 2026-08-30**, and the sentence
> above is left standing because it is what the brief said. `data-square` now runs `0..39`,
> `data-home-step` runs `1..4`, `.home` was removed entirely, and `.pawn` gained two inline custom
> properties. The section further down has the detail.

**Why this is worth a paragraph in the report:** it is what lets the design work and the rules work
happen at the same time without the two sides meeting. Claude Design writes selectors against markup
that does not exist yet, and the view is written to produce exactly it. Without the contract, one side
waits for the other, and #3 blocks 15 points of UI work.

**The line the brief must not cross**, and it is drawn in the brief itself: naming an element or an
attribute is a technical interface, naming a colour, size or font is a design rule that `CLAUDE.md`
forbids Claude Code from inventing. The practical test used is whether Claude Design could reasonably
answer "no, it should be different". If yes, the brief asks instead of telling, which is what the
nine open decisions are for.

#### The one presentation decision taken by Claude Code

**The board is drawn as real DOM elements in a CSS Grid**, not as SVG and not on a `<canvas>`. The
reasons and the two rejected alternatives are in the decision block of 2026-08-29 in
[project-journal.md](../project-journal.md). In short: jQuery, Playwright, i18next and CSS transitions
each do something for free with DOM elements that would have to be built by hand otherwise, and the
game is turn-based with one pawn moving at a time, so canvas buys performance the game does not need.

This **reverses a deferral** in section 6 of
[System-Architecture.md](../../Project-Management/System-Architecture.md), which had handed the choice
to Claude Design as a design rule. It is a rendering technology and not an appearance, and a brief
cannot hand over a DOM contract without first deciding that there is a DOM. The brief tells Claude
Design to push back if the constraint makes a design impossible, so the reversal is reversible.

### The design system landed, and it changed the brief: 2026-08-30, issue #3

Handoff 01 came back on 2026-08-30 as
[01-spec-foundations-and-board.md](../../../01-Design/Handoff/01-spec-foundations-and-board.md) plus
real stylesheets. **The design system is now code**, which is what the handoff loop was designed to
achieve: nothing was translated from a picture into CSS, because the CSS *is* the delivery.

| File | Holds |
| --- | --- |
| `src/ui/styles/tokens.css` | Every token as a custom property on `:root`, both skins in one `light-dark()` pair per token |
| `src/ui/styles/board.css` | The 11 by 11 grid, the square and its states, the yards, the houses, the empty-seat treatment |
| `src/ui/styles/board-track.css` | Which grid cell holds which of the 40 track fields |
| `src/ui/styles/pawn.css` | The pawn, its five states and the movement transition |
| `src/ui/styles/refusal.css` | The S6 refusal strip |

Line counts belong in [09-source-code-overview.md](09-source-code-overview.md) next to the command
that produced them, not here.

#### The spec answered more decisions than the brief asked, and departed from four of its facts

The brief asked D1 to D9. The spec answered those and added **D3a, D10, D11, D12, D13, D13a and
D15**, seven decisions the brief did not know it needed. All sixteen carry a reason and at least one
named rejected alternative, which was the one non-negotiable in the template.

Four answers contradict section 4 of the brief, which the brief itself had labelled non-negotiable
facts taken from the rulebook. **The spec said so plainly instead of quietly emitting CSS for a board
nobody had agreed to**, and that is the reason this cost an hour rather than a week:

| Departure | Consequence |
| --- | --- |
| **D3a**: 40 track fields at an offset of 10, not 52 at 13 | Rewrote section 2 of the game design document and `src/core/board.js`. See Ch. 05 |
| **D3**: a four-field house and no separate home area | `REGION.HOME` deleted; the win condition became "the house is full" |
| **D3**: two players sit on seats 0 and 2 | `core/board.js` gained `seatsFor`; a two-player match has no seat 1 |
| **D10**: a pawn is never re-parented into a square | The view sets `--pawn-col` and `--pawn-row` on a pawn that stays a child of `.board` |

**D10 is the one that would have been expensive to discover late.** The brief's contract said pawns
are "placed into a square by JS". Read as re-parenting, that makes the D8 movement transition
impossible: a CSS transition needs one element to change position over time, and moving a node to a
new parent destroys and rebuilds it. The whole reason the DOM-in-a-grid decision was taken was to get
the animation for free, so the contract as written would have removed its own justification.

#### The five landing checks, and what each one found

The plan required five checks before merging the delivery rather than after.

| Check | Result |
| --- | --- |
| Every open decision answered | Yes, D1 to D9 plus seven the spec added |
| Every answer names a reason and a rejected alternative | Yes, all sixteen |
| No CSS file over 300 lines | **Failed on arrival, then fixed.** See below |
| No user-facing string baked into a CSS `content:` | Passed. Every `content:` in the delivery is `content: ""` |
| Every state in the DOM contract has a style | Yes, and two states were added that the contract did not have (`:focus-visible`, reduced motion) |

**The 300-line failure is worth recording, because the cause was the project's own toolchain.** The
delivered `board.css` was 248 lines and inside NFR-02. Running `npm run format` expanded every
single-line rule such as `.square[data-square="0"] { grid-area: 5 / 1; }` into three lines and took
the file to **407**. Prettier has no option to keep those on one line, so the file had to be split.

The seam chosen was the 40 `data-square` grid placements, moved to `board-track.css`. Section 1 of
the spec had **named exactly this seam and rejected it**, on the grounds that those lines have to be
read next to the geometry they implement. That objection was answered rather than overruled: the
index-to-cell table moved into the new file's header, so the geometry and the placements are still
next to each other. The rejected alternative, splitting the square *states* out instead, would have
separated `.square` from `.square[data-legal-target="true"]`, which is a genuine seam in neither
direction.

#### Two comments in the delivered CSS were corrected, and no rule was

`board.css` arrived describing the yards as "the four 6 by 6 corners" and the entry markings as
belonging to "the 52-square topology". Both are left over from earlier revisions of the design and
both contradict the rules directly underneath them, which were already 4 by 4 and 40 squares. The
comments were corrected in place and the correction is noted in the file.

**Nothing else in the delivery was edited.** `CLAUDE.md` forbids Claude Code from inventing or
overwriting design rules, and the line drawn here is that a comment stating a fact that the code
below it contradicts is not a design rule, it is a defect in the documentation of one.

#### Negative finding: NFR-12 is no longer answered, and the spec says so itself

NFR-12 asks for "a second, non-colour identifier" per player. D2 delivers **colour only**, after the
first version of the answer used a per-seat pawn silhouette and was changed on request. What survives
is the narrower acceptance criterion, that a greyscale screenshot still tells the pawns apart, and it
survives on lightness alone: yellow 0.85, green 0.70, red 0.66, blue 0.62 in oklch. Three of the four
sit within 0.08 of each other.

The spec is explicit that this may fail its own test and names the two ways out in order: nudge the
green and blue apart, or reinstate a non-colour identifier. Both are Product Owner decisions. **Row 8
of the sign-off table in the game design document is therefore filled in as a question rather than as
an answer**, because recording it as answered would misreport what was delivered.

### The board on screen, and the one component in depth: 2026-08-30, issue #62

`src/ui/` went from empty to five modules. This section is this chapter's **one component described
in depth**, and the component is the board renderer. Its element tree is registered as Figure 10 in
[12-appendix.md](12-appendix.md).

| Module | Owns | Never does |
| --- | --- | --- |
| `board-geometry.js` | Which of the 121 grid cells a position is | Touch the DOM |
| `board-view.js` | Building the markup once, then writing attributes onto it | Decide what is legal |
| `move-hints.js` | `data-legal-target`, `data-movable`, `data-selected` and the message text | Hold a colour or a size |
| `events.js` | Turning a DOM event into one call | Read state or check a rule |
| `game-loop.js` | Holding the state, dispatching intents, advancing the turn | Write into a state object |

#### Built once and updated after that, because the animation depends on it

`renderBoard` produces the whole DOM contract in one pass and runs once. `updateBoard` then only
writes attributes and two custom properties per pawn. **Nothing is ever destroyed and rebuilt**, and
that is not an optimisation. D10 of the design spec is the reason: a CSS transition needs the same
element to change position over time, so a pawn re-parented into its target square would move
instantly and invisibly no matter what the stylesheet said. The whole DOM-in-a-grid decision was
taken to get movement animation for free, and re-parenting would have thrown that away.

The pawn therefore stays a direct child of `.board` for its whole life, and the view writes
`--pawn-col` and `--pawn-row`, the fractional cell coordinates of its centre. `pawn.css` turns those
into a `transform`, which is what transitions.

#### The geometry table exists twice, and a test is what makes that acceptable

`TRACK_CELLS` in `board-geometry.js` and the 40 rules in `board-track.css` are the same table, once
for JavaScript and once for CSS. **If they drift, nothing throws**: pawns simply walk over the board
next to the squares instead of onto them, and only a person looking at the screen notices.

So `tests/unit/ui/board-geometry.test.js` reads the stylesheet and compares the two tables index for
index. It is the **only unit test in `ui/`**, and the exception is deliberate: that module is a
lookup table with no DOM, and it is the one place in the layer where a mistake is silent. The same
file also checks properties the table has to have rather than examples: the 40 cells form a
continuous ring, each seat's house starts next to that seat's own turn-off field, and no cell is used
twice.

#### The turn advances by itself, because there is nothing designed to press

Handoff 01 covers the board (S3) and the refusal region (S6). It covers no dice hand, no turn bar and
no win screen, and `CLAUDE.md` forbids Claude Code from inventing what a component looks like. The
question was put to the team on 2026-08-30 and answered: **the pawn click is the only control.**

- Choosing a die is automatic, because the stand-in pool holds one card and there is no choice to
  hide. Issue #37 brings the real three-card hand and the screen that picks from it.
- The turn hands over on its own, after the move has finished animating or after the refusal has been
  on screen long enough to read.

**The first of those two stopped being true on 2026-08-30, with issue #30.** The pool now deals three
different cards and the loop still takes `hand[0]`, so a choice FR-19 gives the player is made for
them. It is visible in play: a hand whose first card is a D20 needs a twenty to get a pawn out of the
yard, and the turn usually passes. The pick stays `hand[0]` rather than becoming a "take the most
useful die" rule, because a clever rule would be a second player living in the view and would have to
be unwritten again in issue #31. The gap is measured rather than guessed: `npm run test:seeds`
replays 400 two-player matches and all 400 finish, so it costs turns and does not deadlock the game.

**The two pauses are the design's numbers rather than the view's.** The pause after a move is read
back out of `--motion-capture` with `getComputedStyle`, so the turn changes when the pawn has
actually arrived and the stylesheet stays the single source. The pause after a refused turn is D9's
four seconds, and that one **is** a number in a JavaScript file, because `tokens.css` has no token
for it. That is a design decision living outside the design, and it goes to handoff 02.

#### The first click selects and the second commits

One click would be fewer clicks. It would also mean a misclick captures an opponent with no way back,
in a game where a capture costs the other player most of a lap. Selecting first is also what makes
FR-32 literal: with nothing selected every legal move is lit, which is the whole choice, and once a
pawn is picked the set narrows to that pawn's one target, so the second click has an unambiguous
consequence.

#### Four attributes were added to the DOM contract, for tests rather than for CSS

`data-phase`, `data-status`, `data-turn` and `data-roll` on `.board`. No stylesheet reads them and
none is expected to. They exist so that a Playwright test can wait for the turn to reach a state
instead of waiting for a number of milliseconds and hoping.

**A fifth joined them on 2026-08-30 with issue #30: `data-die`, the chosen card's face count.** It
was added because a test could not otherwise say what the rule says. `pawn-leaves-start.spec.js`
asserted `expect(roll).toBe(6)` for "the maximum was rolled", which was true only while the stand-in
was a D6. FR-09 is "the die's maximum", and with seven denominations in play the view had to expose
which die was in play before the assertion could be written as `expect(roll).toBe(die)`. The dice
hand in issue #31 needs the same value on screen for the player, so this is early rather than extra.

**`data-turn` was added after a race, not before one.** The first version of the end-to-end helpers
waited for the phase or the active seat to change. With the pauses collapsed for a test run, a turn
nobody can move in passes itself within the same tick, so the board could go from `act` through two
seats and back to `act` between two polls, and both signals read unchanged. The turn number only
counts upward, so it cannot hide a turn that has already happened.

#### Negative finding: the win message is in the wrong place and looks wrong

There is no designed place for "you won", so it shares the refusal region, which `refusal.css`
styles in the warning orange of D9. That is right for "that move is not allowed" and wrong for "you
won". The two are told apart by `data-message-kind`, an attribute that exists only so that handoff 02
can split them with a selector and no change to `move-hints.js`. **It is a known defect, recorded as
one rather than quietly shipped.**

#### Negative finding: `app.css` is 35 lines of design written by Claude Code

The delivery styles a board and a strip. It does not style a page, because the page is FR-31's
five-region layout and that needs the dice hand, the skill hand and the HUD to exist first. So
`src/ui/styles/app.css` centres the board and paints the background, using only tokens that already
existed: `--color-app-bg` was in `tokens.css` and nothing had used it, so the design had already
decided what sits behind the board. Inventing no value is the rule it keeps. Centring the board is
still a layout decision, and it is a placeholder that belongs in handoff 02.

### Handoff 02 sent, and the round is open: 2026-08-30, issue #3

[02-brief-board-review.md](../../../01-Design/Handoff/02-brief-board-review.md) went out the same day
the board started rendering. **The design has now met real code, and the brief is a list of what that
contact produced** rather than a request to review everything.

**Everything in it is measured.** That is the difference between this brief and the first one: brief
01 could only state requirements, because there was nothing to measure. Brief 02 states the board
resolves to 684 px at 1440 by 900, that the legal-target fill is a contrast ratio of 1.186 against a
plain square while its ring is 4.002, that red and blue are ten greyscale levels apart, and that the
four movable rings in a yard overlap by about 7 px because the pawns are 62 px apart and the rings
are 69 px across. A review round asking "does this look right" gets an opinion. One asking "the fill
carries a ratio of 1.186, is that intended" gets a decision.

It asks **nine numbered questions, D16 to D24**, continuing the spec's own numbering so that an
answer can be cited without ambiguity. The two that matter most:

- **D16, NFR-12.** The only one that blocks a requirement rather than a preference.
- **D17, whether the legal-target set has to read as one group.** Two of Claude Design's own rules
  work against each other here: D7 says the highlighted squares should group, and D7's own
  entry-square exception keeps the owner's colour, so two squares come out pale lilac and one comes
  out saturated blue. Neither rule is wrong on its own. Finding that they collide needed three
  squares lit at the same time in a real match, which is exactly what section 5 of the spec said it
  could not check.

**One question is new work rather than a revision.** D21 asks whether a legal target that *captures*
should look different from one that does not. FR-32 shows a player where a pawn can go; it does not
show that landing there sends an opponent back to their yard, which is the biggest single swing in
the game. It came out of looking at a screenshot, not out of a requirement.

**The round is open and this branch does not close it.** Applying `02-spec-board-revisions.md` is
step 9.2 of the sprint plan and has not happened.

### Handoff 03 sent, and it is the first one with a real blocker behind it: 2026-08-30, issues #31 and #34

`01-Design/Handoff/03-brief-cards-and-hands.md` asks for the card component, the dice hand (S4), the
skill hand at rest (S5), the skill square on the board (S3) and the page shell. Nine open decisions,
**D25 to D33**, continuing the numbering from handoff 02.

**Handoff 02 deliberately did not ask for any of this**, on the grounds that "a brief that asks for
them gets a design nobody can build yet". Two things changed that on the same day:

- The real Dice Card Pool exists (issue #30), so a turn now deals three different cards and there is
  a genuine choice to put on screen.
- The Product Owner chose the card set: all 29 cards from the card artwork canvas, artboards `6a` and
  `4a`, plus the seven dice cards on `5a`.

**What makes this brief different from the first two: it is unblocking a measured defect, not filling
a blank.** `game-loop.js` picks `hand[0]` for the player, and over 400 measured matches one turn in
three has no legal move at all. Part of that is the view picking a D20 when the player needed a D2 to
leave the yard. So the design round is not cosmetic work queued behind the rules; it is the fix.

Three of the nine decisions are worth naming here because they are not "what colour":

- **D27 is a collision, not a choice.** Skill squares are described as purple and `--color-hint` is
  already purple for a legal target. A field can be both at once, so one of the two has to give.
- **D28 is a contradiction inside the artwork.** Artboard `6a` labels a card by type and sub-kind,
  artboard `4a` by category and sub-kind. A hand holds both, so a player sees two labelling systems
  unless the design reconciles them.
- **D33 is rules-adjacent and the brief says so.** Hot-seat means one screen, and a skill hand is
  private in a way a dice hand is not. The brief explicitly allows "this needs the Product Owner" as
  an answer rather than forcing a design decision onto a rules question.

**The handoff folder is committed with the brief.** `01-Design/Handoff/Card artwork design planning/`
is 2.7 MB, mostly illustration uploads. It is the only record of what the 29 cards are, and the brief
references it by path, so leaving it untracked would have left the brief pointing at nothing.

### Localisation: 2026-08-29, issue #64

`src/i18n/index.js` plus `locales/de.json` and `locales/en.json`. Counts are in
[09-source-code-overview.md](09-source-code-overview.md).

**It was written before the first view, and that is the whole point of doing it now.** NFR-03 forbids
a hardcoded user-facing string anywhere in `src/`. Adding localisation after the views exist means
going back through every one of them and finding the literals; adding it first means there is never a
literal to find. Issue #64 did not exist on the board until 2026-08-29, and its absence is recorded
as a planning finding in [02-project-management.md](02-project-management.md).

#### The rules already spoke in keys before this module existed

`core/movement.js` produces `move.refused.overshoot` and `state/intents.js` produces
`intent.rejected.wrong-phase`. Neither has ever contained a sentence. The layer that knows the rule
therefore never knows the language, and the layer that knows the language never knows the rule. That
split is worth a paragraph in the report, because it is the reason NFR-03 costs nothing here: the
keys were free at the time they were written and would have been expensive to retrofit.

| Key group | Where the key comes from | How many |
| --- | --- | --- |
| `move.refused.*` | `core/movement.js` `REFUSAL` | 5 |
| `intent.rejected.*` | `state/intents.js` `REJECTED` | 5 |
| `turn.*`, `match.*`, `player.*`, `app.*` | Written for the views that do not exist yet | the rest |

#### German is the default, English is the fallback

The team, the module and the report are German, so German is the language the game is read in during
development and at the presentation. English is the fallback, so a key missing from `de.json` shows
English text instead of a raw key. **That is a safety net and not a plan**: a unit test requires both
files to be complete, which is NFR-03's acceptance criterion.

Rejected: **English as the default** with German as the fallback, which is the usual convention for a
codebase written in English. It loses because nobody in the audience of the presentation reads the
game in English, and a default nobody uses is a default nobody notices is broken.

Rejected: **detecting the browser language**. It is one line of i18next configuration and it makes
the language the game starts in depend on the machine it is demonstrated on, which is exactly what a
presentation does not need. FR-34's runtime switch covers the real requirement.

**`escapeValue` is off.** Every string will reach the page through jQuery's `.text()`, which sets
text content and never interprets markup, so escaping on top of that would show `&amp;` to the
player. This is a decision taken before the views exist, which means it is a claim to check when
`ui/` is written rather than an observation.

#### Negative finding: the i18n module is in no build yet

`npm run build` produces well under a kilobyte, because `src/main.js` still imports nothing. The
locales, the i18next setup and every rule module are absent from `dist/`. Nothing is wrong with them;
they are simply unreachable until the composition root wires them up in issue #62. Any claim about
bundle size before then is meaningless.

**Planned structure recorded 2026-08-22, issue #21.** The 7 planned modules of `ui/` and the FR ids
each one owns are in [System-Architecture.md](../../Project-Management/System-Architecture.md)
section 2.3, with the facts summarised in [03-tech-stack.md](03-tech-stack.md). Two points from it
belong to this chapter specifically: all jQuery event handlers live in one module, `ui/events.js`, and
each handler translates a DOM event into exactly one intent and dispatches it; and `ui/` carries no
line-coverage target, because a coverage number for this layer would measure how much jQuery ran
rather than whether anything works. This chapter fills from observation once the code exists.

**Screen inventory recorded 2026-08-22, issue #14.** Section 2 of
[Obligations-Book.md](../../Project-Management/Obligations-Book.md) holds the full table. Facts for this
chapter:

- **Nine screens and screen regions in the MVP, plus two `should have` ones.** S1 main menu, S2 match
  setup, S3 board, S4 dice hand, S5 skill hand, S6 move hints and refusal, S7 HUD, S8 pause, S9 win.
  Should-have: S10 rules screen, S11 audio and language settings.
- **S3 to S7 are one screen with five regions, not five screens.** The player never navigates between
  them: FR-31 requires all five to be visible at once. This is also the answer to this chapter's routing
  question: a single-screen game has no routing, and the reason is a requirement rather than a
  simplification.
- **The reaction window is a modal state of S5, not a screen of its own.** It is a phase of the turn
  held by `state/turn-manager.js`, and in a hot-seat game every prompted player shares one screen
  (FR-03), so the prompt has nowhere else to happen.
- **S6 exists because of NFR-08 alone.** A refusal has to carry its reason, which is why the
  legal-move set is computed in `core/` and handed to the view instead of re-derived while rendering.
  It is the clearest case of the layering rule doing visible work for a player.
- **S7, the HUD, shows pawn progress only.** No resource or energy display, because section 6.7 of the
  game design document rules the mechanic out of the MVP, although issue #35 is titled *Game HUD &
  Resource Display*.
- **Negative finding: two screens carry no backlog issue.** S10 (FR-35, `should have`) and the language
  half of S11 (FR-34, **`must have`**, with NFR-03) appear in no issue on the board. A must-have
  requirement with no issue means the board understates the remaining work; carried into the effort
  estimation for issue #16.
- **No design specification exists yet**, so the screen inventory is the complete GUI commitment for
  now. Palette, spacing and typography stay with Claude Design and issue #3, and the obligations book
  draws the boundary explicitly: what has to be on screen is a requirement, what it looks like is a
  design decision.

### The locale text split into interface text and card text: 2026-08-31, issue #38

`locales/de.json` and `locales/en.json` became `locales/de/ui.json` plus `locales/de/cards.json`, and
the same for English. `src/i18n/index.js` merges the two files per language into one i18next
`translation` namespace at boot.

**Why now and not when the cards land.** The card set is 29 skill cards plus the dice denominations,
and each card carries a title and a rules sentence in both languages. That is roughly four times as
much card text as interface text. In one file the interface strings become unfindable, and every
playtesting tweak to a card's wording would land in the same diff as the whole interface, which makes
a review of that diff pointless. Splitting before the text arrives is a rename; splitting after it is
a merge conflict.

**The split is by owner, not by size.** `ui.json` is text the interface writes. `cards.json` is text
the card set writes. That line also predicts who edits which file during playtesting.

**Rejected: i18next namespaces**, which is the idiomatic answer the library offers
(`t("cards:card.type.action")`). Every existing call site says `t("move.refused.overshoot")` with no
prefix, so namespaces would mean editing every translation call in `core/`, `state/` and `ui/` and
would gain nothing the merge does not already give. The merge keeps every current call valid, and the
split is invisible to callers.

**The merge is shallow, so it refuses a collision instead of tolerating one.** A plain
`{ ...ui, ...cards }` drops one side of a duplicate top-level key without a word, and the symptom
would be a raw key such as `card.type.action` appearing on screen weeks later with nothing pointing at
the cause. `mergeNamespaces` throws at boot and names both the key and the file. Two unit tests cover
it: one asserts the shipped files own disjoint top-level keys, one asserts the throw.

**One string already proves the split earns its keep:** `card.dice.name` is `W{{faces}}` in German and
`D{{faces}}` in English. A dice card's name is not a number the view can format itself, because the
letter in front of it is language.

### Two attributes joined the DOM contract, and one of them is invisible on purpose: 2026-08-31, issue #38

**`data-skill-square="true"`** on the eight `.square--track` elements that currently hand out a card. It
is rewritten on every board update rather than only when the set changes, because a used-up square moves
and the work is one attribute on 40 elements. Tracking what changed would be more code than it saves.

> **Superseded on 2026-09-02 by the correction two sections below.** D27 was answered and the skill
> square has rendered since 2026-08-31. The paragraph is kept because the *pattern* it describes is
> load-bearing and issue #45 reuses it, not because its claim is still true.

**Nothing on screen shows it yet, and that is the blocker rather than an omission.** Decision D27 of
design handoff 03 is open: skill squares are meant to be purple, and `--color-hint` already uses purple
for a legal target square. A square can be both at once, so which reading wins is a design decision and
`CLAUDE.md` forbids this side from taking it. The attribute is in the DOM contract of the brief, so the
markup can be ready while the stylesheet waits.

**`data-winner`**, the seat that won, empty while the match is running. This one was added for a reason
worth recording in full, because it is a testing lesson and not a design one.

The win spec used to assert the literal text "Spieler 3 hat gewonnen" and read the winner's pawns out of
`positions["2.<index>"]`. Which seat wins is a property of the seed, not of any rule, and the seeds had
to be regenerated twice in one week: once for issue #30 and once for issue #38. Both times that spec
failed for a reason that had nothing to do with what it was testing, and both times it was "fixed" by
copying a new seat number into it.

So the view now says who won, and the spec reads it and asserts the **rule** instead: the winner's four
pawns fill the four house squares, and the message names that seat. It cannot go stale on the next seed
change. This is the same argument that added `data-die` for issue #30, and it is now clearly a pattern:
when a spec has to hard-code a value that the seed decides, the view is missing an attribute.

### The card names went into the locales and the rules sentences did not: 2026-08-31, issue #38

`cards.json` gained `card.skill.<id>.title` for all 29 cards, in both languages, plus the four category
labels. It did **not** gain the rules sentence for any of them.

**Why the split.** A card's rules sentence is a description of its effect, and no effect exists yet.
Writing 29 of them now means writing text that has to be checked against code that does not exist, and
then checked again when it does. A card's name is stable and does not depend on any of that. So the name
lands with the catalogue and the sentence lands with the effect, in the commit that implements it. This
is outstanding coverage rather than finished work, and it is recorded as such.

**The names are identical in German and English, and that is a decision.** They are jokes and memes:
"Aight Imma Head Out", "FR FR", "67", "Speedrun Any%". Translating them would produce German that is
worse than the English the players already say out loud, and `Nühü` is German anyway. Rejected
alternative: German names for the nine or ten that would survive translation, which would leave a hand
holding half-translated card names, which reads worse than either extreme.

The keys still exist in both files, which is what NFR-03's test requires, and which is what makes
translating one of them later a locale edit rather than a code change.

**Two tests hold the catalogue and the locales together**, and they run in both directions: every card
id has a title in both languages, and every title in the locales belongs to a card that exists. The
second one catches the opposite mistake, a card removed from the catalogue but left in the locales, which
would be text nothing can reach sitting there until somebody counted.

### Design spec 03 landed, and the five-item check earned its keep: 2026-08-31, issues #31 and #34

Spec 03 arrived as [03-spec-cards-and-hands.md](../../../01-Design/Handoff/03-spec-cards-and-hands.md)
with six stylesheets. It answers all nine open decisions D25 to D33, every one with a reason and a
named rejected alternative, and it adds D34, three requests of its own.

**What the spec decided, in one line each.**

| ID | Answer |
| --- | --- |
| D25 | The card palette becomes 30 tokens. A family hue is the same hex in both skins; a wash is too, because the illustrations are dark ink on light and CSS cannot recolour their strokes. The card *face* carries the skin instead. |
| D26 | One size knob, `--card-u`, a factor on the 260 by 380 artboard. The dice hand uses 0.76, the skill hand 0.68. What the hand size drops is the rules paragraph, and the space goes to the art. |
| D27 | A skill square is a **teal ink-outlined diamond**, not a purple fill. Teal is the only hue left that is not a seat colour, the violet hint or the orange refusal. |
| D28 | The band is the type, the kind pill is the category. One component, both labelling schemes. |
| D29 | The signal is on the card you *can* play: it sits 0.5 rem proud. Unplayable cards keep full opacity and drop to `saturate(0.5)`. |
| D30 | Board left, both hands stacked in a rail on the right, refusal across the foot. `--board-size` changed. |
| D31 | Deal 240 ms staggered by 60 ms, return along the same path. Nothing new under reduced motion. |
| D32 | The roll goes on the card that produced it, as a badge in the art window. |
| D33 | An inactive skill hand is a stack of backs. The rules half of the question goes to the Product Owner. |

**The item that mattered was not the size check.** The delivered CSS was all under 300 lines and the
five-item check in [01-Design/README.md](../../../01-Design/README.md) would have passed on a first
look. Three things only came out of actually reading it, and all three are recorded below because
they are the argument for the check existing at all.

#### Finding 1: the delivery undid a split that handoff 02 had made, for the same reason twice

The delivered `board.css` was 269 lines and had the 40 `.square[data-square="N"]` grid placements
inlined. Those placements were moved into `board-track.css` on 2026-08-30, and that file's own header
records why: **the designer's compressed formatting fits NFR-02 and the project's Prettier does not.**
That file went from 248 delivered lines to 407 formatted ones.

It happened again identically. The delivered 269 lines became 429 after `npm run format`, and the 40
rules now existed in two stylesheets at once. Same values, so nothing looked broken; `board-track.css`
loads second and won.

- **Fixed by restoring `board.css` from git and adding only the genuinely new block**, the 26 lines of
  the skill square. Two comments the delivery had also regressed were left as they were in git: one
  called the yards "6 by 6", a leftover from the abandoned 15 by 15 board that handoff 02 had already
  corrected to 4 by 4.
- **That still left 314 lines, so a second split was needed**, and the seam is a field against a
  region that holds fields. `board.css` styles `.board` and `.square`; the new
  `board-regions.css` styles `.start-area`, `.home-column` and `.slot`. Section 1 of the spec
  predicted the split and named the track placements as the seam, not knowing they had already moved.
- **The real lesson is a process one and belongs in the next brief:** the size limit has to be checked
  *after* Prettier, not on the delivered file, and the brief should say so. Twice is a pattern.

#### Finding 2: two claims about the layout, neither of them checked by anything

The spec printed arithmetic for D30: "At 1440 by 900: board 634, rail 702 ... page height 776. Nothing
scrolls." Measured, the page was **916 px tall in a 900 px viewport**. Two independent causes:

1. **The delivered `app.css` dropped `body { margin: 0 }`.** The placeholder it replaced had it. The
   browser's own 8 px default came back top and bottom, so every page was exactly `100vh + 16px`.
   Restored, with a comment saying it is a correction and not a design decision: no colour, size or
   spacing is chosen by removing a browser default that the spec's own numbers assume gone.
2. **`playwright.config.js` had been setting 1440 by 900 since 2026-08-14 and the suite had never run
   at it.** Every project spreads `devices["Desktop Chrome"]` and friends, and each of those carries
   its own 1280 by 720 viewport, which silently overrode the one in `use`. 1280 is *below* the 84 rem
   breakpoint spec 03 introduced, so the whole suite was playing the stacked fallback layout.

Both are now covered by `tests/e2e/shell.spec.js`, including a test whose only job is to assert the
viewport is 1440 by 900, so a device descriptor cannot quietly take it away again.

#### Finding 3: `pawn.css` and `refusal.css` were in the delivery and were not copied

Both differed from the versions in `src/`, and every difference was Prettier reflowing a
multi-value `transition` or `background-size`. No declaration changed. Copying them would have been
pure churn in the diff, so they were left alone. Worth writing down only because "the delivery
contains a file" and "the file changed" are not the same thing, and the diff is what tells them apart.

### The card, the one component behind three families: 2026-08-31, issue #31

`src/ui/card-view.js` builds one `.card` element tree and rewrites it. It is the component D28's
answer needs: a dice card, an Action card and a Reaction card are the same markup with different
attributes.

- **It takes a description, not a card id, and never calls `t()`.** The description arrives with every
  string already translated. The reason is that the locale key layout differs per family,
  `card.dice.kind.8` against `card.skill.<id>.title`, so a component that resolved its own text would
  have to learn a new key shape every time a family is added. `dice-hand-view.js` builds the dice
  description; the skill hand of issue #34 will build its own.
- **Built once, then rewritten**, which is D10 of spec 01 applied to cards. `updateCard` only sets
  attributes and text. An element that is replaced restarts every transition on it, so a card that is
  re-created cannot animate, and D31's dealing animation depends on it.
- **`.card__result` and `.card__text` exist while empty.** `card-state.css` hides an empty result with
  `:empty` and the hand size hides the paragraph. An element that has to exist before it has content
  cannot be created at the moment it gets some.
- **The tag row is the one part that is rebuilt** rather than rewritten, because the number of tags is
  a property of the card. Nothing animates a tag, so there is no transition to restart.
- **The art window is empty and that is outstanding work.** All 29 illustrations exist as inline SVG
  inside a generated artboard; extracting them is its own job. A card is still readable: the band says
  the type, the title says the name, the tags say the numbers. *(Closed on 2026-09-01 by issue #39, and
  it turned out to be 36 drawings rather than 29. Left standing here because it is what was true on
  2026-08-31; the extraction is its own facts section below.)*

### The dice hand, and the choice the view had been making for the player: 2026-08-31, issue #31

`src/ui/dice-hand-view.js` renders the three drawn cards and `ui/events.js` gained
`bindDiceHandEvents`. Since issue #30 the pool had been dealing three different cards and
`game-loop.js` had been taking `state.hand[0]`, so **FR-19's "the player chooses" was not true**, and
it showed: a hand whose first card was a D20 needed a twenty to get a pawn out of the yard, so the
turn usually passed. It is true now.

- **Three permanent slots, and the count comes from `deps.diceSource.handSize`**, not from the literal
  3. Reweighting the pool to deal four cards is then a change in `core/dice-pool.js` and nowhere else.
- **One activation picks a card, not two.** A pawn takes two clicks because a misclick there costs
  another player most of a lap. Picking a card costs nobody anything and is undone by the next turn, so
  a confirmation step would be a click charged for no risk.
- **The two tags on a dice card are the reason the pool is a decision**, restated on the card: the
  range, and the number needed to leave the start area (FR-09). A hand holding a D2 and a D20 is a
  choice between getting a pawn onto the board and moving one already on it, and a player should not
  have to remember which die does which. Deliberately **not** a hint about which card is better: that
  would be a second player living in the view.
- **`data-active` on a hand is read as "this plate is asking for a decision"**, which is true in the
  `choose` phase. The contract's wording is "whether this hand belongs to the player whose turn it
  is", and in hot-seat there is one shared dice hand, so read literally it would always be true and
  the plate ring `app.css` draws would never mean anything. The reading here is the one the stylesheet's
  own comment describes.
- **The dealing animation has to be replayed by hand.** A CSS animation does not restart because an
  attribute *inside* the element changed, so rewriting `data-card-id` deals a card silently.
  `data-dealing` is removed, a reflow is forced by reading `offsetWidth`, and it is put back. That
  pointless-looking line is the whole trick, and it is why D34 asked for the attribute.
- **Which turn was last dealt is kept in jQuery's data store, not in an attribute.** It is view
  bookkeeping and no stylesheet reads it, so putting it in the DOM would add something to the contract
  that the contract does not need.

### Seven dice denominations got a name, and the seven paragraphs are outstanding: 2026-08-31, issue #31

`cards.json` gained `card.dice.kind.<faces>` for all seven denominations, plus `card.dice.range` and
`card.dice.leave` for the two tags. Same pattern as the skill cards: **the name lands now, the prose
does not.**

`.card__text` renders empty for a dice card. The paragraph is only shown at `.card--full`, which
nothing uses yet, so nothing is missing on screen today. Seven paragraphs of flavour text in two
languages is copy, and copy for cards the Product Owner chose is the Product Owner's to approve, not
something to invent while wiring a hand. Recorded as outstanding, not as done.

### The skill hand became playable, and the prompt strip has no design behind it: 2026-08-31, issue #34

Five new modules in `ui/`, and one of them is the first thing in this project built **without** a design
specification. That is recorded here rather than glossed over, because it is the one place the design
process broke down.

| Module | What it owns |
| --- | --- |
| `ui/skill-hand-view.js` | The hand of cards, clickable |
| `ui/prompt-view.js` | The strip that asks a question: action phase, reaction window, target |
| `ui/target-picker.js` | Collecting what a card is aimed at |
| `ui/card-controls.js` | The gestures and the thirty-second clock |
| `ui/timers.js` | More than one thing waiting at once |

#### The view does not decide what is playable, it asks

`playableCards(state, seat)` comes from `state/`, and it is built on the **same** `cardRefusal` the
dispatcher checks first. So a card the hand offers is a card the dispatcher accepts, by construction.

The failure that avoids is the worst kind in a card game: the player is told they may play something and
then told they may not. Two copies of five rules would drift the first time one of them changed.

#### The prompt strip is one element with three jobs

The action phase, the reaction window and "point at something" all show in the same strip. Three separate
regions would each be empty most of the time and would move the board when they appeared, which is the
one thing FR-31's single-screen layout cannot afford.

Its grid row is **stated** rather than left to implicit placement, and `skill-hand.spec.js` measures that
the page still does not scroll while the strip is up. `shell.spec.js` measures the start of a match, when
the strip is hidden and costs nothing, so it could not have caught this.

#### `prompt.css` was written by Claude Code, and that is a process failure worth naming

`CLAUDE.md` says Claude Code does not invent design rules and asks when a specification is missing. One
is missing: design spec 03 covered the cards and the two hands and stopped, and issue #38 needed two
controls it does not describe.

What was done instead of inventing: **every colour, space, radius, shadow, font and duration in
`prompt.css` is an existing token**, and every shape is one already on the page (the refusal strip's
placement from spec 01, the panel chrome from `app.css`, the ring `move-hints.js` writes for a legal
move). The file's own header says all of this in the first thirty lines, so nobody can mistake it for a
delivered spec.

**What is owed by handoff 04**, and is deliberately not guessed at:

- What a countdown looks like. It is a number today: no ring, no bar, no urgency state, because "urgent"
  is a colour and a motion decision.
- Whether the prompt belongs at the foot of the page or in the rail under the skill hand.
- How a pickable pawn should differ from a movable one. Both are rings today, in two different tokens.
- D33, still open with the Product Owner: is an opponent's hand shown at all during a reaction window,
  and is the card count public?

#### One hand on screen, and the bug that settled which

There is one screen and one skill hand region, so it shows one hand. The first implementation showed the
hand of "the seat being asked to act", which is `null` in every phase except the action phase, so **the
hand was blank while the player chose a dice card**. The end-to-end spec caught it on its first run.

The fix separates two questions that had been conflated: *whose hand is on screen* (the active player, or
during a window the first eligible seat) and *which cards are playable* (`playableCards`). A hand is
always on screen. Whether anything in it can be clicked is a different fact.

#### The half-finished card play lives in `ui/` and not in the state

A card that has been clicked and has no target yet is a fact about a mouse. It disappears if the player
changes their mind, and nothing has been dispatched, so **cancelling is free**: there is no intent to
undo and the rules layer never knew.

Putting it in the frozen state object would have made the rules layer hold a presentation fact, and would
have needed a "cancel that card play" intent whose only job is to undo something that never happened.

#### The selection is marked by slot and not by card id

A hand can hold both copies of one card. Marking the one being played by id lit up two of them, and the
player would have had no way to tell which one the game thought they meant.

#### Four target kinds cannot be pointed at

A pawn and a square are clicked on the board. A direction, one of two options, a number and "which
opponent" are not things on the board, so they become buttons in the strip.

`number` is the awkward one, and FR FR is its only user. It offers **one button per face of the chosen
die** rather than a text field, because a text field needs validation, a submit and a keyboard, and the
die has at most twenty faces.

#### `timers.js` had to become a registry, and the reason is a bug that had not happened yet

`game-loop.js` had one timer slot and a `later()` that cleared it unconditionally. That was right while
the only thing ever waiting was the handover pause. With a countdown running at the same time, whichever
was scheduled second would silently cancel the first, and the symptom would be a turn that never hands
over or a window that never shuts.

Named timers make that unwriteable: `set("handover", ...)` and `set("reaction", ...)` cannot cancel each
other, and setting the same name twice replaces itself, which is what a countdown being redrawn wants.

### The 36 card illustrations came out of the artboard: 2026-09-01, issue #39

The empty art window recorded above is filled. It was the first of two things the Product Owner asked
about on opening the running build, and the second was that nothing on screen says whose turn it is.

- **There are 36 drawings, not 29.** The count in every earlier note was the skill cards only. The
  artboard also holds one per dice denomination, D2 to D20, and those were dealt on every single turn
  with an empty window. 29 plus 7.
- **`scripts/extract-card-art.js` does the extraction, run by hand as `npm run assets:card-art`.** It
  parses `01-Design/Handoff/Card artwork design planning/Card Art.dc.html` and writes one `.svg` per
  card into `src/ui/art/`. Not a build step: the artboard is a design source, and making `npm run build`
  parse HTML out of `01-Design/` would put a design file in the production build's dependency graph.
- **Drawings are matched to cards by title, not by position.** Position would have worked, since the
  artboard happens to run in catalogue order. It would also break silently the first time a card is
  moved on the canvas and put the Yeet illustration on Tax Fraud, which no test could catch because
  both are valid SVG. Titles are matched against `src/i18n/locales/en/cards.json`.
- **Both halves of the mapping are hard failures.** A drawing that matches no card and a card with no
  drawing both abort the script before a file is written. The reason is that a half-import looks exactly
  like the empty window being replaced, so it must not be reachable by accident.
- **Titles are compared with accents and punctuation stripped.** The artboard and the locale file were
  written months apart and disagree in three places: a curly against a straight apostrophe in "It's Not
  That Deep", the `%` in "Speedrun Any%", and the umlauts in Nühü. Folding beats a table of three
  special cases.
- **Two things are changed on the way out, and nothing else.** The artboard's inline `style` on the root
  `<svg>` is dropped, because it sets `display`, `width` and `height`, and `card.css` sets the same
  three on `.card__art > svg`. An inline style wins over a stylesheet, so keeping it would have put
  three sizing decisions out of Claude Design's reach. And `aria-hidden="true"` plus
  `focusable="false"` are added, because the card already carries its name in `.card__title` and
  without this a screen reader reads out the path data instead (NFR-08).
- **`src/ui/art/index.js` reads the files with `import.meta.glob`**, Vite's own, so it costs no
  dependency and needs no editing when the card set changes. Thirty-six import lines would have been a
  second copy of the card list kept in step by hand.
- **The price of the glob is that a missing drawing is a runtime `undefined`, not a build error**, and
  `tests/unit/ui/card-art.test.js` is what pays it. It walks the real catalogue and the real pool
  composition, so a card added without a drawing fails the suite. It also asserts the two transforms
  above, which is how "the script cleaned it" stays true after the next re-run.
- **A sprite sheet was the rejected alternative.** One file with 36 `<symbol>` elements is one request
  instead of an inlined bundle, and it fails the 300-line limit by a factor of ten. Thirty-six separate
  files are at most 50 lines each.
- **`card-view.js` still looks nothing up.** The drawing arrives in the description as `card.art`, the
  same way translated strings do, so the one card component keeps knowing nothing about what a card is.
  It does guard the write: `.html()` runs only when the card's id changed, because `updateCard` runs on
  every slot on every render and re-parsing eight SVG drawings each time would be waste. The
  bookkeeping sits in jQuery's `.data()` rather than a DOM attribute, so no stylesheet can come to
  depend on it.

**Found while doing it, and not fixed:** the skill hand builds five permanent slots, so a hand holding
one card renders four blank cards with a pale art window. Spec 03's D29 answered what *unplayable*
looks like and `card-state.css` answers what *face down* looks like. Neither is *no card at all*. It is
in handoff 04 as an open item rather than guessed at.

### A player got a name, and a two-year-old off-by-one went with it: 2026-09-01, issue #39

`src/ui/player-labels.js` is the one place that decides what a player is called.

**The defect.** A seat is 0 to 3 and `seatsFor` seats two players **opposite each other on seats 0 and
2**, so every label built as `seat + 1` produced "Spieler 1" and "Spieler 3" in a two-player match, with
no Spieler 2 at the table. It was written down in `move-hints.js` as a known cost and left, on the
grounds that a second numbering would disagree with `data-player` and the colour tokens.

**Why it hid for two sprints:** in a four-player match `seat + 1` and the position in the match are the
same numbers, 1 2 3 4. Every screenshot anybody had taken was a four-player match.

- **The answer decided with the Product Owner on 2026-09-01 is that the label carries both facts:**
  "Spieler 2 (Grün)". The number is the position in the match, counted over `state.seats`; the colour is
  the seat. Nothing has to be inferred from the number any more, which is what the old objection was
  about.
- **The seat is still the seat everywhere else.** `data-player`, `--color-p0` to `--color-p3`, the entry
  squares and every rule in `core/` keep using 0 to 3. This is a presentation-only translation and it
  lives in `ui/` for that reason.
- **The colour word is keyed on the seat, not on the display number**, because seat 2 is green whether it
  is the second player of two or the third of four.
- **The words come from design spec 01 § D1**, the same table that fixes the four hex values. Brief 04
  asks Claude Design to correct any word that is wrong for the colour it specified, because those four
  words are the only place the design is described to the player in prose.
- **Three call sites were rewired**, and the reason for one file rather than a fix in each is that four
  places building the same name is four chances to miss one. `move-hints.js` names the winner,
  `prompt-view.js` names the actor in a reaction line and labels the opponent-picker buttons.
- **`displayNumber` takes `state.seats` and not the state.** Two of the three call sites have no state
  object to hand: the reaction line is built from a window and the buttons from a pick descriptor.
- **It has a unit test even though it is in `ui/`**, alongside `board-geometry.js` and the card artwork,
  because it calls no `t()` and needs no DOM, so it fits `environment: "node"` without weakening
  NFR-01's second criterion.

#### The locale keys that had existed and were never called

`turn.prompt` ("Spieler {{number}} ist am Zug") had been in both locale files since the i18n commit and
was called from nowhere. It was the answer to the first question the Product Owner asked about the
running build, sitting unused in the repository. Four more like it: `turn.chooseDie`, `turn.rolled`,
`turn.selectPawn` and `match.restart`.

**`turn.prompt` and `match.won` changed their placeholder from `{{number}}` to `{{player}}`**, and both
now take the composed label. One string per meaning: a second "player N wins" for the win screen would
have been the same sentence maintained in two places and two languages.

The parity test in `tests/unit/i18n/locales.test.js` already compared the `{{...}}` placeholders of the
two locales, so changing one language and not the other would have failed the suite. That check was
written for a different reason and paid for itself here.

### The HUD, and the answer to the question that opened this issue: 2026-09-01, issue #35

`src/ui/hud-view.js` plus the interim `src/ui/styles/hud.css`. One row per seat actually in the match,
carrying the short name and four numbers, and `data-on-turn` on exactly one of them.

- **Four numbers per seat, and no more.** Pawns in start, on track and home is FR-36. The fourth is the
  size of the skill hand, on screen only because of decision D33. **FR-37, the resource display, is
  `won't have` and has no slot**, because no rule for it exists anywhere in the rulebook: issue #35 is
  titled *Game HUD & Resource Display* and only the first half is being built. Pool and discard
  counters were considered at the same time and dropped, so sixteen numbers do not become twenty-four.
- **The rows are rebuilt only when the set of seats changes**, which is a restart with a different
  player count and nothing else. Every other update is an attribute or a text rewrite, per D10.
- **`renderedSeats` reads the seat list back off the DOM** rather than remembering it in a variable, so
  there is no field that can drift from what is on screen.

#### The turn sentence is in the top bar, and that is arithmetic rather than taste

The first attempt put "am Zug" as a chip on the active seat's row. The measurements, at 1440 by 900:

| Thing | Pixels |
| --- | --- |
| The HUD region | 1392 wide |
| One seat row, four seats | 332 |
| The full label "Spieler 1 (Rot)" | 107 |
| The four numbers with their words | 210 |
| An "am Zug" chip | 55 |

107 + 210 + 55 plus two gaps does not fit in 332. What it did instead was wrap the row onto a second
line, which made the page **935 px tall and gave FR-31 a scrollbar**, and truncate the names to
"Spi...". Two changes fixed it and both are recorded because both are visible on screen:

1. **The turn line became one sentence for the whole page**, rendered in the chrome row, which had
   roughly 1200 px going spare. `turn.prompt` was written as a sentence in the first place. The seat row
   still carries `data-on-turn`, so the stylesheet marks it without spending width.
2. **The seat row shows the short name**, "Spieler 2". 86 px were left after the numbers and the full
   label needs 107. The colour is not lost: `hud.css` paints the row's left edge in the seat's own
   colour, and the sentence above spells the label out in full.

**The alternative was shrinking `--board-size`**, and spec 01 § 6 explicitly names it as the number to
check first when a new region lands. It was not taken: shrinking the board to fit a HUD that Claude Code
designed itself is a trade the designer should make, not this side. The numbers above are in handoff 04
so that D35 and D37 can make it with real figures. `--board-size` is unchanged.

#### The chrome row, and why the language switch is not in a menu

`src/ui/chrome-view.js`: the turn sentence, a pause button and the language switch, in one always-present
row. FR-34 is a `must have` and its criterion is a switch **at runtime**.

`S11` in the obligations book pairs the language setting with the audio setting on one screen reached
from the main menu, and **audio was dropped out of epic #39 on 2026-09-01**. Leaving the language switch
in a screen that no longer exists would have quietly dropped a must-have requirement along with a
`should have` one. So it is here, reachable in the middle of a match.

- **The button shows the language you would switch to**, so `language.switch` is "English" in the German
  file and "Deutsch" in the English one and one key covers both directions. `data-lang` carries the
  language actually in use, for the stylesheet and the tests.
- **Switching needs nothing but a re-render.** No view caches a translated string: every one of them
  rewrites its own text from `t()` on every update. That is what makes FR-34's "no string remains in the
  previous language" true by construction rather than by a list of things to remember to refresh, and
  `hud.spec.js` asserts it by searching the whole page for the German words afterwards.

#### Three regions on screen now have no design behind them

`prompt.css` was one, and Chapter 04 already records it as a process failure. It is now three:
`prompt.css`, `hud.css` and `chrome.css`. All three carry the same header saying so in the first thirty
lines, all three compose only tokens that already exist in `tokens.css`, and all three are listed as
deliverables to be **replaced** in handoff 04.

`app.css` was also touched, and that is a fourth thing worth naming. Two `auto` grid rows were prepended
and every existing `grid-area` shifted down by two, so the chrome and the HUD have somewhere to be. No
colour, no spacing value and no token changed. The block carries a dated comment saying exactly that,
following the precedent of the `body { margin: 0 }` correction already in that file.

#### The HUD cost the board and the cards nine per cent each, and that is a measurement

This is the part of issue #39 worth a paragraph in the report, because it is a constraint nobody had
priced and the test suite is what found it.

`tests/e2e/skill-hand.spec.js` has an assertion that the page does not scroll **while the prompt strip
is asking something**, which was written after the prompt strip landed for exactly this class of
problem. Adding the HUD failed it by 56 px.

The vertical budget at the design resolution, 1440 by 900:

| Row | Pixels |
| --- | --- |
| Page padding, top and bottom | 48 |
| Five row gaps | 80 |
| Chrome | 28 |
| HUD | 62 |
| The board row | 634 |
| Refusal strip | 46 |
| Prompt strip | 70 |
| **Total** | **968 against 900** |

Two findings came out of fixing it:

1. **The refusal strip occupies its 46 px even when it says nothing.** `refusal.css` fades it with
   `opacity` rather than removing it, so the page does not jump when a refusal appears. That is a design
   decision from D9 and it was left alone, but it means the foot of the page costs 116 px whether
   anything is being said or not.
2. **Shrinking the board alone does nothing.** The board row is as tall as the **taller** of the two
   columns, and the rail was 627 px against the board's 634. Dropping `--board-size` from 44vw to 40vw
   bought 7 px, not 58, and the first attempt at the fix was therefore wasted.

So both columns gave the same amount:

| | Before | After |
| --- | --- | --- |
| Board, `--board-size` width bound | 634 px, 44vw | 562 px, 39vw |
| Rail, the two `--card-u` factors | 627 px, 0.76 and 0.68 | 561 px, 0.70 and 0.62 |

**Two delivered design tokens were changed by Claude Code, and that is the cost being recorded.** Spec
01 § 6 sanctions it in advance for `--board-size`, calling it "the number to check first when the two
hands are actually built". It says nothing about `--card-u`, and D26 is the decision that sized the
hands in the first place. Both changes carry a dated comment with the arithmetic above, both are in
handoff 04 as things D35 must confirm or overrule, and both revert if the HUD ends up somewhere that
costs no grid row. The full-size reference card, `--card-u: 1`, is untouched.

**What the smaller cards spend** is what D26 already identified: the hand sizes drop the rules paragraph
and keep the art, and they keep doing that at 0.70 and 0.62. What the smaller board spends is field
size, and spec 01 records that `--board-size` had been **raised** on 2026-08-29 to make the fields
larger. Nine per cent of that is given back here.

### The five screens, and the game becoming a game: 2026-09-01, issues #39 and #41

Screens S1, S2, S8, S9 and a new one with no screen id: the handover.

- **One overlay component, five contents.** The menu, the setup, the pause, the win and the handover are
  the same thing from the player's side: the game has stopped and is asking you something, and here are
  your buttons. `overlay-view.js` renders a description and calls no `t()`; `overlay-screens.js` builds
  the description. Same split as `card-view.js` and the two hand views, and for the same reason: the
  component stays one component while the number of screens grows. Whether it is the right seam is D38.
- **`match-flow.js` owns which screen is up, and it never enters the game state.** The rules know nothing
  about a pause and `createGameState` has no field for one. This is the same reasoning `skill-hand-view.js`
  already records for a half-finished card play.
- **Starting a match rebuilds the page.** The board's markup depends on the player count, so a
  two-player match has eight pawns where a four-player one has sixteen. Old elements go away with their
  jQuery handlers attached to them, which is what keeps handlers from piling up over a session of
  restarts.
- **The chrome and the overlay survive the rebuild, and one line makes that work.** `.empty()`
  deliberately unbinds every handler on the children it removes, so from the second match onward the
  menu and the handover rendered correctly and simply stopped responding to clicks. `.detach()` first is
  the fix. Worth carrying into the report: the symptom was silent, and it was a Playwright walk of the
  flow that found it rather than anything visible.
- **A test found a second one.** Quitting to the menu left the abandoned match mounted behind the menu's
  opaque sheet, so `.board .pawn` still resolved to eight elements while the player was on the main menu.
  Invisible, and wrong.

#### The handover, which is what makes a secret hand secret

Before this the rail flipped from one player's face-up cards to the next player's after a 320 ms timer,
with nothing in between. Once the Product Owner made an opponent's hand secret and only its count public
(decision D33), that stopped being acceptable: at one shared screen, secrecy is whatever covers the
screen while it changes hands.

- **The wait comes first, then the overlay.** The pause after a move is still read out of
  `--motion-capture` and a refusal still gets D9's four seconds, because a move has to finish animating
  and a refusal has to be readable **before** anything covers the board. The handover screen opens on
  the same timer that used to pass the turn.
- **`nextSeat` was exported from the turn manager** rather than the overlay walking `state.seats` a
  second time. Two answers to "who is next" would disagree the first time turn order changes.
- **`?fast=1` passes the handover without waiting**, which is the affordance that kept all ten older
  end-to-end specs running unchanged. It is the same compromise the flag already makes for the
  thirty-second reaction window, and `match-flow.spec.js` has one case that runs **without** it and
  asserts the gate.

#### `game-loop.js` was split three ways, and the seams were already there

It passed 300 lines (NFR-02) when the handover gate and the pause landed. Three files came out of it,
and none of them is a slice taken to make a number:

| File | Answers |
| --- | --- |
| `render.js` | What does the page look like for this state |
| `turn-controls.js` | What does a click on a dice card or a pawn mean |
| `game-loop.js` | What does the game do when nobody is clicking |

`turn-controls.js` in particular is the symmetric half of `card-controls.js`, which has done exactly that
job for card clicks since issue #34. The chrome moved out too, to `match-flow.js`, because the pause
button opens a screen the loop does not own. `REFUSAL_MIN_MS` went to `timers.js`, which is where the
game's named waits live and was the only thing left in the loop that was a duration rather than a step.

`match-flow.js` then hit the same limit and `page.js` came out of it on the same principle: what the page
consists of, against which screen the session is on.

### The pool the player is choosing from became visible: 2026-09-01, issue #30

The overlay got a sixth screen, `data-screen="pool"`: seven cards, one per denomination, each with how
many copies the pool holds, plus one sentence saying how many of the twenty are face down.

**The gap it closes is a rules gap and not a cosmetic one.** Every turn deals three dice cards and keeps
one (FR-18, FR-19), and that is only a decision because of what the pool holds: a D2 leaves the start
area half the time and a D20 one time in twenty (FR-09). Until this screen there was no way to see the
twenty cards behind the three. A player who had not read section 5.1 of the game design document was
choosing without the information the choice is made of.

| What | Where |
| --- | --- |
| The screen's content | `ui/pool-screen.js`, new, pure, unit tested |
| The card region on the overlay | `ui/overlay-view.js`, `.overlay__cards` with `data-count` |
| The dice card description, shared | `ui/dice-card.js`, new, extracted out of `dice-hand-view.js` |
| The two enums, jQuery-free | `ui/overlay-vocabulary.js`, new |
| The entry point | `ui/chrome-view.js`, a third always-present button |
| Interim CSS | `ui/styles/pool.css`, new, tokens only |
| The design request | `01-Design/Handoff/05-brief-dice-pool-overlay.md`, D43 to D47 |

- **A screen the player opens, and not counters in the HUD.** Pool and discard counters were considered
  for the HUD row on 2026-09-01 and dropped, so that sixteen numbers on screen do not become
  twenty-four. That decision closed the route of a number that is permanently there. It did not close
  this one: a screen costs no space until it is asked for, and it can show the seven cards rather than a
  number about them.
- **Rejected: the prose rules screen, S10 (FR-35).** It is a `should have` with no backlog issue and it
  would explain dice cards, skill cards and the leaving-start rule in words. Showing a composition table
  is both cheaper than describing it and clearer. If S10 is ever built, this is the part of it that
  already exists.
- **It is in the chrome row and not on the hand plate**, which is the nearer place for it, because the
  chrome is where a control reachable at any point in a turn already lives and the overview has to be
  reachable in the `choose` phase or it does not help the decision it exists for. Whether the hand should
  carry a second entry point is D47 of handoff 05, and the flow needs only the extra element.
- **Opening it pauses the match loop, exactly as the pause screen does.** The loop advances the `roll`,
  `reaction` and `turn-end` phases on timers of its own, so a player who opened the overview to think
  about three cards would otherwise come back to a turn that had moved without them. There is an
  end-to-end test for this and it is the same 600 ms check `match-flow.spec.js` gives the pause screen.
- **The close button reuses `OVERLAY_ACTION.RESUME` rather than a verb of its own.** `match-flow.js`
  already answers RESUME with "close the overlay and resume the loop", which is what closing this screen
  means. Rejected: a `CLOSE_POOL` action, which would have been a second name for one behaviour and two
  places to keep in step.
- **`quitToMenu` now clears `deps` as well as `state`.** Without it the overview could describe an
  abandoned match's pool from the main menu. It is one line and it was found by writing the test that
  the button is hidden there.
- **The seven cards come from `POOL_COMPOSITION`**, so FR-17 keeps its promise that the composition is
  one data definition. A screen with seven denominations typed into it would be a second definition, and
  it would go stale silently the first time the pool was reweighted. Both the unit test and the
  end-to-end spec import that table rather than restating it.

#### Two extractions, and the second one uncovered a testability defect

`diceCard(faces)` was private in `dice-hand-view.js`. It is now `diceCardDescription(faces, { tags })` in
its own `ui/dice-card.js`, because the overview needs the same card plus a copy-count tag. **Rejected:
exporting it from the hand view.** The overview is not part of the hand and has no business importing
from it; they render the same component for two unrelated reasons. Same seam as `player-labels.js`, which
the HUD, the overlay and the board all use without importing each other.

The second extraction is the one worth the report. `OVERLAY_SCREEN` and `OVERLAY_ACTION` moved out of
`overlay-view.js` into `ui/overlay-vocabulary.js`, and the reason is a **defect that had been invisible
since the overlay was written**:

- `overlay-view.js` imports jQuery, and jQuery throws on import when there is no `document`.
- `vitest.config.js` runs unit tests with `environment: "node"` **deliberately**, so that a module in
  `core/` or `state/` reaching for the DOM fails the run (NFR-01).
- So **anything importing `overlay-view.js` could not be unit tested at all**, including
  `overlay-screens.js`, which is pure and does nothing but describe screens.

Nobody noticed, because `overlay-screens.js` had no unit test to fail. It was covered through Playwright
like the rest of `ui/`, which is the right default, and it hid the fact that a pure function had been made
untestable by an import it did not need. `pool-screen.js` made it visible on the first try: the test file
failed with "jQuery requires a window with a document" before a single assertion ran.

**Rejected: giving these tests a DOM environment.** The `node` environment is a real guard and trading it
for one corner's convenience would weaken NFR-01 to make a test easier to write. `overlay-view.js`
re-exports both tables, so nothing that already imported them from there had to change.

**The general form, and it is the second time this pattern has been recorded:** an untestable pure
function is a sign of an import that is not needed, not a reason to weaken the test environment. The
first time was `data-die` on 2026-08-30.

#### Negative finding: the fifth stylesheet in a row that Claude Code should not have written

`pool.css` composes only existing tokens, sets no colour at all, and its one size factor is `0.62`, the
skill hand's existing `--card-u` out of `hand.css` rather than a new value. Its header says all of that
and names D43 to D46 as what is owed.

**That makes five: `prompt.css`, `hud.css`, `chrome.css`, `overlay.css`, `pool.css`.** Each one was
written the same way and for the same reason, that the feature had to ship before the sprint ended, and
each one is recorded rather than hidden. It is no longer an incident and it should be named in the
retrospective as a process finding: **the handoff loop is slower than the implementation loop, and the
project has never once scheduled the design request before the code that needs it.** Handoff 05 was
written before a line of this issue's `ui/` code, which is the first time that order has held, and it
still did not help, because the spec cannot arrive in the same session.

**One thing in `pool.css` is a correction to a delivered spec rather than a placeholder**, and it is
flagged in the file. `card-view.js` writes `data-playable="false"` on a card nobody can play, and
`card-state.css` washes such a card out with `filter: saturate(0.5)`. On a hand that is correct and it is
D29: a card you cannot play right now should recede. On the overview it states something false, because
those seven cards are not unavailable, they are the pool. So the wash is taken back off. **Rejected:
describing the overview's cards as playable**, which would have been the worse lie: it adds a pointer
cursor and a hover lift to a card that does nothing when clicked.

### Three briefs open at once needed an index, and writing it found a dropped file: 2026-09-01

`01-Design/Handoff/00-open-requests.md`. Not a brief and not a spec, so it breaks the numbered-pair
convention deliberately and says so in its own first section. It is a cover sheet: which requests are out,
which files each owes, in what order they are best answered, and every open decision from D16 to D47 in one
table with a column for whether it blocks a requirement.

**Why it was needed.** Three requests are outstanding at the same time, two of them sent on the same day,
and the handoff loop as [01-Design/README.md](../../../01-Design/README.md) describes it has no place to
record that. A brief with no spec looks identical in a directory listing to a brief whose spec has landed.

**What it found, and this is the point of the exercise.** `src/ui/styles/chrome.css` declares itself a
placeholder and names D42 of handoff 04 as what is owed. **Brief 04's deliverables table does not list
it.** Brief 05 lists it only conditionally, "only if D46 restructures the row". So a spec answering D42 in
prose while leaving the placeholder stylesheet in place would have passed all five landing checks and
looked complete, and nobody would have noticed until somebody read the file's own header again. It is
requested explicitly in the work order now, and the file's header points at that request.

**Two smaller things fell out of the same read:**

- **Handoff 02 never received a spec at all**, and that had not been recorded as a state anywhere except in
  passing inside brief 04 § 5.1. Eight decisions have no answer: D16, D17, D20, D21, D22, D23, D24, and
  D18 which was re-asked as D40. **D16 is NFR-12**, telling four seats apart without colour, and it is the
  only open design question in this project that blocks a requirement at all. (It was recorded here as a
  `must have`, which is wrong: NFR-12 is `should have`. Corrected in 01-requirements-and-goals.md.)
- **`chrome.css`'s header was stale**, and it was stale because of the previous commit rather than
  someone else's: it still described "the two controls" after issue #30 added a third button to the row.
  Corrected. Worth one line in the report, because the header of a placeholder file is the only place its
  design debt is written down, so a stale one is worse than a stale comment elsewhere.

**The count was five placeholder stylesheets** when the work order was written, in the order they appeared:
`prompt.css` 183 lines, `hud.css` 167, `overlay.css` 185, `chrome.css` 88, `pool.css` 92. Every one composed
existing tokens only and said so at the top. The pattern behind them is written up under issue #30 above:
the handoff loop is slower than the implementation loop, and the design request has been scheduled before
the code that needs it exactly once.

**Four of the five were replaced the same evening**, once the work order went out. That is the fact worth
keeping about the work order: the omission it found, `chrome.css`, came back as a 153-line delivered
stylesheet rather than as a paragraph of prose, which is what would have happened without it.

### Design handoff 04 landed, and four of the five placeholders are gone: 2026-09-01

**What arrived.** One spec, `04-spec-hud-menus-and-handover.md`, 437 lines, answering D35 to D42 plus D16,
D20 and four unnumbered items owed since spec 03 § 5. With it: five replacement stylesheets, five amended
ones, and a rendered mockup that is not production code.

| File | Before | After | What it is |
| --- | --- | --- | --- |
| `prompt.css` | 183 | 244 | Replaced. The strip moved into the rail, and it gained the countdown ring |
| `overlay.css` | 185 | 228 | Replaced. Two sheet modes, veil and curtain |
| `handover.css` | did not exist | 89 | New. A split of `overlay.css`, not a sixth component |
| `hud.css` | 167 | 173 | Replaced |
| `chrome.css` | 99 | 153 | Replaced. **The file no brief asked for**, see the work order above |
| `tokens.css` | 223 | 230 | Amended. 17 tokens added, one reverted, none removed or renamed |
| `app.css` | 131 | 113 | Amended. Two rows fewer, and it got *shorter* |
| `hand.css` | 143 | 153 | Amended. Two factors reverted, plus the empty slot |
| `refusal.css` | 38 | 49 | Amended. Off the grid and onto the board |
| `pawn.css` | 167 | 166 | Amended. The pawn dim removed |

**`pool.css` is the one placeholder left**, and the count went five to one. It belongs to handoff 05, whose
brief was sent on the same day and has had no spec back.

#### The answer to D35 is the one worth a paragraph, because it inverted the trade

Issue #39 had shrunk the board by nine per cent and both hand cards by nine per cent to buy the HUD and the
chrome a grid row each. `tokens.css` and `hand.css` both carried a comment saying the change was forced by a
measurement rather than chosen, and both asked D35 to confirm or overrule it. **D35 overruled it, and the
reason is that the wrong thing had been cut.**

The two new rows had to cost something. What issue #39 spent was the board and the cards, which is the part
of the screen the game happens in. What D35 spent instead was the **foot of the page**, which held 148 px
for two strips that are usually saying nothing:

- the **refusal strip** hangs off the bottom edge of `.app__board` now, absolutely positioned. A refused
  move is a fact about a pawn, so the message sits over the pieces it is about. It costs no grid row and it
  still cannot make the page jump, which is what D9 gave it a permanent row for.
- the **prompt strip** became the third plate in the rail, under the skill hand. It asks about cards, and it
  had been asking from the far side of the page. At `data-mode="none"` it is `display: none`, so the rail
  gives the height back to the board column.

Measured in the mockup at 1440 by 900, worst case with the prompt up: **882 px of 900**. With no prompt up,
811. So both reverted values went back: `--board-size` to 44vw, the two `--card-u` factors to 0.76 and 0.68.

**The carry-forward fact is that the rail, not the board, now sets the height of the board row, with 18 px
of headroom.** The next region added to the rail is the first one that costs the board its size. That is a
sentence worth having in the report, because it is a constraint nobody would find by reading the CSS.

#### The one ordering requirement, and it was a real leak

D39's answer to the handover is that the sheet is opaque in the frame it first exists, in both motion
preferences, and that **only the panel is animated**. An animated curtain is a curtain that is briefly open,
and at a shared screen the next player sits close enough to read five cards in 200 ms.

The spec's § 5 states one ordering requirement: `data-open="true"` has to be written **before** the rail is
re-rendered for the arriving seat, because no CSS can cover a frame that has already been painted. Checking
it found the mirror-image defect on the way out:

```js
// Before
if (action === OVERLAY_ACTION.READY) {
  openScreen(OVERLAY_SCREEN.NONE);   // curtain down
  loop.passTurn();                   // rail rewritten for the new seat
}
```

`passTurn` is what re-renders the rail, so the curtain came down over the **leaving** player's five skill
cards and then flipped. One painted frame of exactly what D33's secrecy rule and the whole handover screen
exist to prevent. The two lines are swapped now, guarded so that a `passTurn` which ends the match does not
have its win screen replaced by an empty one.

**It is tested rather than asserted**, and the test is worth describing because a single frame is not
something a Playwright assertion can look at. `tests/e2e/handover.spec.js` installs two MutationObservers
that push to one array, and the array is the evidence: `data-seat` on the rail has to appear before
`data-open="false"` on the overlay. Both writes happen in one synchronous handler, so the order in the log
is the order in the code and nothing about the test depends on timing.

#### D40 took the win message off the refusal strip, which closes a defect this chapter recorded

The strip is `--color-warn` orange and `--color-warn` means the game has refused something. Announcing a win
in it was recorded here under issue #39 as a known defect, together with the fact that one message was being
said in two places. D40's answer: **the overlay says it and the strip says nothing.** `move-hints.js` lost
both status branches, and `winScreen` gained `outcome`.

`data-message-kind` stays even though the strip now has exactly one kind left, because it is the seam the
region is told apart by and removing it would change two end-to-end specs for no gain. Recorded as a
deliberately dead attribute rather than left to look like an oversight.

#### Three attributes were asked for by name rather than styled around

Brief 04 § 2 asks the designer to name any element the DOM contract does not promise instead of styling
around its absence, and the spec did exactly that three times. All three are one line of jQuery each:

| Attribute | On | Why CSS could not do it |
| --- | --- | --- |
| `data-player` | `.app__chrome` | D36 puts the seat's colour and its D16 shape on the turn sentence, and there was nothing to key them off |
| `data-outcome="won\|abandoned"` | `.overlay` | A win and an abandoned match both arrive at `data-screen="win"`; nothing in the markup told them apart |
| `data-paused="true"` | `.app` | The reaction countdown is a CSS animation and an animation cannot pause itself. FR-07 puts pause inside the reaction window |

**`data-player` failed its own test on the first run, and the reason is a fact about `ui/`.** Two files write
the chrome: `match-flow.js`'s `drawShell` on a screen change, and `render.js` on every render. `drawShell`
was passing the seat and `render.js` was not, so a running match cleared the attribute a few times per turn.
It is the same shape as `canPause`, which `render.js` also leaves at its default. Two writers of one element
with different argument sets is a seam worth naming in chapter 12: whatever either of them omits, the other
one erases.

#### D16 is answered and is the only item that moved a `must have`, and it is still not closed

A shape per seat, as a clip path rather than a glyph: no font dependency, nothing readable, nothing a
translator is handed. Circle, triangle, square, diamond, as `--seat-shape-0` to `--seat-shape-3`. Applied to
the HUD seat plate, the chrome turn sentence, the win panel and the handover panel.

**`greyscale.spec.js` is still marked expected-to-fail, and honestly so.** NFR-12 is measured on the pawn,
and the mark cannot go on the piece without `.pawn__mark`, an empty `<span>` inside `.pawn`, which the
contract does not promise. The spec names it and estimates fifteen lines of `pawn.css` after that. **Those
fifteen lines were not delivered**, so the follow-up is owed and the requirement is still unmet.

Removing the pawn dim under D36 helps the measurement without settling it. That is worth its own note: the
dim was one of four cues for "whose turn is it", and it was the only one that touched all sixteen pieces, so
it was spending contrast on every pawn that was not the active seat's, which is the exact budget NFR-12 has
none of.

#### D20 moved a duration out of JavaScript and into the design

`REFUSAL_MIN_MS = 4000` in `timers.js` was the only duration in the game that was not in `tokens.css`, and
its own comment said so and asked for it to be raised in the next handoff. It is `--motion-refusal-hold: 4s`
now, and `game-loop.js` reads it with the `motionMs` helper that already reads `--motion-capture`. The
constant survives as the fallback for a harness with no stylesheet loaded.

This is the smallest answer in the spec and the clearest example of what the round trip is for: one line of
CSS, and a number stopped living in two layers at once.

#### What landing the delivery cost, and one thing it nearly cost silently

**The delivered `board.css`, `card.css` and `card-state.css` were not copied in, and copying them would have
been a silent regression.** The README lists all three as "unchanged, included so the mockup runs". Two of
them differ from the repo only in Prettier formatting. `board.css` does not: the delivery ships a 269-line
pre-split copy, and the repo's version was split into `board.css`, `board-track.css` and `board-regions.css`
for NFR-02. Copying the folder wholesale would have reverted that split and left two orphaned files.

**The check that caught it was diffing every delivered file against the repo before copying any of them**,
including the ones declared unchanged. That is the fact worth carrying: a delivery is a snapshot of a working
tree at some moment, and "unchanged" means unchanged since the designer took the snapshot, not unchanged
against the branch it is being applied to.

Everything else landed as delivered. Every file was under 300 lines after `npm run format`, which is the
first time a handoff has managed that without a split: the spec says every file is written one declaration
and one selector per line, which is the shape Prettier produces. `board.css` went 248 to 407 two handoffs
ago for the opposite reason.

**One thing did get split, in the tests.** `match-flow.spec.js` reached 331 lines and went over NFR-02, so
the handover moved into `tests/e2e/handover.spec.js`. The seam is the one the spec itself used to split
`handover.css` out of `overlay.css`: the four other screens ask the player something and wait, and the
handover is the one with a secrecy rule behind it.

#### A negative finding: the abandoned win screen cannot be reached from the interface

D40 draws two screens, a win and an abandoned match, and `overlay.css` styles both. `abandonMatch` in
`state/match.js` sets `MATCH_STATUS.ABANDONED` and **nothing in `ui/` calls it**: the Quit button on the
pause screen goes straight back to the menu. So `data-outcome="abandoned"`, the muted title and the
`match.abandoned` string in both locale files are all live, tested at the unit level in
`tests/unit/ui/overlay-screens.test.js`, and unreachable by a player.

It is not a defect introduced here, and it is not one this commit should fix: what "giving a match up" is
supposed to be, a return to the menu or a recorded outcome, is a rule question and not a styling one. It is
recorded because a styled, translated, tested screen that no player can reach is exactly the kind of thing
that reads as finished in a report.

### Brief 06 sent, and the pawn got the element it was waiting for: 2026-09-02, NFR-12

- **What went out:** [06-brief-pawn-mark.md](../../../01-Design/Handoff/06-brief-pawn-mark.md), asking for
  the seat shape on the piece. Three decisions, D48 (size, placement, and what happens to the eyes of
  D14), D49 (the mark through the five pawn states) and D50 (what happens to the luminance-only
  measurement in `greyscale.spec.js` once a shape exists). It is the follow-up spec 04 § 5 named as "one
  `<span>` and about fifteen lines", and it is the first brief with no board issue behind it: NFR-12 has
  none, and the design system epic #3 it extends was closed on 2026-08-30.
- **What changed in the code, ahead of the answer:** `board-view.js` now builds every `.pawn` with an
  empty `<span class="pawn__mark">` inside it. The pawn's two pseudo-elements were both taken, `::after`
  by the body and `::before` by the state ring, so the mark had to be a real element. It is a DOM
  contract change and not a design rule: it says an element exists, not what it looks like. A new case in
  `tests/e2e/board-renders.spec.js` asserts one mark per pawn with no text in it. Nothing is visible.
- **Why the brief went out before the closeout work rather than after it.** The remaining Sprint 2 work
  (board hygiene, the #40 decision, the documentation sweep, the merge) does not touch `src/ui/styles/`,
  and the two open briefs cannot be answered from this side. Sending first and working in parallel is the
  same lever the Sprint 2 plan used for handoff 01, and it is recorded in the work order.
- **The work order was re-ordered:** 06 before 05, because 06 closes a requirement and 05 a preference.
  `00-open-requests.md` carries the new order at the top and keeps the old one struck through, so the
  reasoning of 2026-09-01 stays readable.
- **What the brief says the test will become**, so that the spec is written against the assertion: one
  mark per pawn with a non-zero box, the same computed `clip-path` within a seat and a different one
  across seats, both holding under `filter: grayscale(1)`. The 1.146 luminance figure moves into the notes
  as history unless D50 keeps it.
- **Still open, unchanged:** `pool.css` as the last placeholder, handoff 05's D43 to D47, and D17, D21 to
  D24 from handoff 02.

### Handoffs 05 and 06 landed together, and the last placeholder stylesheet is gone: 2026-09-02

Both specs came back in one delivery, in the order the work order asked for: `06-spec-pawn-mark.md`
answering D48, D49 and D50, and `05-spec-dice-pool-overlay.md` answering D43, D44, D45 and D47. Four
files landed, `pool.css`, `pawn.css` and the two specs, and the package's own README named which
stylesheets it had copied only so the mockup would run.

**The design loop is closed.** Five stylesheets in `src/ui/styles/` were written by Claude Code and
should not have been, and as of today **none of them is left**: `prompt.css`, `hud.css`, `chrome.css`
and `overlay.css` went with handoff 04 and `pool.css` with handoff 05. Every rule in the project's CSS
now comes from a numbered decision in a spec, which is the state chapter 04 has been describing as a
target since 2026-08-30.

**What the pawn mark is, and why ink rather than the seat colour.** `.pawn__mark` is an absolutely
positioned span at 38 % of the piece, clipped to the seat's shape and filled with `--color-ink`. It sits
between 48 % and 86 % of the disc's height, below the eyes, which occupy 19 % to 41 %. This is the one
place in the game where the mark is **not** the seat colour: on a HUD plate the ground is neutral and the
mark has to carry the seat, but on the piece the ground is already the seat colour, so the seat is said
by the disc and the mark only has to be legible against it. The spec measures 3.67:1 at the worst seat in
Picnic against 2.74:1 for the same four shapes on the HUD, which is the argument for measuring NFR-12 on
the piece rather than anywhere else.

**The mark takes part in none of the five pawn states, and that is a decision (D49).** It inherits the
piece's transform, so it scales with `data-selected` to 1.14 and dims with `data-captured` to 0.82 and
70 % opacity; the breathe loop and the focus ring both sit on `::before`, outside the disc, and never
reach it. The one number that does not clear 3:1 is the capture state at about 2.16:1, and the spec keeps
it: it lasts 320 ms, collapses to 1 ms under reduced motion, and describes a pawn that is leaving the
board. **The negative finding is recorded rather than rounded away**, which is what makes the rest of the
table trustworthy.

**Four repeats of the seat-to-shape mapping now exist**, in `hud.css`, `chrome.css`, `overlay.css` and
`pawn.css`. The spec names the fix and deliberately does not do it: `board.css` already has one bare
`[data-player="N"]` block that supplies `--player`, and `--seat-shape` belongs in it. It was left out
because `board.css` has since been split three ways and a delivery touching it has to be read against the
split rather than against a snapshot. Worth one sentence in the report about a known duplication carried
on purpose with the reason written down.

**The pool overview: the copy count became a shape (D44).** The number stays in the third tag, because it
is a locale string and NFR-03 keeps it out of the CSS. What the tag cannot say is the proportion, so the
card is also drawn as the pile it stands for, one hard-shadow sheet per copy behind the top card. A W6 or
a W8 stands on four sheets and a W2 on two, so the middle of the pool is visibly twice the thickness of
its ends before a single word is read. The weighting of the pool, which is the whole reason the screen
exists, is legible without reading.

**Seven cards at 0.68, four then three, centred (D43).** The placeholder guessed 0.62, which D35 had
already ruled out as the point where the kind pill drops under 9 px. The panel is 54.5rem because four
cards at 11.05rem plus three gaps plus the stack's lean plus the padding come to 53.98rem, so the wrap
after the fourth card is arithmetic rather than a consequence of the viewport. The container is flex and
not grid for one reason: `justify-content` centres a short final row and four fixed columns cannot.

**Two DOM changes the specs asked for by name, both wired rather than styled around:**

- **`data-copies` on the overview card**, an integer, the same number the third tag states in words.
  `pool-screen.js` passes `copies` and `card-view.js` writes it through the same `IDENTITY` table every
  other identity attribute goes through. A card in a hand has no `copies`, so the attribute is absent and
  the card draws as a single card, which is the right failure.
- **`tabindex` is now conditional on the card being playable.** It used to be keyed on the card having an
  id, which took empty skill-hand slots out of the tab order (spec 04) but left seven unplayable pool
  cards in it. Spec 05 section 5 called that wrong and it is: seven tab stops sat between a keyboard user
  and the one button that closes the panel, and `Enter` did nothing on any of them. One rule now covers
  both cases, since an empty slot is never playable.

**D47 was answered no, and the reason is about timing rather than cost.** The overview does not open from
the dice hand. The cost of the second door is paid at the wrong moment: FR-19 puts the game's central
decision on the dice plate, and a control there offers the player to leave the choice and read a table.
The chrome row is far enough away to be deliberate. `hand.css` is untouched, and the spec names the one
element to add if the Product Owner disagrees.

**Still open after this delivery, and the list is short:** D17, D21, D22, D23 and D24 from handoff 02,
which still has no spec of its own, and the fonts still loading from Google Fonts since spec 01 section 5.
None of them blocks a requirement.

### Brief 07 sent, and it is the first one that is about a preference rather than a requirement: 2026-09-02, issue #45

[07-brief-trap-marker.md](../../../01-Design/Handoff/07-brief-trap-marker.md), D51 to D60. The design loop
had been empty for a few hours, since handoffs 05 and 06 landed the same day.

**What it asks for and why it exists.** The trap mechanic shipped with epic #38 on 2026-08-31: objects sit
on the shared track squares, they fire when a pawn crosses them, and one of them refuses a move outright.
**Not one file under `src/ui/` reads `state.traps`.** So the game has been enforcing rules the player
cannot see. Issue #45 rebuilds those rules to match the Game Design Document and, on the Product Owner's
decision, makes every trap and blocker public with its owner shown, which turns an invisible rule into a
rendering job.

**FR-30 is a `could have`, so this brief blocks nothing.** That is worth recording because every brief
since 02 has been able to claim otherwise, and brief 06 closed the last requirement-blocking design item
in the project. This one is a preference, and it is being asked anyway because the alternative is shipping
a mechanic the player has to infer.

**One deviation ships before the brief is answered, deliberately.** A trap firing has to be announced: the
new Banana Peel applies a status instead of moving the pawn, so without a message the player commits a
move, sees the pawn arrive exactly where they aimed it, and silently loses their next turn. The only
message region that exists is the D9 refusal strip, painted in `--color-warn`, the colour the game
reserves for "you cannot do that". A trap going off is not a refusal, and announcing it in orange repeats
the defect D40 fixed when it took the win message out of that strip.

It ships in the wrong colour anyway. Three options and what each costs:

| Option | Cost |
| --- | --- |
| **Ship the announcement in the refusal orange** (chosen) | The hue is wrong until D55 lands. Cosmetic debt with a brief already open against it |
| Wait for handoff 07 | A Banana Peel eats a player's turn in silence for as long as the wait lasts, which is a bug and not a preference |
| Invent a third, neutral treatment | `CLAUDE.md` forbids this side from taking a design decision, and this is squarely one |

The seam it uses was already there and unused: `showMessage` has always written both `data-reason-key` and
`data-message-kind` on the strip, and `refusal.css` reads only the first. So `data-message-kind="trap"`
costs no new markup, and D55 has a hook to answer into.

**Everything else about the issue ships without waiting**, on the D27 pattern the correction below is
about: `data-trap`, `data-trap-kind`, `data-trap-aura`, the owner's `data-player` on a new
`.square__trap` span, `data-statuses` on every pawn, and a Playwright suite that asserts all of them.
Unstyled and invisible, which is the honest position, and the same one `data-skill-square` held for a day.

### The board learned about traps, and the strip got a second kind of message: 2026-09-02, issue #45

Five things landed together. The first is a new module, the last two are gaps that had been open since
the features they belong to shipped.

#### `board-marks.js`, and why it is not `board-view.js`

`board-view.js` was at 252 lines with one mark in it, `markSkillSquares`, and this issue adds three
more plus the pawn statuses. The seam is not the line count, and stating it properly is what makes the
split worth having: **`board-view.js` renders the board's own shape**, the grid, the four regions and
where each pawn is, all of which comes from `board-geometry.js` and the pawn list. **`board-marks.js`
renders what cards have put on the board.** Different source, changes for different reasons.
`markSkillSquares` moved across with the new three, so `updateBoard` makes one call and
`board-view.js` came out at 248 lines rather than growing.

#### The trap mark had to be a real element, and both pseudo-elements were the reason

`.square` has `::before` and `::after` and both were already spent: `::before` is D27's teal skill
diamond, `::after` is the turn-off bar on squares 9, 19, 29 and 39. **All four of those are legal trap
targets**, so a trap mark could not borrow either. There was no third layer to give it.

So every one of the 40 track fields now carries an empty `<span class="square__trap">`, built once with
the board. That is exactly the situation handoff 06 hit on the pawn and solved with `.pawn__mark`, and
the reason it is built once rather than created when a trap appears is D10: `updateBoard` writes
attributes and never creates an element, because a mark created at the moment it becomes visible has no
previous state for a transition to run from.

#### Four attributes, and why not one

| Attribute | Answers |
| --- | --- |
| `data-trap` | `trap` or `blocker`, the **behaviour**. A single-use surprise versus a wall that refuses a move for three rounds. This is what D52 keys off, and a fifth kind of object is a line in `core/traps.js` and no CSS at all |
| `data-trap-kind` | Which of the four objects, for the per-kind mark of D51 |
| `data-trap-aura` | This field is inside an It's Not That Deep's reach, so an offensive card aimed here does nothing. D58 decides whether it is drawn |
| `data-player` on the span | The owner. It goes on the span and not the field because `board.css` already turns `[data-player]` on **any** element into `--player` and `--player-soft`, so a `data-trap-owner` would have needed its own four-block mapping and repeated the seat table a fifth time, which spec 06 already flagged |

The owner's accessible name comes from `seatLabel` and not from `owner + 1`. That is not a detail: a
two-player match seats its players on 0 and 2, so a seat plus one announces "Player 3" for the second
of two players. `player-labels.js` exists because four places got that wrong at once, and this was very
nearly the fifth.

**The words live in an `aria-label` on the span.** NFR-03 forbids a user-facing string in a CSS
`content:` property, and a coloured shape on a square is nothing at all to a screen reader (NFR-08), so
the object's name and its owner are written there from i18next.

#### `data-statuses`: one whitespace list, not eight booleans

A pawn can carry several statuses at once, so locked plus armoured plus slippery is ordinary. Eight
per-kind boolean attributes would be eight write-and-remove pairs per pawn per update, and CSS matches
a whitespace list natively with `[data-statuses~="stunned"]`, which is what that operator is for.

**Nothing was shown for any status before this.** A held pawn was simply a pawn without `data-movable`,
and the only words a player got came from the turn-level refusal, and only when *every* pawn had been
refused for the same reason. A single held pawn among three movable ones was silent. Issue #45 creates
`stunned`, and a stunned pawn losing a turn with no mark and no message would be the game taking a turn
away without saying so. All eight kinds go into the DOM in one pass so the attribute is written once;
D56 and D57 cover the two this issue is about and brief 07 lists the other six as owed.

`STATUS.PURGE` is deliberately absent: it applies to the whole board rather than to a pawn, so it
belongs on `.board`, and it has no mark anywhere either.

#### The announcement, and the colour it ships in

A trap moves a pawn, or takes a turn away, **without the player having asked**. Under the new rules
Banana Peel is the extreme case: the pawn arrives exactly where it was aimed and silently loses its
next turn, so with no message the game simply eats a turn.

The seam was already there and unused. `showMessage` has always written both `data-reason-key` and
`data-message-kind` on the strip, and `refusal.css` reads only the first. The previous version of that
comment said `kind` was being kept even though the strip had one kind left, because removing it would
change two end-to-end specs for no gain. **Issue #45 gave it a second kind and vindicated that**, so
`data-message-kind` is now load-bearing rather than vestigial.

**It ships in `--color-warn`, the colour the game reserves for "you cannot do that", and that is
wrong.** A trap going off is not a refusal: the player did nothing incorrect. Announcing it in orange
repeats exactly the defect D40 fixed when it took the win message out of that strip. Three options and
what each costs:

| Option | Cost |
| --- | --- |
| Announce it in the refusal orange (chosen) | The hue is wrong until D55 lands. Cosmetic debt with a brief already open against it |
| Wait for handoff 07 | A Banana Peel eats a player's turn in silence for as long as the wait lasts, which is a bug and not a preference |
| Invent a third, neutral treatment | `CLAUDE.md` forbids this side from taking a design decision, and this is squarely one |

**Two state fields make the message possible**, and both exist because the evidence is what is missing.
`trapFired` names the object that went off: a fired trap has been removed from the list and a Banana
Peel does not move the pawn, so afterwards the board looks exactly as it would if nothing had happened.
`nullifiedCard` names a card an aura cancelled, which is the same problem in a different place. Neither
can be derived, which is why `core/enter.js` reports rather than the view reading back.

**And the message has to survive long enough to be read**, which is why `pauseAfterTurn` moved into
`timers.js` as `holdAfterTurn`. The loop decides *that* it waits, `timers.js` decides *how long*, and
that module already owned every other named wait in the game. A trap or a nullified card now gets the
same long hold D20 gave a refusal. Otherwise the handover screen covers the board on the ordinary move
timer, while the only evidence is still on screen.

**One limitation, recorded rather than solved:** a trap fired by a **card** resolves mid-turn, the loop
carries straight on, and that announcement gets no guaranteed time on screen at all. Whether the game
owes the player a pause there is D60.

#### No field on the board was reachable from the keyboard at all

`bindPickEvents` bound `click` on a pickable field and no `keydown`, and nothing gave a field a
`tabindex`. Pawns and cards each got a keyboard pair when they became clickable; fields were missed.

That was survivable while one card in 29 pointed at a field. Issue #45 makes it five cards and four of
them are the trap cards, so **a keyboard player could not play a trap at all**. Both pairs are bound
now, and `target-picker.js` adds the `tabindex` only while a field is actually pickable: forty
permanent tab stops on the board would sit between a keyboard user and every control on the page, which
is the defect spec 05 found on the pool overview. NFR-08. What a focused field looks like is D59, and
nothing is styled yet.

#### What renders today: nothing

Every attribute above is in the DOM and unstyled, because D51 to D60 are open and `CLAUDE.md` forbids
this side from answering them. That is the D27 pattern the correction below is about, applied on
purpose the second time: a Playwright suite can assert the whole mechanic now, and when the spec lands
it is a stylesheet rather than a rewrite. The announcement is the one exception, because text is not a
look.

### A correction: this chapter said the skill square was invisible for two days after it was not: 2026-09-02, issue #45

The section "Two attributes joined the DOM contract, and one of them is invisible on purpose" is dated
2026-08-31 and was true when it was written. **It stopped being true the same day.** D27 was answered in
[03-spec-cards-and-hands.md](../../../01-Design/Handoff/03-spec-cards-and-hands.md): the skill square is a
mark and not a fill, an ink-outlined teal diamond inset 24 per cent, stepping back to 30 per cent on a
square that is also a legal target so that the target ring stays the widest thing on the field. Teal
rather than the purple the earlier material described, because violet is `--color-hint` and every
legal-move highlight and focus ring already uses it. It has shipped in `board.css` ever since.

**The claim survived in two places for two days**: that paragraph, and the doc comment on
`markSkillSquares` in `src/ui/board-view.js`, which said in so many words that the stylesheet reading the
attribute did not exist. Both are corrected in the commit that carries this entry. The original paragraph
is marked rather than deleted, because the pattern it describes is the useful part.

**Why this is worth a chapter entry rather than a silent edit.** It is the first case in the project of a
note going stale by being *overtaken* rather than by being wrong, and it found itself only because issue
#45 went looking for a precedent to copy. Two lessons, and the second is the one for the report:

1. **A note that describes a blocker needs revisiting when the blocker clears**, and nothing in the
   process prompted that. The design loop's own index, `00-open-requests.md`, was updated correctly on the
   day; the chapter note was not, because the two are updated by different steps.
2. **The pattern the stale paragraph described is exactly right and is now used a second time.** Put the
   attribute in the DOM, let the stylesheet wait for the decision, and neither side has to guess. Issue
   #45 ships every trap attribute that way, unstyled, against handoff 07. So the paragraph was worth
   keeping and its claim was worth marking, which is why it is a quotation with a note on top and not a
   deletion.

### Handoff 07 landed, and two of this chapter's own deviations closed: 2026-09-03, issue #45

**All ten decisions came back, D51 to D60.** The package was five stylesheets: `board.css` amended,
`board-trap.css` new, `pawn.css`, `refusal.css` and `tokens.css` amended. It read against the same tree
handoffs 05 and 06 landed on and said so, which is the rule added after handoff 04. Checked on arrival: no
em dash anywhere in the spec, the README or the five files; every token it reads already existed; no file
over 300 lines, `pawn.css` closest at 283; nothing added to a `content:` property.

**The trap is drawn as a pawn, and that is the answer worth recording.** D51 and D53 gave the object the
piece's own construction: a body in the owner's seat colour, a hair ink edge, the seat's shape in ink
inside it, the hard offset shadow underneath. A trap is a thing standing on the board that belongs to a
player, which is what a pawn is, so the game has one grammar for that and reuses it. Two consequences the
spec draws out and neither is obvious: a player learns nothing new, and the greyscale measurement spec 06
made carries over unchanged instead of needing a second one. The blocker is the same object with two
variables changed, 76 per cent of the field instead of 30 and square corners instead of round, which makes
the size difference the whole message and needs no legend.

**The three trap kinds look identical, on purpose.** At 30 per cent of a cell, beside D27's diamond, inside
D7's ring and possibly under a pawn, a per-kind geometry is a distinction the player cannot read in the
moment they need it. What is worth reading at a glance is that something is there and whose it is, because
a trap does not fire under a pawn of the seat that placed it. Which kind it is stays in the `aria-label`.
That is a design answer that made the markup **simpler** than the side asking for it had assumed, which is
the opposite of how the round trip usually goes: `data-trap-kind` is now in the DOM and deliberately unread
by any stylesheet, and the spec's § 6 says so rather than leaving it looking forgotten.

**Two deviations recorded in this chapter are now closed.**

| Recorded | Closed by |
| --- | --- |
| The trap announcement ships in `--color-warn`, the colour reserved for "you cannot do that" | **D55.** Two declarations: the strip's ground becomes `--color-panel` and its dot `--color-ink` when `data-message-kind="trap"`. Orange with an orange dot is a refusal, the panel colour with an ink dot is the game reporting something that happened. Same box, same border, same position, so it is recognisably the same object saying a different kind of thing |
| A trap fired by a card gets no guaranteed time on screen | **D60**, and it needed code rather than CSS. See the next entry |

The `data-message-kind` seam is what made D55 cost two declarations instead of a component. It had been
written by `showMessage` and read by nothing since handoff 01, and the comment that kept it said only that
removing it would change two end-to-end specs for no gain. It is now load-bearing twice over.

**One element was needed and named rather than styled around**, which is the fourth time a spec has done
that (04-spec named three, 06-spec one). `.pawn__status`, an empty span after `.pawn__mark`, because a
stunned pawn changes the piece and a slippery one needs a tag, and the piece had nothing left to draw on:
both pseudo-elements are taken by the disc and the state ring, and `.pawn__mark` is the seat mark, which is
the one thing on the board that may not come to mean something else.

**The `--seat-shape` consolidation is the change in this delivery that fails with no symptom.** Five
stylesheets each held their own copy of the four `data-player` to `--seat-shape` rules. 07-spec moved the
mapping into the single unscoped `[data-player="N"]` block in `board.css` and deleted the copies, which is
the follow-up 06-spec § 6 named. Every consumer inherits it now, including the HUD and the chrome, which
sit outside `.board`. **If that inheritance ever breaks, the game keeps rendering:** every consumer falls
back to the `circle(50%)` in its own `clip-path` declaration, so four seats become four identical circles
and NFR-12 is quietly broken. No assertion in the suite would have noticed, because every clip-path check
was on `.pawn__mark`. `greyscale.spec.js` gained a case for the HUD, which is the consumer on screen in
every match. That is the cheapest insurance available against the only silent failure in the drop.

### D60 was the one answer that needed code, and it is a wait nothing on screen reports: 2026-09-03, issue #45

Nine of the ten decisions were stylesheets. **D60 was a behaviour change**, and it is the only part of
handoff 07 where the design asked the view to do something rather than to stop drawing something.

**The problem it fixes, traced rather than assumed.** `state.trapFired` survives a phase change; it is
cleared only by `clearedTurnFields()` when the turn ends. So the announcement is not lost by time passing.
What loses it is the **next** `resolveMove`, whose `trapChanges` always writes a fresh `trapFired`, and
that is `null` on almost every move. After a card is played the loop's `advance()` runs straight on, skips
the action phase, rolls the die and reaches `act`, where the pawn hints appear. A player who commits a
move inside two seconds empties the strip themselves.

The dice-move case never had this problem, because `holdAfterTurn` already holds the finished turn before
the handover screen covers it. The card case had no wait of any kind.

**Where the wait went, and the seam it kept.** `timers.js` gained `holdMidTurn` beside `holdAfterTurn`,
because that module already owned every named wait in the game and its header states the division: the
loop decides *that* it waits, `timers.js` decides *how long*. `card-controls.js` gained one `carryOn`
function that replaced all four of its `resume()` calls, because a trap can fire on two different resolve
paths (`playActionCard` resolves immediately when no reaction window opens, `closeWindow` resolves the
played cards when the window shuts) and more than one call site can produce an announcement.

**Three details, each of which was wrong in an earlier draft, and all three are the kind that would have
shipped silently.**

1. **`refresh()` has to come first.** `apply` changes the state and draws nothing, so a bare delayed
   `resume()` holds for two seconds with the strip not yet on screen at all. That is worse than no hold.
2. **A zero hold has to be no hold, not a zero-millisecond timer.** `?fast=1` overrides the duration to 0,
   and `timers.set(..., 0)` defers `advance()` to a macrotask. Every end-to-end spec in the suite was
   written against the ordering this file has today, so the zero case resumes synchronously.
3. **One announcement is held once.** Because `trapFired` is a turn-level field, it is still set when the
   player presses Skip during the hold, and that second pass would schedule another two seconds. A marker
   holding the last announcement fixes it, compared by identity against the frozen object the rules layer
   produced. This is why `announcement(state)` returns the value rather than a boolean.

**It delays the loop and does not block input, and that is a decision.** While the hold runs the phase is
still `action`: `turn-controls.js` ignores a pawn click outside `choose` and `act`, and `applyMoveHints`
paints nothing, so there is nothing on the board to click. What the player can still do is play another
card or press Skip, and either ends the hold early. That is the reading D9 already gave this strip, "until
the player's next action, and at minimum": a deliberate click is the player saying they have read it. The
alternative, swallowing input for two seconds, needs either a new attribute in the DOM contract or a
live-looking button that does nothing, and what a disabled prompt looks like is a design decision this
side may not take. It is also the only version of the change that can leave the game feeling stuck.

**`--motion-trap-hold` is two seconds and not four, and the reason is worth keeping.** D20 gave a refusal
four, because a refusal follows the player's own click and they are already looking at the board. A trap
fired by a card interrupts a turn that is under way and arrives unasked, so what it needs is a
*guaranteed* window rather than a long one. Two seconds cannot be missed and does not turn a turn with two
traps in it into a slideshow. The token also sits outside `tokens.css`'s `prefers-reduced-motion` block,
which spec 07 argues for directly: it is a reading time and not a motion, and a player who asked for less
movement has not asked for less time to read.

**One consequence nobody decided and it is correct anyway.** Pausing during the hold loses it:
`loop.pause()` clears every timer and `loop.resume()` re-enters the phase. The turn is not stuck and the
announcement is still in the state, so it is still drawn; only the guarantee is gone. That is the right
answer for a player who chose to stop looking at the board.

### A negative finding: two specs answered one question in opposite directions: 2026-09-03, issue #45

**D59, the pickable field, is answered against a rule handoff 04 already delivered, and the loop had no
way to notice.** This is the most instructive thing in the whole handoff and it is worth the space.

`prompt.css` lines 190 to 222 have answered "what does a pickable field look like" since 2026-09-01. It
paints an offered track field in the skill teal and dims every field and pawn that is **not** offered to
`opacity: 0.45`. D59 answers the same question with violet and no dimming, and it explicitly rejects both
of the earlier answers by name: "*Rejected: a second hue for picking, teal*", because a field can be a
skill square and pickable at once, and "*Rejected: the refused fields dimmed or hatched*".

Neither side was careless. Brief 07 asked D59 as the fourth unnumbered leftover of `00-open-requests.md`
§ 4, which had been on the open list since spec 03 § 5 and had genuinely never been *answered in a spec*.
It had been **implemented** in the meantime, in a file whose own comment says it is answering that
leftover. So the open list was right that no spec covered it and wrong that nothing did.

**The clue was in this chapter already, in a note about line counts.** The entry for handoff 04 records
that spec 04 § 1 names the seam to cut if `prompt.css` goes over 300 lines: "the `.board[data-picking]`
block at the end, which is **board CSS living in a prompt file**". A block of board rules in the prompt's
stylesheet was noticed, written down, and filed as a size risk rather than as a place where two decisions
could collide. Nobody joined the two facts, and there was no step in the process that would.

Three consequences, and the third is why this could not be patched from this side:

1. `prompt.css` loads after `board.css`, so at equal specificity the earlier answer wins and **D59's block
   is inert**. The board looks exactly as it did while aiming a card.
2. `prompt.css:219` uses the `background` **shorthand**, which resets `background-image`. So a field that
   is inside an It's Not That Deep aura and offered by a card loses its hatch, which is D58 quietly failing
   on the fields the player most needs to see it on.
3. The earlier rule covers the **pawn** as well as the field, and D59 speaks only about the field. Deleting
   the field half leaves a pickable pawn teal and a pickable field violet, with non-offered pawns dimmed
   and non-offered fields not. Choosing how those go together is a design decision, and `CLAUDE.md`
   forbids this side from taking one.

There is also a consequence nobody has decided: the dimming applies to 34 of the 36 fields a trap card
offers, so it dims the trap chips at exactly the moment D51 says whose trap it is matters most.

**So the package landed whole and untouched and the block lies dormant**, which the Product Owner chose
over patching it. The reasoning: the board keeps a treatment that is already coherent, and no file is
edited against its delivery. The alternative, deleting the earlier rules, buys a violet field and an
incoherent pawn. **D61 is open against it**, with the file, the line numbers, the cascade order and the
shorthand finding in `08-brief-pickable-field.md`.

**A correction, made the same day and worth leaving visible.** The plan for this landing said the keyboard
focus was "the one part of D59 that has no competitor" and would take effect regardless, closing the
NFR-08 gap. **That was wrong, and the end-to-end suite is what found it.** `prompt.css`'s
`.square--track[data-pickable="true"]` and `board.css`'s `.square--track:focus-visible` have the *same*
specificity, one class and one qualifier each, and both are built from `box-shadow`, which is the property
the offer and the focus rings share. So `prompt.css` wins the focus rule too: **a focused field is drawn
exactly like an unfocused offered one**, and a keyboard player cannot see where they are.

The way it was found is worth as much as the fact. The first version of the case asserted that a focused
field differs from an offered one, and it **passed** when its file ran alone and failed under load. Both
readings were wrong: `box-shadow` transitions over `--motion-feedback`, so the comparison succeeded while
the value was still interpolating between the two. A poll that stops at the first difference cannot tell
"a new rule applied" from "the old value is still on its way".

So the case is now a deliberate negative that asserts the focused field is drawn identically to the
offered one, and it will go red the day D61 lands. That is the third time this pattern has been used and
the second time it has been used to record a conflict rather than an absence.

**What this changes about NFR-08.** The keyboard *reach* closed in issue #45 and is real: a field takes a
`tabindex` while it is offered and answers Enter. The keyboard *state* has not closed, and D61 now blocks
NFR-08's second half rather than being a preference. That is a change of status and it is corrected in
`00-open-requests.md` and in the brief.

**The process lesson, which is the report-worthy part.** The design loop's guard against a dropped request
is `00-open-requests.md`, and it works: it caught the missing `chrome.css` on the day it was written. It
has no guard against the opposite failure, a question answered twice, because it tracks *what was asked*
and not *what the repository already does*. A brief lists the DOM contract and the constraints; it does not
list the rules that already exist for the element it is about. Adding that to § 2 of the next brief is
cheap, and it is the only change that would have caught this one.

### Four layout defects a test round found, and the page got a stage: 2026-09-03, no issue

**The Product Owner played a round on their own laptop and reported four things in one message.** Three
were defects with a measurable cause, one was a preference, and all four had the same root: the layout was
only ever measured at 1440 by 900.

**1. The page scrolled.** Everything in the shell except the board is measured in `rem`, so the rail costs
a fixed 705 px and the page 820 px of height, up to D35's 882 px with the prompt strip up, whatever the
window does. Only the board is fluid, which is all D6 ever promised. Measured on the reporting laptop, 1438
by 770 CSS px (a 2876 by 1750 panel at 200 % Windows scaling): the page was 820 px tall in a 770 px window,
so 50 px of scrolling before the game asks anything and 112 px once it does. FR-31 was met at exactly one
window size and nowhere else, and `shell.spec.js` only ever looked at that one.

**The answer is a stage, and it is one line of CSS because the layout is already in `rem`.**
`html { font-size: min(calc(100vw / 100), calc(100vh / 56.25)) }` makes 1rem one per cent of the stage
width, so a stage of 100 by 56.25rem is 16:9 at any size and every length in the project scales with it.
`#app` is the frame and paints the bars in `--color-ink`; `--board-size` keeps D6's two percentages, 82 %
of the height and 44 % of the width, and only what they are a percentage of changes. Nothing else was
re-measured, and at 1440 by 900 the board still comes out at 634 px, exactly as before, with 45 px of bar
above and below.

- **Why 1600 by 900 and not 1440 by 810.** D35's height budget is 882 px and it is measured; 810 cannot
  carry it, and making it fit would mean re-deciding every card size in D26. 900 keeps the budget that
  already works and 1600 is what makes it 16:9.
- **Rejected: `transform: scale()` with a factor computed in JavaScript.** It needs a resize listener in
  `ui/` and renders text at a fractional scale, which is blurry at every factor that is not a whole number.
- **Rejected: making the rail fluid in `vh` instead.** That is D26 and D35 both re-opened, and both are
  design decisions rather than ours.
- **Negative finding, and it is a real cost.** The stage overrides the text size the reader set in their
  browser, and above the 84rem breakpoint a small window makes everything evenly small instead of
  reflowing. Below that breakpoint the stage is off and D30's stacked layout is untouched, `rem` in a media
  query being 16 px by definition and not the root's computed size.

**2. The card count per seat was cut off.** D37 pins the seat plate at 15.5rem, which leaves 218 px of
content box. Measured, the four numbers need 278: four uppercase labels (`START`, `STRECKE`, `ZIEL`,
`KARTEN`), four values, 36 px of outer gaps, 16 px of inner gaps and 12 px for the hairline the cards count
sits behind. Nothing in that line can shrink, because `.hud__count` is `white-space: nowrap` with no
`min-width: 0`, and nothing clips it, so the last item ended 45 px past the plate's edge and the **next
plate painted over it**. Three of four seats read "1 KA" and only the last one, with nothing to its right,
read "KARTEN". The plate now takes `min-width: 15.5rem` and grows to its content, which measures 308 px;
all four still come out identical, because they hold the same labels and single-digit values, so D37's "one
size, and the row centres rather than stretching" survives. Four plates plus gaps are 1268 px of the
stage's 1552.

**The `hud-view.js` comments were reasoning from a seat row of 332 px**, which is issue #39's layout and
has not existed since D37. Both are corrected to the measured numbers. A comment with a stale measurement
in it is worse than no comment: it was read as a reason not to look again.

**3. An empty slot in the skill hand was drawn as a card.** `card-state.css` gives every card in a hand
with `data-active="false"` the back's dashed inner frame as `::before` and its violet diamond as
`::after`. `hand.css` draws an empty slot as a dashed silhouette and hides `> *`, the real children, and
**a pseudo-element is not a child**, so the four empty slots wore a card back's furniture inside an empty
slot's outline. At the inactive hand's 82 per cent overlap only 32 px of a slot is exposed and the diamond
is 67 px wide, which is why it read as a pile of clipped diamonds. Two lines of `content: none` fix it, and
they win on load order exactly as this file's `background` and `border` already do.

**The same look had a second half nobody had reported yet.** A slot is a later sibling than the cards to
its left and every card sits at `--layer-card`, so DOM order put the slot on top and **its dashed border
was drawn straight across the face of the last real card in the hand**. Visible in the Product Owner's own
screenshot of the action cards, once it was known to look for. An empty slot is now `z-index: 0`: a place
where a card would go cannot cover a card that is there.

**4. The overlap in the fan looked wrong, and the reported cause was not the actual one.** The request was
to turn the stacking order around so the left card lies on top. The order is not what is broken: every card
is at `--layer-card`, DOM order breaks the tie, the card on the right lies on top, and that is what leaves
the **left** strip of each card exposed with its band and its title on it, which is what D28 chose on
purpose. What is broken is the depth cue. `card.css` casts the card's hard shadow down and to the right, so
in a fan every shadow but the last one is hidden under the next card: the row loses its edges and the
overlap reads as a rendering fault. Cast to the left it lands on the card underneath. One sign as a custom
property, `--shadow-dir`, flips all four shadow declarations, and the dice hand keeps its shadow on the
right because its three cards have a real gap and never overlap.

- **Rejected: the order the Product Owner asked for.** It fixes the shadow too, and it exposes the
  right-hand strip of every covered card instead of the left, so the kind pill survives and the title and
  the `AKTION`/`REAKTION` label are what gets cut. The trade was put to the Product Owner with both looks
  drawn out and the shadow was chosen.
- **Left standing, and it is for the brief:** the overlap table follows `data-count` while the hand always
  builds five slots, so a hand of three is **wider** than a hand of five, 714 px against 672. It overflowed
  the old 734 px rail and fits the stage's 824 px, so it is not urgent, but two specs disagree.

**Three of the four fixes change a numbered design decision**, which `CLAUDE.md` does not allow this side
to do quietly. The Product Owner chose to land them and confirm afterwards: D62 for the stage against D6
and D30, D63 for the plate against D37, D64 for the shadow. `09-brief-layout-and-fan.md` carries them,
together with two findings that need no code: `data-active` on the skill hand means "some card is playable"
and not "this is the seat on turn", so D33's hot-seat privacy hangs on the wrong state and your own hand is
face down during your own turn, and Baloo 2 and Nunito are declared in `tokens.css` and loaded by nothing,
so no pixel measurement in any spec was taken against the metrics the game actually renders (D24).

### A player cannot read a card in their own hand, for two unrelated reasons: 2026-09-03

The request was that hovering an Action or Reaction card should turn it over so its text can be read.
Looking for the place to put that found two independent reasons the text is unreachable, and neither of
them is a missing hover rule. Both go out as `10-brief-card-reveal-on-hover.md`, D65 to D69.

#### 1. The own hand is face down for most of every turn, because one attribute answers two questions

`skill-hand-view.js` writes `data-active` on the hand from `playableCards(state, seat).length > 0`, so the
attribute means "some card here can be played this instant". `card-state.css` reads the same attribute as
"this hand is not yours" and draws every card in it as a back, and `hand.css` then closes the row up to
D33's 82 per cent overlap. `intents-cards.js` refuses every card while the phase is not `action`.
Multiplied out: **the player's own five cards are a row of backs through the dice card choice and through
the move, and again in the action phase once the card budget is spent.**

- **The state layer had already fixed this exact confusion and the stylesheet undid it.**
  `intents-cards.js` says of the seat whose hand is shown that "whether any card in it is *playable* is a
  separate question ... Conflating the two would blank the hand in every phase but one, which is exactly
  the bug the end-to-end spec caught." That is the same mistake, one layer up, described in advance. It
  was caught in `state/` by a test and came back through the cascade, where nothing was looking.
- **The back is not what enforces D33.** Hot-seat secrecy is the handover curtain plus one ordering rule:
  `session-actions.js` passes the turn **before** taking the curtain down, and its comment names D33 and
  D39 as the reason. A hand belonging to somebody else is therefore never on screen with the board
  visible, so every case this back fires on is the player's own hand. `app.css` already dims the whole
  plate in the same state, so the region says "I am not asking you anything" twice, once in a way that
  also hides what the player owns.
- **Negative finding, and it is a real cost.** This was already on record. `09-brief` § 4 and the entry
  above both name it, as one of two findings that "need no code from you". That filing was right about the
  cause and wrong about the consequence, so it stayed a tidiness note for a day instead of becoming a
  question. It is **D65** now and the earlier note is superseded.
- **Negative finding, second one, and it is why this survived two sprints.** There is **no test on the
  hover behaviour anywhere in the suite**, and nothing asserts `data-active` against the turn phase.
  `skill-hand.spec.js` checks the empty slot, the shadow direction and keyboard play; the fan's hover
  rules in `hand.css` lines 62 to 66 are unasserted. A CSS-only interaction with no test is invisible to
  everything except somebody playing a round.
- **Rejected: simply deleting the card back.** It is a change to how something looks and `CLAUDE.md`
  forbids this side from taking that decision. Asked as D65 instead.

#### 2. Even face up, the rules paragraph is not legible at hand size

`card.css` hides `.card__text` on anything that is not `.card--full`, and the reason is arithmetic rather
than taste. On the fitted stage at the 1440 by 900 design resolution the root is 14.4 px, the skill hand's
factor is 0.68, so the card's own font size is 9.79 px and the paragraph at `0.875em` of that is
**8.57 px**. The comment in `card.css` states the same conclusion at "near 9 px".

- **So a turn on its own would not have answered the request.** A card that rotates in place is the same
  size afterwards and its paragraph is still under 9 px. The reveal needs a size decision, which is why
  D66 puts three mechanisms in front of the answer instead of one: grow in place, a genuine turn, or a
  detail card at the reference size beside the hand.
- The paragraph is readable in the dice pool overview and in the reaction prompt, both `.card--full`.
  Neither is reachable while a player is looking at their own hand deciding what to do.
- **"Shows the paragraph" and "is the reference size" are welded together** in one selector, which is what
  makes this a contract question rather than a value: `card.css` gates the paragraph on the size class.
  Code offers to split them so the answer can put the paragraph on a card at any size.
- **A third thing has no feedback at all today.** `card-state.css` keys both hover and focus on
  `[data-playable="true"]`, so an Action card you hold but cannot play right now does nothing when you
  point at it. That is the card a player most often wants to read. It is D67, and it collides with
  `card-view.js` giving an unplayable card `tabindex="-1"`, so the keyboard cannot reach a card **in order
  to read it** (NFR-08).

#### What it would cost to build, which is why the brief went out first

- **Independent of the answer:** `skill-hand-view.js` writes a new `data-face`, `card-state.css` rehangs
  the back selector onto it and unhooks hover from playability, `hand.css` follows the overlap, `card.css`
  splits the paragraph off the size class, `card-view.js` revisits `tabindex`.
- **Only if D66 picks a genuine two sided turn:** `card-view.js` grows a `preserve-3d` wrapper with a
  front and a back, **every rule targeting `.card > *` breaks** (`card-state.css`, `hand.css`), the back's
  `::before` and `::after` move onto real elements, `pool.css` and the reaction prompt come along, and
  three checks in `skill-hand.spec.js` that read those pseudo-elements are rewritten. There is no
  `perspective`, `transform-style` or `rotateY` anywhere in the project today.
- **Rejected: implement first and send it back for confirmation**, which is what handoff 09 did the same
  day. At 09 the open items were three numbers. Here D66 may rebuild the card's DOM, and building that
  twice costs more than waiting for the answer.

### Handoff 10 landed, and the card that could not be read is now the reference card: 2026-09-03

**All five decisions came back, D65 to D69.** The package was four amended stylesheets, `card.css`,
`card-state.css`, `hand.css` and `tokens.css`, plus a new `card-reveal.css`. Three of the four amendments
are deletions. Checked on arrival, the five landing checks of `00-open-requests.md` § 6: every decision
answered, fourteen named rejected alternatives across the five, no file over 300 lines, nothing added to a
`content:` property, and every state in the DOM contract styled.

**The answer is not the one the request asked for, and the spec says so in the first paragraph.** The
request was that hovering a card should turn it over. D66 rejects the turn and explains why it cannot
work: a card that rotates is the same size afterwards, so the paragraph is still under 9 px, and a turn
would have to be bought **on top of** a size change rather than instead of one. What landed instead is one
rule set on `:hover` and `:focus-visible` that magnifies the card by `calc(1 / var(--card-u))`, which is
1.47, and lands it pixel for pixel on `.card--full`, the reference card the pool overview already shows.
The player has met that object before, which is the argument for hitting it exactly rather than
approximately.

**The box magnifies and the insides re-flow, and those are two different things.** The card's layout box
stays 159.1 px wide, so no neighbour moves and the fan's geometry is untouched; `scale` paints that box at
234. Inside it the paragraph is unhidden and the art gives back the space it borrows while the paragraph
is absent. `scale` and not `transform`, because they are separate properties and the lift in
`card-state.css` lives in `transform`, so the two compose instead of overwriting each other.

**D65 is the defect underneath and it cost two attributes to fix, not two hundred lines.** `data-face` is
split off `data-active` on the hand element. `data-active` keeps D36's meaning, "can something here be
played this instant", and keeps driving the plate lift and the plate dim. `data-face` answers "may the
person in front of the screen see these cards", it is written once per hand per turn, and in hot seat play
it is always `"up"`. The six back selectors in `card-state.css` and the closed up `--overlap: 0.82` in
`hand.css` moved onto it.

- **Why `data-face="down"` was kept even though nothing writes it.** It has no case in hot seat play and
  the spec states that plainly rather than hiding it. It is kept because the secrecy rule then stays
  expressible in the DOM instead of becoming an implicit consequence of the handover curtain's timing,
  and because the first thing that needs it is a hand that is not the local seat's: a spectator view, a
  replay, or the online mode. It costs six selectors that were already written.
- **Rejected by the spec: a dormant treatment on the cards of an idle hand.** The plate dim in `app.css`
  and the desaturation in `card-state.css` already say "not now" on two scales. A third would put a wash
  over the art, which D26 calls the fastest thing to recognise in a fan.

**D69 deleted the sideways fan out rather than fixing it.** `hand.css` used to push the right hand
neighbours aside by 43.5 px so a covered card could be read inside the row. The brief had measured that it
under shifts at every count above four, against a covered strip of up to 77.8 px. It is not fixed because
the problem it solved is gone: a revealed card is magnified out of the row and painted at
`--layer-card-raised`, so nothing covers the thing being read. That removes a number that had to be right
at five different counts, and it removes the second thing that moved when a pointer crossed the fan.

**The negative finding, and it is the second time this exact shape has come up.** The five stylesheets
were read against the working tree of the morning, which is the state **before** commit `e486bb4`, and
they were delivered whole. Copying them in would have silently reverted three separate things:

| Would have been reverted | Consequence |
| --- | --- |
| `--stage-w` and `--stage-h` in `tokens.css` (D62) | `app.css` reads both for `#app`'s size. The 16:9 stage collapses and FR-31 breaks again on any window that is not 900 px tall |
| The `--shadow-dir` sign in `card.css`, `card-state.css` and `hand.css` (D64) | The fan's shadow goes back to falling right and hiding under the next card, which is the defect the Product Owner reported |
| `z-index: 0` and `content: none` on the empty slot in `hand.css` | An empty slot paints its dashed border across the last real card again |

Two of those three carry an end-to-end case that would have caught it, both added by `e486bb4` the same
day. The stage would have failed four cases in `shell.spec.js`. **So the suite would have gone red rather
than shipping the revert quietly, which is the thing worth recording**: the tests bought exactly what they
were meant to buy, in the first week they existed. The delivery was merged by hand instead, taking only
the hunks that belong to D65 to D69.

- **The rule that catches this is the one handoff 04 taught, and it needs a second half now.** "Diff every
  file, including the ones the delivery declares unchanged" caught a pre-split `board.css` in handoff 04.
  It caught this too, but only because somebody diffed: nothing in the process states which tree a
  delivery was read against in a way the receiving side can check. The spec says "read against the working
  tree of 2026-09-03" and that was true when it was written and false four hours later. Asked back as part
  of closing handoff 10.
- **One delivered rule was amended rather than copied**, which is the thing this project prefers to avoid.
  `card-reveal.css` casts the revealed card's hard shadow to the right, because it was written before D64
  existed. Both offsets now multiply by `--shadow-dir`. The reason is not consistency for its own sake: a
  revealed card is still sitting in the fan, so a shadow that flipped from left to right under the pointer
  would be D64's depth cue defect, undone one card at a time. The amendment is recorded in the spec
  itself, in a note at the top, the same way handoff 07's link fix was.

**`.card--reading` is a class the app must never write.** It is a third trigger next to `:hover` and
`:focus-visible` and it exists so the state has a name that a test and a mockup can pin without
synthesising a pointer. `card-reveal.spec.js` asserts it, and that assertion is also what proves nothing
in `src/` applies it. Without a case it would have been dead CSS in the repository.

**`focusable` is a new field on the card view-model, and the reason it is a field is worth the sentence.**
D67 gives every card in the skill hand a tab stop, playable or not, because focus now reveals and the card
a player most wants to read is the one they cannot play yet. But `updateCard` is shared: the dice hand and
the pool overview render through it, and design spec 05 § 5 took seven dead tab stops **out** of the pool
overview for a reason that still stands there, since nothing in the pool reveals on focus.
`dice-pool.spec.js` asserts that pool cards have no tab stop. So the rule could not be changed in the
shared component and it could not be keyed on `card.family` either, because "which regions let you tab to
a card you cannot play" is a fact about a region, not about a card. It is
`(card.focusable ?? card.playable)`, the default is unchanged, and `skill-hand-view.js` is the one caller
that opts out.

**What the tab stop does not do.** `events.js` still binds `click` and `keydown` on
`[data-playable="true"]`, so pressing `Enter` on a focused unplayable card does nothing. That is correct
and deliberate: the stop is there to read the card, not to play it.

### The roll has no animation, no moment and no explanation: 2026-09-03

The request was that the dice roll animation is boring and a number just appears. It is accurate, and
looking for the place to build a better one found three things where one was reported. All three go out
as `11-brief-roll-animation.md`, D70 to D74.

#### 1. There is no animation, and the badge cannot have one without a change

`.card__result` is a span that `card-view.js` creates empty and always keeps, and `card-state.css` hides
it with `:empty { display: none }`. The view writes the number in and the number is on screen. **No
keyframe, no transition and no token targets it in any of the eighteen stylesheets.**

- **The `:empty` rule is what makes this more than a missing stylesheet.** An element with
  `display: none` has no start state, so nothing can transition or animate *into* view on that element.
  Whatever the answer is, it needs either an ancestor, a pseudo-element, a placeholder character, or the
  `:empty` rule replaced by an attribute the view writes. Three of those four are changes to our code,
  which is why it is asked as D72 on its own rather than folded into the look.
- The badge is small, and that is a measured constraint rather than an impression. At the fitted stage's
  14.4 px root and the dice hand's `--card-u: 0.76`, the badge is **30.1 px square** and the number in it
  is **17.8 px**. The card it sits on is 177.8 by 259.9 px. So an animation confined to the badge happens
  in about 1.3 per cent of the card's area.
- **D32 is not reopened.** The number belongs on the card that produced it, and `board-view.js` says in
  its own comment that the board deliberately does not show the roll: "The number itself belongs to the
  dice hand." Both are confirmed in the brief's § 2 rather than asked again.

#### 2. The roll has no moment of its own, and the loop's own comment says it should

`game-loop.js` line 26 describes the `roll` phase as existing "so that the on-roll reaction window has a
moment to open in, **and so a roll animation has something to hang off**". Nothing hangs off it. That
sentence went in with `182e5fa` on 2026-09-01.

- `advance()` is synchronous and re-entrant, so one click on a dice card runs the action-phase skip and
  the roll before the browser paints once. What a player sees is **a single frame** in which the kept card
  lifts, the two unkept cards begin travelling back to the pool (`hand.css`, `data-resolved`), and the
  number is already sitting on the kept card. The three parts of "you rolled" arrive together and the one
  the player is waiting for is the one with no motion on it.
- **A pause in front of the roll already exists, and it is not an animation.** `handleRollDie` opens the
  on-roll reaction window **before** rolling, because Critical Failure, Devil Die and Hold Pawn are played
  "as any player rolls" and have to be played before the number is known. When one opens, the roll happens
  on window close through `resumeAfterWindow`. So the machine already knows how to stop in front of a
  roll; it just never does it for the roll's own sake.
- **What the answer costs us depends on the answer**, which is D70. A movement is a stylesheet and nothing
  else. A hold is a stylesheet plus a wait in `game-loop.js`, and that file is at **293 lines**, 7 from
  NFR-02's limit, so a wait would land in `timers.js` beside `holdAfterTurn` and `holdMidTurn` rather than
  in the loop.

#### 3. A roll that cards changed is an unexplained number, and this is NFR-08

`core/roll.js` resolves a roll as a chain of up to nine kinds of step and returns the trace.
`turn-manager.js` writes it to `state.rollSteps`, and its comment says why: "`rollSteps` keeps the trace
so the screen can explain a number that three cards had a hand in (NFR-08)."

- **No file under `src/ui/` reads `rollSteps`.** The only readers in the repository are unit tests.
- **The sentences are already written, in both languages.** `roll.step.base`, `.fixed`, `.advantage`,
  `.disadvantage`, `.add-die`, `.sub-die`, `.multiplier` and `.floor` are in `de/ui.json` and `en/ui.json`
  and are read by nothing. "Plus a D8: 5", "Rolled twice, higher: 17", "Times 2: 22".
- So a turn in which a player plays Critical Success, Angel Die and Speedrun Any% ends with a number on a
  D20 card that can be larger than 20, and nothing on screen accounts for it.
- **Negative finding, and it is the third of its kind in three handoffs.** A rule ran in `core/` or
  `state/` and nothing in `ui/` rendered it: `state.traps` in handoff 07, the face-down own hand in
  handoff 10, and `state.rollSteps` here. All three were `must have` requirements that were partly unmet
  for reasons no test could see, because a rule with no renderer passes every unit test it has.
- **Negative finding, two locale gaps of ours.** `ROLL_STEP.MISSED` exists in `core/roll.js` and has **no
  key in either locale file**, so eight of the nine steps are translated. And `turn.rolled`,
  "Rolled: {{roll}}" and "Gewürfelt: {{roll}}", sits in both files unread. Both are ours to fix when D73
  is answered, and neither is a design question.
- **Negative finding, no test.** There is **no test on the roll's timing anywhere**, and there is no unit
  test for `dice-hand-view.js` or `card-view.js` at all: `.card__result` is pinned only by two Playwright
  cases that read its text. That is why point 2 was never noticed.

### The main menu is three elements, and nothing in the project styles a control you cannot use: 2026-09-03

The request was that the main menu is barebones and should show three items, Hotseat, Online Multiplayer
and Settings, with only Hotseat working, and that Claude Design should draw several mockups to choose
from. It goes out as `12-brief-main-menu.md`, D75 to D80.

#### What "barebones" is, in numbers

`menuScreen()` in `overlay-screens.js` returns a title, one sentence and one button. Its own comment says
"one button, because there is one thing to do here (FR-38)", which was true when it was written.

- The stage is `100rem` by `56.25rem`, which at the fitted 14.4 px root is **1440 by 810 px**. The menu
  panel is `min(30rem, 100%)`, which is **432 px, 30 per cent of the stage width**. The title is
  `--text-xl` at 25.2 px, the paragraph `--text-md` at 15.3 px capped at 34ch, and the one button is
  39.6 px tall.
- So the entry point of the game is **three elements in a card using under a third of the width** of the
  emptiest screen in the project. Nothing about the three is wrong. That is what makes it a direction to
  be chosen rather than a defect to be fixed, and it is the reason the brief asks for drawings.

#### The finding is an absence

**Neither `disabled` nor `aria-disabled` appears in any of the eighteen stylesheets or in any file under
`src/ui/`.** Two of the three requested items are exactly that, so D77 has no precedent anywhere in the
project to reuse.

- It is also two questions rather than one, because the two attributes produce different screens.
  `disabled` removes the tab stop and stops the click for free. `aria-disabled` keeps the item reachable,
  announces it as unavailable, and needs the click filtered in `session-actions.js`.
- **D67 is the precedent and it points both ways.** Spec 05 § 5 took seven dead tab stops out of the pool
  overview because a stop where `Enter` does nothing tells a keyboard user nothing, and D67 put stops back
  on unplayable cards precisely because focusing one now *does* something. So whether an unavailable menu
  item takes a tab stop depends on whether focusing it says anything, which is D78. The two decisions have
  to agree, and the brief says so.

#### The three items are each a real requirement, and two of them are unavailable for different reasons

| Item | Requirement | State |
| --- | --- | --- |
| Hotseat | FR-01, `must have`, screen S2, issue #41 | Built. It is how the game is reached today |
| Online Multiplayer | FR-42, `should have`, issue #42 | Nothing exists. No chosen technology, one acceptance criterion, and the Requirements Specification names it as the largest available cut |
| Settings | S11. FR-34 for language, FR-41 for the mute, issue #40 for the audio half | **Deliberately deleted on 2026-09-01.** The language switch shipped into the always-present chrome instead, and only the mute is outstanding |

- **"Not built yet" and "already available in the bar at the top" are not the same sentence**, which is
  what makes D78 more than a label question.
- **The chrome already floats over the menu, on purpose.** `--layer-chrome: 7` sits above
  `--layer-overlay: 6`, and `chrome.css` gives the reason in its header: FR-34 says the language switch
  works at runtime and the main menu is a runtime the player spends time in. On the menu the pause and
  pool buttons are hidden and the language button is not, so the top of the menu already has one control
  in it that is not part of the menu.
- **`.overlay__actions` is a centred, wrapping flex row.** Three items stacked is not a small change to
  that rule, it is a different rule, and whether it is scoped to `[data-screen="menu"]` is part of D76.
- **The two screens stay two screens.** Hotseat leads to S2 as it does today, and D80 asks for
  confirmation rather than a decision, because the Product Owner chose it: S2 has its own requirement and
  acceptance criterion, its three count buttons are already designed as a choice between equals, and three
  end-to-end specs click them. The other sixteen bypass the menu with `?players=` in the address bar,
  which is what keeps a menu rewrite from touching them.

#### One thing changed about how the loop is used, and it is worth a note of its own

**Brief 12 asks for three mockups and a pick. No brief in this loop has asked for more than one answer
per decision before.** The reason is that the request is a preference rather than a defect: there is no
cause to diagnose, so the choice can only be made by looking. The spec then answers D75 to D80 for the
mockup that was chosen, and **the two that were not chosen become the named rejected alternatives** that
the spec template requires anyway. So the project's most-skipped rule gets easier to satisfy rather than
harder, which is the opposite of what asking for three drawings sounds like.

### Handoff 11 landed, and the roll stopped being a number that appears: 2026-09-03

D70 to D74, all five answered, all five on screen. What landed is one new stylesheet, two amendments, one
new module, one class rename and the closing of NFR-08's explanation half.

#### The five answers, and which of them cost code

| Decision | Answer | What it cost this side |
| --- | --- | --- |
| **D70** | A **hold**, not a movement. `--motion-roll: 520ms` is the throw, `--motion-roll-hold: 900ms` is what the loop waits | The only one that needed code, and it needed the most of it |
| **D71** | The kept dice card **is** the die and performs the throw. Route 3, a die as its own object, was rejected because a D8 card already depicts an octahedron | One attribute, `data-rolling` on the row |
| **D72** | Nothing replaces `:empty { display: none }`. The number is written at the **start** of the throw and held invisible by a `backwards` fill | **Nothing.** See below |
| **D73** | A list in the message strip, all steps at once, only from two steps up | One new module and one branch |
| **D74** | `FAST_DELAYS` gets `roll: 0`. Confirmed | One key |

**Two new tokens, and everything else is derived in the stylesheets.** The spec spends 13 lines of
`tokens.css` rather than 30 by deriving the badge stamp from `calc(var(--motion-feedback) * 2)` and the
strip's delay from `calc(var(--motion-roll) + var(--motion-feedback))`. That is why the strip's fade
collapses correctly under `prefers-reduced-motion` with no media query of its own: it is derived from a
token that collapses.

**`--motion-roll-hold` is the third token to sit outside the `prefers-reduced-motion` block**, after
`--motion-refusal-hold` (D20) and `--motion-trap-hold` (D60). Three occurrences turn an exception into a
rule worth stating: **a hold is time, not movement.** A player who asked for less motion did not ask for
less time to read, and the roll adds a second reason: with the wind up gone there is no warning that a
number is coming, so they have less warning and not more.

#### D72 is the answer worth writing down, because the brief was wrong and the round trip is what caught it

The brief found a real blocker: `.card__result` is hidden by `:empty { display: none }`, and an element
with `display: none` has no start state to animate from. It offered three routes and **every one of them
required a code change of ours**: a placeholder string, a dropped `:empty` with visibility on an
attribute, or an animated ancestor.

The spec took a fourth route the brief had not thought of. Write the number into the badge at the
**start** of the throw rather than at the end, and let the keyframe's `backwards` fill hold it at zero
opacity until the card comes to rest. An element that is already in the layout has a start state.

**It cost zero lines.** `updateDiceHand` already wrote the badge from `state.roll` the moment the rules
produced it, and the same render sets `data-rolling`, so both follow from one fact and cannot get out of
step. `card-state.css`, `card.css` and `hand.css` were not delivered and needed no change.

What it costs instead, named rather than hidden: the result is in the DOM about 520 ms before it is
legible on screen. The spec argues that is correct rather than merely tolerable, because a player who
cannot see the card shake should not be made to wait out a shake they cannot see. It is a hot-seat game
on one device, and the same player can already read `state.roll` in the console.

**The transferable lesson is about the brief and not about the badge.** The brief asked rather than told,
and got an answer cheaper than any of the three options it had costed. A brief that had picked one of its
own routes would have bought a code change it did not need.

#### A roll arrives through two doors, and the first implementation only knew about one

This is the one real bug in landing the handoff, and it was found by three unrelated end-to-end specs
timing out four minutes into a 77-turn match.

`handleRollDie` in `intents.js` does not always roll. When an opponent holds Critical Failure, Devil Die
or Hold Pawn it opens the on-roll reaction window instead and rolls **nothing**, because those three
cards are played "as any player rolls" and so have to be played before the number is known. It is
`resumeAfterWindow` that rolls once the window shuts, dispatched as `close-window` out of
`card-controls.js`. **The loop's `roll` branch is never re-entered on that path.**

The first version hung the hold off that branch. The consequence was not a missing animation:

1. `roll.css` puts `pointer-events: none` on `.hand--dice[data-rolling="true"]`, so a click on a dice
   card lands on the plate behind the row instead.
2. `dice-hand-view.js` sets the attribute from the state on any render, and only the hold takes it off.
3. So from the first turn an opponent held one of those three cards, **the dice hand was permanently
   unclickable** and the match could not be played past that turn.

The fix is that the question is asked of the **state** rather than of the phase: does a roll exist that
this turn has not been held for. That catches both doors, and it moved the check from inside the `roll`
branch to the top of `advance()`, where every path passes. The second door now gets the hold too, which
is the case D70 most wants: a roll a Devil Die changed is the roll most worth showing.

**Why no test caught it earlier and one does now.** Every existing spec that plays a long match plays
`?fast=1`, where the hold is zero, so nothing waited. The failure was not about timing but about an
attribute that was never removed, and only a match long enough for an opponent to draw one of three
specific cards reached it. `roll-animation.spec.js` now stacks four Devil Dice and plays six turns, so
the second door is exercised on purpose rather than by luck.

#### `game-loop.js` hit the 300-line limit for the third time, and two seams came out of it

The file was at 293 lines, 7 under NFR-02's limit, which the brief had already named as the reason the
hold could not be guessed at. Two things moved, and neither is a line-count trick:

- **`src/ui/turn-waits.js`, new**, takes **the two waits the loop takes by itself**: the roll's moment
  and the pause before the handover. `card-controls.js` already owned the third, the two-second hold on
  a trap a card fired (D60), so the shape is now symmetric. The loop decides *that* it waits,
  `timers.js` decides *how long*, and this decides *when*.
- **`handleWindow` moved into `card-controls.js`**, which already owned the reaction window's clock, its
  prompt and its closing. The loop had been left holding the one branch that reads it.

`game-loop.js` came out **shorter than it went in**, and this is the third time the file has been split
at the limit: `render.js` came out of it in issue #39, and `turn-controls.js` and `card-controls.js` in
the same issue. Four real seams out of one line limit and no artificial ones, which is worth a sentence
in the report about whether NFR-02 earns its keep. The figures are in Ch. 09.

#### The strip was renamed, because it had been called the wrong thing for two decisions

`.move-refusal` in `refusal.css` was right while a refused move was the only thing the strip said. D55
gave it a trap's voice on 2026-09-03 and D73 gave it the roll's, so **two of the three kinds it carries
are not refusals**. The spec reported it itself under "Noticed and not done".

It is now `.message-strip` in `message-strip.css`, matching `data-message-kind`, which is the attribute
the three kinds are actually told apart by. It landed as a commit of its own ahead of the feature, so
nothing about the rename is mixed into the roll, and every existing end-to-end case that locates the
strip is what verifies it.

Two names deliberately keep the old word. `--motion-refusal-hold` really is the hold a refusal gets.
`--layer-refusal` is a leftover all three kinds share, but it lives in `tokens.css`, which belongs to
Claude Design, so it was asked there rather than changed from here.

#### The stale-file problem happened a second time, and the ask has changed shape

The delivered `tokens.css` had no `--stage-w`, no `--stage-h` and a `--board-size` of `44vw`, so it
predated `e486bb4`. Copying it in would have **reverted D62's fitted 16:9 stage**. Only the two additive
hunks were taken, and `git diff` was checked for removals rather than trusted.

This is the same failure handoff 10 nearly caused with four files. The close of handoff 10 asked for one
word, "name the commit, not the date", and that was done correctly and did not help: **naming a commit
and re-reading the file at delivery time are two different acts.** So the ask is now different rather
than repeated: deliver an amended file as a **diff**, which cannot silently carry a reversion.
`refusal.css` in the same package was purely additive and merged without a thought, which is the shape
to aim for.

#### Two locale findings, and one of them explains why an existing test could not see it

**`ROLL_STEP.MISSED` had no key in either language**, so eight of nine steps were translated. Both files
have one now.

`locales.test.js` already had a case asserting the two locale files have identical key sets, and it
passed the whole time, because **both files agreed about a step that had no sentence anywhere**. Comparing
the locales against each other cannot find a gap they share. The new case compares them against
`ROLL_STEP`, which is the same shape as the existing cases for `REFUSAL` and the 29 card titles, and it
is what turns the next missing key into a red test instead of a key printed on screen.

**`turn.rolled` was deleted.** It sat in both files, read by nothing. The spec's argument for deleting
rather than wiring it up: the badge says the number and the breakdown explains it, so a third sentence
reading "Gewürfelt: 5" would be the strip repeating the card.

#### A finding for the record, and it needed no change

The spec's example HTML shows running totals, "Plus a D8: 22". The existing locale sentences interpolate
each step's **own** value, so it renders "Plus a D8: 5", because `roll.js` stores what a step contributed
rather than the total after it. `multiplier` and `missed` are the exceptions, where the step is the whole
result. The sentences are consistent with the data, so nothing was changed. It is written down because a
reader could take the illustration for the contract.

#### What is still outstanding after this

- **No unit test for `dice-hand-view.js` or `card-view.js`**, so `data-rolling` and the badge are pinned
  only through Playwright. Unchanged by this delivery and stated rather than skipped.
- **`tokens.css` is close enough to NFR-02's limit that the next addition to it needs the split**, and
  11-spec § 7 names the seam rather than leaving it to be found: the motion tokens plus the four hold
  tokens plus the whole `prefers-reduced-motion` block move to `motion.css`. It was not done here because
  it touches no decision in the brief, and it is worth folding into the answer to brief 09, which changes
  the same file. Current size in Ch. 09.
- ~~**Handoff 12 arrived in the same package. The design is chosen and it is deliberately not built
  yet.**~~ **Landed on 2026-09-04**, see the section below. Claude Design recommended 12c, three doors in
  the game's own card language, and wrote the spec for that one with 12a and 12b as drawn rejected
  alternatives. The Product Owner confirmed 12c on 2026-09-04, in conversation with Claude Design rather
  than off this package alone, and asked in the same breath that implementation wait; it was released the
  same day.

### Handoff 12, the main menu: D75 to D80, landed 2026-09-04

The menu was three elements on a 432 px panel in the middle of a 1440 by 810 px stage, so it used under
a third of the stage in both directions and was **the emptiest screen in the game**. It was also drawn
identically to the screen that asks whether you want to abandon a match, because it was that component
with different words in it. And it offered one button, so nothing on it said that online play or a
settings screen exist.

It is now three **doors** in the game's own card chrome, dealt across the middle of the stage, Hotseat
the tall one. Six files: `menu.css` (new), three `menu-*.svg` drawings (new), `menu-screen.js` (new) and
one line in `main.js`.

**The seam held for the second time, and that is the finding rather than the look.** D38 put
`data-screen` on the overlay element so a stylesheet could make one screen look nothing like the others.
`handover.css` was the first screen to use it; `menu.css` is the second, and it goes further: the panel
keeps every element `overlay-view.js` builds and **gives up its background, border, shadow and padding**,
so the component's own markup survives a screen that is not a panel at all. `overlay.css` was not
amended and `tokens.css` gained no token. What was missing from D38 was not the seam but the statement
that **a screen may own its arrangement without owning its markup**.

- **`.overlay__actions` is the cheapest part of the answer.** It was already a centred wrapping flex row,
  which is what three doors side by side are, so it needed `gap` and `align-items: end` and nothing else.
  The wrap is also what reserves the place for a fourth door (the rules screen, S10) with no new rule.
- **One mechanical trap, and it cost Design an hour.** The panel's width is
  `min(var(--overlay-panel-w), 100%)`, and inside `.overlay`'s grid that percentage resolves against a
  single auto-sized column track that the panel's own content sized, so `84rem` silently did not mean
  84rem. The menu's sheet is a **flex line rather than a grid** for that one reason: a flex container has
  a definite content box and the number lands.
- **A door is not a `.card`, and the boundary is load-bearing.** It borrows the face, the 3 px ink edge,
  the hard offset shadow and the radius, at a size no hand uses. It takes no `--card-u`, no banner, no
  kind pill, no tag list and **no `data-card-family`**, so `card.css`, `card-state.css` and
  `card-reveal.css` never reach it. Making the doors real cards would have looked free and would have
  meant a menu exception for the hover reveal of D66, for the desaturation of an unplayable card and for
  `.card--back`. Borrowing four declarations is cheaper than inheriting a component and subtracting from
  it. `tests/e2e/menu.spec.js` asserts the absence of `data-card-family`, because that is the boundary a
  later change is most likely to cross.

#### What an unavailable control looks like, which the project had no answer for

D77 is the decision with no precedent, and the treatment turned out to be a **reuse rather than an
invention**: the empty skill-hand slot at `hand.css:169-181` is already the card's silhouette in dashed
ink at low weight with no face, no shadow, no lift and no tab stop. The `color-mix(in srgb,
var(--color-ink) 32%, transparent)` is copied from it rather than derived, so the game's two dashed edges
are the same weight. In the picked direction the resemblance is exact rather than analogous, because the
object losing its face is already a card.

**Two of the three cues are not colour**, which is what NFR-12 measures: no face and no shadow, a dashed
edge, and a muted label. Verified at 1440 by 900 under `filter: grayscale(1)`: Hotseat reads as filled
and raised, the other two as flat outlines, with no hue involved.

**`disabled` and not `aria-disabled`, and the two decisions agree.** `aria-disabled` buys one thing, an
item that stays reachable and announces itself as unavailable, and it costs a click filter in
`session-actions.js`. It buys that only if focusing the door tells a keyboard user something the screen
does not already say, and because of D78 it does not: the reason is permanent text inside the door. So
there is **no branch for `online` or `settings` anywhere in `src/`**, and the DOM attribute is what stops
the click and removes the tab stop. This is spec 05 § 5's argument, which took seven stops out of the
pool overview, and it is the opposite side of D67, which gave every hand card a stop *because* focusing
one now does something.

The cost is stated rather than hidden: a keyboard-only player reaches Hotseat and nothing else, so they
learn the other two doors exist by reading the screen. If D78 is ever narrowed so the reason is not
permanently on screen, this is the decision that has to flip with it.

#### The keyboard check D76.4 asked for, answered

The spec could not tell from the stylesheets which of two elements a first `Tab` lands on and said either
answer was acceptable. Measured on the built page:

| | Focused |
| --- | --- |
| on open | the Hotseat door |
| `Tab` | nothing, focus leaves the document |
| `Shift+Tab`, twice | Hotseat, then the language button |

So the sheet has **exactly one tab stop**, `focusOverlay` needed no change because Hotseat is first in
the DOM, and the language button is reached **backwards**, because the chrome is earlier in the DOM but
outside the overlay. `Enter` on each does what it says, which was the spec's condition.

#### What the delivery needed from this side, and one thing it got wrong

- **`overlayButton` had to be split**, which the delivery note said would not be necessary. Its claim
  that "nothing changes in `overlay-view.js`" is true only of the `focusOverlay` call it had checked. The
  function set the label as the button's own text, and a door has three children, so it is now a shared
  `buttonShell` plus an `overlayDoor` branch taken when a description carries a `hint`. Branching on a
  field and not on `description.screen` is what keeps that file's promise that it renders a description
  and knows nothing about screens.
- **The menu description moved into `menu-screen.js`**, on the `pool-screen.js` precedent, because
  `overlay-screens.js` says of itself that it stays a switch and the menu stopped being a one-line
  function.
- **The six locale keys the spec named are impossible in JSON**: `menu.hotseat` cannot be both a string
  and an object alongside `menu.hotseat.hint`. They nest with `.label` instead. See the journal.
- **The three drawings are the exception to `src/ui/art/`'s rule that its files are generated.** They are
  hand delivered, because `scripts/extract-card-art.js` matches a drawing to a card by its title and a
  door has no card behind it, so `npm run assets:card-art` neither produces nor removes them and a redraw
  is a file edit. `card-art.test.js`'s count of 36 walks the catalogue and the pool rather than the
  directory, so three more files in the glob left it untouched, and the three are checked in a section of
  their own against the same three contracts.
- **`data-action="start"` became `"hotseat"`**, because the menu now has three doors and an action had to
  say which one. Six call sites in three E2E specs. The 16 specs that pass `?players=` bypass the menu
  and were untouched, which is the same insulation that saved them when the menu first landed.

#### One open finding of the spec's turned out to be real

12-spec § 7 could not tell from the stylesheets whether the language button sits at the right end of the
chrome row on the menu, and flagged it. It did not. `.chrome__turn` carries `flex: 1 1 auto` and is the
row's **only** spacer, so the controls were pushed right by the turn sentence rather than by a rule, and
`chrome.css` takes that sentence out of flow with `:empty { display: none }` on the menu and on the setup
screen. With pause and pool hidden there too, the language button was the only child left and sat at the
**left** end. Fixed with one declaration, `justify-content: flex-end`, which is inert during a match
because a growing flex child already eats every bit of the slack it would distribute.

**This is the third "a rule runs and nothing renders it" class of finding**, after handoff 07's traps and
handoff 11's roll steps, and it is the first that a design brief found by reasoning about the stylesheets
rather than by looking at the screen.

#### What is still outstanding after this

- **No unit test for `overlay-view.js`**, so the door's three elements are pinned only through
  Playwright. That is the standing situation for anything importing jQuery and is unchanged here.
- **`setup.start` is still in both languages and read by nothing.** `menu.start` was deleted with this
  change, because `menu.hotseat.label` replaced it, so `setup.start` is now the only orphan left. Left
  alone deliberately: it is not this change's scope.
- **The dashed edge on an unavailable door is faint in the dark skin**, because 32 per cent of
  `--color-ink` on a dark ground is close to the ground. It is the value `hand.css` already uses for the
  empty skill slot, so the two agree and neither was invented here. Not raised as a defect, recorded so
  that a future contrast pass has it.

### The loop's fourth sibling, and the one thing a bot may not know: 2026-09-04, issue #43

`src/ui/bot-driver.js` is the fourth module built on the pattern `card-controls.js` established:
`game-loop.js` drives the **phases** of a turn, and one sibling owns each thing that happens inside
them. The table of siblings is now `turn-controls.js` (what a pawn or dice-card click means),
`card-controls.js` (what a card click means, plus the reaction clock), `turn-waits.js` (the two pauses
the game takes on its own) and this one.

**What it adds to `src/ai/` is time, and nothing else.** `decide(state)` returns an intent and knows
nothing about clocks, exactly as `core/` decides the rules and knows nothing about the DOM. The driver
waits, then dispatches. That split is the whole feature in one sentence, and it is what makes a whole
bot match a one-second Vitest run instead of a four-minute Playwright one.

**The decision is asked twice: once to find out whether there is anything to do, and again when the
timer fires.** Not redundant. 900 ms of real time pass in between, and the match can be paused, given
up, restarted, or carried on by a person in that window. Dispatching an intent captured at scheduling
time would replay a decision made about a board that no longer exists.

**Two lines in `advance()`, and the order of both is load-bearing:**

- `bots.declineAll()` runs **before** `cards.handleWindow()`. So a window with nobody but bots in it
  shuts at once instead of running a thirty-second countdown nobody is watching, and in a mixed round
  `seatOnShow`, which is `eligible[0]`, is a person. Declining takes no pause at all, because somebody
  else is waiting on that window.
- `bots.takeTurn()` runs **after** the loop's three self-taken steps. So a bot with no playable card is
  skipped through the action phase instantly, rather than appearing to think about a decision it does
  not have.

#### The hand-over rule changed, and it is a rule and not a convenience

`onHandover` in `match-flow.js` now asks `handoverNeeded(state, seat)` first and simply passes the turn
when the answer is no. Two cases make the screen pointless: the next seat is a bot, so nobody is being
handed anything, and there is only one person in the match, so they never put the mouse down.

**With one person and three bots the hand-over screen disappears from the game entirely.** D33's
secrecy argument, that an opponent's cards stay their own, has nothing to protect when there is no
second person at the screen. It lives in the flow rather than the loop because the loop's own comment
already says that who decides the screen has changed hands is a question about the person in front of
it and not about the turn.

The hold before it is unchanged: a move still has to finish arriving and a refusal still has to be
readable, whoever plays next. Only what happens **after** the hold is different.

#### The pause, and the token it borrows

`holdBot` in `timers.js`, the module's fourth wait. It reuses **`--motion-roll-hold`** rather than
inventing a token, because `CLAUDE.md` says Claude Code does not invent design rules and a duration in
`tokens.css` is one. That token means "reading time for a decision the turn hangs on", which is exactly
what this is. **D81 asks Design whether the bot deserves its own token, whether 900 ms is right, and
whether the pause belongs per intent or per turn.** Until it is answered, a borrowed token with a
stated reason beats a number invented here.

Rejected: a constant inside `bot-driver.js`. It cannot be overridden, so every end-to-end run with a bot
in it would pay 900 ms per intent, and a duration living outside `tokens.css` is precisely what D20 and
D70 were raised to remove. `FAST_DELAYS` gained a sixth key, `bot: 0`.

#### Input is locked while a bot plays, and the lock is a guard rather than a stylesheet

During the thinking pause the phase is already `act` and the bot's pawns already carry
`data-movable="true"`, so a click would have committed the bot's move for it, a second early and
possibly with a different pawn. `turn-controls.js` gained a third clause in one shared `playableBy`
check, and `card-controls.js` the same on the skill hand and on Carry On.

**Written as a guard and not as `pointer-events: none`.** The guard is what a test can read, and this
project has already paid once for a stuck `pointer-events: none`: it made the dice hand permanently
unclickable with no error and a screen that looked completely normal.

Declining an open window stays allowed for everybody and needs no guard, because `declineAll` has
already taken every bot out of `eligible` before the prompt is drawn.

#### Names, and one attribute for Design

Two locale keys per language: `player.bot` and `player.botNamed`. `seatName` and `seatLabel` stopped
taking `state.seats` and now take `{ seats, bots }`, which a state object already is, so most call sites
changed from `state.seats` to `state`. `bots` is read as `?? []`, which keeps every hand-built fixture
written before issue #43 working.

**A bot keeps its seat's number rather than being counted separately.** Seat 2 of four is "Bot 2" and
never "Bot 1", on this file's existing rule that the number says the turn order and the colour says
which pieces. Counting bots on their own would put a "Bot 1" and a "Spieler 1" at one table looking like
the same seat. Rejected: one key with the word interpolated, `t("player.name", { kind })`, which reads
as one fewer key and is untranslatable.

`updateHud` writes **`data-controller="bot"` or `"human"`** on every `.hud__seat`. Two readers, and both
matter: `bots.spec.js` asserts on it rather than on the word "Bot", which is what every other spec in
this suite does with an attribute, and it is the hook Design needs if D85 decides a bot seat should look
different. Nothing styles it yet, on purpose.

#### Two negative findings, recorded rather than fixed

- **A bot's skill hand is face up during its turn.** `data-face` follows the seat on show and knows
  nothing about who is playing it. Whether a bot's cards should be hidden like a person's, given that a
  bot has no secrets to keep, is D82 and D83.
- **The `reaction.*` sentences still say "Spieler".** All seven of them interpolate a bare `number` into
  a string with the word written into it, so a window opened during a bot's roll reads "Spieler 3
  würfelt" and not "Bot 3 würfelt". Fixing it means passing a name instead of a number through
  `windowLine`, which is seven keys in two languages plus a signature. **Left as follow-up work**: it is
  only visible when a person is holding a Reaction card while a bot acts, and it is a different change
  from this one.

#### `game-loop.js` is at exactly 300 lines

Two real seams paid for the driver rather than compressed comments. `bindMatchEvents` in `events.js`
groups the five bindings `start()` had written out, and the seam is genuine: those are exactly the five
regions rebuilt with every match, while the chrome and the overlay live for the whole session and are
still bound by the flow. A local `halt()` replaces three identical stop blocks, and `wiring` names the
six things every waiting sibling needs from the loop, which had been written out three times.

**The file has no room left.** The next thing that goes into it has to take something out first, and
the header's table of controls is the honest place to start looking.

### A bot's card play had to become visible, and one negative finding closed itself: 2026-09-04, issue #82

The bots play skill cards now (Ch. 06 carries the value model), and that turned a screen question into a
requirement: **a card played by somebody who is not at the keyboard is invisible.** Several cards leave
the board looking exactly as it did before. Built Different writes a status, No Take-Backsies shuts a
window nobody was going to use, and a nullified card does nothing at all. Without an announcement, one
person against three bots watches its own pawns get shoved around by nothing.

#### The announcement is the message strip, with no new component and no new token

`move-hints.js`'s `message(state)` gained a **fourth** kind, `card`, and `ui.json` gained one key per
language. The strip already says three kinds of thing (a refusal, a report about a trap, and the roll's
breakdown), and the third of those arrived the same way this one does: `data-message-kind` is the seam
they are told apart by. `CLAUDE.md` forbids this side from inventing a design rule, so nothing here
invents a look.

**The card branch is last of the four, and that ordering is the design.** In the action phase there is
no roll yet, so the breakdown answers `null` and the strip says what the bot played; once the die is
rolled the breakdown is the more useful thing and takes the strip back. The announcement is therefore on
screen for the part of the turn it belongs to and never fights with a message about the roll.

**The reading time is borrowed, exactly as the bot's pause is.** `holdMidTurn` already holds a turn for
`--motion-trap-hold` after a card announces something, and a bot's card play is the same kind of event:
it arrives unasked in a turn that is under way. So it is a third source for that same hold rather than a
fourth duration. D87 of brief 14 asks whether it deserves its own.

**It ships in `--color-warn` and that is wrong.** No stylesheet reads `data-message-kind="card"`, so the
strip keeps the colour the game reserves for "you cannot do that", and a bot playing a card is not a
refusal. This is the same deviation issue #45 shipped for the trap announcement, for the same reason and
with the same expected fix: D55 was answered by two selectors in `message-strip.css`, and D87 is the
same shape. Recorded as a deviation, not as an oversight.

#### `timers.js` grew a second question, and the asymmetry is deliberate

`announcement(state)` is unchanged and still answers "a trap fired, or a card was nullified".
`midTurnAnnouncement(state)` adds a bot's card play on top of it, and only `holdMidTurn` asks the new
one. So the **end** of a turn does not hold for a card a bot played mid-turn: the card already had its
two seconds where it happened, and holding it again at the handover would add four seconds to every bot
turn that played anything. Two functions rather than one flag, and a unit case pins each half.

`botCardPlayed` is the third piece: a **person's** own card play is not an announcement. They clicked
the card, answered the target picker and pressed the last button, so telling them what they just did
would cost two seconds per card in every match, the all-human ones included.

#### `bot-driver.js`: `declineAll` became `answerWindow`

A bot in an open window used to have one answer, so the loop called `bots.declineAll()` and carried on.
Now it can play a card into one, and a card play is not a decline in two ways: it changes the board, and
it needs the pause and the announcement. So:

- **A decline still takes no pause at all.** Somebody else is waiting on the window, and a three-bot
  table would put nearly three seconds in front of every capture a person made.
- **A card play waits `holdBot` and then goes through `carryOn`.** `answerWindow` returns `true` only
  when it scheduled one, which is the loop's signal to stop and wait; a decline returns `false` and the
  loop carries straight on to `card-controls.js` as it always did.

**`carryOn` is passed in rather than copied**, as `afterCard`. It is `card-controls.js`'s function and
the delay is not the hard part of it: the marker that stops one announcement being held twice, and the
rule that a zero hold resumes synchronously so the end-to-end suite's ordering is unchanged, both live
in there and were both bugs in earlier drafts. `game-loop.js` wires it in one line and came out at
exactly 300 lines again, with two lines changed and none added.

#### The `reaction.*` finding from this morning is closed, because the fix became load-bearing

The negative finding recorded above says all seven reaction sentences interpolate a bare number into a
string with the word "Spieler" written into it, so a window opened during a bot's roll read "Spieler 3
würfelt". It was left as follow-up work because it was only visible while a person held a Reaction card
during a bot's turn.

That stopped being true the moment a bot could play a card **into** a window: the line then has to name
a bot as the one who answered. Four keys per language take `{{name}}` instead of `{{number}}`
(`reaction.trigger.*`, `reaction.played`, `reaction.declined`, `reaction.waiting`), `windowLine` takes
the match rather than the seat list, and `seatName` decides the word. The unused two are changed with
the others rather than left half-converted.

**The new key is `turn.cardPlayed` and not `card.playedBy`**, which is a small correction to the plan
with a real reason: `cards.json` owns the whole `card` top-level key, and `mergeNamespaces` **throws**
at boot on a top-level key defined in two files. That check is from 2026-08-31 and it did its job here.

#### The e2e helpers moved out, and a first draft of the announcement spec was thrown away

`bots.spec.js` was at 271 lines with three cases in it, so the five helpers it had grown moved to
`tests/e2e/bot-helpers.js`, on `trap-helpers.js`'s precedent. They cannot go in `helpers.js`: that file
is at exactly 300 lines and every spec imports it, and none of this is any use to a spec without a bot.

The first version of the announcement case polled the strip for `data-message-kind="card"` at real speed
and **spent sixty seconds not seeing one**, which is worth writing down because the reason is not a bug.
The announcement lasts two seconds, `?fast=1` collapses it to nothing, and at real speed the early turns
are quiet on purpose: with every pawn still in the yard, almost nothing is worth playing. So the spec
now installs a `MutationObserver` on the strip and records every value the attribute ever takes. That
turns a race into a list, runs under `?fast=1`, and asserts more than the first draft could: the kind
**and** that the sentence names "Bot 2" rather than "Spieler 2". How long the announcement stays is a
unit question, and `mid-turn-hold.test.js` is where it is asked.

#### What it actually says, read off a real match rather than asserted

`/?players=2&bots=1&seed=5` at full speed, driven for a dozen turns with the announcements recorded.
Three card plays came out of turns 13, 14 and 15, one per turn as FR-23's budget requires:

```
turn 13: Bot 2 (Grün) spielt Devil Die
turn 14: Bot 2 (Grün) spielt Let Him Cook
turn 15: Bot 2 (Grün) spielt Critical Failure
```

Two of the three are **Reaction** cards played into a person's roll, which is the half of the feature no
unit test can show reaching a screen. The prompt strip in the same run said "Bot 2 würfelt" and
"Bot 2 spielt eine Karte" where it used to say "Spieler 3", and "Spieler 1 würfelt" for the person, so
both vocabularies are in use in one match.

**Two findings from doing it this way rather than by eye.** A `MutationObserver` on
`data-message-kind` fires on every write, and `showMessage` rewrites the attribute on every render, so
the first reading looked like the bot playing Let Him Cook thirty times in a row. It is one play seen
thirty times, and de-duplicating consecutive identical records is what made the output readable. And a
two-player match with one bot sits in a **reaction window during the bot's turn** far more often than a
four-player one does, because `share` is 1 there and the bot's own cards are worth three times as much:
the first attempt at this check timed out waiting for a resting phase while the board was correctly
asking the person whether they wanted to answer.

### The card being read was covered by the card that had just been chosen: 2026-09-04, no issue

Reported from a screenshot of a real match. Pointing at a skill card magnifies it upward out of its own
plate, over the foot of the dice plate, and the dice card the player had chosen a moment earlier painted
over its top third. The player was reading a card with a corner of another card lying on it.

#### The cause is a stacking context that exists and two that do not

`card.css` gives every card `position: relative` and `z-index: var(--layer-card)`, and a positioned
element with a `z-index` that is not `auto` **is a stacking context**. Neither `.app__dice` nor
`.app__skill` sets either property, so neither of them is one. The consequence is the whole defect: the
cards of both hands are painted into the **same** z-index space, and there they are compared by number
first and by document order only as a tie-break. A chosen dice card carries `--layer-card-selected`, 3.
The card being read carried `--layer-card-raised`, 2. Document order never got a say.

Design handoff 10 § 3 had ruled on exactly this overlap and called it correct behaviour, on the argument
that `.app__skill` comes after `.app__dice` in the DOM and so paints over it "with no `z-index` needed".
That sentence is true of the two plates and false of the cards inside them, and it is the reason the
delivery shipped with `--layer-card-raised` in it. Worth keeping in the report as a small, exact example
of a correct rule applied one level too high.

#### The fix is one token and one line

`--layer-card-reading: 4` in `tokens.css`, used by the three reveal selectors in `card-reveal.css` and by
nothing else. No colour, no element, no view code, and the reveal stays what it was: a CSS state.

The same line fixes a second case nobody had reported: **inside the fan**, a selected skill card also sat
at 3 and covered a revealed neighbour at 2. One bug report, two occurrences of one mistake.

*Rejected: `isolation: isolate` on the two plates*, which would make the plates the stacking contexts the
spec assumed they were and let document order settle it. It fixes the halves unevenly: the cross-plate
case goes away and the case inside the fan stays, because there both cards are in the same plate. It also
puts the correction in `app.css`, which is a stylesheet the design side owns and which handoff 10
explicitly did not deliver, rather than in the file that draws the state.

#### The test asserts what the player sees, not the number

`tests/e2e/card-reveal.spec.js` grew a fifth case. It chooses a dice card, reveals the skill card that
stands in the same column, intersects the two boxes and asks the browser
`document.elementFromPoint` for the topmost element in the middle of that intersection. **A computed
`z-index` would have been the wrong assertion**: 2 against 3 only means something once you know which
stacking contexts the two numbers live in, and it was the contexts that were misread here. The case was
run against the unfixed stylesheet first and it fails there, which is the only way to know a regression
test tests the regression.

### The pool counts moved next to the screen that shows them: 2026-09-05, issue #76

The line-up screen (handoff 15) adds roughly fifteen lines to `match-flow.js`, and that file was at 287
of the 300-line NFR-02 limit. So the first commit of the feature moves something out rather than adding
anything.

**What moved, and why it was the right thing to move.** `poolCounts()` was a **pure function of `deps`**
that answers a question about the pool overview. It was the only thing in `match-flow.js` that was not
about owning a session: everything else in that file reads or writes the screen, the loop, the state or
the pool. It now lives in `pool-screen.js` as `poolCountsFor(deps)`, next to the screen it feeds, and
`match-flow.js` calls it with its own `deps`.

**The seam is the same one `session-actions.js` used**, and the giveaway is identical: the function
touched no closure variable except `deps`, which it read and never wrote. A function that had been
writing into the flow's closure could not have moved without threading state through a module boundary,
which is worse than a long file.

**It gained three unit tests it could not have had before.** It was covered only through Playwright,
because it lived inside a closure that needs jQuery to build. The three cases are worth naming because
one of them is not obvious: that `poolCountsFor` asks the dice source for its count **on every call**
rather than caching it, which is the property the original comment claimed and nothing checked.

### The line-up is view state, and it got its own file rather than two more variables: 2026-09-05, issue #76

`src/ui/lineup.js` is the screen's working memory: which count was chosen, which seats that count uses,
and which of them are bots so far. Pure, no jQuery, no `t()`, and therefore a unit test.

**Why it never enters the game state.** A player halfway through setting up a line-up **has not started
a match**. `createGameState` has no field for a match that does not exist, and adding one would make the
rules layer hold a fact about a menu. It is the same argument `match-flow.js` already makes about the
screen itself, and it is the fourth time this project has answered that question the same way.

**Three rejected homes, and each lost for a different reason.**

| Rejected | Why |
| --- | --- |
| Two more closure variables in `match-flow.js` | That file was at the 300-line limit, and worse, a rule inside a closure that also owns the loop, the pool and the state cannot be tested without a browser |
| `session-actions.js` | Its header promises that neither of its two functions touches a variable, and that promise is what made it splittable off `match-flow.js`. Breaking it for a menu spends a good seam badly |
| A `lineup` field on the frozen game state | It would put a fact about a button in `core/`, which D38 and this chapter's neighbours have now refused four times |

**The one case in it that is not obvious**, and it has a test of its own: `begin(count)` forgets the
previous line-up completely. A player who goes back to the count screen and picks a smaller number must
not carry three bots into a two-seat match, where two of those seats do not exist.

**The opening line-up is every seat a person (D92), and the cost is stated rather than hidden.** The
single-player match is now two clicks away instead of one, on a screen that exists because that match
was unreachable. The trade is that the screen never overwrites the answer the player gave one click
earlier: somebody who clicks 4 was almost certainly counting people.

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- No source code exists yet. The layering below is the declared target state from
  [CLAUDE.md](../../../CLAUDE.md), not an observed fact:
  `ui/` does jQuery rendering and event binding, reads state, dispatches intents into `state/`, and
  contains no game rules.
- ~~Design and UI are developed with Claude Design; no design specification (colour palette, spacing,
  typography) exists in this repository yet. When it does, record where it lives.~~ **Answered, over
  three handoffs.** Specs 01, 02 and 03 have landed; where the CSS lives and where the reasoning lives
  is recorded above. Chapter 12 still wants the component overview table and it can be written now.
- **Open out of spec 03, and none of it blocks the dice hand:**
  - ~~**D33 needs the Product Owner, not the designer.** Is an opponent's skill hand represented on
    screen at all, and is the card count public?~~ **Answered by the Product Owner on 2026-09-01:** the
    cards stay secret, the **count is public** and sits in the HUD. It turned out not to be only a
    presentation question, which is the interesting part: it is what forced the handover screen, because
    secrecy at one shared screen is whatever covers the screen while it changes hands.
  - **NFR-12, telling the four seats apart without colour**, was still open from handoff 02 and is now
    **half answered**. Spec 04 gives four seat shapes as clip paths and puts them on the HUD, the chrome
    and two overlay panels. It does **not** put one on the pawn, which is where the requirement is
    measured, so this stays on the open list above.
  - **Whether a skill square moving should be animated.** Nobody has asked, and the reappearance would
    happen on a field the player is not looking at.
  - **Baloo 2 and Nunito are still loaded from Google Fonts**, unchanged from spec 01 section 5.
  - ~~**The 29 card illustrations are not extracted from the artboard**, so every `.card__art` is an
    empty framed window.~~ **Done 2026-09-01, issue #39,** and there were 36 rather than 29. See the
    facts section above. What is still open is **whether the artwork needs a Night In variant**: the
    drawings carry raw hex from the artboard, so the frame follows the skin and the drawing inside it
    does not. That is D41 in handoff 04.
  - **The size limit has to be checked after Prettier, and the brief does not say so.** Two handoffs
    in a row delivered a stylesheet that fitted 300 lines and did not after formatting.
- **Opened by issue #39, and closed by design handoff 04 on 2026-09-01:**
  - ~~**Four stylesheets were written by Claude Code and none of them should have been**: `prompt.css`,
    `hud.css`, `chrome.css` and `overlay.css`.~~ **All four replaced.** `pool.css` is the one left and it
    belongs to handoff 05.
  - ~~**Two delivered tokens were changed to make room for the HUD**, `--board-size` and the two hand
    `--card-u` factors, each about nine per cent.~~ **Both reverted by D35**, which paid for the two rows
    out of the foot of the page instead. See the handoff 04 section above for the arithmetic.
  - ~~**What an empty hand slot looks like.**~~ **Answered:** neither unplayable nor face down, because
    both are things a card can be and there is no card. It is the outline of where one would go, in dashed
    ink at 32 %, keeping the fan's geometry so a hand of one does not re-flow. Selected on
    `:not([data-card-id])`, so it needed no new attribute; it did need `tabindex="-1"` in `card-view.js`,
    because CSS cannot take an element out of the tab order (NFR-08).
  - ~~**The overlay does not animate.**~~ **Answered by D38** with `transition-behavior: allow-discrete`
    and `@starting-style`, which is what makes a transition possible across `display: none`. The handover
    deliberately does **not** animate its sheet, and that is D39.
  - ~~**The win message is now in two places**, the overlay and the orange refusal strip.~~ **Closed by
    D40:** the overlay says it, the strip says nothing.
  - **The rules screen, S10, still has no issue at all** (FR-35, `should have`), and neither does the
    mute half of S11 now that audio is deferred. Neither is in issue #39 and neither is forgotten: both
    are named here so the board's silence about them is on the record.
- **Open after handoff 04, and this is the whole list:**
  - ~~**`pool.css` is the last placeholder stylesheet**, 92 lines. Handoff 05's brief has been out since
    2026-09-01 with no spec back. D43, D44, D45 and D47 are open; D46 was answered inside D42.~~
    **Closed 2026-09-02 by handoff 05.** No placeholder stylesheet is left in the project.
  - ~~**`.pawn__mark` and about fifteen lines of `pawn.css` are the follow-up that closes D16**, and they
    were not delivered. Until they are, NFR-12 is visibly unmet and `greyscale.spec.js` stays marked
    expected-to-fail. It is the only design item in the project that blocks a requirement rather than a
    preference.~~ **Closed 2026-09-02 by handoff 06.** The mark is on the piece, `greyscale.spec.js`
    asserts the four shapes and carries no expected-failure marker, and NFR-12 is met. **NFR-12 is
    `should have`**, not `must have`: that error is corrected in
    [01-requirements-and-goals.md](01-requirements-and-goals.md) and it had spread to five files.
  - **Handoff 02 still has no spec of its own.** D17, D21, D22, D23 and D24 are unanswered anywhere.
    Spec 04 answered D16 and D20 in passing and said so.
  - **`prompt.css` is 244 lines**, 56 from the NFR-02 limit, and it is the file to watch. Spec 04 § 1
    names the seam to cut if it goes over: the `.board[data-picking]` block at the end, which is board CSS
    living in a prompt file. **That block turned out to be more than a size risk**: it holds an answer to
    the same question D59 answers, in the other direction. See the negative finding above, and D61.
  - **D61 is open**, and it is the only thing from handoff 07 that did not land: how D59's violet pickable
    field reconciles with the teal one `prompt.css` has painted since 2026-09-01, and what happens to the
    pawn half of the same rule. `08-brief-pickable-field.md` is out. **It blocks the second half of
    NFR-08**: the same cascade collision swallows D59's keyboard focus treatment, so a field can be
    reached with Tab and gives no sign of being reached. The reach itself works and shipped with #45.
  - **The six pawn statuses other than `stunned` and `slippery`** are in the DOM and unstyled: `held`,
    `rock`, `ghost`, `locked`, `armoured`, `ragebait`. D57 gives them a box and a position on
    `.pawn__status` and says the next spec sets their inner geometry and their order. `STATUS.PURGE` is
    board-scoped and still has no element anywhere.
  - **`--color-dormant` now does three jobs**: a card that cannot be played, the status tag's ground, and
    the mix on a stunned pawn's disc. Spec 07 § 8 noticed it and deliberately left it, because the three
    never appear on one element. It is cheap to fix early and expensive late, and the pass that answers
    the remaining six statuses is when to look, since they all take the same ground.
  - **The abandoned win screen is unreachable from the interface.** See the negative finding above.
- **Opened by handoff 10 and closed by it on the same day, 2026-09-03:**
  - ~~**D65. Does the player's own skill hand stay face down when nothing is playable?**~~ **No.**
    `data-face` is split off `data-active` and the own hand is always face up. Half of D33 came back with
    the answer, and the secrecy it protected is enforced by the handover curtain, where it always was.
  - ~~**D66. What a revealed card looks like, and by which mechanism.**~~ **Grow in place, and land
    exactly on `.card--full`.** The turn was rejected with the reason spelled out: it does not change the
    size, so it does not answer the request. `card-reveal.css` is the new file.
  - ~~**D67. Does an unplayable card reveal, and what is its focus state?**~~ **Yes, and the same ring as
    every other card.** The reading half of NFR-08 is closed: every card with a `data-card-id` in the
    skill hand is a tab stop now, and focus reveals it.
  - ~~**D68. Which token times the reveal, and what survives reduced motion.**~~ **`--motion-reveal:
    160ms`, collapsing to 1 ms, plus `--motion-reveal-delay: 120ms`, which does not collapse**, because
    it guards against a latch rather than being a movement.
  - ~~**D69. Does the reveal replace the sideways fan out or join it?**~~ **Replaces it. Deleted.** The
    number that had to be right at five different counts is gone with it.
  - ~~**No test covers hover anywhere in the suite**, and nothing asserts `data-active` against the turn
    phase.~~ **Closed.** `tests/e2e/card-reveal.spec.js` has four cases, including the regression that the
    player's own hand is face up during the dice card phase. **Still true of the rest of the suite**:
    outside the skill hand no hover state is asserted anywhere, and the pointer states in `pawn.css`,
    `board.css` and `chrome.css` are as unwatched as the fan's were.
- **Open after handoff 10:**
  - **A delivery does not state which tree it was read against in a way this side can check.** Handoff 10
    said "the working tree of 2026-09-03" and that was true when it was written and stale four hours
    later, by one commit. Diffing caught it; nothing in the process would have. Asked back with the
    close of handoff 10.
  - **D62, D63 and D64 are still unconfirmed** and handoff 10 has now been built on top of two of them.
    A confirmation that reverses D64 would change one rule in `card-reveal.css` as well.
- **Open after briefs 11 and 12, sent 2026-09-03:**
  - ~~**D70 to D74, the roll.**~~ **All five answered and landed the same day.** A hold of 900 ms, the
    kept dice card performs the throw, nothing replaces `:empty` because the number is written at the
    start of the roll instead of the end, a list in the message strip from two steps up, and `roll: 0` as
    a fifth `FAST_DELAYS` key. **NFR-08's explanation half is closed.** See the section above.
  - **D75 to D80, the main menu.** Whether the menu stays the overlay panel, what the three items are as
    objects, **what an unavailable control looks like at all**, whether it explains itself, what else is
    on the screen, and confirmation that Hotseat still leads to S2. None of the six blocks a requirement.
    **The spec and the three mockups have arrived, 12c is the chosen design, and it is not built yet.**
    Claude Design recommended 12c and answered all six decisions for it; the Product Owner confirmed that
    choice on 2026-09-04 and asked that the implementation wait. Nothing from handoff 12 is in `src/`.
  - ~~**`ROLL_STEP.MISSED` has no locale key in either language**~~, **fixed with D73**, and
    `locales.test.js` now compares the locales against `ROLL_STEP` rather than only against each other,
    which is why the existing key-set case could not see the gap. ~~`turn.rolled`~~ **deleted**, on the
    spec's argument that the badge says the number and the breakdown explains it. **`setup.start` is
    still in both languages and read by nothing**, and it is the one of the three that is left.
  - **Nothing was implemented ahead of either spec**, unlike handoff 09. The reason is D70 and D77: both
    decide the shape of the code rather than only its appearance, so building first would be building
    twice. That is the handoff 10 precedent, not a new policy. **It paid off on D72**, where the answer
    turned out to need no code change at all, and all three routes the brief had costed would have.
- A card's visual presentation belongs here and its rule belongs in Chapter 05; the two are matched
  by card id. Worth stating explicitly in the report, because it is the clearest example of the
  layering rule doing real work.
