# 01 Requirements and goals

> **Covers:** who the game is for, what problem it solves, the MVP scope, prioritisation, and what
> is deliberately left out.
> **Does not cover:** how any of it is built (04–06), or how the work was organised (02).

## What this chapter must answer

- Who plays this, and in what situation.
- What classic Ludo does badly that this variant addresses.
- What the MVP is — the minimum that counts as the game working.
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
- The design intent is stated as giving the player "more options than just rolling dice" — the
  decision each turn becomes *which die to roll* and *which skill to play*, not only *which pawn to
  move*.

### Backlog and prioritisation as actually labelled — read 2026-08-06

46 issues, all `open`, read from the now-public repository. Phase labels split
`1-initialization` 5, `2-definition` 7, `3-planning` 9, `4-implementation` 21, `5-completion` 4.
Note that `1-initialization` is in use on the board but is **absent from the phase-label list in
[CLAUDE.md](../../../CLAUDE.md)**, which names only `2-definition` through `5-completion`.

**MoSCoW is applied to 9 of 46 issues (20 %).** The other 37 — including all 24 `documentation`
issues and every fine-grained implementation task (#26–#35, #40, #41) — carry no MoSCoW label:

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
(`should have`), and the LLM bot, expanded card set, trap cards and rule toggles (`could have`) —
matching the one-pager's framing of multiplayer and AI opponents as extensions.

**Negative finding:** all four epics have an **empty issue body**, as do their sub-issues. The
backlog is titles and labels only — there is not one acceptance criterion anywhere in the 46 issues.

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

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- ~~MoSCoW prioritisation exists as labels but no requirement has been written against them; the
  backlog is not in this repository.~~ **Superseded 2026-08-06** — the backlog is now readable and
  transcribed above. What remains open: no issue has an acceptance criterion or a written
  requirement in its body, so the MoSCoW labels still prioritise titles rather than specifications.
- ~~Whether the epic → task decomposition is recorded in GitHub or only implied by titles.~~
  **Verified 2026-08-06:** real sub-issue links, table above.
- Phase label `1-initialization` is used on the board but missing from `CLAUDE.md`'s phase-label list.
  Add it there, or rename the 5 issues that use it.
- Win condition is stated informally ("first player home wins") and has not been specified against
  edge cases: overshooting the goal with a high die, what happens on an exact-count requirement.
- No user stories exist yet. Whether the module expects them in the report is unknown.
- Energy/resource system is listed in the Sprint 2 plan
  ([01-Github-Project.md](../../Project-Management/01-Github-Project.md)) but appears in neither the
  one-pager nor the README — its status as MVP or stretch goal is undecided.
