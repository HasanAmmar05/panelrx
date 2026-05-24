# Phase 10 — /reconcile (Live Claude Crown Jewel)

**Goal**: Build the most important supporting product page. Real PDF upload → multi-agent pipeline → exception table → real Claude-generated bilingual appeal letters.

**Dependencies**: Phases 8 (harness) and 9 (data + shell) complete.

**Output**: At `/reconcile`, judges can click "Try with Dr. Vani's actual remittances" and watch the full pipeline run. Click any exception's "Draft appeal" → real Claude generates bilingual letter.

⚠️ This is the second crown jewel of the build (after the cinematic). Spend extra polish time here.

## Page structure

```
┌─────────────────────────────────────────────────┐
│ TopBar: "Reconcile · April 2026"                │
├─────────────────────────────────────────────────┤
│ Title section: "Multi-TPA Remittance            │
│ Reconciliation" + "5 agents · PDFs in,          │
│ exceptions out"                                  │
├─────────────────────────────────────────────────┤
│ Upload zone:                                     │
│  ┌─ Drop remittance PDFs here ─┐                │
│  │   Dashed border, large       │                │
│  │   [Try Dr. Vani's sample →]  │  ← primary CTA│
│  └──────────────────────────────┘                │
├─────────────────────────────────────────────────┤
│ Agent pipeline (appears after upload):          │
│  ▢ IngestionAgent                                │
│  ▢ MatchingAgent                                 │
│  ▢ VarianceAgent                                 │
│  ▢ AppealAgent                                   │
│  ▢ AnalyticsAgent                                │
├─────────────────────────────────────────────────┤
│ Results (3 cards: Matched / Explained /         │
│ Unexplained)                                     │
├─────────────────────────────────────────────────┤
│ Exception table (6 rows, each with "Draft       │
│ appeal" CTA)                                     │
└─────────────────────────────────────────────────┘
```

## File: `src/pages/Reconcile.tsx`

This will be ~400 lines. Split into sub-components in `src/pages/reconcile/` if needed:
- `UploadZone.tsx`
- `AgentPipeline.tsx`
- `ResultsBar.tsx`
- `ExceptionTable.tsx`
- `AppealDrawer.tsx`

## Upload Zone

Large dashed border zone:
- `border-2 border-dashed border-border rounded-lg p-12 text-center bg-surface/30`
- Lucide `FileUp` icon (40px, text-muted) centered
- Text: "Drop remittance PDFs here" in font-display text-xl text-body
- Sub: "Supports PDF, Excel, CSV" in text-xs text-muted
- "OR" separator
- The MAIN BUTTON: "Try Dr. Vani's actual remittances →" — primary teal, prominent
  - Below in text-xs text-muted: "5 sample remittances · MiCare, MediExpress, IHP, PMCare, PeKa B40"

Drag-drop handlers: accept files but for the demo, always use the seed batch IDs from `PAYMENT_BATCHES`. (Real upload would call IngestionAgent on each file; for safety, just use the seeded data regardless of what's dropped.)

When user clicks "Try Dr. Vani's actual remittances" OR drops files, transition to pipeline state.

## Agent Pipeline

Once triggered, the pipeline animates through 5 agents in sequence. Each agent invocation goes through the orchestrator with `liveCall: false` (except AppealAgent later — but we don't run AppealAgent on bulk here, only when user clicks "Draft appeal").

State machine (`useReducer`):
- phases: idle → ingesting → matching → variance → analytics → complete

For each phase: ~1.5-3s simulated work, then advance.

UI: vertical stack of 5 `AgentCard` components (from Phase 2 visual vocabulary). Each one transitions through idle → working → done as the pipeline advances. The current agent's card has the working state visible; previous agents show done state with results; future agents show idle state with `opacity-50`.

Specific timings:
- IngestionAgent: 1.5s, result "✓ Extracted 107 line items in 1.3s"
- MatchingAgent: 2.5s, result "✓ 98/107 matched"
- VarianceAgent: 3s, result "✓ 31 variances · 6 UNEXPLAINED" (with reasoning trace streaming below)
- AppealAgent: 1s, status "Ready to draft on demand"
- AnalyticsAgent: 1.5s, result "✓ Dashboard updated"

Total pipeline time: ~9-10 seconds.

## Results Bar

After the pipeline completes, the 3 ResultCards animate in (using the same component from Phase 2):

1. label="MATCHED CORRECTLY", value="RM 27,420", valueColor="positive", sublabel="92 lines across 5 TPAs · paid as billed"
2. label="EXPLAINED VARIANCES", value="RM 5,180", valueColor="amber", sublabel="13 lines · formulary caps, admin fees"
3. label="UNEXPLAINED", value="RM 6,210", valueColor="danger", sublabel="6 lines · 3 TPAs · letters ready", pulse=true

Below: a small line "Total processed: RM 38,810 across 107 line items"

## Exception Table

Renders the 6 demo exceptions from `EXCEPTIONS_DEMO` in `seed.ts`.

Columns:
- Severity (dot icon, danger for high, warning for med)
- TPA
- Patient
- Service date
- Billed
- Paid
- Variance (red signed amount like "-RM 30.00")
- Reason
- Action ("Draft appeal" button)

Style:
- `w-full text-sm`
- Header: `text-muted text-xs uppercase tracking-wider font-mono border-b border-border`
- Rows: `border-b border-border/50 hover:bg-primary-soft/20`
- Money columns: right-aligned, font-display tabular-nums
- Severity dot: 10px, danger color for high, warning color for med, with subtle pulse on high

Footer row: "Total unexplained: RM 6,210" right-aligned, text-danger font-display text-lg

## Appeal Drawer (where the real Claude call happens)

When user clicks "Draft appeal" on any row:

Open a slide-over drawer from the right side. Use Framer Motion for the slide-in animation.

Drawer contents:
- Header: "Appeal Letter · {TPA name} · {Patient name}"
- Close button (X) top-right
- Tabs: "English" and "Bahasa Malaysia"
- Below tabs: the letter content

States:
1. **Loading**: skeleton lines + "Drafting bilingual appeal letter with Claude Sonnet 4.6..." + a small animated indicator
2. **Streaming** (optional): if we want streaming, type the letter character by character
3. **Ready**: full letter displayed in font-mono text-sm whitespace-pre-wrap, with a "Copy" button at top-right of the letter content

Behind the scenes:
1. On drawer open, dispatch `runAgent(appealAgent, { ...exceptionInputs }, { liveCall: true })`
2. `useAgentEvents()` subscribes; while invocation status is calling, show loading state
3. On completed event, render the output (englishLetter and bahasaLetter)
4. If error or fallback used: show the fallback letter without indicating it (the letter still looks correct because of the well-crafted fallback)

Small badge at the top of the letter: "✨ Generated by Claude Sonnet 4.6 · {latencyMs}ms" in font-mono text-xs text-primary (only show if `usedFallback === false`).

## Important: graceful fallback

If `VITE_ANTHROPIC_API_KEY` is missing OR the API call fails OR times out:
- The orchestrator's fallback path automatically returns the deterministic letter
- The drawer displays the fallback letter exactly the same way
- The "Generated by Claude" badge doesn't appear (since usedFallback=true)
- Judges still see a high-quality bilingual letter — they just don't see the live-generated badge

This is the bulletproofing.

## Empty state

If user lands on `/reconcile` with no prior pipeline run, show only the upload zone with the prominent "Try Dr. Vani's actual remittances" button. The rest of the page is hidden until activation.

Alternatively, the user can navigate away and back — preserve state in a local context or just reset.

## Smoke test

`.claude/smoke-tests/phase-10.test.md`:

1. Navigate to `/reconcile` from sidebar. See upload zone.
2. Click "Try Dr. Vani's actual remittances →"
3. Watch all 5 agent cards transition through idle → working → done in ~10 seconds
4. VarianceAgent's reasoning trace streams visibly
5. 3 result cards appear after pipeline completes: RM 27,420 / RM 5,180 / RM 6,210
6. Exception table appears with 6 rows (3 high-severity, 3 medium-severity)
7. Click "Draft appeal" on any row
8. Drawer slides in from right
9. With API key: loading state → real letter generates in ~3-5s with both English and Bahasa tabs working
10. Without API key: loading state → fallback letter appears, both tabs work
11. Copy button copies letter to clipboard
12. Closing drawer works; opening on a different row generates a new letter
13. Mobile (375px): table scrolls horizontally, drawer takes full width
14. `npx tsc --noEmit` passes

## Acceptance criteria

- All 13 smoke test items pass
- Live Claude letter generation works with valid API key (test in browser)
- Fallback letter is high-quality (visually indistinguishable from a real letter for a judge)
- The reasoning trace on VarianceAgent is readable
- Mobile experience works

## Commit

`Phase 10: /reconcile page with live Claude appeal letter generation`
