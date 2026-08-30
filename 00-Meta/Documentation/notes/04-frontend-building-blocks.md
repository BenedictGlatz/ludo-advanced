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
