import { Node, mergeAttributes } from '@tiptap/core';

export interface CharacterOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    character: {
      setCharacter: () => ReturnType;
    };
  }
}

export const Character = Node.create<CharacterOptions>({
  name: 'character',

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
        tag: 'p[data-type="character"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'character',
        class: 'text-center font-bold uppercase',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCharacter:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name);
        },
    };
  },
});

