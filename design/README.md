# design

How Claude Code and Claude Design hand work to each other, and where the results land.

New designs for this project are developed with **Claude Design**, which has access to this
directory. [CLAUDE.md](../CLAUDE.md) draws a hard line: Claude Code does not invent design rules, and
Claude Design owns colour, spacing, typography and component looks. This folder is the mechanism that
makes that line workable instead of merely stated.

## What does not go through the loop, since 2026-09-06

**Small design fixes.** Claude Code checks them in the running app and fixes them directly. The three
conditions are in [CLAUDE.md](../CLAUDE.md) under *Design and UI*: the fix repairs something already
specified, it uses only existing tokens and patterns, and it does not change how the screen looks when
it is working.

The reason is cost, and it is one-sided. A brief-and-spec round is worth days for a screen that does
not exist yet. For a clipped label or a state the CSS forgot to apply, the round costs the same days
and produces a change nobody would have designed differently.

**What this does not move:** new screens and components, and the design system itself. Those still
start with a brief, which is also what keeps prototyping possible. And when a fix turns out to
contradict the spec rather than the CSS, it goes into
[handoff/00-open-requests.md](handoff/00-open-requests.md), so this side is never working from a spec
the code has quietly left behind.

---

## The loop

```
Claude Code  ──  writes a BRIEF  ──▶  design/handoff/NN-brief-<topic>.md
                                              │
                                              ▼
                                     Claude Design reads the brief,
                                     the repository and the rulebook
                                              │
                                              ▼
Claude Code  ◀──  reads a SPEC  ──  design/handoff/NN-spec-<topic>.md
                                     + real CSS files in src/ui/styles/
```

Numbered pairs, so a brief and the spec answering it sit next to each other in the file listing:

```
design/
  README.md                              this file
  handoff/
    01-brief-foundations-and-board.md    Code   -> Design
    01-spec-foundations-and-board.md     Design -> Code
    02-brief-board-review.md             Code   -> Design
    02-spec-board-revisions.md           Design -> Code
  assets/                                exported images or SVG, only if genuinely needed
```

## Where the CSS lives, and why not here

**The CSS does not live in `design/`. It lands directly in `src/ui/styles/`**, because it is
production code and it is what the build ships.

What lives here is the **reasoning**: which decision was taken, why, and what lost. That split is the
whole point of the folder. Code that answers "what does it look like" belongs with the code; the
answer to "why does it look like that" belongs where a report author can find it six weeks later
without reading a stylesheet.

## Why the spec has to name rejected alternatives

This is not politeness, and it is the one rule most likely to be skipped.

The project's documentation rules require a reason **and a named rejected alternative** for every
decision, because the report is graded on visible decisions. A design system that arrives as a
finished palette reads as an accident. The same palette with "we rejected X because Y" next to it
reads as a choice. A spec written that way feeds
[project-journal.md](../docs/documentation/project-journal.md) and
[notes/04-frontend-building-blocks.md](../docs/documentation/notes/04-frontend-building-blocks.md)
directly, instead of having to be reconstructed into them later, when nobody remembers what was
considered.

---

## The brief template: Claude Code always writes these seven sections

1. **What to design.** Screen ids from
   [obligations-book.md](../docs/project-management/obligations-book.md) section 2.2, and nothing
   else.
2. **Hard constraints.** Technical and non-negotiable, each one with the reason it exists.
3. **The DOM contract.** The exact element names, classes and data attributes the CSS may target.
4. **Facts the design must match.** Numbers taken from
   [game-design-document.md](../docs/project-management/game-design-document.md), never invented
   in the brief.
5. **Open decisions this handoff must answer.** A numbered list, D1, D2, D3 and so on, so the spec can
   answer them one by one and a missing answer is visible.
6. **Deliverables.** Every file, with the path it goes to.
7. **Out of scope.** What belongs to a later issue, said explicitly, or the design grows to cover it.

## The spec template: Claude Design always returns these five sections

1. **Files delivered**, with their paths.
2. **One answer per open decision** (D1, D2, ...), each with its reason **and its rejected
   alternatives**.
3. **Token reference table**: token name, value, what it is for.
4. **Component states covered**, checked against the DOM contract in the brief.
5. **What is still open.**

---

## The line the brief must not cross

A brief describes a **technical interface**, not an appearance.

- Naming the elements and data attributes the CSS will target: **fine**. That is what lets both sides
  work at the same time without meeting.
- Naming a colour, a size, a font, a spacing value or a component's look: **not fine**. The moment one
  of those appears in a brief, the brief has broken the rule it exists to respect.

The practical test: if Claude Design could reasonably answer "no, it should be different", the brief
should be asking rather than telling. That is what section 5 of the brief is for.

## What happens when a spec arrives

Do not merge it unread. The check is five items and it is written out in the plan for each handoff:
every open decision answered, every answer carrying a reason and a rejected alternative, no CSS file
over 300 lines, no user-facing string baked into a CSS `content:` property, and every state in the
DOM contract actually styled. A missing reason is asked for **now**, while somebody still remembers
it, and not reconstructed for the report later.
