import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Strike } from '@tiptap/extension-strike';
import { Superscript as SuperscriptExtension } from '@tiptap/extension-superscript';
import { Subscript as SubscriptExtension } from '@tiptap/extension-subscript';
import { Link } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { CharacterCount } from '@tiptap/extension-character-count';
import { useState, useEffect } from 'react';
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
  Strikethrough,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Save,
  Download,
  ArrowLeft,
  FileText,
  Undo,
  Redo,
  Minus
} from "lucide-react";

// Import new editor components
import { LineHeightSelector } from "@/components/ui/line-height-selector";
import { FontSelector } from "@/components/ui/font-selector";
import { FontSizeSelector } from "@/components/ui/font-size-selector";
import { TextColorSelector } from "@/components/ui/text-color-selector";
import { HeadingSelector } from "@/components/ui/heading-selector";
import { TableControls } from "@/components/ui/table-controls";
import { LinkControls } from "@/components/ui/link-controls";
import { DocumentStats } from "@/components/ui/document-stats";
import { ImageInsert } from "@/components/ui/image-insert";
import { IndentControls } from "@/components/ui/indent-controls";
import { MarginControls } from "@/components/ui/margin-controls";

interface ExpedientEditorProps {
  expedientId?: string;
  expedient?: any;
  onBack?: () => void;
  onSave?: (data: any) => void;
}

export function ExpedientEditor({ expedientId, expedient: propExpedient, onBack, onSave }: ExpedientEditorProps) {
  const [title, setTitle] = useState(propExpedient?.title || '');
  const [expedientNumber, setExpedientNumber] = useState(propExpedient?.number || '');
  const [status, setStatus] = useState<'draft' | 'en_tramite' | 'archivado' | 'derivado' | 'desistido'>(propExpedient?.status || 'draft');
  const [assignedOffice, setAssignedOffice] = useState(propExpedient?.assignedOffice || '');
  const [margins, setMargins] = useState({ top: 20, right: 20, bottom: 20, left: 20 });

  const { user } = useUser();
  const canEditBasicInfo = user?.role === 'mesa';
  const canOnlyAddActuaciones = user?.role === 'oficina';

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Strike,
      SuperscriptExtension,
      SubscriptExtension,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 cursor-pointer',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300 w-full my-4',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-100 font-bold px-3 py-2',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-3 py-2',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-sm',
        },
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      CharacterCount,
    ],
    content: propExpedient?.content || '<p>Comience a redactar el contenido del expediente aquí...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-6 bg-white',
        style: `padding: ${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px; line-height: 1.6;`,
      },
      handleKeyDown: (view, event) => {
        // Atajos de teclado personalizados
        if (event.ctrlKey || event.metaKey) {
          switch (event.key) {
            case 'b':
              event.preventDefault();
              editor?.chain().focus().toggleBold().run();
              return true;
            case 'i':
              event.preventDefault();
              editor?.chain().focus().toggleItalic().run();
              return true;
            case 'u':
              event.preventDefault();
              editor?.chain().focus().toggleUnderline().run();
              return true;
            case 's':
              event.preventDefault();
              handleSave();
              return true;
            case 'z':
              event.preventDefault();
              if (event.shiftKey) {
                editor?.chain().focus().redo().run();
              } else {
                editor?.chain().focus().undo().run();
              }
              return true;
            case 'y':
              event.preventDefault();
              editor?.chain().focus().redo().run();
              return true;
          }
        }
        return false;
      },
    },
  });

  // Update state when expedient prop changes
  useEffect(() => {
    if (propExpedient) {
      setTitle(propExpedient.title || '');
      setExpedientNumber(propExpedient.number || '');
      setStatus(propExpedient.status || 'draft');
      setAssignedOffice(propExpedient.assignedOffice || '');
      
      // Update editor content
      if (editor && propExpedient.content) {
        editor.commands.setContent(propExpedient.content);
      }
    }
  }, [propExpedient, editor]);

  if (!editor) {
    return null;
  }

  const handleSave = () => {
    const content = editor.getHTML();
    
    if (canOnlyAddActuaciones) {
      // Si es una oficina, crear nueva actuación
      const newActuacion = {
        title,
        content,
        status: 'borrador' as const,
        createdBy: user?.name || 'Usuario',
        createdAt: new Date(),
      };
      
      onSave?.(newActuacion);
      console.log('Guardando nueva actuación:', newActuacion);
    } else {
      // Si es mesa de entrada, guardar expediente
      const data = {
        title,
        number: expedientNumber,
        content,
        status,
        assignedOffice,
        updatedAt: new Date(),
      };
      
      onSave?.(data);
      console.log('Guardando expediente:', data);
    }
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
      en_tramite: {
        bg: 'bg-[hsl(var(--status-en-tramite))]',
        border: 'border-[hsl(var(--status-en-tramite))]',
        text: 'text-[hsl(var(--status-en-tramite-foreground))]'
      },
      archivado: {
        bg: 'bg-[hsl(var(--status-archivado))]',
        border: 'border-[hsl(var(--status-archivado))]',
        text: 'text-[hsl(var(--status-archivado-foreground))]'
      },
      derivado: {
        bg: 'bg-[hsl(var(--status-derivado))]',
        border: 'border-[hsl(var(--status-derivado))]',
        text: 'text-[hsl(var(--status-derivado-foreground))]'
      },
      desistido: {
        bg: 'bg-[hsl(var(--status-desistido))]',
        border: 'border-[hsl(var(--status-desistido))]',
        text: 'text-[hsl(var(--status-desistido-foreground))]'
      }
    };
    
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Borrador',
      en_tramite: 'En Trámite',
      archivado: 'Archivado',
      derivado: 'Derivado',
      desistido: 'Desistido'
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
            <div className="border-b bg-background/50 backdrop-blur-sm px-4 py-3">
              <div className="flex items-center gap-1 overflow-x-auto">
                {/* Grupo: Deshacer/Rehacer */}
                <div className="flex items-center gap-0.5 pr-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="Deshacer (Ctrl+Z)"
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="Rehacer (Ctrl+Y)"
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Grupo: Estilos */}
                <div className="flex items-center gap-1 pr-2">
                  <HeadingSelector editor={editor} />
                </div>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Grupo: Fuente y Tipografía */}
                <div className="flex items-center gap-1 pr-2">
                  <FontSelector editor={editor} />
                  <FontSizeSelector editor={editor} />
                  <LineHeightSelector editor={editor} />
                </div>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Grupo: Formato de texto */}
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive('bold') ? 'bg-accent text-accent-foreground' : ''}`}
                    title="Negrita (Ctrl+B)"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive('italic') ? 'bg-accent text-accent-foreground' : ''}`}
                    title="Cursiva (Ctrl+I)"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive('underline') ? 'bg-accent text-accent-foreground' : ''}`}
                    title="Subrayado (Ctrl+U)"
                  >
                    <UnderlineIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive('strike') ? 'bg-accent text-accent-foreground' : ''}`}
                    title="Tachado"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive('superscript') ? 'bg-accent text-accent-foreground' : ''}`}
                    title="Superíndice"
                  >
                    <SuperscriptIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                    className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive('subscript') ? 'bg-accent text-accent-foreground' : ''}`}
                    title="Subíndice"
                  >
                    <SubscriptIcon className="w-4 h-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Grupo: Colores */}
                <div className="flex items-center gap-0.5">
                  <TextColorSelector editor={editor} type="text" />
                  <TextColorSelector editor={editor} type="highlight" />
                </div>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Grupo: Alineación */}
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive({ textAlign: 'left' }) ? 'bg-accent text-accent-foreground' : ''}`}
                    title="Alinear a la izquierda"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive({ textAlign: 'center' }) ? 'bg-accent text-accent-foreground' : ''}`}
                    title="Centrar"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive({ textAlign: 'right' }) ? 'bg-accent text-accent-foreground' : ''}`}
                    title="Alinear a la derecha"
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive({ textAlign: 'justify' }) ? 'bg-accent text-accent-foreground' : ''}`}
                    title="Justificar"
                  >
                    <AlignJustify className="w-4 h-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Grupo: Listas */}
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive('bulletList') ? 'bg-accent text-accent-foreground' : ''}`}
                    title="Lista con viñetas"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive('orderedList') ? 'bg-accent text-accent-foreground' : ''}`}
                    title="Lista numerada"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Grupo: Sangría */}
                <div className="flex items-center gap-0.5">
                  <IndentControls editor={editor} />
                </div>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Grupo: Insertar */}
                <div className="flex items-center gap-0.5">
                  <LinkControls editor={editor} />
                  <TableControls editor={editor} />
                  <ImageInsert editor={editor} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="Línea horizontal"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Grupo: Configuración */}
                <div className="flex items-center gap-0.5">
                  <MarginControls 
                    currentMargins={margins}
                    onMarginsChange={(newMargins) => {
                      setMargins(newMargins);
                      // Actualizar los atributos del editor
                      if (editor && editor.view && editor.view.dom) {
                        const editorElement = editor.view.dom as HTMLElement;
                        editorElement.style.padding = `${newMargins.top}px ${newMargins.right}px ${newMargins.bottom}px ${newMargins.left}px`;
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="min-h-[600px] bg-white shadow-inner border border-gray-200 rounded-b-lg">
              <EditorContent editor={editor} />
            </div>
            
            {/* Editor Footer with Statistics */}
            <div className="border-t bg-muted/30 px-4 py-2 flex items-center justify-between text-xs">
              <DocumentStats editor={editor} />
              <div className="text-muted-foreground">
                Última modificación: {new Date().toLocaleString('es-ES')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handlePrint}>
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            {canOnlyAddActuaciones ? 'Guardar Actuación' : 'Guardar Expediente'}
          </Button>
        </div>
      </div>
    </div>
  );
}