# Phase 11 — Smoke Test Checklist

See `.claude/phases/phase-11-*.md` "Smoke test" section for the full numbered checklist.

After implementing Phase 11:

1. Run `npx tsc --noEmit` — must pass with zero errors
2. Run `npm run dev` — must boot without console errors
3. Open the dev URL and walk through each numbered item in the phase brief's smoke test
4. For each item, mark ✅ if observable, ❌ if not
5. If any ❌ items, debug before declaring phase complete

Common things to verify across all phases:
- No purple gradients, no glass-morphism, no rounded-2xl on anything except ThoughtBubble
- Mobile (375px) doesn't break the layout
- No `console.error` or `console.warn` from your code (excluding expected fallback warnings)
- Money values use `tabular-nums` and `formatRM()`
