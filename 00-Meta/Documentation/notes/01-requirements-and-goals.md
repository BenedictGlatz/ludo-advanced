# 01 Requirements and goals

> **Covers:** who the game is for, what problem it solves, the MVP scope, prioritisation, and what
> is deliberately left out.
> **Does not cover:** how any of it is built (04–06), or how the work was organised (02).

## What this chapter must answer

- Who plays this, and in what situation.
- What classic Ludo does badly that this variant addresses.
- What the MVP is: the minimum that counts as the game working.
- What is explicitly *not* in the MVP, and when it would come.
- How requirements were prioritised, and by whom.

## Facts

- Ludo Advanced is a 2D web-based Ludo variant for 2–4 players. Source:
  [00-One-Pager.md](../../Project-Management/00-One-Pager.md).
- The variant replaces the single die with two card pools: a **Dice Card Pool** (D2–D20; draw 3,
  pick 1, roll it, shuffle all 3 back) and a **Skill Card Pool** (*Action* cards on your own turn,
  *Reaction* cards in response to another player).
- Classic Ludo rules remain underneath: four pawns each, leave the start area on the chosen die's
  highest number, move along the track, capture by landing exactly on an opponent's square.
- The design intent is stated as giving the player "more options than just rolling dice": the
  decision each turn becomes *which die to roll* and *which skill to play*, not only *which pawn to
  move*.

### Backlog and prioritisation as actually labelled: read 2026-08-06

46 issues, all `open`, read from the now-public repository. Phase labels split
`1-initialization` 5, `2-definition` 7, `3-planning` 9, `4-implementation` 21, `5-completion` 4.
Note that `1-initialization` is in use on the board but is **absent from the phase-label list in
[CLAUDE.md](../../../CLAUDE.md)**, which names only `2-definition` through `5-completion`.

**MoSCoW is applied to 9 of 46 issues (20 %).** The other 37 (including all 24 `documentation`
issues and every fine-grained implementation task, #26–#35, #40, #41) carry no MoSCoW label:

| Label | Issues |
| --- | --- |
| `must have` | #36 Core Game Engine & Board, #37 Enhanced Dice Pool System, #38 Skill Cards Mechanics, #39 UI / UX & Game State |
| `should have` | #42 Online Multiplayer & Lobby System |
| `could have` | #43 LLM-Powered Bot API Integration, #44 Expanded Skill Card Set, #45 Trap Card System & Tile Trigger Logic, #46 Classic vs. Custom Game Modes (Rule Toggles) |

Read structurally this is coherent rather than incomplete: **the four `must have` issues are epics
with real GitHub sub-issue links.** Verified 2026-08-06 against the `/sub_issues` API, not inferred
from titles:

| Epic (`must have`) | Sub-issues |
| --- | --- |
| #36 Core Game Engine & Board | #26, #27, #28, #29 |
| #37 Enhanced Dice Pool System | #30, #31 |
| #38 Skill Cards Mechanics | #32, #33, #34 |
| #39 UI / UX & Game State | #35, #41 (and #40, deferred on 2026-09-01, see below) |

That accounts for every unlabelled implementation issue: **the MoSCoW labels sit at epic level, and
the sub-issues inherit priority through the link.** So the 20 % label rate is a deliberate structure,
not a gap, and the report can say so with evidence. Worth stating, because the raw figure reads as an
omission.

**MVP by this reading:** #36–#39 and their 12 sub-issues. **Explicitly outside it:** multiplayer
(`should have`), and the LLM bot, expanded card set, trap cards and rule toggles (`could have`),
matching the one-pager's framing of multiplayer and AI opponents as extensions.

**Negative finding:** all four epics have an **empty issue body**, as do their sub-issues. The
backlog is titles and labels only: there is not one acceptance criterion anywhere in the 46 issues.

### Goal catalogue: written 2026-08-09

The requirements above existed only as rules prose, hard constraints and issue titles spread over
four documents. They are now stated as a checkable goal catalogue in
[Functional-and-Non-Functional-Goals.md](../../Project-Management/Functional-and-Non-Functional-Goals.md):

- **FG-01 – FG-16**: functional goals for the MVP, grouped along the four `must have` epics
  (#36–#39) so the goal list and the board decompose the same way.
- **FG-17 – FG-21**: the `should have` / `could have` items, named explicitly as *outside* the MVP.
- **NFG-01 – NFG-08**: non-functional goals derived from the hard constraints in
  [CLAUDE.md](../../../CLAUDE.md): layering, the 300-line limit, full i18n, the restricted dependency
  set, the ≥ 80 % coverage target for `core/` and `state/`, static browser deployment, per-commit
  documentation, and comprehensible game state.
- Section 3 of that file is the **traceability table** epic → FG → constraining NFG.

Each goal carries a **Source** line and a reason; goals derived rather than quoted say so. Nothing in
the catalogue is a new requirement. It is a restatement of existing sources in checkable form, which
is why it lives in Project-Management rather than here.

**Negative findings surfaced by writing it, none of them previously recorded:**

- **No performance goal exists**: no frame rate, load time or input latency anywhere. Defensible for
  a turn-based board game, but it needs to be named as a deliberate omission rather than left blank.
- **No browser support matrix**: no minimum versions, and no statement on whether mobile or tablet
  is in scope. Relevant because the board is a wide layout.
- **No accessibility goal**, and colour is the primary means of distinguishing players in Ludo, so
  colour-blind accessibility is a foreseeable question for this game specifically, not a generic one.
  Per [CLAUDE.md](../../../CLAUDE.md) *Design and UI* this is a Claude Design decision and was not
  invented in the catalogue.
- **NFG-02 (300-line limit) has no automated enforcement.** The rule is stated in `CLAUDE.md` and
  nothing checks it; an ESLint `max-lines` rule would close the gap and is not configured.
- The **Resource/Energy System** has deliberately *no* goal ID, because assigning one would decide an
  open question by accident. It is listed as undecided in section 1.5 of the catalogue.

### Requirements specification: written 2026-08-09, issue #13

[Requirements-Specification.md](../../Project-Management/Requirements-Specification.md) turns the
goal catalogue into **45 functional (`FR-nn`) and 12 non-functional (`NFR-nn`) requirements**, each
with an **acceptance criterion**, a MoSCoW priority and a trace to a goal or a backlog issue. It is
the first place in the project where a requirement is stated in a form that can be checked as passed
or failed.

- **MoSCoW distribution:** 39 must, 10 should, 7 could, 1 won't (of 57).
- **22 requirements are marked `†`, meaning not derivable from any existing document.** They were added
  because the rules are incomplete without them, and each is a proposal pending Product Owner
  confirmation.

**Findings, all of them things the specification exposed rather than created:**

- **The rulebook never says how a player acquires a skill card.** No draw rule, no hand size, no
  discard rule (FR-22, FR-27). The Skill Card Pool therefore has no defined behaviour at all. This
  is the largest single hole found so far and blocks Sprint 2 planning.
- **Three core movement rules do not exist anywhere:** landing on one's own pawn (FR-12), exact
  count to enter home (FR-13), and what happens when a roll produces no legal move (FR-14). FR-14
  is not an edge case here: with dice up to D20 in the pool it fires regularly.
- **The Dice Card Pool composition is undefined** (FR-17). "D2–D20" does not say which denominations
  or how many copies of each, and that choice drives the probability argument the report is built on.
- **Reactions are a requirement on the turn manager, not on the cards** (FR-25). They are the only
  mechanic that interrupts the turn sequence, so the interruption window has to be designed before
  the turn manager is built in Sprint 1.
- **Sprint plan inconsistency:** Sprint 1 in
  [01-Github-Project.md](../../Project-Management/01-Github-Project.md) plans a "standard 1–6 dice
  roll", but the leaving-start rule depends on the *chosen* die's maximum. Building Sprint 1 against
  a fixed D6 means writing that rule twice.
- **The must-have share is ~68 %**, which is high for MoSCoW. Structural, not sloppy: a game missing
  one movement rule is unplayable rather than partially playable. The consequence, that the
  schedule buffer sits almost entirely in the should/could tail and in online multiplayer, is
  stated in the specification rather than smoothed over.
- **The resource/energy system is priorised `W` (won't have this time)** on the grounds that an
  unspecified mechanic cannot be built. Note that issue #35 is titled *Game HUD & Resource Display*,
  so the backlog assumes it exists. Resolving the open question below now has a concrete owner and a
  concrete cost.

**Still true after writing it:** the acceptance criteria live in this document, not on the issues.
All 47 backlog issues still have empty bodies, so the board continues to prioritise titles until the
criteria are copied onto the issues or the issues link here.

### One pager rewritten as a one-page overview, 2026-08-22, issue #1

[00-One-Pager.md](../../Project-Management/00-One-Pager.md) was the project's first document and its
only rules source for two weeks. It is now the front door and not a second rulebook.

- **What was mechanically broken and is fixed:** the `TURN` heading was swallowed into body text, so
  the turn rules read as part of the *Beginning* section, and the bullet lists were typographic `•`
  characters rather than markdown, so they did not render as lists.
- **What is kept verbatim:** the Product Owner's original wording for the objective, the base game,
  the capture rule, the two card pools, the roles and the 2D-against-3D risk assessment. The original
  is in git history in full, so nothing is lost by editing rather than appending.
- **What is added:** the MVP boundary in one sentence (rule-complete, 2 to 4 players, one device,
  hot-seat, German and English, with multiplayer and bots named as outside it), the sprint calendar
  from the board including which sprints have no board scope yet, and a pointer table from question to
  document.
- **What moved out:** the rules detail. The turn sequence, the leaving rule and the capture rule stay
  as a summary of a few lines and point at
  [Game-Design-Document.md](../../Project-Management/Game-Design-Document.md) for the rest. Reason:
  two documents holding the same rules drift, and the one-pager is the one people read first, so it is
  the worse place for the version that goes stale.
- **Negative findings kept visible in the document itself** rather than tidied away: the board holds
  no buffer sprint, board Sprint 3 is 1½ weeks, and the gameplay scope still has no sprint. All three
  are named as open points for the project plan, issue #15.

### Game design document: the rulebook written to edge-case level, 2026-08-22, issue #22

Full document: [Game-Design-Document.md](../../Project-Management/Game-Design-Document.md). It is the
layer below the requirements specification: the specification says a rule must exist and how it is
checked, the game design document says what the rule is.

- **Board topology is stated as exact numbers, derived rather than asserted:** a shared track of
  **52 squares** (4 × 13, so the four players sit at equal offsets and the board keeps the classic
  Ludo length), a start area of 4 slots, a home column of **5 squares**, and home. A pawn travels
  **58 steps** from start area to home (52 shared + 5 home column + home). Entry square of player
  `p` is `13 × p`; the turn-off square is the square immediately behind it, so a pawn walks a full
  lap before turning off. Rejected: a shorter track to shorten matches, because it breaks the 4 × 13
  symmetry and match length is better tuned in the pool composition, which is data.
- **The turn is specified as an 8-step state machine**, because the reaction window needs a defined
  place to interrupt it. No extra turn on the die's maximum: with a D2 in the pool that fires on half
  of all rolls, so the effect is a skill card (`action-reroll`) instead, where it costs a card.
- **All eight open Product Owner rule decisions are written out as rules** with their rejected
  alternatives (section 6 of the document, FR-12, FR-13, FR-14, FR-17, FR-22/FR-27, FR-25, FR-37,
  NFR-12). Section 5 of
  [Requirements-Specification.md](../../Project-Management/Requirements-Specification.md) now points
  there instead of saying the decisions are recorded nowhere.
- **The largest hole in the specification is closed:** the skill card economy now has a rule. Pool of
  16 cards (2 copies of 8), hand limit 3, one card drawn at the end of the player's own turn, one
  extra when a pawn of theirs is captured, played cards discarded and the discard reshuffled when the
  pool empties. The invariant a unit test asserts is that every card is in exactly one of pool, hand
  or discard.
- **Dice Card Pool composition is fixed as data:** 20 cards over 7 denominations (D2 ×2, D4 ×3,
  D6 ×4, D8 ×4, D10 ×3, D12 ×2, D20 ×2), weighted toward the middle. Rejected: all nineteen integers
  from 2 to 20, because a D11 against a D12 is a distinction without a decision.
- **The probability argument the report's formula chapter is built on is now written down.**
  `P(max) = 1/n` for leaving the start area and `E(roll) = (n+1)/2` for the advance move in opposite
  directions as `n` grows, which is the central trade-off of the design: small dice get pawns out,
  large dice move them. Two hypergeometric figures follow from the composition above: a hand of 3
  contains at least one D2 or D4 with probability `137/228 ≈ 0.601`, and at least one D12 or D20 with
  probability `29/57 ≈ 0.509`. These are arithmetic from the stated composition, not measurements.
- **The MVP skill card set is a finite list of 8 cards**, four Action and four Reaction, each with a
  card id that is the contract between the rule in `core/` and the presentation in `ui/` (FR-26).
- **13 win-condition and movement edge cases are settled in a table**, each traced to the rule it
  follows from rather than stated as its own rule. Two of them are cases that *cannot occur* and are
  listed as such: capture inside a home column, and two own pawns on one square. Both follow from the
  topology plus FR-12, so no exception is needed.
- **The reaction window is bounded on purpose:** at most one reaction per player per window, and a
  reaction opens no window of its own. Without both rules two players holding `reaction-cancel-card`
  could answer each other indefinitely.
- **Negative findings recorded in the document itself:** all eight rules are unsigned, the pool
  composition has never been playtested, no expected match length is stated because deriving one
  honestly needs a simulation that does not exist, and `reaction-mirror` and `reaction-shield` may
  turn out to be redundant since both answer a capture.
- **What the document deliberately does not decide:** the visual form of the non-colour player
  identifier required by NFR-12. It is a Claude Design decision and issue #3, so the rule states that
  a stable non-colour identity must exist and stops there.

### Project goals formulated SMART: 2026-08-09, issue #9

Full document: [SMART-Analysis.md](../../Project-Management/SMART-Analysis.md). Facts, not the
argument:

- **One overall goal plus four sub-goals**, one sub-goal per `must have` epic. The sub-goal cut
  follows the epic structure rather than the sprint structure, because the epics are what the MoSCoW
  labels already prioritise. A sprint-shaped cut would have introduced a second, competing breakdown.
- The overall goal binds five checks: a full game completed by 2–4 players; #36–#39 closed; ≥ 80 %
  line coverage in `src/core/` and `src/state/`; complete `de` and `en` locales with no hardcoded
  user-facing string; no source file over 300 lines. The last four are the rules already fixed in
  [CLAUDE.md](../../../CLAUDE.md), so no new requirement was invented for the goal.
- **Sub-goal deadlines, taken from the board sprint markers** in [sprint-log.md](../sprint-log.md):
  SG1 #36 → 2026-08-23, SG2 #37 → 2026-09-06, SG3 #38 → 2026-09-06, SG4 #39 → 2026-09-17.
- **The `T` anchor is 2026-09-17**, the board's end of Sprint 3, the only calendar date in the
  repository. The module's real submission date is unknown, so every date in the analysis is
  explicitly re-anchorable; that is why they were taken from one named source instead of being spread
  through the text.
- **Scope excluded by the goal, by design:** #42 (`should have`) and #43–#46 (`could have`). The goal
  is the `must have` set exactly.
- **Velocity and burn-down are deliberately not measurable criteria.** The board carries no story
  point field and no Iteration field, so a goal depending on them would be unmeasurable by
  construction. See [02-project-management.md](02-project-management.md).
- **Boundary against the neighbouring definition-phase issues:** non-functional goals beyond
  localisation and the coverage/300-line rules stay with #10, the requirements specification and the
  MoSCoW rationale with #13, risks with #11, feasibility with #12.
- The analysis carries its own *Prerequisites for measurability* section listing what has to exist
  before the M criteria can be read at all: acceptance criteria in #36–#39, a written Definition of
  Done, a runnable test setup, and board `Status`/`Sprint` values.

### Audio was dropped out of epic #39, and the language switch was rescued from it: 2026-09-01

The epic was retitled on GitHub from *UI / UX, Audio & Game State* to *UI / UX & Game State* on
2026-09-01. **No document recorded it**: nine places across six files still carried the old title, the
effort estimation still counted audio's three points as must-have work, and nothing anywhere said why.
This section is that record.

- **What moved:** issue #40 (Audio Manager & SFX Integration, 3 points) left the epic. The epic's
  estimate falls from 10 points to 7 and the must-have class in
  [Effort-Estimation.md](../../Project-Management/Effort-Estimation.md) from 74 to 71. The implementation
  total is unchanged at 110, because the work was moved and not deleted.
- **It costs no must-have requirement.** FR-39 is `should`, FR-40 is `could`, FR-41 is `should`, and
  FG-14 to FG-16, the epic's three must-have goals, contain no audio at all. This is the first time the
  MoSCoW drop order in section 3.2 of the requirements specification was used rather than described.
- **Four documents had already predicted it.** The sprint log had audio surviving "only if assets exist",
  the project plan listed it under "holds if the visual design exists by then", and the feasibility study
  and the AI-engineering note both named "the audio and polish scope of #39" as the likely cut. The
  estimate's own line said "no asset exists yet; the estimate covers wiring, not sound design".
- **The near miss is the part worth carrying into the report.** S11 in the obligations book is one screen
  called *Audio and language settings*. Cutting #40 would have taken the language switch with it, and
  **FR-34 is a `must have` with no issue of its own**, so nothing on the board would have shown that a
  must-have requirement had gone. It was built into the always-present chrome instead, where it does not
  need a settings screen to exist. Chapter 04 has the how.

### FR-16 to FR-21 traced against the shipped code: 2026-09-01, issue #30

Issue #30 closed with an **empty issue body**, and so did its parent #37. There were no acceptance
criteria in the tracker at all: the criteria are the ones in
[Requirements-Specification.md](../../Project-Management/Requirements-Specification.md) section 4, and the
issue title was the only description of the work.

So this table was written before the issue was closed, to check each criterion against a named module and
a named test rather than against a memory of having built it. **It is the first requirement in this
project traced this way**, and doing it found a real gap, which is the argument for repeating it (see
FR-20 below).

| Req | Acceptance criterion, abbreviated | Implemented in | Proved by |
| --- | --- | --- | --- |
| FR-16 | Every card drawn is a defined denomination, and each is reachable | `core/dice-pool.js`, `POOL_COMPOSITION` | `dice-distribution.test.js`, 90,000 dealt cards |
| FR-17 | The composition is one data definition the rules read | same table, frozen | `dice-pool.test.js` (frozen), `pool-screen.test.js` (the screen follows it) |
| FR-18 | The hand holds 3 cards at every point in a match | `createDicePool().draw(rng)`, `HAND_SIZE` | `dice-pool.test.js`, `dice-hand.spec.js` |
| FR-19 | Exactly one roll result per turn | `INTENT.CHOOSE_DIE`, `ui/dice-hand-view.js` | `dice-hand.spec.js`, "rolls the card the player picked, and no other" |
| FR-20 | Each face occurs with frequency consistent with 1/*n* | `rollDie` in `core/dice-source.js` | **`dice-distribution.test.js`, added for this table** |
| FR-21 | Pool size before and after a turn is identical | `returnHand`, `endTurn` | `dice-pool.test.js`, `dice-pool.spec.js` "keeps saying seventeen of twenty" |

**FR-20 was the gap, and it had been reported as covered.** The existing test proved that every face of
every die is reachable, which is not what the criterion says. It is written up in full in
[08-quality.md](08-quality.md). The one-sentence version: a test citing a requirement id had the right
name and the wrong assertion, and the only thing that would have caught it is reading the criterion and
the assertion side by side, which is what this table forced.

**Two smaller findings from the same exercise:**

- **FR-19 is mapped to issue #31 in the requirements specification, not to #30**, even though it is the
  half of the pool that makes the pool a decision. The mapping is right, because #31 built the hand that
  does the picking, and it is worth noting that the requirement ids and the issue boundaries do not line
  up one to one. A traceability table has to be per requirement, not per issue.
- **Nothing in FR-16 to FR-21 asks that the player be able to see the pool.** The overview built for this
  issue satisfies no requirement of its own: the nearest is FR-35, the rules screen, which is a
  `should have` with no backlog issue. It was built because the requirements are satisfiable without it
  and the game is still worse without it, which is a case worth one sentence in the report about what a
  requirements catalogue does not capture.

### NFR-12 moved for the first time since it was written: 2026-09-01, design handoff 04

NFR-12, "a greyscale screenshot still identifies whose pawns are whose", has been the only requirement in
the project that a design decision was actively blocking. Design spec 01's D2 answered it by colour alone,
and `tests/e2e/greyscale.spec.js` has been marked expected-to-fail since 2026-08-30 so that the suite
reports a known failure rather than going green over an unmet requirement.

**A correction that belongs in this chapter, because it is a requirements fact and it was wrong for three
days.** NFR-12 was repeatedly called a `must have`, here and in four other files. **It is `S`, should
have.** Row NFR-12 of [Requirements-Specification.md](../../Project-Management/Requirements-Specification.md)
reads `S`, and section 3.2 of the same document names it explicitly as one of the last two should-haves to
be cut, alongside FR-35:

> **Should-haves next**, keeping FR-35 (rules screen) and NFR-12 (colour-independent players) for last,
> since both are preconditions for the buffer-sprint playtest with people who get no instructions.

The error originated in the risk register, in a row that read "A `must have` requirement ships visibly
unmet", and spread from there into this chapter, chapter 04, the journal, the design work order and design
spec 04 itself. **It is worth a paragraph in the report on its own**, and not because it was embarrassing:
the specification is the only document in the project that assigns MoSCoW labels, and every one of the five
files that got it wrong was written by somebody reading a *summary* of the requirement rather than the
requirement. The risk row has been corrected and re-rated from priority 4 to 3, because "no must-have is
droppable" is a rule NFR-12 is not covered by.

What does **not** change is that the requirement is unmet and that the test says so. A should-have that
ships unmet is a scope decision the Product Owner is entitled to make; a should-have that ships unmet
without anybody noticing is the thing the expected-to-fail marker exists to prevent.

**Design spec 04 answered it and did not close it, and the distinction is the interesting part.**

| | |
| --- | --- |
| Answered | Four seat shapes as clip paths: circle, triangle, square, diamond, as `--seat-shape-0` to `--seat-shape-3`. No font dependency, nothing readable, nothing a translator is handed |
| Applied to | The HUD seat plate, the chrome turn sentence, the win panel, the handover panel |
| Not applied to | **The pawn**, which is the only place the acceptance criterion is measured |
| Still needed | `.pawn__mark`, an empty `<span>` inside `.pawn`, plus about fifteen lines of `pawn.css`. Named in the spec, not delivered |
| Test status | Still `test.fail`. Unchanged, and correctly so |

So the requirement is **still unmet**, and the measurement is unchanged: the worst seat pair reduces to
greys 1.146 apart against a 1.30 floor. What changed is that an answer now exists and the remaining work is
fifteen lines rather than a decision nobody had made.

**One side effect helped the measurement without settling it.** D36 removed the pawn dim, which had put
everyone else's fifteen pieces at 85 % opacity while one seat was on turn. It was the only one of four
"whose turn is it" cues that touched all sixteen pawns, so it was spending contrast on every piece that was
not the active seat's, which is a budget NFR-12 has none of.

**The report sentence this is for:** a requirement that is measured by an automated test, and that has been
failing visibly for three days rather than quietly, moved because the test made the gap impossible to
forget. Row 8 of design spec 01's sign-off table recorded it as a question, and the question is what carried
it into the next handoff.

### NFR-12 is met: 2026-09-02, design handoff 06

The mark is on the piece. `.pawn__mark` is an ink shape at 38 % of the pawn, clipped per seat to a circle,
a triangle, a square or a diamond, sitting low on the disc so it clears the eyes. `greyscale.spec.js`
asserts the four shapes in colour and again under a greyscale filter, and it carries no expected-failure
marker. The requirement's acceptance criterion, "a greyscale screenshot still identifies each player's
pawns", is satisfied by something a screenshot can show rather than by a contrast measurement standing in
for it.

| | |
| --- | --- |
| Requirement | NFR-12, `should have` ([Requirements-Specification.md](../../Project-Management/Requirements-Specification.md) row NFR-12) |
| Answered by | Design spec 06, D48 to D50, which closes D16 of handoff 02 |
| Open from | 2026-08-30, when D2 removed the non-colour identifier. **Three days** |
| Closed by | Four shapes on the pieces, plus the same four already on the HUD, the chrome and two overlay panels from spec 04 |
| Test | `tests/e2e/greyscale.spec.js`, first case, passing in all three browsers with no expected failure |

**The two numbers that stop being asserted, kept here on purpose.** The retired luminance case measured
the four seat colours in greyscale: the worst pair was red against blue at **1.146**, ten levels apart out
of 255, against a threshold of **1.30** derived as the best an evenly spread four-value palette can reach
over the range these hues span. Both figures live here now, next to the requirement, because the palette
did not change and the thinness is still true. **Anybody proposing to move a seat colour has to read them
first.** The derivation itself is in [08-quality.md](08-quality.md).

**The palette was deliberately not re-spread**, which was D2's other way out. Darkening blue and
lightening green a step would buy a margin the shape now provides, and it would cost the four hues that
came from the layout template verbatim, every screenshot in these notes, handoff 01's sign-off and a
Product Owner decision. If the palette is ever re-spread it should be for a reason of its own and not to
satisfy a requirement that is already met by other means.

**The report sentence.** The only requirement in this project that a design decision actively blocked was
closed by the same loop that created it: the identifier was delivered in handoff 01, removed on request,
recorded as a question in a sign-off table, re-asked as a numbered decision in handoff 02, half answered
in handoff 04, and closed in handoff 06 with a brief that existed only because a test kept failing in
public. **No issue on the board tracks any of that**, which is the same finding chapter 02 records about
the design loop generating work without generating cards for it.

### FR-31's arithmetic was redone, and the requirement got cheaper: 2026-09-01, design handoff 04

FR-31 asks that every region be visible at once at 1440 by 900 with no scrolling. Issue #35's HUD and issue
#39's chrome each needed a full-width row, and the way the code paid for them was to shrink the board and
both hand-card sizes by about nine per cent. `tests/e2e/skill-hand.spec.js` had caught 56 px of overflow, so
the change was forced by a measurement, and both files said so and asked the designer to overrule them.

**D35 overruled it by finding a cheaper thing to cut**, and the requirement is now satisfied with 18 px to
spare rather than 14: the two strips at the foot of the page, 148 px of grid for things that are usually
saying nothing, moved next to their subjects instead. The board and the cards went back to full size.

The fact worth carrying into the report is not the numbers, it is that **the implementation side made the
wrong trade and the requirement was the reason it was visible.** FR-31 is one of the few non-functional
requirements in this project with a number in it, which is what let a test catch the overflow, which is what
put the arithmetic in the brief, which is what let the designer see that the cut was in the wrong place.

### FR-30 was implemented before every must-have was closed, and its acceptance criterion had to be rewritten first: 2026-09-03, issue #45

Two facts for the scope story, and a third for the requirements story.

**A `could have` shipped ahead of the drop order.** The specification's own drop order lists FR-30 among
the first things to cut, and section 4.4 of the project plan deliberately left #42 to #46 unscheduled.
#45 was picked up anyway on 2026-09-02, because it turned out not to be greenfield: epic #38 had built the
whole trap substrate on 2026-08-31 and it was running invisibly. What #45 actually delivered is closer to
"finish a mechanic that already shipped" than "add a feature", which is a different risk profile from the
other four extended features and is why it went first.

**It cost far more than its 5 points, and that was known going in.** The planning conversation put eight
game-design questions to the Product Owner and every answer went the ambitious way: the rulebook wins over
the code, full chain reaction, every movement fires a trap, traps are public. That turned three rule
corrections into three new mechanics, a stun status, a nullification aura and a bounded displacement
chain, plus a new `core/` choke point and four file splits. The estimate was for the issue as titled; the
work was for the issue as decided.

**The acceptance criterion was one sentence and not testable.** "A trap placed on a tile fires when a
pawn enters that tile" says nothing about crossing, about the owner exemption, about where it may be
laid, or about whether anybody can see it. It was rewritten on 2026-09-02 to name all of those, so that
`tests/e2e/traps.spec.js` and `trap-fires.spec.js` assert the requirement as written rather than a reading
of it. The GDD sign-off table gained rows 12 to 14 for the three decisions the artwork never spoke to.

**A balance note, not a defect.** Banana Peel used to send a pawn home and now costs one turn for one
pawn. It was the only trap that cost a lap, so the game is measurably gentler than it was on 2026-09-01.
That is a playtesting question and belongs to whoever runs the next session, not to this issue.

### A `could have` a `must have` depended on: FR-43 rewritten and raised, 2026-09-04, issue #43

Three rows changed on one afternoon, and the interesting part is that the change was **forced by a
dependency between requirements** rather than chosen.

| Row | Before | After |
| --- | --- | --- |
| FR-01 | "a player count chosen from 2, 3 or 4" | the same, "of which at least one is a person", with unfilled seats played by bots |
| FR-43 | "LLM-powered bot opponents", `C` | "Local, rule-based bot opponents take the seats no person fills", `S` |
| FG-18 | "LLM-powered bot opponents", `could have` | "Local, rule-based bot opponents", `should have` |

**The dependency is what made this a scope decision and not a wording fix.** US-01, written earlier the
same day, gives a match a lower bound of **one** person. A single-player seat is only playable if the
other seats play themselves, so FR-01's new bound is unbuildable if FR-43 is cut. A `could have` that a
`must have` depends on is a broken dependency, and the fix is to raise it.

**The LLM was dropped, and dropping it resolved a contradiction nobody had noticed.** FR-03's acceptance
criterion is a match completed *without any network connection*. An LLM-backed bot needs a network call.
The two requirements had contradicted each other since both were written, and it stayed invisible
because FR-43 was a `could have` nobody was building. **This is the second time in this project that
writing a document found a defect in another document** rather than in the code, and it is worth a
sentence in the report: the traceability column is what made it visible.

The rejected alternative was to keep the LLM and give FR-03 an exception. It costs a network dependency,
an API key, a failure mode and a per-request cost, all for a `could have`, and it would have made
"plays without a network" false for the one configuration a single player uses.

**What is still open, and named rather than implied:** choosing bots happens through `?bots=` in the
address bar. A setup screen is a separate issue, and its design question is D86 of design brief 13.

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- ~~MoSCoW prioritisation exists as labels but no requirement has been written against them; the
  backlog is not in this repository.~~ **Superseded 2026-08-06**: the backlog is now readable and
  transcribed above. What remains open: no issue has an acceptance criterion or a written
  requirement in its body, so the MoSCoW labels still prioritise titles rather than specifications.
  Named as the first entry in *Prerequisites for measurability* in
  [SMART-Analysis.md](../../Project-Management/SMART-Analysis.md), with a proposed owner and the date
  2026-08-23, because it blocks all four sub-goals, because "epic closed" otherwise means only that someone
  ticked a box.
- ~~Whether the epic → task decomposition is recorded in GitHub or only implied by titles.~~
  **Verified 2026-08-06:** real sub-issue links, table above.
- Phase label `1-initialization` is used on the board but missing from `CLAUDE.md`'s phase-label list.
  Add it there, or rename the 5 issues that use it.
- ~~Win condition is stated informally ("first player home wins") and has not been specified against
  edge cases: overshooting the goal with a high die, what happens on an exact-count requirement.~~
  **Proposed 2026-08-09** as FR-13 (exact count required, overshoot illegal). ~~Still open as a
  *decision*: the alternative is bouncing back from the home square, and the Product Owner has not
  confirmed either.~~ **Written as a rule 2026-08-22** in section 6.2 of
  [Game-Design-Document.md](../../Project-Management/Game-Design-Document.md), with bouncing back
  named as the rejected alternative and the reason it lost. What remains open is the Product Owner's
  sign-off, tracked in section 9 of that document, not the rule.
- No user stories exist yet. Whether the module expects them in the report is unknown.
- Energy/resource system is listed in the Sprint 2 plan
  ([01-Github-Project.md](../../Project-Management/01-Github-Project.md)) but appears in neither the
  one-pager nor the README: its status as MVP or stretch goal is undecided. **2026-08-09:** carried
  into the specification as FR-37 with priority `W`, because an unspecified mechanic cannot be built.
  Reversing that needs rules, not a re-prioritisation.
- ~~**How a player acquires skill cards is undefined** (FR-22, FR-27): no draw rule, no hand size, no
  discard rule anywhere in the sources. Blocks Sprint 2.~~ Raised 2026-08-09, **ruled 2026-08-22** in
  section 6.5 of [Game-Design-Document.md](../../Project-Management/Game-Design-Document.md).
- ~~**Three movement rules are undefined** (FR-12 own-pawn collision, FR-13 exact count, FR-14 no
  legal move). Proposals exist in the specification; none is confirmed.~~ Raised 2026-08-09,
  **ruled 2026-08-22** in sections 6.1 to 6.3 of the game design document.
- ~~**Dice pool composition is undefined** (FR-17): which denominations, how many copies of each.~~
  Raised 2026-08-09, **ruled 2026-08-22**: 20 cards over 7 denominations, section 5.1 of the game
  design document.
- **All eight rule decisions above are unsigned by the Product Owner.** They are written as rules so
  that implementation is unblocked; the sign-off table is section 9 of the game design document.
  Raised 2026-08-22. This is now the open item, in place of the four struck through above.
- **The pool composition and the skill card set are unbalanced by evidence.** The probability
  arithmetic exists, no playtest does, and no expected match length is stated. First candidate for a
  simulation over the headless `core/` layer once it exists. Raised 2026-08-22.
