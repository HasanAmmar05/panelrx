import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingDown, TrendingUp } from 'lucide-react';
import { formatRM } from '../lib/utils';

const AGGREGATE_DATA = [
  { tpa: 'MiCare', clinics: 342, avgDays: 62, totalOutstanding: 2_140_000, unexplained: 410_000, rejectionRate: 4.2, adminFee: 5, trend: 'up' as const,
    breakdown: [
      { clinic: 'Klinik Dr Vani', outstanding: 18_400, avgDays: 58, unexplained: 6_210 },
      { clinic: 'Klinik Shifa', outstanding: 22_100, avgDays: 71, unexplained: 4_800 },
      { clinic: 'Klinik Medisinar', outstanding: 15_600, avgDays: 45, unexplained: 2_100 },
    ]},
  { tpa: 'MediExpress', clinics: 287, avgDays: 78, totalOutstanding: 1_870_000, unexplained: 620_000, rejectionRate: 7.8, adminFee: 8, trend: 'up' as const,
    breakdown: [
      { clinic: 'Klinik Dr Vani', outstanding: 14_200, avgDays: 82, unexplained: 8_400 },
      { clinic: 'Klinik Harmoni', outstanding: 19_800, avgDays: 90, unexplained: 12_100 },
    ]},
  { tpa: 'IHP', clinics: 198, avgDays: 94, totalOutstanding: 1_420_000, unexplained: 890_000, rejectionRate: 12.1, adminFee: 0, trend: 'up' as const,
    breakdown: [
      { clinic: 'Klinik Dr Vani', outstanding: 11_300, avgDays: 104, unexplained: 9_200 },
    ]},
  { tpa: 'PMCare', clinics: 156, avgDays: 58, totalOutstanding: 890_000, unexplained: 120_000, rejectionRate: 2.1, adminFee: 3, trend: 'down' as const,
    breakdown: [
      { clinic: 'Klinik Dr Vani', outstanding: 8_900, avgDays: 52, unexplained: 1_200 },
    ]},
  { tpa: 'SelCare', clinics: 89, avgDays: 30, totalOutstanding: 310_000, unexplained: 45_000, rejectionRate: 1.3, adminFee: 0, trend: 'down' as const,
    breakdown: [
      { clinic: 'Klinik Dr Vani', outstanding: 3_100, avgDays: 28, unexplained: 0 },
    ]},
  { tpa: 'PeKa B40', clinics: 412, avgDays: 45, totalOutstanding: 1_560_000, unexplained: 180_000, rejectionRate: 3.5, adminFee: 0, trend: 'down' as const,
    breakdown: [
      { clinic: 'Klinik Dr Vani', outstanding: 5_200, avgDays: 42, unexplained: 800 },
    ]},
];

export function Aggregate() {
  const totalUnexplained = AGGREGATE_DATA.reduce((s, d) => s + d.unexplained, 0);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl text-ink">MMA Industry Aggregate</h2>
        <p className="text-body text-sm mt-1">
          Anonymized data across 1,000+ solo GP clinics · PRD 6.5 · the evidence base MMA needs
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="font-mono text-xs text-muted uppercase">Total unexplained</p>
          <p className="font-display text-2xl tabular-nums text-danger mt-1">{formatRM(totalUnexplained)}</p>
          <p className="text-xs text-muted mt-1">across 6 TPAs · this month</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="font-mono text-xs text-muted uppercase">Clinics reporting</p>
          <p className="font-display text-2xl tabular-nums text-primary mt-1">1,484</p>
          <p className="text-xs text-muted mt-1">of 9,600+ solo GPs</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="font-mono text-xs text-muted uppercase">Avg days to pay</p>
          <p className="font-display text-2xl tabular-nums text-amber mt-1">71 days</p>
          <p className="text-xs text-muted mt-1">MMA target: 30 days</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="font-mono text-xs text-muted uppercase">Worst offender</p>
          <p className="font-display text-2xl tabular-nums text-danger mt-1">IHP</p>
          <p className="text-xs text-muted mt-1">94d avg · 12.1% rejection</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-xs uppercase tracking-wider font-mono border-b border-border">
              <th className="text-left py-3 px-3 w-8"></th>
              <th className="text-left py-3 px-3">TPA</th>
              <th className="text-right py-3 px-3">Clinics</th>
              <th className="text-right py-3 px-3">Avg Days</th>
              <th className="text-right py-3 px-3">Rejection %</th>
              <th className="text-right py-3 px-3">Admin Fee %</th>
              <th className="text-right py-3 px-3">Outstanding</th>
              <th className="text-right py-3 px-3">Unexplained</th>
              <th className="text-right py-3 px-3">Trend</th>
            </tr>
          </thead>
          <tbody>
            {AGGREGATE_DATA.map((row) => (
              <>
                <tr
                  key={row.tpa}
                  className="border-b border-border/50 hover:bg-primary-soft/30 cursor-pointer transition-colors"
                  onClick={() => setExpanded(expanded === row.tpa ? null : row.tpa)}
                >
                  <td className="py-2.5 px-3">
                    <ChevronDown
                      size={14}
                      className={`text-muted transition-transform ${expanded === row.tpa ? 'rotate-180' : ''}`}
                    />
                  </td>
                  <td className="py-2.5 px-3 font-medium text-ink">{row.tpa}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-body">{row.clinics}</td>
                  <td className={`py-2.5 px-3 text-right tabular-nums ${row.avgDays > 60 ? 'text-danger' : row.avgDays > 30 ? 'text-amber' : 'text-positive'}`}>
                    {row.avgDays}
                  </td>
                  <td className={`py-2.5 px-3 text-right tabular-nums ${row.rejectionRate > 5 ? 'text-danger' : 'text-body'}`}>
                    {row.rejectionRate}%
                  </td>
                  <td className={`py-2.5 px-3 text-right tabular-nums ${row.adminFee > 0 ? 'text-amber' : 'text-positive'}`}>
                    {row.adminFee > 0 ? `${row.adminFee}%` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-display tabular-nums text-ink">{formatRM(row.totalOutstanding)}</td>
                  <td className="py-2.5 px-3 text-right font-display tabular-nums text-danger">{formatRM(row.unexplained)}</td>
                  <td className="py-2.5 px-3 text-right">
                    {row.trend === 'up' ? (
                      <TrendingUp size={14} className="inline text-danger" />
                    ) : (
                      <TrendingDown size={14} className="inline text-positive" />
                    )}
                  </td>
                </tr>
                <AnimatePresence>
                  {expanded === row.tpa && (
                    <motion.tr
                      key={`${row.tpa}-details`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <td colSpan={9} className="px-8 py-3 bg-surface-elevated">
                        <p className="text-xs text-muted font-mono mb-2">Per-clinic breakdown (sample)</p>
                        {row.breakdown.map((clinic) => (
                          <div key={clinic.clinic} className="flex items-center justify-between py-1 text-xs">
                            <span className="text-body">{clinic.clinic}</span>
                            <span className="flex items-center gap-4">
                              <span className="text-muted">{clinic.avgDays}d</span>
                              <span className="tabular-nums">{formatRM(clinic.outstanding)}</span>
                              {clinic.unexplained > 0 && (
                                <span className="text-danger tabular-nums">{formatRM(clinic.unexplained)}</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
