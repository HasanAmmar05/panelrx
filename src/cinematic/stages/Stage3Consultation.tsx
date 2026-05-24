import { AnimatePresence, motion } from 'framer-motion';
import { StreamingText } from '../components/StreamingText';
import { STAGE_CONTENT } from '../config';

type Stage3ConsultationProps = { elapsedMs: number };

const STREAM_START = 800;
const LINE_STAGGER = 280;

export function Stage3Consultation({ elapsedMs }: Stage3ConsultationProps) {
  const c = STAGE_CONTENT.stage3;
  const showIntro = elapsedMs < 800;
  const showSoap = elapsedMs >= 800 && elapsedMs < 3500;
  const showOutro = elapsedMs >= 2000 && elapsedMs < 3500;
  const fading = elapsedMs >= 3500;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 md:px-8 gap-6">
      <motion.div
        className="absolute inset-0 bg-background pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: fading ? 0 : 0.3 }}
        transition={{ duration: 0.6 }}
        aria-hidden
      />

      <AnimatePresence>
        {showIntro && (
          <motion.p
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="font-display italic text-2xl md:text-3xl text-muted relative"
          >
            {c.intro}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSoap && (
          <motion.div
            key="soap"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-surface border border-border rounded-lg p-6 max-w-md w-full font-mono text-sm space-y-2"
          >
            {c.soapLines.map((line, i) => (
              <p key={line} className="text-body">
                <StreamingText
                  text={line}
                  speedMs={15}
                  delay={Math.max(0, i * LINE_STAGGER - (elapsedMs - STREAM_START - i * LINE_STAGGER) * 0)}
                />
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOutro && (
          <motion.p
            key="outro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-body italic text-base mt-2 relative"
          >
            {c.outro}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
