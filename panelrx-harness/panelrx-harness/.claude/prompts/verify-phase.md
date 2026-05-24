# Verify-Phase Protocol

When the user says "Verify Phase N" or "Test Phase N", follow this protocol.

## Step 1: Re-read

1. `.claude/phases/phase-NN-*.md` — the phase brief
2. `.claude/smoke-tests/phase-NN.test.md` — the smoke test checklist
3. `PHASE_STATUS.md` — current status

## Step 2: Run automated checks

```bash
npx tsc --noEmit
npm run build  # only if Phase 17 or near final
```

Report any errors immediately.

## Step 3: Walk the smoke test

For each numbered item in the smoke test:
1. Describe what should be observable at the dev URL
2. Ask the user to verify (or describe what the code should produce)
3. Mark as ✅ or ❌

## Step 4: Report

```
PHASE N VERIFICATION RESULTS

Smoke test items:
  ✅ 1. Stage engine boots without errors
  ✅ 2. Stage 1 plays correctly
  ❌ 3. Skip-forward button stalls on Stage 4
  ...

Issues found:
- Skip-forward broken (item 3)
- ...

Recommended action:
- Run debug-failure protocol for the broken items
- Or: re-execute Phase N to refix
```
