# Phase 9 — Seed Data + Product Shell

**Goal**: Build the seed data layer (single source of truth for all mock data) and the ProductShell component used by all product pages.

**Dependencies**: Phase 8 complete (uses agent types).

**Output**: Mock data ready for all pages. ProductShell wraps Dashboard, Eligibility, Submit, Status, Reconcile, Aggregate, Connectors with consistent sidebar + topbar.

## Files to create

### `src/data/types.ts`

Re-export domain types from `.claude/data-contracts.md` — Payer, Clinic, Patient, Claim, etc.

### `src/data/payers.ts`

```typescript
import type { Payer } from "./types";

export const PAYERS: Payer[] = [
  { id: "p_micare", shortCode: "MICARE", legalName: "MiCare Sdn Bhd", payerType: "tpa", avgDaysToPay: 62, accentColor: "primary" },
  { id: "p_mediexp", shortCode: "MEDIEXP", legalName: "MediExpress (Malaysia) Sdn Bhd", payerType: "tpa", avgDaysToPay: 78, accentColor: "amber" },
  { id: "p_ihp", shortCode: "IHP", legalName: "Integrated Health Plans (M) Sdn Bhd", payerType: "tpa", avgDaysToPay: 94, accentColor: "danger" },
  { id: "p_pmcare", shortCode: "PMCARE", legalName: "PMCare Sdn Bhd", payerType: "tpa", avgDaysToPay: 58, accentColor: "muted" },
  { id: "p_selcare", shortCode: "SELCARE", legalName: "Selcare Management Sdn Bhd", payerType: "tpa", avgDaysToPay: 30, accentColor: "positive" },
  { id: "p_pekab40", shortCode: "PEKAB40", legalName: "ProtectHealth PeKa B40", payerType: "public_scheme", avgDaysToPay: 45, accentColor: "positive" },
  { id: "p_spmadani", shortCode: "SPMADANI", legalName: "Skim Perubatan Madani", payerType: "public_scheme", avgDaysToPay: 38, accentColor: "positive" },
  { id: "p_medkad", shortCode: "MEDKAD", legalName: "MedKad Sdn Bhd", payerType: "tpa", avgDaysToPay: 70, accentColor: "amber" },
];
```

### `src/data/seed.ts`

The big data file. Generates 200 claims across the 8 payers with realistic distribution.

```typescript
import { PAYERS } from "./payers";
import type { Clinic, Patient, Claim, ClaimStatus, PaymentBatch, PaymentLine, Reconciliation, Exception } from "./types";

export const CLINIC: Clinic = {
  id: "c_vani",
  name: "Klinik Dr Vani",
  registrationNo: "PMK-1234-WP",
  address: "12 Jalan SS2/24, Petaling Jaya",
  state: "Selangor",
  doctor: "Dr. Vani Subramaniam",
  mmc: "MMC 51234",
  panels: 6,
};

// 20 Malaysian patients with realistic name mix
export const PATIENTS: Patient[] = [
  { id: "pat_001", icNumber: "920101-10-1234", fullName: "Encik Faizal Rahman", dob: "1992-01-01", gender: "M" },
  { id: "pat_002", icNumber: "880515-08-5678", fullName: "Aisyah binti Rahman", dob: "1988-05-15", gender: "F" },
  { id: "pat_003", icNumber: "751230-14-9012", fullName: "Lim Wei Jian", dob: "1975-12-30", gender: "M" },
  { id: "pat_004", icNumber: "920815-08-3456", fullName: "Priya Sundaram", dob: "1992-08-15", gender: "F" },
  { id: "pat_005", icNumber: "830422-14-7890", fullName: "Tan Mei Ling", dob: "1983-04-22", gender: "F" },
  { id: "pat_006", icNumber: "951108-10-1122", fullName: "Muhammad Faiz Aziz", dob: "1995-11-08", gender: "M" },
  { id: "pat_007", icNumber: "780303-08-3344", fullName: "Kumaresan a/l Velu", dob: "1978-03-03", gender: "M" },
  { id: "pat_008", icNumber: "900920-14-5566", fullName: "Nurul Huda Ismail", dob: "1990-09-20", gender: "F" },
  { id: "pat_009", icNumber: "650612-10-7788", fullName: "Wong Chee Kong", dob: "1965-06-12", gender: "M" },
  { id: "pat_010", icNumber: "820815-08-9900", fullName: "Siti Khadijah binti Aziz", dob: "1982-08-15", gender: "F" },
  { id: "pat_011", icNumber: "971124-14-2233", fullName: "Ramesh Kumar", dob: "1997-11-24", gender: "M" },
  { id: "pat_012", icNumber: "850707-10-4455", fullName: "Lee Hui Min", dob: "1985-07-07", gender: "F" },
  { id: "pat_013", icNumber: "920928-08-6677", fullName: "Ahmad Daniel Hakimi", dob: "1992-09-28", gender: "M" },
  { id: "pat_014", icNumber: "800419-14-8899", fullName: "Devi Lakshmi", dob: "1980-04-19", gender: "F" },
  { id: "pat_015", icNumber: "950608-10-1100", fullName: "Chen Yi Hao", dob: "1995-06-08", gender: "M" },
  { id: "pat_016", icNumber: "871231-08-2200", fullName: "Fatimah binti Mohd Yusof", dob: "1987-12-31", gender: "F" },
  { id: "pat_017", icNumber: "770525-14-3300", fullName: "Selvam a/l Krishnan", dob: "1977-05-25", gender: "M" },
  { id: "pat_018", icNumber: "930814-10-4400", fullName: "Aishwarya Pillai", dob: "1993-08-14", gender: "F" },
  { id: "pat_019", icNumber: "890226-08-5500", fullName: "Mohd Iqbal Hassan", dob: "1989-02-26", gender: "M" },
  { id: "pat_020", icNumber: "830311-14-6600", fullName: "Yap Siew Lin", dob: "1983-03-11", gender: "F" },
];

// Generate 200 claims deterministically (same seed → same data every load)
function generateClaims(): Claim[] {
  const claims: Claim[] = [];
  // ... deterministic generator using seeded random
  // Distribution: 35% MiCare, 25% MediExpress, 15% IHP, 10% PMCare, 5% SelCare, 5% PeKa B40, 3% Madani, 2% MedKad
  // Status distribution: 50% paid, 20% pending, 15% queried, 10% rejected, 5% partial_paid
  // Service date: random within last 120 days
  // Gross amount: 35-280 RM range (typical Malaysian GP visit)
  return claims;
}

export const CLAIMS = generateClaims();

// 5 demo remittance payment batches
export const PAYMENT_BATCHES: PaymentBatch[] = [
  { id: "pb_micare_mar", payerId: "p_micare", remittanceNo: "MC-REM-2026-03-00184", remittanceDate: "2026-03-15", totalPaidRm: 8450, sourceFile: "MiCare_remit_Feb2026.pdf", lineCount: 27 },
  { id: "pb_mediexp_mar", payerId: "p_mediexp", remittanceNo: "ME-REM-26-03-00921", remittanceDate: "2026-03-20", totalPaidRm: 11210, sourceFile: "MediExpress_remit_Feb2026.pdf", lineCount: 32 },
  { id: "pb_ihp_feb", payerId: "p_ihp", remittanceNo: "IHP-REM-2026-02-447", remittanceDate: "2026-02-28", totalPaidRm: 6890, sourceFile: "IHP_remit_Jan2026.pdf", lineCount: 19 },
  { id: "pb_pmcare_mar", payerId: "p_pmcare", remittanceNo: "PMC-REM-26-03-1102", remittanceDate: "2026-03-18", totalPaidRm: 4320, sourceFile: "PMCare_remit_Feb2026.pdf", lineCount: 14 },
  { id: "pb_pekab40_mar", payerId: "p_pekab40", remittanceNo: "PEKA-RX-2026-03-887", remittanceDate: "2026-03-10", totalPaidRm: 2100, sourceFile: "PeKaB40_remit_Feb2026.pdf", lineCount: 15 },
];

// 6 "unexplained" exception scenarios (the juicy ones shown in /reconcile)
export const EXCEPTIONS_DEMO = [
  { tpa: "MiCare", patient: "Lim S.K.", date: "14-Feb-2026", billed: 65, paid: 35, reason: "admin adjustment (no clause cited)", severity: "high" },
  { tpa: "MediExpress", patient: "Aisyah Rahman", date: "03-Feb-2026", billed: 85, paid: 78, reason: "8% panel admin fee — not in contract", severity: "high" },
  { tpa: "MediExpress", patient: "Tan Mei Ling", date: "11-Feb-2026", billed: 120, paid: 110, reason: "8% panel admin fee — not in contract", severity: "high" },
  { tpa: "IHP", patient: "Kumaresan Velu", date: "08-Feb-2026", billed: 95, paid: 67, reason: "formulary substitution — drug IS on formulary", severity: "med" },
  { tpa: "IHP", patient: "Priya Sundaram", date: "12-Feb-2026", billed: 110, paid: 77, reason: "formulary substitution — drug IS on formulary", severity: "med" },
  { tpa: "IHP", patient: "Muhammad Faiz", date: "19-Feb-2026", billed: 78, paid: 55, reason: "formulary substitution — drug IS on formulary", severity: "med" },
];
```

### `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatRM(amount: number, options?: { sign?: boolean }): string {
  const formatted = amount.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = options?.sign && amount > 0 ? "+" : "";
  return `${prefix}RM ${formatted}`;
}

export function daysAgo(isoDate: string): number {
  const d = new Date(isoDate);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDateMY(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
```

## Product Shell

### `src/shell/ProductShell.tsx`

Wraps all product pages with a consistent sidebar + topbar.

```typescript
type ProductShellProps = {
  children: React.ReactNode;
};

export function ProductShell({ children }: ProductShellProps) {
  return (
    <div className="min-h-screen bg-background text-ink flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

### `src/shell/Sidebar.tsx`

Left sidebar, 240px wide on desktop, hamburger on mobile.

Nav items (with Lucide icons):
- `LayoutDashboard` → Dashboard → `/dashboard`
- `FileCheck` → Eligibility → `/eligibility`
- `Send` → Submit claim → `/submit`
- `Clock` → Status → `/status`
- `Upload` → Reconcile → `/reconcile`
- `Globe` → Aggregate → `/aggregate`
- `Settings` → Connectors → `/settings/connectors`

Top of sidebar:
- PanelRx wordmark (small, primary teal)
- Clinic name "Klinik Dr Vani" below in font-mono text-xs text-muted

Bottom of sidebar:
- Small text "Pilot v0.1 · Vibeathon KL"
- Tiny status dot showing "● 6 panels connected" in text-positive

Active link: `bg-primary-soft text-primary` with `border-l-2 border-primary` accent.

### `src/shell/TopBar.tsx`

Top bar above main content:
- Left: page title (passed via context or prop)
- Right: user avatar (initials "DV" in a circle, primary-soft bg)
- Optional middle: search input

Height: 56px. Border-bottom: border-border.

## Update routing

Update `src/App.tsx`:

```typescript
<Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/demo" element={<Engine />} />
  <Route path="/showcase" element={<Showcase />} />
  <Route path="/agents-debug" element={<AgentsDebug />} />
  
  {/* Product pages — wrapped in ProductShell */}
  <Route path="/dashboard" element={<ProductShell><Dashboard /></ProductShell>} />
  <Route path="/eligibility" element={<ProductShell><Eligibility /></ProductShell>} />
  <Route path="/submit" element={<ProductShell><Submit /></ProductShell>} />
  <Route path="/status" element={<ProductShell><Status /></ProductShell>} />
  <Route path="/reconcile" element={<ProductShell><Reconcile /></ProductShell>} />
  <Route path="/aggregate" element={<ProductShell><Aggregate /></ProductShell>} />
  <Route path="/settings/connectors" element={<ProductShell><Connectors /></ProductShell>} />
</Routes>
```

For now, each product page is a stub: `<div>Coming soon · phase NN</div>`. They'll be filled in later phases.

## Smoke test

`.claude/smoke-tests/phase-09.test.md`:

1. Open `/dashboard` — see sidebar on left with all nav items, topbar at top, "Coming soon" content
2. All sidebar nav links route correctly (and show their own stub pages)
3. Active nav item highlights with primary accent
4. PanelRx wordmark + "Klinik Dr Vani" shows in sidebar
5. Mobile (375px): sidebar collapses to hamburger menu
6. `formatRM(1234.5)` returns "RM 1,234.50"
7. Seed data loads: `CLAIMS.length === 200`, `PATIENTS.length === 20`, `PAYERS.length === 8`
8. Claims have realistic distribution (verify in console: ~35% MiCare, ~25% MediExpress, etc.)
9. `npx tsc --noEmit` passes

## Acceptance criteria

- All smoke test items pass
- Sidebar is visually consistent with the cinematic's design language
- Mobile sidebar works (hamburger opens drawer)
- No layout shifts when navigating between product pages

## Commit

`Phase 9: seed data, product shell with sidebar + topbar`
