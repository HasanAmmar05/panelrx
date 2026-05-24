# Phase 7 — Landing Page with Pulsing CTA

**Goal**: Build the landing page at `/` — the entry point judges hit first.

**Dependencies**: Phase 6 complete (cinematic working end-to-end at `/demo`).

**Output**: At `/`, see a compelling landing page that drives judges to click the "Watch what happens..." CTA.

## File to create

### `src/pages/Landing.tsx`

Update `src/App.tsx` so `/` renders `<Landing />` instead of redirecting to `/demo`.

## Layout

Split hero, full viewport height (`min-h-screen`).

Container: `grid grid-cols-1 md:grid-cols-5 gap-8 px-8 md:px-16 py-12 max-w-7xl mx-auto items-center min-h-screen`

### Left half (`md:col-span-3`)

**Top label**:
- `font-mono text-xs text-primary tracking-widest uppercase`
- Text: "FOR MALAYSIAN SOLO GP CLINICS · LOVABLE VIBEATHON KL · MAY 24, 2026"

**Headline**:
- `font-display text-3xl md:text-5xl text-ink font-semibold leading-tight max-w-xl mt-8`
- Text: "Dr. Vani is owed RM 47,830 today. She doesn't know who took what."

**Subhead**:
- `font-sans text-lg text-body leading-relaxed max-w-lg mt-6`
- Text: "PanelRx is an autonomous AI operations layer between the 9,600+ solo Malaysian GP clinics and their 30+ third-party administrators. Eligibility, submission, follow-up, reconciliation — all handled by 8 AI agents working as her shadow back office."

**Stats row**:
- `mt-6 flex flex-wrap items-center gap-2 text-sm font-mono text-body`
- Three mini-stats separated by middle dots:
  - "3-6 month payment delays"
  - "·"
  - "up to 10% deducted per claim"
  - "·"
  - "RM 1.4B+ stuck industry-wide"
- Below in `text-xs text-muted mt-1.5`:
  - "MMA, FPMPAM, CodeBlue · 2024–2026"

**THE CTA** (the most important element on the page):

Wrapper with pulsing ring:
- `relative inline-block mt-10`
- Pulsing ring: `absolute inset-0 rounded-md border-2 border-primary`
- Animate via Framer Motion: `animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0, 0.4] }}` with `transition={{ duration: 2, repeat: Infinity }}`

Button itself:
- `relative bg-primary text-background hover:bg-primary-deep px-8 py-5 rounded-md font-display text-xl font-semibold flex items-center gap-3 transition-colors`
- Lucide `Play` icon (filled, 22px) on the left
- Text: "Watch what happens when a patient walks in"
- Lucide `ArrowRight` icon on the right
- onClick navigates to `/demo`

Below CTA:
- `mt-3 text-xs text-muted font-mono`
- Text: "90-second autonomous workflow · no signup · click to play"

**Secondary CTAs** (smaller, below):
- `mt-6 flex flex-wrap gap-3`
- "View dashboard →" ghost button linking to `/dashboard` (will be placeholder until Phase 11)
- "View MMA aggregate →" ghost button linking to `/aggregate` (until Phase 13)
- Style: `text-body hover:text-primary text-sm font-mono px-3 py-1.5 transition-colors`

**Footer text** at bottom of left half:
- `mt-12 text-xs text-muted font-mono`
- Text: "Built with Lovable · Claude Sonnet 4.6 + Haiku 4.5 on AWS Bedrock · Strands multi-agent · Supabase"

### Right half (`md:col-span-2`, hidden on mobile or shown smaller below)

The LIVE DEMO PREVIEW — a looping miniature of the cinematic.

Wrapper:
- `relative w-full max-w-md mx-auto hidden md:block`

Browser chrome container:
- `rounded-xl border border-border-strong bg-surface-elevated overflow-hidden shadow-2xl shadow-black/50`
- (One exception to the no-shadow rule — the elevated browser chrome looks better with a soft shadow on dark)

Chrome bar (h-8):
- `flex items-center justify-between px-3 h-8 bg-surface-solid border-b border-border`
- Left: 3 dots (red, amber, green, each 8px rounded-full)
- Center: small URL bar showing "panelrx.app/demo" in font-mono text-xs text-muted
- Right: small badge "● LIVE DEMO" — `text-xs text-danger font-mono flex items-center gap-1` with subtle pulse on the dot

Content area (h-96 / 384px):
- `relative p-4 h-96 overflow-hidden`
- Hosts the looping mini-cinematic state machine

### Mini-cinematic loop (internal state machine)

This is a SEPARATE state machine from the main cinematic — purely for the landing preview. 16-second loop:

State machine `useReducer` with sub-phases:
- 0-2s: 3 small file cards animate in (vertical list, stagger 600ms)
- 2-9s: 3 mini agent rows animate in sequence (smaller AgentCards):
  - IngestionAgent · Haiku 4.5 · "✓ 27 lines extracted"
  - MatchingAgent · Sonnet 4.6 · "✓ 25/27 matched"
  - VarianceAgent · Sonnet 4.6 · StreamingText snippet "MiCare deducted RM 30. No clause. → UNEXPLAINED" (with "UNEXPLAINED" in text-danger)
- 9-13s: 3 smaller ResultCards animate in (`min-w-0` instead of `min-w-64`, scaled down):
  - "MATCHED" → RM 932 positive
  - "EXPLAINED" → RM 380 amber
  - "UNEXPLAINED" → RM 6,210 danger (with subtle pulse)
- 13-15s: Hold on results
- 15-16s: Fade out, loop back

Use a `setInterval` running every 100ms that increments an elapsed counter, mod 16000, then derives sub-phase.

Hover behavior: when user hovers, pause the loop. When unhovered, resume.

Compact agent card variant:
- `flex items-center gap-2 px-2 py-1.5 rounded-md border border-border bg-surface text-xs`
- Smaller icon (14px), abbreviated text
- Use a `<MiniAgentCard>` component co-located in Landing.tsx (or extract to components/MiniAgentCard.tsx if it grows)

### Mobile fallback

On screens below md, hide the preview entirely (it's optional). The hero text + pulsing CTA carries the page on mobile.

## Smoke test

`.claude/smoke-tests/phase-07.test.md`:

1. Open `/` — landing page renders without errors
2. Headline text reads correctly
3. The "Watch what happens..." CTA has the visible pulsing ring animation
4. Clicking the CTA navigates to `/demo` and the cinematic starts at Stage 1
5. Secondary CTAs link to `/dashboard` and `/aggregate` (will show 404 or placeholder — that's fine for now)
6. The live demo preview on the right shows the 16s loop
7. PDF cards → agent rows → result cards loop correctly
8. The "UNEXPLAINED" text in the VarianceAgent streaming is highlighted in danger
9. Hovering the preview pauses the loop; unhovering resumes
10. The "● LIVE DEMO" badge in the chrome bar pulses
11. Mobile (375px): hero text wraps cleanly, CTA visible above the fold, preview hidden
12. No horizontal scroll on any screen size
13. `npx tsc --noEmit` passes

## Acceptance criteria

- All smoke test items pass
- The pulsing ring on the CTA is visible and inviting (not annoying)
- The landing page feels specifically designed for PanelRx, not a generic SaaS template
- Take a screenshot for the OG image (used in Phase 17)

## Commit

`Phase 7: landing page with pulsing CTA and looping preview`
