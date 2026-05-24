import { motion } from 'framer-motion';
import { useLoopPhase } from './useLoopPhase';
import { SimCursor } from './SimCursor';

const PHASES = [1200, 1000, 800, 1000]; // durations per phase

export function HotlineSim({ tpaName }: { tpaName: string }) {
  const phase = useLoopPhase(PHASES);

  return (
    <div className="h-full font-mono text-[10px] leading-tight relative overflow-hidden">
      {/* Phone UI bar */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
        <span className="text-body">Calling {tpaName} Hotline</span>
        <motion.span
          className="text-muted"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          ...
        </motion.span>
      </div>

      {/* IVR menu */}
      <div className="border border-border rounded-sm px-1.5 py-1 bg-surface-elevated relative">
        <p className="text-muted text-[9px] mb-0.5">IVR Menu</p>
        <div className="flex gap-2">
          <span
            className={`px-1 rounded-sm transition-colors ${
              phase >= 1 ? 'bg-primary/20 text-primary' : 'text-body'
            }`}
          >
            [1] Eligibility
          </span>
          <span className="text-muted">[2] Claims</span>
        </div>

        {phase >= 2 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-body mt-1"
          >
            Verifying IC:{' '}
            <TypeChars text="920101-10-****" phase={phase} startAt={2} />
          </motion.p>
        )}

        {phase >= 1 && <SimCursor x={phase >= 2 ? 60 : 12} y={phase >= 2 ? 38 : 22} clicking={phase === 1} />}
      </div>
    </div>
  );
}

function TypeChars({ text, phase, startAt }: { text: string; phase: number; startAt: number }) {
  if (phase < startAt) return null;
  const progress = phase >= startAt + 1 ? text.length : Math.floor(text.length * 0.6);
  return (
    <motion.span className="text-primary">
      {text.slice(0, progress)}
      <span className="animate-blink">▌</span>
    </motion.span>
  );
}
