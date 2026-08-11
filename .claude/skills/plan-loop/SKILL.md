---
description: Runs the planner/plan-critic loop to produce a reviewed implementation plan for a feature, iterating until the plan is APPROVED or 3 iterations are exhausted. Does not implement anything.
disable-model-invocation: true
argument-hint: [feature description]
---

Run the following loop in the main conversation (do not delegate the orchestration itself to a subagent — only the individual steps below are subagent calls). Derive a short kebab-case `<slug>` from the feature description in `$ARGUMENTS` up front; use the same slug for every iteration.

Maximum 3 iterations. Track the iteration count as you go.

For each iteration:

1. **Invoke the `planner` subagent.** Pass it:
   - the task/feature description (`$ARGUMENTS`)
   - the slug to use (`docs/plans/<slug>.md`)
   - from iteration 2 onward, the path to the previous review file (`docs/plans/<slug>.review.md`) and an instruction to address every finding in it

   Wait for the planner to finish before continuing.

2. **Invoke the `plan-critic` subagent.** Pass it the slug and the path to the plan (`docs/plans/<slug>.md`). Wait for it to finish — it writes `docs/plans/<slug>.review.md`.

3. **Read `docs/plans/<slug>.review.md`** and check the verdict:
   - **APPROVED** → exit the loop now.
   - **NEEDS_WORK** and iteration count < 3 → start the next iteration (go back to step 1).
   - **NEEDS_WORK** at iteration 3 → stop looping. Report to the user that the plan did not converge in 3 iterations, and show the remaining Blocking findings from the review verbatim.

After the loop ends (whether by approval, or by hitting the 3-iteration cap), give the user a summary of **at most 10 lines** covering:
- what changed in the plan between iterations
- what tradeoffs or open concerns remain (including any un-addressed "Should fix"/"Nits" items, or, if capped out, the remaining Blocking items)

Then **stop**. Do not start implementing the plan, do not write or edit production code, and do not ask the user whether to proceed with implementation — just stop after the summary.
