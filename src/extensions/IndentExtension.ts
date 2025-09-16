import { Extension } from '@tiptap/core';

export interface IndentOptions {
  types: string[];
  indentLevels: number[];
  defaultIndentLevel: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      /**
       * Set the indent level
       */
      setIndent: (level: number) => ReturnType;
      /**
       * Increase indent
       */
      increaseIndent: () => ReturnType;
      /**
       * Decrease indent  
       */
      decreaseIndent: () => ReturnType;
      /**
       * Unset indent
       */
      unsetIndent: () => ReturnType;
    };
  }
}

const IndentExtension = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading', 'listItem'],
      indentLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      defaultIndentLevel: 0,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: this.options.defaultIndentLevel,
            parseHTML: element => {
              const marginLeft = element.style.marginLeft;
              if (marginLeft) {
                const level = Math.round(parseInt(marginLeft) / 30);
                return Math.max(0, Math.min(level, 8));
              }
              return this.options.defaultIndentLevel;
            },
            renderHTML: attributes => {
              if (!attributes.indent || attributes.indent === 0) {
                return {};
              }
              return {
                style: `margin-left: ${attributes.indent * 30}px`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setIndent:
        (level: number) =>
        ({ chain }) => {
          const validLevel = Math.max(0, Math.min(level, 8));
          return chain()
            .updateAttributes('paragraph', { indent: validLevel })
            .updateAttributes('heading', { indent: validLevel })
            .run();
        },
      
      increaseIndent:
        () =>
        ({ editor, chain }) => {
          const { selection } = editor.state;
          const { $from } = selection;
          const node = $from.node();
          const currentIndent = node.attrs.indent || 0;
          const newIndent = Math.min(currentIndent + 1, 8);
          
          return chain()
            .updateAttributes('paragraph', { indent: newIndent })
            .updateAttributes('heading', { indent: newIndent })
            .run();
        },
        
      decreaseIndent:
        () =>
        ({ editor, chain }) => {
          const { selection } = editor.state;
          const { $from } = selection;
          const node = $from.node();
          const currentIndent = node.attrs.indent || 0;
          const newIndent = Math.max(currentIndent - 1, 0);
          
          return chain()
            .updateAttributes('paragraph', { indent: newIndent })
            .updateAttributes('heading', { indent: newIndent })
            .run();
        },
        
      unsetIndent:
        () =>
        ({ chain }) => {
          return chain()
            .updateAttributes('paragraph', { indent: 0 })
            .updateAttributes('heading', { indent: 0 })
            .run();
        },
    };
  },
});

export { IndentExtension };