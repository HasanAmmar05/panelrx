# Debug-Failure Protocol

When something is broken or the user reports a bug, follow this protocol.

## Step 1: Reproduce

Ask the user:
- What were you trying to do?
- What did you expect to happen?
- What actually happened?
- Any console errors? (`F12 → Console`)

## Step 2: Locate

Identify which phase/file/component is responsible:
1. Read `PHASE_STATUS.md` to see what's been built
2. Identify the most likely file from the symptoms
3. Read the actual code, not your assumption of what's there

## Step 3: Diagnose

Common failure modes for this project:

| Symptom | Likely cause |
|---|---|
| Cinematic stuck on a stage | Stage component error — wrap in error boundary, skip stage |
| Type errors after edit | Imports out of order, or type mismatch — re-check data-contracts.md |
| Framer Motion animation jank | Too many simultaneous animations — stagger or reduce |
| Tailwind classes not applying | Class doesn't exist in v4 build — verify spelling and config |
| Live Claude call hangs | No API key, CORS, or rate limit — fallback should kick in |
| Mobile broken | Missing `md:` prefix, or width overflow — test at 375px |
| StreamingText doesn't restart on stage skip | Need to use `key` prop to force remount |

## Step 4: Fix

1. Make the minimal change to fix the symptom
2. Do NOT refactor adjacent code while fixing a bug
3. Do NOT delete features to bypass a bug
4. Verify `npx tsc --noEmit` still passes
5. Manually test the fix at the dev URL

## Step 5: Document

If the bug was in a completed phase:
- Note the fix in `PHASE_STATUS.md` under "POST-PHASE FIXES"
- Format: `Phase N · YYYY-MM-DD HH:MM · Fixed: <symptom> by <fix summary>`

## Step 6: Commit

```bash
git add -A
git commit -m "fix(phase-N): <one-line summary>"
```

## When to escalate

If the bug is in the cinematic engine or core harness and could cascade:
- STOP further work
- Get user approval before making structural changes
- Consider rolling back via `git reset --hard HEAD~N` if needed

## Time-budget aware fixes

If we're under time pressure (e.g. after 2 PM on Sunday):
- Prefer "skip stage" or "use fallback" over "deep fix"
- Cosmetic bugs can be deferred — note in PHASE_STATUS.md
- The cinematic and /reconcile are the only places where "deep fix" is justified
