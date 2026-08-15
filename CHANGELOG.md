# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `CLAUDE.md` defining the tech stack, architecture layering, testing, Git and AI prompt log conventions
- `README.md` with project overview, setup instructions, scripts and contribution guidelines
- This changelog
- AI prompt log under `00-Meta/AI-Prompts/<github-username>/YYYY-MM-DD.json`
- Living documentation notes under `00-Meta/Documentation/`: a steering index, 13 chapter notes for the final
  project report, a project journal for decisions and challenges, a sprint log for planned versus delivered
  scope, an abbreviation list, and two adapted reference documents on report structure and writing style
- Mandatory per-change steps in `CLAUDE.md`, making the prompt log, documentation notes, changelog and tests part
  of the same commit as the change itself
- SMART analysis of the project goals in `00-Meta/Project-Management/SMART-Analysis.md` — one overall goal plus one
  sub-goal per must-have epic (#36–#39), each with a deadline taken from the board's sprint markers and measurable
  criteria stated as checks against artefacts, plus a section naming what still has to exist before those criteria
  can be read
- Feasibility study in `00-Meta/Project-Management/Feasibility-Study.md`: technical, schedule,
  personnel/organisational, economic and legal feasibility, each with its own verdict, and a conditional Go whose
  conditions and precondition (the AI toolchain) are named explicitly
- `00-Meta/Project-Management/Functional-and-Non-Functional-Goals.md`: the project's goal catalogue, 21 functional
  goals traced to the backlog epics and 8 non-functional goals derived from the hard constraints, each with its
  source, its reason and how it is verified
- `00-Meta/Project-Management/Requirements-Specification.md`: 45 functional and 12 non-functional requirements,
  each with an acceptance criterion and a MoSCoW priority, plus the MoSCoW analysis with a drop order agreed in
  advance and the eight gameplay decisions still owed by the Product Owner

### Changed

- AI prompt log entries now carry a `topic` and a `use` field, so the report's AI index chapter can be generated
  from the log rather than sorted by hand
- The truncated `## Documentation` section in `00-Meta/Project-Management/01-Github-Project.md` now points at the
  project journal instead of ending mid-sentence
- `00-Meta/AI-Prompts/` is now gitignored and kept locally per contributor instead of being committed; `CLAUDE.md`
  updated so the AI prompt log step is no longer part of the same commit as documentation notes, changelog and
  tests
