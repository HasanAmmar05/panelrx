import type { AgentDefinition, AgentEvent, AgentInvocation, RunAgentOptions, RunAgentResult } from './types';
import { callLLM } from './llmClient';
import { agentTrace } from './agentTrace';
import { eventBus } from './eventBus';
import { generateId } from './utils';

export async function runAgent<TInput, TOutput>(
  agent: AgentDefinition<TInput, TOutput>,
  input: TInput,
  options: RunAgentOptions = {},
): Promise<RunAgentResult<TOutput>> {
  const id = generateId();
  const startedAt = Date.now();

  const invocation: AgentInvocation = {
    id,
    agentId: agent.id,
    startedAt,
    status: 'starting',
    input,
    usedFallback: false,
  };
  agentTrace.push(invocation);
  eventBus.emit({ type: 'started', invocationId: id, agentId: agent.id, timestamp: startedAt });

  const shouldUseLiveCall = options.liveCall ?? true;

  try {
    if (!shouldUseLiveCall) {
      const output = agent.fallback(input);
      finishInvocation(id, output, true);
      return { output, invocation: agentTrace.find(id)! };
    }

    agentTrace.update(id, { status: 'calling' });
    eventBus.emit({ type: 'thinking', invocationId: id, agentId: agent.id, timestamp: Date.now(), chunk: '' });

    const userPrompt = agent.buildUserPrompt(input);
    const { text, tokens } = await callLLM({
      model: agent.model,
      system: agent.systemPrompt,
      user: userPrompt,
    });

    const output = agent.parseOutput(text);
    finishInvocation(id, output, false, tokens);
    return { output, invocation: agentTrace.find(id)! };
  } catch (error) {
    console.warn(`[ClinicMate/orchestrator] ${agent.id} failed, using fallback:`, error);
    const output = agent.fallback(input);
    finishInvocation(id, output, true, undefined, String(error));
    return { output, invocation: agentTrace.find(id)! };
  }
}

function finishInvocation(
  id: string,
  output: unknown,
  usedFallback: boolean,
  tokens?: { input: number; output: number },
  error?: string,
) {
  const completedAt = Date.now();
  const inv = agentTrace.find(id);
  if (!inv) return;
  const latencyMs = completedAt - inv.startedAt;
  agentTrace.update(id, {
    completedAt,
    status: error ? 'failed' : 'completed',
    output,
    usedFallback,
    tokens,
    error,
    latencyMs,
  });
  eventBus.emit({
    type: error ? 'failed' : 'completed',
    invocationId: id,
    agentId: inv.agentId,
    timestamp: completedAt,
    ...(error ? { error } : { output }),
  } as AgentEvent);
}
