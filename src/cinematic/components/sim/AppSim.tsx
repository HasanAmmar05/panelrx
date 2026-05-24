import { motion } from 'framer-motion';
import { useLoopPhase } from './useLoopPhase';
import { SimCursor } from './SimCursor';

const PHASES = [600, 800, 1000, 800, 800]; // idle → tap tab → type → search → shimmer

export function AppSim() {
  const phase = useLoopPhase(PHASES);

  const typedText = '920101-10-1233';
  const visibleChars =
    phase < 2 ? 0 : phase === 2 ? Math.floor(typedText.length * 0.6) : typedText.length;

  return (
    <div className="h-full font-mono text-[10px] leading-tight relative overflow-hidden flex flex-col">
      {/* App header */}
      <div className="text-center text-[9px] text-body border-b border-border pb-0.5 mb-1">
        PMCare Provider
      </div>

      {/* Content area */}
      <div className="flex-1 relative px-1">
        {phase >= 2 ? (
          <div className="border border-border rounded-sm px-1 py-0.5">
            <span className="text-muted text-[9px]">IC: </span>
            <span className="text-body">
              {typedText.slice(0, visibleChars)}
              {phase === 2 && <span className="animate-blink">▌</span>}
            </span>
          </div>
        ) : (
          <p className="text-muted text-[9px]">Select a tab below</p>
        )}

        {phase === 4 && (
          <div className="mt-1 space-y-0.5">
            <motion.div
              className="h-1.5 rounded-sm bg-border"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <motion.div
              className="h-1.5 rounded-sm bg-border w-3/4"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }}
            />
          </div>
        )}

        <SimCursor
          x={phase <= 0 ? 60 : phase === 1 ? 28 : 50}
          y={phase <= 0 ? 10 : phase === 1 ? 44 : 4}
          clicking={phase === 1 || phase === 3}
        />
      </div>

      {/* Tab bar */}
      <div className="flex border-t border-border pt-0.5 mt-auto">
        <span className="flex-1 text-center text-[8px] text-muted">Home</span>
        <span
          className={`flex-1 text-center text-[8px] transition-colors ${
            phase >= 1 ? 'text-primary' : 'text-muted'
          }`}
        >
          Lookup
        </span>
        <span className="flex-1 text-center text-[8px] text-muted">Claims</span>
      </div>
    </div>
  );
}
