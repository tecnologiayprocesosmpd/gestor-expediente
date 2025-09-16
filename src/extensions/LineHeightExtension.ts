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
            default: null,
            parseHTML: element => element.style.lineHeight || null,
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
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
        ({ chain }) => {
          return chain()
            .updateAttributes('paragraph', { lineHeight })
            .updateAttributes('heading', { lineHeight })
            .run();
        },
      unsetLineHeight:
        () =>
        ({ chain }) => {
          return chain()
            .updateAttributes('paragraph', { lineHeight: null })
            .updateAttributes('heading', { lineHeight: null })
            .run();
        },
    };
  },
});

export { LineHeightExtension };