import { motion } from 'framer-motion';
import { STAGES } from './config';
import type { StageId } from './types';

type StageIndicatorProps = {
  currentStage: StageId;
  elapsedInStage: number;
  hasEnded: boolean;
};

export function StageIndicator({
  currentStage,
  elapsedInStage,
  hasEnded,
}: StageIndicatorProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-50 flex gap-[2px] bg-background"
      role="progressbar"
      aria-label="Cinematic progress"
    >
      {STAGES.map((stage) => {
        const isCompleted = hasEnded || stage.id < currentStage;
        const isCurrent = !hasEnded && stage.id === currentStage;
        const fillPct = isCompleted
          ? 100
          : isCurrent
            ? Math.min(100, (elapsedInStage / stage.durationMs) * 100)
            : 0;
        return (
          <div key={stage.id} className="flex-1 bg-border overflow-hidden">
            <motion.div
              className={`h-full ${isCompleted ? 'bg-primary opacity-60' : 'bg-primary'}`}
              animate={{ width: `${fillPct}%` }}
              transition={{ duration: 0.12, ease: 'linear' }}
            />
          </div>
        );
      })}
    </div>
  );
}
