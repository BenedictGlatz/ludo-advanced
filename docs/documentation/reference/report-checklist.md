# Report checklist: what a project report is normally expected to cover

> ## ⚠ Not binding for this module
>
> This checklist is adapted from the examination conditions of a **different module with a
> different professor**, and those conditions were themselves marked *"ENTWURF — Änderungen
> erwartbar"* (draft, changes expected). Nothing here is a requirement for Ludo Advanced.
>
> **No requirements for this module exist in this repository at all**: no chapter catalogue, no
> page count, no deadline, no grading breakdown, no required front matter. Until they do, this file
> is the best available guess at what a software project report is normally asked for, nothing more.
>
> **Replace this file with the real requirements the moment they are available.** Do not let a
> guessed checklist quietly become the specification.
>
> What is genuinely transferable is the *shape* of the expectations and one structural rule (below),
> not the specific chapters or page budgets. The other module's WASM-specific chapters, page
> budgets, grade weighting and submission dates have all been removed because they belong to that
> project.

---

## The one rule worth keeping regardless

**A point the project does not fulfil is named and justified, never silently omitted.**

Completeness of coverage beats depth on any single point. A report that touches every expected topic
briefly reads as thorough; one that is deep on five topics and silent on four reads as incomplete,
because the reader cannot tell whether the missing four were considered and rejected or simply
forgotten.

The sample report demonstrates this directly. It states that no dedicated formatter is integrated,
that no production build was ever generated, that TypeScript was deliberately not used, and that its
overall coverage is 12.67 %, each with a reason, and it was graded well. Those are not
oversights that survived review; they are the reason the report is credible.

---

## Coverage checklist

Work through this when assembling the report. Every line gets an answer, including "not applicable
here, because…".

### Requirements and goals

- [ ] Who the users are, what the core process is, what problem is being solved.
- [ ] The solution, and the MVP boundary: what is in, what is deferred.
- [ ] Development focus: what the work was optimised for.

### Project management and process

*Weighted heavily here: this module is project-management focused.*

- [ ] Process model and why it was chosen.
- [ ] Roles and responsibilities.
- [ ] Sprint structure and cadence.
- [ ] Backlog management: board, columns, fields, estimation, prioritisation.
- [ ] Ceremonies actually held.
- [ ] Branch structure, review policy, definition of done.

### Tech stack

- [ ] Stack overview: layer, technology, version, purpose.
- [ ] Constraints that drove the choices.
- [ ] Architecture decisions, including what deliberately does *not* exist.

### Architecture and building blocks

- [ ] List the significant components.
- [ ] Component details and how they interact.
- [ ] **One** significant component shown in depth, with its internal structure.
- [ ] Modularisation: how the logic is split across files, and along which seams.
- [ ] State management.
- [ ] Routing: or a stated reason there is none.
- [ ] Persistence: or a stated reason there is none.
- [ ] Implementation of the domain logic.

### Tooling

- [ ] Scripts, each with its purpose.
- [ ] Package management.
- [ ] Linter.
- [ ] Formatter.
- [ ] Documentation enforcement (JSDoc or equivalent).
- [ ] TypeScript: used, or deliberately not, with a reason.
- [ ] Dev build.
- [ ] Production build.
- [ ] Deployment.

### Quality

- [ ] Unit tests set up, coverage report produced.
- [ ] E2E tests set up, report produced.
- [ ] CI/CD: build, test, lint, format, deploy.
- [ ] Code comments and visual structuring of the source.
- [ ] Performance or accessibility audit, if applicable: and if not, why not.

### Source code overview

- [ ] Size.
- [ ] Metrics, each interpreted.

### Project report

- [ ] Plan versus actual: what was planned, what was actually delivered.
- [ ] Challenges encountered.
- [ ] Lessons learned: what the team carries forward.

### AI index

- [ ] Every prompt, grouped by topic, with the model and how the answer was used.

### Front matter and appendix

- [ ] Table of contents.
- [ ] List of tables.
- [ ] List of abbreviations.
- [ ] Appendix holding the substantial working results (tables, figures, code excerpts), each
      referenced from the running text.

---

## Criteria that apply to the code, not the report

These are worth noting because they are easy to leave until the last day and cannot be fixed then:

- The code runs, using the commands as documented. Verify the README's commands actually work on a
  clean clone.
- Linter and formatter active and **green**.
- Meaningful test coverage.

Record the evidence in [../notes/07-tooling.md](../notes/07-tooling.md) and
[../notes/08-quality.md](../notes/08-quality.md) once it has been verified: not from memory, from a
command that was run.
