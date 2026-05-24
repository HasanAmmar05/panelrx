# Phase 6 — Cinematic Stages 7-9

**Goal**: Complete the cinematic with the final 3 stages — Resolution, MMA Reveal, and CTA.

**Dependencies**: Phase 5 complete.

**Output**: At `/demo`, the full 9-stage cinematic plays end-to-end.

## Stage 7 — "The Resolution" (8000ms)

`src/cinematic/stages/Stage7Resolution.tsx`

The calm-down stage. After Stage 6's intensity, we land on Dr. Vani's dashboard.

Frame budget:

- 0–1000ms: Stage 6 content fades out smoothly (use AnimatePresence in StageContent.tsx)
- 1000–2500ms: A compact "Dashboard" card fades in center-stage:
  - Container: `bg-surface-elevated border border-border rounded-lg p-6 max-w-2xl`
  - Top: "Klinik Dr Vani · April 2026 summary" in font-display text-lg text-ink
  - 4 KPI cards in `grid grid-cols-2 md:grid-cols-4 gap-3 mt-4`:
    - "Patients seen" → 247
    - "Collected from TPAs" → RM 8,650
    - "Unexplained (appealed)" → RM 6,210
    - "Hours on portals" → 0
  - Each KPI: small label (text-xs text-muted uppercase font-mono) + value (font-display text-3xl, tabular-nums)
  - Each KPI value types in with StreamingText (15ms/char, stagger 200ms between KPIs)
  - Color: "Hours on portals" is 0 → text-positive with subtle emphasis

- 2500–4500ms: Below the KPIs, a narrative banner appears (slide up + fade in):
  - Container: `border-l-2 border-primary pl-4 mt-4 space-y-2`
  - 3 lines stream in (40ms/char each, 200ms between lines), each prefixed with "·":
    - "· Didn't open a single TPA portal"
    - "· Approved 6 appeal letters with one tap each"
    - "· Recovered RM 3,500 in previously-lost deductions"

- 4500–7000ms: A single big line appears below, centered (font-display text-3xl text-ink leading-tight max-w-3xl):
  - "This is what a Malaysian GP clinic looks like when AI does the back office."

- 7000–8000ms: The dashboard card shrinks (scale 1 → 0.6, translates slightly up) preparing for Stage 8's zoom-out

StatusBar: activeAgents=["Orchestrator"], currentAction="month complete · 247 encounters processed"

## Stage 8 — "The MMA Reveal" (6000ms)

`src/cinematic/stages/Stage8MMAReveal.tsx`

The systemic zoom-out moment.

Frame budget:

- 0–1500ms: Dr. Vani's dashboard card (small, from end of Stage 7) sits center. Behind it, a 12-column grid begins to tile in with 999 ghost-cards
- 1500–3500ms: Ghost cards fill the entire screen behind the central card
  - Use `grid grid-cols-12 gap-2` filling the screen
  - Each ghost card: `aspect-square rounded-sm bg-surface border border-border opacity-30`
  - Cards fade in with staggered delay (rows fade in from top to bottom, ~30ms per row)
  - Center 1-2 grid cells remain "Dr. Vani's" card (the highlighted one, full opacity, primary-ring border)
- 3500–5500ms: Big amber text overlays the grid (positioned with z-index above the grid):
  - First line, font-display text-2xl text-amber: "If 1,000 solo GPs ran PanelRx..."
  - Second line (the money shot), font-display text-5xl md:text-6xl text-amber font-semibold tabular-nums, fades in 500ms after first:
    - "RM 6.2 million in unexplained deductions surfaced every month."
  - Third line, text-body text-base mt-3:
    - "The evidence base MMA has been asking for since 2015."

- 5500–6000ms: Hold on the reveal

The text overlay should have a backdrop layer to ensure readability (`bg-background/80` behind the text, padded).

## Stage 9 — "The CTA" (5000ms)

`src/cinematic/stages/Stage9CTA.tsx`

Frame budget:

- 0–1000ms: Stage 8 grid fades. Background returns to clean `bg-background`
- 1000–2500ms: A central card appears (`bg-surface-elevated border border-border rounded-lg p-10 max-w-2xl mx-auto`):
  - Top label, font-mono text-xs text-primary uppercase tracking-widest: "PANELRX"
  - Big text below, font-display text-4xl text-ink: "Pilot Monday. Free for the first 50 PJ clinics."
  - Body paragraph, text-body text-base max-w-xl mt-4:
    - "PanelRx is an autonomous AI operations layer between Malaysian GP clinics and TPAs. Built in 4 hours at Lovable Vibeathon KL · May 24, 2026."

- 2500–3500ms: Two buttons fade in below (flex gap-3 mt-6):
  - Primary: `bg-primary text-background hover:bg-primary-deep px-6 py-3 rounded-md font-medium`
    - Text: "Request pilot →"
  - Outline: `border border-border text-ink hover:border-primary-ring px-6 py-3 rounded-md`
    - Text: "See the supporting product →" (links to `/dashboard` — though we haven't built it yet, the link is fine)

- 3500–5000ms: Hold on CTA with subtle pulse on the primary button (Framer Motion: animate box-shadow with primary ring 0% → 20% → 0% at 2s loop)

When Stage 9 completes (`hasEnded === true`): cinematic does NOT auto-loop. The replay button in ControlBar lets users restart.

## ControlBar update

Add to ControlBar in this phase:
- "Skip to end" button (`ChevronsRight` icon + "End" label) — only visible during stages 1-8, dispatches `SKIP_TO_END`

## Smoke test

`.claude/smoke-tests/phase-06.test.md`:

1. Stage 7 plays after Stage 6: dashboard card appears, KPIs stream in
2. The "Hours on portals: 0" KPI is visibly positive (text-positive color)
3. Narrative banner with 3 bullet points streams in
4. "This is what a Malaysian GP clinic looks like..." line lands
5. Dashboard card shrinks transitioning to Stage 8
6. Stage 8: 12-col grid of ghost cards fills the screen
7. Amber text "If 1,000 solo GPs ran PanelRx..." appears with backdrop
8. "RM 6.2 million" big amber number lands
9. Stage 9: PanelRx CTA card appears with two buttons
10. Primary button has subtle pulse
11. Cinematic ends after Stage 9 (does not loop)
12. Replay button appears in ControlBar, works correctly
13. "Skip to end" button works during stages 1-8
14. Total runtime: ~72 seconds
15. Mobile: all 9 stages adapt cleanly
16. `npx tsc --noEmit` passes

## Acceptance criteria

- All smoke test items pass
- Full 9-stage cinematic plays cleanly start to finish
- Mobile experience is good (test on actual phone if possible)
- No console errors anywhere in the run

## Commit

`Phase 6: cinematic stages 7-9 complete · full cinematic working`
