# Open review findings (2026-11-20)

Branch `more-skills` is the last checkpoint where the whole test suite passed (1,755 tests): 231 skills, Learn-it
lessons, spaced review, Keep going, Early Start with read-aloud. It is NOT reviewed-clean and is not merged to `main`.

Branch `more-skills-wip` holds half-finished fixes that were stopped mid-edit. Its tests may fail. Treat it as a
reference, not a base.

## Findings still to fix
- `level3-4.md`, `level5.md`, `level6.md`, `level7.md`: independent review of the new skills in those levels.
- Levels 1 and 2: the review was not finished.
- Early Start (level 0), main points: pictures unreadable in dark mode (draw each picture on its own light panel);
  a pattern question with two valid answers; color pairs too close together; a square offered as a wrong answer for
  "rhombus" or "rectangle"; first-sound stems that fit two words ("?og"); "a eight", "a oval", "grey"; three test
  assertions that cannot fail (`\b` inside a template literal).
- App code, main points: every mastered skill of a migrated learner comes due for review on the same day (stagger and
  cap per day); an unknown skill id in saved progress crashes the Mix-up; `clampLevel(null)` returns 0; read-aloud
  stays on after leaving Early Start; streak resets when a page spans midnight; idle time counted in day totals;
  times tables can appear at Early Start when the mix pool is empty; an invalid byte in `js/ui/screens/lists.js`
  line 17; the done card tells the child to come back tomorrow.
- Phone check at 360 px wide: labels inside pictures under 11 px in l6groups, l5statq, l7propcmp, vol, l4vol2,
  l5ratiograph, l3equiv, l3fadd, l3lineplot; highlighted squares on the Early Start hundred chart are unreadable.

## Not started or only started
- Levels and Topics screens (open every level, pick a category).
- Equation-solving skill pack in `js/skills/equations/` (partial files may exist on the wip branch).
