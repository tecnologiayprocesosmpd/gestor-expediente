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
import { useAutoSave } from "@/hooks/useAutoSave";

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
import { ImageEdit } from "@/components/ui/image-edit";
import { IndentControls } from "@/components/ui/indent-controls";
import { MarginControls } from "@/components/ui/margin-controls";
import { ConfirmDerivationDialog } from "./ConfirmDerivationDialog";

interface ExpedientEditorProps {
  expedientId?: string;
  expedient?: any;
  onBack?: () => void;
  onSave?: (data: any) => void;
}

export function ExpedientEditor({ expedientId, expedient: propExpedient, onBack, onSave }: ExpedientEditorProps) {
  const [title, setTitle] = useState(propExpedient?.title || '');
  const [expedientNumber, setExpedientNumber] = useState(() => {
    // Auto-generate expedient number if creating new
    if (!propExpedient?.number) {
      const currentYear = new Date().getFullYear();
      const randomId = Math.floor(Math.random() * 900000) + 100000; // 6 digit random number
      return `EXP-${currentYear}-${randomId}`;
    }
    return propExpedient.number;
  });
  const [status, setStatus] = useState<'draft' | 'derivado' | 'recibido' | 'en_tramite' | 'pausado'>(propExpedient?.status || 'draft');
  const [assignedOffice, setAssignedOffice] = useState(propExpedient?.oficina || propExpedient?.assignedOffice || '');
  const [referencia, setReferencia] = useState(propExpedient?.referencia || '');
  const [tipoProceso, setTipoProceso] = useState<'administrativo' | 'compra'>(propExpedient?.tipoProceso || 'administrativo');
  const [margins, setMargins] = useState({ top: 20, right: 20, bottom: 20, left: 20 });
  const [content, setContent] = useState(propExpedient?.content || '');
  const [showDerivationDialog, setShowDerivationDialog] = useState(false);

  const { user } = useUser();
  const canEditBasicInfo = true; // Ambos perfiles pueden editar info básica
  const canOnlyAddActuaciones = false; // Ambos perfiles pueden editar expedientes completos

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable extensions we'll configure separately
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
        placeholder: 'Comience a redactar el contenido del expediente aquí...',
      }),
    ],
    content: propExpedient?.content || '<p></p>',
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
    onUpdate: ({ editor }) => {
      // Real-time content change detection for auto-save
      setContent(editor.getHTML());
    },
  });

  // Auto-save data structure  
  const autoSaveData = useMemo(() => ({
    id: expedientId,
    title,
    number: expedientNumber,
    content,
    status: status === 'draft' ? 'en_tramite' : status, // Auto-cambio de draft a en_tramite al guardar
    assignedOffice,
    updatedAt: new Date(),
    createdBy: user?.name || 'Usuario'
  }), [expedientId, title, expedientNumber, content, status, assignedOffice, user?.name]);

  // Auto-save functionality
  const { forceSave, isSaving } = useAutoSave({
    data: autoSaveData,
    onSave: (data) => {
      if (onSave) {
        onSave(data);
      }
    },
    delay: 3000, // Auto-save after 3 seconds of inactivity
    enabled: title.trim().length > 0 || content.length > 20 // Only auto-save if there's meaningful content
  });

  // Update state when expedient prop changes
  useEffect(() => {
    if (propExpedient) {
      setTitle(propExpedient.title || '');
      setExpedientNumber(propExpedient.number || '');
      setStatus(propExpedient.status || 'draft');
      setAssignedOffice(propExpedient.oficina || propExpedient.assignedOffice || '');
      setReferencia(propExpedient.referencia || '');
      setTipoProceso(propExpedient.tipoProceso || 'administrativo');
      
      // Update editor content
      if (editor && propExpedient.content) {
        editor.commands.setContent(propExpedient.content);
        setContent(propExpedient.content);
      }
    }
  }, [propExpedient, editor]);

  if (!editor) {
    return null;
  }

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

  const handleSave = () => {
    forceSave();
  };

  const handleDerivation = () => {
    if (!assignedOffice) {
      alert('Debe seleccionar una oficina antes de derivar el expediente');
      return;
    }
    setShowDerivationDialog(true);
  };

  const confirmDerivation = () => {
    const derivationData = {
      id: expedientId || `exp-${Date.now()}`,
      title,
      number: expedientNumber,
      content,
      status: 'derivado' as const,
      oficina: assignedOffice,
      referencia,
      tipoProceso,
      createdAt: new Date(),
      updatedAt: new Date(),
      fechaDerivacion: new Date(),
      derivadoPor: user?.name || 'Usuario',
      createdBy: user?.name || 'Usuario'
    };

    if (onSave) {
      onSave(derivationData);
    }

    // Navigate back to dashboard
    if (onBack) {
      onBack();
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
      pausado: {
        bg: 'bg-[hsl(var(--status-pausado))]',
        border: 'border-[hsl(var(--status-pausado))]',
        text: 'text-[hsl(var(--status-pausado-foreground))]'
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
      recibido: {
        bg: 'bg-[hsl(var(--status-recibido))]',
        border: 'border-[hsl(var(--status-recibido))]',
        text: 'text-[hsl(var(--status-recibido-foreground))]'
      }
    };
    
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Borrador',
      en_tramite: 'En Trámite',
      pausado: 'Pausado',
      archivado: 'Archivado',
      derivado: 'Derivado',
      recibido: 'Recibido'
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
              ESTADO DEL EXPEDIENTE
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={`${statusColors.bg} ${statusColors.text} px-4 py-2`}>
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
        
        <div className="flex items-center space-x-2">
          {isSaving && (
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Guardando...
            </div>
          )}
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
        <CardContent className="space-y-6">
          {/* Nuevos campos obligatorios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="oficina" className="text-sm font-semibold">OFICINA *</Label>
              <select
                id="oficina"
                value={assignedOffice}
                onChange={(e) => setAssignedOffice(e.target.value)}
                required
                disabled={!canEditBasicInfo || status !== 'draft'}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${(!canEditBasicInfo || status !== 'draft') ? 'bg-muted cursor-not-allowed' : ''}`}
              >
                <option value="">Seleccionar oficina...</option>
                <option value="defensoria-1">Defensoría Civil Nº 1</option>
                <option value="defensoria-2">Defensoría Civil Nº 2</option>
                <option value="defensoria-penal">Defensoría Penal</option>
                <option value="secretaria-administrativa">Secretaría Administrativa</option>
                <option value="secretaria-tecnica">Secretaría Técnica</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo-proceso" className="text-sm font-semibold">TIPO DE PROCESO *</Label>
              <select
                id="tipo-proceso"
                value={tipoProceso}
                onChange={(e) => setTipoProceso(e.target.value as 'administrativo' | 'compra')}
                required
                disabled={!canEditBasicInfo || status !== 'draft'}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${(!canEditBasicInfo || status !== 'draft') ? 'bg-muted cursor-not-allowed' : ''}`}
              >
                <option value="administrativo">Administrativo</option>
                <option value="compra">Compra</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referencia" className="text-sm font-semibold">REFERENCIA *</Label>
            <textarea
              id="referencia"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              required
              disabled={!canEditBasicInfo || status !== 'draft'}
              placeholder="Describa la referencia del expediente..."
              rows={3}
              className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${(!canEditBasicInfo || status !== 'draft') ? 'bg-muted cursor-not-allowed' : ''}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="expedient-number" className="text-sm font-medium text-muted-foreground">Número de Expediente</Label>
              <Input
                id="expedient-number"
                value={expedientNumber}
                readOnly
                disabled
                className="bg-muted cursor-not-allowed font-mono text-sm"
                title="Número autogenerado - No modificable"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fecha-creacion" className="text-sm font-medium text-muted-foreground">FECHA DE CREACIÓN</Label>
              <Input
                id="fecha-creacion"
                value={new Date().toLocaleDateString('es-ES')}
                readOnly
                disabled
                className="bg-muted cursor-not-allowed text-sm"
              />
            </div>
          </div>

          {status !== 'draft' && (
            <div className="p-4 bg-muted/30 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                Los campos básicos solo se pueden editar cuando el expediente está en estado "Borrador".
              </p>
            </div>
          )}
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
                  <ImageEdit editor={editor} />
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
                    onMarginsChange={handleMarginsChange}
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
          {status === 'draft' && canEditBasicInfo && (
            <Button 
              onClick={handleDerivation}
              disabled={!assignedOffice || !title.trim() || !referencia.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2"
            >
              DERIVAR A{assignedOffice ? ` ${assignedOffice.toUpperCase().replace('-', ' ')}` : ' [SELECCIONAR OFICINA]'}
            </Button>
          )}
          
          {status !== 'draft' && (
            <div className="text-sm text-muted-foreground">
              {status === 'derivado' && 'Expediente derivado - Esperando recepción'}
              {status === 'recibido' && 'Expediente recibido - Puede trabajarse'}
              {status === 'en_tramite' && 'Expediente en trámite'}
              {status === 'pausado' && 'Expediente pausado'}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDerivationDialog
        open={showDerivationDialog}
        onOpenChange={setShowDerivationDialog}
        oficina={assignedOffice}
        expedientNumber={expedientNumber}
        onConfirm={confirmDerivation}
      />
    </div>
  );
}