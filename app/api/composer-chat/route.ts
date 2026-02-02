import { NextRequest } from 'next/server';
import { openRouterClient } from '@/lib/ai/client';
import { getModelForTask } from '@/lib/ai/models';

export async function POST(request: NextRequest) {
  try {
    const { fullDocument, userMessage, conversationHistory = [] } = await request.json();

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

    const stream = await openRouterClient.chat.completions.create({
      model,
      messages,
      stream: true,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error in composer-chat route:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

