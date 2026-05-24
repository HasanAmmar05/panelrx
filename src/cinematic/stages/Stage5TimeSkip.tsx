import { AnimatePresence, motion } from 'framer-motion';
import { StatusBar } from '../components/StatusBar';
import { STAGE_CONTENT } from '../config';
import { Particles } from './Particles';

type Stage5TimeSkipProps = { elapsedMs: number };

function interpolateDate(from: string, to: string, progress: number): string {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  const current = new Date(start + (end - start) * Math.min(progress, 1));
  return current.toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getDayCount(from: string, to: string, progress: number): number {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  const msPerDay = 86400000;
  return Math.round(((end - start) * Math.min(progress, 1)) / msPerDay);
}

export function Stage5TimeSkip({ elapsedMs }: Stage5TimeSkipProps) {
  const c = STAGE_CONTENT.stage5;
  const showOverlay = true;
  const showClock = elapsedMs >= 500;
  const showClosing = elapsedMs >= 5000;

  const sweepProgress = showClock
    ? Math.min((elapsedMs - 500) / c.sweepDurationMs, 1)
    : 0;

  const currentDate = interpolateDate(c.fromDate, c.toDate, sweepProgress);
  const dayCount = getDayCount(c.fromDate, c.toDate, sweepProgress);
  const visibleEvents = c.events.filter((e) => sweepProgress >= e.atProgress);

  return (
    <div className="relative flex flex-col min-h-screen px-6 md:px-8 py-12">
      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0 bg-background pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: showOverlay ? 0.5 : 0 }}
        transition={{ duration: 0.5 }}
        aria-hidden
      />

      {/* Particles */}
      <Particles />

      <div className="relative flex-1 flex flex-col items-center justify-center gap-6 text-center">
        <AnimatePresence mode="wait">
          {showClock && !showClosing && (
            <motion.div
              key="clock"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-6 w-full max-w-lg"
            >
              {/* Day counter */}
              <div className="flex flex-col items-center gap-1">
                <span className="font-display text-6xl md:text-7xl text-ink tabular-nums">
                  {dayCount}
                </span>
                <span className="font-mono text-xs text-muted uppercase tracking-widest">
                  days elapsed
                </span>
              </div>

              {/* Date display */}
              <p className="font-mono text-sm text-body tabular-nums">
                {currentDate}
              </p>

              {/* Progress bar */}
              <div className="w-full h-1 rounded-full bg-border overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${sweepProgress * 100}%` }}
                />
              </div>

              {/* Event timeline */}
              <div className="w-full space-y-2 mt-2 text-left min-h-[140px]">
                <AnimatePresence>
                  {visibleEvents.map((event) => (
                    <motion.div
                      key={event.label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-2"
                    >
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                      <span className="font-mono text-xs text-body">{event.label}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {showClosing && (
            <motion.p
              key="closing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="font-display text-2xl md:text-3xl text-ink max-w-xl"
            >
              {c.closingLine}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="relative w-full max-w-3xl mx-auto mb-24">
        <StatusBar
          activeAgents={['StatusAgent']}
          currentAction="polling 6 portals · last sync 2 min ago"
          elapsedMs={elapsedMs}
        />
      </div>
    </div>
  );
}
