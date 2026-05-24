import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { ThoughtBubble } from '../components/ThoughtBubble';
import { StreamingText } from '../components/StreamingText';
import { TPAPortalCard } from '../components/TPAPortalCard';
import { StatusBar } from '../components/StatusBar';
import { STAGE_CONTENT } from '../config';

type Stage4SubmissionProps = { elapsedMs: number };

export function Stage4Submission({ elapsedMs }: Stage4SubmissionProps) {
  const c = STAGE_CONTENT.stage4;
  const showBubble = elapsedMs < 800;
  const showAgentLabel = elapsedMs >= 800 && elapsedMs < 1500;
  const showClaim = elapsedMs >= 1500;
  const showArrow = elapsedMs >= 2500;
  const showCards = elapsedMs >= 3000;
  const showSummary = elapsedMs >= 7600;
  const showComparison = elapsedMs >= 8800;

  const resolvedTargets = c.targets.filter((t) => elapsedMs >= t.resolveAt);

  const action =
    elapsedMs < 3000
      ? 'preparing payload'
      : elapsedMs < 6000
        ? 'broadcasting 2 panels'
        : resolvedTargets.length < 2
          ? 'awaiting acks'
          : '2/2 complete';

  return (
    <div className="flex flex-col min-h-screen px-6 md:px-8 py-12">
      <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center">
        <AnimatePresence mode="wait">
          {showBubble && (
            <motion.div
              key="bubble"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ThoughtBubble speaker="doctor" text={c.bubbleText} />
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

        {showClaim && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="bg-surface rounded-md border border-border p-4 max-w-md w-full text-left"
          >
            <p className="font-mono text-xs text-muted uppercase tracking-wider mb-3">
              {c.claimLabel}
            </p>
            <div className="space-y-1 font-mono text-sm text-body">
              {c.claimLines.map((line, i) => (
                <p key={line}>
                  <StreamingText text={line} speedMs={15} delay={i * 80} showCursor={false} />
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {showArrow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center"
          >
            <svg width="2" height="40" viewBox="0 0 2 40" className="overflow-visible">
              <motion.line
                x1="1"
                y1="0"
                x2="1"
                y2="40"
                stroke="rgba(20, 184, 166, 0.5)"
                strokeWidth="2"
                strokeDasharray="40"
                initial={{ strokeDashoffset: 40 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.5 }}
              />
              <motion.polygon
                points="-4,34 1,42 6,34"
                fill="rgba(20, 184, 166, 0.5)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.2 }}
              />
            </svg>
          </motion.div>
        )}

        {showCards && (
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full max-w-3xl justify-center">
            {c.targets.map((target, i) => {
              const isResolved = elapsedMs >= target.resolveAt;
              return (
                <motion.div
                  key={target.name}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.3 }}
                  className="flex-1"
                >
                  <TPAPortalCard
                    tpaName={target.name}
                    accessMethod={target.method}
                    status={isResolved ? target.status : 'calling'}
                    responseText={isResolved ? target.response : undefined}
                    latencyMs={isResolved ? target.latency : undefined}
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
              <p className="text-body text-base">{c.comparison}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-3xl mx-auto mb-24">
        <StatusBar
          activeAgents={['SubmissionAgent']}
          currentAction={action}
          elapsedMs={elapsedMs}
        />
      </div>
    </div>
  );
}
