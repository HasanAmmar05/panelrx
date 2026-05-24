import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Monitor, Phone, Smartphone, CheckCircle, Loader2, X } from 'lucide-react';
import { PAYERS } from '../data/payers';

type ConnectorStatus = 'connected' | 'pending' | 'disconnecting' | 'connecting';

const INITIAL_CONNECTORS = [
  { payerId: 'p_micare', method: 'hotline' as const, status: 'connected' as ConnectorStatus, icon: Phone },
  { payerId: 'p_mediexp', method: 'portal' as const, status: 'connected' as ConnectorStatus, icon: Monitor },
  { payerId: 'p_pmcare', method: 'app' as const, status: 'connected' as ConnectorStatus, icon: Smartphone },
  { payerId: 'p_ihp', method: 'portal' as const, status: 'connected' as ConnectorStatus, icon: Monitor },
  { payerId: 'p_selcare', method: 'api' as const, status: 'connected' as ConnectorStatus, icon: Globe },
  { payerId: 'p_pekab40', method: 'api' as const, status: 'connected' as ConnectorStatus, icon: Globe },
  { payerId: 'p_spmadani', method: 'portal' as const, status: 'pending' as ConnectorStatus, icon: Monitor },
  { payerId: 'p_medkad', method: 'portal' as const, status: 'pending' as ConnectorStatus, icon: Monitor },
];

export function Connectors() {
  const [connectors, setConnectors] = useState(INITIAL_CONNECTORS);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function toggleConnector(payerId: string) {
    const conn = connectors.find((c) => c.payerId === payerId);
    if (!conn) return;

    const isConnected = conn.status === 'connected';
    const intermediateStatus: ConnectorStatus = isConnected ? 'disconnecting' : 'connecting';

    setConnectors((prev) =>
      prev.map((c) => c.payerId === payerId ? { ...c, status: intermediateStatus } : c)
    );

    setTimeout(() => {
      const newStatus: ConnectorStatus = isConnected ? 'pending' : 'connected';
      setConnectors((prev) =>
        prev.map((c) => c.payerId === payerId ? { ...c, status: newStatus } : c)
      );
      const payer = PAYERS.find((p) => p.id === payerId);
      showToast(`${payer?.shortCode} ${isConnected ? 'disconnected' : 'connected'} successfully`);
    }, 1500);
  }

  const connected = connectors.filter((c) => c.status === 'connected').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl text-ink">TPA Connectors</h2>
        <p className="text-body text-sm mt-1">
          {connected} of {connectors.length} panels connected
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map((conn) => {
          const payer = PAYERS.find((p) => p.id === conn.payerId);
          if (!payer) return null;
          const Icon = conn.icon;
          const loading = conn.status === 'connecting' || conn.status === 'disconnecting';
          const isOn = conn.status === 'connected';

          return (
            <div key={conn.payerId} className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-surface-elevated flex items-center justify-center shrink-0">
                <Icon size={20} className="text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm text-ink">{payer.legalName}</p>
                <p className="font-mono text-xs text-muted">{payer.shortCode} · {conn.method} · avg {payer.avgDaysToPay}d</p>
              </div>
              <button
                onClick={() => toggleConnector(conn.payerId)}
                disabled={loading}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  loading ? 'bg-surface-elevated' : isOn ? 'bg-positive' : 'bg-faint'
                }`}
                type="button"
                aria-label={isOn ? 'Disconnect' : 'Connect'}
              >
                {loading ? (
                  <Loader2 size={14} className="absolute top-1 left-3 text-muted animate-spin" />
                ) : (
                  <motion.div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                    animate={{ left: isOn ? 26 : 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 text-center">
        <p className="font-display text-lg text-ink">55+ TPAs in MOH registry</p>
        <p className="text-body text-sm mt-1">New connectors added via configuration, not custom code</p>
        <button
          onClick={() => showToast('Connector request submitted. We\u2019ll reach out within 24 hours.')}
          className="mt-4 border border-border text-body hover:border-primary hover:text-primary px-4 py-2 rounded-md text-sm font-mono transition-colors"
          type="button"
        >
          Request new connector →
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-ink text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50"
          >
            <CheckCircle size={16} className="text-positive" />
            <span className="text-sm">{toast}</span>
            <button onClick={() => setToast(null)} className="text-muted hover:text-white" type="button">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
