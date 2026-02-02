export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export type ModelTaskType = 'creative' | 'logic' | 'context' | 'fast';

export interface ModelRegistry {
  creative: string;
  logic: string;
  context: string;
  fast: string;
}

export const ModelRegistry: ModelRegistry = {
  creative: 'anthropic/claude-3.5-sonnet',
  logic: 'deepseek/deepseek-chat-v3',
  context: 'google/gemini-pro-1.5',
  fast: 'meta-llama/llama-3-8b-instruct',
};

export function getModelForTask(task: ModelTaskType): string {
  return ModelRegistry[task];
}

