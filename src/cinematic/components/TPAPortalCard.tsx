import {
  CheckCircle,
  Globe,
  Monitor,
  Phone,
  Smartphone,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

type AccessMethod = 'api' | 'portal' | 'hotline' | 'app';
type Status = 'calling' | 'success' | 'failure';

const METHOD_ICONS: Record<AccessMethod, LucideIcon> = {
  api: Globe,
  portal: Monitor,
  hotline: Phone,
  app: Smartphone,
};

const BORDER: Record<Status, string> = {
  calling: 'border-border',
  success: 'border-positive/40',
  failure: 'border-danger/40',
};

type TPAPortalCardProps = {
  tpaName: string;
  accessMethod: AccessMethod;
  status: Status;
  responseText?: string;
  latencyMs?: number;
};

export function TPAPortalCard({
  tpaName,
  accessMethod,
  status,
  responseText,
  latencyMs,
}: TPAPortalCardProps) {
  const MethodIcon = METHOD_ICONS[accessMethod];
  return (
    <div
      className={`rounded-md border bg-surface p-3 min-w-72 transition-colors ${BORDER[status]}`}
    >
      <div className="h-6 flex items-center justify-between border-b border-border mb-3 pb-1">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-danger" aria-hidden />
          <span className="w-1.5 h-1.5 rounded-full bg-amber" aria-hidden />
          <span className="w-1.5 h-1.5 rounded-full bg-positive" aria-hidden />
        </div>
        <span className="font-mono text-xs text-body">{tpaName}</span>
        <MethodIcon size={14} className="text-muted" />
      </div>

      <div className="h-20 relative">
        {status === 'calling' && (
          <div className="space-y-2 pt-1">
            <div className="h-2 rounded bg-border animate-pulse w-3/4" />
            <div className="h-2 rounded bg-border animate-pulse w-1/2" />
            <div className="h-2 rounded bg-border animate-pulse w-2/3" />
          </div>
        )}
        {status === 'success' && responseText && (
          <>
            <CheckCircle size={16} className="absolute top-0 right-0 text-positive" />
            <p className="text-body text-sm pr-6">{responseText}</p>
          </>
        )}
        {status === 'failure' && responseText && (
          <>
            <XCircle size={16} className="absolute top-0 right-0 text-danger" />
            <p className="text-danger text-sm pr-6">{responseText}</p>
          </>
        )}
      </div>

      {latencyMs !== undefined && (
        <p className="font-mono text-xs text-muted tabular-nums text-right mt-2">
          {latencyMs}ms
        </p>
      )}
    </div>
  );
}
