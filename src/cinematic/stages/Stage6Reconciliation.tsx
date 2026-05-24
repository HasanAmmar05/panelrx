import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  FileEdit,
  FileSearch,
  GitMerge,
  Info,
  LineChart,
  type LucideIcon,
} from 'lucide-react';
import { ThoughtBubble } from '../components/ThoughtBubble';
import { AgentCard } from '../components/AgentCard';
import { ResultCard } from '../components/ResultCard';
import { StatusBar } from '../components/StatusBar';
import { STAGE_CONTENT } from '../config';
import { ReasoningTrace } from './ReasoningTrace';

type Stage6ReconciliationProps = { elapsedMs: number };

const ICON_MAP: Record<string, LucideIcon> = {
  FileSearch,
  GitMerge,
  AlertTriangle,
  FileEdit,
  LineChart,
  CheckCircle,
  Info,
  AlertCircle,
};

const RESULT_ICONS: Record<string, LucideIcon> = {
  CheckCircle,
  Info,
  AlertCircle,
};

type SubPhase =
  | 'pre-pipeline'
  | 'agent-1'
  | 'agent-2'
  | 'agent-3'
  | 'agent-4'
  | 'agent-5'
  | 'money-shot'
  | 'closing';

function getSubPhase(ms: number): SubPhase {
  if (ms < 3000) return 'pre-pipeline';
  if (ms < 4500) return 'agent-1';
  if (ms < 7500) return 'agent-2';
  if (ms < 11500) return 'agent-3';
  if (ms < 13500) return 'agent-4';
  if (ms < 15000) return 'agent-5';
  if (ms < 17000) return 'money-shot';
  return 'closing';
}

function getAgentStatus(elapsedMs: number, agent: typeof STAGE_CONTENT.stage6.agents[number]) {
  if (elapsedMs < agent.startMs) return 'idle' as const;
  if (elapsedMs < agent.doneMs) return 'working' as const;
  return 'done' as const;
}

export function Stage6Reconciliation({ elapsedMs }: Stage6ReconciliationProps) {
  const c = STAGE_CONTENT.stage6;
  const phase = getSubPhase(elapsedMs);

  const showBubble = elapsedMs < 1000;
  const showRemittance = elapsedMs >= 1000 && elapsedMs < 2500;
  const showPipelineLabel = elapsedMs >= 2500 && elapsedMs < 3000;
  const showAgents = elapsedMs >= 3000;
  const showResults = elapsedMs >= 15000;
  const showClosing = elapsedMs >= 17000;

  // Active agents for StatusBar
  const activeAgentNames: string[] = [];
  let currentAction = '';
  for (const agent of c.agents) {
    const status = getAgentStatus(elapsedMs, agent);
    if (status === 'working') {
      activeAgentNames.push(agent.name);
    }
  }
  if (activeAgentNames.length === 0 && elapsedMs < 3000) {
    currentAction = 'initializing pipeline';
  } else if (activeAgentNames.length > 0) {
    const agentName = activeAgentNames[activeAgentNames.length - 1];
    const shortTasks: Record<string, string> = {
      IngestionAgent: 'OCR extraction',
      MatchingAgent: 'fuzzy matching',
      VarianceAgent: 'classifying variances',
      AppealAgent: 'drafting appeals',
      AnalyticsAgent: 'dashboard rollup',
    };
    currentAction = `${agentName} · ${shortTasks[agentName] ?? 'processing'}`;
  } else {
    currentAction = 'pipeline complete';
  }

  // Visible agents: any that have started
  const visibleAgents = c.agents.filter((a) => elapsedMs >= a.startMs);

  return (
    <div className="flex flex-col min-h-screen px-4 md:px-12 py-8">
      <div className="flex-1">
        {/* Pre-pipeline */}
        <AnimatePresence mode="wait">
          {showBubble && (
            <motion.div
              key="bubble"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center pt-12"
            >
              <ThoughtBubble speaker="narrator" text={c.prePipeline.bubbleText} />
            </motion.div>
          )}

          {showRemittance && (
            <motion.div
              key="remittance"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center pt-8"
            >
              <div className="rounded-md border border-border bg-surface-elevated p-4 max-w-md w-full">
                <p className="font-mono text-xs text-muted uppercase mb-3">
                  {c.prePipeline.remittanceHeader}
                </p>
                {c.prePipeline.remittanceLines.map((line) => (
                  <p key={line} className="font-mono text-xs text-body">
                    {line}
                  </p>
                ))}
              </div>
            </motion.div>
          )}

          {showPipelineLabel && (
            <motion.div
              key="pipeline-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center pt-16"
            >
              <p className="font-mono text-xl md:text-2xl text-primary text-center">
                {c.prePipeline.pipelineLabel}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agent pipeline + results grid */}
        {showAgents && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 mt-4">
            {/* Agent cards column */}
            <div className="md:col-span-5 space-y-3">
              {visibleAgents.map((agent, i) => {
                const status = getAgentStatus(elapsedMs, agent);
                const AgentIcon = ICON_MAP[agent.icon];
                const showSnippet =
                  agent.snippetMs !== null &&
                  agent.snippet !== null &&
                  elapsedMs >= agent.snippetMs &&
                  status !== 'done';

                return (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: showResults ? 0.7 : 1, x: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 120,
                      damping: 18,
                      delay: i === visibleAgents.length - 1 ? 0 : 0,
                    }}
                  >
                    <AgentCard
                      icon={AgentIcon}
                      name={agent.name}
                      model={agent.model}
                      status={status}
                      statusText={status === 'working' ? agent.workingText : undefined}
                      resultText={status === 'done' ? agent.resultText : undefined}
                      elapsedMs={
                        status === 'working' ? elapsedMs - agent.startMs : undefined
                      }
                    />
                    {/* Snippet below agent card */}
                    <AnimatePresence>
                      {showSnippet && agent.snippet && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="font-mono text-xs text-muted mt-1 ml-2"
                        >
                          {agent.snippet}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    {/* Reasoning trace for VarianceAgent */}
                    {agent.name === 'VarianceAgent' && status === 'working' && elapsedMs >= c.reasoningStartMs && (
                      <ReasoningTrace
                        lines={c.reasoningTrace}
                        startMs={c.reasoningStartMs}
                        elapsedMs={elapsedMs}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Result cards column */}
            {showResults && (
              <div className="md:col-span-6 md:col-start-7 space-y-3 flex flex-col justify-center">
                {c.results.map((result, i) => {
                  const ResultIcon = RESULT_ICONS[result.icon];
                  return (
                    <motion.div
                      key={result.label}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 120,
                        damping: 18,
                        delay: i * 0.3,
                      }}
                    >
                      <ResultCard
                        label={result.label}
                        value={result.value}
                        valueColor={result.valueColor}
                        sublabel={result.sublabel}
                        icon={ResultIcon}
                        pulse={result.pulse}
                      />
                    </motion.div>
                  );
                })}

                {/* Closing line */}
                <AnimatePresence>
                  {showClosing && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="text-body text-base font-sans mt-4"
                    >
                      {c.closingLine}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-3xl mx-auto mb-24">
        <StatusBar
          activeAgents={activeAgentNames.length > 0 ? activeAgentNames : ['Pipeline']}
          currentAction={currentAction}
          elapsedMs={elapsedMs}
        />
      </div>
    </div>
  );
}
