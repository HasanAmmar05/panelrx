import type { Payer } from './types';

export const PAYERS: Payer[] = [
  { id: 'p_micare', shortCode: 'MICARE', legalName: 'MiCare Sdn Bhd', payerType: 'tpa', avgDaysToPay: 62, accentColor: 'primary' },
  { id: 'p_mediexp', shortCode: 'MEDIEXP', legalName: 'MediExpress (Malaysia) Sdn Bhd', payerType: 'tpa', avgDaysToPay: 78, accentColor: 'amber' },
  { id: 'p_ihp', shortCode: 'IHP', legalName: 'Integrated Health Plans (M) Sdn Bhd', payerType: 'tpa', avgDaysToPay: 94, accentColor: 'danger' },
  { id: 'p_pmcare', shortCode: 'PMCARE', legalName: 'PMCare Sdn Bhd', payerType: 'tpa', avgDaysToPay: 58, accentColor: 'muted' },
  { id: 'p_selcare', shortCode: 'SELCARE', legalName: 'Selcare Management Sdn Bhd', payerType: 'tpa', avgDaysToPay: 30, accentColor: 'positive' },
  { id: 'p_pekab40', shortCode: 'PEKAB40', legalName: 'ProtectHealth PeKa B40', payerType: 'public_scheme', avgDaysToPay: 45, accentColor: 'positive' },
  { id: 'p_spmadani', shortCode: 'SPMADANI', legalName: 'Skim Perubatan Madani', payerType: 'public_scheme', avgDaysToPay: 38, accentColor: 'positive' },
  { id: 'p_medkad', shortCode: 'MEDKAD', legalName: 'MedKad Sdn Bhd', payerType: 'tpa', avgDaysToPay: 70, accentColor: 'amber' },
];
