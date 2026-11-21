REVIEW OF NEW LEVEL 7 CONTENT (branch more-skills, repo E:\GithubPers\math-lab). Read-only. Scratch scripts are in C:\Users\beher\AppData\Local\Temp\rv7q (dump.mjs, scan.mjs, one.mjs, st2.mjs, cap.mjs). No findings file was written, as instructed.

WHAT I CHECKED
- Generated about 60 problems per skill and step for all 14 new skills, deduplicated to 2 per question shape for reading. That is about 340 KB of decoded output: question, SVG decoded to lines, dots, polygons, path points and labels, answer, hint, ways.
- Recomputed by hand or by script: slope and intercept from the drawn lines, table rates, systems and their crossings, sqrt tenths, Pythagoras and 3D diagonals, similar-triangle sides and ratios, two-way percents (row vs column), fit-line predictions and misses, E-notation.
- Ran 400-sample automated scans of every new skill and step for: plural after 1, "1x", "0x", "+ -", "+ 0", NaN, undefined, long decimals, lowercase after a period, and a/an.
- Ran `node --test tests/level7.test.js` 5 times (seeds 651936786, 1089119973, 1939368025, 780808001, 1539296730). All 103 passed each time. No flakiness seen.
- Diffed js/skills/level7/index.js against main.
- Read the generator source only where needed to cite a line.
- NOT done: no browser or phone rendering (label sizes estimated from CSS and viewBox only); no pixel-level check of the 14 px labels on the small triangles; l7propcmp, l7slopewhy and l7irrline got only a partial read of step 3 and the irrline/twoway/eqfrac/sciunits step 3 tails. I did not read the learn cards (learn-more.js) for content. I did not run the app.

DIFF AGAINST MAIN (index.js)
- All 18 old skills keep the same id, title, sub, std and gen binding (the gen is still wrapped by `steady`). The only change on them is the added `strand`.
- `STEP_SOURCES` for l7story changed: it now includes the new sources. That is a content change to the old story skill, which is expected.
- Strands and order, as the learning path (groups show in order of first appearance, but the path is the array order):
  - l7sciops is tagged "Multiplying and dividing" and l7sciunits "Measurement". Both are single-skill groups sitting between "Numbers" skills, so the "Numbers" group is split in path order (sci, sciops, sciunits, roots...). In the home list they collapse into separate headings, and "Numbers" appears to jump around.
  - l7propcmp is the only skill in its strand. "Ratios and percents" appears after Algebra (it comes after l7slope in path order), so its heading is oddly placed.
  - l7vol ("Measurement") sits in the path after l7pythreal, but its heading appears far above, next to l7sciunits.
  - Prerequisite problems: l7slopewhy (Algebra, position 15) is taught before l7similar (position 26), yet its method is "slope triangles are similar". l7sciunits (position 5) needs l7roots/powers only lightly, so that is fine. l7irrline comes after l7roots and l7rational, which is correct. l7sys is correctly placed after l7eqfrac. l7congruent is correctly after l7trans.
  - Suggested fix: put l7similar before l7slopewhy, or tell the child it is revisited. Re-tag l7propcmp to Algebra, and l7sciops/l7sciunits to Numbers, so the home list reads sensibly.

THE TWO LOOSENED TESTS
1. COVER lowered 10 to 5 (tests/level7.test.js:110).
   - Real rates, measured over 20 runs of 900 problems: upright about 19.5 per run, flat about 17 per run. At a minimum of 10, a flat count under 10 is roughly a 1 to 3 percent event, so lowering is a reasonable reaction to occasional flakiness.
   - It is not justified as stated, because the count is random and not targeted. The better fix is a deterministic coverage check, or generating both kinds in a loop.
   - At 5 the check can no longer catch a regression that makes upright/flat lines rare (say, half as common).
   - Verdict: weak but not hiding a bug.
2. CAP_NEW l7sysstory (tests/level7.new.js:4). It was [10,140,160] in the earlier commit and is [10,200,200] now.
   - Measured over 30000 generations: step 2 max answer is 80, step 3 max answer is 163.
   - Raising step 3 from 160 to 200 was needed, because 163 exceeds 160. It hides a design problem: solve-y at step 3 asks "Ava: y = 12x + 19. Leo: y = 6x + 91 ... what is that amount?" with answer 163. This is a big amount for a 12-14 struggling reader, and arises from x up to 12 with a rate difference up to 6.
   - Raising step 2 from 140 to 200 is not justified. The real max is 80, so 200 makes the cap meaningless. Set step 2 at about 90 and step 3 at about 165, or tighten the generator.

WRONG OR BROKEN (most severe first)

1. l7graphstory step 3, shape steady-rate. graphstory.js:78. The "Compare two steps" way prints wrong numbers for straight lines.
   - Straight graphs are drawn with only two points, [[0,5],[10,4]]. The way takes pts[1]-pts[0], which is the whole 10-step change, as the "change from x=0 to x=1".
   - Example: "Between x = 0 and x = 1 the amount changes by 1, and between x = 9 and x = 10 by 1". The true per-step change on that line is 0.1.
   - A child checking the picture will see the worked step is false. This affects about half of steady-rate problems.

2. l7sciunits, 4 shapes (sciunits.js:15, 21, 26, 52). The question ends with the dangling text "What is the ?". Example: "A calculator shows 7E-5. In scientific notation that is 7 × 10^?. What is the ?". The noun (exponent, or the number of times) is missing. This is on every e-exp, power-times, prefix-exp and times-as question.

3. l7funccmp (funccmp.js:10 template, "gains ${m} liters"). The question says "gains 1 liters every minute" and "Tank B holds 1 liters at first". Singular is not handled in the question stem, though the way gets it right ("1 liter"). It appears about 8 to 12 times per 400 in steps 1 to 3.

4. l7funccmp steps 2 and 3, when the two functions are equal. The second way ends in lowercase after a full stop. Example: "...Candle A changes by −2 and Candle B by −2. they are the same." (funccmp.js:29 `verdict`). It appears in about 75 of 400 problems at step 2.

5. l7slopewhy step 3, shape ratio-m, "Undo the equation" way (slopewhy.js:69 area). When the intercept is 0 it writes an invented "+ 0" term. Example: "The line is y = mx + 0. Put in x = 2 and y = −6: −6 = 2m + 0." About 1 in 80 problems. This breaks the "never an invented + 0" rule. The test did not catch it.

6. l7twoway, all steps (twoway.js:25 `lead`). The table context for sports "games" says "A survey asked games two questions." and "How many games were asked?" and "Of the games that were won...". A game is not surveyed. Also the way text is ungrammatical: "The students who have a pet has the greater percent" (twoway.js:78) and "20% is 1 fifths" (twoway.js:99).

7. l7fitline step 2, shape miss. fitline.js:45. The question reads "What is how far is the dot from the line, in y?". It is ungrammatical and confusing; the signed variant is fine.

8. l7fitline plausibility. scatter-lines.js:8. The quiz-score fit has c up to 60, m up to 8 and x up to 6, so scores up to 108 occur. Example: "y = 8x + 58... x from 2 to 6... predict y when x = 6" gives 106. A quiz score of 106 is impossible for most children.
   - Also, 104 of 667 interpolate/extrapolate questions put x exactly on the edge of the measured range ("data x from 2 to 6, predict at x = 6: Interpolation"). That is defensible but borderline, and your brief named it. Avoid the boundary.

9. l7congruent step 2, shape order (congruent.js:83). The question is text-only and never gives the coordinates of A or the triangle: "Triangle ABC is reflected across the x-axis, then slid 5 left and 5 up. Would doing the slide first... end on the same triangle?". The way then says "A is at (−1, 1)", which the child was never shown. The answer was "No" in all 167 of 167 sampled problems, so it can be answered by pattern. Also the claim "a slide done before it points the other way afterwards" is false for a slide along the mirror line.

10. l7irrline step 2 and 3, expression-tenth, "Round the root first" way (irrline.js:95). "√33 is between 5.7 and 5.8. Adding −4 moves both ends: between 1.7 and 1.8, and the nearest tenth is 1.7." Knowing only the interval does not give the nearest tenth, so the reasoning is invalid. "Adding −4" is also awkward.

11. l7similar shadow and l7story shadowStory (stories-new.js:15). Unrealistic answers: "How tall is the lamp post?" gives 25, 30, 33, 40 and 60 m, and a tree of 40 m. The text has a grammar error: "a apartment building casts a shadow..." (hard-coded article, stories-new.js:15). Numbers are not believable for a 12-year-old.

12. l7story sizeStory (stories-new.js:26-33) and l7sciunits THINGS (sciunits.js:18).
   - Unrealistic: "A phone holds about 8 × 10^5 bytes. One song takes about 2 × 10^3 bytes", "A stadium seats about 6 × 10^6 people. One row seats about 2 × 10^4 people", "A tank holds about 8 × 10^5 liters. One bucket holds about 4 × 10^3 liters".
   - In sciunits: "A stadium holds about 10^6 people".
   - sizeStory takes no L: step 2 and step 3 are the same problem (answer only 200, 300 or 400, exponent gap always 2). rodStory and shadowStory also ignore L.

QUALITY (not wrong)
- l7propcmp (all steps): the hint is identical for every problem ("Work out the unit rate of each one...") and does not point at the first concrete step. The second way, "Compare at the same amount: take 10 for both", is the same unit-rate maths multiplied by 10 (propcmp steps 2 and 3). It is not a second method. "Runner A runs 12 meters in 3 seconds" with only one runner. Runner speeds of 9 m/s are unrealistic. The step 3 "Use the steepness" way asks "The steeper line is A or B?" inside the explanation.
- l7slopewhy: "orig-y" and "orig-eq" (step 2) and "shift" and "y-tri" (step 3) have no picture for a slope-triangle idea. The shift question ("y = 5x moved down 2, (2,10) moves to (2,?)") is just 10 − 2 and teaches nothing about shifting the line. y-tri second way ("Going 4 across is 1 step like that") is the same maths. "why" correct option is the longest one in every sample.
- l7lineeq step 2 (tp-b way 2): "so 1 of them change y by 2" is ungrammatical. story-b second way ("Undo the steady change") is the same algebra. A gym with $4 per visit and a $36 joining fee is not believable.
- l7sysstory step 1: "which-at" way 2 says "The two amounts are equal at x = 5" with no working, so it teaches nothing. Step 2: "x = 5 ÷ 1 = 5" ("÷ 1") is noise. The read-table header is a bare "x" with no unit. Step 3 cost answer of $128 for a bike hire is unrealistic.
- l7funccmp step 2: all problems are choice questions of just two question shapes (rate or start) times representation pairs, so the "four shapes" in the test are mostly combinations. Hint is generic.
- l7graphstory: "a bucket during a day of chores" with minutes on the axis; distractor "rests, then rests" is silly; curve-kind "Compare two steps" quotes 3.16 and 0.51, which cannot be read from the graph.
- l7congruent: step 1 and 2 stays-measure and angle/side-stays give the answer in the question. congruent-yn says "A′B′C′ is a copy of ABC" and the answer is "No" 15 percent of the time (contradiction). one-move: second way "The picture shows a copy that one move can make" says nothing. One move "turn about the origin" restriction hides that a turn about another point is a single move.
- l7similar: the figures are drawn to scale, yet labelled "Not drawn to scale"; small triangle is about 67 by 18 px at 320 wide. Step 3 is only 3 shapes plus shadows. aa-yn is text only. "Scale factor ... 8 ÷ 20 = 2/5" is fine.
- l7pythreal: the box-fit wording "resting corner to corner" is wrong for a straw shorter than the diagonal. Ladder way 2, "Does it make sense?", is a check, not a method.
- l7irrline: dot-reading ways are circular ("√56 is the choice whose square is 56, and 56 sits where the dot sits"). nearest-tenth way 2 quotes "about 3.464" without showing how.
- l7twoway: compare-pct can differ by 1 point (55 percent vs 54 percent), which is a defensible "more likely" but a weak signal for association. Way 2 "Scale to 100: 100 × 1 = 100" is silly.
- l7eqfrac which-value way 2 ("Each other choice changes 0.5x by a multiple of 0.5...") does not test the other choices. Way 1 is titled "Substitute the right one" but begins "Solve first".
- l7sciunits: step 2 times-as answers such as 112500 are long typed numbers. compare-units "4 × 10^3 m or 4 × 10^3 km" is trivial.
- l7story rateCompareStory: step 1, 2 and 3 are the same shape with only numbers changing. The second item is always the faster one. A soccer runner at 11 m/s is not believable.
- Tests: the rules in tests/level7.rules.js did not catch any of items 1 to 7 and 11. They check only that the first way ends on the answer, not that the way's numbers match the picture or the plural. Add checks for lowercase-after-period, "\b1 [a-z]+s\b", "+ 0", "What is the \?" and "a [aeiou]".

COUNTS: 12 wrong or broken items (3 touch worked-step or arithmetic correctness: 1, 10 and partly 9; the rest are wording or plausibility), 14 quality items. No wrong final answers were found in any new skill. Every answer I recomputed matched, and no graph disagreed with its stated equation.