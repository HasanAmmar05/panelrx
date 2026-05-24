# Phase 12 — /status

**Goal**: Unified claim status tracking across all TPAs. Filterable table, status pills, ageing color codes.

**Dependencies**: Phase 9 complete.

**Output**: At `/status`, see all 200 claims from seed in a unified filterable table.

## File: `src/pages/Status.tsx`

## H1

- "Claim Status" font-display text-3xl
- Sub: "200 claims across 6 panels · last synced 2 mins ago" text-body

## KPI mini-cards (smaller than dashboard, 5 in a row)

Each: small label + count in font-display text-2xl

1. **Pending** — count of status="submitted" or "in_review" — text-amber
2. **Queried** — count of status="queried" — text-warning
3. **Approved** — count of status="approved_full" + "approved_partial" — text-positive
4. **Paid** — count of status="paid" — text-positive
5. **Rejected** — count of status="rejected" — text-danger

Compute from `CLAIMS` array.

## Filter bar

- Payer dropdown (all + 6 individual TPAs)
- Status multi-select (pills you can toggle)
- Date range (default last 120 days)
- Ageing bucket multi-select
- Search input (filters by claim no, patient name, or external ref)

Use `useState` for filter state, derive filtered claims with `useMemo`.

## Main table

Columns:
- ☐ Checkbox (for bulk actions, not functional but visible)
- Claim No (font-mono text-xs)
- Patient
- Service Date
- Payer (with colored dot + short code)
- Gross RM (right-aligned, tabular-nums)
- Paid RM (right-aligned, tabular-nums, gray if 0)
- Status (dot + label)
- Days Outstanding (font-display tabular-nums, color-coded)
- Last Update
- Actions (kebab menu — non-functional but visible)

Styling:
- Sticky header
- Compact row height (~40px)
- Hover row: bg-primary-soft/20
- Status colors:
  - draft: muted
  - submitted: text-amber
  - acknowledged: text-amber
  - in_review: text-amber
  - queried: text-warning
  - approved_full: text-positive
  - approved_partial: text-positive
  - rejected: text-danger
  - paid: text-positive (with check icon)

## Pagination

Show 20 rows per page. Simple pagination at the bottom (Previous · Page X of Y · Next).

## Bulk action bar (when rows checked)

If any rows checked, a sticky bar appears at top:
- "{N} claims selected"
- "Mark as paid" / "Send reminder" / "Export CSV" buttons (non-functional but visible)
- "Deselect all" button

## Alerts banner (top of page)

A subtle banner if there are stuck claims:
- bg-warning-soft border border-warning text-warning
- "3 claims queried in the last 7 days · 1 claim aged >90 days with no movement"
- Has a "Show me" button that pre-filters the table

## Smoke test

`.claude/smoke-tests/phase-12.test.md`:

1. Navigate to `/status` from sidebar
2. 5 KPI cards show correct counts
3. Filter by payer "MiCare" → table shows only MiCare claims
4. Filter by status "queried" → only queried claims shown
5. Search "Aisyah" → shows claims for any patient with that name
6. Pagination works (next/previous)
7. Days outstanding color-coded (red for 90+, amber for 30-60, etc.)
8. Status pills use dot + label (not filled rectangles)
9. Bulk action bar appears when rows checked
10. Mobile (375px): table scrolls horizontally without breaking layout
11. `npx tsc --noEmit` passes

## Acceptance criteria

- All smoke test items pass
- Filters compose correctly (payer AND status AND search)
- Numbers and totals make sense (count matches actual filtered rows)

## Commit

`Phase 12: /status with filterable table and KPI overview`
