import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useState } from 'react';
import { useUser } from "@/contexts/UserContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [status, setStatus] = useState<'draft' | 'active' | 'closed' | 'archived' | 'derivado'>('draft');
  const [assignedOffice, setAssignedOffice] = useState('');

  const { user } = useUser();
  const canEditBasicInfo = user?.role === 'mesa';
  const canOnlyAddActuaciones = user?.role === 'oficina';

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

  const getStatusColors = (status: string) => {
    const colors = {
      draft: {
        bg: 'bg-[hsl(var(--status-draft))]',
        border: 'border-[hsl(var(--status-draft))]',
        text: 'text-[hsl(var(--status-draft-foreground))]'
      },
      active: {
        bg: 'bg-[hsl(var(--status-active))]',
        border: 'border-[hsl(var(--status-active))]',
        text: 'text-[hsl(var(--status-active-foreground))]'
      },
      closed: {
        bg: 'bg-[hsl(var(--status-closed))]',
        border: 'border-[hsl(var(--status-closed))]',
        text: 'text-[hsl(var(--status-closed-foreground))]'
      },
      archived: {
        bg: 'bg-[hsl(var(--status-archived))]',
        border: 'border-[hsl(var(--status-archived))]',
        text: 'text-[hsl(var(--status-archived-foreground))]'
      },
      derivado: {
        bg: 'bg-[hsl(var(--status-derivado))]',
        border: 'border-[hsl(var(--status-derivado))]',
        text: 'text-[hsl(var(--status-derivado-foreground))]'
      }
    };
    
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Borrador',
      active: 'Activo',
      closed: 'Cerrado',
      archived: 'Archivado',
      derivado: 'Derivado'
    };
    
    return labels[status as keyof typeof labels] || 'Borrador';
  };

  const statusColors = getStatusColors(status);

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Alert className={`${statusColors.border} border-2 ${statusColors.bg}/10`}>
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${statusColors.bg}`}></div>
            <span className="text-lg font-semibold">
              Estado del Expediente: <span className={statusColors.text}>{getStatusLabel(status)}</span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={`${statusColors.bg} ${statusColors.text} px-3 py-1`}>
              {getStatusLabel(status)}
            </Badge>
            {canOnlyAddActuaciones && (
              <Badge variant="outline" className="text-xs">
                Solo Actuaciones
              </Badge>
            )}
          </div>
        </AlertDescription>
      </Alert>

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
      </div>

      {/* Document Info */}
      <Card className={`${statusColors.border} border-l-4`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Información del Expediente</span>
            </div>
            {canOnlyAddActuaciones && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Solo lectura - Mesa de Entrada
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expedient-number">Número de Expediente</Label>
              <Input
                id="expedient-number"
                value={expedientNumber}
                onChange={(e) => setExpedientNumber(e.target.value)}
                placeholder="EXP-2024-XXX"
                disabled={!canEditBasicInfo}
                className={!canEditBasicInfo ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título del Expediente</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Descripción breve del expediente"
                disabled={!canEditBasicInfo}
                className={!canEditBasicInfo ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado del Expediente</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={!canEditBasicInfo}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${!canEditBasicInfo ? 'bg-muted cursor-not-allowed' : ''}`}
              >
                <option value="draft">Borrador</option>
                <option value="active">Activo</option>
                <option value="closed">Cerrado</option>
                <option value="archived">Archivado</option>
                <option value="derivado">Derivado</option>
              </select>
            </div>
            {canEditBasicInfo && (
              <div className="space-y-2">
                <Label htmlFor="assigned-office">Oficina Asignada</Label>
                <select
                  id="assigned-office"
                  value={assignedOffice}
                  onChange={(e) => setAssignedOffice(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Sin asignar</option>
                  <option value="defensoria-1">Defensoría Civil Nº 1</option>
                  <option value="defensoria-2">Defensoría Civil Nº 2</option>
                  <option value="defensoria-penal">Defensoría Penal</option>
                  <option value="secretaria-administrativa">Secretaría Administrativa</option>
                  <option value="secretaria-tecnica">Secretaría Técnica</option>
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editor Toolbar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>{canOnlyAddActuaciones ? 'Agregar Actuación' : 'Editor de Contenido'}</span>
            {canOnlyAddActuaciones && (
              <Badge variant="secondary" className="text-xs">
                Solo nuevas actuaciones permitidas
              </Badge>
            )}
          </CardTitle>
          {canOnlyAddActuaciones && (
            <p className="text-sm text-muted-foreground">
              Como oficina, solo puede agregar nuevas actuaciones al expediente. No puede modificar el contenido principal.
            </p>
          )}
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