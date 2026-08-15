# Utility Value Analysis: 2D vs. 2.5D vs. 3D
## Method

Six criteria, each weighted by importance to this project (weights sum to 100 %). Each option is
scored 1 (poor) to 5 (excellent) per criterion, based on facts already on record in
[00-One-Pager.md](00-One-Pager.md) and the project journal: not on general opinions about the
engines. Weighted score = weight × points. The option with the highest weighted total wins.

## Options compared

| Option | Description |
| --- | --- |
| **2D** | Browser-based 2D board (the stack actually chosen: JS + jQuery + Vite). |
| **2.5D** | "Cheap 3D" look: pseudo-3D perspective/lighting on top of a still fundamentally flat board, built in Unity + C#. |
| **3D** | Full 3D board, models, camera and lighting, built in Unity + C#. |

2.5D and 3D share the same engine and language as each other (Unity + C#), since that is the stack
the team would have to use to get either of them: the one-pager's initial risk assessment already
frames the 3D-style options this way.

## Criteria and weights

| Criterion | Weight | Why this weight |
| --- | --- | --- |
| Team competence (C# ramp-up) | 25 % | 2 of 3 team members do not know C#; Scrum members also act as their own Scrum Master, so there is no slack to absorb a steep learning curve. |
| Time effort (fits the sprint plan) | 25 % | Fixed timeline: 3 sprints à 2 weeks plus a buffer sprint (~8 weeks total, see [01-Github-Project.md](01-Github-Project.md)). No calendar slack to recover from an underestimate. |
| Visual quality | 15 % | Presentation and playtesting quality matter, but are explicitly traded off against delivery risk per the "magical triangle" reasoning already recorded in the journal. |
| Multiplayer & web deployment capability | 15 % | One-pager names multiplayer as a risk criterion for both original options; deployment target (GitHub Pages / itch.io, browser-based) is assumed elsewhere in the docs. |
| Extensibility | 10 % | Named explicitly in the one-pager's initial risk assessment as a differentiator between the options. |
| Technical risk | 10 % | General project risk of the approach failing to be finishable at all in the available time. |
| **Total** | **100 %** | |

## Scoring

| Criterion | Weight | 2D | 2.5D | 3D |
| --- | --- | --- | --- | --- |
<<<<<<< Updated upstream
| Team competence | 25 % | **5** — whole team already works in JS | **2** — same C# gap as full 3D | **1** — 2 of 3 members must learn C# from scratch |
| Time effort | 25 % | **5** — no engine overhead, fits the 8-week plan | **3** — less asset work than full 3D, but still Unity ramp-up | **1** — modeling, lighting, camera and asset pipeline on top of the C# gap |
| Visual quality | 15 % | **2** — flat board, limited visual polish | **3** — reads as more "produced" than 2D without full 3D cost | **5** — best possible visual result |
| Multiplayer/Deployment | 15 % | **4** — plain web stack, straightforward browser deployment | **3** — Unity networking works but a WebGL build adds friction | **3** — same Unity networking/WebGL friction as 2.5D |
| Extensibility | 10 % | **3** — one-pager flags this as 2D's weak point, but web tooling is still flexible | **4** — Unity's component system | **5** — Unity component system plus full 3D asset ecosystem |
| Technical risk | 10 % | **5** — team stays in a language it knows | **2** — still carries the C# + timeline risk | **1** — highest combined risk (new language, most work, fixed deadline) |
=======
| Team-Kompetenz | 25 % | **5**: whole team already works in JS | **2**: same C# gap as full 3D | **1**: 2 of 3 members must learn C# from scratch |
| Zeitaufwand | 25 % | **5**: no engine overhead, fits the 8-week plan | **3**: less asset work than full 3D, but still Unity ramp-up | **1**: modeling, lighting, camera and asset pipeline on top of the C# gap |
| Optik | 15 % | **2**: flat board, limited visual polish | **3**: reads as more "produced" than 2D without full 3D cost | **5**: best possible visual result |
| Multiplayer/Deployment | 15 % | **4**: plain web stack, straightforward browser deployment | **3**: Unity networking works but a WebGL build adds friction | **3**: same Unity networking/WebGL friction as 2.5D |
| Erweiterbarkeit | 10 % | **3**: one-pager flags this as 2D's weak point, but web tooling is still flexible | **4**: Unity's component system | **5**: Unity component system plus full 3D asset ecosystem |
| Risiko | 10 % | **5**: team stays in a language it knows | **2**: still carries the C# + timeline risk | **1**: highest combined risk (new language, most work, fixed deadline) |
>>>>>>> Stashed changes

## Weighted totals

| Option | Calculation | Total (of 5.00) |
| --- | --- | --- |
| **2D** | .25×5 + .25×5 + .15×2 + .15×4 + .10×3 + .10×5 | **4.20** |
| **2.5D** | .25×2 + .25×3 + .15×3 + .15×3 + .10×4 + .10×2 | **2.75** |
| **3D** | .25×1 + .25×1 + .15×5 + .15×3 + .10×5 + .10×1 | **2.30** |

**Ranking: 2D (4.20) > 2.5D (2.75) > 3D (2.30).**

## Interpretation

2D wins clearly, mainly on the two highest-weighted criteria (team competence and time), which
together account for half the total score. That confirms the decision already made and recorded in
the project journal.

The one non-obvious finding: **2.5D outscores full 3D**, even though the one-pager's original risk
assessment only evaluated 2D against 3D. 2.5D carries the same C#-learning and Unity-deployment risk
as 3D, but without buying back much of 3D's visual advantage: so once the language/time risk is
priced in explicitly, "cheap 3D" is not a good middle ground for this team; it inherits the expensive
option's biggest risk while giving up most of its payoff. This is worth keeping in mind if scope
ever gets renegotiated mid-project: 2.5D is not the safe fallback it might sound like.

## Conclusion

The utility value analysis confirms the 2D web approach as the correct choice given this team's C#
familiarity and the fixed 8-week sprint plan. See
[project-journal.md](../Documentation/project-journal.md) for the original decision record and
rejected alternatives (Unity 3D, Pygame); this file is the supporting weighted-criteria evidence for
that entry.
