# Start-Phase Protocol

When the user says "Execute Phase N" or "Run Phase N" or any variation, follow this exact protocol.

## Step 1: Load context

Read in order:
1. `CLAUDE.md` (the project root context)
2. `.claude/conventions.md` (coding rules)
3. `.claude/design-system.md` (visual invariants — REQUIRED for any UI work)
4. `.claude/data-contracts.md` (type definitions)
5. `PHASE_STATUS.md` (live status of the build)
6. `.claude/phases/phase-NN-<name>.md` (the specific phase brief)

## Step 2: Verify prerequisites

Check `PHASE_STATUS.md` for the listed dependencies of this phase.

- If any dependency is `BLOCKED` or `INCOMPLETE`, STOP. Tell the user clearly which prerequisite is missing.
- If a dependency is `SKIPPED`, ask the user whether to proceed anyway.

## Step 3: Plan

Output a brief plan before writing any code. Format:

```
PHASE N — <title>

I will create the following files:
- src/path/to/file1.tsx
- src/path/to/file2.tsx

I will modify the following existing files:
- src/App.tsx (add new route)
- src/lib/types.ts (add new type)

Key decisions:
- <any architectural choice you're making>
- <any place where the brief was ambiguous and how you resolved it>

I will skip:
- <any acceptance criteria you cannot satisfy and why>
```

Wait for confirmation only if a decision feels high-risk. Otherwise proceed.

## Step 4: Execute

Build the phase. Strict rules:

- **Never delete a file** without explicit instruction
- **Never modify a file from a previous phase** unless the current phase brief explicitly requires it
- **Never introduce new npm dependencies** without checking package.json first
- **Always use the design system colors and fonts** from `.claude/design-system.md`
- **Keep files under 250 lines** — split if larger
- **Use Tailwind classes**, not inline styles or styled-components
- **Use Framer Motion for animation**, not CSS keyframes (except cursor blink, pulse)

Pattern for non-trivial features: write the smallest version that satisfies one acceptance criterion, verify it works in dev, then expand.

## Step 5: Verify

Run these commands in order:

```bash
npx tsc --noEmit
```

If it fails, fix the errors before proceeding. Do not declare done with type errors.

Then run the phase smoke test:
```bash
cat .claude/smoke-tests/phase-NN.test.md
```

Manually walk through each numbered check. If any fail, fix before declaring done.

## Step 6: Update tracker

Open `PHASE_STATUS.md` and update the row for this phase:
- Set status to `COMPLETE` with timestamp
- Note any deviations from the brief
- Note any acceptance criteria you skipped and why

## Step 7: Commit

```bash
git add -A
git commit -m "Phase N: <one-line summary from the phase brief>"
```

## Step 8: Report

Output a final summary:

```
✅ PHASE N COMPLETE

Files created:
- [list]

Files modified:
- [list]

Deviations:
- [any]

Manual verification needed:
- [things the user should check visually at the dev URL]

Next phase: Phase N+1 — <title>
Suggested command: "Run Phase N+1"
```

## Failure mode

If you cannot complete the phase:
1. Set status in `PHASE_STATUS.md` to `BLOCKED` with the specific blocker
2. Do NOT proceed to the next phase
3. Do NOT delete or break working code from previous phases
4. Output a clear summary of what was tried, what failed, and what the user could do

## Notes on common pitfalls

- **Don't fight CLAUDE.md.** If something contradicts the rules, raise it with the user — don't quietly override.
- **The design system is non-negotiable.** No purple, no glass morphism, no `rounded-2xl` (except ThoughtBubble), no shadows on dark bg.
- **Mobile responsive is in scope.** Every phase brief assumes 375px width works.
- **The cinematic is sacred.** Phases 1-6 build the centerpiece. Do not break previous stages when working on later ones.
