import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, XCircle, Loader2, Shield } from 'lucide-react';
import { getEligibilityResults, type EligibilityCheckResult } from '../data/seed';
import { formatRM } from '../lib/utils';

type CheckState = 'idle' | 'checking' | 'done';

export function Eligibility() {
  const [ic, setIc] = useState('920101-10-1234');
  const [state, setState] = useState<CheckState>('idle');
  const [results, setResults] = useState<EligibilityCheckResult[]>([]);
  const [progress, setProgress] = useState(0);

  const runCheck = useCallback(() => {
    if (!ic.trim()) return;
    setState('checking');
    setResults([]);
    setProgress(0);

    const allResults = getEligibilityResults(ic);
    let idx = 0;

    const timer = setInterval(() => {
      if (idx >= allResults.length) {
        clearInterval(timer);
        setState('done');
        return;
      }
      setResults((prev) => [...prev, allResults[idx]]);
      setProgress(((idx + 1) / allResults.length) * 100);
      idx++;
    }, 600);
  }, [ic]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl text-ink">Eligibility Check</h2>
        <p className="text-body text-sm mt-1">
          Verify patient coverage across all panels simultaneously · 
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={ic}
              onChange={(e) => setIc(e.target.value)}
              placeholder="Enter IC Number (e.g. 920101-10-1234)"
              className="w-full pl-9 pr-4 py-3 rounded-md bg-background border border-border text-ink font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-ring transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && runCheck()}
            />
          </div>
          <button
            onClick={runCheck}
            disabled={state === 'checking'}
            className="bg-primary text-white hover:bg-primary-deep disabled:opacity-60 px-6 py-3 rounded-md font-medium transition-colors flex items-center gap-2 shrink-0"
            type="button"
          >
            {state === 'checking' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Shield size={16} />
                Check all 6 panels
              </>
            )}
          </button>
        </div>

        {/* Progress bar */}
        {state === 'checking' && (
          <div className="mt-3 h-1 rounded-full bg-surface-elevated overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {results.map((r, i) => (
              <motion.div
                key={r.payerId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-surface border rounded-lg p-4 ${
                  r.status === 'active' ? 'border-positive/30' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-sm font-medium text-ink">{r.tpaName}</span>
                  {r.status === 'active' ? (
                    <span className="flex items-center gap-1 text-xs text-positive font-medium">
                      <CheckCircle size={14} />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted font-medium">
                      <XCircle size={14} />
                      Not covered
                    </span>
                  )}
                </div>

                {r.status === 'active' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted">Plan</span>
                      <span className="font-mono text-body">{r.planName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Remaining limit</span>
                      <span className="font-display tabular-nums text-ink font-medium">
                        {formatRM(r.remainingLimitRm!)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Visit cap</span>
                      <span className="font-mono text-body">{formatRM(r.visitCapRm!)}</span>
                    </div>
                    {r.copayRm! > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted">Co-pay</span>
                        <span className="font-mono text-amber">{formatRM(r.copayRm!)}</span>
                      </div>
                    )}
                    {r.notes && (
                      <p className="text-muted mt-1 pt-2 border-t border-border">{r.notes}</p>
                    )}
                  </div>
                )}

                {r.status === 'not_covered' && r.notes && (
                  <p className="text-xs text-muted">{r.notes}</p>
                )}

                <p className="text-[10px] text-muted font-mono mt-2 text-right">{r.latencyMs}ms</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      {state === 'done' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-positive-soft border border-positive/20 rounded-lg p-4 flex items-center gap-3"
        >
          <CheckCircle size={20} className="text-positive shrink-0" />
          <div>
            <p className="text-sm text-ink font-medium">
              {results.filter((r) => r.status === 'active').length} active panels found for IC {ic}
            </p>
            <p className="text-xs text-body mt-0.5">
              Highest limit: {formatRM(Math.max(...results.filter((r) => r.status === 'active').map((r) => r.remainingLimitRm ?? 0)))} ·
              Ready to proceed to claim submission
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
