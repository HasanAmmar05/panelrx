# Phase 8 — Agentic Harness

**Goal**: Build the production-grade agentic orchestration layer that powers `/eligibility`, `/submit`, `/reconcile`. This is the foundation that makes our product genuinely agentic, not just animated.

**Dependencies**: none (can be built Saturday in parallel with Phase 1-2 if running multiple Claude Code sessions)

**Output**: A complete `src/lib/` module with ClaudeClient, AgentRegistry, EventBus, AgentTrace, and Orchestrator. Plus an `/agents-debug` route for QA.

## Architecture overview

```
src/lib/
├── types.ts             # Re-exports from data-contracts.md
├── claudeClient.ts      # Wrapped Anthropic SDK
├── eventBus.ts          # Pub/sub for agent lifecycle events
├── agentTrace.ts        # Append-only audit log
├── agentRegistry.ts     # Map of all agent definitions
├── orchestrator.ts      # Workflow orchestration
└── agents/              # One file per agent
    ├── eligibilityAgent.ts
    ├── submissionAgent.ts
    ├── statusAgent.ts
    ├── ingestionAgent.ts
    ├── matchingAgent.ts
    ├── varianceAgent.ts
    ├── appealAgent.ts
    └── analyticsAgent.ts
```

## Files to create

### `src/lib/types.ts`

Re-export the agent harness types from `.claude/data-contracts.md`. Plus:

```typescript
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
  liveCall?: boolean;        // if false, always use fallback
  onEvent?: (event: AgentEvent) => void;
};

export type RunAgentResult<TOutput> = {
  output: TOutput;
  invocation: AgentInvocation;
};
```

### `src/lib/claudeClient.ts`

A wrapped Anthropic API client that:
- Reads API key from `import.meta.env.VITE_ANTHROPIC_API_KEY`
- Has a `callClaude` function with options: `{ model, system, user, maxTokens, stream }`
- 15-second timeout
- Returns the response text (or throws on failure)
- For streaming: yields chunks via async iterator

```typescript
const API_BASE = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

const MODEL_IDS: Record<ModelId, string> = {
  "claude-haiku-4-5": "claude-haiku-4-5",
  "claude-sonnet-4-6": "claude-sonnet-4-6",
  "claude-opus-4-7": "claude-opus-4-7",
};

export async function callClaude(options: {
  model: ModelId;
  system: string;
  user: string;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<{ text: string; tokens: { input: number; output: number } }> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("[PanelRx/claudeClient] No API key found");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);

  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "anthropic-dangerous-direct-browser-access": "true",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_IDS[options.model],
        max_tokens: options.maxTokens ?? 1024,
        system: options.system,
        messages: [{ role: "user", content: options.user }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!response.ok) {
      throw new Error(`[PanelRx/claudeClient] HTTP ${response.status}`);
    }
    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";
    const tokens = {
      input: data.usage?.input_tokens ?? 0,
      output: data.usage?.output_tokens ?? 0,
    };
    return { text, tokens };
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}
```

### `src/lib/eventBus.ts`

A simple pub/sub for agent lifecycle events.

```typescript
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
        console.error("[PanelRx/eventBus] listener error:", e);
      }
    }
  },
};
```

Plus a React hook for subscribing in components:

```typescript
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
```

### `src/lib/agentTrace.ts`

Append-only log of agent invocations. In-memory for the hackathon (localStorage backup optional).

```typescript
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
  clear(): void {
    invocations.length = 0;
  },
};
```

### `src/lib/agentRegistry.ts`

A map of all agent definitions:

```typescript
import { eligibilityAgent } from "./agents/eligibilityAgent";
// ... import all 8 agents

export const agents = {
  EligibilityAgent: eligibilityAgent,
  SubmissionAgent: submissionAgent,
  StatusAgent: statusAgent,
  IngestionAgent: ingestionAgent,
  MatchingAgent: matchingAgent,
  VarianceAgent: varianceAgent,
  AppealAgent: appealAgent,
  AnalyticsAgent: analyticsAgent,
} as const;

export type AgentInputType<K extends AgentId> = ...;  // inferred from registry
export type AgentOutputType<K extends AgentId> = ...;
```

### `src/lib/orchestrator.ts`

The runAgent function — the public API.

```typescript
import { v4 as uuid } from "uuid";  // npm install uuid; if not allowed, use Math.random-based id

export async function runAgent<TInput, TOutput>(
  agent: AgentDefinition<TInput, TOutput>,
  input: TInput,
  options: RunAgentOptions = {}
): Promise<RunAgentResult<TOutput>> {
  const id = generateId();
  const startedAt = Date.now();

  const invocation: AgentInvocation = {
    id,
    agentId: agent.id,
    startedAt,
    status: "starting",
    input,
    usedFallback: false,
  };
  agentTrace.push(invocation);
  eventBus.emit({ type: "started", invocationId: id, agentId: agent.id, timestamp: startedAt });

  const shouldUseLiveCall = options.liveCall ?? true;

  try {
    if (!shouldUseLiveCall) {
      // Use fallback path
      const output = agent.fallback(input);
      finishInvocation(id, output, true);
      return { output, invocation: agentTrace.all().find((i) => i.id === id)! };
    }

    // Live call
    agentTrace.update(id, { status: "calling" });
    eventBus.emit({ type: "thinking", invocationId: id, agentId: agent.id, timestamp: Date.now(), chunk: "" });

    const userPrompt = agent.buildUserPrompt(input);
    const { text, tokens } = await callClaude({
      model: agent.model,
      system: agent.systemPrompt,
      user: userPrompt,
    });

    const output = agent.parseOutput(text);
    finishInvocation(id, output, false, tokens);
    return { output, invocation: agentTrace.all().find((i) => i.id === id)! };
  } catch (error) {
    console.warn(`[PanelRx/orchestrator] ${agent.id} failed, using fallback:`, error);
    const output = agent.fallback(input);
    finishInvocation(id, output, true, undefined, String(error));
    return { output, invocation: agentTrace.all().find((i) => i.id === id)! };
  }
}

function finishInvocation(
  id: string,
  output: unknown,
  usedFallback: boolean,
  tokens?: { input: number; output: number },
  error?: string
) {
  const completedAt = Date.now();
  const invocation = agentTrace.all().find((i) => i.id === id)!;
  const latencyMs = completedAt - invocation.startedAt;
  agentTrace.update(id, {
    completedAt,
    status: error ? "failed" : "completed",
    output,
    usedFallback,
    tokens,
    error,
    latencyMs,
  });
  eventBus.emit({
    type: error ? "failed" : "completed",
    invocationId: id,
    agentId: invocation.agentId,
    timestamp: completedAt,
    ...(error ? { error } : { output }),
  } as AgentEvent);
}

function generateId(): string {
  return `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
```

### Individual agent files (`src/lib/agents/`)

Each agent file exports a fully-defined `AgentDefinition`. The most important ones:

**`appealAgent.ts`** — this is the only agent making real Claude calls in the demo

```typescript
type AppealInput = {
  tpaName: string;
  patientName: string;
  patientIcHashed: string;
  serviceDate: string;
  billedRm: number;
  paidRm: number;
  deductionReason: string;
  remittanceRef: string;
  doctorName: string;
  doctorMmc: string;
  clinicName: string;
};

type AppealOutput = {
  englishLetter: string;
  bahasaLetter: string;
};

export const appealAgent: AgentDefinition<AppealInput, AppealOutput> = {
  id: "AppealAgent",
  model: "claude-sonnet-4-6",
  description: "Drafts bilingual (Bahasa Malaysia + English) appeal letters for unexplained TPA deductions.",
  expectedLatencyMs: 4000,
  systemPrompt: `You are an expert healthcare claims appeal writer for Malaysian GP clinics. You draft formal but firm appeal letters in both English and Bahasa Malaysia.

Tone: professional, evidence-based, never aggressive. Format: produce TWO complete letters separated by the exact delimiter "---BAHASA---".

Cite Schedule 7 of the Private Healthcare Facilities and Services Act 1998 and the Malaysian Medical Council May 2026 ruling on fee transparency where relevant. Request written justification within 14 days. Keep each letter under 250 words.

Output ONLY the two letters with the delimiter. No preamble, no explanation.`,
  buildUserPrompt: (input) => `Generate an appeal letter for this deduction:

TPA: ${input.tpaName}
Patient (hashed): ${input.patientIcHashed}
Service Date: ${input.serviceDate}
Billed: RM ${input.billedRm.toFixed(2)}
Paid: RM ${input.paidRm.toFixed(2)}
Deduction Reason Given: "${input.deductionReason}"
Remittance Ref: ${input.remittanceRef}

Clinic: ${input.clinicName}
Doctor: ${input.doctorName} (${input.doctorMmc})

Produce: (1) English letter, (2) "---BAHASA---" delimiter, (3) Bahasa Malaysia equivalent.`,
  parseOutput: (raw) => {
    const parts = raw.split("---BAHASA---");
    return {
      englishLetter: parts[0]?.trim() ?? "",
      bahasaLetter: parts[1]?.trim() ?? "",
    };
  },
  fallback: (input) => ({
    englishLetter: `Dear ${input.tpaName} Claims Department,

Re: Remittance ${input.remittanceRef}, Patient ID ${input.patientIcHashed}, Service Date ${input.serviceDate}

We refer to your remittance in which the above claim was paid at RM ${input.paidRm.toFixed(2)} against a billed amount of RM ${input.billedRm.toFixed(2)}, with a deduction cited as "${input.deductionReason}."

Our records show no contractual clause permitting this deduction. We respectfully request written justification within fourteen (14) days, with reference to the specific clause of our panel agreement authorising this deduction.

This claim is being formally appealed under our rights as a panel provider, consistent with the Private Healthcare Facilities and Services Act 1998 and the Malaysian Medical Council's May 2026 position on fee transparency.

Yours sincerely,
${input.doctorName} (${input.doctorMmc})
${input.clinicName}`,
    bahasaLetter: `Kepada Jabatan Tuntutan ${input.tpaName},

Perkara: Remitan ${input.remittanceRef}, ID Pesakit ${input.patientIcHashed}, Tarikh Khidmat ${input.serviceDate}

Kami merujuk kepada remitan tuan di mana tuntutan tersebut telah dibayar sebanyak RM ${input.paidRm.toFixed(2)} berbanding amaun yang dikenakan RM ${input.billedRm.toFixed(2)}, dengan potongan dinyatakan sebagai "${input.deductionReason}."

Rekod kami menunjukkan tiada klausa kontrak yang membenarkan potongan ini. Dengan hormatnya kami memohon justifikasi bertulis dalam tempoh empat belas (14) hari, dengan rujukan kepada klausa spesifik perjanjian panel kami.

Tuntutan ini dirayu secara formal di bawah hak kami sebagai pembekal panel, selaras dengan Akta Kemudahan dan Perkhidmatan Jagaan Kesihatan Swasta 1998 dan kedudukan Majlis Perubatan Malaysia Mei 2026 mengenai ketelusan fi.

Yang benar,
${input.doctorName} (${input.doctorMmc})
${input.clinicName}`,
  }),
};
```

For the OTHER 7 agents — keep them simpler. Each one has the same structure but the `fallback` returns deterministic mocked data and Claude is NOT called (we'll set `liveCall: false` when invoking them in product pages). Define each one with realistic fallbacks but minimal LLM prompting.

### `/agents-debug` route

Create `src/pages/AgentsDebug.tsx` — a temporary page for testing agent invocations:

- Top: button "Test AppealAgent (live call)" → runs the AppealAgent with sample input
- Below: live log of events from `useAgentEvents()`
- Below that: full `agentTrace.all()` as a JSON table

This page proves the harness works before we build /reconcile.

Add `/agents-debug` to App.tsx routing.

## Smoke test

`.claude/smoke-tests/phase-08.test.md`:

1. Open `/agents-debug`. See empty event log.
2. Click "Test AppealAgent (live call)" with VITE_ANTHROPIC_API_KEY set in .env.local
3. See events appear: started → calling → completed
4. Generated letter appears with both English and Bahasa text
5. Check agentTrace: invocation has tokens, latencyMs, usedFallback=false
6. Without API key: events still emit, but usedFallback=true and fallback letter appears
7. `npx tsc --noEmit` passes

## Acceptance criteria

- Live Claude call succeeds with valid API key
- Fallback path works without API key
- Event bus emits in correct sequence
- Agent trace records every invocation
- No console errors

## Commit

`Phase 8: agentic harness with claude client, event bus, agent trace, 8 agent definitions`
