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
    living in a prompt file.
  - **The abandoned win screen is unreachable from the interface.** See the negative finding above.
- A card's visual presentation belongs here and its rule belongs in Chapter 05; the two are matched
  by card id. Worth stating explicitly in the report, because it is the clearest example of the
  layering rule doing real work.
