import { AnimatePresence, motion } from 'framer-motion';
import { ThoughtBubble } from '../components/ThoughtBubble';
import { StreamingText } from '../components/StreamingText';
import { STAGE_CONTENT } from '../config';

type Stage1TriggerProps = { elapsedMs: number };

type SubPhase = 'ambient' | 'bubble' | 'form' | 'starting';

function getSubPhase(ms: number): SubPhase {
  if (ms < 500) return 'ambient';
  if (ms < 2000) return 'bubble';
  if (ms < 3000) return 'form';
  return 'starting';
}

const slideFade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

export function Stage1Trigger({ elapsedMs }: Stage1TriggerProps) {
  const phase = getSubPhase(elapsedMs);
  const { bubbleText, patientName, icNumber } = STAGE_CONTENT.stage1;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 md:px-8 gap-6">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(20,184,166,0.07), transparent 60%)',
        }}
        aria-hidden
      />

      <AnimatePresence mode="wait">
        {phase === 'bubble' && (
          <motion.div key="bubble" {...slideFade}>
            <ThoughtBubble speaker="staff" text={bubbleText} streaming streamSpeedMs={30} />
          </motion.div>
        )}
        {phase === 'form' && (
          <motion.div
            key="form"
            {...slideFade}
            className="bg-surface rounded-lg p-6 border border-border max-w-md w-full"
          >
            <h3 className="font-display text-lg text-ink">Patient check-in</h3>
            <label className="block mt-4 text-body text-sm font-medium">
              MyKad / IC number
            </label>
            <div className="mt-1 px-3 py-2 rounded-md border border-border bg-background font-mono text-ink min-h-[2.5rem]">
              <StreamingText text={icNumber} speedMs={40} />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (icNumber.length * 40) / 1000, duration: 0.3 }}
              className="mt-3 text-body text-sm"
            >
              {patientName}
            </motion.p>
          </motion.div>
        )}
        {phase === 'starting' && (
          <motion.div
            key="starting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-xl md:text-2xl text-primary tracking-widest"
          >
            STARTING WORKFLOW...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
