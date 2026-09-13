# One Pager

The front door to Ludo Advanced: what the game is, who builds it, and by when. One page. The rules
live in [game-design-document.md](game-design-document.md), not here.

## Objective

Ludo is a classic board game played with dice and pawns. The goal is to be the first player to move
all four of your pawns from the starting area to your home area by rolling the dice and moving
strategically around the board. Ludo is designed for **2 to 4 players**.

Ludo Advanced implements an advanced Ludo alternative, where the player has more options than just
rolling dice. It covers one **Dice Card Pool** and one **Skill Card Pool**.

## The base game

- Each player starts with four pawns in their starting area, the circle of their colour with four
  empty spaces inside.
- **Turn.** At the beginning of each turn, the player draws 3 cards out of the Dice Card Pool. They
  then choose one and roll that die. The 3 cards are shuffled back into the Dice Card Pool.
- When the roll is the highest number of the chosen die, the player may move one pawn out of the
  starting area onto their start square. Alternatively, they may move one of their pawns already on
  the track forward.
- **Eliminating pawns.** If your pawn lands exactly on a square occupied by an opponent's pawn, you
  capture that pawn and it is sent back to its starting area.

## The two card pools

- **Dice Card Pool:** dice cards from D2 to D20. A small die is the card that gets pawns out of the
  starting area, a large die is the card that moves them, and choosing between them is the decision
  the pool exists for.
- **Skill Card Pool:** cards with two effect types. **Action** cards are activatable on your own
  turn. **Reaction** cards are activatable in response to actions of other players.

## MVP boundary

The MVP is a **rule-complete game for 2 to 4 players on one device**, played hot-seat in a browser,
in German and English. Online multiplayer, bot opponents, an expanded card set, trap cards and rule
toggles are named extensions and are outside it. The full priority list is
[requirements-specification.md](requirements-specification.md).

## Framework

**Roles**

- Product Owner, defines *what* and *why*: Fabian Gemming
- Scrum Member, implementation: Lars Bolender
- Scrum Member, implementation: Benedict Glatz

There is no dedicated Scrum Master. The Scrum Members also do the Scrum Master work, defining how to
implement (workflows and so on).

**Process:** Scrum, 3 sprints of 2 weeks, preceded by Sprint 0 and closing with playtesting and the
presentation. Dates from the GitHub Projects board *Ludo Advanced*, which is the single source of
truth for what is in a sprint:

| Sprint | From | To | Scope on the board |
| --- | --- | --- | --- |
| Sprint 0 | 2026-07-23 | 2026-08-09 | 7 setup and initialisation issues, all closed |
| Sprint 1 | 2026-08-10 | 2026-08-23 | 13 definition and planning issues, including this document |
| Sprint 2 | 2026-08-24 | 2026-09-06 | Not assigned yet. Prose plan: dice pool, skill cards, multiplayer |
| Sprint 3 | 2026-09-07 | 2026-09-17 | Not assigned yet. Prose plan: polish, art, audio |

Three open points, all of them for the project plan, issue #15, to settle: the board holds no buffer
sprint, Sprint 3 is 1½ weeks rather than 2, and the gameplay scope has no sprint yet, so it lands in
Sprint 2 or later together with the project bootstrap.

## Initial plan

Two options were evaluated as a risk assessment:

1. **2D approach (Web):** fewer possibilities for extensibility, multiplayer.
2. **3D approach (Unity):** a new programming language for 2 of 3 people, asset creation,
   multiplayer.

The 2D web approach was chosen. The comparison was later formalised over three options, 2D, 2.5D and
3D, in [utility-value-analysis.md](utility-value-analysis.md), which confirms 2D.

## Where to read further

| Question | Document |
| --- | --- |
| What are the exact rules? | [game-design-document.md](game-design-document.md) |
| What must be built, and how is it checked? | [requirements-specification.md](requirements-specification.md) |
| What are the project goals? | [smart-analysis.md](smart-analysis.md), [functional-and-non-functional-goals.md](functional-and-non-functional-goals.md) |
| How is the code structured? | [system-architecture.md](system-architecture.md) |
| Can this be delivered? | [feasibility-study.md](feasibility-study.md) |
| What can go wrong? | [risk-analysis.md](risk-analysis.md) |
| Why 2D and not 3D? | [utility-value-analysis.md](utility-value-analysis.md) |
| Who cares about this project? | [stakeholder-analysis.md](stakeholder-analysis.md) |
| How is the work organised? | [github-project.md](github-project.md) |
