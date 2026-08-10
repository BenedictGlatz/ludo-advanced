# 10 AI-driven engineering and process

> **Covers:** how AI assistance was actually used in this project — where it fitted into the
> workflow, what it was good at, where it was not, and how its use was governed.
> **Does not cover:** the raw prompt list, which is Chapter 13. This chapter is the reflection;
> that one is the record.

## What this chapter must answer

- Which tools and models, and for what kind of work.
- How AI use is configured and constrained in this project — the conventions file, the layering
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
- Documentation is written alongside development rather than afterwards — see
  [02-project-management.md](02-project-management.md) and the journal.

## Decisions

<!-- Promote decision blocks here from project-journal.md when this chapter is written. -->

## Open / to verify

- No generation script for Chapter 13 exists yet (`npm run docs:ai-index`).
- Only one team member's prompt log exists so far. If the other two use AI assistance and do not log
  it, the record is incomplete and the report has to say so.
- The honest assessment section cannot be written until there is real experience to report. Feed it
  from the `## Challenges` section of the journal as the project runs.
