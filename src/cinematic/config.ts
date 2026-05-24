import type { Stage } from './types';

export const STAGES: Stage[] = [
  {
    id: 1,
    name: 'The Trigger',
    durationMs: 5000,
    description: 'Patient walks in. Front-desk staff types MyKad.',
  },
  {
    id: 2,
    name: 'The Verification Cascade',
    durationMs: 10000,
    description: 'EligibilityAgent checks 3 panels in parallel.',
  },
  {
    id: 3,
    name: 'The Consultation',
    durationMs: 4000,
    description: '45 minutes pass. The doctor sees the patient.',
  },
  {
    id: 4,
    name: 'The Submission Storm',
    durationMs: 10000,
    description: 'SubmissionAgent broadcasts canonical claim.',
  },
  {
    id: 5,
    name: 'The Time Skip',
    durationMs: 6000,
    description: 'Days and weeks pass. StatusAgent watches.',
  },
  {
    id: 6,
    name: 'The Reconciliation',
    durationMs: 18000,
    description: 'Remittance arrives. 5 agents reconcile.',
  },
  {
    id: 7,
    name: 'The Resolution',
    durationMs: 8000,
    description: "Dr. Vani's dashboard at end of month.",
  },
  {
    id: 8,
    name: 'The MMA Reveal',
    durationMs: 6000,
    description: 'Zoom out: 1,000 clinics.',
  },
  {
    id: 9,
    name: 'The CTA',
    durationMs: 5000,
    description: 'Pilot Monday. Live demo ends.',
  },
];

export const TOTAL_DURATION_MS = STAGES.reduce((sum, s) => sum + s.durationMs, 0);

export const STAGE_CONTENT = {
  stage1: {
    bubbleText: 'Patient just walked in. Let me verify his coverage.',
    patientName: 'Encik Faizal Rahman · 34 male',
    icNumber: '920101-10-1234',
  },
  stage2: {
    bubbleText:
      'I need to check MiCare, MediExpress, and PMCare. Old way: 3 phone calls, 17 minutes.',
    agentLabel: 'EligibilityAgent · calling 3 panels in parallel',
    tpas: [
      {
        name: 'MiCare',
        method: 'hotline' as const,
        response: 'Active · Berjaya Sompo OPD · RM 1,200 remaining · RM 0 copay',
        latency: 4700,
        status: 'success' as const,
        resolveAt: 5500,
      },
      {
        name: 'MediExpress',
        method: 'portal' as const,
        response: 'Active · Etiqa Corporate · RM 800 remaining · RM 5 copay',
        latency: 5400,
        status: 'success' as const,
        resolveAt: 6200,
      },
      {
        name: 'PMCare',
        method: 'app' as const,
        response: 'Employee resigned 14-Feb-2026',
        latency: 6000,
        status: 'failure' as const,
        resolveAt: 7000,
      },
    ],
    summary: '2 of 3 panels active · patient eligible at clinic',
    comparison: {
      old: '17 minutes',
      new: '6.8 seconds',
      kicker: "Patient hasn't even sat down.",
    },
  },
  stage3: {
    intro: '45 minutes pass.',
    soapLines: [
      'Patient: Encik Faizal Rahman',
      'DX: Acute pharyngitis (J02.9)',
      'Rx: Paracetamol 500mg, Amoxicillin 500mg',
      'MC: 2 days',
      'Consultation: RM 35.00',
    ],
    outro: 'The doctor finishes consultation.',
  },
  stage4: {
    bubbleText:
      'Old way: re-key into MiCare AND MediExpress portals. Two systems. Twelve minutes.',
    agentLabel: 'SubmissionAgent · broadcasting canonical claim to 2 eligible panels',
    claimLabel: 'ENCOUNTER DATA',
    claimLines: [
      'Patient: Encik Faizal Rahman (920101-10-1234)',
      'DX: J02.9 · Acute pharyngitis',
      'Rx: Paracetamol 500mg × 10, Amoxicillin 500mg × 15',
      'Consultation: RM 35.00',
      'Total: RM 35.00',
    ],
    targets: [
      {
        name: 'MiCare',
        method: 'api' as const,
        response: 'Acknowledged · Ref MC-2026-001847 · Status: in_review',
        latency: 2400,
        status: 'success' as const,
        resolveAt: 6000,
      },
      {
        name: 'MediExpress',
        method: 'api' as const,
        response: 'Acknowledged · Ref ME-26-003291 · Status: pending',
        latency: 3100,
        status: 'success' as const,
        resolveAt: 6800,
      },
    ],
    summary: '2 of 2 acknowledged · audit trail recorded',
    comparison:
      'Old way: 12 minutes, 2 portals, copy-paste errors. New way: 3.1 seconds, one click.',
  },
  stage5: {
    fromDate: '2026-02-14',
    toDate: '2026-04-17',
    sweepDurationMs: 4500,
    events: [
      { atProgress: 0.15, label: "Day 14 · MiCare moves claim to 'in review'" },
      {
        atProgress: 0.35,
        label: 'Day 27 · MediExpress requests additional documentation',
      },
      { atProgress: 0.5, label: 'Day 38 · StatusAgent auto-uploads supporting documents' },
      { atProgress: 0.7, label: "Day 47 · MediExpress moves to 'approved partial'" },
      { atProgress: 0.9, label: "Day 58 · MiCare → 'paid' · remittance generated" },
    ],
    closingLine: "Dr. Vani didn't check a single portal during these 62 days.",
  },
} as const;
