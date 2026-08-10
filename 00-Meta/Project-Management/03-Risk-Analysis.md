# Risk Analysis

## Risk Asessment Table

|  |  |  | Impact |  |
| --- | --- | --- | --- | --- |
|  |  | Low (L) | Medium (M) | High (H) |
|  | High (H) | 3 | 4 | 5 |
| LikeLihood | Medium (M) | 2 | 3 | 4 |
|  | Low (L) | 1 | 2 | 3 |

Priority is read straight off the matrix above (Likelihood × Impact cell): **1** is lowest, **5**
highest. Anything rated **4–5** needs a mitigation owner assigned before the sprint it would hit
starts, not after.

## Risk Ratings

| Risk | Category | Likelihood | Impact | Priority | Mitigation / Response |
| --- | --- | --- | --- | --- | --- |
| Multiplayer | Scope | M | M | 3 | No multiplayer technology chosen yet (see `sprint-log.md` Sprint 2 note); decide before Sprint 2 starts or fall back to local hot-seat only, which is already an accepted fallback. |
| Complexity | Process/Quality | L | H | 3 | Enforced by the 300-line file cap and the layered `core/`/`state`/`ui/` architecture in `CLAUDE.md`, which keeps any single unit small enough to review and test. |
| Sickness | Team | M | M | 3 | Three-person team with no formal backup; if it hits, re-scope the sprint rather than silently slip — record it in `sprint-log.md`'s Divergence section as it happens. |
| Sprint-plan vs. board-date contradiction | Schedule | H | M | 4 | Written plan (3×2 weeks + 1-week buffer) and the board's actual Sprint 0–3 dates disagree — Sprint 0 ran 2½ weeks and no buffer sprint exists on the board. Decide which numbering is authoritative and record it in `sprint-log.md` before Sprint 1 closes. |
| No velocity/burn-down data producible | Schedule | H | M | 4 | Board has no Story Points or Iteration field and `Status`/`Sprint` are unset on all 50 items, confirmed 2026-08-06 — the presentation deck's planned velocity and burn-down slides cannot be produced as things stand. Add the fields and start recording estimates now, not in week 8. |
| Resource/energy system scope undecided | Scope | M | M | 3 | Appears only in the sprint plan, not in the one-pager or README. Resolve as in/out of scope before Sprint 2 implementation begins (see `notes/01-requirements-and-goals.md`). |
| Board layout & win conditions underspecified | Scope | M | H | 4 | Rulebook exists at one-pager level only; edge cases (exact board layout, win-condition edge cases) are not written down. Ambiguity discovered during implementation forces rule decisions under time pressure — spec these out during Sprint 1 rather than mid-implementation. |
| Test coverage / discipline slips under time pressure | Process/Quality | M | M | 3 | ≥80% line coverage on `src/core/` and `src/state/` is a stated requirement; CI (`npm run test:coverage`) should gate merges rather than relying on discipline alone. |
| Documentation notes not kept per-commit | Process/Quality | M | H | 4 | The project's own retrospective source names late documentation as the sample report's single biggest weakness; the mandatory five-step per-change process in `CLAUDE.md` exists specifically to prevent repeating it, but only if actually followed every commit. |
| Role concentration / bus factor | Team | L | H | 3 | Each of the three team members holds one Scrum/management role and one distinct technical lead role (`01-Github-Project.md`) — no redundancy if one person is unavailable for an extended period. Cross-document each area's key decisions (already partly covered by the documentation-notes practice) so another member can pick it up. |
| External playtester availability | Team | M | M | 3 | Buffer-week plan needs 3–5 external people to playtest without instructions. Line up candidates well before week 8 rather than sourcing them the same week the video and slides are also due. |
| Unstable board-reading route (`memex-*` HTML/JSON parsing) | Technical/Tooling | M | L | 2 | Used to read the GitHub Projects board because the GraphQL API rejects unauthenticated requests even for public projects; this is not a stable interface and can break without notice. Adding `read:project` scope to the existing token would retire this route — see the 2026-08-06 addendum in `project-journal.md`. |
| Unapproved dependency blocks a feature | Technical/Tooling | L | M | 2 | `CLAUDE.md` requires asking the user before adding any runtime dependency beyond the approved set (`jquery`, `i18next`; dev: Vite, ESLint, Prettier, Vitest, Playwright). Flag a new dependency need as soon as it's identified, not when the feature is blocked on it. |
| Public repository / academic-integrity exposure | Compliance/Academic | M | M | 3 | Repository and GitHub project were made public to work around GraphQL's authentication requirement for reading board data. For a graded university project this also exposes the full source to copying; accepted so far because the module has no stated confidentiality requirement — revisit if that changes. |
| Live-demo hardware failure at presentation | Presentation | L | H | 3 | Sprint-plan buffer week already includes recording a 2-minute fallback gameplay video specifically to cover this case; keep it current as the game changes rather than recording it once early. |
