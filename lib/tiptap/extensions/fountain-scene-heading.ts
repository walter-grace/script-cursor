import { Node, mergeAttributes } from '@tiptap/core';

export interface SceneHeadingOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sceneHeading: {
      setSceneHeading: () => ReturnType;
    };
  }
}

export const SceneHeading = Node.create<SceneHeadingOptions>({
  name: 'sceneHeading',

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
        tag: 'h2[data-type="scene-heading"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'h2',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'scene-heading',
        class: 'font-bold uppercase',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setSceneHeading:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name);
        },
    };
  },
});

