import { PAYERS } from '../data/payers';

export function Eligibility() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl text-ink">Eligibility Check</h2>
        <p className="text-body text-sm mt-1">Verify patient coverage across all panels in real-time</p>
      </div>
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-surface/30">
        <p className="font-mono text-lg text-body">Enter IC Number</p>
        <input
          type="text"
          placeholder="e.g. 920101-10-1234"
          className="mt-4 px-4 py-3 rounded-md bg-surface border border-border text-ink font-mono text-center w-64 focus:outline-none focus:border-primary"
        />
        <button className="block mx-auto mt-4 bg-primary text-background px-6 py-2.5 rounded-md font-medium hover:bg-primary-deep transition-colors" type="button">
          Check all {PAYERS.length} panels →
        </button>
        <p className="text-xs text-muted mt-2 font-mono">Checks MiCare, MediExpress, IHP, PMCare, SelCare, PeKa B40, Madani, MedKad simultaneously</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PAYERS.slice(0, 6).map((p) => (
          <div key={p.id} className="bg-surface border border-border rounded-lg p-4">
            <p className="font-mono text-xs text-muted">{p.shortCode}</p>
            <p className="font-display text-sm text-body mt-1">{p.legalName}</p>
            <p className="text-xs text-muted mt-2">Avg {p.avgDaysToPay}d to pay</p>
          </div>
        ))}
      </div>
    </div>
  );
}
