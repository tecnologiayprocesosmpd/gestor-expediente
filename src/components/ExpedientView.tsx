import { useState } from 'react';
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
  onBack?: () => void;
}

// Mock data para las actuaciones
const mockActuaciones: Actuacion[] = [
  {
    id: '1',
    expedientId: 'exp-001',
    number: 1,
    title: 'Inicio de Actuación',
    content: '<p>Se inicia la presente actuación con la documentación correspondiente...</p>',
    status: 'firmado',
    createdBy: 'Juan Pérez - Mesa de Entrada',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    signedBy: 'Dr. Carlos López',
    signedAt: new Date('2024-01-16')
  },
  {
    id: '2',
    expedientId: 'exp-001',
    number: 2,
    title: 'Revisión de Documentación',
    content: '<p>Se procede a la revisión de la documentación presentada por el interesado...</p>',
    status: 'para-firmar',
    createdBy: 'Ana García - Oficina',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

export function ExpedientView({ expedientId, onBack }: ExpedientViewProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [actuaciones, setActuaciones] = useState<Actuacion[]>(mockActuaciones);
  const [selectedActuacion, setSelectedActuacion] = useState<Actuacion | null>(null);
  
  // Mock data del expediente
  const expedient = {
    id: expedientId || 'exp-001',
    number: 'EXP-2024-001',
    title: 'Solicitud de Defensa Pública',
    status: 'active' as const,
    assignedOffice: 'Defensoría Civil Nº 1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  };

  const { user } = useUser();
  
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
    setActuaciones(prev => 
      prev.map(act => 
        act.id === actuacionId 
          ? { ...act, status: newStatus, signedAt: newStatus === 'firmado' ? new Date() : undefined }
          : act
      )
    );
  };

  const handleSaveActuacion = (actuacionData: any) => {
    const newActuacion = {
      id: String(Date.now()),
      expedientId: expedient.id,
      number: actuaciones.length + 1,
      title: actuacionData.title || 'Nueva Actuación',
      content: actuacionData.content || '<p>Contenido de la actuación...</p>',
      status: 'borrador' as const,
      createdBy: user?.name || 'Usuario',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setActuaciones(prev => [newActuacion, ...prev]);
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
    <div className="min-h-screen relative">
      {/* Contorno integrado del expediente con indicador de estado */}
      <div className={`absolute inset-0 border-2 ${statusColors.border} rounded-xl pointer-events-none z-0`}>
        {/* Esquinas decorativas */}
        <div className={`absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 ${statusColors.border} rounded-tl-xl`}></div>
        <div className={`absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 ${statusColors.border} rounded-tr-xl`}></div>
        <div className={`absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 ${statusColors.border} rounded-bl-xl`}></div>
        <div className={`absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 ${statusColors.border} rounded-br-xl`}></div>
      </div>

      {/* Status Indicator integrado en el contorno */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`${statusColors.bg} rounded-full px-4 py-2 shadow-lg backdrop-blur-sm border-2 border-white/20 relative`}>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full bg-white/90 shadow-sm animate-pulse`}></div>
            <span className="text-sm font-semibold text-white">
              {getStatusLabel(expedient.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content con padding para el contorno */}
      <div className="p-8 pt-16 pb-8 space-y-6 relative z-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack} className="shadow-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {expedient.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                Expediente: {expedient.number}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 pr-20">
            <Button variant="outline" className="shadow-sm" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Expedient Info */}
        <Card className={`${statusColors.border} border-l-4 shadow-lg relative`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <FileText className="w-6 h-6" />
              <span>Información del Expediente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Fecha de Creación</p>
                  <p className="text-muted-foreground">
                    {expedient.createdAt.toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Última Modificación</p>
                  <p className="text-muted-foreground">
                    {expedient.updatedAt.toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Oficina Asignada</p>
                  <p className="text-muted-foreground">
                    {expedient.assignedOffice}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latest Actuacion */}
        {latestActuacion && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Última Actuación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{latestActuacion.title}</h3>
                    <p className="text-muted-foreground">
                      ACT-{latestActuacion.number.toString().padStart(3, '0')} - {latestActuacion.createdBy}
                    </p>
                  </div>
                  <Badge variant={latestActuacion.status === 'firmado' ? 'default' : 'secondary'} className="px-4 py-2">
                    {latestActuacion.status === 'firmado' ? 'Firmado' : 
                     latestActuacion.status === 'para-firmar' ? 'Para Firmar' : 'Borrador'}
                  </Badge>
                </div>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: latestActuacion.content }}
                />
                <p className="text-sm text-muted-foreground">
                  Creado: {latestActuacion.createdAt.toLocaleString('es-ES')}
                  {latestActuacion.signedAt && (
                    <span> • Firmado: {latestActuacion.signedAt.toLocaleString('es-ES')}</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actuaciones List */}
        <div className="shadow-lg rounded-lg overflow-hidden">
          <ActuacionList
            expedientId={expedient.id}
            actuaciones={actuaciones}
            onViewActuacion={handleViewActuacion}
            onEditActuacion={handleEditActuacion}
            onCreateActuacion={handleAddActuacion}
            onChangeStatus={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
}