import { CheckCircle, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

type AgentStatus = 'idle' | 'working' | 'done' | 'error';

type AgentCardProps = {
  icon: LucideIcon;
  name: string;
  model: string;
  status: AgentStatus;
  statusText?: string;
  elapsedMs?: number;
  resultText?: string;
};

const BORDER: Record<AgentStatus, string> = {
  idle: 'border-border',
  working: 'border-primary-ring',
  done: 'border-positive/40',
  error: 'border-danger/40',
};

const ICON_COLOR: Record<AgentStatus, string> = {
  idle: 'text-body',
  working: 'text-primary',
  done: 'text-positive',
  error: 'text-danger',
};

const SHIMMER = ['rgba(20,184,166,0.25)', 'rgba(20,184,166,0.55)', 'rgba(20,184,166,0.25)'];

export function AgentCard({
  icon: Icon,
  name,
  model,
  status,
  statusText,
  elapsedMs,
  resultText,
}: AgentCardProps) {
  const working = status === 'working';
  return (
    <motion.div
      className={`rounded-lg border p-4 bg-surface ${BORDER[status]}`}
      animate={working ? { borderColor: SHIMMER } : undefined}
      transition={working ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <div className="flex items-start gap-3">
        <Icon className={ICON_COLOR[status]} size={24} />
        <div className="flex-1 min-w-0">
          <p className="font-display text-base text-ink truncate">{name}</p>
          <p className="font-mono text-[11px] text-muted truncate">{model}</p>
        </div>
        {working && elapsedMs !== undefined && (
          <span className="font-mono text-xs text-muted tabular-nums">
            {(elapsedMs / 1000).toFixed(1)}s
          </span>
        )}
      </div>
      {statusText && <p className="text-body text-sm mt-3">{statusText}</p>}
      {status === 'done' && resultText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 mt-3 text-positive text-sm"
        >
          <CheckCircle size={16} />
          <span>{resultText}</span>
        </motion.div>
      )}
    </motion.div>
  );
}
