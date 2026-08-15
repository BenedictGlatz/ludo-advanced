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

### Goal catalogue — written 2026-08-09

The requirements above existed only as rules prose, hard constraints and issue titles spread over
four documents. They are now stated as a checkable goal catalogue in
[Functional-and-Non-Functional-Goals.md](../../Project-Management/Functional-and-Non-Functional-Goals.md):

- **FG-01 – FG-16** — functional goals for the MVP, grouped along the four `must have` epics
  (#36–#39) so the goal list and the board decompose the same way.
- **FG-17 – FG-21** — the `should have` / `could have` items, named explicitly as *outside* the MVP.
- **NFG-01 – NFG-08** — non-functional goals derived from the hard constraints in
  [CLAUDE.md](../../../CLAUDE.md): layering, the 300-line limit, full i18n, the restricted dependency
  set, the ≥ 80 % coverage target for `core/` and `state/`, static browser deployment, per-commit
  documentation, and comprehensible game state.
- Section 3 of that file is the **traceability table** epic → FG → constraining NFG.

Each goal carries a **Source** line and a reason; goals derived rather than quoted say so. Nothing in
the catalogue is a new requirement — it is a restatement of existing sources in checkable form, which
is why it lives in Project-Management rather than here.

**Negative findings surfaced by writing it, none of them previously recorded:**

- **No performance goal exists** — no frame rate, load time or input latency anywhere. Defensible for
  a turn-based board game, but it needs to be named as a deliberate omission rather than left blank.
- **No browser support matrix** — no minimum versions, and no statement on whether mobile or tablet
  is in scope. Relevant because the board is a wide layout.
- **No accessibility goal** — and colour is the primary means of distinguishing players in Ludo, so
  colour-blind accessibility is a foreseeable question for this game specifically, not a generic one.
  Per [CLAUDE.md](../../../CLAUDE.md) *Design and UI* this is a Claude Design decision and was not
  invented in the catalogue.
- **NFG-02 (300-line limit) has no automated enforcement.** The rule is stated in `CLAUDE.md` and
  nothing checks it; an ESLint `max-lines` rule would close the gap and is not configured.
- The **Resource/Energy System** has deliberately *no* goal ID, because assigning one would decide an
  open question by accident. It is listed as undecided in section 1.5 of the catalogue.

### Requirements specification — written 2026-08-09, issue #13

[Requirements-Specification.md](../../Project-Management/Requirements-Specification.md) turns the
goal catalogue into **45 functional (`FR-nn`) and 12 non-functional (`NFR-nn`) requirements**, each
with an **acceptance criterion**, a MoSCoW priority and a trace to a goal or a backlog issue. It is
the first place in the project where a requirement is stated in a form that can be checked as passed
or failed.

- **MoSCoW distribution:** 39 must, 10 should, 7 could, 1 won't (of 57).
- **22 requirements are marked `†` — not derivable from any existing document.** They were added
  because the rules are incomplete without them, and each is a proposal pending Product Owner
  confirmation.

**Findings, all of them things the specification exposed rather than created:**

- **The rulebook never says how a player acquires a skill card.** No draw rule, no hand size, no
  discard rule (FR-22, FR-27). The Skill Card Pool therefore has no defined behaviour at all. This
  is the largest single hole found so far and blocks Sprint 2 planning.
- **Three core movement rules do not exist anywhere:** landing on one's own pawn (FR-12), exact
  count to enter home (FR-13), and what happens when a roll produces no legal move (FR-14). FR-14
  is not an edge case here — with dice up to D20 in the pool it fires regularly.
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
  one movement rule is unplayable rather than partially playable. The consequence — that the
  schedule buffer sits almost entirely in the should/could tail and in online multiplayer — is
  stated in the specification rather than smoothed over.
- **The resource/energy system is priorised `W` (won't have this time)** on the grounds that an
  unspecified mechanic cannot be built. Note that issue #35 is titled *Game HUD & Resource Display*,
  so the backlog assumes it exists. Resolving the open question below now has a concrete owner and a
  concrete cost.

**Still true after writing it:** the acceptance criteria live in this document, not on the issues.
All 47 backlog issues still have empty bodies, so the board continues to prioritise titles until the
criteria are copied onto the issues or the issues link here.

### Project goals formulated SMART — 2026-08-09, issue #9

Full document: [SMART-Analysis.md](../../Project-Management/SMART-Analysis.md). Facts, not the
argument:

- **One overall goal plus four sub-goals**, one sub-goal per `must have` epic. The sub-goal cut
  follows the epic structure rather than the sprint structure, because the epics are what the MoSCoW
  labels already prioritise — a sprint-shaped cut would have introduced a second, competing breakdown.
- The overall goal binds five checks: a full game completed by 2–4 players; #36–#39 closed; ≥ 80 %
  line coverage in `src/core/` and `src/state/`; complete `de` and `en` locales with no hardcoded
  user-facing string; no source file over 300 lines. The last four are the rules already fixed in
  [CLAUDE.md](../../../CLAUDE.md) — no new requirement was invented for the goal.
- **Sub-goal deadlines, taken from the board sprint markers** in [sprint-log.md](../sprint-log.md):
  SG1 #36 → 2026-08-23, SG2 #37 → 2026-09-06, SG3 #38 → 2026-09-06, SG4 #39 → 2026-09-17.
- **The `T` anchor is 2026-09-17**, the board's end of Sprint 3 — the only calendar date in the
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
  2026-08-23 — it blocks all four sub-goals, because "epic closed" otherwise means only that someone
  ticked a box.
- ~~Whether the epic → task decomposition is recorded in GitHub or only implied by titles.~~
  **Verified 2026-08-06:** real sub-issue links, table above.
- Phase label `1-initialization` is used on the board but missing from `CLAUDE.md`'s phase-label list.
  Add it there, or rename the 5 issues that use it.
- ~~Win condition is stated informally ("first player home wins") and has not been specified against
  edge cases: overshooting the goal with a high die, what happens on an exact-count requirement.~~
  **Proposed 2026-08-09** as FR-13 (exact count required, overshoot illegal). Still open as a
  *decision* — the alternative is bouncing back from the home square, and the Product Owner has not
  confirmed either.
- No user stories exist yet. Whether the module expects them in the report is unknown.
- Energy/resource system is listed in the Sprint 2 plan
  ([01-Github-Project.md](../../Project-Management/01-Github-Project.md)) but appears in neither the
  one-pager nor the README: its status as MVP or stretch goal is undecided. **2026-08-09:** carried
  into the specification as FR-37 with priority `W`, because an unspecified mechanic cannot be built.
  Reversing that needs rules, not a re-prioritisation.
- **How a player acquires skill cards is undefined** (FR-22, FR-27): no draw rule, no hand size, no
  discard rule anywhere in the sources. Blocks Sprint 2. Raised 2026-08-09.
- **Three movement rules are undefined** (FR-12 own-pawn collision, FR-13 exact count, FR-14 no legal
  move). Proposals exist in the specification; none is confirmed. Raised 2026-08-09.
- **Dice pool composition is undefined** (FR-17): which denominations, how many copies of each.
  Raised 2026-08-09.
