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
  - **D33 needs the Product Owner, not the designer.** Is an opponent's skill hand represented on
    screen at all, and is the card count public? The CSS supports either answer today.
  - **NFR-12, telling the four seats apart without colour, is still open from handoff 02.** Spec 03
    suggests a shape for the answer without closing it: the Reaction band is marked by stripes as well
    as by orange, and four seats could take four fills that survive greyscale. That is a change to
    `pawn.css`.
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
- A card's visual presentation belongs here and its rule belongs in Chapter 05; the two are matched
  by card id. Worth stating explicitly in the report, because it is the clearest example of the
  layering rule doing real work.
