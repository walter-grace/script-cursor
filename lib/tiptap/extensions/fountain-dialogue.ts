import { Node, mergeAttributes } from '@tiptap/core';

export interface DialogueOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dialogue: {
      setDialogue: () => ReturnType;
    };
  }
}

export const Dialogue = Node.create<DialogueOptions>({
  name: 'dialogue',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: 'inline*',

  group: 'block',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'p[data-type="dialogue"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'dialogue',
        class: 'text-center',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setDialogue:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name);
        },
    };
  },
});

