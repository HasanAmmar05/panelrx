# Phase 14 — /eligibility

**Goal**: Single-screen interface for verifying patient coverage across all panels.

**Dependencies**: Phase 9 complete.

**Output**: At `/eligibility`, staff types IC → 6 panel cards animate in showing eligibility per TPA.

This is a Tier 3 page — animated mock, no real API calls. Built in ~20 minutes.

## File: `src/pages/Eligibility.tsx`

## H1

- "Eligibility Verification" font-display text-3xl
- Sub: "Type a patient's IC. Get coverage status across all 6 panels in seconds." text-body

## Input section

`max-w-xl mt-8`

A single labeled input:
- Label: "MyKad / IC number" in font-mono text-xs uppercase tracking-wide text-muted
- Input: large (`text-lg px-4 py-3 font-mono`), placeholder "920101-10-1234"
- Below input: small text "Try: 920101-10-1234 · 880515-08-5678 · 751230-14-9012" in text-xs text-muted (click to autofill)

Primary button beside input (or below):
- "Check coverage across all panels" → primary teal, large

Below the button while idle:
- Small mono label: "EligibilityAgent on standby"

## On submit (live verification animation)

When user clicks "Check coverage":

1. **Animation phase** (~3 seconds):
   - Top: a streaming-text style message types: "EligibilityAgent · querying 6 panels in parallel..."
   - Below: 6 placeholder cards animate in (skeleton state)
   - Each card shows the panel name + "● calling..." with subtle pulse
   - StatusBar at bottom: activeAgents=["EligibilityAgent"], currentAction="6/6 calls in flight"

2. **Resolution phase** (~2 seconds):
   - Cards resolve one by one (stagger 200ms)
   - Each card transitions from skeleton to result

Final state: 6 cards in `grid grid-cols-2 md:grid-cols-3 gap-4`

For IC `920101-10-1234` (Encik Faizal Rahman), show:

| Panel | Status | Details |
|---|---|---|
| MiCare | ● Active | Berjaya Sompo OPD · RM 1,200 remaining · RM 200 cap · RM 0 copay |
| MediExpress | ● Active | Etiqa Corporate · RM 800 remaining · RM 150 cap · RM 5 copay |
| IHP | ● Active | AIA Corporate Care · RM 500 remaining · RM 120 cap · RM 10 copay |
| PMCare | ○ Not covered | Employee resigned 14-Feb-2026 |
| Skim Madani | ● Eligible | RM 170/visit cap · RM 85 balance remaining |
| PeKa B40 | ○ Not eligible | Income threshold not met |

Card design:
- bg-surface border border-border rounded-md p-4
- Status dot at top-left (10px): active = primary, eligible = primary, not_covered = muted, error = danger
- Payer name in font-display text-base text-ink
- Sub-info in font-mono text-xs text-body
- Latency badge bottom-right: "847ms" or similar in font-mono text-xs text-muted

For other ICs, return plausible random combinations with similar structure.

## Below cards (summary action)

After cards resolve:
- Banner: "Patient eligible at this clinic · 4 panels active · proceed with consultation" in font-display text-base text-positive
- Button: "Start claim →" (links to `/submit` with patient pre-filled)

## "Recently checked" sidebar

To the right (or below on mobile), a small list:
- "Recent eligibility checks · today"
- 5 mock entries: "Aisyah binti Rahman · 09:14 · 4/6 panels", "Lim Wei Jian · 09:02 · 3/6 panels", etc.
- Each entry compact in font-mono text-xs

## Smoke test

`.claude/smoke-tests/phase-14.test.md`:

1. Navigate to `/eligibility`
2. Input field for IC visible
3. Click suggested IC "920101-10-1234" → autofills
4. Click "Check coverage" → animation runs ~5 seconds
5. 6 panel cards appear with correct statuses
6. Active panels show with primary dot, not-covered with muted dot
7. Summary banner appears: "Patient eligible at this clinic..."
8. "Start claim →" button visible
9. Try a random IC like "999999-99-9999" → returns plausible mock results
10. Mobile: cards stack 1-column
11. `npx tsc --noEmit` passes

## Acceptance criteria

- Animation feels deliberate, not glitchy
- The 6 panel cards are visually consistent
- Latency badges feel real (vary from 400-1200ms)

## Commit

`Phase 14: /eligibility with animated multi-panel verification`
