import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { PATIENTS } from '../data/seed';
import { PAYERS } from '../data/payers';

type LineItem = { id: number; description: string; qty: number; unitPrice: number };
type SubmitState = 'form' | 'submitting' | 'success';

const TPA_STEPS = [
  { name: 'Validating claim data', duration: 800 },
  { name: 'Routing to MiCare (API)', duration: 1200 },
  { name: 'Routing to MediExpress (Portal)', duration: 1500 },
  { name: 'Routing to PMCare (App)', duration: 1000 },
  { name: 'Generating audit trail', duration: 600 },
];

export function Submit() {
  const [state, setState] = useState<SubmitState>('form');
  const [ic, setIc] = useState('920101-10-1234');
  const [serviceDate, setServiceDate] = useState('2026-05-24');
  const [diagnosis, setDiagnosis] = useState('J06.9 — Acute URTI, unspecified');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, description: 'Consultation fee', qty: 1, unitPrice: 35 },
    { id: 2, description: 'Amoxicillin 500mg (15 caps)', qty: 1, unitPrice: 12 },
    { id: 3, description: 'Paracetamol 500mg (20 tabs)', qty: 1, unitPrice: 5 },
  ]);
  const [step, setStep] = useState(0);
  const [submissionRefs, setSubmissionRefs] = useState<string[]>([]);

  const total = lineItems.reduce((s, li) => s + li.qty * li.unitPrice, 0);
  const patient = PATIENTS.find((p) => p.icNumber === ic);

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
    setState('submitting');
    setStep(0);
    let idx = 0;
    const refs: string[] = [];
    const interval = setInterval(() => {
      if (idx >= TPA_STEPS.length) {
        clearInterval(interval);
        setSubmissionRefs(refs);
        setState('success');
        return;
      }
      if (idx >= 1 && idx <= 3) {
        refs.push(`${PAYERS[idx - 1].shortCode}-${Date.now().toString(36).toUpperCase()}`);
      }
      setStep(idx + 1);
      idx++;
    }, TPA_STEPS[idx]?.duration ?? 1000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl text-ink">Submit Claim</h2>
        <p className="text-body text-sm mt-1">
          SubmissionAgent auto-routes to the correct TPA portal · PRD 6.2
        </p>
      </div>

      <AnimatePresence mode="wait">
        {state === 'form' && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-surface border border-border rounded-lg p-6 space-y-5">
              {/* Patient + Date */}
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

              {/* Diagnosis */}
              <div>
                <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1.5">Diagnosis (ICD-10)</label>
                <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full px-3 py-2.5 rounded-md bg-background border border-border text-ink font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-ring transition-colors" />
              </div>

              {/* Line Items */}
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
          <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-surface border border-border rounded-lg p-6 space-y-3">
            <h3 className="font-display text-lg text-ink mb-4">Submitting claim...</h3>
            {TPA_STEPS.map((s, i) => (
              <div key={s.name} className={`flex items-center gap-3 py-2 ${i >= step ? 'opacity-40' : ''}`}>
                {i < step ? (
                  <CheckCircle size={16} className="text-positive shrink-0" />
                ) : i === step - 1 ? (
                  <Loader2 size={16} className="text-primary animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-border shrink-0" />
                )}
                <span className="text-sm text-body">{s.name}</span>
              </div>
            ))}
          </motion.div>
        )}

        {state === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-positive-soft border border-positive/20 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-positive" />
              <div>
                <h3 className="font-display text-lg text-ink">Claim submitted successfully</h3>
                <p className="text-sm text-body">Routed to 3 TPAs · audit trail recorded</p>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-md p-4 space-y-2">
              <p className="font-mono text-xs text-muted uppercase">Submission References</p>
              {submissionRefs.map((ref, i) => (
                <div key={ref} className="flex items-center justify-between text-sm">
                  <span className="text-body">{PAYERS[i]?.legalName}</span>
                  <span className="font-mono text-xs text-primary">{ref}</span>
                </div>
              ))}
            </div>
            <div className="bg-surface border border-border rounded-md p-4 text-xs font-mono text-muted space-y-1">
              <p>Patient: {patient?.fullName ?? ic} · IC: {ic}</p>
              <p>Diagnosis: {diagnosis}</p>
              <p>Total: RM {total.toFixed(2)} · {lineItems.length} line items</p>
              <p>Submitted: {new Date().toLocaleString('en-MY')}</p>
            </div>
            <button onClick={() => { setState('form'); setStep(0); }} className="text-sm text-primary hover:text-primary-deep font-medium transition-colors" type="button">
              Submit another claim →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
