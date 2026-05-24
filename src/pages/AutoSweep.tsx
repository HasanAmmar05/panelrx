import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle, Clock, AlertTriangle, XCircle, Loader2, Timer, CalendarClock, RotateCcw } from 'lucide-react';
import { CLAIM_CHECK_QUEUE, SWEEP_RESPONSES } from '../data/seed';
import type { ClaimCheckEntry } from '../data/types';
import { formatRM } from '../lib/utils';
import { SweepModal } from './sweep/SweepModal';

const OUTCOME_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  promised_date: { label: 'Promised date', color: 'text-primary', icon: CalendarClock },
  pending: { label: 'Still pending', color: 'text-amber', icon: Clock },
  approved: { label: 'Approved', color: 'text-positive', icon: CheckCircle },
  queried: { label: 'Queried', color: 'text-amber', icon: AlertTriangle },
  rejected: { label: 'Rejected', color: 'text-danger', icon: XCircle },
  paid: { label: 'Paid', color: 'text-positive', icon: CheckCircle },
  no_response: { label: 'No response', color: 'text-muted', icon: RotateCcw },
};

export function AutoSweep() {
  const [queue, setQueue] = useState<ClaimCheckEntry[]>(() => [...CLAIM_CHECK_QUEUE]);
  const [showModal, setShowModal] = useState(false);
  const [sweepLog, setSweepLog] = useState<{ id: string; claimNo: string; tpa: string; outcome: string; response: string; cooldownDays: number }[]>([]);

  const readyClaims = queue.filter((c) => c.queueStatus === 'ready');
  const snoozedClaims = queue.filter((c) => c.queueStatus === 'snoozed');
  const resolvedClaims = queue.filter((c) => c.queueStatus === 'resolved');
  const totalReadyRm = readyClaims.reduce((s, c) => s + c.grossAmountRm, 0);

  function handleSweepComplete(results: { id: string; outcome: string; response: string; cooldownDays: number }[]) {
    // Update queue based on results
    setQueue((prev) => prev.map((c) => {
      const result = results.find((r) => r.id === c.id);
      if (!result) return c;
      const snoozedUntil = result.outcome === 'paid' ? null : new Date(Date.now() + result.cooldownDays * 86400000).toISOString().slice(0, 10);
      return {
        ...c,
        lastCheckedAt: new Date().toISOString(),
        lastOutcome: result.outcome as ClaimCheckEntry['lastOutcome'],
        lastResponse: result.response,
        snoozedUntil,
        cooldownDays: result.cooldownDays,
        checkCount: c.checkCount + 1,
        queueStatus: result.outcome === 'paid' ? 'resolved' as const : 'snoozed' as const,
      };
    }));

    // Add to sweep log
    const logEntries = results.map((r) => {
      const claim = queue.find((c) => c.id === r.id);
      return { id: r.id, claimNo: claim?.claimNo ?? '', tpa: claim?.tpaName ?? '', ...r };
    });
    setSweepLog((prev) => [...logEntries.reverse(), ...prev]);
    setShowModal(false);
  }

  // Claims that will be swept (ready, not already queried)
  const sweepTargets = queue.filter((c) => c.queueStatus === 'ready' && c.lastOutcome !== 'queried');

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
        <SummaryCard label="Total queue" value={String(queue.length)} subtext="Dr. Vani\u2019s clinic" color="text-ink" />
      </div>

      {/* Control Bar */}
      <div className="bg-surface border border-border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            disabled={sweepTargets.length === 0}
            className="bg-primary text-white hover:bg-primary-deep disabled:opacity-40 px-5 py-2.5 rounded-md font-medium flex items-center gap-2 transition-colors"
            type="button"
          >
            <Play size={16} fill="currentColor" />
            {sweepLog.length > 0 ? 'Run again' : `Sweep ${sweepTargets.length} claims`}
          </button>
          {sweepLog.length > 0 && (
            <span className="flex items-center gap-2 text-sm text-positive font-medium">
              <CheckCircle size={14} />
              Last sweep: {sweepLog.length} claims checked
            </span>
          )}
        </div>
        <p className="text-xs text-muted font-mono hidden sm:block">
          Smart cooldown: agent won\u2019t re-check until promised dates expire
        </p>
      </div>

      {/* Sweep Summary Dashboard */}
      <AnimatePresence>
        {sweepLog.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Summary header */}
            <div className="bg-surface border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg text-ink">Sweep Summary</h3>
                <span className="font-mono text-xs text-muted">
                  {new Date().toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} {'\u2022'} {new Date().toLocaleTimeString('en-MY', { hour12: false })}
                </span>
              </div>

              {/* Outcome breakdown */}
              {(() => {
                const promised = sweepLog.filter((e) => e.outcome === 'promised_date').length;
                const pending = sweepLog.filter((e) => e.outcome === 'pending').length;
                const approved = sweepLog.filter((e) => e.outcome === 'approved').length;
                const noResp = sweepLog.filter((e) => e.outcome === 'no_response').length;
                const totalRm = sweepLog.reduce((s, e) => {
                  const claim = queue.find((c) => c.id === e.id);
                  return s + (claim?.grossAmountRm ?? 0);
                }, 0);
                const avgCooldown = Math.round(sweepLog.reduce((s, e) => s + e.cooldownDays, 0) / sweepLog.length);

                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <MiniCard label="Claims checked" value={String(sweepLog.length)} color="text-ink" />
                      <MiniCard label="Promised date" value={String(promised)} color="text-primary" />
                      <MiniCard label="Approved" value={String(approved)} color="text-positive" />
                      <MiniCard label="Still pending" value={String(pending)} color="text-amber" />
                      <MiniCard label="No response" value={String(noResp)} color="text-danger" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div className="bg-surface-elevated rounded-md border border-border p-3">
                        <p className="font-mono text-[10px] text-muted uppercase">Total outstanding checked</p>
                        <p className="font-display text-xl text-ink mt-1">RM {totalRm.toLocaleString()}</p>
                      </div>
                      <div className="bg-surface-elevated rounded-md border border-border p-3">
                        <p className="font-mono text-[10px] text-muted uppercase">Avg cooldown set</p>
                        <p className="font-display text-xl text-ink mt-1">{avgCooldown} days</p>
                      </div>
                      <div className="bg-surface-elevated rounded-md border border-border p-3">
                        <p className="font-mono text-[10px] text-muted uppercase">Next auto-check</p>
                        <p className="font-display text-xl text-primary mt-1">{new Date(Date.now() + avgCooldown * 86400000).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Detailed results */}
            <div className="bg-surface border border-border rounded-lg p-5">
              <h4 className="font-display text-sm text-ink mb-3">Detailed Results</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sweepLog.map((entry, i) => {
                  const config = OUTCOME_CONFIG[entry.outcome] ?? OUTCOME_CONFIG.pending;
                  const Icon = config.icon;
                  return (
                    <motion.div key={`${entry.id}-${i}`} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                      <Icon size={16} className={`${config.color} shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-ink font-medium">{entry.claimNo}</span>
                          <span className="text-[10px] text-muted">{entry.tpa}</span>
                          <span className={`text-[10px] font-medium ${config.color}`}>{config.label}</span>
                          {entry.cooldownDays > 0 && entry.outcome !== 'paid' && (
                            <span className="flex items-center gap-0.5 text-[10px] text-muted font-mono">
                              <Timer size={10} /> snooze {entry.cooldownDays}d
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-body mt-0.5">{entry.response}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
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
                const statusDot = claim.queueStatus === 'resolved' ? 'bg-positive'
                  : claim.queueStatus === 'snoozed' ? 'bg-amber'
                  : 'bg-primary';
                const outcomeConfig = claim.lastOutcome ? OUTCOME_CONFIG[claim.lastOutcome] : null;

                return (
                  <tr key={claim.id} className="border-b border-border/50 hover:bg-primary-soft/10 transition-colors">
                    <td className="py-2 px-3">
                      <span className={`block w-2 h-2 rounded-full ${statusDot}`} />
                    </td>
                    <td className="py-2 px-3 font-mono text-xs text-body">{claim.claimNo}</td>
                    <td className="py-2 px-3 text-body text-xs">{claim.patientName}</td>
                    <td className="py-2 px-3 font-mono text-xs">{claim.tpaName}</td>
                    <td className="py-2 px-3 text-right font-display tabular-nums text-xs">{formatRM(claim.grossAmountRm)}</td>
                    <td className={`py-2 px-3 text-right tabular-nums text-xs ${
                      claim.daysOutstanding > 60 ? 'text-danger' : claim.daysOutstanding > 30 ? 'text-amber' : 'text-body'
                    }`}>
                      {claim.daysOutstanding > 0 ? claim.daysOutstanding : '\u2014'}
                    </td>
                    <td className="py-2 px-3">
                      {outcomeConfig ? (
                        <span className={`text-[11px] font-medium ${outcomeConfig.color}`}>{outcomeConfig.label}</span>
                      ) : (
                        <span className="text-[11px] text-muted">\u2014</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-muted">
                      {claim.snoozedUntil ?? '\u2014'}
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
            <p>If TPA says &quot;payment in 7 days&quot;, agent marks claim as snoozed until that date. Won&apos;t bother TPA again until deadline passes.</p>
          </div>
          <div>
            <p className="font-mono text-danger text-[10px] uppercase mb-1">Escalate</p>
            <p>If snooze expires and money still hasn&apos;t arrived, claim returns to ready queue. After 3+ checks, FollowUpAgent sends escalation notice.</p>
          </div>
        </div>
      </div>

      {/* Immersive Sweep Modal */}
      <AnimatePresence>
        {showModal && (
          <SweepModal
            claims={sweepTargets}
            responses={SWEEP_RESPONSES}
            onComplete={handleSweepComplete}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
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

function MiniCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-surface-elevated rounded-md border border-border p-3 text-center">
      <p className={`font-display text-2xl tabular-nums ${color}`}>{value}</p>
      <p className="font-mono text-[9px] text-muted uppercase mt-0.5">{label}</p>
    </div>
  );
}
