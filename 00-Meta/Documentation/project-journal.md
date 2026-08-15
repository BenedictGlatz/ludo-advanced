# Project journal

Append-only. Never rewrite an earlier entry: if something turns out to have been wrong, add a new
entry saying so and why. The value of this file is that it records what was believed at the time.

Three sections, each with its own rule:

- **Log**: one line per working session. What was done, which sprint, which issue.
- **Decisions**: one block per non-obvious technical or process decision. Raw material for the
  report's justifications, so it must include what was *rejected*.
- **Challenges**: anything that cost more than roughly 30 minutes of unplanned work. Feeds
  Chapter 11.

Dates are absolute (`YYYY-MM-DD`). No hour tracking: the team decided against it; plan-versus-actual
is tracked as scope and dates in [sprint-log.md](sprint-log.md).

---

## Log

- **2026-08-06**: Repository and GitHub project created. Sprint 0.
- **2026-08-06**: `CLAUDE.md`, `README.md` and `CHANGELOG.md` written; stack fixed to
  JavaScript + jQuery + Vite + i18next, Vitest and Playwright for tests, ESLint and Prettier.
  Sprint 0.
- **2026-08-06**: Documentation notes established under `00-Meta/Documentation/`: steering index,
  13 chapter notes, this journal, sprint log, abbreviation list, and two adapted reference
  transcripts. `CLAUDE.md` extended with a documentation-notes section and a mandatory
  per-change step list. Sprint 0.
- **2026-08-06**: Repository and GitHub project made public; board read for the first time from the
  development environment. 46 issues, 50 board items, 16 fields and 3 views transcribed into
  Ch. 01 and Ch. 02. Sprint calendar dates recovered and filled into `sprint-log.md`. Four negative
  findings recorded about board configuration. Sprint 0.
- **2026-08-06**: `dev` pushed to `origin` for the first time (four documentation commits; the remote
  had only `main` until now). Issues #4 *Create a Claude.md* and #2 *Github Setup + Documentation*
  closed with closing comments. An earlier negative finding corrected: an authenticated GitHub token
  was available all along, in the Git Credential Manager. Sprint 0.
<<<<<<< Updated upstream
- **2026-08-10** — Risk register in `03-Risk-Analysis.md` expanded from 3 to 16 risks, all traced to
  facts already recorded in the project's own documentation. Issue #11, Sprint 0.
=======
- **2026-08-09**: Feasibility study written for issue #12, assessing the chosen 2D option across
  five dimensions (technical, schedule, personnel/organisational, economic, legal). Verdict: a
  conditional Go, with the AI toolchain named as the precondition it rests on.
  `00-Meta/Project-Management/Feasibility-Study.md`; facts in Ch. 03 and Ch. 10. Sprint 0.
>>>>>>> Stashed changes

---

## Decisions

<<<<<<< Updated upstream
### 2026-08-09 — Goals are catalogued in Project-Management, not in the chapter note

- **Chosen:** one standing document,
  [Functional-and-Non-Functional-Goals.md](../Project-Management/Functional-and-Non-Functional-Goals.md),
  holding every functional and non-functional goal with an ID, a source and a reason. Ch. 01 keeps a
  summary and the findings; the catalogue itself is the single place a goal is edited.
- **Rejected:** *writing the goals directly into
  [01-requirements-and-goals.md](notes/01-requirements-and-goals.md).* That note is a report chapter
  note — read once, near the end, when the report is written. Goals are consulted continuously during
  sprint planning and review, by people who are not writing the report at that moment, so burying
  them in a chapter note puts them where nobody looks. Also rejected: *stating goals as issue
  acceptance criteria on GitHub*, which is the more orthodox place — but all 46 issues currently have
  empty bodies, so this would have meant editing 46 issues before a single goal could be written down,
  and the board is the one part of GitHub this project has no stable write path to.
- **Why the catalogue is derived rather than authored:** every goal carries a Source line pointing at
  the one-pager, `CLAUDE.md`, the README or a backlog issue, and goals that are a reading of a source
  rather than a quotation say so explicitly. This keeps the document a *restatement* — so it cannot
  quietly become a second, competing rulebook that drifts from the one-pager.
- **Consequence:** a goal change edits the catalogue first and appends the fact to Ch. 01 in the same
  commit. Chapter 08 reports measured coverage against NFG-05, and Chapter 11 reports goals not met.
- **The finding worth carrying into Ch. 01 and Ch. 11:** writing the goals down produced five gaps
  that nobody had noticed while the same information was spread over four documents — no performance
  target, no browser support matrix, no accessibility goal, no enforcement for the 300-line limit, and
  a Resource/Energy System that appears in the Sprint 2 plan and in no rulebook. The exercise found
  more by being *collected* than by being *written*, which is an argument for doing it in week 1 of a
  project rather than in week 8.
- → Ch. 01, Ch. 08, Ch. 11

### 2026-08-06 — 2D web build instead of Unity 3D or Pygame
=======
### 2026-08-06: 2D web build instead of Unity 3D or Pygame
>>>>>>> Stashed changes

- **Chosen:** a 2D board game running in the browser.
- **Rejected:** a 3D approach in Unity: a new programming language for two of the three team
  members, plus asset creation and multiplayer work on top. Also rejected: 2D in Pygame, judged to
  offer less extensibility and a harder multiplayer path.
- **Why:** *"Because of the missing time (magical triangle), we decided to use a 2D board to be able
  to deliver more quality."* The scope was cut against the iron triangle deliberately and before
  implementation started.
- **Consequence:** the team works in a language it already knows, and the delivery risk moves from
  "can we learn the engine" to "can we finish the rules".
- **Source:** [Meeting Notes 20260806](../Project-Management/Meeting%20Notes/20260806.md),
  [00-One-Pager.md](../Project-Management/00-One-Pager.md).
<<<<<<< Updated upstream
- **Addendum (2026-08-09):** formalized as a weighted-criteria utility value analysis covering all three
  visual approaches (2D, 2.5D, 3D), not just the original 2D-vs-3D pair — see
=======
- **Addendum (2026-08-09):** formalized as a weighted-criteria Nutzwertanalyse covering all three
  visual approaches (2D, 2.5D, 3D), not just the original 2D-vs-3D pair: see
>>>>>>> Stashed changes
  [Utility-Value-Analysis.md](../Project-Management/Utility-Value-Analysis.md). It confirms
  2D as the winner (4.20/5.00) and adds one finding not visible in the original prose reasoning:
  2.5D (2.75) also outscores full 3D (2.30), because 2.5D inherits 3D's C#/Unity risk without
  buying back most of its visual payoff.
- → Ch. 03, Ch. 11

<<<<<<< Updated upstream
### 2026-08-10 — AI prompt logs are gitignored, kept locally instead of committed

- **Chosen:** `00-Meta/AI-Prompts/` added to `.gitignore`; the two existing tracked files
  (`BenedictGlatz/2026-08-09.json`, `lbolender/2026-08-06.json`) untracked with `git rm --cached`
  but kept on disk. `CLAUDE.md` step 1 of the mandatory per-change steps is no longer part of the
  commit.
- **Rejected:** the original rule in `CLAUDE.md` — log entries committed together with steps 2–4 in
  the same commit, before replying.
- **Why:** the working tree could not be used for anything else while a prompt-log entry sat as an
  uncommitted change, since the log is written *before* replying but the actual work (docs, code,
  tests) is what should be reviewed and committed together as one unit. Requiring the log file itself
  to be committed forced an extra commit cycle any time work was still in progress.
- **Consequence:** `npm run docs:ai-index` can no longer read every contributor's log straight from a
  fresh clone — logs now live only on each contributor's machine. Whoever regenerates the AI index
  chapter has to collect the other contributors' `00-Meta/AI-Prompts/<github-username>/` folders out
  of band first (chat, shared drive) and place them locally. This is a real loss of the
  "one `git pull` has everything" property the log used to have, traded for not blocking other work.
- → Ch. 07, Ch. 13

### 2026-08-06 — Branching model is main/dev/feature, not GitHub Flow
=======
### 2026-08-06: Branching model is main/dev/feature, not GitHub Flow
>>>>>>> Stashed changes

- **Chosen:** `main` (always playable, no direct pushes) ← `dev` (integration) ← `feature/<issue>-<slug>`.
- **Rejected:** the GitHub Flow variant originally proposed in
  [Brainstorming.md](../../Brainstorming.md), with feature branches off `main` and no `dev`.
- **Why:** `main` is required to hold a working, playable build at all times. Merging feature
  branches straight into it makes that guarantee depend on every single PR being complete, whereas
  an integration branch absorbs partial work.
- **Consequence:** one extra merge step per release. The rest of the `Brainstorming.md` policy
  (no direct pushes to `main`, one review approval minimum, squash and merge, `Closes #<n>`) still
  applies.
- → Ch. 02

### 2026-08-06: Documentation notes are kept per commit, not written at the end

- **Chosen:** a `00-Meta/Documentation/` directory of fact-only chapter notes, updated in the same
  commit as the change it describes. The report itself is written once, near the end, from the
  notes.
- **Rejected:** *writing the report at the end from the code and git history.* This is what the
  sample report the team is modelling on did, and its own Lessons Learned chapter names it as the
  project's biggest weakness: it produced time pressure at the end and the presentation was cut
  short to absorb it. Also rejected: *drafting real report prose continuously*, because every code
  change would then mean rewriting paragraphs, and the prose would be rewritten many times before
  anyone read it once.
- **Why:** the expensive part of a design decision to reconstruct three weeks later is not *what*
  was decided but *why*, and which alternative lost. Facts are cheap to capture at the moment they
  are true and cheap to re-sort into a different chapter structure later; prose is neither.
- **Consequence:** every change now owes facts to a chapter note and, if the reasoning was
  non-obvious, a decision block here. This is enforced through the mandatory per-change steps in
  `CLAUDE.md`. The cost is a few lines per commit; the benefit is that Chapter 11 can be written
  from a record rather than from memory.
- **Note:** the module's actual requirements are unknown: no chapter catalogue, page count or
  deadline exists. The 13-chapter structure is adapted from a sample report for a *different module
  with a different professor*, weighted toward project management because that is this module's
  focus. Keeping the notes prose-free is what makes a later re-map a re-sort rather than a rewrite.
- → Ch. 02, Ch. 10, Ch. 11

### 2026-08-06: No hour-level effort tracking

- **Chosen:** a dated log of what was done, plus planned-versus-delivered scope per sprint.
- **Rejected:** logging hours per person per session, which is what the sample report's capacity
  plan is built from.
- **Why:** team decision. Hour logs that are not maintained honestly are worse than no hour log, and
  scope-and-dates is evidence that can be reconstructed from the board if a day is missed.
- **Consequence:** Chapter 11 shows plan against actual in scope and dates rather than in hours, and
  says so explicitly rather than leaving the absence of a capacity table unexplained.
- → Ch. 11

### 2026-08-06: The board is read by making it public, not by authenticating

- **Chosen:** make the repository and the GitHub project public, and read the board through the
  unauthenticated REST API plus the board page's server-rendered JSON payloads.
- **Rejected:** *installing the `gh` CLI and issuing a token with `project` scope*: the correct
  long-term route, but it needs a token per team member and per machine, and nothing in the project
  needed writes yet. Also rejected: *the Projects v2 GraphQL API*, which is not a choice at all:
  it returns `403` to unauthenticated requests **regardless of project visibility**, so public
  visibility does not unlock it.
- **Why:** the immediate need was one read of the board to get sprint dates and the backlog into the
  notes. Public visibility is also independently useful: the deployment candidates in
  `Brainstorming.md` (GitHub Pages, itch.io) assume a public repository anyway, and a university
  project has no confidentiality requirement.
- **Consequence, and the part to state honestly in the report:** the working route parses GitHub's
  internal `memex-*` page payloads, which is **not a stable interface** and will break without
  notice. It is adequate for occasional manual reads and unsuitable as a foundation for tooling. If
  board data is ever needed *automatically* (a velocity chart generator, a burn-down script), that
  needs the `gh` CLI and a token, and the rejected option becomes the chosen one.
- **Also learned:** MCP servers are registered **per client**, not per editor. The GitHub MCP server
  was installed into VS Code's own registry and was therefore invisible to Claude Code running inside
  the same editor. See Ch. 07.
- → Ch. 02, Ch. 07, Ch. 10

### 2026-08-06: Addendum to the decision above: the rejected option was cheaper than it looked

This does not replace the block above: it records that one of its premises was wrong, which is
exactly the kind of thing this file exists to keep visible.

- **What the earlier block assumed:** that authenticating "needs a token per team member and per
  machine", which is why the `gh` CLI route was rejected in favour of making the project public.
- **What is actually the case:** a working GitHub token was already on the machine, stored by the Git
  Credential Manager (`credential.helper=manager`): the same credential that authorises `git push`.
  It carries `gist, repo, workflow` scopes and was enough to comment on and close issues through the
  REST API immediately, with nothing installed.
- **Why the premise was wrong:** the check for a token looked at the environment (`GITHUB_TOKEN`,
  `GH_TOKEN`), and on Windows the credential is not there: it is in the credential manager. The right
  question is not "is a token exported" but "does the credential helper have one".
- **What still holds:** the board itself remains out of reach. GraphQL answers `INSUFFICIENT_SCOPES`
  and names `read:project`, which the stored token does not have. So the split is: **repository data
  is properly accessible, board field data is not.**
- **Revised recommendation:** add `read:project` to the existing token rather than installing the
  `gh` CLI. That is one checkbox, it retires the unstable `memex-*` HTML-parsing route, and it is what
  a velocity or burn-down generator would need.
- **The pattern worth carrying into Ch. 10 and Ch. 11:** twice in one day a capability that existed
  was reported as missing because the wrong location was checked: the MCP server in the wrong
  client's registry, the token in the wrong store. Both times the diagnosis, not the fix, was the work.
- → Ch. 02, Ch. 07, Ch. 10

<<<<<<< Updated upstream
### 2026-08-10 — Risk register expanded from the project's own documentation, not invented

- **Chosen:** mine `project-journal.md`, `sprint-log.md`, `01-Github-Project.md` and `CLAUDE.md` for
  risks that were already stated as facts or open questions elsewhere, and turn
  [03-Risk-Analysis.md](../Project-Management/03-Risk-Analysis.md) into a register with a Category
  and a Mitigation/Response column per risk, not just a Likelihood/Impact/Priority rating.
- **Rejected:** brainstorming generic software-project risks (budget overrun, key-person illness in
  the abstract, "requirements change") without grounding each one in something this project's own
  documentation already says. A generic list reads as filler and duplicates risks the docs already
  describe under a different name (e.g. "Sickness" already covers the abstract team-availability
  risk).
- **Why:** a risk register a reader cannot trace back to a concrete project fact is not evidence of
  risk *management*, just of a template being filled in. Every added row cites the source document it
  came from, matching the "no claim without a reason" rule this documentation process already runs
  on.
- **Consequence:** 13 new risks added (16 total), grouped into Category values not previously used
  here (Schedule, Scope, Process/Quality, Team, Technical/Tooling, Compliance/Academic,
  Presentation). Two of them are already-known open questions from `sprint-log.md` given a
  Likelihood/Impact rating for the first time (the sprint-date contradiction, the missing
  velocity/burn-down data) — rating them doesn't resolve them, it just makes their priority visible
  next to every other risk.
- → Ch. 02
=======
### 2026-08-09: Feasibility is affirmed conditionally, with the AI toolchain named as the condition

- **Chosen:** a *conditional* Go. The feasibility study assesses five dimensions, gives each its own
  verdict, and makes the overall verdict explicitly dependent on continued AI assistance: Claude
  Design for UI and 2D assets, Claude Code for implementation and documentation.
- **Rejected:** *an unconditional "feasible".* It would have been the more comfortable sentence and
  the less useful one. The scope in issue #9 was proposed on the assumption of that leverage; a study
  that recorded the verdict without the assumption would leave a later overrun unexplainable, and
  Chapter 11 would have no recorded premise to measure against.
- **Also rejected:** *treating AI use as one accelerator among many inside the technical section.*
  That is how it would normally be written, and it would understate it. Two implementers carry four
  epics with twelve sub-issues across three two-week sprints, plus 24 documentation issues and a
  per-commit documentation obligation. The honest description is a precondition, not a tool choice.
- **Also rejected:** *re-running the 2D/2.5D/3D comparison.* Issue #47 scored it a few hours earlier
  and merged; the study cites it and assesses the winning option in absolute terms instead.
- **Also rejected:** *putting capacity figures in*: hours per person per week, a person-day budget.
  The team decided against hour tracking on 2026-08-06, so there would be no actuals to compare an
  estimate against, and effort estimation is its own backlog item (#16). A number nobody can check is
  worse than a stated gap.
- **Why:** the value of a feasibility study is not the verdict, which was never seriously in doubt
  once the option was chosen. It is the record of *what the verdict assumed*. The assumption that
  matters here is not the stack: it is the leverage.
- **Consequence:** the project has a documented single-toolchain dependency. Its risk treatment
  belongs to issue #11, and this decision hands it over rather than absorbing it. Second consequence:
  the study lists six conditions, four of which are decisions the team has been deferring anyway
  (Definition of Done, buffer sprint, Sprint 2 scope, repository licence): so the study doubles as a
  deadline for them.
- **Two findings worth carrying into Ch. 11:** first, the 2D decision converted the project's risk
  rather than removing it: from "can two of us learn C#" (competence) to "can two of us finish four
  epics in eight weeks" (schedule). Second, with generation cheap, the binding constraint is **review**
  capacity, which argues for keeping the 300-line limit, the layering and the per-change notes exactly
  when deadline pressure would suggest dropping them.
- → Ch. 03, Ch. 10, Ch. 11
>>>>>>> Stashed changes

---

## Challenges

- **2026-08-06: Reading the GitHub board took three attempts and two false leads.** The first
  attempt failed on four independent barriers at once (no MCP server visible to Claude Code, no `gh`
  CLI, no token, private repository), which made the cause hard to isolate: each one alone produces
  the same symptom. The second attempt failed in a more misleading way: the GitHub MCP server *had*
  been installed, so the reasonable conclusion was that it should work, but it had gone into VS
  Code's MCP registry rather than Claude Code's. Checking the config file directly rather than
  trusting "it is installed" is what resolved it. The board was finally read by parsing the page's
  embedded JSON, after confirming that Projects v2 GraphQL rejects unauthenticated requests even for
  a public project. Cost: roughly 30–40 minutes, most of it in the diagnosis rather than the fix.
  The lesson worth carrying into the report is that "the integration is installed" and "this
  particular client can see it" are different claims, and only the second one is testable.

- **2026-08-09 — Undoing an unreviewed merge cost far more than the review would have.** Pull request
  #48 was merged into `dev` without approval. Reopening it was impossible — GitHub closes merged pull
  requests permanently — and by the time it was noticed, four branches had been cut from the merge
  commit and all four carried the unreviewed work. The recovery was a rewrite of published history:
  `dev` force-reset one commit back, the four branches re-parented with `git rebase --onto`, five
  force-pushes, and every teammate obliged to re-fetch. What made it tractable at all was a property
  of the graph rather than any tooling — the merge commit's tree was identical to the commit it
  merged, so re-parenting could not change file content, and `git diff` against the old remote refs
  proved it before anything was pushed. The lesson for Chapter 11 is the asymmetry: the review that
  was skipped would have cost minutes, the undo cost an hour and a coordinated reset across three
  people. It is also the concrete argument for the branch-protection ruleset left open in Ch. 02 —
  the control was absent twice in one day, and the second absence is what turned a process slip into
  a history rewrite.

Log anything that cost more than roughly 30 minutes of unplanned work: what happened, what it cost,
how it was resolved. These become the running prose of Chapter 11, so a sentence of context is worth
more than a terse label.
