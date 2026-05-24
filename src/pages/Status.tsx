import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, AlertTriangle, FileWarning, MessageSquare, Filter } from 'lucide-react';
import { CLAIMS, PATIENTS, FOLLOW_UPS, type FollowUp } from '../data/seed';
import { PAYERS } from '../data/payers';
import { formatRM, formatDateMY } from '../lib/utils';

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-primary/10 text-primary',
  acknowledged: 'bg-positive/10 text-positive',
  queried: 'bg-amber/10 text-amber',
  rejected: 'bg-danger/10 text-danger',
  paid: 'bg-positive/10 text-positive',
  approved_full: 'bg-positive/10 text-positive',
  approved_partial: 'bg-amber/10 text-amber',
  in_review: 'bg-primary/10 text-primary',
  draft: 'bg-surface-elevated text-muted',
};

const FOLLOW_UP_ICONS: Record<FollowUp['type'], typeof Mail> = {
  reminder: Mail,
  escalation: AlertTriangle,
  final_notice: FileWarning,
  response_received: MessageSquare,
};

const FOLLOW_UP_COLORS: Record<FollowUp['type'], string> = {
  reminder: 'text-primary bg-primary-soft',
  escalation: 'text-amber bg-amber-soft',
  final_notice: 'text-danger bg-danger-soft',
  response_received: 'text-positive bg-positive-soft',
};

type FilterStatus = 'all' | 'pending' | 'queried' | 'overdue';

export function Status() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const activeClaims = CLAIMS.filter((c) => c.status !== 'paid');

  const filtered = filter === 'all' ? activeClaims
    : filter === 'pending' ? activeClaims.filter((c) => ['submitted', 'acknowledged', 'in_review'].includes(c.status))
    : filter === 'queried' ? activeClaims.filter((c) => c.status === 'queried')
    : activeClaims.filter((c) => c.daysOutstanding > 60);

  const shown = filtered.slice(0, 25);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink">Claim Status Tracker</h2>
          <p className="text-body text-sm mt-1">
            {activeClaims.length} active claims ·  · FollowUpAgent handles overdue reminders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted" />
          {(['all', 'pending', 'queried', 'overdue'] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === f ? 'bg-primary-soft text-primary' : 'text-muted hover:text-body'
              }`}
              type="button"
            >
              {f === 'all' ? 'All' : f === 'overdue' ? 'Overdue 60d+' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-surface border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-xs uppercase tracking-wider font-mono border-b border-border">
              <th className="text-left py-3 px-3">Claim No</th>
              <th className="text-left py-3 px-3">Patient</th>
              <th className="text-left py-3 px-3">Payer</th>
              <th className="text-left py-3 px-3">Service Date</th>
              <th className="text-left py-3 px-3">Status</th>
              <th className="text-right py-3 px-3">Days</th>
              <th className="text-right py-3 px-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((claim) => {
              const patient = PATIENTS.find((p) => p.id === claim.patientId);
              const payer = PAYERS.find((p) => p.id === claim.payerId);
              return (
                <tr key={claim.id} className="border-b border-border/50 hover:bg-primary-soft/30 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-xs text-body">{claim.claimNo}</td>
                  <td className="py-2.5 px-3 text-body">{patient?.fullName ?? '—'}</td>
                  <td className="py-2.5 px-3 font-mono text-xs">{payer?.shortCode}</td>
                  <td className="py-2.5 px-3 font-mono text-xs text-muted">{formatDateMY(claim.serviceDate)}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[claim.status] ?? 'text-muted'}`}>
                      {claim.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`py-2.5 px-3 text-right font-display tabular-nums ${
                    claim.daysOutstanding > 90 ? 'text-danger' : claim.daysOutstanding > 60 ? 'text-amber' : 'text-body'
                  }`}>
                    {claim.daysOutstanding}
                  </td>
                  <td className="py-2.5 px-3 text-right font-display tabular-nums">{formatRM(claim.grossAmountRm)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length > 25 && (
          <div className="px-3 py-2 text-xs text-muted border-t border-border">
            Showing 25 of {filtered.length} claims
          </div>
        )}
      </div>

      {/* Follow-Up Agent Activity Feed */}
      <div className="bg-surface border border-border rounded-lg p-5">
        <h3 className="font-display text-lg text-ink mb-4">FollowUpAgent Activity</h3>
        <p className="text-xs text-muted mb-4">
          Autonomous reminders, escalations, and final notices sent to TPAs when claims are overdue
        </p>
        <div className="space-y-3">
          {FOLLOW_UPS.map((fu, i) => {
            const Icon = FOLLOW_UP_ICONS[fu.type];
            const colorClass = FOLLOW_UP_COLORS[fu.type];
            return (
              <motion.div
                key={fu.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 py-2"
              >
                <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-ink font-medium">{fu.tpaName}</span>
                    <span className="text-[10px] text-muted font-mono">{fu.claimNo}</span>
                    {fu.daysOverdue > 0 && (
                      <span className={`text-[10px] font-mono ${fu.daysOverdue > 30 ? 'text-danger' : 'text-amber'}`}>
                        {fu.daysOverdue}d overdue
                      </span>
                    )}
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      fu.status === 'acknowledged' ? 'bg-positive/10 text-positive'
                      : fu.status === 'ignored' ? 'bg-danger/10 text-danger'
                      : 'bg-surface-elevated text-muted'
                    }`}>
                      {fu.status}
                    </span>
                  </div>
                  <p className="text-xs text-body mt-0.5 leading-relaxed">{fu.message}</p>
                  <p className="text-[10px] text-muted font-mono mt-1">{new Date(fu.sentAt).toLocaleString('en-MY')}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
