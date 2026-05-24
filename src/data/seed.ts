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
  { id: 'pat_001', icNumber: '920101-10-1234', fullName: 'Encik Faizal Rahman', dob: '1992-01-01', gender: 'M' },
  { id: 'pat_002', icNumber: '880515-08-5678', fullName: 'Aisyah binti Rahman', dob: '1988-05-15', gender: 'F' },
  { id: 'pat_003', icNumber: '751230-14-9012', fullName: 'Lim Wei Jian', dob: '1975-12-30', gender: 'M' },
  { id: 'pat_004', icNumber: '920815-08-3456', fullName: 'Priya Sundaram', dob: '1992-08-15', gender: 'F' },
  { id: 'pat_005', icNumber: '830422-14-7890', fullName: 'Tan Mei Ling', dob: '1983-04-22', gender: 'F' },
  { id: 'pat_006', icNumber: '951108-10-1122', fullName: 'Muhammad Faiz Aziz', dob: '1995-11-08', gender: 'M' },
  { id: 'pat_007', icNumber: '780303-08-3344', fullName: 'Kumaresan a/l Velu', dob: '1978-03-03', gender: 'M' },
  { id: 'pat_008', icNumber: '900920-14-5566', fullName: 'Nurul Huda Ismail', dob: '1990-09-20', gender: 'F' },
  { id: 'pat_009', icNumber: '650612-10-7788', fullName: 'Wong Chee Kong', dob: '1965-06-12', gender: 'M' },
  { id: 'pat_010', icNumber: '820815-08-9900', fullName: 'Siti Khadijah binti Aziz', dob: '1982-08-15', gender: 'F' },
  { id: 'pat_011', icNumber: '971124-14-2233', fullName: 'Ramesh Kumar', dob: '1997-11-24', gender: 'M' },
  { id: 'pat_012', icNumber: '850707-10-4455', fullName: 'Lee Hui Min', dob: '1985-07-07', gender: 'F' },
  { id: 'pat_013', icNumber: '920928-08-6677', fullName: 'Ahmad Daniel Hakimi', dob: '1992-09-28', gender: 'M' },
  { id: 'pat_014', icNumber: '800419-14-8899', fullName: 'Devi Lakshmi', dob: '1980-04-19', gender: 'F' },
  { id: 'pat_015', icNumber: '950608-10-1100', fullName: 'Chen Yi Hao', dob: '1995-06-08', gender: 'M' },
  { id: 'pat_016', icNumber: '871231-08-2200', fullName: 'Fatimah binti Mohd Yusof', dob: '1987-12-31', gender: 'F' },
  { id: 'pat_017', icNumber: '770525-14-3300', fullName: 'Selvam a/l Krishnan', dob: '1977-05-25', gender: 'M' },
  { id: 'pat_018', icNumber: '930814-10-4400', fullName: 'Aishwarya Pillai', dob: '1993-08-14', gender: 'F' },
  { id: 'pat_019', icNumber: '890226-08-5500', fullName: 'Mohd Iqbal Hassan', dob: '1989-02-26', gender: 'M' },
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
  p_spmadani: 'SPM-PRX-',
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
      claimNo: `PRX-2026-${String(10000 + i).padStart(5, '0')}`,
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
