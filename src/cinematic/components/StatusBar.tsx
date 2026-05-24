import { Activity } from 'lucide-react';

type StatusBarProps = {
  activeAgents: string[];
  currentAction?: string;
  elapsedMs: number;
};

export function StatusBar({ activeAgents, currentAction, elapsedMs }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 h-10 rounded-md bg-surface border-t border-primary-ring px-4">
      <div className="flex items-center gap-2 min-w-0">
        <Activity size={14} className="text-primary animate-pulse shrink-0" />
        <span className="font-mono text-xs text-body truncate">
          {activeAgents.join(' · ')}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {currentAction && (
          <span className="text-body text-xs truncate max-w-[60vw]">{currentAction}</span>
        )}
        <span className="font-mono text-xs text-muted tabular-nums">
          {(elapsedMs / 1000).toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
