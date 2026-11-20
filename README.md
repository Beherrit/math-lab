# Math Lab

Math practice that starts where the learner is and climbs from there. About ten minutes a day.

Live: https://beherrit.github.io/math-lab/

## What it does

- A short starting-point check places a new learner on one of seven levels. There is no timer and no score.
- Each day's page is a times tables warm-up, a focus skill, and a mix-up of earlier skills and story problems.
- Every question has a hint and step-by-step worked solutions ("Show me how"), usually shown two different ways.
- Skills move through three steps (the idea, standard, stretch). A level is finished when its skills are mastered,
  and the next level unlocks.
- Progress is saved on the device, in the browser. There are no accounts and nothing is sent anywhere.

## Levels

Children see only the level number and title. Grade equivalents appear on the Grown-ups page.

| Level | Title | Roughly |
|---|---|---|
| 1 | Number sense | grades 1 to 2 |
| 2 | Times tables and sharing | grade 3 |
| 3 | Bigger numbers and first fractions | grade 4 |
| 4 | Decimals, fractions and volume | grade 5 |
| 5 | Ratios, percents and negatives | grade 6 |
| 6 | Proportions and equations | grade 7 |
| 7 | Powers, lines and triangles | grade 8 |

## For grown-ups

Press and hold the Grown-ups button on the home page for two seconds. From there you can:

- see progress per level and per skill, with grade equivalents;
- set the current level by hand, or run the starting-point check again;
- change the daily minutes and switch individual skills off;
- back up progress to a file and restore it, which is also how to move a learner to another device or address.

Clearing the browser's site data erases progress, so take a backup now and then.

## Running it locally

It is a static site with no build step and no dependencies. Serve the folder with any static server:

```bash
python -m http.server 8123
```

Then open http://127.0.0.1:8123/. Add `?debug` to the address for the developer hooks described in `CLAUDE.md`.

## Tests

```bash
npm test
```

The tests generate hundreds of problems for every skill at every step and check each answer against an independent
recalculation, check that the numbers in the question match the numbers the answer was built from, and cover saved
progress migration, placement and level completion. It runs on Node 24 with no packages to install.

After adding, moving or deleting files under `css/`, `js/` or `icons/`, regenerate the offline file list:

```bash
node tools/build-sw.mjs
```

## Code map

See `CLAUDE.md` for the full map and the contract for adding a skill. In short: `js/skills/levelN/` holds the content
for each level, `js/core/` the saved state and mastery rules, `js/session/` the practice session, `js/ui/` the screens.

## How it was made

The code and content were written with AI assistance and checked with automated tests and independent review passes.
