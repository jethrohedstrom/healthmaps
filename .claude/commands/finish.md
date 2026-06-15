---
description: Finish a change — simplify, review, verify (run it for real), security pass, write the diary, stage a commit
disable-model-invocation: true
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*)
---

Run the full "finish a change" pipeline on the current working-tree changes, in order. Do NOT skip steps. After each step, give me a one-line status before moving to the next. If a step surfaces a blocking problem (a real bug, a failed verify, a security issue), STOP and tell me — don't push past it to the commit.

First, orient: run `git status` and `git diff` so every later step is scoped to what actually changed in this session.

## 1. Simplify — quality pass on the diff
Invoke the `/simplify` skill. This is the reuse / dead-code / efficiency / altitude cleanup pass. Apply its fixes. It does NOT look for bugs — that's the next step.

## 2. Code review — correctness bugs
Invoke `/code-review --fix`. This hunts for correctness bugs in the diff and applies the fixes to the working tree. If it reports findings it could not safely auto-fix, list them for me before continuing.

## 3. Verify — RUN THE APP AND EXERCISE THE CHANGED FEATURE AS A REAL USER

**This is the point of the whole command. Tests passing does NOT count as verified. `astro check` passing does NOT count as verified. A successful build does NOT count as verified.**

Invoke `/verify`, and actually do the following:
- Start (or use the running) dev server — `npm run dev` at localhost:4321. Remember Vite HMR sometimes fails to pick up inline `<script>` changes; if behaviour looks stale, restart the dev server.
- Open the actual page(s) affected by this change in the browser.
- **Click through the changed feature the way a real user would** — expand the accordions, run the calculator, drive the interaction, navigate the pathway, whatever the change touched. Check it on mobile width too if the change is visual.
- Confirm with your own eyes that the new behaviour is correct and nothing visibly broke around it.

If you cannot actually exercise it (no browser access, server won't start), say so plainly — do NOT claim it's verified. "The code looks right" is not verification.

## 4. Security review — pending changes
Invoke `/security-review`. This runs a security pass over the pending changes on the current branch. Surface anything it finds before continuing.

## 5. Building diary — write the handover
Invoke the `building-diary` skill to write the session handover entry. Follow that skill's format exactly (plain prose, casual tone, no markdown headers/bullets/emoji). Output it as text for me to paste into the Google Doc.

## 6. Stage a commit — DO NOT PUSH
- `git add` the relevant changed files (review `git status` first; don't blind-add stray files like `.DS_Store`, `.bak`, zips, or loose images).
- Write a clear commit message describing what the change does, ending with the required co-author trailer:

  ```
  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```

- Show me the staged diff summary (`git diff --cached --stat`) and the proposed commit message, then **stop and wait for my go-ahead before actually committing.** Never push.
