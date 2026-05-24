export type PayerType = 'tpa' | 'public_scheme' | 'direct_insurer';

export type Payer = {
  id: string;
  shortCode: string;
  legalName: string;
  payerType: PayerType;
  avgDaysToPay: number;
  accentColor: 'primary' | 'amber' | 'danger' | 'positive' | 'muted';
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
  gender: 'M' | 'F';
};

export type ClaimStatus =
  | 'draft'
  | 'submitted'
  | 'acknowledged'
  | 'in_review'
  | 'queried'
  | 'approved_full'
  | 'approved_partial'
  | 'rejected'
  | 'paid';

export type Claim = {
  id: string;
  claimNo: string;
  patientId: string;
  payerId: string;
  serviceDate: string;
  submittedAt?: string;
  grossAmountRm: number;
  paidAmountRm?: number;
  status: ClaimStatus;
  externalRef?: string;
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
  | 'exact'
  | 'formulary_cap'
  | 'non_panel_drug'
  | 'admin_fee'
  | 'duplicate'
  | 'unexplained'
  | 'overpaid';

export type Severity = 'info' | 'low' | 'med' | 'high';

export type Reconciliation = {
  id: string;
  claimId: string;
  paymentLineId: string;
  matchConfidence: number;
  varianceRm: number;
  varianceType: VarianceType;
  varianceReason: string;
  reconciledAt: string;
};

export type Exception = {
  id: string;
  reconciliationId: string;
  severity: Severity;
  status: 'open' | 'appealed' | 'resolved' | 'dropped';
  appealLetterMd?: string;
};

export type EligibilityResult = {
  payerId: string;
  status: 'active' | 'not_covered' | 'error';
  planName?: string;
  remainingLimitRm?: number;
  visitCapRm?: number;
  copayRm?: number;
  notes?: string;
  latencyMs: number;
};
