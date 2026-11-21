# Review: new Level 3 and Level 4 skills (math-lab, branch more-skills)

I wrote a findings file before your correction arrived. I have deleted it, and no file remains. Nothing in the repo was edited. My scratch scripts are in `C:\Users\beher\AppData\Local\Temp\claude\5d6d188b47b914bf\327210d7-b87f-4bc0-9ae5-3ba0fa3b3006\scratchpad\l34_review_q7x`. An earlier session's scratch folder was shared with another reviewer, so my first attempt there was overwritten and I discarded it.

**Method.** Node scripts generated 14 to 25 problems per skill and step. They printed the question, a summary of the picture, the answer, the hint and the worked ways. For pictures I re-measured from the SVG independently:
- protractor ray angles
- line plot X counts per tick
- hundred grids and mirror grids
- polygon classification: symmetry lines, parallel and perpendicular pairs, triangle kind, quadrilateral kind
- the Level 4 family-tree shapes

I re-measured all of those in 300 to 1500 samples. The line plot, hundred grids, mirror grids, parallel/perpendicular lines, triangles, quadrilaterals and symmetry matched their questions. The protractor reading pictures also matched; the protractor problem with a picture error is the "angles around a point" one (item 3).

## LEVEL 3

### Wrong or broken

1. **l3estimate steps 2 and 3, "Is that answer reasonable?"** (`js/skills/level3/estimate-check.js:51-60`).
   - The answer key is "the stated answer equals the exact answer". The explanation says it compares with the estimate. The two contradict.
   - In 1111 sampled problems, 27 of 505 "No" answers are within 25% of the estimate. 84 of 606 "Yes" answers are more than 15% away from it.
   - "Ava worked out 3,658 − 2,932 and got 1,026." Key: No. The way says "1,026 is far from 1,000 ... the first digits are far apart" (both start with 1).
   - "Zoe worked out 171 × 36 and got 8,156." Key: No. The way says "8,156 is far from 8,000".
   - "Ivy worked out 5,610 − 5,382 and got 228." Key: Yes. The way says "228 is close to 1,000" and "estimate 1,000 has 4 digits, 228 has 3 digits. The size and the first digits agree."
   - A child who estimates correctly is marked wrong.
   - The test rule `esreason` (`tests/level3-new-expect.js:66`) encodes the same logic as the generator, so it cannot catch this.
2. **l3estimate "Which is the best estimate"** (`estimate-check.js:32`).
   - The key is the option of the right size, but the way claims closeness that is false.
   - "68 × 5": the way says "70 × 5 = 350, which is close to 300".
   - "243 × 4": the way says "200 × 4 = 800, which is close to 1,000".
   - "233 × 6" has key 1,000 (exact 1,398). "751 × 17" has key 10,000 (exact 12,767).
   - 150 of 1,559 sampled problems have a key more than 25% off the exact value. A child who works out 350 or 800 has no matching option.
3. **l3protractor "N angles meet at one point"** (`protractor.js:54-62` with `visuals.js:8-22`, `angleSVG`).
   - Labels sit at each wedge's midpoint. Any wedge in the lower half has its label below the 140-high viewBox, so it is clipped. Inline SVG hides overflow, and `css/visuals.css` does not override that.
   - In 545 sampled problems, every picture had at least one label off the viewBox. The "?" was invisible in 225 of them (41%).
   - Example: "3 angles meet at one point ... 110°, 30° are marked." The "?" is drawn at y = 186.9 of 140.
   - A missing wedge over 180° (16 of 327 problems, e.g. the answer 220) is drawn with large-arc flag 0, so the wrong arc appears.
   - No test covers this. `tests/level3-pictures.js` has no `prround` check.
4. **l3mixadd, all steps.** The worked ways end on an unreduced form while the stated answer is reduced.
   - "Subtract 2 5/6 − 1 3/6": the answer shows 1 1/3, but the ways end "Answer: 1+[2/6]".
   - "9 1/4 − 8 3/4": the ways end "[2/4]", but the key is 1/2.
   - The spec says the first way must end on the stated answer.
5. **l3tenhund step 3**, "Write the answer as a fraction with 100 on the bottom: 5/10 + 68/100". The ways end "1 18/100". The stored answer is simplified to 59/50, so the reveal after a miss shows "1 9/50", contradicting the question.
6. **Plural and wording bugs shown to children.**
   - l3lineplot: "How many leaves are 1 inches long?"; "1 marks at 4 3/4 have no partner" and "1 pairs use up the shorter column" (`lineplot.js:79`).
   - l3tenhund: "1 columns of the grid are shaded" (`tenth-hundredth.js:30`).
   - l3protractor: "5 minutes is 1 steps" (`protractor.js:45-50`).
   - l3shift: "The 3 was 1 places up".
7. **l3lineplot "How many ... longer than X", first way** (`lineplot.js:51`). The last step reads "2 = 2" or "1 = 1" and never shows the marks being added.

### Quality and ambiguity

8. **l3lines byProperty** (`lines-shapes.js:63`). "Kite: no parallel sides, no right angles" is not always true, because a kite can have 1 or 2 right angles. The question "exactly 1 right angle" offers a Right triangle among quadrilaterals. A kite drawn with near-right side angles shows up about 1 in 250.
9. **l3lines step 3 `triangleTwo`** (`lines-shapes.js:56`). "Angles add up to 180°, find the third" goes beyond the grade 4 standard.
10. **l3lines `definition`** (`lines-shapes.js:24`). "Two lines that cross but do not make a square corner. What are they called?" has the answer "Neither", which is not a name.
11. **l3protractor `turnFraction`** (`protractor.js:39`).
    - The `reduceSteps` chain (`frac-util.js:15`) takes four reduction steps for 90/360 (divide by 2, 3, 3, 5).
    - The second way multiplies fractions ("90/180 × 1/2"), which is confusing for a struggling child.
    - "A skater spins through 20°" is not believable.
12. **l3protractor estimate.** The picture's aria-label says "angle of 59 degrees", which gives the answer to a screen reader.
13. **Phone size** (judged from the viewBox; I did not render at 340 px).
    - Protractor tick labels are 10px in a 300px max-width picture. Minor ticks are 6px long and 9.8px apart.
    - Line plot tick labels are 11px in a 360 viewBox, and fractions are plain text like "1 1/8".
    - These are usable but small for a child who struggles.
14. **Unbelievable story numbers.**
    - mixAddWord: "practiced guitar 1 7/11 hours" and "6 5/6 hours".
    - Denominators 7, 9, 11 and 13 in l3fparts and l3mixadd. The grade 4 standard uses 2, 3, 4, 5, 6, 8, 10, 12 and 100.
    - l3convert: "A practice session lasts 8 hours. Each drill takes 10 minutes"; "A bottle holds 7 liters ... drinks 2,000 milliliters"; songs of 20 seconds; "takes out 100 ounces".
    - moneyWord: "a snack machine gives back 4 dimes and 18 pennies", and "7 dimes and 15 pennies" of tips.
15. **Circular or empty second ways.**
    - l3convert "Count up" says "From 72 up to 108 inches: 108 − 72. 36 inches is the gap".
    - The l3convert compare way is titled "Round to see", but nothing is rounded.
    - l3lineplot "Group by length" jumps to the total without adding.
16. **Variety.**
    - l3tenhund step 1 has about 35 distinct problems in 200 ("[8/10] = [?/100]" appears 14 times).
    - l3decorder step 3 list questions share one repeat key (32 of 200).
    - l3pattern step 1 has 105 distinct in 200.
    - l3times step 3 is step 2 with bigger numbers.
17. **Standards depth.**
    - l3estimate step 1 ("round to the nearest hundred, then add") repeats l3round.
    - l3convert has no money or fraction/decimal measures (4.MD.2).
18. **Ordering and strands, Level 3.** Strand groups are contiguous and the path reads sensibly. I found no prerequisite violation.

## LEVEL 4

### Wrong or broken

1. **l4family picture questions "Which name does NOT fit this shape?"** (`js/skills/level4/family.js:51-55`).
   - When the answer is "trapezoid", the shape has two pairs of parallel sides (a square or rectangle), and the question gives no definition. The note is added only when the ask text itself names a trapezoid (`family.js:11`).
   - 336 of 964 picture problems (35%) have this form. Under the inclusive definition a square is a trapezoid, so a correct child is marked wrong.
   - Also: "A triangle that is isosceles is also equilateral: Sometimes" would be Never under the "exactly two equal sides" definition.
2. **l4fmix step 1** (`fracarea.js:17-19`).
   - "A rectangle is 1/2 by 2 units. Is its area less than 1, exactly 1...": the way says "[1/2] × [2/1] = [2/2]. 2 is the same as 2", which is garbled.
   - The way also says "The shaded part is 1 columns by 1 rows: 1 × 1 = 1 pieces" and "[1/6] = [1/6]".
3. **l4fshare** (`fracshare.js:29`). "1/2 is what each person gets when 1 whole things are shared equally among 2 people" (grammar, every time n is 1).
4. **l4ldiv steps 1 and 2.**
   - The ways say "Round 20 to 20" and "The groups add up: 5 = 5".
   - "Best estimate for 158 ÷ 23": the way says "8 × 23 = 184, which is close to 158".
   - "Best estimate for 84 ÷ 18": the way says "4 × 18 = 72, close to 84".

### Quality and ambiguity

5. **Overlap with older Level 4 skills.**
   - l4thou repeats `dec` (thousandths, expanded form, compare).
   - l4pow repeats the powers-of-10 part of `pv`.
   - l4ldiv repeats `div`. It adds estimating and "which calculation checks".
   - l4fshare repeats the sharing part of `fdiv`.
   - l4rules repeats part of `pat`.
6. **Ordering, Level 4** (`level4/index.js:104`).
   - The strands are contiguous and the path is mostly sensible.
   - One prerequisite problem: `fdiv`'s own learn text says "A fraction is a division: 3 ÷ 4 = ¾". It comes before `l4fshare`, which teaches exactly that, so `l4fshare` should come first.
   - l4rules plots points and sits after `coord`, which is correct.
7. **l4groups** (`groups.js`).
   - It calls ( ) "brackets" ("Put one pair of brackets in"), while `oa` says "Parentheses ( ), brackets [ ]".
   - "Put one pair of brackets in so the sum is true" offers only two choices (a 50% guess) and says "sum" for an equation.
   - The "taking away a sum" sentence appears even for addition-only cases.
8. **l4mixas and the mixWord story.**
   - Unbelievable numbers: "5 1/3 cups of flour and 3 1/9 cups of oats", "Ivy has 6 5/7 cups of flour", "hiked 4 2/7 miles".
   - Step 1 ways print no-op lines such as "[1/4] = [1/4]".
   - The regroup way says "0 is not enough to take [4/7] away" for "6 − 3 4/7".
9. **areaWord.** "A phone screen is 1 3/4 inches long and 3 1/2 inches wide" (the long side is shorter than the wide side). "A rug is 1 1/4 feet long" is a tiny rug.
10. **Other story sources.**
    - remWord2 step 3: "6,488 students are going on a trip. Each bus holds 65".
    - moneyChangeWord: "5 sets of guitar strings at $12.49 each, pays with a $100 bill".
    - shareWord step 2: "5 friends share 24 loaves of bread" (4 4/5 each).
11. **l4pow and l4thou wording.**
    - l4pow way "10^1 is 10 = 10, a 1 with 1 zero" says nothing.
    - l4thou: "Count 2 digits after the point: tenths, then hundredths, then thousandths" confuses a question about hundredths.
    - l4thou step 1 is nearly all hundredths, although the standard is thousandths.
12. **l4vol2 step 1.** The "Box A is … Box B is … how much more volume" tasks are not composite solids (5.MD.5c). The stacked and side-by-side pictures matched their labels.

## Tests

- The Level 3 tests read protractor rays, line plot marks, hundred grids, polygons, mirror grids and number-line dots back out of the SVG (`tests/level3-pictures.js`). They could fail on a wrong picture, and my independent re-measurement found no mismatches in those pictures.
- Gaps:
  - No picture test exists for the "angles around a point" problem (Level 3 item 3).
  - The `esreason` and `esmag` expectations reuse the generator's own rule (Level 3 items 1 and 2).
  - Nothing checks that a label lies inside its viewBox.
  - Nothing checks that a first way ends on the stated answer (Level 3 items 4 and 5).
- I only skimmed the Level 4 tests (`tests/level4.*.js`).

## Counts

- Level 3: 7 wrong or broken, 11 quality or ambiguity.
- Level 4: 4 wrong or broken, 8 quality or ambiguity.
- Ten most severe: Level 3 items 1, 2, 3, 4, 5 and 6; Level 4 items 1, 2, 3 and 4.

## Not checked

- Nothing was rendered in a browser or at 340 px.
- Older skills were not reviewed.
- Only sampled: l4thou step 3, l4rules point range on the plane, l3pattern step 3, l3decorder step 3, l4vol2 picture proportions.
- The story skills' "Help me read it" questions were not read in full.