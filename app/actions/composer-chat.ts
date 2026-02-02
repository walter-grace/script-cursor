'use server';

import { getOpenRouterClient } from '@/lib/ai/client';
import { getModelForTask } from '@/lib/ai/models';

export async function* composerChat(
  fullDocument: string,
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
) {
  try {
    const model = getModelForTask('context');

    const systemPrompt = `You are a professional screenwriting assistant with access to the full screenplay document. You can analyze plot, character development, dialogue, structure, and provide comprehensive feedback.

The user's screenplay is provided below. Answer their questions about the script, suggest improvements, analyze themes, characters, or structure.

Always be constructive and specific in your feedback.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
      {
        role: 'user' as const,
        content: `Full screenplay document:\n\n${fullDocument}\n\nUser question: ${userMessage}`,
      },
    ];

    const stream = await getOpenRouterClient().chat.completions.create({
      model,
      messages,
      stream: true,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error('Error in composer chat:', error);
    throw new Error('Failed to process chat message');
  }
}

