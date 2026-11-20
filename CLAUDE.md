# Math Lab

A kids' math practice web app. One learner per browser, no accounts, no server. Static site, vanilla JS ES modules,
no build step, no dependencies. Progress lives in `localStorage` (`mathlab.v3`). Hosted on GitHub Pages as plain files (all paths are relative, so it runs from a subfolder).

Daily page = ten minutes in three phases: times-table facts, one focus skill, a mix. When the time is up the day is marked done (streak moves once) and the child chooses "Keep going" (untimed, no end) or "Finish". Skills are grouped in a ladder of
seven levels; a placement check ("Let's find your starting point") puts a new learner on a level.

## Run it

Any static server from the repo root, for example:

```
python -m http.server 8765      # then open http://localhost:8765/
npx serve .
```

Add `?debug` to the URL for `window.__ml` (`show(id, L)`, `place(level)`, `state()`, `sess()`).

## Tests

```
npm test        # node --test "tests/**/*.test.js", no dependencies (Node 22+)
```

Modules under test never touch `document` or `localStorage` at import time. Keep it that way: anything in `js/core/`,
`js/skills/`, `js/util/` and `js/placement.js` must import cleanly in Node.

After adding, moving or deleting any file under `css/`, `js/` or `icons/`, run `node tools/build-sw.mjs` (rewrites the
service-worker precache list). Raise `CACHE_NAME` in that script when a release must reach every browser.

## Rules

- One job per file. Under 250 lines per file, 300 is the hard ceiling. Functions under about 40 lines.
- Folders by domain. Content (skills) is separate from logic (core) and UI (ui, session).
- No duplication: extract a helper.
- No emoji and no icon glyph characters in text or code. Inline SVG icons live in `js/ui/icons.js`.
- Child-facing text never says "grade" and never shows a grade number. Children see "Level N" and the level title, and
  "Step N of 3" for the three difficulty tiers inside a skill. Grade equivalents appear only on the Grown-ups screen
  (`js/ui/screens/parent-parts.js`, fed by `grades` in `js/levels.js`).
- Do not rename skill ids (see "How to add a skill").
- Not a test: never call the placement check a test in any text.

## The level ladder (`js/levels.js`)

| Level | Title | Grades (Grown-ups screen only) |
| --- | --- | --- |
| 1 | Number sense (adding, subtracting, place value) | 1-2 |
| 2 | Times tables and sharing (multiplying, dividing) | 3 |
| 3 | Bigger numbers and first fractions | 4 |
| 4 | Decimals, fractions and volume (the original 20 skills) | 5 |
| 5 | Ratios, percents and negatives | 6 |
| 6 | Proportions and equations | 7 |
| 7 | Powers, lines and triangles | 8 |

A level is complete when every enabled school skill (`school: true`, not switched off) in it is mastered. Completing the
learner's current level opens and selects the next one. Earlier levels stay reachable from the level chips on home.
All seven levels have content. Level 1 has no times tables warm-up on its daily page; the warm-up starts at level 2.
Every screen and the placement check still cope with an empty level (an
empty level is a ceiling for placement, and practice uses the nearest lower level that has skills).

## Code map

```
index.html, manifest.webmanifest, sw.js (generated), css/*.css (loaded in order from index.html)
js/app.js              thin entry: load state, wire events, first render
js/debug.js            ?debug hooks
js/levels.js           LEVELS (n, id, title, blurb, grades)
js/placement.js        pure placement logic (no DOM)
js/util.js             barrel for js/util/*
js/util/math.js        random, gcd/lcm, formatting (fmt, plain, places, money, alignDec, splitPV)
js/util/text.js        HTML snippets: b, k, way, nm, pow, F/M/fr/frText, column, table
js/util/answers.js     num, frac, point, choice, answerHTML, check
js/util/visuals.js     SVG/HTML diagrams: fracBar, numberLine, signedLine, pvChart, areaModel, prism, plane, linePlot, fracArea
js/core/state.js       state shape, defaults, migrate (v1, v2 -> v3)
js/core/store.js       live state S, localStorage load/save/clear, backup parse/export
js/core/mastery.js     per-skill steps (L 1-3) and mastery
js/core/progression.js level progress, completion, unlock, working level, review pool
js/core/focus.js       today's focus skill (learning path order), pathPick (next skill on the path)
js/core/lesson.js      guided "Learn it" sequencing (pure): stages, steps, help, answers never counted
js/core/learned.js     S.learned, markLearned, needsOffer (the one-time "learn it first?" offer)
js/core/review.js      spaced review of mastered skills (INTERVALS, recordReview, dueReviews), dates injected
js/core/mix.js         what the Mix-up phase asks next (due reviews first)
js/core/extra.js       "Keep going" picker: alternates focus and mix, follows the path across level-ups
js/core/strands.js     groups a level's skills by `strand` with mastered counts
js/core/daily.js       streak, day log, phase split (facts/focus/mix)
js/core/badges.js      stickers
js/core/facts.js       times tables 1-12 box engine
js/core/dates.js       date helpers
js/skills/registry.js  SKILLS, SKILL, skillsOf(level), storySources(level), storySkillOf(level), generate()
js/skills/levelN/      one folder per level; index.js exports SKILLS (and optional STORY_SOURCES)
js/session/lesson-run.js, lesson-task.js   the Learn it lesson on screen (stage flow; answer input and help)
js/session/extra-run.js  result screen after the daily page, keep going, Next skill
js/session/            practice: start, flow (next question, clock), play (screen), pad (answer input UI),
                       input (keys), answer (check/stars/mastery/level-up), sheet (overlays), intro, summary,
                       placement-run (placement on screen), feedback (toast/confetti), timer, state
js/ui/                 router, events, actions, parent-actions, dom, fragments, icons
js/ui/screens/         one file per screen (welcome, home, lab, lists, skill, parent, lesson) plus *-parts.js helpers;
                       strand-list.js draws collapsible strand groups for home and the focus picker
tests/                 node:test files and fixtures; tools/build-sw.mjs builds sw.js
```

## State (`mathlab.v3`)

`{ v:3, name, created, level, placed, levelsDone, settings:{minutes, gradual, off, focus}, facts, unlocked,
skills:{id:{L,run,miss,hist,n,c,last,mastered,rev}}, days, stars, streak, badges, focusLog, counters, todayFocus, learned }`

`rev` is `null` or `{stage, due, miss}` (review schedule, see below). `learned` is `{skillId: 'YYYY-MM-DD'}`: set when the
Learn it lesson is finished or the first-time offer is skipped. `todayFocus` may carry `auto: true` (the day's automatic
pick, fixed when the daily page starts). Older saves migrate on load: `v:1` becomes level 4, placed; `v:2` just gains
`learned: {}` and `rev` (mastered skills start a schedule from their last practice day). `mathlab.v1` and `mathlab.v2` are
read but never modified or deleted by a migration; the app writes `mathlab.v3`; "Erase all progress" removes all three.
Backups of v1, v2 and v3 restore; export writes v3.

## Learn it lesson

Every skill has a guided lesson built from what it already has (no per-skill authoring): the idea (`learn`), watch one
(a step-1 problem, first way revealed one step at a time, then the second way), do one together (hint, then worked steps
one at a time, wrong answers only open the hint and never count), your turn (two more), done. Story problems with `read`
get the reading steps first. Lesson answers never touch mastery, stars, streaks or the day log. Entry: the "Learn it" button
on the skill page, and a one-time offer when a never-practiced skill is first the daily focus. Sequencing is in
`js/core/lesson.js`; screens in `js/ui/screens/lesson.js`.

## Review schedule and keep going

A mastered skill gets `rev`: next review after 2, then 5, 10, 21, 45 days. A first-try right answer in review moves it up a
stage; right after help keeps the stage; a miss moves it back one stage; two misses in a row un-master it to step 3. The
Mix-up phase draws due reviews first (`js/core/mix.js`). Grown-ups shows how many are due. After the timed daily page the
child can keep going without a timer: focus skill and mix alternate, the focus moves along the level's path when it is
mastered, and it carries across level-ups. Free practice of one skill offers "Next skill" when it is mastered.

## How to add a skill

A skill is one object in a level's `SKILLS` array. A generator makes problems for it. Put a topic group in one file
under `js/skills/levelN/` (for example `js/skills/level2/multiplying.js`), export the generators from it, and list the
skills in `js/skills/levelN/index.js`:

```js
// js/skills/level2/index.js
import { genTimes } from './multiplying.js';
export const SKILLS = [
  { id: 'times1', level: 2, std: '3.OA.1', title: 'Equal groups', sub: 'Multiplying as groups', gen: genTimes, school: true,
    learn: { big: 'One sentence idea.', tips: ['Short tip.', 'Another tip.'], words: [['product', 'the answer to multiplying']] } },
];
export const STORY_SOURCES = []; // optional, see below
```

Then run `npm test` and `node tools/build-sw.mjs`.

### Skill object

| Field | Meaning |
| --- | --- |
| `id` | Globally unique string across all levels. Never renamed or reused: it is the key in saved progress. |
| `level` | 1-7, the level folder it lives in. |
| `std` | Short standards tag shown small on the skill row, for example `3.OA.1`. Never the word "grade". |
| `title`, `sub` | Skill name and a one-line subtitle. |
| `gen` | `gen(L) => problem`, L is 1, 2 or 3. May return `null` to ask for another try. |
| `school` | `true` if it counts toward finishing the level. `false` for added extras. |
| `learn` | `big` (one sentence idea), `tips` (array of short strings), `words` (optional array of `[term, meaning]`). |
| `story` | `true` only on a story-problem skill (see Story problems). |
| `strand` | Optional heading for grouping in the home list and focus picker: `'Numbers'`, `'Adding and subtracting'`, `'Multiplying and dividing'`, `'Fractions and decimals'`, `'Ratios and percents'`, `'Algebra'`, `'Measurement'`, `'Shapes and space'`, `'Data and chance'` or `'Stories'`. Groups show in the order strands first appear in the level's array, which is also the learning path. Skills without one go in a last group with no heading. |

### Difficulty tiers (L 1-3)

The tiers are steps inside one skill, shown to children as "Step 1 of 3". L 1 is the introduction: small numbers, one
idea, picture or worked scaffolding. L 2 is the normal school task. L 3 is the hardest form: bigger numbers, mixed
forms, extra steps or word versions. A learner needs 4 first-try answers in a row at L 1 and 5 at L 2 to step up; at L 3
the skill is mastered with 7 of the last 8 right. Two misses in a row step back down. Make each tier clearly different.

### Problem object (what `gen(L)` returns)

| Field | Meaning |
| --- | --- |
| `ask` | Question text (HTML allowed). At least one of `ask` or `expr` is required. |
| `expr` | The math expression as HTML (use `F`, `fr`, `pow`, `<span class="blank">?</span>`). |
| `exprSmall` | `true` to render `expr` smaller (long expressions). |
| `story` | Story text, for story problems. |
| `visual` | HTML or SVG string from the util visuals or your own. |
| `answer` | Required. One of `num(v, opts)`, `frac(n, d, opts)`, `choice(correct, distractors)`, `point(x, y)`. |
| `ways` | Required. Array of `way(title, [step html, ...])`, shown by "Show me how" and after a miss. At least one way. |
| `hint` | Required. One sentence shown after the first wrong try. |
| `read` | Story problems: `{ find, know: [..], clue, plan }` for "Help me read it". |
| `pre` | Optional first question `{ q, options, correct, why }` asked before solving (set by the story helper). |
| `suffix` | Unit text shown after the answer box, for example `'cm'`. |
| `choiceBig` | `true` for large choice buttons. |
| `op` | Story problems only: `'add' 'sub' 'mul' 'div' 'multi'`, drives the `pre` question. |

`generate()` adds `key`, `skill` and `level` to the problem; the app uses `key` to avoid repeats. Make `ask`/`expr`
differ between problems so repeats are detectable.

### Answer kinds

- `num(value, { signed })`: typed on the number pad. Pass `{ signed: true }` (automatic when `value < 0`) to show the
  plus/minus key. Decimals are allowed (the `.` key is always on the pad).
- `frac(n, d, { signed })`: typed in top/bottom (and whole) boxes; accepts any equal fraction or mixed number. A
  negative `n` (or `{ signed: true }`) shows the sign key. Pass the fraction as numerator and denominator; it is simplified.
- `choice(correct, distractors, { keepOrder, all })`: up to 4 buttons, shuffled unless `keepOrder`.
- `point(x, y)`: tap on a `plane({ interactive: true })` grid.

`check(answer, input)` is the single comparison used by the app and the tests.

### Util helpers (`import { ... } from '../../util.js'`)

Numbers: `R` (round float noise), `rnd(a,b)`, `pick(arr)`, `chance(p)`, `shuffle`, `gcd`, `lcm`, `simp(n,d)`, `fmt`
(thousands separators, U+2212 minus), `plain`, `places`, `fixed(x,p)`, `money`, `splitPV`, `alignDec`.
Text: `b` bold, `k` key-info span for "Help me read it", `way(title, steps)`, `nm()` random first name, `pow(base, exp)`
exponent with `<sup>`, `F(n,d)` stacked fraction, `M(w,n,d)` mixed number, `fr(n,d,opts)` simplified (negatives ok),
`frText`, `column` (stacked arithmetic), `table(head, rows)`.
Answers: `num`, `frac`, `point`, `choice`, `answerHTML`, `check`.
Visuals: `fracBar`, `fracArea`, `numberLine(lo,hi,x,labels)`, `signedLine(lo,hi,{points,step})` (negatives, labelled
ticks), `pvChart`, `areaModel`, `prism`, `plane`, `linePlot`. Add new shared diagrams to `js/util/visuals.js`, not to a
skill file (keep that file under 250 lines; split into a new `util/*.js` and re-export from `js/util.js` if needed).

### Story problems

A level index may export `STORY_SOURCES`, an array of `(L) => storyProblem` functions (each returns `story`, `ask`,
`answer`, `ways`, `read`, `op`). A level with an empty array has no story skill in its mix. To give a level a story
skill, add a skill with `story: true` and `gen: L => makeStory(STORY_SOURCES, L)` (`makeStory` is in
`js/skills/level4/story.js`; move it to a shared file the first time a second level needs it).

### File layout inside `js/skills/levelN/`

One topic group per file (for example `multiplying.js`, `division.js`), each under 250 lines, each exporting its
generators. `index.js` imports them, exports `SKILLS` and optionally `STORY_SOURCES`, and holds the skill objects.
Shared helpers used by several levels go in `js/util/`, not in another level's folder.

### Checklist before you finish a skill

1. Unique id, `level` equals the folder, no grade wording, no emoji or icon glyphs.
2. `npm test` passes: it generates 200 problems per tier for every skill and checks they have `ask`/`expr`, a known
   answer kind, and that `check()` accepts the right answer and rejects a wrong one.
3. Look at it in the browser with `?debug` and `__ml.show('yourid', 1)` for each tier.
