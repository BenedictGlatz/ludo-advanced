# GitHub Project
## Content
We implement a Github project with
1) Scrum Roadmap
2) Kanban-Board for current issues/tasks

## Roles
| Person |	Primary Scrum / Management Role	Primary Technical Role |
| ------ | --------------------------------------------------------|
| Developer A | Product Owner (Manages Backlog, Scope & Card/Dice Balance)	| Game Logic Lead (Board Rules, Turn Manager, Card System) |
| Developer B | Scrum Master (Facilitates Sprints, GitHub Board & PR Reviews) | Systems Lead (Enhanced Dice Pool, UI State, Input System) |
| Developer C | Quality & UX Lead (Playtesting, Presentation & Visuals)	Art/Audio Integration, VFX, Scene Layout & Game Loop |

## Sprint Planning
### Week 1
- Sprint 0
- Planning & Prototyping

#### Tasks
- Define rulebook for your Ludo variation (board layout, win conditions, how skill cards are drawn/played, dice pool math).
- Paper-prototype or spreadsheet-test the card mechanics and dice pool balance.
- Set up repository, engine project (Unity/Godot/Web), and GitHub Projects board.
- Agree on asset formats, screen resolution, and coding standards.

### Week 2-3
- Sprint 1
- Core Gameplay & Board MVP

#### Tasks
- Board layout & tile grid logic.
- Standard 1–6 dice roll & basic pawn movement system.
- Turn manager (Player 1 → Player 2 → Player 3 → Player 4 / AI).
- Basic knockout/capture mechanic when landing on opponent tokens.

### Week 4-5
- Sprint 2
- Skill Cards & Dice Mechanics
- Multiplayer

#### Tasks
- Dice Pool: Implementation of special dice (e.g., weighted, elemental, double-roll dice) and selection UI.
- Skill Cards: Deck system, hand UI, action system (e.g., "Shield token", "Swap positions", "Reroll").
- Resource/Energy System: How players gain or spend points to buy/use cards or enhanced dice.

### Week 6-7
- Sprint 3
- Polish, Art, Audio, Fixes

#### Tasks
- 2D sprites, animations, UI skins, particle effects for skills/cards.
- Sound effects (dice rolls, card play, victory) and background music.
- Main Menu, Pause Menu, Win/Loss screens, and Restart flow.

### Week 8
- Sprint Buffer
- Playtesting & Presentation

#### Tasks
- Playtesting: Have 3–5 external people play the game without instructions to identify UI issues.
- Fallback Video: Record a 2-minute clean gameplay walkthrough video to show during the presentation in case live hardware fails.
- Presentation Deck: Prepare slides highlighting Scrum velocity, burn-down charts, architecture decisions, and mechanic tradeoffs.

## Documentation

The running record moved to [00-Meta/Documentation/](../Documentation/00-index.md) on 2026-08-06.

- Dated log of what was done: [project-journal.md](../Documentation/project-journal.md)
- Decisions with their rejected alternatives: same file, `## Decisions`
- Planned versus delivered scope per sprint: [sprint-log.md](../Documentation/sprint-log.md)
- Chapter notes for the final report: [00-index.md](../Documentation/00-index.md)