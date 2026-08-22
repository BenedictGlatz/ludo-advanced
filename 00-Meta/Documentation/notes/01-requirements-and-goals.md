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
| `must have` | #36 Core Game Engine & Board, #37 Enhanced Dice Pool System, #38 Skill Cards Mechanics, #39 UI / UX, Audio & Game State |
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
| #39 UI / UX, Audio & Game State | #35, #40, #41 |

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
