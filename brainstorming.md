# Ideas for CLAUDE.md
## Git Branching Strategy (GitHub Flow)
Do not allow direct pushes to the main branch.
- main: Always contains a working, playable build.
- Feature Branches: Branch off main for individual issues using the naming convention feature/issue-number-description (e.g., feature/#12-dice-pool-ui or fix/#34-pawn-overlap).

### Pull Request (PR) Policy:
- Minimum 1 code review approval from a teammate before merging into main.
- Merge strategy: Use Squash and Merge to keep the main commit history clean.

## GitHub Projects Setup (Scrum Board v2)
- Set up a Projects v2 board inside your repository or organization:  
1. Custom Fields to Add:
 - Iteration (Set 2-week Sprint cycles: Sprint 1, Sprint 2, Sprint 3). 
 - Story Points (1, 2, 3, 5, 8 using Fibonacci estimation).
 - Category (Gameplay, UI, Art/Audio, Bug, Mechanics).
 
2. Board Columns
 - Backlog (Unassigned user stories)
 - Ready for Sprint (Prioritized items for the active sprint)
 - In Progress (Actively being worked on)
 - In Review (Pull Request open)Done (Merged into main and verified playable)
 
3. Recommended GitHub Actions (Automated CI/CD)
 - Auto-Link Issues to PRs: 
   Require developers to include Closes #<issue_number> in PR descriptions so GitHub automatically closes the issue and moves the board card to Done upon merging.
 - Build Validation Workflow (.github/workflows/build-check.yml): Trigger on every Pull Request to main.Automatically compile the project to ensure no syntax or missing reference errors break the build before merging.
 - Automated WebGL/Executable Artifacts (Optional but Recommended):Configure GitHub Actions to create a playable WebGL build (hosted via GitHub Pages or itch.io) on every merge to main. This allows your team and supervisor to test progress directly in a browser without downloading project files.