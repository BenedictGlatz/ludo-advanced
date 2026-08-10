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
- Living documentation notes under `00-Meta/Documentation/` — a steering index, 13 chapter notes for the final
  project report, a project journal for decisions and challenges, a sprint log for planned versus delivered
  scope, an abbreviation list, and two adapted reference documents on report structure and writing style
- Mandatory per-change steps in `CLAUDE.md`, making the prompt log, documentation notes, changelog and tests part
  of the same commit as the change itself

### Changed

- AI prompt log entries now carry a `topic` and a `use` field, so the report's AI index chapter can be generated
  from the log rather than sorted by hand
- The truncated `## Documentation` section in `00-Meta/Project-Management/01-Github-Project.md` now points at the
  project journal instead of ending mid-sentence
- `00-Meta/AI-Prompts/` is now gitignored and kept locally per contributor instead of being committed; `CLAUDE.md`
  updated so the AI prompt log step is no longer part of the same commit as documentation notes, changelog and
  tests
