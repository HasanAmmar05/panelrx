import { AnimatePresence } from 'framer-motion';
import { PlaceholderContent } from './PlaceholderContent';
import type { StageId } from './types';

type StageContentProps = {
  currentStage: StageId;
  elapsedInStage: number;
};

export function StageContent({
  currentStage,
  elapsedInStage,
}: StageContentProps) {
  return (
    <AnimatePresence mode="wait">
      <PlaceholderContent
        key={currentStage}
        currentStage={currentStage}
        elapsedInStage={elapsedInStage}
      />
    </AnimatePresence>
  );
}
