import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Shield, Send, Clock, FileSearch, Scale, FileEdit, BarChart3, Users, Zap } from 'lucide-react';
import type { StageId } from './types';

type Narration = {
  text: string;
  subtext?: string;
  icon: typeof Bot;
  showAt: number;    // ms into stage
  hideAt: number;    // ms into stage
};

const NARRATIONS: Record<number, Narration[]> = {
  1: [
    { text: 'Patient walks into Dr. Vani\u2019s clinic with his MyKad', subtext: 'A solo GP clinic in KL. No admin staff — just Dr. Vani and a nurse.', icon: Users, showAt: 0, hideAt: 2500 },
    { text: 'ClinicMate detects patient IC and begins eligibility check', subtext: 'Normally this takes 17 minutes of phone calls. Our agents do it in seconds.', icon: Bot, showAt: 2500, hideAt: 5000 },
  ],
  2: [
    { text: 'EligibilityAgent checking 3 insurance panels simultaneously', subtext: 'MiCare via hotline, MediExpress via portal, PMCare via app — all at once', icon: Shield, showAt: 0, hideAt: 3500 },
    { text: 'Each TPA uses a different system — our agents adapt to each one', subtext: 'API, portal login, mobile app — the agent knows how to access each TPA', icon: Zap, showAt: 3500, hideAt: 6500 },
    { text: 'Results returned: 2 of 3 panels active', subtext: 'PMCare: employee resigned. MiCare & MediExpress: active coverage confirmed', icon: Shield, showAt: 6500, hideAt: 9000 },
    { text: '17 minutes of phone calls \u2192 6.8 seconds. Patient hasn\u2019t even sat down.', subtext: 'Zero manual work. The doctor never touched a phone or portal.', icon: Clock, showAt: 9000, hideAt: 10000 },
  ],
  3: [
    { text: 'Doctor sees the patient. Normal consultation happens.', subtext: '45 minutes pass. Diagnosis: Acute pharyngitis. Rx: Paracetamol, Amoxicillin.', icon: Users, showAt: 0, hideAt: 4000 },
  ],
  4: [
    { text: 'SubmissionAgent auto-creates a claim from the consultation notes', subtext: 'No data entry needed. Encounter data extracted: patient, diagnosis, drugs, fees.', icon: Send, showAt: 0, hideAt: 3000 },
    { text: 'Routing claim to MiCare (via API) and MediExpress (via portal)', subtext: 'Each TPA gets the claim in their required format — automatically', icon: Send, showAt: 3000, hideAt: 6000 },
    { text: 'Old way: re-key into 2 different portals. 12 minutes, copy-paste errors.', subtext: 'New way: 3.1 seconds, zero errors, audit trail recorded.', icon: Clock, showAt: 6000, hideAt: 10000 },
  ],
  5: [
    { text: 'Days and weeks pass. StatusAgent monitors claim progress.', subtext: 'The doctor doesn\u2019t check portals, make calls, or send emails. Agents do it all.', icon: Clock, showAt: 0, hideAt: 2000 },
    { text: 'Day 27: MediExpress requests additional documentation', subtext: 'StatusAgent auto-uploads the supporting documents — no human intervention', icon: Bot, showAt: 2000, hideAt: 3500 },
    { text: 'Day 30: FollowUpAgent sends payment reminder to MiCare', subtext: 'Citing panel agreement terms. Professional, persistent, autonomous.', icon: FileEdit, showAt: 3500, hideAt: 5000 },
    { text: '62 days. Zero portal checks. Zero phone calls. Zero emails by the doctor.', subtext: 'The agents handled everything — checking, following up, escalating.', icon: Shield, showAt: 5000, hideAt: 6000 },
  ],
  6: [
    { text: 'Remittance arrives from MiCare. Time to reconcile.', subtext: '27 line items in a PDF. Which claims were paid? Which were short-paid?', icon: FileSearch, showAt: 0, hideAt: 3500 },
    { text: 'IngestionAgent extracts all 27 lines from the PDF via OCR', subtext: 'AI reads the remittance document — patient names, amounts, dates', icon: FileSearch, showAt: 3500, hideAt: 5500 },
    { text: 'MatchingAgent maps each payment line to an open claim', subtext: 'Fuzzy matching against 200 open claims. 25 of 27 matched correctly.', icon: Scale, showAt: 5500, hideAt: 8000 },
    { text: 'VarianceAgent: RM 6,210 in unexplained deductions found', subtext: 'TPA deducted money without valid reason. No matching clause in agreement.', icon: Shield, showAt: 8000, hideAt: 12000 },
    { text: 'AppealAgent drafts 6 bilingual appeal letters (BM + EN)', subtext: 'Ready for Dr. Vani\u2019s one-tap approval. Citing exact contract clauses.', icon: FileEdit, showAt: 12000, hideAt: 15000 },
    { text: '5 agents. 14.7 seconds. Work that took a clinic admin 3-4 hours.', subtext: 'Every ringgit accounted for. Every deduction challenged.', icon: BarChart3, showAt: 15000, hideAt: 18000 },
  ],
  7: [
    { text: 'Dr. Vani opens her ClinicMate dashboard at end of month', subtext: 'Everything is there: claims, payments, variances, appeal status', icon: BarChart3, showAt: 0, hideAt: 4000 },
    { text: 'She recovers RM 6,210 that would have been lost without AI agents', subtext: 'For a solo GP earning ~RM 15k/month, this is 40% of monthly income saved.', icon: Shield, showAt: 4000, hideAt: 8000 },
  ],
  8: [
    { text: 'Now imagine 1,000 clinics. RM 6.2M recovered per month.', subtext: 'Anonymized data across all clinics — evidence for MMA policy advocacy.', icon: Users, showAt: 0, hideAt: 6000 },
  ],
  9: [
    { text: 'ClinicMate: AI agents that handle the entire claims lifecycle', subtext: 'From eligibility \u2192 submission \u2192 monitoring \u2192 reconciliation \u2192 appeals', icon: Bot, showAt: 0, hideAt: 5000 },
  ],
};

type NarrationOverlayProps = {
  currentStage: StageId;
  elapsedInStage: number;
};

export function NarrationOverlay({ currentStage, elapsedInStage }: NarrationOverlayProps) {
  const narrations = NARRATIONS[currentStage] ?? [];
  const active = narrations.find(
    (n) => elapsedInStage >= n.showAt && elapsedInStage < n.hideAt,
  );

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4">
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={`${currentStage}-${active.showAt}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="bg-[#0D1117]/90 backdrop-blur-md border border-[#1E293B] rounded-lg px-5 py-3.5 flex items-start gap-3"
          >
            <div className="shrink-0 mt-0.5 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <active.icon size={16} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-white font-medium leading-snug">{active.text}</p>
              {active.subtext && (
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{active.subtext}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
