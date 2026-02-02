import { Node, mergeAttributes } from '@tiptap/core';

export interface ActionOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    action: {
      setAction: () => ReturnType;
    };
  }
}

export const Action = Node.create<ActionOptions>({
  name: 'action',

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
        tag: 'p[data-type="action"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'action',
        class: '',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setAction:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name);
        },
    };
  },
});

