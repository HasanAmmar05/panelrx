import { motion } from 'framer-motion';

type Stage8MMARevealProps = { elapsedMs: number };

const GRID_ROWS = 8;
const GRID_COLS = 12;
const TOTAL_CELLS = GRID_ROWS * GRID_COLS;
const CENTER_INDEX = Math.floor(GRID_ROWS / 2) * GRID_COLS + Math.floor(GRID_COLS / 2);

export function Stage8MMAReveal({ elapsedMs }: Stage8MMARevealProps) {
  const showGrid = elapsedMs >= 1500;
  const showText = elapsedMs >= 3500;
  const showSecondLine = elapsedMs >= 4000;
  const showThirdLine = elapsedMs >= 4500;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 md:px-8 py-8 overflow-hidden">
      {/* Grid of ghost cards */}
      {showGrid && (
        <div className="absolute inset-0 grid grid-cols-12 gap-1.5 md:gap-2 p-2 md:p-4">
          {Array.from({ length: TOTAL_CELLS }, (_, i) => {
            const row = Math.floor(i / GRID_COLS);
            const isCenter = i === CENTER_INDEX || i === CENTER_INDEX + 1;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: isCenter ? 1 : 0.3 }}
                transition={{
                  duration: 0.3,
                  delay: row * 0.03 + (i % GRID_COLS) * 0.01,
                }}
                className={`aspect-square rounded-sm border ${
                  isCenter
                    ? 'bg-surface-elevated border-primary-ring'
                    : 'bg-surface border-border'
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Text overlay */}
      {showText && (
        <div className="relative z-10 flex flex-col items-center text-center px-6 py-8 rounded-lg bg-background/80 max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-display text-xl md:text-2xl text-amber"
          >
            If 1,000 solo GPs ran PanelRx...
          </motion.p>

          {showSecondLine && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-amber font-semibold tabular-nums mt-4"
            >
              RM 6.2 million in unexplained deductions surfaced every month.
            </motion.p>
          )}

          {showThirdLine && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-body text-base mt-3"
            >
              The evidence base MMA has been asking for since 2015.
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
}
