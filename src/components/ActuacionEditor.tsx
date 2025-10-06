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
import { Placeholder } from '@tiptap/extension-placeholder';
import { LineHeightExtension } from '@/extensions/LineHeightExtension';
import { IndentExtension } from '@/extensions/IndentExtension';
import { useState, useEffect, useMemo } from 'react';
import { useUser } from "@/contexts/UserContext";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Clock,
  CheckCircle
} from "lucide-react";

// Import UI components
import { LineHeightSelector } from "@/components/ui/line-height-selector";
import { FontSelector } from "@/components/ui/font-selector";
import { FontSizeSelector } from "@/components/ui/font-size-selector";
import { TextColorSelector } from "@/components/ui/text-color-selector";
import { HeadingSelector } from "@/components/ui/heading-selector";
import { TableControls } from "@/components/ui/table-controls";
import { LinkControls } from "@/components/ui/link-controls";
import { DocumentStats } from "@/components/ui/document-stats";
import { ImageInsert } from "@/components/ui/image-insert";
import { ImageEdit } from "@/components/ui/image-edit";
import { IndentControls } from "@/components/ui/indent-controls";
import { MarginControls } from "@/components/ui/margin-controls";
import type { Actuacion } from "@/types/actuacion";

interface ActuacionEditorProps {
  expedientId: string;
  actuacionId?: string;
  actuacion?: Partial<Actuacion>;
  onBack?: () => void;
  onSave?: (actuacion: Partial<Actuacion>) => Promise<any> | void;
  onStatusChange?: (actuacionId: string, status: Actuacion['status']) => void;
}

export function ActuacionEditor({ 
  expedientId, 
  actuacionId, 
  actuacion: propActuacion, 
  onBack, 
  onSave,
  onStatusChange 
}: ActuacionEditorProps) {
  const [title, setTitle] = useState(propActuacion?.title || '');
  const [tipo, setTipo] = useState<Actuacion['tipo']>(propActuacion?.tipo || 'nota');
  const [status, setStatus] = useState<Actuacion['status']>(propActuacion?.status || 'borrador');
  const [margins, setMargins] = useState({ top: 20, right: 20, bottom: 20, left: 20 });
  const [content, setContent] = useState(propActuacion?.content || '');
  
  const { user } = useUser();
  const canEdit = status !== 'firmado';
  
  // Handle margins change
  const handleMarginsChange = (newMargins: { top: number; right: number; bottom: number; left: number }) => {
    setMargins(newMargins);
    if (editor) {
      // Update editor attributes with new margins
      const editorElement = document.querySelector('.ProseMirror') as HTMLElement;
      if (editorElement) {
        editorElement.style.padding = `${newMargins.top}px ${newMargins.right}px ${newMargins.bottom}px ${newMargins.left}px`;
      }
    }
  };

  const handleSave = async () => {
    console.log('[ActuacionEditor.handleSave] Iniciando guardado');
    if (onSave) {
      const saveData = {
        id: actuacionId,
        expedientId,
        title,
        content,
        tipo,
        status,
        updatedAt: new Date(),
        createdBy: user?.name || 'Usuario'
      };
      console.log('[ActuacionEditor.handleSave] Datos a guardar:', saveData);
      try {
        await onSave(saveData);
        console.log('[ActuacionEditor.handleSave] Guardado completado');
      } catch (error) {
        console.error('[ActuacionEditor.handleSave] Error en guardado:', error);
      }
    }
  };
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        strike: false,
        link: false,
      }),
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
          class: 'max-w-full h-auto rounded-lg shadow-sm cursor-pointer hover:shadow-lg transition-all resizable-image',
          style: 'resize: both; overflow: hidden; min-width: 50px; min-height: 50px;'
        },
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      LineHeightExtension.configure({
        types: ['paragraph', 'heading'],
      }),
      IndentExtension.configure({
        types: ['paragraph', 'heading'],
      }),
      CharacterCount,
      Placeholder.configure({
        placeholder: 'Redacte el contenido de la actuación aquí...',
      }),
    ],
    content: propActuacion?.content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-6 bg-white',
        style: `padding: ${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px; line-height: 1.6;`,
      },
      handleKeyDown: (view, event) => {
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
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      // Real-time content change detection for auto-save
      setContent(editor.getHTML());
    },
  });

  // Update state when actuacion prop changes
  useEffect(() => {
    if (propActuacion) {
      setTitle(propActuacion.title || '');
      setTipo(propActuacion.tipo || 'nota');
      setStatus(propActuacion.status || 'borrador');
      
      if (editor && propActuacion.content) {
        editor.commands.setContent(propActuacion.content);
        setContent(propActuacion.content);
      }
    }
  }, [propActuacion, editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando editor...</p>
        </div>
      </div>
    );
  }

  const handleStatusChange = () => {
    if (!actuacionId || !onStatusChange) return;
    
    let nextStatus: Actuacion['status'];
    
    if (status === 'borrador') {
      nextStatus = 'para-firmar';
    } else if (status === 'para-firmar') {
      nextStatus = 'firmado';  
    } else {
      return; // Already firmado, can't change
    }
    
    setStatus(nextStatus);
    onStatusChange(actuacionId, nextStatus);
  };

  const getStatusColors = (currentStatus: Actuacion['status']) => {
    const colors = {
      borrador: {
        bg: 'bg-[hsl(var(--status-draft))]',
        border: 'border-[hsl(var(--status-draft))]',
        text: 'text-[hsl(var(--status-draft-foreground))]'
      },
      'para-firmar': {
        bg: 'bg-[hsl(var(--status-pausado))]',
        border: 'border-[hsl(var(--status-pausado))]',
        text: 'text-[hsl(var(--status-pausado-foreground))]'
      },
      firmado: {
        bg: 'bg-[hsl(var(--status-archivado))]',
        border: 'border-[hsl(var(--status-archivado))]',
        text: 'text-[hsl(var(--status-archivado-foreground))]'
      }
    };
    
    return colors[currentStatus] || colors.borrador;
  };

  const getStatusBadge = (currentStatus: Actuacion['status']) => {
    const statusColors = getStatusColors(currentStatus);
    const labels = {
      borrador: 'Borrador',
      'para-firmar': 'Para Firmar',
      firmado: 'Firmado'
    };

    return (
      <Badge className={`${statusColors.bg} ${statusColors.text} border-0`}>
        {labels[currentStatus]}
      </Badge>
    );
  };

  const getTipoLabel = (tipoActuacion: Actuacion['tipo']) => {
    const labels = {
      resolucion: 'Resolución',
      providencia: 'Providencia', 
      nota: 'Nota',
      dictamen: 'Dictamen',
      decreto: 'Decreto',
      auto: 'Auto'
    };
    return labels[tipoActuacion];
  };

  const statusColors = getStatusColors(status);

  return (
    <div className="space-y-6">
      {/* Header con estado prominente */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className={`flex items-start justify-between p-6 border-l-4 ${statusColors.border}`}>
          <div className="flex items-start space-x-6">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {actuacionId ? 'Editar Actuación' : 'Nueva Actuación'}
                </h1>
                <p className="text-muted-foreground">
                  Expediente: {expedientId}
                </p>
              </div>
              
              <div className={`${statusColors.bg} rounded-md px-4 py-2 flex items-center space-x-2 shadow-sm border border-white/20 ml-2.5`}>
                <div className={`w-2.5 h-2.5 rounded-full bg-white animate-pulse`}></div>
                <span className={`text-sm font-semibold ${statusColors.text}`}>
                  {status === 'borrador' ? 'BORRADOR' : status === 'para-firmar' ? 'PARA FIRMAR' : 'FIRMADO'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
          </div>
        </div>
      </div>

      {/* Metadata Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Actuación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la actuación"
                disabled={!canEdit}
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo de Actuación</Label>
              <Select value={tipo} onValueChange={(value: Actuacion['tipo']) => setTipo(value)} disabled={!canEdit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resolucion">Resolución</SelectItem>
                  <SelectItem value="providencia">Providencia</SelectItem>
                  <SelectItem value="nota">Nota</SelectItem>
                  <SelectItem value="dictamen">Dictamen</SelectItem>
                  <SelectItem value="decreto">Decreto</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card className="min-h-[600px]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>Editor de Contenido</span>
            <DocumentStats editor={editor} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toolbar */}
          {canEdit && (
            <div className="border rounded-lg p-3 bg-muted/30 space-y-3">
              {/* First Row - Basic Formatting */}
              <div className="flex items-center gap-1 flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="h-8 w-8 p-0"
                  title="Deshacer (Ctrl+Z)"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="h-8 w-8 p-0"
                  title="Rehacer (Ctrl+Y)"
                >
                  <Redo className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <HeadingSelector editor={editor} />
                <FontSelector editor={editor} />
                <FontSizeSelector editor={editor} />

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive('bold') ? 'bg-accent text-accent-foreground' : ''}`}
                  title="Negrita (Ctrl+B)"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive('italic') ? 'bg-accent text-accent-foreground' : ''}`}
                  title="Cursiva (Ctrl+I)"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive('underline') ? 'bg-accent text-accent-foreground' : ''}`}
                  title="Subrayado (Ctrl+U)"
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive('strike') ? 'bg-accent text-accent-foreground' : ''}`}
                  title="Tachado"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <div className="flex items-center gap-0.5">
                  <TextColorSelector editor={editor} type="text" />
                  <TextColorSelector editor={editor} type="highlight" />
                </div>
              </div>

              {/* Second Row - Alignment & Lists */}
              <div className="flex items-center gap-1 flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive({ textAlign: 'left' }) ? 'bg-accent text-accent-foreground' : ''}`}
                  title="Alinear a la izquierda"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive({ textAlign: 'center' }) ? 'bg-accent text-accent-foreground' : ''}`}
                  title="Centrar"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive({ textAlign: 'right' }) ? 'bg-accent text-accent-foreground' : ''}`}
                  title="Alinear a la derecha"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                  className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive({ textAlign: 'justify' }) ? 'bg-accent text-accent-foreground' : ''}`}
                  title="Justificar"
                >
                  <AlignJustify className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive('bulletList') ? 'bg-accent text-accent-foreground' : ''}`}
                  title="Lista con viñetas"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`h-8 w-8 p-0 hover:bg-muted ${editor.isActive('orderedList') ? 'bg-accent text-accent-foreground' : ''}`}
                  title="Lista numerada"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <IndentControls editor={editor} />
                <LineHeightSelector editor={editor} />
              </div>

              {/* Third Row - Advanced Tools */}
              <div className="flex items-center gap-1 flex-wrap">
                <LinkControls editor={editor} />
                <TableControls editor={editor} />
                <ImageInsert editor={editor} />
                <ImageEdit editor={editor} />
                <MarginControls 
                  onMarginsChange={handleMarginsChange}
                  currentMargins={margins}
                />
              </div>
            </div>
          )}

          {/* Editor Content */}
          <div className="border rounded-lg overflow-hidden bg-background">
            <EditorContent 
              editor={editor} 
              className={canEdit ? '' : 'pointer-events-none opacity-75'}
            />
          </div>

          {!canEdit && status === 'firmado' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Esta actuación ha sido firmada y no puede ser modificada.
              </AlertDescription>
            </Alert>
          )}

          {/* Metadata Footer */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
            <div className="space-y-1">
              <div>Tipo: {getTipoLabel(tipo)}</div>
              <div>Creado por: {user?.name}</div>
            </div>
            <div className="text-right space-y-1">
              <div>Última modificación: {new Date().toLocaleString('es-ES')}</div>
              {editor && (
                <div>
                  Caracteres: {editor.storage.characterCount.characters()} | 
                  Palabras: {editor.storage.characterCount.words()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-3">
          {canEdit && (
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" />
              Guardar Actuación
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}