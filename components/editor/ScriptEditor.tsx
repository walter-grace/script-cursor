'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { SceneHeading } from '@/lib/tiptap/extensions/fountain-scene-heading';
import { Character } from '@/lib/tiptap/extensions/fountain-character';
import { Dialogue } from '@/lib/tiptap/extensions/fountain-dialogue';
import { Action } from '@/lib/tiptap/extensions/fountain-action';
import { parseFountainToTiptap, parseTiptapToFountain } from '@/lib/fountain/parser';
import { useEffect, useState } from 'react';

interface ScriptEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onSelectionChange?: (text: string, beforeText: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function ScriptEditor({
  content,
  onChange,
  onSelectionChange,
  placeholder = 'FADE IN:',
  editable = true,
}: ScriptEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      SceneHeading,
      Character,
      Dialogue,
      Action,
    ],
    content: content ? parseFountainToTiptap(content) : undefined,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onChange) {
        const fountainText = parseTiptapToFountain(editor.getJSON());
        onChange(fountainText);
      }
    },
    onSelectionUpdate: ({ editor }) => {
      if (onSelectionChange && editor.state.selection) {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to);
        if (selectedText) {
          const beforeText = editor.state.doc.textBetween(0, from);
          onSelectionChange(selectedText, beforeText);
        }
      }
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-8 font-mono',
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentFountain = parseTiptapToFountain(editor.getJSON());
      if (currentFountain !== content) {
        editor.commands.setContent(parseFountainToTiptap(content));
      }
    }
  }, [content, editor]);

  if (!isMounted || !editor) {
    return (
      <div className="w-full border rounded-lg overflow-hidden min-h-[500px] p-8 flex items-center justify-center">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="w-full border rounded-lg overflow-hidden">
      <EditorContent editor={editor} />
    </div>
  );
}

