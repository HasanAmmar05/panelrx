import { useLoopPhase } from './useLoopPhase';

const LINES = [
  '$ curl -X POST api.micare.com.my/v2/claims',
  '> Authorization: Bearer ****',
  '> Content-Type: application/json',
  'Sending...',
];

const PHASES = [900, 800, 700, 600, 1000]; // one per line + pause

export function ApiSim() {
  const phase = useLoopPhase(PHASES);

  const visibleLines = Math.min(phase + 1, LINES.length);

  return (
    <div className="h-full font-mono text-[10px] leading-tight overflow-hidden">
      <div className="border border-border rounded-sm bg-surface-elevated px-1.5 py-1 h-full">
        {LINES.slice(0, visibleLines).map((line, i) => (
          <p
            key={i}
            className={
              line.startsWith('$')
                ? 'text-primary'
                : line.startsWith('>')
                  ? 'text-muted'
                  : 'text-body'
            }
          >
            {i === visibleLines - 1 && phase < LINES.length ? (
              <>
                {line}
                <span className="animate-blink">▌</span>
              </>
            ) : (
              line
            )}
          </p>
        ))}
        {phase >= LINES.length && (
          <p className="text-muted">
            <span className="animate-blink">▌</span>
          </p>
        )}
      </div>
    </div>
  );
}
