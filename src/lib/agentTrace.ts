import type { AgentId, AgentInvocation } from './types';

const invocations: AgentInvocation[] = [];

export const agentTrace = {
  push(invocation: AgentInvocation): void {
    invocations.push(invocation);
  },
  update(id: string, patch: Partial<AgentInvocation>): void {
    const idx = invocations.findIndex((i) => i.id === id);
    if (idx >= 0) invocations[idx] = { ...invocations[idx], ...patch };
  },
  all(): AgentInvocation[] {
    return [...invocations];
  },
  byAgent(agentId: AgentId): AgentInvocation[] {
    return invocations.filter((i) => i.agentId === agentId);
  },
  find(id: string): AgentInvocation | undefined {
    return invocations.find((i) => i.id === id);
  },
  clear(): void {
    invocations.length = 0;
  },
};
