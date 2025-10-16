import { useState, useEffect } from 'react';
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Plus, Eye, Edit, Download, Calendar, User, Clock, Building2, AlertTriangle, CheckCircle } from "lucide-react";
import { ActuacionList } from "./ActuacionList";
import { ActuacionEditor } from "./ActuacionEditor";
import { ExpedientEditor } from "./ExpedientEditor";
import { RadicacionInternaDialog } from "./RadicacionInternaDialog";
import { RegresarRadicacionInternaDialog } from "./RegresarRadicacionInternaDialog";
import { TramiteEditor } from "./TramiteEditor";
import { TramiteList } from "./TramiteList";
import { ActuacionNavigator } from "./ActuacionNavigator";
import { SelectEstadoDialog } from "./SelectEstadoDialog";
import { SelectActuacionEstadoDialog } from "./SelectActuacionEstadoDialog";
import { StatusChangeConfirmDialog } from "./StatusChangeConfirmDialog";
import { ExpedientOficioView } from "./ExpedientOficioView";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  onStatusChange?: (id: string, newStatus: 'en_tramite' | 'paralizado' | 'archivado') => void;
  onRegisterActions?: (actions: {
    onRadicacionInterna?: () => void;
    onRegresarRadicacionInterna?: () => void;
    onExportPDF?: () => void;
    onNuevaActuacion?: () => void;
    onTramites?: () => void;
    onNavegar?: () => void;
    onChangeStatus?: () => void;
    onChangeActuacionStatus?: () => void;
    onOficio?: () => void;
    showRegresarRadicacionInterna?: boolean;
    isActuacionView?: boolean;
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
  onStatusChange,
  onRegisterActions
}: ExpedientViewProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [showActuacionEditor, setShowActuacionEditor] = useState(autoCreateActuacion);
  const [editingActuacionId, setEditingActuacionId] = useState<string | null>(null);
  const [actuaciones, setActuaciones] = useState<Actuacion[]>(propActuaciones);
  const [selectedActuacion, setSelectedActuacion] = useState<Actuacion | null>(null);
  const [showRadicacionInternaDialog, setShowRadicacionInternaDialog] = useState(false);
  const [showRegresarRadicacionInternaDialog, setShowRegresarRadicacionInternaDialog] = useState(false);
  const [radicacionesInternasPendientes, setRadicacionesInternasPendientes] = useState<any[]>([]);
  const [showTramiteList, setShowTramiteList] = useState(false);
  const [showTramiteEditor, setShowTramiteEditor] = useState(false);
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showSelectEstado, setShowSelectEstado] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingNewStatus, setPendingNewStatus] = useState<'en_tramite' | 'paralizado' | 'archivado'>('en_tramite');
  const [showOficioView, setShowOficioView] = useState(false);
  const [showSelectActuacionEstado, setShowSelectActuacionEstado] = useState(false);
  const {
    user
  } = useUser();

  // Manejadores para el cambio de estado
  const handleStatusSelected = (newStatus: 'en_tramite' | 'paralizado' | 'archivado') => {
    setPendingNewStatus(newStatus);
    setShowSelectEstado(false);
    setShowStatusConfirm(true);
  };
  const handleConfirmStatusChange = (motivo: string) => {
    if (expedientId && propExpedient) {
      // Guardar el motivo en el expediente
      const storedExpedients = localStorage.getItem('expedients');
      const expedients = storedExpedients ? JSON.parse(storedExpedients) : [];
      const updatedExpedients = expedients.map((exp: any) => {
        if (exp.id === expedientId) {
          return {
            ...exp,
            motivoCambioEstado: motivo,
            fechaUltimaActividad: new Date().toISOString()
          };
        }
        return exp;
      });
      localStorage.setItem('expedients', JSON.stringify(updatedExpedients));
      
      onStatusChange?.(expedientId, pendingNewStatus);
    }
    setShowStatusConfirm(false);
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

  // Cargar radicaciones internas pendientes desde localStorage
  useEffect(() => {
    const loadRadicacionesInternasPendientes = () => {
      try {
        const savedRadicaciones = localStorage.getItem('radicacionesInternasPendientes');
        if (savedRadicaciones) {
          const radicaciones = JSON.parse(savedRadicaciones);
          // Filtrar radicaciones internas para este expediente que no han sido devueltas
          const radicacionesExpediente = radicaciones.filter((d: any) => d.expedientId === expedientId && !d.devuelta);
          setRadicacionesInternasPendientes(radicacionesExpediente);
        }
      } catch (error) {
        console.error('Error loading radicaciones internas:', error);
      }
    };
    if (expedientId) {
      loadRadicacionesInternasPendientes();
    }
  }, [expedientId]);

  // Verificar si hay radicación pendiente para la oficina actual
  const hayRadicacionInternaPendiente = () => {
    if (!user?.department && !user?.name) return false;

    // Usar department o name como identificador de oficina
    const oficinaActual = user.department || user.name;
    return radicacionesInternasPendientes.some((d: any) => d.oficinaDestino === oficinaActual);
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
  const handleTramiteUpdated = () => {
    // Reload tramites after updating one
    if (expedientId) {
      const loadedTramites = tramiteStorage.getByExpedientId(expedientId);
      setTramites(loadedTramites);
    }
  };
  const handleNuevaActuacion = () => {
    window.scrollTo(0, 0);
    setShowActuacionEditor(true);
    setShowNavigator(false);
    setShowTramiteList(false);
    setShowOficioView(false);
    setShowTramiteEditor(false);
    setShowEditor(false);
    setSelectedActuacion(null);
  };
  const handleNavegar = () => {
    window.scrollTo(0, 0);
    setShowNavigator(true);
    setShowTramiteList(false);
    setShowOficioView(false);
    setShowTramiteEditor(false);
    setShowActuacionEditor(false);
    setShowEditor(false);
    setSelectedActuacion(null);
  };
  const handleShowTramites = () => {
    window.scrollTo(0, 0);
    setShowTramiteList(true);
    setShowNavigator(false);
    setShowOficioView(false);
    setShowTramiteEditor(false);
    setShowActuacionEditor(false);
    setShowEditor(false);
    setSelectedActuacion(null);
  };
  const handleShowOficio = () => {
    window.scrollTo(0, 0);
    setShowOficioView(true);
    setShowNavigator(false);
    setShowTramiteList(false);
    setShowTramiteEditor(false);
    setShowActuacionEditor(false);
    setShowEditor(false);
    setSelectedActuacion(null);
  };

  const handleChangeActuacionStatus = () => {
    setShowSelectActuacionEstado(true);
  };

  // Register actions with parent component - ALWAYS execute before any conditional returns
  useEffect(() => {
    if (onRegisterActions) {
      const isActuacionView = showActuacionEditor || showNavigator || selectedActuacion !== null;
      const showActuacionStatusButton = selectedActuacion !== null && !showActuacionEditor;
      onRegisterActions({
        onRadicacionInterna: () => setShowRadicacionInternaDialog(true),
        onRegresarRadicacionInterna: () => setShowRegresarRadicacionInternaDialog(true),
        onExportPDF: handleExportPDF,
        onNuevaActuacion: handleNuevaActuacion,
        onTramites: handleShowTramites,
        onNavegar: handleNavegar,
        onChangeStatus: () => setShowSelectEstado(true),
        onChangeActuacionStatus: showActuacionStatusButton ? handleChangeActuacionStatus : undefined,
        onOficio: handleShowOficio,
        showRegresarRadicacionInterna: hayRadicacionInternaPendiente(),
        isActuacionView
      });
    }
  }, [onRegisterActions, radicacionesInternasPendientes, showActuacionEditor, showNavigator, selectedActuacion, showTramiteList, showOficioView, showTramiteEditor]);
  
  // Scroll to top when selectedActuacion changes
  useEffect(() => {
    if (selectedActuacion) {
      window.scrollTo(0, 0);
    }
  }, [selectedActuacion]);

  const getTipoLabel = (tipo: Actuacion['tipo']): string => {
    const labels = {
      'resolucion': 'Resolución',
      'providencia': 'Providencia',
      'nota': 'Nota',
      'dictamen': 'Dictamen',
      'decreto': 'Decreto',
      'auto': 'Auto'
    };
    return labels[tipo] || tipo;
  };

  const getSubtipoLabel = (subtipo: Actuacion['subtipo']): string => {
    const labels = {
      'simple': 'Simple',
      'compleja': 'Compleja',
      'urgente': 'Urgente',
      'ordinaria': 'Ordinaria',
      'extraordinaria': 'Extraordinaria',
      'especial': 'Especial'
    };
    return labels[subtipo] || subtipo;
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

  const getActuacionStatusBadge = (status: Actuacion['status']) => {
    if (status === 'borrador') {
      return <Badge className="border-orange-500 text-orange-600 bg-white px-4 py-2" variant="outline">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Borrador
      </Badge>;
    }
    if (status === 'para-firmar') {
      return <Badge className="border-blue-500 text-blue-600 bg-white px-4 py-2" variant="outline">
        <Clock className="w-3 h-3 mr-1" />
        Para Firma
      </Badge>;
    }
    if (status === 'firmado') {
      return <Badge className="border-green-500 text-green-600 bg-white px-4 py-2" variant="outline">
        <CheckCircle className="w-3 h-3 mr-1" />
        Firmado
      </Badge>;
    }
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
        // Scroll al inicio de la página
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };
  const handleEditActuacion = (actuacionId: string) => {
    window.scrollTo(0, 0);
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
          signedBy: newStatus === 'firmado' ? (user?.name || 'Usuario') : act.signedBy,
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
    console.log('[ExpedientView.handleSaveActuacion] Iniciando guardado:', {
      actuacionData,
      editingActuacionId,
      autoSave
    });
    if (editingActuacionId) {
      // Editing existing actuacion
      console.log('[ExpedientView.handleSaveActuacion] Editando actuación existente');
      const updatedActuaciones = actuaciones.map(act => act.id === editingActuacionId ? {
        ...act,
        ...actuacionData
      } : act);
      setActuaciones(updatedActuaciones);
      onUpdateActuaciones?.(updatedActuaciones);

      // Close editor for manual saves
      if (!autoSave) {
        window.scrollTo(0, 0);
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
            window.scrollTo(0, 0);
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
    import('jspdf').then(({
      jsPDF
    }) => {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [216, 330] // Formato oficio (8.5" x 13")
      });

      // Configuración de estilos
      const pageWidth = 216;
      const pageHeight = 330;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      // Función auxiliar para añadir texto con salto de línea
      const addMultiLineText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + lines.length * fontSize * 0.35; // Retorna la nueva posición Y
      };

      // === CARÁTULA ===
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('MINISTERIO PUPILAR Y DE LA DEFENSA', pageWidth / 2, 30, {
        align: 'center'
      });
      doc.text('San Miguel de Tucumán', pageWidth / 2, 40, {
        align: 'center'
      });

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
        const status = act.status === 'firmado' ? 'Firmado' : act.status === 'para-firmar' ? 'Para Firmar' : 'Borrador';
        doc.text(`${index + 1}. ${act.title} - ${status}`, margin, yPosition);
        yPosition += 7;
      });

      // === ACTUACIONES (cada una en página nueva) ===
      actuaciones.forEach((actuacion, index) => {
        doc.addPage();

        // Encabezado de actuación
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`ACTUACIÓN #${actuacion.number}`, pageWidth / 2, 30, {
          align: 'center'
        });

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
        const status = actuacion.status === 'firmado' ? 'Firmado' : actuacion.status === 'para-firmar' ? 'Para Firmar' : 'Borrador';
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
    }).catch(error => {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    });
  };
  const handleRadicacionInterna = async (data: {
    oficina: string;
    fechaRegreso: string;
    actuacionesSeleccionadas: string[];
  }) => {
    console.log('Procesando radicación:', data);

    // Crear nueva radicación
    const nuevaRadicacionInterna = {
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
      const savedRadicaciones = localStorage.getItem('radicacionesInternasPendientes');
      const radicaciones = savedRadicaciones ? JSON.parse(savedRadicaciones) : [];
      radicaciones.push(nuevaRadicacionInterna);
      localStorage.setItem('radicacionesInternasPendientes', JSON.stringify(radicaciones));

      // Actualizar fecha de última actividad del expediente
      const storedExpedients = localStorage.getItem('expedients');
      if (storedExpedients) {
        const expedients = JSON.parse(storedExpedients);
        const updatedExpedients = expedients.map((exp: any) => {
          if (exp.id === (expedientId || expedient.id)) {
            return {
              ...exp,
              fechaUltimaActividad: new Date().toISOString()
            };
          }
          return exp;
        });
        localStorage.setItem('expedients', JSON.stringify(updatedExpedients));
      }

      // Actualizar estado local
      const radicacionesExpediente = radicaciones.filter((d: any) => d.expedientId === expedientId && !d.devuelta);
      setRadicacionesInternasPendientes(radicacionesExpediente);
    } catch (error) {
      console.error('Error saving radicación:', error);
    }
    const oficinaLabel = data.oficina.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const fechaRegreso = data.fechaRegreso ? new Date(data.fechaRegreso).toLocaleString('es-ES') : 'No especificada';
    const cantidadActuaciones = data.actuacionesSeleccionadas.length;
    alert(`Radicación enviada exitosamente:
- Expediente: ${expedient.number}
- Oficina destino: ${oficinaLabel}
- Fecha de regreso: ${fechaRegreso}
- Actuaciones enviadas: ${cantidadActuaciones}`);
  };
  const handleRegresarRadicacionInterna = async (data: {
    fechaRegreso: string;
  }) => {
    console.log('Procesando regreso de radicación:', data);

    // Marcar radicación como devuelta
    try {
      const savedRadicaciones = localStorage.getItem('radicacionesInternasPendientes');
      if (savedRadicaciones) {
        const radicaciones = JSON.parse(savedRadicaciones);
        const oficinaActual = user?.department || user?.name;

        // Encontrar y actualizar la radicación correspondiente
        const radicacionIndex = radicaciones.findIndex((d: any) => d.expedientId === expedientId && d.oficinaDestino === oficinaActual && !d.devuelta);
        if (radicacionIndex !== -1) {
          radicaciones[radicacionIndex].devuelta = true;
          radicaciones[radicacionIndex].fechaDevolucion = data.fechaRegreso;
          localStorage.setItem('radicacionesInternasPendientes', JSON.stringify(radicaciones));

          // Actualizar fecha de última actividad del expediente
          const storedExpedients = localStorage.getItem('expedients');
          if (storedExpedients) {
            const expedients = JSON.parse(storedExpedients);
            const updatedExpedients = expedients.map((exp: any) => {
              if (exp.id === expedientId) {
                return {
                  ...exp,
                  fechaUltimaActividad: new Date().toISOString()
                };
              }
              return exp;
            });
            localStorage.setItem('expedients', JSON.stringify(updatedExpedients));
          }

          // Actualizar estado local
          const radicacionesExpediente = radicaciones.filter((d: any) => d.expedientId === expedientId && !d.devuelta);
          setRadicacionesInternasPendientes(radicacionesExpediente);
        }
      }
    } catch (error) {
      console.error('Error updating radicación:', error);
    }
    alert(`Radicación devuelta exitosamente:
- Expediente: ${expedient.number}
- Fecha de regreso: ${data.fechaRegreso}
- La radicación ha sido devuelta a la oficina remitente`);
  };
  const statusColors = getStatusColors(expedient.status);
  const latestActuacion = actuaciones.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  // Show ActuacionNavigator if requested
  if (showNavigator) {
    return <>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setShowNavigator(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h2 className="text-2xl font-bold">
              Navegador de Actuaciones - {expedient.number}
            </h2>
          </div>
          <ActuacionNavigator actuaciones={actuaciones} expedientNumber={expedient.number} expedientTitle={expedient.title} />
        </div>

        {/* Diálogos disponibles en vista de navegación */}
        <RadicacionInternaDialog open={showRadicacionInternaDialog} onOpenChange={setShowRadicacionInternaDialog} expedientNumber={expedient.number} actuaciones={actuaciones} onConfirm={handleRadicacionInterna} />

        <RegresarRadicacionInternaDialog open={showRegresarRadicacionInternaDialog} onOpenChange={setShowRegresarRadicacionInternaDialog} expedientNumber={expedient.number} oficinaRemitente="Mesa de Entrada" onConfirm={handleRegresarRadicacionInterna} />

        <SelectEstadoDialog open={showSelectEstado} onOpenChange={setShowSelectEstado} currentStatus={expedient.status as 'en_tramite' | 'paralizado' | 'archivado'} onSelect={handleStatusSelected} />
        
        <StatusChangeConfirmDialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm} onConfirm={handleConfirmStatusChange} />
      </>;
  }

  // Show OficioView if requested
  if (showOficioView) {
    return <ExpedientOficioView expedientId={expedientId || ''} expedientNumber={expedient.number} expedientTitle={expedient.title} onBack={() => setShowOficioView(false)} />;
  }

  // Show TramiteList if requested
  if (showTramiteList) {
    return <TramiteList tramites={tramites} onCreateTramite={handleCreateTramite} onBack={handleBackFromTramiteList} onTramiteUpdated={handleTramiteUpdated} />;
  }

  // Show TramiteEditor if requested
  if (showTramiteEditor) {
    return <TramiteEditor expedientId={expedientId || ''} onBack={handleBackFromTramiteEditor} />;
  }
  if (showActuacionEditor) {
    return <ActuacionEditor expedientId={expedientId || ''} actuacionId={editingActuacionId || undefined} actuacion={selectedActuacion || undefined} onBack={() => {
      window.scrollTo(0, 0);
      setShowActuacionEditor(false);
      setEditingActuacionId(null);
      setSelectedActuacion(null);
    }} onSave={handleSaveActuacion} onStatusChange={handleStatusChange} />;
  }
  if (showEditor) {
    return <ExpedientEditor expedientId={expedientId} onBack={() => setShowEditor(false)} onSave={handleSaveActuacion} />;
  }
  
  if (selectedActuacion) {
    return <div className="min-h-screen p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => {
              window.scrollTo(0, 0);
              setSelectedActuacion(null);
            }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {getTipoLabel(selectedActuacion.tipo)} - {getSubtipoLabel(selectedActuacion.subtipo)}
              </h1>
              <p className="text-lg text-muted-foreground">
                Actuación #{selectedActuacion.number} - Creado por {selectedActuacion.createdBy}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getActuacionStatusBadge(selectedActuacion.status)}
            
            {/* Status change button */}
            {selectedActuacion.status === 'borrador' && <Button variant="default" size="sm" onClick={() => handleStatusChange(selectedActuacion.id, 'para-firmar')} className="bg-orange-500 hover:bg-orange-600 text-white">
                <AlertTriangle className="w-4 h-4 mr-1" />
                PARA FIRMA
              </Button>}
            
            {selectedActuacion.status === 'para-firmar' && <Button variant="secondary" size="sm" onClick={() => handleStatusChange(selectedActuacion.id, 'firmado')}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Firmar
              </Button>}
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
                {selectedActuacion.signedAt && selectedActuacion.signedBy && <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Firmado por</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedActuacion.signedBy}
                      </p>
                    </div>
                  </div>}
                {selectedActuacion.signedAt && <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Fecha de Firma</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedActuacion.signedAt.toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>}
              </div>
              
              <div className="prose prose-lg max-w-none p-6 border rounded-lg bg-white">
                <div dangerouslySetInnerHTML={{
                __html: selectedActuacion.content
              }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diálogo de Cambio de Estado de Actuación */}
        <SelectActuacionEstadoDialog 
          open={showSelectActuacionEstado} 
          onOpenChange={setShowSelectActuacionEstado} 
          currentStatus={selectedActuacion.status} 
          onSelect={(newStatus) => {
            handleStatusChange(selectedActuacion.id, newStatus);
            setShowSelectActuacionEstado(false);
          }} 
        />
      </div>;
  }
  return <div className="space-y-6">
      {/* Header unificado con mejor espaciado */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className={`p-6 border-l-4 ${statusColors.border}`}>
          {/* Primera fila: Botón volver + Título + Estado */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Button variant="outline" onClick={onBack} className="h-auto py-2 px-4 shrink-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              
              <h1 className="text-2xl font-bold text-foreground truncate max-w-[500px]" title={expedient.title}>
                {expedient.title}
              </h1>
            </div>
            
            <div className={`${statusColors.bg} rounded-md px-4 py-2 flex items-center space-x-2 shadow-sm border border-white/20 shrink-0 w-[160px] justify-center`}>
              <div className={`w-2.5 h-2.5 rounded-full ${statusColors.text === 'text-[hsl(var(--status-draft-foreground))]' ? 'bg-white' : 'bg-white'} animate-pulse`}></div>
              <span className={`text-sm font-semibold ${statusColors.text} whitespace-nowrap`}>
                {getStatusLabel(expedient.status)}
              </span>
            </div>
          </div>
          
          {/* Segunda fila: Trámite */}
          {tramites.length > 0 && !tramites.every(t => t.finalizado) && (
            <div className="mb-4">
              <div className="bg-cyan-50 rounded-lg px-6 py-4 flex items-center space-x-3 shadow-md border-2 border-cyan-500">
                <FileText className="w-6 h-6 text-cyan-600 shrink-0" />
                <span className="text-base font-semibold text-cyan-700 truncate" title={`Trámite: ${tramites.find(t => !t.finalizado)?.referencia || 'En Trámite'}`}>
                  Trámite: {tramites.find(t => !t.finalizado)?.referencia || 'En Trámite'}
                </span>
              </div>
            </div>
          )}
          
          {/* Tercera fila: Información adicional */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {(expedient.derivadoPor || expedient.recibidoPor) && <span className="flex items-center space-x-1">
                <User className="w-4 h-4" />
              <span>
                {expedient.derivadoPor && `Derivado por: ${expedient.derivadoPor}`}
                {expedient.recibidoPor && ` | Recibido por: ${expedient.recibidoPor}`}
              </span>
            </span>}
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
        <CardContent className="space-x-1 ">
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
                <div className="flex flex-col space-y-2 py-2 border-b border-border/50">
                  <span className="text-sm font-medium">Estado</span>
                  <Badge className={getStatusColors(expedient.status).bg + ' ' + getStatusColors(expedient.status).text}>
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
          <ActuacionList expedientId={expedient.id} actuaciones={actuaciones} onViewActuacion={handleViewActuacion} onEditActuacion={handleEditActuacion} onCreateActuacion={handleAddActuacion} onChangeStatus={handleStatusChange} />

        </div>
      </div>

      {/* Diálogo de Radicación */}
      <RadicacionInternaDialog open={showRadicacionInternaDialog} onOpenChange={setShowRadicacionInternaDialog} expedientNumber={expedient.number} actuaciones={actuaciones} onConfirm={handleRadicacionInterna} />

      {/* Diálogo de Regresar Radicación */}
      <RegresarRadicacionInternaDialog open={showRegresarRadicacionInternaDialog} onOpenChange={setShowRegresarRadicacionInternaDialog} expedientNumber={expedient.number} oficinaRemitente="Mesa de Entrada" // Esto debería venir de los datos del expediente
    onConfirm={handleRegresarRadicacionInterna} />

      {/* Diálogos de Cambio de Estado */}
      <SelectEstadoDialog open={showSelectEstado} onOpenChange={setShowSelectEstado} currentStatus={expedient.status as 'en_tramite' | 'paralizado' | 'archivado'} onSelect={handleStatusSelected} />
      
      <StatusChangeConfirmDialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm} onConfirm={handleConfirmStatusChange} title="Confirmar cambio de estado" message={`¿Está seguro de que desea cambiar el expediente a ${getStatusLabel(pendingNewStatus)}?`} />
      
      {/* Diálogo de Cambio de Estado de Actuación */}
      {selectedActuacion && (
        <SelectActuacionEstadoDialog 
          open={showSelectActuacionEstado} 
          onOpenChange={setShowSelectActuacionEstado} 
          currentStatus={selectedActuacion.status} 
          onSelect={(newStatus) => handleStatusChange(selectedActuacion.id, newStatus)} 
        />
      )}
    </div>;
}