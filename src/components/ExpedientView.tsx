import { useState, useEffect } from 'react';
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  FileText,
  Plus,
  Eye,
  Edit,
  Download,
  Calendar,
  User,
  Clock
} from "lucide-react";
import { ActuacionList } from "./ActuacionList";
import { ExpedientEditor } from "./ExpedientEditor";
import type { Actuacion } from "@/types/actuacion";

interface ExpedientViewProps {
  expedientId?: string;
  expedient?: any;
  actuaciones?: any[];
  onBack?: () => void;
  onSaveActuacion?: (data: any) => void;
  onUpdateActuaciones?: (actuaciones: any[]) => void;
}

export function ExpedientView({ 
  expedientId, 
  expedient: propExpedient, 
  actuaciones: propActuaciones = [], 
  onBack, 
  onSaveActuacion,
  onUpdateActuaciones 
}: ExpedientViewProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [actuaciones, setActuaciones] = useState<Actuacion[]>(propActuaciones);
  const [selectedActuacion, setSelectedActuacion] = useState<Actuacion | null>(null);
  
  // Use passed expedient data or fallback to default
  const expedient = propExpedient || {
    id: expedientId || 'unknown',
    number: 'Sin número',
    title: 'Sin título',
    status: 'draft' as const,
    assignedOffice: 'Sin asignar',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Sync actuaciones when they change in props
  useEffect(() => {
    setActuaciones(propActuaciones);
  }, [propActuaciones]);
  
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
      },
      // Fallbacks para estados que pueden no estar definidos
      active: {
        bg: 'bg-[hsl(var(--status-en-tramite))]',
        border: 'border-[hsl(var(--status-en-tramite))]',
        text: 'text-[hsl(var(--status-en-tramite-foreground))]'
      },
      closed: {
        bg: 'bg-[hsl(var(--status-archivado))]',
        border: 'border-[hsl(var(--status-archivado))]',
        text: 'text-[hsl(var(--status-archivado-foreground))]'
      },
      archived: {
        bg: 'bg-[hsl(var(--status-archivado))]',
        border: 'border-[hsl(var(--status-archivado))]',
        text: 'text-[hsl(var(--status-archivado-foreground))]'
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
      desistido: 'Desistido',
      // Fallbacks para compatibilidad
      active: 'En Trámite',
      closed: 'Archivado',
      archived: 'Archivado'
    };
    
    return labels[status as keyof typeof labels] || 'Borrador';
  };

  const handleAddActuacion = () => {
    setShowEditor(true);
  };

  const handleViewActuacion = (actuacionId: string) => {
    const actuacion = actuaciones.find(act => act.id === actuacionId);
    if (actuacion) {
      setSelectedActuacion(actuacion);
    }
  };

  const handleEditActuacion = (actuacionId: string) => {
    console.log('Editar actuación:', actuacionId);
    setShowEditor(true);
  };

  const handleStatusChange = (actuacionId: string, newStatus: Actuacion['status']) => {
    const updatedActuaciones = actuaciones.map(act => 
      act.id === actuacionId 
        ? { ...act, status: newStatus, signedAt: newStatus === 'firmado' ? new Date() : undefined }
        : act
    );
    setActuaciones(updatedActuaciones);
    onUpdateActuaciones?.(updatedActuaciones);
  };

  const handleSaveActuacion = (actuacionData: any) => {
    onSaveActuacion?.(actuacionData);
    setShowEditor(false);
  };

  const handleExportPDF = () => {
    // Importar jsPDF dinámicamente
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [216, 330] // Formato oficio (8.5" x 13")
      });

      // Configuración de estilos
      const pageWidth = 216;
      const pageHeight = 330;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      // Función auxiliar para añadir texto con salto de línea
      const addMultiLineText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.35); // Retorna la nueva posición Y
      };

      // === CARÁTULA ===
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('MINISTERIO PUPILAR Y DE LA DEFENSA', pageWidth / 2, 30, { align: 'center' });
      doc.text('San Miguel de Tucumán', pageWidth / 2, 40, { align: 'center' });
      
      // Línea separadora
      doc.setLineWidth(0.5);
      doc.line(margin, 50, pageWidth - margin, 50);

      // Información del expediente
      let yPosition = 70;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('EXPEDIENTE', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Número: ${expedient.number}`, margin, yPosition);
      yPosition += 10;
      
      yPosition = addMultiLineText(`Título: ${expedient.title}`, margin, yPosition, contentWidth, 12);
      yPosition += 5;
      
      doc.text(`Estado: ${getStatusLabel(expedient.status)}`, margin, yPosition);
      yPosition += 10;
      
      doc.text(`Oficina Asignada: ${expedient.assignedOffice}`, margin, yPosition);
      yPosition += 10;
      
      doc.text(`Fecha de Creación: ${expedient.createdAt.toLocaleDateString('es-ES')}`, margin, yPosition);
      yPosition += 10;
      
      doc.text(`Última Modificación: ${expedient.updatedAt.toLocaleDateString('es-ES')}`, margin, yPosition);
      yPosition += 20;

      // Resumen de actuaciones
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN DE ACTUACIONES', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de Actuaciones: ${actuaciones.length}`, margin, yPosition);
      yPosition += 10;

      actuaciones.forEach((act, index) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }
        
        const status = act.status === 'firmado' ? 'Firmado' : 
                      act.status === 'para-firmar' ? 'Para Firmar' : 'Borrador';
        doc.text(`${index + 1}. ${act.title} - ${status}`, margin, yPosition);
        yPosition += 7;
      });

      // === ACTUACIONES (cada una en página nueva) ===
      actuaciones.forEach((actuacion, index) => {
        doc.addPage();
        
        // Encabezado de actuación
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`ACTUACIÓN #${actuacion.number}`, pageWidth / 2, 30, { align: 'center' });
        
        // Línea separadora
        doc.setLineWidth(0.5);
        doc.line(margin, 40, pageWidth - margin, 40);

        let actYPos = 55;
        
        // Información de la actuación
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        actYPos = addMultiLineText(`Título: ${actuacion.title}`, margin, actYPos, contentWidth, 12);
        actYPos += 5;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Creado por: ${actuacion.createdBy}`, margin, actYPos);
        actYPos += 7;
        
        doc.text(`Fecha de Creación: ${actuacion.createdAt.toLocaleDateString('es-ES')}`, margin, actYPos);
        actYPos += 7;
        
        const status = actuacion.status === 'firmado' ? 'Firmado' : 
                      actuacion.status === 'para-firmar' ? 'Para Firmar' : 'Borrador';
        doc.text(`Estado: ${status}`, margin, actYPos);
        actYPos += 7;

        if (actuacion.signedAt) {
          doc.text(`Fecha de Firma: ${actuacion.signedAt.toLocaleDateString('es-ES')}`, margin, actYPos);
          actYPos += 7;
        }
        
        if (actuacion.signedBy) {
          doc.text(`Firmado por: ${actuacion.signedBy}`, margin, actYPos);
          actYPos += 7;
        }

        actYPos += 10;

        // Línea separadora para contenido
        doc.setLineWidth(0.3);
        doc.line(margin, actYPos, pageWidth - margin, actYPos);
        actYPos += 10;

        // Contenido de la actuación (extraer texto del HTML)
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        // Crear elemento temporal para extraer texto del HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = actuacion.content;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        // Añadir contenido con manejo de páginas
        const lines = doc.splitTextToSize(textContent, contentWidth);
        
        lines.forEach((line: string) => {
          if (actYPos > pageHeight - 30) {
            doc.addPage();
            actYPos = margin;
          }
          doc.text(line, margin, actYPos);
          actYPos += 6;
        });
      });

      // Guardar el PDF
      const fileName = `Expediente_${expedient.number}_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
    }).catch((error) => {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    });
  };

  const statusColors = getStatusColors(expedient.status);
  const latestActuacion = actuaciones.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  if (showEditor) {
    return (
      <ExpedientEditor 
        expedientId={expedientId}
        onBack={() => setShowEditor(false)}
        onSave={handleSaveActuacion}
      />
    );
  }

  if (selectedActuacion) {
    return (
      <div className="min-h-screen p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => setSelectedActuacion(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {selectedActuacion.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                Actuación #{selectedActuacion.number} - {selectedActuacion.createdBy}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={selectedActuacion.status === 'firmado' ? 'default' : 'secondary'} className="px-4 py-2">
              {selectedActuacion.status === 'firmado' ? 'Firmado' : 
               selectedActuacion.status === 'para-firmar' ? 'Para Firmar' : 'Borrador'}
            </Badge>
          </div>
        </div>

        {/* Actuacion Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-6 h-6" />
              <span>Contenido de la Actuación</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Fecha de Creación</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedActuacion.createdAt.toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Creado por</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedActuacion.createdBy}
                    </p>
                  </div>
                </div>
                {selectedActuacion.signedAt && (
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Fecha de Firma</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedActuacion.signedAt.toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="prose prose-lg max-w-none p-6 border rounded-lg bg-white">
                <div dangerouslySetInnerHTML={{ __html: selectedActuacion.content }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header unificado con mejor espaciado */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="flex items-start justify-between p-6">
          <div className="flex items-start space-x-6">
            <Button 
              variant="outline" 
              onClick={onBack} 
              className="px-4 py-2 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold text-foreground">
                  {expedient.title}
                </h1>
                
                <div className={`${statusColors.bg} rounded-md px-4 py-2 flex items-center space-x-2 shadow-sm border border-white/20 mt-4`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${statusColors.text === 'text-[hsl(var(--status-draft-foreground))]' ? 'bg-white' : 'bg-white'} animate-pulse`}></div>
                  <span className={`text-sm font-semibold ${statusColors.text}`}>
                    {getStatusLabel(expedient.status)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>Expediente: {expedient.number}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Creado: {expedient.createdAt.toLocaleDateString('es-ES')}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{expedient.assignedOffice}</span>
                </span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="px-4 py-2 h-auto" 
            onClick={handleExportPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Información del expediente y actuaciones unificadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel izquierdo: Información del expediente */}
        <div className="lg:col-span-1 space-y-4">
          <Card className={`${statusColors.border} border-l-4`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Información del Expediente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm font-medium">Número</span>
                  <span className="text-sm text-muted-foreground">{expedient.number}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm font-medium">Estado</span>
                  <Badge className={`${statusColors.bg} ${statusColors.text} border-0`}>
                    {getStatusLabel(expedient.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm font-medium">Creado</span>
                  <span className="text-sm text-muted-foreground">
                    {expedient.createdAt.toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm font-medium">Modificado</span>
                  <span className="text-sm text-muted-foreground">
                    {expedient.updatedAt.toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Oficina</span>
                  <span className="text-sm text-muted-foreground">
                    {expedient.assignedOffice}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de actuaciones */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resumen de Actuaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <Badge variant="outline">{actuaciones.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Borradores</span>
                  <Badge variant="secondary">
                    {actuaciones.filter(a => a.status === 'borrador').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Para Firmar</span>
                  <Badge variant="default">
                    {actuaciones.filter(a => a.status === 'para-firmar').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Firmadas</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {actuaciones.filter(a => a.status === 'firmado').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel derecho: Última actuación y lista */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Última actuación destacada */}
          {latestActuacion && (
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Última Actuación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{latestActuacion.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        ACT-{latestActuacion.number.toString().padStart(3, '0')} • {latestActuacion.createdBy}
                      </p>
                    </div>
                    <Badge 
                      variant={latestActuacion.status === 'firmado' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {latestActuacion.status === 'firmado' ? 'Firmado' : 
                       latestActuacion.status === 'para-firmar' ? 'Para Firmar' : 'Borrador'}
                    </Badge>
                  </div>
                  
                  <div className="bg-muted/30 rounded-md p-3">
                    <div 
                      className="prose prose-sm max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: latestActuacion.content }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Creado: {latestActuacion.createdAt.toLocaleString('es-ES')}</span>
                    {latestActuacion.signedAt && (
                      <span>Firmado: {latestActuacion.signedAt.toLocaleString('es-ES')}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista completa de actuaciones */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Todas las Actuaciones</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ActuacionList
                expedientId={expedient.id}
                actuaciones={actuaciones}
                onViewActuacion={handleViewActuacion}
                onEditActuacion={handleEditActuacion}
                onCreateActuacion={handleAddActuacion}
                onChangeStatus={handleStatusChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}