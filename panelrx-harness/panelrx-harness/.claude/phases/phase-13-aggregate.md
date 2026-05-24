# Phase 13 — /aggregate (MMA Reveal)

**Goal**: The systemic zoom-out. Full-page version of the "1,000 clinics" reveal that appeared in cinematic Stage 8.

**Dependencies**: Phase 9 complete.

**Output**: At `/aggregate`, see policy-grade evidence dashboard showing what 1,000 PanelRx clinics would surface.

## File: `src/pages/Aggregate.tsx`

## Top banner

Full-width banner at top of main content:
- `bg-surface-elevated border-l-4 border-primary px-8 py-6`
- Small label: "POLICY-GRADE EVIDENCE" in font-mono text-xs uppercase tracking-widest text-primary
- H1: "If 1,000 clinics like Dr. Vani's ran PanelRx..." in font-display text-3xl text-ink
- Sub: "This is the data the Malaysian Medical Association has been demanding since 2015. Extrapolated from Dr. Vani's 30-day actuals with realistic variance bands." in text-body text-base

## Hero numbers (3 massive cards in grid-cols-3)

Each card uses ResultCard with bigger sizing (override the default text-5xl to text-6xl).

1. **"Outstanding right now"**
   - Value: **RM 47.8 million**
   - Color: amber
   - Sub: "across 1,000 Malaysian GP clinics"
   - Tiny footnote: "extrapolated from RM 47,830 per Dr. Vani × 1,000"

2. **"Unexplained deductions per month"**
   - Value: **RM 6.2 million**
   - Color: danger
   - Sub: "≈ 13% of all TPA payments to GPs"
   - Tiny: "the figure MMA has been trying to quantify since 2015"

3. **"Hours lost per month chasing TPAs"**
   - Value: **11,000 hours**
   - Color: ink
   - Sub: "≈ RM 1.65 million in wasted GP time"
   - Tiny: "at MMA average GP hourly opportunity cost"

## Two-column charts section

`grid grid-cols-2 gap-6 mt-12`

### Left chart — "Average days to pay, by TPA"

Recharts horizontal bar chart, sorted descending. Data:
- IHP: 94 days (text-danger)
- MediExpress: 78 days (text-warning)
- MiCare: 62 days (text-amber)
- PMCare: 58 days (text-amber)
- MedKad: 70 days (text-amber)
- PeKa B40: 45 days (text-positive) — label "public scheme"
- Skim Madani: 38 days (text-positive) — label "public scheme"
- Selcare: 30 days (text-positive)

Caption beneath: "Public schemes and Selcare pay in 30-45 days. Private TPAs take 58-94 days." in text-body text-sm italic

### Right chart — "Top 5 deduction reasons given"

Horizontal bar chart. Data (percentages):
- "Admin adjustment" (unexplained): 31% → text-danger
- "Formulary substitution": 22% → text-warning
- "Panel admin fee (8-10%)": 18% → text-amber
- "Duplicate claim": 14% → text-muted
- "Out of network drug": 9% → text-muted
- "Other": 6% → text-muted

Caption: "53% of deductions fall in the top two reasons — both flagged by GP groups in 2024-2026 reporting." in text-body text-sm italic

## Citations section

`bg-surface/40 border border-border rounded-lg p-6 mt-12`

Header: "Sources" in font-mono text-xs uppercase tracking-widest text-muted

List (as small "chip" cards in flex flex-wrap gap-2):
- "MMA: 3-6 month payment delays, sometimes 1-2 years — Free Malaysia Today, 2025"
- "FPMPAM: clinics described as 'unwilling creditors and unpaid financiers of TPA operations' — November 2025"
- "TPAs slicing up to 10% per claim — CodeBlue, November 2025"
- "Health DG ordered all MCOs to file into national TPA registry by 31 January 2026"
- "MMC formally banned fee-splitting by TPAs — May 2026"
- "Over 12,000 GP clinics nationwide, 80% solo practitioners — MMA"

Each chip:
- `bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-body inline-flex items-center gap-1.5`
- Tiny `ArrowUpRight` icon at the end (signals external reference, but doesn't link anywhere for the demo)

## Bottom CTA section

`bg-primary text-background rounded-lg p-8 mt-12`

H2: "MMA can have this data tomorrow." in font-display text-2xl
Body: "Every PanelRx clinic can opt-in to anonymized aggregate reporting. K-anonymity ≥ 10. Patient identifiers never leave the clinic. This is the regulatory evidence base Malaysian healthcare has been waiting ten years for." in text-base text-background/90

Two buttons side by side:
- "Request MMA aggregate export →" (bg-background text-primary px-6 py-3 rounded-md) — clicking shows a small toast "Available for MMA partners in pilot"
- "Pilot PanelRx in your clinic →" (border border-background/30 text-background px-6 py-3 rounded-md) — links to a future /pilot page or shows a contact prompt

## Methodology footnote

Below the CTA, a small block:
- "Methodology" header in font-mono text-xs uppercase text-muted
- Body: "Aggregate figures extrapolate from Klinik Dr Vani's actual 30-day data, with realistic variance bands ±15% per TPA. Confidence intervals not shown for clarity. Not actual MMA-published data — illustrative of what PanelRx aggregate reporting would enable."
- Style: text-xs text-muted max-w-3xl

This honesty note prevents anyone from confronting you on data validity.

## Smoke test

`.claude/smoke-tests/phase-13.test.md`:

1. Navigate to `/aggregate` from sidebar
2. Top banner with "If 1,000 clinics..." renders
3. 3 hero numbers display: RM 47.8M / RM 6.2M / 11,000 hours
4. RM 47.8M is in amber, RM 6.2M in danger
5. Days-to-pay chart shows TPAs sorted with IHP at 94d worst, Selcare at 30d best
6. Deduction reasons chart shows top 5 reasons
7. Sources section has 6 citation chips
8. CTA banner at bottom with two buttons
9. "Request MMA aggregate export" shows toast on click
10. Methodology footnote is visible (honest disclosure)
11. Mobile: hero numbers stack, charts stack
12. `npx tsc --noEmit` passes

## Acceptance criteria

- All smoke test items pass
- The RM 47.8M number is genuinely impactful (big enough on screen)
- Charts are readable on mobile
- Citation chips look credible

## Commit

`Phase 13: /aggregate MMA reveal with hero numbers, charts, citations`
