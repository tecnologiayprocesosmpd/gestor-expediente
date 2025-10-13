import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      setPageBreak: () => ReturnType;
    };
  }
}

export const PageBreak = Node.create({
  name: 'pageBreak',

  group: 'block',

  parseHTML() {
    return [
      {
        tag: 'div[data-type="page-break"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'page-break',
        class: 'page-break',
        style: 'page-break-after: always; break-after: page; border-top: 2px dashed #ccc; margin: 20px 0; position: relative;',
      }),
      [
        'span',
        {
          style: 'position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: white; padding: 0 10px; color: #999; font-size: 12px;',
        },
        'Salto de página',
      ],
    ];
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ commands }: any) => {
          return commands.insertContent({ type: this.name });
        },
    };
  },
});
