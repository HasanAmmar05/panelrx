import { AnimatePresence, motion } from 'framer-motion';

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
  const showCard = elapsedMs >= 1000;
  const showButtons = elapsedMs >= 2500;

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
              Pilot Monday. Free for the first 50 PJ clinics.
            </h2>
            <p className="text-body text-base max-w-xl mx-auto mt-4">
              ClinicMate is an autonomous AI operations layer between Malaysian GP
              clinics and TPAs. Built in 4 hours at Lovable Vibeathon KL · May
              24, 2026.
            </p>

            {showButtons && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6"
              >
                <div className="relative inline-block">
                  <motion.div
                    className="absolute inset-0 rounded-md border-2 border-primary"
                    {...PULSE_RING}
                  />
                  <button
                    className="relative bg-primary text-background hover:bg-primary-deep px-6 py-3 rounded-md font-medium transition-colors"
                    type="button"
                  >
                    Request pilot →
                  </button>
                </div>
                <button
                  className="border border-border text-ink hover:border-primary-ring px-6 py-3 rounded-md transition-colors"
                  type="button"
                >
                  See the supporting product →
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
