import { motion } from 'framer-motion';
import { useLoopPhase } from './useLoopPhase';
import { SimCursor } from './SimCursor';

const PHASES = [800, 1000, 1200, 1000, 1000]; // idle → focus → type → click → result

export function PortalSim() {
  const phase = useLoopPhase(PHASES);

  const typedText = '920101-10-1234';
  const visibleChars =
    phase < 2 ? 0 : phase === 2 ? Math.floor(typedText.length * 0.7) : typedText.length;

  return (
    <div className="h-full font-mono text-[10px] leading-tight relative overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-1 mb-1.5">
        <div className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-danger/60" />
          <span className="w-1 h-1 rounded-full bg-amber/60" />
          <span className="w-1 h-1 rounded-full bg-positive/60" />
        </div>
        <div className="flex-1 bg-surface-elevated border border-border rounded-sm px-1 py-0.5 text-[9px] text-muted truncate">
          mediexpress.com.my/provider
        </div>
      </div>

      {/* Form area */}
      <div className="relative border border-border rounded-sm px-1.5 py-1 bg-surface-elevated">
        <p className="text-muted text-[9px] mb-0.5">Patient IC Search</p>
        <div className="flex gap-1 items-center">
          <div
            className={`flex-1 border rounded-sm px-1 py-px text-body ${
              phase >= 1 ? 'border-primary/40' : 'border-border'
            }`}
          >
            {visibleChars > 0 ? (
              <span>
                {typedText.slice(0, visibleChars)}
                {phase === 2 && <span className="animate-blink">▌</span>}
              </span>
            ) : (
              <span className="text-faint">IC Number</span>
            )}
          </div>
          <motion.button
            className="px-1.5 py-px rounded-sm text-[9px] border"
            animate={{
              backgroundColor: phase === 3 ? 'rgba(20,184,166,0.2)' : 'transparent',
              borderColor: phase === 3 ? 'rgba(20,184,166,0.4)' : 'rgba(255,255,255,0.08)',
              color: phase === 3 ? '#14B8A6' : '#94A3B8',
            }}
            transition={{ duration: 0.15 }}
          >
            Search
          </motion.button>
        </div>

        {phase === 4 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-primary text-[9px] mt-0.5"
          >
            Searching...
          </motion.p>
        )}

        <SimCursor
          x={phase <= 1 ? 40 : phase <= 2 ? 40 : 125}
          y={phase <= 1 ? 16 : phase <= 2 ? 16 : 16}
          clicking={phase === 3}
        />
      </div>
    </div>
  );
}
