import { useEffect, useState } from 'react';

/**
 * Cycles through phases [0..count-1], advancing every `durations[phase]` ms.
 * Loops back to 0 after the last phase.
 */
export function useLoopPhase(durations: number[]): number {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const ms = durations[phase % durations.length];
    const id = window.setTimeout(
      () => setPhase((p) => (p + 1) % durations.length),
      ms,
    );
    return () => window.clearTimeout(id);
  }, [phase, durations]);

  return phase;
}
