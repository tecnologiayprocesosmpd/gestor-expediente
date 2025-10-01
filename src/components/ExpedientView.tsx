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
  Clock,
  Building2,
  AlertTriangle,
  CheckCircle,
  Send
} from "lucide-react";
import { ActuacionList } from "./ActuacionList";
import { ActuacionEditor } from "./ActuacionEditor";
import { ExpedientEditor } from "./ExpedientEditor";
import { DiligenciaDialog } from "./DiligenciaDialog";
import { RegresarDiligenciaDialog } from "./RegresarDiligenciaDialog";
import { TramiteEditor } from "./TramiteEditor";
import { TramiteList } from "./TramiteList";
import type { Actuacion } from "@/types/actuacion";
import { actuacionStorage } from "@/utils/actuacionStorage";
import { tramiteStorage } from "@/utils/tramiteStorage";
import type { Tramite } from "@/types/tramite";

interface ExpedientViewProps {
  expedientId?: string;
  expedient?: any;
  actuaciones?: any[];
  onBack?: () => void;
  onSaveActuacion?: (data: any) => Promise<any>;
  onUpdateActuaciones?: (actuaciones: any[]) => void;
  autoCreateActuacion?: boolean;
  onRegisterActions?: (actions: {
    onDiligencia?: () => void;
    onRegresarDiligencia?: () => void;
    onExportPDF?: () => void;
    onNuevaActuacion?: () => void;
    onTramites?: () => void;
    showRegresarDiligencia?: boolean;
  }) => void;
}

export function ExpedientView({ 
  expedientId, 
  expedient: propExpedient, 
  actuaciones: propActuaciones = [], 
  onBack, 
  onSaveActuacion,
  onUpdateActuaciones,
  autoCreateActuacion = false,
  onRegisterActions
}: ExpedientViewProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [showActuacionEditor, setShowActuacionEditor] = useState(autoCreateActuacion);
  const [editingActuacionId, setEditingActuacionId] = useState<string | null>(null);
  const [actuaciones, setActuaciones] = useState<Actuacion[]>(propActuaciones);
  const [selectedActuacion, setSelectedActuacion] = useState<Actuacion | null>(null);
  const [showDiligenciaDialog, setShowDiligenciaDialog] = useState(false);
  const [showRegresarDiligenciaDialog, setShowRegresarDiligenciaDialog] = useState(false);
  const [diligenciasPendientes, setDiligenciasPendientes] = useState<any[]>([]);
  const [showTramiteList, setShowTramiteList] = useState(false);
  const [showTramiteEditor, setShowTramiteEditor] = useState(false);
  const [tramites, setTramites] = useState<Tramite[]>([]);
  
  const { user } = useUser();
  
  
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

  // Cargar trámites desde localStorage
  useEffect(() => {
    if (expedientId) {
      const loadedTramites = tramiteStorage.getByExpedientId(expedientId);
      setTramites(loadedTramites);
    }
  }, [expedientId]);

  // Cargar diligencias pendientes desde localStorage
  useEffect(() => {
    const loadDiligenciasPendientes = () => {
      try {
        const savedDiligencias = localStorage.getItem('diligenciasPendientes');
        if (savedDiligencias) {
          const diligencias = JSON.parse(savedDiligencias);
          // Filtrar diligencias para este expediente que no han sido devueltas
          const diligenciasExpediente = diligencias.filter(
            (d: any) => d.expedientId === expedientId && !d.devuelta
          );
          setDiligenciasPendientes(diligenciasExpediente);
        }
      } catch (error) {
        console.error('Error loading diligencias:', error);
      }
    };

    if (expedientId) {
      loadDiligenciasPendientes();
    }
  }, [expedientId]);

  // Verificar si hay diligencia pendiente para la oficina actual
  const hayDiligenciaPendiente = () => {
    if (!user?.department && !user?.name) return false;
    
    // Usar department o name como identificador de oficina
    const oficinaActual = user.department || user.name;
    
    return diligenciasPendientes.some(
      (d: any) => d.oficinaDestino === oficinaActual
    );
  };

  // Handlers for tramite navigation
  const handleCreateTramite = () => {
    setShowTramiteList(false);
    setShowTramiteEditor(true);
  };

  const handleBackFromTramiteEditor = () => {
    // Reload tramites after creating one
    if (expedientId) {
      const loadedTramites = tramiteStorage.getByExpedientId(expedientId);
      setTramites(loadedTramites);
    }
    setShowTramiteEditor(false);
    setShowTramiteList(true);
  };

  const handleBackFromTramiteList = () => {
    setShowTramiteList(false);
  };

  const handleNuevaActuacion = () => setShowActuacionEditor(true);

  // Register actions with parent component
  useEffect(() => {
    if (onRegisterActions) {
      onRegisterActions({
        onDiligencia: () => setShowDiligenciaDialog(true),
        onRegresarDiligencia: () => setShowRegresarDiligenciaDialog(true),
        onExportPDF: handleExportPDF,
        onNuevaActuacion: handleNuevaActuacion,
        onTramites: () => setShowTramiteList(true),
        showRegresarDiligencia: hayDiligenciaPendiente()
      });
    }
  }, [onRegisterActions, diligenciasPendientes]);

  
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
      paralizado: {
        bg: 'bg-amber-500',
        border: 'border-amber-500',
        text: 'text-white'
      },
      archivado: {
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
      paralizado: 'Paralizado',
      archivado: 'Archivado'
    };
    
    return labels[status as keyof typeof labels] || 'Borrador';
  };

  const handleAddActuacion = () => {
    setShowActuacionEditor(true);
  };

  const handleViewActuacion = (actuacionId: string) => {
    const actuacion = actuaciones.find(act => act.id === actuacionId);
    if (actuacion) {
      // Si la actuación es borrador, abrir directamente en modo edición
      if (actuacion.status === 'borrador') {
        handleEditActuacion(actuacionId);
      } else {
        // Para otras actuaciones, mostrar vista de solo lectura
        setSelectedActuacion(actuacion);
      }
    }
  };

  const handleEditActuacion = (actuacionId: string) => {
    setEditingActuacionId(actuacionId);
    const actuacion = actuaciones.find(act => act.id === actuacionId);
    if (actuacion) {
      setSelectedActuacion(actuacion);
    }
    setShowActuacionEditor(true);
  };

  const handleStatusChange = (actuacionId: string, newStatus: Actuacion['status']) => {
    const updatedActuaciones = actuaciones.map(act => {
      if (act.id === actuacionId) {
        const updatedActuacion = { 
          ...act, 
          status: newStatus, 
          signedAt: newStatus === 'firmado' ? new Date() : undefined,
          updatedAt: new Date()
        };
        
        // Guardar la actuación individual en localStorage
        actuacionStorage.saveActuacion(updatedActuacion);
        
        return updatedActuacion;
      }
      return act;
    });
    
    setActuaciones(updatedActuaciones);
    onUpdateActuaciones?.(updatedActuaciones);
  };

  const handleSaveActuacion = async (actuacionData: any, autoSave = false) => {
    console.log('[ExpedientView.handleSaveActuacion] Iniciando guardado:', { actuacionData, editingActuacionId, autoSave });
    
    if (editingActuacionId) {
      // Editing existing actuacion
      console.log('[ExpedientView.handleSaveActuacion] Editando actuación existente');
      const updatedActuaciones = actuaciones.map(act => 
        act.id === editingActuacionId ? { ...act, ...actuacionData } : act
      );
      setActuaciones(updatedActuaciones);
      onUpdateActuaciones?.(updatedActuaciones);
      
      // Close editor for manual saves
      if (!autoSave) {
        setShowEditor(false);
        setShowActuacionEditor(false);
        setEditingActuacionId(null);
        setSelectedActuacion(null);
      }
    } else {
      // Creating new actuacion - Wait for parent to complete
      console.log('[ExpedientView.handleSaveActuacion] Creando nueva actuación');
      try {
        if (onSaveActuacion) {
          const result = await onSaveActuacion(actuacionData);
          console.log('[ExpedientView.handleSaveActuacion] Actuación guardada exitosamente:', result);
          
          // Only close editor for manual saves after successful save
          if (!autoSave) {
            console.log('[ExpedientView.handleSaveActuacion] Cerrando editor');
            setShowEditor(false);
            setShowActuacionEditor(false);
            setEditingActuacionId(null);
            setSelectedActuacion(null);
          }
        }
      } catch (error) {
        console.error('[ExpedientView.handleSaveActuacion] Error al guardar:', error);
        // Don't close editor if save failed
      }
    }
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

  const handleDiligencia = async (data: {
    oficina: string;
    fechaRegreso: string;
    actuacionesSeleccionadas: string[];
  }) => {
    console.log('Procesando diligencia:', data);
    
    // Crear nueva diligencia
    const nuevaDiligencia = {
      id: crypto.randomUUID(),
      expedientId: expedientId || expedient.id,
      expedientNumber: expedient.number,
      oficinaOrigen: user?.department || user?.name || 'Mesa de Entrada',
      oficinaDestino: data.oficina,
      fechaEnvio: new Date().toISOString(),
      fechaRegreso: data.fechaRegreso,
      actuacionesSeleccionadas: data.actuacionesSeleccionadas,
      devuelta: false
    };

    // Guardar en localStorage
    try {
      const savedDiligencias = localStorage.getItem('diligenciasPendientes');
      const diligencias = savedDiligencias ? JSON.parse(savedDiligencias) : [];
      diligencias.push(nuevaDiligencia);
      localStorage.setItem('diligenciasPendientes', JSON.stringify(diligencias));
      
      // Actualizar estado local
      const diligenciasExpediente = diligencias.filter(
        (d: any) => d.expedientId === expedientId && !d.devuelta
      );
      setDiligenciasPendientes(diligenciasExpediente);
    } catch (error) {
      console.error('Error saving diligencia:', error);
    }
    
    const oficinaLabel = data.oficina.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const fechaRegreso = data.fechaRegreso ? new Date(data.fechaRegreso).toLocaleString('es-ES') : 'No especificada';
    const cantidadActuaciones = data.actuacionesSeleccionadas.length;
    
    alert(`Diligencia enviada exitosamente:
- Expediente: ${expedient.number}
- Oficina destino: ${oficinaLabel}
- Fecha de regreso: ${fechaRegreso}
- Actuaciones enviadas: ${cantidadActuaciones}`);
  };

  const handleRegresarDiligencia = async (data: {
    fechaRegreso: string;
  }) => {
    console.log('Procesando regreso de diligencia:', data);
    
    // Marcar diligencia como devuelta
    try {
      const savedDiligencias = localStorage.getItem('diligenciasPendientes');
      if (savedDiligencias) {
        const diligencias = JSON.parse(savedDiligencias);
        const oficinaActual = user?.department || user?.name;
        
        // Encontrar y actualizar la diligencia correspondiente
        const diligenciaIndex = diligencias.findIndex(
          (d: any) => d.expedientId === expedientId && 
                      d.oficinaDestino === oficinaActual && 
                      !d.devuelta
        );
        
        if (diligenciaIndex !== -1) {
          diligencias[diligenciaIndex].devuelta = true;
          diligencias[diligenciaIndex].fechaDevolucion = data.fechaRegreso;
          localStorage.setItem('diligenciasPendientes', JSON.stringify(diligencias));
          
          // Actualizar estado local
          const diligenciasExpediente = diligencias.filter(
            (d: any) => d.expedientId === expedientId && !d.devuelta
          );
          setDiligenciasPendientes(diligenciasExpediente);
        }
      }
    } catch (error) {
      console.error('Error updating diligencia:', error);
    }
    
    alert(`Diligencia devuelta exitosamente:
- Expediente: ${expedient.number}
- Fecha de regreso: ${data.fechaRegreso}
- La diligencia ha sido devuelta a la oficina remitente`);
  };

  const statusColors = getStatusColors(expedient.status);
  const latestActuacion = actuaciones.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  // Show TramiteList if requested
  if (showTramiteList) {
    return (
      <TramiteList 
        tramites={tramites}
        onCreateTramite={handleCreateTramite}
        onBack={handleBackFromTramiteList}
      />
    );
  }

  // Show TramiteEditor if requested
  if (showTramiteEditor) {
    return (
      <TramiteEditor 
        expedientId={expedientId || ''}
        onBack={handleBackFromTramiteEditor}
      />
    );
  }

  if (showActuacionEditor) {
    return (
      <ActuacionEditor 
        expedientId={expedientId || ''}
        actuacionId={editingActuacionId || undefined}
        actuacion={selectedActuacion || undefined}
        onBack={() => {
          setShowActuacionEditor(false);
          setEditingActuacionId(null);
          setSelectedActuacion(null);
        }}
        onSave={handleSaveActuacion}
        onStatusChange={handleStatusChange}
      />
    );
  }

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
               selectedActuacion.status === 'para-firmar' ? 'Para Firma' : 'Borrador'}
            </Badge>
            
            {/* Status change button */}
            {selectedActuacion.status === 'borrador' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleStatusChange(selectedActuacion.id, 'para-firmar')}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                PARA FIRMA
              </Button>
            )}
            
            {selectedActuacion.status === 'para-firmar' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStatusChange(selectedActuacion.id, 'firmado')}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Firmar
              </Button>
            )}
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
        <div className={`flex items-start justify-between p-6 border-l-4 ${statusColors.border}`}>
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
              <div className="flex items-start">
                <h1 className="text-2xl font-bold text-foreground">
                  {expedient.title}
                </h1>
                
                <div className={`${statusColors.bg} rounded-md px-4 py-2 flex items-center space-x-2 shadow-sm border border-white/20 ml-8`}>
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
                {expedient.oficina && (
                  <span className="flex items-center space-x-1">
                    <Building2 className="w-4 h-4" />
                    <span>Oficina: {expedient.oficina}</span>
                  </span>
                )}
                {(expedient.derivadoPor || expedient.recibidoPor) && (
                  <span className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                  <span>
                    {expedient.derivadoPor && `Derivado por: ${expedient.derivadoPor}`}
                    {expedient.recibidoPor && ` | Recibido por: ${expedient.recibidoPor}`}
                  </span>
                </span>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen del Expediente */}
      <Card className={`border-l-4 ${statusColors.border}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Resumen del Expediente</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Referencia</p>
              <p className="text-sm">{expedient.referencia || 'Sin referencia especificada'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo de Proceso</p>
              <p className="text-sm capitalize">{expedient.tipoProceso || 'administrativo'}</p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Descripción del Expediente</p>
            <div className="prose prose-sm max-w-none p-3 border rounded-lg bg-muted/30">
              <div dangerouslySetInnerHTML={{ 
                __html: expedient.content || '<p>Sin contenido especificado</p>' 
              }} />
            </div>
          </div>
        </CardContent>
      </Card>

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

        </div>

        {/* Panel derecho: Última actuación y lista */}
        <div className="lg:col-span-2 space-y-4">
          

          {/* Lista completa de actuaciones */}
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

      {/* Diálogo de Diligencia */}
      <DiligenciaDialog
        open={showDiligenciaDialog}
        onOpenChange={setShowDiligenciaDialog}
        expedientNumber={expedient.number}
        actuaciones={actuaciones}
        onConfirm={handleDiligencia}
      />

      {/* Diálogo de Regresar Diligencia */}
      <RegresarDiligenciaDialog
        open={showRegresarDiligenciaDialog}
        onOpenChange={setShowRegresarDiligenciaDialog}
        expedientNumber={expedient.number}
        oficinaRemitente="Mesa de Entrada" // Esto debería venir de los datos del expediente
        onConfirm={handleRegresarDiligencia}
      />
    </div>
  );
}