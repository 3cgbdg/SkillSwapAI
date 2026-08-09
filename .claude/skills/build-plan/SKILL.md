---
description: Executes an approved implementation plan from docs/plans/<slug>.md step by step, verifying and committing each step in order, then has plan-critic audit the final diff against the plan.
disable-model-invocation: true
argument-hint: [slug]
---

Read `docs/plans/$ARGUMENTS.md` in full before doing anything else.

Execute the plan's numbered implementation steps **strictly in order** — do not reorder, batch, skip ahead, or combine steps.

For each step, in order:

1. Implement exactly what that step describes. Do not implement work that belongs to a later step, and do not add anything the step didn't ask for.
2. Run that step's verification command (as written in the plan).
   - **Green** → proceed.
   - **Red** → fix the implementation and re-run verification until it passes, before moving on to the next step. Do not move on with a red verification.
3. Commit the change, with a commit message that references the step number (e.g. `Step 3: <short description>`).
4. Update the checkbox/status for that step in `docs/plans/$ARGUMENTS.md` itself (mark it done), and commit that update — either as part of the same commit or a small follow-up, whichever keeps history clean.

**If a step turns out to be wrong, inapplicable, or based on a false assumption once you're actually in the code** (e.g. a file the plan references doesn't exist, an API the plan assumes isn't there, a step contradicts what an earlier step actually produced): **stop immediately**. Do not improvise a fix or an alternative approach that isn't in the plan. Report to the user exactly which step failed and why, and wait for direction. Do not continue to later steps.

After all steps in the plan are complete and committed:

Invoke the `plan-critic` subagent, giving it the slug and the plan path (`docs/plans/$ARGUMENTS.md`), and ask it specifically to compare the actual resulting diff/implementation against the plan (not to re-review the plan in the abstract) and report any divergences — places where what was built doesn't match what was planned. Relay its findings to the user.
