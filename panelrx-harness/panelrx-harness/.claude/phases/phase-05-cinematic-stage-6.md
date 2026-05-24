# Phase 5 — Cinematic Stage 6 (The Reconciliation Crown Jewel)

**Goal**: Build Stage 6 — the longest (18 seconds) and most important stage of the cinematic. This is the climax of the entire demo.

**Dependencies**: Phase 4 complete.

**Output**: At `/demo`, Stage 6 plays after Stage 5 with full 5-agent pipeline + result reveal.

⚠️ **This is the highest-stakes phase. Spend extra polish here.**

## Stage 6 — "The Reconciliation" (18000ms)

`src/cinematic/stages/Stage6Reconciliation.tsx`

Frame budget (18 seconds total):

### Pre-pipeline (0–3000ms)

- 0–1000ms: `ThoughtBubble` (narrator): "Day 62. The remittance arrives."
- 1000–2500ms: A "remittance PDF" visual appears center-top. Style:
  - Container: rounded-md border border-border bg-surface-elevated p-4 max-w-md
  - Header line in font-mono text-xs text-muted uppercase: "MICARE SDN BHD · REMITTANCE MC-REM-2026-03-00184"
  - 3-4 visible line items in font-mono text-xs text-body:
    - "L01 · Lim S.K. · 14-Feb · RM 65 → RM 35 · admin adjustment"
    - "L02 · Tan M.L. · 15-Feb · RM 45 → RM 45 · paid in full"
    - "L03 · Faizal R. · 16-Feb · RM 80 → RM 72 · formulary cap"
    - "..."
  - Drop in with motion: scale 0.9 → 1, opacity 0 → 1
- 2500–3000ms: ThoughtBubble fades. Mono label appears: "ReconciliationAgent pipeline · 5 agents · sequential execution"

### Agent 1: IngestionAgent (3000–4500ms)

- AgentCard appears on left side (slide in from left):
  - icon=`FileSearch`, name="IngestionAgent", model="Claude Haiku 4.5"
- Initial state: status=working, statusText="Extracting line items from PDF via OCR..."
- At t=3500ms: a small floating snippet appears below the card in font-mono text-xs text-muted, showing extracted fragment:
  - "Line 14 · Lim S.K. · 14-Feb-2026 · RM 65 billed · RM 35 paid"
- At t=4300ms: card status → done, resultText="✓ Extracted 27 line items in 1.3s"

### Agent 2: MatchingAgent (4500–7500ms)

- AgentCard appears below first (slide in):
  - icon=`GitMerge`, name="MatchingAgent", model="Claude Sonnet 4.6"
- status=working, statusText="Fuzzy-matching 27 payment lines to 200 open claims..."
- At t=5500ms: a visual matching animation — two small columns of items with SVG lines drawing between matched pairs (use Framer Motion to animate stroke-dashoffset)
- At t=6800ms: status=done, resultText="✓ 25/27 matched · 2 flagged for review"

### Agent 3: VarianceAgent (7500–11500ms) — **THE HEART**

This is the most important visual moment. Give it the most screen real estate.

- AgentCard appears:
  - icon=`AlertTriangle`, name="VarianceAgent", model="Claude Sonnet 4.6"
- status=working, statusText="Classifying 8 variances..."
- At t=8500ms: A reasoning trace area opens below the card (max-w-lg, bg-surface rounded-md p-4). StreamingText types out the following sequence (25ms/char), as one continuous stream with breath pauses:

```
Examining Line 14: MiCare deducted RM 30 from RM 65 billed.
 Citing 'admin adjustment' as reason.
 Cross-referencing panel agreement... no matching clause.
 → CLASSIFICATION: UNEXPLAINED
```

(Each line on its own line, with 400ms gap between lines simulated by setting a timeout before resuming the next line's stream.)

- The phrase "UNEXPLAINED" at the end is wrapped in a span with `text-danger font-semibold` styling, and when it appears it scales briefly (1.0 → 1.1 → 1.0 over 300ms) for emphasis
- At t=11000ms: card status=done, resultText with `6 UNEXPLAINED` highlighted in text-danger: "✓ 8 variances · 6 UNEXPLAINED"

### Agent 4: AppealAgent (11500–13500ms)

- AgentCard appears:
  - icon=`FileEdit`, name="AppealAgent", model="Claude Sonnet 4.6"
- status=working, statusText="Drafting 6 bilingual appeal letters (BM + EN)..."
- At t=12500ms: small floating snippet appears showing a partial letter:
  - In font-mono text-xs text-body, max-w-md: "Re: Remittance MC-REM-2026-03-00184... We respectfully request written justification..."
- At t=13200ms: status=done, resultText="✓ 6 letters drafted · ready for review"

### Agent 5: AnalyticsAgent (13500–15000ms)

- AgentCard appears:
  - icon=`LineChart`, name="AnalyticsAgent", model="Claude Haiku 4.5"
- status=working, statusText="Rolling up dashboard metrics..."
- At t=14700ms: status=done, resultText="✓ Dashboard updated"

### Money Shot (15000–17000ms)

All 5 agent cards remain visible on the left, dimmed slightly (opacity 0.7) but still readable.

3 `ResultCard` components animate in on the right (stagger 300ms each):

1. label="MATCHED CORRECTLY", value="RM 932", valueColor="positive", sublabel="20 lines · paid as billed", icon=`CheckCircle`
2. label="EXPLAINED VARIANCES", value="RM 380", valueColor="amber", sublabel="5 lines · formulary caps & admin fees", icon=`Info`
3. label="UNEXPLAINED", value="RM 6,210", valueColor="danger", sublabel="6 lines · 3 TPAs · letters drafted", icon=`AlertCircle`, **pulse=true**

### Closing moment (17000–18000ms)

Below the 3 result cards, a single line in text-body text-base font-sans appears:
"Appeal letters in BM + EN ready for Dr. Vani's one-tap approval."

## Layout

Desktop (md+):
- Grid: `grid grid-cols-12 gap-6 px-12 pt-8`
- Remittance PDF: top center, full width or centered
- Agents column: `col-span-5` left side
- Result cards: `col-span-6 col-start-7` right side, stacked vertically
- StatusBar: bottom of stage content (above the global ControlBar)

Mobile (below md):
- Stacks vertically: remittance → agent cards → result cards
- Each section full-width
- Agent stack and result stack don't side-by-side

## StatusBar throughout Stage 6

- activeAgents updates dynamically based on which agents are currently "working"
- currentAction reflects the running operation (e.g. "IngestionAgent · OCR" then "MatchingAgent · fuzzy matching" etc.)

## Critical visual details

These details are what separate "good cinematic" from "winning cinematic":

1. **The streaming reasoning trace in Agent 3 is the single most important visual moment in the entire demo.** Make sure it's prominent, readable, and the "UNEXPLAINED" punch lands with the scale-up.
2. Agent cards remain on screen as they finish (don't fade out) — by the end of Stage 6, all 5 cards visible vertically on the left
3. The RM 6,210 result card has the subtle pulse animation drawing the eye
4. Use Framer Motion's spring physics for cards entering (not default ease — feels different)

## Sub-phase derivation

```typescript
function getSubPhase(elapsedMs: number) {
  if (elapsedMs < 3000) return "pre-pipeline";
  if (elapsedMs < 4500) return "agent-1";
  if (elapsedMs < 7500) return "agent-2";
  if (elapsedMs < 11500) return "agent-3";
  if (elapsedMs < 13500) return "agent-4";
  if (elapsedMs < 15000) return "agent-5";
  if (elapsedMs < 17000) return "money-shot";
  return "closing";
}
```

Note: agent cards from previous sub-phases stay mounted (just transition their internal status). Use Framer Motion's layoutId or AnimatePresence carefully so cards don't unmount when a new sub-phase starts.

## Smoke test

`.claude/smoke-tests/phase-05.test.md`:

1. Stage 6 plays for 18 seconds without errors
2. Remittance PDF appears at top with sample line items
3. All 5 agent cards appear in sequence (IngestionAgent → AnalyticsAgent)
4. Each agent transitions visibly from working → done
5. The streaming reasoning trace on VarianceAgent types out the full text
6. "UNEXPLAINED" punch animation lands (brief scale)
7. All 5 agent cards remain visible at end (not unmounted)
8. 3 result cards animate in on the right with correct values (RM 932, RM 380, RM 6,210)
9. RM 6,210 card has the pulse animation
10. Closing line "Appeal letters in BM + EN ready..." appears at end
11. Skip-forward to Stage 6 works cleanly (state initializes from start)
12. Replay Stage 6 multiple times — no state pollution
13. Mobile: layout adapts gracefully (stacks vertically)
14. `npx tsc --noEmit` passes

## Acceptance criteria

- All smoke test items pass
- The streaming reasoning trace is clearly readable on a real mobile device
- The "UNEXPLAINED" moment lands with proper emphasis
- The 3 result cards feel like a climax, not just more content

## Commit

`Phase 5: cinematic stage 6 reconciliation crown jewel`
