import { create } from 'zustand';
import { ModelTaskType } from '@/lib/ai/models';

export interface ScriptState {
  id: string | null;
  title: string;
  content: string;
  userId: string | null;
  lastSaved: Date | null;
  isDirty: boolean;
}

export interface EditorState {
  selection: {
    from: number;
    to: number;
    text: string;
  } | null;
  cursorPosition: number;
}

export interface Settings {
  defaultModelType: ModelTaskType;
  theme: 'light' | 'dark' | 'system';
  autoSave: boolean;
  autoSaveInterval: number; // milliseconds
}

export interface ScriptStore {
  // Script state
  script: ScriptState;
  editor: EditorState;
  settings: Settings;

  // Script actions
  setScript: (script: Partial<ScriptState>) => void;
  updateContent: (content: string) => void;
  setTitle: (title: string) => void;
  markSaved: () => void;
  resetScript: () => void;

  // Editor actions
  setSelection: (selection: EditorState['selection']) => void;
  setCursorPosition: (position: number) => void;

  // Settings actions
  updateSettings: (settings: Partial<Settings>) => void;
}

const initialState: ScriptState = {
  id: null,
  title: 'Untitled Script',
  content: '',
  userId: null,
  lastSaved: null,
  isDirty: false,
};

const initialEditorState: EditorState = {
  selection: null,
  cursorPosition: 0,
};

const initialSettings: Settings = {
  defaultModelType: 'creative',
  theme: 'system',
  autoSave: true,
  autoSaveInterval: 3000, // 3 seconds
};

export const useScriptStore = create<ScriptStore>((set) => ({
  script: initialState,
  editor: initialEditorState,
  settings: initialSettings,

  setScript: (script) =>
    set((state) => ({
      script: { ...state.script, ...script },
    })),

  updateContent: (content) =>
    set((state) => ({
      script: {
        ...state.script,
        content,
        isDirty: true,
      },
    })),

  setTitle: (title) =>
    set((state) => ({
      script: {
        ...state.script,
        title,
        isDirty: true,
      },
    })),

  markSaved: () =>
    set((state) => ({
      script: {
        ...state.script,
        lastSaved: new Date(),
        isDirty: false,
      },
    })),

  resetScript: () =>
    set({
      script: initialState,
      editor: initialEditorState,
    }),

  setSelection: (selection) =>
    set((state) => ({
      editor: { ...state.editor, selection },
    })),

  setCursorPosition: (cursorPosition) =>
    set((state) => ({
      editor: { ...state.editor, cursorPosition },
    })),

  updateSettings: (settings) =>
    set((state) => ({
      settings: { ...state.settings, ...settings },
    })),
}));

