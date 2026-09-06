# `pawn.css`, amended: the statuses move out

**Handoff 17, D101 and D103.** Two deletions and one rewritten header comment. Nothing is added.

**Why this is a change list keyed on selectors and not a unified diff.** A unified diff's line numbers
would be against this side's copy, and this side's copy is not yours: brief 17 § 1 says `pawn.css` is at
252 lines with issue #91's drag rule in it, and the copy here is 253 lines without it. Every number in a
hunk header would be wrong on arrival, which is worse than no numbers. The three items below name the
comment or the selector to find, which is what handoff 16 was landed on and what the 2026-09-05 status
block asks for in its own words.

The file goes from **253 lines to 192**.

---

## 1. The header comment gains a paragraph

**Find** the first comment block in the file, the one beginning `/* Pawn: the piece itself`.

**After** its third line (`board.css, which supplies --player.`) and before the blank line that precedes
`The pawn is a direct child of .board`, insert:

```
   Amended 2026-09-06, D101: the pawn statuses leave this file. D56's tilt,
   D57's tag and the six kinds neither of them answered are in
   pawn-status.css, which loads after this one, and the drag gesture of issue
   #91 is in pawn-drag.css after that. The seam is what put the piece in the
   state, not what the state looks like: this file draws the piece and the
   five states the player puts it in, pawn-status.css draws what a card did to
   it. --pawn-tilt stays declared here, in the transform below, because the
   transform is this file's.
```

---

## 2. The whole status section is deleted

**Find** the comment block beginning:

```
/* --- Pawn statuses (D56, D57). data-statuses is a space-separated list, so
```

**Delete** from that comment to the end of the rule `.pawn[data-statuses~="slippery"] .pawn__status`,
inclusive. That is the comment block, and then, in order:

| Deleted | Now in |
| --- | --- |
| `.pawn[data-statuses~="stunned"]` | `pawn-status.css`, unchanged |
| `.pawn[data-statuses~="stunned"]::after` | `pawn-status.css`, unchanged |
| `.pawn__status` | `pawn-status.css`, unchanged |
| `.pawn__status::before` | `pawn-status.css`, rewritten: it is now the generic inner shape for four kinds, and the skid's own `inset` and `rotate` move onto `.pawn[data-statuses~="slippery"] .pawn__status::before` |
| `.pawn[data-statuses~="slippery"] .pawn__status` | `pawn-status.css`, joined by three more kinds in one selector list |

Their comments go with them, word for word. Nothing was reworded on the way.

**Replace** the deleted block with this note, so the next reader of `pawn.css` is not left wondering
where `data-statuses` went:

```
/* --- The pawn statuses moved out on 2026-09-06 (D101). D56's stunned tilt,
       D57's .pawn__status tag and the six kinds D57 left unstyled are in
       pawn-status.css. Nothing about them changed in the move except the
       file they are in; the tag keeps its shoulder and its geometry. --- */
```

The block that follows it, `/* --- Keyboard focus. Desktop only does not mean mouse only (D11). --- */`,
is untouched.

---

## 3. Issue #91's drag rule, if it is in your copy

Brief 17 § 2.1 says `pawn.css` applies `--drag-dx` and `--drag-dy` as a `translate`. That rule is not in
this side's copy and **it should come out of yours**: `pawn-drag.css` sets `translate` on
`[data-dragging="true"]` and also restates the pawn's `transition` with `translate` added to it, which is
the declaration that makes the release continuous. Two files writing `translate` on the same element is
the one way this can go wrong.

If the rule in your copy does anything the new file does not, say so and it comes back as a hunk here
rather than being reconciled quietly.

---

## What is not touched

`.pawn`, `.pawn::after`, `.pawn::before`, the four interactive states, `@keyframes pawn-breathe`,
`:focus-visible` and the `prefers-reduced-motion` block. `--pawn-tilt` stays declared in this file's
`transform`, and `pawn-status.css` sets it from outside, which is the same arrangement `board.css` and
`--player` have had since spec 01.
