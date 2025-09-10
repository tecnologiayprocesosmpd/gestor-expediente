import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useState } from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  Download,
  ArrowLeft,
  FileText
} from "lucide-react";

interface ExpedientEditorProps {
  expedientId?: string;
  onBack?: () => void;
  onSave?: (data: any) => void;
}

export function ExpedientEditor({ expedientId, onBack, onSave }: ExpedientEditorProps) {
  const [title, setTitle] = useState('');
  const [expedientNumber, setExpedientNumber] = useState('');
  const [status, setStatus] = useState<'draft' | 'active' | 'closed'>('draft');

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content: '<p>Comience a redactar el contenido del expediente aquí...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleSave = () => {
    const content = editor.getHTML();
    const data = {
      title,
      number: expedientNumber,
      content,
      status,
      updatedAt: new Date(),
    };
    
    onSave?.(data);
    console.log('Guardando expediente:', data);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    console.log('Exportando a PDF...');
  };

  const handlePrint = () => {
    const printContent = editor.getHTML();
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Expediente ${expedientNumber}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px; 
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #536182; 
                padding-bottom: 20px; 
              }
              .content { margin-top: 20px; }
              @media print {
                body { margin: 0; padding: 20px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${title || 'Sin título'}</h1>
              <p><strong>Expediente:</strong> ${expedientNumber || 'Sin número'}</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
            </div>
            <div class="content">${printContent}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {expedientId ? 'Editar Expediente' : 'Nuevo Expediente'}
            </h1>
            <p className="text-muted-foreground">
              Editor avanzado de documentos
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={status === 'draft' ? 'secondary' : 'default'}>
            {status === 'draft' ? 'Borrador' : status === 'active' ? 'Activo' : 'Cerrado'}
          </Badge>
        </div>
      </div>

      {/* Document Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Información del Expediente</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expedient-number">Número de Expediente</Label>
              <Input
                id="expedient-number"
                value={expedientNumber}
                onChange={(e) => setExpedientNumber(e.target.value)}
                placeholder="EXP-2024-XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título del Expediente</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Descripción breve del expediente"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor Toolbar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Editor de Contenido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="border-b bg-muted/30 p-3 flex flex-wrap items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-primary text-primary-foreground' : ''}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-primary text-primary-foreground' : ''}
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'bg-primary text-primary-foreground' : ''}
              >
                <UnderlineIcon className="w-4 h-4" />
              </Button>

              <Separator orientation="vertical" className="h-6 mx-2" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={editor.isActive({ textAlign: 'left' }) ? 'bg-primary text-primary-foreground' : ''}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={editor.isActive({ textAlign: 'center' }) ? 'bg-primary text-primary-foreground' : ''}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={editor.isActive({ textAlign: 'right' }) ? 'bg-primary text-primary-foreground' : ''}
              >
                <AlignRight className="w-4 h-4" />
              </Button>

              <Separator orientation="vertical" className="h-6 mx-2" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-primary text-primary-foreground' : ''}
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
            </div>

            {/* Editor */}
            <div className="min-h-[500px] bg-white">
              <EditorContent editor={editor} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Última modificación: {new Date().toLocaleString('es-ES')}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handlePrint}>
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Expediente
          </Button>
        </div>
      </div>
    </div>
  );
}