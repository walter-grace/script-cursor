import OpenAI from 'openai';
import { OPENROUTER_BASE_URL, getModelForTask, ModelTaskType } from './models';

function getOpenRouterApiKey() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set. Please add it to your environment variables.');
  }
  return process.env.OPENROUTER_API_KEY;
}

let openRouterClientInstance: OpenAI | null = null;

export function getOpenRouterClient() {
  if (!openRouterClientInstance) {
    openRouterClientInstance = new OpenAI({
      apiKey: getOpenRouterApiKey(),
      baseURL: OPENROUTER_BASE_URL,
    });
  }
  return openRouterClientInstance;
}

// Export for backward compatibility
export const openRouterClient = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return getOpenRouterClient()[prop as keyof OpenAI];
  },
});

export interface StreamOptions {
  selectedText: string;
  context: string;
  instruction: string;
  modelType: ModelTaskType;
}

export async function* streamAIResponse(options: StreamOptions) {
  const model = getModelForTask(options.modelType);

  const systemPrompt = `You are a professional screenwriting assistant. Your task is to edit screenplay text while maintaining strict Fountain format compliance.

Fountain format rules:
- Scene headings start with INT. or EXT. (uppercase, bold)
- Character names are uppercase, centered, and bold
- Dialogue is centered under character names
- Action/description is regular left-aligned text
- Transitions (FADE IN, CUT TO, etc.) are right-aligned and uppercase

CRITICAL: Always output valid Fountain format. Do not break the format structure.`;

  const userPrompt = `Context (preceding text):
${options.context}

Selected text to edit:
${options.selectedText}

Instruction: ${options.instruction}

Return only the edited text in valid Fountain format, maintaining the same structure as the original.`;

  const stream = await getOpenRouterClient().chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    stream: true,
    temperature: options.modelType === 'creative' ? 0.8 : 0.5,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      yield content;
    }
  }
}

