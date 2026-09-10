# Handoff 19, spec: the online lobby, three screens and the seats at the table

**From:** Claude Design
**To:** Claude Code
**Date:** 2026-09-10
**Answers:** [19-brief-online-lobby.md](19-brief-online-lobby.md), D116 to D122.
**Read against:** `272e36e` on `feature/101-online-bots`, as rule 9 asks, with one qualification:
that branch is not on the remote, so the stylesheets were read on `dev` (`18f776f`), which is the
2026-09-09 lobby without #101, and the #101 delta was taken from § 0, § 1 and § 5 of the brief and
from the 2026-09-10 status block of `00-open-requests.md`. Every selector named below is in the brief's
§ 5 contract; nothing was assumed from the unpushed tree.
**Retires:** nothing. D85 of brief 13 stays open and D120.2 leans on it.

The artboards are on one canvas, `Online Lobby.dc.html` at the project root: the door (19a), the host's
table with four seats, one guest connected, one bot and an invite out (19b, the case § 8 asks for, with
the stage switchable in Tweaks: idle, gathering, connecting, the twenty-second failure, a bad code), the
host's table with everybody in and Start offered (19c), and the guest's screen during its long wait (19d).
Skin and greyscale are Tweaks on the canvas.

---

## 1 Files delivered

| File | State | Lines |
| --- | --- | --- |
| `src/ui/styles/lobby.css` | **Replaced.** The three screens, the four kinds of row, the fields with their buttons, the failure tone, the two stages that breathe | 284 |
| `01-Design/Handoff/19-spec-online-lobby.md` | New, this file | n/a |

**Nothing else changes.** No diff for `lineup.css`: D120 keeps the control identical on the host's rows,
and the four rules that name both screens on `272e36e` stay as they are. No diff for `overlay.css`: the
door borrows setup's panel width at higher specificity, and the failure tone is a rule on
`.overlay__text[data-tone]` in `lobby.css`. No diff for `tokens.css` or `motion.css`: the one duration
this file uses is `--motion-pulse`, which exists and is already 0 ms under reduced motion.

**Load order: `lobby.css` after `lineup.css`**, unchanged. It overrides the row's grid on
`[data-screen="host"]` at one attribute selector more specificity than `lineup.css`'s `.overlay__seat`.

**Two DOM additions and two locale additions are asked for in § 5.** The stylesheet is written against
them and degrades to the placeholder's behaviour where they are missing: without `data-tone` a failure is a
muted sentence; without `.overlay__field-action` Copy and Connect stay in the actions row and the fields
lose nothing but their neighbour.

---

## 2 The shape of the answer, in five sentences

A seat somebody sits at is a raised object and a seat nobody sits at lies flat: the host, a connected
guest and a bot carry the ink edge and the hard shadow of every card and pill in this game, and a free
seat is a dashed outline on its own wash, which is how this project already spells "nothing here yet"
(D117). The status word leaves the end of the row and sits under the name, so the row is three things
wide, plate, name over word, control, and the line-up's control fits on a free seat without being
shrunk (D117.3, D120). The stage of the exchange moves onto the row it belongs to, as two more
`data-status` values and two words, and the sentence under the title keeps only the hint and the
failure, which gets a warn wash and ink text rather than orange type (D118). A code stays a textarea,
two lines tall, with its own button beside it rather than in the row at the foot, and the guest's paste
field is the tall one because for a moment it is the whole screen (D119). Waiting is still, because it
may last minutes; only the two stages that are the browser's work breathe, on `--motion-pulse`; a failed
exchange offers a fresh code in place; and the lobby says nothing about hands or reconnects, because the
Product Owner ruled the first and the abandoned screen already says the second (D121, D122).

---

## 3 The decisions

### D116. The door stays, and it looks like the setup screen it precedes

**Keep `data-screen="online"`. Its panel takes setup's 34rem (490 px), it keeps title, paragraph and the
three buttons with Host as the one primary, and it takes the card language of every pre-match question,
not the menu's dealt doors.**

1. **Kept, D116.1.** The paragraph is the only place the whole idea, one hosts, codes travel by chat,
   is said before anybody has committed to a count or pasted anything. On the host's screen the
   sentence is already busy (D118), and on the guest's the player has a code in hand and wants a field.
   *Rejected: folding Host and Join into the main menu's Online door, D116.2.* It saves one click on a
   flow that is entered once per session, and it costs the menu its shape: 12c is three doors of two
   sizes, and a fourth door, or one door with two buttons on it, is a different screen from the one spec
   12 drew. The paragraph would have nowhere to go but a hint line on a door.
2. **Setup's language, not the menu's, D116.3.** The door is the first of a run of three pre-match
   questions seen back to back, and the setup screen after it is a 34rem card with three buttons. A menu
   sized illustration screen between S1 and a card would make the run read menu, menu, card. *Rejected:
   the menu's card-face doors with `.overlay__art`.* Two illustrated screens in a row is a picture book,
   and the drawings would need a fourth and fifth illustration for Host and Join.
3. The keyboard lands on Join, the first `.overlay__button`. That is the right first stop: the guest is
   the more common role, three of four players are guests.

### D117. Four kinds of row: raised or flat, then the word

**A row spoken for (host, connected, bot) has `border: var(--border-card) solid var(--color-ink)` and
`box-shadow: var(--shadow-card)`. A free row (waiting, gathering, connecting) has a dashed edge in
`color-mix(in srgb, var(--color-ink) 32%, transparent)` and no shadow. Both keep `--player-soft` as
the wash. The status word moves under the name; the control keeps the third column.**

1. **At a glance and without colour, D117.1.** Raised versus flat is the project's own cue for a thing
   that is there versus a thing that is not: the chosen position on the line-up, the dead door on the
   menu, the empty hand slot. So a host looking at four rows sees at once how many are still outlines.
   The dashed edge is the second cue, the word is the third; none is a colour. *Rejected: the row's
   wash going dormant on a free seat.* `board-regions.css` draws a seat that is not in the match in
   dormant, and a free seat is in the match; it is just not filled yet.
2. **Connected versus free in more than the word, D117.2.** The raise. A connected guest's row is
   indistinguishable from the host's own except for the word, and that is right: both are people at the
   table. *Rejected: a tick or a second mark on a connected row.* The raise is already the mark.
3. **The word gives way to a second line, not to the control, D117.3.** On a free seat both facts
   matter: "Wartet auf Verbindung" is the fact and Spieler/Bot is the choice. Four tracks wide made the
   row a band; two lines under one name keeps it a row. The grid is `auto 1fr auto` with two rows, the
   plate and the control span both. *Rejected: hiding the word on a row that carries the control.* A row
   reading "Spieler 4 (Blau)" with Spieler pressed says nothing about whether anybody is there.
4. **Turn order, D117.4.** Nothing is added. The number in the name is the seat number, seat order is
   turn order, and the rows are in seat order with the host first: "Spieler 1", "Spieler 2", "Bot 3",
   "Spieler 4" is the order of play read top to bottom. *Rejected: an ordinal badge per row.* A third
   counter on a row whose name already carries one.

### D118. The sentence keeps the hint and the failure; the stage moves to the row

**Two more values of `data-status` on the pending row, `gathering` and `connecting`, with two words,
`online.seat.gathering` and `online.seat.connecting`. `.overlay__text` carries the hint while idle and
the failure on error, with `data-tone="warn"` on error. On the guest's screen, which has no rows, the
sentence keeps the stage as today.**

1. **The stage on the row, D118.1.** A connection belongs to one seat, and the row already says which.
   "Code wird erzeugt …" under seat 4's name says whose code; the same words under the title say it for
   the whole table. *Rejected: leaving the stage in the sentence.* The sentence then has four jobs and
   the hint, the one thing a first-time host needs, is gone for the whole exchange.
2. **One failure tone, D118.2.** `data-tone="warn"`: `--color-warn-soft` wash, `--color-warn` edge,
   text in `--color-text`. All four failures take it; whose fault it is, the player's, the network's or
   nobody's, is what the sentence says in words and not what the wash says. Ink text, not orange text:
   `#e07038` on the panel is about 2.9:1 and a failure is the one sentence a player has to read to the
   end. *Rejected: three tones by blame.* Three colours for one kind of event, and a player meets each
   perhaps once.
3. **Gathering breathes, D118.3.** The plate of a row in `gathering` or `connecting` runs
   `lobby-breathe`, opacity 1 to 0.35, on `--motion-pulse` alternating. Under reduced motion
   `--motion-pulse` is 0 ms and the block at the foot of the file sets `animation: none`, so the word
   carries the stage alone. Only these two stages move: both are the browser's own work with a known
   ceiling, five and twenty seconds. *Rejected: a spinner glyph.* The project has no spinner and a
   pulsing seat plate says which seat is busy; a spinner says only that something is.
4. **The bot rule stays in the sentence, D118.4**, appended to the idle hint as today, on D91.4's
   precedent: it is a fact about the table and not about seat 3, and it is what lets the last free
   seat's Bot position be `disabled` rather than argumentative (D93). *Rejected: a line under the
   rows.* A second sentence slot is a new element for one rule that already has a slot.

### D119. A textarea, two lines, with its button beside it

**Both codes stay textareas, `min-height: 3.5rem`, `max-height: 6rem`, `resize: none`. The readonly one
is a record: dormant wash, dormant edge, muted text. Each field's button moves into
`.overlay__field-action` after the textarea, right aligned on the same line as the textarea's foot. The
guest's paste field is `6rem` to `9rem` tall.**

1. **A textarea, D119.1.** Pasting into a field you can see is what people trust, and the one job the
   box does is to show that something long arrived whole. Two lines show that; three showed a third line
   of noise. *Rejected: a "code ready" tile with only Copy.* It hides the thing the player is about to
   paste into a chat, and a player who cannot see the code cannot tell a fresh one from the last one.
   *Rejected: a single-line field with first and last characters.* Same fault, and an ellipsis in a
   monospaced face reads as a truncated value, which is the one thing a code must not look like.
2. **Beside its field, D119.2.** Copy under the invite and Connect under the reply, each next to the
   thing it acts on. In the actions row the two buttons were two verbs with no object at the foot of a
   card that had two fields above them, and `data-field` was doing in the DOM what position should do
   on screen. *Rejected: leaving them in the actions row with a label per button naming the field.*
   Longer labels for a fact position gives for free. **Keyboard:** with the button inside the field
   region the first `.overlay__button` on the host's screen stays the first free row's Bot switch when
   a seat is free. The right first stop while an invite is out is Copy; § 5 asks for that.
3. **"Kopiert" until the next redraw, D119.3.** Kept. The next redraw is the next stage change, which is
   the moment the code has done its job; before that, the label saying Kopiert is the only record that
   the click landed, and it should stay until it is no longer true. A label change is enough: the
   button is the thing the player just pressed and is looking at. *Rejected: a timed flip back after
   two seconds.* A timer that flips a label the player may not be looking at, for no reason the screen
   can explain.
4. **The paste field is taller on the guest's screen, D119.4.** Six to nine rem, so it is the biggest
   thing on a screen that has nothing else on it yet, and so a 600-character paste is visibly whole.
   Not a drop target: nothing in the project is, and a paste is what the hint says to do. *Rejected:
   one size for both screens.* The host's fields share a card with four rows; the guest's has the card
   to itself.

### D120. Spec 15's control, unchanged, on the host's free rows

**Identical: same `.overlay__button[data-action="controller"]`, same 14rem pair, same raised chosen
position, same flat unchosen one, same `disabled` in `--color-dormant`. `seatChoices` stays one function.
No diff to `lineup.css`.**

1. **Same look, same size, D120.1.** With the status word under the name (D117.3) the row has the room
   the line-up's row has, so the fifth-of-the-panel argument no longer applies. And it is the same
   choice, made by the same person, one screen apart in the hot-seat flow. *Rejected: a 10rem lobby
   variant.* Two sizes of one control in one component, and `seatChoices` forks for a width.
2. **A bot row in the lobby looks like a bot row on the line-up, D120.2**: the name says Bot, the Bot
   position is raised, and since D117 the row itself is raised because the seat is spoken for. What a
   bot looks like in the match is D85 of brief 13, still open; when it is answered the two pre-match
   screens already agree with each other, and whatever mark D85 adds to the HUD plate can be added to
   `.overlay__seat[data-controller="bot"]` in one rule. *Rejected: answering D85 here.* It is a
   question about the HUD and the board, and this brief is about the lobby.
3. **The dead position's reason, D120.3.** Confirmed: the sentence, on D93's precedent, and the control
   drawn in `--color-dormant`. Nothing is added.

### D121. Waiting is still; the two bad ends get a way out and a name

1. **Waiting for the other side, D121.1.** A still screen with the fact in words: on the host's table
   the free row's dashed outline and "Wartet auf Verbindung"; on the guest's screen the sentence and the
   reply code sitting ready under Copy. Nothing pulses while a friend is in a chat window, because that
   may take minutes and a thing that pulses for minutes reads as hung. Only `gathering` and `connecting`
   breathe (D118.3), and both have a ceiling. *Rejected: a breathing plate for the whole wait.* See the
   sentence before this one.
2. **The twenty seconds, D121.2.** The warn sentence (D118.2), and in place of Connect the host is
   offered a fresh code: § 5 asks that on `nat` and `failed` the `add-guest` button is present with the
   label `online.retry`, "Neuen Code erzeugen", so the way out is the next step and not Back. How loud:
   the wash and nothing else. It is one row of one table that failed. *Rejected: the failed row itself
   going warn.* The seat did nothing wrong and will be offered again.
3. **A dropped guest, D121.3.** Yes, name the seat: § 5 asks for `match.abandonedBy`, "{{player}} hat
   die Verbindung verloren", as the abandoned screen's `.overlay__text` when the state knows the seat.
   The title stays `match.abandoned`. *Rejected: leaving it at "Die Partie wurde abgebrochen".* Three
   players are looking at the same sentence and two of them did nothing.

### D122. The lobby says nothing about its limitations before they happen

1. **Hands, D122.1.** No sentence. The Product Owner ruled "we trust our friends", the changelog records
   the limitation, and a warning on the host's screen would be the first thing a new player reads about
   a mode they have not tried. *Rejected: one muted line above Start.* Every session, forever, for a fact
   that matters only to a player who would open developer tools.
2. **Reconnect, D122.2.** Only after: the abandoned screen names who left (D121.3), and that is the
   moment the fact is useful. *Rejected: a line before Start.* A host who has just got three friends
   connected does not need to be told what happens if one of them leaves; the screen that follows a
   drop does.

---

## 4 Token reference table

No token is added or changed. The tokens this file reads:

| Token | Used for |
| --- | --- |
| `--color-ink`, `--border-card`, `--shadow-card` | The raised row |
| `--color-warn`, `--color-warn-soft`, `--color-text` | The failure sentence |
| `--color-dormant`, `--color-dormant-soft`, `--color-text-muted` | The readonly code, the status word while free |
| `--color-surface`, `--font-num`, `--text-sm`, `--leading-body` | The textarea |
| `--motion-pulse` | The breathing plate; 0 ms under reduced motion |
| `--space-1` to `--space-4`, `--radius-card` | Spacing and radii |

The two numbers that are not tokens, 34rem and 44rem, are the setup screen's and the line-up's panel
widths, restated on these screens for the reason `lineup.css` and `menu.css` give.

---

## 5 Component states covered, and what the contract needs

Against § 5 of the brief. Every selector there is styled or deliberately untouched:

| Selector | Styled |
| --- | --- |
| `.overlay[data-screen="online"]` | Panel 34rem, text 46ch |
| `.overlay[data-screen="host"]`, `"join"` | Flex sheet, 44rem panel, 26rem below the breakpoint |
| `.overlay__seat[data-status="host"]`, `"connected"`, `"bot"` | Raised: ink edge, hard shadow, word in ink |
| `.overlay__seat[data-status="waiting"]` | Flat: dashed edge, word muted |
| `.overlay__seat[data-status="gathering"]`, `"connecting"` | **New values.** Flat, plate breathes |
| `.overlay__seat-name`, `.overlay__seat-status` | Two lines in the second column |
| `.overlay__seat-choice` | Third column, spans both lines, hidden when empty |
| `.overlay__button[data-action="controller"]` | `lineup.css`, unchanged |
| `.overlay__text[data-tone="warn"]` | **New attribute.** Warn wash and edge, ink text |
| `.overlay__fields`, `.overlay__field`, `.overlay__field-label` | Two-column field grid, label across |
| `.overlay__textarea`, `[readonly]` | Two lines, no resize; readonly is dormant |
| `.overlay[data-screen="join"] .overlay__textarea:not([readonly])` | Six to nine rem |
| `.overlay__field-action` | **New element.** The field's own button, right aligned |
| `.overlay__button[data-action="copy"]`, `"connect"`, `"add-guest"`, `"start-online"`, `"host"`, `"join"`, `"back"` | `overlay.css`, unchanged |

**Asked of Claude Code**, in the order they matter:

1. **`.overlay__field-action`** inside `.overlay__field`, after the textarea, holding the button whose
   `data-field` names this field. `copy` and `connect` leave the actions row; `add-guest`, `start-online`
   and `back` stay. `events.js` reads the same attributes. `lobby-screen.js` puts the button on the
   field description rather than in `buttons`.
2. **`data-tone="warn"` on `.overlay__text`** whenever `snapshot.error !== null`, on all three screens.
3. **`data-status="gathering"` and `"connecting"`** on the pending row during those two stages, with
   `online.seat.gathering` "Code wird erzeugt …" and `online.seat.connecting` "Verbindet …" as its
   word. The sentence stops carrying the stage on the host's screen and carries the hint (or the error)
   instead; on the guest's screen it carries the stage as today.
4. **Keyboard:** while an invite is out, the first stop is Copy; on the guest's screen, Connect. A
   `data-autofocus` on that button, or the equivalent in `overlay-view.js`, is yours to name.
5. **On `nat` and `failed`**, `add-guest` is offered with `online.retry`, "Neuen Code erzeugen", and
   the pending link is closed.
6. **`match.abandonedBy`**, "{{player}} hat die Verbindung verloren", on the abandoned screen when the
   seat is known.

Items 1 to 3 change what the screens offer and so touch `lobby-screen.test.js`; item 1 moves two buttons
in `online.spec.js`'s DOM without renaming an attribute.

---

## 6 What is still open

- **D85 of brief 13**, what a bot looks like in play. D120.2 says where the answer lands on this screen.
- **The 26rem breakpoint layout** is drawn from `lineup.css`'s and not checked on a phone; the fields
  stack and the control goes under the name. Worth one look on a real device, as the menu got.
- **The `stale` stage** has a sentence and nothing sets it; nothing here styles it beyond the failure
  tone it would take if it ever became an error.

**No em dash in this file or in `lobby.css`.** Rule 5, checked.
