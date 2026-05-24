# Phase 15 — /submit

**Goal**: Single-screen interface for submitting a consultation claim to all eligible panels.

**Dependencies**: Phase 9 complete.

**Output**: At `/submit`, staff fills encounter data → SubmissionAgent broadcasts to selected TPAs → 3 acknowledgement toasts.

Tier 3 page — animated mock. ~20 minutes.

## File: `src/pages/Submit.tsx`

## H1

- "Submit claim" font-display text-3xl
- Sub: "One form. Broadcast to every eligible panel. SubmissionAgent handles the per-TPA mapping." text-body

## Two-column layout

`grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8`

### Left column (col-span-2): the form

`bg-surface/60 rounded-lg border border-border p-6 space-y-5`

Fields (each with mono uppercase label):

1. **Patient** — dropdown selecting from `PATIENTS` seed (default: Encik Faizal Rahman). Display shows "920101-10-1234 · Encik Faizal Rahman"

2. **Encounter date** — date input (default: today)

3. **Diagnosis** — text input with autocomplete suggestions (just show 3-4 hardcoded examples below: "Acute pharyngitis (J02.9)", "Hypertension (I10)", "Type 2 diabetes (E11.9)"). Default: "Acute pharyngitis (J02.9)"

4. **Prescriptions** — textarea, multi-line. Default value:
   ```
   Paracetamol 500mg × 10 tabs
   Amoxicillin 500mg × 15 caps
   ```

5. **MC days** — number input (default: 2)

6. **Consultation fee** — number input (default: 35.00, prefix "RM")

7. **Send to panels** — checkbox group with each panel:
   - ☑ MiCare (eligible)
   - ☑ MediExpress (eligible)
   - ☐ IHP (eligible · low limit RM 500)
   - ☐ PMCare (not eligible · employee resigned)
   - Show eligibility status as inline notes; PMCare auto-disabled

8. Submit button:
   - Primary teal, large
   - Text: "Broadcast claim to {N} panels →"
   - The N updates as checkboxes change

### Right column (col-span-1): preview + status

`bg-surface/60 rounded-lg border border-border p-6 sticky top-8`

**Canonical claim preview** (mono):
```
PATIENT: Encik Faizal Rahman
IC: 920101-10-1234
DATE: 24 May 2026
DX: J02.9 · Acute pharyngitis
RX:
  - Paracetamol 500mg × 10
  - Amoxicillin 500mg × 15
MC: 2 days
CONSULTATION: RM 35.00
TOTAL: RM 35.00
```

Updates live as form fields change. font-mono text-xs.

Below preview:
- Small label: "Canonical schema · maps to each panel's required fields automatically" in text-xs text-muted

## On submit

Animation sequence (~4 seconds):

1. **t=0**: Form fields lock (opacity 0.6, pointer-events: none)
2. **t=200ms**: Status banner appears at top of left column: "SubmissionAgent · preparing canonical payload..." in font-mono text-sm with subtle pulse
3. **t=1000ms**: Banner updates: "SubmissionAgent · broadcasting to 2 panels via API..."
4. **t=1500ms onwards**: Toast notifications appear in bottom-right, one per panel (stagger 600ms):
   - Toast 1: "✓ MiCare acknowledged · Ref MC-2026-001847 · in_review" (positive accent)
   - Toast 2: "✓ MediExpress acknowledged · Ref ME-26-003291 · pending" (positive accent)
5. **t=3500ms**: Status banner updates to success: "✓ Claim broadcast to 2 panels · audit trail logged"
6. **t=4000ms**: Show "Submit another claim" button + "View status →" button linking to `/status`

Toasts:
- Position: fixed bottom-6 right-6
- Stack vertically with gap-2
- Each toast: bg-surface-elevated border-l-2 border-positive rounded-md px-4 py-3 min-w-72
- Lucide CheckCircle icon 16px text-positive on the left
- Text in font-mono text-xs
- Auto-dismiss after 6 seconds

## Smoke test

`.claude/smoke-tests/phase-15.test.md`:

1. Navigate to `/submit`
2. Form pre-filled with default values
3. Right column shows live canonical claim preview
4. Editing diagnosis updates preview immediately
5. Checking/unchecking panel checkboxes updates submit button text "Broadcast to N panels"
6. PMCare checkbox is disabled with "not eligible" hint
7. Click submit → form locks, status banner appears
8. 2 toasts appear in bottom-right with TPA names and ref numbers
9. Success state after ~4 seconds
10. "Submit another" resets form
11. Mobile: form and preview stack vertically (preview no longer sticky)
12. `npx tsc --noEmit` passes

## Acceptance criteria

- Form preview updates in real time
- Submit animation feels deliberate, not instant
- Toast notifications visually polished

## Commit

`Phase 15: /submit with form, live preview, and TPA broadcast animation`
