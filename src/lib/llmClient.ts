import type { ModelId } from './types';

const API_BASE = 'https://api.deepseek.com/v1/chat/completions';

const MODEL_IDS: Record<ModelId, string> = {
  'deepseek-chat': 'deepseek-chat',
  'deepseek-reasoner': 'deepseek-reasoner',
};

export async function callLLM(options: {
  model: ModelId;
  system: string;
  user: string;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<{ text: string; tokens: { input: number; output: number } }> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('[PanelRx/llmClient] No VITE_DEEPSEEK_API_KEY found');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_IDS[options.model],
        max_tokens: options.maxTokens ?? 1024,
        messages: [
          { role: 'system', content: options.system },
          { role: 'user', content: options.user },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!response.ok) {
      throw new Error(`[PanelRx/llmClient] HTTP ${response.status}`);
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    const tokens = {
      input: data.usage?.prompt_tokens ?? 0,
      output: data.usage?.completion_tokens ?? 0,
    };
    return { text, tokens };
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}
