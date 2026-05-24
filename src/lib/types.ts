export type AgentId =
  | 'EligibilityAgent'
  | 'SubmissionAgent'
  | 'StatusAgent'
  | 'IngestionAgent'
  | 'MatchingAgent'
  | 'VarianceAgent'
  | 'AppealAgent'
  | 'AnalyticsAgent';

export type AgentStatus =
  | 'idle'
  | 'starting'
  | 'thinking'
  | 'calling'
  | 'completed'
  | 'failed';

export type ModelId =
  | 'deepseek-chat'
  | 'deepseek-reasoner';

export type AgentInvocation = {
  id: string;
  agentId: AgentId;
  startedAt: number;
  completedAt?: number;
  status: AgentStatus;
  input: unknown;
  output?: unknown;
  reasoning?: string;
  error?: string;
  usedFallback: boolean;
  tokens?: { input: number; output: number };
  latencyMs?: number;
};

export type AgentEvent =
  | { type: 'started'; invocationId: string; agentId: AgentId; timestamp: number }
  | { type: 'thinking'; invocationId: string; agentId: AgentId; timestamp: number; chunk: string }
  | { type: 'streaming'; invocationId: string; agentId: AgentId; timestamp: number; chunk: string }
  | { type: 'completed'; invocationId: string; agentId: AgentId; timestamp: number; output: unknown }
  | { type: 'failed'; invocationId: string; agentId: AgentId; timestamp: number; error: string };

export type AgentDefinition<TInput, TOutput> = {
  id: AgentId;
  model: ModelId;
  description: string;
  systemPrompt: string;
  buildUserPrompt: (input: TInput) => string;
  parseOutput: (raw: string) => TOutput;
  fallback: (input: TInput) => TOutput;
  expectedLatencyMs: number;
};

export type RunAgentOptions = {
  liveCall?: boolean;
  onEvent?: (event: AgentEvent) => void;
};

export type RunAgentResult<TOutput> = {
  output: TOutput;
  invocation: AgentInvocation;
};
