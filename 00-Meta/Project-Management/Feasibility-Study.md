# Feasibility Study

Assessment of whether **Ludo Advanced** can actually be delivered — by this team, in the available
time, with the available means — done for issue **#12 (`documentation`, `2-definition`)**.

Three questions have been answered before this one. *What* is being built is fixed in
[SMART-Analysis.md](SMART-Analysis.md) (issue #9). *Which option* it is built with is fixed in
[Utility-Value-Analysis.md](Utility-Value-Analysis.md) (issue #47). *What the goals are* in detail is
issue #10. The question underneath all three is still open: **can it be done, and under what
conditions.** Sprint 1 starts on 2026-08-10, one day after this document, so the answer is due now
rather than as a formality at the end.

The short answer is **yes, conditionally** — and the largest single condition is not a technical one.
It is named in its own section below.

## Method and scope boundary

Five sections, each closing with one of three verdicts: **feasible** (nothing outstanding that could
prevent delivery), **feasible under conditions** (deliverable, but only if the named conditions are
met — each names who or what resolves it), or **not feasible**. Only facts already on record are used
as evidence — the one-pager, the board, `CLAUDE.md`, the documentation notes and the two analyses
named above. Nothing here is an estimate invented for this document.

**This study names conditions, not risks.** A *condition* is something the team can decide or do, and
the verdict depends on it; a *risk* is an uncertain event with a probability, an impact and a
mitigation. Conditions are listed here; the register belongs to **#11**. The remaining boundaries, so
nothing is written twice: the **comparison of the options** (2D / 2.5D / 3D) is **#47**, already
merged, and this study assesses the chosen option rather than re-opening the choice; the **effort
estimate** is **#16**, so no hours appear below; the **goal catalogue** is **#10** and the
**requirements specification with the MoSCoW rationale** is **#13**.

## What is being assessed

The object of the study is the MVP as defined by the SMART goal in issue #9, and nothing wider:

- The four `must have` epics **#36–#39** and their twelve sub-issues.
- A browser-playable 2D build in which 2–4 players can complete a full game, with both card pools in
  play.
- By **2026-09-17**, the board's end of Sprint 3.

Explicitly **outside** the assessment: online multiplayer (#42, `should have`) and the LLM bot,
expanded card set, trap cards and rule toggles (#43–#46, `could have`). If those were in scope, the
verdicts below would not hold.

## Alternatives already examined

A full 3D board in Unity was the team's first idea, and a 2.5D middle option was considered alongside
it. Both were rejected — first informally in the one-pager's initial risk assessment, then formally in
[Utility-Value-Analysis.md](Utility-Value-Analysis.md), which scores **2D at 4.20, 2.5D at 2.75 and 3D
at 2.30** out of 5.00. Pygame was rejected earlier still, as offering less extensibility and a harder
multiplayer path. Worth stating explicitly, because it is the link between that document and this
one: **3D lost on feasibility grounds, not on taste.** The two criteria that decided it — team competence in C# and time
available — are exactly the two dimensions assessed below. The decision recorded on 2026-08-06 puts it
plainly: *"Because of the missing time (magical triangle), we decided to use a 2D board to be able to
deliver more quality."* This study therefore starts where that one ended, and asks whether the winning
option is feasible in absolute terms rather than only in relative ones.

## 1 Technical feasibility

**The mechanics reduce to data and pure functions.** The Dice Card Pool is a draw of three from a
finite set of D2–D20 cards, a selection, a random number in a range, and a return of the three cards.
The Skill Card Pool is a deck, a hand, and per-card effects applied to a game state. Neither needs
physics, a real-time loop, a server or networking — multiplayer is outside the MVP, so the MVP is a
local hot-seat game with no backend at all. Deployment is correspondingly small: Vite produces a
static `dist/`, and the candidates named in [Brainstorming.md](../../Brainstorming.md) are GitHub
Pages and itch.io, so there is nothing to operate. Asset production is 2D only — sprites, board, card
faces, UI skins — which is the pipeline the option choice bought: no modelling, rigging, lighting or
camera work, and no engine ramp-up.

**The architecture is chosen so that the goal is checkable.** The `core/ → state/ → ui/` layering in
[CLAUDE.md](../../CLAUDE.md) keeps the rules free of the DOM, which is what makes them unit-testable
without a browser — and therefore what makes the ≥ 80 % coverage criterion in the SMART goal reachable
rather than aspirational. A design in which rules and rendering were interleaved would have made the
same goal unmeasurable in practice.

**Open technical points, named rather than hidden:**

- The **win condition is specified only informally** ("first player home wins") and has no rule for
  overshooting the goal with a high die — a real question when the pool goes up to D20. This is a
  rule that must be fixed before epic #36 can be closed.
- The **energy/resource system** appears in the Sprint 2 plan in
  [01-Github-Project.md](01-Github-Project.md) but in neither the one-pager nor the README. Its status
  is undecided.
- **No CI workflow and no deployment target** have been decided.
- **Multiplayer has no chosen technology** — outside the MVP, but it is named in the sprint plan.

None of these blocks delivery: two are outside the MVP, one is a small decision, and the first is a
rulebook question of the kind Sprint 0 was meant to settle.

**Verdict: feasible.** The chosen stack is not merely adequate for this game — it is oversized for it,
which is the correct direction for a fixed deadline.

## 2 Schedule feasibility

The dates are the board's, transcribed in [sprint-log.md](../Documentation/sprint-log.md):
Sprint 0 to 2026-08-09, Sprint 1 to 2026-08-23, Sprint 2 to 2026-09-06, Sprint 3 to 2026-09-17.

**Sprint 0 ends today, and the repository still contains no source code, no `package.json` and no
tooling.** Sprint 1 therefore has to bootstrap the project before it can implement anything — install
the toolchain, create the build, wire up tests and linting — and that work is not in Sprint 1's
planned scope. It is also the sprint that carries the largest epic (#36, four sub-issues). This is the
finding already recorded in the SMART analysis; here it is a schedule condition rather than an
observation.

**The board has no buffer sprint.** The written plan has three sprints of two weeks plus a one-week
buffer for playtesting and the presentation. The board defines Sprint 0–3 and stops, and its Sprint 3
is 1½ weeks. Either Sprint 3 *is* the buffer under another name — in which case the polish, audio and
menu scope has to move earlier — or the buffer was dropped, in which case there is no slack at all
behind 2026-09-17. Both readings are live; nothing in the repository decides between them.

**The planned sprint scope is wider than the goal.** Sprint 2 in
[01-Github-Project.md](01-Github-Project.md) lists multiplayer and the resource/energy system, and
neither is part of the `must have` set. Reconciling the sprint plan with the MoSCoW labels does not
cost schedule — it releases it. This is the one place in the study where the finding is favourable.

**Conditions:** the toolchain bootstrap is completed in the first days of Sprint 1 and treated as
scope rather than overhead (Scrum members, first `src/` commit); Sprint 2 is reconciled with the
MoSCoW labels, with multiplayer and the energy system either out or explicitly in (Product Owner,
sprint planning); and the buffer-sprint contradiction is decided and written into
[sprint-log.md](../Documentation/sprint-log.md).

**Verdict: feasible under conditions.** The calendar holds if Sprint 1 absorbs its own bootstrap and
Sprint 2 is cut back to the MVP. It does not hold if both slip.

## 3 Personnel and organisational feasibility

**The competence question is already answered by the option choice.** All three members work in
JavaScript; two of three do not know C#. The 2D web build removes the learning curve entirely rather
than scheduling around it — which is why that criterion carried the highest weight in the
Nutzwertanalyse.

**Two people implement four epics.** The Product Owner defines *what* and *why*; implementation sits
with the two Scrum Members, who also do the Scrum Master work themselves. There is no dedicated Scrum
Master and therefore no one whose role is to absorb process overhead. This is the single hardest
number in the study, and it is the reason the next section exists.

**The organisational substrate is thinner than the process assumes.** All of the following are on
record in [02-project-management.md](../Documentation/notes/02-project-management.md): the two role
tables in the repository contradict each other on whether a Scrum Master exists; `Status` and `Sprint`
are unset on all 50 board items; assignees are set on only 3 of 46 issues; and no Definition of Done
has been written down anywhere. A three-person team can coordinate informally, so none of this is
fatal — but "done" not being defined is what makes the goal criteria unreadable, which is why the same
item appears in the SMART analysis under *Prerequisites for measurability*.

**Conditions:** the role contradiction resolved, a written Definition of Done, and board fields
populated far enough to see where work stands. The list is the one already named in
[SMART-Analysis.md](SMART-Analysis.md) with owners and the date 2026-08-23; it is referenced here, not
repeated.

**Verdict: feasible under conditions** — with the load-bearing condition in the next section.

## AI-assisted development as a precondition

This is the section the overall verdict rests on, so it is stated directly rather than folded into the
technical assessment.

**What is delegated.** **Claude Design** produces the UI specification and the 2D assets. **Claude
Code** produces the implementation and the running documentation, constrained by
[CLAUDE.md](../../CLAUDE.md). The division is already fixed in the conventions: Claude Code does not
invent design rules and asks when a design specification is missing.

**Why this is a precondition and not an accelerator.** The scope is four epics with twelve sub-issues,
carried by two implementers, across three two-week sprints — on top of 24 documentation issues and a
per-change documentation obligation that adds work to every single commit. The team's own assessment,
recorded here as the team's own: **without this leverage the scope defined in issue #9 would not have
been proposed at all**, and a smaller game or a longer calendar would have been necessary. The
feasibility verdict of this study is therefore conditional on the toolchain, and a study that reported
"feasible" without saying so would be hiding its most important assumption.

**What the team keeps.** Review and ownership of every generated artefact — and the mechanisms for it
already exist rather than being promised: `CLAUDE.md` as a binding constraint set (stack, layering,
300-line limit, dependency policy, no hardcoded strings), the one-approval pull-request policy, and
the append-only prompt log under `00-Meta/AI-Prompts/`. Generated code is reviewed and merged by
people, and the coverage and lint gates apply to it unchanged.

**The downside, stated rather than glossed.** Two consequences follow from the same decision:

- **A dependency on a single toolchain.** If it became unavailable for a sustained period mid-project,
  the MVP as defined would not be reachable by 2026-09-17 and scope would have to be cut — most
  plausibly the audio and polish scope of #39, or the breadth of the skill card set. That is a
  consequence of this verdict; handling it is **#11**.
- **The bottleneck moves from writing to reviewing.** When implementation is cheap to produce, the
  scarce resource becomes the team's capacity to read, judge and approve it. This is the strongest
  practical argument for keeping the project's own quality rules rather than dropping them when time
  gets short: the 300-line file limit, the strict layering and the per-change notes are precisely what
  keeps generated output reviewable at the pace it arrives.

**Disclosure.** The prompt log provides traceability of what was produced with AI assistance. Whether
the module requires an explicit declaration beyond that is unknown — it is part of the standing open
question about the module's actual requirements in
[00-index.md](../Documentation/00-index.md).

**Verdict: feasible, conditional on this** — the toolchain remains available, and the team keeps
reviewing rather than merely accepting what it produces.

## 4 Economic feasibility

There is no budget, and none is needed. The relevant positions:

| Position | Cost |
| --- | --- |
| Repository, board, issue tracking | GitHub free tier |
| Toolchain (Vite, Vitest, Playwright, ESLint, Prettier) and runtime libraries (jQuery, i18next) | Open source, no licence fee |
| Hosting | GitHub Pages or itch.io — free for a project of this size |
| Development environment | Node.js and an editor, both free |
| AI assistance | A Claude subscription, which already exists and is not incurred for this project |

No figure is given for the subscription, deliberately: the project's documentation rules keep numbers
next to the command or invoice that produces them, and an approximate price would be quoted later as
a fact. The real cost is **student time**, and no hours appear here either. The team decided against
hour-level effort tracking on 2026-08-06 — recorded with its reasoning in
[project-journal.md](../Documentation/project-journal.md) — so there would be no actuals to compare an
estimate against, and effort estimation is a separate backlog item, **#16**. A capacity figure
invented here would be a number nobody could check, which is the opposite of what this document is
for.

**Verdict: feasible.** Cost is not a constraint on this project; time is.

## 5 Legal and licensing feasibility

**The game name and board.** *Mensch ärgere dich nicht* is a registered trademark of its commercial
publisher. The project uses the generic English name *Ludo*, its own board layout and its own assets,
and the underlying game itself is a long-standing public-domain derivative of Pachisi — game rules as
such are not protected the way a specific graphical design or a brand name is. The condition is simply
to keep it that way: no publisher artwork, no protected name, no reproduced board design. The team
should confirm rather than assume this before any public release, since the repository is already
public.

**The repository licence is undetermined.** `README.md` says "To be determined" while the repository
is already public and the deployment candidates assume it stays that way. That is a decision to take,
not a formality — without a licence, "public" and "reusable" are not the same thing.

**Dependency licences** are to be checked against each package's own `LICENSE` file once
`package.json` exists. The stack is conventional open-source tooling and no obstacle is expected, but
the check is named here as a task rather than asserted as a finding.

**AI-generated assets and AI use.** Rights in the generated 2D assets and the university's rules on
declaring AI assistance both need confirming against the module's requirements, which are not known.
The prompt log already provides the record; what is missing is the requirement it should satisfy.

**Verdict: feasible under conditions** — repository licence decided, dependency licences checked when
they exist, module rules on AI use confirmed.

## Summary

| Dimension | Verdict | Condition |
| --- | --- | --- |
| Technical | Feasible | — (win condition to be specified before #36 closes) |
| Schedule | Feasible under conditions | Sprint 1 absorbs the bootstrap; Sprint 2 cut to the MVP; buffer question decided |
| Personnel / organisational | Feasible under conditions | Definition of Done written; role contradiction resolved; board fields populated |
| AI toolchain | Precondition | Remains available; team reviews rather than accepts |
| Economic | Feasible | — |
| Legal / licensing | Feasible under conditions | Repository licence decided; dependency and AI-use questions checked |

## Interpretation

**The 2D decision did not remove the project's risk — it converted it.** Before, the open question was
"can two of the three of us learn C# and still ship" — a competence question. After, it is "can two
implementers finish four epics in eight weeks" — a schedule question. The Nutzwertanalyse scores that
trade as clearly better, and it is: a competence gap and a fixed deadline compound each other, while a
schedule problem alone can be managed by cutting scope, and the MoSCoW labels are already the
instrument for cutting it. But a feasibility study that concluded "2D, therefore feasible" would have
missed that the binding constraint moved rather than disappeared. Every condition in this document
sits in the dimension it moved to.

**The binding constraint is review capacity, not writing capacity.** This is the non-obvious
consequence of the AI toolchain, and it points the opposite way from where time pressure usually
pushes a team. The instinct under deadline is to relax the process rules — skip the note, waive the
review, let a file grow past 300 lines. Here those rules are load-bearing: they are what keeps
generated output small enough to read and structured enough to judge. Dropping them would not buy
speed; it would remove the only mechanism by which the team still knows what its own codebase does.

## Conclusion

**Go — conditional.** Ludo Advanced as scoped in issue #9 is deliverable by 2026-09-17 with this team,
this stack and no budget, provided the conditions below are met. None of them is expensive; all of
them are decisions rather than work.

1. **Sprint 1 treats the toolchain bootstrap as scope**, not as something that happens before the real
   work — it starts 2026-08-10 with an empty `src/`.
2. **Sprint 2 is reconciled with the MoSCoW labels** — multiplayer and the energy system are not in
   the `must have` set, and the sprint plan still lists them.
3. **The buffer-sprint contradiction is decided** and written into
   [sprint-log.md](../Documentation/sprint-log.md).
4. **A Definition of Done is written** — it is the same prerequisite the SMART analysis names, and
   without it "epic closed" is not comparable between three people.
5. **The AI toolchain stays available and the team keeps reviewing what it produces.** This is the
   condition the verdict most depends on and the one the team controls least; the risk side of it
   belongs to **#11**.
6. **The repository licence is decided** before the first public build.

**One caveat, the same one the SMART analysis carries.** 2026-09-17 is the end of Sprint 3 on the
GitHub board and the only calendar date in this repository; the module's actual submission and
presentation date is unknown. The schedule verdict is the one that re-anchors if that date turns out
to be different — earlier, and condition 1 and 2 become hard requirements rather than
recommendations; later, and the buffer question resolves itself.
