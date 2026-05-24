import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const LOOP_MS = 16000;
const TICK = 100;

type MiniPhase = 'files' | 'agents' | 'results' | 'hold' | 'fade';

function getPhase(ms: number): MiniPhase {
  if (ms < 2000) return 'files';
  if (ms < 9000) return 'agents';
  if (ms < 13000) return 'results';
  if (ms < 15000) return 'hold';
  return 'fade';
}

const FILE_CARDS = [
  'MC-REM-2026-03-00184.pdf',
  'ME-REM-2026-03-01201.pdf',
  'PMC-REM-2026-03-00088.pdf',
];

const AGENTS = [
  { name: 'IngestionAgent', model: 'Haiku 4.5', result: '✓ 27 lines extracted' },
  { name: 'MatchingAgent', model: 'Sonnet 4.6', result: '✓ 25/27 matched' },
  { name: 'VarianceAgent', model: 'Sonnet 4.6', result: '→ UNEXPLAINED', isDanger: true },
];

const RESULTS = [
  { label: 'MATCHED', value: 'RM 932', color: 'text-positive' },
  { label: 'EXPLAINED', value: 'RM 380', color: 'text-amber' },
  { label: 'UNEXPLAINED', value: 'RM 6,210', color: 'text-danger', pulse: true },
];

export function LandingPreview() {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setElapsed((e) => (e + TICK) % LOOP_MS);
    }, TICK);
    return () => window.clearInterval(id);
  }, [paused]);

  const phase = getPhase(elapsed);

  return (
    <div
      className="relative w-full max-w-md mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Browser chrome */}
      <div className="rounded-lg border border-border-strong bg-surface-elevated overflow-hidden">
        {/* Chrome bar */}
        <div className="flex items-center justify-between px-3 h-8 bg-surface-solid border-b border-border">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-danger" />
            <span className="w-2 h-2 rounded-full bg-amber" />
            <span className="w-2 h-2 rounded-full bg-positive" />
          </div>
          <span className="font-mono text-[10px] text-muted">panelrx.app/demo</span>
          <span className="flex items-center gap-1 text-[10px] text-danger font-mono">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-danger"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            LIVE
          </span>
        </div>

        {/* Content area */}
        <div className="cinematic-dark relative p-3 h-80 overflow-hidden bg-background">
          <AnimatePresence mode="wait">
            {phase === 'files' && (
              <motion.div
                key="files"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {FILE_CARDS.map((file, i) => (
                  <motion.div
                    key={file}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.6 }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-border bg-surface text-[10px] font-mono text-body"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {file}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {phase === 'agents' && (
              <motion.div
                key="agents"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {AGENTS.map((agent, i) => {
                  const showResult = elapsed >= 2000 + (i + 1) * 2300;
                  return (
                    <motion.div
                      key={agent.name}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.4 }}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md border border-border bg-surface"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <motion.span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${showResult ? 'bg-positive' : 'bg-primary'}`}
                          animate={showResult ? {} : { opacity: [1, 0.4, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span className="text-[10px] font-mono text-body truncate">
                          {agent.name}
                        </span>
                        <span className="text-[9px] text-muted font-mono hidden sm:inline">
                          {agent.model}
                        </span>
                      </div>
                      {showResult && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`text-[9px] font-mono shrink-0 ${agent.isDanger ? 'text-danger' : 'text-positive'}`}
                        >
                          {agent.result}
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {(phase === 'results' || phase === 'hold') && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {RESULTS.map((result, i) => (
                  <motion.div
                    key={result.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.3 }}
                    className="flex items-center justify-between px-3 py-2 rounded-md border border-border bg-surface"
                  >
                    <span className="font-mono text-[9px] text-muted uppercase tracking-wider">
                      {result.label}
                    </span>
                    <span className={`font-display text-lg tabular-nums font-semibold ${result.color}`}>
                      {result.value}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {phase === 'fade' && (
              <motion.div
                key="fade"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                className="h-full"
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
