import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Eye, Printer, ZoomIn, ZoomOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PrintPreviewDialogProps {
  editor: any;
  pageSize: string;
  orientation: string;
  margins: { top: number; right: number; bottom: number; left: number };
  headerText?: string;
  footerText?: string;
}

export function PrintPreviewDialog({
  editor,
  pageSize,
  orientation,
  margins,
  headerText = '',
  footerText = '',
}: PrintPreviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const getPageDimensions = () => {
    const sizes = {
      a4: { width: 210, height: 297 },
      letter: { width: 216, height: 279 },
      legal: { width: 216, height: 356 },
      a3: { width: 297, height: 420 },
    };

    const size = sizes[pageSize as keyof typeof sizes] || sizes.a4;
    
    if (orientation === 'landscape') {
      return { width: size.height, height: size.width };
    }
    
    return size;
  };

  const dimensions = getPageDimensions();
  const scale = zoom / 100;

  const handlePrint = () => {
    const content = editor.getHTML();
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Vista Previa de Impresión</title>
            <style>
              @page {
                size: ${pageSize} ${orientation};
                margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
              }
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #000;
                background: white;
              }
              .header {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                text-align: center;
                padding: 10px;
                border-bottom: 1px solid #ccc;
                font-size: 12px;
              }
              .footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                text-align: center;
                padding: 10px;
                border-top: 1px solid #ccc;
                font-size: 12px;
              }
              .page-number:after {
                content: counter(page);
              }
              .content {
                margin-top: 40px;
                margin-bottom: 40px;
              }
              .page-break {
                page-break-after: always;
                break-after: page;
              }
              table {
                border-collapse: collapse;
                width: 100%;
              }
              table, th, td {
                border: 1px solid #333;
                padding: 8px;
              }
              img {
                max-width: 100%;
                height: auto;
              }
            </style>
          </head>
          <body>
            ${headerText ? `<div class="header">${headerText}</div>` : ''}
            <div class="content">${content}</div>
            ${footerText ? `<div class="footer">${footerText} - Página <span class="page-number"></span></div>` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Vista previa de impresión" className="h-8 px-3 hover:bg-muted">
          <Eye className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Vista Previa</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Vista Previa de Impresión</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                disabled={zoom <= 50}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-normal">{zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                disabled={zoom >= 200}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-auto flex-1 bg-gray-200 p-8">
          <div
            className="mx-auto bg-white shadow-lg"
            style={{
              width: `${dimensions.width * 3.78 * scale}px`,
              minHeight: `${dimensions.height * 3.78 * scale}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              padding: `${margins.top * 3.78}px ${margins.right * 3.78}px ${margins.bottom * 3.78}px ${margins.left * 3.78}px`,
            }}
          >
            {headerText && (
              <div className="text-center text-sm pb-4 mb-4 border-b border-gray-300">
                {headerText}
              </div>
            )}
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
            />
            {footerText && (
              <div className="text-center text-sm pt-4 mt-4 border-t border-gray-300">
                {footerText}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
