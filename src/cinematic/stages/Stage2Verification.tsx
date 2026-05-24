import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { ThoughtBubble } from '../components/ThoughtBubble';
import { TPAPortalCard } from '../components/TPAPortalCard';
import { StatusBar } from '../components/StatusBar';
import { STAGE_CONTENT } from '../config';

type Stage2VerificationProps = { elapsedMs: number };

export function Stage2Verification({ elapsedMs }: Stage2VerificationProps) {
  const c = STAGE_CONTENT.stage2;
  const showBubble = elapsedMs < 800;
  const showAgentLabel = elapsedMs >= 800 && elapsedMs < 1200;
  const showCards = elapsedMs >= 1200;
  const showSummary = elapsedMs >= 7800;
  const showComparison = elapsedMs >= 9000;

  const resolvedCount = c.tpas.filter((t) => elapsedMs >= t.resolveAt).length;
  const activeAgents = elapsedMs < 1200 ? ['Orchestrator'] : ['EligibilityAgent'];
  const action =
    elapsedMs < 1200
      ? 'initializing eligibility check'
      : resolvedCount === 0
        ? 'calling 3/3 panels'
        : resolvedCount < 3
          ? `${resolvedCount}/3 resolved`
          : '3/3 complete';

  return (
    <div className="flex flex-col min-h-screen px-6 md:px-8 py-12">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
        <AnimatePresence mode="wait">
          {showBubble && (
            <motion.div
              key="bubble"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ThoughtBubble speaker="staff" text={c.bubbleText} />
            </motion.div>
          )}
          {showAgentLabel && (
            <motion.div
              key="label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-xl md:text-2xl text-primary max-w-2xl"
            >
              {c.agentLabel}
            </motion.div>
          )}
        </AnimatePresence>

        {showCards && (
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full max-w-4xl justify-center">
            {c.tpas.map((tpa, i) => {
              const isResolved = elapsedMs >= tpa.resolveAt;
              return (
                <motion.div
                  key={tpa.name}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.2 }}
                  className="flex-1"
                >
                  <TPAPortalCard
                    tpaName={tpa.name}
                    accessMethod={tpa.method}
                    status={isResolved ? tpa.status : 'calling'}
                    responseText={isResolved ? tpa.response : undefined}
                    latencyMs={isResolved ? tpa.latency : undefined}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {showSummary && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 text-positive font-display text-lg"
            >
              <CheckCircle size={20} />
              <span>{c.summary}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showComparison && (
            <motion.div
              key="comp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-body text-base">
                Old way: {c.comparison.old}. New way: {c.comparison.new}.
              </p>
              <p className="text-body text-base italic mt-1">{c.comparison.kicker}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-3xl mx-auto mb-24">
        <StatusBar
          activeAgents={activeAgents}
          currentAction={action}
          elapsedMs={elapsedMs}
        />
      </div>
    </div>
  );
}
