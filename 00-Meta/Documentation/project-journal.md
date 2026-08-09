# Project journal

Append-only. Never rewrite an earlier entry — if something turns out to have been wrong, add a new
entry saying so and why. The value of this file is that it records what was believed at the time.

Three sections, each with its own rule:

- **Log** — one line per working session. What was done, which sprint, which issue.
- **Decisions** — one block per non-obvious technical or process decision. Raw material for the
  report's justifications, so it must include what was *rejected*.
- **Challenges** — anything that cost more than roughly 30 minutes of unplanned work. Feeds
  Chapter 11.

Dates are absolute (`YYYY-MM-DD`). No hour tracking — the team decided against it; plan-versus-actual
is tracked as scope and dates in [sprint-log.md](sprint-log.md).

---

## Log

- **2026-08-06** — Repository and GitHub project created. Sprint 0.
- **2026-08-06** — `CLAUDE.md`, `README.md` and `CHANGELOG.md` written; stack fixed to
  JavaScript + jQuery + Vite + i18next, Vitest and Playwright for tests, ESLint and Prettier.
  Sprint 0.
- **2026-08-06** — Documentation notes established under `00-Meta/Documentation/`: steering index,
  13 chapter notes, this journal, sprint log, abbreviation list, and two adapted reference
  transcripts. `CLAUDE.md` extended with a documentation-notes section and a mandatory
  per-change step list. Sprint 0.
- **2026-08-06** — Repository and GitHub project made public; board read for the first time from the
  development environment. 46 issues, 50 board items, 16 fields and 3 views transcribed into
  Ch. 01 and Ch. 02. Sprint calendar dates recovered and filled into `sprint-log.md`. Four negative
  findings recorded about board configuration. Sprint 0.
- **2026-08-06** — `dev` pushed to `origin` for the first time (four documentation commits; the remote
  had only `main` until now). Issues #4 *Create a Claude.md* and #2 *Github Setup + Documentation*
  closed with closing comments. An earlier negative finding corrected: an authenticated GitHub token
  was available all along, in the Git Credential Manager. Sprint 0.
- **2026-08-09** — SMART analysis written for issue #9: one overall project goal plus four sub-goals,
  one per `must have` epic (#36–#39), with deadlines taken from the board sprint markers.
  `00-Meta/Project-Management/SMART-Analysis.md`; facts in Ch. 01. Sprint 0.

---

## Decisions

### 2026-08-06 — 2D web build instead of Unity 3D or Pygame

- **Chosen:** a 2D board game running in the browser.
- **Rejected:** a 3D approach in Unity — a new programming language for two of the three team
  members, plus asset creation and multiplayer work on top. Also rejected: 2D in Pygame, judged to
  offer less extensibility and a harder multiplayer path.
- **Why:** *"Because of the missing time (magical triangle), we decided to use a 2D board to be able
  to deliver more quality."* The scope was cut against the iron triangle deliberately and before
  implementation started.
- **Consequence:** the team works in a language it already knows, and the delivery risk moves from
  "can we learn the engine" to "can we finish the rules".
- **Source:** [Meeting Notes 20260806](../Project-Management/Meeting%20Notes/20260806.md),
  [00-One-Pager.md](../Project-Management/00-One-Pager.md).
- **Addendum (2026-08-09):** formalized as a weighted-criteria Nutzwertanalyse covering all three
  visual approaches (2D, 2.5D, 3D), not just the original 2D-vs-3D pair — see
  [Utility-Value-Analysis.md](../Project-Management/Utility-Value-Analysis.md). It confirms
  2D as the winner (4.20/5.00) and adds one finding not visible in the original prose reasoning:
  2.5D (2.75) also outscores full 3D (2.30), because 2.5D inherits 3D's C#/Unity risk without
  buying back most of its visual payoff.
- → Ch. 03, Ch. 11

### 2026-08-06 — Branching model is main/dev/feature, not GitHub Flow

- **Chosen:** `main` (always playable, no direct pushes) ← `dev` (integration) ← `feature/<issue>-<slug>`.
- **Rejected:** the GitHub Flow variant originally proposed in
  [Brainstorming.md](../../Brainstorming.md), with feature branches off `main` and no `dev`.
- **Why:** `main` is required to hold a working, playable build at all times. Merging feature
  branches straight into it makes that guarantee depend on every single PR being complete, whereas
  an integration branch absorbs partial work.
- **Consequence:** one extra merge step per release. The rest of the `Brainstorming.md` policy —
  no direct pushes to `main`, one review approval minimum, squash and merge, `Closes #<n>` — still
  applies.
- → Ch. 02

### 2026-08-06 — Documentation notes are kept per commit, not written at the end

- **Chosen:** a `00-Meta/Documentation/` directory of fact-only chapter notes, updated in the same
  commit as the change it describes. The report itself is written once, near the end, from the
  notes.
- **Rejected:** *writing the report at the end from the code and git history.* This is what the
  sample report the team is modelling on did, and its own Lessons Learned chapter names it as the
  project's biggest weakness — it produced time pressure at the end and the presentation was cut
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
- **Note:** the module's actual requirements are unknown — no chapter catalogue, page count or
  deadline exists. The 13-chapter structure is adapted from a sample report for a *different module
  with a different professor*, weighted toward project management because that is this module's
  focus. Keeping the notes prose-free is what makes a later re-map a re-sort rather than a rewrite.
- → Ch. 02, Ch. 10, Ch. 11

### 2026-08-06 — No hour-level effort tracking

- **Chosen:** a dated log of what was done, plus planned-versus-delivered scope per sprint.
- **Rejected:** logging hours per person per session, which is what the sample report's capacity
  plan is built from.
- **Why:** team decision. Hour logs that are not maintained honestly are worse than no hour log, and
  scope-and-dates is evidence that can be reconstructed from the board if a day is missed.
- **Consequence:** Chapter 11 shows plan against actual in scope and dates rather than in hours, and
  says so explicitly rather than leaving the absence of a capacity table unexplained.
- → Ch. 11

### 2026-08-06 — The board is read by making it public, not by authenticating

- **Chosen:** make the repository and the GitHub project public, and read the board through the
  unauthenticated REST API plus the board page's server-rendered JSON payloads.
- **Rejected:** *installing the `gh` CLI and issuing a token with `project` scope* — the correct
  long-term route, but it needs a token per team member and per machine, and nothing in the project
  needed writes yet. Also rejected: *the Projects v2 GraphQL API*, which is not a choice at all —
  it returns `403` to unauthenticated requests **regardless of project visibility**, so public
  visibility does not unlock it.
- **Why:** the immediate need was one read of the board to get sprint dates and the backlog into the
  notes. Public visibility is also independently useful — the deployment candidates in
  `Brainstorming.md` (GitHub Pages, itch.io) assume a public repository anyway, and a university
  project has no confidentiality requirement.
- **Consequence, and the part to state honestly in the report:** the working route parses GitHub's
  internal `memex-*` page payloads, which is **not a stable interface** and will break without
  notice. It is adequate for occasional manual reads and unsuitable as a foundation for tooling. If
  board data is ever needed *automatically* — a velocity chart generator, a burn-down script — that
  needs the `gh` CLI and a token, and the rejected option becomes the chosen one.
- **Also learned:** MCP servers are registered **per client**, not per editor. The GitHub MCP server
  was installed into VS Code's own registry and was therefore invisible to Claude Code running inside
  the same editor. See Ch. 07.
- → Ch. 02, Ch. 07, Ch. 10

### 2026-08-06 — Addendum to the decision above: the rejected option was cheaper than it looked

This does not replace the block above — it records that one of its premises was wrong, which is
exactly the kind of thing this file exists to keep visible.

- **What the earlier block assumed:** that authenticating "needs a token per team member and per
  machine", which is why the `gh` CLI route was rejected in favour of making the project public.
- **What is actually the case:** a working GitHub token was already on the machine, stored by the Git
  Credential Manager (`credential.helper=manager`) — the same credential that authorises `git push`.
  It carries `gist, repo, workflow` scopes and was enough to comment on and close issues through the
  REST API immediately, with nothing installed.
- **Why the premise was wrong:** the check for a token looked at the environment (`GITHUB_TOKEN`,
  `GH_TOKEN`), and on Windows the credential is not there — it is in the credential manager. The right
  question is not "is a token exported" but "does the credential helper have one".
- **What still holds:** the board itself remains out of reach. GraphQL answers `INSUFFICIENT_SCOPES`
  and names `read:project`, which the stored token does not have. So the split is: **repository data
  is properly accessible, board field data is not.**
- **Revised recommendation:** add `read:project` to the existing token rather than installing the
  `gh` CLI. That is one checkbox, it retires the unstable `memex-*` HTML-parsing route, and it is what
  a velocity or burn-down generator would need.
- **The pattern worth carrying into Ch. 10 and Ch. 11:** twice in one day a capability that existed
  was reported as missing because the wrong location was checked — the MCP server in the wrong
  client's registry, the token in the wrong store. Both times the diagnosis, not the fix, was the work.
- → Ch. 02, Ch. 07, Ch. 10

### 2026-08-09 — Project goals anchored to the board's sprint dates, not to the module deadline

- **Chosen:** formulate the goals SMART now, taking every date from the four sprint markers on the
  GitHub board (2026-07-23 → 2026-09-17), and state in the document that the anchor is provisional.
- **Rejected:** *waiting for the real module submission date before formulating any goal.* That date
  is unknown and has been a standing open question since 2026-08-06. Waiting would have left issues
  #10, #13 and #23 without a goal to build on for an unbounded period, and it treats the `T` criterion
  as the expensive one when in fact it is the cheapest to substitute later — the other four criteria
  are the work.
- **Also rejected:** *cutting the sub-goals per sprint* rather than per epic. Sprint-shaped sub-goals
  would have created a second breakdown of the same scope competing with the MoSCoW epics, and the
  epics are the structure the board already prioritises. The sprint dates are still used — as the
  epics' deadlines, which keeps one breakdown and one calendar rather than two of each.
- **Also rejected:** *auditing the existing goal statements against SMART* instead of formulating new
  ones. An audit of the one-pager would have produced a list of deficiencies and still no usable goal;
  this is a definition-phase issue, so it owes a definition.
- **Also rejected:** *velocity as a measurable criterion.* It is named as buffer-sprint presentation
  content, but the board has no story point field and no Iteration field, so a goal depending on it
  would be unmeasurable by construction. Recorded as an exclusion with its reason rather than silently
  omitted.
- **Why:** a goal that cannot be checked is not a goal, and three of the five criteria (S, A, R) were
  already derivable from documents written before this one. What was missing was a date and a set of
  checks — and a provisional date that is named as provisional costs less than no date at all.
- **Consequence:** if the real deadline differs, every `T` value re-anchors to it and the sub-goal
  dates move with the sprint boundaries. That is a date substitution, not a rewrite, which is why the
  dates were taken from a single named source ([sprint-log.md](sprint-log.md)) instead of being spread
  through the text. Second consequence: the sprint boundaries are no longer only a planning artefact,
  so moving one now moves a goal.
- **Finding worth carrying into Ch. 11:** the tightest sub-goal is the *first*, not the last. SG1
  (#36) has the most sub-issues, everything else builds on it, and its sprint starts 2026-08-10 with
  no source code, no `package.json` and no tooling in the repository — so Sprint 1 contains its own
  bootstrap, which is not in its planned scope.
- → Ch. 01, Ch. 02, Ch. 11

---

## Challenges

- **2026-08-06 — Reading the GitHub board took three attempts and two false leads.** The first
  attempt failed on four independent barriers at once (no MCP server visible to Claude Code, no `gh`
  CLI, no token, private repository), which made the cause hard to isolate — each one alone produces
  the same symptom. The second attempt failed in a more misleading way: the GitHub MCP server *had*
  been installed, so the reasonable conclusion was that it should work, but it had gone into VS
  Code's MCP registry rather than Claude Code's. Checking the config file directly rather than
  trusting "it is installed" is what resolved it. The board was finally read by parsing the page's
  embedded JSON, after confirming that Projects v2 GraphQL rejects unauthenticated requests even for
  a public project. Cost: roughly 30–40 minutes, most of it in the diagnosis rather than the fix.
  The lesson worth carrying into the report is that "the integration is installed" and "this
  particular client can see it" are different claims, and only the second one is testable.

Log anything that cost more than roughly 30 minutes of unplanned work: what happened, what it cost,
how it was resolved. These become the running prose of Chapter 11, so a sentence of context is worth
more than a terse label.
