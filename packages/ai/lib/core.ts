import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

export type AIProvider = 'openai' | 'anthropic';

export interface AIModel {
  id: string;
  provider: AIProvider;
  name: string;
  model: string;
}

export const MODELS: Record<AIProvider, AIModel[]> = {
  openai: [
    { id: 'gpt-4o', provider: 'openai', name: 'GPT-4o', model: 'gpt-4o' },
    { id: 'gpt-4o-mini', provider: 'openai', name: 'GPT-4o Mini', model: 'gpt-4o-mini' },
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet', provider: 'anthropic', name: 'Claude 3.5 Sonnet', model: 'claude-3-5-sonnet-20241022' },
    { id: 'claude-3-5-haiku', provider: 'anthropic', name: 'Claude 3.5 Haiku', model: 'claude-3-5-haiku-20250107' },
  ],
};

export interface UserSettings {
  providers: {
    openai: { apiKey: string | null };
    anthropic: { apiKey: string | null };
  };
}

export function createAIProvider(provider: AIProvider, apiKey: string) {
  if (provider === 'openai') {
    return createOpenAI({ apiKey });
  }
  if (provider === 'anthropic') {
    return createAnthropic({ apiKey });
  }
  throw new Error(`Unknown provider: ${provider}`);
}
