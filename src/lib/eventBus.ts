import { useState, useEffect } from 'react';
import type { AgentEvent, AgentId } from './types';

type Listener = (event: AgentEvent) => void;
const listeners = new Set<Listener>();

export const eventBus = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  emit(event: AgentEvent): void {
    for (const listener of listeners) {
      try {
        listener(event);
      } catch (e) {
        console.error('[ClinicMate/eventBus] listener error:', e);
      }
    }
  },
};

export function useAgentEvents(filter?: { agentId?: AgentId }): AgentEvent[] {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  useEffect(() => {
    return eventBus.subscribe((event) => {
      if (filter?.agentId && event.agentId !== filter.agentId) return;
      setEvents((prev) => [...prev, event]);
    });
  }, [filter?.agentId]);
  return events;
}
