# Online Multiplayer Options: FR-42 / issue #42

Written 2026-09-08, before any networking code exists. **This document recommends, it does not
decide.** The decision is the Product Owner's and is not recorded yet.

FR-42 reads: *"Online multiplayer with a lobby"*, acceptance criterion *"Two browsers on different
machines play one match"*, `should have`, 13 points. Section 4.4 of
[Project-Plan.md](Project-Plan.md) leaves it unscheduled and
[Requirements-Specification.md](Requirements-Specification.md) names it the single largest cut
available.

## Method

The same method as [Utility-Value-Analysis.md](Utility-Value-Analysis.md): seven criteria, weighted
by importance to this project, weights summing to 100 %. Each option scores 1 (poor) to 5
(excellent). Weighted score = weight × points.

Scores rest on facts on record in this repository and on the code as it stands on 2026-09-08, not on
general opinions about networking.

## What is true in every option

Four facts do not depend on which option is chosen, so they are not criteria. They are the actual
work, and none of them is about sockets:

1. **Part of the match state lives outside the frozen state object.** `deps = { rng, diceSource }`
   is mutable: `createDicePool()` holds the 20 physical cards, and the mulberry32 generator in
   `core/dice-source.js` holds 32 bits of counter. Any option that ships state has to ship both.
   This is also exactly what FR-45 (survive a page reload) needs, so it is one piece of work serving
   two requirements.
2. **The reaction window's 30 seconds need one owner.** `state/reaction-window.js` measures no time
   on purpose and `ui/timers.js` does. Two browsers means two clocks, and both could decide a window
   expired.
3. **Bots must run in exactly one place**, or the same bot intent is dispatched twice. `src/ai/` is
   already pure and deterministic, so the AI itself needs no change.
4. **`ui/` has one seam and only one.** `dispatch(` appears exactly once in all of `src/ui/`, at
   `game-loop.js:116`, inside `apply(intent)`. Replacing that one function is the whole client-side
   change. Nothing else in `ui/` has to learn that a network exists.

One thing every option **gains**: the handover curtain (`ui/handover.js`) becomes unnecessary,
because each player has their own screen. That deletes a screen's worth of friction.

## Options compared

Every proposal is a pick from two independent axes: **what travels over the wire**, and **which
transport carries it**.

| Option | What travels | Transport | Sketch |
| --- | --- | --- | --- |
| **A Paste** | Whole state | Copy and paste a code | Serialize state plus deps to a string, send it via Discord, opponent pastes it. |
| **B Lockstep** | Intents only | Injectable, chosen later | Both sides start from the same seed and apply the same ordered intent list. |
| **C WebRTC** | Whole state | Browser peer-to-peer | Direct data channel, manual signaling, host client is authoritative. |
| **D Relay** | Whole state | Own Node WebSocket server | A ~150-line server that does rooms and forwarding and knows no Ludo rules. Host client is authoritative. |
| **E Server-authoritative** | Redacted per-seat views | Own Node WebSocket server | The server imports `src/core/` and `src/state/` unchanged and owns state, clock and bots. Each client gets its own hand in full and other hands as a count. |
| **F Hosted backend** | Whole state or intents | Firebase, Supabase, PartyKit | Clients subscribe to a shared match document. |

## Criteria and weights

| Criterion | Weight | Why this weight |
| --- | --- | --- |
| Fits the remaining time | 30 % | [Project-Plan.md](Project-Plan.md) sets 2026-09-14 to 2026-09-17 as "bug fixes only, no new features", and #24, #25, #19 and #20 all sit in it. That leaves about four working days from 2026-09-08. |
| Meets FR-42's acceptance criterion | 20 % | Two browsers on different machines, plus the lobby the requirement names. An option that does not clear this does not close the issue. |
| Infrastructure cost | 15 % | [notes/07-tooling.md](../Documentation/notes/07-tooling.md) records that **no deployment target has been chosen**. Anything needing a hosted process needs that decision first, and needs to still work on demo day. |
| Hidden-information integrity | 10 % | The skill hands are secret: `ui/handover.js` exists for that reason alone. 10 % and not more because "we trust the people we play with" is a defensible answer for this project. |
| Testability | 10 % | `CLAUDE.md` requires an E2E test per player-facing flow and ≥ 80 % lines in `core/`, `state/` and `ai/`. An option that cannot be tested cheaply lowers the project's headline numbers. |
| Architecture and report value | 10 % | The module is assessed on the written report. An option that demonstrates something about the architecture is worth more than one that only works. |
| Dependency footprint | 5 % | `CLAUDE.md` requires approval for every new runtime dependency. Low weight because approval is one question, not a blocker. |
| **Total** | **100 %** | |

## Scoring

| Criterion | Weight | A Paste | B Lockstep | C WebRTC | D Relay | E Server auth | F Hosted |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Fits remaining time | 30 % | **5** ~1 day | **4** ~2 days for the core | **3** 2 to 3 days, fiddly API | **3** 2 to 3 days | **1** 4 to 6+ days plus a `ui/` refactor | **2** unpredictable |
| FR-42 acceptance | 20 % | **1** not live, no lobby | **2** needs C, D or F to connect anything | **3** two browsers yes, lobby weak, NAT can fail | **5** two browsers and a real lobby | **5** same, plus reconnect | **5** lobby and presence built in |
| Infrastructure cost | 15 % | **5** none | **4** none for the core | **5** none with manual signaling | **2** needs a hosted Node process | **2** same | **3** rented, but an account that must work on the day |
| Hidden information | 10 % | **1** the code carries every hand | **1** every client computes every hand | **2** host holds everything | **2** host holds everything | **5** the client never receives other hands | **2** not without server-side rules |
| Testability | 10 % | **4** the serializer is a pure unit test | **5** a whole two-player match as one Vitest test over a loopback transport | **1** two contexts plus WebRTC in Playwright | **3** two Playwright contexts are feasible | **4** the server runs `core/` headless | **2** an external service in the test path |
| Report value | 10 % | **2** low, but feeds FR-45 | **5** proves determinism, gives replay and bug reproduction | **3** | **3** | **5** proves the layering rules were worth it | **1** rents the interesting part |
| Dependency footprint | 5 % | **5** none | **5** none | **5** browser API | **3** `ws`, small | **3** `ws`, small | **1** large SDK plus an external account |

## Weighted totals

| Option | Calculation | Total (of 5.00) |
| --- | --- | --- |
| **B Lockstep** | .30×4 + .20×2 + .15×4 + .10×1 + .10×5 + .10×5 + .05×5 | **3.55** |
| **A Paste** | .30×5 + .20×1 + .15×5 + .10×1 + .10×4 + .10×2 + .05×5 | **3.40** |
| **D Relay** | .30×3 + .20×5 + .15×2 + .10×2 + .10×3 + .10×3 + .05×3 | **3.15** |
| **E Server auth** | .30×1 + .20×5 + .15×2 + .10×5 + .10×4 + .10×5 + .05×3 | **3.15** |
| **C WebRTC** | .30×3 + .20×3 + .15×5 + .10×2 + .10×1 + .10×3 + .05×5 | **3.10** |
| **F Hosted** | .30×2 + .20×5 + .15×3 + .10×2 + .10×2 + .10×1 + .05×1 | **2.60** |

**Ranking: B (3.55) > A (3.40) > D = E (3.15) > C (3.10) > F (2.60).**

## Interpretation

**The headline finding is the spread, not the winner. Nothing scores above 3.6 out of 5.** In the
2D/2.5D/3D analysis the winner scored 4.20 and the gap to second place was 1.45, which is what a
clear decision looks like. Here the top five sit inside 0.45 of each other and none of them is good.
That is the honest reading of FR-42 on 2026-09-08: **there is no option that both closes the issue
and fits the time left.** The two options that score best are the two that do not close it.

Three findings behind that:

- **The two highest scorers win on cost, not on delivery.** A and B score well because they are
  cheap and need no infrastructure, and both score 1 or 2 on the acceptance criterion. Reading B's
  3.55 as "build B and #42 is done" would be reading the table wrong.
- **D and E tie at 3.15 for opposite reasons, and the tie is the useful part.** D is buildable in the
  time and buys nothing structural. E buys the only design where reading an opponent's hand is
  impossible rather than merely rude, plus the strongest report claim available (the `core/` and
  `state/` layers really do run under Node with no browser, which is what the `CLAUDE.md` layering
  rules were for), and it cannot be built by 2026-09-14. **If time appears after 2026-09-17, the one
  to build is E, not D.** D is the compromise, not the destination.
- **F ranks last and it is the only option that would look like the obvious modern choice.** It loses
  on report value and dependency footprint: for a project graded on what the team built, renting the
  interesting part is a poor trade, and it still does not protect the hands by default.

## Recommendation

**Two days maximum, on `feature/42-online-multiplayer`, building option B's lockstep core with an
injectable transport**, the same dependency-injection pattern already used for `rng` and
`diceSource`. Test it with an in-memory loopback transport so a full two-player match is a Vitest
test with no socket involved. Then either bolt C or D onto that interface if time allows, or bolt on
nothing and keep the chapter.

Then **cut FR-42 from the release** and record it as cut, with this document as the reason. A
documented architecture plus a tested spike plus a named cut is a better outcome for a graded report
than a half-working feature that breaks the 2026-09-14 freeze. Negative findings staying in is
already this project's documentation rule.

**If it must ship for the demo anyway: option D, scoped down on purpose.** Two players only, a room
code instead of a lobby, host authoritative, no reconnect, reaction windows left sequential, and
"the host can technically see your hand" written into `CHANGELOG.md` as a known limitation.

## Open decisions this document cannot make

1. **Cheat-proof hands, or "we trust our friends"?** This is the whole fork between D and E. Answer
   it first: everything else follows.
2. **Is there any hosting at all?** A university VM, a free tier, or nothing. If nothing, D, E and F
   are out and the answer is C.
3. **`src/net/` would be a new top-level layer** and `CLAUDE.md` calls the current layout binding.
   Adding it needs a decision block and its own import rule: `net/` may import `core/` and `state/`,
   and never `ui/`.
4. **Which dependency, if any?** `ws` for D and E, `peerjs` for a friendlier C, a large SDK for F.
   All need explicit approval.
5. **Two players or up to four?** Every extra seat multiplies the reaction-window ordering cases that
   have to be tested.
