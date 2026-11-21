# Level 6 new-skill review findings

Paths relative to E:\GithubPers\math-lab; line numbers within a line or two. The reviewer spot-recomputed about 40
problems per step across all 14 new skills and found every rechecked answer right. Nothing was rendered in a browser.

## A. Wrong or broken

A1. l6rewrite steps 2-3, js/skills/level6/rewrite.js:60. The "Try the number 100" way uses
src.replace(letter,'100'), gluing the number to the coefficient. "n + 0.15n" shows "Put n = 100: 100 + 0.15100 =
115"; "c + 0.3c − 0.05c" shows "100 + 0.3100 − 0.05100 = 125". Not arithmetic. Tests do not read worked-step text.

A2. l6writeeq steps 1-3, js/skills/level6/write-equations.js:29, 39, 42. Unit plural built as `${ctx.unit}s`; the
bakery unit is "box": "Let x be the number of boxs" and the answer-box suffix "boxs".

A3. l6circback steps 1-2, js/skills/level6/circle-back.js:31-32. Length w (3 to 10 or 14) and diameter d (4 to 12)
are drawn independently, but the story says the half circle goes on "one short end". "A garden bed is a rectangle
4 m long and 10 m wide, with a half circle added to one short end. The half circle has a diameter of 10 m": the 10 m
side is the long one. Also "8 m long and 12 m wide, diameter 12". Wording contradicts picture and numbers.

A4. l6slices step 3, js/skills/level6/slices.js:14. "Which cut of a triangular prism makes a triangle?" offers both
"A straight cut down through the top edge" and "A cut parallel to the triangular ends"; a vertical plane crossing the
top edge at a point is the end-parallel cut, so two options are defensible. The same phrase "straight down through
the top edge" is the rectangle cut elsewhere, where a picture resolves it; the choice question has no picture.

A5. l6realworld steps 1-3, js/skills/level6/realworld.js:50. Distractor built as `$${P - d}`: "A pair of trainers
costs $20.00. It is 40% off." gives options "$28 / $12 / $8 / $-20" with the explanation "$-20 takes 40 dollars off
instead of 40%"; another draw shows "$-10". A negative price is not a plausible mistake, and "$-20" uses an ASCII
hyphen.

A6. sequenceWord, js/skills/level6/rational-order.js:76 (used by l6order step 3, l6realworld step 3, l6story step 3).
"A diver is 4.4 metres above the surface. The diver sinks 0.5 metres each minute for 2 minutes, then floats up
8 metres." Answer 11.4 m above water: meaningless.

A7. l6groups, js/skills/level6/two-groups.js. Overlap vocabulary inconsistent between steps: step 2 labels gaps of
1.5, 2, 2.5 spreads "overlap somewhat" and 3 or more "barely overlap"; step 3 says "Two spreads or more is a big
gap". The step 2 overlap question has no single defensible answer near the cut-offs. Reword to ask for the number
of spreads (step 1 already has that shape and it matches 7.SP.3).

## B. Quality

B8. l6isprop step 1, js/skills/level6/prop-tests.js about line 22. "Which point on the graph shows the cost of ONE of
them?" refers to a graph that is not shown (only a table); options are bare points.

B9. l6writeeq steps 1-2, js/skills/level6/write-inequalities.js:18. "Which graph shows every number that is
allowed?" offers four text descriptions ("Open circle at 12, shaded to the right") instead of drawn number lines.

B10. l6realworld step 2 mixWord, realworld.js:39. "Ava's water bottle holds 60 litres when full" (also 32, 55). Also
"A snack costs $100.00" in l6rewrite step 1.

B11. l6realworld "Is that answer reasonable?": a factor-of-2 error gets "Much too big" / "Much too small" ("Theo says
that 10% of $40.00 is $8.00"). Use "too big / too small" or errors of 5x or more. Duplicates common (same $40
question in consecutive draws).

B12. Unrounded decimals with no stated rounding: l6sampling step 3, sampling.js:89 "Sample 1: 18.333333%"; l6isprop
step 2 list question "the answers are 2, 1.5, 1.333333".

B13. l6sampling steps 1-2: "every 12th name on the full school list" is labelled Random in a Random-or-biased choice
(systematic sampling is unbiased but not simple random: a second answer is defensible). "a researcher picks 200
teenagers at random from several towns" is labelled Random yet samples only those towns.

B14. l6expprob. Step 1: the right coin option is always the longest sentence, so it can be guessed. "10 equal
sections and 1 of them are yellow" ungrammatical. Step 3 can ask "about how many reds" and expect 287.5.

B15. l6groups presentation: the two-row table renders group A as the header (th) row and group B as ordinary cells.
The worked step "The values are 29 plus or minus: -4, -2, 2, 4" uses ASCII hyphens (two-groups.js:48).

B16. l6unitrate steps 2-3: "how much day for ONE inch", "how much hour for ONE chapter" ungrammatical.

B17. Variety (distinct questions in 30 draws): l6unitrate step 1 17, l6isprop step 1 18, l6pctmore step 1 18,
l6circback step 1 5 templates, l6slices step 1 11 templates. "backpack $100, 50% off" twice in about 20 draws.

B18. l6order steps 1-2: "7 − 1 × (−1)", "−3.8 + 1 × (−1)", "3.9 × 1 − 1.7" use ×1 as the order-of-operations test
(weak). l6ratdiv step 3 "which digit repeats": the worked way repeats 6 to 8 near-identical lines.

B19. l6writeeq: "a $8 card" should be "an $8 card". The hint says '"at most" points to one of the four signs' for
"Leo has $47 to spend", where those words are not in the story.

B20. l6story steps 2-3 and l6realworld steps 2-3 draw on the same four sources (budgetWord, debtWord, mixWord,
sequenceWord), so the two skills in the Stories strand repeat each other. Note: l6story's step 2-3 mix changed from
main because of this.

B21. Second ways that only check ("Estimate to check" in l6circback and l6pctmore, "Compare with each sample" in
l6sampling, "Check by estimating" in l6realworld) restate or approximate the answer rather than derive it.

## C. What the tests cannot catch today

Garbled worked-step text (A1); plural wording (A2); story or geometry wording that contradicts the numbers (A3);
defensibility or plausibility of choice options (A4, A5); threshold consistency across steps (A7); low variety above
the 40-key floor (B17); realism of story numbers (A6, B10).
