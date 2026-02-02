'use client';

import { diffWords } from 'diff';
import { Button } from '@/components/ui/button';

interface DiffViewerProps {
  original: string;
  suggested: string;
  onAccept: () => void;
  onReject: () => void;
}

export function DiffViewer({
  original,
  suggested,
  onAccept,
  onReject,
}: DiffViewerProps) {
  const diff = diffWords(original, suggested);

  return (
    <div className="border rounded-lg p-4 bg-muted/50">
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Suggested Changes</h3>
        <div className="text-sm space-y-1">
          {diff.map((part, index) => {
            if (part.added) {
              return (
                <span key={index} className="bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100 px-1 rounded">
                  {part.value}
                </span>
              );
            }
            if (part.removed) {
              return (
                <span key={index} className="bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 px-1 rounded line-through">
                  {part.value}
                </span>
              );
            }
            return <span key={index}>{part.value}</span>;
          })}
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={onAccept} size="sm" variant="default">
          Accept
        </Button>
        <Button onClick={onReject} size="sm" variant="outline">
          Reject
        </Button>
      </div>
    </div>
  );
}

