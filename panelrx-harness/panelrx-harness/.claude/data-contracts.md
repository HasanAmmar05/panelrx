# Data Contracts

The shape of every data structure used across PanelRx. These types are imported from `src/data/types.ts` and `src/lib/types.ts`.

## Domain types (src/data/types.ts)

```typescript
export type PayerType = "tpa" | "public_scheme" | "direct_insurer";

export type Payer = {
  id: string;
  shortCode: string;         // e.g. "MICARE"
  legalName: string;
  payerType: PayerType;
  avgDaysToPay: number;
  accentColor: "primary" | "amber" | "danger" | "positive" | "muted";
};

export type Clinic = {
  id: string;
  name: string;
  registrationNo: string;
  address: string;
  state: string;
  doctor: string;
  mmc: string;
  panels: number;
};

export type Patient = {
  id: string;
  icNumber: string;
  fullName: string;
  dob: string;
  gender: "M" | "F";
};

export type ClaimStatus =
  | "draft"
  | "submitted"
  | "acknowledged"
  | "in_review"
  | "queried"
  | "approved_full"
  | "approved_partial"
  | "rejected"
  | "paid";

export type Claim = {
  id: string;
  claimNo: string;
  patientId: string;
  payerId: string;
  serviceDate: string;        // ISO date
  submittedAt?: string;
  grossAmountRm: number;
  paidAmountRm?: number;
  status: ClaimStatus;
  externalRef?: string;       // TPA's reference number
  daysOutstanding: number;
};

export type PaymentBatch = {
  id: string;
  payerId: string;
  remittanceNo: string;
  remittanceDate: string;
  totalPaidRm: number;
  sourceFile: string;
  lineCount: number;
};

export type PaymentLine = {
  id: string;
  batchId: string;
  externalClaimRef: string;
  patientName: string;
  serviceDate: string;
  billedRm: number;
  paidRm: number;
  deductionRm: number;
  deductionReason: string;
};

export type VarianceType =
  | "exact"
  | "formulary_cap"
  | "non_panel_drug"
  | "admin_fee"
  | "duplicate"
  | "unexplained"
  | "overpaid";

export type Severity = "info" | "low" | "med" | "high";

export type Reconciliation = {
  id: string;
  claimId: string;
  paymentLineId: string;
  matchConfidence: number;     // 0..1
  varianceRm: number;
  varianceType: VarianceType;
  varianceReason: string;
  reconciledAt: string;
};

export type Exception = {
  id: string;
  reconciliationId: string;
  severity: Severity;
  status: "open" | "appealed" | "resolved" | "dropped";
  appealLetterMd?: string;     // bilingual markdown
};

export type EligibilityResult = {
  payerId: string;
  status: "active" | "not_covered" | "error";
  planName?: string;
  remainingLimitRm?: number;
  visitCapRm?: number;
  copayRm?: number;
  notes?: string;
  latencyMs: number;
};
```

## Agent harness types (src/lib/types.ts)

```typescript
export type AgentId =
  | "EligibilityAgent"
  | "SubmissionAgent"
  | "StatusAgent"
  | "IngestionAgent"
  | "MatchingAgent"
  | "VarianceAgent"
  | "AppealAgent"
  | "AnalyticsAgent";

export type AgentStatus =
  | "idle"
  | "starting"
  | "thinking"
  | "calling"
  | "completed"
  | "failed";

export type ModelId =
  | "claude-haiku-4-5"
  | "claude-sonnet-4-6"
  | "claude-opus-4-7";

export type AgentInvocation = {
  id: string;                  // uuid
  agentId: AgentId;
  startedAt: number;           // unix ms
  completedAt?: number;
  status: AgentStatus;
  input: unknown;
  output?: unknown;
  reasoning?: string;
  error?: string;
  usedFallback: boolean;
  tokens?: { input: number; output: number };
  latencyMs?: number;
};

export type AgentEvent =
  | { type: "started"; invocationId: string; agentId: AgentId; timestamp: number }
  | { type: "thinking"; invocationId: string; agentId: AgentId; timestamp: number; chunk: string }
  | { type: "streaming"; invocationId: string; agentId: AgentId; timestamp: number; chunk: string }
  | { type: "completed"; invocationId: string; agentId: AgentId; timestamp: number; output: unknown }
  | { type: "failed"; invocationId: string; agentId: AgentId; timestamp: number; error: string };
```

## Cinematic types (src/cinematic/types.ts)

```typescript
export type StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Stage = {
  id: StageId;
  name: string;
  durationMs: number;
  description: string;
};

export type EngineState = {
  currentStage: StageId;
  elapsedInStage: number;
  isPlaying: boolean;
  hasEnded: boolean;
};

export type EngineAction =
  | { type: "TICK"; deltaMs: number }
  | { type: "NEXT_STAGE" }
  | { type: "PREV_STAGE" }
  | { type: "REPLAY" }
  | { type: "TOGGLE_PLAY" }
  | { type: "JUMP_TO_STAGE"; stage: StageId }
  | { type: "SKIP_TO_END" };
```

## Reference numbers and formats

- Claim numbers: `PRX-2026-XXXXX` (5 digits)
- MiCare refs: `MC-2026-XXXXXX` (6 digits)
- MediExpress refs: `ME-26-XXXXXX` (6 digits)
- IHP refs: `IHP-2026-XXXX`
- PMCare refs: `PMC-26-XXXXX`
- Skim Madani: `SPM-PRX-XXXXX`

## Currency formatting

Always use `formatRM(amount)` from `src/lib/utils.ts`:

```typescript
export function formatRM(amount: number, options?: { sign?: boolean }): string {
  const formatted = amount.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = options?.sign && amount > 0 ? "+" : "";
  return `${prefix}RM ${formatted}`;
}
```
