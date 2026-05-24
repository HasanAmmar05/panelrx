# Phase 11 — /dashboard

**Goal**: The clinic's daily operational dashboard. Real seeded data, ageing chart, KPIs, top oldest claims.

**Dependencies**: Phase 9 (seed data + shell) complete.

**Output**: At `/dashboard`, Dr. Vani sees her current TPA position at a glance.

## Page structure

```
┌─────────────────────────────────────────────────┐
│ "Selamat pagi, Dr. Vani."                       │
│ "Here's where your money is, this morning"      │
├─────────────────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                     │
│ │ KPI│ │ KPI│ │ KPI│ │ KPI│  (4 cards)          │
│ └────┘ └────┘ └────┘ └────┘                     │
├─────────────────────────────────────────────────┤
│ CTA banner: "Drop your monthly TPA              │
│ remittances → instant reconciliation"           │
├─────────────────────────────────────────────────┤
│ "Outstanding by panel" stacked bar chart        │
│ (one row per TPA, segments by ageing bucket)    │
├─────────────────────────────────────────────────┤
│ "Top 5 oldest claims" table                     │
└─────────────────────────────────────────────────┘
```

## File: `src/pages/Dashboard.tsx`

## H1 section

- Heading: "Selamat pagi, Dr. Vani." in font-display text-3xl text-ink (uses BM greeting — small detail)
- Subhead: "Here's where your money is, this morning." in text-body text-base
- Tiny: "Last synced 2 mins ago · 6 panels active" in font-mono text-xs text-muted

## KPI Cards (grid-cols-4 gap-4)

Each KPI card:
- bg-surface border border-border rounded-lg p-5
- Small label in font-mono text-xs uppercase tracking-wide text-muted
- Big value in font-display text-3xl tabular-nums (color varies)
- Trend indicator below in text-xs text-amber

Cards (compute these from seed data dynamically):

1. **"Outstanding"** — sum of all unpaid claims
   - Value: RM 47,830 in text-amber
   - Trend: "+RM 2,140 vs last month"

2. **"Avg days to pay"**
   - Value: 84 days in text-ink
   - Trend: "MMA target: 30 days" in text-muted

3. **"Unexplained deductions"**
   - Value: RM 6,210 in text-danger
   - Trend: "6 appeals ready to send"

4. **"Active panels"**
   - Value: 6 TPAs in text-primary
   - Trend: "Selcare: best · IHP: worst"

## CTA banner

`bg-primary text-background rounded-lg px-6 py-4 flex items-center justify-between`

Left: 
- Lucide `Upload` icon
- Text: "Drop your monthly TPA remittances for instant reconciliation"

Right:
- Button: "Go to Reconcile →" white text on primary background, links to `/reconcile`

## Outstanding by panel chart

Section title: "Outstanding by panel" in font-display text-lg

Compute from seed: for each payer, sum claims grouped by ageing bucket (0-30, 31-60, 61-90, 91-180, 180+).

Render as stacked horizontal bars (use Recharts `BarChart` with `layout="vertical"` and `stackId`):
- Y-axis: payer short code (MICARE, MEDIEXP, etc.)
- X-axis: RM amount, tabular-nums
- 5 segments per bar, amber → orange → red ramp:
  - 0-30 days: amber-300
  - 31-60: amber-500
  - 61-90: orange-500
  - 91-180: red-500
  - 180+: red-700
- Total RM displayed at end of each bar
- Hover: tooltip showing exact breakdown

If Recharts is complex, an alternative: build the bars with pure divs (`flex` segments with widths proportional to amounts).

## Top 5 oldest claims table

Section title: "Top 5 oldest claims" in font-display text-lg

Compute from seed: sort by daysOutstanding desc, take top 5.

Columns:
- Claim No (font-mono text-xs)
- Patient
- Date (formatted "14 Feb 2026")
- Payer (with colored dot)
- Status pill (small dot + text)
- Days outstanding (font-display tabular-nums, color-coded: amber 30-60, orange 60-90, red 90+)
- Amount RM (right-aligned, tabular-nums)

Each row clickable → opens `/status?claim={claimNo}` (just navigation for now; full claim detail is in /status).

## Empty state

Won't trigger in normal seeded usage, but if claims array is empty:
- Centered Lucide `Inbox` icon (40px, muted)
- "No claims yet. Drop a remittance PDF to begin."

## Layout

- `max-w-7xl mx-auto`
- `space-y-8` between sections
- Each section: `bg-surface/60 rounded-lg border border-border p-6` (subtle container)

## Smoke test

`.claude/smoke-tests/phase-11.test.md`:

1. Navigate to `/dashboard` from sidebar
2. "Selamat pagi, Dr. Vani." heading renders
3. 4 KPI cards display with correct values:
   - Outstanding shows RM 47,830 (or close — depends on seed)
   - Avg days, unexplained, active panels all populated
4. CTA banner shows "Drop your monthly TPA remittances..." and routes to `/reconcile` on click
5. Stacked bar chart renders showing outstanding by panel with ageing buckets
6. Top 5 oldest claims table populated, sortable by days outstanding desc
7. Status pills use dot + label (not filled)
8. Mobile (375px): KPIs stack to 2 columns, chart scrolls horizontally, table is responsive
9. All money figures use tabular-nums
10. `npx tsc --noEmit` passes

## Acceptance criteria

- All smoke test items pass
- Numbers look defensible (no obvious math errors in the seed-derived figures)
- Chart legibility is good (judges should understand it without explanation)

## Commit

`Phase 11: /dashboard with KPIs, ageing chart, and oldest claims`
