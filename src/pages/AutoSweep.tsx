import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, CheckCircle, Clock, AlertTriangle, XCircle, Loader2, Timer, CalendarClock, RotateCcw } from 'lucide-react';
import { CLAIM_CHECK_QUEUE, SWEEP_RESPONSES } from '../data/seed';
import type { ClaimCheckEntry } from '../data/types';
import { formatRM } from '../lib/utils';

const OUTCOME_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  promised_date: { label: 'Promised date', color: 'text-primary', icon: CalendarClock },
  pending: { label: 'Still pending', color: 'text-amber', icon: Clock },
  approved: { label: 'Approved', color: 'text-positive', icon: CheckCircle },
  queried: { label: 'Queried', color: 'text-amber', icon: AlertTriangle },
  rejected: { label: 'Rejected', color: 'text-danger', icon: XCircle },
  paid: { label: 'Paid', color: 'text-positive', icon: CheckCircle },
  no_response: { label: 'No response', color: 'text-muted', icon: RotateCcw },
};

type SweepState = 'idle' | 'running' | 'paused' | 'done';

export function AutoSweep() {
  const [queue, setQueue] = useState<ClaimCheckEntry[]>(() => [...CLAIM_CHECK_QUEUE]);
  const [sweepState, setSweepState] = useState<SweepState>('idle');
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [sweepLog, setSweepLog] = useState<{ id: string; claimNo: string; tpa: string; outcome: string; response: string; cooldownDays: number }[]>([]);
  const [timerRef, setTimerRef] = useState<number | null>(null);

  const readyClaims = queue.filter((c) => c.queueStatus === 'ready');
  const snoozedClaims = queue.filter((c) => c.queueStatus === 'snoozed');
  const resolvedClaims = queue.filter((c) => c.queueStatus === 'resolved');
  const totalReadyRm = readyClaims.reduce((s, c) => s + c.grossAmountRm, 0);

  const runSweep = useCallback(() => {
    const targets = queue.filter((c) => c.queueStatus === 'ready' && !c.lastOutcome?.startsWith('quer'));
    if (targets.length === 0) { setSweepState('done'); return; }
    setSweepState('running');
    let idx = 0;

    function processNext() {
      if (idx >= targets.length) {
        setSweepState('done');
        setCurrentIdx(-1);
        return;
      }

      const claim = targets[idx];
      setCurrentIdx(queue.findIndex((c) => c.id === claim.id));

      // Update to checking
      setQueue((prev) => prev.map((c) => c.id === claim.id ? { ...c, queueStatus: 'checking' as const } : c));

      const resp = SWEEP_RESPONSES[claim.id];
      const delayMs = 1500 + Math.random() * 2000;

      const t = window.setTimeout(() => {
        const now = new Date().toISOString();
        const outcome = resp?.outcome ?? 'pending';
        const response = resp?.response ?? 'Status: in review. No further update.';
        const cooldownDays = resp?.cooldownDays ?? 7;
        const snoozedUntil = new Date(Date.now() + cooldownDays * 86400000).toISOString().slice(0, 10);

        // Update claim in queue
        setQueue((prev) => prev.map((c) => c.id === claim.id ? {
          ...c,
          lastCheckedAt: now,
          lastOutcome: outcome as ClaimCheckEntry['lastOutcome'],
          lastResponse: response,
          snoozedUntil: outcome === 'paid' ? null : snoozedUntil,
          cooldownDays,
          checkCount: c.checkCount + 1,
          queueStatus: outcome === 'paid' ? 'resolved' as const : 'snoozed' as const,
        } : c));

        // Add to sweep log
        setSweepLog((prev) => [{
          id: claim.id,
          claimNo: claim.claimNo,
          tpa: claim.tpaName,
          outcome,
          response,
          cooldownDays,
        }, ...prev]);

        idx++;
        processNext();
      }, delayMs);

      setTimerRef(t);
    }

    processNext();
  }, [queue]);

  function pauseSweep() {
    if (timerRef) window.clearTimeout(timerRef);
    setSweepState('paused');
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl text-ink">Autonomous Status Sweep</h2>
        <p className="text-body text-sm mt-1">
          StatusAgent checks all outstanding claims with TPAs, logs results, and knows when to check again
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Ready to check" value={String(readyClaims.length)} subtext={`${formatRM(totalReadyRm)} outstanding`} color="text-primary" />
        <SummaryCard label="Snoozed" value={String(snoozedClaims.length)} subtext="Waiting for promised dates" color="text-amber" />
        <SummaryCard label="Resolved" value={String(resolvedClaims.length)} subtext="Payment confirmed" color="text-positive" />
        <SummaryCard label="Total queue" value={String(queue.length)} subtext="Dr. Vani's clinic" color="text-ink" />
      </div>

      {/* Control Bar */}
      <div className="bg-surface border border-border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {sweepState === 'idle' || sweepState === 'done' ? (
            <button
              onClick={runSweep}
              disabled={readyClaims.length === 0}
              className="bg-primary text-white hover:bg-primary-deep disabled:opacity-40 px-5 py-2.5 rounded-md font-medium flex items-center gap-2 transition-colors"
              type="button"
            >
              <Play size={16} fill="currentColor" />
              {sweepState === 'done' ? 'Run again' : `Sweep ${readyClaims.length} claims`}
            </button>
          ) : sweepState === 'running' ? (
            <button
              onClick={pauseSweep}
              className="bg-amber text-white px-5 py-2.5 rounded-md font-medium flex items-center gap-2"
              type="button"
            >
              <Pause size={16} />
              Pause sweep
            </button>
          ) : (
            <button
              onClick={runSweep}
              className="bg-primary text-white hover:bg-primary-deep px-5 py-2.5 rounded-md font-medium flex items-center gap-2"
              type="button"
            >
              <Play size={16} fill="currentColor" />
              Resume
            </button>
          )}
          {sweepState === 'running' && (
            <span className="flex items-center gap-2 text-sm text-body">
              <Loader2 size={14} className="animate-spin text-primary" />
              Checking claim {Math.min(currentIdx + 1, readyClaims.length)} of {readyClaims.length}...
            </span>
          )}
          {sweepState === 'done' && (
            <span className="flex items-center gap-2 text-sm text-positive font-medium">
              <CheckCircle size={14} />
              Sweep complete · {sweepLog.length} claims checked
            </span>
          )}
        </div>
        <p className="text-xs text-muted font-mono hidden sm:block">
          Smart cooldown: agent won't re-check until promised dates expire
        </p>
      </div>

      {/* Live Sweep Log */}
      <AnimatePresence>
        {sweepLog.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-lg p-5"
          >
            <h3 className="font-display text-lg text-ink mb-3">Sweep Results</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sweepLog.map((entry, i) => {
                const config = OUTCOME_CONFIG[entry.outcome] ?? OUTCOME_CONFIG.pending;
                const Icon = config.icon;
                return (
                  <motion.div
                    key={`${entry.id}-${i}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0"
                  >
                    <Icon size={16} className={`${config.color} shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-ink font-medium">{entry.claimNo}</span>
                        <span className="text-[10px] text-muted">{entry.tpa}</span>
                        <span className={`text-[10px] font-medium ${config.color}`}>{config.label}</span>
                        {entry.cooldownDays > 0 && entry.outcome !== 'paid' && (
                          <span className="flex items-center gap-0.5 text-[10px] text-muted font-mono">
                            <Timer size={10} />
                            snooze {entry.cooldownDays}d
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-body mt-0.5">{entry.response}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-display text-base text-ink">Full Claim Queue</h3>
          <div className="flex items-center gap-3 text-xs text-muted font-mono">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> ready</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber" /> snoozed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-positive" /> resolved</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs uppercase tracking-wider font-mono border-b border-border">
                <th className="text-left py-2.5 px-3 w-8"></th>
                <th className="text-left py-2.5 px-3">Claim</th>
                <th className="text-left py-2.5 px-3">Patient</th>
                <th className="text-left py-2.5 px-3">TPA</th>
                <th className="text-right py-2.5 px-3">Amount</th>
                <th className="text-right py-2.5 px-3">Days</th>
                <th className="text-left py-2.5 px-3">Last outcome</th>
                <th className="text-left py-2.5 px-3">Snooze until</th>
                <th className="text-right py-2.5 px-3">Checks</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((claim) => {
                const isChecking = claim.queueStatus === 'checking';
                const statusDot = claim.queueStatus === 'resolved' ? 'bg-positive'
                  : claim.queueStatus === 'snoozed' ? 'bg-amber'
                  : isChecking ? 'bg-primary animate-pulse'
                  : 'bg-primary';
                const outcomeConfig = claim.lastOutcome ? OUTCOME_CONFIG[claim.lastOutcome] : null;

                return (
                  <tr key={claim.id} className={`border-b border-border/50 transition-colors ${
                    isChecking ? 'bg-primary-soft/30' : 'hover:bg-primary-soft/10'
                  }`}>
                    <td className="py-2 px-3">
                      {isChecking ? (
                        <Loader2 size={14} className="text-primary animate-spin" />
                      ) : (
                        <span className={`block w-2 h-2 rounded-full ${statusDot}`} />
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-xs text-body">{claim.claimNo}</td>
                    <td className="py-2 px-3 text-body text-xs">{claim.patientName}</td>
                    <td className="py-2 px-3 font-mono text-xs">{claim.tpaName}</td>
                    <td className="py-2 px-3 text-right font-display tabular-nums text-xs">{formatRM(claim.grossAmountRm)}</td>
                    <td className={`py-2 px-3 text-right tabular-nums text-xs ${
                      claim.daysOutstanding > 60 ? 'text-danger' : claim.daysOutstanding > 30 ? 'text-amber' : 'text-body'
                    }`}>
                      {claim.daysOutstanding > 0 ? claim.daysOutstanding : '—'}
                    </td>
                    <td className="py-2 px-3">
                      {outcomeConfig ? (
                        <span className={`text-[11px] font-medium ${outcomeConfig.color}`}>{outcomeConfig.label}</span>
                      ) : (
                        <span className="text-[11px] text-muted">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-muted">
                      {claim.snoozedUntil ?? '—'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[11px] text-muted">{claim.checkCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart Logic Explanation */}
      <div className="bg-surface-elevated border border-border rounded-lg p-5">
        <h4 className="font-display text-sm text-ink mb-3">How the smart cooldown works</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-body">
          <div>
            <p className="font-mono text-primary text-[10px] uppercase mb-1">Check</p>
            <p>StatusAgent contacts TPA portal/API for each claim in the ready queue. Logs the response.</p>
          </div>
          <div>
            <p className="font-mono text-amber text-[10px] uppercase mb-1">Snooze</p>
            <p>If TPA says "payment in 7 days", agent marks claim as snoozed until that date. Won't bother TPA again until deadline passes.</p>
          </div>
          <div>
            <p className="font-mono text-danger text-[10px] uppercase mb-1">Escalate</p>
            <p>If snooze expires and money still hasn't arrived, claim returns to ready queue. After 3+ checks, FollowUpAgent sends escalation notice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, subtext, color }: { label: string; value: string; subtext: string; color: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <p className="font-mono text-[10px] text-muted uppercase tracking-wide">{label}</p>
      <p className={`font-display text-2xl tabular-nums mt-1 ${color}`}>{value}</p>
      <p className="text-[11px] text-muted mt-0.5">{subtext}</p>
    </div>
  );
}
