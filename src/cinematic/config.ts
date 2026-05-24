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
