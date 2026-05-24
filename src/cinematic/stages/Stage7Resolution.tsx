import { AnimatePresence, motion } from 'framer-motion';
import { StreamingText } from '../components/StreamingText';
import { StatusBar } from '../components/StatusBar';

type Stage7ResolutionProps = { elapsedMs: number };

const KPI_DATA = [
  { label: 'Patients seen', value: '247', color: 'text-ink' },
  { label: 'Collected from TPAs', value: 'RM 8,650', color: 'text-ink' },
  { label: 'Unexplained (appealed)', value: 'RM 6,210', color: 'text-amber' },
  { label: 'Hours on portals', value: '0', color: 'text-positive' },
];

const NARRATIVE_LINES = [
  "· Didn't open a single TPA portal",
  '· Approved 6 appeal letters with one tap each',
  '· Recovered RM 3,500 in previously-lost deductions',
];

export function Stage7Resolution({ elapsedMs }: Stage7ResolutionProps) {
  const showDashboard = elapsedMs >= 1000;
  const showNarrative = elapsedMs >= 2500;
  const showBigLine = elapsedMs >= 4500;
  const shrinking = elapsedMs >= 7000;

  return (
    <div className="flex flex-col min-h-screen px-6 md:px-8 py-12">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <AnimatePresence>
          {showDashboard && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 16 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: shrinking ? 0.6 : 1,
              }}
              transition={{ duration: shrinking ? 1.0 : 0.4 }}
              className="bg-surface-elevated border border-border rounded-lg p-6 max-w-2xl w-full"
            >
              <h2 className="font-display text-lg text-ink">
                Klinik Dr Vani · April 2026 summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {KPI_DATA.map((kpi, i) => (
                  <div key={kpi.label} className="text-center">
                    <p className="font-mono text-xs text-muted uppercase tracking-wide">
                      {kpi.label}
                    </p>
                    <p className={`font-display text-3xl tabular-nums mt-1 ${kpi.color}`}>
                      {elapsedMs >= 1000 + i * 200 ? (
                        <StreamingText
                          text={kpi.value}
                          speedMs={15}
                          showCursor={false}
                        />
                      ) : null}
                    </p>
                  </div>
                ))}
              </div>

              {showNarrative && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-l-2 border-primary pl-4 mt-4 space-y-2"
                >
                  {NARRATIVE_LINES.map((line, i) => (
                    <p key={line} className="text-body text-sm font-sans">
                      {elapsedMs >= 2500 + i * 200 ? (
                        <StreamingText text={line} speedMs={40} showCursor={false} />
                      ) : null}
                    </p>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showBigLine && !shrinking && (
            <motion.p
              key="bigline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="font-display text-2xl md:text-3xl text-ink leading-tight max-w-3xl text-center"
            >
              This is what a Malaysian GP clinic looks like when AI does the
              back office.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-3xl mx-auto mb-24">
        <StatusBar
          activeAgents={['Orchestrator']}
          currentAction="month complete · 247 encounters processed"
          elapsedMs={elapsedMs}
        />
      </div>
    </div>
  );
}
