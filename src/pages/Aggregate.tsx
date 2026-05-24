import { formatRM } from '../lib/utils';

const AGGREGATE_DATA = [
  { tpa: 'MiCare', clinics: 342, avgDays: 62, totalOutstanding: 2_140_000, unexplained: 410_000 },
  { tpa: 'MediExpress', clinics: 287, avgDays: 78, totalOutstanding: 1_870_000, unexplained: 620_000 },
  { tpa: 'IHP', clinics: 198, avgDays: 94, totalOutstanding: 1_420_000, unexplained: 890_000 },
  { tpa: 'PMCare', clinics: 156, avgDays: 58, totalOutstanding: 890_000, unexplained: 120_000 },
  { tpa: 'SelCare', clinics: 89, avgDays: 30, totalOutstanding: 310_000, unexplained: 45_000 },
  { tpa: 'PeKa B40', clinics: 412, avgDays: 45, totalOutstanding: 1_560_000, unexplained: 180_000 },
];

export function Aggregate() {
  const totalUnexplained = AGGREGATE_DATA.reduce((s, d) => s + d.unexplained, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl text-ink">MMA Industry Aggregate</h2>
        <p className="text-body text-sm mt-1">Anonymized data across 1,000+ solo GP clinics · the evidence base MMA needs</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="font-mono text-xs text-muted uppercase">Total unexplained</p>
          <p className="font-display text-3xl tabular-nums text-danger mt-1">{formatRM(totalUnexplained)}</p>
          <p className="text-xs text-muted mt-1">across 6 TPAs · this month</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="font-mono text-xs text-muted uppercase">Clinics reporting</p>
          <p className="font-display text-3xl tabular-nums text-primary mt-1">1,484</p>
          <p className="text-xs text-muted mt-1">of 9,600+ solo GPs</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="font-mono text-xs text-muted uppercase">Avg days to pay</p>
          <p className="font-display text-3xl tabular-nums text-amber mt-1">71 days</p>
          <p className="text-xs text-muted mt-1">MMA target: 30 days</p>
        </div>
      </div>

      <div className="bg-surface/60 rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-xs uppercase tracking-wider font-mono border-b border-border">
              <th className="text-left py-3 px-3">TPA</th>
              <th className="text-right py-3 px-3">Clinics</th>
              <th className="text-right py-3 px-3">Avg Days</th>
              <th className="text-right py-3 px-3">Outstanding</th>
              <th className="text-right py-3 px-3">Unexplained</th>
            </tr>
          </thead>
          <tbody>
            {AGGREGATE_DATA.map((row) => (
              <tr key={row.tpa} className="border-b border-border/50 hover:bg-primary-soft/20">
                <td className="py-2.5 px-3 font-medium text-body">{row.tpa}</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{row.clinics}</td>
                <td className="py-2.5 px-3 text-right tabular-nums text-amber">{row.avgDays}</td>
                <td className="py-2.5 px-3 text-right font-display tabular-nums">{formatRM(row.totalOutstanding)}</td>
                <td className="py-2.5 px-3 text-right font-display tabular-nums text-danger">{formatRM(row.unexplained)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
