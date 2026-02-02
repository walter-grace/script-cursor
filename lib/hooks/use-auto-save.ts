'use client';

import { useEffect, useRef, useState } from 'react';
import { useScriptStore } from '@/lib/store/script-store';
import { saveScript } from '@/lib/db/scripts';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutoSave() {
  const { script, settings, markSaved } = useScriptStore();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Don't auto-save if disabled, no user, or no script ID/content
    if (
      !settings.autoSave ||
      !script.userId ||
      !script.content ||
      !script.isDirty
    ) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      if (!script.userId) return;

      setSaveStatus('saving');

      try {
        const saved = await saveScript(
          script.userId,
          script.id,
          script.title,
          script.content
        );

        // Update script ID if it was a new script
        if (!script.id && saved.id) {
          useScriptStore.getState().setScript({ id: saved.id });
        }

        markSaved();
        setSaveStatus('saved');

        // Reset to idle after showing saved status
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setSaveStatus('error');

        // Reset to idle after showing error
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      }
    }, settings.autoSaveInterval);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    script.content,
    script.title,
    script.id,
    script.userId,
    script.isDirty,
    settings.autoSave,
    settings.autoSaveInterval,
    markSaved,
  ]);

  return { saveStatus };
}

