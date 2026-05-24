import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Sparkles } from 'lucide-react';

type Stage9CTAProps = { elapsedMs: number };

const PULSE_RING = {
  animate: {
    scale: [1, 1.08, 1],
    opacity: [0.4, 0, 0.4],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
  },
};

export function Stage9CTA({ elapsedMs }: Stage9CTAProps) {
  const navigate = useNavigate();
  const showCard = elapsedMs >= 1000;
  const showButtons = elapsedMs >= 2500;
  const showStats = elapsedMs >= 3500;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 md:px-8 py-12">
      <AnimatePresence>
        {showCard && (
          <motion.div
            key="cta-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="bg-surface-elevated border border-border rounded-lg p-10 max-w-2xl w-full text-center"
          >
            <p className="font-mono text-xs text-primary uppercase tracking-widest">
              ClinicMate
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-ink mt-4">
              AI agents that handle everything between your clinic and the TPAs.
            </h2>
            <p className="text-body text-base max-w-xl mx-auto mt-4">
              From patient walk-in to payment collection. Eligibility, submission,
              follow-up, reconciliation, and appeals — all autonomous.
            </p>

            {showStats && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-6 mt-6 text-center"
              >
                <div>
                  <p className="font-display text-xl text-primary">6.8s</p>
                  <p className="font-mono text-[10px] text-muted">eligibility check</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="font-display text-xl text-primary">3.1s</p>
                  <p className="font-mono text-[10px] text-muted">claim submission</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="font-display text-xl text-danger">RM 6,210</p>
                  <p className="font-mono text-[10px] text-muted">recovered per clinic</p>
                </div>
              </motion.div>
            )}

            {showButtons && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
              >
                <div className="relative inline-block">
                  <motion.div
                    className="absolute inset-0 rounded-md border-2 border-primary"
                    {...PULSE_RING}
                  />
                  <button
                    className="relative bg-primary text-background hover:bg-primary-deep px-6 py-3 rounded-md font-medium transition-colors flex items-center gap-2"
                    type="button"
                    onClick={() => navigate('/dashboard')}
                  >
                    <LayoutDashboard size={16} />
                    Try the product {'\u2192'}
                  </button>
                </div>
                <button
                  className="border border-border text-ink hover:border-primary-ring px-6 py-3 rounded-md transition-colors flex items-center gap-2"
                  type="button"
                  onClick={() => navigate('/auto-sweep')}
                >
                  <Sparkles size={16} />
                  See AI agents in action {'\u2192'}
                </button>
              </motion.div>
            )}

            <p className="mt-6 text-xs text-muted font-mono">
              Built at Lovable Vibeathon KL {'\u00b7'} May 24, 2026
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
