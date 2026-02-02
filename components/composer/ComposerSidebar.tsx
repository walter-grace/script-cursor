'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ComposerSidebarProps {
  fullDocument: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function ComposerSidebar({
  fullDocument,
  isOpen,
  onToggle,
}: ComposerSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStream, setCurrentStream] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStream]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsStreaming(true);
    setCurrentStream('');

    try {
      const response = await fetch('/api/composer-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullDocument,
          userMessage,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process chat message');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setCurrentStream(fullResponse);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: fullResponse }]);
      setCurrentStream('');
    } catch (error) {
      console.error('Error in composer chat:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        className="fixed right-4 top-4 z-50"
      >
        Open Composer
      </Button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Composer</h2>
        <Button onClick={onToggle} variant="ghost" size="sm">
          Close
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8">
            Ask questions about your screenplay. The AI has access to the full document.
          </div>
        )}
        {messages.map((message, index) => (
          <Card
            key={index}
            className={`p-3 ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]'
                : 'bg-muted max-w-[90%]'
            }`}
          >
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          </Card>
        ))}
        {isStreaming && currentStream && (
          <Card className="p-3 bg-muted max-w-[90%]">
            <div className="text-sm whitespace-pre-wrap">
              {currentStream}
              <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
            </div>
          </Card>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your script..."
            disabled={isStreaming}
          />
          <Button type="submit" disabled={!input.trim() || isStreaming}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}

