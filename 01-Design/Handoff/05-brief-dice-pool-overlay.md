# Handoff 05, brief: the dice card pool overlay

**From:** Claude Code
**To:** Claude Design
**Date:** 2026-09-01
**Issue:** #30 (Dice Pool Data Model & Selection Logic)

---

## 0 Why this brief exists now

Issue #30 built the pool and issue #31 built the hand that draws from it. What neither built is any way
for a player to see **what the pool holds**.

That is not a cosmetic gap, it is a gap in the central decision of the game. Every turn the player is
shown three dice cards and asked to keep one (FR-19). The reason that is a decision at all is the
composition of the pool: a D2 leaves the start area half the time and a D20 one time in twenty, and
whether a hand of three is a good hand or a poor one depends on the twenty cards it was drawn from. A
player who cannot see the pool is making an informed choice only if they have read section 5.1 of the
game design document, which is not a reasonable thing to ask.

Two smaller facts make now the moment:

1. **Spec 03 already delivered the component for it.**
   [03-spec-cards-and-hands.md](03-spec-cards-and-hands.md) § D26 says `.card--full` is delivered
   "although nothing in this handoff shows it, because the pool overlay, the reaction prompt of handoff
   04 and any inspect view all need exactly it". The pool overlay was named there and then never built.
2. **The counter route was closed deliberately, and the overlay route was not.** Pool and discard
   counters were considered for the HUD on 2026-09-01 and dropped, so that sixteen numbers on screen do
   not become twenty-four. That decision is recorded in the header of `src/ui/hud-view.js`. It rules out
   a number in the corner. It does not rule out a screen the player asks for.

**What Claude Code has already built, and what it therefore is not asking about.** The logic, the DOM
and the locale strings exist by the time you read this. `src/ui/styles/pool.css` also exists and
composes existing tokens only: no new colour, no new size, no new type. It is a placeholder written on
the wrong side of the line, exactly like `prompt.css` and `hud.css` before it, and **this brief is the
request to replace it.**

---

## 1 What to design

| Id | Screen | What is wanted |
| --- | --- | --- |
| none | Dice card pool overview | **New, no screen id.** Every denomination in the pool, how many copies of each, and how many cards are face down in the pool right now |
| **S4** | Dice hand | Not redesigned. It is named because the overlay opens from the same decision |
| none | Chrome | A third always-present control opens the overview. The row itself is D42 of handoff 04 and still open |

It is closest to **S10, the rules screen** (FR-35, `should have`, no backlog issue), and it is
deliberately not that screen. S10 explains dice cards, skill cards and the leaving-start rule in prose.
This overview explains one of those three by showing it. If S10 is ever built, this is the part of it
that will already exist.

---

## 2 Hard constraints, each with the reason it exists

The first six are unchanged from handoffs 03 and 04 and are repeated so the spec can be checked without
leaving this file.

1. **jQuery writes attributes, never styles.** Every visual state is a class or a `data-` attribute
   listed in § 3. `src/ui/` carries no colour and no size (NFR-01, `CLAUDE.md`).
2. **No CSS file over 300 lines, measured after `npm run format`** (NFR-02). `board.css` arrived at 248
   lines and Prettier expanded it to 407, so please split yourself at roughly 250 unformatted lines.
3. **No user-facing string in CSS.** Nothing a player reads in a `content:` property (NFR-03). This
   matters here: the copy count "2 mal im Pool" is a locale string on the card and must not become a CSS
   counter.
4. **Built once, then only attributes rewritten** (D10 of spec 01). The seven cards are rebuilt when the
   overview opens and when the language changes, and not otherwise.
5. **Two skins from the tokens**, through `light-dark()` pairs.
6. **`prefers-reduced-motion` is respected.**
7. **Keyboard-reachable and dismissible** (NFR-08). The overview reuses the existing overlay, so it
   already gets `hidden` plus `data-open` and focus on its first button. If your design adds a scroll
   region, it has to be reachable by keyboard as well as by wheel.
8. **The seven cards must fit at 1440x900 without the player scrolling to learn that a D20 exists.**
   This is the one constraint that is a requirement rather than a preference, and it is what D43 is
   about. A player who sees six of seven denominations has been told something false about the pool.

---

## 3 The DOM contract

Claude Code guarantees these elements and attributes exist. The CSS may target them and nothing else.

### 3.1 The overview, as a sixth state of the existing overlay

```html
<div class="overlay" data-screen="pool" data-open="true">
  <div class="overlay__panel">
    <h2 class="overlay__title">Der Würfelkartenpool</h2>
    <p class="overlay__text">17 von 20 Karten liegen verdeckt im Pool.</p>
    <div class="overlay__cards" data-count="7">
      <!-- one .card per denomination, in composition order, D2 first -->
    </div>
    <div class="overlay__actions">
      <button class="overlay__button" data-action="resume" data-variant="primary">…</button>
    </div>
  </div>
</div>
```

- `.overlay__cards` is **new**. It carries `data-count`, which is 7 today and would change if the
  composition changed, so the CSS can lay out by count the way `.hand` already does.
- `data-screen="pool"` is a new value of an existing attribute. The five existing screens are
  `menu`, `setup`, `pause`, `win`, `handover`.
- The panel keeps its existing children and their order. `.overlay__cards` sits between the text and
  the actions.
- There is **no** `data-player` on this screen, because the pool belongs to nobody.

### 3.2 One card in the overview

Exactly the component from spec 03, with the attributes `card-view.js` already writes:

```html
<div class="card" tabindex="0"
     data-card-id="dice-d6" data-card-family="dice" data-faces="6">
  <div class="card__banner">
    <span class="card__type">Würfelkarte</span>
    <span class="card__kind">Sechsseitig</span>
  </div>
  <div class="card__result"></div>          <!-- empty here: no roll in the overview -->
  <div class="card__art"><svg …></svg></div>
  <h3 class="card__title">W6</h3>
  <p class="card__text"></p>                 <!-- empty here -->
  <ul class="card__tags">
    <li class="card__tag">Reichweite 1 bis 6</li>
    <li class="card__tag">Start frei bei 6</li>
    <li class="card__tag">4 mal im Pool</li>
  </ul>
</div>
```

- **The third tag is the copy count** and it is the only thing that distinguishes an overview card from
  a hand card. Whether a tag is the right place for it is D44.
- `data-playable` and `data-selected` are **absent** on these cards. Nothing here is clickable, because
  the overview answers a question and does not offer a choice.
- `tabindex="0"` is on the card because `createCard` puts it there for the hands. If a non-interactive
  card in the tab order is wrong, say so in the spec and Claude Code will make it conditional.

### 3.3 The chrome control

```html
<div class="app__chrome">
  <p class="chrome__turn">Spieler 1 (Rot) ist am Zug</p>
  <button class="chrome__button" data-action="pool">Kartenpool</button>
  <button class="chrome__button" data-action="pause">Pause</button>
  <button class="chrome__button" data-action="language" data-lang="de">English</button>
</div>
```

Three buttons where handoff 04 was asked about two. Both `pool` and `pause` carry `hidden` on the main
menu, where there is no match. D46.

---

## 4 Facts the design must match

Numbers from [Game-Design-Document.md](../../00-Meta/Project-Management/Game-Design-Document.md) § 5.
Never invented here.

### 4.1 The pool

| Denomination | Copies | Share of the pool |
| --- | --- | --- |
| D2 | 2 | 10 % |
| D4 | 3 | 15 % |
| D6 | 4 | 20 % |
| D8 | 4 | 20 % |
| D10 | 3 | 15 % |
| D12 | 2 | 10 % |
| D20 | 2 | 10 % |

Twenty cards, seven denominations (FR-16, FR-17). The weighting is toward the middle. **The shape of
that distribution is the single most useful thing the overview can communicate**, and whether it should
be visible as shape and not only as seven numbers is part of D44.

### 4.2 The face-down count, and why it is almost always 17

Three cards are drawn at the start of a turn and all three go back at the end of it (FR-18, FR-21). So
for nearly the whole of a turn the pool holds seventeen, and the overview will say "17 von 20" almost
every time it is opened. It is 20 only in the narrow window between `endTurn` and the next `drawHand`,
which a player cannot open the overview inside.

**That is worth knowing before you design around the number.** It is a reassurance that nothing has
been lost, not a resource that moves. If a prominent gauge would oversell it, say so: the sentence
sitting quietly under the title may be the right answer, and D45 asks.

### 4.3 What the overview costs the turn

Opening it **pauses the match loop** and closing it resumes, exactly as the pause screen does. So the
turn cannot advance behind the overlay, and the three cards on the hand are the same three when the
player comes back. No animation needs to account for the board changing underneath.

---

## 5 Open decisions this handoff must answer

**D43. Seven cards at once: at what size, and in what arrangement?**
`.card--full` is 260x380. Seven of those in one row is 1820 px before gaps, and the design resolution is
1440x900 with the overlay panel narrower than the viewport. Three shapes suggest themselves and there
may be a fourth: a horizontal rail that scrolls, a grid of two rows, or a smaller `--card-u` than the
dice hand's 0.76. The rail is the one to justify most carefully, because § 2.8 says a player must not
have to scroll to learn that a D20 exists. Whatever you choose, name what `--card-u` is and whether
`.card--full` survives as the reference size or is now only used by the reaction prompt.

**D44. How is the copy count shown?**
Claude Code has built it as a third tag, "4 mal im Pool", because tags already exist and carry the rest
of the card's rules. Three alternatives are worth weighing: a badge in the corner, a stacked-card
illusion where four copies look like four sheets, or the count expressed as size or repetition so the
weighting of § 4.1 is readable as a shape rather than as seven numbers. The tag is the cheap answer and
it is not obviously the right one, because it says the number but not the proportion.

**D45. Where does the face-down sentence sit, and how loud is it?**
Read § 4.2 first: the number barely moves. Options are the `.overlay__text` slot it is in today, a
counter beside the title, or a gauge. If the answer is "leave it where it is", that is a legitimate
answer and Claude Code will not change the DOM.

**D46. A third chrome button.**
Handoff 04 asked in D42 where the chrome's controls sit and what they look like, and that decision is
still open. This adds a third button to the same row, which also carries the turn sentence. Answer D46
together with D42 if that is easier, and say whether three buttons is the point at which the row needs a
different structure.

**D47. Does the overview open from the dice hand as well as from the chrome?**
The chrome button is built. But the question the overview answers is asked while looking at the hand,
and a control on or beside the hand plate would be nearer to it. If you want one, name the element and
Claude Code will add it: the flow already handles the screen and needs only a second entry point. Say no
and nothing is added.

### 5.1 Still open from earlier handoffs, not reopened here

- **NFR-12, telling seats apart without colour**, open since handoff 02. This overlay has no seat
  colour on it and does not touch the question.
- **Fonts are still loaded from Google Fonts.** Self-hosting Baloo 2 and Nunito as woff2 is unchanged
  from spec 01 § 5.
- **D42, the chrome row**, see D46.

---

## 6 Deliverables

| File | What |
| --- | --- |
| `01-Design/Handoff/05-spec-dice-pool-overlay.md` | The five spec sections, one answer per open decision, each with its reason and its rejected alternatives |
| `src/ui/styles/pool.css` | **Replaces** the placeholder Claude Code wrote. Same path |
| `src/ui/styles/card.css` | Only if D43 or D44 needs a new card size or a new tag treatment. Note in the spec that it changed |
| `src/ui/styles/chrome.css` | Only if D46 restructures the row |

If an answer needs a DOM element that § 3 does not promise, name it in the spec rather than styling
around its absence. Claude Code adds it, and that is a smaller change than a stylesheet built on a
guess.

---

## 7 Out of scope, said explicitly

- **Pool and discard counters in the HUD.** Dropped on 2026-09-01 for the reason in the header of
  `src/ui/hud-view.js`. If you think a counter belongs there after all, that is a note in § 5 of the
  spec and not a stylesheet.
- **Which three cards are currently on the hand.** The overview shows the pool's composition and its
  face-down count, and not the identity of the cards on loan. Showing them would make the overview a
  second view of the hand, and the hand is already on screen behind it.
- **The skill card pool.** Fifty-eight cards over twenty-nine ids, with a real discard pile and hands
  that survive turns. It is a different data model and it needs its own brief.
- **S10, the rules screen** (FR-35). Prose about all three subsystems, `should have`, no issue.
- **The dice hand itself.** Spec 03 covers it and it is not reopened.
- **The roll animation** (issue #31). Not part of this.

---

## 8 The five landing checks

Claude Code does not merge a spec unread. This is the list, and it is the same one every handoff uses:

1. Every open decision D43 to D47 answered, none silently skipped.
2. Every answer carries a reason **and** a named rejected alternative.
3. No CSS file over 300 lines after `npm run format`.
4. No user-facing string in a `content:` property.
5. Every state in the § 3 contract actually styled, and any element the spec needs that § 3 does not
   promise named rather than assumed.
