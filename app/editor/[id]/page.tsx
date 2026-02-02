'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ScriptEditor } from '@/components/editor/ScriptEditor';
import { AICommandBar } from '@/components/ai/AICommandBar';
import { ComposerSidebar } from '@/components/composer/ComposerSidebar';
import { useScriptStore } from '@/lib/store/script-store';
import { useAutoSave } from '@/lib/hooks/use-auto-save';
import { loadScriptAction } from '@/app/actions/load-script';
import { createOrGetUserAction } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/upload/FileUpload';
import { ExportScript } from '@/components/export/ExportScript';

const DEFAULT_USER_EMAIL = 'demo@scriptcursor.com';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const scriptId = params.id as string;
  const isNew = scriptId === 'new';

  const { script, setScript, updateContent, setTitle, setSelection } =
    useScriptStore();
  const { saveStatus } = useAutoSave();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [context, setContext] = useState('');

  useEffect(() => {
    async function load() {
      if (isNew) {
        // Initialize new script
        const user = await createOrGetUserAction(DEFAULT_USER_EMAIL, 'Demo User');
        setScript({
          id: null,
          title: 'Untitled Script',
          content: '',
          userId: user.id,
          isDirty: false,
        });
        return;
      }

      try {
        const loadedScript = await loadScriptAction(scriptId);
        const user = await createOrGetUserAction(DEFAULT_USER_EMAIL, 'Demo User');
        setScript({
          id: loadedScript.id,
          title: loadedScript.title,
          content: loadedScript.content,
          userId: user.id,
          isDirty: false,
        });
      } catch (error) {
        console.error('Error loading script:', error);
        router.push('/');
      }
    }

    load();
  }, [scriptId, isNew, setScript, router]);

  // Handle Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandBarOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleEditorChange = (content: string) => {
    updateContent(content);
  };

  const handleTextSelection = (text: string, beforeText: string) => {
    setSelectedText(text);
    setContext(beforeText);
    setIsCommandBarOpen(true);
  };

  const handleAcceptEdit = (newText: string) => {
    // Replace selected text in content
    const currentContent = script.content;
    const beforeText = context;
    const afterText = currentContent.slice(
      currentContent.indexOf(beforeText) + beforeText.length + selectedText.length
    );
    const newContent = beforeText + newText + afterText;
    updateContent(newContent);
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Error saving';
      default:
        return script.isDirty ? 'Unsaved changes' : '';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
            <Input
              value={script.title}
              onChange={(e) => setTitle(e.target.value)}
              className="max-w-xs font-semibold"
              placeholder="Script Title"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              {getSaveStatusText()}
            </span>
            <FileUpload
              size="sm"
              onUploadComplete={(scriptId) => {
                router.push(`/editor/${scriptId}`);
              }}
            />
            <ExportScript size="sm" />
            <Button
              onClick={() => setIsComposerOpen(!isComposerOpen)}
              variant="outline"
              size="sm"
            >
              {isComposerOpen ? 'Close' : 'Open'} Composer
            </Button>
          </div>
        </header>

        {/* Editor */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            <ScriptEditor
              content={script.content}
              onChange={handleEditorChange}
              onSelectionChange={handleTextSelection}
              placeholder="FADE IN:"
            />
          </div>
        </div>
      </div>

      {/* Composer Sidebar */}
      <ComposerSidebar
        fullDocument={script.content}
        isOpen={isComposerOpen}
        onToggle={() => setIsComposerOpen(!isComposerOpen)}
      />

      {/* AI Command Bar */}
      <AICommandBar
        open={isCommandBarOpen}
        onOpenChange={setIsCommandBarOpen}
        selectedText={selectedText}
        context={context}
        onAccept={handleAcceptEdit}
      />
    </div>
  );
}

