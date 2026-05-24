export function Submit() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl text-ink">Submit Claim</h2>
        <p className="text-body text-sm mt-1">SubmissionAgent auto-routes claims to the correct TPA portal</p>
      </div>
      <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1">Patient IC</label>
            <input className="w-full px-3 py-2 rounded-md bg-surface-elevated border border-border text-ink font-mono focus:outline-none focus:border-primary" placeholder="920101-10-1234" />
          </div>
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1">Service Date</label>
            <input type="date" className="w-full px-3 py-2 rounded-md bg-surface-elevated border border-border text-ink font-mono focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1">Diagnosis (ICD-10)</label>
            <input className="w-full px-3 py-2 rounded-md bg-surface-elevated border border-border text-ink font-mono focus:outline-none focus:border-primary" placeholder="J06.9 — Acute URTI" />
          </div>
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1">Amount (RM)</label>
            <input type="number" className="w-full px-3 py-2 rounded-md bg-surface-elevated border border-border text-ink font-mono focus:outline-none focus:border-primary" placeholder="65.00" />
          </div>
        </div>
        <div>
          <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1">Medications</label>
          <textarea className="w-full px-3 py-2 rounded-md bg-surface-elevated border border-border text-ink font-mono text-sm focus:outline-none focus:border-primary h-20" placeholder="Amoxicillin 500mg TDS x 5 days&#10;Paracetamol 500mg QID PRN" />
        </div>
        <button className="bg-primary text-background px-6 py-2.5 rounded-md font-medium hover:bg-primary-deep transition-colors" type="button">
          Submit to all eligible TPAs →
        </button>
      </div>
    </div>
  );
}
