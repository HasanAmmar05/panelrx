import { PAYERS } from './payers';
import type { Clinic, Patient, Claim, ClaimStatus, PaymentBatch } from './types';

export const CLINIC: Clinic = {
  id: 'c_vani',
  name: 'Klinik Dr Vani',
  registrationNo: 'PMK-1234-WP',
  address: '12 Jalan SS2/24, Petaling Jaya',
  state: 'Selangor',
  doctor: 'Dr. Vani Subramaniam',
  mmc: 'MMC 51234',
  panels: 6,
};

export const PATIENTS: Patient[] = [
  { id: 'pat_001', icNumber: '920101-10-1233', fullName: 'Encik Faizal Rahman', dob: '1992-01-01', gender: 'M' },
  { id: 'pat_002', icNumber: '880515-08-5678', fullName: 'Aisyah binti Rahman', dob: '1988-05-15', gender: 'F' },
  { id: 'pat_003', icNumber: '751230-14-9013', fullName: 'Lim Wei Jian', dob: '1975-12-30', gender: 'M' },
  { id: 'pat_004', icNumber: '920815-08-3456', fullName: 'Priya Sundaram', dob: '1992-08-15', gender: 'F' },
  { id: 'pat_005', icNumber: '830422-14-7890', fullName: 'Tan Mei Ling', dob: '1983-04-22', gender: 'F' },
  { id: 'pat_006', icNumber: '951108-10-1123', fullName: 'Muhammad Faiz Aziz', dob: '1995-11-08', gender: 'M' },
  { id: 'pat_007', icNumber: '780303-08-3345', fullName: 'Kumaresan a/l Velu', dob: '1978-03-03', gender: 'M' },
  { id: 'pat_008', icNumber: '900920-14-5566', fullName: 'Nurul Huda Ismail', dob: '1990-09-20', gender: 'F' },
  { id: 'pat_009', icNumber: '650612-10-7789', fullName: 'Wong Chee Kong', dob: '1965-06-12', gender: 'M' },
  { id: 'pat_010', icNumber: '820815-08-9900', fullName: 'Siti Khadijah binti Aziz', dob: '1982-08-15', gender: 'F' },
  { id: 'pat_011', icNumber: '971124-14-2233', fullName: 'Ramesh Kumar', dob: '1997-11-24', gender: 'M' },
  { id: 'pat_012', icNumber: '850707-10-4456', fullName: 'Lee Hui Min', dob: '1985-07-07', gender: 'F' },
  { id: 'pat_013', icNumber: '920928-08-6677', fullName: 'Ahmad Daniel Hakimi', dob: '1992-09-28', gender: 'M' },
  { id: 'pat_014', icNumber: '800419-14-8898', fullName: 'Devi Lakshmi', dob: '1980-04-19', gender: 'F' },
  { id: 'pat_015', icNumber: '950608-10-1101', fullName: 'Chen Yi Hao', dob: '1995-06-08', gender: 'M' },
  { id: 'pat_016', icNumber: '871231-08-2200', fullName: 'Fatimah binti Mohd Yusof', dob: '1987-12-31', gender: 'F' },
  { id: 'pat_017', icNumber: '770525-14-3301', fullName: 'Selvam a/l Krishnan', dob: '1977-05-25', gender: 'M' },
  { id: 'pat_018', icNumber: '930814-10-4400', fullName: 'Aishwarya Pillai', dob: '1993-08-14', gender: 'F' },
  { id: 'pat_019', icNumber: '890226-08-5501', fullName: 'Mohd Iqbal Hassan', dob: '1989-02-26', gender: 'M' },
  { id: 'pat_020', icNumber: '830311-14-6600', fullName: 'Yap Siew Lin', dob: '1983-03-11', gender: 'F' },
];

// Seeded random for deterministic claims
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const PAYER_WEIGHTS = [
  { payerId: 'p_micare', weight: 0.35 },
  { payerId: 'p_mediexp', weight: 0.25 },
  { payerId: 'p_ihp', weight: 0.15 },
  { payerId: 'p_pmcare', weight: 0.10 },
  { payerId: 'p_selcare', weight: 0.05 },
  { payerId: 'p_pekab40', weight: 0.05 },
  { payerId: 'p_spmadani', weight: 0.03 },
  { payerId: 'p_medkad', weight: 0.02 },
];

const STATUS_WEIGHTS: { status: ClaimStatus; weight: number }[] = [
  { status: 'paid', weight: 0.50 },
  { status: 'submitted', weight: 0.12 },
  { status: 'acknowledged', weight: 0.08 },
  { status: 'queried', weight: 0.15 },
  { status: 'rejected', weight: 0.05 },
  { status: 'approved_partial', weight: 0.05 },
  { status: 'approved_full', weight: 0.05 },
];

function pickWeighted<T>(items: { weight: number }[], rand: number): number {
  let acc = 0;
  for (let i = 0; i < items.length; i++) {
    acc += items[i].weight;
    if (rand < acc) return i;
  }
  return items.length - 1;
}

const PAYER_PREFIXES: Record<string, string> = {
  p_micare: 'MC-2026-',
  p_mediexp: 'ME-26-',
  p_ihp: 'IHP-2026-',
  p_pmcare: 'PMC-26-',
  p_selcare: 'SEL-26-',
  p_pekab40: 'PEKA-26-',
  p_spmadani: 'SPM-CM-',
  p_medkad: 'MK-26-',
};

function generateClaims(): Claim[] {
  const rand = seededRandom(42);
  const claims: Claim[] = [];
  const now = Date.now();

  for (let i = 0; i < 200; i++) {
    const payerIdx = pickWeighted(PAYER_WEIGHTS, rand());
    const payerId = PAYER_WEIGHTS[payerIdx].payerId;
    const statusIdx = pickWeighted(STATUS_WEIGHTS, rand());
    const status = STATUS_WEIGHTS[statusIdx].status;
    const patientIdx = Math.floor(rand() * PATIENTS.length);
    const daysBack = Math.floor(rand() * 120) + 1;
    const serviceDate = new Date(now - daysBack * 86400000).toISOString().slice(0, 10);
    const grossAmount = Math.round((35 + rand() * 245) * 100) / 100;
    const payer = PAYERS.find((p) => p.id === payerId)!;
    const daysOutstanding = status === 'paid' ? 0 : daysBack + Math.floor(rand() * payer.avgDaysToPay);
    const paid = status === 'paid' || status === 'approved_partial';
    const paidAmount = paid
      ? Math.round((grossAmount * (0.85 + rand() * 0.15)) * 100) / 100
      : undefined;
    const prefix = PAYER_PREFIXES[payerId] ?? 'UNK-';

    claims.push({
      id: `clm_${String(i + 1).padStart(3, '0')}`,
      claimNo: `CM-2026-${String(10000 + i).padStart(5, '0')}`,
      patientId: PATIENTS[patientIdx].id,
      payerId,
      serviceDate,
      submittedAt: new Date(now - (daysBack - 1) * 86400000).toISOString(),
      grossAmountRm: grossAmount,
      paidAmountRm: paidAmount,
      status,
      externalRef: `${prefix}${String(100000 + i).padStart(6, '0')}`,
      daysOutstanding,
    });
  }

  return claims;
}

export const CLAIMS = generateClaims();

export const PAYMENT_BATCHES: PaymentBatch[] = [
  { id: 'pb_micare_mar', payerId: 'p_micare', remittanceNo: 'MC-REM-2026-03-00184', remittanceDate: '2026-03-15', totalPaidRm: 8450, sourceFile: 'MiCare_remit_Feb2026.pdf', lineCount: 27 },
  { id: 'pb_mediexp_mar', payerId: 'p_mediexp', remittanceNo: 'ME-REM-26-03-00921', remittanceDate: '2026-03-20', totalPaidRm: 11210, sourceFile: 'MediExpress_remit_Feb2026.pdf', lineCount: 32 },
  { id: 'pb_ihp_feb', payerId: 'p_ihp', remittanceNo: 'IHP-REM-2026-02-447', remittanceDate: '2026-02-28', totalPaidRm: 6890, sourceFile: 'IHP_remit_Jan2026.pdf', lineCount: 19 },
  { id: 'pb_pmcare_mar', payerId: 'p_pmcare', remittanceNo: 'PMC-REM-26-03-1102', remittanceDate: '2026-03-18', totalPaidRm: 4320, sourceFile: 'PMCare_remit_Feb2026.pdf', lineCount: 14 },
  { id: 'pb_pekab40_mar', payerId: 'p_pekab40', remittanceNo: 'PEKA-RX-2026-03-887', remittanceDate: '2026-03-10', totalPaidRm: 2100, sourceFile: 'PeKaB40_remit_Feb2026.pdf', lineCount: 15 },
];

export const EXCEPTIONS_DEMO = [
  { id: 'exc_1', tpa: 'MiCare', patient: 'Lim S.K.', patientIc: '751230-14-****', date: '14-Feb-2026', billed: 65, paid: 35, reason: 'admin adjustment (no clause cited)', severity: 'high' as const, remittanceRef: 'MC-REM-2026-03-00184' },
  { id: 'exc_2', tpa: 'MediExpress', patient: 'Aisyah Rahman', patientIc: '880515-08-****', date: '03-Feb-2026', billed: 85, paid: 78, reason: '8% panel admin fee — not in contract', severity: 'high' as const, remittanceRef: 'ME-REM-26-03-00921' },
  { id: 'exc_3', tpa: 'MediExpress', patient: 'Tan Mei Ling', patientIc: '830422-14-****', date: '11-Feb-2026', billed: 120, paid: 110, reason: '8% panel admin fee — not in contract', severity: 'high' as const, remittanceRef: 'ME-REM-26-03-00921' },
  { id: 'exc_4', tpa: 'IHP', patient: 'Kumaresan Velu', patientIc: '780303-08-****', date: '08-Feb-2026', billed: 95, paid: 67, reason: 'formulary substitution — drug IS on formulary', severity: 'med' as const, remittanceRef: 'IHP-REM-2026-02-447' },
  { id: 'exc_5', tpa: 'IHP', patient: 'Priya Sundaram', patientIc: '920815-08-****', date: '12-Feb-2026', billed: 110, paid: 77, reason: 'formulary substitution — drug IS on formulary', severity: 'med' as const, remittanceRef: 'IHP-REM-2026-02-447' },
  { id: 'exc_6', tpa: 'IHP', patient: 'Muhammad Faiz', patientIc: '951108-10-****', date: '19-Feb-2026', billed: 78, paid: 55, reason: 'formulary substitution — drug IS on formulary', severity: 'med' as const, remittanceRef: 'IHP-REM-2026-02-447' },
];

// ─── Follow-Up Agent Activity Log ───
export type FollowUp = {
  id: string;
  claimNo: string;
  payerId: string;
  tpaName: string;
  type: 'reminder' | 'escalation' | 'final_notice' | 'response_received';
  sentAt: string;
  status: 'sent' | 'delivered' | 'acknowledged' | 'ignored';
  message: string;
  daysOverdue: number;
};

export const FOLLOW_UPS: FollowUp[] = [
  { id: 'fu_1', claimNo: 'CM-2026-10003', payerId: 'p_micare', tpaName: 'MiCare', type: 'reminder', sentAt: '2026-04-01T09:00:00Z', status: 'delivered', message: 'Payment reminder: Claim CM-2026-10003 outstanding 45 days. Contractual term: 30 days. Please expedite.', daysOverdue: 15 },
  { id: 'fu_2', claimNo: 'CM-2026-10007', payerId: 'p_ihp', tpaName: 'IHP', type: 'escalation', sentAt: '2026-04-05T10:30:00Z', status: 'sent', message: 'ESCALATION: Claim CM-2026-10007 overdue 78 days (2.6x contract term). Requesting immediate attention per panel agreement clause 4.2.', daysOverdue: 48 },
  { id: 'fu_3', claimNo: 'CM-2026-10012', payerId: 'p_mediexp', tpaName: 'MediExpress', type: 'reminder', sentAt: '2026-04-08T08:15:00Z', status: 'delivered', message: 'Payment reminder: Claim CM-2026-10012 outstanding 52 days. Second reminder.', daysOverdue: 22 },
  { id: 'fu_4', claimNo: 'CM-2026-10007', payerId: 'p_ihp', tpaName: 'IHP', type: 'final_notice', sentAt: '2026-04-12T11:00:00Z', status: 'sent', message: 'FINAL NOTICE: Claim CM-2026-10007 overdue 85 days. If no response within 7 days, this will be escalated to MMA complaint mechanism.', daysOverdue: 55 },
  { id: 'fu_5', claimNo: 'CM-2026-10015', payerId: 'p_pmcare', tpaName: 'PMCare', type: 'reminder', sentAt: '2026-04-10T09:30:00Z', status: 'acknowledged', message: 'Payment reminder: Claim CM-2026-10015 outstanding 38 days.', daysOverdue: 8 },
  { id: 'fu_6', claimNo: 'CM-2026-10003', payerId: 'p_micare', tpaName: 'MiCare', type: 'response_received', sentAt: '2026-04-14T14:20:00Z', status: 'acknowledged', message: 'MiCare responded: "Payment processed in next batch cycle (April 18)." Tracking.', daysOverdue: 0 },
  { id: 'fu_7', claimNo: 'CM-2026-10022', payerId: 'p_mediexp', tpaName: 'MediExpress', type: 'escalation', sentAt: '2026-04-15T09:00:00Z', status: 'sent', message: 'ESCALATION: Claim CM-2026-10022 overdue 65 days. Multiple 8% deductions still unresolved.', daysOverdue: 35 },
  { id: 'fu_8', claimNo: 'CM-2026-10030', payerId: 'p_selcare', tpaName: 'SelCare', type: 'reminder', sentAt: '2026-04-16T08:00:00Z', status: 'delivered', message: 'Payment reminder: Claim CM-2026-10030 outstanding 32 days. Friendly check-in.', daysOverdue: 2 },
  { id: 'fu_9', claimNo: 'CM-2026-10015', payerId: 'p_pmcare', tpaName: 'PMCare', type: 'response_received', sentAt: '2026-04-17T16:45:00Z', status: 'acknowledged', message: 'PMCare responded: "Claim approved. Payment scheduled for April 22."', daysOverdue: 0 },
  { id: 'fu_10', claimNo: 'CM-2026-10045', payerId: 'p_ihp', tpaName: 'IHP', type: 'final_notice', sentAt: '2026-04-18T10:00:00Z', status: 'ignored', message: 'FINAL NOTICE: Claim CM-2026-10045 overdue 92 days. MMA complaint filing imminent.', daysOverdue: 62 },
];

// ─── Fake Eligibility Results ───
export type EligibilityCheckResult = {
  payerId: string;
  tpaName: string;
  status: 'active' | 'not_covered' | 'expired' | 'error';
  planName?: string;
  remainingLimitRm?: number;
  visitCapRm?: number;
  copayRm?: number;
  notes?: string;
  latencyMs: number;
};

export function getEligibilityResults(ic: string): EligibilityCheckResult[] {
  // Deterministic results based on IC
  return [
    { payerId: 'p_micare', tpaName: 'MiCare', status: 'active', planName: 'Corporate Gold', remainingLimitRm: 2450, visitCapRm: 80, copayRm: 0, latencyMs: 340, notes: 'Employer: Petronas Chemicals' },
    { payerId: 'p_mediexp', tpaName: 'MediExpress', status: 'active', planName: 'MediPlan Standard', remainingLimitRm: 1800, visitCapRm: 65, copayRm: 10, latencyMs: 780, notes: '8% admin fee applies' },
    { payerId: 'p_ihp', tpaName: 'IHP', status: 'not_covered', latencyMs: 420, notes: 'Member not found in IHP database' },
    { payerId: 'p_pmcare', tpaName: 'PMCare', status: 'active', planName: 'PMCare Plus', remainingLimitRm: 3200, visitCapRm: 90, copayRm: 0, latencyMs: 550 },
    { payerId: 'p_selcare', tpaName: 'SelCare', status: 'active', planName: 'Skim Selangor', remainingLimitRm: 5000, visitCapRm: 120, copayRm: 0, latencyMs: 210, notes: 'No cap on consultation fees' },
    { payerId: 'p_pekab40', tpaName: 'PeKa B40', status: ic.startsWith('9') ? 'active' : 'not_covered', planName: 'PeKa B40', remainingLimitRm: 500, visitCapRm: 50, copayRm: 0, latencyMs: 380 },
  ];
}

// ─── Autonomous Batch Status Check Queue ───
import type { ClaimCheckEntry } from './types';

export const CLAIM_CHECK_QUEUE: ClaimCheckEntry[] = [
  // READY — need to check now (ordered for demo: voice call first, then portal, app, api)
  { id: 'chk_03', claimId: 'clm_025', claimNo: 'CM-2026-10025', patientName: 'Muhammad Faiz Aziz', payerId: 'p_micare', tpaName: 'MiCare', grossAmountRm: 65, daysOutstanding: 45, lastCheckedAt: null, lastOutcome: null, lastResponse: null, snoozedUntil: null, cooldownDays: 0, checkCount: 0, queueStatus: 'ready' },
  { id: 'chk_01', claimId: 'clm_012', claimNo: 'CM-2026-10012', patientName: 'Aisyah Rahman', payerId: 'p_mediexp', tpaName: 'MediExpress', grossAmountRm: 85, daysOutstanding: 72, lastCheckedAt: null, lastOutcome: null, lastResponse: null, snoozedUntil: null, cooldownDays: 0, checkCount: 0, queueStatus: 'ready' },
  { id: 'chk_04', claimId: 'clm_031', claimNo: 'CM-2026-10031', patientName: 'Priya Sundaram', payerId: 'p_pmcare', tpaName: 'PMCare', grossAmountRm: 95, daysOutstanding: 38, lastCheckedAt: null, lastOutcome: null, lastResponse: null, snoozedUntil: null, cooldownDays: 0, checkCount: 0, queueStatus: 'ready' },
  { id: 'chk_07', claimId: 'clm_048', claimNo: 'CM-2026-10048', patientName: 'Wong Chee Kong', payerId: 'p_selcare', tpaName: 'SelCare', grossAmountRm: 55, daysOutstanding: 33, lastCheckedAt: null, lastOutcome: null, lastResponse: null, snoozedUntil: null, cooldownDays: 0, checkCount: 0, queueStatus: 'ready' },
  { id: 'chk_02', claimId: 'clm_018', claimNo: 'CM-2026-10018', patientName: 'Lim Wei Jian', payerId: 'p_ihp', tpaName: 'IHP', grossAmountRm: 120, daysOutstanding: 94, lastCheckedAt: null, lastOutcome: null, lastResponse: null, snoozedUntil: null, cooldownDays: 0, checkCount: 0, queueStatus: 'ready' },
  { id: 'chk_05', claimId: 'clm_037', claimNo: 'CM-2026-10037', patientName: 'Tan Mei Ling', payerId: 'p_mediexp', tpaName: 'MediExpress', grossAmountRm: 110, daysOutstanding: 61, lastCheckedAt: null, lastOutcome: null, lastResponse: null, snoozedUntil: null, cooldownDays: 0, checkCount: 0, queueStatus: 'ready' },
  { id: 'chk_06', claimId: 'clm_042', claimNo: 'CM-2026-10042', patientName: 'Nurul Huda Ismail', payerId: 'p_ihp', tpaName: 'IHP', grossAmountRm: 78, daysOutstanding: 88, lastCheckedAt: null, lastOutcome: null, lastResponse: null, snoozedUntil: null, cooldownDays: 0, checkCount: 0, queueStatus: 'ready' },
  { id: 'chk_08', claimId: 'clm_053', claimNo: 'CM-2026-10053', patientName: 'Ramesh Kumar', payerId: 'p_micare', tpaName: 'MiCare', grossAmountRm: 140, daysOutstanding: 52, lastCheckedAt: null, lastOutcome: null, lastResponse: null, snoozedUntil: null, cooldownDays: 0, checkCount: 0, queueStatus: 'ready' },

  // SNOOZED — TPA gave a promise date, agent is waiting smartly
  { id: 'chk_09', claimId: 'clm_003', claimNo: 'CM-2026-10003', patientName: 'Encik Faizal Rahman', payerId: 'p_micare', tpaName: 'MiCare', grossAmountRm: 65, daysOutstanding: 58, lastCheckedAt: '2026-05-17T09:14:00Z', lastOutcome: 'promised_date', lastResponse: 'Payment scheduled in batch cycle April 18. Ref: MC-BATCH-2026-04-18.', snoozedUntil: '2026-05-25', cooldownDays: 7, checkCount: 2, queueStatus: 'snoozed' },
  { id: 'chk_10', claimId: 'clm_007', claimNo: 'CM-2026-10007', patientName: 'Kumaresan Velu', payerId: 'p_ihp', tpaName: 'IHP', grossAmountRm: 95, daysOutstanding: 85, lastCheckedAt: '2026-05-15T10:30:00Z', lastOutcome: 'promised_date', lastResponse: 'Approved. Payment in next cycle (est. 10 working days).', snoozedUntil: '2026-05-29', cooldownDays: 14, checkCount: 4, queueStatus: 'snoozed' },
  { id: 'chk_11', claimId: 'clm_015', claimNo: 'CM-2026-10015', patientName: 'Lee Hui Min', payerId: 'p_pmcare', tpaName: 'PMCare', grossAmountRm: 72, daysOutstanding: 42, lastCheckedAt: '2026-05-20T08:45:00Z', lastOutcome: 'promised_date', lastResponse: 'Claim approved. Payment scheduled for May 28.', snoozedUntil: '2026-05-28', cooldownDays: 7, checkCount: 1, queueStatus: 'snoozed' },
  { id: 'chk_12', claimId: 'clm_022', claimNo: 'CM-2026-10022', patientName: 'Ahmad Daniel Hakimi', payerId: 'p_mediexp', tpaName: 'MediExpress', grossAmountRm: 88, daysOutstanding: 67, lastCheckedAt: '2026-05-18T14:20:00Z', lastOutcome: 'pending', lastResponse: 'Status: in review. No further update available.', snoozedUntil: '2026-05-25', cooldownDays: 7, checkCount: 3, queueStatus: 'snoozed' },
  { id: 'chk_13', claimId: 'clm_029', claimNo: 'CM-2026-10029', patientName: 'Devi Lakshmi', payerId: 'p_selcare', tpaName: 'SelCare', grossAmountRm: 45, daysOutstanding: 28, lastCheckedAt: '2026-05-22T09:00:00Z', lastOutcome: 'promised_date', lastResponse: 'Payment being processed. ETA: 3 working days.', snoozedUntil: '2026-05-27', cooldownDays: 5, checkCount: 1, queueStatus: 'snoozed' },
  { id: 'chk_14', claimId: 'clm_035', claimNo: 'CM-2026-10035', patientName: 'Chen Yi Hao', payerId: 'p_micare', tpaName: 'MiCare', grossAmountRm: 105, daysOutstanding: 55, lastCheckedAt: '2026-05-19T11:15:00Z', lastOutcome: 'promised_date', lastResponse: 'Batch processing. Expected deposit May 30.', snoozedUntil: '2026-06-01', cooldownDays: 12, checkCount: 2, queueStatus: 'snoozed' },

  // RESOLVED — money came or claim closed
  { id: 'chk_15', claimId: 'clm_005', claimNo: 'CM-2026-10005', patientName: 'Siti Khadijah Aziz', payerId: 'p_selcare', tpaName: 'SelCare', grossAmountRm: 55, daysOutstanding: 0, lastCheckedAt: '2026-05-20T09:30:00Z', lastOutcome: 'paid', lastResponse: 'Payment received RM 55.00 via bank transfer. Ref: SEL-PAY-2026-05-20-001.', snoozedUntil: null, cooldownDays: 0, checkCount: 2, queueStatus: 'resolved' },
  { id: 'chk_16', claimId: 'clm_009', claimNo: 'CM-2026-10009', patientName: 'Mohd Iqbal Hassan', payerId: 'p_pmcare', tpaName: 'PMCare', grossAmountRm: 68, daysOutstanding: 0, lastCheckedAt: '2026-05-21T10:00:00Z', lastOutcome: 'paid', lastResponse: 'Payment received RM 68.00. Matched to remittance PMC-REM-26-05-21.', snoozedUntil: null, cooldownDays: 0, checkCount: 3, queueStatus: 'resolved' },
  { id: 'chk_17', claimId: 'clm_014', claimNo: 'CM-2026-10014', patientName: 'Fatimah Mohd Yusof', payerId: 'p_micare', tpaName: 'MiCare', grossAmountRm: 75, daysOutstanding: 0, lastCheckedAt: '2026-05-19T14:00:00Z', lastOutcome: 'paid', lastResponse: 'Payment received RM 71.25 (5% admin fee deducted). Auto-flagged for reconciliation.', snoozedUntil: null, cooldownDays: 0, checkCount: 1, queueStatus: 'resolved' },
  { id: 'chk_18', claimId: 'clm_020', claimNo: 'CM-2026-10020', patientName: 'Selvam Krishnan', payerId: 'p_mediexp', tpaName: 'MediExpress', grossAmountRm: 92, daysOutstanding: 0, lastCheckedAt: '2026-05-22T11:30:00Z', lastOutcome: 'paid', lastResponse: 'Payment received RM 84.64 (8% admin fee). Variance auto-logged.', snoozedUntil: null, cooldownDays: 0, checkCount: 4, queueStatus: 'resolved' },

  // QUERIED — TPA needs something from the clinic
  { id: 'chk_19', claimId: 'clm_041', claimNo: 'CM-2026-10041', patientName: 'Aishwarya Pillai', payerId: 'p_ihp', tpaName: 'IHP', grossAmountRm: 135, daysOutstanding: 76, lastCheckedAt: '2026-05-21T09:00:00Z', lastOutcome: 'queried', lastResponse: 'Additional documentation required: lab report for blood test claimed. Upload deadline: May 28.', snoozedUntil: null, cooldownDays: 0, checkCount: 2, queueStatus: 'ready' },
  { id: 'chk_20', claimId: 'clm_047', claimNo: 'CM-2026-10047', patientName: 'Yap Siew Lin', payerId: 'p_mediexp', tpaName: 'MediExpress', grossAmountRm: 160, daysOutstanding: 53, lastCheckedAt: '2026-05-22T08:30:00Z', lastOutcome: 'queried', lastResponse: 'Diagnosis code J06.9 does not match X-ray claim. Please clarify or amend.', snoozedUntil: null, cooldownDays: 0, checkCount: 1, queueStatus: 'ready' },
];

// Fake responses for the live sweep simulation
export const SWEEP_RESPONSES: Record<string, { outcome: string; response: string; cooldownDays: number }> = {
  'chk_01': { outcome: 'promised_date', response: 'Payment approved. Next batch cycle: May 31. Ref: ME-BATCH-2026-05-31.', cooldownDays: 7 },
  'chk_02': { outcome: 'pending', response: 'Status: under review. No update from claims department.', cooldownDays: 7 },
  'chk_03': { outcome: 'promised_date', response: 'Approved. Payment scheduled for May 28. Ref: MC-PAY-2026-05-28.', cooldownDays: 4 },
  'chk_04': { outcome: 'approved', response: 'Claim approved RM 95.00. Payment in next cycle (est. 5 working days).', cooldownDays: 7 },
  'chk_05': { outcome: 'pending', response: 'In review. Estimated processing: 10 working days.', cooldownDays: 14 },
  'chk_06': { outcome: 'no_response', response: 'IHP portal timeout after 30s. Will retry in next sweep.', cooldownDays: 1 },
  'chk_07': { outcome: 'promised_date', response: 'Payment processed. Bank transfer initiated. ETA: 2 working days.', cooldownDays: 3 },
  'chk_08': { outcome: 'promised_date', response: 'Batch payment approved. Deposit expected May 30. Ref: MC-BATCH-2026-05-30.', cooldownDays: 6 },
};
