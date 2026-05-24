# Phase 16 — /settings/connectors

**Goal**: The TPA connector configuration page. Shows the §7 connector framework — proves PanelRx scales from 1 to 55+ TPAs via config, not custom code.

**Dependencies**: Phase 9 complete.

**Output**: At `/settings/connectors`, table of 8 TPAs with config drawer per connector.

Tier 3 page — read-only display, no real config logic. ~15 minutes.

## File: `src/pages/Connectors.tsx`

## H1

- "Connectors" font-display text-3xl
- Sub: "Each TPA connector is a configuration module. New TPAs are added through config, not custom code. Built to scale from 6 to 55+ payers." text-body

## Stats row (top)

`flex gap-6 mt-6`

3 small inline stats:
- "Active connectors: **6**"
- "Available in registry: **55**" (small text — references MOH 55 ITOs)
- "Avg setup time: **47 min**"

## Connector table

`bg-surface/60 rounded-lg border border-border overflow-hidden mt-8`

Columns:
- ● Status (dot)
- TPA short code
- Legal name
- Auth method
- Eligibility check
- Submission
- Statement format
- Avg latency
- Actions ("Configure" button)

Rows (from `PAYERS` seed; expand each with config details):

| Status | Code | Legal name | Auth | Eligibility | Submit | Statement | Latency | Action |
|---|---|---|---|---|---|---|---|---|
| ● | MICARE | MiCare Sdn Bhd | API key + portal | API | API | PDF (OCR) | 1.2s | Configure |
| ● | MEDIEXP | MediExpress (Malaysia) | OAuth 2.0 | API | API | XLSX | 0.9s | Configure |
| ● | IHP | Integrated Health Plans | Username + password | Portal (RPA) | Portal (RPA) | PDF (OCR) | 4.7s | Configure |
| ● | PMCARE | PMCare Sdn Bhd | API key | API | API | XLSX | 1.5s | Configure |
| ● | SELCARE | Selcare Management | API key | API | API | PDF (text) | 0.8s | Configure |
| ● | MEDKAD | MedKad Sdn Bhd | Hotline + portal | Hotline | Portal | PDF (OCR) | 6.2s | Configure |
| ● | PEKAB40 | ProtectHealth PeKa B40 | SSO Gov | API | API | CSV | 1.1s | Configure |
| ● | SPMADANI | Skim Perubatan Madani | SSO Gov | API | API | CSV | 1.0s | Configure |

Status dot:
- All active = primary teal
- For "available but not connected" (hypothetical) future rows = muted

Style:
- Header row: `text-muted text-xs uppercase tracking-wider font-mono border-b border-border`
- Body rows: `text-body text-sm border-b border-border/50 hover:bg-primary-soft/20`
- Latency column: font-mono tabular-nums right-aligned
- Actions: ghost button "Configure" with `Settings` icon

## "Configure" drawer (when clicked)

Slide-over drawer from right (~600px wide on desktop, full-width on mobile).

Header: "Configure {TPA name} connector" close button top-right.

Content:
- Section "Connection"
  - Auth method dropdown (shows current method, would be editable in real product)
  - API endpoint URL (read-only, mock URL like "https://api.micare.com.my/v2")
  - Connection status: "● Connected · last ping 2 mins ago"
  - Test connection button (mock — click shows "✓ All endpoints responding" toast)

- Section "Schema mapping"
  - List of canonical fields → TPA fields (read-only display):
    - "patient_ic" → "memberIdentifier"
    - "diagnosis_code" → "icd10"
    - "consultation_fee" → "fee_amount_myr"
    - "prescriptions[]" → "items[]"
  - Small text: "12 fields mapped · 0 unmapped · 100% coverage"

- Section "Webhooks"
  - List of webhook events being listened for: "claim.acknowledged", "claim.queried", "claim.paid", "remittance.posted"

- Section "Operational"
  - SLA: "Pay within {avgDaysToPay} days (panel agreement)"
  - Cost per call: "RM 0.02 / eligibility, RM 0.05 / submission"
  - Monthly volume: "fake number like 1,247 calls"

Bottom: "Save changes" + "Disconnect" buttons (no actual save logic — just UI)

## Add new connector section

Below the table:
- `bg-surface-elevated border border-dashed border-border rounded-lg p-6 text-center mt-8`
- Lucide `Plus` icon (32px, text-primary)
- Text: "Add new connector"
- Sub: "47 additional TPAs in the registry. Configure auth, schema mapping, webhooks — typically 45-60 min per new connector." text-body text-sm

A button: "Browse registry →" (non-functional — clicks show toast "Registry coming in pilot release")

## Smoke test

`.claude/smoke-tests/phase-16.test.md`:

1. Navigate to `/settings/connectors` from sidebar
2. Stats row shows: 6 active, 55 available, 47 min avg
3. Table renders with all 8 connectors
4. Status dots all show primary (active)
5. Click "Configure" on MiCare → drawer slides in from right
6. Drawer shows connection details, schema mapping, webhooks
7. "Test connection" button shows success toast
8. Close drawer → returns to table
9. "Add new connector" zone at bottom with browse button
10. Mobile: table scrolls horizontally, drawer is full-width
11. `npx tsc --noEmit` passes

## Acceptance criteria

- Table renders all 8 connectors with consistent styling
- Drawer animation smooth (Framer Motion slide-in from right)
- Stats numbers feel credible

## Commit

`Phase 16: /settings/connectors with config drawer per TPA`
