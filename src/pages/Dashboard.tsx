import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { CLAIMS, PATIENTS } from '../data/seed';
import { PAYERS } from '../data/payers';
import { formatRM, formatDateMY } from '../lib/utils';

const AGEING_BUCKETS = [
  { label: '0-30d', max: 30, color: 'bg-amber/40' },
  { label: '31-60d', max: 60, color: 'bg-amber' },
  { label: '61-90d', max: 90, color: 'bg-orange-500' },
  { label: '91-180d', max: 180, color: 'bg-danger/80' },
  { label: '180d+', max: Infinity, color: 'bg-danger' },
];

function computeKPIs() {
  const unpaid = CLAIMS.filter((c) => c.status !== 'paid');
  const outstanding = unpaid.reduce((sum, c) => sum + c.grossAmountRm, 0);
  const avgDays = unpaid.length > 0
    ? Math.round(unpaid.reduce((s, c) => s + c.daysOutstanding, 0) / unpaid.length)
    : 0;
  return { outstanding, avgDays, unpaidCount: unpaid.length };
}

function computeAgeingByPayer() {
  const unpaid = CLAIMS.filter((c) => c.status !== 'paid');
  const activePayers = PAYERS.filter((p) => unpaid.some((c) => c.payerId === p.id));

  return activePayers.map((payer) => {
    const payerClaims = unpaid.filter((c) => c.payerId === payer.id);
    const buckets = AGEING_BUCKETS.map((bucket, i) => {
      const min = i === 0 ? 0 : AGEING_BUCKETS[i - 1].max + 1;
      const amount = payerClaims
        .filter((c) => c.daysOutstanding >= min && c.daysOutstanding <= bucket.max)
        .reduce((s, c) => s + c.grossAmountRm, 0);
      return { ...bucket, amount };
    });
    const total = buckets.reduce((s, b) => s + b.amount, 0);
    return { payer, buckets, total };
  }).sort((a, b) => b.total - a.total);
}

function getOldestClaims() {
  return [...CLAIMS]
    .filter((c) => c.status !== 'paid')
    .sort((a, b) => b.daysOutstanding - a.daysOutstanding)
    .slice(0, 5);
}

function daysColor(days: number): string {
  if (days > 90) return 'text-danger';
  if (days > 60) return 'text-orange-500';
  if (days > 30) return 'text-amber';
  return 'text-body';
}

export function Dashboard() {
  const navigate = useNavigate();
  const kpis = computeKPIs();
  const ageing = computeAgeingByPayer();
  const oldest = getOldestClaims();
  const maxBarTotal = Math.max(...ageing.map((a) => a.total), 1);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-3xl text-ink">Selamat pagi, Dr. Vani.</h2>
        <p className="text-body text-base mt-1">Here's where your money is, this morning.</p>
        <p className="font-mono text-xs text-muted mt-1">Last synced 2 mins ago · 6 panels active</p>
      </div>

      {/* KPI Cards — clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Outstanding" value={formatRM(kpis.outstanding)} valueClass="text-amber" trend="+RM 2,140 vs last month" onClick={() => navigate('/status')} />
        <KPICard label="Avg days to pay" value={`${kpis.avgDays} days`} valueClass="text-ink" trend="MMA target: 30 days" onClick={() => navigate('/aggregate')} />
        <KPICard label="Unexplained deductions" value="RM 6,210" valueClass="text-danger" trend="6 appeals ready to send" onClick={() => navigate('/reconcile')} />
        <KPICard label="Active panels" value="6 TPAs" valueClass="text-primary" trend="Selcare: best · IHP: worst" onClick={() => navigate('/settings/connectors')} />
      </div>

      {/* CTA Banner */}
      <button
        onClick={() => navigate('/reconcile')}
        className="w-full bg-primary text-white rounded-lg px-6 py-4 flex items-center justify-between hover:bg-primary-deep transition-colors"
        type="button"
      >
        <span className="flex items-center gap-3">
          <Upload size={20} />
          <span className="font-medium">Drop your monthly TPA remittances for instant reconciliation</span>
        </span>
        <span className="text-sm font-mono opacity-80">Go to Reconcile →</span>
      </button>

      {/* Ageing Chart */}
      <section className="bg-surface rounded-lg border border-border p-6">
        <h3 className="font-display text-lg text-ink mb-4">Outstanding by panel</h3>
        <div className="space-y-3">
          {ageing.map(({ payer, buckets, total }) => (
            <div key={payer.id} className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted w-16 shrink-0 text-right">{payer.shortCode}</span>
              <div className="flex-1 flex h-6 rounded-sm overflow-hidden bg-surface-elevated">
                {buckets.map((b) =>
                  b.amount > 0 ? (
                    <div
                      key={b.label}
                      className={`${b.color} h-full`}
                      style={{ width: `${(b.amount / maxBarTotal) * 100}%` }}
                      title={`${b.label}: ${formatRM(b.amount)}`}
                    />
                  ) : null,
                )}
              </div>
              <span className="font-display text-sm tabular-nums text-ink w-24 text-right">{formatRM(total)}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 flex-wrap">
          {AGEING_BUCKETS.map((b) => (
            <span key={b.label} className="flex items-center gap-1 text-[10px] text-muted font-mono">
              <span className={`w-2 h-2 rounded-sm ${b.color}`} />
              {b.label}
            </span>
          ))}
        </div>
      </section>

      {/* Top 5 Oldest Claims */}
      <section className="bg-surface rounded-lg border border-border p-6">
        <h3 className="font-display text-lg text-ink mb-4">Top 5 oldest claims</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs uppercase tracking-wider font-mono border-b border-border">
                <th className="text-left py-2 px-2">Claim</th>
                <th className="text-left py-2 px-2">Patient</th>
                <th className="text-left py-2 px-2">Date</th>
                <th className="text-left py-2 px-2">Payer</th>
                <th className="text-left py-2 px-2">Status</th>
                <th className="text-right py-2 px-2">Days</th>
                <th className="text-right py-2 px-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {oldest.map((claim) => {
                const patient = PATIENTS.find((p) => p.id === claim.patientId);
                const payer = PAYERS.find((p) => p.id === claim.payerId);
                return (
                  <tr
                    key={claim.id}
                    className="border-b border-border/50 hover:bg-primary-soft/30 cursor-pointer transition-colors"
                    onClick={() => navigate('/status')}
                  >
                    <td className="py-2 px-2 font-mono text-xs">{claim.claimNo}</td>
                    <td className="py-2 px-2 text-body">{patient?.fullName ?? '—'}</td>
                    <td className="py-2 px-2 font-mono text-xs text-muted">{formatDateMY(claim.serviceDate)}</td>
                    <td className="py-2 px-2">
                      <span className="font-mono text-xs text-body">{payer?.shortCode}</span>
                    </td>
                    <td className="py-2 px-2">
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber" />
                        {claim.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`py-2 px-2 text-right font-display tabular-nums ${daysColor(claim.daysOutstanding)}`}>
                      {claim.daysOutstanding}
                    </td>
                    <td className="py-2 px-2 text-right font-display tabular-nums text-ink">{formatRM(claim.grossAmountRm)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function KPICard({ label, value, valueClass, trend, onClick }: {
  label: string; value: string; valueClass: string; trend: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-surface border border-border rounded-lg p-5 text-left hover:border-primary/30 hover:shadow-sm transition-all group"
      type="button"
    >
      <p className="font-mono text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className={`font-display text-2xl md:text-3xl tabular-nums mt-1 ${valueClass}`}>{value}</p>
      <p className="text-xs text-muted mt-1 group-hover:text-primary transition-colors">{trend}</p>
    </button>
  );
}
