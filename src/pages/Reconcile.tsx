import { useReducer, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, AlertCircle, AlertTriangle } from 'lucide-react';
import { AgentCard } from '../cinematic/components/AgentCard';
import { ResultCard } from '../cinematic/components/ResultCard';
import { EXCEPTIONS_DEMO, CLINIC } from '../data/seed';
import { formatRM } from '../lib/utils';
import { AppealDrawer } from './reconcile/AppealDrawer';
import { CheckCircle, Info } from 'lucide-react';

type Phase = 'idle' | 'ingesting' | 'matching' | 'variance' | 'analytics' | 'complete';
type Action = { type: 'START' } | { type: 'ADVANCE' };

const PIPELINE_STEPS: { phase: Phase; agentName: string; model: string; durationMs: number; result: string }[] = [
  { phase: 'ingesting', agentName: 'IngestionAgent', model: 'DeepSeek Chat', durationMs: 1500, result: '✓ Extracted 107 line items in 1.3s' },
  { phase: 'matching', agentName: 'MatchingAgent', model: 'DeepSeek Chat', durationMs: 2500, result: '✓ 98/107 matched' },
  { phase: 'variance', agentName: 'VarianceAgent', model: 'DeepSeek Chat', durationMs: 3000, result: '✓ 31 variances · 6 UNEXPLAINED' },
  { phase: 'analytics', agentName: 'AnalyticsAgent', model: 'DeepSeek Chat', durationMs: 1500, result: '✓ Dashboard updated' },
];

function reducer(state: { phase: Phase; stepIdx: number }, action: Action): { phase: Phase; stepIdx: number } {
  switch (action.type) {
    case 'START':
      return { phase: 'ingesting', stepIdx: 0 };
    case 'ADVANCE': {
      const next = state.stepIdx + 1;
      if (next >= PIPELINE_STEPS.length) return { phase: 'complete', stepIdx: next };
      return { phase: PIPELINE_STEPS[next].phase, stepIdx: next };
    }
    default:
      return state;
  }
}

export function Reconcile() {
  const [state, dispatch] = useReducer(reducer, { phase: 'idle', stepIdx: -1 });
  const [appealException, setAppealException] = useState<typeof EXCEPTIONS_DEMO[number] | null>(null);

  function startPipeline() {
    dispatch({ type: 'START' });
    let step = 0;
    function advanceNext() {
      if (step >= PIPELINE_STEPS.length) return;
      setTimeout(() => {
        dispatch({ type: 'ADVANCE' });
        step++;
        advanceNext();
      }, PIPELINE_STEPS[step].durationMs);
    }
    setTimeout(() => {
      step++;
      advanceNext();
    }, PIPELINE_STEPS[0].durationMs);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl text-ink">Multi-TPA Remittance Reconciliation</h2>
        <p className="text-body text-sm mt-1">5 agents · PDFs in, exceptions out</p>
      </div>

      {/* Upload Zone */}
      {state.phase === 'idle' && (
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center bg-surface/30">
          <FileUp size={40} className="mx-auto text-muted mb-4" />
          <p className="font-display text-xl text-body">Drop remittance PDFs here</p>
          <p className="text-xs text-muted mt-1">Supports PDF, Excel, CSV</p>
          <p className="text-muted text-sm my-4">— OR —</p>
          <button
            onClick={startPipeline}
            className="bg-primary text-white hover:bg-primary-deep px-6 py-3 rounded-md font-medium transition-colors"
            type="button"
          >
            Try Dr. Vani's actual remittances →
          </button>
          <p className="text-xs text-muted mt-2">5 sample remittances · MiCare, MediExpress, IHP, PMCare, PeKa B40</p>
        </div>
      )}

      {/* Agent Pipeline */}
      {state.phase !== 'idle' && (
        <div className="space-y-3">
          {PIPELINE_STEPS.map((step, i) => {
            const status =
              state.stepIdx > i ? 'done' :
              state.stepIdx === i ? 'working' : 'idle';
            return (
              <motion.div
                key={step.agentName}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: status === 'idle' ? 0.5 : 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <AgentCard
                  icon={FileUp}
                  name={step.agentName}
                  model={step.model}
                  status={status}
                  statusText={status === 'working' ? `Processing...` : undefined}
                  resultText={status === 'done' ? step.result : undefined}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Results */}
      {state.phase === 'complete' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResultCard label="MATCHED CORRECTLY" value="RM 27,420" valueColor="positive" sublabel="92 lines across 5 TPAs" icon={CheckCircle} pulse={false} />
            <ResultCard label="EXPLAINED VARIANCES" value="RM 5,180" valueColor="amber" sublabel="13 lines · formulary caps" icon={Info} pulse={false} />
            <ResultCard label="UNEXPLAINED" value="RM 6,210" valueColor="danger" sublabel="6 lines · 3 TPAs · letters ready" icon={AlertCircle} pulse={true} />
          </div>
          <p className="text-xs text-muted font-mono mt-3">Total processed: RM 38,810 across 107 line items</p>

          {/* Exception Table */}
          <div className="mt-6 bg-surface/60 rounded-lg border border-border p-4 overflow-x-auto">
            <h3 className="font-display text-lg text-ink mb-3">Unexplained Exceptions</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-xs uppercase tracking-wider font-mono border-b border-border">
                  <th className="text-left py-2 px-2">Sev</th>
                  <th className="text-left py-2 px-2">TPA</th>
                  <th className="text-left py-2 px-2">Patient</th>
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-right py-2 px-2">Billed</th>
                  <th className="text-right py-2 px-2">Paid</th>
                  <th className="text-right py-2 px-2">Variance</th>
                  <th className="text-left py-2 px-2">Reason</th>
                  <th className="text-right py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {EXCEPTIONS_DEMO.map((exc) => (
                  <tr key={exc.id} className="border-b border-border/50 hover:bg-primary-soft/20">
                    <td className="py-2 px-2">
                      {exc.severity === 'high' ? (
                        <AlertCircle size={14} className="text-danger" />
                      ) : (
                        <AlertTriangle size={14} className="text-amber" />
                      )}
                    </td>
                    <td className="py-2 px-2 text-body">{exc.tpa}</td>
                    <td className="py-2 px-2 text-body">{exc.patient}</td>
                    <td className="py-2 px-2 font-mono text-xs text-muted">{exc.date}</td>
                    <td className="py-2 px-2 text-right font-display tabular-nums">{formatRM(exc.billed)}</td>
                    <td className="py-2 px-2 text-right font-display tabular-nums">{formatRM(exc.paid)}</td>
                    <td className="py-2 px-2 text-right font-display tabular-nums text-danger">
                      -{formatRM(exc.billed - exc.paid)}
                    </td>
                    <td className="py-2 px-2 text-xs text-muted max-w-48 truncate">{exc.reason}</td>
                    <td className="py-2 px-2 text-right">
                      <button
                        onClick={() => setAppealException(exc)}
                        className="text-xs text-primary hover:text-primary-deep font-medium transition-colors"
                        type="button"
                      >
                        Draft appeal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={6} className="py-2 px-2 text-right font-mono text-xs text-muted">Total unexplained:</td>
                  <td className="py-2 px-2 text-right font-display text-lg text-danger tabular-nums">
                    {formatRM(EXCEPTIONS_DEMO.reduce((s, e) => s + e.billed - e.paid, 0))}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>
      )}

      {/* Appeal Drawer */}
      <AnimatePresence>
        {appealException && (
          <AppealDrawer
            exception={appealException}
            clinic={CLINIC}
            onClose={() => setAppealException(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
