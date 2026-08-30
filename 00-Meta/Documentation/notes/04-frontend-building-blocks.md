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

#### Three attributes were added to the DOM contract, for tests rather than for CSS

`data-phase`, `data-status`, `data-turn` and `data-roll` on `.board`. No stylesheet reads them and
none is expected to. They exist so that a Playwright test can wait for the turn to reach a state
instead of waiting for a number of milliseconds and hoping.

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

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- No source code exists yet. The layering below is the declared target state from
  [CLAUDE.md](../../../CLAUDE.md), not an observed fact:
  `ui/` does jQuery rendering and event binding, reads state, dispatches intents into `state/`, and
  contains no game rules.
- ~~Design and UI are developed with Claude Design; no design specification (colour palette, spacing,
  typography) exists in this repository yet. When it does, record where it lives.~~ **Half answered
  2026-08-29:** where it will live is decided and recorded above, and the first brief has gone out.
  **The specification itself does not exist yet.** No colour, spacing value or font has been decided
  by anyone, and none is written down anywhere in this repository. The nine open decisions D1 to D9
  are open. Chapter 12 still wants the component overview table, and it cannot be written until the
  spec comes back.
- A card's visual presentation belongs here and its rule belongs in Chapter 05; the two are matched
  by card id. Worth stating explicitly in the report, because it is the clearest example of the
  layering rule doing real work.
