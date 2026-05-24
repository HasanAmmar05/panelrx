# Phase 4 — Cinematic Stages 4-5

**Goal**: Build Stages 4 (Submission Storm) and 5 (Time Skip).

**Dependencies**: Phase 3 complete.

**Output**: Stages 4 and 5 play with real content after Stage 3.

## Stage 4 — "The Submission Storm" (10000ms)

`src/cinematic/stages/Stage4Submission.tsx`

Mirrors Stage 2's structure but for claim submission instead of eligibility verification.

Frame budget:
- 0–800ms: `ThoughtBubble` (doctor speaker): "Old way: re-key into MiCare AND MediExpress portals. Two systems. Twelve minutes."
- 800–1500ms: Bubble fades. Big mono text appears (text-2xl text-primary): "SubmissionAgent · broadcasting canonical claim to 2 eligible panels"
- 1500–2500ms: "Canonical Claim" card appears center-stage (bg-surface rounded-md border border-border p-4 max-w-md). Above card: font-mono text-xs text-muted uppercase tracking-wider label "ENCOUNTER DATA". Lines stream in (15ms/char, 80ms between):
  - "Patient: Encik Faizal Rahman (920101-10-1234)"
  - "DX: J02.9 · Acute pharyngitis"
  - "Rx: Paracetamol 500mg × 10, Amoxicillin 500mg × 15"
  - "Consultation: RM 35.00"
  - "Total: RM 35.00"
- 2500–3000ms: An arrow/connection animates from the claim card downward to two pending slots below (use SVG line drawing animation, stroke-dasharray)
- 3000–3800ms: Two `TPAPortalCard` components animate in (stagger 300ms):
  - MiCare, accessMethod=api, status=calling
  - MediExpress, accessMethod=api, status=calling
- 3800–6000ms: Cards in calling state
- 6000–6800ms: Card 1 resolves: status=success, responseText="Acknowledged · Ref MC-2026-001847 · Status: in_review", latencyMs=2400
- 6800–7600ms: Card 2 resolves: status=success, responseText="Acknowledged · Ref ME-26-003291 · Status: pending", latencyMs=3100
- 7600–8800ms: A "Submissions logged" summary appears below cards in font-display text-lg text-positive: "2 of 2 acknowledged · audit trail recorded"
- 8800–10000ms: Bottom comparison: "Old way: 12 minutes, 2 portals, copy-paste errors. New way: 3.1 seconds, one click."

StatusBar:
- activeAgents=["SubmissionAgent"]
- currentAction transitions: "preparing payload" (0-3000ms) → "broadcasting 2 panels" (3000-6000ms) → "awaiting acks" (6000-7600ms) → "2/2 complete" (7600ms+)

## Stage 5 — "The Time Skip" (6000ms)

`src/cinematic/stages/Stage5TimeSkip.tsx`

The cinematic montage stage.

Frame budget:
- 0–500ms: Full screen darkens further (additional opacity overlay layer, opacity 0 → 0.5)
- 500–1000ms: `ClockCounter` appears center-stage:
  - fromDate: "2026-02-14"
  - toDate: "2026-04-17"
  - durationMs: 4500
- ClockCounter sweeps with rotating hands and date interpolation
- Events to surface (with atProgress thresholds):
  - `{ atProgress: 0.15, label: "Day 14 · MiCare moves claim to 'in review'" }`
  - `{ atProgress: 0.35, label: "Day 27 · MediExpress requests additional documentation" }`
  - `{ atProgress: 0.50, label: "Day 38 · StatusAgent auto-uploads supporting documents" }`
  - `{ atProgress: 0.70, label: "Day 47 · MediExpress moves to 'approved partial'" }`
  - `{ atProgress: 0.90, label: "Day 58 · MiCare → 'paid' · remittance generated" }`
- 5000–6000ms: Clock fades. Single line center-stage in font-display text-3xl text-ink: "Dr. Vani didn't check a single portal during these 62 days."

StatusBar throughout:
- activeAgents=["StatusAgent"]
- currentAction="polling 6 portals · last sync 2 min ago" (with subtle pulse on the Activity icon)

## Particle effect (optional polish)

During Stage 5, add subtle background particles drifting upward:
- 12 small dots, position absolute, opacity 0.1-0.2
- Each animates `y: 100% → 0%, opacity: 0 → 0.2 → 0` over 8-12s, infinite loop with staggered delays
- This reinforces the "time passing" feeling

Implementation in a `<Particles />` component within Stage5.

## Smoke test

`.claude/smoke-tests/phase-04.test.md`:

1. Stage 4 plays after Stage 3: bubble → agent label → canonical claim card with lines streaming
2. Stage 4 arrow connects claim card to TPA slots
3. Two TPA cards resolve with correct ref numbers (MC-2026-001847, ME-26-003291)
4. "2 of 2 acknowledged" summary appears
5. Comparison text appears at end of Stage 4
6. Stage 5 plays: clock sweeps from Feb 14 to Apr 17 over ~4.5s
7. Events appear at correct progress thresholds (around 15%, 35%, 50%, 70%, 90%)
8. "Dr. Vani didn't check a single portal during these 62 days." lands at end
9. Background particles drift upward subtly during Stage 5
10. StatusBar updates correctly throughout
11. Skip-forward to Stage 4 or 5 works without state issues
12. `npx tsc --noEmit` passes

## Acceptance criteria

- All smoke test items pass
- The clock sweep feels deliberate (not too fast, not too slow)
- Events on the ClockCounter are readable (1.2s hold each)

## Commit

`Phase 4: cinematic stages 4-5 (submission, time skip)`
