# 13 AI index

> **Generated. Do not edit by hand.**
>
> Source: `00-Meta/AI-Prompts/<github-username>/YYYY-MM-DD.json`
> Command: `npm run docs:ai-index` *(not implemented yet)*

Every prompt sent to an AI system during this project, listed in full. Completeness is the point —
trivial prompts belong in here too. A curated selection looks better and is worth less, because the
reader cannot tell what was left out.

## Structure

Six subsections, matching the six `topic` values in the prompt log:

| Subsection | `topic` |
| --- | --- |
| 13.1 Concept and architecture decisions | `concept-architecture` |
| 13.2 Code generation and game logic | `game-logic` |
| 13.3 UI/UX development and styling | `frontend-ui` |
| 13.4 Debugging and problem solving | `debugging` |
| 13.5 Code quality, refactoring and testing | `tooling-tests` |
| 13.6 Documentation and process | `process-docs` |

Each subsection is a three-column table:

| System | Prompt | Use |
| --- | --- | --- |

- **System** — the concrete model including version, e.g. `claude-opus-5`.
- **Prompt** — the prompt verbatim. Long multi-turn exchanges are condensed with `…`, keeping the
  decisive turns. Pasted material and attachments are marked in square brackets, e.g.
  `[CLAUDE.md of another project, pasted as reference]`.
- **Use** — how the answer was used, from the `use` field:

  | `use` | Renders as |
  | --- | --- |
  | `informational` | Purely informational |
  | `research` | Research, purely informational |
  | `implementation` | Used for implementation |
  | `adopted` | Adopted verbatim |
  | `revised` | Adopted with revisions |

## Generation

The script must read every `00-Meta/AI-Prompts/*/*.json`, sort entries by timestamp, group them by
`topic`, and emit the six tables. An entry with no `use` field counts as `implementation`.

It should fail loudly on an unknown `topic` or `use` value rather than silently dropping the entry —
a missing prompt is the one defect this chapter cannot afford.

## Open

- Script not written. Until it exists, the chapter is assembled from the JSON files by hand at
  submission time, which is slower and easier to get wrong.
- Only one contributor's log exists so far. If the other team members use AI assistance without
  logging it, this chapter is incomplete and the report must say so rather than implying otherwise.
