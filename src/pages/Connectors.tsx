import { PAYERS } from '../data/payers';
import { Globe, Monitor, Phone, Smartphone, CheckCircle } from 'lucide-react';

const CONNECTORS = [
  { payerId: 'p_micare', method: 'hotline', status: 'connected', icon: Phone },
  { payerId: 'p_mediexp', method: 'portal', status: 'connected', icon: Monitor },
  { payerId: 'p_pmcare', method: 'app', status: 'connected', icon: Smartphone },
  { payerId: 'p_ihp', method: 'portal', status: 'connected', icon: Monitor },
  { payerId: 'p_selcare', method: 'api', status: 'connected', icon: Globe },
  { payerId: 'p_pekab40', method: 'api', status: 'connected', icon: Globe },
  { payerId: 'p_spmadani', method: 'portal', status: 'pending', icon: Monitor },
  { payerId: 'p_medkad', method: 'portal', status: 'pending', icon: Monitor },
];

export function Connectors() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl text-ink">TPA Connectors</h2>
        <p className="text-body text-sm mt-1">Manage panel connections · extensible from 6 to 55+ payers via configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONNECTORS.map((conn) => {
          const payer = PAYERS.find((p) => p.id === conn.payerId);
          if (!payer) return null;
          const Icon = conn.icon;
          return (
            <div key={conn.payerId} className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-surface-elevated flex items-center justify-center">
                <Icon size={20} className="text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm text-ink">{payer.legalName}</p>
                <p className="font-mono text-xs text-muted">{payer.shortCode} · {conn.method} · avg {payer.avgDaysToPay}d</p>
              </div>
              <div className="flex items-center gap-1">
                {conn.status === 'connected' ? (
                  <>
                    <CheckCircle size={14} className="text-positive" />
                    <span className="text-xs text-positive font-mono">Connected</span>
                  </>
                ) : (
                  <span className="text-xs text-amber font-mono">Pending</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-surface/60 rounded-lg border border-border p-6 text-center">
        <p className="font-display text-lg text-ink">55+ TPAs in MOH registry</p>
        <p className="text-body text-sm mt-1">New connectors added via configuration, not custom code</p>
        <button className="mt-4 border border-border text-body hover:border-primary hover:text-primary px-4 py-2 rounded-md text-sm font-mono transition-colors" type="button">
          Request new connector →
        </button>
      </div>
    </div>
  );
}
