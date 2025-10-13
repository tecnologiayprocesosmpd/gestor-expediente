import { Extension } from '@tiptap/core';

export interface LineHeightOptions {
  types: string[];
  lineHeights: string[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineHeight: {
      /**
       * Set the line height
       */
      setLineHeight: (lineHeight: string) => ReturnType;
      /**
       * Unset the line height
       */
      unsetLineHeight: () => ReturnType;
    };
  }
}

const LineHeightExtension = Extension.create<LineHeightOptions>({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      lineHeights: ['1', '1.15', '1.5', '2', '2.5', '3'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: '1.5',
            parseHTML: element => {
              const lineHeight = element.style.lineHeight;
              return lineHeight || '1.5';
            },
            renderHTML: attributes => {
              if (!attributes.lineHeight || attributes.lineHeight === '1.5') {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineHeight} !important;`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands, tr, state }) => {
          const { from, to } = state.selection;
          let applied = false;

          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                lineHeight,
              });
              applied = true;
            }
          });

          if (applied) {
            commands.focus();
            return true;
          }
          return false;
        },
      unsetLineHeight:
        () =>
        ({ commands, tr, state }) => {
          const { from, to } = state.selection;
          let applied = false;

          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                lineHeight: '1.5',
              });
              applied = true;
            }
          });

          if (applied) {
            commands.focus();
            return true;
          }
          return false;
        },
    };
  },
});

export { LineHeightExtension };