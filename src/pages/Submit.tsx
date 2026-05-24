import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, Loader2, Plus, Trash2, AlertTriangle, Shield, Bot, Globe, Phone, Monitor, Smartphone, FileCheck, Clock } from 'lucide-react';
import { PATIENTS } from '../data/seed';
import { PAYERS } from '../data/payers';

type LineItem = { id: number; description: string; qty: number; unitPrice: number };
type SubmitState = 'form' | 'submitting' | 'success';

// Detailed per-TPA submission pipeline
type PipelineStep = {
  agent: string;
  action: string;
  detail: string;
  status: 'pending' | 'running' | 'done' | 'skipped';
  durationMs: number;
  icon: 'bot' | 'shield' | 'globe' | 'check' | 'phone' | 'monitor' | 'app' | 'clock';
};

function buildPipeline(patient: { fullName: string; icNumber: string } | undefined, ic: string, diagnosis: string, total: number, lineCount: number): PipelineStep[] {
  const name = patient?.fullName ?? 'Unknown';
  return [
    // 1. Validation
    { agent: 'ValidationAgent', action: 'Validating claim data', detail: `Patient: ${name} \u2022 IC: ${ic}\nDiagnosis: ${diagnosis}\nTotal: RM ${total.toFixed(2)} \u2022 ${lineCount} line items`, status: 'pending', durationMs: 1200, icon: 'shield' },
    { agent: 'ValidationAgent', action: 'Checking ICD-10 code', detail: `J06.9 \u2192 Acute upper respiratory infection, unspecified\nCode valid \u2022 Category: Respiratory \u2022 No pre-auth required`, status: 'pending', durationMs: 1000, icon: 'shield' },
    { agent: 'ValidationAgent', action: 'Checking drug-diagnosis compatibility', detail: `Amoxicillin 500mg \u2194 J06.9 \u2192 Compatible (antibacterial for URTI)\nParacetamol 500mg \u2194 J06.9 \u2192 Compatible (antipyretic)\nNo formulary conflicts detected`, status: 'pending', durationMs: 1200, icon: 'shield' },

    // 2. Eligibility check
    { agent: 'EligibilityAgent', action: 'Checking active panels for patient', detail: `IC: ${ic} \u2192 Querying 6 TPA databases...\nMiCare: Active \u2022 MediExpress: Active \u2022 PMCare: Active\nIHP: Not covered \u2022 SelCare: Active \u2022 PeKa B40: Active`, status: 'pending', durationMs: 1800, icon: 'check' },
    { agent: 'EligibilityAgent', action: 'Selecting best route per TPA', detail: `MiCare \u2192 API (fastest, avg 340ms response)\nMediExpress \u2192 Portal (no API available)\nPMCare \u2192 App bridge (provider app v3.2)`, status: 'pending', durationMs: 1000, icon: 'globe' },

    // 3. TPA Submissions
    { agent: 'SubmissionAgent', action: 'Submitting to MiCare via API', detail: `POST https://api.micare.com.my/v2/claims\nPayload: { patient_ic, diagnosis, line_items, provider_id }\nResponse: 201 Created \u2022 Ref: MC-2026-${Date.now().toString(36).slice(-6).toUpperCase()}`, status: 'pending', durationMs: 1500, icon: 'globe' },
    { agent: 'SubmissionAgent', action: 'Submitting to MediExpress via Portal', detail: `Opening mediexpress.com.my/provider/claims/new\nAuthenticated as clinicmate_vani@*** \u2022 2FA verified\nFilling form: patient IC, diagnosis, line items...\nClick Submit \u2192 Ref: ME-${Date.now().toString(36).slice(-6).toUpperCase()}`, status: 'pending', durationMs: 2200, icon: 'monitor' },
    { agent: 'SubmissionAgent', action: 'Submitting to PMCare via App', detail: `Launching PMCare Provider App v3.2\nNavigating: New Claim \u2192 Patient Lookup \u2192 ${ic}\nUploading claim details and line items...\nSubmitted \u2022 Ref: PMC-${Date.now().toString(36).slice(-6).toUpperCase()}`, status: 'pending', durationMs: 1800, icon: 'app' },

    // 4. Post-submission
    { agent: 'SubmissionAgent', action: 'Skipping IHP (patient not covered)', detail: `IC ${ic} not found in IHP database\nSkipping submission to avoid rejection`, status: 'pending', durationMs: 600, icon: 'clock' },
    { agent: 'AuditAgent', action: 'Recording audit trail', detail: `Claim submitted to 3/5 TPAs \u2022 1 skipped (not covered) \u2022 1 skipped (inactive)\nAudit ID: AUD-${Date.now().toString(36).toUpperCase()}\nTimestamp: ${new Date().toISOString()}`, status: 'pending', durationMs: 800, icon: 'bot' },
    { agent: 'MonitorAgent', action: 'Setting up payment tracking', detail: `MiCare: monitoring for payment (avg 62 days)\nMediExpress: monitoring for payment (avg 78 days)\nPMCare: monitoring for payment (avg 58 days)\nAuto-sweep scheduled for outstanding claims`, status: 'pending', durationMs: 1000, icon: 'clock' },
  ];
}

const ICON_MAP = {
  bot: Bot, shield: Shield, globe: Globe, check: FileCheck, phone: Phone, monitor: Monitor, app: Smartphone, clock: Clock,
};

export function Submit() {
  const [state, setState] = useState<SubmitState>('form');
  const [ic, setIc] = useState('920101-10-1234');
  const [serviceDate, setServiceDate] = useState('2026-05-24');
  const [diagnosis, setDiagnosis] = useState('J06.9 \u2014 Acute URTI, unspecified');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, description: 'Consultation fee', qty: 1, unitPrice: 35 },
    { id: 2, description: 'Amoxicillin 500mg (15 caps)', qty: 1, unitPrice: 12 },
    { id: 3, description: 'Paracetamol 500mg (20 tabs)', qty: 1, unitPrice: 5 },
  ]);
  const [pipeline, setPipeline] = useState<PipelineStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const logRef = useRef<HTMLDivElement>(null);

  const total = lineItems.reduce((s, li) => s + li.qty * li.unitPrice, 0);
  const patient = PATIENTS.find((p) => p.icNumber === ic);

  // Auto-scroll pipeline
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [currentStep]);

  // Pipeline runner
  useEffect(() => {
    if (state !== 'submitting' || currentStep < 0) return;
    if (currentStep >= pipeline.length) {
      setTimeout(() => setState('success'), 500);
      return;
    }

    // Mark current as running
    setPipeline((prev) => prev.map((s, i) => i === currentStep ? { ...s, status: 'running' } : s));

    const timer = setTimeout(() => {
      // Mark as done or skipped
      const isSkip = pipeline[currentStep].action.includes('Skipping');
      setPipeline((prev) => prev.map((s, i) => i === currentStep ? { ...s, status: isSkip ? 'skipped' : 'done' } : s));
      setCurrentStep((i) => i + 1);
    }, pipeline[currentStep].durationMs);

    return () => clearTimeout(timer);
  }, [state, currentStep, pipeline.length]);

  function addLine() {
    setLineItems((prev) => [...prev, { id: Date.now(), description: '', qty: 1, unitPrice: 0 }]);
  }
  function removeLine(id: number) {
    setLineItems((prev) => prev.filter((li) => li.id !== id));
  }
  function updateLine(id: number, field: keyof LineItem, value: string | number) {
    setLineItems((prev) => prev.map((li) => li.id === id ? { ...li, [field]: value } : li));
  }

  function submitClaim() {
    const p = buildPipeline(patient, ic, diagnosis, total, lineItems.length);
    setPipeline(p);
    setCurrentStep(0);
    setState('submitting');
  }

  // Extract refs from completed pipeline
  const submissionRefs = pipeline
    .filter((s) => s.status === 'done' && s.action.startsWith('Submitting to'))
    .map((s) => {
      const ref = s.detail.match(/Ref:\s*(\S+)/)?.[1] ?? '';
      const tpa = s.action.match(/Submitting to (\w+)/)?.[1] ?? '';
      return { tpa, ref };
    });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl text-ink">Submit Claim</h2>
        <p className="text-body text-sm mt-1">
          SubmissionAgent validates, checks eligibility, and routes claims to the right TPAs automatically
        </p>
      </div>

      <AnimatePresence mode="wait">
        {state === 'form' && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-surface border border-border rounded-lg p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1.5">Patient IC</label>
                  <input value={ic} onChange={(e) => setIc(e.target.value)} className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-ink font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-ring transition-colors" />
                  {patient && <p className="text-xs text-positive mt-1 font-mono">Found: {patient.fullName}</p>}
                </div>
                <div>
                  <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1.5">Service Date</label>
                  <input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-ink font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-ring transition-colors" />
                </div>
              </div>

              <div>
                <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1.5">Diagnosis (ICD-10)</label>
                <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-ink font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-ring transition-colors" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-mono text-xs text-muted uppercase tracking-wide">Line Items</label>
                  <button onClick={addLine} className="flex items-center gap-1 text-xs text-primary hover:text-primary-deep font-medium transition-colors" type="button">
                    <Plus size={14} /> Add line
                  </button>
                </div>
                <div className="space-y-2">
                  {lineItems.map((li) => (
                    <div key={li.id} className="flex items-center gap-2">
                      <input value={li.description} onChange={(e) => updateLine(li.id, 'description', e.target.value)} placeholder="Description" className="flex-1 px-3 py-2 rounded-md bg-background border border-border text-ink text-sm font-mono focus:outline-none focus:border-primary transition-colors" />
                      <input type="number" value={li.qty} onChange={(e) => updateLine(li.id, 'qty', parseInt(e.target.value) || 0)} className="w-16 px-2 py-2 rounded-md bg-background border border-border text-ink text-sm font-mono text-center focus:outline-none focus:border-primary transition-colors" />
                      <input type="number" value={li.unitPrice} onChange={(e) => updateLine(li.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-24 px-2 py-2 rounded-md bg-background border border-border text-ink text-sm font-mono text-right focus:outline-none focus:border-primary transition-colors" />
                      <button onClick={() => removeLine(li.id)} className="p-1 text-muted hover:text-danger transition-colors" type="button">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-2 pt-2 border-t border-border">
                  <span className="font-display text-lg tabular-nums text-ink">Total: RM {total.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={submitClaim} className="bg-primary text-white hover:bg-primary-deep px-6 py-3 rounded-md font-medium transition-colors flex items-center gap-2" type="button">
                <Send size={16} />
                Submit to all eligible TPAs
              </button>
            </div>
          </motion.div>
        )}

        {state === 'submitting' && (
          <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              {/* Header */}
              <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-surface-elevated">
                <div className="flex items-center gap-2">
                  <motion.div className="w-2 h-2 rounded-full bg-primary" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                  <span className="font-mono text-sm text-ink font-medium">Claim Submission Pipeline</span>
                </div>
                <span className="font-mono text-[10px] text-muted">
                  Step {Math.min(currentStep + 1, pipeline.length)} of {pipeline.length}
                </span>
              </div>

              {/* Progress */}
              <div className="h-1 bg-border/30">
                <motion.div className="h-full bg-primary" animate={{ width: `${(currentStep / pipeline.length) * 100}%` }} transition={{ duration: 0.3 }} />
              </div>

              {/* Steps */}
              <div ref={logRef} className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                {pipeline.map((step, i) => {
                  const Icon = ICON_MAP[step.icon];
                  const isRunning = step.status === 'running';
                  const isDone = step.status === 'done';
                  const isSkipped = step.status === 'skipped';
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: step.status === 'pending' ? 0.35 : 1, y: 0 }}
                      className={`flex items-start gap-3 py-2.5 px-3 rounded-md transition-colors ${
                        isRunning ? 'bg-primary-soft/20 border border-primary/10' : ''
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isRunning ? (
                          <Loader2 size={16} className="text-primary animate-spin" />
                        ) : isDone ? (
                          <CheckCircle size={16} className="text-positive" />
                        ) : isSkipped ? (
                          <AlertTriangle size={16} className="text-amber" />
                        ) : (
                          <Icon size={16} className="text-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-primary">{step.agent}</span>
                          <span className="text-sm text-ink font-medium">{step.action}</span>
                        </div>
                        <p className="font-mono text-[11px] text-body mt-0.5 whitespace-pre-wrap leading-relaxed">{step.detail}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {state === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-positive-soft border border-positive/20 rounded-lg p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-positive/10 flex items-center justify-center">
                  <CheckCircle size={22} className="text-positive" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-ink">Claim submitted successfully</h3>
                  <p className="text-sm text-body">Routed to {submissionRefs.length} TPAs {'\u2022'} 1 skipped (not covered) {'\u2022'} audit trail recorded</p>
                </div>
              </div>

              {/* TPA References */}
              <div className="bg-surface border border-border rounded-md p-4 space-y-2">
                <p className="font-mono text-xs text-muted uppercase">Submission References</p>
                {submissionRefs.map((r) => (
                  <div key={r.ref} className="flex items-center justify-between text-sm">
                    <span className="text-body">{r.tpa}</span>
                    <span className="font-mono text-xs text-primary">{r.ref}</span>
                  </div>
                ))}
              </div>

              {/* Claim summary */}
              <div className="bg-surface border border-border rounded-md p-4 text-xs font-mono text-muted space-y-1">
                <p>Patient: {patient?.fullName ?? ic} {'\u2022'} IC: {ic}</p>
                <p>Diagnosis: {diagnosis}</p>
                <p>Total: RM {total.toFixed(2)} {'\u2022'} {lineItems.length} line items</p>
                <p>Submitted: {new Date().toLocaleString('en-MY')}</p>
              </div>

              {/* What happens next */}
              <div className="bg-surface border border-border rounded-md p-4">
                <p className="font-mono text-xs text-muted uppercase mb-2">What happens next</p>
                <div className="space-y-1.5 text-xs text-body">
                  <p>{'\u2022'} MonitorAgent is tracking payment for all 3 TPAs</p>
                  <p>{'\u2022'} Auto-sweep will check status on Day 30, 45, 60, 90</p>
                  <p>{'\u2022'} If TPA queries the claim, you will be notified immediately</p>
                  <p>{'\u2022'} Payment will be auto-matched to remittance on arrival</p>
                </div>
              </div>

              <button onClick={() => { setState('form'); setCurrentStep(-1); setPipeline([]); }} className="text-sm text-primary hover:text-primary-deep font-medium transition-colors" type="button">
                Submit another claim {'\u2192'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
