import { Node, mergeAttributes } from '@tiptap/core';

export interface ImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customImage: {
      /**
       * Add an image with advanced features
       */
      setAdvancedImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: string;
        height?: string;
      }) => ReturnType;
    };
  }
}

export const ImageExtension = Node.create<ImageOptions>({
  name: 'image',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) {
            return {};
          }
          return {
            style: attributes.style,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64
          ? 'img[src]'
          : 'img[src]:not([src^="data:"])',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        draggable: 'true',
        contenteditable: 'false',
        class: 'editor-image cursor-move hover:shadow-lg transition-all',
        'data-drag-handle': 'true'
      }),
    ];
  },

  addNodeView() {
    return ({ node, view, getPos, editor }) => {
      const container = document.createElement('div');
      container.className = 'image-container relative inline-block group';
      container.contentEditable = 'false';
      
      const img = document.createElement('img');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.title = node.attrs.title || '';
      img.className = 'editor-image max-w-full h-auto rounded-lg shadow-sm';
      
      if (node.attrs.width) img.style.width = node.attrs.width;
      if (node.attrs.height) img.style.height = node.attrs.height;
      if (node.attrs.style) img.style.cssText += node.attrs.style;

      // Create resize handles
      const resizeHandles = [
        'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'
      ].map(direction => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-${direction} absolute bg-primary border-2 border-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-${direction === 'n' || direction === 's' ? 'ns' : direction === 'e' || direction === 'w' ? 'ew' : direction === 'nw' || direction === 'se' ? 'nwse' : 'nesw'}-resize`;
        handle.setAttribute('data-direction', direction);
        return handle;
      });

      resizeHandles.forEach(handle => container.appendChild(handle));
      container.appendChild(img);

      // Drag functionality
      let isDragging = false;
      let startX = 0;
      let startY = 0;

      const handleMouseDown = (e: MouseEvent) => {
        if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        container.style.cursor = 'grabbing';
        e.preventDefault();
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          // Move the image to new position
          const pos = getPos();
          if (pos !== undefined) {
            const transaction = view.state.tr.setNodeMarkup(pos, null, {
              ...node.attrs,
              style: `${node.attrs.style || ''} transform: translate(${deltaX}px, ${deltaY}px);`
            });
            view.dispatch(transaction);
          }
        }
      };

      const handleMouseUp = () => {
        isDragging = false;
        container.style.cursor = 'move';
      };

      // Resize functionality
      let isResizing = false;
      let resizeDirection = '';
      let startWidth = 0;
      let startHeight = 0;

      const handleResizeStart = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.classList.contains('resize-handle')) return;
        
        isResizing = true;
        resizeDirection = target.getAttribute('data-direction') || '';
        startX = e.clientX;
        startY = e.clientY;
        startWidth = img.offsetWidth;
        startHeight = img.offsetHeight;
        e.preventDefault();
        e.stopPropagation();
      };

      const handleResizeMove = (e: MouseEvent) => {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        let newWidth = startWidth;
        let newHeight = startHeight;
        
        if (resizeDirection.includes('e')) newWidth = startWidth + deltaX;
        if (resizeDirection.includes('w')) newWidth = startWidth - deltaX;
        if (resizeDirection.includes('s')) newHeight = startHeight + deltaY;
        if (resizeDirection.includes('n')) newHeight = startHeight - deltaY;
        
        if (newWidth > 50 && newHeight > 50) {
          const pos = getPos();
          if (pos !== undefined) {
            const transaction = view.state.tr.setNodeMarkup(pos, null, {
              ...node.attrs,
              width: `${newWidth}px`,
              height: `${newHeight}px`,
            });
            view.dispatch(transaction);
          }
        }
      };

      const handleResizeEnd = () => {
        isResizing = false;
        resizeDirection = '';
      };

      // Event listeners
      container.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', handleResizeStart);
      });
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);

      return {
        dom: container,
        destroy() {
          container.removeEventListener('mousedown', handleMouseDown);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          resizeHandles.forEach(handle => {
            handle.removeEventListener('mousedown', handleResizeStart);
          });
          document.removeEventListener('mousemove', handleResizeMove);
          document.removeEventListener('mouseup', handleResizeEnd);
        }
      };
    };
  },

  addCommands() {
    return {
      setAdvancedImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});