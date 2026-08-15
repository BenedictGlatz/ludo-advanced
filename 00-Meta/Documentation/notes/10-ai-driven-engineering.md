# 10 AI-driven engineering and process

> **Covers:** how AI assistance was actually used in this project: where it fitted into the
> workflow, what it was good at, where it was not, and how its use was governed.
> **Does not cover:** the raw prompt list, which is Chapter 13. This chapter is the reflection;
> that one is the record.

## What this chapter must answer

- Which tools and models, and for what kind of work.
- How AI use is configured and constrained in this project: the conventions file, the layering
  rules, the dependency policy, the line limit. These exist partly so that generated code has hard
  boundaries to stay inside; that is worth saying.
- Where it fitted into the development workflow: which steps it performed, which it did not, and
  who reviewed what.
- Honest assessment: what it accelerated, what it got wrong, what needed rewriting. A chapter that
  reports only successes is not credible.
- How its use was recorded and made auditable.

## Facts

- `CLAUDE.md` is the binding conventions file for AI-assisted work in this repository. It fixes the
  stack, the architecture layering, the file-length limit, the dependency policy, the commit format
  and the documentation obligations. Generated code is constrained by it rather than free-form.
- Every prompt is recorded in `00-Meta/AI-Prompts/<github-username>/YYYY-MM-DD.json`, one file per
  person per day, append-only. Each entry carries the model, the verbatim prompt, the issue it
  relates to, a `topic`, a `use` classification and a summary of what it produced.
- The `use` field distinguishes prompts whose answers were merely informational from those that
  produced code that shipped. This is the field that shows whether an answer was weighed or simply
  accepted.
- Design and UI are developed with **Claude Design**, which has access to this directory. Claude
  Code does not invent design rules and does not overwrite existing ones; where a design
  specification is missing it asks rather than filling the gap.
- Documentation is written alongside development rather than afterwards: see
  [02-project-management.md](02-project-management.md) and the journal.

<<<<<<< Updated upstream
=======
### AI assistance as a precondition of the scope: 2026-08-09, issue #12

Established while writing [Feasibility-Study.md](../../Project-Management/Feasibility-Study.md), where
it carries its own section because the study's overall verdict is conditional on it.

- **Division of labour between the two tools:** Claude Design produces the UI specification and the
  2D assets; Claude Code produces the implementation and the running documentation. The boundary is
  already fixed in [CLAUDE.md](../../../CLAUDE.md): Claude Code does not invent design rules and asks
  when a specification is missing.
- **The team's own assessment, recorded as such:** without this leverage the scope defined in issue #9
  would not have been proposed at all: a smaller game or a longer calendar would have been necessary.
  The arithmetic behind it: four epics with twelve sub-issues, two implementers (the Product Owner
  does not implement), three two-week sprints, plus 24 documentation issues and a documentation
  obligation attached to every commit.
- **This makes AI use a precondition rather than an accelerator**, and the feasibility verdict says so
  explicitly instead of reporting a plain "feasible". A study that omitted it would have hidden its
  most load-bearing assumption.
- **Consequence 1: dependency on a single toolchain.** If it became unavailable for a sustained
  period mid-project, the MVP would not be reachable by 2026-09-17 and scope would have to be cut,
  most plausibly the audio and polish scope of #39 or the breadth of the skill card set. The risk
  treatment belongs to issue #11; this chapter records the dependency.
- **Consequence 2, the finding worth a paragraph in the report: the bottleneck moves from writing
  code to reviewing it.** When implementation is cheap to produce, the scarce resource is the team's
  capacity to read, judge and approve. This inverts the usual deadline instinct: the 300-line limit,
  the strict layering and the per-change notes are not overhead to drop under time pressure, they are
  what keeps generated output small enough to read and structured enough to judge.
- **Controls that already exist** rather than being promised: `CLAUDE.md` as a binding constraint set,
  the one-approval pull-request policy, and the append-only prompt log that makes every prompt
  auditable after the fact.
- **Open:** whether the module requires an explicit declaration of AI use beyond the prompt log is
  unknown, as the module's requirements are unknown.

>>>>>>> Stashed changes
## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- No generation script for Chapter 13 exists yet (`npm run docs:ai-index`).
- Only one team member's prompt log exists so far. If the other two use AI assistance and do not log
  it, the record is incomplete and the report has to say so.
- The honest assessment section cannot be written until there is real experience to report. Feed it
  from the `## Challenges` section of the journal as the project runs.
