import { CLAIMS } from '../data/seed';
import { PATIENTS } from '../data/seed';
import { PAYERS } from '../data/payers';
import { formatRM, formatDateMY } from '../lib/utils';

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-primary/20 text-primary',
  acknowledged: 'bg-positive/20 text-positive',
  queried: 'bg-amber/20 text-amber',
  rejected: 'bg-danger/20 text-danger',
  paid: 'bg-positive/20 text-positive',
  approved_full: 'bg-positive/20 text-positive',
  approved_partial: 'bg-amber/20 text-amber',
  in_review: 'bg-primary/20 text-primary',
  draft: 'bg-muted/20 text-muted',
};

export function Status() {
  const activeClaims = CLAIMS.filter((c) => c.status !== 'paid').slice(0, 20);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl text-ink">Claim Status Tracker</h2>
        <p className="text-body text-sm mt-1">{CLAIMS.filter((c) => c.status !== 'paid').length} active claims across {PAYERS.length} panels</p>
      </div>

      <div className="bg-surface/60 rounded-lg border border-border overflow-x-auto">
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
            {activeClaims.map((claim) => {
              const patient = PATIENTS.find((p) => p.id === claim.patientId);
              const payer = PAYERS.find((p) => p.id === claim.payerId);
              return (
                <tr key={claim.id} className="border-b border-border/50 hover:bg-primary-soft/20">
                  <td className="py-2.5 px-3 font-mono text-xs text-body">{claim.claimNo}</td>
                  <td className="py-2.5 px-3 text-body">{patient?.fullName ?? '—'}</td>
                  <td className="py-2.5 px-3 font-mono text-xs">{payer?.shortCode}</td>
                  <td className="py-2.5 px-3 font-mono text-xs text-muted">{formatDateMY(claim.serviceDate)}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[claim.status] ?? 'text-muted'}`}>
                      {claim.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-display tabular-nums text-amber">{claim.daysOutstanding}</td>
                  <td className="py-2.5 px-3 text-right font-display tabular-nums">{formatRM(claim.grossAmountRm)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
