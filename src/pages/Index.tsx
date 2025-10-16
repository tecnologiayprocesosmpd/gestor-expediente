import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import SelectProfilePostLogin from '@/components/SelectProfilePostLogin';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { ExpedientList } from '@/components/ExpedientList';
import { ExpedientView } from '@/components/ExpedientView';
import { ExpedientEditor } from '@/components/ExpedientEditor';
import { AgendaView } from '@/components/AgendaView';
import { OficioManager } from '@/components/OficioManager';
import { ExpedientSummary, Expedient } from '@/types/expedient';
import { useToast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockExpedients: ExpedientSummary[] = [
  {
    id: '1',
    number: '1',
    title: 'Solicitud de Amparo - Caso García',
    createdAt: new Date('2025-09-15'),
    updatedAt: new Date('2025-09-20'),
    createdBy: 'Dr. María González',
    department: 'Mesa de Entrada',
      status: 'en_tramite',
    tipoTramite: 'Amparo',
    solicitante: 'García, Juan Carlos',
    confidencial: false,
    urgente: true,
    content: '<p>Solicitud de amparo por vulneración de derechos constitucionales en proceso administrativo sancionador iniciado por la Municipalidad...</p>',
    referencia: 'Amparo contra municipalidad por proceso sancionador irregular',
    tipoProceso: 'administrativo'
  },
  {
    id: '2', 
    number: '2',
    title: 'Defensa Penal - Proceso Rodríguez',
    createdAt: new Date('2025-10-10'),
    updatedAt: new Date('2025-10-10'),
    createdBy: 'Dr. Carlos López',
    department: 'Defensoría Penal',
    status: 'draft',
    tipoTramite: 'Defensa Penal',
    solicitante: 'Tribunal Penal Nº 3',
    confidencial: true,
    urgente: false,
    content: '<p>Designación de defensor oficial para el imputado Rodríguez en causa penal por presunto delito contra la integridad sexual...</p>',
    referencia: 'Defensa oficial en causa penal - delito sexual',
    tipoProceso: 'administrativo'
  },
  {
    id: '3',
    number: '3', 
    title: 'Consulta Legal - Derechos Laborales',
    createdAt: new Date('2025-10-05'),
    updatedAt: new Date('2025-10-12'),
    createdBy: 'Dra. Ana Martínez',
    department: 'Secretaría General',
    status: 'en_tramite',
    tipoTramite: 'Consulta Legal',
    solicitante: 'Sindicato de Trabajadores',
    confidencial: false,
    urgente: false,
    content: '<p>Consulta sobre aplicación de convenio colectivo de trabajo y derechos de trabajadores en situación de despido sin justa causa...</p>',
    referencia: 'Asesoramiento sobre convenio colectivo y despidos',
    tipoProceso: 'administrativo'
  },
  {
    id: '4',
    number: '4',
    title: 'Recurso de Inconstitucionalidad - Ley Provincial',
    createdAt: new Date('2025-08-15'),
    updatedAt: new Date('2025-08-28'),
    createdBy: 'Dr. Roberto Silva',
    department: 'Mesa de Entrada',
    status: 'archivado',
    tipoTramite: 'Recurso Inconstitucionalidad',
    solicitante: 'Defensor General',
    confidencial: false,
    urgente: false,
    content: '<p>Recurso de inconstitucionalidad contra artículos de la Ley Provincial de Procedimientos Administrativos que vulneran el derecho de defensa...</p>',
    referencia: 'Recurso contra ley provincial por vulnerar debido proceso',
    tipoProceso: 'administrativo'
  },
  {
    id: '5',
    number: '5',
    title: 'Asesoramiento Civil - Divorcio',
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01'),
    createdBy: 'Dra. Laura Pérez',
    department: 'Defensoría Civil',
    status: 'en_tramite',
    tipoTramite: 'Asesoramiento Civil',
    solicitante: 'Pérez, María Elena',
    confidencial: true,
    urgente: false,
    content: '<p>Asesoramiento legal para divorcio por presentación conjunta y régimen de tenencia compartida de menores de edad...</p>',
    referencia: 'Divorcio por mutuo acuerdo con hijos menores',
    tipoProceso: 'administrativo'
  },
  {
    id: '6',
    number: '6',
    title: 'Amparo Colectivo - Medio Ambiente',
    createdAt: new Date('2025-10-08'),
    updatedAt: new Date('2025-10-08'),
    createdBy: 'Dr. Fernando Costa',
    department: 'Mesa de Entrada',
    status: 'en_tramite',
    tipoTramite: 'Amparo Colectivo',
    solicitante: 'Asociación Ecologista',
    confidencial: false,
    urgente: true,
    content: '<p>Amparo colectivo por daño ambiental causado por empresa minera que contamina fuentes de agua potable en comunidades rurales...</p>',
    referencia: 'Amparo colectivo contra contaminación minera',
    tipoProceso: 'administrativo'
  }
];

function AppContent() {
  const { user } = useUser();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'dashboard' | 'expedientes' | 'view' | 'editor' | 'agenda' | 'diligencias'>('dashboard');
  const [expedients, setExpedients] = useState<ExpedientSummary[]>(() => {
    // Cargar expedientes desde localStorage al inicio
    try {
      const stored = localStorage.getItem('expedients');
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Actualizar fechas antiguas automáticamente
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        
        const updated = parsed.map((exp: any, index: number) => {
          const createdAt = new Date(exp.createdAt);
          
          // Si el expediente tiene fecha anterior a 2025, actualizarlo
          if (createdAt.getFullYear() < 2025) {
            const newDate = index % 3 === 0 ? threeMonthsAgo : 
                          index % 3 === 1 ? twoMonthsAgo : oneMonthAgo;
            
            console.log(`Actualizando expediente ${exp.number} de ${createdAt.toISOString()} a ${newDate.toISOString()}`);
            
            return {
              ...exp,
              createdAt: newDate,
              updatedAt: newDate,
              lastActivity: newDate,
              fechaUltimaActividad: newDate.toISOString(),
              status: exp.status === 'archivado' && exp.archivoMotivo?.includes('automático') ? 'en_tramite' : exp.status
            };
          }
          
          // Convertir strings de fechas a objetos Date
          return {
            ...exp,
            createdAt,
            updatedAt: new Date(exp.updatedAt),
            lastActivity: exp.lastActivity ? new Date(exp.lastActivity) : undefined
          };
        });
        
        // Guardar los datos actualizados de vuelta en localStorage
        localStorage.setItem('expedients', JSON.stringify(updated));
        
        return updated;
      }
    } catch (error) {
      console.error('Error loading expedients from localStorage:', error);
    }
    return mockExpedients;
  });
  const [currentExpedientId, setCurrentExpedientId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [autoCreateActuacion, setAutoCreateActuacion] = useState(false);
  
  // Logs de debugging
  useEffect(() => {
    console.log('=== ESTADO DE EXPEDIENTES ===');
    console.log('Total de expedientes:', expedients.length);
    console.log('Expedientes por estado:', {
      draft: expedients.filter(e => e.status === 'draft').length,
      en_tramite: expedients.filter(e => e.status === 'en_tramite').length,
      paralizado: expedients.filter(e => e.status === 'paralizado').length,
      archivado: expedients.filter(e => e.status === 'archivado').length
    });
    expedients.forEach(exp => {
      console.log(`Expediente ${exp.number}: status=${exp.status}, createdAt=${exp.createdAt}`);
    });
  }, [expedients]);
  
  // Sincronizar expedients con localStorage cuando cambian
  useEffect(() => {
    try {
      localStorage.setItem('expedients', JSON.stringify(expedients));
      console.log('[Index] Expedientes guardados en localStorage:', expedients.length);
    } catch (error) {
      console.error('Error saving expedients to localStorage:', error);
    }
  }, [expedients]);
  
  // State for managing actuaciones per expedient
  const [expedientActuaciones, setExpedientActuaciones] = useState<Record<string, any[]>>({});
  
  // State for expedient view actions
  const [expedientViewActions, setExpedientViewActions] = useState<{
    onRadicacionInterna?: () => void;
    onRegresarRadicacionInterna?: () => void;
    onExportPDF?: () => void;
    onNuevaActuacion?: () => void;
    onTramites?: () => void;
    onNavegar?: () => void;
    onChangeStatus?: () => void;
    onDiligencia?: () => void;
    onChangeActuacionStatus?: () => void;
    showRegresarRadicacionInterna?: boolean;
    isActuacionView?: boolean;
  }>({});
  
  // Reset expedient view actions when navigating away from expedient view
  useEffect(() => {
    if (currentView !== 'view') {
      setExpedientViewActions({});
    }
  }, [currentView]);
  
  // Get current expedient data
  const getCurrentExpedient = () => {
    if (!currentExpedientId) return null;
    return expedients.find(exp => exp.id === currentExpedientId);
  };

  // STEP 2: If user is authenticated (SecurityContext) but hasn't selected a profile (UserContext)
  // Show profile selector to complete the authentication flow
  if (!user) {
    return <SelectProfilePostLogin />;
  }

  const handleCreateExpedient = () => {
    setCurrentExpedientId(null);
    setCurrentView('editor');
    // Reset scroll
    window.scrollTo(0, 0);
  };

  const handleViewExpedient = (id: string, createActuacion: boolean = false) => {
    setCurrentExpedientId(id);
    setAutoCreateActuacion(createActuacion);
    setCurrentView('view');
    // Reset scroll
    window.scrollTo(0, 0);
  };

  const handleEditExpedient = (id: string) => {
    setCurrentExpedientId(id);
    setCurrentView('editor');
    // Reset scroll
    window.scrollTo(0, 0);
  };

  const handleSaveExpedient = (data: any) => {
    console.log('[handleSaveExpedient] Datos recibidos:', data);
    if (currentExpedientId) {
      // Update existing expedient
      setExpedients(prev => {
        const updated = prev.map(exp => 
          exp.id === currentExpedientId 
            ? { 
                ...exp, 
                title: data.title || exp.title,
                number: data.number || exp.number,
                status: data.status || exp.status,
                oficina: data.oficina || exp.oficina,
                referencia: data.referencia || exp.referencia,
                tipoProceso: data.tipoProceso || exp.tipoProceso,
                assignedOffice: data.assignedOffice,
                updatedAt: new Date() 
              }
            : exp
        );
        console.log('[handleSaveExpedient] Expedientes actualizados:', updated);
        return updated;
      });
      toast({
        title: "Expediente actualizado",
        description: "Los cambios han sido guardados correctamente",
      });
    } else {
      // Create new expedient
      const newExpedient: ExpedientSummary = {
        id: String(Date.now()),
        number: data.number, // Use the auto-generated number from editor
        title: data.title || 'Sin título',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.name,
        department: user.department || 'Sin departamento',
        status: data.status || 'draft',
        tipoTramite: data.tipoTramite || 'General',
        solicitante: data.solicitante || 'No especificado',
        confidencial: data.confidencial || false,
        urgente: data.urgente || false,
        content: data.content || '<p>Contenido del expediente...</p>',
        referencia: data.referencia || 'Sin referencia especificada',
        tipoProceso: data.tipoProceso || 'administrativo',
        oficina: data.oficina || data.assignedOffice || 'Sin asignar'
      };
      
      console.log('[handleSaveExpedient] Nuevo expediente creado:', newExpedient);
      setExpedients(prev => [newExpedient, ...prev]);
      setCurrentExpedientId(newExpedient.id);
      
      toast({
        title: "Expediente creado",
        description: `Nuevo expediente ${newExpedient.number} creado exitosamente`,
      });
    }
    // Reset scroll después de guardar
    window.scrollTo(0, 0);
  };

  const handleStatusChange = (id: string, newStatus: 'en_tramite' | 'paralizado' | 'archivado') => {
    setExpedients(prev => prev.map(exp => 
      exp.id === id 
        ? { 
            ...exp, 
            status: newStatus,
            updatedAt: new Date() 
          }
        : exp
    ));
    
    const statusLabels = {
      en_tramite: 'En Trámite',
      paralizado: 'Paralizado',
      archivado: 'Archivado'
    };
    
    toast({
      title: "Estado actualizado",
      description: `El expediente ahora está ${statusLabels[newStatus]}`,
      duration: 2000,
    });
    // Reset scroll después de cambiar estado
    window.scrollTo(0, 0);
  };

  const handleSaveActuacion = (data: any) => {
    return new Promise((resolve, reject) => {
      console.log('[Index.handleSaveActuacion] Iniciando guardado de actuación:', data);
      
      if (!currentExpedientId) {
        console.log('[Index.handleSaveActuacion] Error: No hay expediente actual');
        reject(new Error('No hay expediente actual'));
        return;
      }
      
      // Create actuacion - Allow minimal content for drafts
      if (data.status === 'borrador' || (data.title?.trim() && data.content?.length > 20)) {
        const newActuacion = {
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          expedientId: currentExpedientId,
          number: (expedientActuaciones[currentExpedientId]?.length || 0) + 1,
          title: data.title || 'Nueva Actuación',
          content: data.content || '<p>Contenido de la actuación...</p>',
          status: data.status || 'borrador',
          createdBy: user?.name || 'Usuario',
          createdAt: new Date(),
          updatedAt: new Date(),
          tipo: data.tipo || 'nota',
          confidencial: data.confidencial || false,
          urgente: data.urgente || false,
          version: 1
        };

        console.log('[Index.handleSaveActuacion] Nueva actuación creada:', newActuacion);

        setExpedientActuaciones(prev => {
          const updated = {
            ...prev,
            [currentExpedientId]: [...(prev[currentExpedientId] || []), newActuacion]
          };
          console.log('[Index.handleSaveActuacion] Estado actualizado:', updated);
          return updated;
        });
        
        toast({
          title: "Actuación agregada",
          description: "La nueva actuación ha sido guardada correctamente",
        });

        // Use setTimeout to ensure state update is processed
        setTimeout(() => {
          console.log('[Index.handleSaveActuacion] Resolviendo promesa');
          resolve(newActuacion);
        }, 100);
      } else {
        console.log('[Index.handleSaveActuacion] Error: Título requerido o contenido insuficiente para actuaciones no borrador');
        reject(new Error('Para guardar una actuación se requiere título. Para actuaciones que no sean borradores, se requiere contenido mínimo.'));
      }
    });
  };

  const handleBackFromEditor = () => {
    setCurrentExpedientId(null);
    setAutoCreateActuacion(false);
    setCurrentView('expedientes');
    // Reset scroll al volver
    window.scrollTo(0, 0);
  };

  // Dashboard button handlers
  const handleNavigateToExpedients = () => {
    setCurrentView('expedientes');
    // Reset scroll
    window.scrollTo(0, 0);
  };

  const handleNavigateToActuaciones = () => {
    // No action needed - removed casos-pendientes
  };

  const handleCreateActuacion = () => {
    // Navigate to create actuacion view
    setCurrentExpedientId(null);
    setCurrentView('editor');
  };

  const handleFilterExpedients = (status: string) => {
    setStatusFilter(status);
  };

  const handleNavigateToDiligencias = () => {
    setCurrentView('diligencias');
    // Reset scroll
    window.scrollTo(0, 0);
  };

  const handleTramites = () => {
    toast({
      title: "Trámites",
      description: "Función de trámites en desarrollo",
    });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            expedients={expedients}
            onCreateExpedient={handleCreateExpedient}
            onViewExpedient={handleViewExpedient}
            onEditExpedient={handleEditExpedient}
            onNavigateToExpedients={handleNavigateToExpedients}
            onCreateActuacion={handleCreateActuacion}
            onFilterExpedients={handleFilterExpedients}
            onNavigateToDiligencias={handleNavigateToDiligencias}
            onNavigateToAgenda={() => setCurrentView('agenda')}
          />
        );
      case 'expedientes':
        return (
          <ExpedientList
            expedients={expedients}
            onViewExpedient={handleViewExpedient}
            onCreateExpedient={handleCreateExpedient}
            onStatusChange={handleStatusChange}
            initialStatusFilter={statusFilter}
          />
        );
      case 'view':
        return (
          <ExpedientView
            expedientId={currentExpedientId || undefined}
            expedient={getCurrentExpedient()}
            actuaciones={expedientActuaciones[currentExpedientId || ''] || []}
            onBack={handleBackFromEditor}
            onSaveActuacion={handleSaveActuacion}
            onUpdateActuaciones={(updatedActuaciones) => {
              if (currentExpedientId) {
                setExpedientActuaciones(prev => ({
                  ...prev,
                  [currentExpedientId]: updatedActuaciones
                }));
              }
            }}
            autoCreateActuacion={autoCreateActuacion}
            onStatusChange={handleStatusChange}
            onRegisterActions={setExpedientViewActions}
          />
        );
      case 'editor':
        return (
          <ExpedientEditor
            expedientId={currentExpedientId || undefined}
            expedient={getCurrentExpedient()}
            onBack={handleBackFromEditor}
            onSave={handleSaveExpedient}
          />
        );
      case 'agenda':
        return (
          <AgendaView 
            onNavigateToExpedient={(expedientId) => {
              setCurrentExpedientId(expedientId);
              setCurrentView('view');
            }}
            expedients={expedients}
          />
        );
      case 'diligencias':
        return (
          <OficioManager
            expedients={expedients}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onNavigate={setCurrentView}
      onCreateExpedient={handleCreateExpedient}
      isExpedientView={currentView === 'view' && !expedientViewActions.isActuacionView}
      isActuacionView={expedientViewActions.isActuacionView || false}
      onRadicacionInterna={expedientViewActions.onRadicacionInterna}
      onRegresarRadicacionInterna={expedientViewActions.onRegresarRadicacionInterna}
      onExportPDF={expedientViewActions.onExportPDF}
      onTramites={expedientViewActions.onTramites}
      onNuevaActuacion={expedientViewActions.onNuevaActuacion}
      onNavegar={expedientViewActions.onNavegar}
      onChangeStatus={expedientViewActions.onChangeStatus}
      onDiligencia={expedientViewActions.onDiligencia}
      onChangeActuacionStatus={expedientViewActions.onChangeActuacionStatus}
      showRegresarRadicacionInterna={expedientViewActions.showRegresarRadicacionInterna}
    >
      {renderCurrentView()}
    </Layout>
  );
}

export default function Index() {
  return <AppContent />;
};