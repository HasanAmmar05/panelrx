import { motion } from 'framer-motion';
import { STAGES } from './config';
import type { StageId } from './types';

type PlaceholderContentProps = {
  currentStage: StageId;
  elapsedInStage: number;
};

export function PlaceholderContent({
  currentStage,
  elapsedInStage,
}: PlaceholderContentProps) {
  const stage = STAGES[currentStage - 1];
  const elapsedSec = (elapsedInStage / 1000).toFixed(1);
  const durationSec = (stage.durationMs / 1000).toFixed(1);

  return (
    <motion.div
      key={currentStage}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center min-h-screen px-6 sm:px-8 text-center"
    >
      <span className="text-muted text-xs tracking-widest uppercase font-mono">
        Stage {currentStage} of 9 · {stage.name}
      </span>
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-ink mt-4 max-w-3xl">
        {stage.name}
      </h1>
      <p className="text-body text-base sm:text-lg max-w-2xl mt-4">
        {stage.description}
      </p>
      <p className="text-muted font-mono text-sm mt-12 tabular-nums">
        {elapsedSec}s / {durationSec}s
      </p>
    </motion.div>
  );
}
