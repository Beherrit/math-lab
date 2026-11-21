# Level 5 new-skill review findings

Paths are relative to E:\GithubPers\math-lab\js\skills\level5\ unless stated. Nothing was rendered in a browser by the
reviewer; picture findings are inferred from the SVG and CSS. Old skills' text and generator bindings were confirmed
unchanged against main.

## A. Wrong or broken

A1. l5exprparts steps 2-3, `terms`, exprparts.js:61. The second way always says "A group in brackets, like
${list[0]}, is one entity", but list[0] may be a plain term. Example: "2w + 9y − 4" gives "A group in brackets, like
2w, is one entity." No brackets exist. Cause: the first piece is picked from pieces.slice(2), which includes the
bracket-free piece.

A2. l5polyplane step 3 `findY`, polyplane.js:80. B can land off the 12-by-12 grid (r = 6) and is not drawn. Example:
"A is (−1, −1) and B is (7, −1) ... area 12". About 8% of findY problems. Cause: x2 = x1 + 2*rnd(2,4) with x1 = −1
reaches 7. Tests missed it: planePoints reads coordinates without checking they fall on the grid.

A3. l5ratnum steps 1-3, `compare`, ratcompare.js:20. The first way is false for mixed signs: "Between two negatives,
the one further from 0 is smaller" is printed for every pair, including "2 ? −4" and "−1.5 ? 1.5". Step 3 pairs differ
by about 0.05 (−0.75 and −0.8) while the number-line way uses step 0.5, so the two dots and labels a and b overlap
and cannot be read.

A4. l5statq steps 2-3 dot plots, statq.js:48 and the cluster, spread and peaks generators. DOTS contexts from plots.js
(lo fixed, 7 values) are reused with 9 to 15 columns, giving impossible data: "Free throws made out of 10" up to 16,
"Hours of sleep" up to 17, "Pets in each home" and "Goals in each match" up to 13.

A5. l5ratiograph steps 2-3 `compare`, draw.js:51. The line label is placed at (X(x)−8, Y(y)−10); for a line ending at
y = 10 the 13 px bold label sits at y = 4 and its top is clipped by the SVG viewport. Example: the "B" label at
(160, 4). Tests assert labels exist, not that they fit.

A6. l5fracvol all steps, fracvol.js. No picture at all. Packing cubes in layers is the whole idea of 6.G.2. The
existing l5solid already teaches fraction-edge volume with the shared `prism` picture (solids.js:35, 41), so the new
skill repeats the older one and is worse.

A7. l5unitconv steps 1-2 `doubleProblem`, unitconv.js:31. The question says "The two lines show the same lengths,
kilograms on top and grams underneath": "lengths" is wrong for hours/minutes, kilograms/grams, liters/milliliters.
It ends "What number belongs at the ?", which reads badly. The unit label sits at x = 4 in the left margin (axis
starts at x = 62, 12 px label); "centimeters" and "milliliters" are 60 to 70 px wide and likely touch the axis.

A8. l5twovar steps 1 and 3 `doubling`, twovar.js:89. The answer is fixed by the context: doubling(false) is always
"Yes, it doubles", doubling(true) always "No". Answerable from "is there a fee?" without calculating.

A9. l5ratnum step 1 `zeroMeaning`, rational.js:57 and 63. v = −(rnd(2,30)/2 + 0.5) gives non-integers half the time:
"A golfer is at −5.5 compared with par", "A parking garage level is −3.5". Wrong choices come from other stories
(liftoff, par, water surface), so the story's units give the answer away.

## B. Quality

B1. Ordering (index.js plus defs-*.js). Strand grouping moved prerequisites late: l5fdp (index 5) is before l5pct,
l5pctwhole, l5whatpct, so percent is used before taught; l5solution (26) tests inequalities before l5ineq (27);
l5statq (29) asks about dot-plot gaps and peaks before l5plots (30); l5fracvol (19) follows l5solid (18), which
already covers it; l5neg, l5order, l5ratnum come after the whole Ratios and percents strand. The rest is sensible.

B2. l5boxplot (boxplot.js). Never covers displaying data (6.SP.4): data and picture never appear together; no "which
box plot matches this data" problem. The learn text never says the median is left out of both halves when n is odd
(boxplot.js:10), though the way text does and data() uses odd n at step 2. Contexts read badly ("The box plot shows
height of a plant in cm"). Step 1 `step=1` axes can reach 17 two-digit ticks about 16 px apart: tight on a phone.

B3. l5mad `fit` (mad.js:72). "Which gives a better picture of a typical value: the mean or the median?" has two
defensible answers on data without an outlier ([5,6,4,5,6,5]: mean 5.17, median 5; key says "mean" by the rule
max > 2*median). `meaning` has only 2 distinct questions. Contexts like "Minutes of practice on 4 days: 3, 10, ..."
are unrealistic.

B4. l5whatpct. Wholes of 250 and 400 give step 2 answers like 81.25, 78.75, 7.25, 13.6: heavy for the standard step.
twoParts stories scale PAIRS totals unrealistically ("120 wins and 80 losses this season", "$7 of the $20 needed for
a new bike"). TINY stories print "2000 students" without a separator (whatpct.js:76). A tip in pickPercent says
"never a tiny decimal", contradicting step 3's "under 1%" problems. Step 3 reuses step 2 shapes at the same size.

B5. l5fracvol other issues. "1 cubic centimeters", "1 cubic feet", "1 layers". Step 1 `layers(1)` allows 12 by 12 by
5 cubes with answers like 224/27. Units are random per object: "A fish tank ... base area 3/4 square inches and is
3/4 in tall", "A shoebox 2 3/4 in", a shoebox of 11/5 m.

B6. l5unitconv. Both ways in `speed` and `doubleProblem` use the same method (scale by 60 or by f). `speed` always
opens "1 hour is 60 minutes, and 1 minute is 60 seconds" even for per-second to per-minute problems. The `chain`
first way starts lowercase ("hours to minutes ...").

B7. l5ratiograph. Step 1 `onLine`, steps 2-3: choices can lie off the 10 by 10 grid ("(12, 4)", "(15, 5)"), so the
picture cannot show them. The "Test each point" way is generic and gives no actual test.

B8. l5longdiv. `estimate` prints "1,500 is close to 1,500" when n equals its rounded value. The chunk way prints
"1 groups of 24". Step 1 includes "remainder when 205 is divided by 10" (trivial). Step 3 is step 2 shapes with
bigger numbers: only 2-digit divisors, no decimal quotients.

B9. l5twovar `graph`. Draws only proportional lines with rate 2 to 5 while the context may be miles per hour, so the
rate does not match the context.

B10. l5statq. `yesNo` draws from only 18 distinct questions. peaks(false) always answers 1 and peaks(true) always 2.
`answers` includes "3, 3, 3, 3, 3, 3" as a wrong list though it could come from asking a group. The homework question
gives answers of 0 to 5 minutes.

B11. l5ratnum. `nested` way 2 says "There are 3 minus signs in front" for "−(−(−(−3.2)))", which shows 4. Step 3
story numbers like −5.4°C and −5.45°C are unrealistic readings. `order` sometimes has only 3 options.

B12. l5exprparts. `whichPart` asks the whole expression as a "part" (loose use of the word). The `reading` step is
verbal-heavy for a struggling child.

B13. l5solution. The story variant asks two questions in one ("Which value of s fits the story? How many stickers
were there at first?"). Step 3 `whichEquation` choices like "9x + 12 = 102" are tedious to check.

B14. Pictures at phone size: polygon labels at x = 6 are clipped at the right edge (label x + 8 reaches about 322 of
320); plus the double-line unit labels (A7), the clipped "B" label (A5) and the overlapping a/b dots (A3).

## C. Test gaps

C1. rnZero (tests/level5.new.recompute.js, level5.new.shown.js): the recompute returns the stored `zero` string, so
swapping which story gets which meaning passes. Needed: an independent keyword-to-meaning table in the test
(water/meters: surface; °C: freezing; countdown: liftoff; par: par; level: street level) and an assertion that the
story text contains the keyword for the stored meaning.

C2. sqWhich: the recompute returns `good`; the only independent check is a regex of group nouns (STAT_RE). Needed: a
hand-tagged bank in the test; no single-answer question may be tagged statistical; every statistical one names a
group plus a varying quantity.

C3. epWhich: the recompute is a lookup on stored operands; a wrong `mean` line in the WHICH contexts would pass.
Needed: an independent parse of the story text asserting, per part, that the meaning string and the matching number
or letter appear in the expected position.

C4. epRead: the table repeats the generator strings; the check only tests the answer starts with "the
sum/product/... of". Needed: parse the displayed expression into a tree and generate the words independently.

C5. rgBatch recomputes j*b/b (which is j) and never inspects the displayed numbers.

C6. ucWhich, ucMul, ucDiv use the generator's own factor f, so a wrong fact in CONV passes. Needed: a fixed table in
the test (m 100 cm, km 1000 m, kg 1000 g, L 1000 mL, h 60 min, min 60 s, ft 12 in, yd 3 ft, lb 16 oz, gal 4 qt,
qt 4 cup) asserted against the displayed units.

C7. No test asserts that picture coordinates fall on the visible grid (A2) or that labels fit inside the viewBox
(A5).

C8. ldEstimate allows 25% error, loose for a "best estimate" with a 10x distractor family.
