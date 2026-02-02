import { NextRequest } from 'next/server';
import { streamAIResponse, ModelTaskType } from '@/lib/ai/client';

export async function POST(request: NextRequest) {
  try {
    const { selectedText, context, instruction, modelType } = await request.json();

    const stream = streamAIResponse({
      selectedText,
      context: context.slice(-500),
      instruction,
      modelType: modelType || 'creative',
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk));
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
    console.error('Error in generate-edit route:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate edit' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

