'use client';

import { useEffect, useState } from 'react';

interface ShadowBlockProps {
  stream: AsyncGenerator<string, void, unknown>;
  onComplete: (fullText: string) => void;
}

export function ShadowBlock({ stream, onComplete }: ShadowBlockProps) {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let accumulatedContent = '';

    async function consumeStream() {
      try {
        for await (const chunk of stream) {
          if (cancelled) break;
          accumulatedContent += chunk;
          setContent(accumulatedContent);
        }
        setIsStreaming(false);
        if (!cancelled) {
          onComplete(accumulatedContent);
        }
      } catch (error) {
        console.error('Error streaming content:', error);
        setIsStreaming(false);
      }
    }

    consumeStream();

    return () => {
      cancelled = true;
    };
  }, [stream, onComplete]);

  return (
    <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 bg-muted/30 mt-4">
      <div className="text-xs text-muted-foreground mb-2">
        {isStreaming ? 'Generating...' : 'Generated'}
      </div>
      <div className="text-sm whitespace-pre-wrap font-mono">
        {content}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
        )}
      </div>
    </div>
  );
}

