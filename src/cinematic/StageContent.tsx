import { AnimatePresence, motion } from 'framer-motion';
import { PlaceholderContent } from './PlaceholderContent';
import { Stage1Trigger } from './stages/Stage1Trigger';
import { Stage2Verification } from './stages/Stage2Verification';
import { Stage3Consultation } from './stages/Stage3Consultation';
import { Stage4Submission } from './stages/Stage4Submission';
import { Stage5TimeSkip } from './stages/Stage5TimeSkip';
import type { StageId } from './types';

type StageContentProps = {
  currentStage: StageId;
  elapsedInStage: number;
};

function renderStage(currentStage: StageId, elapsedInStage: number) {
  switch (currentStage) {
    case 1:
      return <Stage1Trigger elapsedMs={elapsedInStage} />;
    case 2:
      return <Stage2Verification elapsedMs={elapsedInStage} />;
    case 3:
      return <Stage3Consultation elapsedMs={elapsedInStage} />;
    case 4:
      return <Stage4Submission elapsedMs={elapsedInStage} />;
    case 5:
      return <Stage5TimeSkip elapsedMs={elapsedInStage} />;
    default:
      return (
        <PlaceholderContent
          currentStage={currentStage}
          elapsedInStage={elapsedInStage}
        />
      );
  }
}

export function StageContent({ currentStage, elapsedInStage }: StageContentProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {renderStage(currentStage, elapsedInStage)}
      </motion.div>
    </AnimatePresence>
  );
}
