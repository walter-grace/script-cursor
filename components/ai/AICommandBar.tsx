'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModelTaskType } from '@/lib/ai/models';
import { ShadowBlock } from './ShadowBlock';
import { DiffViewer } from './DiffViewer';

interface AICommandBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText: string;
  context: string;
  onAccept: (newText: string) => void;
}

export function AICommandBar({
  open,
  onOpenChange,
  selectedText,
  context,
  onAccept,
}: AICommandBarProps) {
  const [instruction, setInstruction] = useState('');
  const [modelType, setModelType] = useState<ModelTaskType>('creative');
  const [stream, setStream] = useState<AsyncGenerator<string, void, unknown> | null>(null);
  const [suggestedText, setSuggestedText] = useState('');
  const [showDiff, setShowDiff] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!instruction.trim() || !selectedText) return;

    try {
      const response = await fetch('/api/generate-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedText,
          context: context.slice(-500),
          instruction,
          modelType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate edit');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Convert ReadableStream to async generator
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      async function* streamGenerator() {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            yield decoder.decode(value, { stream: true });
          }
        } finally {
          reader.releaseLock();
        }
      }

      setStream(streamGenerator());
      setShowDiff(false);
    } catch (error) {
      console.error('Error generating edit:', error);
    }
  };

  const handleStreamComplete = (fullText: string) => {
    setSuggestedText(fullText);
    setShowDiff(true);
  };

  const handleAccept = () => {
    onAccept(suggestedText);
    handleClose();
  };

  const handleClose = () => {
    setInstruction('');
    setSuggestedText('');
    setStream(null);
    setShowDiff(false);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Edit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Instruction</label>
            <Input
              ref={inputRef}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Make this funnier, rewrite this dialogue, etc."
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Model Persona</label>
            <Select value={modelType} onValueChange={(value) => setModelType(value as ModelTaskType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="creative">Creative (Claude 3.5 Sonnet)</SelectItem>
                <SelectItem value="logic">Logic (DeepSeek Chat v3)</SelectItem>
                <SelectItem value="context">Context (Gemini Pro 1.5)</SelectItem>
                <SelectItem value="fast">Fast (Llama 3 8B)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground">
            Selected text: {selectedText.slice(0, 50)}
            {selectedText.length > 50 ? '...' : ''}
          </div>
          {stream && (
            <ShadowBlock stream={stream} onComplete={handleStreamComplete} />
          )}
          {showDiff && suggestedText && (
            <DiffViewer
              original={selectedText}
              suggested={suggestedText}
              onAccept={handleAccept}
              onReject={handleClose}
            />
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!instruction.trim() || !!stream}>
              Generate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

